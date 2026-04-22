import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { useStore } from '../store/useStore';
import { GLOBAL_PLUGIN_CSS, PRESET_HTML_FRAGMENTS } from './GlobalStyles';

// Extendemos window para el bridge persistente
declare global {
    interface Window {
        __DV_BRIDGE__?: {
            update: (data: any) => void;
            register: (pluginLifecycle: any) => void;
        };
        dvContext?: any;
    }
}

// [v4.0] --- Utilidades Nativas del Motor (API Determinística) ---
const dvUtils = {
    // Matemáticas Base
    lerp: (a: number, b: number, t: number) => a * (1 - t) + b * t,
    clamp: (val: number, min: number, max: number) => Math.min(Math.max(val, min), max),
    // Curvas de Easing
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
    // [v4.0] Tarea 4.1: Nuevas Utilidades Nativas (Reemplazo de GSAP)
    /**
     * Función de resorte físico. Úsala en introProgress para animaciones premium.
     * @param t Progreso [0..1]
     * @param stiffness Rigidez del resorte (ej. 200)
     * @param damping Amortiguación (ej. 20)
     */
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
    /**
     * Efecto de máquina de escribir determinístico basado en frame.
     * @returns La subcadena del texto exacta para este frame.
     */
    typewriter: (text: string, frame: number, framesPerChar = 2): string => {
        const charsVisible = Math.floor(frame / framesPerChar);
        return text.substring(0, charsVisible);
    },
    /**
     * Calcula el desplazamiento X para un ticker/crawl en loop infinito sin saltos.
     * @returns El valor X en píxeles para usar en translateX()
     */
    tickerOffset: (frame: number, speed: number, textWidth: number): number => {
        if (textWidth <= 0) return 0;
        const totalTravel = frame * speed;
        return -(totalTravel % textWidth);
    },
    /**
     * [v4.1] Helper para loops perfectos.
     * @param frame Cuadro actual.
     * @param duration Cuadros totales del ciclo (ej. 180 para 3s a 60fps).
     */
    loop: (frame: number, duration: number) => (frame % duration) / duration,
    hexToRgb: (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : null;
    }
};

/**
 * ## [4.0.0] - PluginWrapper GA (Sandbox sellado, API Determinística)
 */

