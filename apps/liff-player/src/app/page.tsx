"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PlayerShell } from "@/components/PlayerShell";
import { getPlayerId, DEMO_PLAYER_ID } from "@/lib/player";
import { listSlots, holdSlot, type Slot } from "@/lib/marketplace-api";

function fmtTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtCountdown(ms: number): string {
  if (ms <= 0) return "0:00";
  const seconds = Math.floor(ms / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

function statusStyle(status: string): string {
  const normalized = status.toUpperCase();
  if (normalized === "OPEN") return "bg-[#e7f5c3] text-[#3d5a1b]";
  if (normalized === "HELD" || normalized === "ESCROW_HELD") {
    return "bg-[#fff1cf] text-[#8a5a12]";
  }
  if (normalized === "BOOKED") return "bg-[#e2efff] text-[#2f5d91]";
  return "bg-[#eef1ed] text-[#657269]";
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function DiscoveryPage() {
  const router = useRouter();
  const [playerId, setPlayerId] = useState(DEMO_PLAYER_ID);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState("");
  const [surface, setSurface] = useState("ALL");
  const [q, setQ] = useState("");
  const [holdingId, setHoldingId] = useState<string | null>(null);
  const [heldId, setHeldId] = useState<string | null>(null);
  const [holdExpiresAt, setHoldExpiresAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPlayerId().then(setPlayerId);
  }, []);

  const fetchSlots = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setSlots(await listSlots(date || undefined, surface || undefined, q || undefined));
    } catch (err) {
      setError(err instanceof Error ? err.message : "We could not load sessions.");
    } finally {
      setLoading(false);
    }
  }, [date, q, surface]);

  useEffect(() => {
    let cancelled = false;
    void listSlots(date || undefined, surface || undefined, q || undefined)
      .then((data) => {
        if (cancelled) return;
        setSlots(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "We could not load sessions.");
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [date, q, surface]);

  useEffect(() => {
    if (!holdExpiresAt) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [holdExpiresAt]);

  const holdRemaining = useMemo(
    () => (holdExpiresAt ? holdExpiresAt - now : 0),
    [holdExpiresAt, now],
  );

  const activeHeldId = holdRemaining > 0 ? heldId : null;

  async function onHold(slot: Slot) {
    setHoldingId(slot.id);
    setError(null);
    try {
      const result = await holdSlot(slot.id, playerId);
      setHeldId(slot.id);
      setHoldExpiresAt(new Date(result.hold_expires_at).getTime());
    } catch (err) {
      setError(err instanceof Error ? err.message : "We could not hold that slot.");
    } finally {
      setHoldingId(null);
    }
  }

  return (
    <PlayerShell>
      <section className="overflow-hidden rounded-[2rem] bg-[#173d2c] px-6 py-7 text-white shadow-[0_18px_50px_rgba(23,61,44,0.16)] sm:px-10 sm:py-10">
        <div className="max-w-2xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#d8f36a]">
            Your next session
          </p>
          <h1 className="max-w-xl text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">
            Find the right court. Build your best game.
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-6 text-[#c7d8c9] sm:text-base">
            Curated coaching sessions, honest court details, and progress that stays with you.
          </p>
          <div className="mt-7 flex flex-wrap gap-2 text-xs font-medium text-[#d8f36a]">
            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-2">Verified coaches</span>
            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-2">Court included</span>
            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-2">Rain-out protected</span>
          </div>
        </div>
      </section>

      <section className="mt-7 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="text-sm font-semibold text-[#718076]">Good to see you, player</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">
            Open sessions in Bangkok
          </h2>
        </div>
        <div className="rounded-2xl border border-[#dfe8df] bg-white px-4 py-3 text-sm shadow-sm">
          <span className="font-semibold text-[#173d2c]">{slots.length}</span>{" "}
          <span className="text-[#718076]">sessions found</span>
        </div>
      </section>

      <section className="mt-5 rounded-3xl border border-[#dfe8df] bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row">
          <label className="flex flex-1 items-center gap-3 rounded-2xl bg-[#f5f8f4] px-4 py-3">
            <span className="text-lg text-[#718076]" aria-hidden="true">⌕</span>
            <span className="sr-only">Search sessions</span>
            <input
              type="search"
              value={q}
              onChange={(event) => setQ(event.target.value)}
              placeholder="Search coach, club, or area"
              className="min-w-0 flex-1 bg-transparent text-sm text-[#173d2c] outline-none placeholder:text-[#9aa69d]"
            />
          </label>
          <label className="flex items-center gap-3 rounded-2xl bg-[#f5f8f4] px-4 py-3 lg:min-w-[190px]">
            <span className="text-sm text-[#718076]" aria-hidden="true">▣</span>
            <span className="sr-only">Filter by date</span>
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="w-full bg-transparent text-sm text-[#173d2c] outline-none"
            />
          </label>
          <label className="flex items-center gap-3 rounded-2xl bg-[#f5f8f4] px-4 py-3 lg:min-w-[170px]">
            <span className="text-sm text-[#718076]" aria-hidden="true">◇</span>
            <span className="sr-only">Filter by surface</span>
            <select
              value={surface}
              onChange={(event) => setSurface(event.target.value)}
              className="w-full bg-transparent text-sm text-[#173d2c] outline-none"
            >
              <option value="ALL">Any surface</option>
              <option value="HARD">Hard court</option>
              <option value="CLAY">Clay court</option>
              <option value="GRASS">Grass court</option>
            </select>
          </label>
        </div>
      </section>

      {activeHeldId && holdExpiresAt && holdRemaining > 0 && (
        <section className="mt-4 flex flex-col gap-4 rounded-3xl border border-[#ead8a6] bg-[#fff9e9] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div>
            <p className="text-sm font-semibold text-[#6d4a0d]">Your court is held</p>
            <p className="mt-1 text-sm text-[#97733a]">
              Complete checkout in <strong>{fmtCountdown(holdRemaining)}</strong> to keep it.
            </p>
          </div>
          <button
            className="rounded-xl bg-[#173d2c] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#24553d] focus:outline-none focus:ring-2 focus:ring-[#173d2c] focus:ring-offset-2"
            onClick={() => router.push(`/checkout/${activeHeldId}?player=${encodeURIComponent(playerId)}`)}
          >
            Continue to checkout
          </button>
        </section>
      )}

      {error && (
        <div role="alert" className="mt-4 flex items-center justify-between gap-4 rounded-2xl border border-[#f0c7c2] bg-[#fff4f2] p-4 text-sm text-[#9b3e32]">
          <span>{error}</span>
          <button onClick={fetchSlots} className="font-semibold underline underline-offset-4">Try again</button>
        </div>
      )}

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-[-0.02em]">Recommended for you</h2>
          <span className="text-xs font-medium text-[#718076]">Fresh availability</span>
        </div>
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-56 animate-pulse rounded-3xl bg-[#e8eee7]" />
            ))}
          </div>
        ) : slots.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#cbd8cc] bg-white px-6 py-12 text-center">
            <p className="text-lg font-semibold text-[#173d2c]">No sessions match those filters</p>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#718076]">
              Try another date or surface. New courts are added throughout the week.
            </p>
            <button
              className="mt-5 rounded-xl bg-[#eef4ed] px-4 py-2 text-sm font-semibold text-[#173d2c]"
              onClick={() => { setDate(""); setSurface("ALL"); setQ(""); }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {slots.map((slot) => {
              const isHeld = activeHeldId === slot.id;
              return (
                <article key={slot.id} className="group flex flex-col rounded-3xl border border-[#dfe8df] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(23,61,44,0.09)]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#d8f36a] text-xs font-bold text-[#173d2c]">
                        {initials(slot.coach_name)}
                      </span>
                      <div>
                        <h3 className="font-semibold text-[#173d2c]">{slot.coach_name}</h3>
                        <p className="mt-0.5 text-xs text-[#718076]">{slot.court_name}</p>
                      </div>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${statusStyle(slot.status)}`}>
                      {slot.status === "OPEN" ? "Open" : slot.status}
                    </span>
                  </div>
                  <div className="mt-5 space-y-3 text-sm">
                    <p className="font-medium text-[#31463a]">{fmtTime(slot.start_time)}</p>
                    <p className="flex items-start gap-2 text-[#718076]">
                      <span aria-hidden="true">⌖</span>
                      <span>{slot.location_text}</span>
                    </p>
                    <p className="flex items-center gap-2 text-xs font-medium text-[#718076]">
                      <span className="rounded-md bg-[#f2f5f1] px-2 py-1">{slot.surface_type} court</span>
                      <span>60 min · court included</span>
                    </p>
                  </div>
                  <div className="mt-6 flex items-end justify-between gap-3 border-t border-[#edf1ec] pt-4">
                    <div>
                      <p className="text-lg font-bold text-[#173d2c]">฿{slot.bundled_price.toLocaleString()}</p>
                      <p className="text-[11px] text-[#8a978e]">per player</p>
                    </div>
                    <button
                      disabled={slot.status !== "OPEN" || holdingId === slot.id}
                      onClick={() => (isHeld ? router.push(`/checkout/${slot.id}?player=${encodeURIComponent(playerId)}`) : onHold(slot))}
                      className="rounded-xl bg-[#173d2c] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#24553d] disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-[#173d2c] focus:ring-offset-2"
                    >
                      {holdingId === slot.id ? "Holding…" : isHeld ? "Checkout" : slot.status === "OPEN" ? "Hold slot" : "Unavailable"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </PlayerShell>
  );
}
