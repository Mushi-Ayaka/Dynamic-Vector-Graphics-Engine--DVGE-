import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Settings2, ChevronDown, ChevronRight } from 'lucide-react';
import { useTranslation } from '../i18n/useTranslation';

export const ProjectConfigPanel: React.FC = () => {
    const { t } = useTranslation();
    const activeProject = useStore(state => state.activeProject);
    const updateProjectConfig = useStore(state => state.updateProjectConfig);
    const uiState = useStore(state => state.uiState);
    const setUiState = useStore(state => state.setUiState);

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
        <div className="dv-panel dv-canvas-config">
            <div 
                className="dv-panel-header" 
                onClick={() => setUiState({ canvasOpen: !uiState.canvasOpen })} 
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
                {uiState.canvasOpen ? <ChevronDown size={14} color="var(--text-disabled)" /> : <ChevronRight size={14} color="var(--text-disabled)" />}
            </div>
            
            {uiState.canvasOpen && (
                <div className="dv-panel-content dv-canvas-config" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '12px' }}>
                    
                    {/* Resolution Section */}
                    <div className="dv-field-resolution" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div className="dv-field">
                            <label>{t('width_label')} (px)</label>
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
                            <label>{t('height_label')} (px)</label>
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
                    <div className="dv-field-duration" style={{ marginTop: '4px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                        <div className="dv-field">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                <label style={{ margin: 0 }}>{t('duration_seconds')}</label>
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
                                    {t('adjust_fps')}
                                </button>
                            </div>
                        </div>

                        {uiState.advancedDuration && (
                            <div className="dv-field dv-field-fps" style={{ marginTop: '12px', background: 'rgba(255,255,255,0.02)', padding: '8px', borderRadius: '4px' }}>
                                <label>{t('fps_label')} (FPS)</label>
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
                                    {t('total_label')}: {localDuration} {t('frames_calculated')}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
