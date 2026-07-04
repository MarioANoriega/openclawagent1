import { Hono } from "hono";
import { getStripeClient, priceIdForPlan } from "../lib/stripe";
import type { AuthVariables, Env, User } from "../types";
import { requireAuth } from "../middleware/auth";

export const billingRoutes = new Hono<{ Bindings: Env; Variables: AuthVariables }>();

billingRoutes.use("*", requireAuth);

billingRoutes.post("/checkout", async (c) => {
  const body = await c.req.json<{ plan?: "monthly" | "yearly" }>().catch(() => null);
  const plan = body?.plan === "yearly" ? "yearly" : "monthly";

  const user = await c.env.DB.prepare("SELECT * FROM users WHERE id = ?")
    .bind(c.get("userId"))
    .first<User>();
  if (!user) return c.json({ error: "User not found" }, 404);

  const stripe = getStripeClient(c.env);

  let customerId = user.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { userId: user.id },
    });
    customerId = customer.id;
    await c.env.DB.prepare("UPDATE users SET stripe_customer_id = ? WHERE id = ?")
      .bind(customerId, user.id)
      .run();
  }

  const scheme = c.env.APP_URL_SCHEME;
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    client_reference_id: user.id,
    line_items: [{ price: priceIdForPlan(c.env, plan), quantity: 1 }],
    success_url: `${scheme}://subscribe/success`,
    cancel_url: `${scheme}://subscribe/cancel`,
    metadata: { userId: user.id, plan },
    subscription_data: { metadata: { userId: user.id, plan } },
  });

  return c.json({ checkoutUrl: session.url });
});

billingRoutes.post("/portal", async (c) => {
  const user = await c.env.DB.prepare("SELECT * FROM users WHERE id = ?")
    .bind(c.get("userId"))
    .first<User>();
  if (!user?.stripe_customer_id) {
    return c.json({ error: "No billing account found for this user yet" }, 404);
  }

  const stripe = getStripeClient(c.env);
  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripe_customer_id,
    return_url: `${c.env.APP_URL_SCHEME}://account`,
  });

  return c.json({ portalUrl: session.url });
});
