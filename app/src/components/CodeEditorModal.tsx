import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';
import { FormField } from '../env';
import { useTranslation } from '../i18n/useTranslation';

interface CodeEditorModalProps {
    field: FormField;
    initialValue: string;
    onChange: (value: string) => void;
    onClose: () => void;
}

export const CodeEditorModal: React.FC<CodeEditorModalProps> = ({ initialValue, onChange, onClose }) => {
    const { t } = useTranslation();
    const [value, setValue] = useState(initialValue);

    const handleChange = (newValue: string) => {
        setValue(newValue);
        onChange(newValue);
    };

    return ReactDOM.createPortal(
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(4px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '900px',
                height: '80vh',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
                {/* Header */}
                <div style={{
                    padding: '15px 20px',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'var(--bg-primary)',
                    flexShrink: 0,
                    height: '50px',
                    minHeight: '50px',
                    boxSizing: 'border-box'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: 'var(--accent)'
                        }} />
                    </div>
                    <button
                        onClick={onClose}
                        style={{ 
                            background: 'transparent', 
                            border: 'none', 
                            color: 'var(--text-primary)', 
                            cursor: 'pointer', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px',
                            padding: '4px',
                            opacity: 0.7,
                            transition: 'opacity 0.2s'
                        }}
                        title={t('close_editor_tooltip')}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
                    >
                        <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', opacity: 0.8 }}>{t('esc_to_close')}</span>
                        <X size={16} />
                    </button>
                </div>

                {/* Editor Area */}
                <div style={{ flex: 1, minHeight: 0, position: 'relative', background: '#000' }}>
                    <textarea
                        autoFocus
                        style={{
                            width: '100%',
                            height: '100%',
                            background: 'transparent',
                            color: '#e0e0e0',
                            border: 'none',
                            padding: '20px',
                            overflow: 'auto',
                            boxSizing: 'border-box',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '13px',
                            lineHeight: '1.6',
                            outline: 'none',
                            resize: 'none',
                            tabSize: 4
                        }}
                        value={value}
                        onChange={(e) => handleChange(e.target.value)}
                        spellCheck={false}
                        onKeyDown={(e) => {
                            if (e.key === 'Tab') {
                                e.preventDefault();
                                const start = e.currentTarget.selectionStart;
                                const end = e.currentTarget.selectionEnd;
                                const newValue = value.substring(0, start) + "    " + value.substring(end);
                                handleChange(newValue);
                                const target = e.currentTarget;
                                setTimeout(() => {
                                    target.selectionStart = target.selectionEnd = start + 4;
                                }, 0);
                            }
                            if (e.key === 'Escape') {
                                onClose();
                            }
                        }}
                    />
                </div>
            </div>
        </div>,
        document.body
    );
};
