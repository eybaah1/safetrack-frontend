import { useState, useEffect } from 'react';
import { AlertTriangle, Shield, MapPin, Clock, Loader2 } from 'lucide-react';
import TopBar from '../components/layout/TopBar';
import BottomNav from '../components/layout/BottomNav';
import MenuDrawer from '../components/MenuDrawer';
import notificationsAPI from '../api/notifications';

export default function Alerts({ onSignOut }) {
    const [showMenu, setShowMenu] = useState(false);
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        notificationsAPI.broadcasts()
            .then(({ data }) => setAlerts(data.results || data || []))
            .catch(() => setAlerts([]))
            .finally(() => setLoading(false));
    }, []);

    const getBadge = (type) => {
        if (type === 'security') return { bg: 'rgba(34,139,34,0.1)', color: 'var(--color-secondary)', Icon: Shield };
        if (type === 'shuttle') return { bg: 'rgba(59,130,246,0.1)', color: 'var(--color-accent)', Icon: MapPin };
        return { bg: 'rgba(212,160,23,0.1)', color: 'var(--color-primary)', Icon: AlertTriangle };
    };

    return (
        <div style={{ position: 'relative', width: '100%', minHeight: '100vh', backgroundColor: 'var(--color-bg-primary)', paddingBottom: '80px' }}>
            <TopBar currentLocation="Alerts" showSearch={false} onMenuClick={() => setShowMenu(true)} />

            <div style={{ paddingTop: '80px', padding: '80px 16px 80px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <AlertTriangle style={{ width: '20px', height: '20px', color: 'var(--color-primary)' }} />
                    <h2 style={{ fontWeight: '600', color: 'var(--color-text-primary)', margin: 0 }}>Latest Updates</h2>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
                        <Loader2 style={{ width: '24px', height: '24px', color: 'var(--color-primary)' }} className="animate-spin" />
                    </div>
                ) : alerts.length === 0 ? (
                    <div style={{
                        backgroundColor: 'var(--color-bg-secondary)', borderRadius: '12px',
                        padding: '24px', border: '1px solid var(--color-border)', textAlign: 'center',
                    }}>
                        <p style={{ fontWeight: '600', color: 'var(--color-text-primary)', margin: 0 }}>No alerts yet</p>
                        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                            Updates and safety notices will appear here.
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {alerts.map((alert) => {
                            const badge = getBadge(alert.type || alert.alert_type);
                            const Icon = badge.Icon;
                            return (
                                <div key={alert.id} style={{
                                    backgroundColor: 'var(--color-bg-secondary)', borderRadius: '12px',
                                    padding: '16px', border: '1px solid var(--color-border)',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                        <div style={{
                                            width: '40px', height: '40px', backgroundColor: badge.bg,
                                            borderRadius: '8px', display: 'flex', alignItems: 'center',
                                            justifyContent: 'center', flexShrink: 0,
                                        }}>
                                            <Icon style={{ width: '20px', height: '20px', color: badge.color }} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontWeight: '600', color: 'var(--color-text-primary)', margin: 0 }}>
                                                {alert.title}
                                            </p>
                                            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: '4px 0 0 0' }}>
                                                {alert.message}
                                            </p>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '12px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                                                {alert.location && (
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <MapPin style={{ width: '12px', height: '12px' }} /> {alert.location}
                                                    </span>
                                                )}
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Clock style={{ width: '12px', height: '12px' }} />
                                                    {new Date(alert.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <BottomNav activeTab="alerts" />
            <MenuDrawer isOpen={showMenu} onClose={() => setShowMenu(false)} onSignOut={onSignOut} />
        </div>
    );
}