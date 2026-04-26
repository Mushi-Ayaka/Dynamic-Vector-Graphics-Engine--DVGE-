import React, { useRef, useState, useCallback } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { useStore } from '../store/useStore';
import { GLOBAL_PLUGIN_CSS, PRESET_HTML_FRAGMENTS } from './GlobalStyles';
import {
    dvUtils,
    calculateTimeline,
    executePluginSandbox,
    DVLifecycle,
    DVContext
} from '../engine/core/Bridge';

/**
 * PluginWrapper [v5.1.0] — Motor de preview interactivo.
 * 
 * Responsabilidades:
 * - Aislamiento total de estilos mediante Shadow DOM.
 * - Soporte para interactividad y eventos del navegador.
 * - Reactividad en tiempo real durante la edición.
 */

export const PluginWrapper: React.FC<any> = (passedProps) => {
    const frame = useCurrentFrame();
    const { fps, width, height, durationInFrames } = useVideoConfig();

    const store = useStore();
    const activePluginFiles = passedProps.activePluginFiles || store.activePluginFiles;
    const properties = passedProps.presets ? passedProps : store.properties;

    const [shadow, setShadow] = useState<ShadowRoot | null>(null);
    const lifecycleRef = useRef<DVLifecycle | null>(null);
    const contextRef = useRef<DVContext | null>(null);
    const statusRef = useRef({
        hasAwoken: false,
        hasStarted: false,
        lastSignature: ''
    });

    // 1. SETUP DEL SHADOW DOM
    const containerCallback = useCallback((node: HTMLDivElement | null) => {
        if (node) {
            let shadowRoot: ShadowRoot;
            if (node.shadowRoot) {
                shadowRoot = node.shadowRoot;
                shadowRoot.innerHTML = '';
            } else {
                shadowRoot = node.attachShadow({ mode: 'open' });
                // [v5.4.0] Polyfill permanente en el Shadow Root (Fix: getElementById)
                if (!(shadowRoot as any).getElementById) {
                    (shadowRoot as any).getElementById = (id: string) => shadowRoot.querySelector(`#${id}`);
                }
            }
            setShadow(shadowRoot);
        } else {
            setShadow(null);
        }
    }, []);

    // 2. INYECCIÓN DEL PLUGIN (Hard Sync - Solo cuando el código cambia)
    React.useLayoutEffect(() => {
        if (!shadow || !activePluginFiles) return;

        const sig = `${activePluginFiles.html?.length}-${activePluginFiles.css?.length}-${activePluginFiles.js?.length}`;
        if (statusRef.current.lastSignature === sig) return;

        shadow.innerHTML = '';
        lifecycleRef.current = null;
        statusRef.current.hasAwoken = false;
        statusRef.current.hasStarted = false;
        statusRef.current.lastSignature = sig;

        // Estilos
        const style = document.createElement('style');
        style.textContent = GLOBAL_PLUGIN_CSS + (activePluginFiles.css || '');
        shadow.appendChild(style);

        // HTML & Wrapper
        const wrapper = document.createElement('div');
        wrapper.id = 'plugin-root';
        wrapper.style.cssText = 'width:100%;height:100%;display:block;position:relative;';

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

        // Inicializar Contexto de Preview
        contextRef.current = {
            root: shadow as unknown as ShadowRoot,
            frame,
            props: properties,
            utils: dvUtils,
            timeline: calculateTimeline(frame, fps, durationInFrames),
            state: {},
            refs: {},
            env: {
                isExporting: false,
                resolution: { width, height },
                safeArea: store.globalConfig.safeArea
            },
            global: store.globalConfig
        };

        // [v5.4.0] Ya no polifilleamos aquí, se hace al crear el Shadow
        console.log(`[PluginWrapper] Executing sandbox for frame ${frame}`);
        executePluginSandbox(activePluginFiles.js, contextRef.current!, (lc) => {
            lifecycleRef.current = lc;
        });

    }, [shadow, activePluginFiles, fps, width, height, durationInFrames, store.globalConfig, passedProps.presets]);

    // 3. ACTUALIZACIÓN DE FRAME (Soft Sync - Loop de Preview de 60fps)
    React.useLayoutEffect(() => {
        const lc = lifecycleRef.current;
        const ctx = contextRef.current;
        if (!lc || !ctx) return;

        ctx.frame = frame;
        ctx.props = properties;
        ctx.timeline = calculateTimeline(frame, fps, durationInFrames);

        try {
            if (!statusRef.current.hasAwoken && lc.awake) {
                lc.awake(ctx);
                statusRef.current.hasAwoken = true;
            }
            if ((frame === 0 || !statusRef.current.hasStarted) && lc.start) {
                lc.start(ctx);
                statusRef.current.hasStarted = true;
            }
            if (lc.update) {
                lc.update(ctx);
            }
        } catch (err) {
            console.error('[PluginWrapper] Preview runtime error:', err);
        }
    }); // Sin dependencias para que corra en cada tick de frame del Player

    return (
        <div style={{ 
            width, 
            height, 
            position: 'relative',
            ...(passedProps._isPreview ? {
                background: '#111',
                backgroundImage: `
                    linear-gradient(45deg, #1a1a1a 25%, transparent 25%), 
                    linear-gradient(-45deg, #1a1a1a 25%, transparent 25%), 
                    linear-gradient(45deg, transparent 75%, #1a1a1a 75%), 
                    linear-gradient(-45deg, transparent 75%, #1a1a1a 75%)
                `,
                backgroundSize: '24px 24px',
                backgroundPosition: '0 0, 0 12px, 12px -12px, -12px 0px'
            } : {})
        }}>
            <div
                id="plugin-host-root"
                ref={containerCallback}
                style={{
                    width: '100%',
                    height: '100%',
                    position: 'relative',
                    background: 'transparent',
                    overflow: 'hidden'
                }}
            />
            {/* Overlay visual para enmarcar el área exacta del video en el preview */}
            {passedProps._isPreview && (
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    pointerEvents: 'none',
                    boxShadow: 'inset 0 0 0 4px #000, inset 0 0 0 5px rgba(255,255,255,0.2)',
                    zIndex: 9999
                }} />
            )}
        </div>
    );
};
