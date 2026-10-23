import "server-only";
import { randomUUID } from "node:crypto";
import { applyMutation, readCampaign } from "../../server/repository";
import { readMapLayout } from "../../server/map-layout";
import { PersistenceError } from "../../server/errors";
import { isUuid } from "../../persistence/validation";
import type { CampaignSnapshot } from "../../persistence/contracts";
import { boardOf as picturesBoardOf, picturesContext, type PicturesContext } from "../../server/media/pictures-store";
import { createPictureRow, privatePicture } from "../../visual-frame/picture-job";
import { runPictureJob, type Schedule } from "../../server/media/pictures-service";
import { activeStyle, capRemaining, modelForTier, styleTextFor } from "../../visual-frame/pictures";
import { promptFamily } from "../../visual-frame/prompt-compiler";
import { dossierService } from "../../server/dossier";
import { readDmSettings } from "../../server/dm-settings";
import { readProductionSettings } from "../../server/production-configuration";
import { createDmModel } from "../../server/dm/model";
import { dmLoopPinFromProfile, dmLoopProfile } from "../../production/dm-loop-pin";
import { dmModelSpec, dmUsageCost, type DmEffort } from "../../model-runtime/dm-models";
import { hiddenLayerOf, ownerSecretsText, parseNoteValue } from "../../gameplay/dm-loop/private-notes";
import { regionMapOf, type RegionMap, type RegionPrep, type SceneCheck } from "../contracts";
import { live2dView } from "../hierarchy";
import { regionDrawDecision, regionSignature } from "../region";
import { fallbackRegionPrep, mergeRegionPrep, missingFromPrep, regionCanonBody, regionCanonText, regionHiddenKey, regionPaintBrief, regionPlaceIds, regionPrepSource, withCanonParents } from "../region-prep";
import { regionCheckItems, regionMarkers, regionVerdict, type RegionCheckItem } from "../region-marks";
import { checkRegionMap, draftRegionPrep, type TextModel } from "./region-vision";
import { draftSeeds, type Image } from "./vision";
import { boardOf, listSeeds, live2dContext, plantSeed, saveRegionMap, saveRegionMarker, saveRegionPrep, type Live2dContext } from "./store";

// The region map (slice item 1): a stable painted map of the region the party
// travels, drawn once from the places the records know and the atlas layout,
// redrawn when a new place appears (the signature) or on the owner's forced
// «Перерисовать карту региона». With the first map of
// an area the DM's hidden layer gets its seeds (slice item 5): a few latent
// hooks, stored privately, never in the public board.
// Fix S3-accept Д3: the DM designs the region first (the prep, once per region, amended when a place becomes known;
// its public part in the canon, its hidden part in the DM's private notes), then the painter paints from it; the
// check finds each place on the picture and the markers go there (a place inside a settlement into its settlement);
// a redraw paints again from the same prep — the picture changes, the geography never does.

const log = (event: string, data: Record<string, unknown>) => console.info(JSON.stringify({ event, ...data }));
const isRecord = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
const detached: Schedule = (work) => { void work().catch((error) => log("live2d_job_failed", { message: String((error as Error)?.message ?? error).slice(0, 200) })); };

export type RegionDrawResult = { status: "queued" | "existing" | "cap" | "empty" | "drawing"; anchorId: string | null };

export async function drawRegionMap(campaignId: string, value: unknown, schedule: Schedule = detached): Promise<RegionDrawResult> {
  if (!isRecord(value) || (value.anchorId !== null && !isUuid(value.anchorId)) || (value.force !== undefined && typeof value.force !== "boolean")) throw new PersistenceError("validation");
  const anchorId = value.anchorId as string | null;
  const ctx = await live2dContext(campaignId);
  const [snapshot, layout, board] = await Promise.all([readCampaign(campaignId), readMapLayout(campaignId), boardOf(ctx)]);
  if (anchorId && !snapshot.locations.some((row) => row.id === anchorId && row.campaign_id === campaignId)) throw new PersistenceError("not_found");
  const view = live2dView(withCanonParents(snapshot, board.regionMaps), layout.placements, "region", anchorId, snapshot.publicState.current_location_id);
  if (!view.pins.length) return { status: "empty", anchorId };
  const signature = regionSignature(view.pins);
  const existing = regionMapOf(board, anchorId);
  const decision = regionDrawDecision(existing, signature, value.force === true);
  if (decision !== "draw") return { status: decision, anchorId };
  const pictures = await picturesContext(campaignId);
  const pictureBoard = await picturesBoardOf(pictures);
  if (!capRemaining(pictureBoard)) return { status: "cap", anchorId };
  if (!snapshot.timeline) throw new PersistenceError("conflict");
  await saveRegionMap(ctx, { anchorId, pictureId: existing?.pictureId ?? null, signature: existing?.signature ?? "", status: "drawing" });
  log("live2d_region_queued", { campaignId, anchorId, places: view.pins.length, force: value.force === true });
  schedule(() => paintRegion(ctx, pictures, campaignId, anchorId, { signature, force: value.force === true }));
  return { status: "queued", anchorId };
}

