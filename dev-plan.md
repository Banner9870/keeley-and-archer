# chicago.com Prototype — Development Plan

**Project:** chicago.com hyperlocal neighborhood guide prototype
**Prepared for:** Ellery Jones, Chicago Public Media
**Repository:** [Banner9870/keeley-and-archer](https://github.com/Banner9870/keeley-and-archer)
**Build window:** One week
**Model:** Claude Sonnet 4.6 (agentic coding assistant)

---

## 1. Prerequisites & Environment Setup

Everything in this section must be complete before any application code is written.

### 1.1 Required Software

**Node.js — version 20 LTS is required.** Vite 5 and Railway's build environment both target Node 20.

Check your current version:
```bash
node --version
```

If the output is not `v20.x.x`, install Node 20 via nvm (recommended):
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.zshrc        # or ~/.bashrc depending on your shell
nvm install 20
nvm use 20
nvm alias default 20
node --version         # should print v20.x.x
```

**Git — verify it is installed and configured:**
```bash
git --version          # should print git version 2.x or higher
git config --global user.name "Ellery Jones"
git config --global user.email "your-email@chicagopublicmedia.org"
```

### 1.2 Clone the Repository

```bash
cd ~/Documents
git clone https://github.com/Banner9870/keeley-and-archer.git
cd keeley-and-archer
```

The repo currently contains only root-level config files. That is expected — the scaffold is built in Phase 1.

### 1.3 Verify .env Configuration

The `.env` file already exists at the root with the Google Places API key populated. Verify:

```bash
cat .env
```

Expected output:
```
VITE_GOOGLE_PLACES_API_KEY=your_google_places_api_key_here
VITE_CHICAGO_DATA_PORTAL_TOKEN=
```

**Action required before Phase 4:** Obtain a Socrata App Token for the Chicago Data Portal.
1. Go to [https://data.cityofchicago.org/login](https://data.cityofchicago.org/login) and create a free account.
2. After signing in, go to Developer Settings and create a new application.
3. Copy the App Token and add it to `.env`:
   ```
   VITE_CHICAGO_DATA_PORTAL_TOKEN=your_token_here
   ```
The Data Portal will work without a token but at a lower rate limit. For a one-week build with light traffic, leaving it blank is acceptable as a temporary fallback.

### 1.4 Verify Google Places API Key Works

Run this curl command from your terminal to confirm the key is active:
```bash
curl -s -X POST \
  "https://places.googleapis.com/v1/places:searchText" \
  -H "Content-Type: application/json" \
  -H "X-Goog-Api-Key: $VITE_GOOGLE_PLACES_API_KEY" \
  -H "X-Goog-FieldMask: places.displayName,places.formattedAddress" \
  -d '{"textQuery": "Kuma'\''s Corner Chicago", "locationBias": {"circle": {"center": {"latitude": 41.8781, "longitude": -87.6298}, "radius": 50000.0}}}' \
  | python3 -m json.tool
```

A successful response returns a JSON object with a `places` array containing at least one result. If you see an `error` object, the key is not yet enabled for the Places API (New) — enable it in the [Google Cloud Console](https://console.cloud.google.com) under APIs & Services.

**Important:** Do NOT restrict the API key to specific domains yet. Restriction happens after the Railway URL is known (Deployment Checklist, Section 8). During local development, the key must accept requests from `localhost`.

### 1.5 Install the Railway CLI (for deployment only — not needed during build)

```bash
npm install -g @railway/cli
railway login
```

Skip this until Phase 11.

### 1.6 Verify Git Remote and Initial Push

The `.gitignore` already excludes `.env`. Before any code is written, confirm this protection is in place:

```bash
git status             # .env should NOT appear as a tracked file
```

If `.env` appears as "untracked," the `.gitignore` is working correctly — it will never be committed. If it somehow appears as staged, run `git rm --cached .env` immediately.

---

## 2. Repository Structure

The finished project directory tree. Every folder and key file is listed with a one-line description.

```
keeley-and-archer/
│
├── .env                          # Local secrets — never committed
├── .env.example                  # Committed template showing required variable names
├── .gitignore                    # Excludes .env, node_modules, dist
├── requirements.md               # Source of truth for all feature decisions
├── productbrief.md               # Background context on the project vision
│
├── client/                       # React + Vite frontend application
│   ├── index.html                # Vite entry HTML — includes noindex meta tag and Google Fonts links
│   ├── vite.config.js            # Vite config — proxy for /api routes in dev, build output settings
│   ├── package.json              # Client dependencies (react, react-router-dom, leaflet, etc.)
│   │
│   ├── public/
│   │   ├── robots.txt            # User-agent: * / Disallow: / — prevents search indexing
│   │   └── favicon.svg           # Chicago six-pointed star SVG favicon
│   │
│   └── src/
│       ├── main.jsx              # React entry point — mounts App, wraps with AppProvider
│       ├── App.jsx               # Root component — Router, AppProvider, layout shell
│       │
│       ├── context/
│       │   ├── AppContext.jsx    # createContext() export — consumed by all state-reading components
│       │   └── AppReducer.js     # useReducer reducer function — all action handlers
│       │
│       ├── data/
│       │   ├── seed.js           # The master seed data file — all guides, users, places
│       │   └── neighborhoods-fallback.json  # Static fallback for all 77 community areas if Socrata is down
│       │
│       ├── hooks/
│       │   ├── useAppContext.js  # Convenience hook — returns { state, dispatch } from AppContext
│       │   ├── usePlacesSearch.js  # Encapsulates Google Places Text Search API call
│       │   ├── useRssFeed.js     # Fetches and normalizes /api/rss data from Express proxy
│       │   └── useCommunityAreas.js  # Fetches Socrata community area data + GeoJSON; handles fallback
│       │
│       ├── pages/
│       │   ├── FeedPage.jsx      # / feed route — hero, mixed guide/article feed, sidebar filters
│       │   ├── ExplorePage.jsx   # /explore route — neighborhood grid, trending guides, newsroom rail
│       │   ├── GuideDetailPage.jsx  # /guide/:id — hero, places list, Leaflet map, remix CTA
│       │   ├── GuideCreatePage.jsx  # /guide/new — multi-step guide creation form
│       │   ├── GuideRemixPage.jsx   # /guide/:id/remix — creation form pre-populated from original guide
│       │   ├── NeighborhoodPage.jsx # /neighborhood/:slug — boundary map, local guides, newsroom rail
│       │   ├── ProfilePage.jsx   # /profile/:handle — identity header, tabbed guide/remix/saved grid
│       │   └── NotFoundPage.jsx  # * catch-all — 404 with link back to feed
│       │
│       ├── components/
│       │   ├── layout/
│       │   │   ├── Header.jsx    # Site header — wordmark, nav, Create Guide CTA, account dropdown
│       │   │   ├── Footer.jsx    # Site footer — flag stripes, links, tagline
│       │   │   └── Layout.jsx    # Wrapper component providing max-width container and page grid
│       │   │
│       │   ├── cards/
│       │   │   ├── GuideCard.jsx     # Guide card with red top border — used in feeds and grids
│       │   │   ├── ArticleCard.jsx   # Article card with blue top border — RSS-sourced content
│       │   │   └── SkeletonCard.jsx  # Animated skeleton placeholder matching GuideCard dimensions
│       │   │
│       │   ├── guide/
│       │   │   ├── GuideHero.jsx         # Full-width cover image with overlaid title + author block
│       │   │   ├── PlaceListItem.jsx     # Single place row in guide detail — name, address, note, rating
│       │   │   ├── PlaceSearchResult.jsx # Single row in Places API search results during guide creation
│       │   │   ├── AddedPlaceRow.jsx     # Place in the "Your guide" build panel — with note field + drag handle
│       │   │   ├── PhotoPicker.jsx       # Curated ~20-photo Unsplash gallery for guide cover selection
│       │   │   ├── RemixBanner.jsx       # Persistent "Remixing [title] by @author" attribution strip
│       │   │   └── RemixAttribution.jsx  # "Remixed from [original]" block on remixed guide detail pages
│       │   │
│       │   ├── neighborhood/
│       │   │   ├── NeighborhoodMap.jsx   # react-leaflet map rendering a single community area boundary
│       │   │   ├── NeighborhoodCard.jsx  # Compact neighborhood tile for the Explore grid
│       │   │   └── NeighborhoodStats.jsx # Population and adjacent neighborhoods strip
│       │   │
│       │   ├── feed/
│       │   │   ├── FeedHero.jsx          # Full-width hero strip with Chicago flag blue stripes
│       │   │   ├── FeedDisclosure.jsx    # "How your feed is ordered" tooltip/modal
│       │   │   ├── NeighborhoodFilter.jsx  # Sidebar neighborhood chip filter panel
│       │   │   └── CategoryFilter.jsx    # Sidebar category toggle panel
│       │   │
│       │   ├── profile/
│       │   │   ├── ProfileHeader.jsx     # Identity block — display name, handle, neighborhood, badges
│       │   │   └── ProfileTabs.jsx       # Guides / Remixes / Saved tab switcher
│       │   │
│       │   ├── shared/
│       │   │   ├── StarIcon.jsx          # Chicago six-pointed star SVG — reusable across badges/dividers
│       │   │   ├── NeighborhoodTag.jsx   # Blue pill tag for neighborhood labels
│       │   │   ├── CategoryBadge.jsx     # Interest/category chip in profile and guide cards
│       │   │   ├── ShareModal.jsx        # Mock share sheet with copyable URL — non-functional share action
│       │   │   ├── ErrorBoundary.jsx     # React error boundary wrapping all pages
│       │   │   ├── LeafletMap.jsx        # Generic multi-pin Leaflet map for guide detail places
│       │   │   └── SuccessBanner.jsx     # "Your guide was created!" confirmation strip
│       │   │
│       │   └── ui/
│       │       ├── Button.jsx       # Reusable button — primary (red), secondary, ghost variants
│       │       ├── TextInput.jsx    # Styled text input with label and error state
│       │       ├── Textarea.jsx     # Styled textarea with character counter
│       │       ├── Select.jsx       # Styled dropdown — used for neighborhood selector
│       │       ├── Toggle.jsx       # Public/Private privacy toggle
│       │       └── Spinner.jsx      # Inline spinner for Places search loading state
│       │
│       └── styles/
│           ├── global.css           # CSS custom properties (design tokens), reset, base typography
│           ├── fonts.css            # @import for Google Fonts (Big Shoulders Display/Text, Inter, Source Serif 4)
│           └── [Component].module.css  # Co-located CSS Module per component (one file per component)
│
├── server/                       # Express RSS proxy — separate Railway service
│   ├── package.json              # Server dependencies (express, fast-xml-parser, cors, dotenv)
│   ├── index.js                  # Express app entry point — all routes defined here
│   └── .env                      # Server-side env vars (none required currently — RSS feeds are public)
│
└── docs/
    ├── moderator-guide.md        # Non-technical guide for session moderators (see Section 9)
    └── technical-guide.md        # Engineering handoff guide (see Section 9)
```

---

## 3. Build Phases

### Phase 1: Project Scaffold & Design System

**Goal:** A running Vite app and Express server with the full design system in place. No pages, no data — just the visual foundation everything else is built on top of.

All tasks in this phase are appropriate for an agent to execute unless marked otherwise.

| # | Task | Complexity | Agent or Decision |
|---|------|-----------|-------------------|
| 1.1 | Run `npm create vite@latest client -- --template react` from the repo root to scaffold the client app | S | Agent |
| 1.2 | Initialize the Express server: create `/server` directory, run `npm init -y`, install `express cors fast-xml-parser dotenv` | S | Agent |
| 1.3 | Create the root `package.json` with `scripts.dev` that runs client and server concurrently using `concurrently` | S | Agent |
| 1.4 | Configure `client/vite.config.js` with a dev proxy so `/api` requests in development route to `http://localhost:3001` | S | Agent |
| 1.5 | Create `client/src/styles/global.css` with all CSS custom property tokens from the design system (Section 2 of requirements) | M | Agent |
| 1.6 | Create `client/src/styles/fonts.css` with the four Google Fonts `@import` statements | S | Agent |
| 1.7 | Add the `noindex` meta tag and Google Fonts `<link>` tags to `client/index.html` | S | Agent |
| 1.8 | Create the `StarIcon.jsx` SVG component — the Chicago six-pointed star, reusable as a small inline icon | S | Agent |
| 1.9 | Build the primitive UI components: `Button.jsx`, `TextInput.jsx`, `Textarea.jsx`, `Select.jsx`, `Toggle.jsx`, `Spinner.jsx` | M | Agent |
| 1.10 | Create `client/public/robots.txt` containing `User-agent: *` / `Disallow: /` | S | Agent |
| 1.11 | Create `client/public/favicon.svg` as a Chicago six-pointed star SVG. **Note:** the Chicago flag star is six-pointed (Star of David geometry — two overlapping equilateral triangles), not the standard five-pointed star. The SVG must reflect this exactly. Use a regular hexagram path. | S | Agent |
| 1.12 | Create `client/Caddyfile` at the root of the `client/` directory. This file is required for Railway to serve the SPA correctly — without it, every URL except `/` returns a 404 in production. Contents: `":80 { root * /app/dist\ntry_files {path} /index.html\nfile_server }"` | S | Agent |
| 1.13 | Create `client/public/.env.example` — no, this goes at repo root. Verify `.env.example` exists at the repo root with `VITE_GOOGLE_PLACES_API_KEY=` and `VITE_CHICAGO_DATA_PORTAL_TOKEN=` (already created; verify it is committed and not in `.gitignore`) | S | Agent verify |
| 1.14 | **DECISION REQUIRED (Ellery):** Review the typography specimen and color palette rendered in a simple test page before proceeding. Adjustments to type weights, sizes, or the exact red/blue values are much cheaper to make now than after 20+ components are built. To view: run `npm run dev` from the repo root, then open `http://localhost:5173` in your browser. You should see the design system specimen page. Tell the agent what to adjust, if anything, before proceeding. **Status: ✅ Approved by Ellery 2026-03-26 — no adjustments needed.** The specimen lives in `client/src/App.jsx` and is removed in task 2.4 when `App.jsx` is replaced with the real router shell. | — | Ellery review |
| 1.15 | **Git checkpoint:** `git add -A && git commit -m "Phase 1: scaffold and design system"` then `git push origin main` | S | Agent |

**Phase 1 blocks:** Every subsequent phase. Do not start Phase 2 until Phase 1.14 is signed off by Ellery.

---

### Phase 2: App Shell, Routing, and State Architecture

**Goal:** The full routing table is wired, the AppContext store is initialized with its complete shape, the Header and Footer render on every page, and every page route returns at minimum a titled placeholder. No real content yet.

| # | Task | Complexity | Agent or Decision |
|---|------|-----------|-------------------|
| 2.0 | **Remove design system specimen:** `client/src/App.jsx` currently renders the Phase 1 specimen page. This task is the first step of Phase 2 — replace `App.jsx` with a minimal shell (`<div>Phase 2 shell</div>`) so the specimen is gone before routing is wired in task 2.4. | S | Agent |
| 2.1 | Install `react-router-dom` v6 | S | Agent |
| 2.2 | Create `AppContext.jsx` and `AppReducer.js` using the full state shape defined in Section 4 of this plan | M | Agent |
| 2.3 | Create `useAppContext.js` hook | S | Agent |
| 2.4 | Wire `AppProvider` into `main.jsx` and `BrowserRouter` into `App.jsx` | S | Agent |
| 2.5 | Create all page stub components under `client/src/pages/` — each renders its route name as an `<h1>` | S | Agent |
| 2.6 | Declare all routes in `App.jsx` in the exact order specified in requirements Section 6. Verify `/guide/new` is declared before `/guide/:id`. | S | Agent |
| 2.7 | Build `Header.jsx` — wordmark, nav links, Create Guide CTA, account avatar dropdown with hardcoded Alex Rivera data. **Note:** The Neighborhoods nav item is wired as a placeholder link in Phase 2; it is upgraded to a full community-area dropdown in task 8.8. | M | Agent |
| 2.8 | Build `Footer.jsx` — flag stripes, links, tagline | S | Agent |
| 2.9 | Build `Layout.jsx` wrapping `<Header>`, `{children}`, `<Footer>` with max-width container | S | Agent |
| 2.10 | Implement the `/?reset=true` session reset URL parameter handler in `App.jsx` — dispatches `RESET_SESSION` action | M | Agent |
| 2.11 | Implement the `Shift+R held 2 seconds` keyboard shortcut for session reset | M | Agent |
| 2.12 | Build `ErrorBoundary.jsx` wrapping all page routes | S | Agent |
| 2.13 | Build `NotFoundPage.jsx` — generic 404 with link to `/feed` | S | Agent |
| 2.14 | Smoke test: navigate all routes, confirm layout shell appears, confirm session reset works. **Done criterion:** every route in the route table renders without a console error and the pre-loaded account name appears in the header. | S | Ellery verify |
| 2.15 | **Git checkpoint:** `git add -A && git commit -m "Phase 2: routing, state architecture, app shell"` then `git push origin main` | S | Agent |

**Phase 2 blocks:** All page work (Phases 5–8). State shape must be finalized before components read from it. Do not start Phase 5 until Ellery has completed task 2.14.

---

### Phase 3: Seed Data

**Goal:** The `client/src/data/seed.js` file is complete with all guides, users, and places. This data powers every page in the app. Phase 3 runs in parallel with Phase 2.

| # | Task | Complexity | Agent or Decision |
|---|------|-----------|-------------------|
| 3.1 | **DECISION REQUIRED (Ellery):** Review the seed data content plan in Section 7 of this document. Confirm the list of neighborhoods, guide titles, and the two journalist accounts (Ellery Jones and Al Keefe) before the agent generates the file. | — | Ellery review |
| 3.2 | Generate the `seed.js` file using the content plan from Section 7 — all 8 users, 22 guides, place stubs (name, neighborhood, category, editor note only). Leave `placeId`, `rating`, `ratingCount`, and `lat`/`lng` blank for now — these are populated in task 3.2a. **Unsplash photo ID note:** Do NOT guess Unsplash photo IDs — use the Unsplash source URL format `https://source.unsplash.com/featured/?chicago,{theme}` as a reliable fallback that always resolves, or use confirmed IDs from the Unsplash Chicago collection. At minimum, verify each URL returns a real image before committing. | L | Agent |
| 3.2a | **Seed data enrichment — one-time Places API lookup.** For every place stub in `seed.js`, call `POST /v1/places:searchText` with the place name + neighborhood as the query (e.g. `"Kuma's Corner Logan Square Chicago"`). Use field mask `places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.location`. Store the returned `id` (as `placeId`), `rating`, `userRatingCount` (as `ratingCount`), and `location.latitude`/`location.longitude` (as `lat`/`lng`) back into each place entry in `seed.js`. This runs once during development — at runtime there are no extra API calls for seeded data. If a search returns no match, flag the place for Ellery to verify the name. | L | Agent |
| 3.3 | Create `neighborhoods-fallback.json` (tabular) — fetch `https://data.cityofchicago.org/resource/igwz-8jzy.json` once and commit the result. Also create `neighborhoods-fallback.geojson` — fetch `https://data.cityofchicago.org/resource/igwz-8jzy.geojson` once and commit. Both fallbacks are required: the JSON for the neighborhood selector dropdown, the GeoJSON for the boundary map on neighborhood pages. | M | Agent (one-time fetch) |
| 3.4 | Review seed data for realism — place names should be real Chicago businesses, addresses should be real streets | M | Ellery review |
| 3.5 | Verify: at least 4 `isEditorsPick: true` flags; at least 4 `remixOf` chains (the plan table has 3 — add a fourth: a remix of Guide 11 "Bronzeville Cultural Trail"); required neighborhood coverage (Lincoln Square, Logan Square, Hyde Park, Pilsen, Wicker Park, Bronzeville). Also verify `isFeatured` is removed from the Guide type — it is orphaned and unused; use only `isEditorsPick`. | S | Agent verification |
| 3.6 | Smoke test: import `seed.js` into a temporary component and log the data to confirm no syntax errors and all guides have `coverImage` populated | S | Agent |
| 3.7 | **Git checkpoint:** `git add -A && git commit -m "Phase 3: seed data and neighborhood fallback files"` then `git push origin main` | S | Agent |

**Phase 3 blocks:** Phases 5 and 8 (pages need seed data to render content). Done criterion: task 3.4 reviewed by Ellery and task 3.6 smoke test passes.

---

### Phase 4: Data Integrations

**Goal:** All three external data sources are connected and returning normalized data to the React app. Each integration is tested in isolation before being embedded in pages.

| # | Task | Complexity | Agent or Decision |
|---|------|-----------|-------------------|
| 4.1 | Build the Express server `index.js`. CORS configuration note: set `Access-Control-Allow-Origin` to `http://localhost:5173` for local development. Use a `ALLOWED_ORIGIN` environment variable so it can be overridden in Railway without a code change: `const allowedOrigin = process.env.ALLOWED_ORIGIN \|\| 'http://localhost:5173'`. Do NOT use `*` — wildcard CORS defeats the access restriction. This variable will be set in the Railway dashboard during deployment (Section 8.3). | M | Agent |
| 4.2 | Test the RSS proxy locally: `curl "http://localhost:3001/api/rss?source=suntimes"`. If you see a CORS or network error in the browser (not curl), the most common cause is the Express server not running — always start both services together with `npm run dev` from the repo root, never start the client alone. | S | Agent + Ellery verify |
| 4.3 | Create `useRssFeed.js` hook — fetches `/api/rss?source=suntimes` and `/api/rss?source=wbez`, merges and sorts results. Use `const baseUrl = import.meta.env.VITE_API_BASE_URL \|\| ''` so requests hit the local Vite proxy in development and the absolute Railway Express URL in production. This variable must be added to `.env.example` and set in Railway at deploy time. | M | Agent |
| 4.4 | Create `useCommunityAreas.js` hook — fetches Socrata tabular and GeoJSON endpoints, normalizes names to title case, falls back to `neighborhoods-fallback.json` | M | Agent |
| 4.5 | Test community areas hook by logging results in a temporary test component | S | Agent |
| 4.6 | Create `usePlacesSearch.js` hook — wraps `POST /v1/places:searchText` with Chicago bounding box, field mask, and error handling | M | Agent |
| 4.7 | Test Places search hook manually in the browser console | S | Ellery verify |
| 4.8 | Add the Socrata App Token to `.env` (if obtained) | S | Ellery action |

**Phase 4 blocks:** Phase 5 (Feed needs articles), Phase 6 (Guide creation needs Places search), Phase 5's Neighborhood page (needs community areas GeoJSON).

---

### Phase 5: Core Pages — Feed, Guide Detail, Neighborhood

**Goal:** The three read-only browsing pages are fully built with real seed data and real API integrations.

#### Feed Page (`/feed`)

| # | Task | Complexity | Agent or Decision |
|---|------|-----------|-------------------|
| 5.1 | Build `FeedHero.jsx` — full-width hero with Chicago flag blue stripes and wordmark | S | Agent |
| 5.2 | Build `GuideCard.jsx`. Anatomy (top to bottom): (1) cover photo — full-width, aspect ratio 16:9, with a `★ GUIDE` pill badge overlaid top-left in `--red` background, white text, 11px Inter 600; fall back to Google Maps Static API image if `coverImage` null. (2) Card body: guide title in Big Shoulders Text 700, author identity block (display name + `@handle`), secondary info line with map pin icon + place count + neighborhood tag (e.g. `📍 5 places · Logan Square`). (3) Action row: ♥ Like (local state), ↗ Share, non-functional Save — and a prominent `Remix →` CTA button in `--red`. The cover photo makes this card taller than an article card by design — that height difference is the primary scan signal in a mixed feed. | M | Agent |
| 5.3 | Build `ArticleCard.jsx`. Anatomy is intentionally compact and text-only — **no cover image**. (1) `--blue` top border (4px). (2) Content type badge: publication logo (WBEZ or Sun-Times SVG/PNG, 16px height) + `NEWS` label in `--blue`, 11px Inter 600, top-left of card body. (3) Article title in Big Shoulders Text 700, summary text in Inter 400 (2 lines max, truncated). (4) Meta row: source name, estimated read time, published timestamp. (5) `Read →` link — opens article URL in new tab. No Remix CTA, no place count, no map pin. The absence of a cover image keeps article cards visibly shorter and structurally distinct from guide cards at a glance. | M | Agent |
| 5.4 | Build `SkeletonCard.jsx` — animated shimmer placeholder with a `variant` prop: `'guide'` renders tall (matching GuideCard layout with image area), `'article'` renders compact (matching ArticleCard text-only layout). Both variants use the same shimmer animation. | S | Agent |
| 5.5 | Build `NeighborhoodFilter.jsx` sidebar panel — neighborhood chips that dispatch `TOGGLE_NEIGHBORHOOD_FILTER` to AppContext on click. Active selections show a filled/highlighted chip state. Changes persist in session state across navigation. Default active selections come from `currentUser.neighborhood` (Lincoln Square) on first load. | M | Agent |
| 5.6 | Build `CategoryFilter.jsx` sidebar panel — category toggles that dispatch `TOGGLE_CATEGORY_FILTER` to AppContext on click. Active selections show a checked state. Default active selections come from `currentUser.badges` (Food & Drink, Live Music, Parks & Outdoors) on first load. | S | Agent |
| 5.7 | Build `FeedDisclosure.jsx` — modal (not a tooltip — must work on mobile without hover) triggered by a "How your feed is ordered" link near the feed top. Modal copy is **dynamic**: reads `feedPreferences.selectedNeighborhoods` and `feedPreferences.selectedCategories` from AppContext and renders them inline, e.g. `"Your feed is showing content from Lincoln Square, Logan Square and matching Food & Drink, Live Music. Editor's Picks always appear first."` Includes a "Change your settings →" link that closes the modal and scrolls to the sidebar filter panel. | M | Agent |
| 5.8 | Assemble `FeedPage.jsx` — hero, two-column layout, sidebar, Load More button, skeleton states, empty states. Feed rendering rule: render the ordered list of guides and articles as returned by the feed ordering logic (task 5.9), but group consecutive articles under a `From the Newsroom` section subheader (Big Shoulders Text, `--blue`, with a thin `--blue` left border) when 2 or more articles appear in sequence. Lone articles between guides render without a subheader. This prevents the feed from looking like undifferentiated noise while keeping the mixed-content feel. `SkeletonCard` renders in two sizes matching the two card heights — tall (guide) and compact (article) — alternating in a realistic pattern. | L | Agent |
| 5.9 | Implement feed ordering logic in `FeedPage.jsx`: five tiers — (1) Editor's Picks, (2) neighborhood-matched guides + articles interleaved by date, (3) category-matched guides + articles interleaved by date, (4) citywide RSS articles (`isCitywide: true`, not already in tier 2) sorted by recency, (5) all remaining guides + articles interleaved by date. `isCitywide` is set server-side in `server/index.js`: true when an article matches 3+ neighborhoods or mentions Chicago with no specific neighborhood match. | M | Agent |
| 5.10 | Wire like button local state increment on GuideCard and ArticleCard | S | Agent |
| 5.11 | Wire Share button to open `ShareModal.jsx` | S | Agent |
| 5.12 | Build `ShareModal.jsx` — mock share sheet with copyable URL string | S | Agent |

#### Guide Detail Page (`/guide/:id`)

| # | Task | Complexity | Agent or Decision |
|---|------|-----------|-------------------|
| 5.13 | Build `GuideHero.jsx` — full-width cover image with dark gradient scrim, title overlay, author block below | M | Agent |
| 5.14 | Build `PlaceListItem.jsx` — place name, address, neighborhood tag, category icon, rating display (`4.3 ★ (1,204 reviews)`), editor's note, thumbnail, and a **"View on Google Maps →"** link. Link URL: `https://www.google.com/maps/place/?q=place_id:{place.placeId}` if `placeId` is present, otherwise fall back to `https://maps.google.com/?q={encodeURIComponent(place.name + ' ' + place.address)}`. Link opens in a new tab. No API call — purely a constructed URL. | M | Agent |
| 5.15 | Build `LeafletMap.jsx` — install `react-leaflet` and `leaflet`, render multi-pin map for guide places | M | Agent |
| 5.16 | Build `RemixAttribution.jsx` — "Remixed from [Original Guide]" block with link | S | Agent |
| 5.17 | Assemble `GuideDetailPage.jsx` — loads guide from state by `:id`, hero, description, places list, map, remix CTA, non-functional action buttons, remix attribution if applicable | L | Agent |
| 5.18 | Handle guide-not-found: redirect to `/feed` | S | Agent |

#### Neighborhood Page (`/neighborhood/:slug`)

| # | Task | Complexity | Agent or Decision |
|---|------|-----------|-------------------|
| 5.19 | Build `NeighborhoodMap.jsx` — react-leaflet map rendering a single community area GeoJSON boundary polygon. **Leaflet gotchas:** (1) `import 'leaflet/dist/leaflet.css'` must be included or the map renders without tiles and with broken pin icons. (2) Vite breaks Leaflet's default marker icons — fix by importing marker assets manually: `import markerIcon from 'leaflet/dist/images/marker-icon.png'; import markerShadow from 'leaflet/dist/images/marker-shadow.png'` and passing them to `L.icon()`. | M | Agent |
| 5.20 | Build `NeighborhoodStats.jsx` — population and adjacent neighborhoods strip | S | Agent |
| 5.21 | Assemble `NeighborhoodPage.jsx` — header, boundary map, guides filtered by neighborhood, newsroom article rail (RSS keyword-matched), stats strip, empty state for no guides, non-functional "Follow this neighborhood" button | L | Agent |
| 5.22 | **Git checkpoint:** `git add -A && git commit -m "Phase 5: core pages — feed, guide detail, neighborhood"` then `git push origin main` | S | Agent |

---

### Phase 6: Guide Creation Flow

**Goal:** A user can complete the full guide creation flow — from entering a title to viewing their finished guide on a detail page. The created guide persists in app state for the session.

| # | Task | Complexity | Agent or Decision |
|---|------|-----------|-------------------|
| 6.1 | Build `PhotoPicker.jsx` — curated grid of ~20 Chicago-themed Unsplash photos using `https://source.unsplash.com/featured/400x300/?chicago,{theme}` URLs (themes: food, neighborhood, music, park, architecture). Store the photo list as a constant in `src/data/unsplashPhotos.js`. Each entry: `{ id, url, alt }`. Clicking one sets it as the guide's `coverImage` in local component state. | M | Agent |
| 6.2 | Build Step 1 of `GuideCreatePage.jsx` — title, description, neighborhood selector (all 77 areas from `useCommunityAreas`), category multi-select, privacy toggle, PhotoPicker, Continue button | M | Agent |
| 6.3 | Build `PlaceSearchResult.jsx` — single result row: name, address, category, rating, "Add to guide" button | S | Agent |
| 6.4 | Build `AddedPlaceRow.jsx` — added place with editor's note textarea, drag handle, remove button | M | Agent |
| 6.5 | Build Step 2 of `GuideCreatePage.jsx` — Places search bar wired to `usePlacesSearch`, search results list, "Your guide" panel with added places, up/down arrow buttons for reordering, minimum-1-place validation (disable Save button + show inline message "Add at least one place to save"), Save button | L | Agent |
| 6.6 | Place reordering: implement up/down arrow buttons only. **Drag-and-drop is explicitly not in scope.** Arrows move the item one position up or down in the array. Top item's up-arrow is disabled; bottom item's down-arrow is disabled. | S | Agent |
| 6.7 | Wire the Save button: dispatch `ADD_GUIDE` action with completed guide object, navigate to `/guide/:newId` | M | Agent |
| 6.8 | Build `SuccessBanner.jsx` — "Your guide was created! Share it with friends." — shown when navigating to a newly created guide | S | Agent |
| 6.9 | On `GuideDetailPage`, detect `?created=true` query param to show `SuccessBanner` | S | Agent |
| 6.10 | Test complete creation flow end-to-end: title → places search → add 3 places → save → guide detail page shows correct data | M | Ellery verify |
| 6.11 | Test guide creation on mobile viewport | S | Ellery verify |

**Phase 6 blocks:** Phase 7 (Remix flow builds on the creation form).

---

### Phase 7: Guide Remix Flow

**Goal:** A user can remix any seeded guide and see the fork on a detail page with proper attribution.

| # | Task | Complexity | Agent or Decision |
|---|------|-----------|-------------------|
| 7.1 | Build `RemixBanner.jsx` — persistent strip displayed throughout the remix flow: `"Remixing '[title]' by @handle"` | S | Agent |
| 7.2 | Build `GuideRemixPage.jsx` — loads the original guide by `:id`, pre-populates Step 1 and Step 2 with the original guide's data, shows `RemixBanner` throughout | M | Agent |
| 7.3 | Wire the Save Remix button: dispatch `ADD_GUIDE` action with `remixOf: originalGuide.id` in the new guide object | S | Agent |
| 7.4 | Confirm that `GuideDetailPage` renders `RemixAttribution` block for guides with a `remixOf` field | S | Agent |
| 7.5 | Test the full remix chain: open a seeded guide → click Remix → modify title and one place → save → verify attribution links back to original | S | Ellery verify |
| 7.6 | **Git checkpoint:** `git add -A && git commit -m "Phases 6-7: guide creation and remix flows"` then `git push origin main` | S | Agent |

---

### Phase 8: Supporting Pages — Profile and Explore

**Goal:** The Profile and Explore pages are complete with seeded data.

#### Profile Page (`/profile/:handle`)

| # | Task | Complexity | Agent or Decision |
|---|------|-----------|-------------------|
| 8.1 | Build `ProfileHeader.jsx` — display name, handle, neighborhood, years badge, interest chips; journalist variant with star badge and publication | M | Agent |
| 8.2 | Build `ProfileTabs.jsx` — Guides / Remixes / Saved tab switcher | S | Agent |
| 8.3 | Assemble `ProfilePage.jsx` — loads user from state by `:handle`, shows profile header, tabbed guide grid, empty states for no guides | M | Agent |
| 8.4 | ~~Wire "Your Profile" and "Your Guides" header dropdown links to `/profile/alexrivera`~~ — **Removed:** "Your Guides" link was superfluous; account dropdown keeps only "Your Profile". | — | Done |

#### Explore Page (`/explore`)

| # | Task | Complexity | Agent or Decision |
|---|------|-----------|-------------------|
| 8.5 | Build `NeighborhoodCard.jsx` — compact neighborhood tile for the Explore grid | S | Agent |
| 8.6 | Assemble `ExplorePage.jsx` — search bar **(implement as a local string filter over the neighborhood grid and guide cards — not a no-op, but also not an API call)**, "Browse by neighborhood" grid (all 77 areas), Trending guides (`isEditorsPick: true` guides), Newsroom rail | M | Agent |
| 8.8 | **Upgrade Neighborhoods nav dropdown in `Header.jsx`:** replace the Phase 2 placeholder link with a dropdown panel populated from `communityAreas` state. Each item links to `/neighborhood/:slug`. Dismiss on outside click or Escape. Mobile hamburger menu shows the list inline. | M | Agent |
| 8.9 | **Git checkpoint:** `git add -A && git commit -m "Phase 8: profile, explore, and neighborhoods nav"` then `git push origin main` | S | Agent |

---

### Phase 9: Polish — Empty/Loading/Error States

**Goal:** Every async operation has a loading state. Every empty scenario has appropriate messaging. No bare white screens exist anywhere.

| # | Task | Complexity | Agent or Decision |
|---|------|-----------|-------------------|
| 9.1 | Feed: 6 skeleton cards shown during initial load; skeleton article cards mixed in during RSS fetch | S | Agent |
| 9.2 | Neighborhood page: skeleton rectangle for map area, skeleton card grid below | S | Agent |
| 9.3 | Places search in guide creation: inline spinner below search bar | S | Agent |
| 9.4 | All empty states from requirements Section 7 (empty neighborhood, empty profile, empty filtered feed) | M | Agent |
| 9.5 | All error states: RSS fetch failure (silent), Places API error (inline message), Socrata down (fallback JSON), guide not found (redirect), uncaught error (error boundary) | M | Agent |
| 9.6 | Accessibility pass: verify all interactive elements have visible focus states, check color contrast for body text (WCAG AA minimum), verify all `<img>` tags have meaningful `alt` text | M | Agent + Ellery review |
| 9.7 | Responsive pass: test every page at 375px (iPhone SE), 768px (iPad), 1280px (desktop) | M | Ellery verify |
| 9.8 | Touch target audit: all buttons minimum 44px height on mobile | S | Agent |
| 9.9 | Final review of typography rendering across all pages — confirm Big Shoulders Display is loading, uppercase rules are applied consistently | S | Ellery verify |

---

### Phase 10: Documentation

**Goal:** Both documentation files are written and committed.

| # | Task | Complexity | Agent or Decision |
|---|------|-----------|-------------------|
| 10.1 | Write `docs/moderator-guide.md` (see Section 9 of this plan for full content spec) | M | Agent — Ellery final review |
| 10.2 | Write `docs/technical-guide.md` (see Section 9 of this plan for full content spec) | M | Agent — Ellery final review |
| 10.3 | Ellery reviews both docs and marks any sections needing correction | — | Ellery review |

---

### Phase 11: Deployment

**Goal:** Both Railway services are live at a stable URL. The prototype is accessible for user testing.

See Section 8 (Deployment Checklist) for the full step-by-step. Summary:

| # | Task | Complexity | Agent or Decision |
|---|------|-----------|-------------------|
| 11.1 | Push all committed code to GitHub main branch | S | Agent |
| 11.2 | Create Railway services (frontend + Express) — see Section 8 | M | Ellery (Railway dashboard) |
| 11.3 | Set all environment variables in Railway dashboard | S | Ellery |
| 11.4 | Verify `robots.txt` is accessible at the Railway URL | S | Agent |
| 11.5 | Restrict Google Places API key to Railway domain + localhost in Google Cloud Console | S | Ellery |
| 11.6 | Run full smoke test checklist (see Section 8) | M | Ellery |

---

## 4. State Architecture

This is the complete AppContext specification. It must be implemented exactly as described here before any component reads from state. Do not add fields during component development without updating this spec first.

### 4.1 Full State Shape (TypeScript-style)

```typescript
// ── Enums ──────────────────────────────────────────────────────
type PlaceCategory =
  | 'restaurant' | 'cafe' | 'bar' | 'music_venue' | 'park'
  | 'cultural_institution' | 'shop' | 'other';

type GuideCategory =
  | 'Food & Drink' | 'Coffee' | 'Live Music' | 'Parks'
  | 'Culture' | 'History' | 'Sports' | 'Nightlife'
  | 'Family' | 'Shopping';

// ── Domain objects ─────────────────────────────────────────────
interface Place {
  id: string;                   // internal seed ID (e.g. "place-001") or Google place ID reused
  placeId: string | null;       // Google Places place ID — used for "View on Google Maps" link and map pins
  name: string;
  address: string;
  neighborhood: string;
  category: PlaceCategory;
  rating: number | null;        // from Google Places — real verified rating
  ratingCount: number | null;   // from Google Places — e.g. 1204 → displayed as "(1,204 reviews)"
  editorNote: string;           // 1–2 sentence note from guide author
  coverImage?: string;          // Unsplash URL or Google Places photo URL
  lat: number | null;           // from Google Places location — required for Leaflet map pins
  lng: number | null;
}

interface User {
  id: string;
  handle: string;               // "alexrivera" — without @ or domain
  displayName: string;
  neighborhood: string;
  yearsInChicago: number;
  badges: GuideCategory[];      // interest tags
  isJournalist: boolean;
  publication?: string;         // "Chicago Sun-Times" — journalist only
  // Full handle rendered as: isJournalist ? `@${handle}.suntimes.com` : `@${handle}.chicago.com`
  avatarUrl?: string;
}

interface Guide {
  id: string;
  title: string;
  description: string;
  authorId: string;             // references User.id
  neighborhood: string;
  categories: GuideCategory[];
  places: Place[];
  coverImage?: string;          // Unsplash URL — required for seeded guides
  likeCount: number;
  remixCount: number;
  remixOf?: string;             // guide id of original — present only on remixed guides
  isEditorsPick: boolean;       // used for Editor's Picks feed tier and Explore Trending section
  isSessionCreated: boolean;    // true for guides created during the current session
  createdAt: string;            // ISO 8601 timestamp
  privacy: 'public' | 'private';
}

interface Article {
  id: string;
  title: string;
  url: string;
  summary: string;
  publishedAt: string;          // ISO 8601
  source: 'suntimes' | 'wbez';
  imageUrl?: string;
  neighborhoods: string[];      // keyword-matched community area names
}

// ── App state ──────────────────────────────────────────────────
interface AppState {
  // Seed data — reset to this on session reset
  guides: Guide[];              // seeded guides + any session-created guides
  users: User[];
  
  // Current user (always Alex Rivera for prototype)
  currentUser: User;
  
  // Feed preferences — used for feed ordering and sidebar filter UI
  feedPreferences: {
    selectedNeighborhoods: string[];   // default: ["Lincoln Square", "Logan Square", "Avondale"]
    selectedCategories: GuideCategory[];  // default: ["Food & Drink", "Live Music", "Parks"]
  };
  
  // RSS articles — populated by useRssFeed hook after load
  articles: Article[];
  articlesLoading: boolean;
  articlesError: boolean;
  
  // Community areas — populated by useCommunityAreas hook after load
  communityAreas: CommunityArea[];   // { id, name, slug, population?, adjacentAreas? }
  communityAreasGeoJSON: GeoJSON.FeatureCollection | null;
  communityAreasLoading: boolean;
  
  // Local UI state (non-persistent)
  likedIds: Set<string>;         // guide and article ids liked in this session
  savedIds: Set<string>;         // guide ids saved in this session
  shareModalOpen: boolean;
  shareModalUrl: string;
  
  // Session-created guides — tracked separately for reset behavior
  sessionGuideIds: string[];    // ids of guides created this session
}
```

### 4.2 Reducer Action Types

| Action Type | Payload | What it does |
|---|---|---|
| `LOAD_ARTICLES` | `{ articles: Article[] }` | Replaces `state.articles`, sets `articlesLoading: false` |
| `SET_ARTICLES_LOADING` | none | Sets `articlesLoading: true` |
| `SET_ARTICLES_ERROR` | none | Sets `articlesError: true, articlesLoading: false` |
| `LOAD_COMMUNITY_AREAS` | `{ areas, geoJSON }` | Sets `communityAreas`, `communityAreasGeoJSON`, `communityAreasLoading: false` |
| `SET_COMMUNITY_AREAS_LOADING` | none | Sets `communityAreasLoading: true` |
| `ADD_GUIDE` | `{ guide: Guide }` | Appends guide to `state.guides`, adds `guide.id` to `sessionGuideIds` |
| `TOGGLE_NEIGHBORHOOD_FILTER` | `{ neighborhood: string }` | Adds or removes the neighborhood from `feedPreferences.selectedNeighborhoods` |
| `TOGGLE_CATEGORY_FILTER` | `{ category: GuideCategory }` | Adds or removes the category from `feedPreferences.selectedCategories` |
| `TOGGLE_LIKE` | `{ id: string }` | Adds or removes id from `likedIds`; increments or decrements the matching guide/article's `likeCount` by 1 |
| `TOGGLE_SAVE` | `{ id: string }` | Adds or removes id from `savedIds` |
| `OPEN_SHARE_MODAL` | `{ url: string }` | Sets `shareModalOpen: true`, `shareModalUrl: url` |
| `CLOSE_SHARE_MODAL` | none | Sets `shareModalOpen: false` |
| `RESET_SESSION` | none | Resets `guides` to seed data only (removes all `sessionGuideIds`), clears `likedIds`, `savedIds`, `articles`, `sessionGuideIds`. Resets `feedPreferences` to defaults. Does NOT reload the page — pure state reset. |

### 4.3 Which Components Read From State

| State slice | Components that read it |
|---|---|
| `guides` | `FeedPage`, `GuideDetailPage`, `GuideRemixPage`, `NeighborhoodPage`, `ProfilePage`, `ExplorePage`, `GuideCard` |
| `currentUser` | `Header`, `ProfilePage` (when handle matches), `FeedPage` (for feed preferences defaults) |
| `feedPreferences` | `FeedPage`, `NeighborhoodFilter`, `CategoryFilter` |
| `articles` | `FeedPage`, `NeighborhoodPage`, `ExplorePage` |
| `articlesLoading` | `FeedPage` (for skeleton state) |
| `communityAreas` | `GuideCreatePage`, `GuideRemixPage`, `ExplorePage`, `NeighborhoodPage`, `Select` (neighborhood dropdown) |
| `communityAreasGeoJSON` | `NeighborhoodMap` |
| `likedIds` | `GuideCard`, `ArticleCard`, `GuideDetailPage` |
| `savedIds` | `GuideDetailPage`, `ProfilePage` (Saved tab) |
| `shareModalOpen` / `shareModalUrl` | `ShareModal` |
| `sessionGuideIds` | Used only by `RESET_SESSION` logic — not read directly by UI components |

### 4.4 Session-Created Guide Storage and Reset

When a user creates or remixes a guide, `ADD_GUIDE` is dispatched. The guide object has `isSessionCreated: true` and its id is appended to `sessionGuideIds`. The guide is immediately available in `state.guides`, so `GuideDetailPage` can load it by id.

When `RESET_SESSION` fires (from `?reset=true` URL param or `Shift+R` keyboard shortcut), the reducer:
1. Filters `state.guides` to remove any guide whose `id` is in `state.sessionGuideIds`
2. Clears `sessionGuideIds: []`
3. Clears `likedIds: new Set()`
4. Clears `savedIds: new Set()`
5. Resets `feedPreferences` to the defaults (Lincoln Square + adjacent neighborhoods, Alex Rivera's interest categories)
6. Clears `articles: []` (RSS will re-fetch on next render)

The initial state object is defined as a constant `INITIAL_STATE` in `AppReducer.js`. The `RESET_SESSION` case returns `{ ...INITIAL_STATE }`. This makes the reset logic trivial and impossible to get wrong.

---

## 5. Component Inventory

All components listed by page/feature area. For each: name, props interface, and whether it reads from AppContext.

### Layout Components

**`Header`**
```typescript
// Props: none (reads everything from AppContext)
// AppContext: reads currentUser, communityAreas (for Neighborhoods dropdown)
```

**`Footer`**
```typescript
// Props: none
// AppContext: no
```

**`Layout`**
```typescript
interface Props { children: React.ReactNode; }
// AppContext: no
```

**`ErrorBoundary`**
```typescript
interface Props { children: React.ReactNode; }
// AppContext: no — must not depend on context (error may be in context itself)
```

### Feed Page Components

**`FeedHero`**
```typescript
// Props: none
// AppContext: no — static decorative element
```

**`FeedDisclosure`**
```typescript
// Props: none
// AppContext: reads feedPreferences (to explain current ordering to user)
```

**`NeighborhoodFilter`**
```typescript
// Props: none
// AppContext: reads feedPreferences.selectedNeighborhoods, communityAreas; dispatches TOGGLE_NEIGHBORHOOD_FILTER
```

**`CategoryFilter`**
```typescript
// Props: none
// AppContext: reads feedPreferences.selectedCategories; dispatches TOGGLE_CATEGORY_FILTER
```

**`GuideCard`**
```typescript
interface Props {
  guide: Guide;
  showRemixButton?: boolean;   // defaults true
}
// AppContext: reads likedIds; dispatches TOGGLE_LIKE, OPEN_SHARE_MODAL
```

**`ArticleCard`**
```typescript
interface Props { article: Article; }
// AppContext: reads likedIds; dispatches TOGGLE_LIKE, OPEN_SHARE_MODAL
```

**`SkeletonCard`**
```typescript
interface Props { variant?: 'guide' | 'article'; }  // defaults 'guide'
// AppContext: no
```

**`ShareModal`**
```typescript
// Props: none
// AppContext: reads shareModalOpen, shareModalUrl; dispatches CLOSE_SHARE_MODAL
```

### Guide Detail Components

**`GuideHero`**
```typescript
interface Props {
  guide: Guide;
  author: User;
}
// AppContext: no — receives all needed data as props
```

**`PlaceListItem`**
```typescript
interface Props { place: Place; index: number; }
// AppContext: no
```

**`LeafletMap`**
```typescript
interface Props {
  places: Place[];
  center?: { lat: number; lng: number };  // defaults to Chicago center
  zoom?: number;
}
// AppContext: no
```

**`RemixAttribution`**
```typescript
interface Props {
  originalGuideId: string;
  originalGuideTitle: string;
  originalAuthorHandle: string;
}
// AppContext: no — receives attribution data as props
```

**`SuccessBanner`**
```typescript
interface Props { message: string; }
// AppContext: no
```

### Guide Creation / Remix Components

**`PhotoPicker`**
```typescript
interface Props {
  selectedUrl: string | null;
  onSelect: (url: string) => void;
}
// AppContext: no
```

**`PlaceSearchResult`**
```typescript
interface Props {
  place: GooglePlacesResult;  // { id, name, address, category, rating }
  onAdd: (place: GooglePlacesResult) => void;
  alreadyAdded: boolean;
}
// AppContext: no
```

**`AddedPlaceRow`**
```typescript
interface Props {
  place: Place;
  index: number;
  onRemove: (id: string) => void;
  onNoteChange: (id: string, note: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
}
// AppContext: no
```

**`RemixBanner`**
```typescript
interface Props {
  originalTitle: string;
  originalAuthorHandle: string;
}
// AppContext: no
```

### Neighborhood Components

**`NeighborhoodMap`**
```typescript
interface Props {
  neighborhoodName: string;
  geoJSON: GeoJSON.FeatureCollection;
}
// AppContext: no
```

**`NeighborhoodCard`**
```typescript
interface Props {
  name: string;
  slug: string;
  guideCount: number;
}
// AppContext: no
```

**`NeighborhoodStats`**
```typescript
interface Props {
  population?: number;
  adjacentAreas: string[];
}
// AppContext: no
```

### Profile Components

**`ProfileHeader`**
```typescript
interface Props { user: User; }
// AppContext: no
```

**`ProfileTabs`**
```typescript
interface Props {
  guides: Guide[];
  remixes: Guide[];
  savedGuides: Guide[];
  activeTab: 'guides' | 'remixes' | 'saved';
  onTabChange: (tab: 'guides' | 'remixes' | 'saved') => void;
}
// AppContext: no — receives all data as props from ProfilePage
```

### Shared / UI Components

**`StarIcon`**
```typescript
interface Props {
  size?: number;        // defaults 16
  color?: string;       // defaults --red
  className?: string;
}
// AppContext: no
```

**`NeighborhoodTag`**
```typescript
interface Props { name: string; linkable?: boolean; }
// AppContext: no
```

**`CategoryBadge`**
```typescript
interface Props { category: GuideCategory; size?: 'sm' | 'md'; }
// AppContext: no
```

**`Button`**
```typescript
interface Props {
  variant: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit';
  as?: 'button' | 'a';
  href?: string;  // when as='a'
}
// AppContext: no
```

**`TextInput`**
```typescript
interface Props {
  label: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
}
// AppContext: no
```

**`Textarea`**
```typescript
interface Props {
  label: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  placeholder?: string;
  error?: string;
}
// AppContext: no
```

**`Select`**
```typescript
interface Props {
  label: string;
  id: string;
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}
// AppContext: no
```

**`Toggle`**
```typescript
interface Props {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  onLabel?: string;   // defaults "Public"
  offLabel?: string;  // defaults "Private"
}
// AppContext: no
```

**`Spinner`**
```typescript
interface Props { size?: 'sm' | 'md'; label?: string; }
// AppContext: no
```

---

## 6. API Integration Specs

### 6.1 Google Places Text Search

**Used in:** Guide creation Step 2 (`GuideCreatePage`, via `usePlacesSearch` hook)

**When called:** User types in the "Search for a place in Chicago..." input (debounced 400ms)

**Request:**
```
POST https://places.googleapis.com/v1/places:searchText
Headers:
  Content-Type: application/json
  X-Goog-Api-Key: {VITE_GOOGLE_PLACES_API_KEY}
  X-Goog-FieldMask: places.id,places.displayName,places.formattedAddress,places.types,places.rating,places.userRatingCount,places.photos,places.location

Body:
{
  "textQuery": "{userInput}",
  "locationBias": {
    "circle": {
      "center": { "latitude": 41.8781, "longitude": -87.6298 },
      "radius": 40000.0
    }
  },
  "maxResultCount": 8
}
```

**Normalized response shape (what the hook returns):**
```typescript
interface PlacesSearchResult {
  id: string;                  // places[n].id
  name: string;                // places[n].displayName.text
  address: string;             // places[n].formattedAddress
  category: PlaceCategory;     // derived from places[n].types[0] — see mapping below
  rating: number | null;       // places[n].rating
  ratingCount: number | null;  // places[n].userRatingCount
  photoUrl: string | null;     // constructed from places[n].photos[0].name if present
  lat: number | null;          // places[n].location.latitude — used for Leaflet map pins
  lng: number | null;          // places[n].location.longitude
}
```

**Important:** All fields above must be stored on the Place object when a user adds a place during guide creation — not just used for display in search results. This ensures that user-created guides have real `placeId`, `rating`, `ratingCount`, and coordinates, exactly like seeded guides. The "View on Google Maps →" link and Leaflet pin will work automatically for any guide created during testing.
```

**Types-to-category mapping:**
```
'restaurant' → 'restaurant'
'cafe' or 'coffee_shop' → 'cafe'
'bar' or 'night_club' → 'bar'
'music' in types → 'music_venue'
'park' → 'park'
'museum' or 'art_gallery' → 'cultural_institution'
everything else → 'other'
```

**Error behavior:** If request fails or returns `error`, `usePlacesSearch` returns `{ results: [], error: true }`. `GuideCreatePage` renders "Search unavailable — try a different term" inline.

**Fallback:** If `VITE_GOOGLE_PLACES_API_KEY` is empty at runtime, `usePlacesSearch` returns a filtered subset of the seeded places array matching the query string.

---

### 6.2 Google Maps Static API

**Used in:** `GuideCard` and `GuideDetailPage` as fallback cover image when `guide.coverImage` is null

**When called:** At render time, as an `<img>` src attribute — no JavaScript fetch required

**URL template:**
```
https://maps.googleapis.com/maps/api/staticmap
  ?center={lat},{lng}
  &zoom=15
  &size=800x400
  &scale=2
  &markers=color:red|{lat},{lng}
  &style=feature:all|saturation:-20
  &key={VITE_GOOGLE_PLACES_API_KEY}
```

Where `{lat}` and `{lng}` come from the guide's first place (`guide.places[0].lat`, `guide.places[0].lng`). If no place has coordinates, center on Chicago (`41.8781,-87.6298`).

**Implementation note:** This is a simple `<img>` tag — no hook needed. Construct the URL in `GuideCard.jsx` and `GuideHero.jsx` inline.

---

### 6.3 Socrata Community Areas

**Used in:** `useCommunityAreas` hook, consumed by `GuideCreatePage` (dropdown), `NeighborhoodPage` (boundary map), `ExplorePage` (neighborhood grid)

**Tabular endpoint (called once on app init):**
```
GET https://data.cityofchicago.org/resource/igwz-8jzy.json
  ?$$app_token={VITE_CHICAGO_DATA_PORTAL_TOKEN}
  &$limit=100
```

**GeoJSON endpoint (called once on app init, same request timing):**
```
GET https://data.cityofchicago.org/resource/igwz-8jzy.geojson
  ?$$app_token={VITE_CHICAGO_DATA_PORTAL_TOKEN}
```

**Both requests are made in parallel with `Promise.all` inside `useCommunityAreas`.**

**Normalized area shape (what the hook stores in state):**
```typescript
interface CommunityArea {
  id: string;                  // community_area field (e.g., "4")
  name: string;                // title-cased from uppercase — "Lincoln Square"
  nameUppercase: string;       // original uppercase — "LINCOLN SQUARE"
  slug: string;                // URL-safe — "lincoln-square"
  population?: number;
  shape_area?: string;
}
```

**GeoJSON stored as-is** in `state.communityAreasGeoJSON`. Individual neighborhood features are extracted by matching `feature.properties.community` against area names in `NeighborhoodMap`.

**Fallback:** If either fetch fails, `useCommunityAreas` dispatches `LOAD_COMMUNITY_AREAS` with data parsed from the committed `neighborhoods-fallback.json` file. GeoJSON in the fallback file enables the boundary map. The hook never rejects — it always resolves to either live data or fallback data.

---

### 6.4 Express RSS Proxy

**Deployed at:** Railway service `keeley-and-archer-server` (second service in the project)

**Dev proxy:** Vite config proxies `/api` → `http://localhost:3001` during local development

#### Routes

**`GET /api/rss?source=suntimes`**
**`GET /api/rss?source=wbez`**

**What each route does:**
1. Validates the `source` query param — returns 400 if not `suntimes` or `wbez`
2. Sets the upstream URL from a hardcoded map:
   - `suntimes` → `https://chicago.suntimes.com/rss/index.xml`
   - `wbez` → `https://www.wbez.org/rss/index.xml`
3. Fetches the upstream RSS XML with `node-fetch` (or built-in `fetch` in Node 20)
4. Parses XML with `fast-xml-parser`
5. Normalizes each `<item>` to the article shape
6. Tags each article with matching neighborhoods (keyword match against all 77 area names)
7. Returns JSON array

**Response shape:**
```typescript
// HTTP 200 — JSON array
Article[]

// HTTP 400
{ "error": "Invalid source. Use suntimes or wbez." }

// HTTP 500 (upstream fetch failed)
{ "error": "Failed to fetch RSS feed." }
```

**Normalized article construction from RSS fields:**
```
id:           MD5 or SHA1 of item.link (or item.guid if available)
title:        item.title
url:          item.link
summary:      item.description — strip HTML tags
publishedAt:  item.pubDate — parse to ISO 8601
source:       from query param
imageUrl:     item['media:content']?.url or item.enclosure?.url or null
neighborhoods: keyword-match title + summary against all 77 community area names
```

**CORS configuration:** The Express server sets `Access-Control-Allow-Origin` to the Railway frontend domain and `localhost:5173`. Do not use `*` in production.

**Server port:** The Express server listens on `process.env.PORT || 3001`. Railway sets `PORT` automatically.

---

## 7. Seed Data Plan

This section specifies the content to generate — not the JSON itself. An agent should be able to produce the complete `seed.js` file from this specification.

### 7.1 Users (8 accounts)

All handles are lowercase, no spaces. Domain suffix is applied at render time based on `isJournalist` flag.

| Display Name | Handle | Neighborhood | Years | Interest Badges | Journalist? | Publication |
|---|---|---|---|---|---|---|
| Alex Rivera | `alexrivera` | Lincoln Square | 7 | Food & Drink, Live Music, Parks | No | — |
| Keisha Washington | `keishawashington` | Bronzeville | 12 | Culture, History, Food & Drink | No | — |
| Marco Delgado | `marcodelgado` | Pilsen | 4 | Food & Drink, Culture, Shopping | No | — |
| Priya Nair | `priyanair` | Hyde Park | 9 | Parks, History, Family | No | — |
| Tyler Kowalski | `tylerkowalski` | Wicker Park | 3 | Live Music, Nightlife, Coffee | No | — |
| Sofia Reyes | `sofiareyes` | Logan Square | 6 | Food & Drink, Coffee, Shopping | No | — |
| Ellery Jones | `ellery` | Near North Side | 11 | Culture, History, Food & Drink | Yes | Chicago Sun-Times |
| Al Keefe | `alkeefe` | Rogers Park | 8 | Parks, Live Music, Culture | Yes | WBEZ |

**Note on journalist handles:** Per requirements Section 11, journalist accounts are `@ellery.chicago.com` and `@alkeefe.chicago.com` in the seed data (the `handle` field is just the slug). The rendered handle shown in the UI adds the domain suffix. The `.suntimes.com` / `.wbez.org` domain format described in the design system is the long-term ATProto vision — for this prototype, journalist accounts use `@handle.chicago.com` but carry a "★ From the newsroom" badge and publication name.

### 7.2 Guides (20 minimum, targeting 22)

Organized by neighborhood. Each guide has 3–7 places. Unsplash photo IDs should be realistic Chicago scenes. The agent should use public Unsplash photo IDs that are known to exist (architectural photos, street scenes, food photos, park scenes).

| # | Title | Author Handle | Neighborhood | Categories | Place Count | isEditorsPick | remixOf | Notes |
|---|---|---|---|---|---|---|---|---|
| 1 | "The Essential Lincoln Square" | alexrivera | Lincoln Square | Food & Drink, Culture | 6 | true | — | Covers main drag on Lincoln Ave |
| 2 | "Late Night Lincoln Square" | tylerkowalski | Lincoln Square | Live Music, Nightlife | 4 | false | guide-01 | Remix of guide 1 — nightlife fork |
| 3 | "Best Brunch in Logan Square" | sofiareyes | Logan Square | Food & Drink, Coffee | 5 | true | — | Local institutions |
| 4 | "Logan Square With Kids" | priyanair | Logan Square | Family, Parks | 4 | false | guide-03 | Remix of guide 3 — family focus fork |
| 5 | "Pilsen Art Walk" | marcodelgado | Pilsen | Culture, History | 6 | true | — | Murals, galleries, studios |
| 6 | "Pilsen After Dark" | ellery | Pilsen | Food & Drink, Nightlife | 5 | false | — | Journalist guide — "From the newsroom" |
| 7 | "Hyde Park Classics" | priyanair | Hyde Park | History, Culture | 6 | false | — | University and neighborhood institutions |
| 8 | "Hyde Park Green Spaces" | alkeefe | Hyde Park | Parks, Family | 4 | true | — | Journalist guide — "From the newsroom" |
| 9 | "Wicker Park Record Stores & Bars" | tylerkowalski | Wicker Park | Live Music, Shopping, Nightlife | 5 | false | — | |
| 10 | "Wicker Park Coffee Circuit" | sofiareyes | Wicker Park | Coffee, Shopping | 4 | false | guide-09 | Remix of guide 9 — daytime fork |
| 11 | "Bronzeville Cultural Trail" | keishawashington | Bronzeville | Culture, History | 7 | true | — | Historic Black Chicago institutions |
| 12 | "Bronzeville Soul Food" | keishawashington | Bronzeville | Food & Drink | 5 | false | — | |
| 13 | "Andersonville International Block" | alexrivera | Andersonville | Food & Drink, Shopping | 5 | false | — | |
| 14 | "Chinatown Essential Eats" | marcodelgado | Chinatown | Food & Drink, Shopping | 6 | false | — | |
| 15 | "Riverwalk Runs & Rests" | priyanair | Loop | Parks, Food & Drink | 4 | false | — | Architecture walk variant |
| 16 | "South Shore Lakefront" | keishawashington | South Shore | Parks, Culture | 5 | false | — | |
| 17 | "Humboldt Park Community Picks" | marcodelgado | Humboldt Park | Food & Drink, Parks, Culture | 5 | false | — | |
| 18 | "Ukrainian Village Hidden Gems" | sofiareyes | Ukrainian Village | Food & Drink, Culture | 4 | false | — | |
| 19 | "Uptown Music History" | alkeefe | Uptown | Live Music, History, Culture | 6 | false | — | Jazz/blues history angle, journalist guide |
| 20 | "Rogers Park Beach Day" | alkeefe | Rogers Park | Parks, Food & Drink | 4 | false | — | Journalist guide — "From the newsroom" |
| 21 | "Little Village Bakeries" | marcodelgado | Little Village | Food & Drink | 5 | false | — | |
| 22 | "Woodlawn Right Now" | keishawashington | Woodlawn | Culture, History, Food & Drink | 5 | false | — | South Side neighborhood in transition — Obama Presidential Center, longtime institutions, new businesses |
| 23 | "Bronzeville Night Out" | marcodelgado | Bronzeville | Culture, Nightlife, Food & Drink | 5 | false | guide-11 | Added per task 3.5 — 4th required remix chain; forks Keisha's Bronzeville Cultural Trail with an after-dark focus |
| 24 | "Beverly: The Far Southwest Side You Haven't Visited" | alkeefe | Beverly | Food & Drink, Bars | 6 | false | — | Added for SW side geographic balance — journalist guide, Al Keefe / WBEZ |
| 25 | "Back of the Yards: History and Coffee" | marcodelgado | Back of the Yards | Food & Drink, History | 4 | true | — | Added for SW side geographic balance; Editor's Pick |
| 26 | "Bridgeport: Old Chicago, Chinatown-Adjacent" | ellery | Bridgeport | Food & Drink, Nightlife | 4 | false | — | Added for SW side geographic balance — journalist guide, Ellery / Sun-Times |

**Remix chains present:**
- Guide 2 remixes Guide 1 (Lincoln Square nightlife fork)
- Guide 4 remixes Guide 3 (Logan Square family fork)
- Guide 10 remixes Guide 9 (Wicker Park daytime fork)
- Guide 23 remixes Guide 11 (Bronzeville night-out fork — added per task 3.5)

**Editor's Picks (6 total, meeting the "at least 4" requirement):**
Guides 1, 3, 5, 8, 11, 25

**Journalist guides ("From the newsroom"):**
Guides 6 (Ellery / Sun-Times), 8 (Al Keefe / WBEZ), 19 (Al Keefe / WBEZ), 20 (Al Keefe / WBEZ), 24 (Al Keefe / WBEZ), 26 (Ellery / Sun-Times)

### 7.3 Places (80 minimum)

The agent should populate each guide with 3–7 real Chicago businesses or locations. For each place, use:
- A real business name
- A real street address (exact address is not critical for prototype; neighborhood/street accuracy is)
- The appropriate `category` enum value
- A rating between 3.5 and 5.0
- A 1–2 sentence `editorNote` written in first person from the guide author's perspective
- An Unsplash photo ID for `coverImage` (food photos, exterior shots, park scenes — use known IDs)

Required places per neighborhood to hit the 80-place target at the guide counts above: The agent should aim for an average of 5 places per guide across all 22 guides (= 110 places, comfortably above the 80-place minimum).

### 7.4 Unsplash Photo IDs for Guides

The agent should use the following categories of Unsplash photos for guide `coverImage` fields. These are representative public photo IDs on Unsplash that are freely accessible:

- Chicago architecture exterior: photos of the Chicago skyline, lake, riverwalk
- Food/restaurant interior: moody restaurant shots
- Park/outdoor: green spaces, lakefront
- Music/bar: live music venue interiors
- Neighborhood streets: colorful two-flats, murals

Format: `https://images.unsplash.com/photo-{ID}?w=800&auto=format&fit=crop`

The agent should select 20–25 distinct Unsplash photo IDs and assign them to guides. Reuse is acceptable across guides when thematic fit is strong (e.g., two food guides can share a food photo).

### 7.5 PhotoPicker Gallery (for Guide Creation)

The `PhotoPicker` component in guide creation needs a curated list of ~20 Unsplash photos. The agent should generate this as a constant array in `PhotoPicker.jsx` or a separate `src/data/unsplashPhotos.js` file. Each entry: `{ id, url, alt }`. Themes:
- Chicago skyline / architecture (4–5 photos)
- Neighborhood street scenes (3–4)
- Food / restaurant interiors (4–5)
- Parks / lakefront (3–4)
- Music / nightlife (2–3)

---

## 8. Deployment Checklist

Complete these steps in order. Steps marked "Railway dashboard" require browser access to [railway.app](https://railway.app).

### 8.1 Push Code to GitHub

```bash
cd /path/to/keeley-and-archer
git status                          # confirm no .env in staged files
git add client server docs .env.example
git commit -m "feat: initial prototype build"
git push origin main
```

### 8.2 Create Railway Services

1. Log in to [railway.app](https://railway.app) and open the `keeley-and-archer` project (already created per requirements Section 11).
2. Click **New Service** → **GitHub Repo** → select `Banner9870/keeley-and-archer`.
3. Create the **first service** (React frontend):
   - Service name: `chicago-com-frontend`
   - **Root directory:** type `/client` in the "Root Directory" field (look for it under the service settings after creation — it is the folder Railway builds from). If left blank, Railway builds from the repo root and will not find the Vite config.
   - Build command: `npm install && npm run build`
   - Start command: leave blank — Railway detects the `Caddyfile` in `client/` and serves with Caddy automatically. The `Caddyfile` is required for SPA routing; without it every URL except `/` returns a 404.
4. Create the **second service** (Express proxy):
   - Service name: `chicago-com-server`
   - **Root directory:** type `/server`
   - Build command: `npm install`
   - Start command: `node index.js`
5. **Generate public domains for both services:** After each service deploys, go to the service → **Settings** tab → **Networking** → click **Generate Domain**. Railway services are private by default — this step is required before either service is accessible in a browser. Copy both URLs — you will need them for environment variables in step 8.3.
6. **If a deploy fails:** View build logs by clicking the service → **Deployments** tab → click the failed deployment → read the build output. After fixing the issue, push a new commit to GitHub to trigger a redeploy, or click the **Redeploy** button in the Deployments tab. If you push a fix with `git push origin main`, Railway picks it up automatically within ~30 seconds.

### 8.3 Set Environment Variables in Railway Dashboard

For the **frontend service** (`chicago-com-frontend`), go to Variables and add:
```
VITE_GOOGLE_PLACES_API_KEY=your_google_places_api_key_here
VITE_CHICAGO_DATA_PORTAL_TOKEN=your_socrata_token_here
```

For the **server service** (`chicago-com-server`), add:
```
ALLOWED_ORIGIN=https://your-frontend.up.railway.app   ← replace with the actual frontend URL from step 8.2.5
PORT=3001
```
Railway sets `PORT` automatically, but setting it explicitly avoids confusion. After adding `ALLOWED_ORIGIN`, the server must be **redeployed** — click Redeploy in the Deployments tab. Without this value, the Express CORS config will only allow `localhost:5173` and all API calls from the live frontend will fail with a CORS error.

**Also required after setting ALLOWED_ORIGIN:** add `VITE_API_BASE_URL` to the frontend service:
```
VITE_API_BASE_URL=https://your-server.up.railway.app   ← replace with the actual server URL from step 8.2.5
```
Then redeploy the frontend service too. Both services must be redeployed after setting these variables.

### 8.4 Update Vite Config for Production API URL

The `vite.config.js` dev proxy (`/api` → `localhost:3001`) only works in development. For production, the React app must know the Railway URL of the Express server.

Add to Railway frontend variables:
```
VITE_API_BASE_URL=https://your-server.up.railway.app
```

In the React app, the RSS fetch call should use:
```javascript
const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
fetch(`${baseUrl}/api/rss?source=suntimes`)
```

An empty string default means `fetch('/api/rss...')` which the Vite proxy handles locally.

### 8.5 Trigger First Deploy

Railway deploys automatically on GitHub push. Watch the build logs in the Railway dashboard for both services.

**How to view build logs:** Click the service → **Deployments** tab → click the most recent deployment entry → the build output streams in real time. A successful build ends with a green "Deploy successful" message. A failed build shows a red error and the last line of output before the failure.

**Common issues and fixes:**
- **Frontend build fails — "vite: not found":** `client/package.json` is missing a `build` script. It should be: `"build": "vite build"`. Fix and push.
- **Frontend deploys but every route returns 404:** The `client/Caddyfile` is missing or in the wrong location. It must be at `client/Caddyfile` (same level as `client/package.json`). Fix and push.
- **Express fails to start — "Cannot find module":** A dependency is missing from `server/package.json`. Check the Railway logs for the module name, add it with `npm install <package>` in the `/server` directory, commit, and push.
- **API calls fail in production with CORS errors:** `ALLOWED_ORIGIN` environment variable on the server service is not set or doesn't match the frontend URL exactly (including `https://` and no trailing slash). Double-check both values and redeploy.

### 8.6 Verify robots.txt

After the frontend deploys, visit:
```
https://your-frontend.up.railway.app/robots.txt
```

Expected content:
```
User-agent: *
Disallow: /
```

If the file is missing, verify it is in `client/public/robots.txt` (Vite copies the `public/` directory to the root of the build output).

### 8.7 Restrict Google Places API Key

This step must happen after the Railway URL is known and confirmed.

1. Go to [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials.
2. Click on the API key you use for this project.
3. Under "Application restrictions," select **HTTP referrers (websites)**.
4. Add these referrers:
   ```
   https://your-frontend.up.railway.app/*
   http://localhost:5173/*
   http://localhost:4173/*
   ```
5. Save.

**Important:** Until this step, the key accepts requests from any domain. Do not share the Railway URL publicly before restricting the key.

### 8.8 Final Smoke Test Checklist

Test each item manually in a browser. Use both a desktop and a phone.

- [ ] Visit the Railway URL — app loads without errors, redirects to `/feed`
- [ ] Feed shows at least 6 guide cards and at least 1 article card
- [ ] At least 1 Editor's Pick badge is visible in the feed
- [ ] Neighborhood filter chips in the sidebar filter the feed
- [ ] Clicking a guide card navigates to the guide detail page
- [ ] Guide detail shows cover image, places list, Leaflet map with pins
- [ ] Clicking "Remix this guide" opens the remix flow pre-populated with the original guide
- [ ] Complete the remix flow (change title, save) — verify the remixed guide appears with attribution
- [ ] Navigate to `/guide/new` — complete guide creation with a Places search (search for "pizza chicago") — verify Places results appear
- [ ] Complete guide creation (add 2 places, save) — verify the new guide detail page loads with success banner
- [ ] Navigate to `/neighborhood/lincoln-square` — neighborhood boundary map loads, guides appear
- [ ] Navigate to `/explore` — neighborhood grid shows, trending guides appear
- [ ] Navigate to `/profile/alexrivera` — Alex Rivera's profile loads with guide tab
- [ ] Session reset: visit `/?reset=true` — session-created guides are gone, feed is back to seed data
- [ ] Mobile: complete guide creation flow on phone viewport — all steps are usable with touch
- [ ] `robots.txt` returns correct noindex content
- [ ] 404 page: visit `/nonexistent` — Not Found page appears with link to feed

---

## 9. Documentation Plan

Both documentation files should be drafted in parallel with the final phases of the build. Below is the recommended timing for when each section should be written, cross-referenced against build phases.

### 9.1 Moderator Guide (`docs/moderator-guide.md`)

**When to write:** Draft after Phase 7 is complete (both functional flows — create and remix — are working). Finalize and review after Phase 9 (polish complete). Commit with Phase 10.

| Section | Write after | Content |
|---|---|---|
| "What the prototype is and isn't" | Phase 2 (routing/shell done) | One paragraph: sets expectations. Prototype demonstrates browsing, creating, and remixing guides. Login, likes, follows, shares are simulated. |
| "How to open the prototype and share the URL" | Phase 11 (Railway URL known) | The Railway URL, how to open it in a browser or on a phone, how to send it to a participant |
| "How to reset between participants" | Phase 2 (reset implemented) | Plain language: visit `/?reset=true` at the end of each session. Explain what resets (guides created, likes) and what doesn't (the underlying content). |
| "Five key things a participant can do" | Phase 5 (core pages done) | Browse feed, view a guide, create a guide, remix a guide, view a profile — with the exact path/URL for each |
| "What to expect from create and remix flows" | Phase 7 (both flows complete) | Step-by-step walkthrough of each flow from the moderator's perspective — what the participant sees at each step |
| "Which interactions are non-functional" | Phase 9 (polish done) | Definitive list: likes, shares, follows, comments, privacy toggle enforcement. Suggested language for moderator response |
| "How to navigate to specific content" | Phase 3 (seed data done) | Guide IDs and neighborhood slugs for specific content the moderator may want to direct a participant to |
| Troubleshooting | Phase 11 | Blank screen, search returns nothing, page doesn't load — practical steps for each |

**Tone reminder for agent:** Plain language, no technical jargon. Write as if explaining to a smart non-technical colleague. The moderator should be able to read the whole guide in under 10 minutes.

### 9.2 Technical Guide (`docs/technical-guide.md`)

**When to write:** Draft the architecture decisions section during Phase 1–2 while those decisions are fresh. Draft deployment section immediately after Phase 11. Full document review and finalization with Phase 10.

| Section | Write after | Content |
|---|---|---|
| "What the prototype demonstrates and what was deferred" | Phase 2 | Link to requirements.md Section 10 (Out of Scope). Call out the ATProto intent. |
| "Repository structure" | Phase 2 | Directory map matching Section 2 of this plan. One sentence per directory/file. |
| "Local development setup" | Phase 1 | Clone, copy `.env.example`, fill in keys, `npm install` in client + server, `npm run dev` from root. Include the concurrently command. |
| "Environment variables" | Phase 1 | VITE_GOOGLE_PLACES_API_KEY (required for guide creation), VITE_CHICAGO_DATA_PORTAL_TOKEN (optional, rate-limit benefit). Where to get each value. |
| "Architecture decisions" | Phase 1–2 | Five decisions from requirements Section 9.2: Vite vs CRA, react-leaflet vs Google Maps, Express proxy for RSS, Context + useReducer vs database, ATProto long-term vision |
| "Seed data" | Phase 3 | Where seed.js lives, the schema (types from Section 4), how to add new guides/users/places, how to add a neighborhood to required coverage |
| "Deployment" | Phase 11 | The two Railway services, environment variables in Railway dashboard, how to trigger a redeploy from GitHub, how to restrict the Places API key (can reference Section 8 of this plan) |
| "Known limitations and next steps" | Phase 11 | What changes for production: auth, database, Cloudinary media, ATProto integration. Prototype shortcuts taken. |

**Audience reminder for agent:** Engineers and product managers comfortable with web development but not necessarily familiar with this specific stack. Explain the "why" behind architectural decisions, not just the "what."

---

## Decisions Log

Decisions resolved before build began:

1. ~~**Wordmark:**~~ **Resolved — build from scratch.** No existing brand assets. The agent should design the wordmark using Big Shoulders Display 900 weight, uppercase, with a six-pointed ★ motif integrated into the logotype. See Phase 1, task 1.3.

2. ~~**Seed data review:**~~ **Resolved — Ellery has reviewed the 22 guide titles and confirmed.** Journalist accounts are Ellery Jones (`@ellery.suntimes.com`) and Al Keefe (`@alkeefe.wbez.org`). Proceed to generate seed data in Phase 3.

3. **Socrata App Token:** Deferred — Ellery will add to `.env` when available. Build proceeds without it. Rate limiting may cause intermittent failures on neighborhood pages under load. Add before sharing the URL with participants.

4. ~~**Place reordering in guide builder:**~~ **Resolved — arrow buttons.** No drag-and-drop in the prototype.

Decisions still required during the build:

5. **After Phase 1 (design review checkpoint):** Ellery must review the rendered typography specimen and design system page before Phase 2 begins. Changes to font sizes, weights, or color tokens are low-cost now and high-cost after 30+ components are built.

6. **After Phase 11 (Railway URL known):** Ellery must restrict the Google Places API key in Google Cloud Console to the Railway domain + `localhost`. The key must not remain unrestricted once the URL is known. Instructions are in the deployment checklist (Section 8.7).

---

### Critical Files for Implementation

- `/Users/ejones/Documents/keeley-and-archer/client/src/context/AppReducer.js` — the reducer defines the entire state shape and must be built first; all component work depends on the action types defined here
- `/Users/ejones/Documents/keeley-and-archer/client/src/data/seed.js` — the master seed data file powers every page; must be complete before any page component can render realistic content
- `/Users/ejones/Documents/keeley-and-archer/client/src/App.jsx` — the root component wires together the Router, AppProvider, Layout, and all route declarations; the exact route order (especially `/guide/new` before `/guide/:id`) is a functional requirement
- `/Users/ejones/Documents/keeley-and-archer/server/index.js` — the Express RSS proxy is a hard dependency for the article cards in the feed; must be working before Feed page integration work begins
- `/Users/ejones/Documents/keeley-and-archer/client/vite.config.js` — the dev proxy configuration that routes `/api` calls to the local Express server; must be in place before any hook that calls `/api/rss` is tested locally