export const PluginWrapper: React.FC<any> = (passedProps) => {
    const frame = useCurrentFrame();
    const { fps, width, height, durationInFrames } = useVideoConfig(); // Añadido durationInFrames
    const storeFiles = useStore().activePluginFiles;
    const activePluginFiles = passedProps.activePluginFiles || storeFiles;
    
    // Reactividad de Props — usa passedProps si vienen del reproductor, si no, del store.
    const storeProps = useStore().properties;
    
    // Filtramos para saber si passedProps contiene datos del usuario o solo de Remotion
    const hasPassedUserProps = passedProps && Object.keys(passedProps).some(k => 
        !['width', 'height', 'fps', 'durationInFrames', 'activePluginFiles'].includes(k)
    );

    const properties = hasPassedUserProps ? passedProps : storeProps;
    
    const [shadow, setShadow] = useState<ShadowRoot | null>(null);
    const lifecycleRef = useRef<any>(null);
    const shadowRef = useRef<ShadowRoot | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    
    // El Contexto persistente donde el plugin guarda su estado (_state, _el, etc)
    const pluginContextRef = useRef<any>({});
    
    // Lifecycle flags
    const hasAwoken = useRef<boolean>(false);
    const hasStarted = useRef<boolean>(false);
    // Track si ya inyectamos, para no repetir
    const injectedFilesRef = useRef<string | null>(null);

    // 1. CALLBACK REF: Se ejecuta cuando el div se monta en el DOM real.
    const containerCallback = useCallback((node: HTMLDivElement | null) => {
        containerRef.current = node;
        
        if (node) {
            let shadowRoot: ShadowRoot;
            if (node.shadowRoot) {
                shadowRoot = node.shadowRoot;
                shadowRoot.innerHTML = ''; 
            } else {
                shadowRoot = node.attachShadow({ mode: 'open' });
            }
            
            shadowRef.current = shadowRoot;

            // Crear el bridge global vinculado a este ShadowRoot
            window.__DV_BRIDGE__ = {
                register: (pluginLifecycle) => {
                    lifecycleRef.current = pluginLifecycle;
                    // [v4.0] Tarea 4.3: ctx.state y ctx.refs oficiales (no más ctx._state hacks)
                    pluginContextRef.current = {
                        root: shadowRef.current,
                        utils: dvUtils,
                        state: {},   // Memoria persistente oficial para el plugin
                        refs: {},    // Cache DOM oficial (ej. ctx.refs.title = el)
                        env: {
                            isExporting: false,
                            resolution: { width: 1920, height: 1080 },
                            safeArea: { top: 60, left: 60, right: 60, bottom: 60 }
                        },
                        global: {}
                    };
                    hasAwoken.current = false;
                    hasStarted.current = false;
                },
                update: (data) => {
                    const lc = lifecycleRef.current;
                    const ctx = pluginContextRef.current;
                    if (!lc || !ctx) return;

                    // Sincronizar solo los datos dinámicos del frame actual
                    ctx.frame = data.frame;
                    ctx.props = data.props;
                    
                    // [v3.4.0] Sincronización de Entorno Global
                    ctx.env = {
                        isExporting: useStore.getState().isExporting,
                        resolution: { width, height },
                        safeArea: { 
                            top: useStore.getState().globalConfig.safeArea,
                            left: useStore.getState().globalConfig.safeArea,
                            right: useStore.getState().globalConfig.safeArea,
                            bottom: useStore.getState().globalConfig.safeArea,
                        }
                    };
                    ctx.global = useStore.getState().globalConfig;

                    // [v4.0] Tarea 4.2: ctx.timeline — API Determinística de Tiempo Normalizado
                    const totalFrames = durationInFrames;
                    const currentFps = data.fps;
                    const introDuration = Math.round(currentFps * 0.8); // 0.8s de entrada por defecto
                    const outroDuration = Math.round(currentFps * 0.5); // 0.5s de salida por defecto
                    const outroStart = totalFrames - outroDuration;

                    ctx.timeline = {
                        progress: totalFrames > 0 ? data.frame / totalFrames : 0,
                        isIntro: data.frame < introDuration,
                        isOutro: data.frame >= outroStart,
                        introProgress: data.frame < introDuration
                            ? dvUtils.clamp(data.frame / introDuration, 0, 1)
                            : 1,
                        outroProgress: data.frame >= outroStart
                            ? dvUtils.clamp((data.frame - outroStart) / outroDuration, 0, 1)
                            : 0,
                    };

                    // AWAKE: Se ejecuta una vez después del registro
                    // [v4.0] Tarea 3.2/3.3: Graceful Degradation - try/catch en todo el lifecycle
                    try {
                        if (!hasAwoken.current && typeof lc.awake === 'function') {
                            lc.awake(ctx);
                            hasAwoken.current = true;
                        }

                        // START: Se ejecuta en frame 0 o al resetear
                        if (data.frame === 0 || !hasStarted.current) {
                            if (typeof lc.start === 'function') {
                                lc.start(ctx);
                            }
                            hasStarted.current = true;
                        }

                        // UPDATE: Loop principal reactivo
                        if (typeof lc.update === 'function') {
                            lc.update(ctx);
                        }
                    } catch (error: any) {
                        // Plugin crasheó: deshabilitar para no saturar logs a 60fps
                        console.error('[DV-Engine] Plugin runtime error:', error);
                        lifecycleRef.current = null;
                        hasStarted.current = false;
                        if ((window as any).ipcRenderer) {
                            (window as any).ipcRenderer.logSync({
                                _debug: 'PLUGIN_UPDATE_CRASH',
                                error: error?.message || String(error),
                                frame: ctx.frame
                            });
                        }
                    }
                }
            };

            injectedFilesRef.current = null;
            setShadow(shadowRoot);
        } else {
            shadowRef.current = null;
            setShadow(null);
        }
    }, []);

    // 2. INYECCIÓN DE CÓDIGO (Cuando shadow está listo Y los archivos están cargados)
    useEffect(() => {
        if (!shadow || !activePluginFiles) return;
        
        const filesSignature = `${activePluginFiles.html?.length || 0}-${activePluginFiles.css?.length || 0}-${activePluginFiles.js?.length || 0}`;
        if (injectedFilesRef.current === filesSignature) return;
        
        shadow.innerHTML = '';
        lifecycleRef.current = null;
        hasAwoken.current = false;
        hasStarted.current = false;

        const manifest = useStore.getState().activePlugin?.manifest;
        if (manifest?.externalStyles) {
            manifest.externalStyles.forEach((url: string) => {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = url;
                shadow.appendChild(link);
            });
        }

        const style = document.createElement('style');
        style.textContent = GLOBAL_PLUGIN_CSS + (activePluginFiles.css || '');
        shadow.appendChild(style);

        const executePluginJS = () => {
            const wrapper = document.createElement('div');
            wrapper.id = 'plugin-root';
            wrapper.style.width = '100%';
            wrapper.style.height = '100%';
            wrapper.style.display = 'flex';
            
            const align = properties.contentAlign || 'top-left';
            switch (align) {
                case 'center': wrapper.style.justifyContent = 'center'; wrapper.style.alignItems = 'center'; break;
                case 'bottom-center': wrapper.style.justifyContent = 'center'; wrapper.style.alignItems = 'flex-end'; break;
                case 'bottom-right': wrapper.style.justifyContent = 'flex-end'; wrapper.style.alignItems = 'flex-end'; break;
                case 'bottom-left': wrapper.style.justifyContent = 'flex-start'; wrapper.style.alignItems = 'flex-end'; break;
                default: wrapper.style.justifyContent = 'flex-start'; wrapper.style.alignItems = 'flex-start';
            }
            
            let presetsHtml = '';
            if (passedProps.presets) {
                passedProps.presets.forEach((p: string) => {
                    if (PRESET_HTML_FRAGMENTS[p as keyof typeof PRESET_HTML_FRAGMENTS]) {
                        presetsHtml += PRESET_HTML_FRAGMENTS[p as keyof typeof PRESET_HTML_FRAGMENTS];
                    }
                });
            }

            wrapper.innerHTML = presetsHtml + activePluginFiles.html;
            shadow.appendChild(wrapper);

            if (properties.brandLogo && properties.logoPosition !== 'none') {
                const logoContainer = document.createElement('div');
                logoContainer.className = 'dv-logo-overlay';
                const size = properties.logoSize || 100;
                const margin = properties.safeAreaPadding || 60;
                logoContainer.style.width = `${size}px`;
                
                switch (properties.logoPosition) {
                    case 'top-right': logoContainer.style.top = `${margin}px`; logoContainer.style.right = `${margin}px`; break;
                    case 'top-left': logoContainer.style.top = `${margin}px`; logoContainer.style.left = `${margin}px`; break;
                    case 'bottom-right': logoContainer.style.bottom = `${margin}px`; logoContainer.style.right = `${margin}px`; break;
                    case 'bottom-left': logoContainer.style.bottom = `${margin}px`; logoContainer.style.left = `${margin}px`; break;
                }
                logoContainer.innerHTML = `<img src="${properties.brandLogo}" />`;
                shadow.appendChild(logoContainer);
            }

            if (activePluginFiles.js) {
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
                        ${activePluginFiles.js}
                        if (typeof dvEngine.registered === 'undefined') {
                            const foundUpdate = window.renderDVGE || window.update || window.draw || (typeof update !== 'undefined' ? update : undefined);
                            if (foundUpdate) {
                                dvEngine.register({ update: (ctx) => foundUpdate(ctx.frame, ctx.props, ctx) });
                            }
                        }
                    `;

                    let isRegistered = false;
                    const dvEngine = {
                        utils: dvUtils,
                        get registered() { return isRegistered; },
                        register: (callback: any) => {
                            isRegistered = true;
                            window.__DV_BRIDGE__?.register(callback);
                        }
                    };

                    const pluginRuntime = new Function('dvEngine', 'dvContext', sandboxedCode);
                    pluginRuntime(dvEngine, (window as any).dvContext);
                    injectedFilesRef.current = filesSignature;
                } catch (err: any) {
                    console.error('[DV-Engine] Plugin initialization error:', err);
                }
            }
        };

        const loadExternalAssets = async () => {
            if (manifest?.externalScripts) {
                const loadPromises = manifest.externalScripts.map((url: string) => {
                    return new Promise((resolve, reject) => {
                        const script = document.createElement('script');
                        script.src = url;
                        script.async = false;
                        script.onload = resolve;
                        script.onerror = reject;
                        shadow.appendChild(script);
                    });
                });
                await Promise.all(loadPromises);
            }
            executePluginJS();
        };

        loadExternalAssets();
    }, [shadow, activePluginFiles, properties, passedProps]);

    // 3. SINCRONIZACIÓN DE DATOS (Soft-Sync fluido - cada frame)
    //    Solo ejecuta si hay un lifecycle registrado para evitar spam de logs.
    useEffect(() => {
        if (!window.__DV_BRIDGE__ || !lifecycleRef.current) return;

        const data = {
            frame,
            fps,
            props: properties,
            utils: dvUtils,  // <-- ¡La pieza que faltaba!
            shadowId: 'plugin-host-root'
        };

        window.dvContext = data;
        window.__DV_BRIDGE__.update(data);

        if ((window as any).renderFrame) {
            (window as any).renderFrame();
        }
    }, [frame, fps, properties]);

    return (
        <div 
            id="plugin-host-root" 
            ref={containerCallback} 
            style={{ 
                width, 
                height, 
                position: 'relative',
                backgroundColor: 'transparent'
            }}
        >
            {!activePluginFiles && (
                <div style={{ 
                    color: '#E44C30', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    height: '100%',
                    fontSize: '14px'
                }}>
                    Cargando Plugin...
                </div>
            )}
        </div>
    );
};
