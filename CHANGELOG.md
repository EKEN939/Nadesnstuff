# Changelog — nades'n'stuff

Alla nämnvärda ändringar dokumenteras här, nyast överst. Varje leverans får en egen post.

Format: `## [etikett] — ÅÅÅÅ-MM-DD` följt av grupperade ändringar med berörda filer.

---

## [Motion-pass — reveals + mikrointeraktioner] — 2026-06-18

Tillämpade tre motion-skills (UI-Animation, CSS/HyperFrames, Animation Designer) som
ett rörelsepass. Principer: 200–320ms, naturlig easing (`--ease`), **endast
transform/opacity**, full `prefers-reduced-motion`-respekt. Medvetet **ingen
scroll-länkad parallax** (skyddar scroll-prestandan). Rent CSS — ingen JS/markup rörd.

**Fil:** `app/globals.css` (tillagt block sist).

- **Tokens:** `--dur-1:.2s`, `--dur-2:.32s`.
- **Staggered reveals** (`@keyframes nns-rise`, translateY 14px + fade): `.nl-grid`,
  `.ub-grid`, `.nl-recentgrid` barn animeras in med nth-child-stagger (0–.28s, capad).
  Spelar om vid mount + filter-/kartbyte (grid-key ändras).
- **Hero-tally:** mjuk staggad rise på `.nl-tallyitem`.
- **Mikrointeraktioner:** tryck-feedback (`:active` → `scale(.96)` på knappar/pills,
  `translateY(-2px) scale(.99)` på kort).
- **A11y:** tangentbords-`:focus-visible`-ring (2px accent).
- **Reduced-motion:** allt ovan avstängt under `prefers-reduced-motion: reduce`.
- **Ej gjort (medvetet):** skeleton-laddning (splashen "loading lineups…" täcker redan
  laddningstillståndet), scroll-parallax.

---

## [Pin-language — ny spec (form + glyf)] — 2026-06-18

Bytte kart-pinsen till Claude Designs slutgiltiga pin-language (ersätter Förslag 4).
Berör även filter-pills/legend/lista/detalj eftersom `NadeIcon` är delad → glyferna
byts konsekvent överallt.

**Filer:** `components/NadeShape.js`, `components/NadeIcon.js`,
`components/TacticalMap.js`, `app/globals.css`.

### Silhuetter (`NadeShape`, viewBox 0 0 24 24, fyllning = sida)
- smoke: cirkel (r 9.4) — *oförändrad*
- flash: **triangel** (var: 8-uddig burst)
- molotov: **rundad fyrkant** (var: triangel)
- HE: **diamant** (var: pentagon)
- mörk outline `#16181b`, strokeWidth 1.7, rundade hörn

### Glyfer (`NadeIcon`, viewBox 0 0 24 24)
- smoke: **puff** (fylld) — var: cloud
- flash: **★ stjärna** (fylld) — var: bolt
- molotov: **flamma** (fylld)
- HE: **frag-granat** (streckad)

### Pin (`TacticalMap`)
- glyf-färg tonad till sidan: T `#241a02`, CT `#06223a`, blandad `#16181b`
  (var: enhetlig `#16181b`)
- glyf-nudge (~3px ned) flyttad från `.ub-shape-molly` → `.ub-shape-flash` (triangeln nu)

---

## [Visual uplift — pass 1: Refined-bas + fyrkantiga kontroller] — 2026-06-18

Första passet av det visuella omtaget (riktning: mest "Refined", fyrkantigare knappar,
inga crosshair/HUD). Globala grepp som lyfter hela sajten. **Ingen logik/JS rördes.**

**Filer:** `app/globals.css` (tillagt block sist), `components/Landing.js` (en rad).

