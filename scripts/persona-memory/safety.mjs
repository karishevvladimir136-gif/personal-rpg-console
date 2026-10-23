// Persona memory F2 (docs/stages/PERSONA_MEMORY_F2.md): the safety rules for paid calls, as code. Stage 2's harness
// asked a refused question once more and kept going; 38 refusals later the provider suspended Opus 5.5 and Sonnet 5.5 for
// the whole organisation for an hour. From here on, every paid call of the persona-memory harnesses passes this gate:
//   - no retries: a refusal is recorded and the next call proceeds (the callers' retry is off by default);
//   - the circuit breaker: after `maxRefusals` refusals in total (3), no further paid call is made;
//   - an error that mentions «suspended», «access» or «policy», or any HTTP 401/403/429, stops every paid call at once;
//   - spacing: one call at a time, the next one starting at least `gapMs` after the previous one finished.

export const MAX_REFUSALS = 3;
export const STOP_PATTERN = /suspend|access|policy/i;
const STOP_STATUS = /^HTTP (401|403|429)\b/;

const realSleep = (ms) => new Promise((resolveSleep) => setTimeout(resolveSleep, ms));

/** Why an error must stop every paid call, or null. */
export function stopReasonOf(error) {
  if (!error) return null;
  const text = String(error);
  if (STOP_PATTERN.test(text)) return `an error mentions suspension, access or policy: ${text.slice(0, 160)}`;
  if (STOP_STATUS.test(text)) return `the provider answered ${text.slice(0, 160)}`;
  return null;
}

/** The gate: `run(call)` waits for its turn and the spacing, makes the call unless the breaker has tripped, and counts
 * what came back. `call` returns the provider's { text, stopReason, error, … }. */
export function createSafety({ maxRefusals = MAX_REFUSALS, gapMs = 3000, sleep = realSleep, now = Date.now, log = () => {} } = {}) {
  let refusals = 0, stopped = null, lastFinished = null, queue = Promise.resolve();
  const state = {
    get refusals() { return refusals; },
    get stopped() { return stopped; },
    maxRefusals, gapMs,
    /** Sequential: a second `run` waits until the first has finished and the gap has passed. */
    run(call) {
      const turn = queue.then(async () => {
        if (stopped) return { text: "", usage: {}, stopReason: null, error: "stopped", notSent: true };
        if (lastFinished !== null && gapMs > 0) {
          const wait = lastFinished + gapMs - now();
          if (wait > 0) await sleep(wait);
        }
        let result;
        try { result = await call(); } finally { lastFinished = now(); }
        if (result.stopReason === "refusal") {
          refusals++;
          log(`refusal ${refusals} of ${maxRefusals} allowed in total`);
          if (refusals >= maxRefusals && !stopped) { stopped = `the circuit breaker: ${refusals} refusals in total`; log(`STOP: ${stopped}`); }
        }
        const fatal = stopReasonOf(result.error);
        if (fatal && !stopped) { stopped = fatal; log(`STOP: ${stopped}`); }
        return result;
      });
      queue = turn.catch(() => {});
      return turn;
    },
  };
  return state;
}
