import React from 'react';

/**
 * [v3.4.0] EditorPanel UI Module
 * Proporciona un lienzo de edición profesional con grilla y guías.
 * Evita que la IA deba reinventar la interfaz de edición.
 */
export const EditorPanel: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
    return (
        <div className="dv-editor-panel" style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            background: '#111',
            backgroundImage: `
                linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            border: '2px solid #222',
            borderRadius: '8px',
            overflow: 'hidden'
        }}>
            {/* Safe Area Guides */}
            <div style={{
                position: 'absolute',
                top: '60px', left: '60px', right: '60px', bottom: '60px',
                border: '1px dashed rgba(228,76,48,0.2)',
                pointerEvents: 'none'
            }} />
            
            {/* Content Slot */}
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                {children}
            </div>

            {/* Toolbar Inferior */}
            <div style={{
                position: 'absolute',
                bottom: '10px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(0,0,0,0.8)',
                padding: '5px 15px',
                borderRadius: '50px',
                display: 'flex',
                gap: '10px',
                border: '1px solid #333'
            }}>
                <button style={toolBtnStyle}>↖ Seleccionar</button>
                <button style={toolBtnStyle}>✂ Cortar</button>
                <button style={toolBtnStyle}>🔳 Capas</button>
            </div>
        </div>
    );
};

const toolBtnStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    color: '#eee',
    fontSize: '11px',
    cursor: 'pointer',
    padding: '4px 8px'
};
