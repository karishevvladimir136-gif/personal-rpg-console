// Client transport of the Stage V picture board: the server decides and draws,
// the client reads projections and asks for pictures by action.
import { readJson } from "../persistence/client.ts";
import { parsePictureBoard, type PictureBoard } from "../visual-frame/pictures.ts";

export type PicturesAction =
  | "pictures.frame" | "pictures.anchor" | "pictures.autopilot" | "pictures.restyle" | "pictures.settings"
  | "pictures.style.save" | "pictures.style.activate" | "pictures.style.clear" | "pictures.hide"
  | "pictures.profile.save" | "pictures.profile.draft"
  /** Fix S3-accept Е1: the «Судьбы» cards' missing portraits, one batch. */
  | "pictures.fates";
export type PicturesTransport = {
  board: (campaignId: string) => Promise<PictureBoard>;
  send: (action: PicturesAction, campaignId: string, input: unknown) => Promise<unknown>;
};
export const defaultPicturesTransport: PicturesTransport = {
  board: async (campaignId) => {
    const board = parsePictureBoard(await readJson(`/api/visual-frame?action=pictures&campaignId=${encodeURIComponent(campaignId)}`));
    if (!board) throw new Error("unavailable");
    return board;
  },
  send: (action, campaignId, input) =>
    readJson("/api/visual-frame", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, campaignId, input }) }),
};

/** Reads a chosen image file as a data URL for a style reference (bounded size). */
export function readImageAsDataUrl(file: Blob, maxBytes = 5_000_000): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.size > maxBytes) { reject(new Error("too_large")); return; }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("unreadable"));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
}
