import React, { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Components } from 'react-markdown'
import './ManualView.css'

// El prompt maestro extraído del doc para el botón de copiar
const MASTER_PROMPT = `Actúa como un desarrollador senior de gráficos de video. Necesito que crees un Plugin completo para el Dynamic Vector Graphics Engine (DVGE) v3.1.0.

El objetivo del plugin es generar un gráfico visual dinámico para producción audiovisual profesional. El plugin debe verse elegante, moderno y de calidad broadcast.

---

## ESTRUCTURA REQUERIDA

Debes generar EXACTAMENTE 4 archivos. Si tu plataforma permite crear un archivo .zip, hazlo. Si no, devuelve cada archivo en un bloque de código markdown bien etiquetado con el nombre del archivo en la primera línea.

---

## ARCHIVO 1: manifest.json

Schema de propiedades editables. Usa los tipos: "string", "number", "color", "image".

Estructura exacta:
{
  "id": "nombre-carpeta-unico",
  "name": "Nombre Visible en la App",
  "description": "Una descripción clara.",
  "version": "1.0.0",
  "schema": [
    { "type": "string", "id": "propiedadClave", "label": "Etiqueta UI", "defaultValue": "Valor por Defecto" }
  ]
}

---

## ARCHIVO 2: index.html

Marcado HTML del gráfico. REGLAS OBLIGATORIAS:
- Sin etiquetas <html>, <head> ni <body>.
- Usa siempre un div raíz con id="contenedor-principal" o similar.
- Todos los elementos que se animen o muestren datos deben tener IDs únicos.

---

## ARCHIVO 3: style.css

CSS estándar. REGLAS OBLIGATORIAS:
- El lienzo es de 1920x1080 píxeles con posicionamiento absoluto.
- Diseño de calidad broadcast: usa tipografías modernas, gradientes, sombras.
- Usa variables CSS (var(--color-principal)) para los valores dinámicos del manifest.

---

## ARCHIVO 4: script.js

La lógica de animación. REGLAS CRÍTICAS E IRROMPIBLES:
- SIEMPRE usar dvEngine.register({ awake, start, update }).
- NUNCA usar document.getElementById(); usar SIEMPRE ctx.root.getElementById().
- NUNCA usar window.requestAnimationFrame(); el motor usa ctx.frame.
- Enlazar todos los datos del manifest (ctx.props) dentro del hook UPDATE para reactividad en tiempo real.
- Las animaciones deben basarse matemáticamente en ctx.frame con funciones de easing.
- **OPTIMIZACIÓN:** Usa las utilidades nativas en \`dvEngine.utils\` para animaciones suaves (lerp, clamp, easeOutCubic, easeOutBounce, easeOutElastic, hexToRgb).

Plantilla estricta:
dvEngine.register({
  awake: (ctx) => {
    // Capturar referencias DOM e inicializar estilos estáticos.
  },
  start: (ctx) => {
    // Lógica que se ejecuta al inicio de la reproducción (frame 0).
  },
  update: (ctx) => {
    const { frame, root, props, utils } = ctx;

    // 1. Enlace reactivo de datos (hacer esto siempre primero)
    const miElemento = root.getElementById('mi-elemento');
    if (!miElemento) return;
    miElemento.innerText = props.propiedadClave || 'Valor';

    // 2. Animaciones matemáticas basadas en frame usando utilidades nativas
    const progreso = Math.min(1, frame / 30);
    miElemento.style.opacity = utils.easeOutCubic(progreso).toString();
  }
});

---

## MI DESCRIPCIÓN DEL PLUGIN

[ESCRIBE AQUÍ TU DESCRIPCIÓN. Ejemplo: "Quiero una banda de texto inferior para entrevistas. Debe mostrar el nombre del entrevistado y su cargo. El estilo debe ser minimalista y oscuro con una línea de acento en color naranja. La animación de entrada debe ser un deslizamiento desde abajo."]`

