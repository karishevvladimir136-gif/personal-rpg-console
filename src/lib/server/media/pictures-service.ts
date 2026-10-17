import "server-only";
import { readCampaign } from "../repository";
import { readTurn } from "../gameplay-service";
import { subscribeLiveTurn } from "../dm/live-turns";
import { PersistenceError } from "../errors";
import { isUuid } from "../../persistence/validation";
import type { CampaignSnapshot } from "../../persistence/contracts";
import { falSubjectPrompt } from "../../visual-frame/fal-image";
import {
  activeStyle,
  anchorFor,
  capRemaining,
  compositionForEntity,
  COMPOSITIONS,
  framesOfTurn,
  modelForTier,
  planAutopilot,
  referencesForAnchor,
  referencesForShot,
  restylePlan,
  styleTextFor,
  type PictureBoard,
  type PictureComposition,
  type PictureSubject,
  type PictureTier,
  type PictureTrigger,
  type PublicPicture,
} from "../../visual-frame/pictures";
import { fallbackShot, firstParagraph, framePrompt, shotEntityIds, type Shot, type ShotContext } from "../../visual-frame/shot";
import { visualDocuments } from "../../visual-frame/model";
import { buildShot } from "./shot-model";
import { boardOf, picturesContext, type PicturesContext } from "./pictures-store";
import { createPictureRow, runPictureJob as runJob } from "../../visual-frame/picture-job";

// The Stage V frame engine. A turn never waits for a picture: every request
// creates a queued row, answers at once, and the paid work runs after the
// response. A shot is built only from narration the player has already
// received (the public live-turn registry or the committed public turn),
// never from the DM's context. Nothing here retries in a loop: one picture,
// one fal request, at most one softened re-submit after a content refusal.

export type Schedule = (work: () => Promise<unknown>) => void;
const detached: Schedule = (work) => {
  void work().catch((error) => console.error(JSON.stringify({ event: "picture_job_failed", message: String((error as Error)?.message ?? error).slice(0, 200) })));
};
const isRecord = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
const log = (event: string, data: Record<string, unknown>) => console.info(JSON.stringify({ event, ...data }));

export type FrameRequestResult =
  | { status: "queued" | "existing"; picture: PublicPicture }
  | { status: "waiting" | "off" | "cap" | "no_text" };

/** The public text of a turn: the live registry while it streams, the committed turn after. */
async function turnText(campaignId: string, operationId: string): Promise<{ text: string; finished: boolean; changes: { name: string; ok: boolean; summary: string }[] }> {
  let text = "";
  let finished = false;
  const changes: { name: string; ok: boolean; summary: string }[] = [];
  const unsubscribe = subscribeLiveTurn(operationId, (event) => {
    if (event.type === "text") text += event.text;
    else if (event.type === "tool") changes.push({ name: event.name, ok: event.ok, summary: event.summary });
    else if (event.type === "status" && event.status !== "generating") finished = true;
  });
  unsubscribe();
  if (!text.trim()) {
    const turn = await readTurn(campaignId, operationId);
    if (turn.narration) return { text: turn.narration, finished: true, changes };
  }
  return { text, finished, changes };
}
function paragraphFor(trigger: PictureTrigger, text: string, finished: boolean) {
  if (trigger === "key_moment") {
    const paragraphs = text.trim().split(/\n\s*\n/).map((row) => row.trim()).filter(Boolean);
    return paragraphs.length ? firstParagraph(paragraphs.at(-1)!, true) : null;
  }
  return firstParagraph(text, finished);
}
const nameMatches = (recordName: string, shotName: string) => shotEntityIds({ who: [shotName], action: "", where: "", angle: "", mood: "" }, [{ id: "x", name: recordName }]).length > 0;
/** Public appearance of a record: its details plus the owner-approved visual reference text, if any. */
function appearanceOf(snapshot: CampaignSnapshot, entityId: string) {
  const entity = snapshot.entities.find((row) => row.id === entityId);
  const reference = visualDocuments(snapshot).find(({ value }) => value.kind === "reference" && value.approval === "approved" &&
    value.subject.kind === "entity" && value.subject.id === entityId)?.value;
  const guidance = reference && reference.kind === "reference" ? [reference.appearance, reference.outfit].filter(Boolean).join(" ") : "";
  return [guidance, entity?.details ?? ""].filter(Boolean).join(" ").slice(0, 400);
}
function shotContext(snapshot: CampaignSnapshot): ShotContext {
  const hero = snapshot.entities.find((row) => row.kind === "player") ?? null;
  const place = snapshot.locations.find((row) => row.id === snapshot.publicState.current_location_id) ?? null;
  return {
    heroName: hero?.name ?? null,
    names: snapshot.entities.filter((row) => row.id !== hero?.id && ["companion", "npc", "transport", "mount"].includes(row.kind)).map((row) => row.name).slice(0, 40),
    placeName: place?.name ?? null,
    language: snapshot.settings.values.language === "en" ? "en" : "ru",
  };
}

/** A frame for one turn. `live` while the narration streams (needs the first paragraph),
 * `committed` after a reload, `key_moment` once the turn is saved (better model), `redraw` by the owner. */
