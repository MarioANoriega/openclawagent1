import type { Context, Next } from "hono";
import { verifyAuthToken } from "../lib/jwt";
import type { AuthVariables, Env } from "../types";

export async function requireAuth(
  c: Context<{ Bindings: Env; Variables: AuthVariables }>,
  next: Next,
) {
  const header = c.req.header("Authorization");
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : null;
  if (!token) {
    return c.json({ error: "Missing bearer token" }, 401);
  }

  const userId = await verifyAuthToken(token, c.env.JWT_SECRET);
  if (!userId) {
    return c.json({ error: "Invalid or expired token" }, 401);
  }

  c.set("userId", userId);
  await next();
}
