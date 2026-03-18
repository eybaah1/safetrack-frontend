import { useState, useEffect } from 'react';
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
    const [currentLocation, setCurrentLocation] = useState('KNUST Campus');

    // Check for existing active SOS or walk on mount
    useEffect(() => {
        // Check active SOS
        sosAPI.myActive()
            .then(({ data }) => {
                if (data.has_active && data.alert) {
                    setActiveAlert(data.alert);
                    setIsEmergencyMode(true);
                }
            })
            .catch(() => {});

        // Check active walk
        walksAPI.myActive()
            .then(({ data }) => {
                if (data.has_active && data.walk) {
                    setActiveWalk(data.walk);
                }
            })
            .catch(() => {});
    }, []);

    const handleSOSActivate = async () => {
        toast.info('📍 Getting your location...');

        // Try to get accurate GPS with longer timeout
        let lat = null;
        let lng = null;
        let accuracy = null;
        let locationText = '';

        try {
            const pos = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(
                    resolve,
                    reject,
                    {
                        enableHighAccuracy: true,
                        timeout: 15000,      // 15 seconds
                        maximumAge: 5000,    // Accept cached position up to 5s old
                    }
                );
            });
            lat = pos.coords.latitude;
            lng = pos.coords.longitude;
            accuracy = pos.coords.accuracy;

            // Check if location is reasonable (within Ghana roughly)
            if (lat < 4 || lat > 12 || lng < -4 || lng > 2) {
                console.warn('GPS returned suspicious coordinates:', lat, lng);
                lat = null;
                lng = null;
            }
        } catch (geoErr) {
            console.warn('Geolocation failed:', geoErr.message);
        }

        // If GPS failed, try IP-based location as fallback
        if (lat === null || lng === null) {
            try {
                const resp = await fetch('https://ipapi.co/json/', { timeout: 5000 });
                const ipData = await resp.json();
                if (ipData.latitude && ipData.longitude) {
                    lat = ipData.latitude;
                    lng = ipData.longitude;
                    accuracy = 5000; // IP location is very rough
                    locationText = ipData.city || '';
                    console.log('Using IP-based location:', lat, lng);
                }
            } catch {
                console.warn('IP geolocation also failed');
            }
        }

        // Last resort — use KNUST center but warn the user
        if (lat === null || lng === null) {
            lat = 6.6745;
            lng = -1.5716;
            accuracy = 10000;
            locationText = 'Location unavailable — KNUST Campus (approximate)';
            toast.error('⚠️ Could not get your exact location. Enable GPS for accurate tracking.');
        }

        // Send SOS
        try {
            console.log('Sending SOS with coordinates:', lat, lng, 'accuracy:', accuracy);

            const { data } = await sosAPI.trigger({
                latitude: lat,
                longitude: lng,
                accuracy_meters: accuracy,
                location_text: locationText,
                trigger_method: 'button',
            });

            // Start live location tracking immediately
            await trackingAPI.toggleSharing(true).catch(() => {});

            // Send first live update with the same coordinates
            await trackingAPI.updateLive({
                latitude: lat,
                longitude: lng,
                accuracy_meters: accuracy,
                source: 'gps',
                context: 'sos',
                reference_id: data.alert?.id,
            }).catch(() => {});

            setActiveAlert(data.alert);
            setIsEmergencyMode(true);
            toast.error('🚨 SOS Alert Sent! Security has been notified.');
        } catch (err) {
            console.error('SOS ERROR:', err.response?.data || err);
            const msg = err.response?.data?.error
                || err.response?.data?.detail
                || (typeof err.response?.data === 'object'
                    ? JSON.stringify(err.response.data)
                    : null)
                || 'Failed to send SOS. Try again!';
            toast.error(msg);
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

    // Show Emergency Mode
    if (isEmergencyMode) {
        return <EmergencyMode alertData={activeAlert} onCancel={handleEmergencyCancel} />;
    }

    // Show Active Walk
    if (activeWalk) {
        return <ActiveWalkScreen walkData={activeWalk} onEndWalk={handleEndWalk} />;
    }

    return (
        <div className="relative w-full h-screen overflow-hidden bg-bg-primary">
            <MapContainerComponent />

            <TopBar
                currentLocation={currentLocation}
                onMenuClick={() => setShowMenu(true)}
                onSearchClick={() => setShowSearch(true)}
            />

            <QuickActionChips onWalkWithMe={() => setShowWalkModal(true)} />

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
        </div>
    );
}