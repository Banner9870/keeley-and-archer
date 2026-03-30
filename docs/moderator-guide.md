# chicago.com Prototype — Moderator Guide

**For:** Ellery Jones and session moderators
**Read time:** ~8 minutes

---

## What the prototype is and isn't

chicago.com is a concept for a neighborhood guide platform for Chicago — think Yelp meets local journalism, built by and for Chicagoans. This prototype demonstrates the core experience: browsing a feed of neighborhood guides and articles, reading a guide in detail, creating a new guide, and remixing an existing one. It is pre-loaded as Alex Rivera, a fictional Lincoln Square resident — no login screen, no signup flow. The app is designed to feel like a real product. A few things are intentionally not wired up (likes, follows, shares) but everything else — the feed, the map, the guide builder, the remix flow — works as it would in production.

---

## How to open the prototype and share the URL

**[TO BE FILLED IN AFTER DEPLOYMENT — see Phase 11]**

The Railway URL will be shared here once the prototype is deployed. Send participants the URL directly via text or email. The app works on both desktop and mobile browsers.

---

## How to reset between participants

At the end of each session — before a new participant sits down — visit:

```
[PROTOTYPE URL]/?reset=true
```

This restores the app to its starting state: all guides the participant created are removed, any likes they tapped are cleared, and the feed returns to its default order. The underlying content (the 26 seeded guides, the news articles) is unchanged.

You do not need to close the browser, clear cookies, or reload any other way. Just navigate to that URL and the reset happens automatically. The browser will redirect to the feed.

---

## Five key things a participant can do

| What | How to get there |
|---|---|
| Browse the feed | Open the app — the feed is the first screen |
| Read a guide in detail | Tap or click any guide card |
| Create a new guide | Click **+ Create Guide** in the header, or tap the button in the feed |
| Remix an existing guide | Open any guide detail page, then click **Remix this guide →** |
| View a user profile | Click any author name or handle on a guide card |

The pre-loaded account is Alex Rivera (`@alexrivera`). His profile is at `/profile/alexrivera`.

---

## What to expect from the create and remix flows

### Create a guide (`/guide/new`)

This is a three-step flow.

**Step 1 — Guide basics**
The participant enters a title, an optional description (up to 280 characters), chooses a neighborhood from a dropdown of all 77 Chicago community areas, selects category tags (Food & Drink, Coffee, Live Music, Parks, Culture, etc.), and picks a cover photo from a gallery of Chicago-themed photos. Privacy defaults to Public.

**Step 2 — Add places**
The participant searches for places in Chicago using a live search bar (powered by Google Places). Results appear as a list with name, address, category, and rating. They click "Add to guide" to move a place into their guide, and can write a short editor's note for each place explaining why they included it. They can reorder places using up/down arrows and remove places with the X button. At least one place is required to save.

**Step 3 — Confirmation**
After clicking "Save guide," the app navigates to the newly created guide's detail page, which looks identical to any other guide in the app. A success banner appears at the top: "Your guide was created! Share it with friends." The guide is now in Alex Rivera's profile under "Guides."

### Remix a guide (`/guide/:id/remix`)

**Entry point:** any guide detail page has a "Remix this guide →" button.

When the participant clicks it, they land on the remix editor. A blue banner at the top of the screen shows: "Remixing '[Original Guide Title]' by @originalauthor." This attribution persists for the entire editing session and appears on the remixed guide afterward.

The remix editor is identical to the create editor, except all the original guide's places are pre-loaded. The participant can rename the guide, change the description, add or remove places, and edit editor's notes. They cannot modify the original guide.

After saving, the participant sees the new guide's detail page, which includes a "Remixed from [Original Guide]" attribution block. The original guide is unchanged.

---

## Which interactions are non-functional

The following elements are clickable and feel responsive, but they do not persist or affect anything permanently:

| Interaction | What happens | What to say |
|---|---|---|
| ♥ Like (heart button) | Counter increments during the session | "That's something we're still designing — what would you expect to happen there?" |
| ↗ Share button | Opens a mock share sheet with a copyable URL | Same as above |
| Follow [author] button | No response | Same as above |
| Public/Private toggle in guide builder | Label updates visually but is not enforced | Same as above |
| Comments | Not present in this prototype | "Comments are on the roadmap — how would you want that to work?" |

If a participant notices something doesn't respond the way they expect, you don't need to explain the technical reason. The suggested language above gives you a natural pivot to ask them about their expectations, which is more valuable anyway.

---

## How to navigate to specific content

If you want to direct a participant to a specific guide or neighborhood during the session, use these direct paths.

### Neighborhood pages

Append these slugs to the prototype URL: `/neighborhood/[slug]`

| Neighborhood | URL slug |
|---|---|
| Lincoln Square | `lincoln-square` |
| Logan Square | `logan-square` |
| Hyde Park | `hyde-park` |
| Pilsen | `pilsen` |
| Wicker Park | `wicker-park` |
| Bronzeville | `bronzeville` |
| Andersonville | `andersonville` |
| Chinatown | `chinatown` |
| Loop | `loop` |
| Rogers Park | `rogers-park` |
| Humboldt Park | `humboldt-park` |
| Uptown | `uptown` |
| Little Village | `little-village` |
| Woodlawn | `woodlawn` |
| Beverly | `beverly` |
| Back of the Yards | `back-of-the-yards` |
| Bridgeport | `bridgeport` |
| South Shore | `south-shore` |
| Ukrainian Village | `ukrainian-village` |

### Notable guides by ID

Append these to the prototype URL: `/guide/[id]`

| Guide | ID | Neighborhood | Why it's useful |
|---|---|---|---|
| The Essential Lincoln Square | `guide-01` | Lincoln Square | Alex Rivera's own guide — the pre-loaded user's home base |
| Late Night Lincoln Square | `guide-02` | Lincoln Square | A remix of guide-01 — good for showing the remix chain |
| Best Brunch in Logan Square | `guide-03` | Logan Square | Editor's Pick, highly liked |
| Logan Square With Kids | `guide-04` | Logan Square | Remix of guide-03 — another example of forking |
| Pilsen Art Walk | `guide-05` | Pilsen | Editor's Pick |
| Pilsen After Dark | `guide-06` | Pilsen | Journalist guide (Ellery Jones, Sun-Times) — shows newsroom badge |
| Hyde Park Green Spaces | `guide-08` | Hyde Park | Journalist guide (Al Keefe, WBEZ) — Editor's Pick |
| Bronzeville Cultural Trail | `guide-11` | Bronzeville | Editor's Pick, most-liked guide in the seed data |
| Back of the Yards: History and Coffee | `guide-25` | Back of the Yards | Editor's Pick — good for showing less-visited neighborhoods |

---

## Troubleshooting

**[TO BE FILLED IN AFTER DEPLOYMENT — see Phase 11]**

This section will be completed once the Railway URL is confirmed and the app has been smoke-tested in production. Common scenarios to cover: blank screen on load, Places search returning no results, neighborhood page not loading, session reset not working.
