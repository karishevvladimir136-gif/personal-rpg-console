import "server-only";
import { createHash } from "node:crypto";
import { isUuid } from "../../persistence/validation.ts";
import {
  VIDEO_MODEL,
  VIDEO_PARAMETERS,
  VIDEO_RESERVATION_USD_MICROS,
  VideoError,
  videoStoragePath,
} from "../../scene-video/model.ts";
import type { SceneVideo, VideoOutput } from "../../scene-video/model.ts";

export type VideoPixels = { bytes: Uint8Array; output: VideoOutput };
export type VideoProvider = {
  submit: (video: SceneVideo, image: Uint8Array) => Promise<string>;
  poll: (
    requestId: string,
    campaignId: string,
    jobId: string,
  ) => Promise<
    | { status: "queued" | "generating" | "failed" }
    | { status: "ready"; pixels: VideoPixels }
  >;
};
export const MAX_VIDEO_BYTES = 60_000_000;
export function checkedMp4(bytes: Uint8Array) {
  if (bytes.byteLength < 32 || bytes.byteLength > MAX_VIDEO_BYTES)
    throw new VideoError("unavailable");
  const data = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength),
    decoder = new TextDecoder();
  let offset = 0,
    ftyp = false,
    moov = false,
    mdat = false;
  while (offset < bytes.length) {
    if (offset + 8 > bytes.length) throw new VideoError("unavailable");
    const size = data.getUint32(offset),
      type = decoder.decode(bytes.subarray(offset + 4, offset + 8));
    if (size < 8 || offset + size > bytes.length)
      throw new VideoError("unavailable");
    if (type === "ftyp") {
      const brand = decoder.decode(bytes.subarray(offset + 8, offset + 12));
      if (
        !["isom", "iso2", "mp41", "mp42", "avc1"].includes(brand) ||
        size < 16
      )
        throw new VideoError("unavailable");
      ftyp = true;
    }
    if (type === "moov") moov = true;
    if (type === "mdat") mdat = true;
    offset += size;
  }
  if (!ftyp || !moov || !mdat) throw new VideoError("unavailable");
  return createHash("sha256").update(bytes).digest("hex");
}
export function storedVideo(
  cid: string,
  jid: string,
  bytes: Uint8Array,
  requestId: string,
  actualModel: typeof VIDEO_MODEL | null = null,
): VideoPixels {
  if (!isUuid(requestId)) throw new VideoError("unavailable");
  return {
    bytes,
    output: {
      storagePath: videoStoragePath(cid, jid),
      sha256: checkedMp4(bytes),
      bytes: bytes.byteLength,
      contentType: "video/mp4",
      providerRequestId: requestId,
      actualModel,
    },
  };
}
async function bodyBytes(response: Response, maximum: number) {
  if (
    !response.body ||
    Number(response.headers.get("content-length")) > maximum
  )
    throw new VideoError("unavailable");
  const reader = response.body.getReader(),
    chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maximum) {
        await reader.cancel();
        throw new VideoError("unavailable");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const result = new Uint8Array(size);
  let i = 0;
  for (const chunk of chunks) {
    result.set(chunk, i);
    i += chunk.length;
  }
  return result;
}
export function permittedVideoUrl(value: unknown): value is string {
  if (typeof value !== "string" || value.length > 1800) return false;
  try {
    const u = new URL(value);
    return (
      u.protocol === "https:" &&
      !u.username &&
      !u.password &&
      !u.port &&
      !u.hash &&
      !u.search &&
      ((/^(v[0-9]+[a-z]?\.)?fal\.media$/.test(u.hostname) &&
        u.pathname.startsWith("/files/")) ||
        (u.hostname === "storage.googleapis.com" &&
          u.pathname.startsWith("/falserverless/"))) &&
      u.pathname.endsWith(".mp4")
    );
  } catch {
    return false;
  }
}
export function falVideoProvider(
  apiKey: string,
  request: typeof fetch = fetch,
): VideoProvider {
  const root = "https://queue.fal.run/bytedance/seedance-2.5";
  async function json(url: string, init: RequestInit = {}) {
    if (!apiKey) throw new VideoError("not_configured");
    let response: Response;
    try {
      response = await request(url, {
        ...init,
        redirect: "error",
        headers: {
          Authorization: "Key " + apiKey,
          "Content-Type": "application/json",
          "X-Fal-No-Retry": "1",
          ...init.headers,
        },
        signal: AbortSignal.timeout(30_000),
      });
    } catch {
      throw new VideoError("unavailable");
    }
    if (!response.ok)
      throw new VideoError(
        [400, 401, 403, 404, 422, 429].includes(response.status)
          ? "validation"
          : "unavailable",
      );
    try {
      return JSON.parse(
        new TextDecoder().decode(await bodyBytes(response, 200_000)),
      );
    } catch {
      throw new VideoError("unavailable");
    }
  }
  return {
    async submit(video, image) {
      if (
        video.status !== "generating" ||
        video.model !== VIDEO_MODEL ||
        JSON.stringify(video.parameters) !== JSON.stringify(VIDEO_PARAMETERS) ||
        video.dispatch?.reservationUsdMicros !== VIDEO_RESERVATION_USD_MICROS ||
        image.length > 12_000_000 ||
        video.prompt.length > 30_000
      )
        throw new VideoError("validation");
      // The sole start image is locally read, hash-checked owner-accepted PNG data.
      // No upload service, URL supplied by a browser, end frame, subscribe/retry or webhook.
      const value = await json("https://queue.fal.run/" + VIDEO_MODEL, {
        method: "POST",
        body: JSON.stringify({
          image_url:
            "data:image/png;base64," + Buffer.from(image).toString("base64"),
          prompt: video.prompt,
          resolution: "720p",
          duration: "10",
          aspect_ratio: "auto",
          generate_audio: true,
          bitrate_mode: "standard",
          codec: "H264",
        }),
      });
      if (
        !isUuid(value.request_id) ||
        (value.model !== undefined && value.model !== VIDEO_MODEL) ||
        (value.status !== undefined &&
          value.status !== "IN_QUEUE" &&
          value.status !== "IN_PROGRESS")
      )
        throw new VideoError("unavailable");
      return value.request_id;
    },
    async poll(requestId, campaignId, jobId) {
      if (!isUuid(requestId)) throw new VideoError("validation");
      // fal's official queue client removes endpoint subpaths for same-ID reads.
      const url = root + "/requests/" + requestId;
      const value = await json(url + "/status?logs=0");
      if (
        value.request_id !== requestId ||
        (value.model !== undefined && value.model !== VIDEO_MODEL)
      )
        throw new VideoError("unavailable");
      if (value.status === "IN_QUEUE") return { status: "queued" };
      if (value.status === "IN_PROGRESS") return { status: "generating" };
      if (value.status !== "COMPLETED") throw new VideoError("unavailable");
      if (value.error !== undefined || value.error_type !== undefined)
        return { status: "failed" };
      const output = await json(url);
      if (output.error !== undefined || output.detail !== undefined)
        return { status: "failed" };
      if (
        (output.model !== undefined && output.model !== VIDEO_MODEL) ||
        !permittedVideoUrl(output.video?.url) ||
        (output.video.content_type !== undefined &&
          output.video.content_type !== "video/mp4") ||
        (output.video.file_size !== undefined &&
          (!Number.isSafeInteger(output.video.file_size) ||
            output.video.file_size > MAX_VIDEO_BYTES ||
            output.video.file_size < 32))
      )
        throw new VideoError("unavailable");
      // Provider credentials never accompany a media CDN download; no redirect/SSRF.
      let response: Response;
      try {
        response = await request(output.video.url, {
          redirect: "error",
          signal: AbortSignal.timeout(30_000),
        });
      } catch {
        throw new VideoError("unavailable");
      }
      if (
        !response.ok ||
        response.headers.get("content-type")?.split(";")[0] !== "video/mp4"
      )
        throw new VideoError("unavailable");
      const bytes = await bodyBytes(response, MAX_VIDEO_BYTES);
      if (
        output.video.file_size !== undefined &&
        output.video.file_size !== bytes.length
      )
        throw new VideoError("unavailable");
      return {
        status: "ready",
        pixels: storedVideo(
          campaignId,
          jobId,
          bytes,
          requestId,
          output.model ?? null,
        ),
      };
    },
  };
}
