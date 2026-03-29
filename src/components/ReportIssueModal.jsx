import { useState } from 'react';
import { X, Send, CheckCircle, AlertTriangle, Lightbulb, Eye, Wrench, ShieldAlert, FileText, ChevronRight } from 'lucide-react';

const issueTypes = [
    { id: 'lighting', label: 'Lighting Issue', icon: Lightbulb, description: 'Broken or dim street lights' },
    { id: 'suspicious', label: 'Suspicious Activity', icon: Eye, description: 'Unusual or concerning behavior' },
    { id: 'infrastructure', label: 'Infrastructure Problem', icon: Wrench, description: 'Broken gates, fences, or facilities' },
    { id: 'safety_hazard', label: 'Safety Hazard', icon: ShieldAlert, description: 'Obstacles, spills, or dangerous areas' },
    { id: 'emergency_equipment', label: 'Emergency Equipment', icon: AlertTriangle, description: 'Non-functional emergency tools' },
    { id: 'other', label: 'Other', icon: FileText, description: 'Any other safety concern' },
];

const urgencyLevels = [
    { value: 'low', label: 'Low', color: '#22c55e' },
    { value: 'medium', label: 'Medium', color: '#eab308' },
    { value: 'high', label: 'High', color: '#ef4444' },
];

export default function ReportIssueModal({ isOpen, onClose, userPosition }) {
    const [selectedType, setSelectedType] = useState('');
    const [description, setDescription] = useState('');
    const [urgency, setUrgency] = useState('medium');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);

    const handleSubmit = async () => {
        if (!selectedType) return;
        setIsSubmitting(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            console.log('Report submitted:', { type: selectedType, description, urgency, location: userPosition });
            setSubmitStatus('success');
            setTimeout(() => {
                handleReset();
                onClose();
            }, 2500);
        } catch (error) {
            console.error('Failed to submit report:', error);
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReset = () => {
        setSelectedType('');
        setDescription('');
        setUrgency('medium');
        setSubmitStatus(null);
    };

    const handleClose = () => {
        if (!isSubmitting) {
            handleReset();
            onClose();
        }
    };

    if (!isOpen) return null;

    // ── SUCCESS SCREEN ─────────────────────────────────
    if (submitStatus === 'success') {
        return (
            <div style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
            }}>
                <div
                    onClick={handleClose}
                    style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        backdropFilter: 'blur(4px)',
                    }}
                />
                <div style={{
                    position: 'relative',
                    backgroundColor: '#fff',
                    borderRadius: '24px',
                    padding: '40px 32px',
                    maxWidth: '380px',
                    width: '100%',
                    textAlign: 'center',
                    boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
                    animation: 'reportScaleIn 0.3s ease-out',
                }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 24px',
                        boxShadow: '0 8px 24px rgba(34,197,94,0.4)',
                        animation: 'reportBounce 0.5s ease-out 0.2s both',
                    }}>
                        <CheckCircle size={40} color="#fff" />
                    </div>
                    <h2 style={{
                        fontSize: '22px',
                        fontWeight: '700',
                        color: '#111827',
                        margin: '0 0 12px',
                    }}>
                        Report Sent!
                    </h2>
                    <p style={{
                        fontSize: '15px',
                        color: '#6b7280',
                        margin: '0 0 8px',
                        lineHeight: '1.5',
                    }}>
                        Your report has been successfully submitted to campus authorities.
                    </p>
                    <p style={{
                        fontSize: '13px',
                        color: '#9ca3af',
                    }}>
                        Thank you for helping keep our campus safe! 🛡️
                    </p>
                </div>

                <style>{`
                    @keyframes reportScaleIn {
                        from { opacity: 0; transform: scale(0.85); }
                        to { opacity: 1; transform: scale(1); }
                    }
                    @keyframes reportBounce {
                        0% { transform: scale(0); }
                        60% { transform: scale(1.15); }
                        100% { transform: scale(1); }
                    }
                `}</style>
            </div>
        );
    }

    // ── ERROR SCREEN ───────────────────────────────────
    if (submitStatus === 'error') {
        return (
            <div style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
            }}>
                <div
                    onClick={handleClose}
                    style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        backdropFilter: 'blur(4px)',
                    }}
                />
                <div style={{
                    position: 'relative',
                    backgroundColor: '#fff',
                    borderRadius: '24px',
                    padding: '40px 32px',
                    maxWidth: '380px',
                    width: '100%',
                    textAlign: 'center',
                    boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
                }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 24px',
                    }}>
                        <X size={40} color="#fff" />
                    </div>
                    <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', margin: '0 0 12px' }}>
                        Submission Failed
                    </h2>
                    <p style={{ fontSize: '15px', color: '#6b7280', margin: '0 0 24px' }}>
                        Something went wrong. Please try again.
                    </p>
                    <button
                        onClick={() => setSubmitStatus(null)}
                        style={{
                            width: '100%',
                            padding: '14px',
                            backgroundColor: '#ef4444',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '14px',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: 'pointer',
                        }}
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // ── MAIN FORM ──────────────────────────────────────
    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
        }}>
            {/* Backdrop */}
            <div
                onClick={handleClose}
                style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(4px)',
                }}
            />

            {/* Modal */}
            <div style={{
                position: 'relative',
                backgroundColor: '#fff',
                borderRadius: '24px 24px 0 0',
                width: '100%',
                maxWidth: '500px',
                maxHeight: '92vh',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 -10px 40px rgba(0,0,0,0.2)',
                animation: 'reportSlideUp 0.3s ease-out',
            }}>
                {/* Drag Handle */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    paddingTop: '12px',
                }}>
                    <div style={{
                        width: '40px',
                        height: '4px',
                        backgroundColor: '#d1d5db',
                        borderRadius: '2px',
                    }} />
                </div>

                {/* Header */}
                <div style={{
                    padding: '16px 20px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid #f3f4f6',
                }}>
                    <div>
                        <h2 style={{
                            fontSize: '20px',
                            fontWeight: '700',
                            color: '#111827',
                            margin: 0,
                        }}>
                            Report an Issue
                        </h2>
                        <p style={{
                            fontSize: '13px',
                            color: '#9ca3af',
                            margin: '2px 0 0',
                        }}>
                            Help us keep campus safe
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        disabled={isSubmitting}
                        style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            backgroundColor: '#f3f4f6',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                        }}
                    >
                        <X size={18} color="#6b7280" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div style={{
                    overflowY: 'auto',
                    padding: '20px',
                    flex: 1,
                }}>

                    {/* Issue Type */}
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#374151',
                            marginBottom: '12px',
                        }}>
                            What type of issue? <span style={{ color: '#ef4444' }}>*</span>
                        </label>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {issueTypes.map((type) => {
                                const Icon = type.icon;
                                const isSelected = selectedType === type.id;

                                return (
                                    <button
                                        key={type.id}
                                        type="button"
                                        onClick={() => setSelectedType(type.id)}
                                        style={{
                                            width: '100%',
                                            padding: '14px 16px',
                                            borderRadius: '16px',
                                            border: `2px solid ${isSelected ? '#ef4444' : '#e5e7eb'}`,
                                            backgroundColor: isSelected ? '#fef2f2' : '#fff',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '14px',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            transition: 'all 0.15s ease',
                                        }}
                                    >
                                        <div style={{
                                            width: '44px',
                                            height: '44px',
                                            borderRadius: '12px',
                                            backgroundColor: isSelected ? '#fee2e2' : '#f3f4f6',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0,
                                        }}>
                                            <Icon size={22} color={isSelected ? '#ef4444' : '#6b7280'} />
                                        </div>

                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{
                                                fontSize: '15px',
                                                fontWeight: '600',
                                                color: isSelected ? '#b91c1c' : '#111827',
                                            }}>
                                                {type.label}
                                            </div>
                                            <div style={{
                                                fontSize: '12px',
                                                color: '#9ca3af',
                                                marginTop: '2px',
                                            }}>
                                                {type.description}
                                            </div>
                                        </div>

                                        {isSelected ? (
                                            <div style={{
                                                width: '24px',
                                                height: '24px',
                                                borderRadius: '50%',
                                                backgroundColor: '#ef4444',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0,
                                            }}>
                                                <CheckCircle size={14} color="#fff" />
                                            </div>
                                        ) : (
                                            <ChevronRight size={18} color="#d1d5db" style={{ flexShrink: 0 }} />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Urgency */}
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#374151',
                            marginBottom: '12px',
                        }}>
                            Urgency Level
                        </label>

                        <div style={{ display: 'flex', gap: '8px' }}>
                            {urgencyLevels.map((level) => {
                                const isActive = urgency === level.value;
                                return (
                                    <button
                                        key={level.value}
                                        type="button"
                                        onClick={() => setUrgency(level.value)}
                                        style={{
                                            flex: 1,
                                            padding: '12px 8px',
                                            borderRadius: '12px',
                                            border: `2px solid ${isActive ? level.color : '#e5e7eb'}`,
                                            backgroundColor: isActive ? `${level.color}15` : '#fff',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            transition: 'all 0.15s ease',
                                        }}
                                    >
                                        <div style={{
                                            width: '8px',
                                            height: '8px',
                                            borderRadius: '50%',
                                            backgroundColor: level.color,
                                        }} />
                                        <span style={{
                                            fontSize: '14px',
                                            fontWeight: isActive ? '600' : '500',
                                            color: isActive ? '#111827' : '#6b7280',
                                        }}>
                                            {level.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Description */}
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#374151',
                            marginBottom: '8px',
                        }}>
                            Describe the Issue
                        </label>

                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Provide specific details — exact location, what you observed, time, etc..."
                            maxLength={500}
                            rows={4}
                            style={{
                                width: '100%',
                                padding: '14px 16px',
                                borderRadius: '14px',
                                border: '2px solid #e5e7eb',
                                outline: 'none',
                                resize: 'none',
                                fontSize: '14px',
                                color: '#111827',
                                fontFamily: 'inherit',
                                lineHeight: '1.5',
                                boxSizing: 'border-box',
                                transition: 'border-color 0.15s ease',
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#ef4444'}
                            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                        />

                        <div style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            marginTop: '4px',
                        }}>
                            <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                                {description.length}/500
                            </span>
                        </div>
                    </div>

                    {/* Location Card */}
                    <div style={{
                        padding: '14px 16px',
                        backgroundColor: '#eff6ff',
                        borderRadius: '14px',
                        border: '1px solid #dbeafe',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        marginBottom: '8px',
                    }}>
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            backgroundColor: '#dbeafe',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            fontSize: '18px',
                        }}>
                            📍
                        </div>
                        <div>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>
                                Location Attached
                            </div>
                            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                                Your current location will be included to help authorities respond.
                            </div>
                            {userPosition && (
                                <div style={{
                                    fontSize: '11px',
                                    color: '#3b82f6',
                                    marginTop: '4px',
                                    fontFamily: 'monospace',
                                }}>
                                    {userPosition.lat?.toFixed(5)}, {userPosition.lng?.toFixed(5)}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div style={{
                    padding: '16px 20px',
                    paddingBottom: '24px',
                    borderTop: '1px solid #f3f4f6',
                    backgroundColor: '#fff',
                }}>
                    <button
                        onClick={handleSubmit}
                        disabled={!selectedType || isSubmitting}
                        style={{
                            width: '100%',
                            padding: '16px',
                            borderRadius: '16px',
                            border: 'none',
                            fontSize: '16px',
                            fontWeight: '700',
                            cursor: selectedType && !isSubmitting ? 'pointer' : 'not-allowed',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            transition: 'all 0.15s ease',
                            backgroundColor: selectedType && !isSubmitting ? '#ef4444' : '#e5e7eb',
                            color: selectedType && !isSubmitting ? '#fff' : '#9ca3af',
                            boxShadow: selectedType && !isSubmitting
                                ? '0 4px 14px rgba(239,68,68,0.4)'
                                : 'none',
                        }}
                    >
                        {isSubmitting ? (
                            <>
                                <div style={{
                                    width: '20px',
                                    height: '20px',
                                    border: '3px solid rgba(255,255,255,0.3)',
                                    borderTopColor: '#fff',
                                    borderRadius: '50%',
                                    animation: 'reportSpin 0.8s linear infinite',
                                }} />
                                Sending Report...
                            </>
                        ) : (
                            <>
                                <Send size={18} />
                                Submit Report
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Animations */}
            <style>{`
                @keyframes reportSlideUp {
                    from {
                        opacity: 0;
                        transform: translateY(100%);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes reportSpin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}