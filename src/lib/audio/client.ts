// Browser calls of the music API (the music stage). Same-origin only; nothing here holds a key.
import { readJson } from "../persistence/client.ts";
import { parseMusicState, type MusicState, type MusicTrack, type SceneSignalView } from "./contracts.ts";

const base = "/api/music";
const id = encodeURIComponent;

export async function loadMusicState(campaignId: string): Promise<MusicState> {
  const state = parseMusicState(await readJson<unknown>(`${base}?action=state&campaignId=${id(campaignId)}`));
  if (!state) throw new Error("music state");
  return state;
}
export function loadSceneSignal(campaignId: string) {
  return readJson<SceneSignalView>(`${base}?action=scene&campaignId=${id(campaignId)}`);
}
export const musicTrackUrl = (campaignId: string, trackId: string) => `${base}?action=track&campaignId=${id(campaignId)}&trackId=${id(trackId)}`;

export async function musicAction(campaignId: string, action: "music.settings" | "music.generate" | "music.cancel" | "music.run", input: unknown = {}): Promise<MusicState & { run?: string }> {
  const raw = await readJson<unknown>(base, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, campaignId, input }) });
  if (action === "music.settings") {
    // The settings action answers with the settings alone; the caller reloads the state.
    return loadMusicState(campaignId);
  }
  const state = parseMusicState(raw);
  if (!state) throw new Error("music state");
  return { ...state, run: typeof (raw as Record<string, unknown>).run === "string" ? ((raw as Record<string, unknown>).run as string) : undefined };
}
export function musicTrackAction(campaignId: string, action: "music.hide" | "music.tag", input: unknown) {
  return readJson<MusicTrack>(base, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, campaignId, input }) });
}
export async function uploadMusic(campaignId: string, file: File, title: string, moods: string[]): Promise<MusicState> {
  const form = new FormData();
  form.set("campaignId", campaignId);
  form.set("title", title);
  form.set("moods", moods.join(","));
  form.set("file", file);
  const response = await fetch(base, { method: "POST", body: form, credentials: "same-origin" });
  if (!response.ok) throw new Error(`upload ${response.status}`);
  const state = parseMusicState(await response.json());
  if (!state) throw new Error("music state");
  return state;
}
