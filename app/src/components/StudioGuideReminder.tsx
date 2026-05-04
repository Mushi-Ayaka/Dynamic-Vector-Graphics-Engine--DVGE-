import React, { useState } from 'react';
import { X, Info } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useTranslation } from '../i18n/useTranslation';

export const StudioGuideReminder: React.FC = () => {
    const { t } = useTranslation();
    const { appSettings, updateAppSettings } = useStore();
    const [isHovered, setIsHovered] = useState(false);
    const [isInteractiveHovered, setIsInteractiveHovered] = useState(false);
    const [dontShowAgain, setDontShowAgain] = useState(false);

    // No mostrar si ya lo vio o si decidió no volver a verlo
    if (appSettings.hasSeenStudioGuideReminder) return null;

    const handlePermanentClose = () => {
        updateAppSettings({ hasSeenStudioGuideReminder: true });
    };

    const finalOpacity = isInteractiveHovered ? 1 : (isHovered ? 0.15 : 1);

    return (
        <div 
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                position: 'fixed',
                top: '80px',
                right: '20px',
                width: '300px',
                zIndex: 1000,
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderTop: '2px solid var(--accent)',
                borderRadius: '2px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
                opacity: finalOpacity,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                pointerEvents: 'auto',
                display: 'flex',
                flexDirection: 'column',
                animation: 'slideIn 0.5s ease-out'
            }}
        >
            {/* Pequeña flecha apuntando arriba al botón de guía */}
            <div style={{
                position: 'absolute',
                top: '-10px',
                right: '45px',
                width: '0',
                height: '0',
                borderLeft: '10px solid transparent',
                borderRight: '10px solid transparent',
                borderBottom: '10px solid var(--accent)',
                opacity: finalOpacity < 0.5 ? 0 : 1,
                transition: 'opacity 0.3s'
            }} />

            {/* TopBar del Modal */}
            <div 
                onMouseEnter={() => setIsInteractiveHovered(true)}
                onMouseLeave={() => setIsInteractiveHovered(false)}
                style={{
                    height: '32px',
                    padding: '0 8px 0 12px',
                    background: 'var(--bg-elevated)',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Info size={14} color="var(--accent)" />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-primary)' }}>
                        tip
                    </span>
                </div>
                <button 
                    onClick={handlePermanentClose}
                    style={{ 
                        background: 'transparent', border: 'none', 
                        color: 'var(--text-disabled)', cursor: 'pointer', 
                        display: 'flex', alignItems: 'center',
                        padding: '4px',
                        transition: 'color 0.2s'
                    }}
                    onMouseOver={e => e.currentTarget.style.color = 'var(--accent)'}
                    onMouseOut={e => e.currentTarget.style.color = 'var(--text-disabled)'}
                >
                    <X size={16} />
                </button>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', lineHeight: '1.4', letterSpacing: '0.5px' }}>
                    {t('guide_reminder_title')}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                    {t('guide_reminder_desc')}
                </div>

                <div 
                    onMouseEnter={() => setIsInteractiveHovered(true)}
                    onMouseLeave={() => setIsInteractiveHovered(false)}
                    style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        marginTop: '8px',
                        paddingTop: '12px',
                        borderTop: '1px solid var(--border)'
                    }}
                >
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input 
                            type="checkbox" 
                            checked={dontShowAgain}
                            onChange={(e) => setDontShowAgain(e.target.checked)}
                            style={{ 
                                accentColor: 'var(--accent)',
                                cursor: 'pointer',
                                width: '14px',
                                height: '14px'
                            }}
                        />
                        <span style={{ fontSize: '10px', color: 'var(--text-disabled)', textTransform: 'uppercase', fontWeight: 600 }}>
                            {t('dont_show_again')}
                        </span>
                    </label>

                    {dontShowAgain && (
                        <button 
                            onClick={handlePermanentClose}
                            style={{
                                padding: '6px 12px',
                                background: 'var(--accent)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '2px',
                                fontSize: '10px',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                cursor: 'pointer',
                                transition: 'transform 0.2s'
                            }}
                            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            {t('done')}
                        </button>
                    )}
                </div>
            </div>
            
            <style>{`
                @keyframes slideIn {
                    from { opacity: 0; transform: translateX(30px); }
                    to { opacity: 1; transform: translateX(0); }
                }
            `}</style>
        </div>
    );
};
