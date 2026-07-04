import { Hono } from "hono";
import type { AuthVariables, Env, Pet, PetGender } from "../types";
import { requireAuth } from "../middleware/auth";

export const petsRoutes = new Hono<{ Bindings: Env; Variables: AuthVariables }>();

petsRoutes.use("*", requireAuth);

// Photos are stored inline in D1 as data URIs; the app crops/compresses
// before upload, this cap is a safety net against oversized rows.
const MAX_PHOTO_LENGTH = 700_000;
const GENDERS: PetGender[] = ["male", "female", "unknown"];

interface PetInput {
  name?: string;
  species?: string;
  breed?: string;
  gender?: string;
  ageYears?: number;
  weightKg?: number;
  notes?: string;
  photo?: string | null;
}

function toPetResponse(pet: Pet) {
  return {
    id: pet.id,
    name: pet.name,
    species: pet.species,
    breed: pet.breed,
    gender: pet.gender,
    ageYears: pet.age_years,
    weightKg: pet.weight_kg,
    notes: pet.notes,
    photo: pet.photo,
    createdAt: pet.created_at,
  };
}

function validateProfileFields(body: PetInput): string | null {
  if (body.gender !== undefined && !GENDERS.includes(body.gender as PetGender)) {
    return "Gender must be one of: male, female, unknown";
  }
  if (body.ageYears !== undefined && (body.ageYears < 0 || body.ageYears > 100)) {
    return "Age must be between 0 and 100 years";
  }
  if (body.photo != null) {
    if (!body.photo.startsWith("data:image/")) {
      return "Photo must be a data:image/... URI";
    }
    if (body.photo.length > MAX_PHOTO_LENGTH) {
      return "Photo is too large - please choose a smaller image";
    }
  }
  return null;
}

petsRoutes.get("/", async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM pets WHERE user_id = ? ORDER BY created_at ASC",
  )
    .bind(c.get("userId"))
    .all<Pet>();

  return c.json({ pets: results.map(toPetResponse) });
});

petsRoutes.post("/", async (c) => {
  const body = await c.req.json<PetInput>().catch(() => null);
  if (!body?.name?.trim() || !body?.species?.trim()) {
    return c.json({ error: "Pet name and species are required" }, 400);
  }

  const validationError = validateProfileFields(body);
  if (validationError) {
    return c.json({ error: validationError }, 400);
  }

  const id = crypto.randomUUID();
  const now = Date.now();

  await c.env.DB.prepare(
    `INSERT INTO pets (id, user_id, name, species, breed, gender, age_years, weight_kg, notes, photo, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      id,
      c.get("userId"),
      body.name.trim(),
      body.species.trim(),
      body.breed?.trim() || null,
      body.gender ?? null,
      body.ageYears ?? null,
      body.weightKg ?? null,
      body.notes?.trim() || null,
      body.photo ?? null,
      now,
    )
    .run();

  const pet = await c.env.DB.prepare("SELECT * FROM pets WHERE id = ?").bind(id).first<Pet>();
  return c.json({ pet: toPetResponse(pet as Pet) }, 201);
});

petsRoutes.get("/:id", async (c) => {
  const pet = await c.env.DB.prepare("SELECT * FROM pets WHERE id = ? AND user_id = ?")
    .bind(c.req.param("id"), c.get("userId"))
    .first<Pet>();

  if (!pet) return c.json({ error: "Pet not found" }, 404);
  return c.json({ pet: toPetResponse(pet) });
});

petsRoutes.put("/:id", async (c) => {
  const body = await c.req.json<PetInput>().catch(() => null);
  const existing = await c.env.DB.prepare("SELECT * FROM pets WHERE id = ? AND user_id = ?")
    .bind(c.req.param("id"), c.get("userId"))
    .first<Pet>();

  if (!existing) return c.json({ error: "Pet not found" }, 404);

  const validationError = body ? validateProfileFields(body) : null;
  if (validationError) {
    return c.json({ error: validationError }, 400);
  }

  await c.env.DB.prepare(
    `UPDATE pets SET name = ?, species = ?, breed = ?, gender = ?, age_years = ?, weight_kg = ?, notes = ?, photo = ?
     WHERE id = ? AND user_id = ?`,
  )
    .bind(
      body?.name?.trim() || existing.name,
      body?.species?.trim() || existing.species,
      body?.breed !== undefined ? body.breed?.trim() || null : existing.breed,
      body?.gender !== undefined ? body.gender : existing.gender,
      body?.ageYears !== undefined ? body.ageYears : existing.age_years,
      body?.weightKg !== undefined ? body.weightKg : existing.weight_kg,
      body?.notes !== undefined ? body.notes?.trim() || null : existing.notes,
      body?.photo !== undefined ? body.photo : existing.photo,
      existing.id,
      c.get("userId"),
    )
    .run();

  const pet = await c.env.DB.prepare("SELECT * FROM pets WHERE id = ?")
    .bind(existing.id)
    .first<Pet>();
  return c.json({ pet: toPetResponse(pet as Pet) });
});

petsRoutes.delete("/:id", async (c) => {
  const result = await c.env.DB.prepare("DELETE FROM pets WHERE id = ? AND user_id = ?")
    .bind(c.req.param("id"), c.get("userId"))
    .run();

  if (result.meta.changes === 0) {
    return c.json({ error: "Pet not found" }, 404);
  }
  return c.json({ ok: true });
});
