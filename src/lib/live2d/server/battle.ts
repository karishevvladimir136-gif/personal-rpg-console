import "server-only";
import { readCampaign } from "../../server/repository";
import { PersistenceError } from "../../server/errors";
import { isUuid } from "../../persistence/validation";
import { boardOf as picturesBoardOf, picturesContext, type PicturesContext } from "../../server/media/pictures-store";
import { createPictureRow, privatePicture } from "../../visual-frame/picture-job";
import { runPictureJob, type Schedule } from "../../server/media/pictures-service";
import { activeStyle, anchorFor, capRemaining, modelForTier, styleTextFor } from "../../visual-frame/pictures";
import type { SceneSheet, SheetFeature } from "../contracts";
import { battleMapOf, sceneOf } from "../contracts";
import { briefOf, mustShow, sceneVerdict } from "../scene";
import { checkScene, type Image } from "./vision";
import { boardOf, live2dContext, type Live2dContext } from "./store";
import { anthropicApiKey } from "../../server/anthropic-endpoint";

// Part 2: the battle background — the place's scene drawn top-down for the grid
// (from the Part 1 scene sheet: same layout, same objects, no people), on the
// quality tier, checked like a scene (no invented walls, doors or cover), one
// corrected redraw; a new background only when a fight starts somewhere new (one
// per place and sheet revision). Text play never waits: without a background the
// map shows plain ground.

const log = (event: string, data: Record<string, unknown>) => console.info(JSON.stringify({ event, ...data }));
const isRecord = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
const detached: Schedule = (work) => { void work().catch((error) => log("live2d_job_failed", { message: String((error as Error)?.message ?? error).slice(0, 200) })); };
/** The battle picture is 4:3 (1024×768): 24 × 18 cells of 5 ft. */
export const BATTLE_GRID = { cols: 24, rows: 18, feetPerCell: 5 } as const;

export type BattlePrepareResult = { status: "queued" | "existing" | "cap" | "no_scene" | "drawing"; locationId: string };

/** The top-down brief: the sheet's layout seen straight from above, the grid implied by scale, nothing invented. */
export function battleBrief(sheet: SceneSheet, input: { placeName: string; style: string; correction?: { missing: SheetFeature[]; contradictions: string[] } | null }): string {
  const must = mustShow(sheet);
  const others = sheet.features.filter((row) => !row.mustShow);
  return [
    `A top-down battle map of ${input.placeName}, seen straight down from above as a tabletop map, the ground plane flat and readable, scaled so a person would be about one twentieth of the picture's width.`,
    sheet.summary ? `The place, the same layout as its scene: ${sheet.summary}` : "",
    must.length ? `MUST SHOW, each clearly visible from above and separated: ${must.map((row) => `${briefOf(row)} (${row.label})`).join("; ")}.` : "",
    others.length ? `Also there: ${others.map(briefOf).join("; ")}.` : "",
    sheet.light ? `Light: ${sheet.light}.` : "",
    "MUST NOT SHOW: no people, no creatures, no tokens, no miniatures; no walls, doors, fences, pits, cover or furniture that the list above does not name; no grid lines, no text, no labels, no compass.",
    sheet.never.length ? `MUST NOT SHOW: ${sheet.never.join("; ")}.` : "",
    input.correction?.missing.length ? `The previous attempt missed these; draw them unmistakably from above: ${input.correction.missing.map((row) => `${briefOf(row)} (${row.label})`).join("; ")}.` : "",
    input.correction?.contradictions.length ? `The previous attempt invented these; leave them out: ${input.correction.contradictions.join("; ")}.` : "",
    input.style.trim() ? `Art style: ${input.style.trim().slice(0, 800)}, as a painted map.` : "Art style: a painted tabletop map, warm and readable.",
  ].filter(Boolean).join("\n").slice(0, 8000);
}

/** «Карта боя»: draw the place's top-down background from its scene sheet (the Part 1 scene must exist). */
export async function prepareBattleMap(campaignId: string, value: unknown, schedule: Schedule = detached): Promise<BattlePrepareResult> {
  if (!isRecord(value) || !isUuid(value.locationId) || (value.force !== undefined && typeof value.force !== "boolean")) throw new PersistenceError("validation");
  const locationId = value.locationId;
  const ctx = await live2dContext(campaignId);
  const board = await boardOf(ctx);
  const scene = sceneOf(board, locationId);
  if (!scene || !scene.sheet.features.length) return { status: "no_scene", locationId };
  const existing = battleMapOf(board, locationId);
  if (existing?.status === "drawing") return { status: "drawing", locationId };
  if (existing && existing.pictureId && existing.sheetRevision === scene.revision && existing.status !== "failed" && value.force !== true) return { status: "existing", locationId };
  const pictures = await picturesContext(campaignId);
  if (!capRemaining(await picturesBoardOf(pictures))) return { status: "cap", locationId };
  await ctx.rpc("battle.save", { locationId, sheetRevision: scene.revision, pictureId: existing?.pictureId ?? null, status: "drawing", grid: BATTLE_GRID });
  schedule(() => drawBattle(ctx, pictures, campaignId, locationId, scene.sheet, scene.revision, scene.pictureId));
  return { status: "queued", locationId };
}

