import React from 'react';
import { useStore } from '../store/useStore';
import { X, ShieldAlert } from 'lucide-react';
import { useTranslation } from '../i18n/useTranslation';

export const WelcomeGuide: React.FC = () => {
    const { t } = useTranslation();
    const appSettings = useStore(state => state.appSettings);
    const updateAppSettings = useStore(state => state.updateAppSettings);
    const isWelcomeGuideOpen = useStore(state => state.isWelcomeGuideOpen);
    const toggleWelcomeGuide = useStore(state => state.toggleWelcomeGuide);
    const setStartHomeTutorial = useStore(state => state.setStartHomeTutorial);

    // Si ya la vio y no está forzada a abrirse, no la renderizamos
    if (appSettings.hasSeenWelcomeGuide && !isWelcomeGuideOpen) return null;

    const handleClose = () => {
        updateAppSettings({ hasSeenWelcomeGuide: true });
        if (isWelcomeGuideOpen) toggleWelcomeGuide();
    };

    const handleStart = () => {
        handleClose();
        setStartHomeTutorial(true);
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 99999,
            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px'
        }}>
            <div style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                width: '100%', maxWidth: '600px',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                overflow: 'hidden',
                animation: 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                display: 'flex', flexDirection: 'column'
            }}>
                {/* Header */}
                <div style={{
                    padding: '16px 24px', borderBottom: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: 'var(--bg-elevated)'
                }}>
                    <h2 style={{ margin: 0, fontSize: '16px', color: 'var(--text-primary)', fontWeight: 600, letterSpacing: '-0.02em', fontFamily: 'Outfit, Fira Sans, sans-serif' }}>
                        {t('welcome_title')}
                    </h2>
                    <button onClick={handleClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-disabled)', cursor: 'pointer', padding: '4px', display: 'flex' }}>
                        <X size={18} />
                    </button>
                </div>

                <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    <div style={{ textAlign: 'center', padding: '10px 0 20px' }}>
                        <p style={{ margin: '0 0 10px', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                            {t('welcome_desc')}
                        </p>
                    </div>

                    {/* Alerta de Seguridad (Ember Style) */}
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)',
                        padding: '16px', borderRadius: '6px', display: 'flex', gap: '16px', alignItems: 'flex-start'
                    }}>
                        <ShieldAlert size={24} color="var(--accent)" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div style={{ flex: 1 }}>
                            <h4 style={{ margin: '0 0 6px', fontSize: '13px', color: 'var(--text-primary)', fontWeight: 600 }}>{t('smartscreen_title')}</h4>
                            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                {t('smartscreen_desc')}
                            </p>
                            <button
                                onClick={() => window.ipcRenderer?.windowOpenExternal?.('https://github.com/Mushi-Ayaka/Dynamic-Vector-Graphics-Engine--DVGE-')}
                                style={{
                                    marginTop: '12px', background: 'transparent', border: '1px solid var(--border-focus)',
                                    color: 'var(--text-secondary)', padding: '6px 12px', borderRadius: '4px', fontSize: '11px', fontWeight: 600,
                                    cursor: 'pointer', transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center'
                                }}
                                onMouseOver={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--text-secondary)'; }}
                                onMouseOut={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border-focus)'; }}
                            >
                                {t('view_source_github')}
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                        <button
                            onClick={handleStart}
                            className="dv-btn cta"
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 24px' }}
                        >
                            {t('create_first_project_btn')} <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-arrow-right"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

