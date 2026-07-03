import type { Metadata, Viewport } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "King David & Esther | Wedding",
  description:
    "Join King David and Esther for a formal garden elegance wedding celebration.",
  openGraph: {
    title: "King David & Esther | Wedding",
    description:
      "A formal garden elegance wedding celebration.",
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
      <body>{children}</body>
    </html>
  );
}
