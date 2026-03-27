import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import styles from './NeighborhoodMap.module.css';

// Fit map to a GeoJSON feature's bounds
function FitFeature({ feature }) {
  const map = useMap();

  useEffect(() => {
    if (!feature) return;
    try {
      const layer = L.geoJSON(feature);
      const bounds = layer.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [24, 24] });
      }
    } catch {
      // bounds computation failed — leave default view
    }
  }, [map, feature]);

  return null;
}

const NEIGHBORHOOD_STYLE = {
  fillColor: '#41B6E6',
  fillOpacity: 0.18,
  color: '#41B6E6',
  weight: 2,
};

/**
 * NeighborhoodMap — renders a single community area GeoJSON boundary.
 * @param {{ geoJSON: GeoJSON.FeatureCollection, slug: string, name: string }} props
 */
export default function NeighborhoodMap({ geoJSON, slug, name }) {
  // Find the matching feature from the full GeoJSON collection
  const feature = useMemo(() => {
    if (!geoJSON?.features) return null;
    return geoJSON.features.find(f => {
      const rawName = f.properties?.community || '';
      const featureSlug = rawName
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      return featureSlug === slug;
    }) || null;
  }, [geoJSON, slug]);

  if (!geoJSON) {
    return (
      <div className={styles.skeleton} aria-label="Loading neighborhood map" />
    );
  }

  return (
    <div className={styles.mapWrapper}>
      <MapContainer
        center={[41.8781, -87.6298]}
        zoom={12}
        className={styles.map}
        scrollWheelZoom={false}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {feature && (
          <>
            <GeoJSON
              key={slug}
              data={feature}
              style={NEIGHBORHOOD_STYLE}
            />
            <FitFeature feature={feature} />
          </>
        )}
      </MapContainer>
    </div>
  );
}
