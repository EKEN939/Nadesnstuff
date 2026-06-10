import { MAPS } from "@/data/maps";

const BASE = "https://nadesnstuff.vercel.app";

export default function sitemap() {
  const maps = MAPS.filter((m) => !m.comingSoon).map((m) => ({
    url: `${BASE}/?map=${m.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));
  return [
    { url: BASE, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    ...maps,
  ];
}
