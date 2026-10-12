"use client";
// Intrarea în Carte: la prima deschidere, configurarea de două minute; apoi pagina zilei.
import { useEffect, useState } from "react";
import { loadSettings, saveSettings, type Settings } from "@/lib/carte/settings";
import { DayBook } from "./day-book";
import { Onboarding } from "./onboarding";

export function CarteHome() {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => { setSettings(loadSettings()); }, []);

  if (!settings) return <div className="min-h-[60vh]" aria-busy="true" />;
  if (!settings.onboarded) {
    return <Onboarding initial={settings} onDone={(next) => { saveSettings(next); setSettings(next); }} />;
  }
  return <DayBook settings={settings} />;
}
