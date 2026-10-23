import "server-only";
import { readCampaign } from "../../server/repository";
import { readPlay, readWorldClock } from "../../server/gameplay-service";
import { PersistenceError } from "../../server/errors";
import { isUuid } from "../../persistence/validation";
import type { CampaignSnapshot } from "../../persistence/contracts";
import { boardOf as picturesBoardOf, picturesContext, type PicturesContext } from "../../server/media/pictures-store";
import { createPictureRow, privatePicture } from "../../visual-frame/picture-job";
import { runPictureJob, type Schedule } from "../../server/media/pictures-service";
import { activeStyle, anchorFor, capRemaining, modelForTier, styleTextFor } from "../../visual-frame/pictures";
import { timeOfDay } from "../../visual-frame/prompt-compiler";
import type { Live2dBoard, SceneCheck, SceneSheet, SheetFeature } from "../contracts";
import { parseSceneSheet, sceneOf } from "../contracts";
import { fallbackSheet, joinConcurrentPrepare, placePois, poiCandidates, sceneBrief, sceneVerdict, SHEET_MIN_FEATURES, sheetLanguageOf, sheetSourceOf, sideListOf } from "../scene";
import { buildSheet, checkScene, locateScene, type Image } from "./vision";
import { redoSceneLanguage } from "./scene-language-job";
import { boardOf, live2dContext, replacePois, saveScene, updateScene, type Live2dContext } from "./store";

// The scene of a place (slice item 3 and the quality rules): the records come
// first (the sheet), then one picture on the quality tier without people, then
// the strong vision check; a miss or a contradiction earns one corrected redraw;
// still wrong → flagged for the owner with the misses as a side list; the cheap
// locator places only the records' POIs. A request answers at once and the paid
// work runs after the response; nothing here retries in a loop.

const log = (event: string, data: Record<string, unknown>) => console.info(JSON.stringify({ event, ...data }));
const isRecord = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
const detached: Schedule = (work) => { void work().catch((error) => log("live2d_job_failed", { message: String((error as Error)?.message ?? error).slice(0, 200) })); };

/** Who is present now, by the play configuration (public), when it can be read. */
async function presentIds(campaignId: string): Promise<string[] | null> {
  try {
    const play = await readPlay(campaignId);
    return play.configuration?.presentEntityIds ?? null;
  } catch {
    return null;
  }
}

export type PrepareResult = { status: "queued" | "existing" | "cap" | "not_visited" | "drawing"; locationId: string };

/** The sheet from the records and the public narration by the model (the rule of 5–8 hotspots in the campaign's
 * language, scene.ts), else the records alone; `model` says which. */
async function writeSheet(campaignId: string, snapshot: CampaignSnapshot, locationId: string) {
  const [present, clock] = await Promise.all([presentIds(campaignId), readWorldClock(campaignId).catch(() => ({ worldMinutes: null }))]);
  const source = sheetSourceOf(snapshot, locationId, { presentIds: present ?? undefined, timeOfDay: timeOfDay(clock.worldMinutes) });
  if (!source) throw new PersistenceError("not_found");
  const built = await buildSheet(process.env.ANTHROPIC_API_KEY ?? "", source);
  log("live2d_sheet", { campaignId, locationId, ok: !!built.sheet, ms: built.elapsedMs, costUsdMicros: built.costUsdMicros, usage: built.usage, error: built.error, features: built.sheet?.features.length ?? 0, asks: built.asks ?? 0, language: built.sheet?.language ?? null });
  return { sheet: built.sheet ?? fallbackSheet(source), costUsdMicros: built.costUsdMicros, model: !!built.sheet };
}

/** «Подготовить сцену»: the sheet now (the records and the narration), the picture, the check and the
 * markers after the response. A place is drawn only once it was visited; a second call on a place
 * with a scene returns it unless `force`. */
