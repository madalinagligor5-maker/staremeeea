import type { Metadata, Viewport } from "next";
import { Fraunces, Nunito_Sans } from "next/font/google";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import { Analytics } from "@/components/analytics";

const serif = Fraunces({ subsets: ["latin", "latin-ext"], variable: "--font-serif", display: "swap" });
const sans = Nunito_Sans({ subsets: ["latin", "latin-ext"], variable: "--font-sans", display: "swap" });
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ritualuldeazi.ro";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Ritualul de azi — Mai puțin de purtat", template: "%s | Ritualul de Azi" },
  description: "Un sistem de organizare pentru zilele grele. Structură blândă, cu trei niveluri de efort, pentru oamenii obosiți care poartă prea multe.",
  applicationName: "Ritualul de Azi",
  manifest: "/manifest.webmanifest",
  openGraph: { type: "website", locale: "ro_RO", siteName: "Ritualul de Azi", title: "Ritualul de azi — Mai puțin de purtat", description: "Structură blândă pentru zilele grele. Fii prima care află." },
  twitter: { card: "summary", title: "Ritualul de azi", description: "Mai puțin de purtat." },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#F6EFE6" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ro"><body className={`${serif.variable} ${sans.variable}`}><ServiceWorkerRegister />{children}<Analytics /></body></html>;
}
