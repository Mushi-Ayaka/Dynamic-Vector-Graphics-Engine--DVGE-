/**
 * [v3.4.0] Global Utility Styles for Plugins
 * Estos estilos se inyectan automáticamente en el Shadow DOM de todos los plugins.
 */
export const GLOBAL_PLUGIN_CSS = `
:host {
    --text-primary: #ffffff;
    --text-secondary: #aaaaaa;
    --accent: #E44C30;
    --bg-panel: rgba(0,0,0,0.85);
    --border: rgba(255,255,255,0.1);
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    /* [v5.4.0] Optimización de Renderizado: Forzar contexto de apilado para mix-blend-mode */
    will-change: transform;
    contain: paint;
}

.dv-safe-area {
    position: absolute;
    top: var(--dv-safe-top);
    left: var(--dv-safe-left);
    right: var(--dv-safe-right);
    bottom: var(--dv-safe-bottom);
    pointer-events: none;
}

.dv-glass {
    background: var(--bg-panel);
    backdrop-filter: blur(10px);
    border: 1px solid var(--border);
    border-radius: 12px;
}

.dv-label {
    color: var(--text-secondary);
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

/* Utilitarios para el Editor */
.dv-editor-grid {
    background-image: radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px);
    background-size: 20px 20px;
}

.dv-logo-overlay {
    position: absolute;
    z-index: 9999;
    pointer-events: none;
    transition: all 0.3s ease;
}

.dv-logo-overlay img {
    width: 100%;
    height: auto;
    object-fit: contain;
}
`;

/**
 * Fragmentos de HTML predefinidos por preset
 */
export const PRESET_HTML_FRAGMENTS: Record<string, string> = {
    'layout': `<div class="dv-safe-area"></div>`,
    'branding': `<div class="dv-branding-container"></div>`,
    'editor-full': `
        <div class="dv-editor-wrapper dv-editor-grid" style="width: 100%; height: 100%; position: relative;">
            <div id="dv-canvas-root"></div>
        </div>
    `
};
