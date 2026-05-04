import * as fs from 'fs'
import * as path from 'path'
import { app } from 'electron'

export interface PluginManifest {
  id: string
  name: string
  description: string
  version: string
  schema: FormField[]
}

export type FormField = 
  | { type: 'string'; id: string; label: string; defaultValue: string }
  | { type: 'color'; id: string; label: string; defaultValue: string }
  | { type: 'number'; id: string; label: string; defaultValue: number }
  | { type: 'image'; id: string; label: string; defaultValue: string }

export interface DVPlugin {
  manifest: PluginManifest
  folderPath: string
  hasCss: boolean
  hasJs: boolean
}

const PLUGINS_DIR_NAME = 'DV_Engine_Plugins'

export class PluginManager {
  private baseDir: string

  constructor() {
    // Almacenar en Documents para fácil acceso (open-code)
    const docsPath = app.getPath('documents')
    this.baseDir = path.join(docsPath, PLUGINS_DIR_NAME)
    this.ensureDirectory()
    this.ensureDefaultPlugin()
  }

  private ensureDirectory() {
    if (!fs.existsSync(this.baseDir)) {
      console.log(`[PluginManager] Base directory not found. Creating at: ${this.baseDir}`)
      fs.mkdirSync(this.baseDir, { recursive: true })
    } else {
      console.log(`[PluginManager] Using plugins directory: ${this.baseDir}`)
    }
  }

