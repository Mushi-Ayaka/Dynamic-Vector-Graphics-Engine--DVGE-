import React, { useEffect } from 'react';
import { X, Zap, Layers, Play, Puzzle, ArrowRight, CheckCircle2, Layout } from 'lucide-react';
import { useTranslation } from '../i18n/useTranslation';

interface WorkflowModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const WorkflowModal: React.FC<WorkflowModalProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const steps = [
        {
            title: t('workflow_step1_title'),
            desc: t('workflow_step1_desc'),
            icon: <Layout size={18} color="var(--accent)" />,
            badge: "01"
        },
        {
            title: t('workflow_step2_title'),
            desc: t('workflow_step2_desc'),
            icon: <Layers size={18} color="var(--accent)" />,
            badge: "02"
        },
        {
            title: t('workflow_step3_title'),
            desc: t('workflow_step3_desc'),
            icon: <Zap size={18} color="var(--accent)" />,
            badge: "03"
        },
        {
            title: t('workflow_step4_title'),
            desc: t('workflow_step4_desc'),
            icon: <Puzzle size={18} color="var(--accent)" />,
            badge: "04"
        },
        {
            title: t('workflow_step5_title'),
            desc: t('workflow_step5_desc'),
            icon: <Play size={18} color="var(--accent)" />,
            badge: "05",
            fullWidth: true
        }
    ];

    return (
        <div 
            style={{
                position: 'fixed', inset: 0, zIndex: 100000,
                background: 'rgba(0,0,0,0.75)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '20px'
            }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderTop: '2px solid var(--accent)',
                borderRadius: '2px',
                width: '100%', maxWidth: '640px',
                boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(228,76,48,0.08)',
                overflow: 'hidden',
                display: 'flex', flexDirection: 'column',
                animation: 'fadeInUp 0.3s ease-out'
            }}>
                {/* Header Industrial */}
                <div style={{
                    height: '44px', padding: '0 16px',
                    background: 'var(--bg-elevated)',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '8px', height: '8px', background: 'var(--accent)', borderRadius: '1px' }} />
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--text-primary)' }}>
                            {t('workflow_title')}
                        </span>
                        <span style={{ width: '1px', height: '14px', background: 'var(--border)' }} />
                        <span style={{ fontSize: '10px', color: 'var(--text-disabled)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            {t('workflow_desc')}
                        </span>
                    </div>
                    
                    <button 
                        onClick={onClose} 
                        style={{ 
                            background: 'transparent', border: 'none', 
                            color: 'var(--text-disabled)', cursor: 'pointer', 
                            display: 'flex', alignItems: 'center', gap: '8px',
                            transition: 'color 0.2s'
                        }}
                        onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'}
                        onMouseOut={e => e.currentTarget.style.color = 'var(--text-disabled)'}
                    >
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', fontWeight: 700 }}>ESC</span>
                        <X size={14} />
                    </button>
                </div>

                {/* Content */}
                <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'var(--border)' }}>
                    {steps.map((step, i) => (
                        <div key={i} style={{
                            background: 'var(--bg-secondary)',
                            padding: '24px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px',
                            position: 'relative',
                            gridColumn: step.fullWidth ? 'span 2' : 'span 1'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{
                                    width: '36px', height: '36px',
                                    background: 'rgba(228, 76, 48, 0.05)', 
                                    border: '1px solid rgba(228, 76, 48, 0.1)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    {step.icon}
                                </div>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--accent)', fontWeight: 800, opacity: 0.5 }}>
                                    {step.badge}
                                </span>
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '12px', color: 'var(--text-primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    {step.title}
                                </h3>
                                <p style={{ margin: '8px 0 0', fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                                    {step.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Industrial */}
                <div style={{
                    padding: '16px 24px', background: 'var(--bg-secondary)',
                    borderTop: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-disabled)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        <CheckCircle2 size={12} color="var(--accent)" />
                        {t('workflow_footer')}
                    </div>
                    <button 
                        onClick={onClose}
                        className="dv-btn cta"
                        style={{ 
                            display: 'flex', alignItems: 'center', gap: '10px', 
                            padding: '8px 20px', fontSize: '11px', fontWeight: 800,
                            textTransform: 'uppercase', letterSpacing: '1px',
                            borderRadius: '2px'
                        }}
                    >
                        {t('workflow_start_btn')} <ArrowRight size={14} />
                    </button>
                </div>
            </div>
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

