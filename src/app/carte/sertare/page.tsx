import type { Metadata } from "next";
import { DrawersView } from "@/components/carte/drawer-view";

export const metadata: Metadata = { title: "Sertare" };

export default function SertarePage() {
  return <DrawersView />;
}
