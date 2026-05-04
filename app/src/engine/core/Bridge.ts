/**
 * DVGE Bridge Core — Motor de ejecución de plugins.
 * [v5.0.0] Refactored for Clean Architecture & Determinismo Total.
 * 
 * Este archivo es la ÚNICA fuente de verdad para el comportamiento del motor,
 * garantizando que el Preview y el Render se comporten de forma idéntica.
 */
import { Easing } from 'remotion';

export interface DVTimeline {
    progress: number;
    isIntro: boolean;
    isOutro: boolean;
    introProgress: number;
    outroProgress: number;
}

export interface DVContext {
    root: HTMLElement | ShadowRoot;
    frame: number;
    props: Record<string, any>;
    utils: typeof dvUtils;
    timeline: DVTimeline;
    state: Record<string, any>;
    refs: Record<string, HTMLElement>;
    env: {
        isExporting: boolean;
        resolution: { width: number; height: number };
        aspectRatio: number;
        isPortrait: boolean;
        safeArea?: number;
    };
    global: Record<string, any>;
}

export interface DVLifecycle {
    awake?: (ctx: DVContext) => void;
    start?: (ctx: DVContext) => void;
    update?: (ctx: DVContext) => void;
}

// --- Utilidades Nativas (Matemáticas y Animación) ---
export const dvUtils = {
    bezier: (curveParams: string | number[], t: number): number => {
        try {
            let pts = Array.isArray(curveParams) ? curveParams : JSON.parse(curveParams);
            if (!Array.isArray(pts) || pts.length !== 4) pts = [0.25, 0.1, 0.25, 1];
            return Easing.bezier(pts[0], pts[1], pts[2], pts[3])(t);
        } catch {
            return Easing.ease(t);
        }
    },
    lerp: (a: number, b: number, t: number) => a * (1 - t) + b * t,
    mapRange: (val: number, inMin: number, inMax: number, outMin: number, outMax: number) => {
        if (inMax === inMin) return outMin;
        return outMin + (outMax - outMin) * (val - inMin) / (inMax - inMin);
    },
    clamp: (val: number, min: number, max: number) => Math.min(Math.max(val, min), max),
    easeOutCubic: (t: number) => 1 - Math.pow(1 - t, 3),
    easeInOutCubic: (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
    easeOutBounce: (x: number) => {
        const n1 = 7.5625, d1 = 2.75;
        if (x < 1 / d1) return n1 * x * x;
        if (x < 2 / d1) return n1 * (x -= 1.5 / d1) * x + 0.75;
        if (x < 2.5 / d1) return n1 * (x -= 2.25 / d1) * x + 0.9375;
        return n1 * (x -= 2.625 / d1) * x + 0.984375;
    },
    easeOutElastic: (x: number) => {
        const c4 = (2 * Math.PI) / 3;
        return x === 0 ? 0 : x === 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
    },
    spring: (t: number, stiffness = 200, damping = 20): number => {
        if (t <= 0) return 0;
        if (t >= 1) return 1;
        const w = Math.sqrt(stiffness);
        const zeta = damping / (2 * w);
        if (zeta < 1) {
            const wd = w * Math.sqrt(1 - zeta * zeta);
            return 1 - Math.exp(-zeta * w * t) * (Math.cos(wd * t) + (zeta * w / wd) * Math.sin(wd * t));
        }
        return 1 - Math.exp(-w * t) * (1 + w * t);
    },
    typewriter: (text: string, frame: number, framesPerChar = 2): string =>
        text.substring(0, Math.floor(frame / framesPerChar)),
    tickerOffset: (frame: number, speed: number, textWidth: number): number => {
        if (textWidth <= 0) return 0;
        return -((frame * speed) % textWidth);
    },
    loop: (frame: number, duration: number) => (frame % duration) / duration,
    hexToRgb: (hex: string) => {
        const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return r ? `${parseInt(r[1], 16)}, ${parseInt(r[2], 16)}, ${parseInt(r[3], 16)}` : null;
    },
    // [v6.7.0] Responsive Remapping Utils
    remapX: (x: number, designWidth = 1920, currentWidth: number) => (x / designWidth) * currentWidth,
    remapY: (y: number, designHeight = 1080, currentHeight: number) => (y / designHeight) * currentHeight,
    isPortrait: (width: number, height: number) => height > width
};

/**
 * Crea un sandbox seguro para ejecutar el código del plugin.
 */
export function executePluginSandbox(
    jsCode: string, 
    context: DVContext, 
    onRegister: (lifecycle: DVLifecycle) => void
) {
    if (!jsCode) return;

    try {
        const sandboxedCode = `
            "use strict";
            const process = undefined;
            const require = undefined;
            const globalThis = undefined;
            const window = {
                requestAnimationFrame: (cb) => { },
                ctx: dvContext,
                renderDVGE: undefined, update: undefined, draw: undefined
            };
            ${jsCode}
            if (typeof dvEngine.registered === 'undefined') {
                const foundUpdate = window.renderDVGE || window.update || window.draw || 
                    (typeof update !== 'undefined' ? update : undefined);
                if (foundUpdate) {
                    dvEngine.register({ update: (ctx) => foundUpdate(ctx.frame, ctx.props, ctx) });
                }
            }
        `;

        let isRegistered = false;
        // [v5.4.0] PROXY DETECTIVE: Asegurar que el plugin siempre acceda a los valores 
        // reales del contexto, incluso si captura la referencia al objeto.
        const proxyContext = new Proxy(context, {
            get: (target, prop: keyof DVContext) => {
                return target[prop];
            }
        });

        const dvEngine = {
            utils: dvUtils,
            get registered() { return isRegistered; },
            register: (callback: DVLifecycle) => {
                isRegistered = true;
                const wrappedCallback: DVLifecycle = {
                    awake: (ctx) => callback.awake && callback.awake(ctx),
                    start: (ctx) => callback.start && callback.start(ctx),
                    update: (ctx) => callback.update && callback.update(ctx)
                };
                onRegister(wrappedCallback);
            }
        };

        const pluginRuntime = new Function('dvEngine', 'dvContext', sandboxedCode);
        pluginRuntime(dvEngine, proxyContext);
    } catch (err) {
        console.error('[DV-Engine Bridge] Sandbox error:', err);
        throw err;
    }
}

/**
 * Calcula la línea de tiempo determinista.
 */
export function calculateTimeline(frame: number, fps: number, duration: number): DVTimeline {
    const introDuration = Math.round(fps * 0.8);
    const outroDuration = Math.round(fps * 0.5);
    const outroStart = duration - outroDuration;

    return {
        progress: duration > 0 ? frame / duration : 0,
        isIntro: frame < introDuration,
        isOutro: frame >= outroStart,
        introProgress: frame < introDuration ? dvUtils.clamp(frame / introDuration, 0, 1) : 1,
        outroProgress: frame >= outroStart ? dvUtils.clamp((frame - outroStart) / outroDuration, 0, 1) : 0,
    };
}
