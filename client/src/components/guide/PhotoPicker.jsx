// ============================================================
// PhotoPicker.jsx — curated Unsplash photo gallery for guide cover selection
// Props: selectedUrl (string|null), onSelect (url => void)
// ============================================================

import { unsplashPhotos } from '../../data/unsplashPhotos';
import styles from './PhotoPicker.module.css';

export default function PhotoPicker({ selectedUrl, onSelect }) {
  return (
    <div className={styles.wrapper}>
      <p className={styles.hint}>Pick a cover photo for your guide (optional)</p>
      <div className={styles.grid}>
        {unsplashPhotos.map(photo => (
          <button
            key={photo.id}
            type="button"
            className={[
              styles.photoBtn,
              selectedUrl === photo.url ? styles.selected : '',
            ].filter(Boolean).join(' ')}
            onClick={() => onSelect(selectedUrl === photo.url ? null : photo.url)}
            aria-label={photo.alt}
            aria-pressed={selectedUrl === photo.url}
          >
            <img
              src={photo.url}
              alt={photo.alt}
              className={styles.photo}
              loading="lazy"
            />
            {selectedUrl === photo.url && (
              <span className={styles.checkmark} aria-hidden="true">✓</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
