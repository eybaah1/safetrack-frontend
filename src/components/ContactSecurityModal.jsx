import { useRef } from 'react';
import { X, Phone, MapPin, Clock, Shield, AlertTriangle } from 'lucide-react';
import useEscapeKey from '../hooks/useEscapeKey';
import useFocusTrap from '../hooks/useFocusTrap';

const securityContacts = [
    {
        id: 1,
        name: 'KNUST Security Office',
        phone: '+233 32 206 0331',
        location: 'Main Gate, KNUST',
        available: '24/7',
        primary: true,
    },
    {
        id: 2,
        name: 'Campus Police',
        phone: '+233 32 206 0332',
        location: 'Police Post, Engineering',
        available: '24/7',
        primary: false,
    },
    {
        id: 3,
        name: 'Emergency Response',
        phone: '191',
        location: 'National Emergency',
        available: '24/7',
        primary: false,
    },
    {
        id: 4,
        name: 'University Hospital',
        phone: '+233 32 206 0250',
        location: 'KNUST Hospital',
        available: '24/7',
        primary: false,
    },
];

export default function ContactSecurityModal({ isOpen, onClose }) {
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
                aria-labelledby="contact-security-title"
            >
                {/* Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px',
                    borderBottom: '1px solid var(--color-border)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Shield style={{ width: '20px', height: '20px', color: 'var(--color-secondary)' }} />
                        <h2 id="contact-security-title" style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-text-primary)', margin: 0 }}>Contact Security</h2>
                    </div>
                    <button
                        onClick={onClose}
                        style={{ padding: '8px', borderRadius: '8px', background: 'none', border: 'none', cursor: 'pointer' }}
                        aria-label="Close"
                        ref={closeBtnRef}
                    >
                        <X style={{ width: '20px', height: '20px', color: 'var(--color-text-secondary)' }} />
                    </button>
                </div>

                {/* Emergency Banner */}
                <div style={{
                    margin: '16px',
                    padding: '12px',
                    backgroundColor: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.2)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                }}>
                    <AlertTriangle style={{ width: '20px', height: '20px', color: 'var(--color-danger)', flexShrink: 0 }} />
                    <p style={{ fontSize: '12px', color: 'var(--color-danger)', margin: 0 }}>
                        For immediate danger, use the <strong>SOS button</strong> on the main screen
                    </p>
                </div>

                {/* Content */}
                <div style={{ padding: '0 16px 16px', maxHeight: '50vh', overflowY: 'auto' }}>
                    {securityContacts.map((contact) => (
                        <div
                            key={contact.id}
                            style={{
                                padding: '16px',
                                borderRadius: '12px',
                                marginBottom: '12px',
                                backgroundColor: contact.primary ? 'rgba(74,222,128,0.1)' : 'var(--color-bg-primary)',
                                border: contact.primary ? '1px solid rgba(74,222,128,0.3)' : '1px solid var(--color-border)',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <h3 style={{ fontWeight: '600', color: 'var(--color-text-primary)', fontSize: '14px', margin: 0 }}>
                                            {contact.name}
                                        </h3>
                                        {contact.primary && (
                                            <span style={{ padding: '2px 8px', backgroundColor: 'rgba(74,222,128,0.2)', color: 'var(--color-secondary)', fontSize: '11px', borderRadius: '9999px' }}>
                                                Primary
                                            </span>
                                        )}
                                    </div>
                                    <p style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-primary)', margin: '8px 0 0 0' }}>{contact.phone}</p>
                                </div>
                                <a
                                    href={`tel:${contact.phone.replace(/\s/g, '')}`}
                                    aria-label={`Call ${contact.name}`}
                                    style={{
                                        padding: '12px',
                                        backgroundColor: 'var(--color-primary)',
                                        borderRadius: '12px',
                                        border: 'none',
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Phone style={{ width: '20px', height: '20px', color: 'var(--color-bg-primary)' }} />
                                </a>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <MapPin style={{ width: '12px', height: '12px' }} />
                                    {contact.location}
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Clock style={{ width: '12px', height: '12px' }} />
                                    {contact.available}
                                </span>
                            </div>
                        </div>
                    ))}
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
