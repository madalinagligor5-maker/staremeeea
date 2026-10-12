import type { Metadata } from "next";
import { DrawersView } from "@/components/carte/drawer-view";
import { RequireAccess } from "@/components/carte/require-access";

export const metadata: Metadata = { title: "Sertare" };

export default function SertarePage() {
  return <RequireAccess next="/carte/sertare"><DrawersView /></RequireAccess>;
}