export async function requestFrame(campaignId: string, value: unknown, schedule: Schedule = detached): Promise<FrameRequestResult> {
  if (!isRecord(value) || !isUuid(value.operationId) || !["live", "committed", "key_moment", "redraw"].includes(String(value.trigger)))
    throw new PersistenceError("validation");
  const operationId = value.operationId;
  const trigger = value.trigger as "live" | "committed" | "key_moment" | "redraw";
  const ctx = await picturesContext(campaignId);
  const board = await boardOf(ctx);
  const frames = board.settings.frames;
  if (trigger !== "redraw" && (frames === "off" || (frames === "key" && trigger !== "key_moment"))) return { status: "off" };
  const existing = framesOfTurn(board, operationId);
  if (trigger !== "redraw") {
    const same = existing.filter((row) => row.status !== "failed" && (trigger === "key_moment" ? row.trigger === "key_moment" : row.trigger !== "key_moment"));
    if (same.length) return { status: "existing", picture: same.at(-1)! };
  }
  if (!capRemaining(board)) return { status: "cap" };
  const { text, finished } = await turnText(campaignId, operationId);
  const paragraph = paragraphFor(trigger, text, finished);
  if (!paragraph) return { status: text.trim() ? "waiting" : "no_text" };
  const snapshot = await readCampaign(campaignId);
  if (!snapshot.timeline) throw new PersistenceError("conflict");
  const context = shotContext(snapshot);
  const built = await buildShot(process.env.ANTHROPIC_API_KEY ?? "", paragraph, context);
  const shot: Shot = built.shot ?? fallbackShot(paragraph, context);
  const tier: PictureTier = trigger === "key_moment" ? "quality" : board.settings.quality;
  const model = modelForTier(tier);
  const entityIds = shotEntityIds(shot, snapshot.entities);
  const referenceIds = referencesForShot(board, { entityIds, locationId: snapshot.publicState.current_location_id, model });
  const place = snapshot.locations.find((row) => row.id === snapshot.publicState.current_location_id) ?? null;
  const people = entityIds.map((id) => snapshot.entities.find((row) => row.id === id)?.name ?? "").filter(Boolean);
  const style = activeStyle(board);
  const appearance = Object.fromEntries(shot.who.map((name) => {
    const entity = snapshot.entities.find((row) => nameMatches(row.name, name));
    return [name, entity ? appearanceOf(snapshot, entity.id) : ""];
  }));
  const prompt = framePrompt(shot, styleTextFor(board, snapshot.settings.values.visualStyle), {
    people, place: referenceIds.length && place && anchorFor(board, { kind: "location", id: place.id }, "location").picture ? place.name : null, style: !!style?.hasReference,
  }, appearance);
  const picture = await createPictureRow(ctx, {
    id: crypto.randomUUID(), kind: "frame", subjectKind: "turn", subjectId: operationId, composition: "frame", timeline: snapshot.timeline,
    tier, trigger, model, styleVersionId: style?.id ?? null,
    shot: { ...shot, meta: { source: built.source, model: built.source === "model" ? "claude-haiku-5-5" : null, usage: built.usage, costUsdMicros: built.costUsdMicros, elapsedMs: built.elapsedMs, error: built.error, paragraphChars: paragraph.length } },
    prompt, referenceIds,
  });
  log("picture_frame_queued", { campaignId, operationId, pictureId: picture.id, trigger, tier, model, references: referenceIds.length, shotSource: built.source, shotMs: built.elapsedMs });
  schedule(() => runPictureJob(ctx, picture.id, { extraCostUsdMicros: built.costUsdMicros }));
  return { status: "queued", picture };
}

/** An anchor of a record: the autopilot's next picture, «Перерисовать», or a restyle. */
export async function requestAnchor(campaignId: string, value: unknown, schedule: Schedule = detached) {
  if (!isRecord(value) || !isRecord(value.subject) || !["entity", "item", "location"].includes(String(value.subject.kind)) || !isUuid(value.subject.id) ||
    !["redraw", "autopilot", "restyle", "manual"].includes(String(value.trigger)) || (value.composition !== undefined && !COMPOSITIONS.includes(value.composition as PictureComposition)))
    throw new PersistenceError("validation");
  const ctx = await picturesContext(campaignId);
  const board = await boardOf(ctx);
  const snapshot = await readCampaign(campaignId);
  const subject = { kind: value.subject.kind, id: value.subject.id } as PictureSubject;
  const picture = await queueAnchor(ctx, board, snapshot, subject, value.composition as PictureComposition | undefined, value.trigger as PictureTrigger,
    value.tier === "quality" || value.tier === "fast" ? value.tier : null);
  if (!picture) return { status: "cap" as const };
  schedule(() => runPictureJob(ctx, picture.id));
  return { status: "queued" as const, picture };
}

