// ============================================================
// AddedPlaceRow.jsx — a place in the "Your guide" build panel
// Props:
//   place         Place object
//   index         position in the list (0-based)
//   totalCount    total number of added places (for disabling arrows)
//   onRemove      (id) => void
//   onNoteChange  (id, note) => void
//   onMoveUp      (index) => void
//   onMoveDown    (index) => void
// ============================================================

import styles from './AddedPlaceRow.module.css';

export default function AddedPlaceRow({
  place,
  index,
  totalCount,
  onRemove,
  onNoteChange,
  onMoveUp,
  onMoveDown,
}) {
  const isFirst = index === 0;
  const isLast = index === totalCount - 1;

  return (
    <div className={styles.row}>
      <div className={styles.header}>
        <div className={styles.orderControls}>
          <button
            type="button"
            className={styles.arrowBtn}
            onClick={() => onMoveUp(index)}
            disabled={isFirst}
            aria-label={`Move ${place.name} up`}
          >
            ▲
          </button>
          <button
            type="button"
            className={styles.arrowBtn}
            onClick={() => onMoveDown(index)}
            disabled={isLast}
            aria-label={`Move ${place.name} down`}
          >
            ▼
          </button>
        </div>

        <div className={styles.placeInfo}>
          <span className={styles.index}>{index + 1}</span>
          <div className={styles.nameBlock}>
            <span className={styles.name}>{place.name}</span>
            <span className={styles.address}>{place.address}</span>
          </div>
        </div>

        <button
          type="button"
          className={styles.removeBtn}
          onClick={() => onRemove(place.id)}
          aria-label={`Remove ${place.name} from guide`}
        >
          ✕
        </button>
      </div>

      <div className={styles.noteWrapper}>
        <textarea
          className={styles.noteInput}
          value={place.editorNote || ''}
          onChange={e => onNoteChange(place.id, e.target.value)}
          placeholder="Why did you add this place?"
          maxLength={200}
          rows={2}
          aria-label={`Editor's note for ${place.name}`}
        />
      </div>
    </div>
  );
}