export async function prepareScene(campaignId: string, value: unknown, schedule: Schedule = detached): Promise<PrepareResult> {
  if (!isRecord(value) || !isUuid(value.locationId) || (value.force !== undefined && typeof value.force !== "boolean")) throw new PersistenceError("validation");
  const locationId = value.locationId;
  const ctx = await live2dContext(campaignId);
  const snapshot = await readCampaign(campaignId);
  const place = snapshot.locations.find((row) => row.id === locationId && row.campaign_id === campaignId);
  if (!place) throw new PersistenceError("not_found");
  if (place.status !== "visited") return { status: "not_visited", locationId };
  const board = await boardOf(ctx);
  const existing = sceneOf(board, locationId);
  if (existing?.status === "drawing") return { status: "drawing", locationId };
  if (existing && existing.pictureId && value.force !== true) return { status: "existing", locationId };
  const pictures = await picturesContext(campaignId);
  const pictureBoard = await picturesBoardOf(pictures);
  if (!capRemaining(pictureBoard)) return { status: "cap", locationId };
  // The sheet: a model from the records and the public narration, else the records alone.
  let sheet: SceneSheet, sheetCost = 0;
  if (existing && value.force === true && existing.sheet.features.length) {
    sheet = existing.sheet;
  } else {
    const written = await writeSheet(campaignId, snapshot, locationId);
    sheet = written.sheet;
    sheetCost = written.costUsdMicros;
  }
  let saved = existing && (value.force === true && existing.sheet.features.length) ? existing : null;
  if (!saved) {
    const outcome = await joinConcurrentPrepare(
      () => saveScene(ctx, { locationId, sheet, source: "model", expectedRevision: existing ? existing.revision : null }),
      async () => sceneOf(await boardOf(ctx), locationId));
    if ("joined" in outcome) return { status: "drawing", locationId };
    saved = outcome.saved;
  }
  await updateScene(ctx, { locationId, status: "drawing", error: null });
  const sheetToDraw = saved.sheet;
  schedule(() => drawAndCheck(ctx, pictures, campaignId, locationId, sheetToDraw, { comment: null, redraws: 0, extraCostUsdMicros: sheetCost }));
  return { status: "queued", locationId };
}

/** «Перерисовать» with the owner's comment: the same chain, the comment in the brief, one more picture. */
export async function redrawScene(campaignId: string, value: unknown, schedule: Schedule = detached): Promise<PrepareResult> {
  if (!isRecord(value) || !isUuid(value.locationId) || (value.comment !== undefined && value.comment !== null && (typeof value.comment !== "string" || value.comment.length > 300))) throw new PersistenceError("validation");
  const locationId = value.locationId;
  const ctx = await live2dContext(campaignId);
  const board = await boardOf(ctx);
  const existing = sceneOf(board, locationId);
  if (!existing) throw new PersistenceError("not_found");
  if (existing.status === "drawing") return { status: "drawing", locationId };
  const pictures = await picturesContext(campaignId);
  if (!capRemaining(await picturesBoardOf(pictures))) return { status: "cap", locationId };
  // Fix S3-accept Б3: a sheet written before the rule with fewer hotspots than its minimum gets a new one from the model
  // first — the picture is new anyway, so the new hotspots are drawn into it (the old sheet stays in the versions).
  let sheet = existing.sheet, sheetCost = 0;
  if (existing.sheet.features.length < SHEET_MIN_FEATURES) {
    const written = await writeSheet(campaignId, await readCampaign(campaignId), locationId);
    sheetCost = written.costUsdMicros;
    if (written.model && written.sheet.features.length > existing.sheet.features.length)
      sheet = (await saveScene(ctx, { locationId, sheet: written.sheet, source: "model", expectedRevision: existing.revision })).sheet;
  }
  await updateScene(ctx, { locationId, status: "drawing", error: null });
  const comment = typeof value.comment === "string" && value.comment.trim() ? value.comment.trim() : null;
  schedule(() => drawAndCheck(ctx, pictures, campaignId, locationId, sheet, { comment, redraws: existing.redraws + 1, extraCostUsdMicros: sheetCost }));
  return { status: "queued", locationId };
}

/** Fix S3-accept Б2: the 2D screen's read of the board redoes, once, the text of the sheets written in plain English
 * before the rule (scene-language-job.ts) — off the turn's path; the read waits for it a few seconds at most so the
 * owner sees the hotspots in the campaign's language on the first look, and any failure returns the board as it is.
 * Each scene revision is examined once per server process; a redone sheet carries its `language` and is never due again. */
