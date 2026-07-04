import Stripe from "stripe";
import type { Env } from "../types";

export function getStripeClient(env: Env): Stripe {
  return new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-08-27.basil",
    httpClient: Stripe.createFetchHttpClient(),
  });
}

export function priceIdForPlan(env: Env, plan: "monthly" | "yearly"): string {
  return plan === "yearly" ? env.STRIPE_PRICE_YEARLY : env.STRIPE_PRICE_MONTHLY;
}
