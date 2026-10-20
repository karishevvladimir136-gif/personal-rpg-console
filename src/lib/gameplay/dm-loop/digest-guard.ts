// The session digest's in-process state (polish item 11) and its guards (fix run A4, items 17 and 81): one
// digest per session at a time — the end digest and an entry digest raced in session 2 ($1.54 for one
// close, the card shown twice) and three entry digests started at once from parallel `/play` reads ($4.43
// in another campaign); no entry digest for a session whose digest runs, failed or was skipped (the
// owner's «Повторить» stays the way to try again); the entry check itself at most once a minute per
// campaign, because `/play` is polled and the check reads the whole campaign. Pure, so it is testable
// without the server.
export type DigestStatus = { state: "running" | "done" | "failed" | "skipped"; reason: string | null; at: number; costUsd: number | null };
const status = new Map<string, DigestStatus>();
const inFlight = new Set<string>();
const entryChecked = new Map<string, number>();
export const ENTRY_CHECK_MS = 60_000;
const key = (campaignId: string, sessionId: string) => `${campaignId}:${sessionId}`;

export function readDigestStatus(campaignId: string, sessionId: string): DigestStatus | null {
  return status.get(key(campaignId, sessionId)) ?? null;
}
export function setStatus(campaignId: string, sessionId: string, next: Omit<DigestStatus, "at">) {
  status.set(key(campaignId, sessionId), { ...next, at: Date.now() });
  if (status.size > 200) status.delete(status.keys().next().value as string);
}
/** A status left «running» by a schedule that never started (a restart) — cleared for the owner's retry. */
export function clearStaleRunning(campaignId: string, sessionId: string) {
  if (readDigestStatus(campaignId, sessionId)?.state === "running" && !inFlight.has(key(campaignId, sessionId))) status.delete(key(campaignId, sessionId));
}
export function digestInFlight(campaignId: string, sessionId: string): boolean {
  return inFlight.has(key(campaignId, sessionId));
}
/** A new digest of this session may be scheduled: none runs or waits to run. */
export function digestSchedulable(campaignId: string, sessionId: string): boolean {
  return !inFlight.has(key(campaignId, sessionId)) && readDigestStatus(campaignId, sessionId)?.state !== "running";
}
/** The digest starts (false: another run of it is already in progress). */
export function enterDigest(campaignId: string, sessionId: string): boolean {
  if (inFlight.has(key(campaignId, sessionId))) return false;
  inFlight.add(key(campaignId, sessionId));
  return true;
}
export function leaveDigest(campaignId: string, sessionId: string) {
  inFlight.delete(key(campaignId, sessionId));
}
/** An entry may start this session's digest: nothing runs, nothing failed or was skipped. */
export function entryDigestAllowed(campaignId: string, sessionId: string): boolean {
  const state = readDigestStatus(campaignId, sessionId)?.state;
  return !inFlight.has(key(campaignId, sessionId)) && state !== "running" && state !== "failed" && state !== "skipped";
}
/** The entry check runs at most once a minute per campaign. */
export function entryCheckDue(campaignId: string, now = Date.now()): boolean {
  const last = entryChecked.get(campaignId) ?? 0;
  if (now - last < ENTRY_CHECK_MS) return false;
  entryChecked.set(campaignId, now);
  if (entryChecked.size > 200) entryChecked.delete(entryChecked.keys().next().value as string);
  return true;
}
