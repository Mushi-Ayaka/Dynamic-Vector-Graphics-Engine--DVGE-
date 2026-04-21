import { create } from 'zustand'

// --- Tipos del Ecosistema de Plugins ---
export type FormField =
  | { type: 'string'; id: string; label: string; defaultValue: string }
  | { type: 'color'; id: string; label: string; defaultValue: string }
  | { type: 'number'; id: string; label: string; defaultValue: number }
  | { type: 'image'; id: string; label: string; defaultValue: string }

export interface PluginManifest {
  id: string
  name: string
  description: string
  version: string
  schema: FormField[]
}

export interface DVPlugin {
  manifest: PluginManifest
  folderPath: string
  hasCss: boolean
  hasJs: boolean
}

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
  activePlugin: null,
  plugins: [],
  activePluginFiles: null,
  properties: {},
  isSaving: false,
  lastSaved: null,

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
    // Buscar el plugin correspondiente al proyecto en la lista ya cargada
    const activePlugin = plugins.find(p => p.manifest.id === project.pluginId) || null
    set({ activeProject: project, properties: project.properties || {}, activePlugin })
    try {
      const files = await window.ipcRenderer.getPluginFiles(project.pluginId)
      set({ activePluginFiles: files })
    } catch (e) {
      console.error('[Store] Error al cargar archivos del plugin:', e)
    }
  },

  saveProjectState: async () => {
    const { activeProject, properties } = get()
    if (!activeProject || !window.ipcRenderer) return
    set({ isSaving: true })
    await window.ipcRenderer.saveProjectProps(activeProject.id, properties)
    set({ isSaving: false, lastSaved: new Date() })
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
