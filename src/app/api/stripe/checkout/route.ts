import { z } from "zod";
import type Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";

const schema = z.object({ cadence: z.enum(["monthly", "annual"]) });
export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json()); const supabase = await createClient(); const { data } = await supabase!.auth.getUser(); if (!data.user) return Response.json({ error: "Autentifică-te înainte de a alege Plus." }, { status: 401 });
    const price = input.cadence === "monthly" ? process.env.STRIPE_PLUS_MONTHLY_PRICE_ID : process.env.STRIPE_PLUS_ANNUAL_PRICE_ID; if (!price) throw new Error("Price ID neconfigurat.");
    const base = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin; const suffix = crypto.randomUUID().replace(/[^a-z]/g, "").slice(0, 8).padEnd(8, "x"); const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({ mode: "subscription", line_items: [{ price, quantity: 1 }], customer_email: data.user.email, client_reference_id: data.user.id, metadata: { user_id: data.user.id }, subscription_data: { metadata: { user_id: data.user.id } }, success_url: `${base}/spatiu/profil?checkout=success`, cancel_url: `${base}/preturi?checkout=cancelled`, allow_promotion_codes: true, integration_identifier: `starea_mea_${suffix}` } as Stripe.Checkout.SessionCreateParams & { integration_identifier: string });
    return Response.json({ url: session.url });
  } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "Cerere invalidă." }, { status: 400 }); }
}
