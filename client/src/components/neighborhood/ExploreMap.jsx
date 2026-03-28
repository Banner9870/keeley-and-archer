import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import styles from './ExploreMap.module.css';

function toSlug(name) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function toTitleCase(str) {
  return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

const STYLE_DEFAULT = {
  fillColor: '#41B6E6',
  fillOpacity: 0.15,
  color: '#41B6E6',
  weight: 1.5,
};

const STYLE_MUTED = {
  fillColor: '#C0C0C0',
  fillOpacity: 0.08,
  color: '#C0C0C0',
  weight: 1,
};

const STYLE_HOVER = {
  fillOpacity: 0.4,
  weight: 2.5,
};

/**
 * ExploreMap — renders all 77 Chicago community area boundaries.
 * Each polygon is clickable, navigating to /neighborhood/:slug.
 *
 * @param {{ geoJSON: GeoJSON.FeatureCollection|null, filterSlugs: Set<string>|null }} props
 *   filterSlugs — when non-null and non-empty, mutes neighborhoods not in the set.
 */
export default function ExploreMap({ geoJSON, filterSlugs }) {
  const navigate = useNavigate();

  const hasFilter = filterSlugs && filterSlugs.size > 0;

  const styleFeature = useCallback(
    feature => {
      if (!hasFilter) return STYLE_DEFAULT;
      const slug = toSlug(feature.properties?.community || '');
      return filterSlugs.has(slug) ? STYLE_DEFAULT : STYLE_MUTED;
    },
    [hasFilter, filterSlugs],
  );

  const onEachFeature = useCallback(
    (feature, layer) => {
      const rawName = feature.properties?.community || '';
      const slug = toSlug(rawName);
      const displayName = toTitleCase(rawName);

      layer.bindTooltip(displayName, { sticky: true, className: 'explore-map-tooltip' });

      layer.on({
        click: () => navigate(`/neighborhood/${slug}`),
        mouseover(e) {
          e.target.setStyle({ ...styleFeature(feature), ...STYLE_HOVER });
          e.target.bringToFront();
        },
        mouseout(e) {
          e.target.setStyle(styleFeature(feature));
        },
      });
    },
    [navigate, styleFeature],
  );

  if (!geoJSON) {
    return <div className={styles.skeleton} aria-label="Loading neighborhood map" />;
  }

  // Key changes when filter changes, forcing react-leaflet to re-render all features
  // with updated styles. Using sorted slug list as a stable key.
  const mapKey = hasFilter ? [...filterSlugs].sort().join(',') : 'all';

  return (
    <div className={styles.mapWrapper}>
      <MapContainer
        center={[41.8781, -87.6298]}
        zoom={10}
        className={styles.map}
        scrollWheelZoom={false}
        zoomControl
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <GeoJSON
          key={mapKey}
          data={geoJSON}
          style={styleFeature}
          onEachFeature={onEachFeature}
        />
      </MapContainer>
    </div>
  );
}
