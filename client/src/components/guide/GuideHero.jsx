import { Link } from 'react-router-dom';
import StarIcon from '../shared/StarIcon';
import styles from './GuideHero.module.css';

const MAPS_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY || '';

function getStaticMapUrl(place) {
  if (!place?.lat || !place?.lng || !MAPS_KEY) return null;
  return `https://maps.googleapis.com/maps/api/staticmap?center=${place.lat},${place.lng}&zoom=14&size=1200x400&maptype=roadmap&key=${MAPS_KEY}`;
}

/**
 * GuideHero — full-width cover image with gradient scrim, title overlay,
 * and author block below.
 * @param {{ guide: Guide, author: User }} props
 */
export default function GuideHero({ guide, author }) {
  const coverSrc = guide.coverImage || getStaticMapUrl(guide.places?.[0]);

  const authorHandle = author
    ? (author.isJournalist
        ? `@${author.handle}.${author.publication === 'WBEZ' ? 'wbez.org' : 'suntimes.com'}`
        : `@${author.handle}.chicago.com`)
    : '';

  return (
    <div className={styles.hero}>
      {/* Cover image with gradient scrim */}
      <div className={styles.imageWrapper}>
        {coverSrc ? (
          <img
            src={coverSrc}
            alt={`Cover image for ${guide.title}`}
            className={styles.coverImage}
          />
        ) : (
          <div className={styles.imagePlaceholder} />
        )}
        <div className={styles.scrim} aria-hidden="true" />

        {/* Title overlaid on image */}
        <div className={styles.overlay}>
          <div className={styles.badges}>
            <span className={styles.guideBadge}>
              <StarIcon size={10} color="var(--white)" />
              {' '}GUIDE
            </span>
            {guide.isEditorsPick && (
              <span className={styles.editorsBadge}>
                <StarIcon size={10} color="var(--white)" />
                {' '}Editor's Pick
              </span>
            )}
          </div>
          <h1 className={styles.title}>{guide.title}</h1>
        </div>
      </div>

      {/* Author block below image */}
      <div className={styles.authorBlock}>
        <div className={styles.authorInfo}>
          <span className={styles.authorName}>{author?.displayName || 'Unknown'}</span>
          <span className={styles.authorHandle}>{authorHandle}</span>
          {author?.isJournalist && (
            <span className={styles.newsBadge}>
              <StarIcon size={11} color="var(--red)" />
              {' '}From the newsroom · {author.publication}
            </span>
          )}
        </div>
        <div className={styles.meta}>
          <span>📍 {guide.places?.length || 0} places</span>
          <span>·</span>
          <span>{guide.neighborhood}</span>
          <span>·</span>
          <span>{guide.categories?.join(', ')}</span>
        </div>
      </div>
    </div>
  );
}
