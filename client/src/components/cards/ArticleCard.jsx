import { useAppContext } from '../../hooks/useAppContext';
import styles from './ArticleCard.module.css';

function estimateReadTime(text) {
  const words = (text || '').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function formatDate(iso) {
  if (!iso) return '';
  try {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(iso));
  } catch {
    return '';
  }
}

const SOURCE_LABELS = {
  suntimes: 'Chicago Sun-Times',
  wbez: 'WBEZ',
};

/**
 * ArticleCard — compact text-only card with blue top border for RSS articles.
 * @param {{ article: Article }} props
 */
export default function ArticleCard({ article }) {
  const { state, dispatch } = useAppContext();
  const isLiked = state.likedIds.has(article.id);
  const readTime = estimateReadTime(article.summary);
  const sourceName = SOURCE_LABELS[article.source] || article.source;

  function handleLike(e) {
    e.stopPropagation();
    dispatch({ type: 'TOGGLE_LIKE', payload: { id: article.id } });
  }

  function handleShare(e) {
    e.stopPropagation();
    dispatch({
      type: 'OPEN_SHARE_MODAL',
      payload: { url: article.url },
    });
  }

  return (
    <article className={styles.card}>
      <div className={styles.body}>
        {/* Source badge */}
        <div className={styles.sourceBadge}>
          <span className={`${styles.sourceLabel} ${styles[article.source]}`}>
            {article.source === 'wbez' ? '🎙' : '📰'} {sourceName}
          </span>
          <span className={styles.newsBadge}>NEWS</span>
        </div>

        {/* Title */}
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.titleLink}
        >
          <h3 className={styles.title}>{article.title}</h3>
        </a>

        {/* Summary */}
        {article.summary && (
          <p className={styles.summary}>{article.summary}</p>
        )}

        {/* Meta row + actions */}
        <div className={styles.footer}>
          <span className={styles.meta}>
            {readTime} min read · {formatDate(article.publishedAt)}
          </span>
          <div className={styles.actions}>
            <button
              className={`${styles.actionBtn} ${isLiked ? styles.liked : ''}`}
              onClick={handleLike}
              aria-label={isLiked ? 'Unlike' : 'Like'}
            >
              {isLiked ? '♥' : '♡'}
            </button>
            <button
              className={styles.actionBtn}
              onClick={handleShare}
              aria-label="Share"
            >
              ↗
            </button>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.readLink}
            >
              Read →
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
