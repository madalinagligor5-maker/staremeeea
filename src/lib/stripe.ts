import Stripe from "stripe";
export function getStripe() { const key = process.env.STRIPE_SECRET_KEY; if (!key) throw new Error("STRIPE_SECRET_KEY lipsește."); return new Stripe(key, { apiVersion: "2026-08-26.dahlia", typescript: true }); }
