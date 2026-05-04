import React from 'react';
import ReactDOM from 'react-dom';
import { useStore } from '../store/useStore';
import { APP_VERSION, BUILD_DATE } from '../version';
import { ExternalLink, Mail, X } from 'lucide-react';
import { useTranslation } from '../i18n/useTranslation';

export const AboutModal: React.FC = () => {
    const isAboutOpen = useStore(state => state.isAboutOpen);
    const toggleAbout = useStore(state => state.toggleAbout);
    const { t } = useTranslation();

    if (!isAboutOpen) return null;

    return ReactDOM.createPortal(
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 999999,
            backdropFilter: 'blur(8px)'
        }}>
            <div style={{
                background: 'var(--bg-elevated, #1A1A1A)',
                padding: '30px',
                borderRadius: '2px',
                maxWidth: '500px',
                width: '90%',
                border: '1px solid rgba(255,255,255,0.1)',
                borderTop: '4px solid var(--accent)',
                display: 'flex',
                flexDirection: 'column',
                gap: '15px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
                animation: 'fadeInUp 0.3s ease-out'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <img src="logo-square.png" alt="DVGE Studio" style={{ width: '48px', height: '48px' }} />
                        <div>
                            <h2 style={{ margin: 0, fontSize: '18px', color: 'white', fontFamily: 'Outfit, sans-serif', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                Ember Motion Studio
                            </h2>
                            <span style={{ color: 'var(--accent)', fontSize: '11px', fontWeight: 'bold', fontFamily: 'Fira Code, monospace' }}>
                                [DVGE]-[v{APP_VERSION}]-[{BUILD_DATE}]
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={toggleAbout}
                        style={{ background: 'transparent', border: 'none', color: '#666', cursor: 'pointer', padding: '4px' }}
                    >
                        <X size={20} />
                    </button>
                </div>

                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', fontFamily: 'Fira Sans, sans-serif' }}>
                    <p>{t('about_studio')}</p>

                    <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <strong style={{ color: 'white', fontSize: '10px', textTransform: 'uppercase' }}>{t('developer')}</strong> 
                            <span style={{ fontSize: '11px' }}>Jonatan Barón</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <strong style={{ color: 'white', fontSize: '10px', textTransform: 'uppercase' }}>{t('engine')}</strong> 
                            <span style={{ fontSize: '11px' }}>Remotion v4 + Electron Core</span>
                        </div>
                    </div>

                    <div style={{ marginTop: '20px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                        <a href="https://github.com/Mushi-Ayaka/Dynamic-Vector-Graphics-Engine--DVGE-" target="_blank" rel="noopener" style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '11px', fontWeight: 'bold' }}>
                            <ExternalLink size={13} /> {t('github')}
                        </a>
                        <a href="https://portafolio-jonatan-baron.vercel.app/" target="_blank" rel="noopener" style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '11px', fontWeight: 'bold' }}>
                            <ExternalLink size={13} /> {t('portfolio')}
                        </a>
                        <a href="https://mail.google.com/mail/?view=cm&fs=1&to=barojonatan8@gmail.com" target="_blank" rel="noopener" style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '11px', fontWeight: 'bold' }}>
                            <Mail size={13} /> {t('contact')}
                        </a>
                    </div>
                </div>


            </div>
            <style>{`
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>,
        document.body
    );
};
