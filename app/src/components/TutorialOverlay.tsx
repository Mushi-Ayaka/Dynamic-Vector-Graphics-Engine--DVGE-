import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { ChevronRight, ChevronLeft, X } from 'lucide-react';
import { useTranslation } from '../i18n/useTranslation';

export interface TutorialStep {
    title: string;
    content: string;
    selector?: string;
    icon: React.ReactNode;
    onEnter?: () => void;
}

interface TutorialOverlayProps {
    onClose: () => void;
    steps: TutorialStep[];
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ onClose, steps }) => {
    const { t } = useTranslation();
    const [currentStep, setCurrentStep] = useState(0);
    const [spotlight, setSpotlight] = useState<{ top: number, left: number, width: number, height: number } | null>(null);
    const lastTriggeredStepRef = React.useRef<number | null>(null);

    useEffect(() => {
        if (!steps || steps.length === 0) return;
        const step = steps[currentStep];
        
        // Ejecutar acción al entrar en el paso (solo una vez por cambio de paso)
        if (step.onEnter && lastTriggeredStepRef.current !== currentStep) {
            lastTriggeredStepRef.current = currentStep;
            step.onEnter();
        }

        const updateSpotlight = () => {
            if (step && step.selector) {
                const el = document.querySelector(step.selector);
                if (el) {
                    const rect = el.getBoundingClientRect();
                    setSpotlight({
                        top: rect.top - 5,
                        left: rect.left - 5,
                        width: rect.width + 10,
                        height: rect.height + 10
                    });
                } else {
                    setSpotlight(null);
                }
            } else {
                setSpotlight(null);
            }
        };

        // Primera pasada inmediata
        updateSpotlight();

        // Segunda pasada con delay para capturar elementos que se abren via onEnter (ej. FPS dropdown)
        const timer = setTimeout(updateSpotlight, 150);
        return () => clearTimeout(timer);
    }, [currentStep, steps]);

    const handleNext = () => {
        if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
        else onClose();
    };

    const handleBack = () => {
        if (currentStep > 0) setCurrentStep(currentStep - 1);
    };

    if (!steps || steps.length === 0) return null;

    return ReactDOM.createPortal(
        <div style={{
            position: 'fixed', inset: 0, zIndex: 100000, pointerEvents: 'none'
        }}>
            {/* Backdrop con 4 divs para evitar blur en el spotlight */}
            {spotlight ? (
                <>
                    {/* Top */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: spotlight.top, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(2px)', pointerEvents: 'auto' }} onClick={onClose} />
                    {/* Bottom */}
                    <div style={{ position: 'absolute', top: spotlight.top + spotlight.height, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(2px)', pointerEvents: 'auto' }} onClick={onClose} />
                    {/* Left */}
                    <div style={{ position: 'absolute', top: spotlight.top, left: 0, width: spotlight.left, height: spotlight.height, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(2px)', pointerEvents: 'auto' }} onClick={onClose} />
                    {/* Right */}
                    <div style={{ position: 'absolute', top: spotlight.top, left: spotlight.left + spotlight.width, right: 0, height: spotlight.height, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(2px)', pointerEvents: 'auto' }} onClick={onClose} />
                    
                    {/* Event blocker overlay outside spotlight (handled by the 4 divs above) */}
                </>
            ) : (
                <div style={{
                    position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(2px)', pointerEvents: 'auto'
                }} onClick={onClose} />
            )}

            {/* Card del Tutorial */}
            <div style={{
                position: 'absolute',
                bottom: '24px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '480px',
                maxHeight: '420px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderTop: '4px solid var(--accent)',
                borderRadius: '4px',
                padding: '24px',
                pointerEvents: 'auto',
                boxShadow: '0 30px 90px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                animation: 'slideUpScale 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                overflow: 'hidden',
                zIndex: 10001
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {steps[currentStep].icon}
                        <h3 style={{ margin: 0, color: 'white', fontSize: '16px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                            {steps[currentStep].title}
                        </h3>
                    </div>
                    <button onClick={onClose} style={{ background: 'var(--bg-secondary)', border: 'none', color: 'var(--text-disabled)', cursor: 'pointer' }}>
                        <X size={18} />
                    </button>
                </div>

                <div style={{ 
                    color: 'var(--text-secondary)', 
                    fontSize: '13px', 
                    lineHeight: '1.6', 
                    flex: 1, 
                    overflowY: 'auto',
                    paddingRight: '8px'
                }}>
                    {steps[currentStep].content}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', height: '32px' }}>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        {steps.map((_, i) => (
                            <div 
                                key={i} 
                                style={{ 
                                    width: i === currentStep ? '12px' : '6px', 
                                    height: '6px', 
                                    borderRadius: '3px',
                                    background: i === currentStep ? 'var(--accent)' : 'var(--border)', 
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' 
                                }} 
                            />
                        ))}
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                        {currentStep > 0 && (
                            <button 
                                onClick={handleBack} 
                                style={{ 
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid var(--border)',
                                    color: 'var(--text-primary)',
                                    padding: '6px 14px',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    transition: 'all 0.2s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                            >
                                <ChevronLeft size={14} /> {t('back_btn')}
                            </button>
                        )}
                        <button 
                            onClick={handleNext} 
                            style={{ 
                                background: 'var(--accent)',
                                border: 'none',
                                color: 'white',
                                padding: '6px 18px',
                                fontSize: '11px',
                                fontWeight: 800,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                transition: 'all 0.2s',
                                boxShadow: '0 4px 12px rgba(228, 76, 48, 0.3)'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            {currentStep === steps.length - 1 ? t('done') : t('next')} <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes slideUpScale {
                    from { opacity: 0; transform: translate(-50%, 20px) scale(0.98); }
                    to { opacity: 1; transform: translate(-50%, 0) scale(1); }
                }
            `}</style>
        </div>,
        document.body
    );
};
