import { useRef } from 'react';
import {
    LayoutDashboard,
    AlertTriangle,
    MapPin,
    Settings,
    Shield,
    LogOut,
    X
} from 'lucide-react';
import useEscapeKey from '../../hooks/useEscapeKey';
import useFocusTrap from '../../hooks/useFocusTrap';

const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'sos', label: 'Active SOS', icon: AlertTriangle, badgeKey: 'sos' },
    { id: 'heatmap', label: 'Heatmap', icon: MapPin },
    { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({
    activeTab,
    onTabChange,
    variant = 'static',
    onClose,
    onSignOut,
    sosBadge = 0,
}) {
    const isDrawer = variant === 'drawer';
    useEscapeKey(isDrawer, onClose);

    const asideRef = useRef(null);
    const closeBtnRef = useRef(null);
    useFocusTrap({ enabled: isDrawer, containerRef: asideRef, initialFocusRef: closeBtnRef });

    const aside = (
        <aside
            ref={asideRef}
            style={{
                width: isDrawer ? '288px' : '240px',
                maxWidth: isDrawer ? '85vw' : undefined,
                height: isDrawer ? '100%' : '100vh',
                backgroundColor: 'var(--color-bg-secondary)',
                borderRight: '1px solid var(--color-border)',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {/* Logo */}
            <div style={{ padding: '16px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                    <img src="/knust-logo.png" alt="KNUST Logo" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                    <div style={{ minWidth: 0 }}>
                        <h1 style={{ fontWeight: 'bold', color: 'var(--color-text-primary)', fontSize: '14px', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>KNUST SafeTrack</h1>
                        <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0 }}>Security Dashboard</p>
                    </div>
                </div>
                {isDrawer && (
                    <button type="button" onClick={onClose} ref={closeBtnRef} aria-label="Close menu" style={{ padding: '8px', borderRadius: '8px', background: 'none', border: 'none', cursor: 'pointer' }}>
                        <X style={{ width: '20px', height: '20px', color: 'var(--color-text-secondary)' }} />
                    </button>
                )}
            </div>

            {/* Nav */}
            <nav style={{ flex: 1, padding: '12px', overflowY: 'auto' }}>
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    const badge = item.badgeKey === 'sos' ? sosBadge : 0;

                    return (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => { onTabChange(item.id); onClose?.(); }}
                            style={{
                                width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                                padding: '10px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                                textAlign: 'left', marginBottom: '4px',
                                backgroundColor: isActive ? 'rgba(212,160,23,0.1)' : 'transparent',
                                color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                            }}
                        >
                            <Icon style={{ width: '20px', height: '20px' }} />
                            <span style={{ fontWeight: '500', fontSize: '14px', flex: 1 }}>{item.label}</span>
                            {badge > 0 && (
                                <span style={{
                                    padding: '2px 8px', fontSize: '12px', fontWeight: 'bold', borderRadius: '999px',
                                    backgroundColor: isActive ? 'var(--color-primary)' : 'var(--color-danger)',
                                    color: 'white',
                                }}>
                                    {badge}
                                </span>
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* User */}
            <div style={{ padding: '12px', borderTop: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px' }}>
                    <div style={{ width: '36px', height: '36px', backgroundColor: 'rgba(34,139,34,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Shield style={{ width: '20px', height: '20px', color: 'var(--color-secondary)' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-text-primary)', margin: 0 }}>Security Admin</p>
                        <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0 }}>On Duty</p>
                    </div>
                    <button type="button" onClick={() => { onClose?.(); onSignOut?.(); }} aria-label="Sign out" style={{ padding: '8px', borderRadius: '8px', background: 'none', border: 'none', cursor: 'pointer' }}>
                        <LogOut style={{ width: '16px', height: '16px', color: 'var(--color-text-muted)' }} />
                    </button>
                </div>
            </div>
        </aside>
    );

    if (!isDrawer) return aside;

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 3000, display: 'flex' }} role="dialog" aria-modal="true">
            <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
            <div style={{ position: 'relative' }} className="animate-slide-right">
                {aside}
            </div>
        </div>
    );
}