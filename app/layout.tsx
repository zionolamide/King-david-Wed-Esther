import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Great_Vibes, Montserrat } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap"
});

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-great-vibes",
  display: "swap"
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap"
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
    <html lang="en" className="scroll-smooth">
      <body
        className={`${cormorant.variable} ${greatVibes.variable} ${montserrat.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
