import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Phone, X, MapPin, Clock, Shield, Users, CheckCircle, Loader2, MessageCircle } from 'lucide-react';
import useFocusTrap from '../hooks/useFocusTrap';
import useToast from '../hooks/useToast.js';
import Portal from './layout/Portal.jsx';
import walksAPI from '../api/walks';
import trackingAPI from '../api/tracking';
import chatAPI from '../api/chat';

const walkUserIcon = L.divIcon({
    className: 'walk-user-marker',
    html: `<div style="
      width:20px;height:20px;background:#228B22;
      border:4px solid white;border-radius:50%;
      box-shadow:0 0 0 2px #228B22,0 2px 8px rgba(0,0,0,0.2);
      animation:walk-pulse 2s infinite;
    "></div>
    <style>
      @keyframes walk-pulse {
        0%,100%{box-shadow:0 0 0 2px #228B22,0 2px 8px rgba(0,0,0,0.2)}
        50%{box-shadow:0 0 0 6px rgba(34,139,34,0.2),0 2px 8px rgba(0,0,0,0.2)}
      }
    </style>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
});

const destinationIcon = L.divIcon({
    className: 'destination-marker',
    html: `<div style="
      width:32px;height:32px;background:#D4A017;
      border:3px solid white;border-radius:50%;
      box-shadow:0 2px 8px rgba(0,0,0,0.2);
      display:flex;align-items:center;justify-content:center;
    ">📍</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
});

