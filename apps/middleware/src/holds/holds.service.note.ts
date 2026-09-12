// Holds: Redis SET slot:{id} NX EX 300 + mirror to slots.held_expires_at
// Checkout: Lua compare-and-set + UPDATE slots WHERE version=
// Mock ledger: PENDING -> ESCROW_HELD immediately with chrg_test_xxx
// Cron: COMPLETED where now() > escrow_release_at (= end_time + 2h)
// Rainout: REFUNDED + reschedule_token
export const HOLD_TTL_SECONDS = 300;
