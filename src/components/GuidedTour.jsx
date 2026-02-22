import React, { useState, useEffect, useCallback } from 'react';
import { X, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';

const TOUR_STEPS = [
    {
        title: 'Welcome to Cynx AI!',
        description: 'You have two ways to start: click the "Start Building" button below, or the "Build Sculpture" button in the top-right corner. Let\'s take a tour!',
        target: '.welcome-build-btn',
        position: 'top',
    },
    {
        title: 'Header Shortcut',
        description: 'You can also access the builder anytime from this button in the header — even while chatting.',
        target: '.wizard-open-btn',
        position: 'bottom',
    },
    {
        title: 'The Sculpture Wizard',
        description: 'This wizard walks you through 5 easy steps to design your perfect ice sculpture. Let\'s explore each step!',
        target: '.wizard-card',
        position: 'center',
        wizardStep: 1,
        openWizard: true,
        setBuildModeValue: 'custom-build',
    },
    {
        title: 'Step 1 — Choose a Category',
        description: 'Start by picking a sculpture category: Luges, Ice Bars, Ice Cubes, Showpieces, or Wedding designs.',
        target: '.wizard-body',
        position: 'right',
        wizardStep: 1,
    },
    {
        title: 'Browse Templates',
        description: 'After selecting a category, browse through our collection of 70+ professional templates. Click any template to select it, or scroll down to upload your own custom image.',
        target: '.wizard-body',
        position: 'right',
        wizardStep: 1,
        selectCategory: 'Luges',
    },
    {
        title: 'Step 2 — Extras (Base, Topper & Logo)',
        description: 'This combined step lets you add a base, topper, and logo to your sculpture — all on one page. Toggle each option on or off, and pick from templates or upload your own.',
        target: '.wizard-body',
        position: 'right',
        wizardStep: 2,
    },
    {
        title: 'Step 3 — Reference Images',
        description: 'Upload any reference photos or inspiration images. Add notes to guide the AI on what you\'re looking for.',
        target: '.wizard-body',
        position: 'right',
        wizardStep: 3,
    },
    {
        title: 'Step 4 — Output Settings',
        description: 'Choose your preferred frame shape (aspect ratio) and image quality (resolution). Add any special instructions for the AI.',
        target: '.wizard-body',
        position: 'right',
        wizardStep: 4,
    },
    {
        title: 'Step 5 — Review & Generate',
        description: 'Review all your selections in one place. When everything looks good, hit "Generate Preview" to create your AI render!',
        target: '.wizard-body',
        position: 'right',
        wizardStep: 5,
    },
    {
        title: 'Chat with the AI',
        description: 'You can also describe what you want in plain text here. Attach images, use voice input, or just type — the AI understands natural language.',
        target: '.input-wrapper',
        position: 'top',
        closeWizard: true,
    },
    {
        title: '❤️ Favourites Gallery',
        description: 'Tap this glowing card to explore our team\'s hand-picked best ice sculpture renders. Get inspired before you build!',
        target: '.fav-card',
        position: 'top',
    },
    {
        title: '💬 Ice Assistant Chatbot',
        description: 'Need help? This floating chat assistant can answer questions about ice sculptures, guide you through features, and offer suggestions — anytime!',
        target: '.ice-chat-fab',
        position: 'top',
    },
];

const GuidedTour = ({ onComplete, setWizardOpen, setWizardStep, setBuildMode, setSculptureCategory }) => {
    const [step, setStep] = useState(0);
    const [targetRect, setTargetRect] = useState(null);
    const [isVisible, setIsVisible] = useState(false);

    const currentStep = TOUR_STEPS[step];

    // Open/close wizard and set wizard step when tour step changes
    useEffect(() => {
        if (currentStep.openWizard || currentStep.wizardStep !== undefined) {
            setWizardOpen(true);
            if (currentStep.setBuildModeValue && setBuildMode) {
                setBuildMode(currentStep.setBuildModeValue);
            }
            if (currentStep.wizardStep !== undefined) {
                setWizardStep(currentStep.wizardStep);
            }
        }
        if (currentStep.selectCategory && setSculptureCategory) {
            setSculptureCategory(currentStep.selectCategory);
        }
        if (currentStep.closeWizard) {
            setWizardOpen(false);
            if (setBuildMode) setBuildMode('');
            if (setSculptureCategory) setSculptureCategory('');
        }
    }, [step, currentStep, setWizardOpen, setWizardStep, setBuildMode, setSculptureCategory]);

    const measureTarget = useCallback(() => {
        const el = document.querySelector(currentStep.target);
        if (el) {
            const rect = el.getBoundingClientRect();
            setTargetRect({
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height,
            });
        } else {
            setTargetRect(null);
        }
    }, [step, currentStep.target]);

    useEffect(() => {
        const t = setTimeout(() => setIsVisible(true), 200);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        // Small delay to let wizard DOM render before measuring
        const t = setTimeout(() => measureTarget(), 150);
        window.addEventListener('resize', measureTarget);
        window.addEventListener('scroll', measureTarget, true);
        return () => {
            clearTimeout(t);
            window.removeEventListener('resize', measureTarget);
            window.removeEventListener('scroll', measureTarget, true);
        };
    }, [measureTarget]);

    const handleNext = () => {
        if (step < TOUR_STEPS.length - 1) {
            setStep(step + 1);
        } else {
            handleFinish();
        }
    };

    const handleBack = () => {
        if (step > 0) setStep(step - 1);
    };

    const handleFinish = () => {
        localStorage.removeItem('cynx_show_tour');
        setWizardOpen(false);
        if (setSculptureCategory) setSculptureCategory('');
        setIsVisible(false);
        setTimeout(() => onComplete(), 300);
    };

    const handleSkip = () => {
        localStorage.removeItem('cynx_show_tour');
        setWizardOpen(false);
        if (setSculptureCategory) setSculptureCategory('');
        setIsVisible(false);
        setTimeout(() => onComplete(), 300);
    };

    // Compute tooltip position
    const getTooltipStyle = () => {
        const isMobile = window.innerWidth <= 600;
        const tooltipWidth = isMobile ? window.innerWidth - 24 : 360;

        if (!targetRect) {
            return {
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
            };
        }

        const padding = isMobile ? 12 : 16;
        const pos = currentStep.position;

        let style = {};

        // On mobile, always place tooltip at bottom of viewport for wizard steps
        if (isMobile && (pos === 'right' || pos === 'center')) {
            style.bottom = padding;
            style.left = padding / 2;
            style.right = padding / 2;
            style.width = `calc(100vw - ${padding}px)`;
            style.maxHeight = '40vh';
            style.overflowY = 'auto';
            return style;
        }

        if (pos === 'bottom') {
            style.top = targetRect.top + targetRect.height + padding;
            style.left = Math.max(padding, Math.min(
                targetRect.left + targetRect.width / 2 - tooltipWidth / 2,
                window.innerWidth - tooltipWidth - padding
            ));
        } else if (pos === 'top') {
            style.bottom = window.innerHeight - targetRect.top + padding;
            style.left = Math.max(padding, Math.min(
                targetRect.left + targetRect.width / 2 - tooltipWidth / 2,
                window.innerWidth - tooltipWidth - padding
            ));
        } else if (pos === 'right') {
            // Position to the right of the target, vertically centered
            const rightEdge = targetRect.left + targetRect.width + padding;
            if (rightEdge + tooltipWidth < window.innerWidth - padding) {
                style.left = rightEdge;
            } else {
                // Not enough space on the right — place to the left
                style.right = window.innerWidth - targetRect.left + padding;
            }
            style.top = Math.max(padding, Math.min(
                targetRect.top + targetRect.height / 2 - 100,
                window.innerHeight - 250
            ));
        } else if (pos === 'center') {
            style.top = targetRect.top + targetRect.height / 2;
            style.left = targetRect.left + targetRect.width / 2;
            style.transform = 'translate(-50%, -50%)';
        }

        // On mobile, clamp left/right for top/bottom positions too
        if (isMobile && (pos === 'top' || pos === 'bottom')) {
            style.left = padding / 2;
            style.right = padding / 2;
            style.width = `calc(100vw - ${padding}px)`;
        }

        return style;
    };

    return (
        <div className={`tour-overlay ${isVisible ? 'visible' : ''}`}>
            {/* Dark backdrop with spotlight cutout */}
            <svg className="tour-backdrop" width="100%" height="100%">
                <defs>
                    <mask id="tour-mask">
                        <rect width="100%" height="100%" fill="white" />
                        {targetRect && (
                            <rect
                                x={targetRect.left - 8}
                                y={targetRect.top - 8}
                                width={targetRect.width + 16}
                                height={targetRect.height + 16}
                                rx="12"
                                fill="black"
                            />
                        )}
                    </mask>
                </defs>
                <rect width="100%" height="100%" fill="rgba(15, 23, 42, 0.7)" mask="url(#tour-mask)" />
            </svg>

            {/* Spotlight ring */}
            {targetRect && (
                <div
                    className="tour-spotlight"
                    style={{
                        top: targetRect.top - 8,
                        left: targetRect.left - 8,
                        width: targetRect.width + 16,
                        height: targetRect.height + 16,
                    }}
                />
            )}

            {/* Tooltip card */}
            <div className="tour-tooltip" style={getTooltipStyle()}>
                <div className="tour-tooltip-header">
                    <div className="tour-step-badge">
                        <Sparkles size={12} />
                        {step + 1} / {TOUR_STEPS.length}
                    </div>
                    <button className="tour-skip-btn" onClick={handleSkip}>Skip Tour</button>
                </div>

                <h3 className="tour-tooltip-title">{currentStep.title}</h3>
                <p className="tour-tooltip-desc">{currentStep.description}</p>

                {/* Progress dots */}
                <div className="tour-progress">
                    {TOUR_STEPS.map((_, i) => (
                        <div
                            key={i}
                            className={`tour-dot ${i === step ? 'active' : ''} ${i < step ? 'completed' : ''}`}
                        />
                    ))}
                </div>

                <div className="tour-tooltip-actions">
                    {step > 0 && (
                        <button className="tour-btn tour-btn-back" onClick={handleBack}>
                            <ArrowLeft size={15} /> Back
                        </button>
                    )}
                    <div style={{ flex: 1 }} />
                    <button className="tour-btn tour-btn-next" onClick={handleNext}>
                        {step < TOUR_STEPS.length - 1 ? (
                            <>Next <ArrowRight size={15} /></>
                        ) : (
                            <>Finish Tour <Sparkles size={15} /></>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GuidedTour;
