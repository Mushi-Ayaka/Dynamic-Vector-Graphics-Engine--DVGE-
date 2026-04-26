import React, { useLayoutEffect, useRef } from 'react';
import { useCurrentFrame, useVideoConfig, delayRender, continueRender } from 'remotion';
import { GLOBAL_PLUGIN_CSS } from './GlobalStyles';
import { 
    dvUtils, 
    calculateTimeline, 
    executePluginSandbox, 
    DVLifecycle, 
    DVContext 
} from '../engine/core/Bridge';

/**
 * [CRÍTICO] RenderWrapper - Motor de Exportación ProRes 4444.
 * ⚠️ ADVERTENCIA PARA DESARROLLADORES:
 * Este componente es EXTREMADAMENTE sensible al ciclo de vida de React. 
 * NO añadir dependencias reactivas (como 'frame') al efecto de inyección de código (setup).
 * Hacerlo provocará que el DOM se reinicie en cada fotograma, resultando en videos vacíos.
 * Analizar exhaustivamente cualquier cambio en los hooks antes de implementar.
 */
export const RenderWrapper: React.FC<any> = (passedProps) => {
    const frame = useCurrentFrame();
    const { fps, width, height, durationInFrames } = useVideoConfig();

    const rootRef = useRef<HTMLDivElement | null>(null);
    const lifecycleRef = useRef<DVLifecycle | null>(null);
    const contextRef = useRef<DVContext | null>(null);
    const statusRef = useRef({
        hasAwoken: false,
        hasStarted: false,
        lastSignature: ''
    });

    // [v5.5.0] DETECTIVE-FIX: Priorizar props de Remotion sobre fetch HTTP
    const [dynamicProps, setDynamicProps] = React.useState<any>(null);
    const [isReady, setIsReady] = React.useState(!!passedProps.activePluginFiles || !!passedProps.files);

    useLayoutEffect(() => {
        document.body.style.backgroundColor = 'transparent';
        if (rootRef.current) {
            rootRef.current.style.backgroundColor = 'transparent';
        }
    }, []);

    // [v5.5.0] DETECTIVE-FIX: Forzar a Remotion a esperar ANTES del primer render
    // Remotion ignora delayRender si se llama dentro de un useLayoutEffect. Debe ser sincrónico.
    const [fetchHandle] = React.useState(() => {
        // Solo bloqueamos si no tenemos los archivos ya en memoria (como pasa en exportación)
        if (!passedProps.files && !passedProps.activePluginFiles) {
            return delayRender('Fetching Props from Internal Server');
        }
        return null;
    });

    useLayoutEffect(() => {
        // Si ya tenemos los archivos por props, no hacemos fetch
        if (passedProps.files || passedProps.activePluginFiles) {
            setIsReady(true);
            return;
        }

        // Si no los tenemos, los pedimos al servidor interno
        fetch('http://127.0.0.1:5555/props.json')
            .then(res => res.json())
            .then(data => {
                setDynamicProps(data);
                setIsReady(true);
                if (fetchHandle !== null) continueRender(fetchHandle);
            })
            .catch(err => {
                console.error('❌ FATAL: Failed to fetch props from server', err);
                if (fetchHandle !== null) continueRender(fetchHandle);
            });
    }, [passedProps.activePluginFiles, passedProps.files, fetchHandle]);

    // [v5.4.0] SMART DATA HYDRATION - Refactorizada para estabilidad
    const isPreview = !!passedProps.activePluginFiles;
    
    // In export, files can come from passedProps.files (Remotion) or dynamicProps.files (Fetch)
    const activePluginFiles = isPreview 
        ? passedProps.activePluginFiles 
        : (passedProps.files || dynamicProps?.files);

    // Identificar las propiedades reales
    const actualProps = isPreview 
        ? passedProps 
        : (passedProps.properties || dynamicProps?.properties || {});

    // [DEBUG LOGS]
    console.log(`[DEBUG-RenderWrapper] Render Frame: ${frame}, isPreview: ${isPreview}, isReady: ${isReady}`);
    if (frame === 0) {
        console.log(`[DEBUG-RenderWrapper] passedProps keys: ${Object.keys(passedProps).join(', ')}`);
        console.log(`[DEBUG-RenderWrapper] activePluginFiles exists: ${!!activePluginFiles}, html length: ${activePluginFiles?.html?.length}`);
    }

    useLayoutEffect(() => {
        if (!rootRef.current || !activePluginFiles || !isReady) {
            console.log(`[DEBUG-RenderWrapper] Setup aborted: root=${!!rootRef.current}, files=${!!activePluginFiles}, ready=${isReady}`);
            return;
        }
        
        const sig = `${activePluginFiles.html?.length}-${activePluginFiles.css?.length}-${activePluginFiles.js?.length}`;
        if (statusRef.current.lastSignature === sig) return;

        console.log(`[DEBUG-RenderWrapper] Inyectando DOM (Signature: ${sig})`);

        const node = rootRef.current;
        node.innerHTML = '';
        lifecycleRef.current = null;
        statusRef.current.hasAwoken = false;
        statusRef.current.hasStarted = false;
        statusRef.current.lastSignature = sig;

        const styleEl = document.createElement('style');
        styleEl.textContent = GLOBAL_PLUGIN_CSS.replace(/:host/g, '#dv-render-root') + (activePluginFiles.css || '');
        node.appendChild(styleEl);

        const wrapper = document.createElement('div');
        wrapper.id = 'plugin-root';
        wrapper.style.cssText = 'width:100%;height:100%;position:relative;z-index:1;';
        wrapper.innerHTML = activePluginFiles.html || '';
        node.appendChild(wrapper);

        console.log(`[DEBUG-RenderWrapper] DOM inyectado. Nodos hijos: ${node.childNodes.length}`);

        const rootNode = node;
        if (rootNode && !(rootNode as any).getElementById) {
            (rootNode as any).getElementById = (id: string) => rootNode.querySelector(`#${id}`);
        }

        contextRef.current = {
            root: rootNode,
            frame,
            props: actualProps,
            utils: dvUtils,
            timeline: calculateTimeline(frame, fps, durationInFrames),
            state: {},
            refs: {},
            env: { isExporting: !isPreview, resolution: { width, height } },
            global: {}
        };

        try {
            console.log(`[DEBUG-RenderWrapper] Ejecutando Plugin Sandbox...`);
            executePluginSandbox(activePluginFiles.js, contextRef.current, (lc) => {
                console.log(`[DEBUG-RenderWrapper] Sandbox ejecutado, lifecycle recibido.`);
                lifecycleRef.current = lc;
            });
        } catch (e: any) {
            console.error(`[DEBUG-RenderWrapper] ERROR en Sandbox:`, e.message);
        }
    }, [activePluginFiles, isReady, fps, durationInFrames, isPreview, actualProps, frame]);

    // [v5.4.0] Loop de Actualización de Fotogramas (Soft Sync)
    // Se ejecuta después del montaje para asegurar que lifecycleRef esté listo
    useLayoutEffect(() => {
        const lc = lifecycleRef.current;
        const ctx = contextRef.current;
        if (!lc || !ctx || !activePluginFiles) {
            if (frame === 0) console.log(`[DEBUG-RenderWrapper] Update Loop abortado: lc=${!!lc}, ctx=${!!ctx}`);
            return;
        }

        try {
            ctx.frame = frame;
            ctx.props = actualProps;
            ctx.timeline = calculateTimeline(frame, fps, durationInFrames);
            
            if (!statusRef.current.hasAwoken && lc.awake) {
                console.log(`[DEBUG-RenderWrapper] Llamando lc.awake()`);
                lc.awake(ctx);
                statusRef.current.hasAwoken = true;
            }
            if ((frame === 0 || !statusRef.current.hasStarted) && lc.start) {
                console.log(`[DEBUG-RenderWrapper] Llamando lc.start()`);
                lc.start(ctx);
                statusRef.current.hasStarted = true;
            }
            if (lc.update) {
                // Descomentar si se quiere log en cada frame, pero mejor no para no saturar
                // if (frame % 30 === 0) console.log(`[DEBUG-RenderWrapper] Llamando lc.update() en frame ${frame}`);
                lc.update(ctx);
            }
        } catch (err) {
            console.error(`[RenderWrapper] ❌ Runtime error at frame ${frame}:`, err);
        }
    }); 

    if (!activePluginFiles || !isReady) {
        return <div style={{ width: width || 1920, height: height || 1080, background: 'transparent' }} />;
    }

    return (
        <div
            id="dv-render-root"
            ref={rootRef}
            style={{
                width: width || 1920,
                height: height || 1080,
                position: 'relative',
                overflow: 'hidden',
                backgroundColor: 'transparent',
            }}
        >
            <style>{`
                html, body, #video-container, #__remotion-studio-container {
                    background-color: transparent !important;
                }
            `}</style>
        </div>
    );
};
