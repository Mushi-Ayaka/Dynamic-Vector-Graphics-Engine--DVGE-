import React, { useState } from 'react';
import { Download, AlertCircle, Loader2, X, CheckCircle } from 'lucide-react';

interface UpdateModalProps {
  isOpen: boolean;
  releaseNotes: string;
  onDownload: () => Promise<string | undefined>;
  onInstall: (path: string) => void;
  onClose: () => void;
}

export const UpdateModal: React.FC<UpdateModalProps> = ({ isOpen, releaseNotes, onDownload, onInstall, onClose }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadedPath, setDownloadedPath] = useState<string | null>(null);

  const handleDownload = async () => {
    setIsDownloading(true);
    const path = await onDownload();
    if (path) {
      setDownloadedPath(path);
    }
    setIsDownloading(false);
  };

  const handleInstall = () => {
    if (downloadedPath) onInstall(downloadedPath);
  };

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed', inset: 0, zIndex: 100000,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderTop: '2px solid var(--accent)',
        borderRadius: '2px',
        width: '100%', maxWidth: '440px',
        boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(228,76,48,0.08)',
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        animation: 'slideUp 0.3s ease-out'
      }}>
        {/* Header */}
        <div style={{
          height: '44px', padding: '0 16px',
          background: 'var(--bg-elevated)',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} color="var(--accent)" />
            <h2 style={{ margin: 0, fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Actualización Disponible
            </h2>
          </div>
          <button 
            onClick={onClose} 
            disabled={isDownloading}
            style={{ 
              background: 'transparent', border: 'none', 
              color: 'var(--text-disabled)', cursor: isDownloading ? 'not-allowed' : 'pointer', 
              display: 'flex', alignItems: 'center', gap: '8px',
              transition: 'color 0.2s'
            }}
          >
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', fontWeight: 700 }}>ESC</span>
            <X size={14} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px', background: 'var(--bg-secondary)' }}>
          <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Hay una nueva versión de Ember Motion Studio lista. Te recomendamos actualizar para disfrutar de las últimas mejoras y correcciones de estabilidad.
          </p>

          {releaseNotes && !downloadedPath && (
            <div style={{ marginBottom: '24px', padding: '16px', background: 'var(--bg-primary)', borderRadius: '4px', border: '1px solid var(--border)' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-disabled)', fontWeight: 600 }}>
                Novedades:
              </h3>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                {releaseNotes}
              </p>
            </div>
          )}

          {downloadedPath && (
            <div style={{ marginBottom: '24px', padding: '16px', background: 'rgba(46, 204, 113, 0.1)', border: '1px solid rgba(46, 204, 113, 0.2)', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <CheckCircle size={20} color="#2ecc71" />
              <p style={{ margin: 0, fontSize: '12px', color: '#2ecc71', fontWeight: 600 }}>
                Descarga completada. Listo para instalar.
              </p>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            {!downloadedPath && (
              <button
                onClick={onClose}
                disabled={isDownloading}
                style={{
                  padding: '8px 16px', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)',
                  background: 'transparent', border: '1px solid var(--border)', borderRadius: '2px',
                  cursor: isDownloading ? 'not-allowed' : 'pointer', opacity: isDownloading ? 0.5 : 1
                }}
                onMouseOver={e => { if(!isDownloading) { e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.color = 'var(--text-primary)'; } }}
                onMouseOut={e => { if(!isDownloading) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; } }}
              >
                Más tarde
              </button>
            )}

            {!downloadedPath ? (
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="dv-btn cta"
                style={{
                  padding: '8px 20px', fontSize: '11px', fontWeight: 700,
                  display: 'flex', alignItems: 'center', gap: '8px',
                  opacity: isDownloading ? 0.7 : 1, cursor: isDownloading ? 'not-allowed' : 'pointer',
                  borderRadius: '2px', textTransform: 'uppercase', letterSpacing: '0.5px'
                }}
              >
                {isDownloading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                    Descargando...
                  </>
                ) : (
                  <>
                    <Download size={14} />
                    Descargar Actualización
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleInstall}
                className="dv-btn cta"
                style={{
                  padding: '8px 20px', fontSize: '11px', fontWeight: 700,
                  display: 'flex', alignItems: 'center', gap: '8px',
                  borderRadius: '2px', textTransform: 'uppercase', letterSpacing: '0.5px',
                  background: '#2ecc71', color: '#000', border: 'none'
                }}
              >
                Instalar Ahora y Reiniciar
              </button>
            )}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};
