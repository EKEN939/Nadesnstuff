// Active maps drive the app.
// Radar image: drop a PNG in /public/radars/ named after the map id (e.g. inferno.png).
// It is auto-detected and used; if no file is present a stylized schematic (data/radars.js)
// is shown instead. You can also set `radar` to an explicit path to override the convention.
// Mark a map `comingSoon: true` to show it dimmed/locked on the landing (not selectable).
export const MAPS = [
  { id: "mirage", name: "Mirage", radar: "/radars/mirage.png" },
  { id: "inferno", name: "Inferno", radar: "/radars/inferno.png" },
  { id: "dust2", name: "Dust II", radar: "/radars/dust2.png" },
  { id: "cache", name: "Cache", radar: "/radars/cache.png" },
  { id: "ancient", name: "Ancient", radar: "/radars/ancient.png" },
  { id: "overpass", name: "Overpass", radar: "/radars/overpass.png" },
  { id: "nuke", name: "Nuke", radar: null, comingSoon: true },
];
