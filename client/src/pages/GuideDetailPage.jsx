import { useParams, Navigate, Link } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import GuideHero from '../components/guide/GuideHero';
import PlaceListItem from '../components/guide/PlaceListItem';
import RemixAttribution from '../components/guide/RemixAttribution';
import LeafletMap from '../components/shared/LeafletMap';
import ShareModal from '../components/shared/ShareModal';
import styles from './GuideDetailPage.module.css';

export default function GuideDetailPage() {
  const { id } = useParams();
  const { state, dispatch } = useAppContext();

  const guide = state.guides.find(g => g.id === id);

  // Task 5.18 — guide not found → redirect to feed
  if (!guide) {
    return <Navigate to="/feed" replace />;
  }

  const author = state.users.find(u => u.id === guide.authorId);
  const originalGuide = guide.remixOf
    ? state.guides.find(g => g.id === guide.remixOf)
    : null;
  const originalAuthor = originalGuide
    ? state.users.find(u => u.id === originalGuide.authorId)
    : null;

  const isLiked = state.likedIds.has(guide.id);
  const isSaved = state.savedIds.has(guide.id);

  function handleLike() {
    dispatch({ type: 'TOGGLE_LIKE', payload: { id: guide.id } });
  }

  function handleSave() {
    dispatch({ type: 'TOGGLE_SAVE', payload: { id: guide.id } });
  }

  function handleShare() {
    dispatch({
      type: 'OPEN_SHARE_MODAL',
      payload: { url: `${window.location.origin}/guide/${guide.id}` },
    });
  }

  return (
    <div className={styles.page}>
      {/* Hero — full-width cover image with title overlay */}
      <GuideHero guide={guide} author={author} />

      {/* Action bar */}
      <div className={styles.actionBar}>
        <div className={styles.actionGroup}>
          <button
            className={`${styles.actionBtn} ${isLiked ? styles.liked : ''}`}
            onClick={handleLike}
            aria-label={isLiked ? 'Unlike' : 'Like'}
          >
            {isLiked ? '♥' : '♡'} {guide.likeCount} Likes
          </button>
          <button
            className={`${styles.actionBtn} ${isSaved ? styles.saved : ''}`}
            onClick={handleSave}
            aria-label={isSaved ? 'Unsave' : 'Save'}
          >
            {isSaved ? '★' : '☆'} Save
          </button>
          <button className={styles.actionBtn} onClick={handleShare} aria-label="Share">
            ↗ Share
          </button>
          {author && (
            <button className={styles.actionBtn} aria-label={`Follow ${author.displayName}`}>
              + Follow {author.displayName?.split(' ')[0]}
            </button>
          )}
        </div>
        <Link to={`/guide/${guide.id}/remix`} className={styles.remixBtn}>
          ✦ Remix this guide
        </Link>
      </div>

      <div className={styles.layout}>
        {/* Main content column */}
        <div className={styles.mainCol}>
          {/* Description */}
          {guide.description && (
            <div className={styles.descriptionBlock}>
              <p className={styles.description}>{guide.description}</p>
            </div>
          )}

          {/* Remix attribution */}
          {originalGuide && (
            <RemixAttribution originalGuide={originalGuide} originalAuthor={originalAuthor} />
          )}

          {/* Map (mobile: here; desktop: sidebar) */}
          <div className={styles.mobileMap}>
            <h2 className={styles.sectionHeading}>Map</h2>
            <LeafletMap places={guide.places} />
          </div>

          {/* Places list */}
          <div className={styles.placesSection}>
            <h2 className={styles.sectionHeading}>
              Places in this guide
              <span className={styles.placeCount}>{guide.places?.length || 0}</span>
            </h2>
            <div className={styles.placesList}>
              {guide.places?.map((place, i) => (
                <PlaceListItem key={place.id || i} place={place} index={i} />
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar — desktop map */}
        <aside className={styles.sidebar}>
          <h2 className={styles.sectionHeading}>Map</h2>
          <LeafletMap places={guide.places} />

          {/* Stats */}
          <div className={styles.statsBlock}>
            <div className={styles.stat}>
              <span className={styles.statValue}>{guide.likeCount}</span>
              <span className={styles.statLabel}>Likes</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>{guide.remixCount}</span>
              <span className={styles.statLabel}>Remixes</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>{guide.places?.length}</span>
              <span className={styles.statLabel}>Places</span>
            </div>
          </div>
        </aside>
      </div>

      <ShareModal />
    </div>
  );
}
