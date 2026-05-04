import React, { useState } from 'react'
import { useStore } from '../store/useStore'
import { FileCode, FileJson, AlertTriangle, GripHorizontal, Info, Layers, Code2, Film } from 'lucide-react'

// ─────────────────────────────────────────────
// Tipos de preset de estilo
// ─────────────────────────────────────────────
const STYLE_PRESETS = [
  { id: 'block-reveal', label: 'Block Reveal', desc: 'Efecto editorial de cortina de color y revelación mecánica.' },
  { id: 'glassmorphism', label: 'Glassmorphism', desc: 'Cristal técnico, refracción dinámica y micro-grids.' },
  { id: 'kinetic-text', label: 'Kinetic Text', desc: 'Tipografía brutalista, impacto percusivo y drift infinito.' },
  { id: 'broadcast', label: 'Broadcast', desc: 'Gráficos de TV institucionales, lower thirds y wipes.' },
  { id: 'cyberpunk-hud', label: 'Cyberpunk HUD', desc: 'Interfaz Sci-Fi, glitch determinista y scanlines.' },
  { id: 'studio-showcase', label: 'Studio Showcase', desc: 'Presentación de producto premium, luz de superficie y flotación.' },
  { id: 'data-viz-analytic', label: 'Data Analytic', desc: 'Gráficas de barras, ejes Y, grid-lines y respiración idle.' },
  { id: 'publicidad-motion', label: 'Publicidad', desc: 'Motion graphics de marca, claims de impacto y cinema bars.' },
  { id: 'live-production', label: 'Live Production', desc: 'Estética de eSports, tickers infinitos y datos en vivo.' },
  { id: 'minimal-elegant', label: 'Minimal Elegant', desc: 'Editorial de lujo, serif premium y espaciado pausado.' },
  { id: 'cinematic', label: 'Cinematic', desc: 'Trailer de cine, letterbox (2.35:1) y grano fílmico.' },
]