/** The paid chain of one region map: the prep (when the region or a place of it is new), the picture from it, the
 * check, one corrected picture on a first draw that missed, the markers; a failure keeps the previous picture. */
async function paintRegion(ctx: Live2dContext, pictures: PicturesContext, campaignId: string, anchorId: string | null, options: { signature: string; force: boolean }) {
  // A failed chain keeps the previous picture with its own verdict (its markers and check stay on the row).
  const restore = (existing: RegionMap | null) => saveRegionMap(ctx, { anchorId, pictureId: existing?.pictureId ?? null, signature: existing?.signature ?? "",
    status: existing?.pictureId ? (existing.sideList.length ? "flagged" : "ready") : "failed" });
  let existing: RegionMap | null = null;
  try {
    const [snapshot, layout, board] = await Promise.all([readCampaign(campaignId), readMapLayout(campaignId), boardOf(ctx)]);
    existing = regionMapOf(board, anchorId);
    const tree = withCanonParents(snapshot, board.regionMaps);
    const view = live2dView(tree, layout.placements, "region", anchorId, snapshot.publicState.current_location_id);
    const placeIds = regionPlaceIds(tree, view.pins.map((pin) => pin.locationId));
    const names = new Map(snapshot.locations.map((row) => [row.id, row.name]));
    const anchor = anchorId ? snapshot.locations.find((row) => row.id === anchorId) ?? null : null;
    const regionName = anchor?.name ?? "";
    let cost = 0;
    // 1. The DM's prep: the stored one; designed (or amended with the places new to it) before the painter starts.
    let prep: RegionPrep | null = existing?.prep ?? null, prepRevision = existing?.prepRevision ?? 0;
    if (missingFromPrep(prep, placeIds).length) {
      const prepared = await prepareRegion(ctx, snapshot, tree, { anchorId, placeIds, existing, names, regionName });
      cost += prepared.costUsdMicros;
      if (prepared.map) { prep = prepared.map.prep; prepRevision = prepared.map.prepRevision; }
    }
    // The records alone stand in for a prep the DM could not write (not saved: the next draw asks again).
    const spots = new Map(view.pins.map((pin) => [pin.locationId, pin.approximate ? null : { x: pin.x, y: pin.y }]));
    const painting = prep ?? fallbackRegionPrep(regionPrepSource(tree, { anchorId, placeIds, hidden: "", existing: null }), spots);
    const items = regionCheckItems(painting, names);
    // 2. The picture from the prep's public text; 3. the check against the prep; one corrected picture on a first draw.
    const apiKey = process.env.ANTHROPIC_API_KEY ?? "";
    const language = snapshot.settings.values.language === "en" ? "en" : "ru";
    const first = await drawRegionOnce(pictures, snapshot, anchorId, view.pins, painting, { names, regionName, signature: options.signature, correction: null });
    cost += first.costUsdMicros;
    if (!first.pictureId || !first.image) {
      await restore(existing);
      log("live2d_region_done", { campaignId, anchorId, status: "failed", error: first.error, totalCostUsdMicros: cost });
      return;
    }
    let pictureId = first.pictureId;
    let checked = await checkRegionMap(apiKey, items, regionName, first.image);
    cost += checked.costUsdMicros;
    let check: SceneCheck | null = checked.check;
    log("live2d_region_check", { campaignId, anchorId, pictureId, ok: !!check, verdict: check ? summary(items, check, language) : null, ms: checked.elapsedMs, costUsdMicros: checked.costUsdMicros, usage: checked.usage, error: checked.error });
    if (check && !regionVerdict(items, check, language).ok && !options.force && !existing?.pictureId) {
      const verdict = regionVerdict(items, check, language);
      const second = await drawRegionOnce(pictures, snapshot, anchorId, view.pins, painting, { names, regionName, signature: options.signature,
        correction: { missing: verdict.missing.map((row) => `${row.description || "a landmark"} (${row.name})`), misplaced: verdict.misplaced.map((row) => `${row.name}${row.within ? ` inside ${names.get(row.within)}` : ""}`), contradictions: verdict.contradictions } });
      cost += second.costUsdMicros;
      if (second.pictureId && second.image) {
        const again = await checkRegionMap(apiKey, items, regionName, second.image);
        cost += again.costUsdMicros;
        log("live2d_region_check", { campaignId, anchorId, pictureId: second.pictureId, redraw: true, ok: !!again.check, verdict: again.check ? summary(items, again.check, language) : null, costUsdMicros: again.costUsdMicros, usage: again.usage, error: again.error });
        // The better of the two stays: fewer misses and misplaced places, then fewer inventions.
        const score = (row: SceneCheck | null) => { if (!row) return 99; const v = regionVerdict(items, row, language); return (v.missing.length + v.misplaced.length) * 10 + v.contradictions.length; };
        if (score(again.check) <= score(check)) { pictureId = second.pictureId; check = again.check; checked = again; }
      }
    }
    // 4. The markers where the check found each place; no check is not a pass (flagged, the prep's spots, approximate).
    const verdict = check ? regionVerdict(items, check, language) : null;
    const markers = regionMarkers(items, check);
    await saveRegionMap(ctx, { anchorId, pictureId, signature: options.signature, status: verdict?.ok ? "ready" : "flagged", markers, check, sideList: verdict?.sideList ?? [],
      picturePrepRevision: prep ? prepRevision : null });
    log("live2d_region_done", { campaignId, anchorId, pictureId, status: verdict?.ok ? "ready" : "flagged", markers: markers.length, onPicture: markers.filter((row) => row.source === "check").length,
      sideList: verdict?.sideList.length ?? 0, checkError: checked.error, prepRevision: prep ? prepRevision : null, totalCostUsdMicros: cost });
    // The hidden layer's seeds for this area, once (never for a redraw that already has them).
    await seedArea(campaignId, anchorId, { name: anchor?.name ?? snapshot.campaign.title, description: anchor?.description ?? snapshot.publicState.summary, canon: prep?.overview ?? "",
      places: view.pins.map((pin) => pin.name), language }).catch((error) => log("live2d_seeds_failed", { campaignId, anchorId, message: String((error as Error)?.message ?? error).slice(0, 200) }));
  } catch (error) {
    log("live2d_region_failed", { campaignId, anchorId, message: String((error as Error)?.message ?? error).slice(0, 200) });
    await restore(existing).catch(() => {});
  }
}
const summary = (items: readonly RegionCheckItem[], check: SceneCheck, language: "ru" | "en") => {
  const verdict = regionVerdict(items, check, language);
  return { found: verdict.found, required: verdict.required, missing: verdict.missing.length, misplaced: verdict.misplaced.length, contradictions: verdict.contradictions.length };
};

