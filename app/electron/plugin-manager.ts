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
}
