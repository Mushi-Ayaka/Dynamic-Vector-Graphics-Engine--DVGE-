import React, { useEffect, useState } from 'react'
import { FolderOpen, CheckCircle, Package } from 'lucide-react'
import { DVPlugin } from '../env'
import { useStore } from '../store/useStore'
import { useTranslation } from '../i18n/useTranslation'
import './PluginManager.css'

export const PluginManagerUI: React.FC = () => {
  const { t } = useTranslation();
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
        <button onClick={handleOpenFolder} className="btn-secondary" title={t('open_os_folder')}>
          <FolderOpen size={18} />
          <span>{t('open_folder_tooltip')}</span>
        </button>
      </div>

      <div className="pm-grid">
        {plugins.length === 0 ? (
          <div className="pm-empty">
            <p>{t('no_plugins_found')}</p>
          </div>
        ) : (
          plugins.map((pl) => {
            const isActive = pl.manifest.id === activePluginId
            return (
              <div key={pl.manifest.id} className={`pm-card ${isActive ? 'active' : ''}`}>
                <div className="pm-card-thumb">
                  <div className="pm-placeholder-img">
                    <span className="pm-version">v{pl.manifest.version}</span>
                  </div>
                  {isActive && (
                    <div className="pm-indicator">
                      <CheckCircle size={16} /> {t('active_label')}
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
                          {t('activate_btn')}
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
