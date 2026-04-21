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
  startDrag: (filePath: string) => ipcRenderer.send('ondragstart', filePath),
  openFolder: (dirPath: string) => ipcRenderer.send('open-folder', dirPath),
  getPlugins: () => ipcRenderer.invoke('get-plugins'),
  openPluginsFolder: () => ipcRenderer.send('open-plugins-folder'),
  getDocContent: (docName: string) => ipcRenderer.invoke('get-doc-content', docName),
  getPluginFiles: (pluginId: string) => ipcRenderer.invoke('get-plugin-files', pluginId),
  logSync: (data: any) => ipcRenderer.send('log-sync', data),
  
  // Workspace / Proyectos
  getProjects: () => ipcRenderer.invoke('get-projects'),
  createProject: (name: string, pluginId: string, defaultProps: any) => ipcRenderer.invoke('create-project', { name, pluginId, defaultProps }),
  saveProjectProps: (projectId: string, props: any) => ipcRenderer.invoke('save-project-props', { projectId, props }),
  openProjectFolder: (projectId: string) => ipcRenderer.send('open-project-folder', projectId),
})
