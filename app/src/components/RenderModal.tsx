import React from 'react';
import { useStore } from '../store/useStore';
import { Player } from '@remotion/player';
import { PluginWrapper } from '../remotion/PluginWrapper';
import { X, Info, FileVideo, Download, AlertTriangle } from 'lucide-react';
import { useTranslation } from '../i18n/useTranslation';

interface RenderModalProps {
    onConfirm: (codec: string) => void;
}

export const RenderModal: React.FC<RenderModalProps> = ({ onConfirm }) => {
    const { t } = useTranslation();
    const isRenderModalOpen = useStore(state => state.isRenderModalOpen);
    const toggleRenderModal = useStore(state => state.toggleRenderModal);
    const activeProject = useStore(state => state.activeProject);
    const properties = useStore(state => state.properties);
    
    const updateProjectConfig = useStore(state => state.updateProjectConfig);
    const saveProjectState = useStore(state => state.saveProjectState);
    
    // Leemos el codec directamente del proyecto para que sea reactivo en toda la app
    const selectedCodec = activeProject.preferredCodec || 'prores';

    if (!isRenderModalOpen || !activeProject) return null;

    const handleCodecChange = async (codec: string) => {
        updateProjectConfig({ preferredCodec: codec } as any);
        // Guardar en disco inmediatamente
        await saveProjectState();
    };

    const formats = [
        { id: 'prores', label: 'MOV (ProRes 4444 + Alpha)', desc: t('format_prores_desc'), color: '#38bdf8' },
        { id: 'h264', label: 'MP4 (H.264 - Estándar)', desc: t('format_h264_desc'), color: '#4ade80' },
        { id: 'webm', label: 'WebM (VP9 + Alpha)', desc: t('format_webm_desc'), color: '#fbbf24' },
        { id: 'gif', label: 'GIF Animado', desc: t('format_gif_desc'), color: '#f472b6' },
        { id: 'standard', label: 'MOV (ProRes 422)', desc: t('format_prores422_desc'), color: '#a78bfa' },
        { id: 'png', label: 'PNG (Secuencia de Imágenes)', desc: t('format_png_desc'), color: '#E44C30' },
        { id: 'jpg', label: 'JPEG (Secuencia de Imágenes)', desc: t('format_jpg_desc'), color: '#fb923c' },
    ];

    const isImageSequence = selectedCodec === 'png' || selectedCodec === 'jpg';

    const currentFormat = formats.find(f => f.id === selectedCodec);

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 99999,
            backdropFilter: 'blur(10px)'
        }}>
            <div style={{
                background: 'var(--bg-elevated, #121212)', 
                borderRadius: '16px', 
                maxWidth: '800px', 
                width: '95%',
                height: 'auto',
                maxHeight: '90vh',
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex', 
                flexDirection: 'column', 
                overflow: 'hidden',
                boxShadow: '0 25px 70px rgba(0,0,0,0.8)',
                animation: 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
                {/* Header */}
                <div style={{ 
                    padding: '20px 24px', 
                    borderBottom: '1px solid rgba(255,255,255,0.05)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    background: 'rgba(255,255,255,0.02)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ padding: '8px', background: 'var(--accent)', borderRadius: '8px' }}>
                            <FileVideo size={20} color="white" />
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '16px', color: 'white', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>{t('render_config')}</h2>
                            <div style={{ fontSize: '11px', color: 'var(--text-disabled)' }}>{activeProject.name}</div>
                        </div>
                    </div>
                    <button 
                        onClick={toggleRenderModal}
                        style={{ background: 'transparent', border: 'none', color: '#666', cursor: 'pointer', padding: '8px', borderRadius: '50%', transition: 'all 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#666'}
                    >
                        <X size={20} />
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'row', flex: 1, overflow: 'hidden' }}>
                    {/* Preview Section */}
                    <div style={{ flex: 1, padding: '24px', background: 'black', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div style={{ 
                            aspectRatio: '16/9', 
                            width: '100%', 
                            background: '#050505', 
                            borderRadius: '8px', 
                            overflow: 'hidden',
                            border: '1px solid rgba(255,255,255,0.1)',
                            position: 'relative'
                        }}>
                            <Player
                                component={PluginWrapper}
                                durationInFrames={activeProject.durationInFrames || 240}
                                compositionWidth={Number(activeProject.width) || 1920}
                                compositionHeight={Number(activeProject.height) || 1080}
                                fps={Number(activeProject.fps) || 60}
                                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                inputProps={{ ...properties, _isPreview: true }}
                                autoPlay
                                loop
                                acknowledgeRemotionLicense={true}
                            />
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ fontSize: '9px', color: 'var(--text-disabled)', textTransform: 'uppercase', marginBottom: '4px' }}>{t('output_resolution')}</div>
                                <div style={{ fontSize: '13px', fontWeight: 600, color: 'white' }}>{activeProject.width}x{activeProject.height}</div>
                            </div>
                            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ fontSize: '9px', color: 'var(--text-disabled)', textTransform: 'uppercase', marginBottom: '4px' }}>{t('duration')}</div>
                                <div style={{ fontSize: '13px', fontWeight: 600, color: 'white' }}>{((activeProject.durationInFrames || 240) / (activeProject.fps || 60)).toFixed(1)} {t('seconds_label')}</div>
                            </div>
                        </div>
                    </div>

                    {/* Settings Section */}
                    <div style={{ width: '320px', padding: '24px', borderLeft: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <label style={{ fontSize: '10px', color: 'var(--text-disabled)', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '8px', letterSpacing: '0.5px' }}>
                                {t('output_format')}
                            </label>
                            <select 
                                value={selectedCodec}
                                onChange={(e) => handleCodecChange(e.target.value)}
                                style={{
                                    width: '100%',
                                    background: 'var(--bg-primary, #0A0A0A)',
                                    border: '1px solid var(--border, #333)',
                                    borderRadius: '8px',
                                    padding: '12px',
                                    color: 'white',
                                    fontSize: '13px',
                                    outline: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                {formats.map(f => (
                                    <option key={f.id} value={f.id}>{f.label}</option>
                                ))}
                            </select>

                            {/* [v5.8.9] Debug Log para asegurar detección de FPS */}
                            {(() => {
                                const currentFps = Number(activeProject.fps || properties.fps || 60);
                                if (selectedCodec === 'gif' && currentFps > 50) {
                                    return (
                                        <div style={{
                                            marginTop: '12px',
                                            padding: '12px',
                                            background: 'rgba(239, 68, 68, 0.1)',
                                            border: '1px solid rgba(239, 68, 68, 0.3)',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            gap: '10px',
                                            animation: 'fadeIn 0.3s ease'
                                        }}>
                                            <AlertTriangle size={18} color="#ef4444" style={{ flexShrink: 0 }} />
                                            <div style={{ fontSize: '11px', color: '#ef4444', lineHeight: '1.4' }}>
                                                <strong>❌ Error de FPS:</strong> {t('gif_fps_error').replace("50 FPS", "50 FPS (Detectado: " + currentFps + " FPS)")}
                                            </div>
                                        </div>
                                    );
                                }
                                if (selectedCodec === 'h264') {
                                    return (
                                        <div style={{
                                            marginTop: '12px',
                                            padding: '12px',
                                            background: 'rgba(234, 179, 8, 0.1)',
                                            border: '1px solid rgba(234, 179, 8, 0.2)',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            gap: '10px',
                                            animation: 'fadeIn 0.3s ease'
                                        }}>
                                            <AlertTriangle size={18} color="#eab308" style={{ flexShrink: 0 }} />
                                            <div style={{ fontSize: '11px', color: '#eab308', lineHeight: '1.4' }}>
                                                <strong>⚠️ Limitación MP4:</strong> {t('mp4_alpha_warning')}
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            })()}
                            {isImageSequence && (
                                <div style={{
                                    marginTop: '12px',
                                    padding: '12px',
                                    background: 'rgba(228, 76, 48, 0.08)',
                                    border: '1px solid rgba(228, 76, 48, 0.25)',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    gap: '10px',
                                    animation: 'fadeIn 0.3s ease'
                                }}>
                                    <Info size={18} color="var(--accent)" style={{ flexShrink: 0 }} />
                                    <div style={{ fontSize: '11px', color: 'rgba(228,76,48,0.9)', lineHeight: '1.4' }}>
                                        <strong>📁 Secuencia de imágenes:</strong> {t('image_sequence_info')}
                                    </div>
                                </div>
                            )}
                        </div>

                        {currentFormat && (
                            <div style={{ 
                                padding: '15px', 
                                background: 'rgba(255,255,255,0.02)', 
                                borderRadius: '8px', 
                                borderLeft: `4px solid ${currentFormat.color}`,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px'
                            }}>
                                <div style={{ fontSize: '12px', fontWeight: 700, color: 'white' }}>{currentFormat.label}</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{currentFormat.desc}</div>
                            </div>
                        )}

                        <div style={{ marginTop: 'auto' }}>
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '8px', 
                                padding: '12px', 
                                background: 'rgba(228, 76, 48, 0.05)', 
                                borderRadius: '8px', 
                                marginBottom: '15px',
                                border: '1px solid rgba(228, 76, 48, 0.1)'
                            }}>
                                <Info size={16} color="var(--accent)" />
                                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.3' }}>
                                    {t('render_warning')}
                                </div>
                            </div>

                            <button 
                                onClick={() => {
                                    toggleRenderModal();
                                    onConfirm(selectedCodec);
                                }}
                                disabled={selectedCodec === 'gif' && Number(activeProject.fps || properties.fps || 60) > 50}
                                className="dv-btn cta" 
                                style={{ 
                                    width: '100%', 
                                    height: '50px', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    gap: '10px',
                                    fontSize: '14px',
                                    opacity: (selectedCodec === 'gif' && Number(activeProject.fps || properties.fps || 60) > 50) ? 0.5 : 1,
                                    cursor: (selectedCodec === 'gif' && Number(activeProject.fps || properties.fps || 60) > 50) ? 'not-allowed' : 'pointer'
                                }}
                            >
                                <Download size={18} />
                                {t('start_export')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes scaleIn {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};
