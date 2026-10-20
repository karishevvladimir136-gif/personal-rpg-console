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

// Fix run B1 (key finding 2): the DM's prep — once per campaign, before its first session or, for a campaign that has
// none yet, on the next entry. One private call of the campaign's DM model at high; the hidden layer and its clocks go
// into the private notes. Off the request's path (after the response); play never waits; never twice at a time; a
// failed or unreadable prep is retried no sooner than an hour later (a paid call is not repeated on every poll).
const running = new Set<string>();
const failedAt = new Map<string, number>();
/** Campaigns known to have their layer (in this process): no source read for them on later entries. */
const known = new Set<string>();
const RETRY_AFTER_MS = 60 * 60 * 1000;

export function prepSchedulable(campaignId: string, now = Date.now()): boolean {
  return !known.has(campaignId) && !running.has(campaignId) && now - (failedAt.get(campaignId) ?? -Infinity) >= RETRY_AFTER_MS;
}

export function schedulePrep(campaignId: string, ownerId: string, reason: "first" | "existing"): boolean {
  if (!prepSchedulable(campaignId)) return false;
  running.add(campaignId);
  const run = () => prepHiddenLayer(campaignId, ownerId, reason).finally(() => running.delete(campaignId));
  try { after(run); } catch { void run(); }
  return true;
}

export async function prepHiddenLayer(campaignId: string, ownerId: string, reason: "first" | "existing"): Promise<void> {
  const started = performance.now();
  const skip = (why: string) => console.info(JSON.stringify({ event: "hidden_layer_prep_skipped", campaignId, reason, why }));
  try {
    const settings = await readDmSettings(campaignId);
    if (settings.runtime !== DM_LOOP_RUNTIME) return skip("the campaign does not play on the turn loop");
    const dossier = await dossierService(ownerId, campaignId);
    const source = await dossier.source();
    if (hiddenLayerOf(source)) { known.add(campaignId); return; }
    const production = await readProductionSettings(campaignId);
    const pin = dmLoopPinFromProfile(dmLoopProfile(production.runtimePolicy, settings.split?.writer ?? settings.dmTurn));
    const request = buildPrepRequest(source, "high");
    const model = createDmModel(pin);
    let text = "", stop: string | null = null;
    let usage: Parameters<typeof dmUsageCost>[1] | null = null;
    for await (const event of model.stream({ system: request.system, messages: request.messages, toolset: null, effort: request.effort,
      maxOutputTokens: DIGEST_OUTPUT_TOKENS, operationId: randomUUID(), cacheKey: campaignId })) {
      if (event.type === "text_delta") text += event.text;
      else if (event.type === "usage") usage = event.usage;
      else if (event.type === "stop") stop = event.reason;
    }
    const spec = dmModelSpec(pin.providerId, pin.modelId);
    const costUsd = usage && spec ? Number(dmUsageCost(spec, usage).toFixed(4)) : null;
    const prep = parsePrep(text, source.snapshot.settings.values.language === "ru" ? "ru" : "en");
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
