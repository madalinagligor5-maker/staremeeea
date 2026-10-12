import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  // Doar căi din acest site: un link cu ?next=https://alt-site nu trimite utilizatorul în altă parte.
  const requested = url.searchParams.get("next");
  const next = requested && requested.startsWith("/") && !requested.startsWith("//") ? requested : "/spatiu/azi";
  if (code) {
    const supabase = await createClient();
    await supabase?.auth.exchangeCodeForSession(code);
  }
  return NextResponse.redirect(new URL(next, url.origin));
}
