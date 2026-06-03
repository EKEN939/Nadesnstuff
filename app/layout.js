import "./globals.css";

export const metadata = {
  title: "nades'n'stuff — CS2 grenade lineups",
  description: "Grenade lineups per map for Counter-Strike 2. Smokes, flashes, mollys and HE.",
  icons: { icon: "/logo.png" },
};

export const viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
