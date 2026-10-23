// Fix S3-accept Б2: the one-time redo of a stored scene sheet whose player-facing text is not in the campaign's
// language (sheets written before the rule were plain English: «The main door of the guard post…» on a hotspot).
// One cheap call rewrites the text; the sheet is saved as a new revision (its version row keeps the English one) with
// the `language` mark, so it never runs again; the old English clause stays as the illustrator's `brief`; the
// hotspots' notes follow (the owner's own note stays, nothing moves); the scene's status and the battle background
// drawn from the sheet stay as they were. Off the turn's path and failure-safe: any failure leaves the old sheet.
// No "server-only" marker (as vision.ts): the store and the key come as arguments; tests drive it on PGlite.
import { battleMapOf, parseLive2dScene, sceneOf, type Live2dBoard } from "../contracts.ts";
import { needsLanguageRedo, relangPoiRows, type SheetLanguage } from "../scene-language.ts";
import { relangSheet, type CallOptions } from "./vision.ts";

export type LanguageRedoDeps = {
  rpc: (action: "scene.save" | "scene.update" | "poi.replace" | "battle.save", payload?: unknown) => Promise<unknown>;
  apiKey: string;
  language: SheetLanguage;
  placeName: string;
  options?: CallOptions;
};
export type LanguageRedoResult = { status: "redone" | "skipped" | "failed"; reason: string | null; costUsdMicros: number; revision: number | null };

export async function redoSceneLanguage(board: Live2dBoard, locationId: string, deps: LanguageRedoDeps): Promise<LanguageRedoResult> {
  const scene = sceneOf(board, locationId);
  const skip = (reason: string): LanguageRedoResult => ({ status: "skipped", reason, costUsdMicros: 0, revision: null });
  if (!scene) return skip("no_scene");
  if (scene.status === "drawing") return skip("drawing");
  if (!needsLanguageRedo(scene.sheet, deps.language)) return skip("in_language");
  const redone = await relangSheet(deps.apiKey, scene.sheet, deps.placeName, deps.language, deps.options);
  if (!redone.sheet) return { status: redone.error === "not_configured" ? "skipped" : "failed", reason: redone.error, costUsdMicros: redone.costUsdMicros, revision: null };
  try {
    // A model save leaves the scene a draft; its status (checked, flagged…) comes back at once.
    const saved = parseLive2dScene(await deps.rpc("scene.save", { locationId, sheet: redone.sheet, source: "model", expectedRevision: scene.revision }));
    if (!saved) throw new Error("unavailable");
    if (saved.status !== scene.status) await deps.rpc("scene.update", { locationId, status: scene.status });
    const notes = relangPoiRows(board.pois, locationId, scene.sheet, saved.sheet);
    if (notes.changed) await deps.rpc("poi.replace", { locationId, pois: notes.rows });
    // The background drawn from this sheet stays current: the words changed, not the place.
    const battle = battleMapOf(board, locationId);
    if (battle && battle.sheetRevision === scene.revision && battle.status !== "drawing")
      await deps.rpc("battle.save", { locationId, sheetRevision: saved.revision, pictureId: battle.pictureId, status: battle.status, check: battle.check, grid: battle.grid });
    return { status: "redone", reason: null, costUsdMicros: redone.costUsdMicros, revision: saved.revision };
  } catch (error) {
    return { status: "failed", reason: String((error as Error)?.message ?? error).slice(0, 120), costUsdMicros: redone.costUsdMicros, revision: null };
  }
}
