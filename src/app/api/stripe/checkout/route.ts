import { z } from "zod";
import type Stripe from "stripe";
import { getAccess } from "@/lib/access";
import { getStripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({ cadence: z.enum(["monthly", "annual"]) });

export const TRIAL_DAYS = 3;

// 25 lei pe lună sau 225 lei pe an (18,75 lei pe lună). Sumele sunt în bani (subunități).
const plans = {
  monthly: { amount: 2500, interval: "month" as const, name: "Ritualul de azi, abonament lunar", label: "25 lei pe lună" },
  annual: { amount: 22500, interval: "year" as const, name: "Ritualul de azi, abonament anual", label: "225 lei pe an" },
};

export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json());
    const supabase = await createClient();
    const { data } = await supabase!.auth.getUser();
    if (!data.user) return Response.json({ error: "Creează un cont sau intră în cont înainte de a alege planul." }, { status: 401 });

    const access = await getAccess();
    if (access?.subscribed) return Response.json({ error: "Ai deja un abonament activ. Îl administrezi din Date, în Cartea." }, { status: 409 });

    const plan = plans[input.cadence];
    // Dacă ai definit prețuri în Stripe Dashboard, se folosesc ele. Altfel, prețul se creează aici, la plată.
    const priceId = input.cadence === "monthly" ? process.env.STRIPE_CARTE_MONTHLY_PRICE_ID : process.env.STRIPE_CARTE_ANNUAL_PRICE_ID;
    const lineItem: Stripe.Checkout.SessionCreateParams.LineItem = priceId
      ? { price: priceId, quantity: 1 }
      : { quantity: 1, price_data: { currency: "ron", unit_amount: plan.amount, recurring: { interval: plan.interval }, product_data: { name: plan.name } } };

    // Proba de 3 zile se acordă o singură dată pe cont.
    const trial = access?.hasSubscription ? false : true;
    // Implicit proba cere card. CARTE_TRIAL_CARD=optional: proba începe fără card și se oprește singură dacă nu adaugi unul.
    const cardOptional = trial && process.env.CARTE_TRIAL_CARD === "optional";

    const base = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
    const suffix = crypto.randomUUID().replace(/[^a-z]/g, "").slice(0, 8).padEnd(8, "x");
    const stripe = getStripe();
    const message = trial
      ? `Primele ${TRIAL_DAYS} zile sunt gratuite. După ele, abonamentul continuă la ${plan.label}. Anulezi oricând din cont, înainte de final, și nu plătești nimic. Ce ai scris rămâne al tău.`
      : `Abonamentul este de ${plan.label}. Anulezi oricând din cont. Ce ai scris rămâne al tău.`;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [lineItem],
      customer_email: data.user.email,
      client_reference_id: data.user.id,
      metadata: { user_id: data.user.id, cadence: input.cadence },
      subscription_data: {
        metadata: { user_id: data.user.id },
        ...(trial ? { trial_period_days: TRIAL_DAYS } : {}),
        ...(cardOptional ? { trial_settings: { end_behavior: { missing_payment_method: "cancel" as const } } } : {}),
      },
      payment_method_collection: cardOptional ? "if_required" : "always",
      locale: "ro",
      custom_text: { submit: { message } },
      success_url: `${base}/carte?checkout=success`,
      cancel_url: `${base}/preturi?checkout=cancelled`,
      allow_promotion_codes: true,
      integration_identifier: `starea_mea_${suffix}`,
    } as Stripe.Checkout.SessionCreateParams & { integration_identifier: string });
    return Response.json({ url: session.url });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Cerere invalidă." }, { status: 400 });
  }
}
