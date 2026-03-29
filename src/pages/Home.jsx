import { useState, useEffect, useRef } from 'react';
import TopBar from '../components/layout/TopBar';
import BottomSheet from '../components/layout/BottomSheet';
import BottomNav from '../components/layout/BottomNav';
import SOSButton from '../components/SOSButton';
import QuickActionChips from '../components/QuickActionChips';
import MapContainerComponent from '../components/map/MapContainer';
import EmergencyMode from '../components/EmergencyMode';
import WalkWithMeModal from '../components/WalkWithMeModal';
import ActiveWalkScreen from '../components/ActiveWalkScreen';
import SearchModal from '../components/SearchModal';
import MenuDrawer from '../components/MenuDrawer';
import AIChatBot from '../components/AIChatBot';
import ReportIssueModal from '../components/ReportIssueModal';
import useToast from '../hooks/useToast.js';
import sosAPI from '../api/sos';
import walksAPI from '../api/walks';
import trackingAPI from '../api/tracking';

export default function Home({ onSignOut }) {
    const toast = useToast();
    const [isEmergencyMode, setIsEmergencyMode] = useState(false);
    const [activeAlert, setActiveAlert] = useState(null);
    const [showWalkModal, setShowWalkModal] = useState(false);
    const [activeWalk, setActiveWalk] = useState(null);
    const [showSearch, setShowSearch] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [showReportIssue, setShowReportIssue] = useState(false);
    const [currentLocation, setCurrentLocation] = useState('KNUST Campus');

    const [userPosition, setUserPosition] = useState(null);
    const [gpsStatus, setGpsStatus] = useState('loading');
    const watchIdRef = useRef(null);

    useEffect(() => {
        sosAPI.myActive()
            .then(({ data }) => {
                if (data.has_active && data.alert) {
                    setActiveAlert(data.alert);
                    setIsEmergencyMode(true);
                }
            })
            .catch(() => {});

        walksAPI.myActive()
            .then(({ data }) => {
                if (data.has_active && data.walk) {
                    setActiveWalk(data.walk);
                }
            })
            .catch(() => {});
    }, []);

    useEffect(() => {
        if (!navigator.geolocation) {
            console.warn('Geolocation API not available');
            setGpsStatus('failed');
            fetchIPLocation();
            return;
        }

        let gotFirstFix = false;

        watchIdRef.current = navigator.geolocation.watchPosition(
            (pos) => {
                const coords = {
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                    accuracy: pos.coords.accuracy,
                };
                setUserPosition(coords);
                setGpsStatus('active');
                gotFirstFix = true;

                trackingAPI.updateLive({
                    latitude: coords.lat,
                    longitude: coords.lng,
                    accuracy_meters: coords.accuracy,
                    source: 'gps',
                }).catch(() => {});
            },
            (err) => {
                if (err.code === 1) {
                    setGpsStatus('denied');
                } else {
                    setGpsStatus('failed');
                }
                if (!gotFirstFix) fetchIPLocation();
            },
            {
                enableHighAccuracy: true,
                timeout: 30000,
                maximumAge: 60000,
            }
        );

        const fallbackTimer = setTimeout(() => {
            if (!gotFirstFix) fetchIPLocation();
        }, 10000);

        return () => {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
            }
            clearTimeout(fallbackTimer);
        };
    }, []);

    const fetchIPLocation = () => {
        fetch('https://ipapi.co/json/')
            .then(r => r.json())
            .then(data => {
                if (data.latitude && data.longitude) {
                    const coords = { lat: data.latitude, lng: data.longitude, accuracy: 5000 };
                    setUserPosition(prev => {
                        if (prev && prev.accuracy < 1000) return prev;
                        return coords;
                    });
                    if (gpsStatus !== 'active') setGpsStatus('ip_fallback');

                    trackingAPI.updateLive({
                        latitude: coords.lat,
                        longitude: coords.lng,
                        accuracy_meters: 5000,
                        source: 'network',
                    }).catch(() => {});
                }
            })
            .catch(() => {
                setUserPosition(prev => prev || { lat: 6.6745, lng: -1.5716, accuracy: 10000 });
            });
    };

    const handleSOSActivate = async () => {
        const pos = userPosition || { lat: 6.6745, lng: -1.5716, accuracy: 10000 };
        const hasRealGPS = gpsStatus === 'active' && pos.accuracy < 500;

        if (!hasRealGPS) {
            toast.error(`⚠️ Using approximate location (${Math.round(pos.accuracy || 5000)}m accuracy). Enable GPS for precise tracking.`);
        } else {
            toast.info(`📍 Sending your exact location (${Math.round(pos.accuracy)}m accuracy)...`);
        }

        try {
            const { data } = await sosAPI.trigger({
                latitude: pos.lat,
                longitude: pos.lng,
                accuracy_meters: pos.accuracy || 10000,
                location_text: hasRealGPS ? '' : `Approximate location (${gpsStatus})`,
                trigger_method: 'button',
            });

            await trackingAPI.toggleSharing(true).catch(() => {});
            await trackingAPI.updateLive({
                latitude: pos.lat,
                longitude: pos.lng,
                accuracy_meters: pos.accuracy || 10000,
                source: hasRealGPS ? 'gps' : 'network',
                context: 'sos',
                reference_id: data.alert?.id,
            }).catch(() => {});

            setActiveAlert({ ...data.alert, lat: pos.lat, lng: pos.lng });
            setIsEmergencyMode(true);
            toast.error('🚨 SOS Alert Sent! Security has been notified.');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to send SOS. Try again!');
        }
    };

    const handleEmergencyCancel = () => {
        setIsEmergencyMode(false);
        setActiveAlert(null);
    };

    const handleStartWalk = (walkData) => {
        setShowWalkModal(false);
        setActiveWalk(walkData);
    };

    const handleEndWalk = () => {
        setActiveWalk(null);
    };

    const handleLocationSelect = (location) => {
        setCurrentLocation(location.name);
    };

    if (isEmergencyMode) {
        return <EmergencyMode alertData={activeAlert} onCancel={handleEmergencyCancel} />;
    }

    if (activeWalk) {
        return <ActiveWalkScreen walkData={activeWalk} onEndWalk={handleEndWalk} />;
    }

    return (
        <div className="relative w-full h-screen overflow-hidden bg-bg-primary">
            <MapContainerComponent userPosition={userPosition} gpsStatus={gpsStatus} />

            <TopBar
                currentLocation={currentLocation}
                onMenuClick={() => setShowMenu(true)}
                onSearchClick={() => setShowSearch(true)}
            />

            {(gpsStatus === 'failed' || gpsStatus === 'denied' || gpsStatus === 'ip_fallback') && (
                <div style={{
                    position: 'absolute', top: '68px', left: '16px', right: '16px', zIndex: 1000,
                    backgroundColor: gpsStatus === 'denied' ? 'rgba(220,38,38,0.95)' : 'rgba(212,160,23,0.95)',
                    borderRadius: '12px', padding: '10px 14px',
                    display: 'flex', alignItems: 'center', gap: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                }}>
                    <span style={{ fontSize: '13px', color: 'white', flex: 1 }}>
                        {gpsStatus === 'denied'
                            ? '🚫 Location permission denied. Tap the lock icon in your browser to enable it.'
                            : '📍 Using approximate location. Enable GPS in your browser settings for accuracy.'
                        }
                    </span>
                    <button
                        onClick={() => setGpsStatus('dismissed')}
                        type="button"
                        style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', padding: '4px' }}
                    >
                        ✕
                    </button>
                </div>
            )}

            <QuickActionChips
                onWalkWithMe={() => setShowWalkModal(true)}
                onReport={() => setShowReportIssue(true)}
            />

            <BottomSheet />

            <AIChatBot />

            <SOSButton onActivate={handleSOSActivate} />

            <BottomNav />

            <WalkWithMeModal
                isOpen={showWalkModal}
                onClose={() => setShowWalkModal(false)}
                onStartWalk={handleStartWalk}
            />

            <SearchModal
                isOpen={showSearch}
                onClose={() => setShowSearch(false)}
                onSelectLocation={handleLocationSelect}
            />

            <MenuDrawer
                isOpen={showMenu}
                onClose={() => setShowMenu(false)}
                onSignOut={onSignOut}
            />

            <ReportIssueModal
                isOpen={showReportIssue}
                onClose={() => setShowReportIssue(false)}
                userPosition={userPosition}
            />
        </div>
    );
}