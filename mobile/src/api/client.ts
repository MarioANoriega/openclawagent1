import { API_BASE_URL } from "../config";
import type { AuthedUser, ChatMessage, Pet } from "../types";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  path: string,
  options: { method?: string; token?: string | null; body?: unknown } = {},
): Promise<T> {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const data = (await response.json().catch(() => ({}))) as Record<string, unknown> & T;

  if (!response.ok) {
    const message =
      typeof data.error === "string" ? data.error : `Request failed with status ${response.status}`;
    throw new ApiError(response.status, message);
  }

  return data;
}

export const api = {
  signup: (email: string, password: string) =>
    request<{ token: string; user: AuthedUser }>("/api/auth/signup", {
      method: "POST",
      body: { email, password },
    }),

  login: (email: string, password: string) =>
    request<{ token: string; user: AuthedUser }>("/api/auth/login", {
      method: "POST",
      body: { email, password },
    }),

  me: (token: string) => request<AuthedUser>("/api/auth/me", { token }),

  listPets: (token: string) => request<{ pets: Pet[] }>("/api/pets", { token }),

  createPet: (token: string, input: Record<string, unknown>) =>
    request<{ pet: Pet }>("/api/pets", { method: "POST", token, body: input }),

  deletePet: (token: string, petId: string) =>
    request<{ ok: true }>(`/api/pets/${petId}`, { method: "DELETE", token }),

  chatHistory: (token: string, petId: string) =>
    request<{ messages: ChatMessage[] }>(`/api/chat/${petId}/history`, { token }),

  sendMessage: (token: string, petId: string, message: string) =>
    request<{ userMessage: ChatMessage; assistantMessage: ChatMessage }>(
      `/api/chat/${petId}/messages`,
      { method: "POST", token, body: { message } },
    ),

  createCheckout: (token: string, plan: "monthly" | "yearly") =>
    request<{ checkoutUrl: string }>("/api/billing/checkout", {
      method: "POST",
      token,
      body: { plan },
    }),

  createBillingPortal: (token: string) =>
    request<{ portalUrl: string }>("/api/billing/portal", { method: "POST", token }),
};
