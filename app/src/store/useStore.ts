import { create } from 'zustand'
import { DVPlugin } from '../env'

// --- Tipo del Store ---
type StoreState = {
  activeProject: any | null
  activePlugin: DVPlugin | null         // Manifiesto del plugin activo
  plugins: DVPlugin[]                   // Lista de todos los plugins instalados
  activePluginFiles: { html: string; css: string; js: string } | null
  properties: Record<string, any>
  setProperties: (props: Partial<StoreState['properties']>) => void

  initialize: () => Promise<void>       // Cargar plugins al iniciar la app
  loadProject: (project: any) => Promise<void>
  clearActiveProject: () => void
  saveProjectState: () => Promise<void>
  isSaving: boolean
  lastSaved: Date | null

  // Render State Machine
  isExporting: boolean
  globalConfig: Record<string, any>
  renderState: 'IDLE' | 'RENDERING' | 'DONE' | 'ERROR'
  renderProgress: number
  renderError?: string
  outputPath?: string

  isPluginManagerOpen: boolean
  togglePluginManager: () => void
  isGalleryOpen: boolean
  toggleGallery: () => void

  activePluginId: string | null
  setRenderProgress: (progress: number) => void
  setRenderState: (state: StoreState['renderState'], error?: string, path?: string) => void

  // Project Creation State (Global to survive re-renders)
  isCreatingProject: boolean
  setIsCreatingProject: (val: boolean) => void
  newProjectName: string
  setNewProjectName: (val: string) => void
  newProjectPluginId: string
  setNewProjectPluginId: (val: string) => void
  updateProjectConfig: (patch: Partial<{ width: number; height: number; fps: number; durationInFrames: number; aspectRatioMode: string }>) => void

  uiState: { aspectRatioMode: string; advancedDuration: boolean }
  setUiState: (patch: Partial<StoreState['uiState']>) => void
  updateProjectName: (name: string) => Promise<void>
  deleteProject: () => Promise<void>
}

export const useStore = create<StoreState>((set, get) => ({
  activeProject: null,
  activePlugin: null,
  plugins: [],
  activePluginFiles: null,
  properties: {},
  isExporting: false,
  globalConfig: {
      safeArea: 60, // Valor por defecto
      previewQuality: 'high'
  },
  isSaving: false,
  lastSaved: null,
  uiState: { aspectRatioMode: '16:9', advancedDuration: false },
  setUiState: (patch) => set((state) => ({ uiState: { ...state.uiState, ...patch } })),

  // Carga todos los plugins disponibles (llamar al arrancar la app)
  initialize: async () => {
    if (!window.ipcRenderer) return
    try {
      const list = await window.ipcRenderer.getPlugins()
      set({ plugins: list })
    } catch (e) {
      console.error('[Store] Error al inicializar plugins:', e)
    }
  },

  loadProject: async (project) => {
    const { plugins } = get()
    const rawPlugin = plugins.find(p => p.manifest.id === project.pluginId) || null
    
    let activePlugin = null
    if (rawPlugin) {
        activePlugin = {
            ...rawPlugin,
            manifest: {
                ...rawPlugin.manifest
            }
        };
    }

    set({ 
      activeProject: project, 
      properties: project.properties || {}, 
      activePlugin,
      uiState: { 
        aspectRatioMode: project.aspectRatioMode || 'custom', 
        advancedDuration: false 
      }
    })
    try {
      const files = await window.ipcRenderer.getPluginFiles(project.pluginId)
      set({ activePluginFiles: files })
    } catch (e) {
      console.error('[Store] Error al cargar archivos del plugin:', e)
    }
  },

  clearActiveProject: () => set({
    activeProject: null,
    activePlugin: null,
    activePluginFiles: null,
    properties: {},
    renderState: 'IDLE',
    renderProgress: 0,
    renderError: undefined,
    outputPath: undefined
  }),

  saveProjectState: async () => {
    const { activeProject } = get()
    if (!activeProject || !window.ipcRenderer) return
    set({ isSaving: true })
    
    // Mandamos el objeto completo para persistir metadata (width, height, etc.) junto con props
    await window.ipcRenderer.saveProjectProps(activeProject.id, activeProject)
    
    set({ isSaving: false, lastSaved: new Date() })
  },

  setProperties: (props) => set((state) => {
    const nextProps = { ...state.properties, ...props };
    // Sincronización proactiva con el objeto del proyecto activo
    const nextProject = state.activeProject 
      ? { ...state.activeProject, properties: nextProps } 
      : null;
      
    return { 
      properties: nextProps,
      activeProject: nextProject
    };
  }),

  renderState: 'IDLE',
  renderProgress: 0,
  renderError: undefined,
  outputPath: undefined,

  isPluginManagerOpen: false,
  togglePluginManager: () => set((state) => ({ isPluginManagerOpen: !state.isPluginManagerOpen })),
  isGalleryOpen: false,
  toggleGallery: () => set((state) => ({ isGalleryOpen: !state.isGalleryOpen })),

  activePluginId: null,

  setRenderProgress: (progress) => set({ renderProgress: progress }),
  setRenderState: (newState, error = undefined, path = undefined) => set((state) => ({
    renderState: newState,
    renderError: error,
    outputPath: path || state.outputPath
  })),

  isCreatingProject: false,
  setIsCreatingProject: (val) => set({ isCreatingProject: val }),
  newProjectName: '',
  setNewProjectName: (val) => set({ newProjectName: val }),
  newProjectPluginId: '',
  setNewProjectPluginId: (val) => set({ newProjectPluginId: val }),
  updateProjectConfig: (patch) => set((state) => {
    const nextProject = state.activeProject ? { ...state.activeProject, ...patch } : null;
    const nextUiState = patch.aspectRatioMode 
      ? { ...state.uiState, aspectRatioMode: patch.aspectRatioMode }
      : state.uiState;

    return {
      activeProject: nextProject,
      uiState: nextUiState
    };
  }),

  updateProjectName: async (name) => {
    const { activeProject } = get();
    if (!activeProject || !window.ipcRenderer) return;

    // @ts-ignore
    const success = await window.ipcRenderer.updateProject(activeProject.id, { name });
    if (success) {
      set({ activeProject: { ...activeProject, name } });
    }
  },

  deleteProject: async () => {
    const { activeProject, clearActiveProject } = get();
    if (!activeProject || !window.ipcRenderer) return;

    if (confirm(`¿Estás seguro de que deseas eliminar el proyecto "${activeProject.name}"? Esta acción no se puede deshacer.`)) {
      // @ts-ignore
      const success = await window.ipcRenderer.deleteProject(activeProject.id);
      if (success) {
        clearActiveProject();
      }
    }
  }
}))
