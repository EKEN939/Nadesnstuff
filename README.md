# nades'n'stuff — CS2 nade lineups

En sajt som visar granat-lineups per karta for Counter-Strike 2. Bygg vidare,
byt namn och farger, och fyll pa med dina egna lineups.

## Kom igang lokalt

Kraver Node.js 18.17+ (Node 20 rekommenderas).

```bash
npm install
npm run dev
```

Oppna http://localhost:3000

## Lagg till lineups

Du behover **inte** rora komponentkoden. Tva satt:

1. **Via sajten:** klicka "Lagg till lineup", klicka pa kartan for att placera
   positionen, fyll i faltan och tryck spara. Du far da en kodbit som du
   klistrar in i `data/lineups.js`. (Lineups du lagger till i webblasaren
   forsvinner vid omladdning tills de ligger i filen.)

2. **Direkt i filen:** oppna `data/lineups.js` och lagg till ett objekt i
   `LINEUPS`-arrayen. Falten star forklarade hogst upp i filen.

## Bilder och radar

- Lagg dina setup/aim/result-bilder (eller gifs) i `public/` och peka ut dem
  med full sokvag, t.ex. `img: "/lineups/mirage-ct-setup.png"`.
- Vill du ha en riktig radar-bild bakom kartan: lagg den i `public/radars/`
  och satt `radar: "/radars/mirage.png"` i `data/maps.js`. Anvand egna eller
  fritt licensierade bilder — Valves officiella radarbilder ar upphovsrattsskyddade.

## Projektstruktur

```
data/maps.js        kartor (lagg till radar-bild har)
data/lineups.js     DITT innehall — lagg till lineups har
lib/constants.js    farger + etiketter for granattyper
lib/icons.js        granattyp -> ikon
components/          TacticalMap, LineupCard, LineupModal, AddLineupForm
app/page.js          startsida som binder ihop allt
app/globals.css      all styling
```

## Deploya gratis (Vercel)

1. Lagg projektet pa GitHub (`git init`, commit, push till ett nytt repo).
2. Ga till https://vercel.com, logga in med GitHub.
3. "Add New Project" -> importera ditt repo -> Deploy. Inga installningar behovs.

Vercel kanner igen Next.js automatiskt. Varje push till main deployar om sajten.
Alternativ som ocksa fungerar gratis: Netlify och Cloudflare Pages.

## Live-redigering (valfritt) — spara andringar direkt fran den deployade sajten

Som standard laser sajten sina lineups fran `data/lineups.js`. Vill du kunna
redigera direkt pa den publika URL:en och spara pa riktigt, koppla pa en gratis
nyckel-databas (Upstash Redis via Vercel):

1. I Vercel: oppna ditt projekt -> fliken **Storage** -> skapa en **KV / Upstash Redis**-databas
   och koppla den till projektet. Vercel lagger da automatiskt till miljovariablerna
   `KV_REST_API_URL` och `KV_REST_API_TOKEN`.
2. Lagg till en egen miljovariabel `ADMIN_TOKEN` = ett langt hemligt losenord
   (Settings -> Environment Variables).
3. Redeploya.

Sa anvander du det: ga till sajten, skriv `admin` for att lasa upp, gor dina
andringar och klicka **Spara live**. Forsta gangen fragar den efter din
`ADMIN_TOKEN` (sparas sedan i webblasaren). Lasningen ar publik; bara skrivning
kraver token, och token kontrolleras pa servern.

Utan dessa variabler fungerar sajten precis som forut (laser `data/lineups.js`),
och "Spara live"-knappen visas inte - anvand "Exportera" da.

Lokalt test: kopiera `env.example` till `.env.local` och fyll i vardena.

## File uploads (optional)

The "Add lineup" form has Upload buttons for the video and step images. They upload
straight to Vercel Blob and fill in the URL for you. To enable:

1. In Vercel → Storage → create a **Blob** store and connect it (sets `BLOB_READ_WRITE_TOKEN`).
2. Make sure `ADMIN_TOKEN` is set (the upload route checks it before allowing uploads).
3. Redeploy.

Without a Blob store the Upload buttons just fail gracefully — paste a URL instead.

## Shareable links

Opening a lineup updates the URL to `/?map=<map>&lineup=<id>`, and the detail view has a
**Copy link** button. Anyone opening that link lands directly on that lineup.

## Map radar images
Drop a PNG into `public/radars/` named after the map id — `mirage.png`, `inferno.png`,
`ancient.png`, etc. It is detected automatically and shown; if there's no file, a stylized
schematic is shown instead. No code change needed.

If you use SimpleRadar images (free for personal use, download from https://readtldr.gg/simpleradar),
please credit SimpleRadar / readtldr.gg as the radar source. Their pack covers the common
competitive maps; some maps (e.g. Cache) may not be available there.
