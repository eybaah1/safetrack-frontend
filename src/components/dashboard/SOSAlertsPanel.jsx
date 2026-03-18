import { useState } from 'react';
import { AlertTriangle, Phone, MapPin, User, Clock, CheckCircle, Loader2, Eye, UserPlus, X, Shield } from 'lucide-react';
import useToast from '../../hooks/useToast.js';
import sosAPI from '../../api/sos';
import patrolsAPI from '../../api/patrols';
import Portal from '../layout/Portal.jsx';

function formatTimeAgo(dateStr) {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    const mins = Math.floor((Date.now() - date.getTime()) / 60000);
    if (mins < 1) return 'Just now';
    if (mins === 1) return '1 min ago';
    return `${mins} mins ago`;
}

export default function SOSAlertsPanel({
    alerts = [],
    onSelectAlert,
    selectedAlertId,
    hideHeader = false,
    className = '',
    loading = false,
    onRefresh,
}) {
    const toast = useToast();
    const [callModal, setCallModal] = useState(null);
    const [viewModal, setViewModal] = useState(null);
    const [assignModal, setAssignModal] = useState(null);
    const [nearbyStaff, setNearbyStaff] = useState([]);
    const [assignLoading, setAssignLoading] = useState(false);
    const [assigning, setAssigning] = useState(null);

    // ── CALL ───────────────────────────────────────────
    const handleCall = async (e, alert) => {
        e.stopPropagation();
        try {
            const { data } = await sosAPI.callInfo(alert.id);
            setCallModal(data);
        } catch {
            toast.error('Failed to get contact info.');
        }
    };

    // ── VIEW ───────────────────────────────────────────
    const handleView = (e, alert) => {
        e.stopPropagation();
        setViewModal(alert);
        onSelectAlert?.(alert);
    };

    // ── ASSIGN ─────────────────────────────────────────
    const handleAssign = async (e, alert) => {
        e.stopPropagation();
        setAssignModal(alert);
        setAssignLoading(true);

        try {
            const { data } = await patrolsAPI.nearbySecurity({
                lat: alert.lat || alert.latitude,
                lng: alert.lng || alert.longitude,
            });
            setNearbyStaff(data.security_personnel || []);
        } catch {
            setNearbyStaff([]);
            toast.error('Failed to load security personnel.');
        } finally {
            setAssignLoading(false);
        }
    };

    const handleAssignSecurity = async (securityUser) => {
        if (!assignModal) return;
        setAssigning(securityUser.id);

        try {
            await patrolsAPI.assign({
                sos_alert_id: assignModal.id,
                security_user_id: securityUser.id,
                notes: `Assigned ${securityUser.name} to respond`,
            });

            toast.success(`${securityUser.name} assigned to ${assignModal.alert_code || 'SOS'}!`);
            setAssignModal(null);
            if (onRefresh) onRefresh();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to assign.');
        } finally {
            setAssigning(null);
        }
    };

    return (
        <div
            className={`w-full h-full flex flex-col ${className}`}
            style={{ backgroundColor: 'var(--color-bg-secondary)' }}
        >
            {!hideHeader && (
                <div style={{ padding: '16px', borderBottom: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <AlertTriangle style={{ width: '20px', height: '20px', color: 'var(--color-danger)' }} />
                            <h2 style={{ fontWeight: 'bold', color: 'var(--color-text-primary)', margin: 0 }}>Active SOS</h2>
                        </div>
                        <span style={{
                            padding: '4px 8px', backgroundColor: 'rgba(220,38,38,0.1)',
                            color: 'var(--color-danger)', fontSize: '12px', fontWeight: 'bold', borderRadius: '999px',
                        }}>
                            {alerts.length} Active
                        </span>
                    </div>
                </div>
            )}

            <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
                {loading ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        <Loader2 style={{ width: '24px', height: '24px', color: 'var(--color-primary)' }} className="animate-spin" />
                    </div>
                ) : alerts.length === 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', padding: '24px' }}>
                        <div>
                            <p style={{ fontWeight: '600', color: 'var(--color-text-primary)', margin: 0 }}>No active SOS alerts</p>
                            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>Incoming SOS requests will appear here.</p>
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {alerts.map((alert) => (
                            <div
                                key={alert.id}
                                onClick={() => onSelectAlert?.(alert)}
                                style={{
                                    padding: '12px', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s',
                                    backgroundColor: selectedAlertId === alert.id ? 'rgba(220,38,38,0.08)' : 'var(--color-bg-primary)',
                                    border: selectedAlertId === alert.id ? '1px solid var(--color-danger)' : '1px solid var(--color-border)',
                                }}
                            >
                                {/* Status + time */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{
                                        padding: '2px 8px', fontSize: '12px', fontWeight: '500', borderRadius: '999px',
                                        backgroundColor: alert.status === 'active' ? 'rgba(220,38,38,0.15)' : 'rgba(212,160,23,0.15)',
                                        color: alert.status === 'active' ? 'var(--color-danger)' : 'var(--color-primary)',
                                    }}>
                                        {alert.status === 'active' ? '● Active' : 'Responding'}
                                    </span>
                                    <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Clock style={{ width: '12px', height: '12px' }} />
                                        {formatTimeAgo(alert.timestamp || alert.triggered_at)}
                                    </span>
                                </div>

                                {/* Student info */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                    <div style={{
                                        width: '32px', height: '32px', backgroundColor: 'var(--color-bg-tertiary)',
                                        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <User style={{ width: '16px', height: '16px', color: 'var(--color-text-secondary)' }} />
                                    </div>
                                    <div>
                                        <p style={{ fontWeight: '500', color: 'var(--color-text-primary)', fontSize: '14px', margin: 0 }}>
                                            {alert.student_name || alert.studentName}
                                        </p>
                                        <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0 }}>
                                            {alert.alert_code || `ID: ${alert.student_id || alert.studentId}`}
                                        </p>
                                    </div>
                                </div>

                                {/* Location */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '12px' }}>
                                    <MapPin style={{ width: '12px', height: '12px' }} />
                                    {alert.location || alert.location_text || 'Unknown'}
                                </div>

                                {/* Action buttons */}
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button type="button" onClick={(e) => handleCall(e, alert)} style={{
                                        flex: 1, padding: '8px', backgroundColor: 'var(--color-secondary)', color: 'white',
                                        fontSize: '12px', fontWeight: '500', borderRadius: '8px', border: 'none', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                                    }}>
                                        <Phone style={{ width: '12px', height: '12px' }} /> Call
                                    </button>
                                    <button type="button" onClick={(e) => handleView(e, alert)} style={{
                                        flex: 1, padding: '8px', backgroundColor: 'var(--color-primary)', color: 'white',
                                        fontSize: '12px', fontWeight: '500', borderRadius: '8px', border: 'none', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                                    }}>
                                        <Eye style={{ width: '12px', height: '12px' }} /> View
                                    </button>
                                    <button type="button" onClick={(e) => handleAssign(e, alert)} style={{
                                        flex: 1, padding: '8px', backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)',
                                        fontSize: '12px', fontWeight: '500', borderRadius: '8px', border: '1px solid var(--color-border)', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                                    }}>
                                        <UserPlus style={{ width: '12px', height: '12px' }} /> Assign
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ═══════════ CALL MODAL ═══════════ */}
            {callModal && (
                <Portal>
                    <div style={{ position: 'fixed', inset: 0, zIndex: 4000, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
                        <div style={{
                            width: '100%', maxWidth: '400px', backgroundColor: 'var(--color-bg-primary)',
                            borderRadius: '16px', padding: '24px', border: '1px solid var(--color-border)',
                            boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                                <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-text-primary)', margin: 0 }}>
                                    Call Student
                                </h2>
                                <button onClick={() => setCallModal(null)} type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}>
                                    <X style={{ width: '20px', height: '20px', color: 'var(--color-text-muted)' }} />
                                </button>
                            </div>

                            <div style={{
                                backgroundColor: 'var(--color-bg-secondary)', borderRadius: '12px',
                                padding: '16px', border: '1px solid var(--color-border)', marginBottom: '16px',
                            }}>
                                <p style={{ fontWeight: '600', color: 'var(--color-text-primary)', fontSize: '16px', margin: '0 0 4px 0' }}>
                                    {callModal.student_name}
                                </p>
                                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: '0 0 8px 0' }}>
                                    {callModal.alert_code}
                                </p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                                    <MapPin style={{ width: '14px', height: '14px' }} />
                                    {callModal.location || 'Unknown location'}
                                </div>
                            </div>

                            <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-primary)', textAlign: 'center', margin: '0 0 16px 0' }}>
                                {callModal.phone}
                            </p>

                            <a
                                href={`tel:${callModal.phone.replace(/\s/g, '')}`}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                    width: '100%', padding: '14px', backgroundColor: 'var(--color-secondary)',
                                    color: 'white', borderRadius: '12px', fontWeight: '600', fontSize: '16px',
                                    textDecoration: 'none',
                                }}
                            >
                                <Phone style={{ width: '20px', height: '20px' }} />
                                Call Now
                            </a>

                            <button onClick={() => setCallModal(null)} type="button" style={{
                                width: '100%', padding: '12px', marginTop: '8px',
                                backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)',
                                borderRadius: '12px', border: '1px solid var(--color-border)',
                                fontWeight: '500', cursor: 'pointer',
                            }}>
                                Close
                            </button>
                        </div>
                    </div>
                </Portal>
            )}

            {/* ═══════════ VIEW MODAL ═══════════ */}
            {viewModal && (
                <Portal>
                    <div style={{ position: 'fixed', inset: 0, zIndex: 4000, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
                        <div style={{
                            width: '100%', maxWidth: '420px', backgroundColor: 'var(--color-bg-primary)',
                            borderRadius: '16px', padding: '24px', border: '1px solid var(--color-border)',
                            boxShadow: '0 8px 40px rgba(0,0,0,0.15)', maxHeight: '80vh', overflowY: 'auto',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <AlertTriangle style={{ width: '20px', height: '20px', color: 'var(--color-danger)' }} />
                                    <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-text-primary)', margin: 0 }}>
                                        SOS Details
                                    </h2>
                                </div>
                                <button onClick={() => setViewModal(null)} type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}>
                                    <X style={{ width: '20px', height: '20px', color: 'var(--color-text-muted)' }} />
                                </button>
                            </div>

                            {/* Status badge */}
                            <div style={{ marginBottom: '16px' }}>
                                <span style={{
                                    padding: '4px 12px', borderRadius: '999px', fontSize: '13px', fontWeight: '600',
                                    backgroundColor: viewModal.status === 'active' ? 'rgba(220,38,38,0.1)' : 'rgba(212,160,23,0.1)',
                                    color: viewModal.status === 'active' ? 'var(--color-danger)' : 'var(--color-primary)',
                                }}>
                                    {viewModal.status === 'active' ? '🚨 Active Emergency' : '🔄 Responding'}
                                </span>
                            </div>

                            {/* Student info card */}
                            <div style={{
                                backgroundColor: 'var(--color-bg-secondary)', borderRadius: '12px',
                                padding: '16px', border: '1px solid var(--color-border)', marginBottom: '16px',
                            }}>
                                <h3 style={{ fontSize: '12px', fontWeight: '500', color: 'var(--color-text-muted)', marginBottom: '12px', textTransform: 'uppercase' }}>
                                    Student Information
                                </h3>
                                {[
                                    { label: 'Name', value: viewModal.student_name || viewModal.studentName },
                                    { label: 'ID', value: viewModal.student_id || viewModal.studentId || viewModal.alert_code },
                                    { label: 'Location', value: viewModal.location || viewModal.location_text || 'Unknown' },
                                ].map(({ label, value }) => (
                                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--color-border)' }}>
                                        <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>{label}</span>
                                        <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--color-text-primary)' }}>{value}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Location — live vs trigger */}
                            <div style={{
                                backgroundColor: 'var(--color-bg-secondary)', borderRadius: '12px',
                                padding: '16px', border: '1px solid var(--color-border)', marginBottom: '16px',
                            }}>
                                <h3 style={{ fontSize: '12px', fontWeight: '500', color: 'var(--color-text-muted)', marginBottom: '12px', textTransform: 'uppercase' }}>
                                    Location
                                </h3>

                                {/* Live location */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                    <div style={{
                                        width: '8px', height: '8px', borderRadius: '50%',
                                        backgroundColor: 'var(--color-danger)',
                                        flexShrink: 0,
                                    }} />
                                    <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--color-text-primary)' }}>
                                        Current: {(viewModal.lat || 0).toFixed(5)}, {(viewModal.lng || 0).toFixed(5)}
                                    </span>
                                </div>

                                {/* Trigger location (only show if different from live) */}
                                {viewModal.trigger_lat && viewModal.trigger_lat !== viewModal.lat && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                        <MapPin style={{ width: '14px', height: '14px', color: 'var(--color-text-muted)', flexShrink: 0 }} />
                                        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                                            Triggered at: {viewModal.trigger_lat.toFixed(5)}, {viewModal.trigger_lng.toFixed(5)}
                                        </span>
                                    </div>
                                )}

                                <p style={{ fontSize: '12px', color: 'var(--color-secondary)', margin: '8px 0 0 0' }}>
                                    📍 Location updates automatically every few seconds
                                </p>
                            </div>

                            {/* Time info */}
                            <div style={{
                                backgroundColor: 'var(--color-bg-secondary)', borderRadius: '12px',
                                padding: '16px', border: '1px solid var(--color-border)', marginBottom: '16px',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Clock style={{ width: '16px', height: '16px', color: 'var(--color-primary)' }} />
                                    <span style={{ fontSize: '14px', color: 'var(--color-text-primary)' }}>
                                        Triggered {formatTimeAgo(viewModal.timestamp || viewModal.triggered_at)}
                                    </span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => { setViewModal(null); handleAssign({ stopPropagation: () => {} }, viewModal); }} type="button" style={{
                                    flex: 1, padding: '12px', backgroundColor: 'var(--color-primary)', color: 'white',
                                    borderRadius: '12px', fontWeight: '600', border: 'none', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                }}>
                                    <UserPlus style={{ width: '16px', height: '16px' }} /> Assign Patrol
                                </button>
                                <button onClick={() => setViewModal(null)} type="button" style={{
                                    flex: 1, padding: '12px', backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)',
                                    borderRadius: '12px', fontWeight: '500', border: '1px solid var(--color-border)', cursor: 'pointer',
                                }}>
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </Portal>
            )}

            {/* ═══════════ ASSIGN MODAL ═══════════ */}
            {assignModal && (
                <Portal>
                    <div style={{ position: 'fixed', inset: 0, zIndex: 4000, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
                        <div style={{
                            width: '100%', maxWidth: '440px', backgroundColor: 'var(--color-bg-primary)',
                            borderRadius: '16px', border: '1px solid var(--color-border)',
                            boxShadow: '0 8px 40px rgba(0,0,0,0.15)', maxHeight: '85vh', overflow: 'hidden',
                            display: 'flex', flexDirection: 'column',
                        }}>
                            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div>
                                        <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-text-primary)', margin: 0 }}>
                                            Assign Security
                                        </h2>
                                        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: '4px 0 0 0' }}>
                                            Responding to {assignModal.alert_code || 'SOS Alert'}
                                        </p>
                                    </div>
                                    <button onClick={() => setAssignModal(null)} type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}>
                                        <X style={{ width: '20px', height: '20px', color: 'var(--color-text-muted)' }} />
                                    </button>
                                </div>
                            </div>

                            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
                                {assignLoading ? (
                                    <div style={{ display: 'flex', justifyContent: 'center', padding: '32px' }}>
                                        <Loader2 style={{ width: '24px', height: '24px', color: 'var(--color-primary)' }} className="animate-spin" />
                                    </div>
                                ) : nearbyStaff.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '32px' }}>
                                        <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>No security personnel found.</p>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {nearbyStaff.map((staff) => (
                                            <div key={staff.id} style={{
                                                display: 'flex', alignItems: 'center', gap: '12px',
                                                padding: '12px', backgroundColor: 'var(--color-bg-secondary)',
                                                borderRadius: '12px', border: '1px solid var(--color-border)',
                                            }}>
                                                <div style={{
                                                    width: '40px', height: '40px', borderRadius: '50%',
                                                    backgroundColor: staff.is_on_duty ? 'rgba(34,139,34,0.1)' : 'var(--color-bg-tertiary)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                                }}>
                                                    <Shield style={{ width: '20px', height: '20px', color: staff.is_on_duty ? 'var(--color-secondary)' : 'var(--color-text-muted)' }} />
                                                </div>

                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <p style={{ fontWeight: '500', color: 'var(--color-text-primary)', fontSize: '14px', margin: 0 }}>
                                                            {staff.name}
                                                        </p>
                                                        {staff.is_on_duty && (
                                                            <span style={{ fontSize: '10px', padding: '1px 6px', backgroundColor: 'rgba(34,139,34,0.1)', color: 'var(--color-secondary)', borderRadius: '999px' }}>
                                                                On Duty
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '2px 0 0 0' }}>
                                                        {staff.staff_id || ''} {staff.patrol_unit ? `• ${staff.patrol_unit}` : ''}
                                                    </p>
                                                    <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: '2px 0 0 0' }}>
                                                        📍 {staff.distance_text} • 📞 {staff.phone}
                                                    </p>
                                                </div>

                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flexShrink: 0 }}>
                                                    <button
                                                        onClick={() => handleAssignSecurity(staff)}
                                                        disabled={assigning === staff.id}
                                                        type="button"
                                                        style={{
                                                            padding: '6px 12px', backgroundColor: 'var(--color-primary)',
                                                            color: 'white', fontSize: '11px', fontWeight: '600',
                                                            borderRadius: '8px', border: 'none', cursor: 'pointer',
                                                            opacity: assigning === staff.id ? 0.7 : 1,
                                                            display: 'flex', alignItems: 'center', gap: '4px',
                                                        }}
                                                    >
                                                        {assigning === staff.id ? (
                                                            <Loader2 style={{ width: '12px', height: '12px' }} className="animate-spin" />
                                                        ) : (
                                                            <CheckCircle style={{ width: '12px', height: '12px' }} />
                                                        )}
                                                        Assign
                                                    </button>
                                                    <a
                                                        href={`tel:${staff.phone.replace(/\s/g, '')}`}
                                                        style={{
                                                            padding: '6px 12px', backgroundColor: 'var(--color-secondary)',
                                                            color: 'white', fontSize: '11px', fontWeight: '600',
                                                            borderRadius: '8px', textDecoration: 'none', textAlign: 'center',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                                                        }}
                                                    >
                                                        <Phone style={{ width: '12px', height: '12px' }} />
                                                        Call
                                                    </a>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--color-border)' }}>
                                <button onClick={() => setAssignModal(null)} type="button" style={{
                                    width: '100%', padding: '12px', backgroundColor: 'var(--color-bg-secondary)',
                                    color: 'var(--color-text-primary)', borderRadius: '12px', fontWeight: '500',
                                    border: '1px solid var(--color-border)', cursor: 'pointer',
                                }}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </Portal>
            )}
        </div>
    );
}