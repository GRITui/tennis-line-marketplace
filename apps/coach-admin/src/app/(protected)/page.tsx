"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  createSession,
  deleteSession,
  fetchAvailability,
  fetchCustomers,
  type Customer,
  type Session,
} from "@/lib/api";

const DEMO_SESSIONS: Session[] = [
  { id: "demo-session-1", title: "Beginner foundations", date: "2026-09-13", startTime: "09:00", endTime: "10:00", capacity: 4, bookedCount: 3, status: "open" },
  { id: "demo-session-2", title: "Match play · intermediate", date: "2026-09-13", startTime: "17:30", endTime: "19:00", capacity: 6, bookedCount: 5, status: "open" },
  { id: "demo-session-3", title: "Serve mechanics", date: "2026-09-14", startTime: "11:00", endTime: "12:00", capacity: 2, bookedCount: 2, status: "full" },
];

const DEMO_CUSTOMERS: Customer[] = [
  { id: "demo-customer-1", lineUserID: "U••••81", name: "Mina Park", bookingCount: 8 },
  { id: "demo-customer-2", lineUserID: "U••••42", name: "Arun S.", bookingCount: 5 },
  { id: "demo-customer-3", lineUserID: "U••••17", name: "Nicha W.", bookingCount: 3 },
];

const initialForm = {
  title: "",
  date: "",
  startTime: "09:00",
  endTime: "10:00",
  capacity: 4,
  status: "open" as "open" | "full",
};

