// Active maps drive the app. Add a radar image in /public/radars/ and point `radar` to it.
// Mark a map `comingSoon: true` to show it dimmed/locked on the landing (not selectable).
// Maps with radar:null render a stylized schematic (see data/radars.js) until you add a real radar.
export const MAPS = [
  { id: "mirage", name: "Mirage", radar: "/radars/mirage.png" },
  { id: "inferno", name: "Inferno", radar: null },
  { id: "cache", name: "Cache", radar: null },
  { id: "ancient", name: "Ancient", radar: null },
  { id: "dust2", name: "Dust II", radar: null, comingSoon: true },
  { id: "nuke", name: "Nuke", radar: null, comingSoon: true },
];