// Componente de bloque de código con botón de copiar
const CodeBlock: React.FC<{ children?: React.ReactNode; className?: string }> = ({ children, className }) => {
    const [copied, setCopied] = useState(false)
    
    // Normalizar texto para comparación robusca (line endings)
    const rawText = React.Children.toArray(children).join('').replace(/\r\n/g, '\n')
    const normalizedMaster = MASTER_PROMPT.replace(/\r\n/g, '\n')
    
    // Detección robusta: El bloque del prompt maestro contiene este encabezado único
    const isPromptBlock = rawText.includes('## MI DESCRIPCIÓN DEL PLUGIN')

    const handleCopy = () => {
        const textToCopy = isPromptBlock ? normalizedMaster : rawText
        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        })
    }

    return (
        <div style={{ 
            position: 'relative', 
            margin: '20px 0',
            background: '#0d0d0d',
            borderRadius: '10px',
            border: `1px solid ${isPromptBlock ? '#E44C30' : '#222'}`,
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 16px',
                background: isPromptBlock ? 'rgba(228, 76, 48, 0.1)' : '#161616',
                borderBottom: `1px solid ${isPromptBlock ? '#E44C30' : '#222'}`,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ 
                        fontSize: '10px', 
                        color: isPromptBlock ? '#E44C30' : '#666', 
                        fontFamily: 'monospace', 
                        fontWeight: '800',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                    }}>
                        {isPromptBlock ? '🚀 SUPER PROMPT MAESTRO' : (className?.replace('language-', '') || 'BLOQUE DE CÓDIGO')}
                    </span>
                    {isPromptBlock && <span style={{ fontSize: '10px', background: '#E44C30', color: 'white', padding: '1px 5px', borderRadius: '3px', fontWeight: 'bold' }}>RECOMENDADO</span>}
                </div>
                <button
                    onClick={handleCopy}
                    style={{
                        background: copied ? '#4ade80' : (isPromptBlock ? '#E44C30' : '#333'),
                        color: copied ? '#000' : '#fff',
                        border: 'none',
                        borderRadius: '5px',
                        padding: '5px 12px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        transform: copied ? 'scale(1.05)' : 'scale(1)',
                    }}
                >
                    {copied ? '¡COPIADO!' : (isPromptBlock ? 'COPIAR SUPER PROMPT' : 'COPIAR')}
                </button>
            </div>
            <pre style={{ 
                margin: 0, 
                padding: '20px', 
                overflowX: 'auto',
                fontSize: '13px',
                lineHeight: '1.6',
                color: '#ddd',
                background: 'transparent',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                maxHeight: 'none',
                overflowY: 'visible'
            }}>
                <code className={className} style={{ fontFamily: '"JetBrains Mono", "Fira Code", monospace' }}>{children}</code>
            </pre>
        </div>
    )
}

const DOCS = [
    { id: 'USER_MANUAL.md', label: 'Manual de Usuario' },
    { id: 'TECHNICAL.md', label: 'Documentación Técnica' },
    { id: 'AI_PLUGIN_GUIDE.md', label: 'Guía IA / Super-Prompt' },
    { id: 'LEGAL.md', label: 'Aviso Legal' },
    { id: 'PLUGIN_POLICY.md', label: 'Política de Plugins' },
]

const mdComponents: Partial<Components> = {
    // Evitar doble pre-anidamiento que rompe el diseño
    pre({ children }) {
        return <>{children}</>
    },
    code({ node, className, children, ...props }) {
        const match = /language-(\w+)/.exec(className || '')
        // Consideramos bloque si tiene lenguaje O si el texto tiene saltos de línea
        const textContent = String(children)
        const isBlock = !!match || textContent.includes('\n')
        
        if (isBlock) {
            return <CodeBlock className={className}>{children}</CodeBlock>
        }
        return <code className={className} style={{ background: 'rgba(255,255,255,0.1)', color: '#ff7b72', padding: '2px 6px', borderRadius: '4px', fontSize: '0.85em', fontFamily: 'monospace' }} {...props}>{children}</code>
    }
}

export const ManualView: React.FC = () => {
    const [content, setContent] = useState<string>('Cargando...')
    const [activeDoc, setActiveDoc] = useState<string>('USER_MANUAL.md')

    useEffect(() => {
        const fetchContent = async () => {
            try {
                // @ts-ignore
                const data = await window.ipcRenderer.getDocContent(activeDoc)
                setContent(data)
            } catch (err) {
                setContent('# Error\nNo se pudo cargar el documento.')
            }
        }
        setContent('Cargando...')
        fetchContent()
    }, [activeDoc])

    return (
        <div style={{ display: 'flex', height: '100vh', width: '100vw', background: '#0a0a0a', color: 'white', fontFamily: 'Inter, sans-serif' }}>
            {/* Sidebar de navegación */}
            <div style={{ width: '240px', background: '#111', borderRight: '1px solid #222', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
                <div style={{ fontSize: '11px', color: '#555', fontWeight: '600', letterSpacing: '1px', marginBottom: '12px', textTransform: 'uppercase' }}>Documentación</div>
                {DOCS.map(doc => (
                    <button
                        key={doc.id}
                        onClick={() => setActiveDoc(doc.id)}
                        style={{
                            background: activeDoc === doc.id ? '#1e1e1e' : 'transparent',
                            color: activeDoc === doc.id ? '#E44C30' : '#aaa',
                            border: activeDoc === doc.id ? '1px solid #333' : '1px solid transparent',
                            padding: '10px 14px',
                            textAlign: 'left',
                            cursor: 'pointer',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: activeDoc === doc.id ? '600' : '400',
                            transition: 'all 0.2s',
                        }}
                    >
                        {doc.label}
                    </button>
                ))}
            </div>

            {/* Área de contenido */}
            <div className="manual-container" style={{ flex: 1, overflowY: 'auto' }}>
                <div className="manual-content">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                        {content}
                    </ReactMarkdown>
                </div>
            </div>
        </div>
    )
}
