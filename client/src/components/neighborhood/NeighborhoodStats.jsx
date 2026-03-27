import styles from './NeighborhoodStats.module.css';

/**
 * NeighborhoodStats — population and adjacent neighborhoods strip.
 * @param {{ area: CommunityArea }} props — area from useCommunityAreas
 */
export default function NeighborhoodStats({ area }) {
  if (!area) return null;

  return (
    <div className={styles.strip}>
      <div className={styles.stat}>
        <span className={styles.label}>Community Area</span>
        <span className={styles.value}>#{area.areaNumber || area.id}</span>
      </div>
      {area.population && (
        <div className={styles.stat}>
          <span className={styles.label}>Population</span>
          <span className={styles.value}>{Number(area.population).toLocaleString()}</span>
        </div>
      )}
      <div className={styles.stat}>
        <span className={styles.label}>City</span>
        <span className={styles.value}>Chicago, IL</span>
      </div>
    </div>
  );
}
