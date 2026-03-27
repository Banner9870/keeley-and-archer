# chicago.com Prototype — Feature Requirements

**Version:** 1.0
**Date:** 2026-03-26
**Author:** Ellery Jones, Chicago Public Media
**Purpose:** User testing prototype — UX and flow validation, not production build

---

## 1. Project Overview

### What We're Building
A lightweight Plain React web application deployable to Railway, used for structured user testing sessions with community members. The prototype should demonstrate the core flow of chicago.com — browsing, creating, and remixing neighborhood guides — and gather user reactions to the concept.

### What This Is Not
- A full production build
- An authenticated system (users navigate as a pre-loaded account)
- A fully functional social platform

### Prototype Success Criteria
- Users can browse a realistic feed of guides and articles
- Users can view a guide in full detail
- Users can successfully **create a new guide** (functional)
- Users can successfully **remix/fork an existing guide** (functional)
- All other social interactions (likes, shares, follows) are clickable and feel real but do not persist
- The platform communicates "Chicago, made by locals for locals" without resembling a traditional news website

---

## 2. Design System

### Philosophy
The visual identity should feel bold, assertive, and distinctly Chicago — closer to a hand-painted grocery sign or a mid-century Chicago transit poster than a newspaper website. It should not look like WBEZ or the Sun-Times; it draws from those institutions' credibility but establishes its own visual identity. The Chicago flag is the primary branding reference.

### Color Palette

| Token | Value | Usage |
|---|---|---|
| `--red` | `#EF002B` | Primary action, CTA buttons, active states, Chicago star accent |
| `--blue` | `#41B6E6` | Secondary accent, neighborhood tags, decorative stripes |
| `--white` | `#FFFFFF` | Backgrounds, text on dark surfaces |
| `--black` | `#161616` | Primary text, header backgrounds |
| `--gray-100` | `#F5F5F5` | Page background |
| `--gray-200` | `#E0E0E0` | Card borders, dividers |
| `--gray-500` | `#757575` | Secondary text, metadata |
| `--gray-900` | `#212121` | Dark card background, footer |

The Chicago flag's four six-pointed red stars should appear as a recurring motif in the visual system — as a favicon, section dividers, and verified-journalist indicators.

### Typography

| Role | Font | Weight | Notes |
|---|---|---|---|
| Display headings | **Big Shoulders Display** | 900 | Google Fonts; the official Chicago Design System typeface. Condensed, bold, uppercase. Used for page titles, hero text, neighborhood names. |
| UI headings | **Big Shoulders Text** | 700 | Same family, slightly less condensed. Card titles, section headings. |
| Body text | **Inter** | 400/500 | Clean, modern sans-serif. Article summaries, guide descriptions, metadata. |
| Article body | **Source Serif 4** | 400 | For reading-length article content pulled from RSS feeds. |

**Typography rules:**
- Neighborhood names and page section titles are always uppercase in Big Shoulders Display
- Guide titles are title-case in Big Shoulders Text (not all-caps)
- All metadata (timestamps, author handles, place counts) is Inter at 0.8rem, color `--gray-500`

### Identity & ATProto-Inspired Design
Even though ATProto integration is out of scope for the prototype, the design language should borrow from the Atmosphere ecosystem to build toward that future architecture.

- Every user has a **@handle.chicago.com** identity displayed below their display name (e.g., `@maria.chicago.com`)
- Handles follow the ATProto format: `@firstname.chicago.com` for community members, and a verified domain format for journalists: `@reporter.suntimes.com` or `@reporter.wbez.org`
- **Journalist guides** are identified with a ★ (Chicago star) badge + "From the newsroom" label, with the journalist's publication handle displayed (e.g., `@mick.dumke.suntimes.com`)
- Identity cards show: Display Name (bold), @handle (smaller, gray), neighborhood, years-in-Chicago indicator, and interest badges
- The two-layer name/handle display is the standard pattern across all user-generated content

### Layout Grid
- Max content width: `1200px`, centered
- Two-column layout on desktop (main feed + sidebar), single-column on mobile
- Mobile breakpoint: `768px`
- Base spacing unit: `8px` (use multiples: 8, 16, 24, 32, 48, 64)

