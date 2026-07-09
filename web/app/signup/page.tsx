"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthNav, ProviderButtons, LegalLine } from "@/components/AuthShared";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!name.trim() || !email.trim()) return;
    // Demo: no real auth backend — land on the dashboard.
    router.push("/dashboard");
  };

  return (
    <main>
      <AuthNav />
      <div className="auth-wrap">
        <div className="auth-card">
          <h1>Create your account</h1>
          <p className="auth-sub">
            Join as a Founding Member — 50 scans a month, API key included.
          </p>

          <ProviderButtons verb="Sign up" />

          <div className="auth-divider">OR</div>

          <form onSubmit={submit}>
            <div className="auth-field">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                type="text"
                className="input"
                placeholder="Your name"
                value={name}
                onChange={(ev) => setName(ev.target.value)}
                required
              />
            </div>
            <div className="auth-field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="input"
                placeholder="you@company.com"
                value={email}
                onChange={(ev) => setEmail(ev.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-dark" style={{ width: "100%" }}>
              Create account
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link href="/login">Log in</Link>
          </p>

          <LegalLine />
        </div>
      </div>
    </main>
  );
}
