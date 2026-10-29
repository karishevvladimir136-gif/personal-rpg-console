import "server-only";
import { randomUUID } from "node:crypto";
import { after } from "next/server";
import { readDmSettings } from "./dm-settings";
import { dossierService } from "./dossier";
import { readProductionSettings } from "./production-configuration";
import { createDmModel } from "./dm/model";
import { dmLoopPinFromProfile, dmLoopProfile } from "../production/dm-loop-pin";
import { dmModelSpec, dmUsageCost } from "../model-runtime/dm-models";
import { DM_LOOP_RUNTIME } from "../gameplay/dm-loop/contracts";
import { DIGEST_OUTPUT_TOKENS } from "../gameplay/dm-loop/digest";
import { buildPrepRequest, hiddenLayerOf, parsePrep, prepWrites } from "../gameplay/dm-loop/hidden-layer";
import { companyOn, companyRequest } from "../gameplay/dm-loop/company";
import { FIRST_TURN_PREP_WAIT_MS, prepDecision, type PrepTrigger } from "../gameplay/dm-loop/prep-schedule";

// Fix run B1 (key finding 2): the DM's prep — once per campaign, before its first session or, for a campaign that has
// none yet, on the next entry. One private call of the campaign's DM model at high; the hidden layer and its clocks go
// into the private notes. Off the request's path (after the response); never twice at a time; a failed or unreadable
// prep is retried no sooner than an hour later (a paid call is not repeated on every poll).
// Fix S3-pre (KF-hidden-layer): never from the Settings screen's read; rebuilt once when the owner saves «Тайны»; a
// brand-new campaign's first turn waits for it, once (src/lib/gameplay/dm-loop/prep-schedule.ts decides).
type PrepReason = "first" | "existing" | "secrets";
const running = new Map<string, Promise<void>>();
const failedAt = new Map<string, number>();
/** Campaigns known to have their layer (in this process): no source read for them on later entries. */
const known = new Set<string>();
/** Campaigns whose first turn already waited for the prep (one wait, once). */
const waited = new Set<string>();
const RETRY_AFTER_MS = 60 * 60 * 1000;

const stateOf = (campaignId: string, now: number, committedTurns = 1, pureSimulation = false) => ({ hasLayer: known.has(campaignId), running: running.has(campaignId),
  failedRecently: now - (failedAt.get(campaignId) ?? -Infinity) < RETRY_AFTER_MS, waitedBefore: waited.has(campaignId), committedTurns, pureSimulation });

/** `pureSimulation` (game player 2): the campaign's DM option — a pure-simulation campaign is never prepped. */
export function prepSchedulable(campaignId: string, now = Date.now(), trigger: PrepTrigger = "play", pureSimulation = false): boolean {
  return prepDecision(trigger, stateOf(campaignId, now, 1, pureSimulation)) === "background";
}

function start(campaignId: string, ownerId: string, reason: PrepReason): Promise<void> {
  const job = prepHiddenLayer(campaignId, ownerId, reason).finally(() => running.delete(campaignId));
  running.set(campaignId, job);
  return job;
}

export function schedulePrep(campaignId: string, ownerId: string, reason: "first" | "existing", pureSimulation = false): boolean {
  if (!prepSchedulable(campaignId, Date.now(), "play", pureSimulation)) return false;
  const run = () => start(campaignId, ownerId, reason);
  try { after(run); } catch { void run(); }
  return true;
}

/** Fix S3-pre: the owner saved «Тайны» — the layer is rebuilt on them (or built, when there is none yet), off the request's path. */
export function scheduleSecretsPrep(campaignId: string, ownerId: string): boolean {
  const decision = prepDecision("secrets_saved", stateOf(campaignId, Date.now()));
  if (decision === "none") return false;
  failedAt.delete(campaignId);
  known.delete(campaignId);
  // "secrets" rebuilds a layer the source has (known in this process or not) and builds one when there is none.
  const run = () => start(campaignId, ownerId, "secrets");
  try { after(run); } catch { void run(); }
  return true;
}

