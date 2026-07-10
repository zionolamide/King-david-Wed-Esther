import type { Metadata, Viewport } from "next";
import { Montserrat, Cormorant_Garamond, Great_Vibes } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif",
});

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-script",
});

export const metadata: Metadata = {
  title: "King-David & Esther | Wedding",
  description:
    "Join King-David and Esther for a formal garden elegance wedding celebration on Saturday, 22 August 2026.",
  openGraph: {
    title: "King-David & Esther | Wedding",
    description:
      "A formal garden elegance wedding celebration on Saturday, 22 August 2026.",
    type: "website"
  }
};

export const viewport: Viewport = {
  themeColor: "#fbf6ed",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`scroll-smooth ${montserrat.variable} ${cormorant.variable} ${greatVibes.variable}`}>
      <body>{children}</body>
    </html>
  );
}

