// ============================================================
// useCommunityAreas.js — loads all 77 Chicago community areas
// ============================================================
// Primary source: Socrata API (City of Chicago Data Portal)
//   - Tabular JSON:  community area names + IDs
//   - GeoJSON:       polygon boundaries for Leaflet maps
// Fallback: bundled static JSON files committed to the repo
//   (used when Socrata is unreachable or token is absent)
// ============================================================

import { useEffect } from 'react';
import { useAppContext } from './useAppContext';
import fallbackTabular from '../data/neighborhoods-fallback.json';
// .geojson is not a natively resolved JSON type in Vite — import as URL and fetch at runtime.
import fallbackGeoJSONUrl from '../data/neighborhoods-fallback.geojson?url';

const SOCRATA_BASE = 'https://data.cityofchicago.org/resource/igwz-8jzy';
const APP_TOKEN = import.meta.env.VITE_CHICAGO_DATA_PORTAL_TOKEN || '';
const TOKEN_PARAM = APP_TOKEN ? `?$$app_token=${APP_TOKEN}` : '';

// Convert "LINCOLN SQUARE" → "Lincoln Square"
function toTitleCase(str) {
  return str
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase());
}

// Normalize a raw Socrata row into the shape the app uses.
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
    // Only fetch once per session.
    if (state.communityAreas.length > 0 || state.communityAreasLoading) return;

    let cancelled = false;

    async function load() {
      dispatch({ type: 'SET_COMMUNITY_AREAS_LOADING' });

      try {
        // Fetch tabular and GeoJSON in parallel.
        const [tabularRes, geoRes] = await Promise.all([
          fetch(`${SOCRATA_BASE}.json${TOKEN_PARAM}`),
          fetch(`${SOCRATA_BASE}.geojson${TOKEN_PARAM}`),
        ]);

        if (cancelled) return;

        if (!tabularRes.ok || !geoRes.ok) {
          throw new Error('Socrata returned non-OK status');
        }

        const [tabularData, geoJSON] = await Promise.all([
          tabularRes.json(),
          geoRes.json(),
        ]);

        if (cancelled) return;

        const areas = tabularData.map(normalizeArea).sort((a, b) =>
          a.name.localeCompare(b.name)
        );

        dispatch({
          type: 'LOAD_COMMUNITY_AREAS',
          payload: { areas, geoJSON },
        });
      } catch (err) {
        if (cancelled) return;
        console.warn('useCommunityAreas: Socrata unavailable, using fallback.', err.message);

        // Use bundled static fallback data.
        const areas = fallbackTabular.map(normalizeArea).sort((a, b) =>
          a.name.localeCompare(b.name)
        );

        // Fetch GeoJSON via URL (imported with ?url to avoid Vite bundling a 674KB file as JS).
        let geoJSON = null;
        try {
          const geoRes = await fetch(fallbackGeoJSONUrl);
          if (geoRes.ok) geoJSON = await geoRes.json();
        } catch {
          // GeoJSON unavailable — maps will degrade gracefully (no boundary polygon).
        }

        dispatch({
          type: 'LOAD_COMMUNITY_AREAS',
          payload: { areas, geoJSON },
        });
      }
    }

    load();
    return () => { cancelled = true; };
  }, [state.communityAreas.length, state.communityAreasLoading, dispatch]);
}