### Card Design
Cards are the primary content unit. Two variants with **intentionally different visual anatomy** — the structural height difference is the primary scan signal in a mixed feed. Users should be able to identify content type by shape before reading any text.

**Guide Card**
- White background, `4px` top border in `--red`
- `2px` border-radius (not rounded — assertive, not bubbly)
- Box shadow: `0 2px 4px rgba(0,0,0,0.08)`
- **Always has a cover photo** (full-width, 16:9 aspect ratio) — falls back to Google Maps Static API image centered on the first place if none. The photo is the primary height driver.
- `★ GUIDE` pill badge overlaid top-left of cover image — `--red` background, white Inter 600 11px
- Card body: guide title in Big Shoulders Text 700, author identity block (display name + `@handle`), secondary info line with map pin icon + place count + neighborhood tag (e.g. `📍 5 places · Logan Square`)
- Action row: ♥ Like (session state), ↗ Share, Save — and a `Remix →` CTA in `--red`

**Article Card**
- White background, `4px` top border in `--blue`
- **No cover image** — text-only layout, intentionally compact and visually shorter than a guide card
- Content type badge: publication logo (WBEZ or Sun-Times, 16px height) + `NEWS` label in `--blue`, Inter 600 11px, top-left of card body
- Article title in Big Shoulders Text 700, summary in Inter 400 (2 lines max, truncated with ellipsis)
- Meta row: source name, estimated read time, published timestamp
- `Read →` link opening article URL in new tab — no Remix CTA, no place count, no map pin

---

## 3. Pre-Loaded Account System

### Requirement
No authentication flow exists in this prototype. The app launches already "signed in" — no banner, no explanation, no sign-in screen. The participant should experience it as a real app from the first screen.

### Implementation
- A hardcoded user account is pre-loaded at app startup:
  - **Display Name:** "Alex Rivera"
  - **Handle:** `@alexrivera.chicago.com`
  - **Neighborhood:** Lincoln Square
  - **Years in Chicago:** 7
  - **Interest badges:** Food & Drink, Live Music, Parks & Outdoors
- No banner, no "prototype" label, no disclaimer anywhere in the UI
- All logged-in states (your guides, your profile, your feed preferences) reference this account
- The account avatar and handle appear in the header nav as a regular signed-in user
- Session reset between participants: the moderator visits `/?reset=true` to restore seed data state without refreshing browser history

### Search Discoverability
The deployed Railway URL must not be indexable by search engines. Implement both:
1. A `robots.txt` at the root: `User-agent: * / Disallow: /`
2. `<meta name="robots" content="noindex, nofollow">` in the HTML `<head>`

The URL will only be shared directly by Ellery with test participants and team members.

---

## 4. Pages and Views

### 4.1 Feed (Home) — `/feed`

The primary landing page and the main user testing surface.

**Layout**
- Full-width hero strip with Chicago flag stripes (two `--blue` horizontal bars) at the top
- Below hero: feed of mixed Guide Cards and Article Cards
- Right sidebar (desktop): "Your Neighborhoods" filter panel + "Categories" panel
- Bottom of feed: "Load more" button — loads the next 10 items into the existing feed list (no page navigation)

**Feed Content & Ordering**
The feed is explicitly non-algorithmic. Content is ordered by a transparent mix of three factors, displayed to the user:
1. **Editor's Picks** — manually flagged guides/articles, flagged with a small "★ Editor's Pick" label
2. **Your Neighborhoods** — content tagged to neighborhoods the user has selected
3. **Your Categories** — content matching the user's selected interest categories

Feed ordering logic: Editor's Picks first, then most recent content matching selected neighborhoods, then most recent content matching selected categories.

**Feed rendering rule:** When 2 or more article cards appear consecutively in the ordered list, group them under a `From the Newsroom` section subheader (Big Shoulders Text, `--blue`, thin `--blue` left border). A lone article between guide cards renders without a subheader. This prevents visual noise while keeping the mixed-content feel.

