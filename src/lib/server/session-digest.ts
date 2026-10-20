import "server-only";
import { randomUUID } from "node:crypto";
import { after } from "next/server";
import { authorizeCampaign } from "./campaign-authorization";
import { readDmSettings } from "./dm-settings";
import { dossierService } from "./dossier";
import { readProductionSettings } from "./production-configuration";
import { createDmModel } from "./dm/model";
import { createMemoryStore } from "./memory/store";
import { dmLoopPinFromProfile, dmLoopProfile } from "../production/dm-loop-pin";
import { dmModelSpec, dmUsageCost, type DmEffort } from "../model-runtime/dm-models";
import { buildDigestRequest, runDigest, unparsedReason } from "../gameplay/dm-loop/digest";
import { EFFORT_ORDER } from "../gameplay/dm-loop/depth";
import { DM_LOOP_RUNTIME } from "../gameplay/dm-loop/contracts";
import { appendObservations } from "../gameplay/dm-loop/observations";
import { HIDDEN_LAYER_KEY, privateNotes, serializeNote } from "../gameplay/dm-loop/private-notes";
import { clearStaleRunning, digestInFlight, digestSchedulable, enterDigest, entryDigestAllowed, leaveDigest, readDigestStatus, setStatus, type DigestStatus } from "../gameplay/dm-loop/digest-guard";
import type { PlaySnapshot } from "../gameplay/contracts";
import type { CampaignSnapshot } from "../persistence/contracts";

/** A session that stayed open this long after its last scene is digested on the next entry (stage task §4). */
const STALE_SESSION_MS = 6 * 60 * 60 * 1000;
export { readDigestStatus, entryCheckDue, entryDigestAllowed, type DigestStatus } from "../gameplay/dm-loop/digest-guard";

/** Digests one closed session of a loop campaign: one call of the campaign's
 * main model at high effort (or the top of the depth range when higher), then
 * the recap, the chapter title, the notebook and the plans are written through
 * rpg_dossier. Never throws into a request; logs one event either way. */
