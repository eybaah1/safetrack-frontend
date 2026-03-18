import { useState, useRef } from 'react';
import { Siren } from 'lucide-react';

export default function SOSButton({ onActivate }) {
    const [isPressed, setIsPressed] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);
    const pressTimerRef = useRef(null);
    const tooltipTimerRef = useRef(null);

    const handlePressStart = () => {
        setIsPressed(true);
        setShowTooltip(false);

        // Start 2-second timer for activation
        pressTimerRef.current = setTimeout(() => {
            // SOS Activated!
            console.log('🚨 SOS ACTIVATED - Sending location to security');
            setIsPressed(false);
            if (onActivate) {
                onActivate();
            }
        }, 2000);
    };

    const handlePressEnd = () => {
        // If released before 2 seconds, show tooltip
        if (pressTimerRef.current) {
            clearTimeout(pressTimerRef.current);
            pressTimerRef.current = null;

            if (isPressed) {
                setShowTooltip(true);
                tooltipTimerRef.current = setTimeout(() => {
                    setShowTooltip(false);
                }, 2000);
            }
        }
        setIsPressed(false);
    };

    return (
        <div className="absolute bottom-[172px] right-4 z-[1000]">
            {/* Tooltip */}
            {showTooltip && (
                <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-bg-secondary rounded-lg border border-border shadow-lg whitespace-nowrap">
                    <p className="text-sm text-text-primary">Hold for 2 seconds to activate SOS</p>
                    <div className="absolute bottom-0 right-4 translate-y-1/2 rotate-45 w-2 h-2 bg-bg-secondary border-r border-b border-border" />
                </div>
            )}

            {/* SOS Button */}
            <button
                onMouseDown={handlePressStart}
                onMouseUp={handlePressEnd}
                onMouseLeave={handlePressEnd}
                onTouchStart={handlePressStart}
                onTouchEnd={handlePressEnd}
                className={`relative w-[72px] h-[72px] bg-danger rounded-full flex items-center justify-center shadow-lg transition-transform ${isPressed ? 'scale-95' : 'hover:scale-105'
                    } sos-pulse`}
                aria-label="SOS Emergency Button - Hold for 2 seconds to activate"
            >
                {/* Progress Ring (shows during long press) */}
                {isPressed && (
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 72 72">
                        <circle
                            cx="36"
                            cy="36"
                            r="34"
                            fill="none"
                            stroke="white"
                            strokeWidth="3"
                            className="progress-ring-circle active"
                        />
                    </svg>
                )}

                {/* Icon */}
                <Siren className="w-8 h-8 text-white" />
            </button>
        </div>
    );
}
