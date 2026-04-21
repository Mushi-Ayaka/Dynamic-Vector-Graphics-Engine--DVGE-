import { create } from 'zustand'

type StoreState = {
  activeProject: any | null
  activePluginFiles: { html: string; css: string; js: string } | null
  properties: Record<string, any>
  setProperties: (props: Partial<StoreState['properties']>) => void
  
  loadProject: (project: any) => Promise<void>
  saveProjectState: () => Promise<void>
  isSaving: boolean
  lastSaved: Date | null
  
  // Render State Machine
  renderState: 'IDLE' | 'RENDERING' | 'DONE' | 'ERROR'
  renderProgress: number
  renderError?: string
  outputPath?: string
  
  isPluginManagerOpen: boolean
  togglePluginManager: () => void

  activePluginId: string | null
  setRenderProgress: (progress: number) => void
  setRenderState: (state: StoreState['renderState'], error?: string, path?: string) => void
}

export const useStore = create<StoreState>((set, get) => ({
  activeProject: null,
  activePluginFiles: null,
  properties: {},
  isSaving: false,
  lastSaved: null,
  
  loadProject: async (project) => {
    set({ activeProject: project, properties: project.properties || {} })
    try {
      const files = await window.ipcRenderer.getPluginFiles(project.pluginId)
      set({ activePluginFiles: files })
    } catch (e) {
      console.error("Error loading plugin files:", e)
    }
  },

  saveProjectState: async () => {
    const { activeProject, properties } = get();
    if (!activeProject || !window.ipcRenderer) return;
    
    set({ isSaving: true });
    await window.ipcRenderer.saveProjectProps(activeProject.id, properties);
    set({ isSaving: false, lastSaved: new Date() });
  },

  setProperties: (props) => set((state) => ({ properties: { ...state.properties, ...props } })),

  renderState: 'IDLE',
  renderProgress: 0,
  renderError: undefined,
  outputPath: undefined,

  isPluginManagerOpen: false,
  togglePluginManager: () => set((state) => ({ isPluginManagerOpen: !state.isPluginManagerOpen })),

  activePluginId: null,

  setRenderProgress: (progress) => set({ renderProgress: progress }),
  setRenderState: (newState, error = undefined, path = undefined) => set((state) => ({ 
    renderState: newState,
    renderError: error,
    outputPath: path || state.outputPath
  }))
}))
