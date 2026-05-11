import * as React from 'react'
import { useStore } from './store/useStore'
import { useTranslation } from './i18n/useTranslation'
import './styles/resolve-theme.css'
import { PreviewPlayer } from './remotion/PreviewPlayer'
import { HomeMenu } from './components/HomeMenu'
import { ProjectConfigPanel } from './components/ProjectConfigPanel'
import { AspectRatioSelector } from './components/AspectRatioSelector'
import { InspectorTabs } from './components/InspectorTabs'
import { ArtifactsPanel } from './components/ArtifactsPanel'
import { RenderStatusPanel } from './components/RenderStatusPanel'
import { RenderModal } from './components/RenderModal'
import { Layout, Play, Zap, Info, Puzzle, FileCode, Feather, Save, Layers, ChevronLeft, HelpCircle, X, Plus, Settings2, Scissors, Sparkles } from 'lucide-react'
import { TutorialOverlay, TutorialStep } from './components/TutorialOverlay'
import { APP_VERSION } from './version'
import { TitleBar } from './components/TitleBar'
import { AboutModal } from './components/AboutModal'
import { TelemetryService } from './services/telemetry'
import { TagExtractorService } from './services/TagExtractor'
import { SettingsModal } from './components/SettingsModal'
import { TemplateCodePanel } from './components/TemplateCodePanel'
import { DataGridEditor } from './components/DataGridEditor'
import { WelcomeGuide } from './components/WelcomeGuide'
import { WorkflowModal } from './components/WorkflowModal'
import { StudioGuideReminder } from './components/StudioGuideReminder'
import { UpdateModal } from './components/UpdateModal'
import { VERSION_CODE } from './version'

