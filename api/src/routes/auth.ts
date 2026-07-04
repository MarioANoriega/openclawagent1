import { Hono } from "hono";
import { hashPassword, verifyPassword } from "../lib/password";
import { signAuthToken } from "../lib/jwt";
import type { AuthVariables, Env, User } from "../types";
import { requireAuth } from "../middleware/auth";

export const authRoutes = new Hono<{ Bindings: Env; Variables: AuthVariables }>();

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

authRoutes.post("/signup", async (c) => {
  const body = await c.req.json<{ email?: string; password?: string }>().catch(() => null);
  const email = body?.email?.trim().toLowerCase();
  const password = body?.password;

  if (!email || !isValidEmail(email)) {
    return c.json({ error: "A valid email is required" }, 400);
  }
  if (!password || password.length < 8) {
    return c.json({ error: "Password must be at least 8 characters" }, 400);
  }

  const existing = await c.env.DB.prepare("SELECT id FROM users WHERE email = ?")
    .bind(email)
    .first();
  if (existing) {
    return c.json({ error: "An account with this email already exists" }, 409);
  }

  const { hash, salt } = await hashPassword(password);
  const id = crypto.randomUUID();
  const now = Date.now();

  await c.env.DB.prepare(
    `INSERT INTO users (id, email, password_hash, password_salt, subscription_status, created_at)
     VALUES (?, ?, ?, ?, 'inactive', ?)`,
  )
    .bind(id, email, hash, salt, now)
    .run();

  const token = await signAuthToken(id, c.env.JWT_SECRET);
  return c.json({ token, user: { id, email, subscriptionStatus: "inactive" } }, 201);
});

authRoutes.post("/login", async (c) => {
  const body = await c.req.json<{ email?: string; password?: string }>().catch(() => null);
  const email = body?.email?.trim().toLowerCase();
  const password = body?.password;

  if (!email || !password) {
    return c.json({ error: "Email and password are required" }, 400);
  }

  const user = await c.env.DB.prepare("SELECT * FROM users WHERE email = ?")
    .bind(email)
    .first<User>();

  if (!user || !(await verifyPassword(password, user.password_hash, user.password_salt))) {
    return c.json({ error: "Invalid email or password" }, 401);
  }

  const token = await signAuthToken(user.id, c.env.JWT_SECRET);
  return c.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      subscriptionStatus: user.subscription_status,
      subscriptionPlan: user.subscription_plan,
    },
  });
});

authRoutes.get("/me", requireAuth, async (c) => {
  const user = await c.env.DB.prepare("SELECT * FROM users WHERE id = ?")
    .bind(c.get("userId"))
    .first<User>();

  if (!user) {
    return c.json({ error: "User not found" }, 404);
  }

  return c.json({
    id: user.id,
    email: user.email,
    subscriptionStatus: user.subscription_status,
    subscriptionPlan: user.subscription_plan,
    subscriptionCurrentPeriodEnd: user.subscription_current_period_end,
  });
});
