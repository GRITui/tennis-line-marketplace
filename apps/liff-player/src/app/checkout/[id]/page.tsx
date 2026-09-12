"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { PlayerShell } from "@/components/PlayerShell";
import { checkout, listSlots, MOCK_SLOTS, type Booking, type Slot } from "@/lib/marketplace-api";
import { DEMO_PLAYER_ID, getPlayerId } from "@/lib/player";

export default function CheckoutPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const slotId = params.id;
  const [playerId, setPlayerId] = useState(searchParams.get("player") ?? DEMO_PLAYER_ID);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [receipt, setReceipt] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPlayerId().then(setPlayerId);
    listSlots().then((slots) => {
      setSlot(slots.find((item) => item.id === slotId) ?? MOCK_SLOTS.find((item) => item.id === slotId) ?? null);
    }).catch((err: unknown) => setError(err instanceof Error ? err.message : "We could not load this session."))
      .finally(() => setLoading(false));
  }, [slotId]);

  async function confirmBooking() {
    setSubmitting(true);
    setError(null);
    try {
      setReceipt(await checkout(slotId, playerId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PlayerShell title="Checkout">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="text-sm font-semibold text-[#718076] hover:text-[#173d2c]">← Back to discovery</Link>
        <p className="mt-8 text-sm font-semibold text-[#718076]">Secure checkout</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-[-0.04em] text-[#173d2c]">Confirm your court time</h1>
        {error && <div role="alert" className="mt-6 rounded-2xl border border-[#f0c7c2] bg-[#fff4f2] p-4 text-sm text-[#9b3e32]">{error}</div>}
        {loading ? <div className="mt-8 h-72 animate-pulse rounded-3xl bg-[#e8eee7]" /> : receipt ? (
          <section className="mt-8 rounded-3xl bg-[#173d2c] p-7 text-white shadow-[0_18px_50px_rgba(23,61,44,0.16)]">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#d8f36a] text-2xl text-[#173d2c]">✓</span>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-[#d8f36a]">You&apos;re in</p>
            <h2 className="mt-2 text-2xl font-semibold">Your session is booked.</h2>
            <p className="mt-3 text-sm leading-6 text-[#c7d8c9]">We&apos;ll keep the court and coach details in your Sessions tab.</p>
            <div className="mt-6 rounded-2xl bg-white/10 p-4 text-sm"><p className="font-semibold">{receipt.coach_name ?? slot?.coach_name}</p><p className="mt-1 text-[#c7d8c9]">{slot?.location_text} · {slot?.start_time && new Date(slot.start_time).toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p></div>
            <Link href="/sessions" className="mt-6 inline-flex rounded-xl bg-[#d8f36a] px-5 py-3 text-sm font-bold text-[#173d2c]">View my sessions</Link>
          </section>
        ) : slot ? (
          <section className="mt-8 rounded-3xl border border-[#dfe8df] bg-white p-5 shadow-sm sm:p-7">
            <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8a978e]">Session</p><h2 className="mt-2 text-2xl font-semibold text-[#173d2c]">{slot.coach_name}</h2><p className="mt-1 text-sm text-[#718076]">{slot.court_name} · {slot.location_text}</p></div><span className="rounded-full bg-[#e7f5c3] px-3 py-1 text-xs font-bold text-[#3d5a1b]">Held for you</span></div>
            <div className="mt-7 space-y-3 rounded-2xl bg-[#f5f8f4] p-4 text-sm"><div className="flex justify-between gap-4"><span className="text-[#718076]">When</span><span className="text-right font-semibold text-[#31463a]">{new Date(slot.start_time).toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span></div><div className="flex justify-between gap-4"><span className="text-[#718076]">Court</span><span className="font-semibold text-[#31463a]">{slot.surface_type} · 60 minutes</span></div><div className="flex justify-between gap-4 border-t border-[#dfe8df] pt-3"><span className="font-semibold text-[#31463a]">Total</span><span className="text-lg font-bold text-[#173d2c]">฿{slot.bundled_price.toLocaleString()}</span></div></div>
            <button onClick={confirmBooking} disabled={submitting} className="mt-6 w-full rounded-xl bg-[#173d2c] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#24553d] disabled:cursor-wait disabled:opacity-60">{submitting ? "Confirming booking…" : "Confirm and book"}</button>
            <p className="mt-3 text-center text-xs text-[#8a978e]">You can request a rain-out reschedule from Sessions.</p>
          </section>
        ) : <div className="mt-8 rounded-3xl border border-dashed border-[#cbd8cc] bg-white px-6 py-12 text-center"><p className="font-semibold text-[#173d2c]">This session is no longer available</p><Link href="/" className="mt-5 inline-flex rounded-xl bg-[#173d2c] px-5 py-3 text-sm font-semibold text-white">Find another session</Link></div>}
      </div>
    </PlayerShell>
  );
}
