import * as React from 'react'
import { useStore } from './store/useStore'
import './styles/resolve-theme.css'
import { PreviewPlayer } from './remotion/PreviewPlayer'
import { HomeMenu } from './components/HomeMenu'
import { ProjectConfigPanel } from './components/ProjectConfigPanel'
import { AspectRatioSelector } from './components/AspectRatioSelector'
import { InspectorTabs } from './components/InspectorTabs'
import { RenderStatusPanel } from './components/RenderStatusPanel'
import { ChevronLeft, Puzzle, Save, Play, Info } from 'lucide-react'
import { APP_VERSION } from './version'

class InspectorErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; errorMsg: string }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, errorMsg: '' };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorMsg: error.message };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '16px', color: '#ef4444', fontSize: '11px', fontFamily: 'var(--font-mono)', border: '1px solid #ef4444', borderRadius: '4px', margin: '12px', background: 'rgba(239,68,68,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Info size={14} />
            <strong>ERROR EN INSPECTOR</strong>
          </div>
          <p style={{ margin: 0, opacity: 0.8 }}>{this.state.errorMsg}</p>
          <p style={{ opacity: 0.6, marginTop: '8px', fontSize: '10px' }}>Revisa el manifest.json del plugin activo.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const activeProject = useStore(state => state.activeProject)
  const activePlugin = useStore(state => state.activePlugin)
  const activePluginFiles = useStore(state => state.activePluginFiles)
  const properties = useStore(state => state.properties)
  const setProperties = useStore(state => state.setProperties)
  const saveProjectState = useStore(state => state.saveProjectState)
  const renderState = useStore(state => state.renderState)
  const renderProgress = useStore(state => state.renderProgress)
  const renderError = useStore(state => state.renderError)
  const setRenderState = useStore(state => state.setRenderState)
  const setRenderProgress = useStore(state => state.setRenderProgress)
  const isSaving = useStore(state => state.isSaving)
  const lastSaved = useStore(state => state.lastSaved)
  const clearActiveProject = useStore(state => state.clearActiveProject)

  const uiState = useStore(state => state.uiState)

  const handleRatioSelect = (ratio: string) => {
    const updateProjectConfig = useStore.getState().updateProjectConfig;
    if (ratio === '16:9') updateProjectConfig({ width: 1920, height: 1080, aspectRatioMode: ratio });
    else if (ratio === '9:16') updateProjectConfig({ width: 1080, height: 1920, aspectRatioMode: ratio });
    else if (ratio === '1:1') updateProjectConfig({ width: 1080, height: 1080, aspectRatioMode: ratio });
    else if (ratio === '4:3') updateProjectConfig({ width: 1440, height: 1080, aspectRatioMode: ratio });
    else if (ratio === '21:9') updateProjectConfig({ width: 2520, height: 1080, aspectRatioMode: ratio });
    else updateProjectConfig({ aspectRatioMode: ratio }); // Para 'custom' u otros
  };

  React.useEffect(() => {
    if (window.ipcRenderer) {
      window.ipcRenderer.on('render-progress', (progress: number) => {
        setRenderProgress(progress)
      })
    }
  }, [setRenderProgress])

  React.useEffect(() => {
    if (!activeProject || !window.ipcRenderer) return
    const timer = setTimeout(() => {
      saveProjectState()
    }, 1000)
    return () => clearTimeout(timer)
  }, [properties, activeProject?.width, activeProject?.height, activeProject?.fps, activeProject?.durationInFrames, activeProject?.aspectRatioMode, saveProjectState])

  const outputPath = useStore(state => state.outputPath)

  const handleVideoDrag = (e: React.DragEvent) => {
    e.preventDefault();
    if (renderState === 'DONE' && outputPath) {
      window.ipcRenderer.startDrag(outputPath);
    }
  };

  if (!activeProject) {
    return <HomeMenu />
  }

  const handleFieldChange = (id: string, value: any) => {
    setProperties({ [id]: value })

    // Sincronizar dimensiones con el proyecto si cambian en el inspector
    const updateProjectConfig = useStore.getState().updateProjectConfig;
    const numVal = Number(value);

    if (!isNaN(numVal) && numVal > 0) {
      if (id === 'resolutionWidth' || id === 'width') {
        updateProjectConfig({ width: numVal });
      }
      if (id === 'resolutionHeight' || id === 'height') {
        updateProjectConfig({ height: numVal });
      }
    }
  }

  const handleRenderReal = async () => {
    if (!window.ipcRenderer) {
      console.warn('[DVGE] IPC no disponible para renderizar');
      return;
    }

    if (!activePluginFiles) {
      setRenderState('ERROR', 'No hay archivos de plugin cargados para renderizar.');
      return;
    }

    setRenderState('RENDERING')
    setRenderProgress(0)

    try {
      const result = await window.ipcRenderer.renderProject({
        _projectId: activeProject.id,
        pluginId: activeProject.pluginId,
        properties: properties,
        files: activePluginFiles,
        // Enviar config real del proyecto
        _renderWidth: activeProject.width || 1920,
        _renderHeight: activeProject.height || 1080,
        _renderFps: activeProject.fps || 60,
        _renderDuration: activeProject.durationInFrames || 240
      })

      if (result.success) {
        setRenderState('DONE', undefined, result.path)
      } else {
        setRenderState('ERROR', result.error)
      }
    } catch (e: any) {
      setRenderState('ERROR', e.message)
    }
  }



  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-primary)' }}>
      {/* TopBar (Fija) */}
      <div style={{
        height: '40px',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px',
        justifyContent: 'space-between',
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button
            className="btn-icon"
            onClick={clearActiveProject}
            title="Volver a la galería de proyectos"
          >
            <ChevronLeft size={18} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'white', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: '"Roboto Mono", monospace', textTransform: 'uppercase' }}>
              {activeProject.name}
            </span>
            <span className="dv-badge" style={{ background: 'var(--accent)', color: 'white', border: 'none' }}>v{APP_VERSION} GA</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '4px' }}>
          <button className="tab-btn active" style={{ padding: '6px 12px', height: 'auto' }}>Studio</button>
          <button disabled className="tab-btn disabled" style={{ padding: '6px 12px', height: 'auto' }} title="Disponible en próximas versiones">Library</button>
          <button disabled className="tab-btn disabled" style={{ padding: '6px 12px', height: 'auto' }} title="Disponible en próximas versiones">Render</button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}></div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar (Inspector) */}
        <div style={{
          width: '320px',
          background: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 50
        }}>
          {/* Global Config Panel */}
          <ProjectConfigPanel />

          {/* Plugin Identity Badge */}
          <div style={{
            height: '40px',
            padding: '0 12px',
            background: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <div style={{ padding: '6px', background: 'var(--bg-elevated)', borderRadius: '4px', border: '1px solid var(--border)' }}>
              <Puzzle size={14} color="var(--accent)" />
            </div>
            <div>
              <div style={{ fontSize: '9px', color: 'var(--text-label)', textTransform: 'uppercase', fontWeight: 700 }}>Template Activo</div>
              <div style={{ fontSize: '12px', color: 'white', fontWeight: 500 }}>{activePlugin?.manifest.name || 'Sin plugin'}</div>
            </div>
          </div>

          {/* Dynamic Inspector Tabs */}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <InspectorErrorBoundary>
              {activePlugin && (
                <InspectorTabs
                  schema={activePlugin.manifest.schema || []}
                  properties={properties}
                  onChange={handleFieldChange}
                />
              )}
            </InspectorErrorBoundary>
          </div>

          {/* Action Footer (Fijo) */}
          <div style={{ padding: '15px', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-label)' }}>
                {lastSaved ? `Guardado: ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Auto-guardado activo'}
              </span>
              <button
                className="btn-icon"
                onClick={() => saveProjectState()}
                disabled={isSaving}
                title="Forzar guardado ahora"
              >
                <Save size={14} color={isSaving ? 'var(--text-disabled)' : 'var(--text-secondary)'} />
              </button>
            </div>

            <button
              className="dv-btn cta"
              disabled={renderState === 'RENDERING'}
              onClick={handleRenderReal}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              {renderState === 'RENDERING' ? (
                'RENDERIZANDO...'
              ) : (
                <>
                  <Play size={14} fill="currentColor" />
                  RENDERIZAR VIDEO
                </>
              )}
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)', overflow: 'hidden' }}>

          {/* Preview Panel Container */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg-elevated)' }}>

            {/* Panel Header (Toolbar) */}
            <div style={{
              height: '40px',
              padding: '0 20px',
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(0,0,0,0.2)',
              borderBottom: '1px solid var(--border)',
              gap: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Preview</span>
              </div>

              {/* Condensed Info Display */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '10px', color: 'var(--text-disabled)', marginLeft: 'auto', background: 'rgba(0,0,0,0.2)', padding: '4px 12px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{activeProject.width || 1920}×{activeProject.height || 1080}</span>
                </div>
                <span style={{ width: '1px', height: '10px', background: 'var(--border)' }} />
                <span>{activeProject.fps || 60} FPS</span>
                <span style={{ width: '1px', height: '10px', background: 'var(--border)' }} />
                <span>{activeProject.durationInFrames || 240}f</span>
                <span style={{ width: '1px', height: '10px', background: 'var(--border)' }} />
                <span style={{ color: 'var(--accent)', fontWeight: 600 }}>
                  {((activeProject.durationInFrames || 240) / (activeProject.fps || 60)).toFixed(1)}s
                </span>
                <span style={{ width: '1px', height: '10px', background: 'var(--border)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}>
                  <span style={{ fontSize: '8px', opacity: 0.6 }}>EST.</span>
                  <span style={{ fontWeight: 600 }}>
                    {(((activeProject.durationInFrames || 240) / (activeProject.fps || 60)) * ((activeProject.width || 1920) * (activeProject.height || 1080) * 0.0000012)).toFixed(1)} MB
                  </span>
                </div>
              </div>

              <AspectRatioSelector selected={uiState.aspectRatioMode} onSelect={handleRatioSelect} />
            </div>

            {/* Preview Viewport - High Visibility Area */}
            <div style={{
              flex: 1,
              padding: '40px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              position: 'relative',
              background: '#0a0a0a'
            }}>
              <div style={{
                flex: 1,
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                minHeight: 0
              }}>
                {activePluginFiles ? (
                  <PreviewPlayer key={activeProject.id} />
                ) : (
                  <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-disabled)', fontSize: '12px' }}>Cargando player...</div>
                )}
              </div>

              {/* Render Status Overlay */}
              <div style={{ width: '100%', maxWidth: '800px', marginTop: '10px' }}>

                <RenderStatusPanel
                  renderState={renderState}
                  renderProgress={renderProgress}
                  renderError={renderError}
                  onOpenFolder={() => window.ipcRenderer.openProjectFolder(activeProject.id)}
                  onDragStart={handleVideoDrag}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div >
  )
}
