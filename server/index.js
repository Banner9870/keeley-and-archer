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
  // Ensure feed items are always arrays even when there is only one.
  isArray: (name) => name === 'item' || name === 'entry',
  // Disable built-in entity expansion — Sun-Times and WBEZ feeds exceed
  // the default limit of 1000. We decode common entities manually below.
  processEntities: false,
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

// Common HTML/XML entities — needed because processEntities: false skips
// built-in decoding to avoid the entity expansion limit error.
const ENTITY_MAP = {
  '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"',
  '&apos;': "'", '&nbsp;': ' ', '&mdash;': '—', '&ndash;': '–',
  '&lsquo;': '\u2018', '&rsquo;': '\u2019',
  '&ldquo;': '\u201C', '&rdquo;': '\u201D',
  '&hellip;': '…', '&copy;': '©', '&reg;': '®',
};

function decodeEntities(str) {
  return (str || '')
    // Named entities from the map above
    .replace(/&[a-z]+;/gi, match => ENTITY_MAP[match] ?? match)
    // Decimal numeric entities e.g. &#8217;
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)))
    // Hex numeric entities e.g. &#x2019;
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

/**
 * Strip HTML tags from a string (RSS descriptions often contain markup).
 */
function stripHtml(html) {
  return decodeEntities((html || '').replace(/<[^>]+>/g, '')).trim();
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
 * Extract a plain string from a value that may be a string or an Atom
 * element object like { '#text': 'Hello', '@_type': 'html' }.
 */
function textValue(val) {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object') return val['#text'] || val['_'] || '';
  return String(val);
}

/**
 * Extract the article URL from an item.
 * RSS 2.0: <link> is a plain text node.
 * Atom:    <link> is an element with href attribute — may be an object
 *          or an array of link objects (alternate, self, etc.).
 */
function extractUrl(item) {
  const link = item.link;

  if (!link) return textValue(item.guid) || '';

  // Plain string (RSS 2.0)
  if (typeof link === 'string') return link;

  // Single Atom <link href="..."> object
  if (typeof link === 'object' && !Array.isArray(link)) {
    return link['@_href'] || textValue(link) || '';
  }

  // Array of Atom <link> elements — prefer rel="alternate"
  if (Array.isArray(link)) {
    const alt = link.find(l => l['@_rel'] === 'alternate' || !l['@_rel']);
    return alt?.['@_href'] || link[0]?.['@_href'] || '';
  }

  return '';
}

/**
 * Normalize a raw RSS/Atom item into the app's article shape:
 * { id, title, url, summary, publishedAt, source, sourceName, imageUrl, neighborhoods[], readTimeMinutes }
 */
function normalizeItem(item, source, sourceName) {
  const title = stripHtml(textValue(item.title));

  // Atom uses <published> or <updated>; RSS uses <pubDate>
  const publishedAt = item.pubDate || item.published || item.updated || item['dc:date'] || null;

  const url = extractUrl(item);

  // Atom uses <summary> or <content>; RSS uses <description> or <content:encoded>
  const rawSummary =
    textValue(item.summary) ||
    textValue(item.content) ||
    item.description ||
    item['content:encoded'] || '';
  const summary = stripHtml(rawSummary).slice(0, 400);

  const imageUrl = extractImageUrl(item);
  const neighborhoods = tagNeighborhoods(`${title} ${summary}`);

  // Stable ID derived from the URL (guard against non-string url)
  const safeUrl = typeof url === 'string' ? url : JSON.stringify(url);
  const id = `article-${Buffer.from(safeUrl).toString('base64').slice(0, 16)}`;

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

    // RSS 2.0 format: rss > channel > item[]
    // Atom format:   feed > entry[]
    const items =
      parsed?.rss?.channel?.item ||
      parsed?.feed?.entry ||
      [];

    // isArray only forces arrays for 'item' — Atom 'entry' may be a single object.
    const itemArray = Array.isArray(items) ? items : [items];
    const articles = itemArray.map(item => normalizeItem(item, source, config.sourceName));

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
