import type { Metadata } from "next";
import { SettingsView } from "@/components/carte/settings-view";

export const metadata: Metadata = { title: "Setări" };

export default function SetariPage() {
  return <SettingsView />;
}
