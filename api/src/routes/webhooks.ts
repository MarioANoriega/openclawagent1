import { Hono } from "hono";
import type Stripe from "stripe";
import { getStripeClient } from "../lib/stripe";
import type { Env } from "../types";

export const webhookRoutes = new Hono<{ Bindings: Env }>();

function planFromPriceId(env: Env, priceId: string | undefined): "monthly" | "yearly" | null {
  if (priceId === env.STRIPE_PRICE_YEARLY) return "yearly";
  if (priceId === env.STRIPE_PRICE_MONTHLY) return "monthly";
  return null;
}

async function syncSubscription(env: Env, subscription: Stripe.Subscription) {
  const customerId =
    typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
  const status = subscription.status;
  const priceId = subscription.items.data[0]?.price.id;
  const plan = planFromPriceId(env, priceId);
  const periodEnd = subscription.items.data[0]?.current_period_end ?? null;

  await env.DB.prepare(
    `UPDATE users
     SET subscription_status = ?, subscription_plan = ?, subscription_current_period_end = ?
     WHERE stripe_customer_id = ?`,
  )
    .bind(status, plan, periodEnd, customerId)
    .run();
}

webhookRoutes.post("/stripe", async (c) => {
  const signature = c.req.header("stripe-signature");
  if (!signature) {
    return c.json({ error: "Missing stripe-signature header" }, 400);
  }

  const payload = await c.req.text();
  const stripe = getStripeClient(c.env);

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      payload,
      signature,
      c.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    return c.json({ error: `Webhook signature verification failed: ${(err as Error).message}` }, 400);
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode === "subscription" && session.subscription) {
        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription.id;
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        await syncSubscription(c.env, subscription);
      }
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.created":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await syncSubscription(c.env, subscription);
      break;
    }
    default:
      break;
  }

  return c.json({ received: true });
});