/** Fix S3-pre: a brand-new campaign's first turn waits for the prep — the running one, or one started now — once. */
export async function awaitFirstTurnPrep(campaignId: string, ownerId: string, committedTurns: () => Promise<number>, pureSimulation = false): Promise<void> {
  if (known.has(campaignId) || waited.has(campaignId)) return;
  if (prepDecision("first_turn", stateOf(campaignId, Date.now(), await committedTurns(), pureSimulation)) !== "wait") return;
  waited.add(campaignId);
  const job = running.get(campaignId) ?? start(campaignId, ownerId, "first");
  let timer: ReturnType<typeof setTimeout> | null = null;
  await Promise.race([job, new Promise<void>((resolve) => { timer = setTimeout(resolve, FIRST_TURN_PREP_WAIT_MS); })]).catch(() => {});
  if (timer) clearTimeout(timer);
}

export async function prepHiddenLayer(campaignId: string, ownerId: string, reason: PrepReason): Promise<void> {
  const started = performance.now();
  const skip = (why: string) => console.info(JSON.stringify({ event: "hidden_layer_prep_skipped", campaignId, reason, why }));
  try {
    const settings = await readDmSettings(campaignId);
    if (settings.runtime !== DM_LOOP_RUNTIME) return skip("the campaign does not play on the turn loop");
    // Game player 2: «pure simulation» — no preparation at all (no hidden layer, no plan, no clocks), whatever asked for it.
    if (settings.options.pureSimulation) return skip("pure simulation: no preparation");
    const dossier = await dossierService(ownerId, campaignId);
    const source = await dossier.source();
    if (hiddenLayerOf(source) && reason !== "secrets") { known.add(campaignId); return; }
    const production = await readProductionSettings(campaignId);
    const pin = dmLoopPinFromProfile(dmLoopProfile(production.runtimePolicy, settings.split?.writer ?? settings.dmTurn));
    const request = buildPrepRequest(source, "high", reason === "secrets" && !!hiddenLayerOf(source));
    const model = createDmModel(pin);
    let text = "", stop: string | null = null;
    let usage: Parameters<typeof dmUsageCost>[1] | null = null;
    // Multi-hero 1: a company table's prep is asked in the company's words (company.ts).
    const company = companyOn(source.dmOptions);
    const asked = company ? companyRequest({ system: request.system, messages: request.messages, toolset: null }) : { system: request.system, messages: request.messages, toolset: null };
    for await (const event of model.stream({ ...asked, effort: request.effort,
      maxOutputTokens: DIGEST_OUTPUT_TOKENS, operationId: randomUUID(), cacheKey: campaignId })) {
      if (event.type === "text_delta") text += event.text;
      else if (event.type === "usage") usage = event.usage;
      else if (event.type === "stop") stop = event.reason;
    }
    const spec = dmModelSpec(pin.providerId, pin.modelId);
    const costUsd = usage && spec ? Number(dmUsageCost(spec, usage).toFixed(4)) : null;
    const prep = parsePrep(text, source.snapshot.settings.values.language === "ru" ? "ru" : "en", { company });
    if (!prep) {
      failedAt.set(campaignId, Date.now());
      console.info(JSON.stringify({ event: "hidden_layer_prep_unparsed", campaignId, reason, stop, costUsd, chars: text.length }));
      return;
    }
    await dossier.privateNotes({ set: prepWrites(prep, source), remove: [] }, source.timeline);
    known.add(campaignId);
    // The layer's text is DM-only; the log names its size, never its content.
    console.info(JSON.stringify({ event: "hidden_layer_prep", campaignId, reason, model: pin.modelId, requestTokens: request.tokens,
      chars: prep.text.length, clocks: prep.clocks.length, costUsd, latencyMs: Math.round(performance.now() - started) }));
  } catch (error) {
    failedAt.set(campaignId, Date.now());
    console.info(JSON.stringify({ event: "hidden_layer_prep_failed", campaignId, reason, message: error instanceof Error ? error.message.slice(0, 200) : String(error) }));
  }
}
