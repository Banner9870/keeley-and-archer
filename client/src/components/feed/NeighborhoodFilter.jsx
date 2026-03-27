import { useAppContext } from '../../hooks/useAppContext';
import styles from './NeighborhoodFilter.module.css';

/**
 * NeighborhoodFilter — sidebar chip panel for filtering feed by neighborhood.
 * Shows neighborhoods derived from seeded guides.
 * Dispatches TOGGLE_NEIGHBORHOOD_FILTER on chip click.
 */
export default function NeighborhoodFilter() {
  const { state, dispatch } = useAppContext();
  const { selectedNeighborhoods } = state.feedPreferences;

  // Build unique sorted list of neighborhoods from all guides
  const neighborhoods = Array.from(
    new Set(state.guides.map(g => g.neighborhood))
  ).sort();

  function toggle(neighborhood) {
    dispatch({ type: 'TOGGLE_NEIGHBORHOOD_FILTER', payload: { neighborhood } });
  }

  return (
    <section className={styles.panel} id="neighborhood-filter">
      <h2 className={styles.heading}>Your Neighborhoods</h2>
      <div className={styles.chips}>
        {neighborhoods.map(name => {
          const active = selectedNeighborhoods.includes(name);
          return (
            <button
              key={name}
              className={`${styles.chip} ${active ? styles.active : ''}`}
              onClick={() => toggle(name)}
              aria-pressed={active}
            >
              {name}
            </button>
          );
        })}
      </div>
    </section>
  );
}
