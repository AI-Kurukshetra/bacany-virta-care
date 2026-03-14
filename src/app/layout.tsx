import type { Metadata } from "next";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "VirtaCare",
  description:
    "AI-powered chronic disease management platform for remote metabolic care.",
};

const VIEWPORT_THEME_COLOR = "#f2f7f5";

export const viewport = {
  themeColor: VIEWPORT_THEME_COLOR,
};

const htmlClassNames = [
  spaceGrotesk.variable,
  ibmPlexMono.variable,
  "antialiased",
].join(" ");

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={htmlClassNames}>
      <body>{children}</body>
    </html>
  );
}
