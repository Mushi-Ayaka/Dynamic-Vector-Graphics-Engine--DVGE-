process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

// Parchear ESBUILD_BINARY_PATH ANTES de cualquier import de @remotion.
// Con asar:true, esbuild no puede encontrar su binario dentro del .asar.
// Lo apuntamos al .asar.unpacked donde sí existe como archivo real.
;(function patchEsbuild() {
  const path = require('node:path')
  const fs = require('node:fs')
  const resourcesPath = process.resourcesPath ?? ''
  const candidate = path.join(resourcesPath, 'app.asar.unpacked', 'node_modules', '@esbuild', 'win32-x64', 'esbuild.exe')
  if (fs.existsSync(candidate)) {
    process.env.ESBUILD_BINARY_PATH = candidate
  }
})();
import { app, BrowserWindow, ipcMain, shell, IpcMainEvent, Menu } from 'electron'
import { join } from 'node:path'
import * as fs from 'node:fs'

import { PluginManager } from './plugin-manager'
import { ProjectManager } from './project-manager'

const pluginManager = new PluginManager()
const projectManager = new ProjectManager()

let mainWindow: BrowserWindow | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1424,
    height: 1068,
    title: 'DV Graphics Engine',
    icon: join(__dirname, '../public/icon.png'),
    backgroundColor: '#141414',
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      // Node integration debe estar en false por seguridad en Electron >12
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

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
  setupRemotionIPC()
  
  // Pre-descargar Chrome Headless en background si no existe
  // Esto evita que el primer render falle por browser no disponible
  try {
    const { ensureBrowser } = await import('@remotion/renderer')
    console.log('[Remotion] Ensuring browser is available...')
    await ensureBrowser()
    console.log('[Remotion] Browser ready')
  } catch (e) {
    console.warn('[Remotion] Could not ensure browser:', e)
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
    const iconPath = join(__dirname, '../public/icon-drag.png')
    const iconExists = fs.existsSync(iconPath)

    event.sender.startDrag({
      file: filePath,
      icon: iconExists ? iconPath : join(__dirname, '../public/icon.png')
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

  ipcMain.on('ondragstart', (event, filePath) => {
    if (fs.existsSync(filePath)) {
      // Intentamos usar un icono representativo si existe
      const iconPath = join(app.getAppPath(), 'public', 'icon-drag.png')
      
      event.sender.startDrag({
        file: filePath,
        icon: fs.existsSync(iconPath) ? iconPath : join(app.getAppPath(), 'public', 'icon.png')
      })
    }
  })

  ipcMain.on('log-sync', (_event, data) => {
    if (data._debug) {
      console.log(`🔬 [DEBUG] ${data._debug}:`, JSON.stringify(data))
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

  // [v5.5.0] Generador automático de PDF para arrastrar a IAs
  ipcMain.handle('generate-rules-pdf', async (_event, rulesText: string) => {
    return new Promise((resolve) => {
      const pdfPath = join(app.getPath('temp'), 'DVGE-Master-Rules.pdf')
      if (fs.existsSync(pdfPath)) {
        return resolve(pdfPath)
      }
      
      const win = new BrowserWindow({ show: false })
      const html = `
        <html>
          <body style="font-family: sans-serif; padding: 40px; color: #333;">
            <h1 style="color: #E44C30;">DVGE Master Rules</h1>
            <pre style="background: #f4f4f4; padding: 20px; border-radius: 8px;">${rulesText}</pre>
          </body>
        </html>
      `
      win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`)
      win.webContents.on('did-finish-load', async () => {
        try {
          const pdfData = await win.webContents.printToPDF({ printBackground: true })
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


  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

function setupMenu() {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'Archivo',
      submenu: [
        { label: 'Nueva Ventana', click: () => createWindow() },
        { type: 'separator' },
        { role: 'quit', label: 'Salir' }
      ]
    },
    {
      label: 'Editar',
      submenu: [
        { role: 'undo', label: 'Deshacer' },
        { role: 'redo', label: 'Rehacer' },
        { type: 'separator' },
        { role: 'cut', label: 'Cortar' },
        { role: 'copy', label: 'Copiar' },
        { role: 'paste', label: 'Pegar' }
      ]
    },
    {
      label: 'Vista',
      submenu: [
        { role: 'reload', label: 'Reiniciar' },
        { role: 'toggleDevTools', label: 'Herramientas de Desarrollador' },
        { type: 'separator' },
        { role: 'resetZoom', label: 'Zoom Normal' },
        { role: 'zoomIn', label: 'Aumentar Zoom' },
        { role: 'zoomOut', label: 'Alejar Zoom' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Pantalla Completa' }
      ]
    },
    {
      label: 'Ayuda',
      submenu: [
        {
          label: 'Documentación',
          click: () => {
            shell.openExternal('https://mushi-ayaka.github.io/DVGE-Docs/development/quick-start/')
          }
        },
        {
          label: 'Manual',
          click: () => {
            createManualWindow()
          }
        },
        {
          label: 'Ecosistema de Plugins',
          click: () => {
            shell.openPath(pluginManager.getPluginsFolder())
          }
        }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

function createManualWindow() {
  const manualWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    title: 'Manual de Usuario - DV Engine',
    icon: join(__dirname, '../public/icon.png'),
    backgroundColor: '#1a1a1a',
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