**"How your feed is ordered" disclosure:** A visible link near the top of the feed opens a modal. The modal copy is **dynamic** — it reflects the user's actual current selections: "Your feed is showing content from [Lincoln Square, Logan Square] and matching [Food & Drink, Live Music]. Editor's Picks always appear first." A "Change your settings" link in the modal scrolls to the sidebar. This reinforces the non-algorithmic, transparent design principle.

**Feed Items**
- Minimum 20 seeded guide cards for testing
- Minimum 10 article cards pulled from RSS (5 Sun-Times, 5 WBEZ)
- At least 2 guides marked as "From the newsroom" (journalist-authored)
- At least 1 "Editor's Pick" guide in the first 5 items

**Functional interactive elements (update session state, persist across navigation)**
- Neighborhood filter chips in sidebar — toggling adds/removes a neighborhood from the user's active feed preferences; feed re-orders immediately; changes persist for the duration of the session
- Category toggles in sidebar — same behavior for categories
- Both panels show the user's currently active selections with a visual active state (filled chip, checked toggle)

**Non-functional interactive elements (clickable, no persistence)**
- ♥ Like button on guide/article cards — increments counter in session state only
- ↗ Share button — opens a mock share sheet modal with copyable URL, no actual share

### 4.2 Guide Detail — `/guide/:id`

Full view of a single guide.

**Layout**
- Hero: full-width cover photo (Unsplash static URL from seed data), guide title overlaid in Big Shoulders Display with a dark gradient scrim, author identity block below the image
- Fallback if no cover image: Google Maps Static API image centered on the guide's first place
- Below hero: guide description (2–4 sentences)
- Below description: interactive Leaflet map showing all guide places as pins
- **Places list:** ordered list of places included in the guide. Each place entry contains:
  - Place name (from Google Places or seeded data)
  - Address + neighborhood tag
  - Category icon
  - Google Places rating + review count (if available)
  - A short editor's note (1–2 sentences, authored by guide creator)
  - Place photo thumbnail (from Google Places or seeded)
- Sidebar (desktop): map showing all places as pins
- Below places: "Remixed from" attribution if guide is a fork, with link to original

**Functional elements**
- ✦ "Remix this guide" button → navigates to Guide Creation view pre-populated with this guide's places (see 4.4)

**Non-functional interactive elements**
- ♥ Like / ★ Save / ↗ Share buttons in the header — local state only
- "Follow [author]" button — no persistence

### 4.3 Neighborhood Page — `/neighborhood/:slug`

One page per Chicago community area (77 total).

**Layout**
- Header: Neighborhood name in Big Shoulders Display (all caps), community area number badge
- Map of the neighborhood boundary (GeoJSON from Chicago Data Portal)
- "Guides about [Neighborhood]" — filtered feed of guide cards for this neighborhood
- "From the newsroom" rail — article cards from RSS feeds tagged to this neighborhood (keyword-matched)
- Neighborhood stats strip (population, adjacent neighborhoods — from community area dataset)

**Non-functional interactive elements**
- "Follow this neighborhood" button — no persistence

### 4.4 Guide Creation — `/guide/new` *(FUNCTIONAL)*

Users can create a working guide that persists in app state for the duration of the session. This is one of the two primary functional flows for user testing.

**Step 1 — Guide Basics**
- Title input (required)
- Description textarea (optional, max 280 characters)
- Neighborhood selector — dropdown of all 77 Chicago community areas
- Category tags — multi-select from a preset list (Food & Drink, Coffee, Live Music, Parks, Culture, History, Sports, Nightlife, Family, Shopping)
- Privacy toggle: Public / Private (no backend — just sets a visible label)
- "Continue to places →" button

**Step 2 — Add Places**
- Search bar: "Search for a place in Chicago..." — calls Google Places Nearby/Text Search API with a Chicago bounding box
- Search results displayed as a list: place name, address, category, Google rating
- "Add to guide" button on each result — moves place to "Your guide" panel
- In "Your guide" panel, each added place has:
  - A text field for an editor's note (placeholder: "Why did you add this place?")
  - A drag handle to reorder
  - A remove button
- Minimum 1 place required to save
- "Save guide" button → saves to session state, navigates to the new guide's detail page

**Step 3 — Confirmation**
- Guide detail page loads with a success banner: "Your guide was created! Share it with friends."
- Share button and "Remix" button are present (share is non-functional; remix leads into the fork flow)

