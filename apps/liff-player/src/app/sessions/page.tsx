"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PlayerShell } from "@/components/PlayerShell";
import { DEMO_PLAYER_ID, getPlayerId } from "@/lib/player";
import { myBookings, rainoutAction, type Booking } from "@/lib/marketplace-api";

function sessionDate(value?: string): string {
  if (!value) return "Date to be confirmed";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString("en-GB", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });
}

function statusCopy(status: string): string {
  return status === "ESCROW_HELD" ? "Payment held" : status.toLowerCase().replace("_", " ");
}

export default function SessionsPage() {
  const [playerId, setPlayerId] = useState(DEMO_PLAYER_ID);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void getPlayerId()
      .then((id) => {
        if (cancelled) return null;
        setPlayerId(id);
        return myBookings(id);
      })
      .then((data) => {
        if (cancelled || !data) return;
        setBookings(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "We could not load your sessions.");
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleRainout(bookingId: string, action: "refund" | "reschedule") {
    setActingId(bookingId);
    try {
      const result = await rainoutAction(bookingId, action);
      setBookings((current) => current.map((booking) => booking.id === bookingId ? { ...booking, status: result.status } : booking));
    } catch (err) {
      setError(err instanceof Error ? err.message : "We could not update this session.");
    } finally {
      setActingId(null);
    }
  }

  return (
    <PlayerShell title="Your sessions">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold text-[#718076]">Your court time</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-[-0.04em] text-[#173d2c]">Sessions</h1>
        <p className="mt-3 text-sm leading-6 text-[#718076]">Everything you have booked, in one calm place.</p>
      </div>

      {error && <div role="alert" className="mt-6 rounded-2xl border border-[#f0c7c2] bg-[#fff4f2] p-4 text-sm text-[#9b3e32]">{error}</div>}

      <section className="mt-8 space-y-4">
        {loading && [1, 2].map((item) => <div key={item} className="h-44 animate-pulse rounded-3xl bg-[#e8eee7]" />)}
        {!loading && bookings.length === 0 && (
          <div className="rounded-3xl border border-dashed border-[#cbd8cc] bg-white px-6 py-14 text-center">
            <p className="text-lg font-semibold text-[#173d2c]">Your next session is waiting</p>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#718076]">Browse open courts and hold a time that works for your week.</p>
            <Link href="/" className="mt-5 inline-flex rounded-xl bg-[#173d2c] px-5 py-3 text-sm font-semibold text-white">Discover sessions</Link>
          </div>
        )}
        {!loading && bookings.map((booking) => (
          <article key={booking.id} className="rounded-3xl border border-[#dfe8df] bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#e7f5c3] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#3d5a1b]">{statusCopy(booking.status)}</span>
                  <span className="text-xs font-medium text-[#8a978e]">Booking {booking.id.slice(-6)}</span>
                </div>
                <h2 className="mt-3 text-xl font-semibold text-[#173d2c]">{booking.coach_name ?? "Tennis coach"}</h2>
                <p className="mt-1 text-sm text-[#718076]">{booking.court_name ?? "Court details coming soon"} · {booking.location_text ?? "Bangkok"}</p>
              </div>
              <p className="text-xl font-bold text-[#173d2c]">฿{(booking.amount ?? booking.bundled_price ?? 0).toLocaleString()}</p>
            </div>
            <div className="mt-5 grid gap-3 rounded-2xl bg-[#f5f8f4] p-4 text-sm sm:grid-cols-2">
              <div><p className="text-xs font-semibold uppercase tracking-wide text-[#8a978e]">When</p><p className="mt-1 font-medium text-[#31463a]">{sessionDate(booking.start_time)}</p></div>
              <div><p className="text-xs font-semibold uppercase tracking-wide text-[#8a978e]">Player</p><p className="mt-1 font-medium text-[#31463a]">{playerId === DEMO_PLAYER_ID ? "Demo player" : "LINE player"}</p></div>
            </div>
            {booking.status === "BOOKED" && (
              <div className="mt-5 flex flex-wrap gap-2">
                <button disabled={actingId === booking.id} onClick={() => handleRainout(booking.id, "reschedule")} className="rounded-xl bg-[#173d2c] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{actingId === booking.id ? "Updating…" : "Reschedule"}</button>
                <button disabled={actingId === booking.id} onClick={() => handleRainout(booking.id, "refund")} className="rounded-xl border border-[#dfe8df] px-4 py-2.5 text-sm font-semibold text-[#526258] disabled:opacity-50">Request refund</button>
              </div>
            )}
          </article>
        ))}
      </section>
    </PlayerShell>
  );
}