export async function digestClosedSession(campaignId: string, sessionId: string, reason: "end" | "entry" | "retry"): Promise<void> {
  if (!enterDigest(campaignId, sessionId)) return;
  const started = performance.now();
  // Every early return says why (polish item 11: the digest used to exit without a word).
  const skip = (why: string) => {
    console.info(JSON.stringify({ event: "session_digest_skipped", campaignId, sessionId, reason, why }));
    setStatus(campaignId, sessionId, { state: "skipped", reason: why, costUsd: null });
  };
  try {
    setStatus(campaignId, sessionId, { state: "running", reason: null, costUsd: null });
    const { user } = await authorizeCampaign(campaignId);
    const settings = await readDmSettings(campaignId);
    if (settings.runtime !== DM_LOOP_RUNTIME) return skip("the campaign does not play on the turn loop");
    const dossier = await dossierService(user.id, campaignId);
    const source = await dossier.source();
    const session = source.snapshot.sessions.find((row) => row.id === sessionId);
    if (!session) return skip("the session does not exist");
    // «Закончить сессию» writes the memory boundary and leaves the row open until
    // «Продолжить» (an unfinished action survives END): an ended boundary counts.
    if (session.status !== "closed") {
      const memory = await createMemoryStore(user.id, undefined, source.timeline).read(campaignId);
      const ended = memory.sessions.some((row) => row.sessionId === sessionId) || memory.currentBoundary?.sessionId === sessionId;
      if (!ended) return skip("the session is still open");
    }
    const scenes = source.snapshot.scenes.filter((row) => row.session_id === sessionId).sort((a, b) => a.sequence - b.sequence)
      .map((row) => ({ role: row.role, body: row.body }));
    if (!scenes.some((row) => row.role === "narration")) return skip("the session has no narration to digest");
    const production = await readProductionSettings(campaignId);
    const pin = dmLoopPinFromProfile(dmLoopProfile(production.runtimePolicy, settings.dmTurn));
    // Fix run A4 (item 17): the digest thinks at the depth range's base (high at least), never at its top.
    const base = settings.depth ? settings.depth.min : pin.effort;
    const effort: DmEffort = EFFORT_ORDER[Math.max(EFFORT_ORDER.indexOf("high"), EFFORT_ORDER.indexOf(base))];
    const request = buildDigestRequest(source, { id: session.id, title: session.title, scenes, startWorldMinutes: null, endWorldMinutes: source.runtime.worldMinutes }, effort);
    const model = createDmModel(pin);
    const result = await runDigest(model, request, source, source.runtime.worldMinutes, { operationId: randomUUID(), cacheKey: campaignId });
    const spec = dmModelSpec(pin.providerId, pin.modelId);
    const cost = result.usage && spec ? dmUsageCost(spec, result.usage) : null;
    if (!result.digest) {
      // Item 17: the reason and the first 300 characters (the digest is DM-side text; the log is the owner's own machine's).
      console.info(JSON.stringify({ event: "session_digest_unparsed", campaignId, sessionId, reason, model: pin.modelId, effort, costUsd: cost,
        why: unparsedReason(result.text, result.stop), stop: result.stop, head: result.text.slice(0, 300) }));
      setStatus(campaignId, sessionId, { state: "failed", reason: "the model's answer could not be read; try again", costUsd: cost });
      return;
    }
    await dossier.digest({ sessionId, recap: result.digest.recap, title: result.digest.title, notebook: result.digest.notebook,
      plans: result.digest.plans, stinger: result.digest.stinger,
      // Fix run A2: the digest's observations are appended to the DM's notes, never written over them.
      ...(result.digest.playerLikes ? { playerLikes: appendObservations(String(source.snapshot.campaign.dm_likes ?? ""), result.digest.playerLikes) } : {}) }, source.timeline);
    // Fix run B1/B2: the hidden layer kept current and the closed notes of finished matters folded (one line each,
    // closed, with the span they covered); a failure here never undoes the digest.
    const folds = result.digest.folds;
    if (result.digest.hiddenLayer || folds.length) {
      const notes = privateNotes(source.privateState);
      const set = [...(result.digest.hiddenLayer ? [{ kind: "fact" as const, key: HIDDEN_LAYER_KEY, value: result.digest.hiddenLayer }] : []),
        ...folds.map((fold, index) => {
          const covered = notes.filter((note) => fold.keys.some((k) => k.kind === note.kind && k.key === note.key));
          const since = Math.min(...covered.map((note) => note.since ?? Infinity)), until = Math.max(...covered.map((note) => note.until ?? 0));
          return { kind: "fact" as const, key: `fold_${sessionId.slice(0, 8)}_${index}`, value: serializeNote(fold.line, Number.isFinite(since) ? since : null, until || source.runtime.worldMinutes) };
        })];
      await dossier.privateNotes({ set, remove: folds.flatMap((fold) => fold.keys) }, source.timeline)
        .catch((error) => console.info(JSON.stringify({ event: "session_digest_notes_failed", campaignId, sessionId, message: error instanceof Error ? error.message.slice(0, 200) : String(error) })));
    }
    console.info(JSON.stringify({ event: "session_digest", campaignId, sessionId, reason, model: pin.modelId, effort, requestTokens: request.tokens,
      plans: result.digest.plans.length, stinger: result.digest.stinger.length > 0, hiddenLayer: !!result.digest.hiddenLayer, folds: folds.length,
      folded: folds.reduce((sum, fold) => sum + fold.keys.length, 0), costUsd: cost, latencyMs: Math.round(performance.now() - started) }));
    setStatus(campaignId, sessionId, { state: "done", reason: null, costUsd: cost });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.info(JSON.stringify({ event: "session_digest_failed", campaignId, sessionId, reason, message }));
    setStatus(campaignId, sessionId, { state: "failed", reason: message.slice(0, 200), costUsd: null });
  } finally {
    leaveDigest(campaignId, sessionId);
  }
}