// ─────────────────────────────────────────────
// Genera el texto del prompt maestro real (Sincronizado con main.ts)
// ─────────────────────────────────────────────
function buildPromptPreview(options: any, project: any): string {
  const divider = '━'.repeat(64)
  const subDivider = '─'.repeat(64)
  const selectedPresets = STYLE_PRESETS.filter(p => options.stylePresets?.includes(p.id))

  let out = `DVGE PROJECT CONTEXT — ${project.name.toUpperCase()}\n`
  out += `VERSIÓN: ${new Date().toISOString().split('T')[0]} | PLUGIN: ${project.pluginId || 'active-template'} | ESTADO: PROYECTO ACTIVO\n`
  out += `Este documento contiene el contexto vivo del proyecto y su configuración. La IA debe\nbasarse estrictamente en estos valores para generar el código.\n\n`

  if (options.includeCanvas) {
    const width = project.width || 1920
    const height = project.height || 1080
    const fps = project.fps || 60
    const duration = project.durationInFrames || 240
    const seconds = (duration / fps).toFixed(1)

    out += `⚙️ Configuración del Canvas (Video)\n`
    out += `${subDivider}\n`
    out += `Resolución     : ${width}x${height}\n`
    out += `Framerate      : ${fps} FPS\n`
    out += `Duración Total : ${duration} frames (${seconds}s)\n\n`
  }

  if (project.creativeBrief) {
    out += `🎨 Brief Creativo\n`
    out += `${subDivider}\n`
    out += `${project.creativeBrief}\n\n`
  }

  if (options.includeArtifacts && project.artifacts.length > 0) {
    out += `🎨 Artefactos Disponibles\n`
    out += `${subDivider}\n`
    out += `A continuación se listan los artefactos inyectados para este proyecto y el código exacto necesario\npara implementarlos. NO inventes otros IDs ni uses getArtifact().\n\n`

    project.artifacts.forEach((a: any) => {
      const isDataset = a.type === 'dataset'
      const typeLabel = isDataset ? 'Dataset / Tabular' : (a.type === 'video' ? 'Video' : 'Imagen')
      out += `■ ${a.label} (${typeLabel}) [ID: ${a.id}]\n`

      if (isDataset) {
        out += `  [HTML]\n  <div id="container_${a.id}"></div>\n`
        out += `  [JAVASCRIPT]\n`
        out += `  const rawData_${a.id} = props['${a.id}'];\n`
        out += `  const data_${a.id} = JSON.parse(rawData_${a.id} || '[["Col1", "Col2"]]');\n`
        
        if (options.includeDataPreview && a.value) {
          try {
            const d = JSON.parse(a.value);
            if (d.length > 0) {
              // Enviamos todo el dataset (o un límite razonable de 500 filas)
              const preview = d.length > 500 ? d.slice(0, 500) : d;
              out += `  [FULL DATASET]\n  ${JSON.stringify(preview, null, 2).split('\n').join('\n  ')}\n`
              if (d.length > 500) out += `  ... (truncado por tamaño, total: ${d.length} filas)\n`
            }
          } catch(e) {}
        }
        
        out += `  // ... (lógica de iteración y renderizado inyectada)\n`
      }
      out += `\n`
    })
  }

  if (options.includeCode) {
    out += `💻 Código Fuente Actual\n`
    out += `${subDivider}\n`
    out += `Se ha adjuntado el código HTML, CSS y JS actual de la plantilla para permitir refactorizaciones\ny mantenimiento de la estructura existente.\n\n`
  }

  if (selectedPresets.length > 0) {
    out += `⚠️ CRITICAL DIRECTIVE: MANDATORY ANIMATION STYLE PRESETS\n`
    out += `${subDivider}\n`
    out += `You MUST strictly follow these technical and aesthetic guidelines for the requested animation.\n\n`
    selectedPresets.forEach(p => {
      out += `[STYLE PRESET: ${p.id.toUpperCase()}]\n`
      out += `› ${p.label}: ${p.desc}\n`
    })
    out += `\n`
  }

  out += `\n${divider}\n`
  out += `MASTER RULES & LOGIC (Inyectado automáticamente en el PDF final)\n`
  out += `1. Determinismo absoluto mediante frame-accurate timing.\n`
  out += `2. Uso obligatorio de Shadow DOM (ctx.root).\n`
  out += `3. Prohibido el uso de APIs de tiempo globales (setTimeout, setInterval).\n`

  return out
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────
export const TemplateCodePanel: React.FC = () => {
  const {
    activePlugin, activePluginFiles,
    contextOptions, updateContextOptions,
    getProjectContext, templateTab, setTemplateTab
  } = useStore()

  const [showPresetsInfo, setShowPresetsInfo] = useState(false)

  if (!activePlugin || !activePluginFiles) return null

  // ── Modo Modal: Context Builder ──────────────
  if (templateTab === 'pdf') {
    const project = getProjectContext()
    const stylePresets: string[] = contextOptions.stylePresets || []

    const togglePreset = (id: string) => {
      const next = stylePresets.includes(id)
        ? stylePresets.filter(p => p !== id)
        : [...stylePresets, id]
      updateContextOptions({ stylePresets: next } as any)
    }

    const preview = buildPromptPreview({ ...contextOptions, stylePresets }, project)

    return (
      <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>

        {/* ── COL IZQUIERDA: Export ── */}
        <div style={{
          width: '160px', flexShrink: 0,
          display: 'flex', flexDirection: 'column',
          borderRight: '1px solid var(--border)',
          padding: '16px 12px', gap: '12px'
        }}>
          {/* Token warning */}
          <div style={{
            padding: '10px', background: 'rgba(228,76,48,0.07)',
            border: '1px solid rgba(228,76,48,0.2)',
            display: 'flex', flexDirection: 'column', gap: '4px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--accent)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              <AlertTriangle size={11} />
              Token Budget
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '10px', margin: 0, lineHeight: 1.5 }}>
              Activa solo los bloques que la IA realmente necesita. Más contexto = mayor latencia y costo.
            </p>
          </div>

          {/* Drag zone — compacto */}
          <div
            className="dv-pdf-drag"
            draggable
            onDragStart={async (e) => {
              e.preventDefault()
              if (!window.ipcRenderer) return
              const pdfPath = await window.ipcRenderer.generateRulesPdf({
                rulesText: 'AUTO_GENERATED',
                projectContext: project,
                options: contextOptions
              })
              if (pdfPath) window.ipcRenderer.startDrag(pdfPath)
            }}
            title="Arrastra el PDF hacia tu IA"
            style={{
              padding: '12px 8px',
              border: '1px dashed rgba(228,76,48,0.5)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: '6px', cursor: 'grab',
              color: 'var(--text-disabled)', fontSize: '10px',
              textAlign: 'center', lineHeight: 1.4,
              transition: 'all 0.2s',
              userSelect: 'none'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent)'
              e.currentTarget.style.color = 'var(--accent)'
              e.currentTarget.style.background = 'rgba(228,76,48,0.05)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = 'rgba(228,76,48,0.5)'
              e.currentTarget.style.color = 'var(--text-disabled)'
              e.currentTarget.style.background = 'transparent'
            }}
          >
            <GripHorizontal size={16} />
            <span>Exportar PDF<br />y arrastrar a la IA</span>
          </div>
        </div>

        {/* ── COL CENTRAL: Preview ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRight: '1px solid var(--border)' }}>
          <pre 
            className="dv-prompt-preview"
            style={{
            flex: 1, margin: 0, padding: '16px',
            background: '#050505',
            color: 'var(--text-secondary)',
            fontFamily: 'JetBrains Mono, Fira Code, monospace',
            fontSize: '10.5px', lineHeight: 1.7,
            overflow: 'auto', whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}>
            {preview}
          </pre>
        </div>

        {/* ── COL DERECHA: Configuración ── */}
        <div style={{
          width: '220px', flexShrink: 0,
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden auto', padding: '16px 12px', gap: '0'
        }}>
          {/* Sección: Bloques de contexto */}
          <div className="dv-context-options" style={{ marginBottom: '20px' }}>
            <p style={{ margin: '0 0 10px', fontSize: '9px', fontWeight: 700, color: 'var(--text-label)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
              Bloques de contexto
            </p>
            {[
              { key: 'includeCanvas', icon: <Film size={12} />, label: 'Canvas', desc: 'Resolución, FPS y duración del proyecto.' },
              { key: 'includeArtifacts', icon: <Layers size={12} />, label: 'Artefactos', desc: 'Imágenes, videos y datasets vinculados.' },
              { key: 'includeDataPreview', icon: <FileJson size={12} />, label: 'Datos (Preview)', desc: 'Incluye muestras reales de las tablas para la IA.' },
              { key: 'includeCode', icon: <Code2 size={12} />, label: 'Código fuente', desc: 'HTML, CSS y JS de la plantilla activa.' },
            ].map(({ key, icon, label, desc }) => {
              const checked = (contextOptions as any)[key] as boolean
              return (
                <label
                  key={key}
                  style={{
                    display: 'flex', gap: '10px', padding: '9px 10px',
                    borderBottom: '1px solid var(--border)',
                    cursor: 'pointer',
                    background: checked ? 'rgba(228,76,48,0.06)' : 'transparent',
                    transition: 'background 0.15s',
                    userSelect: 'none'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => updateContextOptions({ [key]: e.target.checked } as any)}
                    style={{ flexShrink: 0, marginTop: '2px', accentColor: 'var(--accent)', cursor: 'pointer' }}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: checked ? 'var(--text-primary)' : 'var(--text-secondary)', fontSize: '11px', fontWeight: 600 }}>
                      {icon} {label}
                    </div>
                    <div style={{ color: 'var(--text-disabled)', fontSize: '10px', marginTop: '2px', lineHeight: 1.4 }}>
                      {desc}
                    </div>
                  </div>
                </label>
              )
            })}
          </div>

          {/* Sección: Animation Style Presets */}
          <div className="dv-style-presets">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <p style={{ margin: 0, fontSize: '9px', fontWeight: 700, color: 'var(--text-label)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                Animation Style Presets
              </p>
              <button
                onClick={() => setShowPresetsInfo(v => !v)}
                title="¿Qué son los Animation Style Presets?"
                style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: showPresetsInfo ? 'var(--accent)' : 'var(--text-disabled)',
                  padding: '0', display: 'flex', alignItems: 'center',
                  transition: 'color 0.15s'
                }}
              >
                <Info size={13} />
              </button>
            </div>

            {showPresetsInfo && (
              <div style={{
                padding: '10px', marginBottom: '10px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border)',
                fontSize: '10px', color: 'var(--text-secondary)', lineHeight: 1.5
              }}>
                Los <strong style={{ color: 'var(--text-primary)' }}>Animation Style Presets</strong> inyectan una gramática visual al prompt: paletas, efectos, timing patterns y convenciones de composición propias de cada estilo. Combina varios para proyectos complejos.
              </div>
            )}

            {STYLE_PRESETS.map(preset => {
              const active = stylePresets.includes(preset.id)
              return (
                <label
                  key={preset.id}
                  style={{
                    display: 'flex', gap: '10px', padding: '9px 10px',
                    borderBottom: '1px solid var(--border)',
                    cursor: 'pointer',
                    background: active ? 'rgba(228,76,48,0.06)' : 'transparent',
                    transition: 'background 0.15s',
                    userSelect: 'none'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => togglePreset(preset.id)}
                    style={{ flexShrink: 0, marginTop: '2px', accentColor: 'var(--accent)', cursor: 'pointer' }}
                  />
                  <div>
                    <div style={{ color: active ? 'var(--text-primary)' : 'var(--text-secondary)', fontSize: '11px', fontWeight: 600 }}>
                      {preset.label}
                    </div>
                    <div style={{ color: 'var(--text-disabled)', fontSize: '10px', marginTop: '2px', lineHeight: 1.4 }}>
                      {preset.desc}
                    </div>
                  </div>
                </label>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // ── Modo Panel (código fuente) ──────────────
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', flex: 1,
      background: 'var(--bg-secondary)',
      borderTop: '1px solid var(--border)', overflow: 'hidden'
    }}>
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
        <TabButton className="dv-tab-html" active={templateTab === 'html'} onClick={() => setTemplateTab('html')} icon={<FileCode size={14} />} label="HTML" />
        <TabButton className="dv-tab-css" active={templateTab === 'css'} onClick={() => setTemplateTab('css')} icon={<FileCode size={14} />} label="CSS" />
        <TabButton className="dv-tab-js" active={templateTab === 'js'} onClick={() => setTemplateTab('js')} icon={<FileJson size={14} />} label="JS" />
      </div>
      <div className="dv-code-viewer" style={{ flex: 1, overflow: 'auto', padding: '12px', background: '#0d0d0d' }}>
        <pre style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, Fira Code, monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
          {activePluginFiles[templateTab as 'html' | 'css' | 'js'] || `/* No hay código ${templateTab.toUpperCase()} para esta plantilla */`}
        </pre>
      </div>
    </div>
  )
}

const TabButton = ({ active, onClick, icon, label, className }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string, className?: string }) => (
  <button
    onClick={onClick}
    className={className}
    style={{
      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
      padding: '8px 0', background: active ? 'var(--bg-secondary)' : 'transparent',
      border: 'none', borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
      color: active ? 'var(--text-primary)' : 'var(--text-disabled)',
      fontSize: '10px', fontWeight: 600, cursor: 'pointer', outline: 'none', transition: 'all 0.2s'
    }}
  >
    {icon}{label}
  </button>
)
