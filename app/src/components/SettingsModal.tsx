import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useStore } from '../store/useStore';
import { useTranslation } from '../i18n/useTranslation';
import { X, Globe, ShieldCheck, Settings } from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const isSettingsOpen = useStore(state => state.isSettingsOpen);
  const toggleSettings = useStore(state => state.toggleSettings);
  const appSettings = useStore(state => state.appSettings);
  const updateAppSettings = useStore(state => state.updateAppSettings);
  const { t } = useTranslation();
  
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  if (!isSettingsOpen) return null;

  return ReactDOM.createPortal(
    <div 
      className="dv-modal-overlay"
      onClick={toggleSettings}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', zIndex: 1000000,
        backdropFilter: 'blur(12px)',
        animation: 'modalFadeIn 0.2s ease-out'
      }}
    >
      <div 
        className="dv-settings-card"
        onClick={e => e.stopPropagation()}
        style={{
          display: 'flex',
          maxWidth: '700px',
          width: '90%',
          height: '450px',
          background: '#0D0D0D',
          borderRadius: '12px',
          boxShadow: '0 30px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Animated Sidebar */}
        <div 
          onMouseEnter={() => setIsSidebarExpanded(true)}
          onMouseLeave={() => setIsSidebarExpanded(false)}
          style={{
            width: isSidebarExpanded ? '180px' : '60px',
            background: 'rgba(255,255,255,0.02)',
            borderRight: '1px solid rgba(255,255,255,0.05)',
            display: 'flex',
            flexDirection: 'column',
            transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            overflow: 'hidden',
            padding: '20px 0'
          }}
        >
          <div style={{ padding: '0 20px 20px 20px', whiteSpace: 'nowrap', opacity: isSidebarExpanded ? 1 : 0, transition: 'opacity 0.2s' }}>
            <h2 style={{ fontSize: '10px', color: 'var(--accent)', fontWeight: 800, letterSpacing: '1px' }}>
              {t('preferencias').toUpperCase()}
            </h2>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                padding: '12px 22px',
                background: 'rgba(228,76,48,0.1)',
                border: 'none',
                color: 'var(--accent)',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                whiteSpace: 'nowrap'
              }}
            >
              <Settings size={18} style={{ minWidth: '18px' }} />
              <span style={{ 
                fontSize: '13px', 
                fontWeight: 700, 
                opacity: isSidebarExpanded ? 1 : 0,
                transform: isSidebarExpanded ? 'translateX(0)' : 'translateX(-10px)',
                transition: 'opacity 0.2s, transform 0.2s'
              }}>
                {t('general')}
              </span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0D0D0D' }}>
          {/* Header */}
          <div style={{ 
            padding: '20px 30px', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}>
            <h3 style={{ margin: 0, fontSize: '16px', color: 'white', fontWeight: 600 }}>
              {t('general')}
            </h3>
            <button 
              onClick={toggleSettings} 
              style={{ 
                background: 'rgba(255,255,255,0.05)', 
                border: 'none', 
                borderRadius: '50%', 
                width: '32px', 
                height: '32px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: '#666',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#666'}
            >
              <X size={18} />
            </button>
          </div>

          {/* Settings Content */}
          <div style={{ flex: 1, padding: '10px 30px 30px 30px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Language Selection */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#888' }}>
                <Globe size={14} />
                <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('language')}</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['es', 'en'].map(lang => (
                  <button 
                    key={lang}
                    onClick={() => updateAppSettings({ language: lang as 'es' | 'en' })}
                    style={{
                      flex: 1,
                      padding: '12px', borderRadius: '6px', 
                      border: '1px solid rgba(255,255,255,0.05)',
                      background: appSettings.language === lang ? 'var(--accent)' : 'rgba(255,255,255,0.02)',
                      color: appSettings.language === lang ? 'white' : '#888',
                      cursor: 'pointer', fontWeight: 600, fontSize: '12px', transition: 'all 0.2s'
                    }}
                  >
                    {lang === 'es' ? 'Español' : 'English'}
                  </button>
                ))}
              </div>
            </div>

            {/* Auto Save Toggle */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              padding: '20px', 
              background: 'rgba(255,255,255,0.02)', 
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.05)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ 
                  width: '36px', height: '36px', borderRadius: '50%', 
                  background: appSettings.autoSave ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255,255,255,0.05)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <ShieldCheck size={20} color={appSettings.autoSave ? '#22c55e' : '#666'} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'white' }}>{t('auto_save')}</span>
                  <span style={{ fontSize: '11px', color: '#666' }}>{t('auto_save_desc')}</span>
                </div>
              </div>
              <button 
                onClick={() => updateAppSettings({ autoSave: !appSettings.autoSave })}
                style={{
                  width: '44px', height: '24px', borderRadius: '12px', border: 'none',
                  background: appSettings.autoSave ? '#22c55e' : '#333',
                  position: 'relative', cursor: 'pointer', transition: 'all 0.3s'
                }}
              >
                <div style={{
                  position: 'absolute', top: '3px', left: appSettings.autoSave ? '23px' : '3px',
                  width: '18px', height: '18px', borderRadius: '50%', background: 'white', transition: 'all 0.3s',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }} />
              </button>
            </div>

          </div>
        </div>
      </div>
      <style>{`
        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>,
    document.body
  );
};
