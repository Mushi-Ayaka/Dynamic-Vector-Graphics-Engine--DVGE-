import * as React from 'react'
import { useStore } from './store/useStore'
import './styles/resolve-theme.css'
import { PreviewPlayer } from './remotion/PreviewPlayer'
import { HomeMenu } from './components/HomeMenu'
import { ProjectConfigPanel } from './components/ProjectConfigPanel'
import { AspectRatioSelector } from './components/AspectRatioSelector'
import { InspectorTabs } from './components/InspectorTabs'
import { ArtifactsPanel } from './components/ArtifactsPanel'
import { RenderStatusPanel } from './components/RenderStatusPanel'
import { RenderModal } from './components/RenderModal'
import { ChevronLeft, Puzzle, Save, Play, Info, Feather, HelpCircle, X } from 'lucide-react'
import { TutorialOverlay } from './components/TutorialOverlay'
import { APP_VERSION } from './version'
import { TitleBar } from './components/TitleBar'
import { AboutModal } from './components/AboutModal'
import { TelemetryService } from './services/telemetry'
import { TagExtractorService } from './services/TagExtractor'

class InspectorErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; errorMsg: string }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, errorMsg: '' };
  }
  static getDerivedStateFromError(error: Error) {
    TelemetryService.trackError(error, false);
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
  const toggleRenderModal = useStore(state => state.toggleRenderModal)

  const uiState = useStore(state => state.uiState)
  const [activeRightTab, setActiveRightTab] = React.useState<'inspector' | 'artifacts'>('inspector');
  const [appIsReady, setAppIsReady] = React.useState(false);
  const [loadingText, setLoadingText] = React.useState('Iniciando motor...');
  const [isBriefModalOpen, setIsBriefModalOpen] = React.useState(false);
  const [showTutorial, setShowTutorial] = React.useState(false);

  const defaultBrief = "Diseño premium, minimalista y corporativo. Priorizar fluidez visual mediante interpolaciones suaves (lerp) y transiciones sutiles (opacidad/escala). El ritmo de animación debe ser determinista y solemne, atado estrictamente a ctx.timeline. \n\nPROHIBIDO: Uso de colores neón, desenfoques de movimiento excesivos (motion blur), o animaciones con rebotes elásticos (spring) que resten seriedad al gráfico.";

  const [briefText, setBriefText] = React.useState('');

  const saveBrief = () => {
    useStore.getState().updateProjectConfig({ creativeBrief: briefText });
    setIsBriefModalOpen(false);
  };

  // --- Dynamic Tag Extraction ---
  const extractedSchema = React.useMemo(() => {
    try {
      let allTextContent = '';
      if (activePluginFiles) {
        allTextContent += (activePluginFiles.html || '') + '\n';
        allTextContent += (activePluginFiles.css || '') + '\n';
        allTextContent += (activePluginFiles.js || '') + '\n';
      }
      Object.values(properties).forEach(val => {
        if (typeof val === 'string' && val.length < 50000) {
          allTextContent += val + '\n';
        }
      });
      return TagExtractorService.extractFromString(allTextContent);
    } catch (e) {
      console.error("Error extracting schema:", e);
      return [];
    }
  }, [activePluginFiles, properties]);

  const handleRatioSelect = (ratio: string) => {
    const updateProjectConfig = useStore.getState().updateProjectConfig;
    if (ratio === '16:9') updateProjectConfig({ width: 1920, height: 1080, aspectRatioMode: ratio });
    else if (ratio === '9:16') updateProjectConfig({ width: 1080, height: 1920, aspectRatioMode: ratio });
    else if (ratio === '1:1') updateProjectConfig({ width: 1080, height: 1080, aspectRatioMode: ratio });
    else if (ratio === '4:3') updateProjectConfig({ width: 1440, height: 1080, aspectRatioMode: ratio });
    else if (ratio === '21:9') updateProjectConfig({ width: 2520, height: 1080, aspectRatioMode: ratio });
    else updateProjectConfig({ aspectRatioMode: ratio });
  };

  const handleVideoDrag = (e: React.DragEvent) => {
    e.preventDefault();
    const outputPath = useStore.getState().outputPath;
    if (renderState === 'DONE' && outputPath) {
      window.ipcRenderer.startDrag(outputPath);
    }
  };

  // --- Ciclo de Vida de Carga ---
  React.useEffect(() => {
    const sequence = async () => {
      setLoadingText('Verificando hardware & GPU...');
      await new Promise(r => setTimeout(r, 800));
      setLoadingText('Ensamblando módulos...');
      await new Promise(r => setTimeout(r, 1200));
      setLoadingText('Optimizando pipeline de video...');
      setLoadingText('Cargando dependencias...');
      await new Promise(r => setTimeout(r, 500));
      setLoadingText('Sincronizando datos...');
      await new Promise(r => setTimeout(r, 600));
      setAppIsReady(true);
    };
    sequence();
  }, []);

  React.useEffect(() => {
    if (window.ipcRenderer) {
      window.ipcRenderer.on('render-progress', (progress: number) => {
        setRenderProgress(progress)
      })
    }
    const handleError = (event: ErrorEvent) => {
      TelemetryService.trackError(event.error || new Error(event.message), true);
    };
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, [setRenderProgress]);

  React.useEffect(() => {
    if (!activeProject || !window.ipcRenderer) return;
    const timer = setTimeout(() => {
      saveProjectState()
    }, 1000)
    return () => clearTimeout(timer)
  }, [properties, activeProject?.width, activeProject?.height, activeProject?.fps, activeProject?.durationInFrames, activeProject?.aspectRatioMode, activeProject?.creativeBrief, saveProjectState]);

  // --- Pantalla de Carga Premium ---
  if (!appIsReady) {
    return (
      <div style={{ height: '100vh', background: '#050505', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: '"Roboto", sans-serif' }}>
        <div style={{ position: 'relative', marginBottom: '40px' }}>
          <div style={{ width: '80px', height: '80px', border: '2px solid rgba(228, 76, 48, 0.1)', borderTop: '2px solid #E44C30', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 900, color: '#E44C30', letterSpacing: '2px' }}>DVGE</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '12px' }}>
             <div style={{ width: '100px', height: '1px', background: 'linear-gradient(90deg, transparent, #333, transparent)' }} />
          </div>
          <div style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase', letterSpacing: '4px', marginBottom: '8px' }}>Cargando DVGE</div>
          <div style={{ fontSize: '12px', color: '#aaa', fontWeight: 300, minWidth: '200px', textShadow: '0 0 10px rgba(0,0,0,0.5)' }}>{loadingText}</div>
        </div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const isManualPath = window.location.hash === '#manual';
  if (isManualPath) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#050505' }}>
        <TitleBar />
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative', paddingTop: '32px' }}>
          <iframe src="https://mushi-ayaka.github.io/DVGE-Docs/" style={{ width: '100%', height: '100%', border: 'none' }} title="Manual DVGE" />
        </div>
      </div>
    );
  }

  if (!activeProject) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-primary)', paddingTop: '32px', boxSizing: 'border-box' }}>
        <TitleBar />
        <AboutModal />
        <HomeMenu />
      </div>
    )
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



  const handleRenderReal = async (selectedCodec: string = 'prores') => {
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
    TelemetryService.trackFeatureUse('render_video');

    try {
      const result = await window.ipcRenderer.renderProject({
        _projectId: activeProject.id,
        pluginId: activeProject.pluginId,
        properties: properties,
        files: activePluginFiles,
        _codec: selectedCodec,
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-primary)', paddingTop: '32px', boxSizing: 'border-box' }}>
      <TitleBar />
      <AboutModal />
      <RenderModal onConfirm={handleRenderReal} />
      {showTutorial && <TutorialOverlay onClose={() => setShowTutorial(false)} />}
      {/* TopBar (Fija) */}
      <div style={{
        height: '40px',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px',
        justifyContent: 'space-between',
        zIndex: 200
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setShowTutorial(true)}
            style={{
              background: 'transparent',
              border: '1px solid var(--accent)',
              color: 'var(--accent)',
              padding: '4px 12px',
              borderRadius: '0px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '10px',
              fontWeight: 800,
              cursor: 'pointer',
              marginRight: '8px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              transition: 'all 0.2s'
            }}
            className="dv-guide-btn"
          >
            GUÍA RÁPIDA
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Column (Global Settings) */}
        <div className="dv-left-panel" style={{
          width: '280px',
          background: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 10
        }}>
          {/* Global Config Panel */}
          <ProjectConfigPanel />

          {/* Template Panel (Código / PDF) */}
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{
              height: '40px',
              padding: '0 12px',
              background: 'var(--bg-surface)',
              borderTop: '1px solid var(--border)',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <div style={{ padding: '6px', background: 'var(--bg-elevated)', borderRadius: '4px', border: '1px solid var(--border)' }}>
                <Puzzle size={14} color="var(--accent)" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '9px', color: 'var(--text-label)', textTransform: 'uppercase', fontWeight: 700 }}>Template Core</div>
                <div style={{ fontSize: '12px', color: 'white', fontWeight: 500 }}>{activePlugin?.manifest.name || 'Sin plugin'}</div>
              </div>
              <button
                onClick={() => {
                  setBriefText(activeProject?.creativeBrief || defaultBrief);
                  setIsBriefModalOpen(true);
                }}
                title="Editar Brief Creativo"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: activeProject?.creativeBrief ? 'var(--accent)' : 'var(--text-disabled)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'color 0.2s'
                }}
              >
                <Feather size={16} />
              </button>
            </div>

            <div style={{ flex: 1, overflow: 'hidden' }}>
              <InspectorErrorBoundary>
                {activePlugin && (
                  <InspectorTabs
                    schema={activePlugin.manifest.schema || []}
                    properties={properties}
                    onChange={handleFieldChange}
                    hideTabs={true}
                  />
                )}
              </InspectorErrorBoundary>
            </div>
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
              onClick={toggleRenderModal}
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
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)', overflow: 'hidden', minWidth: '500px' }}>

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
                    {(() => {
                      const codec = activeProject.preferredCodec || 'prores';
                      const multipliers: Record<string, number> = {
                        'prores': 0.0988,
                        'standard': 0.0368,
                        'h264': 0.002,
                        'webm': 0.004,
                        'gif': 0.0022
                      };
                      const multiplier = multipliers[codec] || 0.5;
                      const width = activeProject.width || 1920;
                      const height = activeProject.height || 1080;
                      const frames = activeProject.durationInFrames || 240;
                      return ((width * height * frames * multiplier) / (1024 * 1024)).toFixed(1);
                    })()} MB
                  </span>
                </div>
              </div>

              <AspectRatioSelector selected={uiState.aspectRatioMode} onSelect={handleRatioSelect} />
            </div>

            {/* Preview Viewport - High Visibility Area */}
            <div className="dv-preview-area" style={{
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

        {/* Right Column (New Dynamic Inspector) */}
        {activePlugin && (
          <div className="dv-right-panel" style={{
            width: '320px',
            background: 'var(--bg-secondary)',
            borderLeft: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 10
          }}>
            <div style={{
              height: '40px',
              padding: '0 8px',
              background: 'var(--bg-surface)',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <button
                onClick={() => setActiveRightTab('inspector')}
                style={{
                  flex: 1,
                  height: '28px',
                  border: 'none',
                  background: activeRightTab === 'inspector' ? 'var(--bg-elevated)' : 'transparent',
                  color: activeRightTab === 'inspector' ? 'var(--accent)' : 'var(--text-disabled)',
                  fontSize: '10px',
                  fontWeight: 700,
                  borderRadius: '4px',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  transition: 'all 0.2s'
                }}
              >
                Inspector
              </button>
              <button
                onClick={() => setActiveRightTab('artifacts')}
                style={{
                  flex: 1,
                  height: '28px',
                  border: 'none',
                  background: activeRightTab === 'artifacts' ? 'var(--bg-elevated)' : 'transparent',
                  color: activeRightTab === 'artifacts' ? 'var(--accent)' : 'var(--text-disabled)',
                  fontSize: '10px',
                  fontWeight: 700,
                  borderRadius: '4px',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  transition: 'all 0.2s'
                }}
              >
                Artefactos
              </button>
            </div>

            <div style={{ flex: 1, overflow: 'hidden' }}>
              <InspectorErrorBoundary>
                {activeRightTab === 'inspector' ? (
                  extractedSchema.length > 0 ? (
                    <InspectorTabs
                      schema={extractedSchema}
                      properties={properties}
                      onChange={handleFieldChange}
                      hideTabs={true}
                    />
                  ) : (
                    <div style={{ padding: '20px', color: 'var(--text-disabled)', fontSize: '12px', textAlign: 'center', marginTop: '40px' }}>
                      No se encontraron tags /* @dv-field */ en el código de la plantilla.
                    </div>
                  )
                ) : (
                  <ArtifactsPanel />
                )}
              </InspectorErrorBoundary>
            </div>
          </div>
        )}
      </div>
      {/* Render overlay o ventanas flotantes aquí */}
      {isBriefModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          <div style={{
            background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', width: '500px', maxWidth: '90%', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Feather size={20} color="var(--accent)" />
                <h2 style={{ margin: 0, fontSize: '16px', color: 'white', fontFamily: 'var(--font-mono)' }}>Brief Creativo</h2>
                <div title="Define la intención creativa, el tono visual y las restricciones estéticas para guiar a la IA. La última oración debe definir qué está PROHIBIDO." style={{ color: 'var(--text-disabled)', cursor: 'help', display: 'flex' }}>
                  <HelpCircle size={16} />
                </div>
              </div>
              <button onClick={() => setIsBriefModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-disabled)', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <textarea
              value={briefText}
              onChange={(e) => setBriefText(e.target.value)}
              placeholder="Ej. Diseño minimalista corporativo. Priorizar fluidez suave. PROHIBIDO el uso de colores neón y rebotes elásticos."
              style={{
                width: '100%', height: '150px', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '6px', padding: '12px', color: 'white', fontFamily: 'var(--font-body)', fontSize: '13px', resize: 'vertical', outline: 'none', boxSizing: 'border-box'
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setIsBriefModalOpen(false)} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '4px', color: 'white', cursor: 'pointer', fontSize: '12px' }}>
                Cancelar
              </button>
              <button onClick={saveBrief} className="dv-btn cta" style={{ padding: '8px 16px', fontSize: '12px' }}>
                Guardar Brief
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
