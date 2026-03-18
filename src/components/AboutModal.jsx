import { useRef } from 'react';
import { X, Shield, Users } from 'lucide-react';
import useEscapeKey from '../hooks/useEscapeKey';
import useFocusTrap from '../hooks/useFocusTrap';

export default function AboutModal({ isOpen, onClose }) {
    const modalRef = useRef(null);
    const closeBtnRef = useRef(null);
    useEscapeKey(isOpen, onClose);
    useFocusTrap({ enabled: isOpen, containerRef: modalRef, initialFocusRef: closeBtnRef });
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
        }}>
            {/* Backdrop */}
            <div
                style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
                onClick={onClose}
            />

            {/* Modal */}
            <div style={{
                position: 'relative',
                width: '100%',
                maxWidth: '400px',
                backgroundColor: 'var(--color-bg-secondary)',
                borderRadius: '16px',
                border: '1px solid var(--color-border)',
                overflow: 'hidden',
            }}
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="about-title"
            >
                {/* Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px',
                    borderBottom: '1px solid var(--color-border)',
                }}>
                    <h2 id="about-title" style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-text-primary)', margin: 0 }}>About SafeTrack</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{ padding: '8px', borderRadius: '8px', background: 'none', border: 'none', cursor: 'pointer' }}
                        aria-label="Close"
                        ref={closeBtnRef}
                    >
                        <X style={{ width: '20px', height: '20px', color: 'var(--color-text-secondary)' }} />
                    </button>
                </div>

                {/* Content */}
                <div style={{ padding: '24px', maxHeight: '60vh', overflowY: 'auto' }}>
                    {/* App Info */}
                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            margin: '0 auto 16px',
                            backgroundColor: 'var(--color-bg-primary)',
                            borderRadius: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid var(--color-border)',
                        }}>
                            <Shield style={{ width: '40px', height: '40px', color: 'var(--color-primary)' }} />
                        </div>
                        <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--color-text-primary)', margin: '0 0 4px 0' }}>KNUST SafeTrack</h3>
                        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: 0 }}>Campus Safety & Security</p>
                        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '8px' }}>Version 1.0.0</p>
                    </div>

                    {/* Description */}
                    <div style={{
                        backgroundColor: 'var(--color-bg-primary)',
                        borderRadius: '12px',
                        padding: '16px',
                        marginBottom: '16px',
                    }}>
                        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '1.6', margin: 0 }}>
                            SafeTrack is a real-time web-based application designed to enhance the safety
                            and mobility of students at KNUST. It provides peer tracking and a rapid-response
                            security alert system for students commuting at night.
                        </p>
                    </div>

                    {/* Features */}
                    <div style={{ marginBottom: '16px' }}>
                        <h4 style={{ fontSize: '12px', fontWeight: '500', color: 'var(--color-text-muted)', marginBottom: '12px' }}>KEY FEATURES</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <div style={{ backgroundColor: 'var(--color-bg-primary)', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
                                <Shield style={{ width: '20px', height: '20px', color: 'var(--color-danger)', margin: '0 auto 4px' }} />
                                <p style={{ fontSize: '12px', color: 'var(--color-text-primary)', margin: 0 }}>SOS Alerts</p>
                            </div>
                            <div style={{ backgroundColor: 'var(--color-bg-primary)', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
                                <Users style={{ width: '20px', height: '20px', color: 'var(--color-primary)', margin: '0 auto 4px' }} />
                                <p style={{ fontSize: '12px', color: 'var(--color-text-primary)', margin: 0 }}>Walk With Me</p>
                            </div>
                        </div>
                    </div>

                    {/* Team */}
                    <div style={{ marginBottom: '16px' }}>
                        <h4 style={{ fontSize: '12px', fontWeight: '500', color: 'var(--color-text-muted)', marginBottom: '12px' }}>DEVELOPED BY</h4>
                        <div style={{ backgroundColor: 'var(--color-bg-primary)', borderRadius: '12px', padding: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    backgroundColor: 'rgba(74,222,128,0.2)',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    <Users style={{ width: '20px', height: '20px', color: 'var(--color-secondary)' }} />
                                </div>
                                <div>
                                    <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-text-primary)', margin: 0 }}>Group 31</p>
                                    <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '2px 0 0 0' }}>CSM 399 - Capstone Project</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* University */}
                    <div style={{ textAlign: 'center', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
                        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0 }}>
                            Kwame Nkrumah University of Science and Technology
                        </p>
                        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                            Department of Computer Science
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div style={{ padding: '16px', borderTop: '1px solid var(--color-border)' }}>
                    <button
                        onClick={onClose}
                        style={{
                            width: '100%',
                            padding: '12px',
                            backgroundColor: 'var(--color-bg-tertiary)',
                            color: 'var(--color-text-primary)',
                            borderRadius: '12px',
                            fontWeight: '600',
                            border: 'none',
                            cursor: 'pointer',
                        }}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
