import styles from './FeedHero.module.css';
import StarIcon from '../shared/StarIcon';

/**
 * FeedHero — full-width hero strip at the top of the feed.
 * Chicago flag blue stripes with the chicago.com wordmark.
 */
export default function FeedHero() {
  return (
    <div className={styles.hero}>
      <div className={styles.stripe} />
      <div className={styles.content}>
        <div className={styles.wordmark}>
          <StarIcon size={20} color="var(--red)" aria-hidden />
          <span className={styles.wordmarkText}>chicago.com</span>
          <StarIcon size={20} color="var(--red)" aria-hidden />
        </div>
        <p className={styles.tagline}>Chicago guides, made by locals for locals.</p>
      </div>
      <div className={styles.stripe} />
    </div>
  );
}
