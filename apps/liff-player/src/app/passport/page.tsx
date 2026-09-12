"use client";

import { useEffect, useMemo, useState } from "react";
import { PlayerShell } from "@/components/PlayerShell";
import { DEMO_PLAYER_ID, getPlayerId } from "@/lib/player";
import { myPassport, type ProgressLog } from "@/lib/marketplace-api";

export default function PassportPage() {
  const [logs, setLogs] = useState<ProgressLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPlayerId()
      .then((id) => myPassport(id))
      .then(setLogs)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "We could not load your passport."))
      .finally(() => setLoading(false));
  }, []);

  const averageRating = useMemo(() => {
    if (logs.length === 0) return 0;
    return logs.reduce((total, log) => total + (log.rating ?? 0), 0) / logs.length;
  }, [logs]);

  return (
    <PlayerShell title="Player passport">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold text-[#718076]">Your progress, remembered</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-[-0.04em] text-[#173d2c]">Player passport</h1>
        <p className="mt-3 text-sm leading-6 text-[#718076]">A living record of the details that make your game better.</p>
      </div>

      {error && <div role="alert" className="mt-6 rounded-2xl border border-[#f0c7c2] bg-[#fff4f2] p-4 text-sm text-[#9b3e32]">{error}</div>}

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl bg-[#173d2c] p-5 text-white"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#d8f36a]">Sessions logged</p><p className="mt-4 text-4xl font-semibold">{logs.length}</p><p className="mt-1 text-xs text-[#c7d8c9]">Keep showing up</p></div>
        <div className="rounded-3xl border border-[#dfe8df] bg-white p-5"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8a978e]">Latest rating</p><p className="mt-4 text-4xl font-semibold text-[#173d2c]">{loading ? "—" : averageRating.toFixed(1)}</p><p className="mt-1 text-xs text-[#718076]">Coach confidence score</p></div>
        <div className="rounded-3xl border border-[#dfe8df] bg-white p-5"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8a978e]">Focus areas</p><p className="mt-4 text-4xl font-semibold text-[#173d2c]">{new Set(logs.flatMap((log) => log.focus_areas)).size}</p><p className="mt-1 text-xs text-[#718076]">Skills in motion</p></div>
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold text-[#173d2c]">Coach notes</h2><span className="text-xs font-medium text-[#718076]">Private to you</span></div>
        {loading ? [1, 2].map((item) => <div key={item} className="mb-4 h-36 animate-pulse rounded-3xl bg-[#e8eee7]" />) : logs.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#cbd8cc] bg-white px-6 py-12 text-center"><p className="font-semibold text-[#173d2c]">Your first note will land here</p><p className="mt-2 text-sm text-[#718076]">Complete a session to start building your tennis story.</p></div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <article key={log.id} className="rounded-3xl border border-[#dfe8df] bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8a978e]">{log.session_date ? new Date(log.session_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "Recent session"}</p><h3 className="mt-1 font-semibold text-[#173d2c]">{log.coach_name ?? "Coach notes"}</h3></div><span className="rounded-full bg-[#e7f5c3] px-3 py-1 text-xs font-bold text-[#3d5a1b]">{log.rating ?? "—"}/5</span></div>
                <div className="mt-4 flex flex-wrap gap-2">{log.focus_areas.map((area) => <span key={area} className="rounded-lg bg-[#f2f5f1] px-2.5 py-1 text-xs font-medium text-[#526258]">{area}</span>)}</div>
                {log.notes && <p className="mt-4 border-l-2 border-[#d8f36a] pl-4 text-sm leading-6 text-[#526258]">{log.notes}</p>}
              </article>
            ))}
          </div>
        )}
      </section>
    </PlayerShell>
  );
}