/** One quality picture of the region from the prep, and its pixels for the check. */
async function drawRegionOnce(pictures: PicturesContext, snapshot: CampaignSnapshot, anchorId: string | null, pins: readonly { locationId: string; name: string }[], prep: RegionPrep,
  input: { names: ReadonlyMap<string, string>; regionName: string; signature: string; correction: { missing: string[]; misplaced: string[]; contradictions: string[] } | null }) {
  const board = await picturesBoardOf(pictures);
  if (!snapshot.timeline) throw new PersistenceError("conflict");
  const model = modelForTier("quality", board.settings);
  const style = activeStyle(board);
  const family = promptFamily(model) === "gpt-image" ? "gpt" : promptFamily(model) === "flux" ? "flux" : "other";
  const prompt = regionPaintBrief(prep, { regionName: input.regionName, names: input.names, style: styleTextFor(board, snapshot.settings.values.visualStyle), family, correction: input.correction });
  // The picture row's subject: the region place, or — flat — the first place drawn (the map record holds the picture).
  const subjectId = anchorId ?? [...pins].sort((a, b) => a.locationId.localeCompare(b.locationId))[0].locationId;
  const picture = await createPictureRow(pictures, {
    id: randomUUID(), kind: "anchor", subjectKind: "location", subjectId, composition: "region", timeline: snapshot.timeline,
    tier: "quality", trigger: input.correction ? "redraw" : "manual", model, styleVersionId: style?.id ?? null, shot: { signature: input.signature, places: pins.map((pin) => pin.name) }, prompt,
    referenceIds: style?.hasReference ? [style.id] : [],
  });
  const ready = await runPictureJob(pictures, picture.id);
  if (!ready || ready.status !== "ready") return { pictureId: null, image: null as Image | null, costUsdMicros: ready?.costUsdMicros ?? 0, error: ready?.error ?? "failed" };
  const row = await privatePicture(pictures, picture.id);
  const image = row.storagePath ? await pictures.storage.get(row.storagePath) : null;
  return { pictureId: picture.id, image, costUsdMicros: ready.costUsdMicros, error: image ? null : "no pixels" };
}