export default function ActiveWalkScreen({ walkData, onEndWalk }) {
    const toast = useToast();
    const [elapsedTime, setElapsedTime] = useState(0);
    const [showEndConfirm, setShowEndConfirm] = useState(false);
    const [arrivedSafely, setArrivedSafely] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [walkChatId, setWalkChatId] = useState(null);
    const [userPos, setUserPos] = useState({
        lat: walkData?.origin?.lat || walkData?.origin_lat || 6.6742,
        lng: walkData?.origin?.lng || walkData?.origin_lng || -1.5718,
    });
    const confirmRef = useRef(null);
    const keepBtnRef = useRef(null);

    useFocusTrap({ enabled: showEndConfirm, containerRef: confirmRef, initialFocusRef: keepBtnRef });

    const walkId = walkData?.id;
    const destName = walkData?.destination_name || walkData?.destination?.name || 'Destination';
    const destLat = walkData?.destination?.lat || walkData?.destination_lat || userPos.lat + 0.008;
    const destLng = walkData?.destination?.lng || walkData?.destination_lng || userPos.lng + 0.005;
    const companion = walkData?.mode || walkData?.walk_mode || 'security';
    const walkTitle = walkData?.title || `Walk to ${destName}`;

    // Timer
    useEffect(() => {
        const timer = setInterval(() => setElapsedTime((p) => p + 1), 1000);
        return () => clearInterval(timer);
    }, []);

    // Track location
    useEffect(() => {
        if (!navigator.geolocation) return;
        const watchId = navigator.geolocation.watchPosition(
            (pos) => {
                const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                setUserPos(coords);
                trackingAPI.updateLive({
                    latitude: coords.lat,
                    longitude: coords.lng,
                    accuracy_meters: pos.coords.accuracy,
                    source: 'gps',
                    context: 'walk',
                    reference_id: walkId,
                }).catch(() => { });
            },
            () => { },
            { enableHighAccuracy: true, timeout: 10000 }
        );
        return () => navigator.geolocation.clearWatch(watchId);
    }, [walkId]);

    // Auto-create or find walk group chat
    useEffect(() => {
        if (!walkId) return;

        // Try to find existing chat for this walk, or create one
        const initChat = async () => {
            try {
                // First check existing chats
                const { data: chats } = await chatAPI.list();
                const chatList = chats.results || chats || [];
                const existingChat = chatList.find(
                    (c) => c.related_walk_session_id === walkId || (c.chat_type === 'walk_group' && c.display_name?.includes(destName))
                );

                if (existingChat) {
                    setWalkChatId(existingChat.id);
                    return;
                }

                // Get walk participants to create group chat
                let participantIds = [];
                try {
                    const { data: walkDetail } = await walksAPI.detail(walkId);
                    const participants = walkDetail.participants || [];
                    participantIds = participants
                        .filter((p) => p.status === 'joined')
                        .map((p) => p.user_id)
                        .filter(Boolean);
                } catch { }

                // Create group chat
                if (participantIds.length > 0) {
                    const { data } = await chatAPI.createGroup({
                        title: `🚶 ${walkTitle}`,
                        user_ids: participantIds,
                    });
                    setWalkChatId(data.chat?.id || data.id);
                }
            } catch {
                // Chat creation is best-effort
            }
        };

        initChat();
    }, [walkId, destName, walkTitle]);

    const formatTime = (s) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    };

    const handleArrivedSafely = async () => {
        setSubmitting(true);
        try {
            if (walkId) {
                await walksAPI.arrived(walkId);
                await trackingAPI.toggleSharing(false);
            }
            setArrivedSafely(true);
            setTimeout(() => onEndWalk(), 2000);
        } catch {
            toast.error('Failed to mark as arrived.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleConfirmEnd = async () => {
        setSubmitting(true);
        try {
            if (walkId) {
                await walksAPI.end(walkId);
                await trackingAPI.toggleSharing(false);
            }
            onEndWalk();
        } catch {
            toast.error('Failed to end walk.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleOpenChat = () => {
        if (walkChatId) {
            // Navigate to chat page with this chat open
            window.location.hash = 'chat';
            // Store the chat ID so the Chat page can open it
            sessionStorage.setItem('safetrack_open_chat', walkChatId);
            toast.info('Opening group chat...');
        } else {
            toast.info('Setting up group chat...');
        }
    };

    const pathCoords = [
        [userPos.lat, userPos.lng],
        [destLat, destLng],
    ];

    // Arrived safely screen
    if (arrivedSafely) {
        return (
            <div style={{
                position: 'fixed', inset: 0, zIndex: 2000,
                backgroundColor: 'var(--color-bg-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                <div style={{ textAlign: 'center', padding: '32px' }}>
                    <div style={{
                        width: '96px', height: '96px',
                        backgroundColor: 'rgba(34,139,34,0.1)',
                        borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 24px',
                    }} className="animate-bounce">
                        <CheckCircle style={{ width: '48px', height: '48px', color: 'var(--color-secondary)' }} />
                    </div>
                    <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-text-primary)', margin: '0 0 8px 0' }}>
                        You Arrived Safely!
                    </h1>
                    <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>Security has been notified.</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, backgroundColor: 'var(--color-bg-primary)' }}>
            {/* Green border */}
            <div style={{ position: 'absolute', inset: 0, border: '4px solid var(--color-secondary)', pointerEvents: 'none', zIndex: 10 }} />

            {/* Header */}
            <div style={{
                position: 'relative', zIndex: 20,
                backgroundColor: 'var(--color-secondary)',
                padding: '16px',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '4px' }}>
                    {companion === 'security'
                        ? <Shield style={{ width: '20px', height: '20px', color: 'white' }} />
                        : <Users style={{ width: '20px', height: '20px', color: 'white' }} />
                    }
                    <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: 'white', margin: 0 }}>
                        Walking with {companion === 'security' ? 'Security' : 'Group'}
                    </h1>
                </div>
                <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.9)', fontSize: '14px', margin: 0 }}>
                    Your location is being shared
                </p>
            </div>

            {/* Timer & Destination */}
            <div style={{
                position: 'relative', zIndex: 20,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 16px',
                backgroundColor: 'var(--color-bg-secondary)',
                borderBottom: '1px solid var(--color-border)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock style={{ width: '16px', height: '16px', color: 'var(--color-text-secondary)' }} />
                    <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                        {formatTime(elapsedTime)}
                    </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin style={{ width: '16px', height: '16px', color: 'var(--color-primary)' }} />
                    <span style={{ fontSize: '14px', color: 'var(--color-text-primary)', fontWeight: '500' }}>
                        {destName}
                    </span>
                </div>
            </div>

            {/* Map */}
            <div style={{ position: 'relative', zIndex: 0, height: '40vh' }}>
                <MapContainer
                    center={[(userPos.lat + destLat) / 2, (userPos.lng + destLng) / 2]}
                    zoom={15}
                    className="w-full h-full"
                    zoomControl={false}
                >
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                    <Polyline positions={pathCoords} pathOptions={{ color: '#228B22', weight: 4, dashArray: '10,10' }} />
                    <Marker position={[userPos.lat, userPos.lng]} icon={walkUserIcon} />
                    <Marker position={[destLat, destLng]} icon={destinationIcon} />
                </MapContainer>
            </div>

            {/* Action Buttons */}
            <div style={{ position: 'relative', zIndex: 20, padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Arrived Safely */}
                <button
                    onClick={handleArrivedSafely}
                    disabled={submitting}
                    type="button"
                    style={{
                        width: '100%', padding: '16px',
                        backgroundColor: 'var(--color-secondary)',
                        color: 'white', fontWeight: '600', fontSize: '16px',
                        borderRadius: '12px', border: 'none',
                        cursor: submitting ? 'not-allowed' : 'pointer',
                        opacity: submitting ? 0.7 : 1,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                    }}
                >
                    {submitting
                        ? <Loader2 style={{ width: '20px', height: '20px' }} className="animate-spin" />
                        : <CheckCircle style={{ width: '20px', height: '20px' }} />
                    }
                    I Arrived Safely
                </button>

                {/* Two buttons side by side: Chat + Call */}
                <div style={{ display: 'flex', gap: '12px' }}>
                    {/* Group Chat */}
                    <button
                        onClick={handleOpenChat}
                        type="button"
                        style={{
                            flex: 1, padding: '14px',
                            backgroundColor: 'var(--color-accent)',
                            color: 'white', fontWeight: '600', fontSize: '14px',
                            borderRadius: '12px', border: 'none', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        }}
                    >
                        <MessageCircle style={{ width: '18px', height: '18px' }} />
                        Group Chat
                    </button>

                    {/* Call */}
                    <button
                        onClick={() => toast.info(`Calling ${companion === 'security' ? 'Security' : 'your group'} (demo)...`)}
                        type="button"
                        style={{
                            flex: 1, padding: '14px',
                            backgroundColor: 'var(--color-primary)',
                            color: 'white', fontWeight: '600', fontSize: '14px',
                            borderRadius: '12px', border: 'none', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        }}
                    >
                        <Phone style={{ width: '18px', height: '18px' }} />
                        Call {companion === 'security' ? 'Security' : 'Group'}
                    </button>
                </div>

                {/* End Walk */}
                <button
                    onClick={() => setShowEndConfirm(true)}
                    type="button"
                    style={{
                        width: '100%', padding: '14px',
                        backgroundColor: 'var(--color-bg-secondary)',
                        color: 'var(--color-text-primary)',
                        fontWeight: '600', fontSize: '14px',
                        borderRadius: '12px',
                        border: '1px solid var(--color-border)',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    }}
                >
                    <X style={{ width: '18px', height: '18px' }} />
                    End Walk
                </button>
            </div>

            {/* Safety tip */}
            <div style={{ position: 'absolute', bottom: '16px', left: '16px', right: '16px', zIndex: 20 }}>
                <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '12px', margin: 0 }}>
                    Stay on well-lit paths. Help is just a tap away.
                </p>
            </div>

            {/* End Walk Confirmation — all inline styles */}
            {showEndConfirm && (
                <Portal>
                    <div style={{
                        position: 'fixed',
                        top: 0, left: 0, right: 0, bottom: 0,
                        zIndex: 3000,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '16px',
                    }}>
                        <div
                            ref={confirmRef}
                            role="dialog"
                            aria-modal="true"
                            aria-label="End walk confirmation"
                            style={{
                                width: '100%',
                                maxWidth: '384px',
                                backgroundColor: 'var(--color-bg-primary)',
                                borderRadius: '16px',
                                padding: '24px',
                                border: '1px solid var(--color-border)',
                                boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
                            }}
                        >
                            <h2 style={{
                                fontSize: '18px',
                                fontWeight: 'bold',
                                color: 'var(--color-text-primary)',
                                margin: '0 0 8px 0',
                            }}>
                                End Walk?
                            </h2>
                            <p style={{
                                fontSize: '14px',
                                color: 'var(--color-text-secondary)',
                                margin: '0 0 24px 0',
                                lineHeight: '1.5',
                            }}>
                                Are you sure you want to stop sharing your location? Your walking companions will be notified.
                            </p>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    ref={keepBtnRef}
                                    onClick={() => setShowEndConfirm(false)}
                                    type="button"
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        backgroundColor: 'var(--color-bg-secondary)',
                                        color: 'var(--color-text-primary)',
                                        fontWeight: '500',
                                        fontSize: '14px',
                                        borderRadius: '12px',
                                        border: '1px solid var(--color-border)',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Keep Walking
                                </button>
                                <button
                                    onClick={handleConfirmEnd}
                                    disabled={submitting}
                                    type="button"
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        backgroundColor: 'var(--color-danger)',
                                        color: 'white',
                                        fontWeight: '500',
                                        fontSize: '14px',
                                        borderRadius: '12px',
                                        border: 'none',
                                        cursor: submitting ? 'not-allowed' : 'pointer',
                                        opacity: submitting ? 0.7 : 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                    }}
                                >
                                    {submitting
                                        ? <Loader2 style={{ width: '18px', height: '18px' }} className="animate-spin" />
                                        : 'End Walk'
                                    }
                                </button>
                            </div>
                        </div>
                    </div>
                </Portal>
            )}
        </div>
    );
}