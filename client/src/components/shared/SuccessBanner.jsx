// ============================================================
// SuccessBanner.jsx — confirmation strip shown after guide creation
// Props: message (string)
// ============================================================

import styles from './SuccessBanner.module.css';

export default function SuccessBanner({ message }) {
  return (
    <div className={styles.banner} role="status" aria-live="polite">
      <span className={styles.icon} aria-hidden="true">★</span>
      <p className={styles.message}>{message}</p>
    </div>
  );
}