/** The DM's model for the prep: the campaign's own DM («dm.turn» profile) at medium effort, one text request. */
async function dmTextModel(campaignId: string): Promise<TextModel> {
  const [settings, production] = await Promise.all([readDmSettings(campaignId), readProductionSettings(campaignId)]);
  const pin = dmLoopPinFromProfile(dmLoopProfile(production.runtimePolicy, settings.split?.writer ?? settings.dmTurn));
  const spec = dmModelSpec(pin.providerId, pin.modelId);
  const effort: DmEffort = spec?.reasoning.includes("medium") ? "medium" : pin.effort;
  const model = createDmModel(pin);
  return async (request) => {
    let text = "";
    let usage: Parameters<typeof dmUsageCost>[1] | null = null;
    for await (const event of model.stream({ system: [{ text: request.system, cache: false }], messages: [{ role: "user", text: request.user }], toolset: null, effort,
      maxOutputTokens: request.maxOutputTokens, operationId: randomUUID(), cacheKey: campaignId })) {
      if (event.type === "text_delta") text += event.text;
      else if (event.type === "usage") usage = event.usage;
    }
    return { text, usage: usage ? { inputTokens: usage.inputTokens, outputTokens: usage.outputTokens } : null, costUsdMicros: usage && spec ? Math.round(dmUsageCost(spec, usage) * 1_000_000) : 0, model: pin.modelId };
  };
}

/** The DM designs the region (or the places new to it): the public part into the canon document and onto the map,
 * the hidden part into the DM's private notes. Failure-safe: a failed call leaves the map's prep as it was. */
export async function prepareRegion(ctx: Live2dContext, snapshot: CampaignSnapshot, tree: CampaignSnapshot,
  input: { anchorId: string | null; placeIds: readonly string[]; existing: RegionMap | null; names: ReadonlyMap<string, string>; regionName: string }) {
  const { anchorId, existing } = input;
  const language = snapshot.settings.values.language === "en" ? "en" : "ru";
  const dossier = await dossierService(ctx.ownerId, ctx.campaignId);
  // DM-only reading: the hidden layer and the owner's secrets keep the geography consistent with them.
  let hidden = "", hiddenBefore = "";
  try {
    const source = await dossier.source();
    hidden = [hiddenLayerOf(source), ownerSecretsText(source)].filter(Boolean).join("\n\n");
    const fact = source.privateState.fact;
    hiddenBefore = fact && typeof fact === "object" && !Array.isArray(fact) ? parseNoteValue((fact as Record<string, unknown>)[regionHiddenKey(anchorId)]).text : "";
  } catch (error) {
    log("live2d_region_prep_source_failed", { campaignId: ctx.campaignId, anchorId, message: String((error as Error)?.message ?? error).slice(0, 200) });
  }
  const source = regionPrepSource(tree, { anchorId, placeIds: input.placeIds, hidden, existing: existing?.prep ?? null });
  let model: TextModel;
  try { model = await dmTextModel(ctx.campaignId); } catch (error) {
    log("live2d_region_prep", { campaignId: ctx.campaignId, anchorId, ok: false, error: String((error as Error)?.message ?? error).slice(0, 120) });
    return { map: null, costUsdMicros: 0 };
  }
  const result = await draftRegionPrep(model, source);
  // The prep's text is the DM's; the log names its size, never its content.
  log("live2d_region_prep", { campaignId: ctx.campaignId, anchorId, ok: !!result.draft, amend: !!existing?.prep, model: result.model, places: result.draft?.prep.places.length ?? 0,
    routes: result.draft?.prep.routes.length ?? 0, hiddenChars: result.draft?.hidden.length ?? 0, chars: result.chars, ms: result.elapsedMs, costUsdMicros: result.costUsdMicros, usage: result.usage, error: result.error });
  if (!result.draft) return { map: null, costUsdMicros: result.costUsdMicros };
  const prep = existing?.prep ? mergeRegionPrep(existing.prep, result.draft.prep) : result.draft.prep;
  // The canon document (public; versioned like every document): written once, a new version on an amend.
  let documentId: string | null = null;
  try { documentId = await writeRegionCanon(snapshot, existing, prep, input.names, { regionName: input.regionName, language }); }
  catch (error) { log("live2d_region_canon_failed", { campaignId: ctx.campaignId, anchorId, message: String((error as Error)?.message ?? error).slice(0, 200) }); }
  // The hidden part: the DM's private notes only — never the board, the canon, the painter or a marker.
  if (result.draft.hidden && snapshot.timeline) {
    const value = [hiddenBefore, result.draft.hidden].filter(Boolean).join("\n").slice(-6000);
    await dossier.privateNotes({ set: [{ kind: "fact", key: regionHiddenKey(anchorId), value }], remove: [] }, snapshot.timeline)
      .catch((error) => log("live2d_region_hidden_failed", { campaignId: ctx.campaignId, anchorId, message: String((error as Error)?.message ?? error).slice(0, 200) }));
  }
  const map = await saveRegionPrep(ctx, { anchorId, prep, documentId, expectedRevision: existing?.prepRevision ?? 0, source: "model" });
  return { map, costUsdMicros: result.costUsdMicros };
}