  private ensureDefaultPlugin() {
    // 1. Proyecto Vacío (Studio Master Core) - INTEGRADO INTERNAMENTE
    const emptyProjectDir = path.join(this.baseDir, 'proyecto-vacio')
    if (!fs.existsSync(emptyProjectDir)) {
      console.log(`[PluginManager] Initializing internal core plugin: proyecto-vacio`)
      fs.mkdirSync(emptyProjectDir, { recursive: true })
      
      const manifest = {
        id: "proyecto-vacio",
        name: "Proyecto Vacío",
        description: "Lienzo en blanco con el motor Studio Master listo para programar.",
        version: "1.0.0",
        author: "Jonatan Barón",
        schema: [
          { id: "masterRules", type: "prompt", label: "Contexto para IA", defaultValue: "MASTER_PROMPT" },
          { id: "htmlCode", type: "code", label: "Estructura HTML", defaultValue: "<div id=\"canvas-root\">\n  <!-- Tu HTML aquí -->\n</div>" },
          { id: "cssCode", type: "code", label: "Estilos CSS", defaultValue: "#canvas-root {\n  position: absolute;\n  width: 100%;\n  height: 100%;\n  display: grid;\n  place-items: center;\n}" },
          { id: "jsCode", type: "code", label: "Lógica JS", defaultValue: "window.renderDVGE = (frame, props, ctx) => {\n  // Tu lógica de animación aquí\n};" }
        ]
      }

      const html = "<div id=\"dv-master-host\"><style id=\"dv-master-styles\"></style><div id=\"dv-master-canvas\" style=\"width: 1920px; height: 1080px; position: relative; overflow: hidden;\"></div></div>"
      const css = "#dv-master-host { width: 100%; height: 100%; background: transparent; will-change: transform; contain: paint; } #dv-master-canvas { transform-origin: top left; }"
      const js = "dvEngine.register({ awake: (ctx) => { ctx.state.lastHtml = null; ctx.state.lastCss = null; ctx.state.lastJs = null; ctx.state.injectedFn = null; ctx.state.childCtx = null; ctx.refs.canvas = ctx.root.getElementById('dv-master-canvas'); ctx.refs.styleTag = ctx.root.getElementById('dv-master-styles'); }, update: (ctx) => { const { props, refs, state, frame } = ctx; if (!refs.canvas || !refs.styleTag) return; if (state.lastHtml !== props.htmlCode) { refs.canvas.innerHTML = props.htmlCode || ''; state.lastHtml = props.htmlCode; state.injectedFn = null; state.lastJs = null; } if (state.lastCss !== props.cssCode) { refs.styleTag.textContent = props.cssCode || ''; state.lastCss = props.cssCode; } const currentJs = (props.jsCode || '').trim(); if (currentJs && state.lastJs !== currentJs) { state.lastJs = currentJs; try { const sandbox = { renderDVGE: null }; const sandboxCode = `(function(sandbox, ctx) { \"use strict\"; const window = { renderDVGE: null }; ${currentJs} \\n sandbox.renderDVGE = window.renderDVGE; })(arguments[0], arguments[1])`; const fn = new Function(sandboxCode); fn(sandbox, ctx); if (sandbox.renderDVGE) { state.injectedFn = sandbox.renderDVGE; state.childCtx = { ...ctx, state: {}, refs: {}, parent: ctx }; } } catch (e) { console.error('[Studio Master] JS Error:', e.message); } } if (state.injectedFn) { try { state.childCtx.frame = frame; state.childCtx.props = props; state.childCtx.timeline = ctx.timeline; state.injectedFn(frame, props, state.childCtx); } catch (e) {} } } });"

      fs.writeFileSync(path.join(emptyProjectDir, 'manifest.json'), JSON.stringify(manifest, null, 2))
      fs.writeFileSync(path.join(emptyProjectDir, 'index.html'), html)
      fs.writeFileSync(path.join(emptyProjectDir, 'style.css'), css)
      fs.writeFileSync(path.join(emptyProjectDir, 'script.js'), js)
    }

    // 2. Lower Third (Basic)
    const defaultPluginDir = path.join(this.baseDir, 'lower-third-basic')
    if (!fs.existsSync(defaultPluginDir)) {
      fs.mkdirSync(defaultPluginDir, { recursive: true })
      
      const manifest: PluginManifest = {
        id: "lower-third-basic",
        name: "Lower Third (Basic)",
        description: "Banda de texto clásica en rojo y negro. Ideal para entrevistas.",
        version: "1.0.0",
        schema: [
          { type: 'string', id: 'title', label: 'Título', defaultValue: 'Ana García' },
          { type: 'string', id: 'subtitle', label: 'Cargo', defaultValue: 'Directora de Producto' },
          { type: 'color', id: 'barColor', label: 'Color Dominante', defaultValue: '#E44C30' }
        ]
      }

      const htmlContent = `
<div id="plugin-container">
  <div id="glow-bg"></div>
  <div id="accent-line"></div>
  <div id="content-body">
    <div id="title-text">Ana García</div>
    <div id="subtitle-text">Directora de Producto</div>
  </div>
</div>
`
      const cssContent = `
#plugin-container {
  position: absolute;
  bottom: 150px;
  left: 150px;
  min-width: 600px;
  display: flex;
  flex-direction: column;
  padding: 24px 45px;
  border-radius: 6px;
  background: linear-gradient(to right, rgba(0,0,0,0.7) 0%, transparent 100%);
  overflow: hidden;
  font-family: 'Inter', -apple-system, sans-serif;
  box-shadow: 0 15px 40px rgba(0,0,0,0.4);
}

#accent-line {
  height: 6px;
  border-radius: 3px;
  margin-bottom: 8px;
  background-color: var(--barColor, #E44C30);
  transform-origin: left;
}

#content-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

#title-text {
  font-size: 64px;
  font-weight: 800;
  color: white;
  letter-spacing: -1.5px;
  line-height: 1;
}

#subtitle-text {
  font-size: 32px;
  font-weight: 400;
  color: rgba(255,255,255,0.75);
}
`
      const jsContent = `
// Helper de interpolación suavizada
const lerp = (start, end, t) => start * (1 - t) + end * t;
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

dvEngine.register({
  awake: (ctx) => {
    // Inicialización rápida de referencias estáticas puras (DOM creation)
  },

  start: (ctx) => {
    // Trigger effects/sounds al inicio de la animación
  },

  update: (ctx) => {
    const { frame, root, props } = ctx;
    
    // Elementos
    const container = root.getElementById('plugin-container');
    const line = root.getElementById('accent-line');
    const title = root.getElementById('title-text');
    const subtitle = root.getElementById('subtitle-text');

    if (!container || !line || !title || !subtitle) return;

    // 1. Enlace de Datos Reactivos (Actualiza en tiempo real)
    title.innerText = props.title || 'Ana García';
    subtitle.innerText = props.subtitle || 'Directora';
    container.style.setProperty('--barColor', props.barColor || '#E44C30');

    // 2. Animación de Entrada (0-20 frames)
    const lineProgress = Math.min(1, frame / 20);
    line.style.transform = \`scaleX(\${easeOutCubic(lineProgress)})\`;

    const titleT = Math.max(0, Math.min(1, (frame - 5) / 10));
    title.style.opacity = titleT.toString();
    title.style.transform = \`translateY(\${lerp(20, 0, easeOutCubic(titleT))}px)\`;

    const subT = Math.max(0, Math.min(1, (frame - 10) / 10));
    subtitle.style.opacity = subT.toString();
    subtitle.style.transform = \`translateY(\${lerp(20, 0, easeOutCubic(subT))}px)\`;

    // 3. Animación de Salida (105-115)
    const exitT = Math.max(0, Math.min(1, (frame - 105) / 10));
    container.style.opacity = (1 - exitT).toString();
  }
});
`

      console.log(`[PluginManager] Initializing default plugin: lower-third-basic`)
      fs.writeFileSync(path.join(defaultPluginDir, 'manifest.json'), JSON.stringify(manifest, null, 2))
      fs.writeFileSync(path.join(defaultPluginDir, 'index.html'), htmlContent.trim())
      fs.writeFileSync(path.join(defaultPluginDir, 'style.css'), cssContent.trim())
      fs.writeFileSync(path.join(defaultPluginDir, 'script.js'), jsContent.trim())
    }
  }

