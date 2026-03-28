import { useState, useMemo } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { useCommunityAreas } from '../hooks/useCommunityAreas';
import { useRssFeed } from '../hooks/useRssFeed';
import GuideCard from '../components/cards/GuideCard';
import ArticleCard from '../components/cards/ArticleCard';
import ExploreMap from '../components/neighborhood/ExploreMap';
import fallbackTabular from '../data/neighborhoods-fallback.json';
import styles from './ExplorePage.module.css';

// Build neighborhood list from bundled static JSON — always available immediately.
function toTitleCase(str) {
  return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

function toSlug(name) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

const ALL_NEIGHBORHOODS = fallbackTabular
  .map(row => ({
    id: row.area_numbe || row.area_num_1 || '',
    name: toTitleCase(row.community),
    slug: toSlug(row.community),
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

export default function ExplorePage() {
  useCommunityAreas();
  useRssFeed();
  const { state } = useAppContext();
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();

  // Slugs matching the search query — used to highlight polygons on the map
  const filterSlugs = useMemo(() => {
    if (!q) return null;
    const matched = ALL_NEIGHBORHOODS
      .filter(area => area.name.toLowerCase().includes(q))
      .map(area => area.slug);
    return matched.length > 0 ? new Set(matched) : null;
  }, [q]);

  // Newsroom = journalist-authored guides, filtered by query
  const journalistIds = useMemo(
    () => new Set(state.users.filter(u => u.isJournalist).map(u => u.id)),
    [state.users]
  );

  const newsroomGuides = useMemo(() => {
    const guides = state.guides.filter(g => journalistIds.has(g.authorId));
    if (!q) return guides;
    return guides.filter(g =>
      g.title.toLowerCase().includes(q) ||
      g.neighborhood.toLowerCase().includes(q)
    );
  }, [state.guides, journalistIds, q]);

  // Newsroom articles, filtered by query
  const newsroomArticles = useMemo(() => {
    if (!q) return state.articles.slice(0, 4);
    return state.articles
      .filter(a =>
        a.title.toLowerCase().includes(q) ||
        (a.summary || '').toLowerCase().includes(q)
      )
      .slice(0, 4);
  }, [state.articles, q]);

  const hasNewsroom = newsroomGuides.length > 0 || newsroomArticles.length > 0;

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <h1 className={styles.heading}>EXPLORE CHICAGO</h1>

        {/* Search bar */}
        <div className={styles.searchBar}>
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Search neighborhoods, guides..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            aria-label="Search neighborhoods and guides"
          />
          {query && (
            <button
              className={styles.clearBtn}
              onClick={() => setQuery('')}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* From the newsroom — above the map */}
        {hasNewsroom && (
          <section className={styles.section}>
            <h2 className={styles.sectionHeadingBlue}>FROM THE NEWSROOM</h2>
            {newsroomGuides.length > 0 && (
              <div className={styles.guideGrid}>
                {newsroomGuides.map(guide => (
                  <GuideCard key={guide.id} guide={guide} />
                ))}
              </div>
            )}
            {newsroomArticles.length > 0 && (
              <div className={styles.articleGrid}>
                {newsroomArticles.map(article => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Browse by neighborhood — interactive map */}
        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>BROWSE BY NEIGHBORHOOD</h2>
          <p className={styles.mapHint}>Click any neighborhood to explore its guides.</p>
          <ExploreMap
            geoJSON={state.communityAreasGeoJSON}
            filterSlugs={filterSlugs}
          />
        </section>
      </div>
    </div>
  );
}
