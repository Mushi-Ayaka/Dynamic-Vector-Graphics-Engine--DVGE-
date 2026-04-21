import * as React from 'react'
import { useStore, FormField } from './store/useStore'
import './styles/resolve-theme.css'
import { PreviewPlayer } from './remotion/PreviewPlayer'
import { HomeMenu } from './components/HomeMenu'

// --- Componente: Campo de Formulario Dinámico ---
const DynamicField: React.FC<{ field: FormField; value: any; onChange: (id: string, val: any) => void }> = ({ field, value, onChange }) => {
  const labelStyle: React.CSSProperties = { fontSize: '12px', color: 'var(--text-label)', marginBottom: '4px', display: 'block' }

  switch (field.type) {
    case 'color':
      return (
        <div>
          <label style={labelStyle}>{field.label}</label>
          <input
            type="color"
            className="dv-input"
            style={{ padding: '0', height: '32px' }}
            value={value ?? field.defaultValue}
            onChange={(e) => onChange(field.id, e.target.value)}
          />
        </div>
      )
    case 'number':
      return (
        <div>
          <label style={labelStyle}>{field.label}</label>
          <input
            type="number"
            className="dv-input"
            value={value ?? field.defaultValue}
            onChange={(e) => onChange(field.id, parseFloat(e.target.value) || 0)}
          />
        </div>
      )
    case 'image':
      return (
        <div>
          <label style={labelStyle}>{field.label}</label>
          <input
            type="text"
            className="dv-input"
            placeholder="Ruta o URL de imagen..."
            value={value ?? field.defaultValue}
            onChange={(e) => onChange(field.id, e.target.value)}
          />
        </div>
      )
    default: // 'string'
      return (
        <div>
          <label style={labelStyle}>{field.label}</label>
          <input
            className="dv-input"
            value={value ?? field.defaultValue}
            onChange={(e) => onChange(field.id, e.target.value)}
          />
        </div>
      )
  }
}

export default function App() {
  const {
    activeProject,
    activePlugin,
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

  React.useEffect(() => {
    if (window.ipcRenderer) {
      window.ipcRenderer.on('render-progress', (progress: number) => {
        setRenderProgress(progress)
      })
    }
  }, [setRenderProgress])

  // Autosave con Debounce 500ms
  React.useEffect(() => {
    if (!activeProject || !window.ipcRenderer) return
    const timer = setTimeout(() => {
      saveProjectState()
    }, 500)
    return () => clearTimeout(timer)
  }, [properties, activeProject, saveProjectState])

  const handleRenderReal = async () => {
    if (!window.ipcRenderer) {
      alert('❌ IPC no disponible. ¿Estás corriendo el navegador en vez de Electron?')
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

  const handleFieldChange = (id: string, val: any) => {
    setProperties({ [id]: val })
  }

  // VISTA: Home (Sin proyecto activo)
  if (!activeProject) {
    return <HomeMenu />
  }

  // Schema del plugin activo (fuente de verdad para el formulario)
  const schema = activePlugin?.manifest?.schema ?? []

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>

      {/* Sidebar: Formulario Dinámico */}
      <div style={{ width: '320px', borderRight: '1px solid var(--border)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)', cursor: 'pointer' }} onClick={() => window.location.reload()}>
            ← Volver a Proyectos
          </h3>
          <span style={{ fontSize: '12px', color: '#E44C30' }}>{activeProject.name}</span>
        </div>

        {/* Plugin Badge */}
        {activePlugin && (
          <div style={{ padding: '8px 12px', background: 'rgba(228,76,48,0.08)', border: '1px solid rgba(228,76,48,0.2)', borderRadius: '6px', fontSize: '11px', color: 'var(--text-secondary)' }}>
            <span style={{ color: '#E44C30', fontWeight: 600 }}>Plugin:</span> {activePlugin.manifest.name} <span style={{ opacity: 0.5 }}>v{activePlugin.manifest.version}</span>
          </div>
        )}

        {/* Campos Generados Dinámicamente desde el Schema */}
        {schema.length > 0 ? (
          schema.map((field) => (
            <DynamicField
              key={field.id}
              field={field}
              value={properties[field.id]}
              onChange={handleFieldChange}
            />
          ))
        ) : (
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', padding: '20px 0' }}>
            Este plugin no tiene propiedades configurables.
          </div>
        )}

        <div style={{ flex: 1 }} />

        {/* Indicador de Autoguardado */}
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
          {isSaving ? '⏳ Guardando...' : lastSaved ? `✓ Guardado (${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})` : 'Autoguardado activado'}
        </div>

        <button
          className="dv-btn"
          disabled={renderState === 'RENDERING'}
          onClick={handleRenderReal}
        >
          {renderState === 'RENDERING' ? `Renderizando... ${Math.round(renderProgress * 100)}%` : '▶ Renderizar'}
        </button>
      </div>

      {/* Main: Preview + Estado de Render */}
      <div style={{ flex: 1, padding: '40px', display: 'flex', flexDirection: 'column', gap: '20px', justifyContent: 'center', overflowY: 'auto' }}>
        <>
          {activePluginFiles ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
              {/*
                ⚡ KEY basada en el ID del proyecto: obliga a React a destruir
                y recrear el PreviewPlayer al cambiar de proyecto. Esto garantiza
                el "Hard Reset" del Shadow DOM y el Bridge de Remotion.
              */}
              <PreviewPlayer key={activeProject.id} />
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
