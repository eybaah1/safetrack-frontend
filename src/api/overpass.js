/**
 * Fetch building footprints from OpenStreetMap via Overpass API.
 * Returns GeoJSON-like data for KNUST campus buildings.
 */

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

// KNUST campus bounding box
const KNUST_BOUNDS = {
    south: 6.665,
    west: -1.585,
    north: 6.690,
    east: -1.555,
};

export async function fetchKNUSTBuildings() {
    const bbox = `${KNUST_BOUNDS.south},${KNUST_BOUNDS.west},${KNUST_BOUNDS.north},${KNUST_BOUNDS.east}`;

    // Overpass QL query — fetches ALL buildings, amenities, and points of interest
    const query = `
[out:json][timeout:30];
(
  // Buildings
  way["building"](${bbox});
  relation["building"](${bbox});

  // Amenities (libraries, restaurants, ATMs, etc.)
  node["amenity"](${bbox});
  way["amenity"](${bbox});

  // Leisure (parks, sports fields)
  way["leisure"](${bbox});

  // Shops
  node["shop"](${bbox});
  way["shop"](${bbox});
);
out body;
>;
out skel qt;
    `.trim();

    try {
        const response = await fetch(OVERPASS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `data=${encodeURIComponent(query)}`,
        });

        if (!response.ok) throw new Error('Overpass API error');

        const data = await response.json();
        return parseOverpassToGeoJSON(data);
    } catch (err) {
        console.warn('Failed to fetch building data:', err);
        return { type: 'FeatureCollection', features: [] };
    }
}

/**
 * Convert Overpass JSON to GeoJSON features that Leaflet can render.
 */
function parseOverpassToGeoJSON(data) {
    const nodes = {};
    const features = [];

    // Index all nodes by ID
    for (const el of data.elements) {
        if (el.type === 'node') {
            nodes[el.id] = { lat: el.lat, lng: el.lon };
        }
    }

    // Convert ways to polygon features
    for (const el of data.elements) {
        if (el.type === 'way' && el.nodes && el.nodes.length > 2) {
            const coords = [];
            let valid = true;

            for (const nodeId of el.nodes) {
                const node = nodes[nodeId];
                if (!node) { valid = false; break; }
                coords.push([node.lat, node.lng]);
            }

            if (!valid || coords.length < 3) continue;

            const tags = el.tags || {};
            const name = tags.name || tags['name:en'] || '';
            const buildingType = tags.building || tags.amenity || tags.leisure || tags.shop || '';

            features.push({
                type: 'Feature',
                id: el.id,
                properties: {
                    name,
                    type: buildingType,
                    levels: tags['building:levels'] || null,
                    description: tags.description || '',
                    amenity: tags.amenity || '',
                    address: tags['addr:street'] || '',
                    ...tags,
                },
                geometry: {
                    type: 'Polygon',
                    coordinates: coords,
                },
            });
        }

        // Also add named nodes as point features (ATMs, shops, etc.)
        if (el.type === 'node' && el.tags && (el.tags.name || el.tags.amenity || el.tags.shop)) {
            const tags = el.tags || {};
            features.push({
                type: 'Feature',
                id: el.id,
                properties: {
                    name: tags.name || tags.amenity || tags.shop || '',
                    type: tags.amenity || tags.shop || 'poi',
                    isPoint: true,
                    ...tags,
                },
                geometry: {
                    type: 'Point',
                    coordinates: [el.lat, el.lon],
                },
            });
        }
    }

    return { type: 'FeatureCollection', features };
}