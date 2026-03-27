// ============================================================
// useRssFeed.js — fetches and merges RSS articles from both sources
// ============================================================
// Calls the Express proxy (/api/rss) rather than hitting RSS URLs
// directly — avoids CORS issues entirely.
//
// VITE_API_BASE_URL controls where requests go:
//   - Local dev: empty string → Vite proxy forwards /api/* to Express
//   - Railway:   set to Express service URL (e.g. https://server.railway.app)
// ============================================================

import { useEffect } from 'react';
import { useAppContext } from './useAppContext';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

async function fetchSource(source) {
  const res = await fetch(`${BASE_URL}/api/rss?source=${source}`);
  if (!res.ok) throw new Error(`RSS fetch failed: ${source}`);
  return res.json();
}

export function useRssFeed() {
  const { dispatch } = useAppContext();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      dispatch({ type: 'SET_ARTICLES_LOADING' });

      try {
        // Fetch both sources in parallel; treat each failure independently.
        const [suntimesResult, wbezResult] = await Promise.allSettled([
          fetchSource('suntimes'),
          fetchSource('wbez'),
        ]);

        if (cancelled) return;

        const suntimesArticles =
          suntimesResult.status === 'fulfilled' ? suntimesResult.value : [];
        const wbezArticles =
          wbezResult.status === 'fulfilled' ? wbezResult.value : [];

        // Merge and sort by publishedAt descending (most recent first).
        const merged = [...suntimesArticles, ...wbezArticles].sort((a, b) => {
          const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
          const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
          return dateB - dateA;
        });

        dispatch({ type: 'LOAD_ARTICLES', payload: { articles: merged } });
      } catch (err) {
        if (cancelled) return;
        console.error('useRssFeed: unexpected error', err);
        // Per spec: RSS failure is silent — dispatch error state and let
        // the feed render guides only. No error message shown to user.
        dispatch({ type: 'SET_ARTICLES_ERROR' });
      }
    }

    load();
    return () => { cancelled = true; };
  }, [dispatch]);
}
