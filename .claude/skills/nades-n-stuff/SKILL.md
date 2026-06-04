---
name: nades-n-stuff
description: >
  Conventions and architecture for the "nades'n'stuff" website — a Counter-Strike 2
  grenade-lineup site (Next.js App Router). Use this whenever editing, extending, or
  debugging this project: adding maps, lineups or videos, changing the theme, working
  on the tactical map / pins, the admin editing mode, the live-storage API, or the
  deploy flow. Covers the data model, file layout, design tokens and the GitHub →
  Vercel workflow.
---

# nades'n'stuff — project guide

A site that shows grenade (nade) lineups per Counter-Strike 2 map: an interactive
radar with clickable pins, filterable by side (T/CT) and type (smoke/flash/molly/he),
plus a detail view with an optional video and still-image steps. Single page, App Router.

## Tech stack
- Next.js 14 (App Router), React 18.
- Plain CSS in `app/globals.css` (all classes are prefixed `ub-`; logo classes `nns-`).
- `lucide-react` for UI icons; custom grenade icons live in `components/NadeIcon.js`.
- `animejs` v4 (named exports `animate`, `stagger`) for card/pin/modal motion.
- `@upstash/redis` for optional live storage (see "Live storage").
- Fonts: Archivo (display) + Manrope (body), imported at the top of `globals.css`
  via `@import url(...)` — NOT `next/font` (the build network can't reach Google Fonts).

## File layout
- `app/page.js` — the whole app: state, filters, admin unlock, map/list views, modals.
- `app/layout.js` — metadata, viewport, favicon (`/logo.png`).
- `app/globals.css` — all styling + design tokens (`:root`).
- `app/api/lineups/route.js` — GET (public read) + PUT (token-protected write).
- `components/` — `TacticalMap`, `LineupCard`, `LineupModal`, `AddLineupForm`,
  `ExportModal`, `Logo`, `NadeIcon`.
- `data/maps.js` — list of active maps.
- `data/lineups.js` — the content (all lineups). This is the seed/source of truth.
- `data/radars.js` — `MAP_ZONES`: stylized schematic used only for maps with no radar image.
- `lib/constants.js` — `TYPE_META` (label + color per nade type) and `DIFF_COLOR`.
- `lib/store.js` — Upstash read/write helpers, falls back to the seed file.
- `public/radars/<map>.png` — radar images. `public/logo.png` — uploaded logo / favicon.

## Data model (a lineup object)
```js
{
  id: 1,                 // unique number
  map: "mirage",         // must match a maps.js id
  side: "T",             // "T" | "CT"
  type: "smoke",         // "smoke" | "flash" | "molly" | "he"
  target: "CT",          // where it lands (shown big)
  from: "T Ramp",        // where you stand
  spawn: "T Spawn" | null,        // optional, used as the variant label
  throwType: "Jump-throw",        // Left-click | Jump-throw | Run + jump-throw | Right-click
  difficulty: "Easy",    // Easy | Medium | Hard
  x: 56, y: 41,          // LANDING point (the spot), percent (0-100)
  fromX: 30, fromY: 70,  // THROW point (where you stand), percent
  tip: "…" | null,       // short instruction
  video: "https://…" | null,      // mp4 URL or YouTube URL (auto-detected)
  steps: [               // 1-3 still images shown under the video
    { label: "Setup" | "Aim" | "Result", img: "https://…" | null, caption: "…" },
  ],
}
```


## Spots (grouping) & the two points
Each lineup has two map points: `x,y` = where it LANDS, `fromX,fromY` = where you THROW from.
Pins are grouped by `target` (the landing spot): all lineups with the same target become ONE
pin on the landing point, with a count badge. Clicking a multi-lineup pin selects the spot —
the map draws dashed lines out to each throw position and the side panel lists the variants
(labelled by `spawn` or `from`); clicking a variant opens its video + steps. Single-lineup
pins open the detail directly. The Add form places two points (landing, then throw) and lets
you attach a lineup to an existing spot (inherits its landing point) or make a new one.

## How to add a lineup
Easiest: run the site, type `admin` to unlock, click **Add lineup**, click the map to
place the pin, fill the fields, Save. It prints a ready-to-paste object — paste it into
the `LINEUPS` array in `data/lineups.js`. (Or, with live storage on, click **Save live**.)
To add by hand, append an object to `LINEUPS` following the model above; `x`/`y` are percent.

## How to add a map
1. Put the radar image in `public/radars/<id>.png`.
2. Add `{ id: "<id>", name: "<Name>", radar: "/radars/<id>.png" }` to `MAPS` in `data/maps.js`.
   (Use `radar: null` to fall back to a stylized schematic; define its zones in `data/radars.js`.)
The map rail auto-shows once there is more than one map.
Do not commit Valve's official radar images (copyright) — use your own captures.

## How to add video / images to a lineup
- `video`: a direct `.mp4` URL or a YouTube link. `LineupModal` auto-detects YouTube and
  embeds an iframe, otherwise renders a `<video controls>`. Shown at the top of the modal.
- Still images: each `steps[].img` is a URL (or null → placeholder). Shown under the video.
- File upload IS wired: the form's Upload buttons send files to Vercel Blob via
  `app/api/upload/route.js` (uses `@vercel/blob/client` `upload` + `handleUpload`,
  token-checked against `ADMIN_TOKEN`). Needs a Blob store (`BLOB_READ_WRITE_TOKEN`).
  Without it, paste a URL instead.

## Landing & sharing
- The app has two screens: a landing map-picker (`components/Landing.js`) and the per-map
  view, swapped in `app/page.js` via a `screen` state with an anime.js zoom transition.
  Back: the logo, the "All maps" button, or Esc.
- Maps can be `comingSoon: true` (dimmed/locked on the landing).
- The landing shows a per-type tally, a map search, and a "Recently added" list.
- Shareable links: opening a lineup sets `?map=<id>&lineup=<id>` (see the URL-sync and
  deep-link logic in page.js); the modal has a Copy link button.

## Admin mode (no visible login)
- There is no login button. Typing the secret word (`const ADMIN_KEY = "admin"` in
  `app/page.js`) — or visiting `/#admin` — toggles editing UI on/off. This only HIDES the
  UI; it is not security. Change `ADMIN_KEY` to something private.
- When unlocked: Add lineup, Export, Save live (if storage configured), and per-pin
  Edit/Delete (in the detail modal).

## Live storage (optional)
- Reads are public via `GET /api/lineups`; writes require a token via `PUT` (checked
  server-side against `process.env.ADMIN_TOKEN`).
- `lib/store.js` uses Upstash Redis if `KV_REST_API_URL`/`KV_REST_API_TOKEN`
  (or `UPSTASH_REDIS_REST_URL`/`_TOKEN`) are set; otherwise it returns the seed file and
  the Save-live button is hidden.
- Enable: in Vercel → Storage → add a Redis (Upstash) database and connect it; add an
  `ADMIN_TOKEN` env var; redeploy. The client caches the token in `localStorage` as
  `nns_admin_token`.

## Design tokens (in `:root`, `app/globals.css`)
- `--bg #16181b`, `--surface #1e2125`, `--surface2 #24282d`, `--border #2b2f34`
- `--text #ececec`, `--muted #9aa0a7`, `--accent #f06a3b` (orange UI accent),
  `--logo #5fa463` (green; logo N + crosshair).
- Type colors (lib/constants.js): smoke `#8aa0b5`, flash `#e0b341`, molly `#e0483a`, he `#5fa463`.
- Difficulty: Easy `#5fa463`, Medium `#e0b341`, Hard `#e0483a`.
- Side tags: T gold `#e0b341`, CT blue `#5aa9e0`.
- Layout is a centered column, `max-width:1200px` on `.ub-wrap`.

## Conventions
- Keep UI text in English.
- Keep all styling in `globals.css` with `ub-`/`nns-` prefixes; no CSS-in-JS, no Tailwind.
- Client components need `"use client"`. Use the `@/` import alias (jsconfig.json).
- Verify with `npm run build` before shipping.

## Deploy flow
- Code lives on GitHub (`EKEN939/Nadesnstuff`), connected to Vercel (auto-deploy on push).
- Editing via the browser: GitHub → Add file → Upload files → drag the changed files
  (overwrites by path) → commit → Vercel rebuilds.
- Framework Preset in Vercel MUST be **Next.js** (if it's "Other" the site 404s).
