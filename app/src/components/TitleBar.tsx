import React, { useState, useEffect, useRef } from 'react';
import './TitleBar.css';
import { useStore } from '../store/useStore';
import { useTranslation } from '../i18n/useTranslation';

// ─── Types ────────────────────────────────────────────────────────────────────

interface MenuAction {
  label: string;
  shortcut?: string;
  action?: () => void;
  separator?: false;
}

interface MenuSeparator {
  separator: true;
}

type MenuItem = MenuAction | MenuSeparator;

interface MenuGroup {
  label: string;
  items: MenuItem[];
}

// ─── MenuDropdown ─────────────────────────────────────────────────────────────

const MenuDropdown: React.FC<{ group: MenuGroup; isOpen: boolean; onToggle: () => void; onClose: () => void }> = ({
  group, isOpen, onToggle, onClose
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const handleItem = (item: MenuItem) => {
    if ('separator' in item) return;
    item.action?.();
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };

  return (
    <div className="tb-menu-group" ref={ref} onKeyDown={handleKeyDown}>
      <button
        className={`tb-menu-btn ${isOpen ? 'active' : ''}`}
        onClick={onToggle}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {group.label}
      </button>

      {isOpen && (
        <div className="tb-dropdown" role="menu">
          {group.items.map((item, i) =>
            'separator' in item ? (
              <div key={i} className="tb-separator" role="separator" />
            ) : (
              <button
                key={i}
                className="tb-dropdown-item"
                role="menuitem"
                onClick={() => handleItem(item)}
              >
                <span>{item.label}</span>
                {item.shortcut && <span className="tb-shortcut">{item.shortcut}</span>}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
};

// ─── TitleBar ─────────────────────────────────────────────────────────────────

export const TitleBar: React.FC = () => {
  const { t, language } = useTranslation();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [isMaximized, setIsMaximized] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  // Detectar estado de maximizado al montar y al cambiar
  useEffect(() => {
    const check = async () => {
      if (window.ipcRenderer?.windowIsMaximized) {
        const val = await window.ipcRenderer.windowIsMaximized();
        setIsMaximized(val);
      }
    };
    check();
  }, []);

  // Cerrar menú si se hace click fuera de la barra
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = (label: string) =>
    setOpenMenu(prev => (prev === label ? null : label));

  const toggleAbout = useStore(state => state.toggleAbout);
  const toggleWelcomeGuide = useStore(state => state.toggleWelcomeGuide);
  const toggleSettings = () => {
    console.log("Toggling settings...");
    useStore.getState().toggleSettings();
  };
  const isManual = window.location.hash === '#manual';

  const handleMinimize = () => window.ipcRenderer?.windowMinimize?.();
  const handleMaximize = () => {
    window.ipcRenderer?.windowMaximize?.();
    setIsMaximized(v => !v);
  };
  const handleClose = () => window.ipcRenderer?.windowClose?.();

  // ─── Definición del menú ──────────────────────────────────────────────────

  const menus: MenuGroup[] = [
    {
      label: t('archivo'),
      items: [
        { label: t('new_window'), shortcut: 'Ctrl+N', action: () => window.ipcRenderer?.windowNew?.() },
        { separator: true },
        { label: t('preferencias'), shortcut: 'Ctrl+,', action: toggleSettings },
        { separator: true },
        { label: t('exit'), shortcut: 'Alt+F4', action: () => window.ipcRenderer?.windowClose?.() },
      ],
    },
    {
      label: t('edit'),
      items: [
        { label: t('undo'), shortcut: 'Ctrl+Z', action: () => document.execCommand('undo') },
        { label: t('redo'), shortcut: 'Ctrl+Y', action: () => document.execCommand('redo') },
        { separator: true },
        { label: t('cut'), shortcut: 'Ctrl+X', action: () => document.execCommand('cut') },
        { label: t('copy'), shortcut: 'Ctrl+C', action: () => document.execCommand('copy') },
        { label: t('paste'), shortcut: 'Ctrl+V', action: () => document.execCommand('paste') },
      ],
    },
    {
      label: t('view'),
      items: [
        { label: t('fullscreen'), shortcut: 'F11', action: handleMaximize },
        { separator: true },
        { label: t('zoom_in'), shortcut: 'Ctrl++', action: () => window.ipcRenderer?.windowZoomIn?.() },
        { label: t('zoom_out'), shortcut: 'Ctrl+-', action: () => window.ipcRenderer?.windowZoomOut?.() },
        { label: t('zoom_reset'), shortcut: 'Ctrl+0', action: () => window.ipcRenderer?.windowZoomReset?.() },
      ],
    },
    {
      label: t('help'),
      items: [
        {
          label: t('documentation'),
          action: () => window.ipcRenderer?.windowOpenExternal?.(`https://ember-motion-studio-landing.vercel.app/${language === 'es' ? 'es/' : ''}engine/architecture/`),
        },
        {
          label: t('manual'),
          action: () => window.ipcRenderer?.windowOpenManual?.(),
        },
        { separator: true },
        { label: t('welcome_guide'), action: toggleWelcomeGuide },
        { separator: true },
        { label: t('about_ember'), action: toggleAbout },
      ],
    },
  ];

  return (
    <div
      className="title-bar"
      ref={barRef}
      // @ts-ignore — propiedad de Electron WebKit
      style={{ WebkitAppRegion: 'drag' }}
    >
      {/* Left: App identity + menus */}
      {/* @ts-ignore */}
      <div className="tb-left" style={{ WebkitAppRegion: 'no-drag' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginRight: '16px' }}>
          <img src="logo.png" alt="" style={{ height: '36px', width: 'auto', transform: 'scale(1.2)', transformOrigin: 'left center' }} />
        </div>
        {!isManual && (
          <div className="tb-menus">
            {menus.map(group => (
              <MenuDropdown
                key={group.label}
                group={group}
                isOpen={openMenu === group.label}
                onToggle={() => toggle(group.label)}
                onClose={() => setOpenMenu(null)}
              />
            ))}
          </div>
        )}
        {isManual && (
          <span style={{
            fontSize: '11px',
            color: 'var(--text-secondary)',
            marginLeft: '8px',
            fontFamily: 'Fira Sans, sans-serif',
            opacity: 0.8
          }}>
            {t('user_manual')}
          </span>
        )}
      </div>

      {/* Center: Window title (draggable) */}
      <div className="tb-center" />

      {/* Right: Window controls */}
      {/* @ts-ignore */}
      <div className="tb-controls" style={{ WebkitAppRegion: 'no-drag' }}>
        <button
          className="tb-ctrl tb-ctrl-minimize"
          onClick={handleMinimize}
          aria-label={t('minimize')}
          title={t('minimize')}
        >
          <svg width="10" height="1" viewBox="0 0 10 1">
            <rect width="10" height="1" fill="currentColor" />
          </svg>
        </button>
        <button
          className="tb-ctrl tb-ctrl-maximize"
          onClick={handleMaximize}
          aria-label={isMaximized ? t('restore') : t('maximize')}
          title={isMaximized ? t('restore') : t('maximize')}
        >
          {isMaximized ? (
            <svg width="10" height="10" viewBox="0 0 10 10">
              <path d="M0 3h7v7H0V3zm1 1v5h5V4H1zM3 0h7v7H9V1H3V0z" fill="currentColor" />
            </svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 10 10">
              <rect width="10" height="10" rx="0" fill="none" stroke="currentColor" strokeWidth="1" />
            </svg>
          )}
        </button>
        <button
          className="tb-ctrl tb-ctrl-close"
          onClick={handleClose}
          aria-label={t('close')}
          title={t('close')}
        >
          <svg width="10" height="10" viewBox="0 0 10 10">
            <line x1="0" y1="0" x2="10" y2="10" stroke="currentColor" strokeWidth="1.2" />
            <line x1="10" y1="0" x2="0" y2="10" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </button>
      </div>
    </div>
  );
};
