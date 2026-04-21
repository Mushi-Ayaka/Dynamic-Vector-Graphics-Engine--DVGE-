import React from 'react';

/**
 * [v3.4.0] FileManager UI Module
 * Este componente es inyectado por el motor cuando el plugin usa el preset 'editor-full'
 * o solicita explícitamente gestión de assets.
 */
export const FileManager: React.FC = () => {
    return (
        <div className="dv-file-manager" style={{
            padding: '20px',
            background: 'var(--bg-panel)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '15px'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0, color: '#E44C30' }}>Gestor de Assets</h4>
                <button className="dv-btn secondary" style={{ fontSize: '10px', padding: '4px 8px' }}>
                    + Añadir Archivo
                </button>
            </div>
            
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', 
                gap: '10px',
                minHeight: '100px'
            }}>
                {/* Mockup de archivos */}
                <div style={assetStyle}>
                    <div style={iconStyle}>📄</div>
                    <span style={labelStyle}>logo.png</span>
                </div>
                <div style={assetStyle}>
                    <div style={iconStyle}>🎬</div>
                    <span style={labelStyle}>bg.mp4</span>
                </div>
            </div>
        </div>
    );
};

const assetStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '5px',
    padding: '8px',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '8px',
    cursor: 'pointer'
};

const iconStyle: React.CSSProperties = {
    fontSize: '24px'
};

const labelStyle: React.CSSProperties = {
    fontSize: '10px',
    color: 'var(--text-secondary)',
    maxWidth: '60px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
};
