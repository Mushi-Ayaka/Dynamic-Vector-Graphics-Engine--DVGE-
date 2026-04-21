import React, { useEffect, useState } from 'react'
import { FolderOpen, CheckCircle, Package } from 'lucide-react'
import { DVPlugin } from '../env'
import { useStore } from '../store/useStore'
import './PluginManager.css'

export const PluginManagerUI: React.FC = () => {
  const [plugins, setPlugins] = useState<DVPlugin[]>([])
  const { renderState } = useStore()
  const isRendering = renderState === 'RENDERING'
  const activePluginId = useStore((state) => state.activePluginId) || 'lower-third-basic'

  const fetchPlugins = async () => {
    try {
      const data = await window.ipcRenderer.getPlugins()
      setPlugins(data)
    } catch (e) {
      console.error("Error fetching plugins", e)
    }
  }

  useEffect(() => {
    fetchPlugins()
  }, [])

  const handleOpenFolder = () => {
    window.ipcRenderer.openPluginsFolder()
  }

  const handleActivate = (id: string) => {
    // Aquí actualizaremos el status global pero por ahora console log
    console.log("Activando plugin:", id)
    useStore.setState({ activePluginId: id })
  }

  return (
    <div className="plugin-manager">
      <div className="pm-header">
        <div className="pm-title-group">
          <Package className="pm-icon" />
          <h2>Template Ecosystem</h2>
        </div>
        <button onClick={handleOpenFolder} className="btn-secondary" title="Open OS Folder">
          <FolderOpen size={18} />
          <span>Open Folder</span>
        </button>
      </div>

      <div className="pm-grid">
        {plugins.length === 0 ? (
          <div className="pm-empty">
            <p>No valid plugins found.</p>
          </div>
        ) : (
          plugins.map((pl) => {
            const isActive = pl.manifest.id === activePluginId
            return (
              <div key={pl.manifest.id} className={`pm-card ${isActive ? 'active' : ''}`}>
                <div className="pm-card-thumb">
                  {/* Si tuviéramos un preview.png se leería vía protocolo custom o base64, 
                      por ahora un placeholder estilizadísimo */}
                  <div className="pm-placeholder-img">
                    <span className="pm-version">v{pl.manifest.version}</span>
                  </div>
                  {isActive && (
                    <div className="pm-indicator">
                      <CheckCircle size={16} /> Active
                    </div>
                  )}
                </div>
                <div className="pm-card-body">
                  <h3>{pl.manifest.name}</h3>
                  <p>{pl.manifest.description}</p>
                  <div className="pm-card-footer">
                    <div className="pm-badges">
                      {pl.hasCss && <span className="badge css">CSS</span>}
                      {pl.hasJs && <span className="badge js">JS</span>}
                    </div>
                    <div className="pm-actions">
                      {!isActive && (
                        <button 
                          className="btn-primary-small"
                          disabled={isRendering}
                          onClick={() => handleActivate(pl.manifest.id)}
                        >
                          Activate
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
