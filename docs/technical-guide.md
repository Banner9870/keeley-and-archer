# chicago.com Prototype — Technical & Product Guide

**For:** Engineers and product managers receiving the handoff after user testing
**Repository:** [Banner9870/keeley-and-archer](https://github.com/Banner9870/keeley-and-archer)

---

## Project overview

chicago.com is a user testing prototype for a neighborhood guide platform for Chicago, built by Chicago Public Media. The prototype demonstrates the core product hypothesis: that Chicagoans will create, share, and remix neighborhood guides when given the right tools and a credible local brand behind them.

**What the prototype demonstrates:**
- A mixed feed of community-created guides and local news articles, ordered transparently (not algorithmically)
- Full guide browsing — detail pages with maps, place lists, and editor's notes
- A functional guide creation flow (Google Places search, place ordering, editor's notes, cover photo selection)
- A functional guide remix/fork flow, with persistent attribution to the original
- Neighborhood pages with boundary maps (GeoJSON) and filtered content
- User profiles with guides, remixes, and saved content
- A journalist-authored content tier with verification badges

**What was intentionally deferred:** See [requirements.md Section 10](../requirements.md#10-out-of-scope-for-prototype) for the full out-of-scope list. The short version: no authentication, no database, no backend API, no real ATProto integration, no comments, no persistent social interactions.

**Long-term vision:** The platform is designed with ATProto (the protocol behind Bluesky) in mind. Guides in this prototype mirror the shape of ATProto records, and the handle format (`@user.chicago.com`) anticipates DID-based identity. None of that is wired up yet — it's a design decision that shapes the data model without requiring the infrastructure.

---

## Repository structure

```
keeley-and-archer/
├── client/                   # React + Vite frontend
│   ├── public/               # Static assets: robots.txt, favicon
│   ├── src/
│   │   ├── components/       # Shared UI components (cards, header, footer, etc.)
│   │   ├── context/          # AppContext, AppReducer — all global state
│   │   ├── data/             # seed.js — all static prototype content
│   │   ├── hooks/            # Custom React hooks (useCommunityAreas, useRssFeed, etc.)
│   │   ├── pages/            # One file per route (FeedPage, GuideDetailPage, etc.)
│   │   ├── styles/           # CSS Modules and global design system tokens
│   │   ├── App.jsx           # Router setup and top-level layout
│   │   └── main.jsx          # React entry point
│   ├── Caddyfile             # Required for Railway SPA serving (handles client-side routing)
│   ├── vite.config.js        # Vite config; includes /api proxy to local Express server
│   └── .env.example          # Template for required environment variables
├── server/
│   └── index.js              # Express RSS proxy — fetches and parses Sun-Times and WBEZ feeds
├── docs/                     # This directory — moderator guide and technical guide
├── scripts/                  # Utility scripts (e.g., enrich-places.js for seed data enrichment)
├── package.json              # Root package — runs both services via concurrently
├── dev-plan.md               # Sequenced build plan — all phase and task specs
└── requirements.md           # Feature requirements — source of truth for product decisions
```

---

## Local development setup

**Prerequisites:**
- Node.js 18 or later
- Git
- A Google Places API key (required for guide creation; see Environment variables below)

**Steps:**

```bash
# 1. Clone the repository
git clone https://github.com/Banner9870/keeley-and-archer.git
cd keeley-and-archer

# 2. Install root dependencies (concurrently, etc.)
npm install

# 3. Install client dependencies
cd client && npm install && cd ..

# 4. Install server dependencies
cd server && npm install && cd ..

# 5. Set up environment variables
cp client/.env.example client/.env
# Open client/.env and fill in your API keys (see Environment variables below)

# 6. Start both services together
npm run dev
```

`npm run dev` at the repo root uses `concurrently` to start the Vite dev server (port 5173) and the Express RSS proxy (port 3001) simultaneously. Do not start the client alone — the RSS feed depends on the Express server being up.

The app will be available at `http://localhost:5173`.

---

## Environment variables

All environment variables live in `client/.env` (copy from `client/.env.example`). Never commit `.env` — it is gitignored.

| Variable | Required? | What it does | Where to get it |
|---|---|---|---|
| `VITE_GOOGLE_PLACES_API_KEY` | **Required for guide creation** | Powers the place search in the guide builder. Without it, the search field will show an error and guide creation is non-functional. | Google Cloud Console → APIs & Services → Credentials. Enable the Places API (New). |
| `VITE_CHICAGO_DATA_PORTAL_TOKEN` | Optional | Socrata App Token for the Chicago Data Portal API (community area names and GeoJSON boundaries). Without it, the app still works but may hit rate limits under heavy use. | data.cityofchicago.org → My Profile → App Tokens |
| `VITE_API_BASE_URL` | Leave empty for local dev | Base URL for the Express RSS proxy. In local dev, Vite's built-in proxy routes `/api/*` to `localhost:3001` automatically. Set this to the Railway Express service URL at deploy time. | Set after Railway deploy (Phase 11) |

**Important Vite note:** All client-side variables must use the `VITE_` prefix. Variables without this prefix are silently undefined at runtime. Do not use `REACT_APP_` — this is a Create React App convention that does not work in Vite.

---

## Architecture decisions

### 1. Vite instead of Create React App

Vite is the current standard for new React projects. CRA is unmaintained. Vite's dev server starts in under a second (CRA can take 10–20 seconds on a cold start) and its build output is significantly smaller. The tradeoff is that some CRA conventions (like `REACT_APP_` env vars) don't carry over — but that's a feature, not a bug.

### 2. react-leaflet for neighborhood boundary maps, not Google Maps JS API

The neighborhood pages display GeoJSON polygon boundaries from the Chicago Data Portal. Leaflet handles this with a single `<GeoJSON>` component and requires no additional API calls or billing. Loading the full Google Maps JS API for polygon rendering would be overkill — Google Maps JS is the right choice for rich interactive mapping but not for displaying static boundaries. Google Maps Static API (a simple `<img>` tag) is used where a thumbnail is sufficient.

### 3. Express proxy for RSS feeds

Browser security rules (CORS) prevent a web app from fetching content from a different domain unless that domain explicitly allows it. Neither the Chicago Sun-Times nor WBEZ includes the permissive headers needed for direct browser access to their RSS feeds. The Express server under `/server` fetches RSS XML on behalf of the client and returns parsed JSON — this sidesteps CORS entirely without requiring any changes to the publishers' servers. RSS XML is parsed with `fast-xml-parser`, which works in both Node.js and browser environments.

### 4. React Context + useReducer instead of a database

The prototype has no backend database. All state (the seed guides, any guides created during a session, the pre-loaded user, neighborhood and category filter selections) lives in a single `AppContext` powered by `useReducer`. This was the right call for a one-week prototype — a real database would have added days of setup and infrastructure cost for content that doesn't need to persist beyond a single user testing session. At production scale, the Context would be replaced by a proper API and database, with Context used only for UI-level state (current user, modal visibility, etc.).

### 5. ATProto in the long-term vision

The prototype does not integrate with the AT Protocol. But the design anticipates it: guide objects mirror ATProto record shapes, the `remixOf` field mirrors record references, and the handle format (`@user.chicago.com`) anticipates DID-based identity with custom domains. When the platform is ready to build on ATProto, the data model will not need to change — only the persistence layer.

---

## Seed data

**Location:** `client/src/data/seed.js`

The seed file exports three arrays: `seedUsers`, `seedGuides`, and (within each guide) `places`. It is the single source of truth for all prototype content.

**Schema:**

```javascript
// User
{
  id: 'user-01',
  handle: 'alexrivera',          // used in profile URL: /profile/alexrivera
  displayName: 'Alex Rivera',
  neighborhood: 'Lincoln Square',
  yearsInChicago: 7,
  badges: ['Food & Drink', 'Live Music', 'Parks'],
  isJournalist: false,
  publication: undefined,        // set to 'Chicago Sun-Times' or 'WBEZ' for journalists
  avatarUrl: null,
}

// Guide
{
  id: 'guide-01',
  title: 'The Essential Lincoln Square',
  description: '...',
  authorId: 'user-alex',         // references a user id
  neighborhood: 'Lincoln Square',
  categories: ['Food & Drink', 'Culture'],
  coverImage: 'https://...',     // Picsum URL or null
  likeCount: 157,
  remixCount: 1,
  remixOf: undefined,            // set to a guide id if this is a remix
  isEditorsPick: true,
  isSessionCreated: false,       // true only for guides created during a user testing session
  privacy: 'public',
  createdAt: '2026-01-15T14:23:00Z',
  places: [ /* Place objects */ ],
}

// Place (nested inside a guide)
{
  id: 'place-001',
  placeId: 'ChIJ...',            // Google Places ID
  name: 'The Warbler Cafe',
  address: '4806 N Lincoln Ave, Chicago, IL 60625',
  neighborhood: 'Lincoln Square',
  category: 'cafe',              // see category enum below
  rating: 4.7,
  ratingCount: 1322,
  editorNote: '...',             // 1–2 sentences from the guide's author
  coverImage: null,
  lat: 41.9641823,
  lng: -87.68551,
}
```

**Place categories:** `restaurant` | `cafe` | `bar` | `music_venue` | `park` | `cultural_institution` | `shop` | `other`

**To add a new guide:** Add an object to the `seedGuides` array. Give it a unique `id` (continue the `guide-NN` sequence), set `authorId` to an existing user ID, and add at least one place. Set `isEditorsPick: true` if it should appear in the first feed tier. Restart the dev server — the new guide will appear immediately.

**To add a new user:** Add an object to `seedUsers`. The `handle` value becomes the profile URL slug (`/profile/[handle]`). Journalist accounts set `isJournalist: true` and include a `publication` field.

**To add a neighborhood to required coverage:** The neighborhood dropdown is populated from the Chicago Data Portal API (`useCommunityAreas` hook), not from the seed file — all 77 community areas are available automatically. To add seeded guides for a neighborhood, just add guides with that `neighborhood` value. The neighborhood page at `/neighborhood/[slug]` will show them.

---

## Deployment

**[TO BE FILLED IN AFTER DEPLOYMENT — see Phase 11]**

This section will document: the two Railway services (`chicago-com-frontend` and `chicago-com-server`), environment variables required in the Railway dashboard, how to trigger a redeploy from GitHub, and how to restrict the Google Places API key to the Railway domain. Reference `dev-plan.md` Section 8 for the deployment checklist.

---

## Known limitations and next steps

**[TO BE FILLED IN AFTER DEPLOYMENT — see Phase 11]**

This section will document: what changes for a production build (authentication, database, Cloudinary media, ATProto integration), prototype shortcuts that should be revisited, and specific technical debt introduced during the build.
