process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

// Parchear ESBUILD_BINARY_PATH ANTES de cualquier import de @remotion.
// Con asar:true, esbuild no puede encontrar su binario dentro del .asar.
// Lo apuntamos al .asar.unpacked donde sí existe como archivo real.
; (function patchEsbuild() {
  const path = require('node:path')
  const fs = require('node:fs')
  const resourcesPath = process.resourcesPath ?? ''
  const candidate = path.join(resourcesPath, 'app.asar.unpacked', 'node_modules', '@esbuild', 'win32-x64', 'esbuild.exe')
  if (fs.existsSync(candidate)) {
    process.env.ESBUILD_BINARY_PATH = candidate
  }
})();
import { app, BrowserWindow, ipcMain, shell, IpcMainEvent, Menu, dialog, protocol } from 'electron'

import 'dotenv/config'
import { join, basename } from 'node:path'
import * as fs from 'node:fs'
import * as XLSX from 'xlsx'
import Papa from 'papaparse'

// [CRÍTICO] Forzar directorio .remotion global para evitar EPERM en Program Files
process.env.REMOTION_DOT_REMOTION_DIR = join(app.getPath('userData'), '.remotion-cache');
if (!fs.existsSync(process.env.REMOTION_DOT_REMOTION_DIR)) {
  fs.mkdirSync(process.env.REMOTION_DOT_REMOTION_DIR, { recursive: true });
}

import { PluginManager } from './plugin-manager'
import { ProjectManager } from './project-manager'
import { dependencyManager } from './dependency-manager'
import { TelemetryHub } from './telemetry/TelemetryHub'
import { MachineIdentityProvider } from './telemetry/MachineIdentityProvider'
import { HardwareScanner } from './telemetry/HardwareScanner'

const pluginManager = new PluginManager()
const projectManager = new ProjectManager()

let mainWindow: BrowserWindow | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1080,
    height: 680,
    minWidth: 1024,
    minHeight: 700,
    frame: false,
    thickFrame: false,
    title: 'Ember Motion Studio',
    icon: join(__dirname, '../public/logo-square.png'),
    backgroundColor: '#050505',
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false, // Permitir carga de archivos locales durante desarrollo
    },
  })

  // [Seguridad/UX] Abrir enlaces externos (target="_blank") en el navegador del sistema
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  // Dependiendo de si estamos en DEV (Vite dev server) o PROD (archivo compilado)
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
    // mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(join(__dirname, '../dist/index.html'))
  }
}

import { setupRemotionIPC } from './remotion-api'

