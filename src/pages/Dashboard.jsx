import { useRef, useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import SOSAlertsPanel from '../components/dashboard/SOSAlertsPanel';
import DashboardMap from '../components/dashboard/DashboardMap';
import StatsOverview from '../components/dashboard/StatsOverview';
import { Map, Flame, Menu, AlertTriangle, X, Shield, Bell, Clock, Users, MapPin, CheckCircle, Loader2 } from 'lucide-react';
import useFocusTrap from '../hooks/useFocusTrap';
import useToast from '../hooks/useToast.js';
import dashboardAPI from '../api/dashboard';
import sosAPI from '../api/sos';
import patrolsAPI from '../api/patrols';

export default function Dashboard({ onSignOut }) {
    const toast = useToast();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [selectedAlert, setSelectedAlert] = useState(null);
    const [showHeatmap, setShowHeatmap] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [alertsDrawerOpen, setAlertsDrawerOpen] = useState(false);
    const drawerRef = useRef(null);
    const drawerCloseRef = useRef(null);
    useFocusTrap({ enabled: alertsDrawerOpen, containerRef: drawerRef, initialFocusRef: drawerCloseRef });

    // ── Data state ─────────────────────────────────────
    const [stats, setStats] = useState({});
    const [mapData, setMapData] = useState({ sos_alerts: [], patrol_units: [], active_walks: [] });
    const [heatmapData, setHeatmapData] = useState([]);
    const [sosAlerts, setSosAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sosLoading, setSosLoading] = useState(false);

    // ── Fetch all dashboard data ───────────────────────
    const fetchDashboardData = useCallback(async () => {
        try {
            const { data } = await dashboardAPI.overview();
            setStats(data.stats || {});
            setMapData(data.map || { sos_alerts: [], patrol_units: [], active_walks: [] });
            setSosAlerts(data.map?.sos_alerts || []);
        } catch (err) {
            console.error('Dashboard fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // ── Fetch SOS alerts separately (for SOS tab) ──────
    const fetchSosAlerts = useCallback(async () => {
        setSosLoading(true);
        try {
            const { data } = await sosAPI.active();
            setSosAlerts(data);
        } catch {
            // ignore
        } finally {
            setSosLoading(false);
        }
    }, []);

    // ── Fetch heatmap ──────────────────────────────────
    const fetchHeatmap = useCallback(async () => {
        try {
            const { data } = await dashboardAPI.heatmap(7);
            setHeatmapData(data);
        } catch {
            setHeatmapData([]);
        }
    }, []);

    // ── Initial load + dynamic polling ────────────────
    useEffect(() => {
        fetchDashboardData();
        // Poll every 5 seconds when there are active alerts, 15 seconds otherwise
        const interval = setInterval(() => {
            fetchDashboardData();
        }, stats.total_active_sos > 0 ? 5000 : 15000);
        return () => clearInterval(interval);
    }, [fetchDashboardData, stats.total_active_sos]);

    // Fetch heatmap when tab changes to heatmap
    useEffect(() => {
        if (activeTab === 'heatmap' || showHeatmap) {
            fetchHeatmap();
        }
    }, [activeTab, showHeatmap, fetchHeatmap]);

    // Fetch SOS when tab changes to sos
    useEffect(() => {
        if (activeTab === 'sos') {
            fetchSosAlerts();
        }
    }, [activeTab, fetchSosAlerts]);

    const handleAlertSelect = (alert) => setSelectedAlert(alert);

    const getHeaderTitle = () => {
        switch (activeTab) {
            case 'sos': return 'Active SOS Alerts';
            case 'heatmap': return 'Traffic Heatmap';
            case 'settings': return 'Settings';
            default: return 'Security Dashboard';
        }
    };

    const renderMainContent = () => {
        if (loading && activeTab === 'dashboard') {
            return (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                        <Loader2 style={{ width: '32px', height: '32px', color: 'var(--color-primary)' }} className="animate-spin" />
                        <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', marginTop: '12px' }}>Loading dashboard...</p>
                    </div>
                </div>
            );
        }

        switch (activeTab) {
            case 'sos':
                return (
                    <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
                        <div style={{ padding: '16px' }}>
                            {/* SOS Stats */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                                {[
                                    { label: 'Active Alerts', value: stats.active_alerts ?? 0, color: 'var(--color-danger)', bg: 'rgba(220,38,38,0.08)', Icon: AlertTriangle },
                                    { label: 'Responding', value: stats.responding_alerts ?? 0, color: 'var(--color-primary)', bg: 'rgba(212,160,23,0.08)', Icon: Clock },
                                    { label: 'Resolved Today', value: stats.resolved_today ?? 0, color: 'var(--color-secondary)', bg: 'rgba(34,139,34,0.08)', Icon: CheckCircle },
                                ].map(({ label, value, color, bg, Icon }) => (
                                    <div key={label} style={{ backgroundColor: bg, border: `1px solid ${color}30`, borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Icon style={{ width: '20px', height: '20px', color }} />
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '24px', fontWeight: 'bold', color, margin: 0 }}>{value}</p>
                                            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0 }}>{label}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* SOS List */}
                            <h3 style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-text-secondary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                All Active Alerts
                            </h3>
                            <SOSAlertsPanel
                                alerts={sosAlerts}
                                selectedAlertId={selectedAlert?.id}
                                onSelectAlert={handleAlertSelect}
                                hideHeader={true}
                                loading={sosLoading}
                                onRefresh={fetchSosAlerts}
                            />
                        </div>
                    </div>
                );

            case 'heatmap':
                return (
                    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', position: 'relative' }}>
                        <div style={{
                            backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)',
                            borderBottom: '1px solid var(--color-border)',
                            padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', zIndex: 10,
                        }}>
                            <Flame style={{ width: '16px', height: '16px', color: 'var(--color-danger)' }} />
                            <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--color-text-primary)' }}>Incident Density (7d)</span>
                            <span style={{ color: 'var(--color-text-muted)' }}>|</span>
                            {[['var(--color-secondary)', 'Low'], ['var(--color-primary)', 'Med'], ['var(--color-danger)', 'High']].map(([c, l]) => (
                                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: c, opacity: 0.6 }} />
                                    <span style={{ fontSize: '10px', color: 'var(--color-text-secondary)' }}>{l}</span>
                                </div>
                            ))}
                        </div>
                        <div style={{ flex: 1, minHeight: 0 }}>
                            <DashboardMap
                                showHeatmap={true}
                                selectedAlert={selectedAlert}
                                onAlertClick={handleAlertSelect}
                                sosAlerts={mapData.sos_alerts}
                                patrolUnits={mapData.patrol_units}
                                activeWalks={mapData.active_walks}
                                heatmapData={heatmapData}
                            />
                        </div>
                    </div>
                );

            case 'settings':
                return (
                    <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
                        <div style={{ padding: '16px' }}>
                            <div style={{ backgroundColor: 'var(--color-bg-secondary)', borderRadius: '12px', border: '1px solid var(--color-border)', padding: '16px', marginBottom: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                    <Bell style={{ width: '16px', height: '16px', color: 'var(--color-primary)' }} />
                                    <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-text-primary)', margin: 0 }}>Notifications</h3>
                                </div>
                                {[
                                    { label: 'SOS Alerts', desc: 'New SOS triggered', checked: true },
                                    { label: 'Patrol Alerts', desc: 'New assignments', checked: true },
                                    { label: 'Sound Alerts', desc: 'Critical SOS sounds', checked: true },
                                ].map((s) => (
                                    <div key={s.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
                                        <div>
                                            <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-text-primary)', margin: 0 }}>{s.label}</p>
                                            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '2px 0 0 0' }}>{s.desc}</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                            <input type="checkbox" defaultChecked={s.checked} className="sr-only peer" />
                                            <div className="w-9 h-5 bg-bg-tertiary rounded-full peer peer-checked:bg-primary peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
                                        </label>
                                    </div>
                                ))}
                            </div>

                            <div style={{ backgroundColor: 'var(--color-bg-secondary)', borderRadius: '12px', border: '1px solid rgba(220,38,38,0.2)', padding: '16px' }}>
                                <button type="button" onClick={onSignOut} style={{
                                    width: '100%', padding: '10px',
                                    backgroundColor: 'rgba(220,38,38,0.08)', color: 'var(--color-danger)',
                                    border: '1px solid rgba(220,38,38,0.2)', borderRadius: '8px',
                                    fontWeight: '500', fontSize: '14px', cursor: 'pointer',
                                }}>
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                );

            default:
                return (
                    <>
                        <StatsOverview stats={stats} />

                        <div className="flex-1 min-h-0 flex flex-col xl:flex-row overflow-hidden">
                            <div className="flex-1 min-h-0 flex flex-col">
                                <div className="flex-1 min-h-0">
                                    <DashboardMap
                                        showHeatmap={showHeatmap}
                                        selectedAlert={selectedAlert}
                                        onAlertClick={handleAlertSelect}
                                        sosAlerts={mapData.sos_alerts}
                                        patrolUnits={mapData.patrol_units}
                                        activeWalks={mapData.active_walks}
                                        heatmapData={showHeatmap ? heatmapData : []}
                                    />
                                </div>

                                <div className="lg:hidden min-h-0 h-[45dvh]" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                                    <SOSAlertsPanel
                                        alerts={sosAlerts.length > 0 ? sosAlerts : mapData.sos_alerts}
                                        selectedAlertId={selectedAlert?.id}
                                        onSelectAlert={handleAlertSelect}
                                        onRefresh={fetchDashboardData}
                                    />
                                </div>
                            </div>

                            <div className="hidden xl:block w-80 min-h-0" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                                <SOSAlertsPanel
                                    alerts={sosAlerts.length > 0 ? sosAlerts : mapData.sos_alerts}
                                    selectedAlertId={selectedAlert?.id}
                                    onSelectAlert={handleAlertSelect}
                                    onRefresh={fetchDashboardData}
                                />
                            </div>
                        </div>
                    </>
                );
        }
    };

    return (
        <div className="flex h-[100dvh] bg-bg-primary overflow-hidden">
            <div className="hidden md:flex">
                <Sidebar
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    onSignOut={onSignOut}
                    sosBadge={stats.total_active_sos || mapData.sos_alerts?.length || 0}
                />
            </div>

            {mobileSidebarOpen && (
                <Sidebar
                    variant="drawer"
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    onClose={() => setMobileSidebarOpen(false)}
                    onSignOut={onSignOut}
                    sosBadge={stats.total_active_sos || 0}
                />
            )}

            <div className="flex-1 flex flex-col overflow-hidden">
                <header style={{
                    backgroundColor: 'var(--color-bg-secondary)',
                    borderBottom: '1px solid var(--color-border)',
                    padding: '16px',
                    display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button
                            type="button"
                            onClick={() => setMobileSidebarOpen(true)}
                            className="md:hidden"
                            style={{
                                width: '40px', height: '40px', borderRadius: '8px',
                                backgroundColor: 'var(--color-bg-tertiary)',
                                border: 'none', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                            aria-label="Open menu"
                        >
                            <Menu style={{ width: '20px', height: '20px', color: 'var(--color-text-primary)' }} />
                        </button>
                        <div>
                            <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--color-text-primary)', margin: 0 }}>
                                {getHeaderTitle()}
                            </h1>
                            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: 0 }}>
                                Real-time campus security monitoring
                            </p>
                        </div>
                    </div>

                    {activeTab === 'dashboard' && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {[
                                { label: 'Live Map', icon: Map, active: !showHeatmap, onClick: () => setShowHeatmap(false) },
                                { label: 'Heatmap', icon: Flame, active: showHeatmap, onClick: () => setShowHeatmap(true) },
                            ].map(({ label, icon: Icon, active, onClick }) => (
                                <button
                                    key={label}
                                    type="button"
                                    onClick={onClick}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '8px',
                                        padding: '8px 12px', borderRadius: '8px',
                                        fontSize: '14px', border: 'none', cursor: 'pointer',
                                        backgroundColor: active ? 'var(--color-primary)' : 'var(--color-bg-tertiary)',
                                        color: active ? 'white' : 'var(--color-text-secondary)',
                                    }}
                                >
                                    <Icon style={{ width: '16px', height: '16px' }} />
                                    {label}
                                </button>
                            ))}
                        </div>
                    )}
                </header>

                {renderMainContent()}
            </div>

            {/* SOS drawer */}
            {alertsDrawerOpen && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 3500, display: 'flex' }} role="dialog" aria-modal="true">
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} onClick={() => setAlertsDrawerOpen(false)} />
                    <div ref={drawerRef} style={{ marginLeft: 'auto', height: '100%', width: 'min(380px, 100vw)', backgroundColor: 'var(--color-bg-secondary)', borderLeft: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '16px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <AlertTriangle style={{ width: '20px', height: '20px', color: 'var(--color-danger)' }} />
                                <span style={{ fontWeight: 'bold', color: 'var(--color-text-primary)' }}>Active SOS</span>
                            </div>
                            <button ref={drawerCloseRef} type="button" onClick={() => setAlertsDrawerOpen(false)} style={{ padding: '8px', borderRadius: '8px', background: 'none', border: 'none', cursor: 'pointer' }}>
                                <X style={{ width: '20px', height: '20px', color: 'var(--color-text-secondary)' }} />
                            </button>
                        </div>
                        <div style={{ flex: 1, minHeight: 0 }}>
                            <SOSAlertsPanel
                                alerts={sosAlerts.length > 0 ? sosAlerts : mapData.sos_alerts}
                                selectedAlertId={selectedAlert?.id}
                                onSelectAlert={handleAlertSelect}
                                hideHeader={true}
                                onRefresh={fetchSosAlerts}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}