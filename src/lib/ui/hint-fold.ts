// FIX_S4 item 6: a hint that shows on a campaign's first visit and then folds. A per-viewer convenience, remembered per
// campaign in this browser's localStorage; every access is guarded, and without storage the hint simply shows.
export type HintStorage = Pick<Storage, "getItem" | "setItem">;

export const hintKey = (hint: string, campaignId: string) => `rpg-hint-seen-v1:${hint}:${campaignId}`;

/** True the first time this hint is shown for this campaign (and it is marked as seen); false on every later visit. */
export function firstShowing(storage: HintStorage | null, hint: string, campaignId: string): boolean {
  try {
    if (!storage) return true;
    const key = hintKey(hint, campaignId);
    if (storage.getItem(key)) return false;
    storage.setItem(key, "1");
    return true;
  } catch {
    return true;
  }
}

export function hintStorage(): HintStorage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
