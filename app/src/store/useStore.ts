import { create } from 'zustand'
import { DVPlugin, FormField } from '../env'

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
  isAboutOpen: boolean
  toggleAbout: () => void
  isRenderModalOpen: boolean
  toggleRenderModal: () => void

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
  updateProjectConfig: (patch: Partial<{ width: number; height: number; fps: number; durationInFrames: number; aspectRatioMode: string; creativeBrief: string }>) => void

  uiState: { aspectRatioMode: string; advancedDuration: boolean }
  setUiState: (patch: Partial<StoreState['uiState']>) => void
  artifactFields: FormField[]
  addArtifactField: (field: FormField) => void
  removeArtifactField: (id: string) => void
  updateArtifactField: (id: string, patch: Partial<FormField>) => void
  updateProjectName: (name: string) => Promise<void>
  deleteProject: () => Promise<void>
  getProjectContext: () => { name: string; artifacts: any[] }
}

export const useStore = create<StoreState>((set, get) => ({
  activeProject: null,
  activePlugin: null,
  plugins: [],
  activePluginFiles: null,
  properties: {},
  artifactFields: [],
  addArtifactField: (field) => set(state => {
    const nextFields = [...state.artifactFields, field];
    return { 
      artifactFields: nextFields,
      activeProject: state.activeProject ? { ...state.activeProject, artifactFields: nextFields } : null
    };
  }),
  removeArtifactField: (id) => set(state => {
    const nextFields = state.artifactFields.filter(f => f.id !== id);
    return { 
      artifactFields: nextFields,
      activeProject: state.activeProject ? { ...state.activeProject, artifactFields: nextFields } : null
    };
  }),
  updateArtifactField: (id, patch) => set(state => {
    const nextFields = state.artifactFields.map(f => f.id === id ? { ...f, ...patch } : f);
    return {
      artifactFields: nextFields,
      activeProject: state.activeProject ? { ...state.activeProject, artifactFields: nextFields } : null
    };
  }),
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
      const { activeProject } = get()
      
      let activePlugin = null
      if (activeProject) {
        activePlugin = list.find(p => p.manifest.id === activeProject.pluginId) || null
      }

      set({ plugins: list, activePlugin })
    } catch (e) {
      console.error('[Store] Error al inicializar plugins:', e)
    }
  },

  loadProject: async (project) => {
    const { plugins } = get()
    const rawPlugin = plugins.find(p => p.manifest.id === project.pluginId) || null
    
    let activePlugin = rawPlugin;


    set({ 
      activeProject: project, 
      properties: project.properties || {}, 
      artifactFields: project.artifactFields || [],
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

    // [FIX BUG-03/04] Mapeo de campos de sistema: cuando el Inspector cambia
    // fps, resolutionWidth, resolutionHeight o totalDuration, sincronizar
    // activeProject para que PreviewPlayer los refleje inmediatamente.
    const systemFieldMap: Record<string, string> = {
      fps: 'fps',
      resolutionWidth: 'width',
      resolutionHeight: 'height',
      totalDuration: 'durationInFrames',
    };
    const projectPatch: Record<string, number> = {};
    for (const [fieldId, projectKey] of Object.entries(systemFieldMap)) {
      if (props[fieldId] !== undefined) {
        const raw = Number(props[fieldId]);
        if (!isNaN(raw) && raw > 0) {
          // totalDuration viene en segundos → convertir a frames usando fps actual
          if (fieldId === 'totalDuration') {
            const fps = nextProps['fps'] ?? state.activeProject?.fps ?? 60;
            projectPatch[projectKey] = Math.round(raw * fps);
          } else {
            projectPatch[projectKey] = raw;
          }
        }
      }
    }

    const nextProject = state.activeProject 
      ? { ...state.activeProject, ...projectPatch, properties: nextProps, artifactFields: state.artifactFields } 
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
  isAboutOpen: false,
  toggleAbout: () => set((state) => ({ isAboutOpen: !state.isAboutOpen })),
  isRenderModalOpen: false,
  toggleRenderModal: () => set((state) => ({ isRenderModalOpen: !state.isRenderModalOpen })),

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
  },

  getProjectContext: () => {
    const { activeProject, artifactFields } = get();
    return {
      id: activeProject?.id,
      pluginId: activeProject?.pluginId,
      name: activeProject?.name || 'Untitled Project',
      updatedAt: activeProject?.updatedAt,
      width: activeProject?.width,
      height: activeProject?.height,
      fps: activeProject?.fps,
      durationInFrames: activeProject?.durationInFrames,
      creativeBrief: activeProject?.creativeBrief || "Diseño premium, minimalista y corporativo. Priorizar fluidez visual mediante interpolaciones suaves (lerp) y transiciones sutiles (opacidad/escala). El ritmo de animación debe ser determinista y solemne, atado estrictamente a ctx.timeline. \n\nPROHIBIDO: Uso de colores neón, desenfoques de movimiento excesivos (motion blur), o animaciones con rebotes elásticos (spring) que resten seriedad al gráfico.",
      artifacts: artifactFields.map(f => ({
        id: f.id,
        label: f.label,
        type: f.type,
        description: f.description || ''
      }))
    };
  }
}))
