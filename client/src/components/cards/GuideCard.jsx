import { Link } from 'react-router-dom';
import { useAppContext } from '../../hooks/useAppContext';
import StarIcon from '../shared/StarIcon';
import NeighborhoodTag from '../shared/NeighborhoodTag';
import styles from './GuideCard.module.css';

const MAPS_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY || '';

function getStaticMapUrl(place) {
  if (!place?.lat || !place?.lng || !MAPS_KEY) return null;
  return `https://maps.googleapis.com/maps/api/staticmap?center=${place.lat},${place.lng}&zoom=15&size=600x340&maptype=roadmap&key=${MAPS_KEY}`;
}

/**
 * GuideCard — the tall card with cover photo, used in feed and grids.
 * @param {{ guide: Guide, showRemixButton?: boolean }} props
 */
export default function GuideCard({ guide, showRemixButton = true }) {
  const { state, dispatch } = useAppContext();
  const isLiked = state.likedIds.has(guide.id);

  const author = state.users.find(u => u.id === guide.authorId);
  const authorHandle = author
    ? (author.isJournalist
        ? `@${author.handle}.${author.publication === 'WBEZ' ? 'wbez.org' : 'suntimes.com'}`
        : `@${author.handle}.chicago.com`)
    : '';

  const coverSrc = guide.coverImage || getStaticMapUrl(guide.places?.[0]);

  function handleLike(e) {
    e.preventDefault();
    dispatch({ type: 'TOGGLE_LIKE', payload: { id: guide.id } });
  }

  function handleShare(e) {
    e.preventDefault();
    dispatch({
      type: 'OPEN_SHARE_MODAL',
      payload: { url: `${window.location.origin}/guide/${guide.id}` },
    });
  }

  function handleSave(e) {
    e.preventDefault();
    dispatch({ type: 'TOGGLE_SAVE', payload: { id: guide.id } });
  }

  return (
    <article className={styles.card}>
      {/* Cover Image */}
      <Link to={`/guide/${guide.id}`} className={styles.imageLink} tabIndex={-1} aria-hidden="true">
        <div className={styles.imageWrapper}>
          {coverSrc ? (
            <img
              src={coverSrc}
              alt={`Cover image for ${guide.title}`}
              className={styles.coverImage}
              loading="lazy"
            />
          ) : (
            <div className={styles.imagePlaceholder} aria-hidden="true" />
          )}
          {/* GUIDE pill badge */}
          <span className={styles.guideBadge}>
            <StarIcon size={10} color="var(--white)" />
            {' '}GUIDE
          </span>
          {/* Editor's Pick badge */}
          {guide.isEditorsPick && (
            <span className={styles.editorsBadge}>
              <StarIcon size={10} color="var(--white)" />
              {' '}Editor's Pick
            </span>
          )}
        </div>
      </Link>

      {/* Card Body */}
      <div className={styles.body}>
        {/* Journalist badge */}
        {author?.isJournalist && (
          <div className={styles.newsBadge}>
            <StarIcon size={11} color="var(--red)" />
            <span>From the newsroom · {author.publication}</span>
          </div>
        )}

        <Link to={`/guide/${guide.id}`} className={styles.titleLink}>
          <h3 className={styles.title}>{guide.title}</h3>
        </Link>

        {/* Author identity block */}
        <div className={styles.authorBlock}>
          <span className={styles.authorName}>{author?.displayName || 'Unknown'}</span>
          <span className={styles.authorHandle}>{authorHandle}</span>
        </div>

        {/* Secondary info */}
        <div className={styles.meta}>
          <span className={styles.placeCount}>
            📍 {guide.places?.length || 0} place{guide.places?.length !== 1 ? 's' : ''}
          </span>
          <span className={styles.metaDot}>·</span>
          <NeighborhoodTag name={guide.neighborhood} />
        </div>

        {/* Action row */}
        <div className={styles.actions}>
          <button
            className={`${styles.actionBtn} ${isLiked ? styles.liked : ''}`}
            onClick={handleLike}
            aria-label={isLiked ? 'Unlike' : 'Like'}
          >
            {isLiked ? '♥' : '♡'} {guide.likeCount}
          </button>
          <button
            className={styles.actionBtn}
            onClick={handleShare}
            aria-label="Share"
          >
            ↗ Share
          </button>
          <button
            className={`${styles.actionBtn} ${state.savedIds.has(guide.id) ? styles.saved : ''}`}
            onClick={handleSave}
            aria-label={state.savedIds.has(guide.id) ? 'Unsave' : 'Save'}
          >
            {state.savedIds.has(guide.id) ? '★' : '☆'} Save
          </button>
          {showRemixButton && (
            <Link
              to={`/guide/${guide.id}/remix`}
              className={styles.remixBtn}
              aria-label={`Remix: ${guide.title}`}
            >
              Remix →
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
