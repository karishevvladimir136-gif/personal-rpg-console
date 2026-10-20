// Client transport of the 2D board: the server decides and draws; the client
// reads the public projection and asks by action.
import { readJson } from "../persistence/client.ts";
import { parseLive2dBoard, type Live2dBoard } from "./contracts.ts";

export type Live2dAction =
  | "scene.prepare" | "scene.redraw" | "scene.sheet.save" | "poi.save" | "poi.redraw"
  | "region.draw" | "settings.save";
export type Live2dTransport = {
  board: (campaignId: string) => Promise<Live2dBoard>;
  send: (action: Live2dAction, campaignId: string, input: unknown) => Promise<unknown>;
};
const url = (campaignId: string) => `/api/campaigns/${encodeURIComponent(campaignId)}/live2d`;
export const defaultLive2dTransport: Live2dTransport = {
  board: async (campaignId) => {
    const board = parseLive2dBoard(await readJson(url(campaignId)));
    if (!board) throw new Error("unavailable");
    return board;
  },
  send: (action, campaignId, input) =>
    readJson(url(campaignId), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, input }) }),
};
