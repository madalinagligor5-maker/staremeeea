import type { Metadata, Viewport } from "next";
import { CarteShell } from "@/components/carte/carte-shell";

export const metadata: Metadata = {
  title: "Cartea",
  description: "Pagina zilei, în trei niveluri de efort. Ce scrii rămâne pe acest dispozitiv.",
  robots: { index: false, follow: false },
  appleWebApp: { capable: true, title: "Ritualul", statusBarStyle: "default" },
  icons: { apple: "/icons/apple-touch-icon.png" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#432D3D" };

export default function CarteLayout({ children }: { children: React.ReactNode }) {
  return <CarteShell>{children}</CarteShell>;
}
