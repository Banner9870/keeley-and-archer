# chicago.com Prototype

A user testing prototype for a Chicago neighborhood guide platform, built by Chicago Public Media. Participants browse, create, and remix neighborhood guides. Built with React + Vite, deployed on Railway.

---

## Documentation

| Document | Audience | Description |
|---|---|---|
| [Moderator Guide](docs/moderator-guide.md) | Session moderators | How to run a user testing session — opening the prototype, resetting between participants, what's functional, direct links to specific content |
| [Technical Guide](docs/technical-guide.md) | Engineers and product managers | Local setup, architecture decisions, seed data schema, environment variables, deployment |
| [Requirements](requirements.md) | Everyone | Full feature spec — what the prototype demonstrates, what was deferred, and why |
| [Dev Plan](dev-plan.md) | Engineers | Sequenced build phases, component inventory, API specs, decisions log |

---

## Quick start

```bash
git clone https://github.com/Banner9870/keeley-and-archer.git
cd keeley-and-archer
npm install
cd client && npm install && cd ..
cd server && npm install && cd ..
cp client/.env.example client/.env
# Add your VITE_GOOGLE_PLACES_API_KEY to client/.env
npm run dev
```

The app runs at `http://localhost:5173`. Both the React frontend and the Express RSS proxy start together.

See the [Technical Guide](docs/technical-guide.md) for full setup instructions and environment variable details.

---

## What the prototype demonstrates

- A mixed feed of community-created neighborhood guides and local news articles
- A transparent, non-algorithmic feed ordering system (neighborhood and category filters, Editor's Picks)
- A fully functional guide creation flow — search for Chicago places via Google Places, write editor's notes, pick a cover photo
- A fully functional remix/fork flow — take an existing guide and make it your own, with attribution preserved
- Neighborhood pages with boundary maps (GeoJSON from the Chicago Data Portal)
- Journalist-authored guides with newsroom verification badges
- User profiles

## What's intentionally not wired up

Likes, follows, shares, and comments are clickable but do not persist. There is no authentication. All data resets to seed state when a participant visits `/?reset=true`. See [requirements.md Section 10](requirements.md#10-out-of-scope-for-prototype) for the full list.

---

## Stack

React 18 + Vite · React Router v6 · CSS Modules · React Context + useReducer · react-leaflet · Express (RSS proxy) · Railway
