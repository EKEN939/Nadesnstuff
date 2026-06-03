import "./globals.css";

export const metadata = {
  title: "nades'n'stuff — CS2 nade lineups",
  description: "Granat-lineups per karta for Counter-Strike 2. Smokes, flashes, mollys och HE.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="sv">
      <body>{children}</body>
    </html>
  );
}
