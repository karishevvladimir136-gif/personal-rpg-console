// Fix run A3 (items 62, 75, 81): one polling rule for the open game screen. Session 2's play page asked
// for `/play` 231 times in 13 minutes (each 3–5 s of server time) and the session close asked for the
// digest about once a second; once a read took longer than the interval, requests piled up and the server
// starved. Now a poll never overlaps the previous one, waits longer after each poll while it still has to
// poll (the live stream carries the turn; the poll is a safety net), backs off twice as fast after a
// failure, pauses while the tab is hidden and starts over from the base on focus or on a kick.
export type BackoffPollOptions = {
  /** One poll; a rejection counts as a failure (backs off harder). */
  run: () => Promise<unknown>;
  /** Whether to keep polling now (e.g. a turn is unresolved, a digest is running). */
  active: () => boolean;
  baseMs?: number;
  maxMs?: number;
  /** Growth of the delay after each poll that still has to poll. */
  factor?: number;
  /** For tests: the clock and the page. */
  timers?: { set: (fn: () => void, ms: number) => unknown; clear: (handle: unknown) => void };
  hidden?: () => boolean;
};

export type BackoffPoll = { kick: () => void; stop: () => void; readonly delayMs: number };

export function createBackoffPoll(options: BackoffPollOptions): BackoffPoll {
  const base = options.baseMs ?? 3000;
  const max = options.maxMs ?? 30000;
  const factor = options.factor ?? 1.6;
  // The page's own timers (the window's, as the polling interval before it used): a test harness or a server render
  // that stubs the window never gets a real timer from the screen.
  const host: Pick<typeof globalThis, "setTimeout" | "clearTimeout"> = typeof window !== "undefined" ? window : globalThis;
  const timers = options.timers ?? { set: (fn: () => void, ms: number) => host.setTimeout(fn, ms), clear: (handle: unknown) => host.clearTimeout(handle as ReturnType<typeof setTimeout>) };
  const hidden = options.hidden ?? (() => typeof document !== "undefined" && document.visibilityState === "hidden");
  let delay = base;
  let handle: unknown = null;
  let running = false;
  let stopped = false;
  const schedule = (ms: number) => {
    if (stopped) return;
    if (handle !== null) timers.clear(handle);
    handle = timers.set(tick, ms);
  };
  async function tick() {
    handle = null;
    if (stopped) return;
    if (hidden() || !options.active()) { delay = base; schedule(base); return; }
    if (running) { schedule(delay); return; }
    running = true;
    try {
      await options.run();
      delay = Math.min(max, Math.round(delay * factor));
    } catch {
      delay = Math.min(max * 2, Math.round(delay * factor * 2));
    } finally {
      running = false;
    }
    schedule(delay);
  }
  schedule(base);
  return {
    kick() { delay = base; schedule(0); },
    stop() { stopped = true; if (handle !== null) timers.clear(handle); handle = null; },
    get delayMs() { return delay; },
  };
}
