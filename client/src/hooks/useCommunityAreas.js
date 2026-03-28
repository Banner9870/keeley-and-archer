// ============================================================
// useCommunityAreas.js — loads all 77 Chicago community areas
// ============================================================
// Source: bundled static JSON/GeoJSON files committed to the repo.
// GeoJSON is imported as a raw string and parsed once at module
// load time — no async fetch, no skeleton wait.
// ============================================================

import { useEffect } from 'react';
import { useAppContext } from './useAppContext';
import fallbackTabular from '../data/neighborhoods-fallback.json';
// Import as raw string and parse synchronously — eliminates the async fetch round trip.
import rawGeoJSON from '../data/neighborhoods-fallback.geojson?raw';

const STATIC_GEOJSON = JSON.parse(rawGeoJSON);

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
    if (state.communityAreas.length > 0) return;

    const areas = fallbackTabular.map(normalizeArea).sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    dispatch({ type: 'LOAD_COMMUNITY_AREAS', payload: { areas, geoJSON: STATIC_GEOJSON } });
  }, [state.communityAreas.length, dispatch]);
}