### 4.5 Guide Remix / Fork — `/guide/:id/remix` *(FUNCTIONAL)*

The remix flow creates a copy of an existing guide that the user can modify. This directly tests a core product hypothesis.

**Entry point:** "Remix this guide" button on any guide detail page.

**Flow:**
1. User is shown the original guide with all its places loaded into the creation editor
2. A persistent banner reads: `"Remixing '[Original Guide Title]' by @originalauthor.chicago.com"` — attribution is always visible
3. User can: rename the guide, edit the description, add/remove/reorder places, add/edit editor's notes
4. Privacy toggle defaults to Public, with a note that the original will be credited
5. "Save remix" → saves to session state, navigates to new guide detail page
6. The remixed guide's detail page shows "Remixed from [Original Guide] by @originalauthor.chicago.com" in a clearly attributed block

**Important:** The original guide is never modified. The remix is a new object with a `remixOf` reference field — this mirrors ATProto's record architecture even if not yet implemented on the protocol.

### 4.6 User Profile — `/profile/:handle`

Profile pages for Alex Rivera (the pre-loaded user) and all seeded users.

**Layout**
- Profile header: display name (Big Shoulders Text, large), @handle.chicago.com, neighborhood, years-in-Chicago badge, interest badge chips
- Journalist accounts: "★ From the newsroom" badge + publication (e.g., "Chicago Sun-Times Reporter"), with domain handle `@reporter.suntimes.com`
- Tabs: "Guides" / "Remixes" / "Saved" (all populated with seeded data)
- Guide and remix cards displayed in a grid

**Non-functional interactive elements**
- "Follow" button — no persistence
- Like/share on guide cards — local state only

### 4.7 Explore / Search — `/explore`

A browse surface for discovering guides and neighborhoods.

**Layout**
- Search bar at top (non-functional or local-filter-only for prototype)
- "Browse by neighborhood" — a visual grid or map of all 77 Chicago community areas
- "Trending guides" section — 6–8 seeded guide cards
- "From the newsroom" section — journalist-authored guide cards and article cards

---

## 5. Data Sources & Integration

### 5.1 Chicago Community Areas

**Source:** City of Chicago Data Portal — Socrata API
**Dataset ID:** `igwz-8jzy`
**Endpoints:**
- Tabular (community names + IDs): `https://data.cityofchicago.org/resource/igwz-8jzy.json`
- GeoJSON (with polygon boundaries): `https://data.cityofchicago.org/resource/igwz-8jzy.geojson`

**Implementation notes:**
- Fetch once at build time or on app init; store in local state
- Community names in the dataset are uppercase (`"LINCOLN SQUARE"`) — normalize to title case for display, keep uppercase only for Big Shoulders Display headings
- Use the Socrata App Token (already available) as a query parameter to avoid rate limiting: `?$$app_token=YOUR_TOKEN`
- All 77 areas should be available in the neighborhood selector dropdown

### 5.2 Google Places API

**Status: API key configured in `.env` as `VITE_GOOGLE_PLACES_API_KEY`.**
Restrict the key in Google Cloud Console to your Railway domain + `localhost` once the Railway URL is known.

**Endpoints used (Places API New):**
- `POST https://places.googleapis.com/v1/places:searchText` — for the "search for a place" input in guide creation
- `POST https://places.googleapis.com/v1/places:searchNearby` — for neighborhood-scoped place discovery
- `GET https://places.googleapis.com/v1/places/{place_id}` — for place detail + photos on guide detail pages

**Field masks for cost control:** Request only necessary fields. For search results: `places.id,places.displayName,places.formattedAddress,places.types,places.rating,places.userRatingCount,places.photos`. Add `places.reviews` only for guide detail view (triggers Pro billing tier).

**Pricing note:** At prototype traffic levels (~100 requests/day), the free monthly cap (5,000 requests/SKU/month) should not be exceeded. No charges expected during user testing.

**Fallback:** If API key is unavailable, seed 20–30 hardcoded Chicago places per neighborhood for testing (name, address, category, mock rating). Guide creation can use this seeded dataset as a fallback.

