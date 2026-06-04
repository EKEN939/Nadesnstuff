export default function manifest() {
  return {
    name: "nades'n'stuff — CS2 grenade lineups",
    short_name: "nades'n'stuff",
    description: "Grenade lineups per map for Counter-Strike 2.",
    start_url: "/",
    display: "standalone",
    background_color: "#16181b",
    theme_color: "#16181b",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
