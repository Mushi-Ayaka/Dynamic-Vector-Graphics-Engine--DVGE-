import React, { useState, useEffect } from 'react';
import { SlidersHorizontal, Layers, ListVideo, Copy, Check, Maximize2, ChevronDown, ChevronRight, FileText, Image, X, RefreshCcw } from 'lucide-react';
import { FormField } from '../env';
import { CodeEditorModal } from './CodeEditorModal';
import { useStore } from '../store/useStore';

// ─────────────────────────────────────────────────────────────────────────────
// Tipos internos
// ─────────────────────────────────────────────────────────────────────────────

interface InspectorTabsProps {
    schema: FormField[];
    properties: Record<string, any>;
    onChange: (id: string, value: any) => void;
    hideTabs?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Utilidad: agrupar campos por field.group
// Invariante PBT: Array.from(result.values()).flat().length === schema.length
// ─────────────────────────────────────────────────────────────────────────────

const GENERAL_GROUP = '__general__';

function groupFields(schema: FormField[]): Map<string, FormField[]> {
    const map = new Map<string, FormField[]>();
    for (const field of schema) {
        const key = field.group ?? GENERAL_GROUP;
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(field);
    }
    return map;
}

// ─────────────────────────────────────────────────────────────────────────────
// Componente: Sección de grupo colapsable
// ─────────────────────────────────────────────────────────────────────────────

const GroupSection: React.FC<{
    title: string;
    fields: FormField[];
    properties: Record<string, any>;
    onChange: (id: string, value: any) => void;
    onExpandCode?: (field: FormField, value: string) => void;
    onToggle?: () => void;
    isExpanded?: boolean;
}> = ({ title, fields, properties, onChange, onExpandCode, onToggle, isExpanded }) => {
    const isGeneral = title === GENERAL_GROUP;
    const showContent = isGeneral || isExpanded;

    return (
        <div style={{ marginBottom: '4px' }}>
            {!isGeneral && (
                <button
                    onClick={onToggle}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        width: '100%',
                        background: 'transparent',
                        border: 'none',
                        borderBottom: !isExpanded ? '1px solid var(--border)' : '1px solid var(--accent)',
                        padding: '6px 0 6px 0',
                        marginBottom: !isExpanded ? '8px' : '10px',
                        cursor: 'pointer',
                        color: !isExpanded ? 'var(--text-secondary)' : 'var(--accent)',
                        transition: 'all 0.15s',
                    }}
                >
                    {isExpanded
                        ? <ChevronDown size={12} />
                        : <ChevronRight size={12} />
                    }
                    <span style={{
                        fontSize: '9px',
                        fontWeight: 700,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        fontFamily: 'var(--font-body)',
                    }}>
                        {title}
                    </span>
                    <span style={{ fontSize: '9px', color: 'var(--text-disabled)', marginLeft: 'auto' }}>
                        {fields.length}
                    </span>
                </button>
            )}

