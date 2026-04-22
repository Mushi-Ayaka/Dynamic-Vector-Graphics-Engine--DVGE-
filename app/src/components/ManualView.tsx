import React, { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Components } from 'react-markdown'
import './ManualView.css'

// Componente de bloque de código con botón de copiar
const CodeBlock: React.FC<{ children?: React.ReactNode; className?: string }> = ({ children, className }) => {
    const [copied, setCopied] = useState(false)

    // Normalizar texto para comparación robusca (line endings)
    const rawText = React.Children.toArray(children).join('').replace(/\r\n/g, '\n')

    // Detección robusta: El bloque del prompt maestro contiene este encabezado único
    const isPromptBlock = rawText.includes('PLUGIN DESCRIPTION:')

    const handleCopy = () => {
        navigator.clipboard.writeText(rawText).then(() => {
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
                        {isPromptBlock ? 'PROMPT' : (className?.replace('language-', '') || 'BLOQUE DE CÓDIGO')}
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
                    {copied ? '¡COPIADO!' : (isPromptBlock ? 'COPIAR PROMPT' : 'COPIAR')}
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
    { id: 'AI_PLUGIN_GUIDE.md', label: 'Guía de Plugins' },
    { id: 'PLUGIN_POLICY.md', label: 'Política de Plugins' },
    { id: 'LEGAL.md', label: 'Aviso Legal' },
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