/** The prep's public text as a canon document of the campaign: the DM reads it every turn among the world's facts,
 * the owner reads and corrects it in the Library. An archived document is the owner's decision and stays archived. */
async function writeRegionCanon(snapshot: CampaignSnapshot, existing: RegionMap | null, prep: RegionPrep, names: ReadonlyMap<string, string>, input: { regionName: string; language: "ru" | "en" }): Promise<string | null> {
  if (!snapshot.timeline) return null;
  const doc = existing?.prepDocumentId ? snapshot.documents.find((row) => row.id === existing.prepDocumentId) ?? null : null;
  if (doc?.status === "archived") return doc.id;
  const text = regionCanonText(prep, names, input);
  const body = regionCanonBody(doc?.body ?? null, existing?.prep ?? null, prep, names, input);
  if (doc && doc.body === body) return doc.id;
  const saved = await applyMutation({ requestId: randomUUID(), operation: "document.save", campaignId: snapshot.campaign.id, expectedRevision: doc?.revision ?? 0,
    timeline: snapshot.timeline, correctionScope: "campaign", payload: { ...(doc ? { id: doc.id } : {}), title: doc?.title ?? text.title, status: "canon", body } });
  return saved.id;
}

/** «Изменить размещение» on the painted region: the owner puts a marker on its object (the highest authority). */
export async function saveOwnerRegionMarker(campaignId: string, value: unknown) {
  const unit = (v: unknown) => typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= 1;
  if (!isRecord(value) || (value.anchorId !== null && !isUuid(value.anchorId)) || !isUuid(value.locationId) || !unit(value.x) || !unit(value.y) || !Number.isSafeInteger(value.expectedRevision))
    throw new PersistenceError("validation");
  const ctx = await live2dContext(campaignId);
  return saveRegionMarker(ctx, { anchorId: value.anchorId, locationId: value.locationId, x: Number((value.x as number).toFixed(3)), y: Number((value.y as number).toFixed(3)), expectedRevision: value.expectedRevision });
}

/** Plant the area's latent hooks when it has none: private DM notes in the `poi_seed_<area>_<n>` form. */
export async function seedArea(campaignId: string, anchorId: string | null, input: { name: string; description: string; canon?: string; places: string[]; language: "ru" | "en" }) {
  const ctx = await live2dContext(campaignId);
  const existing = await listSeeds(ctx);
  if (existing.some((row) => row.areaLocationId === anchorId)) return { status: "existing" as const, count: existing.filter((row) => row.areaLocationId === anchorId).length };
  const drafted = await draftSeeds(process.env.ANTHROPIC_API_KEY ?? "", { areaName: input.name, description: input.description, canon: input.canon ?? "", places: input.places, language: input.language });
  log("live2d_seeds", { campaignId, anchorId, count: drafted.seeds.length, ms: drafted.elapsedMs, costUsdMicros: drafted.costUsdMicros, usage: drafted.usage, error: drafted.error });
  const area = (anchorId ?? "known").replace(/[^a-z0-9]/gi, "").slice(0, 12).toLowerCase() || "known";
  let planted = 0;
  for (const [index, seed] of drafted.seeds.entries()) {
    const row = await plantSeed(ctx, { id: crypto.randomUUID(), areaLocationId: anchorId, key: `poi_seed_${area}_${index + 1}`, theme: seed.theme, premise: seed.premise });
    if (row) planted += 1;
  }
  return { status: "planted" as const, count: planted, costUsdMicros: drafted.costUsdMicros };
}
