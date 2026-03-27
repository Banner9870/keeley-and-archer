import { useAppContext } from '../../hooks/useAppContext';
import styles from './CategoryFilter.module.css';

const ALL_CATEGORIES = [
  'Food & Drink',
  'Coffee',
  'Live Music',
  'Parks',
  'Culture',
  'History',
  'Sports',
  'Nightlife',
  'Family',
  'Shopping',
];

/**
 * CategoryFilter — sidebar toggle panel for filtering feed by category.
 * Dispatches TOGGLE_CATEGORY_FILTER on toggle click.
 */
export default function CategoryFilter() {
  const { state, dispatch } = useAppContext();
  const { selectedCategories } = state.feedPreferences;

  function toggle(category) {
    dispatch({ type: 'TOGGLE_CATEGORY_FILTER', payload: { category } });
  }

  return (
    <section className={styles.panel}>
      <h2 className={styles.heading}>Categories</h2>
      <ul className={styles.list}>
        {ALL_CATEGORIES.map(cat => {
          const active = selectedCategories.includes(cat);
          return (
            <li key={cat}>
              <button
                className={`${styles.toggle} ${active ? styles.active : ''}`}
                onClick={() => toggle(cat)}
                aria-pressed={active}
              >
                <span className={styles.checkmark} aria-hidden="true">
                  {active ? '✓' : ''}
                </span>
                <span className={styles.label}>{cat}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
