import { useState } from 'react';
import { Layers, Map, Satellite, Building2 } from 'lucide-react';

const MAP_STYLES = [
    {
        id: 'streets',
        label: 'Streets',
        icon: Map,
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '© OpenStreetMap contributors',
    },
    {
        id: 'detailed',
        label: 'Detailed',
        icon: Building2,
        url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
        attribution: '© OpenStreetMap contributors, Tiles: HOT',
    },
    {
        id: 'satellite',
        label: 'Satellite',
        icon: Satellite,
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: '© Esri, Maxar, Earthstar Geographics',
    },
];

export { MAP_STYLES };

export default function MapLayerControl({ currentStyle, onStyleChange }) {
    const [open, setOpen] = useState(false);

    return (
        <div
            style={{
                position: 'absolute',
                top: '70px',
                right: '12px',
                zIndex: 1000,
            }}
        >
            {/* Toggle button */}
            <button
                onClick={() => setOpen(!open)}
                type="button"
                style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--color-bg-primary)',
                    border: '1px solid var(--color-border)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                }}
                aria-label="Map layers"
            >
                <Layers style={{ width: '18px', height: '18px', color: 'var(--color-text-primary)' }} />
            </button>

            {/* Dropdown */}
            {open && (
                <div
                    style={{
                        position: 'absolute',
                        top: '48px',
                        right: 0,
                        backgroundColor: 'var(--color-bg-primary)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '12px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                        padding: '8px',
                        minWidth: '160px',
                    }}
                >
                    {MAP_STYLES.map((style) => {
                        const Icon = style.icon;
                        const isActive = currentStyle === style.id;

                        return (
                            <button
                                key={style.id}
                                onClick={() => {
                                    onStyleChange(style.id);
                                    setOpen(false);
                                }}
                                type="button"
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    padding: '10px 12px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    backgroundColor: isActive ? 'rgba(212,160,23,0.1)' : 'transparent',
                                    color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                                    fontWeight: isActive ? '600' : '400',
                                    marginBottom: '2px',
                                }}
                            >
                                <Icon style={{ width: '16px', height: '16px', flexShrink: 0 }} />
                                <span style={{ fontSize: '14px' }}>{style.label}</span>
                                {isActive && (
                                    <div style={{
                                        width: '6px', height: '6px', borderRadius: '50%',
                                        backgroundColor: 'var(--color-primary)', marginLeft: 'auto',
                                    }} />
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}