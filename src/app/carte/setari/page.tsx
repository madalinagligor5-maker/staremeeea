import type { Metadata } from "next";
import { RequireAccess } from "@/components/carte/require-access";
import { SettingsView } from "@/components/carte/settings-view";

export const metadata: Metadata = { title: "Setări" };

export default function SetariPage() {
  return <RequireAccess next="/carte/setari"><SettingsView /></RequireAccess>;
}
