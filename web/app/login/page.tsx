"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthNav, ProviderButtons, LegalLine, emailSignIn } from "@/components/AuthShared";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!email.trim() || busy) return;
    setBusy(true);
    setError(null);
    const err = await emailSignIn(email);
    if (err) {
      setError(err);
      setBusy(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <main>
      <AuthNav />
      <div className="auth-wrap">
        <div className="auth-card">
          <h1>Welcome back</h1>
          <p className="auth-sub">Log in to run scans and read every signal.</p>

          <ProviderButtons verb="Log in" />

          <div className="auth-divider">OR</div>

          <form onSubmit={submit}>
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
            <button
              type="submit"
              className="btn btn-dark"
              style={{ width: "100%", opacity: busy ? 0.6 : 1 }}
              disabled={busy}
            >
              {busy ? "Logging in…" : "Log in with email"}
            </button>
            {error && (
              <p style={{ fontSize: 13, color: "var(--orange)", marginTop: 10 }}>{error}</p>
            )}
          </form>

          <p className="auth-switch">
            Don&apos;t have an account already?{" "}
            <Link href="/signup">Create an account</Link>
          </p>

          <LegalLine />
        </div>
      </div>
    </main>
  );
}
