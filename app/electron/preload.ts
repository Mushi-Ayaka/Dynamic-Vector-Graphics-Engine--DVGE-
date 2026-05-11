import { contextBridge, ipcRenderer } from 'electron'

// Exponemos una API segura al Renderer Process
contextBridge.exposeInMainWorld('ipcRenderer', {
  invoke: async (channel: string, data: any) => {
    const validChannels = ['start-render']
    if (validChannels.includes(channel)) {
      return await ipcRenderer.invoke(channel, data)
    }
  },
  // ondragstart manda la ruta del archivo generado de vuelta al main.
  send: (channel: string, data: any) => {
    const validChannels = ['ondragstart']
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data)
    }
  },
  on: (channel: string, func: (...args: any[]) => void) => {
    const validChannels = ['render-progress']
    if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender` 
        ipcRenderer.on(channel, (_event, ...args) => func(...args))
    }
  },
  renderProject: (data: any) => ipcRenderer.invoke('start-render', data),
  startDrag: (filePath: string) => ipcRenderer.send('ondragstart', filePath),
  openFolder: (dirPath: string) => ipcRenderer.send('open-folder', dirPath),
  getPlugins: () => ipcRenderer.invoke('get-plugins'),
  openPluginsFolder: () => ipcRenderer.send('open-plugins-folder'),
  getDocContent: (docName: string) => ipcRenderer.invoke('get-doc-content', docName),
  getPluginFiles: (pluginId: string) => ipcRenderer.invoke('get-plugin-files', pluginId),
  installPlugin: (pluginId: string, files: any) => ipcRenderer.invoke('install-plugin', { pluginId, files }),
  deletePlugin: (pluginId: string) => ipcRenderer.invoke('delete-plugin', pluginId),
  generateRulesPdf: (data: any) => ipcRenderer.invoke('generate-rules-pdf', data),
  logSync: (data: any) => ipcRenderer.send('log-sync', data),
  
  // Workspace / Proyectos
  getProjects: () => ipcRenderer.invoke('get-projects'),
  createProject: (name: string, pluginId: string, defaultProps: any) => ipcRenderer.invoke('create-project', { name, pluginId, defaultProps }),
  saveProjectProps: (projectId: string, props: any) => ipcRenderer.invoke('save-project-props', { projectId, props }),
  openProjectFolder: (projectId: string) => ipcRenderer.send('open-project-folder', projectId),
  updateProject: (projectId: string, updates: any) => ipcRenderer.invoke('update-project', { projectId, updates }),
  deleteProject: (projectId: string) => ipcRenderer.invoke('delete-project', projectId),

  // [Window Controls] Frameless window
  windowMinimize: () => ipcRenderer.send('window-minimize'),
  windowMaximize: () => ipcRenderer.send('window-maximize'),
  windowClose: () => ipcRenderer.send('window-close'),
  windowIsMaximized: () => ipcRenderer.invoke('window-is-maximized'),
  windowNew: () => ipcRenderer.send('window-new'),
  windowZoomIn: () => ipcRenderer.send('window-zoom-in'),
  windowZoomOut: () => ipcRenderer.send('window-zoom-out'),
  windowZoomReset: () => ipcRenderer.send('window-zoom-reset'),
  windowOpenExternal: (url: string) => ipcRenderer.send('open-external', url),
  windowOpenManual: () => ipcRenderer.send('open-manual'),
  getMachineId: () => ipcRenderer.invoke('get-machine-id'),
  getGpuInfo: () => ipcRenderer.invoke('get-gpu-info'),

  // [INS-02/03] File Dialog & File Reading
  showOpenDialog: (options: {
    filters?: { name: string; extensions: string[] }[];
    properties?: Array<'openFile' | 'multiSelections'>;
  }) => ipcRenderer.invoke('show-open-dialog', options),
  readFileUtf8: (filePath: string) => ipcRenderer.invoke('read-file-utf8', filePath),
  saveArtifact: (data: { projectId: string, fileName: string, base64Data: string }) => ipcRenderer.invoke('save-artifact', data),
  copyToProject: (data: { projectId: string, sourcePath: string }) => ipcRenderer.invoke('copy-to-project', data),
  listAssets: (projectId: string) => ipcRenderer.invoke('list-assets', projectId),
  indexAsset: (data: { projectId: string, assetPath: string }) => ipcRenderer.invoke('index-asset', data),
  parseTableFile: (filePath: string) => ipcRenderer.invoke('parse-table-file', filePath),
  fetchRemoteRegistry: () => ipcRenderer.invoke('fetch-remote-registry'),
  downloadAndRunUpdate: (url: string) => ipcRenderer.invoke('download-and-run-update', url),
})
