const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:8080";

export type SurfaceType = "HARD" | "CLAY" | "GRASS";

export interface Slot {
  id: string;
  coach_name: string;
  court_name: string;
  surface_type: string;
  location_text: string;
  start_time: string;
  end_time: string;
  bundled_price: number;
  status: string;
}

export interface Booking {
  id: string;
  slot_id: string;
  player_id: string;
  status: "ESCROW_HELD" | "BOOKED" | "COMPLETED" | "REFUNDED" | "RESCHEDULED" | string;
  amount?: number;
  bundled_price?: number;
  coach_name?: string;
  court_name?: string;
  location_text?: string;
  start_time?: string;
  end_time?: string;
  hold_expires_at?: string;
  created_at?: string;
}

export interface ProgressLog {
  id: string;
  created_at: string;
  session_date?: string;
  focus_areas: string[];
  rating?: number;
  notes?: string;
  coach_name?: string;
}

export interface HoldResult {
  booking_id?: string;
  slot_id: string;
  hold_expires_at: string;
  status: string;
}

// ---------------------------------------------------------------------------
// Offline demo fallback — 3 hardcoded slots so the UI is demoable with no backend.
// ---------------------------------------------------------------------------
export const MOCK_SLOTS: Slot[] = [
  {
    id: "demo-slot-1",
    coach_name: "Coach Nok",
    court_name: "Court A1",
    surface_type: "HARD",
    location_text: "Asoke Tennis Club, Bangkok",
    start_time: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    end_time: new Date(Date.now() + 25 * 3600 * 1000).toISOString(),
    bundled_price: 1200,
    status: "OPEN",
  },
  {
    id: "demo-slot-2",
    coach_name: "Coach Ben",
    court_name: "Court C2",
    surface_type: "CLAY",
    location_text: "Ari Clay Courts, Bangkok",
    start_time: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(),
    end_time: new Date(Date.now() + 2 * 24 * 3600 * 1000 + 3600 * 1000).toISOString(),
    bundled_price: 1500,
    status: "OPEN",
  },
  {
    id: "demo-slot-3",
    coach_name: "Coach Sara",
    court_name: "Court G1",
    surface_type: "GRASS",
    location_text: "Thonglor Grass Arena, Bangkok",
    start_time: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(),
    end_time: new Date(Date.now() + 3 * 24 * 3600 * 1000 + 3600 * 1000).toISOString(),
    bundled_price: 1800,
    status: "HELD",
  },
];

const MOCK_BOOKINGS: Booking[] = [
  {
    id: "demo-booking-1",
    slot_id: "demo-slot-1",
    player_id: "demo-player-uid",
    status: "BOOKED",
    amount: 1200,
    coach_name: "Coach Nok",
    court_name: "Court A1",
    location_text: "Asoke Tennis Club, Bangkok",
    start_time: MOCK_SLOTS[0].start_time,
    end_time: MOCK_SLOTS[0].end_time,
  },
  {
    id: "demo-booking-2",
    slot_id: "demo-slot-2",
    player_id: "demo-player-uid",
    status: "ESCROW_HELD",
    amount: 1500,
    coach_name: "Coach Ben",
    court_name: "Court C2",
    location_text: "Ari Clay Courts, Bangkok",
    start_time: MOCK_SLOTS[1].start_time,
    end_time: MOCK_SLOTS[1].end_time,
  },
];

const MOCK_PASSPORT: ProgressLog[] = [
  {
    id: "log-1",
    created_at: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
    session_date: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
    focus_areas: ["Forehand", "Footwork"],
    rating: 4,
    notes: "Great topspin depth. Keep left foot planted on open stance.",
    coach_name: "Coach Nok",
  },
  {
    id: "log-2",
    created_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    session_date: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    focus_areas: ["Serve", "Toss"],
    rating: 5,
    notes: "First-serve % up to 68%. Toss arm fully extended.",
    coach_name: "Coach Ben",
  },
];

function mockExpiry(): string {
  return new Date(Date.now() + 5 * 60 * 1000).toISOString();
}

