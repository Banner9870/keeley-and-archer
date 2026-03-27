import { Link } from 'react-router-dom';
import styles from './RemixAttribution.module.css';

/**
 * RemixAttribution — "Remixed from [original guide]" block shown on remixed guide detail pages.
 * @param {{ originalGuide: Guide, originalAuthor: User }} props
 */
export default function RemixAttribution({ originalGuide, originalAuthor }) {
  if (!originalGuide) return null;

  const authorHandle = originalAuthor
    ? (originalAuthor.isJournalist
        ? `@${originalAuthor.handle}.${originalAuthor.publication === 'WBEZ' ? 'wbez.org' : 'suntimes.com'}`
        : `@${originalAuthor.handle}.chicago.com`)
    : null;

  return (
    <div className={styles.block}>
      <span className={styles.icon}>↗</span>
      <div className={styles.text}>
        <span className={styles.label}>Remixed from </span>
        <Link to={`/guide/${originalGuide.id}`} className={styles.link}>
          {originalGuide.title}
        </Link>
        {authorHandle && (
          <span className={styles.author}> by {authorHandle}</span>
        )}
      </div>
    </div>
  );
}
