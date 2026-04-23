import * as React from 'react'
import { useStore } from './store/useStore'
import { FormField } from './env'
import './styles/resolve-theme.css'
import { PreviewPlayer } from './remotion/PreviewPlayer'
import { HomeMenu } from './components/HomeMenu'

// [v4.0] Tarea 2.2: Error Boundary para prevenir pantalla blanca por manifiestos corruptos
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
        <div style={{ padding: '16px', color: '#E44C30', fontSize: '12px', fontFamily: 'monospace', border: '1px solid #E44C30', borderRadius: '6px', margin: '8px' }}>
          <strong>⚠ Error en Inspector</strong>
          <p style={{ marginTop: '4px', opacity: 0.8 }}>{this.state.errorMsg}</p>
          <p style={{ opacity: 0.6, marginTop: '4px' }}>Revisa el manifest.json del plugin.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

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
    case 'code':
      return (
        <div>
          <label style={labelStyle}>{field.label}</label>
          <textarea
            className="dv-input"
            style={{ 
                fontFamily: 'monospace', 
                height: '160px', 
                resize: 'vertical',
                fontSize: '11px',
                lineHeight: '1.4',
                background: '#0d0d0d'
            }}
            value={value ?? field.defaultValue}
            onChange={(e) => onChange(field.id, e.target.value)}
          />
        </div>
      )
    case 'info':
      return (
        <div style={{ marginBottom: '10px' }}>
          <label style={labelStyle}>{field.label}</label>
          <div style={{ position: 'relative' }}>
            <textarea
              readOnly
              className="dv-input"
              style={{ 
                  fontFamily: 'monospace', 
                  height: '100px', 
                  fontSize: '10px',
                  background: 'rgba(228,76,48,0.05)',
                  border: '1px solid rgba(228,76,48,0.2)',
                  color: '#aaa',
                  cursor: 'default'
              }}
              value={field.defaultValue}
            />
            <button 
              onClick={() => {
                navigator.clipboard.writeText(String(field.defaultValue));
                alert('¡Copiado al portapapeles!');
              }}
              style={{
                position: 'absolute',
                top: '5px',
                right: '5px',
                padding: '2px 8px',
                fontSize: '9px',
                background: 'var(--accent)',
                border: 'none',
                borderRadius: '3px',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              COPIAR
            </button>
          </div>
        </div>
      )
    case 'select':
      return (
        <div style={{ marginBottom: '10px' }}>
          <label style={labelStyle}>{field.label}</label>
          <select
            className="dv-input"
            style={{ padding: '5px' }}
            value={value ?? field.defaultValue}
            onChange={(e) => onChange(field.id, e.target.value)}
          >
            {field.options?.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
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
      alert('IPC no disponible. ¿Estás corriendo el navegador en vez de Electron?')
      return
    }

    if (!activePluginFiles) {
      alert('Error: No hay archivos de plugin cargados.')
      return
    }

    setRenderState('RENDERING')
    setRenderProgress(0)
    
    try {
      // [v4.1.5] Render Protocol v4: Sincronización Total de Specs
      const renderPayload = {
        ...properties,
        _projectId: activeProject.id,
        // Inyectamos archivos fuente directamente (Fix: Render Huérfano)
        activePluginFiles: activePluginFiles,
        // Especificaciones dinámicas del proyecto (Fix: Hardcoded Specs)
        _renderWidth: activeProject.width || 1920,
        _renderHeight: activeProject.height || 1080,
        _renderFps: activeProject.fps || 60,
        _renderDuration: activeProject.durationInFrames || 240
      }

      const result = await window.ipcRenderer.invoke('start-render', renderPayload)
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
          <span style={{ fontSize: '12px', color: '#E44C30', fontWeight: 'bold' }}>v5.0.0 GA // {activeProject.name}</span>
        </div>

        {/* Plugin Badge */}
        {activePlugin && (
          <div style={{ padding: '8px 12px', background: 'rgba(228,76,48,0.08)', border: '1px solid rgba(228,76,48,0.2)', borderRadius: '6px', fontSize: '11px', color: 'var(--text-secondary)' }}>
            <span style={{ color: '#E44C30', fontWeight: 600 }}>Plugin:</span> {activePlugin.manifest.name} <span style={{ opacity: 0.5 }}>v{activePlugin.manifest.version}</span>
          </div>
        )}

        {/* [v4.0] Campos dinámicos protegidos por Error Boundary */}
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '10px', margin: '0 -10px', paddingLeft: '10px' }} className="dv-scroll-area">
          <InspectorErrorBoundary>
            {(() => {
              const safeSchema = Array.isArray(schema) ? schema : [];
              if (safeSchema.length === 0) {
                return (
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', padding: '20px 0' }}>
                    Este plugin no tiene propiedades configurables.
                  </div>
                );
              }

              const groups: Record<string, FormField[]> = {};
              safeSchema.forEach(field => {
                const groupName = (field as any).group || 'General';
                if (!groups[groupName]) groups[groupName] = [];
                groups[groupName].push(field);
              });

              return Object.entries(groups).map(([groupName, fields]) => (
                <details key={groupName} open style={{ marginBottom: '10px', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px', overflow: 'hidden', background: 'rgba(255,255,255,0.02)' }}>
                  <summary style={{ 
                    padding: '10px', 
                    background: 'rgba(255,255,255,0.04)', 
                    cursor: 'pointer', 
                    fontSize: '11px', 
                    fontWeight: 'bold', 
                    color: '#E44C30',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    userSelect: 'none',
                    borderBottom: '1px solid rgba(255,255,255,0.05)'
                  }}>
                    {groupName}
                  </summary>
                  <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(0,0,0,0.1)' }}>
                    {fields.map(field => (
                      <DynamicField
                        key={field.id}
                        field={field}
                        value={properties[field.id]}
                        onChange={handleFieldChange}
                      />
                    ))}
                  </div>
                </details>
              ));
            })()}
          </InspectorErrorBoundary>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          padding: '12px',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '6px',
        }}>
          <div style={{
            fontSize: '11px',
            color: isSaving ? '#aaa' : 'var(--success)',
            textAlign: 'center',
            fontStyle: 'italic'
          }}>
            {isSaving ? 'Guardando cambios...' : lastSaved ? `✓ Guardado (${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})` : 'Autoguardado activo'}
          </div>
          
          <button 
            className="dv-btn secondary" 
            style={{ fontSize: '11px', padding: '6px' }}
            disabled={isSaving}
            onClick={() => saveProjectState()}
          >
            💾 Guardar Proyecto
          </button>
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
