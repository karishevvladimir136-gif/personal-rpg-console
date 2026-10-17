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
import { buildDigestRequest, runDigest } from "../gameplay/dm-loop/digest";
import { EFFORT_ORDER } from "../gameplay/dm-loop/depth";
import { DM_LOOP_RUNTIME } from "../gameplay/dm-loop/contracts";
import type { PlaySnapshot } from "../gameplay/contracts";
import type { CampaignSnapshot } from "../persistence/contracts";

const inFlight = new Set<string>();
/** A session that stayed open this long after its last scene is digested on the next entry (stage task §4). */
const STALE_SESSION_MS = 6 * 60 * 60 * 1000;

/** Polish item 11: what the player's screen shows while the digest runs and after. */
export type DigestStatus = { state: "running" | "done" | "failed" | "skipped"; reason: string | null; at: number; costUsd: number | null };
const status = new Map<string, DigestStatus>();
const statusKey = (campaignId: string, sessionId: string) => `${campaignId}:${sessionId}`;
export function readDigestStatus(campaignId: string, sessionId: string): DigestStatus | null {
  return status.get(statusKey(campaignId, sessionId)) ?? null;
}
function setStatus(campaignId: string, sessionId: string, next: Omit<DigestStatus, "at">) {
  status.set(statusKey(campaignId, sessionId), { ...next, at: Date.now() });
  if (status.size > 200) status.delete(status.keys().next().value as string);
}

/** Digests one closed session of a loop campaign: one call of the campaign's
 * main model at high effort (or the top of the depth range when higher), then
 * the recap, the chapter title, the notebook and the plans are written through
 * rpg_dossier. Never throws into a request; logs one event either way. */
export async function digestClosedSession(campaignId: string, sessionId: string, reason: "end" | "entry" | "retry"): Promise<void> {
  const key = `${campaignId}:${sessionId}`;
  if (inFlight.has(key)) return;
  inFlight.add(key);
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
    const top = settings.depth ? settings.depth.max : pin.effort;
    const effort: DmEffort = EFFORT_ORDER[Math.max(EFFORT_ORDER.indexOf("high"), EFFORT_ORDER.indexOf(top))];
    const request = buildDigestRequest(source, { id: session.id, title: session.title, scenes, startWorldMinutes: null, endWorldMinutes: source.runtime.worldMinutes }, effort);
    const model = createDmModel(pin);
    const result = await runDigest(model, request, source, source.runtime.worldMinutes, { operationId: randomUUID(), cacheKey: campaignId });
    const spec = dmModelSpec(pin.providerId, pin.modelId);
    const cost = result.usage && spec ? dmUsageCost(spec, result.usage) : null;
    if (!result.digest) {
      console.info(JSON.stringify({ event: "session_digest_unparsed", campaignId, sessionId, reason, model: pin.modelId, effort, costUsd: cost }));
      setStatus(campaignId, sessionId, { state: "failed", reason: "the model's answer could not be read; try again", costUsd: cost });
      return;
    }
    await dossier.digest({ sessionId, recap: result.digest.recap, title: result.digest.title, notebook: result.digest.notebook,
      plans: result.digest.plans, stinger: result.digest.stinger, ...(result.digest.playerLikes ? { playerLikes: result.digest.playerLikes } : {}) }, source.timeline);
    console.info(JSON.stringify({ event: "session_digest", campaignId, sessionId, reason, model: pin.modelId, effort, requestTokens: request.tokens,
      plans: result.digest.plans.length, stinger: result.digest.stinger.length > 0, costUsd: cost, latencyMs: Math.round(performance.now() - started) }));
    setStatus(campaignId, sessionId, { state: "done", reason: null, costUsd: cost });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.info(JSON.stringify({ event: "session_digest_failed", campaignId, sessionId, reason, message }));
    setStatus(campaignId, sessionId, { state: "failed", reason: message.slice(0, 200), costUsd: null });
  } finally {
    inFlight.delete(key);
  }
}

/** After a session ends: the digest runs after the response, play never waits. */
export function scheduleDigest(campaignId: string, sessionId: string, reason: "end" | "entry" | "retry") {
  setStatus(campaignId, sessionId, { state: "running", reason: null, costUsd: null });
  try { after(() => digestClosedSession(campaignId, sessionId, reason)); }
  catch { void digestClosedSession(campaignId, sessionId, reason); }
}

/** The player asked for the digest again (a failed or missing one); runs only for a closed session of the owner's campaign. */
export async function retryDigest(campaignId: string, sessionId: string): Promise<DigestStatus> {
  await authorizeCampaign(campaignId);
  if (readDigestStatus(campaignId, sessionId)?.state === "running" && inFlight.has(statusKey(campaignId, sessionId)))
    return readDigestStatus(campaignId, sessionId)!;
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
        scheduleDigest(campaignId, current.id, "entry");
        return current.id;
      } catch { /* a stale session that cannot be closed now is closed by the owner */ }
    }
  }
  const dossier = await dossierService(ownerId, campaignId);
  const notebook = await dossier.notebook().catch(() => null);
  const closed = snapshot.sessions.filter((row) => row.status === "closed" && row.id !== notebook?.digestedSessionId && scenesOf(row.id).some((s) => s.role === "narration"))
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at))[0];
  if (closed && !closed.recap.trim()) { scheduleDigest(campaignId, closed.id, "entry"); return closed.id; }
  // An ended session (END pressed, «Продолжить» not yet) without its digest: run it now.
  if (current && current.status === "open" && !current.recap.trim() && current.id !== notebook?.digestedSessionId && play.timeline &&
    scenesOf(current.id).some((s) => s.role === "narration")) {
    try {
      const memory = await createMemoryStore(ownerId, undefined, play.timeline).read(campaignId);
      if (memory.currentBoundary?.sessionId === current.id && memory.currentBoundary.state !== "continued") { scheduleDigest(campaignId, current.id, "entry"); return current.id; }
    } catch { /* memory unavailable: the next entry asks again */ }
  }
  return null;
}
