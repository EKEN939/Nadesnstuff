// Active maps drive the app. Add a radar image in /public/radars/ and point `radar` to it.
// Mark a map `comingSoon: true` to show it dimmed/locked on the landing (not selectable).
// To launch a coming-soon map: remove the flag and give it a radar.
export const MAPS = [
  { id: "mirage", name: "Mirage", radar: "/radars/mirage.png" },
  { id: "inferno", name: "Inferno", radar: null, comingSoon: true },
  { id: "dust2", name: "Dust II", radar: null, comingSoon: true },
  { id: "nuke", name: "Nuke", radar: null, comingSoon: true },
];
