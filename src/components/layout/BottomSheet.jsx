import { useEffect, useState } from 'react';
import { Shield, AlertTriangle, Lightbulb, Phone } from 'lucide-react';

const SAFETY_TIPS = [
    { id: 1, tip: 'Stick to well-lit paths when walking at night', icon: 'light' },
    { id: 2, tip: 'Share your live location with a trusted friend', icon: 'shield' },
    { id: 3, tip: 'Walk in groups — use Walk With Me to find companions', icon: 'shield' },
    { id: 4, tip: 'Save the security hotline: 0322-060-331', icon: 'phone' },
    { id: 5, tip: 'If you feel unsafe, press the SOS button immediately', icon: 'alert' },
];

export default function BottomSheet() {
    const [isExpanded, setIsExpanded] = useState(false);
    const [activeTip, setActiveTip] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveTip((prev) => (prev + 1) % SAFETY_TIPS.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const currentTip = SAFETY_TIPS[activeTip];

    const getTipIcon = (iconType) => {
        switch (iconType) {
            case 'light': return <Lightbulb style={{ width: '20px', height: '20px', color: 'var(--color-primary)' }} />;
            case 'shield': return <Shield style={{ width: '20px', height: '20px', color: 'var(--color-secondary)' }} />;
            case 'phone': return <Phone style={{ width: '20px', height: '20px', color: 'var(--color-accent)' }} />;
            case 'alert': return <AlertTriangle style={{ width: '20px', height: '20px', color: 'var(--color-danger)' }} />;
            default: return <Lightbulb style={{ width: '20px', height: '20px', color: 'var(--color-primary)' }} />;
        }
    };

    return (
        <div
            style={{
                position: 'absolute',
                left: 0, right: 0, bottom: '64px',
                zIndex: 1000,
                backgroundColor: 'var(--color-bg-primary)',
                borderTopLeftRadius: '16px',
                borderTopRightRadius: '16px',
                borderTop: '1px solid var(--color-border)',
                boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
                height: isExpanded ? '50vh' : 'auto',
                transition: 'height 0.3s ease-out',
            }}
        >
            {/* Handle */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '8px', cursor: 'pointer', background: 'none', border: 'none' }}
            >
                <div style={{ width: '40px', height: '4px', backgroundColor: 'var(--color-bg-tertiary)', borderRadius: '999px' }} />
            </button>

            {/* Current tip */}
            <div style={{ padding: '0 16px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '40px', height: '40px',
                        backgroundColor: 'rgba(212,160,23,0.1)',
                        borderRadius: '8px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        {getTipIcon(currentTip.icon)}
                    </div>
                    <div>
                        <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0 }}>Safety Tip</p>
                        <p style={{ fontWeight: '500', color: 'var(--color-text-primary)', fontSize: '14px', margin: 0 }}>{currentTip.tip}</p>
                    </div>
                </div>

                {/* Dots */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '8px' }}>
                    {SAFETY_TIPS.map((_, i) => (
                        <div key={i} style={{
                            height: '6px', borderRadius: '999px', transition: 'all 0.3s',
                            width: i === activeTip ? '24px' : '6px',
                            backgroundColor: i === activeTip ? 'var(--color-primary)' : 'var(--color-bg-tertiary)',
                        }} />
                    ))}
                </div>
            </div>

            {/* Expanded */}
            {isExpanded && (
                <div style={{ padding: '0 16px 16px', overflowY: 'auto', maxHeight: 'calc(50vh - 100px)' }} className="hide-scrollbar">
                    <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '12px' }}>
                        <h3 style={{ fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '12px' }}>All Safety Tips</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {SAFETY_TIPS.map((tip) => (
                                <div key={tip.id} style={{
                                    display: 'flex', alignItems: 'center', gap: '12px',
                                    padding: '12px', backgroundColor: 'var(--color-bg-secondary)',
                                    borderRadius: '12px', border: '1px solid var(--color-border)',
                                }}>
                                    <div style={{
                                        width: '32px', height: '32px', backgroundColor: 'var(--color-bg-tertiary)',
                                        borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                    }}>
                                        {getTipIcon(tip.icon)}
                                    </div>
                                    <p style={{ fontSize: '14px', color: 'var(--color-text-primary)', margin: 0 }}>{tip.tip}</p>
                                </div>
                            ))}
                        </div>

                        {/* Emergency contact */}
                        <div style={{
                            marginTop: '16px', padding: '16px',
                            backgroundColor: 'rgba(220,38,38,0.05)', borderRadius: '12px',
                            border: '1px solid rgba(220,38,38,0.15)',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Phone style={{ width: '20px', height: '20px', color: 'var(--color-danger)' }} />
                                <div>
                                    <p style={{ fontWeight: '600', color: 'var(--color-text-primary)', fontSize: '14px', margin: 0 }}>Campus Security Hotline</p>
                                    <p style={{ color: 'var(--color-danger)', fontWeight: 'bold', margin: 0 }}>0322-060-331</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}