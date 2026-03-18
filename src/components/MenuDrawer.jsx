import { useRef, useState, useEffect } from 'react';
import { X, Map, Route, Bell, User, Settings, Shield, LogOut, Info, Phone } from 'lucide-react';
import SettingsModal from './SettingsModal';
import ContactSecurityModal from './ContactSecurityModal';
import AboutModal from './AboutModal';
import useEscapeKey from '../hooks/useEscapeKey';
import useFocusTrap from '../hooks/useFocusTrap';
import notificationsAPI from '../api/notifications';

export default function MenuDrawer({ isOpen, onClose, onSignOut }) {
    const [showSettings, setShowSettings] = useState(false);
    const [showContactSecurity, setShowContactSecurity] = useState(false);
    const [showAbout, setShowAbout] = useState(false);
    const [alertBadge, setAlertBadge] = useState(0);
    const drawerRef = useRef(null);
    const closeBtnRef = useRef(null);

    useEscapeKey(isOpen, onClose);
    useFocusTrap({ enabled: isOpen, containerRef: drawerRef, initialFocusRef: closeBtnRef });

    // Fetch unread notification count
    useEffect(() => {
        if (!isOpen) return;
        notificationsAPI.unreadCount()
            .then(({ data }) => setAlertBadge(data.unread_count || 0))
            .catch(() => {});
    }, [isOpen]);

    if (!isOpen) return null;

    const menuItems = [
        { id: 'map', label: 'Map', icon: Map, hash: '#map' },
        { id: 'trips', label: 'My Trips', icon: Route, hash: '#trips' },
        { id: 'alerts', label: 'Alerts', icon: Bell, hash: '#alerts', badge: alertBadge },
        { id: 'profile', label: 'Profile', icon: User, hash: '#profile' },
    ];

    const handleQuickAction = (action) => {
        switch (action) {
            case 'settings': setShowSettings(true); break;
            case 'security': setShowContactSecurity(true); break;
            case 'about': setShowAbout(true); break;
            default: break;
        }
    };

    return (
        <>
            <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex' }} role="dialog" aria-modal="true" aria-label="Menu">
                {/* Backdrop */}
                <div
                    style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
                    onClick={onClose}
                />

                {/* Drawer */}
                <div
                    ref={drawerRef}
                    className="animate-slide-right"
                    style={{
                        position: 'relative',
                        width: '288px',
                        maxWidth: '85vw',
                        height: '100%',
                        backgroundColor: 'var(--color-bg-secondary)',
                        borderRight: '1px solid var(--color-border)',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    {/* Header */}
                    <div style={{ padding: '20px', borderBottom: '1px solid var(--color-border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    width: '40px', height: '40px',
                                    backgroundColor: 'rgba(212,160,23,0.1)',
                                    borderRadius: '12px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <Shield style={{ width: '20px', height: '20px', color: 'var(--color-primary)' }} />
                                </div>
                                <div>
                                    <h2 style={{ fontWeight: 'bold', color: 'var(--color-text-primary)', margin: 0, fontSize: '16px' }}>SafeTrack</h2>
                                    <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0 }}>KNUST Campus</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                ref={closeBtnRef}
                                type="button"
                                aria-label="Close menu"
                                style={{ padding: '8px', borderRadius: '8px', background: 'none', border: 'none', cursor: 'pointer' }}
                            >
                                <X style={{ width: '20px', height: '20px', color: 'var(--color-text-secondary)' }} />
                            </button>
                        </div>

                        {/* User Info */}
                        <a
                            href="#profile"
                            onClick={onClose}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '12px',
                                padding: '12px', backgroundColor: 'var(--color-bg-primary)',
                                borderRadius: '12px', textDecoration: 'none',
                                border: '1px solid var(--color-border)',
                            }}
                        >
                            <div style={{
                                width: '40px', height: '40px',
                                backgroundColor: 'rgba(34,139,34,0.1)',
                                borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <User style={{ width: '20px', height: '20px', color: 'var(--color-secondary)' }} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-text-primary)', margin: 0 }}>Student</p>
                                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0 }}>View Profile →</p>
                            </div>
                        </a>
                    </div>

                    {/* Navigation */}
                    <nav style={{ flex: 1, padding: '16px' }}>
                        <p style={{ fontSize: '12px', fontWeight: '500', color: 'var(--color-text-muted)', marginBottom: '8px', paddingLeft: '8px' }}>NAVIGATION</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {menuItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = window.location.hash === item.hash || (item.hash === '#map' && !window.location.hash);

                                return (
                                    <a
                                        key={item.id}
                                        href={item.hash}
                                        onClick={onClose}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '12px',
                                            padding: '10px 12px', borderRadius: '12px',
                                            textDecoration: 'none',
                                            backgroundColor: isActive ? 'rgba(212,160,23,0.1)' : 'transparent',
                                            color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                                        }}
                                    >
                                        <Icon style={{ width: '20px', height: '20px' }} />
                                        <span style={{ flex: 1, fontWeight: '500', fontSize: '14px' }}>{item.label}</span>
                                        {item.badge > 0 && (
                                            <span style={{
                                                padding: '2px 8px', fontSize: '12px', fontWeight: 'bold',
                                                borderRadius: '999px',
                                                backgroundColor: 'var(--color-danger)', color: 'white',
                                            }}>
                                                {item.badge}
                                            </span>
                                        )}
                                    </a>
                                );
                            })}
                        </div>

                        <div style={{ margin: '16px 0', borderTop: '1px solid var(--color-border)' }} />

                        <p style={{ fontSize: '12px', fontWeight: '500', color: 'var(--color-text-muted)', marginBottom: '8px', paddingLeft: '8px' }}>QUICK ACTIONS</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {[
                                { id: 'settings', label: 'Settings', icon: Settings },
                                { id: 'security', label: 'Contact Security', icon: Phone },
                                { id: 'about', label: 'About SafeTrack', icon: Info },
                            ].map(({ id, label, icon: Icon }) => (
                                <button
                                    key={id}
                                    type="button"
                                    onClick={() => handleQuickAction(id)}
                                    style={{
                                        width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                                        padding: '10px 12px', borderRadius: '12px',
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        color: 'var(--color-text-secondary)', textAlign: 'left',
                                    }}
                                >
                                    <Icon style={{ width: '20px', height: '20px' }} />
                                    <span style={{ flex: 1, fontWeight: '500', fontSize: '14px' }}>{label}</span>
                                </button>
                            ))}
                        </div>
                    </nav>

                    {/* Sign Out */}
                    <div style={{ padding: '16px', borderTop: '1px solid var(--color-border)' }}>
                        <button
                            type="button"
                            onClick={() => { onClose(); if (onSignOut) onSignOut(); }}
                            style={{
                                width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                                padding: '10px 12px', borderRadius: '12px',
                                background: 'none', border: 'none', cursor: 'pointer',
                                color: 'var(--color-danger)', textAlign: 'left',
                            }}
                        >
                            <LogOut style={{ width: '20px', height: '20px' }} />
                            <span style={{ flex: 1, fontWeight: '500', fontSize: '14px' }}>Sign Out</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
            <ContactSecurityModal isOpen={showContactSecurity} onClose={() => setShowContactSecurity(false)} />
            <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
        </>
    );
}