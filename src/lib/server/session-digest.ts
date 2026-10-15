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

/** Digests one closed session of a loop campaign: one call of the campaign's
 * main model at high effort (or the top of the depth range when higher), then
 * the recap, the chapter title, the notebook and the plans are written through
 * rpg_dossier. Never throws into a request; logs one event either way. */
export async function digestClosedSession(campaignId: string, sessionId: string, reason: "end" | "entry"): Promise<void> {
  const key = `${campaignId}:${sessionId}`;
  if (inFlight.has(key)) return;
  inFlight.add(key);
  const started = performance.now();
  try {
    const { user } = await authorizeCampaign(campaignId);
    const settings = await readDmSettings(campaignId);
    if (settings.runtime !== DM_LOOP_RUNTIME) return;
    const dossier = await dossierService(user.id, campaignId);
    const source = await dossier.source();
    const session = source.snapshot.sessions.find((row) => row.id === sessionId);
    if (!session || session.status !== "closed") return;
    const scenes = source.snapshot.scenes.filter((row) => row.session_id === sessionId).sort((a, b) => a.sequence - b.sequence)
      .map((row) => ({ role: row.role, body: row.body }));
    if (!scenes.some((row) => row.role === "narration")) return;
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
      return;
    }
    await dossier.digest({ sessionId, recap: result.digest.recap, title: result.digest.title, notebook: result.digest.notebook,
      plans: result.digest.plans, ...(result.digest.playerLikes ? { playerLikes: result.digest.playerLikes } : {}) }, source.timeline);
    console.info(JSON.stringify({ event: "session_digest", campaignId, sessionId, reason, model: pin.modelId, effort, requestTokens: request.tokens,
      plans: result.digest.plans.length, costUsd: cost, latencyMs: Math.round(performance.now() - started) }));
  } catch (error) {
    console.info(JSON.stringify({ event: "session_digest_failed", campaignId, sessionId, reason, message: error instanceof Error ? error.message : String(error) }));
  } finally {
    inFlight.delete(key);
  }
}

/** After a session ends: the digest runs after the response, play never waits. */
export function scheduleDigest(campaignId: string, sessionId: string, reason: "end" | "entry") {
  try { after(() => digestClosedSession(campaignId, sessionId, reason)); }
  catch { void digestClosedSession(campaignId, sessionId, reason); }
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
  return null;
}