function formatDate(date: string): string {
  const parsed = new Date(`${date}T12:00:00`);
  return Number.isNaN(parsed.getTime())
    ? date
    : parsed.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

function utilization(booked: number, capacity: number): number {
  return capacity > 0 ? Math.round((booked / capacity) * 100) : 0;
}

export default function AdminPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [demoSessions, setDemoSessions] = useState(false);
  const [demoCustomers, setDemoCustomers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{ id: string; bookingCount: number } | null>(null);

  useEffect(() => {
    let mounted = true;
    Promise.allSettled([fetchAvailability(), fetchCustomers()]).then(([sessionResult, customerResult]) => {
      if (!mounted) return;
      const sessionFailed = sessionResult.status === "rejected";
      const customerFailed = customerResult.status === "rejected";
      setSessions(sessionFailed ? DEMO_SESSIONS : sessionResult.value);
      setCustomers(customerFailed ? DEMO_CUSTOMERS : customerResult.value);
      setDemoSessions(sessionFailed);
      setDemoCustomers(customerFailed);
      if (sessionFailed || customerFailed) setError("Some live data is unavailable. Check the affected source before making changes.");
      setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  const bookedSeats = useMemo(() => sessions.reduce((total, session) => total + session.bookedCount, 0), [sessions]);
  const totalCapacity = useMemo(() => sessions.reduce((total, session) => total + session.capacity, 0), [sessions]);
  const averageUtilization = utilization(bookedSeats, totalCapacity);
  const openSessions = sessions.filter((session) => session.status === "open").length;

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.title.trim() || !form.date) return;
    setSaving(true);
    setError(null);
    try {
      if (demoSessions) {
        setSessions((current) => [...current, { ...form, id: `demo-session-${Date.now()}`, bookedCount: 0 }]);
      } else {
        const created = await createSession(form);
        setSessions((current) => [...current, created]);
      }
      setForm(initialForm);
      setShowCreate(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the session.");
    } finally {
      setSaving(false);
    }
  }

  async function proceedDelete(id: string) {
    setShowDeleteConfirm(null);
    try {
      if (!demoSessions) await deleteSession(id);
      setSessions((current) => current.filter((session) => session.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete the session.");
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-7 sm:px-8 sm:py-10">
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-medium text-[#7b887f]">Sunday, 12 September 2026</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#17211c] sm:text-4xl">Good morning, Coach</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[#66746b]">Your court calendar is healthy. Here&apos;s where to focus your energy today.</p>
        </div>
        <button onClick={() => setShowCreate((visible) => !visible)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#173d2c] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#24553d] focus:outline-none focus:ring-2 focus:ring-[#173d2c] focus:ring-offset-2">
          <span className="text-lg leading-none">+</span> Add session
        </button>
      </div>

      {(demoSessions || demoCustomers) && <div className="mt-6 flex items-center gap-3 rounded-2xl border border-[#ead8a6] bg-[#fff9e9] px-4 py-3 text-sm text-[#76551c]"><span className="rounded-full bg-[#f7d98b] px-2 py-1 text-[10px] font-bold uppercase tracking-wide">Demo mode</span><span>{demoSessions ? "Session changes are local until the session API is connected." : "Some customer data is shown in demo mode."}</span></div>}
      {error && <div role="alert" className="mt-4 rounded-2xl border border-[#f0c7c2] bg-[#fff4f2] px-4 py-3 text-sm text-[#9b3e32]">{error}</div>}

      {showCreate && (
        <form onSubmit={handleCreate} className="mt-6 rounded-3xl border border-[#dfe8df] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-4"><div><h2 className="font-semibold text-[#173d2c]">Create a new session</h2><p className="mt-1 text-xs text-[#7b887f]">Make your next opening easy to book.</p></div><button type="button" onClick={() => setShowCreate(false)} className="text-sm text-[#7b887f]">Close</button></div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <label className="sm:col-span-2 lg:col-span-2"><span className="field-label">Session name</span><input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="field-input" placeholder="e.g. Serve mechanics" /></label>
            <label><span className="field-label">Date</span><input required type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} className="field-input" /></label>
            <label><span className="field-label">Start</span><input required type="time" value={form.startTime} onChange={(event) => setForm({ ...form, startTime: event.target.value })} className="field-input" /></label>
            <label><span className="field-label">End</span><input required type="time" value={form.endTime} onChange={(event) => setForm({ ...form, endTime: event.target.value })} className="field-input" /></label>
          </div>
          <div className="mt-4 flex flex-wrap items-end gap-4"><label><span className="field-label">Players</span><input required min={1} type="number" value={form.capacity} onChange={(event) => setForm({ ...form, capacity: Number(event.target.value) })} className="field-input w-28" /></label><button disabled={saving} className="rounded-xl bg-[#d8f36a] px-5 py-2.5 text-sm font-bold text-[#173d2c] disabled:opacity-60">{saving ? "Saving…" : "Save session"}</button></div>
        </form>
      )}

      {loading ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[1, 2, 3, 4].map((item) => <div key={item} className="h-32 animate-pulse rounded-3xl bg-[#e8eee7]" />)}</div>
      ) : (
        <>
          <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="metric-card"><p className="metric-label">Bookings</p><p className="metric-value">{bookedSeats}</p><p className="metric-note">across {sessions.length} sessions</p></div>
            <div className="metric-card"><p className="metric-label">Active customers</p><p className="metric-value">{customers.length}</p><p className="metric-note">returning players in your book</p></div>
            <div className="metric-card"><p className="metric-label">Utilization</p><p className="metric-value">{averageUtilization}%</p><p className="metric-note">booked court capacity</p></div>
            <div className="metric-card metric-card-dark"><p className="metric-label text-[#b8c8ba]">Open sessions</p><p className="metric-value text-white">{openSessions}</p><p className="metric-note text-[#b8c8ba]">ready for new players</p></div>
          </section>

          <section className="mt-8 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
            <div className="rounded-3xl border border-[#dfe8df] bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8a978e]">Your calendar</p><h2 className="mt-2 text-xl font-semibold text-[#173d2c]">Upcoming sessions</h2></div><Link href="/reports" className="text-sm font-semibold text-[#526258] hover:text-[#173d2c]">View reports →</Link></div>
              <div className="mt-6 space-y-3">
                {sessions.length === 0 ? <p className="rounded-2xl bg-[#f5f8f4] p-5 text-sm text-[#718076]">No sessions yet. Add your first opening to start filling the calendar.</p> : sessions.slice(0, 5).map((session) => (
                  <div key={session.id} className="flex flex-col gap-4 rounded-2xl bg-[#f7f9f6] p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3"><div className="min-w-[58px] rounded-xl bg-[#173d2c] px-2 py-2 text-center text-white"><p className="text-[10px] uppercase text-[#b8c8ba]">{formatDate(session.date).split(" ")[0]}</p><p className="mt-1 text-lg font-semibold">{formatDate(session.date).split(" ")[1]}</p></div><div><Link href={`/sessions/${session.id}`} className="font-semibold text-[#173d2c] hover:underline">{session.title}</Link><p className="mt-1 text-xs text-[#718076]">{session.startTime}–{session.endTime} · {session.capacity} player{session.capacity === 1 ? "" : "s"}</p></div></div>
                    <div className="flex items-center justify-between gap-4 sm:justify-end"><div className="min-w-[105px]"><div className="flex justify-between text-xs font-semibold text-[#526258]"><span>{session.bookedCount} booked</span><span>{utilization(session.bookedCount, session.capacity)}%</span></div><div className="mt-2 h-1.5 rounded-full bg-[#dfe8df]"><div className="h-1.5 rounded-full bg-[#9bb936]" style={{ width: `${Math.min(utilization(session.bookedCount, session.capacity), 100)}%` }} /></div></div><button onClick={() => setShowDeleteConfirm({ id: session.id, bookingCount: session.bookedCount })} className="text-xs font-semibold text-[#9b3e32]">Remove</button></div>
                  </div>
                ))}
              </div>
            </div>

            <aside className="rounded-3xl bg-[#173d2c] p-5 text-white shadow-[0_18px_50px_rgba(23,61,44,0.12)] sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#d8f36a]">Next actions</p>
              <h2 className="mt-2 text-xl font-semibold">Keep your week moving</h2>
              <div className="mt-6 space-y-3">
                <Link href="/customers" className="flex items-center justify-between rounded-2xl bg-white/10 p-4 transition hover:bg-white/15"><span><span className="block text-sm font-semibold">Review customers</span><span className="mt-1 block text-xs text-[#b8c8ba]">See who is coming back</span></span><span className="text-[#d8f36a]">→</span></Link>
                <Link href="/reports" className="flex items-center justify-between rounded-2xl bg-white/10 p-4 transition hover:bg-white/15"><span><span className="block text-sm font-semibold">Check utilization</span><span className="mt-1 block text-xs text-[#b8c8ba]">Find your best time slots</span></span><span className="text-[#d8f36a]">→</span></Link>
                <button onClick={() => setShowCreate(true)} className="flex w-full items-center justify-between rounded-2xl bg-[#d8f36a] p-4 text-left text-[#173d2c] transition hover:bg-[#e2fa8e]"><span><span className="block text-sm font-bold">Open a new slot</span><span className="mt-1 block text-xs text-[#526258]">Make room for one more player</span></span><span className="text-lg">+</span></button>
              </div>
            </aside>
          </section>

          <section className="mt-6 rounded-3xl border border-[#dfe8df] bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8a978e]">Relationship health</p><h2 className="mt-2 text-xl font-semibold text-[#173d2c]">Recent customers</h2></div><Link href="/customers" className="text-sm font-semibold text-[#526258] hover:text-[#173d2c]">See all →</Link></div>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {customers.slice(0, 3).map((customer) => <div key={customer.id} className="flex items-center gap-3 rounded-2xl bg-[#f7f9f6] p-4"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d8f36a] text-xs font-bold text-[#173d2c]">{customer.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span><div><p className="text-sm font-semibold text-[#173d2c]">{customer.name}</p><p className="mt-1 text-xs text-[#718076]">{customer.bookingCount} bookings · {customer.lineUserID}</p></div></div>)}
              {customers.length === 0 && <p className="text-sm text-[#718076]">Your first customer will appear here.</p>}
            </div>
          </section>
        </>
      )}

      {showDeleteConfirm && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#17211c]/45 p-4"><div role="dialog" aria-modal="true" aria-labelledby="remove-session-title" className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl"><p id="remove-session-title" className="text-lg font-semibold text-[#173d2c]">Remove this session?</p><p className="mt-2 text-sm leading-6 text-[#718076]">{showDeleteConfirm.bookingCount > 0 ? `${showDeleteConfirm.bookingCount} player(s) are currently booked. ` : ""}This action can&apos;t be undone.</p><div className="mt-6 flex justify-end gap-2"><button onClick={() => setShowDeleteConfirm(null)} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[#526258]">Cancel</button><button onClick={() => proceedDelete(showDeleteConfirm.id)} className="rounded-xl bg-[#9b3e32] px-4 py-2.5 text-sm font-semibold text-white">Remove</button></div></div></div>}
    </main>
  );
}
