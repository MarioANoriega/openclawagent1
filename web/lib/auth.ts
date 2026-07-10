import type { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
import CredentialsProvider from "next-auth/providers/credentials";

// Real OAuth activates automatically once credentials exist in the environment
// (see .env.example). Until then, the demo email provider keeps the whole flow
// working end to end: any email signs in and gets a session.

const providers: AuthOptions["providers"] = [
  CredentialsProvider({
    id: "demo-email",
    name: "Email",
    credentials: { email: { label: "Email", type: "email" } },
    async authorize(credentials) {
      const email = credentials?.email?.trim().toLowerCase();
      if (!email || !email.includes("@")) return null;
      // Demo: accept any well-formed email. A real deployment would verify a
      // magic link or password here.
      return { id: email, email, name: email.split("@")[0] };
    },
  }),
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

if (process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET) {
  providers.push(
    AppleProvider({
      clientId: process.env.APPLE_CLIENT_ID,
      clientSecret: process.env.APPLE_CLIENT_SECRET,
    })
  );
}

export const authOptions: AuthOptions = {
  providers,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  // NextAuth requires a secret in production; the fallback keeps the demo
  // runnable. Set NEXTAUTH_SECRET before any real deployment.
  secret: process.env.NEXTAUTH_SECRET ?? "neuralytics-demo-secret-change-me",
};
