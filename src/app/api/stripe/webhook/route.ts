import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

/** Secunde Unix din Stripe, în ISO; null dacă lipsesc. */
function toIso(seconds: number | null | undefined): string | null {
  return typeof seconds === "number" && Number.isFinite(seconds) ? new Date(seconds * 1000).toISOString() : null;
}

function periodEnd(subscription: Stripe.Subscription): string | null {
  return toIso(subscription.items.data[0]?.current_period_end ?? subscription.trial_end);
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature"); const secret = process.env.STRIPE_WEBHOOK_SECRET; if (!signature || !secret) return Response.json({ error: "Webhook neconfigurat." }, { status: 400 });
  let event: Stripe.Event; const stripe = getStripe(); try { event = stripe.webhooks.constructEvent(await request.text(), signature, secret); } catch { return Response.json({ error: "Semnătură invalidă." }, { status: 400 }); }
  const db = createAdminClient();
  if (event.type === "checkout.session.completed") {
    const session = event.data.object; const userId = session.metadata?.user_id || session.client_reference_id;
    if (userId && session.customer && session.subscription) {
      // Starea reală (trialing sau active) vine de la Stripe, nu o presupunem.
      const subscription = await stripe.subscriptions.retrieve(String(session.subscription));
      await db.from("subscriptions").upsert({ user_id: userId, stripe_customer_id: String(session.customer), stripe_subscription_id: subscription.id, status: subscription.status, current_period_end: periodEnd(subscription), updated_at: new Date().toISOString() }, { onConflict: "stripe_subscription_id" });
    }
    if (userId && session.mode === "payment" && session.payment_status === "paid") await db.from("purchases").upsert({ user_id: userId, stripe_checkout_session_id: session.id, status: "paid" }, { onConflict: "stripe_checkout_session_id" });
  }
  if (event.type === "customer.subscription.created" || event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    const subscription = event.data.object; const userId = subscription.metadata.user_id;
    if (userId) await db.from("subscriptions").upsert({ user_id: userId, stripe_customer_id: String(subscription.customer), stripe_subscription_id: subscription.id, status: subscription.status, current_period_end: periodEnd(subscription), updated_at: new Date().toISOString() }, { onConflict: "stripe_subscription_id" });
  }
  if (event.type === "invoice.payment_failed") { const invoice = event.data.object; if (invoice.customer) await db.from("subscriptions").update({ status: "past_due", updated_at: new Date().toISOString() }).eq("stripe_customer_id", String(invoice.customer)); }
  return Response.json({ received: true });
}
