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

// --- Utilidades nativas del motor (module-level, sin estado) ---
const dvUtils = {
    lerp: (a: number, b: number, t: number) => a * (1 - t) + b * t,
    clamp: (val: number, min: number, max: number) => Math.min(Math.max(val, min), max),
    easeOutCubic: (t: number) => 1 - Math.pow(1 - t, 3),
    easeInOutCubic: (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
    easeOutBounce: (x: number) => {
        const n1 = 7.5625;
        const d1 = 2.75;
        if (x < 1 / d1) return n1 * x * x;
        if (x < 2 / d1) return n1 * (x -= 1.5 / d1) * x + 0.75;
        if (x < 2.5 / d1) return n1 * (x -= 2.25 / d1) * x + 0.9375;
        return n1 * (x -= 2.625 / d1) * x + 0.984375;
    },
    easeOutElastic: (x: number) => {
        const c4 = (2 * Math.PI) / 3;
        return x === 0 ? 0 : x === 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
    },
    hexToRgb: (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : null;
    }
};

/**
 * ## [3.2.0] - PluginWrapper con Hard Reset correcto
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
                    // REINICIAR CONTEXTO: Conservar root y utils pero limpiar lo demás
                    pluginContextRef.current = {
                        root: shadowRef.current,
                        utils: dvUtils,
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

                    // Enriquecer con settings para compatibilidad con IA
                    ctx.settings = {
                        fps: data.fps,
                        duration: durationInFrames / data.fps,
                        width: width,
                        height: height,
                        resolution: `${width}x${height}`
                    };

                    // AWAKE: Se ejecuta una vez después del registro
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
        
        // Crear una firma única de los archivos para evitar re-inyección duplicada
        const filesSignature = `${activePluginFiles.html?.length || 0}-${activePluginFiles.css?.length || 0}-${activePluginFiles.js?.length || 0}`;
        if (injectedFilesRef.current === filesSignature) return;
        
        // LIMPIEZA TOTAL: Forzamos el "Hard Swap"
        shadow.innerHTML = '';
        lifecycleRef.current = null;
        hasAwoken.current = false;
        hasStarted.current = false;

        // CSS (Global Modular Styles + Plugin Styles)
        const style = document.createElement('style');
        style.textContent = GLOBAL_PLUGIN_CSS + (activePluginFiles.css || '');
        shadow.appendChild(style);

        // HTML (Presets Fragments + Plugin HTML)
        const wrapper = document.createElement('div');
        wrapper.id = 'plugin-root';
        wrapper.style.width = '100%';
        wrapper.style.height = '100%';
        
        // Inyectar fragmentos de presets basados en lo que declare el manifiesto
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

        // JS: Ejecución Segura via new Function
        if (activePluginFiles.js) {
            try {
                const dvEngine = {
                    utils: dvUtils,  // Referencia al objeto module-level
                    register: (callback: any) => {
                        window.__DV_BRIDGE__?.register(callback);
                    }
                };

                const pluginRuntime = new Function('dvEngine', 'window', 'dvContext', activePluginFiles.js);
                pluginRuntime(dvEngine, window, (window as any).dvContext);
                
                // Marcar como inyectado
                injectedFilesRef.current = filesSignature;

                // Log de éxito (solo una vez)
                if ((window as any).ipcRenderer) {
                    (window as any).ipcRenderer.logSync({
                        _debug: 'PLUGIN_INJECTED',
                        registered: !!lifecycleRef.current,
                        bridgeExists: !!window.__DV_BRIDGE__,
                        jsLength: activePluginFiles.js.length
                    });
                }
            } catch (err: any) {
                // Rutear error al terminal (NO al browser console)
                if ((window as any).ipcRenderer) {
                    (window as any).ipcRenderer.logSync({
                        _debug: 'JS_EXEC_ERROR',
                        error: err?.message || String(err),
                        stack: err?.stack?.slice(0, 300)
                    });
                }
            }
        }
    }, [shadow, activePluginFiles]);

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
