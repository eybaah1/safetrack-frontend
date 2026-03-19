import { MapContainer, TileLayer, Marker, Popup, Polygon, CircleMarker, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import { useEffect, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import locationsAPI from '../../api/locations';
import { fetchKNUSTBuildings } from '../../api/overpass';
import MapLayerControl, { MAP_STYLES } from './MapLayerControl';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const KNUST_CENTER = { lat: 6.6745, lng: -1.5716 };

const createIcon = (color) =>
    L.divIcon({
        className: 'custom-marker',
        html: `<div style="width:32px;height:32px;background:${color};border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.15);"></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16],
    });

const userIcon = L.divIcon({
    className: 'user-marker',
    html: `<div style="width:20px;height:20px;background:#3B82F6;border:4px solid white;border-radius:50%;box-shadow:0 0 0 2px #3B82F6,0 2px 8px rgba(0,0,0,0.2);animation:pulse 2s infinite;"></div>
    <style>@keyframes pulse{0%{box-shadow:0 0 0 2px #3B82F6,0 2px 8px rgba(0,0,0,0.2)}50%{box-shadow:0 0 0 8px rgba(59,130,246,0.2),0 2px 8px rgba(0,0,0,0.2)}100%{box-shadow:0 0 0 2px #3B82F6,0 2px 8px rgba(0,0,0,0.2)}}</style>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
});

const locationIcon = createIcon('#D4A017');

function getBuildingColor(props) {
    const type = (props.building || props.amenity || props.type || '').toLowerCase();
    if (type === 'university' || type === 'college') return '#D4A017';
    if (type === 'library') return '#3B82F6';
    if (type === 'hospital' || type === 'clinic') return '#DC2626';
    if (type === 'church' || type === 'place_of_worship') return '#8B5CF6';
    if (type === 'dormitory' || type === 'residential' || type === 'apartments') return '#228B22';
    if (type === 'commercial' || type === 'retail' || type === 'shop') return '#F59E0B';
    if (props.amenity === 'restaurant' || props.amenity === 'cafe') return '#EC4899';
    if (props.leisure === 'pitch' || props.leisure === 'sports_centre') return '#10B981';
    return '#94A3B8';
}

function getBuildingLabel(props) {
    if (props.name) return props.name;
    const type = props.building || props.amenity || props.type || '';
    if (type === 'yes' || type === '') return '';
    return type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ');
}

function DynamicTileLayer({ styleId }) {
    const map = useMap();
    const style = MAP_STYLES.find((s) => s.id === styleId) || MAP_STYLES[0];
    useEffect(() => { map.invalidateSize(); }, [styleId, map]);
    return <TileLayer key={styleId} url={style.url} attribution={style.attribution} maxZoom={22} maxNativeZoom={19} />;
}

function ZoomWatcher({ onZoomChange }) {
    const map = useMapEvents({ zoomend: () => onZoomChange(map.getZoom()) });
    useEffect(() => { onZoomChange(map.getZoom()); }, [map, onZoomChange]);
    return null;
}

function RecenterOnce({ position }) {
    const map = useMap();
    const [centered, setCentered] = useState(false);

    useEffect(() => {
        if (position && !centered) {
            map.setView([position.lat, position.lng], 16);
            setCentered(true);
        }
    }, [position, centered, map]);

    return null;
}

export default function MapContainerComponent({ userPosition, gpsStatus }) {
    const [zoom, setZoom] = useState(15);
    const [locations, setLocations] = useState([]);
    const [buildings, setBuildings] = useState([]);
    const [mapStyle, setMapStyle] = useState('detailed');
    const [buildingsLoaded, setBuildingsLoaded] = useState(false);

    useEffect(() => {
        locationsAPI.mapMarkers()
            .then(({ data }) => setLocations(data))
            .catch(() => setLocations([]));
    }, []);

    useEffect(() => {
        if (buildingsLoaded) return;
        fetchKNUSTBuildings()
            .then((geojson) => { setBuildings(geojson.features || []); setBuildingsLoaded(true); })
            .catch(() => setBuildingsLoaded(true));
    }, [buildingsLoaded]);

    const handleZoom = useCallback((z) => setZoom(z), []);
    const center = userPosition || KNUST_CENTER;
    const visibleBuildings = zoom >= 16 ? buildings : [];
    const showBuildingLabels = zoom >= 17;
    const showPOIs = zoom >= 17;

    return (
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
            <MapContainer
                center={[center.lat, center.lng]}
                zoom={16}
                className="w-full h-full"
                zoomControl={false}
                attributionControl={true}
                maxZoom={22}
            >
                <DynamicTileLayer styleId={mapStyle} />
                <ZoomWatcher onZoomChange={handleZoom} />
                <RecenterOnce position={userPosition} />

                {/* Buildings */}
                {visibleBuildings.map((feature) => {
                    if (feature.geometry.type === 'Polygon') {
                        const color = getBuildingColor(feature.properties);
                        const name = feature.properties.name || '';
                        const isSat = mapStyle === 'satellite';
                        return (
                            <Polygon key={feature.id} positions={feature.geometry.coordinates}
                                pathOptions={{ color: isSat ? 'rgba(255,255,255,0.6)' : color, weight: isSat ? 1 : 1.5, fillColor: isSat ? 'rgba(255,255,255,0.15)' : color, fillOpacity: isSat ? 0.1 : 0.25 }}>
                                {showBuildingLabels && name && (
                                    <Tooltip permanent direction="center" className="building-label">
                                        <span style={{ fontSize: '10px', fontWeight: '600', color: isSat ? 'white' : '#1E293B', textShadow: isSat ? '0 1px 3px rgba(0,0,0,0.8)' : 'none', whiteSpace: 'nowrap' }}>{name}</span>
                                    </Tooltip>
                                )}
                                <Popup>
                                    <div style={{ minWidth: '150px' }}>
                                        <p style={{ fontWeight: '600', fontSize: '14px', margin: '0 0 4px 0' }}>{name || 'Unnamed Building'}</p>
                                        {feature.properties['building:levels'] && <p style={{ fontSize: '11px', color: '#94A3B8', margin: 0 }}>🏢 {feature.properties['building:levels']} floor(s)</p>}
                                    </div>
                                </Popup>
                            </Polygon>
                        );
                    }
                    if (feature.geometry.type === 'Point' && showPOIs) {
                        return (
                            <CircleMarker key={feature.id} center={feature.geometry.coordinates} radius={5}
                                pathOptions={{ color: getBuildingColor(feature.properties), fillColor: getBuildingColor(feature.properties), fillOpacity: 0.8, weight: 1 }}>
                                <Popup><p style={{ fontWeight: '600', fontSize: '13px', margin: 0 }}>{feature.properties.name || 'POI'}</p></Popup>
                            </CircleMarker>
                        );
                    }
                    return null;
                })}

                {/* User position */}
                {userPosition && (
                    <Marker position={[userPosition.lat, userPosition.lng]} icon={userIcon}>
                        <Popup>
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ fontWeight: '600', margin: 0 }}>Your Location</p>
                                {gpsStatus !== 'active' && (
                                    <p style={{ fontSize: '11px', color: '#DC2626', margin: '4px 0 0 0' }}>⚠️ Approximate</p>
                                )}
                            </div>
                        </Popup>
                    </Marker>
                )}

                {/* Campus locations */}
                {zoom >= 14 && locations.map((loc) => (
                    <Marker key={loc.id} position={[loc.lat, loc.lng]} icon={locationIcon}>
                        <Popup><p style={{ fontWeight: '600', margin: 0 }}>{loc.name}</p></Popup>
                    </Marker>
                ))}
            </MapContainer>

            <MapLayerControl currentStyle={mapStyle} onStyleChange={setMapStyle} />

            {zoom >= 16 && visibleBuildings.length > 0 && (
                <div style={{
                    position: 'absolute', bottom: '80px', left: '12px', zIndex: 1000,
                    backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border)',
                    borderRadius: '8px', padding: '6px 10px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    fontSize: '11px', color: 'var(--color-text-secondary)',
                }}>
                    🏢 {visibleBuildings.length} buildings
                </div>
            )}
        </div>
    );
}