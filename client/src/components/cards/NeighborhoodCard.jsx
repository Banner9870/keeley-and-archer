import { Link } from 'react-router-dom';
import styles from './NeighborhoodCard.module.css';

/**
 * NeighborhoodCard — compact neighborhood tile for the Explore grid.
 * @param {{ area: { name, nameUpper, slug, areaNumber }, guideCount?: number }} props
 */
export default function NeighborhoodCard({ area, guideCount = 0 }) {
  return (
    <Link
      to={`/neighborhood/${area.slug}`}
      className={styles.card}
      aria-label={`Browse ${area.name}`}
    >
      <span className={styles.number} aria-hidden="true">{area.areaNumber}</span>
      <span className={styles.name}>{area.nameUpper}</span>
      {guideCount > 0 && (
        <span className={styles.count}>
          {guideCount} guide{guideCount !== 1 ? 's' : ''}
        </span>
      )}
    </Link>
  );
}
