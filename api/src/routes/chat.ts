import { Hono } from "hono";
import { askPetAssistant } from "../lib/anthropic";
import type { AuthVariables, ChatMessage, Env, Pet, User } from "../types";
import { requireAuth } from "../middleware/auth";

export const chatRoutes = new Hono<{ Bindings: Env; Variables: AuthVariables }>();

chatRoutes.use("*", requireAuth);

const HISTORY_LIMIT = 20;

function hasActiveSubscription(user: User): boolean {
  return user.subscription_status === "active" || user.subscription_status === "trialing";
}

function toMessageResponse(message: ChatMessage) {
  return {
    id: message.id,
    role: message.role,
    content: message.content,
    vetReferral: message.vet_referral === 1,
    createdAt: message.created_at,
  };
}

chatRoutes.get("/:petId/history", async (c) => {
  const pet = await c.env.DB.prepare("SELECT * FROM pets WHERE id = ? AND user_id = ?")
    .bind(c.req.param("petId"), c.get("userId"))
    .first<Pet>();
  if (!pet) return c.json({ error: "Pet not found" }, 404);

  const { results } = await c.env.DB.prepare(
    "SELECT * FROM chat_messages WHERE pet_id = ? ORDER BY created_at ASC",
  )
    .bind(pet.id)
    .all<ChatMessage>();

  return c.json({ messages: results.map(toMessageResponse) });
});

chatRoutes.post("/:petId/messages", async (c) => {
  const user = await c.env.DB.prepare("SELECT * FROM users WHERE id = ?")
    .bind(c.get("userId"))
    .first<User>();
  if (!user) return c.json({ error: "User not found" }, 404);

  if (!hasActiveSubscription(user)) {
    return c.json(
      { error: "An active Pet Plus subscription is required to chat with the assistant" },
      402,
    );
  }

  const pet = await c.env.DB.prepare("SELECT * FROM pets WHERE id = ? AND user_id = ?")
    .bind(c.req.param("petId"), user.id)
    .first<Pet>();
  if (!pet) return c.json({ error: "Pet not found" }, 404);

  const body = await c.req.json<{ message?: string }>().catch(() => null);
  const question = body?.message?.trim();
  if (!question) {
    return c.json({ error: "A message is required" }, 400);
  }

  const { results: historyRows } = await c.env.DB.prepare(
    "SELECT * FROM chat_messages WHERE pet_id = ? ORDER BY created_at DESC LIMIT ?",
  )
    .bind(pet.id, HISTORY_LIMIT)
    .all<ChatMessage>();
  const history = historyRows.reverse();

  const now = Date.now();
  const userMessageId = crypto.randomUUID();
  await c.env.DB.prepare(
    `INSERT INTO chat_messages (id, user_id, pet_id, role, content, created_at)
     VALUES (?, ?, ?, 'user', ?, ?)`,
  )
    .bind(userMessageId, user.id, pet.id, question, now)
    .run();

  let answer: { text: string; vetReferral: boolean };
  try {
    answer = await askPetAssistant(c.env.ANTHROPIC_API_KEY, pet, history, question);
  } catch (err) {
    return c.json({ error: "The assistant is temporarily unavailable, please try again" }, 502);
  }

  const assistantMessageId = crypto.randomUUID();
  const assistantCreatedAt = Date.now();
  await c.env.DB.prepare(
    `INSERT INTO chat_messages (id, user_id, pet_id, role, content, vet_referral, created_at)
     VALUES (?, ?, ?, 'assistant', ?, ?, ?)`,
  )
    .bind(assistantMessageId, user.id, pet.id, answer.text, answer.vetReferral ? 1 : 0, assistantCreatedAt)
    .run();

  return c.json({
    userMessage: {
      id: userMessageId,
      role: "user",
      content: question,
      vetReferral: false,
      createdAt: now,
    },
    assistantMessage: {
      id: assistantMessageId,
      role: "assistant",
      content: answer.text,
      vetReferral: answer.vetReferral,
      createdAt: assistantCreatedAt,
    },
  });
});
