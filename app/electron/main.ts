process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';
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

app.whenReady().then(() => {
  setupRemotionIPC()
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

  ipcMain.on('log-sync', (_event, data) => {
    if (data._debug) {
      console.log(`🔬 [DEBUG] ${data._debug}:`, JSON.stringify(data))
    } else {
      console.log(`>> [SOFT-SYNC] Bridge: ${data.hasCallback ? 'CONN' : 'DISC'} | Props:`, JSON.stringify(data.props))
    }
  })

  ipcMain.handle('get-doc-content', (_event, docName: string) => {
    // Seguridad: Asegurar que docName no navegue fuera del scope
    const safeName = docName.replace(/[^a-zA-Z0-9_\-\.]/g, '');
    const docPath = join(app.getAppPath(), safeName);
    if (fs.existsSync(docPath)) {
      return fs.readFileSync(docPath, 'utf8')
    }
    return `# Error: Documento no encontrado.\nNo se pudo encontrar el archivo: ${safeName}`
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