class InspectorErrorBoundary extends React.Component<
  { children: React.ReactNode; t: (key: any) => string },
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
      const { t } = this.props;
      return (
        <div style={{ padding: '16px', color: '#ef4444', fontSize: '11px', fontFamily: 'var(--font-mono)', border: '1px solid #ef4444', borderRadius: '4px', margin: '12px', background: 'rgba(239,68,68,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Info size={14} />
            <strong>{t('inspector_error')}</strong>
          </div>
          <p style={{ margin: 0, opacity: 0.8 }}>{this.state.errorMsg}</p>
          <p style={{ opacity: 0.6, marginTop: '8px', fontSize: '10px' }}>{t('inspector_error_desc')}</p>
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
  const isSettingsOpen = useStore(state => state.isSettingsOpen)
  const isAboutOpen = useStore(state => state.isAboutOpen)
  const appSettings = useStore(state => state.appSettings)
  const startHomeTutorial = useStore(state => state.startHomeTutorial)
  const setStartHomeTutorial = useStore(state => state.setStartHomeTutorial)

  const uiState = useStore(state => state.uiState)
  const templateTab = useStore(state => state.templateTab)
  const setTemplateTab = useStore(state => state.setTemplateTab)
  const { t, language } = useTranslation()
  const [activeRightTab, setActiveRightTab] = React.useState<'inspector' | 'artifacts'>('inspector');
  const [appIsReady, setAppIsReady] = React.useState(false);
  const [loadingText, setLoadingText] = React.useState(t('loading_engine'));
  const [isBriefModalOpen, setIsBriefModalOpen] = React.useState(false);
  const [isWorkflowModalOpen, setIsWorkflowModalOpen] = React.useState(false);
  const [showTutorial, setShowTutorial] = React.useState(false);
  const [datasetToEdit, setDatasetToEdit] = React.useState<{ id: string, data: string[][] } | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = React.useState(false);
  const [updateInfo, setUpdateInfo] = React.useState<{ url: string, notes: string } | null>(null);

  React.useEffect(() => {
    const checkUpdates = async () => {
      try {
        const res = await fetch('https://gist.githubusercontent.com/Mushi-Ayaka/4fd670d4f78b1764fd24a4d4f7a4fb82/raw/version.json');
        if (!res.ok) return;
        const data = await res.json();
        if (data.versionCode > VERSION_CODE) {
          setUpdateInfo({ url: data.downloadUrl, notes: data.releaseNotes || '' });
          setIsUpdateModalOpen(true);
        }
      } catch (err) {
        console.log('[Updater] Error checking updates:', err);
      }
    };
    setTimeout(checkUpdates, 4000);
  }, []);
  const defaultBrief = "Diseño premium, minimalista y corporativo. Priorizar fluidez visual mediante interpolaciones suaves (lerp) y transiciones sutiles (opacidad/escala). El ritmo de animación debe ser determinista y solemne, atado estrictamente a ctx.timeline. \n\nPROHIBIDO: Uso de colores neón, desenfoques de movimiento excesivos (motion blur), o animaciones con rebotes elásticos (spring) que resten seriedad al gráfico.";

  const [briefText, setBriefText] = React.useState('');

  const studioSteps: TutorialStep[] = React.useMemo(() => [
    {
      title: t('tut_studio_title'),
      content: t('tut_studio_desc'),
      icon: <Zap size={24} color="var(--accent)" fill="var(--accent)" />,
      onEnter: () => useStore.getState().setUiState({ canvasOpen: true })
    },
    {
      title: t('tut_canvas_title'),
      content: t('tut_canvas_desc'),
      selector: ".dv-canvas-config",
      icon: <Layout size={24} color="var(--accent)" />
    },
    {
      title: t('tut_res_title'),
      content: t('tut_res_desc'),
      selector: ".dv-field-resolution",
      icon: <Layout size={24} color="var(--accent)" />
    },
    {
      title: t('tut_duration_title'),
      content: t('tut_duration_desc'),
      selector: ".dv-field-duration",
      icon: <Info size={24} color="var(--accent)" />
    },
    {
      title: t('tut_fps_title'),
      content: t('tut_fps_desc'),
      selector: ".dv-field-fps",
      icon: <Zap size={24} color="var(--accent)" />,
      onEnter: () => useStore.getState().setUiState({ advancedDuration: true })
    },
    {
      title: t('tut_identity_title'),
      content: t('tut_identity_desc'),
      selector: ".dv-template-core",
      icon: <Puzzle size={24} color="var(--accent)" />
    },
    {
      title: t('tut_html_title'),
      content: t('tut_html_desc'),
      selector: ".dv-field-htmlCode",
      icon: <FileCode size={24} color="var(--accent)" />,
      onEnter: () => useStore.getState().setTemplateTab('html')
    },
    {
      title: t('tut_css_title'),
      content: t('tut_css_desc'),
      selector: ".dv-field-cssCode",
      icon: <FileCode size={24} color="var(--accent)" />,
      onEnter: () => useStore.getState().setTemplateTab('html')
    },
    {
      title: t('tut_js_title'),
      content: t('tut_js_desc'),
      selector: ".dv-field-jsCode",
      icon: <FileCode size={24} color="var(--accent)" />,
      onEnter: () => useStore.getState().setTemplateTab('html')
    },
    {
      title: t('tut_ai_builder_title'),
      content: t('tut_ai_builder_desc'),
      selector: ".dv-field-masterRules",
      icon: <Zap size={24} color="var(--accent)" />,
      onEnter: () => useStore.getState().setTemplateTab('html')
    },
    {
      title: t('tut_context_arch_title'),
      content: t('tut_context_arch_desc'),
      selector: ".dv-context-options",
      icon: <Info size={24} color="var(--accent)" />,
      onEnter: () => useStore.getState().setTemplateTab('pdf')
    },
    {
      title: t('tut_visual_grammars_title'),
      content: t('tut_visual_grammars_desc'),
      selector: ".dv-style-presets",
      icon: <Layers size={24} color="var(--accent)" />,
      onEnter: () => useStore.getState().setTemplateTab('pdf')
    },
    {
      title: t('tut_export_rules_title'),
      content: t('tut_export_rules_desc'),
      selector: ".dv-pdf-drag",
      icon: <Puzzle size={24} color="var(--accent)" />,
      onEnter: () => useStore.getState().setTemplateTab('pdf')
    },
    {
      title: t('tut_topbar_title'),
      content: t('tut_topbar_desc'),
      selector: ".dv-top-bar",
      icon: <Info size={24} color="var(--accent)" />,
      onEnter: () => useStore.getState().setTemplateTab('html')
    },
    {
      title: t('tut_preview_title'),
      content: t('tut_preview_desc'),
      selector: ".dv-preview-area",
      icon: <Play size={24} color="var(--accent)" />
    },
    {
      title: t('tut_artifacts_title'),
      content: t('tut_artifacts_desc'),
      selector: ".dv-artifacts-panel",
      icon: <Layers size={24} color="var(--accent)" />,
      onEnter: () => setActiveRightTab('artifacts')
    },
    {
      title: t('tut_explorer_title'),
      content: t('tut_explorer_desc'),
      selector: ".dv-explorer-tab",
      icon: <Info size={24} color="var(--accent)" />,
      onEnter: () => setActiveRightTab('artifacts')
    },
    {
      title: t('tut_add_artifact_title'),
      content: t('tut_add_artifact_desc'),
      selector: ".dv-add-artifact-btn",
      icon: <Plus size={24} color="var(--accent)" />,
      onEnter: () => setActiveRightTab('artifacts')
    },
    {
      title: t('tut_artifact_config_title'),
      content: t('tut_artifact_config_desc'),
      selector: ".dv-artifact-edit-btn",
      icon: <Settings2 size={24} color="var(--accent)" />,
      onEnter: () => setActiveRightTab('artifacts')
    },
    {
      title: t('tut_ai_brain_title'),
      content: t('tut_ai_brain_desc'),
      selector: ".dv-artifact-desc-input",
      icon: <Zap size={24} color="var(--accent)" />,
      onEnter: () => setActiveRightTab('artifacts')
    },
    {
      title: t('tut_precision_tools_title'),
      content: t('tut_precision_tools_desc'),
      selector: ".dv-artifact-item",
      icon: <Scissors size={24} color="var(--accent)" />,
      onEnter: () => setActiveRightTab('artifacts')
    },
    {
      title: t('tut_export_final_title'),
      content: t('tut_export_final_desc'),
      selector: ".dv-render-btn",
      icon: <Play size={24} color="var(--accent)" />
    }
  ], [t]);

  const homeSteps: TutorialStep[] = React.useMemo(() => [
    {
      title: t('tut_home_gallery_title'),
      content: t('tut_home_gallery_desc'),
      selector: ".home-toolbar",
      icon: <Layout size={24} color="var(--accent)" />
    },
    {
      title: t('tut_home_new_title'),
      content: t('tut_home_new_desc'),
      selector: ".dv-new-project-btn",
      icon: <Plus size={24} color="var(--accent)" />
    },
    {
      title: t('tut_home_workflow_title'),
      content: t('tut_home_workflow_desc'),
      selector: ".dv-project-item",
      icon: <Zap size={24} color="var(--accent)" />
    },
    {
      title: t('tut_home_next_title'),
      content: t('tut_home_next_desc'),
      selector: ".home-container",
      icon: <Sparkles size={24} color="var(--accent)" />
    },
  ], [t]);

  React.useEffect(() => {
    if (activeProject && !appSettings.hasSeenStudioGuide) {
      setShowTutorial(true);
      useStore.getState().updateAppSettings({ hasSeenStudioGuide: true });
    }
  }, [activeProject, appSettings.hasSeenStudioGuide]);

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
      setLoadingText(t('verifying_hardware'));
      await new Promise(r => setTimeout(r, 800));
      setLoadingText(t('assembling_modules'));
      await new Promise(r => setTimeout(r, 1200));
      setLoadingText(t('optimizing_pipeline'));
      setLoadingText(t('loading_dependencies'));
      await new Promise(r => setTimeout(r, 500));
      setLoadingText(t('syncing_data'));
      await new Promise(r => setTimeout(r, 600));
      setAppIsReady(true);
    };
    sequence();
  }, [t]);

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
    const { activeProject, appSettings } = useStore.getState();
    if (!activeProject || !window.ipcRenderer || !appSettings.autoSave) return;
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
          <div style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase', letterSpacing: '4px', marginBottom: '8px' }}>{t('loading_dvge')}</div>
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
          <iframe src={`https://ember-motion-studio-landing.vercel.app/${language === 'es' ? 'es/' : ''}`} style={{ width: '100%', height: '100%', border: 'none' }} title={t('manual_dvge')} />
        </div>
      </div>
    );
  }

  if (!activeProject) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-primary)', paddingTop: '32px', boxSizing: 'border-box' }}>
        <TitleBar />
        <AboutModal />
        <SettingsModal />
        <UpdateModal
          isOpen={isUpdateModalOpen}
          releaseNotes={updateInfo?.notes || ''}
          onClose={() => setIsUpdateModalOpen(false)}
          onDownload={async () => {
            if (updateInfo?.url && window.ipcRenderer?.downloadUpdate) {
              const res = await window.ipcRenderer.downloadUpdate(updateInfo.url);
              return res.success ? res.tempPath : undefined;
            }
          }}
          onInstall={(path) => {
            if (window.ipcRenderer?.installUpdate) {
              window.ipcRenderer.installUpdate(path);
            }
          }}
        />
        <HomeMenu />
        <WelcomeGuide />
        {!activeProject && startHomeTutorial && (
          <TutorialOverlay
            onClose={() => setStartHomeTutorial(false)}
            steps={homeSteps}
          />
        )}
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

    if (appSettings.autoSave) saveProjectState();
  }

  const handleSaveDataset = (data: string[][]) => {
    if (datasetToEdit) {
      handleFieldChange(datasetToEdit.id, JSON.stringify(data))
    }
    setDatasetToEdit(null)
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
      <SettingsModal />
      <UpdateModal
        isOpen={isUpdateModalOpen}
        releaseNotes={updateInfo?.notes || ''}
        onClose={() => setIsUpdateModalOpen(false)}
        onDownload={async () => {
          if (updateInfo?.url && window.ipcRenderer?.downloadUpdate) {
            const res = await window.ipcRenderer.downloadUpdate(updateInfo.url);
            return res.success ? res.tempPath : undefined;
          }
        }}
        onInstall={(path) => {
          if (window.ipcRenderer?.installUpdate) {
            window.ipcRenderer.installUpdate(path);
          }
        }}
      />
      <WorkflowModal
        isOpen={isWorkflowModalOpen}
        onClose={() => setIsWorkflowModalOpen(false)}
      />
      <RenderModal onConfirm={handleRenderReal} />
      {showTutorial && (
        <TutorialOverlay
          onClose={() => {
            setShowTutorial(false);
            setIsWorkflowModalOpen(true);
          }}
          steps={studioSteps}
        />
      )}
      <StudioGuideReminder />
      {/* TopBar (Fija) */}
      <div className="dv-top-bar" style={{
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
            title={t('back_to_gallery')}
          >
            <ChevronLeft size={18} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'white', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: '"Roboto Mono", monospace', textTransform: 'uppercase' }}>
              {activeProject.name}
            </span>
            <span className="dv-badge" style={{ background: 'var(--accent)', color: 'white', border: 'none' }}>v{APP_VERSION}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '4px' }}>
          <button className="tab-btn active" style={{ padding: '6px 12px', height: 'auto' }}>{t('studio')}</button>
          <button disabled className="tab-btn disabled" style={{ padding: '6px 12px', height: 'auto' }} title={t('available_soon')}>{t('library')}</button>
          <button disabled className="tab-btn disabled" style={{ padding: '6px 12px', height: 'auto' }} title={t('available_soon')}>{t('render')}</button>
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
            {t('quick_guide_btn')}
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
          <div className="dv-template-core" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
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
                <div style={{ fontSize: '9px', color: 'var(--text-label)', textTransform: 'uppercase', fontWeight: 700 }}>{t('template_core')}</div>
                <div style={{ fontSize: '12px', color: 'white', fontWeight: 500 }}>{activePlugin?.manifest.name || t('missing_plugin')}</div>
              </div>
              <button
                onClick={() => {
                  setBriefText(activeProject?.creativeBrief || defaultBrief);
                  setIsBriefModalOpen(true);
                }}
                title={t('edit_brief_tooltip')}
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
              <InspectorErrorBoundary t={t} key={`left-boundary-${activeProject.id}`}>
                {activePlugin && (
                  <InspectorTabs
                    schema={activePlugin.manifest.schema || []}
                    properties={properties}
                    onChange={handleFieldChange}
                    onOpenDataEditor={(f, data) => setDatasetToEdit({ id: f.id, data })}
                    hideTabs={true}
                  />
                )}
              </InspectorErrorBoundary>
            </div>
          </div>

          {/* Action Footer (Fijo) */}
          <div className="dv-action-footer" style={{ padding: '15px', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-label)' }}>
                {lastSaved
                  ? `${t('saved_at')} ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                  : (appSettings.autoSave ? t('auto_save_active') : t('auto_save_disabled'))}
              </span>
              <button
                className="btn-icon"
                onClick={() => saveProjectState()}
                disabled={isSaving}
                title={t('force_save_tooltip')}
              >
                <Save size={14} color={isSaving ? 'var(--text-disabled)' : 'var(--text-secondary)'} />
              </button>
            </div>

            <button
              className="dv-btn cta dv-render-btn"
              disabled={renderState === 'RENDERING'}
              onClick={toggleRenderModal}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              {renderState === 'RENDERING' ? (
                t('rendering_btn')
              ) : (
                <>
                  <Play size={14} fill="currentColor" />
                  {t('render_video_btn')}
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
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>{t('preview_label')}</span>
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
                  <span style={{ fontSize: '8px', opacity: 0.6 }}>{t('est_size')}</span>
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
                  <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-disabled)', fontSize: '12px' }}>{t('loading_player')}</div>
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
                className="dv-tab-inspector"
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
                className="dv-tab-artifacts"
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
                {t('artifacts')}
              </button>
            </div>

            <div style={{ flex: 1, overflow: 'hidden' }}>
              <InspectorErrorBoundary t={t} key={`right-boundary-${activeProject.id}`}>
                {activeRightTab === 'inspector' ? (
                  (() => {
                    const nativeSchema = activePlugin?.manifest?.schema || [];
                    const finalSchema = [...nativeSchema, ...extractedSchema];

                    // Eliminar duplicados por ID (priorizar extraídos sobre nativos si coinciden)
                    const uniqueMap = new Map();
                    finalSchema.forEach(f => uniqueMap.set(f.id, f));

                    // [v5.9.1] Filtrar campos internos de Studio Master que se manejan en otros paneles
                    const EXCLUDED_IDS = ['masterRules', 'htmlCode', 'cssCode', 'jsCode'];
                    const uniqueSchema = Array.from(uniqueMap.values())
                      .filter(f => !EXCLUDED_IDS.includes(f.id));

                    if (uniqueSchema.length > 0) {
                      return (
                        <InspectorTabs
                          schema={uniqueSchema}
                          properties={properties}
                          onChange={handleFieldChange}
                          hideTabs={true}
                        />
                      );
                    }
                    return (
                      <div style={{ padding: '20px', color: 'var(--text-disabled)', fontSize: '12px', textAlign: 'center', marginTop: '40px' }}>
                        {t('no_tags_found')}
                      </div>
                    );
                  })()
                ) : (
                  <div className="dv-artifacts-panel" style={{ height: '100%' }}>
                    <ArtifactsPanel />
                  </div>
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
                <h2 style={{ margin: 0, fontSize: '16px', color: 'white', fontFamily: 'var(--font-mono)' }}>{t('brief_title')}</h2>
                <div title={t('brief_tooltip')} style={{ color: 'var(--text-disabled)', cursor: 'help', display: 'flex' }}>
                  <HelpCircle size={16} />
                </div>
              </div>
              <button onClick={() => setIsBriefModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-disabled)', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <textarea
              className="dv-input"
              style={{ flex: 1, resize: 'none', height: '150px', fontSize: '13px', lineHeight: '1.6', fontFamily: 'var(--font-body)' }}
              placeholder={t('brief_placeholder')}
              value={briefText}
              onChange={(e) => setBriefText(e.target.value)}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setIsBriefModalOpen(false)} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '4px', color: 'white', cursor: 'pointer', fontSize: '12px' }}>
                {t('cancel')}
              </button>
              <button onClick={saveBrief} className="dv-btn cta" style={{ padding: '8px 16px', fontSize: '12px' }}>
                {t('save_brief')}
              </button>
            </div>
          </div>
        </div>
      )}
      {isSettingsOpen && <SettingsModal />}
      {isAboutOpen && <AboutModal />}

      {datasetToEdit && (
        <DataGridEditor
          initialData={datasetToEdit.data}
          onSave={handleSaveDataset}
          onClose={() => setDatasetToEdit(null)}
        />
      )}

      {/* Modal: AI Context Builder */}
      {templateTab === 'pdf' && (
        <div
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.75)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999,
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setTemplateTab('html'); }}
        >
          <div className="dv-code-modal" style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderTop: '2px solid var(--accent)',
            borderRadius: '2px',
            width: '880px',
            maxWidth: '96vw',
            height: '540px',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(228,76,48,0.08)'
          }}>
            {/* Header del modal */}
            <div style={{
              height: '44px',
              padding: '0 16px',
              background: 'var(--bg-elevated)',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '8px', height: '8px', background: 'var(--accent)', borderRadius: '1px' }} />
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                    {t('context_builder')}
                  </span>
                </div>
                <span style={{ width: '1px', height: '14px', background: 'var(--border)' }} />
                <span style={{ fontSize: '10px', color: 'var(--text-disabled)', fontFamily: 'var(--font-body)' }}>
                  {t('context_builder_desc')}
                </span>
              </div>
              <button
                onClick={() => setTemplateTab('html')}
                title={t('close')}
                style={{
                  background: 'transparent', border: 'none',
                  color: 'var(--text-disabled)', cursor: 'pointer',
                  padding: '4px 6px', display: 'flex', alignItems: 'center',
                  fontSize: '10px', fontWeight: 600, gap: '4px',
                  transition: 'color 0.15s', fontFamily: 'var(--font-mono)'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-disabled)'}
              >
                <X size={14} /> ESC
              </button>
            </div>

            {/* Contenido */}
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <TemplateCodePanel />
            </div>
          </div>
        </div>
      )}

      {/* Onboarding Guide */}
      <WelcomeGuide />
    </div>
  )
}
