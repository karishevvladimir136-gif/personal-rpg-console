// Fix S4 run 1 (FIX_S4_TABLE 11u′, B-fable: «"Day 2 · night" ticked over at midnight, which is correct but jarred»): the
// day number of the world clock turns at first light or when a long rest ends, whichever comes first — never at
// midnight. One function for every place the day is shown or told: the player's screen and the harness through
// src/lib/ui/campaign-view.ts worldClock, and the DM's own context through dm-loop/context.ts worldDay. Pure.

/** First light: 05:00, the hour where the screen's «night» ends and «morning» begins (campaign-view.ts timeOfDayWord),
 * so «Day 1 · night» becomes «Day 2 · morning» in one step and never «Day 1 · morning» → «Day 2 · morning». */
export const FIRST_LIGHT_MINUTE = 5 * 60;
/** A long rest that ends within this many minutes before first light (from 17:00) starts the new day at its end; one that
 * ends later in the morning or the day changes nothing — first light already turned the day. */
export const NIGHT_BEFORE_FIRST_LIGHT = 12 * 60;

const DAY = 1440;
/** First lights passed by a world minute (0 before the first one of the campaign's first calendar day). */
const lightsPassed = (minutes: number) => Math.max(0, Math.floor((minutes - FIRST_LIGHT_MINUTE) / DAY) + 1);

type RestLike = { kind?: unknown; status?: unknown; public_outcome?: unknown };
/** The world minutes at which each completed long rest ended: the DM loop's rest keeps `endedAtMinutes`; a formal rest
 * that kept its start and length gives their sum. Older records without either are left out (first light alone). */
export function longRestEnds(rests: readonly RestLike[] | null | undefined): number[] {
  const out: number[] = [];
  for (const rest of rests ?? []) {
    if (rest.kind !== "long" || rest.status !== "complete" || !rest.public_outcome || typeof rest.public_outcome !== "object") continue;
    const outcome = rest.public_outcome as { endedAtMinutes?: unknown; startedAtMinutes?: unknown; minutes?: unknown };
    const ended = typeof outcome.endedAtMinutes === "number" ? outcome.endedAtMinutes
      : typeof outcome.startedAtMinutes === "number" && typeof outcome.minutes === "number" ? outcome.startedAtMinutes + outcome.minutes : null;
    if (ended !== null && Number.isFinite(ended) && ended >= 0) out.push(ended);
  }
  return out;
}

/** The campaign day of a world minute (minutes since the midnight before the campaign's first scene): one more at every
 * first light after the first calendar morning's — or at the end of a long rest taken in the night before it, and that
 * first light then turns nothing. A scene that starts at 23:00 stays «Day 1» through midnight; one that starts at 03:00 is
 * «Day 1 · night», then «Day 1 · morning». */
export function campaignDay(minutes: number, longRests: readonly number[] = []): number {
  const passed = lightsPassed(minutes);
  // A rest that ended in the night before the coming first light already turned the day.
  const nextLight = FIRST_LIGHT_MINUTE + DAY * passed;
  const early = longRests.some((end) => end <= minutes && end >= nextLight - NIGHT_BEFORE_FIRST_LIGHT && end < nextLight);
  return Math.max(1, passed + (early ? 1 : 0));
}
