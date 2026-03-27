import { useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { useRssFeed } from '../hooks/useRssFeed';
import { useCommunityAreas } from '../hooks/useCommunityAreas';

import FeedHero from '../components/feed/FeedHero';
import FeedDisclosure from '../components/feed/FeedDisclosure';
import NeighborhoodFilter from '../components/feed/NeighborhoodFilter';
import CategoryFilter from '../components/feed/CategoryFilter';
import GuideCard from '../components/cards/GuideCard';
import ArticleCard from '../components/cards/ArticleCard';
import SkeletonCard from '../components/cards/SkeletonCard';
import ShareModal from '../components/shared/ShareModal';

import styles from './FeedPage.module.css';

const PAGE_SIZE = 10;

// ── Feed ordering logic ─────────────────────────────────────────────────────
// Returns a flat ordered list of { type: 'guide'|'article', item } objects.
// Order: Editor's Picks → neighborhood-matched (by recency) → category-matched (by recency)
function buildFeed(guides, articles, selectedNeighborhoods, selectedCategories) {
  const toDate = iso => (iso ? new Date(iso).getTime() : 0);

  // Separate Editor's Picks from the rest
  const editorsPicks = guides.filter(g => g.isEditorsPick);
  const otherGuides = guides.filter(g => !g.isEditorsPick);

  // Neighborhood-matched (guides + articles) not already in Editor's Picks
  const neighborhoodGuides = otherGuides.filter(g =>
    selectedNeighborhoods.includes(g.neighborhood)
  );
  const neighborhoodArticles = articles.filter(a =>
    a.neighborhoods?.some(n => selectedNeighborhoods.includes(n))
  );

  // Category-matched guides not already included above
  const neighborhoodGuideIds = new Set(neighborhoodGuides.map(g => g.id));
  const editorIds = new Set(editorsPicks.map(g => g.id));
  const categoryGuides = otherGuides.filter(g =>
    !editorIds.has(g.id) &&
    !neighborhoodGuideIds.has(g.id) &&
    g.categories?.some(c => selectedCategories.includes(c))
  );

  // Remaining articles not already neighborhood-matched
  const neighborhoodArticleIds = new Set(neighborhoodArticles.map(a => a.id));
  const categoryArticles = articles.filter(a =>
    !neighborhoodArticleIds.has(a.id) &&
    a.neighborhoods?.some(n => selectedCategories.includes(n))
  );

  // Remaining guides and articles
  const includedGuideIds = new Set([
    ...editorIds,
    ...neighborhoodGuides.map(g => g.id),
    ...categoryGuides.map(g => g.id),
  ]);
  const remainingGuides = otherGuides.filter(g => !includedGuideIds.has(g.id));
  const includedArticleIds = new Set([
    ...neighborhoodArticles.map(a => a.id),
    ...categoryArticles.map(a => a.id),
  ]);
  const remainingArticles = articles.filter(a => !includedArticleIds.has(a.id));

  // Sort each tier by recency
  const sortByDate = arr => [...arr].sort((a, b) => toDate(b.createdAt || b.publishedAt) - toDate(a.createdAt || a.publishedAt));

  const tier1 = sortByDate(editorsPicks).map(g => ({ type: 'guide', item: g }));
  // Interleave neighborhood guides and articles by date
  const tier2 = sortByDate([
    ...neighborhoodGuides.map(g => ({ type: 'guide', item: g, date: toDate(g.createdAt) })),
    ...neighborhoodArticles.map(a => ({ type: 'article', item: a, date: toDate(a.publishedAt) })),
  ]).map(({ type, item }) => ({ type, item }));

  const tier3 = sortByDate([
    ...categoryGuides.map(g => ({ type: 'guide', item: g, date: toDate(g.createdAt) })),
    ...categoryArticles.map(a => ({ type: 'article', item: a, date: toDate(a.publishedAt) })),
  ]).map(({ type, item }) => ({ type, item }));

  const tier4 = [
    ...sortByDate(remainingGuides).map(g => ({ type: 'guide', item: g })),
    ...sortByDate(remainingArticles).map(a => ({ type: 'article', item: a })),
  ];

  return [...tier1, ...tier2, ...tier3, ...tier4];
}

// ── "From the Newsroom" grouping ────────────────────────────────────────────
// Groups consecutive article entries (2+) under a section subheader.
// Returns an array of render instructions: 'guide', 'article', or 'newsroom-group'.
function groupForNewsroom(feedItems) {
  const result = [];
  let i = 0;

  while (i < feedItems.length) {
    if (feedItems[i].type === 'article') {
      // Look ahead for consecutive articles
      let j = i;
      while (j < feedItems.length && feedItems[j].type === 'article') j++;
      const run = feedItems.slice(i, j);
      if (run.length >= 2) {
        result.push({ type: 'newsroom-group', items: run });
      } else {
        result.push(run[0]); // lone article — no subheader
      }
      i = j;
    } else {
      result.push(feedItems[i]);
      i++;
    }
  }

  return result;
}

export default function FeedPage() {
  useRssFeed();
  useCommunityAreas();

  const { state, dispatch } = useAppContext();
  const { guides, articles, articlesLoading, feedPreferences } = state;
  const { selectedNeighborhoods, selectedCategories } = feedPreferences;

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const allFeedItems = buildFeed(guides, articles, selectedNeighborhoods, selectedCategories);
  const grouped = groupForNewsroom(allFeedItems);
  const visibleGrouped = grouped.slice(0, visibleCount);

  const hasMore = visibleCount < grouped.length;
  const isEmpty = !articlesLoading && allFeedItems.length === 0;

  // Skeleton pattern: alternating guide/article skeletons
  const skeletonVariants = ['guide', 'guide', 'article', 'guide', 'article', 'guide'];

  return (
    <div className={styles.page}>
      <FeedHero />

      <div className={styles.layout}>
        {/* Main feed column */}
        <div className={styles.feedColumn}>
          <div className={styles.feedHeader}>
            <h1 className={styles.feedTitle}>Your Feed</h1>
            <FeedDisclosure />
          </div>

          {/* Skeleton loading state */}
          {articlesLoading && guides.length === 0 && (
            <div className={styles.feedList}>
              {skeletonVariants.map((v, i) => (
                <SkeletonCard key={i} variant={v} />
              ))}
            </div>
          )}

          {/* Empty state */}
          {isEmpty && (
            <div className={styles.emptyState}>
              <p>Nothing matches your current filters.</p>
              <button
                className={styles.clearFiltersBtn}
                onClick={() => {
                  selectedNeighborhoods.forEach(n =>
                    dispatch({ type: 'TOGGLE_NEIGHBORHOOD_FILTER', payload: { neighborhood: n } })
                  );
                  selectedCategories.forEach(c =>
                    dispatch({ type: 'TOGGLE_CATEGORY_FILTER', payload: { category: c } })
                  );
                }}
              >
                Clear filters
              </button>
            </div>
          )}

          {/* Feed items */}
          {!isEmpty && (
            <div className={styles.feedList}>
              {visibleGrouped.map((entry, idx) => {
                if (entry.type === 'guide') {
                  return <GuideCard key={entry.item.id} guide={entry.item} />;
                }
                if (entry.type === 'article') {
                  return <ArticleCard key={entry.item.id} article={entry.item} />;
                }
                if (entry.type === 'newsroom-group') {
                  return (
                    <div key={`newsroom-${idx}`} className={styles.newsroomGroup}>
                      <div className={styles.newsroomHeader}>
                        <span className={styles.newsroomLabel}>From the Newsroom</span>
                      </div>
                      {entry.items.map(a => (
                        <ArticleCard key={a.item.id} article={a.item} />
                      ))}
                    </div>
                  );
                }
                return null;
              })}

              {/* Skeleton for RSS articles still loading */}
              {articlesLoading && guides.length > 0 && (
                <>
                  <SkeletonCard variant="article" />
                  <SkeletonCard variant="article" />
                </>
              )}
            </div>
          )}

          {/* Load More */}
          {hasMore && (
            <div className={styles.loadMoreRow}>
              <button
                className={styles.loadMoreBtn}
                onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
              >
                Load more
              </button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <NeighborhoodFilter />
          <CategoryFilter />
        </aside>
      </div>

      <ShareModal />
    </div>
  );
}