            {showContent && (
                <div>
                    {fields.map(field => (
                        <DynamicField
                            key={field.id}
                            field={field}
                            value={properties[field.id]}
                            onChange={onChange}
                            onExpandCode={onExpandCode}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Componente: Campo dinámico
// ─────────────────────────────────────────────────────────────────────────────

export const DynamicField: React.FC<{
    field: FormField;
    value: any;
    onChange: (id: string, value: any) => void;
    onExpandCode?: (field: FormField, value: string) => void;
}> = ({ field, value, onChange, onExpandCode }) => {
    const activeProject = useStore(state => state.activeProject);
    const [copied, setCopied] = useState(false);
    const [localNum, setLocalNum] = useState(value?.toString() || field.defaultValue?.toString() || '0');
    const [fileError, setFileError] = useState<string | null>(null);
    const [fileWarning, setFileWarning] = useState<string | null>(null);
    const [isLoadingFile, setIsLoadingFile] = useState(false);

    useEffect(() => {
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

    // ── file-ref ──────────────────────────────────────────────────────────────

    const handleSelectFile = async () => {
        if (!window.ipcRenderer) return;
        setFileError(null);
        setFileWarning(null);
        setIsLoadingFile(true);

        try {
            const acceptExts = field.accept ?? ['.json', '.csv', '.txt', '.md'];
            const dialogResult = await window.ipcRenderer.showOpenDialog({
                filters: [{ name: 'Archivos', extensions: acceptExts.map(e => e.replace('.', '')) }],
                properties: ['openFile'],
            });

            if (dialogResult.canceled || dialogResult.filePaths.length === 0) {
                setIsLoadingFile(false);
                return;
            }

            const filePath = dialogResult.filePaths[0];
            const readResult = await window.ipcRenderer.readFileUtf8(filePath);

            if (readResult.error) {
                setFileError(readResult.error);
            } else {
                if (readResult.sizeBytes > 512_000) {
                    setFileWarning(`Archivo grande (${(readResult.sizeBytes / 1024).toFixed(0)} KB). Puede afectar el rendimiento.`);
                }
                onChange(field.id, readResult.content);
            }
        } catch (e: any) {
            setFileError(e?.message ?? 'Error desconocido');
        } finally {
            setIsLoadingFile(false);
        }
    };

    // ── image-ref ─────────────────────────────────────────────────────────────

    const handleSelectImage = async () => {
        if (!window.ipcRenderer) return;
        setFileError(null);

        try {
            const dialogResult = await window.ipcRenderer.showOpenDialog({
                filters: [{ name: 'Imágenes', extensions: ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'] }],
                properties: ['openFile'],
            });

            if (dialogResult.canceled || dialogResult.filePaths.length === 0) return;

            const filePath = dialogResult.filePaths[0];
            
            if (activeProject) {
                const result = await window.ipcRenderer.copyToProject({
                    projectId: activeProject.id,
                    sourcePath: filePath
                });
                if (result.success && result.filePath) {
                    onChange(field.id, result.filePath);
                } else {
                    setFileError(result.error ?? 'Error al copiar al proyecto');
                }
            } else {
                onChange(field.id, `file://${filePath}`);
            }
        } catch (e: any) {
            setFileError(e?.message ?? 'Error al seleccionar imagen');
        }
    };

    // ── render switch ─────────────────────────────────────────────────────────

    switch (field.type) {

        case 'alignment': {
            const currentAlign = String(value ?? field.defaultValue ?? 'center center');
            const options = [
                ['start start', 'start center', 'start end'],
                ['center start', 'center center', 'center end'],
                ['end start', 'end center', 'end end']
            ];
            
            return (
                <div className="dv-field" style={{ marginBottom: '12px' }}>
                    <label style={labelStyle}>{field.label}</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', maxWidth: '120px', margin: '4px 0' }}>
                        {options.map((row, _) => row.map((opt, __) => {
                            const isSelected = currentAlign === opt;
                            return (
                                <button
                                    key={opt}
                                    onClick={() => onChange(field.id, opt)}
                                    title={opt}
                                    style={{
                                        aspectRatio: '1',
                                        background: isSelected ? 'var(--accent)' : 'var(--bg-primary)',
                                        border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.15s ease',
                                        opacity: isSelected ? 1 : 0.6,
                                    }}
                                    onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.opacity = '1'; }}
                                    onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.opacity = '0.6'; }}
                                >
                                    <div style={{
                                        width: '4px', height: '4px', borderRadius: '50%',
                                        background: isSelected ? 'white' : 'var(--text-disabled)'
                                    }} />
                                </button>
                            );
                        }))}
                    </div>
                </div>
            );
        }

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

        case 'color': {
            const currentColor = String(value ?? field.defaultValue ?? '#ffffff');
            
            // Helper para asegurar formato #RRGGBB o #RRGGBBAA
            const hex = currentColor.startsWith('#') ? currentColor : '#ffffff';
            const rgb = hex.substring(0, 7);
            const alphaHex = hex.length === 9 ? hex.substring(7, 9) : 'ff';
            const alphaPercent = parseInt(alphaHex, 16) / 255;

            const handleColorChange = (newRgb: string) => {
                onChange(field.id, newRgb + alphaHex);
            };

            const handleAlphaChange = (newAlpha: number) => {
                const newAlphaHex = Math.round(newAlpha * 255).toString(16).padStart(2, '0');
                onChange(field.id, rgb + newAlphaHex);
            };

            return (
                <div className="dv-field" style={{ marginBottom: '12px' }}>
                    <label style={labelStyle}>{field.label}</label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input
                            type="color"
                            className="dv-input"
                            style={{ width: '40px', height: '32px', padding: '2px', cursor: 'pointer', flexShrink: 0 }}
                            value={rgb}
                            onChange={(e) => handleColorChange(e.target.value)}
                        />
                        <input
                            type="text"
                            className="dv-input"
                            style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', flex: 1 }}
                            value={hex.toUpperCase()}
                            onChange={(e) => onChange(field.id, e.target.value.toLowerCase())}
                            placeholder="#RRGGBBAA"
                        />
                    </div>
                    <div style={{ marginTop: '6px', fontSize: '9px', color: 'var(--text-disabled)', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Opacidad</span>
                        <span>{Math.round(alphaPercent * 100)}%</span>
                    </div>
                    <input 
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        style={{ width: '100%', height: '4px', accentColor: 'var(--accent)', cursor: 'pointer' }}
                        value={alphaPercent}
                        onChange={(e) => handleAlphaChange(parseFloat(e.target.value))}
                    />
                </div>
            );
        }

        case 'boolean':
            return (
                <div className="dv-field" style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <label style={{ ...labelStyle, marginBottom: 0 }}>{field.label}</label>
                    <div 
                        onClick={() => onChange(field.id, !value)}
                        style={{
                            width: '36px',
                            height: '20px',
                            background: value ? 'var(--accent)' : 'var(--bg-elevated)',
                            borderRadius: '10px',
                            padding: '2px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            transition: 'all 0.2s',
                            border: '1px solid var(--border)'
                        }}
                    >
                        <div style={{
                            width: '14px',
                            height: '14px',
                            background: 'white',
                            borderRadius: '50%',
                            transform: value ? 'translateX(16px)' : 'translateX(0)',
                            transition: 'transform 0.2s'
                        }} />
                    </div>
                </div>
            );

        case 'slider':
            return (
                <div className="dv-field" style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <label style={{ ...labelStyle, marginBottom: 0 }}>{field.label}</label>
                        <span style={{ fontSize: '10px', color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>{value ?? field.defaultValue}</span>
                    </div>
                    <input
                        type="range"
                        min={field.min ?? 0}
                        max={field.max ?? 100}
                        step={field.step ?? 1}
                        className="dv-slider"
                        style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer' }}
                        value={String(value ?? field.defaultValue)}
                        onChange={(e) => onChange(field.id, parseFloat(e.target.value))}
                    />
                </div>
            );

        case 'button':
            return (
                <div className="dv-field" style={{ marginBottom: '12px' }}>
                    <button
                        className="dv-btn-primary"
                        style={{ width: '100%', padding: '8px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}
                        onClick={() => console.log(`[Inspector] Botón presionado: ${field.id}`)}
                    >
                        {field.label}
                    </button>
                </div>
            );

        case 'easing': {
            const currentEasing = String(value ?? field.defaultValue ?? '[0.25, 0.1, 0.25, 1]');
            let points: number[] = [0.25, 0.1, 0.25, 1];
            try { points = JSON.parse(currentEasing); } catch (e) { /* fallback linear */ points = [0, 0, 1, 1]; }

            const presets: Record<string, number[]> = {
                'Linear': [0, 0, 1, 1],
                'Ease': [0.25, 0.1, 0.25, 1],
                'Ease In': [0.42, 0, 1, 1],
                'Ease Out': [0, 0, 0.58, 1],
                'Ease In Out': [0.42, 0, 0.58, 1],
                'Smooth': [0.4, 0, 0.2, 1],
                'Fast': [0.05, 0.7, 0.1, 1],
                'Bounce': [0.17, 0.67, 0.83, 0.67],
                'Elastic': [0.7, -0.4, 0.3, 1.4]
            };

            const updatePoint = (idx: number, x: number, y: number) => {
                const newPoints = [...points];
                newPoints[idx * 2] = Math.max(0, Math.min(1, x));
                newPoints[idx * 2 + 1] = y; // Y can go outside 0-1 for elastic effects
                onChange(field.id, JSON.stringify(newPoints));
            };

            return (
                <div className="dv-field" style={{ marginBottom: '12px' }}>
                    <label style={labelStyle}>{field.label}</label>
                    <div style={{ 
                        background: 'var(--bg-input)', 
                        border: '1px solid var(--border)', 
                        borderRadius: '4px',
                        padding: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                    }}>
                        <div style={{ position: 'relative', width: '100%', aspectRatio: '1', background: '#000', borderRadius: '2px', overflow: 'hidden' }}>
                            <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', display: 'block' }}>
                                {/* Grid lines */}
                                <line x1="0" y1="0" x2="100" y2="0" stroke="#1e293b" strokeWidth="0.5" />
                                <line x1="0" y1="100" x2="100" y2="100" stroke="#1e293b" strokeWidth="0.5" />
                                <line x1="0" y1="50" x2="100" y2="50" stroke="#0f172a" strokeWidth="0.5" />
                                
                                {/* Control lines */}
                                <line x1="0" y1="100" x2={points[0]*100} y2={100 - points[1]*100} stroke="var(--text-disabled)" strokeWidth="1" strokeDasharray="2" />
                                <line x1="100" y1="0" x2={points[2]*100} y2={100 - points[3]*100} stroke="var(--text-disabled)" strokeWidth="1" strokeDasharray="2" />
                                
                                {/* Bezier Curve */}
                                <path 
                                    d={`M 0 100 C ${points[0]*100} ${100 - points[1]*100}, ${points[2]*100} ${100 - points[3]*100}, 100 0`}
                                    fill="none" 
                                    stroke="var(--accent)" 
                                    strokeWidth="2" 
                                />
                                
                                {/* Handles */}
                                <circle 
                                    cx={points[0]*100} cy={100 - points[1]*100} r="4" 
                                    fill="var(--accent)" cursor="move"
                                    onMouseDown={(e) => {
                                        const svg = e.currentTarget.ownerSVGElement!;
                                        const move = (me: MouseEvent) => {
                                            const rect = svg.getBoundingClientRect();
                                            updatePoint(0, (me.clientX - rect.left) / rect.width, (rect.bottom - me.clientY) / rect.height);
                                        };
                                        const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
                                        window.addEventListener('mousemove', move);
                                        window.addEventListener('mouseup', up);
                                    }}
                                />
                                <circle 
                                    cx={points[2]*100} cy={100 - points[3]*100} r="4" 
                                    fill="var(--accent)" cursor="move"
                                    onMouseDown={(e) => {
                                        const svg = e.currentTarget.ownerSVGElement!;
                                        const move = (me: MouseEvent) => {
                                            const rect = svg.getBoundingClientRect();
                                            updatePoint(1, (me.clientX - rect.left) / rect.width, (rect.bottom - me.clientY) / rect.height);
                                        };
                                        const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
                                        window.addEventListener('mousemove', move);
                                        window.addEventListener('mouseup', up);
                                    }}
                                />
                            </svg>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '4px' }}>
                            <select 
                                className="dv-input" 
                                style={{ flex: 1, fontSize: '10px', height: '24px', padding: '0 4px' }}
                                value=""
                                onChange={(e) => {
                                    if (e.target.value) onChange(field.id, JSON.stringify(presets[e.target.value]));
                                }}
                            >
                                <option value="">PRESETS...</option>
                                {Object.keys(presets).map(p => <option key={p} value={p}>{p.toUpperCase()}</option>)}
                            </select>
                            <button 
                                className="btn-icon" 
                                style={{ height: '24px', width: '24px', background: 'var(--bg-elevated)' }}
                                onClick={() => onChange(field.id, "[0,0,1,1]")}
                                title="Reset"
                            >
                                <RefreshCcw size={12} />
                            </button>
                        </div>
                        <div style={{ fontSize: '9px', color: 'var(--text-disabled)', fontFamily: 'var(--font-mono)', textAlign: 'center' }}>
                            {points.map(p => p.toFixed(2)).join(', ')}
                        </div>
                    </div>
                </div>
            );
        }

        case 'range-dual': {
            const val = Array.isArray(value) ? value : [0, 100];
            return (
                <div className="dv-field" style={{ marginBottom: '12px' }}>
                    <label style={labelStyle}>{field.label}</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                            type="number"
                            className="dv-input"
                            style={{ flex: 1 }}
                            value={val[0]}
                            onChange={(e) => onChange(field.id, [parseFloat(e.target.value), val[1]])}
                        />
                        <input
                            type="number"
                            className="dv-input"
                            style={{ flex: 1 }}
                            value={val[1]}
                            onChange={(e) => onChange(field.id, [val[0], parseFloat(e.target.value)])}
                        />
                    </div>
                </div>
            );
        }

        case 'icon':
            return (
                <div className="dv-field" style={{ marginBottom: '12px' }}>
                    <label style={labelStyle}>{field.label}</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                            type="text"
                            className="dv-input"
                            style={{ flex: 1 }}
                            placeholder="Buscar icono..."
                            value={String(value ?? '')}
                            onChange={(e) => onChange(field.id, e.target.value)}
                        />
                        <div style={{ width: '32px', height: '32px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            ⭐
                        </div>
                    </div>
                </div>
            );

        case 'gradient':
            return (
                <div className="dv-field" style={{ marginBottom: '12px' }}>
                    <label style={labelStyle}>{field.label}</label>
                    <div style={{
                        height: '32px',
                        borderRadius: '4px',
                        background: value ?? 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                        border: '1px solid var(--border)',
                        cursor: 'pointer'
                    }} />
                    <div style={{ fontSize: '9px', color: 'var(--text-disabled)', marginTop: '4px' }}>Editor de degradado (v6.0)</div>
                </div>
            );

        case 'font':
            return (
                <div className="dv-field" style={{ marginBottom: '12px' }}>
                    <label style={labelStyle}>{field.label}</label>
                    <select
                        className="dv-input"
                        style={{ fontFamily: String(value ?? 'sans-serif') }}
                        value={String(value ?? 'sans-serif')}
                        onChange={(e) => onChange(field.id, e.target.value)}
                    >
                        {['Inter', 'Roboto', 'Montserrat', 'Arial', 'Courier New', 'Georgia'].map(f => (
                            <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
                        ))}
                    </select>
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
                                const projectContext = useStore.getState().getProjectContext();
                                const pdfPath = await window.ipcRenderer.generateRulesPdf({
                                    rulesText: String(field.defaultValue),
                                    projectContext
                                });
                                window.ipcRenderer.startDrag(pdfPath);
                            }
                        }}
                        className="dv-master-flow"
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
                        <div style={{ fontSize: '9px', color: 'var(--text-disabled)', marginTop: '4px' }}>ARRÁSTRME A TU IA</div>
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
                            value={String(field.defaultValue)}
                        />
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(String(field.defaultValue));
                                setCopied(true);
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
                    <textarea
                        className="dv-input"
                        style={{
                            fontFamily: 'var(--font-mono)',
                            height: '100px',
                            resize: 'vertical',
                            fontSize: '11px',
                            lineHeight: '1.5'
                        }}
                        value={String(value ?? field.defaultValue)}
                        onChange={(e) => onChange(field.id, e.target.value)}
                        spellCheck={false}
                    />
                </div>
            );

        case 'select':
            return (
                <div className="dv-field" style={{ marginBottom: '12px' }}>
                    <label style={labelStyle}>{field.label}</label>
                    <select
                        className="dv-input"
                        value={String(value ?? field.defaultValue)}
                        onChange={(e) => onChange(field.id, e.target.value)}
                    >
                        {field.options?.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
            );

        // ── [INS-02] file-ref ──────────────────────────────────────────────────

        case 'file':
        case 'file-ref': {
            const currentPath = value ?? '';
            const fileName = currentPath
                ? currentPath.split(/[\\/]/).pop() ?? currentPath
                : null;

            return (
                <div className="dv-field" style={{ marginBottom: '12px' }}>
                    <label style={labelStyle}>{field.label}</label>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 10px',
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border)',
                        borderRadius: '4px',
                        minHeight: '36px',
                    }}>
                        <FileText size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                        <span style={{
                            flex: 1,
                            fontSize: '10px',
                            fontFamily: 'var(--font-mono)',
                            color: fileName ? 'var(--text-primary)' : 'var(--text-disabled)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}>
                            {isLoadingFile ? 'Cargando...' : (fileName ?? 'Sin archivo')}
                        </span>
                        <button
                            onClick={handleSelectFile}
                            disabled={isLoadingFile}
                            style={{
                                padding: '3px 10px',
                                fontSize: '9px',
                                background: 'var(--accent)',
                                border: 'none',
                                borderRadius: '3px',
                                color: 'white',
                                cursor: isLoadingFile ? 'wait' : 'pointer',
                                fontFamily: 'var(--font-body)',
                                fontWeight: 600,
                                flexShrink: 0,
                                opacity: isLoadingFile ? 0.6 : 1,
                            }}
                        >
                            Seleccionar
                        </button>
                    </div>
                    {fileWarning && (
                        <div style={{ fontSize: '9px', color: 'var(--warning, #f59e0b)', marginTop: '4px' }}>
                            ⚠ {fileWarning}
                        </div>
                    )}
                    {fileError && (
                        <div style={{ fontSize: '9px', color: 'var(--error, #ef4444)', marginTop: '4px' }}>
                            ✕ {fileError}
                        </div>
                    )}
                </div>
            );
        }

        // ── [INS-03] image-ref ─────────────────────────────────────────────────

        case 'image':
        case 'image-ref': {
            const currentSrc = value ?? '';

            return (
                <div className="dv-field" style={{ marginBottom: '12px' }}>
                    <label style={labelStyle}>{field.label}</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {/* Preview zone */}
                        <div
                            onClick={handleSelectImage}
                            title="Clic para seleccionar imagen"
                            style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '4px',
                                border: '1px dashed var(--border)',
                                overflow: 'hidden',
                                cursor: 'pointer',
                                background: 'var(--bg-elevated)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                transition: 'border-color 0.15s',
                            }}
                        >
                            {currentSrc && typeof currentSrc === 'string' ? (
                                <img
                                    src={currentSrc.startsWith('http') || currentSrc.startsWith('data') || currentSrc.startsWith('media') 
                                        ? currentSrc 
                                        : `media://${currentSrc.replace(/\\/g, '/')}`}
                                    alt="preview"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                            ) : (
                                <Image size={20} style={{ color: 'var(--text-disabled)' }} />
                            )}
                        </div>

                        {/* Info + acciones */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <span style={{
                                display: 'block',
                                fontSize: '9px',
                                fontFamily: 'var(--font-mono)',
                                color: currentSrc ? 'var(--text-secondary)' : 'var(--text-disabled)',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                marginBottom: '6px',
                            }}>
                                {currentSrc
                                    ? currentSrc.split(/[\\/]/).pop()
                                    : 'Sin imagen'}
                            </span>
                            <div style={{ display: 'flex', gap: '6px' }}>
                                <button
                                    onClick={handleSelectImage}
                                    style={{
                                        padding: '3px 10px',
                                        fontSize: '9px',
                                        background: 'var(--accent)',
                                        border: 'none',
                                        borderRadius: '3px',
                                        color: 'white',
                                        cursor: 'pointer',
                                        fontFamily: 'var(--font-body)',
                                        fontWeight: 600,
                                    }}
                                >
                                    Seleccionar
                                </button>
                                {currentSrc && (
                                    <button
                                        onClick={() => { setFileError(null); onChange(field.id, ''); }}
                                        title="Limpiar imagen"
                                        style={{
                                            padding: '3px 6px',
                                            fontSize: '9px',
                                            background: 'transparent',
                                            border: '1px solid var(--border)',
                                            borderRadius: '3px',
                                            color: 'var(--text-disabled)',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <X size={10} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                    {fileError && (
                        <div style={{ fontSize: '9px', color: 'var(--error, #ef4444)', marginTop: '4px' }}>
                            ✕ {fileError}
                        </div>
                    )}
                </div>
            );
        }

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

// ─────────────────────────────────────────────────────────────────────────────
// Componente principal: InspectorTabs
// ─────────────────────────────────────────────────────────────────────────────

export const InspectorTabs: React.FC<InspectorTabsProps> = ({ schema, properties, onChange, hideTabs = false }) => {
    const [activeTab, setActiveTab] = useState<'props' | 'layers' | 'queue'>('props');
    const [codeModal, setCodeModal] = useState<{ field: FormField; value: string } | null>(null);
    const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);

    // [BUGFIX] Inicialización paramétrica en frío.
    // Si la IA generó nuevas props con defaultValue, pero el usuario no ha tocado el slider,
    // inyectamos los valores por defecto en el Store global para que el CSS reciba las var(--nombre).
    useEffect(() => {
        if (!schema) return;
        const missing: Record<string, any> = {};
        let needsUpdate = false;
        
        schema.forEach(field => {
            if (properties[field.id] === undefined && field.defaultValue !== undefined) {
                missing[field.id] = field.defaultValue;
                needsUpdate = true;
            }
        });
        
        if (needsUpdate) {
            useStore.getState().setProperties(missing);
        }
    }, [schema]); // Dependencia intencional: solo cuando el schema cambia (cuando la IA actualiza código)

    if (!schema) return <div style={{ padding: '20px', fontSize: '11px', color: 'var(--text-disabled)' }}>Selecciona un plugin para ver propiedades</div>;

    const grouped = groupFields(schema);

    // El grupo General siempre va primero, luego el resto en orden de aparición
    const orderedGroups: [string, FormField[]][] = [];
    if (grouped.has(GENERAL_GROUP)) {
        orderedGroups.push([GENERAL_GROUP, grouped.get(GENERAL_GROUP)!]);
    }
    for (const [key, fields] of grouped.entries()) {
        if (key !== GENERAL_GROUP) orderedGroups.push([key, fields]);
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Tab Headers */}
            {!hideTabs && (
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
                        title="Layer Inspector — Disponible en v6.0"
                    >
                        <Layers size={14} /> Layers
                    </button>
                    <button
                        disabled
                        className="tab-btn disabled"
                        title="Render Queue — Disponible en v6.0"
                    >
                        <ListVideo size={14} /> Queue
                    </button>
                </div>
            )}


            {/* Tab Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 15px' }}>
                {activeTab === 'props' && (
                    <div>
                        {orderedGroups.map(([groupName, fields]) => (
                            <GroupSection
                                key={groupName}
                                title={groupName}
                                fields={fields}
                                properties={properties}
                                onChange={onChange}
                                isExpanded={expandedGroupId === groupName}
                                onToggle={() => setExpandedGroupId(prev => prev === groupName ? null : groupName)}
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
