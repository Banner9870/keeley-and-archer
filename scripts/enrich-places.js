#!/usr/bin/env node
// scripts/enrich-places.js
// One-time Places API enrichment for all seed places.
// Usage: node scripts/enrich-places.js > scripts/enrichment-data.json
// Requires: VITE_GOOGLE_PLACES_API_KEY in ../.env

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Read API key from .env
function readApiKey() {
  const envPath = join(__dirname, '..', '.env');
  const env = readFileSync(envPath, 'utf8');
  const match = env.match(/VITE_GOOGLE_PLACES_API_KEY=(.+)/);
  if (!match) throw new Error('VITE_GOOGLE_PLACES_API_KEY not found in .env');
  return match[1].trim();
}

const API_KEY = readApiKey();
const FIELD_MASK =
  'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.location';

// All 115 places: { id, query }
const PLACES = [
  // Guide 1 — The Essential Lincoln Square
  { id: 'place-001', query: 'The Warbler Cafe 4806 N Lincoln Ave Chicago' },
  { id: 'place-002', query: 'Merz Apothecary 4716 N Lincoln Ave Chicago' },
  { id: 'place-003', query: 'Chicago Brauhaus 4732 N Lincoln Ave Chicago' },
  { id: 'place-004', query: 'Old Town School of Folk Music 4544 N Lincoln Ave Chicago' },
  { id: 'place-005', query: 'Horner Park 2741 W Montrose Ave Chicago' },
  { id: 'place-006', query: 'Lincoln Restaurant 4008 N Lincoln Ave Chicago' },

  // Guide 2 — Late Night Lincoln Square (remix of guide-01)
  { id: 'place-007', query: 'Chicago Brauhaus 4732 N Lincoln Ave Chicago' },
  { id: 'place-008', query: 'The Rockwell Bar Grill 4632 N Rockwell St Chicago' },
  { id: 'place-009', query: 'Bistro Campagne 4518 N Lincoln Ave Chicago' },
  { id: 'place-010', query: 'Half Acre Beer Company Tap Room 4257 N Lincoln Ave Chicago' },

  // Guide 3 — Best Brunch in Logan Square
  { id: 'place-011', query: 'Lula Cafe 2537 N Kedzie Ave Chicago' },
  { id: 'place-012', query: 'Jam Logan Square 2040 N Western Ave Chicago' },
  { id: 'place-013', query: 'Bang Bang Pie Shop 2051 N California Ave Chicago' },
  { id: 'place-014', query: 'Longman and Eagle 2657 N Kedzie Ave Chicago' },
  { id: 'place-015', query: 'The Radler 2375 N Milwaukee Ave Chicago' },

  // Guide 4 — Logan Square With Kids (remix of guide-03)
  { id: 'place-016', query: 'Bang Bang Pie Shop 2051 N California Ave Chicago' },
  { id: 'place-017', query: 'Palmer Square Park 2200 N Kedzie Blvd Chicago' },
  { id: 'place-018', query: 'Logan Square Farmers Market 3107 W Logan Blvd Chicago' },
  { id: 'place-019', query: 'Chicago Public Library Logan Square Branch 3030 W Fullerton Ave Chicago' },

  // Guide 5 — Pilsen Art Walk
  { id: 'place-020', query: 'National Museum of Mexican Art 1852 W 19th St Chicago' },
  { id: 'place-021', query: 'Thalia Hall 1807 S Allport St Chicago' },
  { id: 'place-022', query: 'Pilsen Community Books 1102 W 18th St Chicago' },
  { id: 'place-023', query: 'HaiSous Vietnamese Kitchen 1800 S Carpenter St Chicago' },
  { id: 'place-024', query: 'Co-Prosperity Sphere 3219 S Morgan St Chicago' },
  { id: 'place-025', query: 'La Catrina Cafe 1011 W 18th St Chicago' },

  // Guide 6 — Pilsen After Dark (journalist: ellery)
  { id: 'place-026', query: 'Thalia Hall 1807 S Allport St Chicago' },
  { id: 'place-027', query: "Dusek's Board and Beer 1227 W 18th St Chicago" },
  { id: 'place-028', query: 'HaiSous Vietnamese Kitchen 1800 S Carpenter St Chicago' },
  { id: 'place-029', query: 'Nightwood Restaurant 2119 S Halsted St Chicago' },
  { id: 'place-030', query: 'The Skylark Bar 2149 S Halsted St Chicago' },

  // Guide 7 — Hyde Park Classics
  { id: 'place-031', query: 'Smart Museum of Art 5550 S Greenwood Ave Chicago' },
  { id: 'place-032', query: '57th Street Books 1301 E 57th St Chicago' },
  { id: 'place-033', query: 'Medici on 57th 1327 E 57th St Chicago' },
  { id: 'place-034', query: 'Promontory Point 5491 S Shore Dr Chicago' },
  { id: 'place-035', query: 'Hyde Park Art Center 5020 S Cornell Ave Chicago' },
  { id: 'place-036', query: 'Valois Restaurant 1518 E 53rd St Chicago' },

  // Guide 8 — Hyde Park Green Spaces (journalist: alkeefe)
  { id: 'place-037', query: 'Jackson Park 6401 S Stony Island Ave Chicago' },
  { id: 'place-038', query: 'Osaka Garden Jackson Park Chicago' },
  { id: 'place-039', query: 'Washington Park 5531 S Martin Luther King Dr Chicago' },
  { id: 'place-040', query: 'Midway Plaisance Park Chicago Hyde Park' },

  // Guide 9 — Wicker Park Record Stores & Bars
  { id: 'place-041', query: 'Reckless Records 1532 N Milwaukee Ave Chicago' },
  { id: 'place-042', query: "Quimby's Bookstore 1854 W North Ave Chicago" },
  { id: 'place-043', query: 'The Empty Bottle 1035 N Western Ave Chicago' },
  { id: 'place-044', query: 'Rainbo Club 1150 N Damen Ave Chicago' },
  { id: 'place-045', query: 'Wicker Park Tap 1958 W North Ave Chicago' },

  // Guide 10 — Wicker Park Coffee Circuit (remix of guide-09)
  { id: 'place-046', query: 'Intelligentsia Coffee 1850 W North Ave Chicago Wicker Park' },
  { id: 'place-047', query: 'Wormhole Coffee 1462 N Milwaukee Ave Chicago' },
  { id: 'place-048', query: 'Ipsento 606 2035 N Western Ave Chicago' },
  { id: 'place-049', query: 'Big Shoulders Coffee 1105 N Milwaukee Ave Chicago' },

  // Guide 11 — Bronzeville Cultural Trail
  { id: 'place-050', query: 'Harold Washington Cultural Center 4701 S Cottage Grove Ave Chicago' },
  { id: 'place-051', query: 'DuSable Black History Museum 740 E 56th Pl Chicago' },
  { id: 'place-052', query: 'Bronzeville Winery 4420 S Cottage Grove Ave Chicago' },
  { id: 'place-053', query: 'Overton Hygienic Building 3619 S State St Chicago' },
  { id: 'place-054', query: 'Eighth Regiment Armory 3533 S Giles Ave Chicago' },
  { id: 'place-055', query: "Bronzeville Cookin' 453 E 35th St Chicago" },
  { id: 'place-056', query: 'Chicago Bee Building 3647 S State St Chicago' },

  // Guide 12 — Bronzeville Soul Food
  { id: 'place-057', query: "Bronzeville Cookin' 453 E 35th St Chicago" },
  { id: 'place-058', query: "Pearl's Place 3901 S Michigan Ave Chicago" },
  { id: 'place-059', query: "Chicago's Home of Chicken and Waffles 3947 S King Dr Chicago" },
  { id: 'place-060', query: "Harold's Chicken Shack 307 E 51st St Chicago" },
  { id: 'place-061', query: 'Dat Donut 8251 S Cottage Grove Ave Chicago' },

  // Guide 13 — Andersonville International Block
  { id: 'place-062', query: 'Ann Sather Restaurant 5207 N Clark St Chicago Andersonville' },
  { id: 'place-063', query: 'Middle East Bakery Grocery 1512 W Foster Ave Chicago' },
  { id: 'place-064', query: "Simon's Tavern 5210 N Clark St Chicago" },
  { id: 'place-065', query: 'Women and Children First 5233 N Clark St Chicago' },
  { id: 'place-066', query: 'Svea Restaurant 5236 N Clark St Chicago' },

  // Guide 14 — Chinatown Essential Eats
  { id: 'place-067', query: 'MingHin Cuisine 2168 S Archer Ave Chicago Chinatown' },
  { id: 'place-068', query: 'Qing Xiang Yuan Dumplings 2002 S Wentworth Ave Chicago' },
  { id: 'place-069', query: 'Phoenix Restaurant 2131 S Archer Ave Chicago Chinatown' },
  { id: 'place-070', query: 'Chinatown Square Mall 2100 S Archer Ave Chicago' },
  { id: 'place-071', query: 'Joy Yee Noodle 2159 S China Place Chicago' },
  { id: 'place-072', query: 'Tasty Place Bakery 2026 S Wentworth Ave Chicago' },

  // Guide 15 — Riverwalk Runs & Rests
  { id: 'place-073', query: 'Chicago Riverwalk Wacker Dr Michigan Ave Chicago' },
  { id: 'place-074', query: 'Art Institute of Chicago 111 S Michigan Ave' },
  { id: 'place-075', query: 'Millennium Park 201 E Randolph St Chicago' },
  { id: 'place-076', query: 'Billy Goat Tavern 430 N Michigan Ave Chicago' },

  // Guide 16 — South Shore Lakefront
  { id: 'place-077', query: 'South Shore Cultural Center 7059 S South Shore Dr Chicago' },
  { id: 'place-078', query: 'Rainbow Beach Park 3111 E 77th St Chicago' },
  { id: 'place-079', query: 'Jeffrey Pub 7041 S Jeffrey Blvd Chicago' },
  { id: 'place-080', query: "Haire's Gulf Shrimp 7422 S South Chicago Ave Chicago" },
  { id: 'place-081', query: '71st Street Beach 7100 S Lake Shore Dr Chicago' },

  // Guide 17 — Humboldt Park Community Picks
  { id: 'place-082', query: 'Humboldt Park Lagoon 1400 N Sacramento Ave Chicago' },
  { id: 'place-083', query: 'La Palma Restaurant 2119 N Kedzie Ave Chicago' },
  { id: 'place-084', query: 'Cafe Colao 2638 W Division St Chicago' },
  { id: 'place-085', query: 'Puerto Rican Arts Alliance 3000 W North Ave Chicago' },
  { id: 'place-086', query: 'Jibaritos y Mas 3400 W Fullerton Ave Chicago' },

  // Guide 18 — Ukrainian Village Hidden Gems
  { id: 'place-087', query: 'Ukrainian Institute of Modern Art 2320 W Chicago Ave Chicago' },
  { id: 'place-088', query: 'Shokolad Pastry Cafe 2524 W Chicago Ave Chicago' },
  { id: 'place-089', query: 'Boeuf et Fromage 828 N Damen Ave Chicago' },
  { id: 'place-090', query: 'Division Street Brewing 1925 W Division St Chicago' },

  // Guide 19 — Uptown Music History (journalist: alkeefe)
  { id: 'place-091', query: 'Green Mill Cocktail Lounge 4802 N Broadway Chicago' },
  { id: 'place-092', query: 'Aragon Ballroom 1106 W Lawrence Ave Chicago' },
  { id: 'place-093', query: 'Riviera Theatre 4746 N Racine Ave Chicago' },
  { id: 'place-094', query: 'Uptown Underground 1507 W Montrose Ave Chicago' },
  { id: 'place-095', query: "Carol's Pub 4659 N Clark St Chicago" },
  { id: 'place-096', query: 'Big Chicks 5024 N Sheridan Rd Chicago' },

  // Guide 20 — Rogers Park Beach Day (journalist: alkeefe)
  { id: 'place-097', query: 'Loyola Beach 1230 W Greenleaf Ave Chicago Rogers Park' },
  { id: 'place-098', query: 'No Exit Cafe Gallery 6970 N Glenwood Ave Chicago' },
  { id: 'place-099', query: 'Taste of Lebanon 1509 W Devon Ave Chicago' },
  { id: 'place-100', query: 'The Red Line Tap 7006 N Glenwood Ave Chicago' },

  // Guide 21 — Little Village Bakeries
  { id: 'place-101', query: 'Dulcelandia 2747 S Millard Ave Chicago Little Village' },
  { id: 'place-102', query: 'La Baguette Bakery 3617 W 26th St Chicago' },
  { id: 'place-103', query: 'La Casa De Samuel 2834 W 24th Place Chicago' },
  { id: 'place-104', query: 'Carnitas Uruapan 1725 W 18th St Chicago' },
  { id: 'place-105', query: 'El Popocatepetl 3312 W 26th St Chicago' },

  // Guide 22 — Woodlawn Right Now
  { id: 'place-106', query: 'Virtue Restaurant Bar 1462 E 53rd St Chicago Hyde Park' },
  { id: 'place-107', query: 'Cove Lounge 1750 E 55th St Chicago' },
  { id: 'place-108', query: 'Obama Presidential Center 5875 S Ellis Ave Chicago Woodlawn' },
  { id: 'place-109', query: '61st Street Farmers Market Blackstone Ave Chicago Woodlawn' },
  { id: 'place-110', query: 'Apostolic Church of God 6320 S Dorchester Ave Chicago' },

  // Guide 23 — Bronzeville Night Out (remix of guide-11)
  { id: 'place-111', query: 'Harold Washington Cultural Center 4701 S Cottage Grove Ave Chicago' },
  { id: 'place-112', query: 'Bronzeville Winery 4420 S Cottage Grove Ave Chicago' },
  { id: 'place-113', query: 'The Promontory 5311 S Lake Park Ave Chicago' },
  { id: 'place-114', query: "Pearl's Place 3901 S Michigan Ave Chicago" },
  { id: 'place-115', query: 'Spoken Cafe 3256 S King Dr Chicago' },
];