/** After a session ends: the digest runs after the response, play never waits. Fix run A4 (items 17, 81):
 * one digest per session at a time — a second schedule while one runs (the entry digest that raced the
 * end digest, three entry digests from parallel `/play` reads) does nothing. */
export function scheduleDigest(campaignId: string, sessionId: string, reason: "end" | "entry" | "retry"): boolean {
  if (!digestSchedulable(campaignId, sessionId)) {
    console.info(JSON.stringify({ event: "session_digest_skipped", campaignId, sessionId, reason, why: "a digest of this session is already running" }));
    return false;
  }
  setStatus(campaignId, sessionId, { state: "running", reason: null, costUsd: null });
  try { after(() => digestClosedSession(campaignId, sessionId, reason)); }
  catch { void digestClosedSession(campaignId, sessionId, reason); }
  return true;
}

/** The player asked for the digest again (a failed or missing one); runs only for a closed session of the owner's campaign. */
export async function retryDigest(campaignId: string, sessionId: string): Promise<DigestStatus> {
  await authorizeCampaign(campaignId);
  if (digestInFlight(campaignId, sessionId)) return readDigestStatus(campaignId, sessionId)!;
  // A status left «running» by a schedule that never started (a restart) does not block the owner's retry.
  clearStaleRunning(campaignId, sessionId);
  scheduleDigest(campaignId, sessionId, "retry");
  return readDigestStatus(campaignId, sessionId)!;
}

/** On entry (stage task §4): a session left open and stale is closed and
 * digested; a closed session without a digest gets one. Returns what was scheduled. */
export async function digestOnEntry(campaignId: string, snapshot: CampaignSnapshot, play: PlaySnapshot, ownerId: string): Promise<string | null> {
  const current = snapshot.sessions.find((row) => row.id === snapshot.publicState.current_session_id) ?? null;
  const scenesOf = (id: string) => snapshot.scenes.filter((row) => row.session_id === id);
  if (current && current.status === "open" && play.timeline && !play.turns.some((turn) => turn.status === "generating" || turn.status === "awaiting_confirmation")) {
    const scenes = scenesOf(current.id);
    const last = scenes.at(-1);
    const stale = last && scenes.filter((row) => row.role === "narration").length >= 2 && Date.now() - Date.parse(last.created_at) > STALE_SESSION_MS;
    if (stale) {
      try {
        await createMemoryStore(ownerId, undefined, play.timeline).end({ requestId: randomUUID(), campaignId, sessionId: current.id,
          expectedRevision: play.revision, timeline: play.timeline });
        if (entryDigestAllowed(campaignId, current.id)) scheduleDigest(campaignId, current.id, "entry");
        return current.id;
      } catch { /* a stale session that cannot be closed now is closed by the owner */ }
    }
  }
  const dossier = await dossierService(ownerId, campaignId);
  const notebook = await dossier.notebook().catch(() => null);
  const closed = snapshot.sessions.filter((row) => row.status === "closed" && row.id !== notebook?.digestedSessionId && scenesOf(row.id).some((s) => s.role === "narration"))
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at))[0];
  if (closed && !closed.recap.trim()) {
    if (!entryDigestAllowed(campaignId, closed.id)) return null;
    scheduleDigest(campaignId, closed.id, "entry");
    return closed.id;
  }
  // An ended session (END pressed, «Продолжить» not yet) without its digest: run it now.
  if (current && current.status === "open" && !current.recap.trim() && current.id !== notebook?.digestedSessionId && play.timeline &&
    scenesOf(current.id).some((s) => s.role === "narration")) {
    try {
      const memory = await createMemoryStore(ownerId, undefined, play.timeline).read(campaignId);
      if (memory.currentBoundary?.sessionId === current.id && memory.currentBoundary.state !== "continued") {
        if (!entryDigestAllowed(campaignId, current.id)) return null;
        scheduleDigest(campaignId, current.id, "entry");
        return current.id;
      }
    } catch { /* memory unavailable: the next entry asks again */ }
  }
  return null;
}