### Nya design-tokens (`:root`)
- `--on-accent: #1f0c04`
- `--border-strong: #423c4b`
- `--grad-accent: linear-gradient(180deg,#ff6f24,#ff5b00)`
- `--grad-accent-hover: linear-gradient(180deg,#ff854a,#ff6a1a)`
- `--glow-accent: 0 4px 16px rgba(255,91,0,.22)`
- `--glow-accent-hover: 0 7px 22px rgba(255,91,0,.32)`
- `--ease: cubic-bezier(.2,.8,.2,1)`
- `--ribbon: linear-gradient(90deg,#5d8ad8 0 25%,#e0b341 25% 50%,#cf4a3c 50% 75%,#ff5b00 75% 100%)`
- `--shadow-card: 0 6px 22px rgba(0,0,0,.26)`
- `--shadow-lift: 0 20px 44px rgba(0,0,0,.36)`
- `--ctl-r: 5px`

### Fyrkantiga kontroller (`border-radius: 5px !important`)
Tidigare mestadels `999px`, några `8–10px`:
`.ub-pill`, `.ub-viewtoggle`, `.ub-search`, `.nl-search`, `.nl-mapsearch`, `.nl-stat`,
`.nl-tally`, `.ub-btn-primary`, `.ub-addbtn`, `.ub-toolbtn`, `.ub-select`,
`.ub-lib-tabs button`, `.ub-mapcard-count`, `.nl-count`, `.ub-meta-chip`, `.ub-sidetag`,
`.ub-adminflag`, `.ub-lib-count`, `.ub-colopen`, `.ub-recentchip`, `.nl-recentchip`,
`.ub-queue`, `.dh-roomtag`, `.ub-pillcount`, `.ub-steps-head button`.

### Knappar (beteende)
- `.ub-btn-primary, .ub-addbtn`: bakgrund `--grad-accent`, skugga `--glow-accent`,
  textfärg `--on-accent`. `:hover` → `--grad-accent-hover`, `--glow-accent-hover`,
  `translateY(-1px)`.
- `.ub-toolbtn:hover` → textfärg `--text`, kant `--border-strong`.

### Hero
- `.nl-display`: `font-size → clamp(44px,5.6vw,80px)`, `line-height → 1.05`.
- **Ny** `.nl-ribbon`: 120×5px, radius 3px, `background:var(--ribbon)`, centrerad
  (`margin:24px auto 0`). Markup tillagd i `Landing.js` mellan `</h1>` och `.nl-tally`.

### Map-vy
- `.ub-hero-title`: `clamp(28px,4vw,40px)` → `clamp(30px,3.8vw,48px)`.

### Kort-elevation (hover)
- `.ub-card`: `box-shadow:var(--shadow-card)` + transition; `:hover` →
  `var(--shadow-lift)` + `translateY(-4px)`.
- `.nl-card`: `box-shadow:var(--shadow-card)` + transition; `img` får
  `transition:transform .45s`; `:hover` → `var(--shadow-lift)` + `translateY(-5px)`;
  `:hover img` → `scale(1.06)`.

### Ej gjort (medvetet — kommande pass)
Map-vyns filterrad/panel/legend/radar-ram, lineup-kortens topborder/watermark/diffbars/CTA,
detaljvyn, sektionsrubriker (eyebrow + versal H2 + räknare), bredare sidmarginaler.

---

## [Tidigare samma session — innan changeloggen] — 2026-06-17/18

Kort sammanfattning av de närmast föregående ändringarna (inte uttömmande):

- **Pins:** form = granattyp (cirkel/burst/triangel/pentagon, `components/NadeShape.js`),
  fyllning = sida (guld T / blå CT), delad fyllning för blandad plats, mörk typ-ikon
  centrerad i formen. T/CT-legend på kartan.
- **Typfilter:** "All types" borttagen → flervalsknappar (alla på default, minst en på),
  `app/page.js` + `app/globals.css`.
- **Nade-ikoner:** smoke=cloud, flash=bolt, molly=flame (Tabler, `components/NadeIcon.js`).
- **Add-formulär:** nya throw-typer "Crouch + jump-throw" och "Right + Left-click".
- **(Separat leverabel, ej i repot):** `nadeprac.cfg` + lineup-manual — crosshair-fix
  (`cl_draw_only_deathnotices`), resolution-binds (`r_fullscreen 1`), crouch-toggle på X.
