import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents } from 'react-leaflet';
import { useEffect, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const KNUST_CENTER = { lat: 6.6745, lng: -1.5716 };

const TILE_URLS = {
    streets: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    detailed: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
};

// SOS Alert icon (flashing red)
const sosIcon = L.divIcon({
    className: 'sos-marker',
    html: `<div style="
      width:28px;height:28px;background:#DC2626;
      border:3px solid white;border-radius:50%;
      box-shadow:0 0 0 3px #DC2626,0 0 15px rgba(220,38,38,0.7);
      animation:sos-flash 0.5s infinite alternate;
    "></div>
    <style>
      @keyframes sos-flash {
        0%{opacity:1;transform:scale(1)}
        100%{opacity:0.7;transform:scale(1.1)}
      }
    </style>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
});

// Patrol unit icon
const patrolIcon = L.divIcon({
    className: 'patrol-marker',
    html: `<div style="
      width:32px;height:32px;background:#D4A017;
      border:3px solid white;border-radius:8px;
      box-shadow:0 2px 8px rgba(0,0,0,0.2);
      display:flex;align-items:center;justify-content:center;
      font-size:16px;
    ">🚔</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
});

// Active walk icon
const walkIcon = L.divIcon({
    className: 'walk-marker',
    html: `<div style="
      width:24px;height:24px;background:#228B22;
      border:3px solid white;border-radius:50%;
      box-shadow:0 0 0 2px #228B22;
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
});

function ZoomWatcher({ onZoomChange }) {
    const map = useMapEvents({
        zoomend: () => onZoomChange(map.getZoom()),
    });
    useEffect(() => {
        onZoomChange(map.getZoom());
    }, [map, onZoomChange]);
    return null;
}

export default function DashboardMap({
    showHeatmap = false,
    selectedAlert,
    onAlertClick,
    sosAlerts = [],
    patrolUnits = [],
    activeWalks = [],
    heatmapData = [],
}) {
    const [zoom, setZoom] = useState(15);
    const [tileStyle, setTileStyle] = useState('detailed');
    const handleZoom = useCallback((z) => setZoom(z), []);

    const heatPoints = showHeatmap
        ? (zoom >= 14 ? heatmapData : heatmapData.filter((_, idx) => idx % 2 === 0))
        : [];

    return (
        <div className="relative w-full h-full">
            <MapContainer
                center={[KNUST_CENTER.lat, KNUST_CENTER.lng]}
                zoom={15}
                className="w-full h-full"
                zoomControl={true}
                attributionControl={true}
            >
                <ZoomWatcher onZoomChange={handleZoom} />
                <TileLayer
                    key={tileStyle}
                    url={TILE_URLS[tileStyle]}
                    maxZoom={22}
                    maxNativeZoom={19}
                />

                {/* Heatmap circles */}
                {heatPoints.map((point, idx) => (
                    <Circle
                        key={`heat-${idx}`}
                        center={[point.lat, point.lng]}
                        radius={150}
                        pathOptions={{
                            color: 'transparent',
                            fillColor: `rgba(212, 160, 23, ${point.intensity})`,
                            fillOpacity: 0.5,
                        }}
                    />
                ))}

                {/* Selected SOS highlight */}
                {selectedAlert && (
                    <Circle
                        center={[selectedAlert.lat, selectedAlert.lng]}
                        radius={120}
                        pathOptions={{
                            color: '#D4A017',
                            weight: 2,
                            fillColor: 'rgba(212, 160, 23, 0.15)',
                            fillOpacity: 0.25,
                        }}
                    />
                )}

                {/* SOS Alerts */}
                {sosAlerts.map((alert) => (
                    <Marker
                        key={alert.id}
                        position={[alert.lat, alert.lng]}
                        icon={sosIcon}
                        eventHandlers={{
                            click: () => onAlertClick && onAlertClick(alert),
                        }}
                    >
                        <Popup>
                            <div className="text-center">
                                <p className="font-bold text-red-600">🚨 SOS ALERT</p>
                                <p className="font-medium">{alert.student_name || alert.studentName}</p>
                                <p className="text-sm text-gray-600">{alert.location}</p>
                                <p className="text-xs text-gray-500">
                                    {alert.alert_code || `ID: ${alert.student_id || alert.studentId}`}
                                </p>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {/* Patrol Units */}
                {patrolUnits.map((patrol) => (
                    <Marker
                        key={patrol.id}
                        position={[patrol.lat, patrol.lng]}
                        icon={patrolIcon}
                    >
                        <Popup>
                            <div className="text-center">
                                <p className="font-bold">{patrol.name}</p>
                                <p className={`text-sm ${patrol.status === 'available' ? 'text-green-600' : 'text-yellow-600'}`}>
                                    {patrol.status === 'available' ? '✅ Available' : '🔄 Responding'}
                                </p>
                                {patrol.area && <p className="text-xs text-gray-500">{patrol.area}</p>}
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {/* Active Walks */}
                {activeWalks.map((walk) => (
                    <Marker
                        key={walk.id}
                        position={[walk.lat, walk.lng]}
                        icon={walkIcon}
                    >
                        <Popup>
                            <div className="text-center">
                                <p className="font-bold text-green-600">Walking</p>
                                <p className="font-medium">{walk.student_name || walk.studentName}</p>
                                <p className="text-sm text-gray-600">
                                    {walk.from || walk.origin_name} → {walk.to || walk.destination_name}
                                </p>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {/* Map style switcher */}
            <div
                className="absolute top-4 left-4 z-[1000] rounded-xl p-1.5 flex gap-1"
                style={{
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid var(--color-border)',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                }}
            >
                {Object.keys(TILE_URLS).map((style) => (
                    <button
                        key={style}
                        onClick={() => setTileStyle(style)}
                        style={{
                            padding: '4px 10px',
                            borderRadius: '8px',
                            fontSize: '11px',
                            fontWeight: '500',
                            border: 'none',
                            cursor: 'pointer',
                            backgroundColor: tileStyle === style ? 'var(--color-primary)' : 'transparent',
                            color: tileStyle === style ? 'white' : 'var(--color-text-secondary)',
                            textTransform: 'capitalize',
                            transition: 'all 0.15s',
                        }}
                    >
                        {style}
                    </button>
                ))}
            </div>

            {/* Legend */}
            <div
                className="absolute bottom-4 left-4 z-[1000] rounded-xl p-3"
                style={{
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid var(--color-border)',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                }}
            >
                <p className="text-xs font-medium text-text-primary mb-2">Legend</p>
                <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-danger rounded-full" />
                        <span className="text-text-secondary">SOS Alert ({sosAlerts.length})</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-primary rounded" />
                        <span className="text-text-secondary">Patrol Unit ({patrolUnits.length})</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-secondary rounded-full" />
                        <span className="text-text-secondary">Active Walk ({activeWalks.length})</span>
                    </div>
                </div>
            </div>

            {showHeatmap && (
                <div
                    className="absolute top-4 right-4 z-[1000] rounded-xl p-2"
                    style={{
                        backgroundColor: 'rgba(255,255,255,0.95)',
                        border: '1px solid var(--color-border)',
                    }}
                >
                    <p className="text-xs font-medium text-primary">📍 Incident Heatmap</p>
                </div>
            )}
        </div>
    );
}