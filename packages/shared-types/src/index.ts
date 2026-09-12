export type UserRole = 'PLAYER' | 'COACH' | 'ADMIN';
export type SurfaceType = 'HARD' | 'CLAY' | 'GRASS';
export type SlotStatus = 'OPEN' | 'HELD' | 'BOOKED';
export type PaymentStatus = 'PENDING' | 'ESCROW_HELD' | 'COMPLETED' | 'REFUNDED' | 'FAILED';
export type BookingSource = 'LINE_LIFF' | 'MANUAL_ADMIN';

export interface Slot {
  id: string;
  coach_id: string;
  court_id: string;
  start_time: string;
  end_time: string;
  bundled_price: number;
  status: SlotStatus;
}

export interface Booking {
  id: string;
  slot_id: string;
  player_id: string;
  payment_status: PaymentStatus;
  source: BookingSource;
  amount_total: number;
  provider: 'MOCK' | 'OMISE';
}
