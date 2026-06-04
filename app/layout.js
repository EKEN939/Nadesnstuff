import "./globals.css";
import Providers from "@/components/Providers";

export const metadata = {
  metadataBase: new URL("https://nadesnstuff.vercel.app"),
  title: "nades'n'stuff — CS2 grenade lineups",
  description: "Grenade lineups per map for Counter-Strike 2. Smokes, flashes, mollys and HE.",
  icons: { icon: "/logo.png", apple: "/icon-192.png" },
  openGraph: {
    title: "nades'n'stuff — CS2 grenade lineups",
    description: "Smokes, flashes, mollys and HE — lineups per map for Counter-Strike 2.",
    url: "https://nadesnstuff.vercel.app",
    siteName: "nades'n'stuff",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "nades'n'stuff — CS2 grenade lineups",
    description: "Smokes, flashes, mollys and HE — lineups per map for Counter-Strike 2.",
    images: ["/og.png"],
  },
};

export const viewport = { width: "device-width", initialScale: 1, themeColor: "#16181b" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body><Providers>{children}</Providers></body>
    </html>
  );
}
