import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("t") ?? "";
  const to = (query: string) => NextResponse.redirect(new URL(`/multumim?${query}`, url));
  if (!/^[a-f0-9]{32,64}$/.test(token)) return to("eroare=1");
  try {
    const db = createAdminClient();
    const { data } = await db.from("waitlist").select("id, confirmed_at").eq("confirm_token", token).maybeSingle();
    if (!data) return to("eroare=1");
    if (!data.confirmed_at) await db.from("waitlist").update({ confirmed_at: new Date().toISOString(), unsubscribed_at: null }).eq("id", data.id);
    return to("confirmat=1");
  } catch { return to("eroare=1"); }
}
