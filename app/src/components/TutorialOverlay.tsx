import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { ChevronRight, ChevronLeft, X, Play, Info, Layout, Zap } from 'lucide-react';

interface TutorialStep {
    title: string;
    content: string;
    selector?: string;
    icon: React.ReactNode;
}

interface TutorialOverlayProps {
    onClose: () => void;
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ onClose }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [spotlight, setSpotlight] = useState<{ top: number, left: number, width: number, height: number } | null>(null);

    const steps: TutorialStep[] = [
        {
            title: "¡Bienvenido a DVGE v5.8!",
            content: "Esta guía te enseñará a dominar el flujo de trabajo profesional en 2 minutos.",
            icon: <Zap size={24} color="var(--accent)" fill="var(--accent)" />
        },
        {
            title: "Panel de Control (Izquierda)",
            content: "En el canvas puedes definir las dimensiones, la duración y los FPS de la animación. En la parte inferior tendrás las reglas para arrastrar a tu chat de IA de tu preferencia para pedirle la animación que deseas, más abajo tendrás los campos para colocar el código HTML, CSS y JS de la animación. Más abajo está el boton de renderizar la animación a video.",
            selector: ".dv-left-panel", // Necesitaremos añadir estas clases en App.tsx
            icon: <Layout size={24} color="var(--accent)" />
        },
        {
            title: "Preview (Centro)",
            content: "¡Acá puedes ver tu animación en acción con tus cambios al instante!",
            selector: ".dv-preview-area",
            icon: <Play size={24} color="var(--accent)" />
        },
        {
            title: "Inspector / Artefactos (Derecha)",
            content: "En el apartado de inspector podrás modificar valores de la animación, por otro lado en el apartado de Artefactos puedes gestionar los (imágenes, Palabras Claves, Números, etc...) que usaras para alimentar tu animación.",
            selector: ".dv-right-panel",
            icon: <Info size={24} color="var(--accent)" />
        }
    ];

    useEffect(() => {
        const step = steps[currentStep];
        if (step.selector) {
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
    }, [currentStep]);

    const handleNext = () => {
        if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
        else onClose();
    };

    const handleBack = () => {
        if (currentStep > 0) setCurrentStep(currentStep - 1);
    };

    return ReactDOM.createPortal(
        <div style={{
            position: 'fixed', inset: 0, zIndex: 100000, pointerEvents: 'none'
        }}>
            {/* Backdrop con agujero (spotlight) */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0,0,0,0.7)',
                backdropFilter: 'blur(2px)',
                pointerEvents: 'auto',
                clipPath: spotlight
                    ? `polygon(0% 0%, 0% 100%, ${spotlight.left}px 100%, ${spotlight.left}px ${spotlight.top}px, ${spotlight.left + spotlight.width}px ${spotlight.top}px, ${spotlight.left + spotlight.width}px ${spotlight.top + spotlight.height}px, ${spotlight.left}px ${spotlight.top + spotlight.height}px, ${spotlight.left}px 100%, 100% 100%, 100% 0%)`
                    : 'none',
                transition: 'clip-path 0.4s ease-in-out'
            }} onClick={onClose} />

            {/* Card del Tutorial */}
            <div style={{
                position: 'absolute',
                bottom: '40px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '450px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderTop: '3px solid var(--accent)',
                borderRadius: '0px',
                padding: '24px',
                pointerEvents: 'auto',
                boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                animation: 'slideUp 0.3s ease-out'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {steps[currentStep].icon}
                        <h3 style={{ margin: 0, color: 'white', fontSize: '16px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                            {steps[currentStep].title}
                        </h3>
                    </div>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-disabled)', cursor: 'pointer' }}>
                        <X size={18} />
                    </button>
                </div>

                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.6', minHeight: '60px' }}>
                    {steps[currentStep].content}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                        {steps.map((_, i) => (
                            <div key={i} style={{ width: '20px', height: '2px', background: i === currentStep ? 'var(--accent)' : 'var(--border)', transition: 'all 0.3s' }} />
                        ))}
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        {currentStep > 0 && (
                            <button onClick={handleBack} className="dv-btn secondary" style={{ padding: '6px 12px', fontSize: '11px', borderRadius: 0 }}>
                                <ChevronLeft size={14} /> ATRÁS
                            </button>
                        )}
                        <button onClick={handleNext} className="dv-btn cta" style={{ padding: '6px 16px', fontSize: '11px', borderRadius: 0 }}>
                            {currentStep === steps.length - 1 ? '¡LISTO!' : 'SIGUIENTE'} <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes slideUp { from { transform: translate(-50%, 20px); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
            `}</style>
        </div>,
        document.body
    );
};
