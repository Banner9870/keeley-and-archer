import NeighborhoodTag from '../shared/NeighborhoodTag';
import styles from './PlaceListItem.module.css';

const CATEGORY_ICONS = {
  restaurant: '🍽',
  cafe: '☕',
  bar: '🍺',
  music_venue: '🎵',
  park: '🌿',
  cultural_institution: '🏛',
  shop: '🛍',
  other: '📍',
};

function getMapsUrl(place) {
  if (place.placeId) {
    return `https://www.google.com/maps/place/?q=place_id:${place.placeId}`;
  }
  return `https://maps.google.com/?q=${encodeURIComponent(`${place.name} ${place.address}`)}`;
}

function formatRating(rating, count) {
  if (!rating) return null;
  const formatted = rating.toFixed(1);
  const reviewCount = count ? ` (${count.toLocaleString()} reviews)` : '';
  return `${formatted} ★${reviewCount}`;
}

/**
 * PlaceListItem — a single place entry in the guide detail places list.
 * @param {{ place: Place, index: number }} props
 */
export default function PlaceListItem({ place, index }) {
  const icon = CATEGORY_ICONS[place.category] || CATEGORY_ICONS.other;
  const ratingText = formatRating(place.rating, place.ratingCount);
  const mapsUrl = getMapsUrl(place);

  return (
    <div className={styles.item}>
      <div className={styles.indexBadge}>{index + 1}</div>
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.titleRow}>
            <span className={styles.icon} aria-hidden="true">{icon}</span>
            <h3 className={styles.name}>{place.name}</h3>
          </div>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.mapsLink}
          >
            View on Google Maps →
          </a>
        </div>

        <div className={styles.meta}>
          <span className={styles.address}>{place.address}</span>
          {place.neighborhood && (
            <NeighborhoodTag name={place.neighborhood} />
          )}
        </div>

        {ratingText && (
          <div className={styles.rating}>{ratingText}</div>
        )}

        {place.editorNote && (
          <p className={styles.editorNote}>"{place.editorNote}"</p>
        )}

        {place.coverImage && (
          <img
            src={place.coverImage}
            alt={place.name}
            className={styles.thumbnail}
            loading="lazy"
          />
        )}
      </div>
    </div>
  );
}
