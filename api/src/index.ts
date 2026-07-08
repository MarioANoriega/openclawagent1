import { Hono } from "hono";
import { cors } from "hono/cors";
import { authRoutes } from "./routes/auth";
import { petsRoutes } from "./routes/pets";
import { chatRoutes } from "./routes/chat";
import { billingRoutes } from "./routes/billing";
import { vetsRoutes } from "./routes/vets";
import { webhookRoutes } from "./routes/webhooks";
import type { AuthVariables, Env } from "./types";

const app = new Hono<{ Bindings: Env; Variables: AuthVariables }>();

app.use("*", cors());

app.get("/", (c) => c.json({ name: "Pet Plus API", status: "ok" }));

app.route("/api/auth", authRoutes);
app.route("/api/pets", petsRoutes);
app.route("/api/chat", chatRoutes);
app.route("/api/billing", billingRoutes);
app.route("/api/vets", vetsRoutes);
app.route("/api/webhooks", webhookRoutes);

export default app;
