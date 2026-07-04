export type SubscriptionStatus = "inactive" | "active" | "trialing" | "past_due" | "canceled";
export type SubscriptionPlan = "monthly" | "yearly";

export interface AuthedUser {
  id: string;
  email: string;
  subscriptionStatus: SubscriptionStatus;
  subscriptionPlan: SubscriptionPlan | null;
  subscriptionCurrentPeriodEnd?: number | null;
}

export type PetGender = "male" | "female" | "unknown";

export interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  gender: PetGender | null;
  ageYears: number | null;
  weightKg: number | null;
  notes: string | null;
  photo: string | null;
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
}

export function hasActiveSubscription(user: AuthedUser | null): boolean {
  return user?.subscriptionStatus === "active" || user?.subscriptionStatus === "trialing";
}
