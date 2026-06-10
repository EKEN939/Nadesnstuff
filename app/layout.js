import "./globals.css";
import Providers from "@/components/Providers";
import { Analytics } from "@vercel/analytics/react";

const BASE = "https://nadesnstuff.vercel.app";

export const metadata = {
  metadataBase: new URL(BASE),
  title: {
    default: "nades'n'stuff — CS2 grenade lineups",
    template: "%s · nades'n'stuff",
  },
  description:
    "Interactive CS2 grenade lineups on a tactical map — smokes, flashes, molotovs and HE for Mirage, Inferno, Dust II and more. Step-by-step images, videos and practice commands.",
  applicationName: "nades'n'stuff",
  keywords: [
    "CS2 lineups", "CS2 smokes", "CS2 grenade lineups", "Counter-Strike 2 nades",
    "Mirage smokes", "Inferno smokes", "Dust 2 smokes", "CS2 flash lineups", "CS2 molotov lineups",
  ],
  alternates: { canonical: BASE },
  verification: { google: "lJIzzkdPT9-swCf29OsjovOiIul7DhLjy1Ue2xBO2Y4" },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  icons: { icon: "/logo.png", apple: "/icon-192.png" },
  openGraph: {
    title: "nades'n'stuff — CS2 grenade lineups",
    description: "Interactive grenade lineups on a tactical map — smokes, flashes, mollys and HE, per map for Counter-Strike 2.",
    url: BASE,
    siteName: "nades'n'stuff",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "nades'n'stuff — CS2 grenade lineups" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "nades'n'stuff — CS2 grenade lineups",
    description: "Interactive grenade lineups on a tactical map — smokes, flashes, mollys and HE, per map for Counter-Strike 2.",
    images: ["/og.png"],
  },
};

export const viewport = { width: "device-width", initialScale: 1, themeColor: "#1a1b20" };

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "nades'n'stuff",
  url: BASE,
  description: "Interactive CS2 grenade lineups on a tactical map — smokes, flashes, molotovs and HE.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
