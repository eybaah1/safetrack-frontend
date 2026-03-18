import { useRef } from 'react';
import { MapPin, Navigation, Clock, Star, X, AlertTriangle, Phone } from 'lucide-react';
import useEscapeKey from '../hooks/useEscapeKey';
import useFocusTrap from '../hooks/useFocusTrap';

// Mock location details
const locationDetails = {
    name: 'JQB (Junior Quarters B)',
    type: 'Bus Stop',
    description: 'Major campus transportation hub near Junior Quarters residential area.',
    coordinates: { lat: 6.6745, lng: -1.5716 },
    nearbyPlaces: [
        { name: 'Commercial Area', distance: '150m', type: 'Shopping' },
        { name: 'JQB Hostel', distance: '200m', type: 'Residential' },
        { name: 'Security Post', distance: '300m', type: 'Security' },
    ],
    safetyInfo: {
        rating: 4.2,
        recentActivity: 'Normal activity levels',
        lighting: 'Well lit',
        securityPresence: 'Patrol available',
    },
};

export default function Details({ isOpen, onClose, location }) {
    const data = location || locationDetails;
    const panelRef = useRef(null);
    const closeBtnRef = useRef(null);

    useEscapeKey(isOpen, onClose);
    useFocusTrap({ enabled: isOpen, containerRef: panelRef, initialFocusRef: closeBtnRef });
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[2000] flex items-end justify-center" role="dialog" aria-modal="true" aria-label="Location details">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Details Panel */}
            <div ref={panelRef} className="relative w-full max-w-lg bg-bg-secondary rounded-t-3xl max-h-[85vh] overflow-hidden animate-slide-up">
                {/* Handle */}
                <div className="flex justify-center pt-3 pb-2">
                    <div className="w-10 h-1 bg-bg-tertiary rounded-full" />
                </div>

                {/* Header */}
                <div className="px-5 pb-4 border-b border-border">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs font-medium rounded-full">
                                    {data.type}
                                </span>
                            </div>
                            <h2 className="text-xl font-bold text-text-primary">{data.name}</h2>
                            <p className="text-sm text-text-secondary mt-1">{data.description}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 bg-bg-tertiary rounded-lg hover:bg-border transition-colors"
                            type="button"
                            aria-label="Close"
                            ref={closeBtnRef}
                        >
                            <X className="w-5 h-5 text-text-secondary" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="px-5 py-4 overflow-y-auto max-h-[60vh] hide-scrollbar">
                    {/* Quick Actions */}
                    <div className="flex gap-3 mb-6">
                        <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-bg-primary font-medium rounded-xl hover:bg-primary-dark transition-colors">
                            <Navigation className="w-4 h-4" />
                            Navigate
                        </button>
                        <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-bg-tertiary text-text-primary font-medium rounded-xl hover:bg-border transition-colors">
                            <Star className="w-4 h-4" />
                            Save
                        </button>
                    </div>

                    {/* Safety Information */}
                    <div className="bg-bg-primary rounded-xl p-4 border border-border mb-4">
                        <h3 className="font-semibold text-text-primary text-sm mb-3 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-secondary" />
                            Safety Information
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <p className="text-xs text-text-secondary">Safety Rating</p>
                                <div className="flex items-center gap-1 mt-1">
                                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                    <span className="font-semibold text-text-primary">{data.safetyInfo.rating}</span>
                                    <span className="text-xs text-text-secondary">/5</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-text-secondary">Lighting</p>
                                <p className="text-sm font-medium text-primary mt-1">{data.safetyInfo.lighting}</p>
                            </div>
                            <div>
                                <p className="text-xs text-text-secondary">Activity</p>
                                <p className="text-sm text-text-primary mt-1">{data.safetyInfo.recentActivity}</p>
                            </div>
                            <div>
                                <p className="text-xs text-text-secondary">Security</p>
                                <p className="text-sm text-text-primary mt-1">{data.safetyInfo.securityPresence}</p>
                            </div>
                        </div>
                    </div>

                    {/* Nearby Places */}
                    <div className="mb-4">
                        <h3 className="font-semibold text-text-primary text-sm mb-3 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-text-secondary" />
                            Nearby Places
                        </h3>
                        <div className="space-y-2">
                            {data.nearbyPlaces.map((place, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between bg-bg-primary rounded-lg p-3 border border-border"
                                >
                                    <div>
                                        <p className="text-sm font-medium text-text-primary">{place.name}</p>
                                        <p className="text-xs text-text-secondary">{place.type}</p>
                                    </div>
                                    <span className="text-sm text-primary font-medium">{place.distance}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Emergency Contact */}
                    <div className="bg-danger/10 rounded-xl p-4 border border-danger/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-text-primary">Need Help?</p>
                                <p className="text-xs text-text-secondary">Contact campus security</p>
                            </div>
                            <button className="flex items-center gap-2 px-4 py-2 bg-danger text-white rounded-lg font-medium text-sm hover:bg-danger/80 transition-colors">
                                <Phone className="w-4 h-4" />
                                Call
                            </button>
                        </div>
                    </div>
                </div>

                {/* Coordinates Footer */}
                <div className="px-5 py-3 border-t border-border bg-bg-primary">
                    <div className="flex items-center justify-between text-xs text-text-muted">
                        <span>Coordinates: {data.coordinates.lat}, {data.coordinates.lng}</span>
                        <Clock className="w-4 h-4" />
                    </div>
                </div>
            </div>
        </div>
    );
}