  public getPlugins(): DVPlugin[] {
    const plugins: DVPlugin[] = []
    if (!fs.existsSync(this.baseDir)) return plugins

    const entries = fs.readdirSync(this.baseDir, { withFileTypes: true })
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const folderPath = path.join(this.baseDir, entry.name)
        const manifestPath = path.join(folderPath, 'manifest.json')
        
        if (fs.existsSync(manifestPath)) {
          try {
            const raw = fs.readFileSync(manifestPath, 'utf8')
            const manifest = JSON.parse(raw) as PluginManifest
            
            // [v4.0] Tarea 2.1: Sanitización Defensiva del Schema.
            // La IA puede generar schema como objeto en lugar de Array.
            // Aseguramos que siempre sea un Array para evitar crash en .map()/.forEach()
            if (!Array.isArray(manifest.schema)) {
              console.warn(`[PluginManager] ⚠ Plugin "${manifest.id}" tiene un schema inválido. Sanitizando a [].`);
              manifest.schema = [];
            }
            
            plugins.push({
              manifest,
              folderPath,
              hasCss: fs.existsSync(path.join(folderPath, 'style.css')),
              hasJs: fs.existsSync(path.join(folderPath, 'script.js'))
            })
          } catch (e) {
            console.error(`DV Engine: Error parseando manifesto de plugin en ${folderPath}`)
          }
        }
      }
    }
    
    console.log(`[PluginManager] Found ${plugins.length} valid plugins.`)
    return plugins
  }

  public getPluginsFolder(): string {
    return this.baseDir;
  }

  public getPluginFiles(pluginId: string) {
    const folderPath = path.join(this.baseDir, pluginId)
    if (!fs.existsSync(folderPath)) return null

    const files = {
      html: '',
      css: '',
      js: ''
    }

    const htmlPath = path.join(folderPath, 'index.html')
    const cssPath = path.join(folderPath, 'style.css')
    const jsPath = path.join(folderPath, 'script.js')

    console.log(`[PluginManager] Reading files for: ${pluginId}`)
    if (fs.existsSync(htmlPath)) {
      files.html = fs.readFileSync(htmlPath, 'utf8')
      console.log(' - index.html: OK')
    }
    if (fs.existsSync(cssPath)) {
      files.css = fs.readFileSync(cssPath, 'utf8')
      console.log(' - style.css: OK')
    }
    if (fs.existsSync(jsPath)) {
      files.js = fs.readFileSync(jsPath, 'utf8')
      console.log(' - script.js: OK')
    }

    return files
  }

  public deletePlugin(pluginId: string) {
    const folderPath = path.join(this.baseDir, pluginId)
    if (fs.existsSync(folderPath)) {
      console.log(`[PluginManager] Deleting plugin: ${pluginId}`)
      fs.rmSync(folderPath, { recursive: true, force: true })
      return true
    }
    return false
  }

  public installPlugin(pluginId: string, files: { manifest: any, html: string, css: string, js: string }) {
    const folderPath = path.join(this.baseDir, pluginId)
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true })
    }

    console.log(`[PluginManager] Installing/Updating plugin: ${pluginId}`)
    fs.writeFileSync(path.join(folderPath, 'manifest.json'), JSON.stringify(files.manifest, null, 2))
    fs.writeFileSync(path.join(folderPath, 'index.html'), files.html)
    fs.writeFileSync(path.join(folderPath, 'style.css'), files.css)
    fs.writeFileSync(path.join(folderPath, 'script.js'), files.js)
    return true
  }
}
