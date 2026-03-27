// ============================================================
// server/index.js — Express RSS proxy for chicago.com
// ============================================================
// Handles RSS fetching server-side to avoid CORS issues.
// Two services run in the same Railway project:
//   (1) This Express server  (2) React/Vite frontend via Caddy
// ============================================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { XMLParser } = require('fast-xml-parser');

const app = express();
const PORT = process.env.PORT || 3001;
const allowedOrigin = process.env.ALLOWED_ORIGIN || 'http://localhost:5173';

// ── CORS ──────────────────────────────────────────────────────
// Restrict to the frontend origin — never use '*' in production.
app.use(cors({ origin: allowedOrigin }));
app.use(express.json());

// ── Community area names for neighborhood tagging ─────────────
// Title-case versions of all 77 Chicago community areas.
// Used for keyword-matching article text.
const COMMUNITY_AREA_NAMES = [
  'Albany Park', 'Archer Heights', 'Armour Square', 'Ashburn',
  'Auburn Gresham', 'Austin', 'Avalon Park', 'Avondale',
  'Belmont Cragin', 'Beverly', 'Bridgeport', 'Brighton Park',
  'Burnside', 'Calumet Heights', 'Chatham', 'Chicago Lawn',
  'Clearing', 'Douglas', 'Dunning', 'East Garfield Park',
  'East Side', 'Edgewater', 'Edison Park', 'Englewood',
  'Forest Glen', 'Fuller Park', 'Gage Park', 'Garfield Ridge',
  'Grand Boulevard', 'Greater Grand Crossing', 'Hegewisch',
  'Hermosa', 'Humboldt Park', 'Hyde Park', 'Irving Park',
  'Jefferson Park', 'Kenwood', 'Lake View', 'Lincoln Park',
  'Lincoln Square', 'Logan Square', 'Loop', 'Lower West Side',
  'McKinley Park', 'Montclare', 'Morgan Park', 'Mount Greenwood',
  'Near North Side', 'Near South Side', 'Near West Side',
  'New City', 'North Center', 'North Lawndale', 'North Park',
  'Norwood Park', 'Oakland', "O'Hare", 'Portage Park',
  'Pullman', 'Riverdale', 'Rogers Park', 'Roseland',
  'South Chicago', 'South Deering', 'South Lawndale', 'South Shore',
  'Uptown', 'Washington Heights', 'Washington Park', 'West Elsdon',
  'West Englewood', 'West Garfield Park', 'West Lawn',
  'West Pullman', 'West Ridge', 'West Town', 'Woodlawn',
];

// Pre-build lowercase versions once for fast matching.
const COMMUNITY_AREA_LOWER = COMMUNITY_AREA_NAMES.map(n => ({
  name: n,
  lower: n.toLowerCase(),
}));

// ── RSS source config ─────────────────────────────────────────
const RSS_SOURCES = {
  suntimes: {
    url: 'https://chicago.suntimes.com/rss/index.xml',
    sourceName: 'Chicago Sun-Times',
  },
  wbez: {
    url: 'https://www.wbez.org/rss/index.xml',
    sourceName: 'WBEZ',
  },
};

// ── XML parser config ─────────────────────────────────────────
const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  // Ensure items are always an array even when there is only one.
  isArray: (name) => name === 'item',
});

// ── Helpers ───────────────────────────────────────────────────

/**
 * Match community area names against article text.
 * Returns an array of matching neighborhood names.
 */
function tagNeighborhoods(text) {
  const lower = (text || '').toLowerCase();
  return COMMUNITY_AREA_LOWER
    .filter(({ lower: name }) => lower.includes(name))
    .map(({ name }) => name);
}

/**
 * Strip HTML tags from a string (RSS descriptions often contain markup).
 */
function stripHtml(html) {
  return (html || '').replace(/<[^>]+>/g, '').trim();
}

/**
 * Extract image URL from an RSS item.
 * Checks (in order): media:content, enclosure, content:encoded img src.
 */
function extractImageUrl(item) {
  // media:content or media:thumbnail
  const mediaContent =
    item['media:content'] ||
    item['media:thumbnail'] ||
    item['media:group']?.['media:content'];
  if (mediaContent) {
    const url = mediaContent['@_url'];
    if (url) return url;
  }

  // enclosure (some news feeds)
  const enclosure = item['enclosure'];
  if (enclosure && enclosure['@_type']?.startsWith('image/')) {
    return enclosure['@_url'] || null;
  }

  // Scrape first <img src="..."> from content:encoded if present
  const contentEncoded = item['content:encoded'] || '';
  const imgMatch = contentEncoded.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch) return imgMatch[1];

  return null;
}

/**
 * Estimate read time in minutes given a text string.
 */
function estimateReadTime(text) {
  const words = (text || '').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/**
 * Normalize a raw RSS item into the app's article shape:
 * { id, title, url, summary, publishedAt, source, sourceName, imageUrl, neighborhoods[], readTimeMinutes }
 */
function normalizeItem(item, source, sourceName) {
  const title = stripHtml(item.title || '');
  const url = item.link || item.guid?.['#text'] || item.guid || '';
  const rawSummary = item.description || item['content:encoded'] || '';
  const summary = stripHtml(rawSummary).slice(0, 400);
  const publishedAt = item.pubDate || item['dc:date'] || null;
  const imageUrl = extractImageUrl(item);

  // Combine title + summary for neighborhood matching
  const neighborhoods = tagNeighborhoods(`${title} ${summary}`);

  // Stable ID derived from the URL
  const id = `article-${Buffer.from(url).toString('base64').slice(0, 16)}`;

  return {
    id,
    title,
    url,
    summary,
    publishedAt,
    source,
    sourceName,
    imageUrl,
    neighborhoods,
    readTimeMinutes: estimateReadTime(summary),
  };
}

// ── Routes ────────────────────────────────────────────────────

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

/**
 * GET /api/rss?source=suntimes|wbez
 *
 * Fetches the requested RSS feed, parses it, and returns a normalized
 * JSON array of article objects. On any fetch or parse error, returns
 * an empty array so the frontend silently omits articles per spec.
 */
app.get('/api/rss', async (req, res) => {
  const { source } = req.query;
  const config = RSS_SOURCES[source];

  if (!config) {
    return res.status(400).json({ error: `Unknown source: ${source}. Use 'suntimes' or 'wbez'.` });
  }

  try {
    const response = await fetch(config.url, {
      headers: { 'User-Agent': 'chicago.com RSS reader (prototype)' },
      signal: AbortSignal.timeout(8000), // 8-second timeout
    });

    if (!response.ok) {
      console.error(`RSS fetch failed for ${source}: HTTP ${response.status}`);
      return res.json([]);
    }

    const xml = await response.text();
    const parsed = xmlParser.parse(xml);

    const items = parsed?.rss?.channel?.item || [];
    const articles = items.map(item => normalizeItem(item, source, config.sourceName));

    res.json(articles);
  } catch (err) {
    console.error(`RSS error for ${source}:`, err.message);
    // Return empty array — frontend silently omits articles on RSS error (per requirements).
    res.json([]);
  }
});

// ── Start ─────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`chicago.com server running on port ${PORT}`);
  console.log(`CORS origin: ${allowedOrigin}`);
});