async function drawBattle(ctx: Live2dContext, pictures: PicturesContext, campaignId: string, locationId: string, sheet: SceneSheet, sheetRevision: number, scenePictureId: string | null) {
  const apiKey = anthropicApiKey();
  try {
    const snapshot = await readCampaign(campaignId);
    const place = snapshot.locations.find((row) => row.id === locationId);
    if (!place) throw new PersistenceError("not_found");
    const first = await drawOnce(pictures, snapshot, locationId, sheet, scenePictureId, null);
    if (!first.pictureId || !first.image) {
      await ctx.rpc("battle.save", { locationId, sheetRevision, pictureId: null, status: "failed", grid: BATTLE_GRID });
      log("live2d_battle_failed", { campaignId, locationId, error: first.error });
      return;
    }
    let pictureId = first.pictureId;
    let checked = await checkScene(apiKey, sheet, place.name, first.image);
    let check = checked.check;
    log("live2d_battle_check", { campaignId, locationId, pictureId, ok: !!check, verdict: check ? sceneVerdict(sheet, check) : null, costUsdMicros: checked.costUsdMicros, error: checked.error });
    if (check && !sceneVerdict(sheet, check).ok) {
      const verdict = sceneVerdict(sheet, check);
      const second = await drawOnce(pictures, snapshot, locationId, sheet, scenePictureId, { missing: verdict.missing, contradictions: [...verdict.contradictions, ...(verdict.people ? ["people or creatures"] : [])] });
      if (second.pictureId && second.image) {
        const again = await checkScene(apiKey, sheet, place.name, second.image);
        const score = (c: typeof check) => (c ? sceneVerdict(sheet, c).missing.length * 10 + sceneVerdict(sheet, c).contradictions.length + (c.peopleInBackground ? 5 : 0) : 99);
        if (score(again.check) <= score(check)) { pictureId = second.pictureId; check = again.check; checked = again; }
      }
    }
    const status = check && sceneVerdict(sheet, check).ok ? "ready" : "flagged";
    await ctx.rpc("battle.save", { locationId, sheetRevision, pictureId, status, check, grid: BATTLE_GRID });
    log("live2d_battle_ready", { campaignId, locationId, pictureId, status, costUsdMicros: first.costUsdMicros + checked.costUsdMicros });
  } catch (error) {
    log("live2d_battle_failed", { campaignId, locationId, message: String((error as Error)?.message ?? error).slice(0, 200) });
    await ctx.rpc("battle.save", { locationId, sheetRevision, pictureId: null, status: "failed", grid: BATTLE_GRID }).catch(() => {});
  }
}

async function drawOnce(pictures: PicturesContext, snapshot: Awaited<ReturnType<typeof readCampaign>>, locationId: string, sheet: SceneSheet, scenePictureId: string | null, correction: { missing: SheetFeature[]; contradictions: string[] } | null) {
  const place = snapshot.locations.find((row) => row.id === locationId)!;
  const board = await picturesBoardOf(pictures);
  if (!snapshot.timeline) throw new PersistenceError("conflict");
  const model = modelForTier("quality", board.settings);
  const style = activeStyle(board);
  // The scene picture (or the place's illustration) is the reference: the same place from above.
  const sceneRef = scenePictureId && board.pictures.find((row) => row.id === scenePictureId && row.status === "ready") ? scenePictureId : anchorFor(board, { kind: "location", id: locationId }, "location").picture?.id ?? null;
  const referenceIds = [...(style?.hasReference ? [style.id] : []), ...(sceneRef ? [sceneRef] : [])].slice(0, 2);
  const prompt = [battleBrief(sheet, { placeName: place.name, style: styleTextFor(board, snapshot.settings.values.visualStyle), correction }),
    referenceIds.length ? `References: ${style?.hasReference ? "the first reference image sets the art style" : ""}${sceneRef ? `${style?.hasReference ? "; " : ""}a reference shows this place from the ground: the same layout, materials and objects, now seen from above` : ""}.` : ""].filter(Boolean).join("\n").slice(0, 8000);
  const picture = await createPictureRow(pictures, {
    id: crypto.randomUUID(), kind: "anchor", subjectKind: "location", subjectId: locationId, composition: "battle", timeline: snapshot.timeline,
    tier: "quality", trigger: correction ? "redraw" : "manual", model, styleVersionId: style?.id ?? null, shot: { sheet, correction, battle: true }, prompt, referenceIds,
  });
  const ready = await runPictureJob(pictures, picture.id);
  if (!ready || ready.status !== "ready") return { pictureId: null, image: null as Image | null, costUsdMicros: ready?.costUsdMicros ?? 0, error: ready?.error ?? "failed" };
  const row = await privatePicture(pictures, picture.id);
  const image = row.storagePath ? await pictures.storage.get(row.storagePath) : null;
  return { pictureId: picture.id, image, costUsdMicros: ready.costUsdMicros, error: image ? null : "no pixels" };
}
