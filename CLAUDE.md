# CLAUDE.md — Standing rules for all agent sessions

This file is read automatically at the start of every Claude Code session.
All rules below apply to every task in this project unless Ellery explicitly overrides them in the session prompt.

---

## Project context

This is the **chicago.com prototype** — a Plain React + Vite web app and Express backend for Chicago Public Media.
It is a one-week user testing prototype, not a production build.

- **Requirements:** `requirements.md` — source of truth for all feature decisions
- **Development plan:** `dev-plan.md` — sequenced build phases, task specs, component inventory, API specs
- **Repository:** https://github.com/Banner9870/keeley-and-archer
- **Deployment:** Railway — two services (`chicago-com-frontend` and `chicago-com-server`) in the `keeley-and-archer` project

---

## Rules

### Before starting any task
1. Read `dev-plan.md` and `requirements.md` before writing or modifying any code.
2. Read every file you intend to edit before editing it — never modify a file you haven't read in this session.
3. Confirm the current phase and task numbers match what Ellery asked for before proceeding.

### Scope
4. Complete only the tasks explicitly named in the session prompt. Do not start the next phase or task.
5. Do not modify files outside the scope of the current task. If a fix requires touching something out of scope, flag it and ask.
6. Do not add features, refactor code, or make improvements beyond what the task specifies.

### When blocked or uncertain
7. If a task is blocked by a missing decision, missing API key, or incomplete dependency — stop and surface the blocker. Do not invent a workaround.
8. If a task spec is ambiguous, state your interpretation and ask for confirmation before writing code.
9. If a design question arises mid-task, flag it to Ellery rather than deciding independently.

### Code quality
10. All client-side environment variables must use the `VITE_` prefix — never `REACT_APP_`.
11. Always start both services together: `npm run dev` from the repo root (uses `concurrently`). Never start the client alone.
12. The route `/guide/new` must be declared before `/guide/:id` in the React Router route table — do not reorder routes.
13. Leaflet maps require `import 'leaflet/dist/leaflet.css'` and manual marker icon imports for Vite compatibility. Always include these.
14. Never commit `.env` — it is in `.gitignore`. Use `.env.example` for documenting required variable names.

### Git
15. Commit message format: `Phase N: [short description]` (e.g. `Phase 1: scaffold and design system`)
16. Push to `main` after every phase commit: `git push origin main`
17. If `git push` is rejected, run `git pull --rebase origin main` before pushing again.

### End of session
18. When a phase or task is complete, summarize: which files were changed, what each change does, and any issues or open questions Ellery should review before the next session.
19. Do not start the next phase after completing a summary — wait for Ellery's confirmation.

---

## Key technical decisions (do not re-litigate these)

| Decision | Choice | Reason |
|---|---|---|
| Framework | React 18 + Vite | Not Create React App |
| Routing | React Router v6 | See route order note above |
| Styling | CSS Modules | Full control over bold/assertive design system |
| State | React Context + useReducer | One AppContext; shape defined in dev-plan Section 4 |
| Maps (interactive) | react-leaflet + Leaflet.js | Lighter than Google Maps JS API for polygon display |
| Maps (thumbnails) | Google Maps Static API | Simple `<img>` tag, same API key as Places |
| RSS parsing | fast-xml-parser on Express server | rss-to-json is Node-only; can't run in browser |
| Place reordering | Up/down arrow buttons | No drag-and-drop in prototype |
| Auth | None | App pre-loads as Alex Rivera (@alexrivera.chicago.com) |
| Search indexing | Blocked | robots.txt + noindex meta tag both required |

---

## Architect's notes for agents

- The `AppContext` state shape is the contract between all components. Do not add fields to it during component work without updating the spec in `dev-plan.md` Section 4 first.
- `seed.js` must be complete and smoke-tested before any page component renders real content (Phase 3 precedes Phase 5).
- The Express server uses an `ALLOWED_ORIGIN` environment variable for CORS — not a hardcoded domain. During local dev, `localhost:5173` is the default. Never use `*` in production.
- `client/Caddyfile` is required for Railway to serve the SPA correctly. Without it, every non-root URL returns 404 in production.
- Guide cards and article cards have **intentionally different visual anatomy** — guides are taller (cover photo required), articles are compact (no cover photo). Do not make them structurally similar.
