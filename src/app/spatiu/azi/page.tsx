import { DailyCheckin } from "@/components/daily-checkin";
import { createClient } from "@/lib/supabase/server";

export default async function TodayPage() {
  const supabase = await createClient();
  let firstName = "Ana";
  if (supabase) { const { data } = await supabase.auth.getUser(); if (data.user) { const { data: profile } = await supabase.from("profiles").select("first_name").eq("id", data.user.id).maybeSingle(); firstName = profile?.first_name || data.user.email?.split("@")[0] || "bun venit"; } }
  return <DailyCheckin firstName={firstName} />;
}
