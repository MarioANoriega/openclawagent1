export interface Env {
  DB: D1Database;

  JWT_SECRET: string;
  ANTHROPIC_API_KEY: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  STRIPE_PRICE_MONTHLY: string;
  STRIPE_PRICE_YEARLY: string;
  APP_URL_SCHEME: string;
}

export interface AuthVariables {
  userId: string;
}

export interface User {
  id: string;
  email: string;
  password_hash: string;
  password_salt: string;
  stripe_customer_id: string | null;
  subscription_status: "inactive" | "active" | "trialing" | "past_due" | "canceled";
  subscription_plan: "monthly" | "yearly" | null;
  subscription_current_period_end: number | null;
  created_at: number;
}

export interface Pet {
  id: string;
  user_id: string;
  name: string;
  species: string;
  breed: string | null;
  age_years: number | null;
  weight_kg: number | null;
  notes: string | null;
  created_at: number;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  pet_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: number;
}
