import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { useStore } from '../store/useStore';

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

/**
 * ## [2.4.0] - 2026-04-21
 * ### 🏗️ Arquitectura (Atomic Init)
 * - **Callback Ref Pattern**: El Shadow DOM se inicializa mediante un callback ref
 *   que garantiza la creación del bridge en el momento exacto del montaje del DOM.
 * - **Always-Render Container**: El contenedor siempre se renderiza para asegurar
 *   que el ref esté disponible desde el primer frame.
 */

export const PluginWrapper: React.FC<any> = (passedProps) => {
    const frame = useCurrentFrame();
    const { fps, width, height } = useVideoConfig();
    const storeFiles = useStore().activePluginFiles;
    const activePluginFiles = passedProps.activePluginFiles || storeFiles;
    
    // Reactividad de Props
    const properties = passedProps.title ? passedProps : useStore().properties;
    
    const [shadow, setShadow] = useState<ShadowRoot | null>(null);
    const lifecycleRef = useRef<any>(null);
    const shadowRef = useRef<ShadowRoot | null>(null);
    
    // Lifecycle flags
    const hasAwoken = useRef<boolean>(false);
    const hasStarted = useRef<boolean>(false);

    // 1. CALLBACK REF: Se ejecuta cuando el div se monta en el DOM real
    const containerCallback = useCallback((node: HTMLDivElement | null) => {
        if (node && !shadowRef.current) {
            const shadowRoot = node.attachShadow({ mode: 'open' });
            shadowRef.current = shadowRoot;

            // Crear el bridge global vinculado a este ShadowRoot
            window.__DV_BRIDGE__ = {
                register: (pluginLifecycle) => {
                    lifecycleRef.current = pluginLifecycle;
                    hasAwoken.current = false;
                    hasStarted.current = false;
                },
                update: (data) => {
                    const lc = lifecycleRef.current;
                    const root = shadowRef.current;
                    if (!lc || !root) return;

                    const ctx = { ...data, root };

                    // AWAKE: Runs only once per plugin instance after registration
                    if (!hasAwoken.current && typeof lc.awake === 'function') {
                        lc.awake(ctx);
                        hasAwoken.current = true;
                    }

                    // START: Runs on frame 0, or whenever scrubbed back to 0
                    if (data.frame === 0 || !hasStarted.current) {
                        if (typeof lc.start === 'function') {
                            lc.start(ctx);
                        }
                        hasStarted.current = true;
                    }

                    // UPDATE: Runs every frame to apply visual properties
                    if (typeof lc.update === 'function') {
                        lc.update(ctx);
                    }
                }
            };

            setShadow(shadowRoot);
        }
    }, []);

    // 2. INYECCIÓN DE CÓDIGO (Cuando shadow está listo Y los archivos están cargados)
    useEffect(() => {
        if (!shadow || !activePluginFiles) {
            // Diagnóstico: ¿POR QUÉ no se inyecta?
            if ((window as any).ipcRenderer) {
                (window as any).ipcRenderer.logSync({
                    _debug: 'INJECT_SKIP',
                    hasShadow: !!shadow,
                    hasFiles: !!activePluginFiles,
                    props: {}
                });
            }
            return;
        }
        
        // LIMPIEZA TOTAL: Forzamos el "Hard Swap"
        shadow.innerHTML = '';
        lifecycleRef.current = null;
        hasAwoken.current = false;
        hasStarted.current = false;

        // CSS
        if (activePluginFiles.css) {
            const style = document.createElement('style');
            style.textContent = activePluginFiles.css;
            shadow.appendChild(style);
        }

        // HTML
        const wrapper = document.createElement('div');
        wrapper.id = 'plugin-root';
        wrapper.style.width = '100%';
        wrapper.style.height = '100%';
        wrapper.innerHTML = activePluginFiles.html;
        shadow.appendChild(wrapper);

        // JS: Ejecución Segura via new Function
        if (activePluginFiles.js) {
            let registered = false;
            try {
                // Utilidades nativas del motor para facilitar el desarrollo de los plugins
                const dvUtils = {
                    lerp: (a: number, b: number, t: number) => a * (1 - t) + b * t,
                    clamp: (val: number, min: number, max: number) => Math.min(Math.max(val, min), max),
                    // Funciones de Easing
                    easeOutCubic: (t: number) => 1 - Math.pow(1 - t, 3),
                    easeInOutCubic: (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
                    easeOutBounce: (x: number) => {
                        const n1 = 7.5625;
                        const d1 = 2.75;
                        if (x < 1 / d1) {
                            return n1 * x * x;
                        } else if (x < 2 / d1) {
                            return n1 * (x -= 1.5 / d1) * x + 0.75;
                        } else if (x < 2.5 / d1) {
                            return n1 * (x -= 2.25 / d1) * x + 0.9375;
                        } else {
                            return n1 * (x -= 2.625 / d1) * x + 0.984375;
                        }
                    },
                    easeOutElastic: (x: number) => {
                        const c4 = (2 * Math.PI) / 3;
                        return x === 0 ? 0 : x === 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
                    },
                    // Hex to RGB parser for CSS Custom properties
                    hexToRgb: (hex: string) => {
                        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                        return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : null;
                    }
                };

                const dvEngine = {
                    utils: dvUtils,
                    register: (callback: any) => {
                        registered = true;
                        window.__DV_BRIDGE__?.register(callback);
                    }
                };

                const pluginRuntime = new Function('dvEngine', 'window', 'dvContext', activePluginFiles.js);
                pluginRuntime(dvEngine, window, (window as any).dvContext);

                // Reportar al terminal
                if ((window as any).ipcRenderer) {
                    (window as any).ipcRenderer.logSync({
                        _debug: 'JS_EXEC_OK',
                        registered,
                        callbackSet: !!lifecycleRef.current,
                        bridgeExists: !!window.__DV_BRIDGE__,
                        jsLength: activePluginFiles.js.length,
                        props: {}
                    });
                }
            } catch (err: any) {
                // Rutear error al terminal (NO al browser console)
                if ((window as any).ipcRenderer) {
                    (window as any).ipcRenderer.logSync({
                        _debug: 'JS_EXEC_ERROR',
                        error: err?.message || String(err),
                        stack: err?.stack?.slice(0, 300),
                        props: {}
                    });
                }
            }
        }
    }, [shadow, activePluginFiles]);

    // 3. SINCRONIZACIÓN DE DATOS (Soft-Sync fluido - cada frame)
    useEffect(() => {
        if (!window.__DV_BRIDGE__) return;

        const data = {
            frame,
            fps,
            props: properties,
            shadowId: 'plugin-host-root'
        };

        window.dvContext = data;
        window.__DV_BRIDGE__.update(data);

        // LOG PARA TERMINAL
        if ((window as any).ipcRenderer) {
            (window as any).ipcRenderer.logSync({
                ...data,
                hasCallback: !!lifecycleRef.current,
                hasAwoken: hasAwoken.current,
                hasStarted: hasStarted.current
            });
        }

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
