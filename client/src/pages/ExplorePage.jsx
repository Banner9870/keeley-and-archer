import { useState, useMemo } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { useCommunityAreas } from '../hooks/useCommunityAreas';
import { useRssFeed } from '../hooks/useRssFeed';
import GuideCard from '../components/cards/GuideCard';
import ArticleCard from '../components/cards/ArticleCard';
import NeighborhoodCard from '../components/cards/NeighborhoodCard';
import fallbackTabular from '../data/neighborhoods-fallback.json';
import styles from './ExplorePage.module.css';

// Build neighborhood list from bundled static JSON — always available immediately.
function toTitleCase(str) {
  return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

const ALL_NEIGHBORHOODS = fallbackTabular
  .map(row => ({
    id: row.area_numbe || row.area_num_1 || '',
    name: toTitleCase(row.community),
    nameUpper: row.community,
    slug: row.community.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    areaNumber: parseInt(row.area_numbe || row.area_num_1 || '0', 10),
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

export default function ExplorePage() {
  useCommunityAreas();
  useRssFeed();
  const { state } = useAppContext();
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();

  // Filter neighborhood grid by search query
  const filteredNeighborhoods = useMemo(() => {
    if (!q) return ALL_NEIGHBORHOODS;
    return ALL_NEIGHBORHOODS.filter(area =>
      area.name.toLowerCase().includes(q)
    );
  }, [q]);

  // Guide count per neighborhood for card labels
  const guideCountByNeighborhood = useMemo(() => {
    const counts = {};
    state.guides.forEach(g => {
      counts[g.neighborhood] = (counts[g.neighborhood] || 0) + 1;
    });
    return counts;
  }, [state.guides]);

  // Trending = Editor's Picks, filtered by query
  const trendingGuides = useMemo(() => {
    const picks = state.guides.filter(g => g.isEditorsPick);
    if (!q) return picks.slice(0, 8);
    return picks
      .filter(g =>
        g.title.toLowerCase().includes(q) ||
        g.neighborhood.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [state.guides, q]);

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

        {/* Browse by neighborhood */}
        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>BROWSE BY NEIGHBORHOOD</h2>
          {filteredNeighborhoods.length === 0 ? (
            <p className={styles.noResults}>
              No neighborhoods match &ldquo;{query}&rdquo;.
            </p>
          ) : (
            <div className={styles.neighborhoodGrid}>
              {filteredNeighborhoods.map(area => (
                <NeighborhoodCard
                  key={area.id}
                  area={area}
                  guideCount={guideCountByNeighborhood[area.name] || 0}
                />
              ))}
            </div>
          )}
        </section>

        {/* Trending guides */}
        {trendingGuides.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionHeading}>TRENDING GUIDES</h2>
            <div className={styles.guideGrid}>
              {trendingGuides.map(guide => (
                <GuideCard key={guide.id} guide={guide} />
              ))}
            </div>
          </section>
        )}

        {/* From the newsroom */}
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
      </div>
    </div>
  );
}
