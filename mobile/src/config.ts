import Constants from "expo-constants";

const extra = Constants.expoConfig?.extra as { apiBaseUrl?: string } | undefined;

const configuredUrl =
  extra?.apiBaseUrl && !extra.apiBaseUrl.includes("your-worker-subdomain")
    ? extra.apiBaseUrl
    : undefined;

// EXPO_PUBLIC_API_URL wins (handy for local dev), then app.json's
// extra.apiBaseUrl once it's set to a real worker URL, then local wrangler.
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? configuredUrl ?? "http://localhost:8787";