### 5.3 RSS Feeds (Articles)

**Source feeds:**
- Chicago Sun-Times: `https://chicago.suntimes.com/rss/index.xml`
- WBEZ: `https://www.wbez.org/rss/index.xml`

**Implementation:**
- A lightweight Express/Node service on Railway acts as a CORS proxy for RSS requests. The React app calls `/api/rss?source=suntimes` (or `wbez`), and the Express service fetches the feed server-side and returns parsed JSON. This avoids CORS issues entirely.
- The Express service lives in the same repo under `/server` and is deployed as a second Railway service in the same project.
- RSS XML is parsed with **`fast-xml-parser`** (Node.js + browser compatible; `rss-to-json` is Node-only and cannot run in a browser fallback context).
- Parsed article shape: `{ id, title, url, summary, publishedAt, source, imageUrl, neighborhoods[] }`
- Neighborhood tagging: keyword-match article title + summary against all 77 community area names. An article matches a neighborhood if the exact name appears (case-insensitive). Articles matching zero neighborhoods go into an "All Chicago" bucket and appear in feeds with no neighborhood filter active.

### 5.4 Seeded Data

A static seed data file (`src/data/seed.js` or `.json`) must be created to populate the prototype with realistic Chicago content. Minimum seed data:

**Guides (minimum 20):**
- At least 8 neighborhoods represented
- At least 3 guide categories: Food & Drink, Music/Culture, Parks/Outdoors
- At least 2 journalist-authored guides (Sun-Times and WBEZ reporters as authors)
- At least 4 guides that are remixes of other guides (to demonstrate the remix chain)
- Each guide: title, description, author (seeded user), neighborhood, places (3–7 per guide), category tags, like count, remix count

**Users (minimum 8 seeded accounts):**
- 2 journalist accounts demonstrating the domain-handle verification pattern:
  - **Ellery Jones** — `@ellery.suntimes.com` — Chicago Sun-Times
  - **Al Keefe** — `@alkeefe.wbez.org` — WBEZ
  - Both display the "★ From the newsroom" badge and their publication name
- 6 community member accounts with varied neighborhoods, tenures, and interest badges
- All accounts use `@handle.chicago.com` format

**Places (minimum 80 across all guides):**
- Raised from 50 to match the guide count: 20 guides × 4 places average = 80 places minimum
- Real Chicago places by name and neighborhood
- Mix of categories: `restaurant` | `cafe` | `bar` | `music_venue` | `park` | `cultural_institution` | `shop` | `other`
- Each place has: `id`, `name`, `address`, `neighborhood`, `category` (enum above), `rating` (3.5–5.0), `editorNote`, `coverImage`

**Cover images — prototype approach (no media hosting required):**
- Seeded guides use Unsplash Source URLs — `https://source.unsplash.com/featured/?chicago,{theme}` — embedded directly as `<img>` tags. No API call, no storage, no cost. Theme keywords (e.g. `neighborhood`, `food`, `music`, `park`) are matched to the guide's category.
- Each seeded guide must have a `coverImage` URL.
- Fallback if `coverImage` is null: Google Maps Static API image centered on the guide's first place.
- **Guide creation photo picker:** Instead of a file upload field, the guide creation flow presents a curated gallery of ~20 Chicago-themed Unsplash photos for the participant to choose from. The selected photo URL is stored in session state. No uploads, no hosting — keeps the creation flow fast and uncluttered during user testing.

**Cover images — production approach (out of scope for prototype):**
- **Cloudinary** is the recommended production media host. Free tier covers 25GB storage and 25GB bandwidth — sufficient for early-stage traffic.
- Cloudinary's React upload widget allows direct browser-to-Cloudinary uploads with no backend file handling required.
- Cloudinary handles automatic resizing and optimization (serve `w=800` thumbnails from full-res originals via URL parameters).
- A `coverImage` field on guides stores the Cloudinary URL; the guide creation flow replaces the photo picker with a Cloudinary upload widget.

**Seed data schema (TypeScript-style reference):**
```
type Place = { id, name, address, neighborhood, category, rating, editorNote, coverImage? }
type User = { id, handle, displayName, neighborhood, yearsInChicago, badges[], isJournalist, publication? }
type Guide = { id, title, description, authorId, neighborhood, categories[], places: Place[], coverImage?, likeCount, remixCount, remixOf?: guideId, isEditorsPick, isSessionCreated, createdAt, privacy }
```

