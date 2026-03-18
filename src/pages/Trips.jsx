import { useState, useEffect } from 'react';
import { Clock, MapPin, Users, ChevronRight, Calendar, Loader2, AlertTriangle } from 'lucide-react';
import TopBar from '../components/layout/TopBar';
import BottomNav from '../components/layout/BottomNav';
import MenuDrawer from '../components/MenuDrawer';
import walksAPI from '../api/walks';
import sosAPI from '../api/sos';

export default function Trips({ onSignOut }) {
    const [showMenu, setShowMenu] = useState(false);
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrips = async () => {
            try {
                const [walksRes, sosRes] = await Promise.allSettled([
                    walksAPI.myHistory(),
                    sosAPI.myHistory(),
                ]);

                const walkTrips = (walksRes.status === 'fulfilled'
                    ? (walksRes.value.data.results || walksRes.value.data || [])
                    : []
                );

                const sosTrips = (sosRes.status === 'fulfilled'
                    ? (sosRes.value.data.results || sosRes.value.data || [])
                    : []
                ).map((s) => ({
                    id: s.id,
                    type: 'sos',
                    title: 'SOS Alert',
                    from_location: s.location || s.location_text || 'Unknown',
                    to_location: 'Security Response',
                    status: s.status,
                    date: s.timestamp || s.triggered_at,
                    duration: s.resolved_at
                        ? `${Math.max(1, Math.round((new Date(s.resolved_at) - new Date(s.triggered_at || s.timestamp)) / 60000))} min`
                        : 'Ongoing',
                }));

                const all = [...walkTrips, ...sosTrips].sort(
                    (a, b) => new Date(b.date || b.created_at) - new Date(a.date || a.created_at)
                );
                setTrips(all);
            } catch {} finally {
                setLoading(false);
            }
        };
        fetchTrips();
    }, []);

    const getBadge = (type) => {
        if (type === 'walk') return { bg: 'rgba(212,160,23,0.1)', color: 'var(--color-primary)' };
        if (type === 'sos') return { bg: 'rgba(220,38,38,0.1)', color: 'var(--color-danger)' };
        return { bg: 'rgba(34,139,34,0.1)', color: 'var(--color-secondary)' };
    };

    return (
        <div style={{ position: 'relative', width: '100%', minHeight: '100vh', backgroundColor: 'var(--color-bg-primary)', paddingBottom: '80px' }}>
            <TopBar currentLocation="Trip History" showSearch={false} onMenuClick={() => setShowMenu(true)} />

            <div style={{ paddingTop: '80px', padding: '80px 16px 80px 16px' }}>
                {/* Stats */}
                <div className="grid grid-cols-3 gap-3" style={{ marginBottom: '24px' }}>
                    {[
                        { icon: Users, label: 'Safe Walks', value: trips.filter((t) => t.type === 'walk').length, color: 'var(--color-primary)', bg: 'rgba(212,160,23,0.1)' },
                        { icon: AlertTriangle, label: 'SOS Alerts', value: trips.filter((t) => t.type === 'sos').length, color: 'var(--color-danger)', bg: 'rgba(220,38,38,0.1)' },
                        { icon: Clock, label: 'Total Trips', value: trips.length, color: 'var(--color-accent)', bg: 'rgba(59,130,246,0.1)' },
                    ].map(({ icon: Icon, label, value, color, bg }) => (
                        <div key={label} style={{ backgroundColor: 'var(--color-bg-secondary)', borderRadius: '12px', padding: '16px', border: '1px solid var(--color-border)' }}>
                            <div style={{ width: '32px', height: '32px', backgroundColor: bg, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                                <Icon style={{ width: '16px', height: '16px', color }} />
                            </div>
                            <p style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--color-text-primary)', margin: 0 }}>{value}</p>
                            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0 }}>{label}</p>
                        </div>
                    ))}
                </div>

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <Calendar style={{ width: '20px', height: '20px', color: 'var(--color-text-secondary)' }} />
                    <h2 style={{ fontWeight: '600', color: 'var(--color-text-primary)', margin: 0 }}>Recent Activity</h2>
                </div>

                {/* Trips List */}
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
                        <Loader2 style={{ width: '24px', height: '24px', color: 'var(--color-primary)' }} className="animate-spin" />
                    </div>
                ) : trips.length === 0 ? (
                    <div style={{
                        backgroundColor: 'var(--color-bg-secondary)', borderRadius: '12px',
                        padding: '24px', border: '1px solid var(--color-border)', textAlign: 'center',
                    }}>
                        <p style={{ fontWeight: '600', color: 'var(--color-text-primary)', margin: 0 }}>No trips yet</p>
                        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                            Your walk sessions and alerts will show up here.
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {trips.map((trip) => {
                            const badge = getBadge(trip.type);
                            const title = trip.title || (trip.type === 'walk' ? 'Walk Session' : 'SOS Alert');
                            const from = trip.from_location || trip.origin_name || '';
                            const to = trip.to_location || trip.destination_name || '';
                            const date = trip.date || trip.created_at;

                            return (
                                <div key={trip.id} style={{
                                    backgroundColor: 'var(--color-bg-secondary)', borderRadius: '12px',
                                    padding: '16px', border: '1px solid var(--color-border)',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                                <span style={{
                                                    padding: '2px 8px', borderRadius: '999px',
                                                    fontSize: '12px', fontWeight: '500',
                                                    backgroundColor: badge.bg, color: badge.color,
                                                }}>
                                                    {title}
                                                </span>
                                                <span style={{ fontSize: '12px', color: trip.status === 'completed' ? 'var(--color-secondary)' : 'var(--color-primary)' }}>
                                                    ✓ {trip.status}
                                                </span>
                                            </div>
                                            {(from || to) && (
                                                <p style={{ fontSize: '14px', color: 'var(--color-text-primary)', margin: '0 0 4px 0' }}>
                                                    {from}{from && to ? ' → ' : ''}{to}
                                                </p>
                                            )}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                                                <span>
                                                    {date ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                                                </span>
                                                {trip.duration && <span>• {trip.duration}</span>}
                                            </div>
                                        </div>
                                        <ChevronRight style={{ width: '20px', height: '20px', color: 'var(--color-text-muted)', flexShrink: 0 }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <BottomNav activeTab="trips" />
            <MenuDrawer isOpen={showMenu} onClose={() => setShowMenu(false)} onSignOut={onSignOut} />
        </div>
    );
}