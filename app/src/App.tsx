import * as React from 'react'
import { useStore } from './store/useStore'
import './styles/resolve-theme.css'
import { PreviewPlayer } from './remotion/PreviewPlayer'
import { HomeMenu } from './components/HomeMenu'

export default function App() {
  const { 
    activeProject,
    activePluginFiles,
    properties, 
    setProperties, 
    saveProjectState,
    renderState, 
    renderProgress, 
    renderError,
    outputPath, 
    setRenderState, 
    setRenderProgress,
    isSaving,
    lastSaved
  } = useStore()

  // Auditoría: Eliminado el setActivePlugin inicial para permitir el Home Menu
  React.useEffect(() => {
    if (window.ipcRenderer) {
      window.ipcRenderer.on('render-progress', (progress: number) => {
        setRenderProgress(progress)
      })
    }
  }, [setRenderProgress])

  // Autosave para propiedades (Debounce 500ms)
  React.useEffect(() => {
    if (!activeProject || !window.ipcRenderer) return
    const timer = setTimeout(() => {
      saveProjectState()
    }, 500)
    return () => clearTimeout(timer)
  }, [properties, activeProject, saveProjectState])

  const handleRenderReal = async () => {
    if (!window.ipcRenderer) {
      alert("❌ IPC no disponible. ¿Estás corriendo el navegador en vez de Electron?")
      return
    }

    setRenderState('RENDERING')
    setRenderProgress(0)

    try {
      const result = await window.ipcRenderer.invoke('start-render', { ...properties, _projectId: activeProject.id })
      if (result.success) {
        setRenderState('DONE', undefined, result.path)
      } else {
        setRenderState('ERROR', result.error)
      }
    } catch (err) {
      setRenderState('ERROR', String(err))
    }
  }

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (outputPath && window.ipcRenderer) {
      window.ipcRenderer.startDrag(outputPath)
    }
  }

  // VISTA PRINCIPAL
  if (!activeProject) {
    return <HomeMenu />
  }

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
      
      {/* Sidebar Formulario */}
      <div style={{ width: '320px', borderRight: '1px solid var(--border)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)', cursor: 'pointer' }} onClick={() => window.location.reload()}>
            ← Volver a Proyectos
          </h3>
          <span style={{ fontSize: '12px', color: '#E44C30' }}>{activeProject.name}</span>
        </div>
        
        {activeProject && (
          <>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-label)' }}>Título</label>
              <input 
                className="dv-input" 
                value={properties.title || ''} 
                onChange={(e) => setProperties({ title: e.target.value })}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-label)' }}>Subtítulo</label>
              <input 
                className="dv-input" 
                value={properties.subtitle || ''} 
                onChange={(e) => setProperties({ subtitle: e.target.value })}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-label)' }}>Color Principal</label>
              <input 
                type="color"
                className="dv-input" 
                style={{ padding: '0', height: '32px' }}
                value={properties.barColor || '#E44C30'} 
                onChange={(e) => setProperties({ barColor: e.target.value })}
              />
            </div>

            <div style={{ flex: 1 }} />
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              padding: '10px', 
              fontSize: '12px', 
              color: isSaving ? '#aaa' : 'var(--success)',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '6px',
              fontStyle: 'italic'
            }}>
              {isSaving ? '⏳ Guardando...' : lastSaved ? `✓ Guardado (${lastSaved.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})})` : 'Autoguardado activado'}
            </div>

            <button 
              className="dv-btn"
              disabled={renderState === 'RENDERING'}
              onClick={handleRenderReal}
            >
              {renderState === 'RENDERING' ? `Renderizando... ${Math.round(renderProgress * 100)}%` : '▶ Renderizar'}
            </button>
          </>
        )}
      </div>

      {/* Main Area */}
      <div style={{ flex: 1, padding: '40px', display: 'flex', flexDirection: 'column', gap: '20px', justifyContent: 'center', overflowY: 'auto' }}>
        
          <>
            {activePluginFiles ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                  <PreviewPlayer />
              </div>
            ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Selecciona un plugin para comenzar...
                </div>
            )}

            <div style={{ minHeight: '150px', display: 'flex', flexDirection: 'column' }}>
                {renderState === 'RENDERING' && (
                <div style={{ textAlign: 'center' }}>
                    <h2 style={{ color: 'var(--accent)' }}>Procesando ProRes 4444...</h2>
                    <div style={{ width: '100%', height: '4px', background: 'var(--bg-elevated)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${renderProgress * 100}%`, background: 'var(--accent)', transition: 'width 0.2s' }} />
                    </div>
                </div>
                )}

                {renderState === 'DONE' && (
                <div className="drag-box" draggable onDragStart={handleDragStart}>
                    <div style={{ fontSize: '48px', marginBottom: '10px' }}>🎥</div>
                    <strong style={{ fontSize: '18px', color: 'var(--text-primary)' }}>¡Renderizado Completo!</strong>
                    <p style={{ color: 'var(--success)', fontWeight: 'bold' }}>Arrastra el archivo a tu editor de video o haz clic abajo.</p>
                    
                    <button 
                      className="dv-btn secondary"
                      style={{ width: '100%', marginTop: '10px' }}
                      onClick={() => window.ipcRenderer.openProjectFolder(activeProject.id)}
                    >
                      Abrir Carpeta del Proyecto
                    </button>
                </div>
                )}

                {renderState === 'ERROR' && (
                <div style={{ padding: '20px', background: 'rgba(255,0,0,0.1)', border: '1px solid red', borderRadius: '4px' }}>
                    <strong style={{ color: 'red' }}>Error de Renderizado:</strong>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{renderError || 'Fallo desconocido'}</p>
                </div>
                )}
            </div>
          </>
      </div>
    </div>
  )
}
