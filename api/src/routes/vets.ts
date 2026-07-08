import { Hono } from "hono";
import { geocodePostalCode, searchNearbyVets } from "../lib/vets";
import type { AuthVariables, Env } from "../types";
import { requireAuth } from "../middleware/auth";

// Requires a logged-in user but intentionally NOT an active subscription:
// finding a veterinarian is safety-critical and never paywalled.
export const vetsRoutes = new Hono<{ Bindings: Env; Variables: AuthVariables }>();

vetsRoutes.use("*", requireAuth);

const DEFAULT_RADIUS_M = 20_000;
const MAX_RADIUS_M = 50_000;
const RESULT_LIMIT = 25;

vetsRoutes.get("/search", async (c) => {
  const { lat, lon, zip, country, radius } = c.req.query();

  const radiusM = Math.min(
    Math.max(Number(radius) || DEFAULT_RADIUS_M, 1_000),
    MAX_RADIUS_M,
  );

  let origin: { lat: number; lon: number; label: string };

  if (lat !== undefined && lon !== undefined) {
    const latNum = Number(lat);
    const lonNum = Number(lon);
    if (!Number.isFinite(latNum) || !Number.isFinite(lonNum)) {
      return c.json({ error: "lat and lon must be numbers" }, 400);
    }
    origin = { lat: latNum, lon: lonNum, label: "your location" };
  } else if (zip?.trim()) {
    let geocoded;
    try {
      geocoded = await geocodePostalCode(zip.trim(), country?.trim() || "us");
    } catch {
      return c.json({ error: "The location service is temporarily unavailable" }, 502);
    }
    if (!geocoded) {
      return c.json({ error: "Could not find that ZIP/postal code - check the code and country" }, 404);
    }
    origin = geocoded;
  } else {
    return c.json({ error: "Provide lat & lon, or a zip (with optional country)" }, 400);
  }

  try {
    const vets = await searchNearbyVets(origin.lat, origin.lon, radiusM, RESULT_LIMIT);
    return c.json({ origin, radiusKm: radiusM / 1000, vets });
  } catch {
    return c.json({ error: "The vet search service is temporarily unavailable" }, 502);
  }
});
