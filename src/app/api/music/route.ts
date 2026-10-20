import { readWriteRequest, RequestError } from "@/lib/persistence/http-policy";
import { errorResponse, publicJson } from "@/lib/persistence/route-response";
import { PersistenceError } from "@/lib/server/errors";
import { exactKeys } from "@/lib/visual-frame/real-frame";
import { MAX_UPLOAD_BYTES } from "@/lib/audio/music-job";
import {
  cancelMusicPack, generateMusicPack, hideMusicTrack, musicSceneSignal, musicTrackBytes, readMusicState, runMusicJob, saveMusicSettings, tagMusicTrack, uploadMusicTrack,
} from "@/lib/server/audio/music-store";

// The music stage: the soundtrack state, the public scene signal, the bytes of ready tracks,
// settings, pack generation (one paid track per `music.run` call, so no request outlives a
// track), uploads of the owner's own tracks. Keys never leave the server.
export const maxDuration = 240;

export async function GET(request: Request) {
  try {
    const url = new URL(request.url), campaignId = url.searchParams.get("campaignId") ?? "", action = url.searchParams.get("action");
    if (action === "state") return publicJson(await readMusicState(campaignId));
    if (action === "scene") return publicJson(await musicSceneSignal(campaignId));
    if (action === "track") {
      const { bytes, contentType } = await musicTrackBytes(campaignId, url.searchParams.get("trackId") ?? "");
      // A ready track never changes: the browser may keep it for the session.
      return new Response(new Uint8Array(bytes).buffer as ArrayBuffer, { status: 200, headers: { "Content-Type": contentType, "Content-Length": String(bytes.byteLength), "Cache-Control": "private, max-age=86400", "X-Content-Type-Options": "nosniff", Vary: "Cookie" } });
    }
    throw new PersistenceError("validation");
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    if (request.headers.get("content-type")?.split(";")[0].trim() === "multipart/form-data") return publicJson(await upload(request));
    const value = await readWriteRequest(request);
    if (!exactKeys(value, ["action", "campaignId", "input"]) || typeof value.action !== "string" || typeof value.campaignId !== "string") throw new PersistenceError("validation");
    const { action, campaignId, input } = value;
    switch (action) {
      case "music.settings": return publicJson(await saveMusicSettings(campaignId, input));
      case "music.generate": return publicJson(await generateMusicPack(campaignId, input));
      case "music.cancel": return publicJson(await cancelMusicPack(campaignId, input));
      case "music.run": return publicJson(await runMusicJob(campaignId));
      case "music.hide": return publicJson(await hideMusicTrack(campaignId, input));
      case "music.tag": return publicJson(await tagMusicTrack(campaignId, input));
      default: throw new PersistenceError("validation");
    }
  } catch (error) {
    return errorResponse(error);
  }
}

/** The owner's own track as a form: `campaignId`, `title`, `moods` (comma-separated), `file`. */
async function upload(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) throw new RequestError("forbidden");
  if (Number(request.headers.get("content-length")) > MAX_UPLOAD_BYTES + 10_000) throw new RequestError("validation");
  const form = await request.formData();
  const campaignId = form.get("campaignId"), title = form.get("title"), moods = form.get("moods"), file = form.get("file");
  if (typeof campaignId !== "string" || typeof title !== "string" || typeof moods !== "string" || !(file instanceof Blob) || file.size > MAX_UPLOAD_BYTES) throw new RequestError("validation");
  const bytes = new Uint8Array(await file.arrayBuffer());
  return uploadMusicTrack(campaignId, { bytes, title, moods: moods.split(",").map((m) => m.trim()).filter(Boolean) });
}