function filterMocks(date?: string, surface?: string, q?: string): Slot[] {
  return MOCK_SLOTS.filter((s) => {
    if (s.status !== "OPEN") return false;
    if (surface && surface !== "ALL" && s.surface_type !== surface) return false;
    if (date && !s.start_time.startsWith(date)) return false;
    if (
      q &&
      !`${s.coach_name} ${s.court_name} ${s.location_text}`
        .toLowerCase()
        .includes(q.toLowerCase())
    )
      return false;
    return true;
  });
}

async function tryFetch<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof TypeError) return fallback;
    throw error;
  }
}

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

export async function listSlots(
  date?: string,
  surface?: string,
  q?: string
): Promise<Slot[]> {
  const params = new URLSearchParams();
  if (date) params.set("date", date);
  if (surface && surface !== "ALL") params.set("surface", surface);
  if (q) params.set("q", q);
  const qs = params.toString() ? `?${params.toString()}` : "";
  return tryFetch(async () => {
    const res = await fetch(`${API_BASE}/slots${qs}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`listSlots ${res.status}`);
    const data = await res.json();
    return (Array.isArray(data) ? data : data.slots ?? []) as Slot[];
  }, filterMocks(date, surface, q));
}

export async function holdSlot(
  slot_id: string,
  player_id: string
): Promise<HoldResult> {
  return tryFetch(async () => {
    const res = await fetch(`${API_BASE}/slots/${slot_id}/hold`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ player_id }),
    });
    if (!res.ok) throw new Error(`holdSlot ${res.status}`);
    return (await res.json()) as HoldResult;
  }, {
    booking_id: `mock-hold-${slot_id}`,
    slot_id,
    hold_expires_at: mockExpiry(),
    status: "ESCROW_HELD",
  });
}

export async function checkout(
  slot_id: string,
  player_id: string
): Promise<Booking> {
  return tryFetch(async () => {
    const res = await fetch(`${API_BASE}/slots/${slot_id}/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ player_id }),
    });
    if (!res.ok) throw new Error(`checkout ${res.status}`);
    return (await res.json()) as Booking;
  }, {
    id: `mock-receipt-${slot_id}`,
    slot_id,
    player_id,
    status: "BOOKED",
    amount:
      MOCK_SLOTS.find((s) => s.id === slot_id)?.bundled_price ?? 1200,
    coach_name: MOCK_SLOTS.find((s) => s.id === slot_id)?.coach_name,
    court_name: MOCK_SLOTS.find((s) => s.id === slot_id)?.court_name,
    location_text: MOCK_SLOTS.find((s) => s.id === slot_id)?.location_text,
    start_time: MOCK_SLOTS.find((s) => s.id === slot_id)?.start_time,
    end_time: MOCK_SLOTS.find((s) => s.id === slot_id)?.end_time,
    created_at: new Date().toISOString(),
  });
}

export async function myBookings(player_id: string): Promise<Booking[]> {
  return tryFetch(async () => {
    const res = await fetch(
      `${API_BASE}/players/${encodeURIComponent(player_id)}/bookings`,
      { cache: "no-store" }
    );
    if (!res.ok) throw new Error(`myBookings ${res.status}`);
    const data = await res.json();
    return (Array.isArray(data) ? data : data.bookings ?? []) as Booking[];
  }, MOCK_BOOKINGS);
}

export async function myPassport(player_id: string): Promise<ProgressLog[]> {
  void player_id;
  return tryFetch(async () => {
    const res = await fetch(
      `${API_BASE}/players/${encodeURIComponent(player_id)}/passport`,
      { cache: "no-store" }
    );
    if (!res.ok) throw new Error(`myPassport ${res.status}`);
    const data = await res.json();
    return (Array.isArray(data) ? data : data.logs ?? data.progress ?? []) as ProgressLog[];
  }, MOCK_PASSPORT);
}

export async function rainoutAction(
  bookingId: string,
  action: "refund" | "reschedule"
): Promise<{ ok: boolean; status: string }> {
  return tryFetch(async () => {
    const res = await fetch(`${API_BASE}/bookings/${bookingId}/rainout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (!res.ok) throw new Error(`rainoutAction ${res.status}`);
    return (await res.json()) as { ok: boolean; status: string };
  }, {
    ok: true,
    status: action === "refund" ? "REFUNDED" : "RESCHEDULED",
  });
}
