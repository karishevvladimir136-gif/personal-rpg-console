import "server-only";
import { PersistenceError } from "../../server/errors";
import { isUuid } from "../../persistence/validation";
import type { Schedule } from "../../server/media/pictures-service";
import { MARKER_VISIBILITIES } from "../contracts";
import { live2dContext, readLive2dBoard, savePoi, saveSettings } from "./store";
import { prepareScene, redrawScene, saveSheet } from "./scenes";
import { drawRegionMap, saveOwnerRegionMarker } from "./region";
import { prepareBattleMap } from "./battle";

// The HTTP face of the 2D layer: the public board and the owner's actions. The
// seeds have no action here on purpose (the hidden layer stays on the server).
const isRecord = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);

export { readLive2dBoard };

export async function live2dAction(campaignId: string, action: string, input: unknown, schedule: Schedule) {
  switch (action) {
    case "scene.prepare": return prepareScene(campaignId, input, schedule);
    case "scene.redraw":
    case "poi.redraw": return redrawScene(campaignId, input, schedule);
    case "scene.sheet.save": return saveSheet(campaignId, input);
    case "poi.save": return saveOwnerPoi(campaignId, input);
    case "region.draw": return drawRegionMap(campaignId, input, schedule);
    // Fix S3-accept Д3: «Изменить размещение» — the owner moves a marker of the painted region.
    case "region.marker.save": return saveOwnerRegionMarker(campaignId, input);
    case "battle.prepare": return prepareBattleMap(campaignId, input, schedule);
    case "settings.save": return saveLive2dSettings(campaignId, input);
    default: throw new PersistenceError("validation");
  }
}

/** The owner drags, hides or renames a marker: the highest authority over its position. */
export async function saveOwnerPoi(campaignId: string, value: unknown) {
  const unit = (v: unknown) => v === null || (typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= 1);
  if (!isRecord(value) || !isUuid(value.id) || !Number.isSafeInteger(value.expectedRevision) || !unit(value.x) || !unit(value.y) || (value.x === null) !== (value.y === null) ||
    typeof value.hidden !== "boolean" || (value.label !== undefined && (typeof value.label !== "string" || !value.label.trim() || value.label.length > 80)) ||
    (value.note !== undefined && (typeof value.note !== "string" || value.note.length > 400))) throw new PersistenceError("validation");
  const ctx = await live2dContext(campaignId);
  return savePoi(ctx, { id: value.id, expectedRevision: value.expectedRevision, x: value.x, y: value.y, hidden: value.hidden,
    ...(value.label !== undefined ? { label: (value.label as string).trim() } : {}), ...(value.note !== undefined ? { note: value.note } : {}) });
}

export async function saveLive2dSettings(campaignId: string, value: unknown) {
  if (!isRecord(value) || !Number.isSafeInteger(value.expectedRevision) || !MARKER_VISIBILITIES.includes(value.markers as never)) throw new PersistenceError("validation");
  const ctx = await live2dContext(campaignId);
  return saveSettings(ctx, { expectedRevision: value.expectedRevision, markers: value.markers });
}
