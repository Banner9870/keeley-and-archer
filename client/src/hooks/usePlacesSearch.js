// ============================================================
// usePlacesSearch.js — wraps Google Places Text Search API
// ============================================================
// Used in guide creation (Step 2) to search for places in Chicago.
//
// API: POST https://places.googleapis.com/v1/places:searchText
// Key: VITE_GOOGLE_PLACES_API_KEY (client-side env var)
//
// Field mask is deliberately narrow to control cost:
//   places.id, displayName, formattedAddress, types,
//   rating, userRatingCount, photos, location
//
// Chicago bounding box is applied as a locationBias so results
// stay geographically relevant without hard-filtering out suburbs.
// ============================================================

import { useState, useCallback } from 'react';

const API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY || '';
const PLACES_URL = 'https://places.googleapis.com/v1/places:searchText';

// Chicago bounding box (locationBias — soft constraint, not a hard filter)
const CHICAGO_LOCATION_BIAS = {
  rectangle: {
    low:  { latitude: 41.6445, longitude: -87.9401 },
    high: { latitude: 42.0230, longitude: -87.5240 },
  },
};

// Field mask for Text Search — cost-controlled, no Pro-tier fields.
const FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.types',
  'places.rating',
  'places.userRatingCount',
  'places.photos',
  'places.location',
].join(',');

// Map Google place types to our PlaceCategory enum.
function inferCategory(types = []) {
  if (types.some(t => ['restaurant', 'food', 'meal_takeaway', 'meal_delivery'].includes(t))) return 'restaurant';
  if (types.some(t => ['cafe', 'bakery'].includes(t))) return 'cafe';
  if (types.some(t => ['bar', 'night_club'].includes(t))) return 'bar';
  if (types.some(t => ['concert_hall', 'music_venue'].includes(t))) return 'music_venue';
  if (types.some(t => ['park', 'campground', 'natural_feature'].includes(t))) return 'park';
  if (types.some(t => ['museum', 'art_gallery', 'library', 'movie_theater', 'stadium'].includes(t))) return 'cultural_institution';
  if (types.some(t => ['store', 'shopping_mall', 'clothing_store', 'book_store'].includes(t))) return 'shop';
  return 'other';
}

// Normalize a Places API result into the app's Place shape.
function normalizePlace(place) {
  return {
    id: `place-${place.id}`,
    placeId: place.id || null,
    name: place.displayName?.text || '',
    address: place.formattedAddress || '',
    neighborhood: '',          // populated manually by the user in guide creation
    category: inferCategory(place.types),
    rating: place.rating ?? null,
    ratingCount: place.userRatingCount ?? null,
    editorNote: '',            // filled in by user in guide creation
    coverImage: null,          // photo URL fetched separately if needed
    lat: place.location?.latitude ?? null,
    lng: place.location?.longitude ?? null,
  };
}

/**
 * usePlacesSearch()
 *
 * Returns { results, loading, error, search, clear }
 *
 * - search(query)  — triggers an API call; updates results/loading/error
 * - clear()        — resets all state (e.g. when the user clears the input)
 */
export function usePlacesSearch() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const search = useCallback(async (query) => {
    if (!query || !query.trim()) {
      setResults([]);
      return;
    }

    if (!API_KEY) {
      setError('Places API key is not configured.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(PLACES_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': API_KEY,
          'X-Goog-FieldMask': FIELD_MASK,
        },
        body: JSON.stringify({
          textQuery: `${query} Chicago`,
          locationBias: CHICAGO_LOCATION_BIAS,
          maxResultCount: 10,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error?.message || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const places = (data.places || []).map(normalizePlace);
      setResults(places);
    } catch (err) {
      console.error('usePlacesSearch error:', err.message);
      // Per requirements: show "Search unavailable — try a different term" inline.
      setError('Search unavailable — try a different term.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setResults([]);
    setError(null);
    setLoading(false);
  }, []);

  return { results, loading, error, search, clear };
}
