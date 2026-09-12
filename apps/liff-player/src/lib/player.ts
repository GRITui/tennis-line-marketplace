"use client";

import { initLiff, liff } from "@/lib/liff";

export const DEMO_PLAYER_ID = "demo-player-uid";

/** Resolve LINE player_id, falling back to demo id for desktop demo. */
export async function getPlayerId(): Promise<string> {
  try {
    await initLiff();
    if (liff.isLoggedIn?.() === false) {
      return DEMO_PLAYER_ID;
    }
    const profile = await liff.getProfile();
    return profile.userId || DEMO_PLAYER_ID;
  } catch {
    return DEMO_PLAYER_ID;
  }
}