async function enrichPlace(place) {
  try {
    const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': API_KEY,
        'X-Goog-FieldMask': FIELD_MASK,
      },
      body: JSON.stringify({
        textQuery: place.query,
        locationBias: {
          circle: {
            center: { latitude: 41.8781, longitude: -87.6298 },
            radius: 50000.0,
          },
        },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      process.stderr.write(`[${place.id}] HTTP ${res.status}: ${err}\n`);
      return { id: place.id, placeId: null, rating: null, ratingCount: null, lat: null, lng: null };
    }

    const data = await res.json();

    if (data.places && data.places.length > 0) {
      const p = data.places[0];
      return {
        id: place.id,
        placeId: p.id || null,
        rating: p.rating ?? null,
        ratingCount: p.userRatingCount ?? null,
        lat: p.location?.latitude ?? null,
        lng: p.location?.longitude ?? null,
      };
    }

    process.stderr.write(`[${place.id}] NO MATCH for: ${place.query}\n`);
    return { id: place.id, placeId: null, rating: null, ratingCount: null, lat: null, lng: null };
  } catch (e) {
    process.stderr.write(`[${place.id}] ERROR: ${e.message}\n`);
    return { id: place.id, placeId: null, rating: null, ratingCount: null, lat: null, lng: null };
  }
}

async function main() {
  const results = {};
  for (const place of PLACES) {
    const enriched = await enrichPlace(place);
    results[place.id] = enriched;
    process.stderr.write(
      `✓ ${place.id}: placeId=${enriched.placeId || 'null'}, rating=${enriched.rating}, lat=${enriched.lat}\n`
    );
    // 150ms delay to stay within Places API rate limits
    await new Promise((r) => setTimeout(r, 150));
  }
  process.stdout.write(JSON.stringify(results, null, 2) + '\n');
}

main().catch((e) => {
  process.stderr.write(`FATAL: ${e.message}\n`);
  process.exit(1);
});
