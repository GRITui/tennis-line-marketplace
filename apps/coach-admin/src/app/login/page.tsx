"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "Login failed");
      }
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f8f5] p-5">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-[2rem] border border-[#dfe8df] bg-white shadow-[0_24px_80px_rgba(23,61,44,0.12)] md:grid-cols-[0.9fr_1.1fr]">
        <section className="bg-[#173d2c] p-7 text-white sm:p-10">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#d8f36a] text-sm font-bold text-[#173d2c]">TL</div>
          <p className="mt-16 text-xs font-semibold uppercase tracking-[0.2em] text-[#d8f36a]">Coach workspace</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">Make every court hour count.</h1>
          <p className="mt-4 text-sm leading-6 text-[#c7d8c9]">Manage your sessions, understand your players, and keep your coaching practice moving forward.</p>
          <div className="mt-10 hidden gap-2 text-xs text-[#b8c8ba] sm:flex"><span className="rounded-full bg-white/10 px-3 py-2">Bookings</span><span className="rounded-full bg-white/10 px-3 py-2">Customers</span><span className="rounded-full bg-white/10 px-3 py-2">Insights</span></div>
        </section>
        <section className="p-7 sm:p-10">
          <p className="text-sm font-semibold text-[#7b887f]">Welcome back</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#173d2c]">Sign in to your dashboard</h2>
          <p className="mt-3 text-sm leading-6 text-[#718076]">Use your coach workspace password to continue.</p>
          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            {error && <p role="alert" className="rounded-xl border border-[#f0c7c2] bg-[#fff4f2] p-3 text-sm text-[#9b3e32]">{error}</p>}
            <label><span className="field-label">Workspace password</span><input required id="admin-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="field-input" /></label>
            <button type="submit" disabled={submitting || password.length === 0} className="w-full rounded-xl bg-[#173d2c] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#24553d] disabled:cursor-not-allowed disabled:opacity-50">{submitting ? "Signing in…" : "Enter workspace"}</button>
          </form>
        </section>
      </div>
    </main>
  );
}
