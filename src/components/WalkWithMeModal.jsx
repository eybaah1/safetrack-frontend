import { useRef, useState, useEffect } from 'react';
import { X, Users, Shield, MapPin, Navigation, ChevronRight, Clock, ChevronLeft, Loader2 } from 'lucide-react';
import useEscapeKey from '../hooks/useEscapeKey';
import useFocusTrap from '../hooks/useFocusTrap';
import useToast from '../hooks/useToast.js';
import Portal from './layout/Portal.jsx';
import walksAPI from '../api/walks';
import trackingAPI from '../api/tracking';
import locationsAPI from '../api/locations';

export default function WalkWithMeModal({ isOpen, onClose, onStartWalk }) {
    const toast = useToast();
    const [step, setStep] = useState(1);
    const [mode, setMode] = useState(null);
    const [destination, setDestination] = useState(null);
    const [activeGroups, setActiveGroups] = useState([]);
    const [destinations, setDestinations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);
    const panelRef = useRef(null);
    const closeBtnRef = useRef(null);

    useEscapeKey(isOpen, onClose);
    useFocusTrap({ enabled: isOpen, containerRef: panelRef, initialFocusRef: closeBtnRef });

    // Fetch active groups
    useEffect(() => {
        if (!isOpen || step !== 2 || mode !== 'group') return;
        setLoading(true);
        walksAPI.activeGroups()
            .then(({ data }) => setActiveGroups(data))
            .catch(() => setActiveGroups([]))
            .finally(() => setLoading(false));
    }, [isOpen, step, mode]);

    // Fetch destinations
    useEffect(() => {
        if (!isOpen) return;
        locationsAPI.list()
            .then(({ data }) => {
                const locs = (data.results || data || []).map((l) => ({
                    id: l.id,
                    name: l.name,
                    lat: l.lat,
                    lng: l.lng,
                }));
                setDestinations(locs);
            })
            .catch(() => setDestinations([]));
    }, [isOpen]);

    if (!isOpen) return null;

    const handleClose = () => {
        setStep(1);
        setMode(null);
        setDestination(null);
        onClose();
    };

    const handleModeSelect = (m) => {
        setMode(m);
        setStep(2);
    };

    const handleJoinGroup = async (group) => {
        try {
            await walksAPI.join(group.id);
            toast.success(`Joined "${group.name}"!`);
            const { data } = await walksAPI.detail(group.id);
            if (onStartWalk) onStartWalk(data);
            handleClose();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to join group.');
        }
    };

    const handleDestinationSelect = (dest) => {
        setDestination(dest);
        setStep(3);
    };

    const handleStartWalk = async () => {
        if (!destination) return;
        setCreating(true);

        try {
            let originLat = null, originLng = null;
            try {
                const pos = await new Promise((resolve, reject) =>
                    navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
                );
                originLat = pos.coords.latitude;
                originLng = pos.coords.longitude;
            } catch { }

            const { data } = await walksAPI.create({
                walk_mode: mode,
                destination_name: destination.name,
                destination_lat: destination.lat || null,
                destination_lng: destination.lng || null,
                origin_lat: originLat,
                origin_lng: originLng,
                title: `Walk to ${destination.name}`,
            });

            await trackingAPI.toggleSharing(true).catch(() => { });
            toast.success('Walk started! Your location is being shared.');
            if (onStartWalk) onStartWalk(data.walk || data);
            handleClose();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to start walk.');
        } finally {
            setCreating(false);
        }
    };

    return (
        <Portal>
            {/* Backdrop — inline styles for guaranteed full coverage */}
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 2000,
                    backgroundColor: 'rgba(0,0,0,0.4)',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                }}
                role="dialog"
                aria-modal="true"
                aria-label="Walk With Me"
            >
                {/* Click backdrop to close */}
                <div
                    style={{ position: 'absolute', inset: 0 }}
                    onClick={handleClose}
                />

                {/* Panel — inline styles for guaranteed width */}
                <div
                    ref={panelRef}
                    style={{
                        position: 'relative',
                        width: '100%',
                        maxWidth: '448px',
                        maxHeight: '85vh',
                        minHeight: '200px',
                        overflow: 'hidden',
                        borderRadius: '24px 24px 0 0',
                        backgroundColor: 'var(--color-bg-primary)',
                        borderTop: '1px solid var(--color-border)',
                        boxShadow: '0 -8px 40px rgba(0,0,0,0.15)',
                    }}
                    className="animate-slide-up"
                >
                    {/* Header */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px',
                        borderBottom: '1px solid var(--color-border)',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {step > 1 && (
                                <button
                                    onClick={() => setStep(step - 1)}
                                    style={{
                                        width: '32px', height: '32px', borderRadius: '50%',
                                        backgroundColor: 'var(--color-bg-secondary)',
                                        border: '1px solid var(--color-border)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        cursor: 'pointer',
                                    }}
                                    type="button"
                                >
                                    <ChevronLeft style={{ width: '16px', height: '16px', color: 'var(--color-text-secondary)' }} />
                                </button>
                            )}
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '50%',
                                backgroundColor: 'rgba(34,139,34,0.1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <Users style={{ width: '20px', height: '20px', color: 'var(--color-secondary)' }} />
                            </div>
                            <div>
                                <h2 style={{ fontWeight: 'bold', color: 'var(--color-text-primary)', fontSize: '16px', margin: 0 }}>
                                    Walk With Me
                                </h2>
                                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0 }}>
                                    {step === 1 && 'Choose how to walk safely'}
                                    {step === 2 && 'Select your destination'}
                                    {step === 3 && 'Confirm your walk'}
                                </p>
                            </div>
                        </div>
                        <button
                            ref={closeBtnRef}
                            onClick={handleClose}
                            style={{
                                width: '40px', height: '40px', borderRadius: '50%',
                                backgroundColor: 'var(--color-bg-secondary)',
                                border: '1px solid var(--color-border)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer',
                            }}
                            type="button"
                            aria-label="Close"
                        >
                            <X style={{ width: '20px', height: '20px', color: 'var(--color-text-secondary)' }} />
                        </button>
                    </div>

                    {/* Content */}
                    <div style={{ overflowY: 'auto', maxHeight: 'calc(85vh - 80px)' }}>

                        {/* Step 1 — Choose mode */}
                        {step === 1 && (
                            <div style={{ padding: '16px' }}>
                                <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
                                    Your live location will be shared until you arrive safely.
                                </p>

                                {/* Walk with Group */}
                                <button
                                    onClick={() => handleModeSelect('group')}
                                    type="button"
                                    style={{
                                        width: '100%', padding: '16px', marginBottom: '12px',
                                        backgroundColor: 'var(--color-bg-secondary)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: '12px', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: '16px',
                                        textAlign: 'left',
                                    }}
                                >
                                    <div style={{
                                        width: '48px', height: '48px', borderRadius: '50%',
                                        backgroundColor: 'rgba(212,160,23,0.1)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        flexShrink: 0,
                                    }}>
                                        <Users style={{ width: '24px', height: '24px', color: 'var(--color-primary)' }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ fontWeight: '600', color: 'var(--color-text-primary)', fontSize: '15px', margin: 0 }}>
                                            Walk with Group
                                        </h3>
                                        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: '4px 0 0 0' }}>
                                            Join or create a group with nearby students
                                        </p>
                                    </div>
                                    <ChevronRight style={{ width: '20px', height: '20px', color: 'var(--color-text-muted)', flexShrink: 0 }} />
                                </button>

                                {/* Campus Security */}
                                <button
                                    onClick={() => handleModeSelect('security')}
                                    type="button"
                                    style={{
                                        width: '100%', padding: '16px',
                                        backgroundColor: 'var(--color-bg-secondary)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: '12px', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: '16px',
                                        textAlign: 'left',
                                    }}
                                >
                                    <div style={{
                                        width: '48px', height: '48px', borderRadius: '50%',
                                        backgroundColor: 'rgba(34,139,34,0.1)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        flexShrink: 0,
                                    }}>
                                        <Shield style={{ width: '24px', height: '24px', color: 'var(--color-secondary)' }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ fontWeight: '600', color: 'var(--color-text-primary)', fontSize: '15px', margin: 0 }}>
                                            Campus Security
                                        </h3>
                                        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: '4px 0 0 0' }}>
                                            A security officer monitors your journey
                                        </p>
                                    </div>
                                    <ChevronRight style={{ width: '20px', height: '20px', color: 'var(--color-text-muted)', flexShrink: 0 }} />
                                </button>
                            </div>
                        )}

                        {/* Step 2 — Destinations + Groups */}
                        {step === 2 && (
                            <div style={{ padding: '16px' }}>
                                {/* Active groups — group mode only */}
                                {mode === 'group' && (
                                    <div style={{ marginBottom: '24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                            <Clock style={{ width: '16px', height: '16px', color: 'var(--color-primary)' }} />
                                            <h3 style={{ fontWeight: '600', color: 'var(--color-text-primary)', fontSize: '14px', margin: 0 }}>
                                                Active Groups
                                            </h3>
                                        </div>
                                        {loading ? (
                                            <div style={{ display: 'flex', justifyContent: 'center', padding: '16px' }}>
                                                <Loader2 style={{ width: '20px', height: '20px', color: 'var(--color-primary)' }} className="animate-spin" />
                                            </div>
                                        ) : activeGroups.length > 0 ? (
                                            activeGroups.map((g) => (
                                                <button
                                                    key={g.id}
                                                    onClick={() => handleJoinGroup(g)}
                                                    type="button"
                                                    style={{
                                                        width: '100%', padding: '12px', marginBottom: '8px',
                                                        backgroundColor: 'var(--color-bg-secondary)',
                                                        border: '1px solid var(--color-border)',
                                                        borderRadius: '12px', cursor: 'pointer',
                                                        display: 'flex', alignItems: 'center', gap: '12px',
                                                        textAlign: 'left',
                                                    }}
                                                >
                                                    <div style={{
                                                        width: '40px', height: '40px', borderRadius: '50%',
                                                        backgroundColor: 'rgba(34,139,34,0.1)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        flexShrink: 0,
                                                    }}>
                                                        <Users style={{ width: '20px', height: '20px', color: 'var(--color-secondary)' }} />
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <p style={{ fontWeight: '500', color: 'var(--color-text-primary)', fontSize: '14px', margin: 0 }}>
                                                            {g.name || `Walk to ${g.destination}`}
                                                        </p>
                                                        <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '2px 0 0 0' }}>
                                                            {g.members}/{g.max_members} members • Led by {g.leader}
                                                        </p>
                                                    </div>
                                                    <span style={{
                                                        padding: '4px 12px', backgroundColor: 'rgba(34,139,34,0.1)',
                                                        borderRadius: '999px', fontSize: '12px', fontWeight: '500',
                                                        color: 'var(--color-secondary)',
                                                    }}>
                                                        Join
                                                    </span>
                                                </button>
                                            ))
                                        ) : (
                                            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
                                                No active groups right now. Create your own below!
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Destination list */}
                                <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '12px' }}>
                                    Where are you going?
                                </p>
                                <div style={{ maxHeight: '40vh', overflowY: 'auto' }} className="hide-scrollbar">
                                    {destinations.map((dest) => {
                                        const isSelected = destination?.id === dest.id;
                                        return (
                                            <button
                                                key={dest.id}
                                                onClick={() => handleDestinationSelect(dest)}
                                                type="button"
                                                style={{
                                                    width: '100%', padding: '12px', marginBottom: '8px',
                                                    backgroundColor: isSelected ? 'rgba(212,160,23,0.08)' : 'var(--color-bg-secondary)',
                                                    border: isSelected ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                                                    borderRadius: '12px', cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center', gap: '12px',
                                                    textAlign: 'left',
                                                }}
                                            >
                                                <MapPin style={{
                                                    width: '20px', height: '20px', flexShrink: 0,
                                                    color: isSelected ? 'var(--color-primary)' : 'var(--color-text-muted)',
                                                }} />
                                                <div style={{ flex: 1 }}>
                                                    <p style={{ fontWeight: '500', color: 'var(--color-text-primary)', fontSize: '14px', margin: 0 }}>
                                                        {dest.name}
                                                    </p>
                                                </div>
                                                {isSelected && (
                                                    <div style={{
                                                        width: '20px', height: '20px', borderRadius: '50%',
                                                        backgroundColor: 'var(--color-primary)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    }}>
                                                        <Navigation style={{ width: '12px', height: '12px', color: '#fff' }} />
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                    {destinations.length === 0 && !loading && (
                                        <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '13px', padding: '24px 0' }}>
                                            Loading destinations...
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Step 3 — Confirm */}
                        {step === 3 && (
                            <div style={{ padding: '16px' }}>
                                {/* Summary card */}
                                <div style={{
                                    backgroundColor: 'var(--color-bg-secondary)',
                                    borderRadius: '12px', padding: '16px',
                                    border: '1px solid var(--color-border)',
                                    marginBottom: '16px',
                                }}>
                                    <h3 style={{ fontWeight: '600', color: 'var(--color-text-primary)', fontSize: '15px', margin: '0 0 12px 0' }}>
                                        Walk Summary
                                    </h3>

                                    {/* Mode */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                        <div style={{
                                            width: '32px', height: '32px', borderRadius: '50%',
                                            backgroundColor: mode === 'group' ? 'rgba(212,160,23,0.1)' : 'rgba(34,139,34,0.1)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            {mode === 'group'
                                                ? <Users style={{ width: '16px', height: '16px', color: 'var(--color-primary)' }} />
                                                : <Shield style={{ width: '16px', height: '16px', color: 'var(--color-secondary)' }} />
                                            }
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-text-primary)', margin: 0 }}>
                                                {mode === 'group' ? 'Group Walk' : 'Security Escort'}
                                            </p>
                                            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '2px 0 0 0' }}>
                                                {mode === 'group' ? 'Others can join your group' : 'Security monitors your journey'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Destination */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{
                                            width: '32px', height: '32px', borderRadius: '50%',
                                            backgroundColor: 'rgba(59,130,246,0.1)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            <MapPin style={{ width: '16px', height: '16px', color: 'var(--color-accent)' }} />
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-text-primary)', margin: 0 }}>
                                                {destination?.name}
                                            </p>
                                            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '2px 0 0 0' }}>
                                                Destination
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Safety notice */}
                                <div style={{
                                    backgroundColor: 'rgba(34,139,34,0.05)',
                                    borderRadius: '12px', padding: '12px',
                                    border: '1px solid rgba(34,139,34,0.15)',
                                    marginBottom: '16px',
                                }}>
                                    <p style={{ fontSize: '12px', color: 'var(--color-secondary)', margin: 0 }}>
                                        🔒 Your location will be shared with {mode === 'group' ? 'group members and ' : ''}campus security until you arrive safely.
                                    </p>
                                </div>

                                {/* Start button */}
                                <button
                                    onClick={handleStartWalk}
                                    disabled={creating}
                                    type="button"
                                    style={{
                                        width: '100%', padding: '16px',
                                        backgroundColor: 'var(--color-secondary)',
                                        color: '#fff', borderRadius: '12px',
                                        fontWeight: '600', fontSize: '16px',
                                        border: 'none', cursor: creating ? 'not-allowed' : 'pointer',
                                        opacity: creating ? 0.7 : 1,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                    }}
                                >
                                    {creating ? (
                                        <Loader2 style={{ width: '20px', height: '20px' }} className="animate-spin" />
                                    ) : (
                                        <>
                                            <Navigation style={{ width: '20px', height: '20px' }} />
                                            <span>Start Walking</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Portal>
    );
}