const languageExamined = new Set<string>();
export async function readBoardInLanguage(campaignId: string, waitMs = 12_000): Promise<Live2dBoard> {
  const ctx = await live2dContext(campaignId);
  const board = await boardOf(ctx);
  const mark = (scene: { locationId: string; revision: number }) => `${campaignId}:${scene.locationId}:${scene.revision}`;
  const due = board.scenes.filter((scene) => !scene.sheet.language && scene.status !== "drawing" && !languageExamined.has(mark(scene)));
  if (!due.length) return board;
  for (const scene of due) languageExamined.add(mark(scene));
  try {
    const snapshot = await readCampaign(campaignId);
    const language = sheetLanguageOf(snapshot);
    const apiKey = process.env.ANTHROPIC_API_KEY ?? "";
    const work = Promise.all(due.map(async (scene) => {
      const result = await redoSceneLanguage(board, scene.locationId, { rpc: ctx.rpc, apiKey, language, placeName: snapshot.locations.find((row) => row.id === scene.locationId)?.name ?? "" });
      if (result.status !== "skipped" || result.reason !== "in_language") log("live2d_scene_language", { campaignId, locationId: scene.locationId, ...result });
      return result.status === "redone";
    }));
    let timer: ReturnType<typeof setTimeout> | undefined;
    const waited = new Promise<null>((resolve) => { timer = setTimeout(() => resolve(null), waitMs); });
    const redone = await Promise.race([work.then((rows) => rows.some(Boolean)), waited]).finally(() => clearTimeout(timer));
    return redone ? await boardOf(ctx) : board;
  } catch (error) {
    log("live2d_scene_language", { campaignId, status: "failed", reason: String((error as Error)?.message ?? error).slice(0, 200) });
    return board;
  }
}

/** The owner's edit of the sheet (summary, light, never, the features' labels and must-show flags). */
export async function saveSheet(campaignId: string, value: unknown) {
  if (!isRecord(value) || !isUuid(value.locationId) || !Number.isSafeInteger(value.expectedRevision)) throw new PersistenceError("validation");
  const sheet = parseSceneSheet(value.sheet);
  if (!sheet || !sheet.features.length) throw new PersistenceError("validation");
  const ctx = await live2dContext(campaignId);
  return saveScene(ctx, { locationId: value.locationId, sheet, source: "owner", expectedRevision: value.expectedRevision });
}

type DrawOptions = { comment: string | null; redraws: number; extraCostUsdMicros: number };

/** The paid chain of one scene: picture → check → (one corrected redraw) → status, side list, POIs. */
export async function drawAndCheck(ctx: Live2dContext, pictures: PicturesContext, campaignId: string, locationId: string, sheet: SceneSheet, options: DrawOptions) {
  const apiKey = process.env.ANTHROPIC_API_KEY ?? "";
  try {
    const snapshot = await readCampaign(campaignId);
    const place = snapshot.locations.find((row) => row.id === locationId);
    if (!place) throw new PersistenceError("not_found");
    const first = await drawOnce(pictures, snapshot, locationId, sheet, { correction: null, comment: options.comment });
    let pictureId = first.pictureId, check: SceneCheck | null = null, redraws = options.redraws, cost = options.extraCostUsdMicros + first.costUsdMicros;
    if (!first.pictureId || !first.image) {
      await updateScene(ctx, { locationId, status: "failed", error: (first.error ?? "picture failed").slice(0, 200), redraws });
      log("live2d_scene_failed", { campaignId, locationId, error: first.error });
      return;
    }
    let image = first.image;
    const checked = await checkScene(apiKey, sheet, place.name, image);
    cost += checked.costUsdMicros;
    check = checked.check;
    log("live2d_check", { campaignId, locationId, pictureId, ok: !!checked.check, verdict: checked.check ? sceneVerdict(sheet, checked.check) : null, ms: checked.elapsedMs, costUsdMicros: checked.costUsdMicros, usage: checked.usage, error: checked.error });
    // One corrected redraw when the check found a miss or a contradiction (never on a redraw with the owner's comment: the owner's picture stands, flagged if wrong).
    if (check && !sceneVerdict(sheet, check).ok && options.comment === null && redraws === 0) {
      const verdict = sceneVerdict(sheet, check);
      const second = await drawOnce(pictures, snapshot, locationId, sheet, { correction: { missing: verdict.missing, contradictions: [...verdict.contradictions, ...(verdict.people ? ["people or faces"] : [])] }, comment: null });
      cost += second.costUsdMicros;
      redraws += 1;
      if (second.pictureId && second.image) {
        const again = await checkScene(apiKey, sheet, place.name, second.image);
        cost += again.costUsdMicros;
        log("live2d_check", { campaignId, locationId, pictureId: second.pictureId, redraw: true, ok: !!again.check, verdict: again.check ? sceneVerdict(sheet, again.check) : null, ms: again.elapsedMs, costUsdMicros: again.costUsdMicros, usage: again.usage, error: again.error });
        // The better of the two stays: fewer misses, then fewer contradictions.
        const score = (c: SceneCheck | null) => (c ? sceneVerdict(sheet, c).missing.length * 10 + sceneVerdict(sheet, c).contradictions.length + (c.peopleInBackground ? 5 : 0) : 99);
        if (score(again.check) <= score(check)) { pictureId = second.pictureId; image = second.image; check = again.check; }
      }
    }
    // No check (the model failed or answered unreadably) is not a pass: the scene is flagged for the owner.
    const verdict = check ? sceneVerdict(sheet, check) : null;
    const status = verdict?.ok ? "checked" : "flagged";
    const sideList = sideListOf(sheet, check);
    await updateScene(ctx, { locationId, status, pictureId, check, sideList, redraws, error: !check ? `check: ${checked.error ?? "unavailable"}`.slice(0, 200) : null });
    // The markers: the records' POIs placed by the cheap locator (the check's own positions serve the must-show items).
    const present = await presentIds(campaignId);
    const candidates = poiCandidates(sheet, snapshot, locationId, present);
    const located = await locateScene(apiKey, candidates, place.name, image);
    cost += located.costUsdMicros;
    const now = new Date().toISOString();
    const pois = placePois(candidates, located.located, check, { id: () => crypto.randomUUID(), now, locationId });
    await replacePois(ctx, { locationId, pois: pois.map((row) => ({ id: row.id, key: row.key, kind: row.kind, label: row.label, note: row.note, entityId: row.entityId, targetLocationId: row.targetLocationId,
      x: row.x, y: row.y, confidence: row.confidence, approximate: row.approximate, source: row.source, hidden: row.hidden })) });
    log("live2d_scene_ready", { campaignId, locationId, pictureId, status, redraws, sideList, pois: pois.length, placed: pois.filter((row) => row.x !== null).length, approximate: pois.filter((row) => row.approximate).length,
      locatorMs: located.elapsedMs, locatorCostUsdMicros: located.costUsdMicros, locatorError: located.error, totalCostUsdMicros: cost });
  } catch (error) {
    log("live2d_scene_failed", { campaignId, locationId, message: String((error as Error)?.message ?? error).slice(0, 200) });
    await updateScene(ctx, { locationId, status: "failed", error: String((error as Error)?.message ?? error).slice(0, 200) }).catch(() => {});
  }
}

