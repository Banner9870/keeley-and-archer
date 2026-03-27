import styles from './SkeletonCard.module.css';

/**
 * SkeletonCard — animated shimmer placeholder.
 * variant 'guide' = tall with image area (matches GuideCard)
 * variant 'article' = compact text-only (matches ArticleCard)
 */
export default function SkeletonCard({ variant = 'guide' }) {
  if (variant === 'article') {
    return (
      <div className={`${styles.card} ${styles.article}`} aria-hidden="true">
        <div className={styles.topBorder} />
        <div className={styles.body}>
          <div className={`${styles.shimmer} ${styles.badgeLine}`} />
          <div className={`${styles.shimmer} ${styles.titleLine}`} />
          <div className={`${styles.shimmer} ${styles.titleLineShort}`} />
          <div className={`${styles.shimmer} ${styles.summaryLine}`} />
          <div className={`${styles.shimmer} ${styles.metaLine}`} />
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.card} ${styles.guide}`} aria-hidden="true">
      <div className={`${styles.shimmer} ${styles.imageArea}`} />
      <div className={styles.body}>
        <div className={`${styles.shimmer} ${styles.titleLine}`} />
        <div className={`${styles.shimmer} ${styles.titleLineShort}`} />
        <div className={`${styles.shimmer} ${styles.authorLine}`} />
        <div className={`${styles.shimmer} ${styles.metaLine}`} />
        <div className={styles.actionRow}>
          <div className={`${styles.shimmer} ${styles.actionBtn}`} />
          <div className={`${styles.shimmer} ${styles.actionBtn}`} />
          <div className={`${styles.shimmer} ${styles.remixBtn}`} />
        </div>
      </div>
    </div>
  );
}