async function queueAnchor(ctx: PicturesContext, board: PictureBoard, snapshot: CampaignSnapshot, subject: PictureSubject, composition: PictureComposition | undefined,
  trigger: PictureTrigger, tier: PictureTier | null) {
  if (!snapshot.timeline) throw new PersistenceError("conflict");
  if (!capRemaining(board)) return null;
  let name = "", description = "", chosen: PictureComposition;
  if (subject.kind === "entity") {
    const row = snapshot.entities.find((entity) => entity.id === subject.id);
    if (!row) throw new PersistenceError("not_found");
    const worn = snapshot.items.filter((item) => item.equipped_entity_id === row.id && item.quantity > 0).map((item) => item.name).slice(0, 12);
    name = row.name;
    description = [appearanceOf(snapshot, row.id), worn.length ? `Visible equipment: ${worn.join(", ")}.` : ""].filter(Boolean).join("\n");
    chosen = composition && ["portrait", "figure", "holding"].includes(composition) ? composition : compositionForEntity(row);
  } else if (subject.kind === "item") {
    const row = snapshot.items.find((item) => item.id === subject.id);
    if (!row) throw new PersistenceError("not_found");
    name = row.name; description = row.description; chosen = "item";
  } else {
    const row = snapshot.locations.find((location) => location.id === subject.id);
    if (!row || !["known", "visited"].includes(row.status)) throw new PersistenceError("not_found");
    name = row.name; description = row.description; chosen = "location";
  }
  // Owner's rule: best quality wherever it does not hurt the live feel — anchors are drawn on the
  // quality tier unless the caller (a fast restyle) asks for the fast one.
  const pickedTier: PictureTier = tier ?? "quality";
  const model = modelForTier(pickedTier);
  const style = activeStyle(board);
  const referenceIds = referencesForAnchor(board, subject, chosen, model);
  const prompt = falSubjectPrompt({ composition: chosen, name, description, style: styleTextFor(board, snapshot.settings.values.visualStyle) }) +
    (referenceIds.length ? `\nReferences: ${style?.hasReference ? "the first reference image sets the art style" : ""}${chosen === "figure" && referenceIds.length > (style?.hasReference ? 1 : 0) ? "; a reference portrait shows this person's face: keep it" : ""}.` : "");
  const picture = await createPictureRow(ctx, {
    id: crypto.randomUUID(), kind: "anchor", subjectKind: subject.kind, subjectId: subject.id, composition: chosen, timeline: snapshot.timeline,
    tier: pickedTier, trigger, model, styleVersionId: style?.id ?? null, shot: null, prompt, referenceIds,
  });
  log("picture_anchor_queued", { campaignId: ctx.campaignId, pictureId: picture.id, subject: subject.kind, composition: chosen, trigger, tier: pickedTier, model, references: referenceIds.length });
  return picture;
}

/** One autopilot step after a committed snapshot: the next anchor the plan names, if any. */
export async function autopilotStep(campaignId: string, schedule: Schedule = detached) {
  const ctx = await picturesContext(campaignId);
  const board = await boardOf(ctx);
  const snapshot = await readCampaign(campaignId);
  const [next] = planAutopilot(snapshot, board);
  if (!next) return { status: "idle" as const };
  const picture = await queueAnchor(ctx, board, snapshot, next.subject, next.composition, "autopilot", null);
  if (!picture) return { status: "cap" as const };
  schedule(() => runPictureJob(ctx, picture.id));
  return { status: "queued" as const, picture, label: next.name };
}

/** After a style change: re-render the anchor set in the background, within the daily cap,
 * one picture after another; old anchors stay until the new ones are ready. */
export async function restyleCampaign(campaignId: string, value: unknown, schedule: Schedule = detached) {
  if (!isRecord(value) || (value.tier !== undefined && value.tier !== "fast" && value.tier !== "quality")) throw new PersistenceError("validation");
  const ctx = await picturesContext(campaignId);
  const board = await boardOf(ctx);
  const snapshot = await readCampaign(campaignId);
  const { plan, fastUsdMicros, qualityUsdMicros } = restylePlan(snapshot, board);
  if (value.dryRun === true) return { status: "estimate" as const, count: plan.length, fastUsdMicros, qualityUsdMicros, queued: [] as PublicPicture[] };
  const queued: PublicPicture[] = [];
  const tier = (value.tier as PictureTier | undefined) ?? "quality";
  let remaining = capRemaining(board);
  for (const row of plan) {
    if (remaining <= 0) break;
    const picture = await queueAnchor(ctx, { ...board, today: { ...board.today, count: board.settings.dailyCap - remaining } }, snapshot, row.subject, row.composition, "restyle", tier);
    if (!picture) break;
    queued.push(picture);
    remaining -= 1;
  }
  schedule(async () => {
    for (const picture of queued) await runPictureJob(ctx, picture.id);
  });
  return { status: "queued" as const, count: plan.length, fastUsdMicros, qualityUsdMicros, queued };
}

/** The paid work of one picture, with the server's fal key. */
export function runPictureJob(ctx: PicturesContext, pictureId: string, options: { extraCostUsdMicros?: number } = {}) {
  return runJob(ctx, pictureId, { apiKey: process.env.FAL_KEY ?? "", extraCostUsdMicros: options.extraCostUsdMicros });
}
