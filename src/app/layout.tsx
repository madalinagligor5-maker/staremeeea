import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/service-worker-register";

const serif = Cormorant_Garamond({ subsets: ["latin", "latin-ext"], variable: "--font-serif", weight: ["500", "600", "700"], display: "swap" });
const sans = Manrope({ subsets: ["latin", "latin-ext"], variable: "--font-sans", display: "swap" });
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://stareamea.ro";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Starea Mea — Minte echilibrată. Viață mai blândă.", template: "%s | Starea Mea" },
  description: "Un spațiu blând pentru organizare, focus, journaling și wellbeing — fără presiune, fără diagnostic.",
  applicationName: "Starea Mea",
  manifest: "/manifest.webmanifest",
  openGraph: { type: "website", locale: "ro_RO", siteName: "Starea Mea", title: "Un spațiu pentru mintea ta, exact așa cum este.", description: "Organizare, focus și wellbeing, într-un ritm mai blând." },
  twitter: { card: "summary_large_image", title: "Starea Mea", description: "Minte echilibrată. Viață mai blândă." },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#FBF6F4" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ro"><body className={`${serif.variable} ${sans.variable}`}><ServiceWorkerRegister />{children}</body></html>;
}
