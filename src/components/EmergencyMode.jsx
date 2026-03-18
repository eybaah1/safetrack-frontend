import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Phone, Share2, X, Shield, Clock } from 'lucide-react';
import useFocusTrap from '../hooks/useFocusTrap';
import useToast from '../hooks/useToast.js';
import Portal from './layout/Portal.jsx';
import sosAPI from '../api/sos';
import trackingAPI from '../api/tracking';

const emergencyUserIcon = L.divIcon({
    className: 'emergency-user-marker',
    html: `<div style="
      width:24px;height:24px;background:#DC2626;
      border:4px solid white;border-radius:50%;
      box-shadow:0 0 0 3px #DC2626,0 0 20px rgba(220,38,38,0.6);
      animation:emergency-pulse 1s infinite;
    "></div>
    <style>
      @keyframes emergency-pulse {
        0%,100%{box-shadow:0 0 0 3px #DC2626,0 0 20px rgba(220,38,38,0.6)}
        50%{box-shadow:0 0 0 6px rgba(220,38,38,0.4),0 0 30px rgba(220,38,38,0.8)}
      }
    </style>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
});

export default function EmergencyMode({ alertData, onCancel }) {
    const toast = useToast();
    const [elapsedTime, setElapsedTime] = useState(0);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [userPos, setUserPos] = useState({
        lat: alertData?.lat || 6.6742,
        lng: alertData?.lng || -1.5718,
    });
    const confirmRef = useRef(null);
    const keepBtnRef = useRef(null);
    const locationInterval = useRef(null);

    useFocusTrap({ enabled: showCancelConfirm, containerRef: confirmRef, initialFocusRef: keepBtnRef });

    // Timer
    useEffect(() => {
        const timer = setInterval(() => setElapsedTime((p) => p + 1), 1000);
        return () => clearInterval(timer);
    }, []);

    // Keep sending live location during SOS
        // Keep sending live location during SOS — every position change
        useEffect(() => {
            if (!navigator.geolocation) return;
    
            let lastSentTime = 0;
    
            const watchId = navigator.geolocation.watchPosition(
                (pos) => {
                    const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                    setUserPos(coords);
    
                    // Send to server at most every 3 seconds
                    const now = Date.now();
                    if (now - lastSentTime > 3000) {
                        lastSentTime = now;
                        trackingAPI.updateLive({
                            latitude: coords.lat,
                            longitude: coords.lng,
                            accuracy_meters: pos.coords.accuracy,
                            source: 'gps',
                            context: 'sos',
                            reference_id: alertData?.id,
                        }).catch(() => {});
                    }
                },
                (err) => {
                    console.warn('SOS GPS error:', err.message);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 3000,
                }
            );
    
            return () => navigator.geolocation.clearWatch(watchId);
        }, [alertData?.id]);

    const formatTime = (s) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    };

    const handleConfirmCancel = async () => {
        try {
            if (alertData?.id) {
                await sosAPI.cancel(alertData.id);
                await trackingAPI.toggleSharing(false);
            }
            toast.success('SOS cancelled. Stay safe!');
            onCancel();
        } catch (err) {
            toast.error('Failed to cancel SOS. Try again.');
        }
    };

    return (
        <div className="fixed inset-0 z-[2000] bg-bg-primary">
            <div className="absolute inset-0 border-4 border-danger pointer-events-none z-10 animate-pulse" />

            {/* Header */}
            <div className="relative z-20 bg-danger py-4 px-4">
                <div className="flex items-center justify-center gap-2 mb-1">
                    <Shield className="w-6 h-6 text-white" />
                    <h1 className="text-xl font-bold text-white">HELP REQUEST SENT</h1>
                </div>
                <p className="text-center text-white/90 text-sm">Security has been notified of your location</p>
            </div>

            {/* Timer */}
            <div className="relative z-20 flex items-center justify-center gap-2 py-3 bg-bg-secondary border-b border-border">
                <Clock className="w-4 h-4 text-text-secondary" />
                <span className="text-text-secondary text-sm">Time elapsed:</span>
                <span className="font-mono font-bold text-primary text-lg">{formatTime(elapsedTime)}</span>
            </div>

            {/* Map */}
            <div className="relative z-0 h-[40vh]">
                <MapContainer
                    center={[userPos.lat, userPos.lng]}
                    zoom={17}
                    className="w-full h-full"
                    zoomControl={false}
                    dragging={false}
                    scrollWheelZoom={false}
                >
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                    <Marker position={[userPos.lat, userPos.lng]} icon={emergencyUserIcon} />
                </MapContainer>

                <div className="absolute bottom-4 left-4 right-4 z-[1000]">
                    <div className="bg-bg-primary/95 backdrop-blur-sm rounded-xl p-3 border border-border" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
                        <p className="text-text-secondary text-xs mb-1">Your current location</p>
                        <p className="font-semibold text-text-primary">{alertData?.location || 'Sending location...'}</p>
                        <p className="text-xs text-text-muted mt-1">
                            Lat: {userPos.lat.toFixed(4)}, Lng: {userPos.lng.toFixed(4)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="relative z-20 px-4 py-6 space-y-3">
                <button
                    onClick={() => toast.info('Calling KNUST Security (demo)...')}
                    className="w-full py-4 bg-secondary text-white font-semibold rounded-xl flex items-center justify-center gap-3 hover:bg-secondary-light transition-colors"
                >
                    <Phone className="w-5 h-5" /> Call Security
                </button>

                <button
                    onClick={() => toast.success('Live location link copied (demo).')}
                    className="w-full py-4 bg-primary text-white font-semibold rounded-xl flex items-center justify-center gap-3 hover:bg-primary-dark transition-colors"
                >
                    <Share2 className="w-5 h-5" /> Share Live Location
                </button>

                <button
                    onClick={() => setShowCancelConfirm(true)}
                    className="w-full py-4 bg-bg-secondary text-text-primary font-semibold rounded-xl flex items-center justify-center gap-3 hover:bg-bg-tertiary transition-colors border border-border"
                >
                    <X className="w-5 h-5" /> Cancel SOS
                </button>
            </div>

            <div className="absolute bottom-4 left-4 right-4 z-20">
                <p className="text-center text-text-muted text-xs">Stay calm. Security is on their way.</p>
            </div>

            {/* Cancel confirmation */}
            {showCancelConfirm && (
                <Portal>
                    <div className="fixed inset-0 z-[3000] bg-black/50 flex items-center justify-center p-4">
                        <div ref={confirmRef} className="bg-bg-primary rounded-2xl p-6 w-full max-w-sm border border-border" style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.15)' }} role="dialog" aria-modal="true">
                            <h2 className="text-lg font-bold text-text-primary mb-2">Cancel SOS?</h2>
                            <p className="text-text-secondary text-sm mb-6">Are you sure? Security will be notified that you are safe.</p>
                            <div className="flex gap-3">
                                <button
                                    ref={keepBtnRef}
                                    onClick={() => setShowCancelConfirm(false)}
                                    className="flex-1 py-3 bg-bg-secondary text-text-primary font-medium rounded-xl hover:bg-bg-tertiary transition-colors border border-border"
                                >
                                    Keep Active
                                </button>
                                <button
                                    onClick={handleConfirmCancel}
                                    className="flex-1 py-3 bg-danger text-white font-medium rounded-xl"
                                >
                                    Cancel SOS
                                </button>
                            </div>
                        </div>
                    </div>
                </Portal>
            )}
        </div>
    );
}