app.whenReady().then(async () => {
  // [v5.8.4] Restaurar protocolo media para compatibilidad con artefactos
  protocol.handle('media', async (request) => {
    try {
      const filePath = decodeURIComponent(request.url.replace(/^media:\/\/\/?/, ''));
      const data = await fs.promises.readFile(filePath);
      return new Response(data);
    } catch (err) {
      console.error('[Protocol] Error reading media file:', err);
      return new Response('File Not Found', { status: 404 });
    }
  });

  // Inicializar Telemetría y Salud (v5.7) - No bloqueante
  TelemetryHub.initialize();

  setupRemotionIPC()

  // [v5.6.0] Auto-Fetch Dependencies
  try {
    await dependencyManager.ensureChromium();
    console.log('[Main] Dependencies verified and ready.');
  } catch (e) {
    console.error('[Main] Critical dependency failure:', e);
  }

  setupMenu()
  createWindow()

  // Handler para abrir la carpeta de renders
  ipcMain.on('open-folder', (_event: IpcMainEvent, dirPath: string) => {
    console.log(`[IPC] open-folder: ${dirPath}`)
    shell.openPath(dirPath)
  })

  // Handler para el Drag and Drop Nativo al OS / DaVinci Resolve
  ipcMain.on('ondragstart', (event: IpcMainEvent, filePath: string) => {
    console.log(`[IPC] ondragstart: ${filePath}`)
    const iconPath = join(__dirname, '../public/logo-square.png')
    const iconExists = fs.existsSync(iconPath)

    event.sender.startDrag({
      file: filePath,
      icon: iconExists ? iconPath : join(__dirname, '../public/logo-square.png')
    })
  })

  // Handlers del Ecosistema de Plugins
  ipcMain.handle('get-plugins', () => {
    console.log('[IPC] get-plugins: scanning directory...')
    return pluginManager.getPlugins()
  })

  ipcMain.on('open-plugins-folder', () => {
    console.log('[IPC] open-plugins-folder')
    shell.openPath(pluginManager.getPluginsFolder())
  })

  ipcMain.handle('get-plugin-files', (_event, pluginId: string) => {
    console.log(`[IPC] get-plugin-files: ${pluginId}`)
    return pluginManager.getPluginFiles(pluginId)
  })

  ipcMain.handle('install-plugin', (_event, data: { pluginId: string, files: any }) => {
    return pluginManager.installPlugin(data.pluginId, data.files)
  })

  ipcMain.handle('delete-plugin', (_event, pluginId: string) => {
    return pluginManager.deletePlugin(pluginId)
  })

  // Handlers del Workspace / Proyectos
  ipcMain.handle('get-projects', () => {
    return projectManager.getProjects()
  })

  ipcMain.handle('create-project', (_event, data: { name: string, pluginId: string, defaultProps: any }) => {
    console.log(`[IPC] create-project: ${data.name} (Plugin: ${data.pluginId})`)
    return projectManager.createProject(data.name, data.pluginId, data.defaultProps)
  })

  ipcMain.handle('save-project-props', (_event, data: { projectId: string, props: any }) => {
    return projectManager.saveProjectProperties(data.projectId, data.props)
  })

  ipcMain.on('open-project-folder', (_event, projectId: string) => {
    const pPath = join(app.getPath('documents'), 'DVG_Projects', projectId)
    shell.openPath(pPath)
  })

  ipcMain.handle('update-project', (_event, data: { projectId: string, updates: any }) => {
    return projectManager.updateProject(data.projectId, data.updates)
  })

  ipcMain.handle('delete-project', (_event, projectId: string) => {
    return projectManager.deleteProject(projectId)
  })

  // [Telemetría] Puentes de Identidad y Hardware - Registro Defensivo
  ipcMain.removeHandler('get-machine-id')
  ipcMain.handle('get-machine-id', () => {
    const id = MachineIdentityProvider.getAnonymousId();
    console.log('[Telemetry-IPC] get-machine-id requested:', id);
    return id;
  })

  ipcMain.removeHandler('get-gpu-info')
  ipcMain.handle('get-gpu-info', async () => {
    try {
      console.log('[Telemetry-IPC] get-gpu-info requested...');
      const summary = await HardwareScanner.getHardwareSummary();
      if (summary?.gpu && summary.gpu.length > 0) {
        const gpuStr = summary.gpu.map(g => `${g.vendor} ${g.model} (${g.vram}MB)`).join(', ');
        console.log('[Telemetry-IPC] GPU detected via HardwareScanner:', gpuStr);
        return gpuStr;
      }

      // Fallback a API nativa de Electron si systeminformation falla
      const gpuInfo = (await app.getGPUInfo('basic')) as any;
      const adapter = gpuInfo.gpuDevice?.[0];
      const fallbackGpu = adapter ? `${adapter.vendorId || ''} ${adapter.renderer || 'GPU'}` : 'N/A';
      console.log('[Telemetry-IPC] GPU detected via Native Fallback:', fallbackGpu);
      return fallbackGpu;
    } catch (e) {
      console.error('[Telemetry] GPU Info fallback failed:', e);
      return 'N/A';
    }
  })

  ipcMain.on('log-sync', (_event, data) => {
    if (data._debug) {
      console.log(`[DEBUG] ${data._debug}:`, JSON.stringify(data))
    } else {
      console.log(`>> [SOFT-SYNC] Bridge: ${data.hasCallback ? 'CONN' : 'DISC'} | Props:`, JSON.stringify(data.props))
    }
  })

  ipcMain.handle('get-doc-content', (_event, docName: string) => {
    const safeName = docName.replace(/[^a-zA-Z0-9_\-\.]/g, '')
    // Con asar:true los .md están en app.asar.unpacked (asarUnpack)
    const unpacked = join(process.resourcesPath ?? '', 'app.asar.unpacked')
    const baseDir = fs.existsSync(unpacked) ? unpacked : app.getAppPath()
    const docPath = join(baseDir, safeName)
    if (fs.existsSync(docPath)) {
      return fs.readFileSync(docPath, 'utf8')
    }
    return `# Error: Documento no encontrado.\nNo se pudo encontrar el archivo: ${safeName}`
  })

  // [v5.7.5] Cargador dinámico de la Constitución Maestra de DVGE (Resiliente)
  const getMasterRules = () => {
    try {
      const unpacked = join(process.resourcesPath ?? '', 'app.asar.unpacked');
      const baseDir = fs.existsSync(unpacked) ? unpacked : app.getAppPath();

      // Intentar varias rutas comunes (unpacked prod, resources, y source dev)
      const possiblePaths = [
        join(baseDir, 'electron/resources/MASTER_PROMPT.md'),
        join(app.getAppPath(), 'electron/resources/MASTER_PROMPT.md'),
        join(__dirname, 'resources/MASTER_PROMPT.md'),
        join(process.cwd(), 'electron/resources/MASTER_PROMPT.md')
      ];

      for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
          console.log(`[Main] Master Rules cargadas con éxito desde: ${p}`);
          return fs.readFileSync(p, 'utf8');
        }
      }
      console.warn('[Main] No se encontró MASTER_PROMPT.md en ninguna de las rutas conocidas.');
    } catch (e) {
      console.error('[Main] Error crítico cargando MASTER_PROMPT.md:', e);
    }
    return "# DVGE MASTER RULES\nExpert system for broadcast. Use props.[id] and getArtifact(ID).";
  };

  // [v5.7.0] Generador de PDF Modular con Contexto de Proyecto para IAs
  ipcMain.handle('generate-rules-pdf', async (_event, data: { rulesText: string, projectContext?: any, options?: any }) => {
    return new Promise(async (resolve) => {
      // Opciones por defecto si no se reciben
      const options = data.options || {
        includeCanvas: true,
        includeArtifacts: true,
        includeCode: false,
        visualSkill: 'none'
      };

      // Si el texto es el placeholder por defecto o el ID coincide, inyectamos las reglas del archivo .md
      let finalRules = (data.rulesText === 'Reglas' || data.rulesText === 'AUTO_GENERATED' || data.rulesText.length < 20)
        ? getMasterRules()
        : data.rulesText;

      // [v6.9.0] Inyección de Visual Skills (MANDATORY DIRECTIVE)
      const { visualSkills } = await import('./resources/visualSkills');
      
      // Sincronización con el array de presets del frontend
      const activePresets: string[] = options.stylePresets || (options.visualSkill && options.visualSkill !== 'none' ? [options.visualSkill] : []);
      
      if (activePresets.length > 0) {
        finalRules += '\n\n--- ⚠️ CRITICAL DIRECTIVE: MANDATORY ANIMATION STYLE PRESETS ---\n';
        finalRules += 'You MUST strictly follow these technical and aesthetic guidelines for the requested animation.\n';
        activePresets.forEach(id => {
          const skillContent = (visualSkills as any)[id];
          if (skillContent) {
            finalRules += `\n[STYLE PRESET: ${id.toUpperCase()}]\n${skillContent}\n`;
          }
        });
        finalRules += '\n--- END OF MANDATORY PRESETS ---\n';
      }

      const pdfPath = join(app.getPath('temp'), `DVGE-Context-${Date.now()}.pdf`)

      const win = new BrowserWindow({ show: false })

      // Construir el bloque de contexto si existe
      let contextHtml = '';
      if (data.projectContext) {
        const { name, pluginId = 'Desconocido', updatedAt, artifacts = [], width = 1920, height = 1080, fps = 60, durationInFrames = 240, creativeBrief } = data.projectContext;
        const seconds = (durationInFrames / fps).toFixed(1);
        const versionDate = updatedAt ? new Date(updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
        
        // 1. Bloque de Canvas
        let canvasHtml = '';
        if (options.includeCanvas) {
          canvasHtml = `
            <h3 style="color: #fff; border-bottom: 1px solid #333; padding-bottom: 10px;">⚙️ Configuración del Canvas (Video)</h3>
            <div style="display: flex; gap: 20px; font-size: 13px; font-family: monospace; background: #252525; padding: 15px; border-radius: 6px; border: 1px solid #333;">
              <div><strong>Resolución:</strong> <span style="color: #4CAF50;">${width}x${height}</span></div>
              <div><strong>Framerate:</strong> <span style="color: #4CAF50;">${fps} FPS</span></div>
              <div><strong>Duración Total:</strong> <span style="color: #4CAF50;">${durationInFrames} frames (${seconds}s)</span></div>
            </div>
          `;
        }

        // 2. Bloque de Artefactos
        let artifactsHtml = '';
        if (options.includeArtifacts && artifacts) {
          const artifactItems = artifacts.map((a: any) => {
            const isDataset = a.type === 'dataset';
            const typeLabel = isDataset ? 'Dataset / Tabular' : (a.type === 'video' ? 'Video' : 'Imagen');
            
            if (isDataset) {
              return `
              <div style="background: #252525; border: 1px solid #333; border-radius: 6px; margin-bottom: 20px; overflow: hidden;">
                <div style="background: #333; padding: 10px 15px; font-weight: bold; color: #fff; display: flex; justify-content: space-between;">
                  <span>${a.label} <span style="font-size: 11px; font-weight: normal; color: #aaa;">(${typeLabel})</span></span>
                  <span style="color: #E44C30; font-family: monospace;">${a.id}</span>
                </div>
                <div style="padding: 15px;">
                  <div style="font-family: monospace; font-size: 12px; color: #4CAF50; margin-bottom: 5px;">[HTML]</div>
                  <pre style="background: #111; color: #eee; padding: 10px; border-radius: 4px; margin-top: 0; border: 1px solid #222; white-space: pre-wrap;"><code>&lt;div id="container_${a.id}"&gt;&lt;/div&gt;</code></pre>

                  ${options.includeDataPreview ? `
                  <div style="font-family: monospace; font-size: 12px; color: #E44C30; margin-bottom: 5px; margin-top: 15px;">[FULL DATASET]</div>
                  <div style="background: #111; color: #4CAF50; padding: 10px; border-radius: 4px; border: 1px solid #222; font-size: 10px; font-family: monospace; overflow: auto; max-height: 400px;">
                    ${(() => {
                      try {
                        const d = JSON.parse(a.value || '[]');
                        if (d.length > 0) {
                          const preview = d.length > 500 ? d.slice(0, 500) : d;
                          return JSON.stringify(preview, null, 2).replace(/</g, '&lt;') + (d.length > 500 ? '\n... (truncado por tamaño, total: ' + d.length + ' filas)' : '');
                        }
                        return 'El dataset está vacío.';
                      } catch(e) { return 'Error al parsear JSON del dataset.'; }
                    })()}
                  </div>
                  ` : `
                  <div style="font-family: monospace; font-size: 12px; color: #888; margin-top: 15px; font-style: italic;">[DATA PREVIEW OMITIDO POR PRIVACIDAD]</div>
                  `}
                  
                  <div style="font-family: monospace; font-size: 12px; color: #FFC107; margin-bottom: 5px; margin-top: 15px;">[JAVASCRIPT]</div>
                  <pre style="background: #111; color: #eee; padding: 10px; border-radius: 4px; margin-top: 0; border: 1px solid #222; white-space: pre-wrap;"><code>// [1] EXTRAER DATOS (JSON 2D Array)
const rawData_${a.id} = props['${a.id}'];
const data_${a.id} = JSON.parse(rawData_${a.id} || '[["Col1", "Col2"], ["Val1", "Val2"]]');
const headers_${a.id} = data_${a.id}[0];
const rows_${a.id} = data_${a.id}.slice(1);

// [2] CACHEAR NODOS DOM
const container_${a.id} = document.getElementById('container_${a.id}');
if (container_${a.id} && container_${a.id}.dataset.initialized !== 'true') {
  container_${a.id}.innerHTML = '';
  rows_${a.id}.forEach((row, idx) => {
    const el = document.createElement('div');
    el.id = "item_${a.id}_" + idx;
    el.textContent = headers_${a.id}[0] + ": " + row[0];
    container_${a.id}.appendChild(el);
  });
  container_${a.id}.dataset.initialized = 'true';
}</code></pre>
              </div></div>`;
            }

            return `
            <div style="background: #252525; border: 1px solid #333; border-radius: 6px; margin-bottom: 20px; overflow: hidden;">
              <div style="background: #333; padding: 10px 15px; font-weight: bold; color: #fff; display: flex; justify-content: space-between;">
                <span>${a.label} <span style="font-size: 11px; font-weight: normal; color: #aaa;">(${typeLabel})</span></span>
                <span style="color: #E44C30; font-family: monospace;">${a.id}</span>
              </div>
              <div style="padding: 15px;">
                <div style="font-family: monospace; font-size: 12px; color: #4CAF50; margin-bottom: 5px;">[HTML]</div>
                <pre style="background: #111; color: #eee; padding: 10px; border-radius: 4px; margin-top: 0; border: 1px solid #222; white-space: pre-wrap;"><code>&lt;div class="artifact-wrapper"&gt;
  &lt;${a.type === 'video' ? 'video muted loop autoplay' : 'img'} id="el_${a.id}" class="dv-artifact" src="" alt="${a.label}"&gt;&lt;/${a.type === 'video' ? 'video' : 'img'}&gt;
&lt;/div&gt;</code></pre>
                
                <div style="font-family: monospace; font-size: 12px; color: #2196F3; margin-bottom: 5px; margin-top: 15px;">[CSS]</div>
                <pre style="background: #111; color: #eee; padding: 10px; border-radius: 4px; margin-top: 0; border: 1px solid #222; white-space: pre-wrap;"><code>#el_${a.id} {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.3s ease;
}</code></pre>

                <div style="font-family: monospace; font-size: 12px; color: #FFC107; margin-bottom: 5px; margin-top: 15px;">[JAVASCRIPT]</div>
                <pre style="background: #111; color: #eee; padding: 10px; border-radius: 4px; margin-top: 0; border: 1px solid #222; white-space: pre-wrap;"><code>const media_${a.id} = document.getElementById('el_${a.id}');
const src_${a.id} = props['${a.id}'];

if (media_${a.id} && src_${a.id} && media_${a.id}.getAttribute('src') !== src_${a.id}) {
  media_${a.id}.src = src_${a.id};
  media_${a.id}.style.opacity = "1";
}</code></pre>
            </div></div>`;
          }).join('');

          artifactsHtml = `
            <h3 style="color: #fff; border-bottom: 1px solid #333; padding-bottom: 10px; margin-top: 25px;">🎨 Artefactos Disponibles</h3>
            <p style="font-size: 13px; color: #aaa; margin-bottom: 15px;">A continuación se listan los artefactos inyectados para este proyecto y el código exacto necesario para implementarlos. <b>NO inventes otros IDs ni uses getArtifact().</b></p>
            ${artifacts.length > 0 ? artifactItems : '<div style="padding: 15px; color: #888; font-style: italic;">No hay artefactos definidos en este proyecto.</div>'}
          `;
        }

        // 3. Bloque de Código Fuente
        let codeHtml = '';
        if (options.includeCode && pluginId) {
          const files = await pluginManager.getPluginFiles(pluginId);
          codeHtml = `
            <h3 style="color: #fff; border-bottom: 1px solid #333; padding-bottom: 10px; margin-top: 25px;">💻 Código Fuente Actual</h3>
            <p style="font-size: 13px; color: #aaa; margin-bottom: 15px;">A continuación se muestra el código actual del plugin. Modifica SOLO lo necesario basándote en este código en lugar de reescribir de cero.</p>
            
            <div style="font-family: monospace; font-size: 12px; color: #4CAF50; margin-bottom: 5px;">[HTML]</div>
            <pre style="background: #111; color: #eee; padding: 10px; border-radius: 4px; margin-top: 0; border: 1px solid #222; white-space: pre-wrap;"><code>${(files?.html || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>

            <div style="font-family: monospace; font-size: 12px; color: #2196F3; margin-bottom: 5px; margin-top: 15px;">[CSS]</div>
            <pre style="background: #111; color: #eee; padding: 10px; border-radius: 4px; margin-top: 0; border: 1px solid #222; white-space: pre-wrap;"><code>${(files?.css || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>

            <div style="font-family: monospace; font-size: 12px; color: #FFC107; margin-bottom: 5px; margin-top: 15px;">[JAVASCRIPT]</div>
            <pre style="background: #111; color: #eee; padding: 10px; border-radius: 4px; margin-top: 0; border: 1px solid #222; white-space: pre-wrap;"><code>${(files?.js || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
          `;
        }

        contextHtml = `
          <div style="background: #1a1a1a; color: #eee; padding: 30px; border-radius: 12px; margin-bottom: 40px; border: 1px solid #E44C30;">
            <h1 style="color: #fff; margin-top: 0; font-size: 28px; text-transform: uppercase; letter-spacing: 2px;">DVGE PROJECT CONTEXT — ${name}</h1>
            
            <div style="background: #E44C30; color: #fff; padding: 10px 15px; border-radius: 6px; font-family: monospace; font-size: 13px; font-weight: bold; margin-bottom: 25px; display: inline-block;">
              VERSIÓN: ${versionDate} | PLUGIN: ${pluginId} | ESTADO: PROYECTO ACTIVO
            </div>

            <p style="font-size: 14px; color: #aaa; margin-bottom: 25px; border-left: 3px solid #E44C30; padding-left: 10px;">
              Este documento contiene el contexto vivo del proyecto y su configuración. La IA debe basarse <b>estrictamente</b> en estos valores para generar el código.
            </p>
            
            ${canvasHtml}

            ${creativeBrief ? `
            <h3 style="color: #fff; border-bottom: 1px solid #333; padding-bottom: 10px; margin-top: 25px;">🎨 Brief Creativo</h3>
            <div style="background: rgba(228, 76, 48, 0.1); padding: 15px; border-radius: 6px; border: 1px solid #E44C30; font-size: 14px; line-height: 1.6; color: #fff; white-space: pre-wrap; font-family: 'Georgia', serif; font-style: italic;">
              ${creativeBrief}
            </div>
            ` : ''}
            
            ${artifactsHtml}

            ${codeHtml}

          <!-- [INYECCIÓN] ESQUEMA DE PROPIEDADES DEL INSPECTOR -->
          <div style="background: #1e1e1e; padding: 25px; border-radius: 12px; border-left: 4px solid #E44C30; margin-bottom: 30px; margin-top: 30px;">
            <h3 style="color: #fff; margin-top: 0; border-bottom: 1px solid #333; padding-bottom: 10px;">🎛️ Esquema de Propiedades del Inspector (Props Schema)</h3>
            
            <p style="color: #ffcccc; font-size: 14px; font-weight: bold; margin-bottom: 15px;">DIRECTIVA OBLIGATORIA: Absolutamente TODO lo que pueda ser personalizable (textos, colores, posiciones, escalas, opacidades, fuentes, velocidades, etc.) DEBE ser expuesto en el Inspector mediante comentarios @dv-prop.</p>
            <p style="color: #aaa; font-size: 13px; margin-bottom: 20px;">Los campos deben estar estrictamente ordenados en grupos lógicos utilizando la propiedad <code style="color: #fff; background: #333; padding: 2px 5px; border-radius: 3px;">"group"</code> para organizar la interfaz del usuario.</p>
            
            <h4 style="color: #ccc; border-bottom: 1px solid #333; padding-bottom: 5px;">Tipos de Variables Disponibles y Ejemplos</h4>
            
            <ul style="color: #ddd; font-size: 13px; line-height: 1.6; padding-left: 20px;">
              <li style="margin-bottom: 15px;"><b>1. string</b> (Textos cortos, Títulos, URLs)
                <pre style="background: #111; color: #4CAF50; padding: 8px; border-radius: 4px; margin-top: 5px; white-space: pre-wrap; border: 1px solid #222;"><code>&lt;!-- @dv-prop { "id": "mainTitle", "type": "string", "group": "Contenido", "label": "Título Principal", "defaultValue": "Bienvenidos" } --&gt;</code></pre>
              </li>
              <li style="margin-bottom: 15px;"><b>2. number</b> (Dimensiones, Posiciones X/Y, Velocidades)
                <pre style="background: #111; color: #2196F3; padding: 8px; border-radius: 4px; margin-top: 5px; white-space: pre-wrap; border: 1px solid #222;"><code>/* @dv-prop { "id": "logoScale", "type": "number", "group": "Transformaciones", "label": "Escala del Logo", "defaultValue": 1.5, "min": 0.5, "max": 3.0, "step": 0.1 } */</code></pre>
              </li>
              <li style="margin-bottom: 15px;"><b>3. color</b> (Fondos, Textos, Bordes)
                <pre style="background: #111; color: #2196F3; padding: 8px; border-radius: 4px; margin-top: 5px; white-space: pre-wrap; border: 1px solid #222;"><code>/* @dv-prop { "id": "accentColor", "type": "color", "group": "Apariencia", "label": "Color de Acento", "defaultValue": "#E44C30" } */</code></pre>
              </li>
              <li style="margin-bottom: 15px;"><b>4. boolean</b> (Switches On/Off)
                <pre style="background: #111; color: #FFC107; padding: 8px; border-radius: 4px; margin-top: 5px; white-space: pre-wrap; border: 1px solid #222;"><code>// @dv-prop { "id": "showParticles", "type": "boolean", "group": "Efectos", "label": "Mostrar Partículas", "defaultValue": true }</code></pre>
              </li>
              <li style="margin-bottom: 15px;"><b>5. select</b> (Listas Desplegables)
                <pre style="background: #111; color: #FFC107; padding: 8px; border-radius: 4px; margin-top: 5px; white-space: pre-wrap; border: 1px solid #222;"><code>// @dv-prop { "id": "themeVariant", "type": "select", "group": "Apariencia", "label": "Variante Visual", "options": [{"value": "dark", "label": "Oscuro"}, {"value": "light", "label": "Claro"}], "defaultValue": "dark" }</code></pre>
              </li>
              <li style="margin-bottom: 15px;"><b>6. dataset</b> (Tablas de Datos / JSON 2D Array)
                <pre style="background: #111; color: #4CAF50; padding: 8px; border-radius: 4px; margin-top: 5px; white-space: pre-wrap; border: 1px solid #222;"><code>// @dv-prop { "id": "stats", "type": "dataset", "group": "Datos", "label": "Estadísticas de Jugador" }
// Uso: const data = JSON.parse(props.stats);</code></pre>
              </li>
              <li style="margin-bottom: 15px;"><b>7. code</b> (Bloques de Lógica o Estilos)
                <pre style="background: #111; color: #2196F3; padding: 8px; border-radius: 4px; margin-top: 5px; white-space: pre-wrap; border: 1px solid #222;"><code>// @dv-prop { "id": "customLogic", "type": "code", "group": "Avanzado", "label": "Script Adicional", "defaultValue": "console.log('Hello');" }</code></pre>
              </li>
              <li style="margin-bottom: 15px;"><b>8. image-ref</b> (Imágenes Personalizadas URL libre)
                <pre style="background: #111; color: #FFC107; padding: 8px; border-radius: 4px; margin-top: 5px; white-space: pre-wrap; border: 1px solid #222;"><code>// @dv-prop { "id": "customWatermark", "type": "image-ref", "group": "Medios", "label": "Marca de Agua", "defaultValue": "https://via.placeholder.com/150" }</code></pre>
              </li>
              <li style="margin-bottom: 15px;"><b>9. alignment</b> (Grilla 3x3 de Posicionamiento) - <i>Su uso óptimo es inyectándolo en place-items (CSS Grid).</i>
                <pre style="background: #111; color: #2196F3; padding: 8px; border-radius: 4px; margin-top: 5px; white-space: pre-wrap; border: 1px solid #222;"><code>/* @dv-prop { "id": "logoPos", "type": "alignment", "group": "Layout", "label": "Posición del Logo", "defaultValue": "center center" } */
.logo-container { display: grid; place-items: var(--logoPos); }</code></pre>
              </li>
            </ul>
            
            <div style="background: #2a2a2a; padding: 15px; border-radius: 6px; border-left: 4px solid #ffcc00; margin-top: 20px;">
              <p style="color: #eee; font-size: 13px; margin: 0 0 5px 0;"><b>REGLAS DE GENERACIÓN:</b></p>
              <ul style="color: #aaa; font-size: 13px; margin: 0; padding-left: 20px;">
                <li>Si el estado del proyecto es <code>Producción</code>, NO inventes variables que no estén explícitamente en el HTML/CSS/JS.</li>
                <li>Si el estado es <code>Borrador</code>, DEBES generar todas las variables necesarias (y agruparlas) para hacer el template 100% paramétrico.</li>
              </ul>
            </div>
          </div>
          ${(() => {
            // [v5.7.2] Inyección de KNOWLEDGE.md
            try {
              const projectId = data.projectContext.id;
              if (!projectId) return '';
              const knowledgePath = join(app.getPath('documents'), 'DVG_Projects', projectId, 'KNOWLEDGE.md');

              if (fs.existsSync(knowledgePath)) {
                const content = fs.readFileSync(knowledgePath, 'utf8');
                return `
                  <div style="background: #0f172a; color: #cbd5e1; padding: 30px; border-radius: 12px; margin-bottom: 40px; border: 1px solid #38bdf8;">
                    <h2 style="color: #38bdf8; margin-top: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">📚 Project Knowledge (KNOWLEDGE.md)</h2>
                    <div style="font-size: 13px; line-height: 1.6; white-space: pre-wrap;">${content}</div>
                  </div>
                  <div style="page-break-after: always;"></div>
                `;
              }
            } catch (e) {
              console.error('[PDF] Error reading knowledge.md:', e);
            }
            return '';
          })()}

          </div>
          <div style="page-break-after: always;"></div>
        `;
      }

      const html = `
        <html>
          <body style="font-family: 'Inter', sans-serif; padding: 0; margin: 0; background: #0a0a0a; color: #ccc;">
            <div style="padding: 40px;">
              ${contextHtml}
              <h1 style="color: #E44C30; font-size: 28px; text-transform: uppercase; letter-spacing: 4px; border-bottom: 2px solid #E44C30; padding-bottom: 10px;">Master Rules & Logic</h1>
              <pre style="background: #111; padding: 25px; border-radius: 8px; font-family: 'Fira Code', monospace; font-size: 12px; line-height: 1.6; border: 1px solid #222; white-space: pre-wrap;">${finalRules.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
            </div>
          </body>
        </html>
      `
      win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`)
      win.webContents.on('did-finish-load', async () => {
        try {
          const pdfData = await win.webContents.printToPDF({
            printBackground: true,
            pageSize: 'A4'
          })
          fs.writeFileSync(pdfPath, pdfData)
          resolve(pdfPath)
        } catch (e) {
          console.error("Error generating PDF:", e)
          resolve('')
        } finally {
          win.destroy()
        }
      })
    })
  })

  // [v5.7.1] Bypass nativo para descargar el catálogo de plugins (Evita 'Failed to fetch' en el frontend)
  ipcMain.handle('fetch-remote-registry', async () => {
    const https = require('https');
    const branches = ['main', 'master'];

    for (const branch of branches) {
      try {
        const url = `https://raw.githubusercontent.com/Mushi-Ayaka/Dynamic-Vector-Engine-Plugins/${branch}/registry.json?t=${Date.now()}`;
        console.log(`[Main] Intentando descargar registro (rama ${branch})...`);

        const data = await new Promise((resolve, reject) => {
          https.get(url, (res: any) => {
            if (res.statusCode !== 200) {
              reject(new Error(`Status: ${res.statusCode}`));
              return;
            }
            let body = '';
            res.on('data', (chunk: any) => body += chunk);
            res.on('end', () => resolve(JSON.parse(body)));
          }).on('error', reject);
        });

        console.log(`[Main] Registro descargado con éxito desde ${branch}`);
        return { success: true, data };
      } catch (e: any) {
        console.warn(`[Main] Error en rama ${branch}:`, e.message);
      }
    }
    return { success: false, error: 'No se pudo conectar con GitHub desde el Proceso Principal.' };
  })


  // [Window Controls] Handlers para ventana frameless
  ipcMain.on('window-minimize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    win?.minimize()
  })
  ipcMain.on('window-maximize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win?.isMaximized()) win.restore()
    else win?.maximize()
  })
  ipcMain.on('window-close', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    win?.close()
  })
  ipcMain.handle('window-is-maximized', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    return win?.isMaximized() ?? false
  })
  ipcMain.on('window-new', () => createWindow())
  ipcMain.on('window-zoom-in', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    win?.webContents.setZoomLevel((win.webContents.getZoomLevel() || 0) + 0.5)
  })
  ipcMain.on('window-zoom-out', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    win?.webContents.setZoomLevel((win.webContents.getZoomLevel() || 0) - 0.5)
  })
  ipcMain.on('window-zoom-reset', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    win?.webContents.setZoomLevel(0)
  })
  ipcMain.on('open-external', (_event, url) => shell.openExternal(url))
  ipcMain.on('open-manual', () => createManualWindow())


  // [INS-02/03] File Dialog — Selector nativo del OS para file-ref e image-ref
  ipcMain.handle('show-open-dialog', async (_event, options: {
    filters?: { name: string; extensions: string[] }[]
    properties?: Array<'openFile' | 'multiSelections'>
  }) => {
    const result = await dialog.showOpenDialog({
      properties: options.properties ?? ['openFile'],
      filters: options.filters ?? [],
    })
    return { canceled: result.canceled, filePaths: result.filePaths }
  })

  // [INS-02] Lectura segura de archivos locales — proceso principal (no renderer)
  ipcMain.handle('read-file-utf8', (_event, filePath: string) => {
    try {
      const buffer = fs.readFileSync(filePath)
      const content = buffer.toString('utf-8')
      return { content, sizeBytes: buffer.byteLength }
    } catch (err: any) {
      return { content: '', sizeBytes: 0, error: err?.message ?? 'Error al leer el archivo' }
    }
  })

  // [v5.7.0] Guardar artefactos generados (ej. recortes de imagen)
  ipcMain.handle('save-artifact', (_event, data: { projectId: string, fileName: string, base64Data: string }) => {
    try {
      const pPath = join(app.getPath('documents'), 'DVG_Projects', data.projectId, 'artifacts')
      if (!fs.existsSync(pPath)) fs.mkdirSync(pPath, { recursive: true })

      const filePath = join(pPath, data.fileName)
      const base64 = data.base64Data.split(';base64,').pop()
      if (!base64) throw new Error('Invalid base64 data')

      fs.writeFileSync(filePath, Buffer.from(base64, 'base64'))
      return { success: true, filePath: `media:///${filePath.replace(/\\/g, '/')}` }
    } catch (err: any) {
      console.error('[IPC] Error saving artifact:', err)
      return { success: false, error: err.message }
    }
  })

  // [v5.7.0] Copiar archivo externo al directorio de ASSETS del proyecto
  ipcMain.handle('copy-to-project', (_event, data: { projectId: string, sourcePath: string }) => {
    try {
      const pPath = join(app.getPath('documents'), 'DVG_Projects', data.projectId, 'assets')
      if (!fs.existsSync(pPath)) fs.mkdirSync(pPath, { recursive: true })

      const fileName = `${Date.now()}_${basename(data.sourcePath)}`
      const targetPath = join(pPath, fileName)

      fs.copyFileSync(data.sourcePath, targetPath)
      return { success: true, filePath: targetPath }
    } catch (err: any) {
      console.error('[IPC] Error copying to assets:', err)
      return { success: false, error: err.message }
    }
  })

  // [v5.7.0] Mover un asset al directorio de ARTEFACTOS (Indexación)
  ipcMain.handle('index-asset', (_event, data: { projectId: string, assetPath: string }) => {
    try {
      const artPath = join(app.getPath('documents'), 'DVG_Projects', data.projectId, 'artifacts')
      if (!fs.existsSync(artPath)) fs.mkdirSync(artPath, { recursive: true })

      const fileName = basename(data.assetPath)
      const targetPath = join(artPath, fileName)

      fs.renameSync(data.assetPath, targetPath) // Mover archivo
      return { success: true, filePath: `media:///${targetPath.replace(/\\/g, '/')}` }
    } catch (err: any) {
      console.error('[IPC] Error indexing asset:', err)
      return { success: false, error: err.message }
    }
  })

  // [v5.7.0] Listar archivos físicos en la carpeta de ASSETS (sin indexar)
  ipcMain.handle('list-assets', (_event, projectId: string) => {
    try {
      const pPath = join(app.getPath('documents'), 'DVG_Projects', projectId, 'assets')
      if (!fs.existsSync(pPath)) return []

      return fs.readdirSync(pPath)
        .filter(f => fs.lstatSync(join(pPath, f)).isFile())
        .map(f => ({
          name: f,
          path: join(pPath, f)
        }))
    } catch (err) {
      console.error('[IPC] Error listing assets:', err)
      return []
    }
  })

  // [v5.8.5] Parseador de archivos de tabla (CSV, XLSX) para Datasets
  ipcMain.handle('parse-table-file', async (_event, filePath: string) => {
    try {
      const ext = basename(filePath).split('.').pop()?.toLowerCase();
      const buffer = fs.readFileSync(filePath);

      if (ext === 'csv') {
        const content = buffer.toString('utf-8');
        const results = Papa.parse(content, { skipEmptyLines: true });
        return { success: true, data: results.data };
      } else if (ext === 'xlsx' || ext === 'xls') {
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        return { success: true, data };
      }

      return { success: false, error: 'Formato de archivo no soportado' };
    } catch (err: any) {
      console.error('[IPC] Error parsing table file:', err);
      return { success: false, error: err.message };
    }
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

function setupMenu() {
  // El menú nativo se elimina — usamos TitleBar custom en el renderer
  Menu.setApplicationMenu(null)
}

function createManualWindow() {
  const manualWindow = new BrowserWindow({
    width: 1024,
    height: 650,
    minWidth: 1024,
    minHeight: 650,
    frame: false,
    thickFrame: false,
    title: 'Manual de Usuario - DV Engine',
    icon: join(__dirname, '../public/icon.png'),
    backgroundColor: '#050505',
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    manualWindow.loadURL(`${process.env.VITE_DEV_SERVER_URL}#manual`)
  } else {
    // Para producción, usamos file:// con el hash manual
    const prodPath = join(__dirname, '../dist/index.html')
    manualWindow.loadURL(`file://${prodPath}#manual`)
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('will-quit', async () => {
  await TelemetryHub.shutdown();
})
