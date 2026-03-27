// ============================================================
// PlaceSearchResult.jsx — single row in Places API search results
// Props:
//   place        { id, name, address, category, rating, ratingCount }
//   onAdd        (place) => void
//   alreadyAdded boolean
// ============================================================

import styles from './PlaceSearchResult.module.css';

const CATEGORY_LABELS = {
  restaurant: 'Restaurant',
  cafe: 'Café',
  bar: 'Bar',
  music_venue: 'Music Venue',
  park: 'Park',
  cultural_institution: 'Cultural',
  shop: 'Shop',
  other: 'Place',
};

export default function PlaceSearchResult({ place, onAdd, alreadyAdded }) {
  return (
    <div className={styles.row}>
      <div className={styles.info}>
        <span className={styles.name}>{place.name}</span>
        <span className={styles.address}>{place.address}</span>
        <div className={styles.meta}>
          <span className={styles.category}>
            {CATEGORY_LABELS[place.category] || 'Place'}
          </span>
          {place.rating != null && (
            <span className={styles.rating}>★ {place.rating.toFixed(1)}</span>
          )}
        </div>
      </div>
      <button
        type="button"
        className={[styles.addBtn, alreadyAdded ? styles.added : ''].filter(Boolean).join(' ')}
        onClick={() => !alreadyAdded && onAdd(place)}
        disabled={alreadyAdded}
        aria-label={alreadyAdded ? `${place.name} already added` : `Add ${place.name} to guide`}
      >
        {alreadyAdded ? '✓ Added' : '+ Add'}
      </button>
    </div>
  );
}