**Trending / Editor's Pick flags:**
- Each guide has an `isEditorsPick` boolean — used to populate the Explore page "Trending" section and the Editor's Picks feed tier
- At least 4 seeded guides should have `isEditorsPick: true`

**Required neighborhood coverage for testing scenarios:**
At minimum, the following neighborhoods must have at least 2 seeded guides so participants can plausibly browse by area:
- Lincoln Square (dummy user's home neighborhood)
- Logan Square
- Hyde Park
- Pilsen
- Wicker Park
- Bronzeville

---

## 6. Navigation & App Shell

### Route Table

Routes must be declared in this exact order in React Router to prevent `/guide/new` from being matched as a `:id` param:

| Path | Component | Notes |
|---|---|---|
| `/` | Redirect → `/feed` | Root redirects to feed |
| `/feed` | FeedPage | Main landing page |
| `/explore` | ExplorePage | Browse/search surface |
| `/guide/new` | GuideCreatePage | **Must be declared before `/guide/:id`** |
| `/guide/:id` | GuideDetailPage | |
| `/guide/:id/remix` | GuideRemixPage | |
| `/neighborhood/:slug` | NeighborhoodPage | slug = community area name, URL-encoded lowercase |
| `/profile/:handle` | ProfilePage | Pre-loaded user: `/profile/alexrivera` |
| `*` | NotFoundPage | 404 fallback — required for user testing sessions |

### Header
- Left: chicago.com wordmark (Big Shoulders Display, bold, with a ★ motif)
- Center (desktop): primary navigation — Feed | Explore | Neighborhoods
  - **Neighborhoods** opens a dropdown panel listing all 77 Chicago community areas, each linking to `/neighborhood/:slug`. The list is populated from `communityAreas` state (loaded by `useCommunityAreas`). Dropdown is dismissed on outside click or Escape. On mobile, the hamburger menu shows the full list inline instead of a dropdown.
- Right of nav: `+ Create Guide` button (always visible, links to `/guide/new`)
- Right: account avatar + "Alex Rivera" + `@alexrivera` — clicking opens dropdown with "Your Profile" (→ `/profile/alexrivera`) and "Your Guides" (→ `/profile/alexrivera`, guides tab active)
- Mobile: hamburger menu contains all nav items (including the full Neighborhoods list) + Create Guide CTA

### Footer
- Chicago flag stripe decoration (two `--blue` horizontal bars)
- Links: About chicago.com | How guides work | How the feed is ordered | Chicago Public Media
- Tagline: "Made in Chicago, for Chicago."

---

## 7. Non-Functional Requirements

### Performance (Prototype Standards)
- Initial page load under 3 seconds on a standard home broadband connection
- RSS feed content should appear within 2 seconds of page load
- Google Places search results should return within 1.5 seconds

### Accessibility
- All interactive elements must have visible focus states
- Color contrast must meet WCAG AA minimum for body text
- Images must have meaningful alt text (even for seeded data)

### Responsive Design
- Must be usable on mobile devices (user testers may use their phones)
- Touch targets minimum 44px
- The guide creation flow must be completable on mobile

### Browser Support
- Chrome (latest), Safari (latest), Firefox (latest)
- No IE11 support required

### Loading States
Every async operation must show a loading state. Use skeleton placeholder cards (not spinners) for feed and guide list content — skeleton cards maintain layout and feel more polished in user testing sessions. Use a simple inline spinner for Places API search results in guide creation.

| Async operation | Loading treatment |
|---|---|
| Feed initial load | 6 skeleton guide/article cards |
| RSS article fetch | Skeleton article cards mixed into feed |
| Neighborhood page load | Skeleton map + skeleton card grid |
| Places search (guide creation) | Inline spinner below search bar |
| GeoJSON boundary render | Skeleton rectangle where map will appear |

### Error States
| Failure scenario | User-visible behavior |
|---|---|
| RSS fetch fails | Article cards silently omitted; feed shows guides only; no error message (avoids alarming test participants) |
| Google Places API error | Show message: "Search unavailable — try a different term" inline in the places search step |
| Socrata API down | Use bundled static fallback JSON of all 77 community areas (committed to repo) |
| Guide ID not found | Redirect to `/feed` with no error message |
| Any uncaught error | React error boundary catches it; shows generic "Something went wrong — go back to the feed" screen |

### Empty States
| Empty scenario | User-visible behavior |
|---|---|
| Neighborhood with no seeded guides | "No guides yet for [Neighborhood]. Be the first to create one." + Create Guide CTA |
| Profile with no guides | "You haven't created any guides yet." + Create Guide CTA |
| Feed filter returns nothing | "Nothing matches your current filters." + "Clear filters" link |
| RSS returns no neighborhood-matched articles | The neighborhood feed section simply does not render; no empty state message |

### Session Reset (Between Test Participants)
A hidden keyboard shortcut (`Shift + R` held for 2 seconds, or a URL param `?reset=true`) clears all session-created guides and resets local state to the default seed data. This allows the moderator to reset the prototype between participants without a full page reload or browser history clear.

---

## 8. Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Layer | Choice | Notes |
|---|---|---|
| Framework | **React 18 + Vite** | Not Create React App — Vite only |
| Routing | **React Router v6** | See route table in Section 6 for required declaration order |
| Styling | **CSS Modules** | More control for the custom design system; Tailwind's utility classes work against the "bold and brash" aesthetic that needs precise type/spacing decisions |
| State management | **React Context + useReducer** | One top-level AppContext; shape defined in dev plan before component work begins |
| Maps (interactive) | **react-leaflet + Leaflet.js** | Used for neighborhood boundary polygons (GeoJSON from Socrata) and place pin maps on guide detail. Much lighter than loading the full Google Maps JS API for polygon display. |
| Maps (static thumbnails) | **Google Maps Static API** | Used for guide card thumbnails only — a simple `<img>` tag with a Static Maps URL. Same API key as Places. |
| RSS parsing | **fast-xml-parser** | Runs on the Express server (Node.js). `rss-to-json` is Node-only and would not work in a browser fallback context. |
| Backend / RSS proxy | **Express on Railway** | Separate Railway service under `/server` in the same repo. Handles RSS fetching and CORS. |
| Data Portal | **Fetch API** | Direct calls to Socrata JSON/GeoJSON endpoints from the React client |
| Places API | **Direct REST (fetch)** | Called from React client. Key must be restricted to Railway domain + localhost in Google Cloud Console before first deploy. |
| Deployment | **Railway** | Two services: (1) React/Vite frontend via Caddy, (2) Express RSS proxy. Both in `keeley-and-archer` Railway project. |
| Version control | **Git / GitHub** | [Banner9870/keeley-and-archer](https://github.com/Banner9870/keeley-and-archer) |

### Environment Variables Required
Vite requires the `VITE_` prefix for all client-side env vars. Do **not** use `REACT_APP_` prefix (that is Create React App only — variables with that prefix will be silently undefined at runtime in a Vite build).

```
VITE_GOOGLE_PLACES_API_KEY=
VITE_CHICAGO_DATA_PORTAL_TOKEN=
```

---

## 9. Documentation Deliverables

Two documents must be produced alongside the prototype build. Both live in the repo and are written in Markdown. Neither needs to be long — clarity over completeness.

### 9.1 Moderator Guide (`docs/moderator-guide.md`)

**Audience:** Ellery and any consultant moderating the user testing sessions. Assumes no technical knowledge.

**Must cover:**
- What the prototype is and isn't (one paragraph — sets expectations before handing a participant a device)
- How to open the prototype and share the URL with a participant
- How to reset between participants (`/?reset=true` — explain in plain language what this does and when to use it)
- A map of the five key things a participant can do, with the path to get there: browse the feed, view a guide, create a guide, remix a guide, view a profile
- What to expect from the create/remix flow (the only two fully functional features) — what the participant will see at each step
- Which interactions are intentionally non-functional (likes, follows, shares) and what to say if a participant notices something doesn't work: suggested language like "That's something we're still designing — what would you expect to happen there?"
- How to navigate to specific neighborhoods or guides if the moderator wants to prompt a participant to look at something specific
- Troubleshooting: what to do if the app goes blank, if a search returns no results, if the page doesn't load

**Tone:** Plain language, friendly, no jargon. Written as if explaining to a smart colleague who has never seen the app.

---

### 9.2 Technical & Product Guide (`docs/technical-guide.md`)

**Audience:** Engineers and product team members at Chicago Public Media who will receive the handoff after user testing. Assumes comfort with web development concepts but not necessarily familiarity with this specific stack.

**Must cover:**

*Project overview*
- What the prototype demonstrates and what was intentionally deferred
- Link to `requirements.md` for full feature context

*Repository structure*
- Top-level directory map (client, server, docs, seed data)
- What each part does in one sentence

*Local development setup*
- Prerequisites (Node version, git)
- Step-by-step: clone repo, copy `.env.example` to `.env`, fill in API keys, install dependencies, run dev server
- How to run the Express RSS proxy locally alongside the React app

*Environment variables*
- Full list of required variables, what each does, and where to get the value
- Which are safe to leave empty locally (Data Portal token is optional; Places key is required for guide creation)

*Architecture decisions*
- Why Vite over CRA
- Why react-leaflet over Google Maps JS API for neighborhood boundaries
- Why Express proxy for RSS (CORS explanation in plain terms)
- Why Context + useReducer over a database (prototype scope rationale)
- Where ATProto fits in the long-term vision vs. what's mocked today

*Seed data*
- Where the seed file lives, what its schema is, how to add or modify guides/users/places
- How to add a new neighborhood to the required-coverage list

*Deployment*
- How the two Railway services (frontend + Express proxy) are structured in the project
- Environment variables that must be set in the Railway dashboard before deploy
- How to trigger a redeploy from GitHub
- How to restrict the Google Places API key to the Railway domain (step-by-step, with screenshots if possible)

*Known limitations and next steps*
- What would need to change to move from prototype to production (auth, database, real media uploads via Cloudinary, ATProto integration)
- Any shortcuts taken during the prototype build that should be revisited

---

## 10. Out of Scope for Prototype

These features are documented here as future requirements but will **not** be built for the user testing session:

### ATProto / Social Infrastructure
- Real ATProto DID/handle registration and authentication
- PDS-hosted guide records
- Feed generator service
- Follows, likes, and shares that persist to a backend
- Real-time notifications

### Full User System
- Sign-up / sign-in flow
- Email/password or OAuth authentication
- User settings and preferences persistence

### Full Guide Social Features
- Comments on guides or places
- Public/private guide visibility enforcement
- Guide sharing to external platforms

### Content
- Google Places reviews (cost; deferred)
- Full article text (RSS provides summaries only; full text requires publisher API or scraping)
- Video content from WBEZ

### Infrastructure
- Backend API / database
- Content moderation tools
- Analytics and instrumentation

---

## 11. Resolved Decisions & Infrastructure Notes

| # | Decision | Resolution |
|---|---|---|
| 1 | Google Places API key | Configured in `.env`. Restrict key to Railway domain once URL is known. |
| 2 | RSS feed URLs | Sun-Times: `https://chicago.suntimes.com/rss/index.xml` / WBEZ: `https://www.wbez.org/rss/index.xml` (confirmed, non-gated) |
| 3 | Journalist seed accounts | Ellery Jones `@ellery.chicago.com` and Al Keefe `@alkeefe.chicago.com` |
| 4 | Create Guide entry point | Available from the main feed (in nav header and as a CTA in the feed) |
| 5 | GitHub repo | [Banner9870/keeley-and-archer](https://github.com/Banner9870/keeley-and-archer) |
| 6 | Railway project | `keeley-and-archer` — Hobby plan active |
| 7 | Testing session format | One user at a time, moderated by Ellery or a consultant — shared screen |

### Environment Variables (required in Railway dashboard at deploy time)
```
VITE_GOOGLE_PLACES_API_KEY=    # in .env locally; add to Railway environment before deploy
VITE_CHICAGO_DATA_PORTAL_TOKEN=  # add Socrata App Token here
```
