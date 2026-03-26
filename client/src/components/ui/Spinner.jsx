import styles from './Spinner.module.css';

/**
 * Spinner — inline loading indicator for Places API search results.
 */
export default function Spinner({ size = 20, className }) {
  return (
    <span
      className={[styles.spinner, className].filter(Boolean).join(' ')}
      style={{ width: size, height: size }}
      role="status"
      aria-label="Loading"
    />
  );
}
