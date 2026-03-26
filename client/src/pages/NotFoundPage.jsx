import { Link } from 'react-router-dom';
import styles from './NotFoundPage.module.css';

export default function NotFoundPage() {
  return (
    <div className={styles.container}>
      <p className={styles.code}>404</p>
      <h1 className={styles.heading}>Page not found</h1>
      <p className={styles.body}>
        This page doesn&rsquo;t exist or was moved.
      </p>
      <Link to="/feed" className={styles.link}>
        ← Back to the feed
      </Link>
    </div>
  );
}
