import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import markerIconUrl from 'leaflet/dist/images/marker-icon.png';
import markerIcon2xUrl from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadowUrl from 'leaflet/dist/images/marker-shadow.png';
import styles from './LeafletMap.module.css';

// Fix Vite + Leaflet default marker icon issue
const defaultIcon = L.icon({
  iconUrl: markerIconUrl,
  iconRetinaUrl: markerIcon2xUrl,
  shadowUrl: markerShadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Custom red marker for Chicago.com branding
const redIcon = L.divIcon({
  className: '',
  html: `<div style="
    width: 14px; height: 14px;
    background: #EF002B;
    border: 2px solid white;
    border-radius: 50%;
    box-shadow: 0 2px 4px rgba(0,0,0,0.35);
  "></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
  popupAnchor: [0, -10],
});

const CHICAGO_CENTER = { lat: 41.8781, lng: -87.6298 };

// Inner component to auto-fit bounds when places change
function AutoFitBounds({ places }) {
  const map = useMap();

  useEffect(() => {
    const validPlaces = places.filter(p => p.lat && p.lng);
    if (validPlaces.length === 0) return;

    if (validPlaces.length === 1) {
      map.setView([validPlaces[0].lat, validPlaces[0].lng], 15);
    } else {
      const bounds = L.latLngBounds(validPlaces.map(p => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [32, 32] });
    }
  }, [map, places]);

  return null;
}

/**
 * LeafletMap — multi-pin map for guide detail places.
 * @param {{ places: Place[], center?: {lat, lng}, zoom?: number }} props
 */
export default function LeafletMap({ places = [], center, zoom = 13 }) {
  const validPlaces = places.filter(p => p.lat && p.lng);
  const mapCenter = center || CHICAGO_CENTER;

  return (
    <div className={styles.mapWrapper}>
      <MapContainer
        center={[mapCenter.lat, mapCenter.lng]}
        zoom={zoom}
        className={styles.map}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <AutoFitBounds places={validPlaces} />
        {validPlaces.map((place, i) => (
          <Marker
            key={place.id || i}
            position={[place.lat, place.lng]}
            icon={redIcon}
          >
            <Popup>
              <strong>{place.name}</strong>
              {place.address && <><br />{place.address}</>}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
