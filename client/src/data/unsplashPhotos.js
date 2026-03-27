// ============================================================
// unsplashPhotos.js — curated photo list for PhotoPicker
// Used in guide creation (Step 1) to let users pick a cover image.
// Uses picsum.photos/seed/{seed}/800/500 — deterministic per seed,
// no API key required, 100% reliable for prototype use.
// ============================================================

export const unsplashPhotos = [
  // Chicago skyline / architecture (5)
  { id: 'arch-1', url: 'https://picsum.photos/seed/chicago-skyline/800/500', alt: 'Chicago skyline at night' },
  { id: 'arch-2', url: 'https://picsum.photos/seed/chicago-loop-elevated/800/500', alt: 'Chicago elevated train and urban buildings' },
  { id: 'arch-3', url: 'https://picsum.photos/seed/chicago-downtown/800/500', alt: 'Downtown Chicago buildings' },
  { id: 'arch-4', url: 'https://picsum.photos/seed/chicago-riverwalk/800/500', alt: 'Chicago River and bridges' },
  { id: 'arch-5', url: 'https://picsum.photos/seed/chicago-bridge/800/500', alt: 'Chicago bridge and waterway' },

  // Neighborhood streets (4)
  { id: 'nbhd-1', url: 'https://picsum.photos/seed/chicago-neighborhood/800/500', alt: 'Chicago neighborhood street scene' },
  { id: 'nbhd-2', url: 'https://picsum.photos/seed/chicago-street/800/500', alt: 'Chicago street life' },
  { id: 'nbhd-3', url: 'https://picsum.photos/seed/chicago-mural/800/500', alt: 'Colorful mural in a Chicago neighborhood' },
  { id: 'nbhd-4', url: 'https://picsum.photos/seed/chicago-community/800/500', alt: 'Chicago community scene' },

  // Food / restaurant interiors (5)
  { id: 'food-1', url: 'https://picsum.photos/seed/chicago-food/800/500', alt: 'Chicago food scene' },
  { id: 'food-2', url: 'https://picsum.photos/seed/chicago-restaurant/800/500', alt: 'Chicago restaurant interior' },
  { id: 'food-3', url: 'https://picsum.photos/seed/chicago-pizza/800/500', alt: 'Chicago deep dish pizza' },
  { id: 'food-4', url: 'https://picsum.photos/seed/chicago-brunch/800/500', alt: 'Brunch spread' },
  { id: 'food-5', url: 'https://picsum.photos/seed/chicago-coffee/800/500', alt: 'Chicago coffee shop' },

  // Parks / lakefront (4)
  { id: 'park-1', url: 'https://picsum.photos/seed/chicago-park/800/500', alt: 'Chicago park in summer' },
  { id: 'park-2', url: 'https://picsum.photos/seed/chicago-lake/800/500', alt: 'Lake Michigan view' },
  { id: 'park-3', url: 'https://picsum.photos/seed/chicago-beach/800/500', alt: 'Chicago lakefront beach' },
  { id: 'park-4', url: 'https://picsum.photos/seed/chicago-nature/800/500', alt: 'Chicago greenery and open space' },

  // Music / nightlife (3)
  { id: 'music-1', url: 'https://picsum.photos/seed/chicago-music/800/500', alt: 'Chicago live music venue' },
  { id: 'music-2', url: 'https://picsum.photos/seed/chicago-jazz/800/500', alt: 'Chicago jazz club' },
  { id: 'music-3', url: 'https://picsum.photos/seed/chicago-nightlife/800/500', alt: 'Chicago nightlife' },
];
