import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendWaitlistConfirmation } from "@/lib/email";
import { newToken, siteUrl, waitlistConsentText } from "@/lib/waitlist";

const schema = z.object({
  email: z.string().trim().toLowerCase().max(254).pipe(z.email()),
  consent: z.literal(true),
  website: z.string().optional(),
});

const RESEND_COOLDOWN_MS = 5 * 60 * 1000;
const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); } catch { return fail("Cerere invalidă.", 400); }

  // Câmp-capcană pentru boți: oamenii nu-l văd. Răspundem „ok” fără să facem nimic.
  if (typeof body === "object" && body && "website" in body && typeof body.website === "string" && body.website.trim() !== "") return NextResponse.json({ ok: true });

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const consentIssue = parsed.error.issues.some((issue) => issue.path[0] === "consent");
    return fail(consentIssue ? "Bifează acordul ca să te putem înscrie." : "Verifică adresa de email, te rog.", 400);
  }
  const { email } = parsed.data;

  let db;
  try { db = createAdminClient(); } catch { return fail("Serviciul nu este configurat încă. Încearcă mai târziu.", 500); }

  const { data: existing, error: readError } = await db.from("waitlist").select("id, confirm_token, unsubscribe_token, confirmation_sent_at, confirmed_at, unsubscribed_at").eq("email", email).maybeSingle();
  if (readError) { console.error("[lista] citire waitlist:", readError.message, readError.code); return fail(`Ceva n-a mers. Încearcă din nou în câteva minute. (cod citire: ${readError.code ?? readError.message.slice(0, 60)})`, 500); }

  let row = existing;
  if (row && row.confirmed_at && !row.unsubscribed_at) return NextResponse.json({ ok: true }); // deja pe listă; nu dezvăluim asta

  const now = new Date().toISOString();
  if (!row) {
    const { data, error } = await db.from("waitlist").insert({ email, consent_text: waitlistConsentText, consented_at: now, source: "lansare" }).select("id, confirm_token, unsubscribe_token, confirmation_sent_at, confirmed_at, unsubscribed_at").single();
    if (error || !data) { console.error("[lista] scriere waitlist:", error?.message, error?.code); return fail(`Ceva n-a mers. Încearcă din nou în câteva minute. (cod scriere: ${error?.code ?? error?.message?.slice(0, 60)})`, 500); }
    row = data;
  } else if (row.unsubscribed_at) {
    // Reînscriere după dezabonare: acord nou, token nou.
    const { data, error } = await db.from("waitlist").update({ consent_text: waitlistConsentText, consented_at: now, confirm_token: newToken(), confirmed_at: null, unsubscribed_at: null, confirmation_sent_at: null }).eq("id", row.id).select("id, confirm_token, unsubscribe_token, confirmation_sent_at, confirmed_at, unsubscribed_at").single();
    if (error || !data) { console.error("[lista] scriere waitlist:", error?.message, error?.code); return fail(`Ceva n-a mers. Încearcă din nou în câteva minute. (cod scriere: ${error?.code ?? error?.message?.slice(0, 60)})`, 500); }
    row = data;
  } else if (row.confirmation_sent_at && Date.now() - new Date(row.confirmation_sent_at).getTime() < RESEND_COOLDOWN_MS) {
    return NextResponse.json({ ok: true }); // am trimis deja un email de curând
  }

  const base = siteUrl(request);
  const sent = await sendWaitlistConfirmation(email, `${base}/api/lista/confirma?t=${row.confirm_token}`, `${base}/api/lista/dezabonare?t=${row.unsubscribe_token}`);
  if (!sent) { console.error("[lista] email netrimis (verifică RESEND_API_KEY / RESEND_FROM_EMAIL)"); return fail("Nu am putut trimite emailul de confirmare. Încearcă din nou în câteva minute.", 500); }

  await db.from("waitlist").update({ confirmation_sent_at: new Date().toISOString() }).eq("id", row.id);
  return NextResponse.json({ ok: true });
}
