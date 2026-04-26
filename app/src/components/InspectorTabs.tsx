import React, { useState } from 'react';
import { SlidersHorizontal, Layers, ListVideo, Copy, Check, Maximize2 } from 'lucide-react';
import { FormField } from '../env';
import { CodeEditorModal } from './CodeEditorModal';

interface InspectorTabsProps {
    schema: FormField[];
    properties: Record<string, any>;
    onChange: (id: string, value: any) => void;
}

const DynamicField: React.FC<{
    field: FormField;
    value: any;
    onChange: (id: string, value: any) => void;
    onExpandCode?: (field: FormField, value: string) => void;
}> = ({ field, value, onChange, onExpandCode }) => {
    const [copied, setCopied] = useState(false);
    const [localNum, setLocalNum] = useState(value?.toString() || field.defaultValue?.toString() || '0');

    React.useEffect(() => {
        // Solo sincronizar si no tenemos el foco para no interrumpir la escritura
        if (field.type === 'number' && document.activeElement?.id !== field.id) {
            setLocalNum(value?.toString() || field.defaultValue?.toString() || '0');
        }
    }, [value, field.id, field.type, field.defaultValue]);

    const labelStyle: React.CSSProperties = {
        display: 'block',
        fontSize: '10px',
        color: 'var(--text-label)',
        textTransform: 'uppercase',
        fontWeight: 600,
        marginBottom: '4px',
        fontFamily: 'var(--font-body)'
    };

    switch (field.type) {
        case 'number':
            return (
                <div className="dv-field" style={{ marginBottom: '12px' }}>
                    <label style={labelStyle}>{field.label}</label>
                    <input
                        id={field.id}
                        type="number"
                        className="dv-input"
                        value={localNum}
                        onChange={(e) => setLocalNum(e.target.value)}
                        onBlur={(e) => {
                            const val = parseFloat(e.target.value);
                            onChange(field.id, isNaN(val) ? field.defaultValue : val);
                        }}
                        onFocus={(e) => e.target.select()}
                    />
                </div>
            );
        case 'color':
            return (
                <div className="dv-field" style={{ marginBottom: '12px' }}>
                    <label style={labelStyle}>{field.label}</label>
                    <input
                        type="color"
                        className="dv-input"
                        style={{ height: '32px', padding: '2px', cursor: 'pointer' }}
                        value={value ?? field.defaultValue}
                        onChange={(e) => onChange(field.id, e.target.value)}
                    />
                </div>
            );
        case 'prompt':
            return (
                <div className="dv-field" style={{ marginBottom: '12px' }}>
                    <label style={labelStyle}>{field.label}</label>
                    <div 
                        draggable
                        onDragStart={async (e) => {
                            e.preventDefault();
                            if (window.ipcRenderer) {
                                const pdfPath = await window.ipcRenderer.generateRulesPdf(String(field.defaultValue));
                                window.ipcRenderer.startDrag(pdfPath);
                            }
                        }}
                        style={{
                            padding: '12px',
                            border: '1px dashed var(--accent)',
                            borderRadius: '4px',
                            textAlign: 'center',
                            cursor: 'grab',
                            background: 'rgba(59,130,246,0.05)',
                            transition: 'all 0.2s'
                        }}
                    >
                        <div style={{ fontSize: '18px', marginBottom: '4px' }}>📄</div>
                        <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>{field.defaultValue}</div>
                        <div style={{ fontSize: '9px', color: 'var(--text-disabled)', marginTop: '4px' }}>ARRÁSTRAME A TU IA</div>
                    </div>
                </div>
            );
        case 'info':
            return (
                <div className="dv-field" style={{ marginBottom: '12px' }}>
                    <label style={labelStyle}>{field.label}</label>
                    <div style={{ position: 'relative' }}>
                        <textarea
                            readOnly
                            className="dv-input"
                            style={{ 
                                fontFamily: 'var(--font-mono)', 
                                height: '80px', 
                                fontSize: '10px',
                                background: 'rgba(59,130,246,0.03)',
                                border: '1px solid var(--border)',
                                color: 'var(--text-secondary)',
                                cursor: 'default',
                                resize: 'none'
                            }}
                            value={field.defaultValue}
                        />
                        <button 
                            onClick={() => {
                                navigator.clipboard.writeText(String(field.defaultValue));
                                setCopied(true);
                                console.log('[DVGE] Texto copiado al portapapeles');
                                setTimeout(() => setCopied(false), 2000);
                            }}
                            style={{
                                position: 'absolute',
                                top: '5px',
                                right: '5px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '3px 8px',
                                fontSize: '9px',
                                background: copied ? 'var(--success)' : 'var(--bg-elevated)',
                                border: '1px solid var(--border)',
                                borderRadius: '2px',
                                color: 'white',
                                cursor: 'pointer'
                            }}
                        >
                            {copied ? <Check size={10} /> : <Copy size={10} />}
                            {copied ? 'COPIADO' : 'COPIAR'}
                        </button>
                    </div>
                </div>
            );
        case 'code':
            return (
                <div className="dv-field" style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <label style={{ ...labelStyle, marginBottom: 0 }}>{field.label}</label>
                        <button 
                            onClick={() => onExpandCode?.(field, value ?? field.defaultValue)}
                            style={{ 
                                background: 'transparent', 
                                border: 'none', 
                                color: 'var(--text-disabled)', 
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                padding: '2px'
                            }}
                            title="Expandir editor"
                        >
                            <Maximize2 size={12} />
                        </button>
                    </div>
                    <div style={{ position: 'relative' }}>
                        <textarea
                            className="dv-input"
                            style={{ 
                                fontFamily: 'var(--font-mono)', 
                                height: '100px', 
                                resize: 'vertical',
                                fontSize: '11px',
                                lineHeight: '1.5'
                            }}
                            value={value ?? field.defaultValue}
                            onChange={(e) => onChange(field.id, e.target.value)}
                            spellCheck={false}
                        />
                    </div>
                </div>
            );
        case 'select':
            return (
                <div className="dv-field" style={{ marginBottom: '12px' }}>
                    <label style={labelStyle}>{field.label}</label>
                    <select
                        className="dv-input"
                        value={value ?? field.defaultValue}
                        onChange={(e) => onChange(field.id, e.target.value)}
                    >
                        {field.options?.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
            );
        default:
            return (
                <div className="dv-field" style={{ marginBottom: '12px' }}>
                    <label style={labelStyle}>{field.label}</label>
                    <input
                        className="dv-input"
                        value={value ?? field.defaultValue}
                        onChange={(e) => onChange(field.id, e.target.value)}
                    />
                </div>
            );
    }
};

export const InspectorTabs: React.FC<InspectorTabsProps> = ({ schema, properties, onChange }) => {
    const [activeTab, setActiveTab] = useState<'props' | 'layers' | 'queue'>('props');
    const [codeModal, setCodeModal] = useState<{ field: FormField; value: string } | null>(null);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Tab Headers */}
            <div style={{ 
                height: '40px',
                padding: '0 12px',
                background: 'var(--bg-secondary)', 
                borderBottom: '1px solid var(--border)',
                display: 'flex', 
                alignItems: 'center',
                gap: '10px'
            }}>
                <button 
                    onClick={() => setActiveTab('props')}
                    className={`tab-btn ${activeTab === 'props' ? 'active' : ''}`}
                >
                    <SlidersHorizontal size={14} /> Props
                </button>
                <button 
                    disabled
                    className="tab-btn disabled"
                    title="Layer Inspector — Disponible en próximas versiones"
                >
                    <Layers size={14} /> Layers
                </button>
                <button 
                    disabled
                    className="tab-btn disabled"
                    title="Render Queue — Disponible en próximas versiones"
                >
                    <ListVideo size={14} /> Queue
                </button>
            </div>

            {/* Tab Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '15px' }}>
                {activeTab === 'props' && (
                    <div>
                        {schema.map(field => (
                            <DynamicField 
                                key={field.id}
                                field={field}
                                value={properties[field.id]}
                                onChange={onChange}
                                onExpandCode={(field, value) => setCodeModal({ field, value })}
                            />
                        ))}
                    </div>
                )}
                {activeTab === 'layers' && (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-disabled)' }}>
                        <Layers size={32} style={{ marginBottom: '12px', opacity: 0.2 }} />
                        <div style={{ fontSize: '11px' }}>Layer Inspector llegará en la v6.0</div>
                    </div>
                )}
            </div>

            {codeModal && (
                <CodeEditorModal 
                    field={codeModal.field}
                    initialValue={codeModal.value}
                    onClose={() => setCodeModal(null)}
                    onChange={(newValue) => {
                        onChange(codeModal.field.id, newValue);
                    }}
                />
            )}

            <style>{`
                .tab-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 15px;
                    background: transparent;
                    border: none;
                    border-bottom: 2px solid transparent;
                    color: var(--text-secondary);
                    cursor: pointer;
                    font-size: 11px;
                    font-weight: 500;
                    transition: all 0.2s;
                    font-family: var(--font-body);
                }
                .tab-btn:hover:not(:disabled) {
                    color: white;
                    background: rgba(255,255,255,0.03);
                }
                .tab-btn.active {
                    color: var(--accent);
                    border-bottom-color: var(--accent);
                    background: rgba(59,130,246,0.05);
                }
                .tab-btn.disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                }
            `}</style>
        </div>
    );
};
