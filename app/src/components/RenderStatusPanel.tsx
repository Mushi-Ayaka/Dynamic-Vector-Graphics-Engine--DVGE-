import React from 'react';
import { CheckCircle, AlertCircle, Loader2, FolderOpen } from 'lucide-react';

interface RenderStatusPanelProps {
    renderState: 'IDLE' | 'RENDERING' | 'DONE' | 'ERROR';
    renderProgress: number;
    renderError?: string;
    onOpenFolder: () => void;
    onDragStart: (e: React.DragEvent) => void;
}

export const RenderStatusPanel: React.FC<RenderStatusPanelProps> = ({
    renderState,
    renderProgress,
    renderError,
    onOpenFolder,
    onDragStart
}) => {
    if (renderState === 'IDLE') return null;

    return (
        <div style={{ marginTop: '20px' }}>
            {renderState === 'RENDERING' && (
                <div style={{ textAlign: 'center', padding: '20px', background: 'rgba(59,130,246,0.05)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '15px' }}>
                        <Loader2 className="animate-spin" size={20} color="var(--accent)" />
                        <h3 style={{ margin: 0, color: 'var(--accent)', fontSize: '14px' }}>Procesando...</h3>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'var(--bg-elevated)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${renderProgress * 100}%`, background: 'var(--accent)', transition: 'width 0.2s' }} />
                    </div>
                    <div style={{ marginTop: '8px', fontSize: '10px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                        {Math.round(renderProgress * 100)}% COMPLETADO
                    </div>
                </div>
            )}

            {renderState === 'DONE' && (
                <div className="drag-box" draggable onDragStart={onDragStart} style={{ border: '2px dashed var(--success)', background: 'rgba(34,197,94,0.05)' }}>
                    <CheckCircle size={32} color="var(--success)" style={{ marginBottom: '12px' }} />
                    <strong style={{ fontSize: '16px', display: 'block', marginBottom: '4px' }}>¡RENDERIZADO COMPLETO!</strong>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '11px', margin: '0 0 15px' }}>
                        El archivo está listo. Arrástralo a tu editor de video.
                    </p>
                    <button
                        className="dv-btn secondary"
                        style={{ fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        onClick={onOpenFolder}
                    >
                        <FolderOpen size={14} /> Abrir Carpeta del Proyecto
                    </button>
                </div>
            )}

            {renderState === 'ERROR' && (
                <div style={{ padding: '20px', background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', borderRadius: '6px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <AlertCircle size={20} color="#ef4444" style={{ flexShrink: 0 }} />
                    <div>
                        <strong style={{ color: '#ef4444', fontSize: '13px' }}>Error de Renderizado:</strong>
                        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', margin: '8px 0 0', lineHeight: '1.4' }}>
                            {renderError?.includes('FPS for a GIF cannot be higher than 50')
                                ? '⚠️ Tu proyecto tiene demasiados FPS para un GIF. Los GIFs solo soportan hasta 50 FPS. Por favor, baja los FPS en el canvas.'
                                : renderError || 'Fallo desconocido en el proceso de Remotion'}
                        </p>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
            `}</style>
        </div>
    );
};
