// ============================================================
// useCommunityAreas.js — loads all 77 Chicago community areas
// ============================================================
// Source: bundled static JSON/GeoJSON files committed to the repo.
// The community area list is static data — no API call needed.
// GeoJSON is fetched from the bundled file URL (too large to inline
// as a JS module, but served instantly as a local static asset).
// ============================================================

import { useEffect } from 'react';
import { useAppContext } from './useAppContext';
import fallbackTabular from '../data/neighborhoods-fallback.json';
// .geojson is not a natively resolved JSON type in Vite — import as URL and fetch at runtime.
import fallbackGeoJSONUrl from '../data/neighborhoods-fallback.geojson?url';

// Convert "LINCOLN SQUARE" → "Lincoln Square"
function toTitleCase(str) {
  return str
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase());
}

// Normalize a Socrata-format row into the shape the app uses.
function normalizeArea(row) {
  const rawName = row.community || '';
  return {
    id: row.area_numbe || row.area_num_1 || '',
    name: toTitleCase(rawName),
    nameUpper: rawName,          // kept for Big Shoulders Display headings
    slug: rawName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    areaNumber: parseInt(row.area_numbe || row.area_num_1 || '0', 10),
  };
}

export function useCommunityAreas() {
  const { state, dispatch } = useAppContext();

  useEffect(() => {
    // Only load once per session.
    if (state.communityAreas.length > 0 || state.communityAreasLoading) return;

    let cancelled = false;

    async function load() {
      dispatch({ type: 'SET_COMMUNITY_AREAS_LOADING' });

      // Tabular data is bundled — normalize synchronously.
      const areas = fallbackTabular.map(normalizeArea).sort((a, b) =>
        a.name.localeCompare(b.name)
      );

      // GeoJSON is too large to bundle as JS; fetch from the static asset URL.
      let geoJSON = null;
      try {
        const res = await fetch(fallbackGeoJSONUrl);
        if (!cancelled && res.ok) geoJSON = await res.json();
      } catch {
        // GeoJSON unavailable — maps degrade gracefully (no boundary polygon).
      }

      if (!cancelled) {
        dispatch({ type: 'LOAD_COMMUNITY_AREAS', payload: { areas, geoJSON } });
      }
    }

    load();
    return () => { cancelled = true; };
  }, [state.communityAreas.length, state.communityAreasLoading, dispatch]);
}
