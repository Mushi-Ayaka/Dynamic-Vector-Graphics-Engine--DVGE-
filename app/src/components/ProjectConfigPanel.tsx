import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Settings2, ChevronDown, ChevronRight } from 'lucide-react';

export const ProjectConfigPanel: React.FC = () => {
    const activeProject = useStore(state => state.activeProject);
    const updateProjectConfig = useStore(state => state.updateProjectConfig);
    const uiState = useStore(state => state.uiState);
    const setUiState = useStore(state => state.setUiState);
    const [isOpen, setIsOpen] = useState(true);

    if (!activeProject) return null;

    // Estados locales para los inputs (patrón onBlur para evitar el bug del cero)
    const [localWidth, setLocalWidth] = useState(activeProject.width?.toString() || '1920');
    const [localHeight, setLocalHeight] = useState(activeProject.height?.toString() || '1080');
    const [localFps, setLocalFps] = useState(activeProject.fps?.toString() || '60');
    const [localDuration, setLocalDuration] = useState(activeProject.durationInFrames?.toString() || '240');

    // Sincronizar cuando el proyecto cambie (incluyendo cambios de configuración como el Aspect Ratio)
    useEffect(() => {
        setLocalWidth(activeProject.width?.toString() || '1920');
        setLocalHeight(activeProject.height?.toString() || '1080');
        setLocalFps(activeProject.fps?.toString() || '60');
        setLocalDuration(activeProject.durationInFrames?.toString() || '240');
    }, [activeProject.id, activeProject.width, activeProject.height, activeProject.fps, activeProject.durationInFrames]);

    const handleBlur = (field: string, value: string) => {
        const num = parseFloat(value);
        if (!isNaN(num)) {
            const patch: any = { [field]: num };
            if (field === 'width' || field === 'height') {
                patch.aspectRatioMode = 'custom';
            }
            updateProjectConfig(patch);
        }
    };

    return (
        <div className="dv-panel">
            <div 
                className="dv-panel-header" 
                onClick={() => setIsOpen(!isOpen)} 
                style={{ 
                    cursor: 'pointer', 
                    height: '40px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: '0 12px',
                    justifyContent: 'space-between'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Settings2 size={14} color="var(--accent)" />
                    <span style={{ fontWeight: 600, fontSize: '10px', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>CANVAS</span>
                </div>
                {isOpen ? <ChevronDown size={14} color="var(--text-disabled)" /> : <ChevronRight size={14} color="var(--text-disabled)" />}
            </div>
            
            {isOpen && (
                <div className="dv-panel-content" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '12px' }}>
                    
                    {/* Resolution Section */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div className="dv-field">
                            <label>Ancho (px)</label>
                            <input 
                                type="number" 
                                min="1"
                                className="dv-input" 
                                value={localWidth}
                                onChange={e => setLocalWidth(e.target.value)}
                                onBlur={e => handleBlur('width', e.target.value)}
                                onFocus={e => e.target.select()}
                                disabled={uiState.aspectRatioMode !== 'custom'}
                                style={{ opacity: uiState.aspectRatioMode !== 'custom' ? 0.5 : 1 }}
                            />
                        </div>
                        <div className="dv-field">
                            <label>Alto (px)</label>
                            <input 
                                type="number" 
                                min="1"
                                className="dv-input" 
                                value={localHeight}
                                onChange={e => setLocalHeight(e.target.value)}
                                onBlur={e => handleBlur('height', e.target.value)}
                                onFocus={e => e.target.select()}
                                disabled={uiState.aspectRatioMode !== 'custom'}
                                style={{ opacity: uiState.aspectRatioMode !== 'custom' ? 0.5 : 1 }}
                            />
                        </div>
                    </div>

                    {/* Duration Section */}
                    <div style={{ marginTop: '4px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                        <div className="dv-field">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                <label style={{ margin: 0 }}>Duración (segundos)</label>
                            </div>
                            <input 
                                type="number" 
                                min="0.1"
                                step="0.1"
                                className="dv-input" 
                                value={
                                    parseFloat(localFps) > 0 
                                    ? (parseFloat(localDuration) / parseFloat(localFps)).toFixed(1) 
                                    : '0.0'
                                }
                                onChange={e => {
                                    const secs = Math.max(0.1, parseFloat(e.target.value));
                                    const fps = parseFloat(localFps || '60');
                                    if (!isNaN(secs) && fps > 0) {
                                        const frames = Math.round(secs * fps);
                                        setLocalDuration(frames.toString());
                                    }
                                }}
                                onBlur={e => {
                                    const secs = Math.max(0.1, parseFloat(e.target.value));
                                    const fps = parseFloat(localFps || '60');
                                    if (!isNaN(secs) && fps > 0) {
                                        const frames = Math.round(secs * fps);
                                        handleBlur('durationInFrames', frames.toString());
                                    }
                                }}
                                onFocus={e => e.target.select()}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                <button
                                    onClick={() => setUiState({ advancedDuration: !uiState.advancedDuration })}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'var(--text-disabled)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        fontSize: '10px'
                                    }}
                                >
                                    {uiState.advancedDuration ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                                    Ajustar FPS
                                </button>
                            </div>
                        </div>

                        {uiState.advancedDuration && (
                            <div className="dv-field" style={{ marginTop: '12px', background: 'rgba(255,255,255,0.02)', padding: '8px', borderRadius: '4px' }}>
                                <label>Velocidad (FPS)</label>
                                <input 
                                    type="number" 
                                    min="1"
                                    className="dv-input" 
                                    value={localFps}
                                    onChange={e => setLocalFps(e.target.value)}
                                    onBlur={e => handleBlur('fps', e.target.value)}
                                    onFocus={e => e.target.select()}
                                />
                                <span style={{ fontSize: '10px', color: 'var(--text-disabled)', marginTop: '4px', display: 'block' }}>
                                    Total: {localDuration} frames calculados
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
