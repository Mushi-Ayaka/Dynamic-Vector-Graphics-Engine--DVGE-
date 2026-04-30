import React, { useState } from 'react'
import { useStore } from '../store/useStore'
import { FileCode, FileText, FileJson, BookOpen } from 'lucide-react'

export const TemplateCodePanel: React.FC = () => {
  const { activePlugin, activePluginFiles } = useStore()
  const [activeTab, setActiveTab] = useState<'html' | 'css' | 'js' | 'pdf'>('html')

  if (!activePlugin || !activePluginFiles) return null;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      background: 'var(--bg-secondary)',
      borderTop: '1px solid var(--border)',
      overflow: 'hidden'
    }}>
      {/* Header / Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-surface)'
      }}>
        <TabButton 
          active={activeTab === 'html'} 
          onClick={() => setActiveTab('html')}
          icon={<FileCode size={14} />}
          label="HTML"
        />
        <TabButton 
          active={activeTab === 'css'} 
          onClick={() => setActiveTab('css')}
          icon={<FileText size={14} />}
          label="CSS"
        />
        <TabButton 
          active={activeTab === 'js'} 
          onClick={() => setActiveTab('js')}
          icon={<FileJson size={14} />}
          label="JS"
        />
        <TabButton 
          active={activeTab === 'pdf'} 
          onClick={() => setActiveTab('pdf')}
          icon={<BookOpen size={14} />}
          label="Context PDF"
        />
      </div>

      {/* Content Area */}
      <div style={{ flex: 1, overflow: 'auto', padding: '12px', background: '#0d0d0d' }}>
        {activeTab === 'pdf' ? (
          <div style={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'var(--text-disabled)',
            textAlign: 'center',
            gap: '12px'
          }}>
            <BookOpen size={32} opacity={0.5} />
            <p style={{ fontSize: '12px' }}>
              El visor de PDF modular se implementará en la próxima fase.<br/>
              (Aquí se mostrarán las reglas del template).
            </p>
          </div>
        ) : (
          <pre style={{ 
            margin: 0, 
            fontSize: '11px', 
            color: 'var(--text-secondary)',
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all'
          }}>
            {activePluginFiles[activeTab] || `/* No hay código ${activeTab.toUpperCase()} para esta plantilla */`}
          </pre>
        )}
      </div>
    </div>
  )
}

const TabButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button
    onClick={onClick}
    style={{
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
      padding: '8px 0',
      background: active ? 'var(--bg-secondary)' : 'transparent',
      border: 'none',
      borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
      color: active ? 'var(--text-primary)' : 'var(--text-disabled)',
      fontSize: '10px',
      fontWeight: 600,
      cursor: 'pointer',
      outline: 'none',
      transition: 'all 0.2s'
    }}
  >
    {icon}
    {label}
  </button>
)
