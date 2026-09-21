import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";

export async function POST(request: Request) {
  const supabase = await createClient(); const { data } = await supabase!.auth.getUser(); if (!data.user) return Response.json({ error: "Neautorizat" }, { status: 401 });
  const { data: subscription } = await supabase!.from("subscriptions").select("stripe_customer_id").eq("user_id", data.user.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (!subscription?.stripe_customer_id) return Response.json({ error: "Nu există un abonament de administrat." }, { status: 404 });
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin; const session = await getStripe().billingPortal.sessions.create({ customer: subscription.stripe_customer_id, return_url: `${base}/spatiu/profil` });
  return Response.json({ url: session.url });
}
