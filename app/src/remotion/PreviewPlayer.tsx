import React from 'react'
import { Player } from '@remotion/player'
import { PluginWrapper } from './PluginWrapper'
import { RefreshCcw } from 'lucide-react'
import { useStore } from '../store/useStore'
import { useState } from 'react'

export const PreviewPlayer: React.FC = () => {
  const { properties, activeProject, loadProject } = useStore()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    if (activeProject) {
        await loadProject(activeProject)
    }
    // Pequeño delay visual para el feedback
    setTimeout(() => setIsRefreshing(false), 500)
  }

  return (
    <div 
      style={{ 
        width: '100%', 
        aspectRatio: '16/9', 
        borderRadius: '8px', 
        overflow: 'hidden', 
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        background: '#000', // El player se ve sobre negro en la previsualización
        position: 'relative'
      }}
    >
      <Player
        component={PluginWrapper}
        durationInFrames={120}
        compositionWidth={1920}
        compositionHeight={1080}
        fps={60}
        style={{
          width: '100%',
          height: '100%',
        }}
        controls
        autoPlay
        loop
        inputProps={properties}
        acknowledgeRemotionLicense={true}
      />
      
      {/* Botón de Actualización - Diseño Glassmorphism */}
      <button 
        onClick={handleRefresh}
        className={`refresh-btn ${isRefreshing ? 'refreshing' : ''}`}
        title="Forzar Recarga de Código (F5)"
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          zIndex: 100,
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '12px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
          outline: 'none'
        }}
      >
        <RefreshCcw size={14} className={isRefreshing ? 'spin-anim' : ''} />
        {isRefreshing ? 'Sincronizando...' : 'Actualizar Código'}
      </button>

      {/* CSS Inline para animaciones premium */}
      <style>{`
        .refresh-btn:hover {
            background: rgba(228, 76, 48, 0.3) !important;
            border-color: #E44C30 !important;
            transform: translateY(-2px);
        }
        .spin-anim {
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
      `}</style>
      
      {/* Indicador de Transparencia (Solo visual para el usuario) */}
      <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          padding: '4px 8px',
          background: 'rgba(0,0,0,0.6)',
          borderRadius: '4px',
          fontSize: '10px',
          color: '#aaa',
          border: '1px solid #333'
      }}>
        ALFA CHANNEL ENABLED
      </div>
    </div>
  )
}
