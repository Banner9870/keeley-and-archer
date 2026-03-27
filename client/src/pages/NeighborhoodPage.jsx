import { useParams, Link } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import { useCommunityAreas } from '../hooks/useCommunityAreas';
import { useRssFeed } from '../hooks/useRssFeed';

import NeighborhoodMap from '../components/neighborhood/NeighborhoodMap';
import NeighborhoodStats from '../components/neighborhood/NeighborhoodStats';
import GuideCard from '../components/cards/GuideCard';
import ArticleCard from '../components/cards/ArticleCard';
import SkeletonCard from '../components/cards/SkeletonCard';
import StarIcon from '../components/shared/StarIcon';
import ShareModal from '../components/shared/ShareModal';

import styles from './NeighborhoodPage.module.css';

// Keyword-match article to neighborhood name
function articleMatchesNeighborhood(article, neighborhoodName) {
  const needle = neighborhoodName.toLowerCase();
  const haystack = `${article.title} ${article.summary}`.toLowerCase();
  return haystack.includes(needle);
}

export default function NeighborhoodPage() {
  const { slug } = useParams();
  useCommunityAreas();
  useRssFeed();

  const { state } = useAppContext();
  const { communityAreas, communityAreasGeoJSON, communityAreasLoading, guides, articles } = state;

  // Find the community area by slug
  const area = communityAreas.find(a => a.slug === slug);

  // Normalize to title-case display name
  const displayName = area?.name || slug?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || '';

  // Filter guides for this neighborhood
  const neighborhoodGuides = guides.filter(
    g => g.neighborhood.toLowerCase() === displayName.toLowerCase()
  );

  // Filter articles by keyword match
  const neighborhoodArticles = articles.filter(a =>
    articleMatchesNeighborhood(a, displayName)
  );

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          {area && (
            <span className={styles.areaNumber}>Area #{area.areaNumber || area.id}</span>
          )}
          <h1 className={styles.name}>{displayName.toUpperCase()}</h1>
          <button className={styles.followBtn} aria-label={`Follow ${displayName}`}>
            + Follow this neighborhood
          </button>
        </div>
      </div>

      {/* Map */}
      <section className={styles.section}>
        <NeighborhoodMap
          geoJSON={communityAreasGeoJSON}
          slug={slug}
          name={displayName}
        />
      </section>

      {/* Stats */}
      <section className={styles.section}>
        <NeighborhoodStats area={area} />
      </section>

      {/* Guides about this neighborhood */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <StarIcon size={14} color="var(--red)" />
          Guides about {displayName}
        </h2>

        {communityAreasLoading && neighborhoodGuides.length === 0 ? (
          <div className={styles.cardGrid}>
            <SkeletonCard variant="guide" />
            <SkeletonCard variant="guide" />
          </div>
        ) : neighborhoodGuides.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No guides yet for {displayName}. Be the first to create one.</p>
            <Link to="/guide/new" className={styles.createCta}>
              + Create a guide
            </Link>
          </div>
        ) : (
          <div className={styles.cardGrid}>
            {neighborhoodGuides.map(guide => (
              <GuideCard key={guide.id} guide={guide} />
            ))}
          </div>
        )}
      </section>

      {/* From the newsroom — RSS articles */}
      {neighborhoodArticles.length > 0 && (
        <section className={styles.section}>
          <div className={styles.newsroomHeader}>
            <span className={styles.newsroomLabel}>From the Newsroom</span>
          </div>
          <div className={styles.articleList}>
            {neighborhoodArticles.map(article => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </section>
      )}

      <ShareModal />
    </div>
  );
}
