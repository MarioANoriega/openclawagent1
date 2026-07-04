import { Hono } from "hono";
import type { AuthVariables, Env, Pet } from "../types";
import { requireAuth } from "../middleware/auth";

export const petsRoutes = new Hono<{ Bindings: Env; Variables: AuthVariables }>();

petsRoutes.use("*", requireAuth);

interface PetInput {
  name?: string;
  species?: string;
  breed?: string;
  ageYears?: number;
  weightKg?: number;
  notes?: string;
}

function toPetResponse(pet: Pet) {
  return {
    id: pet.id,
    name: pet.name,
    species: pet.species,
    breed: pet.breed,
    ageYears: pet.age_years,
    weightKg: pet.weight_kg,
    notes: pet.notes,
    createdAt: pet.created_at,
  };
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

  const id = crypto.randomUUID();
  const now = Date.now();

  await c.env.DB.prepare(
    `INSERT INTO pets (id, user_id, name, species, breed, age_years, weight_kg, notes, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      id,
      c.get("userId"),
      body.name.trim(),
      body.species.trim(),
      body.breed?.trim() ?? null,
      body.ageYears ?? null,
      body.weightKg ?? null,
      body.notes?.trim() ?? null,
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

  await c.env.DB.prepare(
    `UPDATE pets SET name = ?, species = ?, breed = ?, age_years = ?, weight_kg = ?, notes = ?
     WHERE id = ? AND user_id = ?`,
  )
    .bind(
      body?.name?.trim() || existing.name,
      body?.species?.trim() || existing.species,
      body?.breed?.trim() ?? existing.breed,
      body?.ageYears ?? existing.age_years,
      body?.weightKg ?? existing.weight_kg,
      body?.notes?.trim() ?? existing.notes,
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
