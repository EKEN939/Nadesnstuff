// Active maps drive the app.
// Radar image: drop a PNG in /public/radars/ named after the map id (e.g. inferno.png).
// It is auto-detected and used; if no file is present a stylized schematic (data/radars.js)
// is shown instead. You can also set `radar` to an explicit path to override the convention.
// Mark a map `comingSoon: true` to show it dimmed/locked on the landing (not selectable).
export const MAPS = [
  { id: "mirage", name: "Mirage", radar: "/radars/mirage.png" },
  { id: "inferno", name: "Inferno", radar: null },
  { id: "cache", name: "Cache", radar: null },
  { id: "ancient", name: "Ancient", radar: null },
  { id: "dust2", name: "Dust II", radar: null, comingSoon: true },
  { id: "nuke", name: "Nuke", radar: null, comingSoon: true },
];