/** One picture of the scene on the quality tier (no people in the background) and its pixels. */
async function drawOnce(pictures: PicturesContext, snapshot: CampaignSnapshot, locationId: string, sheet: SceneSheet, input: { correction: { missing: SheetFeature[]; contradictions: string[] } | null; comment: string | null }) {
  const place = snapshot.locations.find((row) => row.id === locationId)!;
  const board = await picturesBoardOf(pictures);
  if (!snapshot.timeline) throw new PersistenceError("conflict");
  const model = modelForTier("quality", board.settings);
  const style = activeStyle(board);
  const styleText = styleTextFor(board, snapshot.settings.values.visualStyle);
  // The place's own illustration (if any) is the reference, so the scene and the turn's frames agree.
  const placeAnchor = anchorFor(board, { kind: "location", id: locationId }, "location").picture;
  const referenceIds = [...(style?.hasReference ? [style.id] : []), ...(placeAnchor ? [placeAnchor.id] : [])].slice(0, 2);
  const prompt = [sceneBrief(sheet, { placeName: place.name, style: styleText, correction: input.correction }),
    referenceIds.length ? `References: ${style?.hasReference ? "the first reference image sets the art style" : ""}${placeAnchor ? `${style?.hasReference ? "; " : ""}a reference shows this place as drawn before: keep its layout, materials and light` : ""}.` : "",
    input.comment ? `The owner asks: ${input.comment.slice(0, 300)}` : ""].filter(Boolean).join("\n").slice(0, 8000);
  const picture = await createPictureRow(pictures, {
    id: crypto.randomUUID(), kind: "anchor", subjectKind: "location", subjectId: locationId, composition: "scene", timeline: snapshot.timeline,
    tier: "quality", trigger: input.comment || input.correction ? "redraw" : "manual", model, styleVersionId: style?.id ?? null,
    shot: { sheet, correction: input.correction, comment: input.comment }, prompt, referenceIds,
  });
  const ready = await runPictureJob(pictures, picture.id);
  if (!ready || ready.status !== "ready") return { pictureId: null, image: null as Image | null, costUsdMicros: ready?.costUsdMicros ?? 0, error: ready?.error ?? "failed" };
  const row = await privatePicture(pictures, picture.id);
  const image = row.storagePath ? await pictures.storage.get(row.storagePath) : null;
  return { pictureId: picture.id, image, costUsdMicros: ready.costUsdMicros, error: image ? null : "no pixels" };
}
