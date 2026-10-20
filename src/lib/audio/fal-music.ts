// fal.ai music adapter: submit → poll → download one track. Pure: the caller
// passes the key; nothing here reads the environment, logs, or returns provider
// URLs, prompts or keys to a client. Never retries a submit (no double charge).
import { falQueueRoot, permittedFalMediaUrl } from "../visual-frame/fal-image.ts";
import { MAX_TRACK_BYTES, musicModel, musicPriceUsdMicros, musicRequestBody, requestedSeconds, sniffAudio, type AudioContentType, type MusicRequest } from "./models.ts";

export type FalMusicErrorCode = "not_configured" | "validation" | "unavailable" | "failed" | "timeout";
export class FalMusicError extends Error {
  code: FalMusicErrorCode;
  /** Provider status and a short, key-free reason for diagnostics (never shown to a player). */
  detail: string | null;
  constructor(code: FalMusicErrorCode, detail: string | null = null) {
    super(code);
    this.code = code;
    this.detail = detail;
  }
}

export type FalMusicResult = {
  bytes: Uint8Array;
  contentType: AudioContentType;
  requestId: string;
  model: string;
  /** The seconds the endpoint was asked for (the real length is read from the file). */
  requestedSeconds: number;
  priceUsdMicros: number;
  /** Wall-clock milliseconds from submit to the downloaded track. */
  elapsedMs: number;
  /** The top-level keys of the provider's result (for the research record; never a URL). */
  outputKeys: string[];
};

async function readLimited(response: Response, limit: number) {
  if (Number(response.headers.get("content-length")) > limit || !response.body) throw new FalMusicError("unavailable");
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const chunk = await reader.read();
      if (chunk.done) break;
      size += chunk.value.byteLength;
      if (size > limit) {
        await reader.cancel();
        throw new FalMusicError("unavailable");
      }
      chunks.push(chunk.value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
}

/** The audio file of a result: endpoints name it `audio`, `audio_file` or `audio_url`; a bare URL string or an object with `url`. */
export function falMusicFileUrl(output: unknown): string | null {
  if (!output || typeof output !== "object") return null;
  const record = output as Record<string, unknown>;
  const candidates = [record.audio, record.audio_file, record.audio_url, record.output, record.file, Array.isArray(record.audios) ? record.audios[0] : null, record.result];
  for (const candidate of candidates) {
    if (permittedFalMediaUrl(candidate)) return candidate as string;
    if (candidate && typeof candidate === "object") {
      const url = (candidate as Record<string, unknown>).url;
      if (permittedFalMediaUrl(url)) return url as string;
    }
  }
  return null;
}

export async function generateFalMusic(
  apiKey: string,
  input: MusicRequest,
  options: { fetcher?: typeof fetch; pollMs?: number; timeoutMs?: number; sleep?: (ms: number) => Promise<void> } = {},
): Promise<FalMusicResult> {
  if (!apiKey) throw new FalMusicError("not_configured");
  const model = musicModel(input.model);
  if (!model) throw new FalMusicError("validation", "unknown model");
  const fetcher = options.fetcher ?? fetch;
  const sleep = options.sleep ?? ((ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)));
  const body = musicRequestBody(input);
  const started = Date.now();
  const json = async (url: string, init: RequestInit = {}) => {
    let response: Response;
    try {
      response = await fetcher(url, {
        ...init,
        redirect: "error",
        headers: { Authorization: "Key " + apiKey, "Content-Type": "application/json", "X-Fal-No-Retry": "1", ...init.headers },
        signal: AbortSignal.timeout(30_000),
      });
    } catch {
      throw new FalMusicError("unavailable");
    }
    if (!response.ok) {
      let detail = `HTTP ${response.status}`;
      try {
        const value = JSON.parse(new TextDecoder().decode(await readLimited(response, 20_000)));
        const reason = Array.isArray(value?.detail)
          ? value.detail.map((row: { msg?: unknown; type?: unknown; loc?: unknown }) => `${Array.isArray(row?.loc) ? row.loc.slice(1).join(".") + ": " : ""}${row?.msg ?? row?.type}`).join("; ")
          : value?.detail ?? value?.error;
        if (typeof reason === "string") detail += `: ${reason.slice(0, 200)}`;
      } catch {
        /* The status alone is enough. */
      }
      throw new FalMusicError([400, 401, 403, 404, 422].includes(response.status) ? "validation" : "unavailable", detail);
    }
    try {
      return JSON.parse(new TextDecoder().decode(await readLimited(response, 400_000)));
    } catch {
      throw new FalMusicError("unavailable");
    }
  };
  const submitted = await json("https://queue.fal.run/" + model.id, { method: "POST", body: JSON.stringify(body) });
  const requestId = submitted?.request_id;
  if (typeof requestId !== "string" || !/^[\w-]{8,80}$/.test(requestId)) throw new FalMusicError("unavailable");
  const root = falQueueRoot(model.id) + "/requests/" + requestId;
  const deadline = Date.now() + (options.timeoutMs ?? 600_000);
  for (;;) {
    const status = await json(root + "/status?logs=0");
    if (status?.status === "COMPLETED") {
      if (status.error !== undefined || status.error_type !== undefined) throw new FalMusicError("failed");
      break;
    }
    if (status?.status !== "IN_QUEUE" && status?.status !== "IN_PROGRESS") throw new FalMusicError("unavailable");
    if (Date.now() > deadline) throw new FalMusicError("timeout");
    await sleep(options.pollMs ?? 2_000);
  }
  const output = await json(root);
  const url = falMusicFileUrl(output);
  if (!url) {
    // A request the worker rejected completes with a `detail` body and no file.
    const reason = Array.isArray(output?.detail) ? output.detail.map((row: { msg?: unknown }) => row?.msg).join("; ") : output?.detail;
    throw new FalMusicError("validation", `completed without audio${typeof reason === "string" ? `: ${reason.slice(0, 200)}` : ""}`);
  }
  let response: Response;
  try {
    // Provider credentials never accompany the media CDN download.
    response = await fetcher(url, { redirect: "error", signal: AbortSignal.timeout(120_000) });
  } catch {
    throw new FalMusicError("unavailable");
  }
  if (!response.ok) throw new FalMusicError("unavailable");
  const bytes = await readLimited(response, MAX_TRACK_BYTES);
  const contentType = sniffAudio(bytes);
  if (!contentType) throw new FalMusicError("unavailable", "not an audio file");
  const seconds = requestedSeconds(model, input.seconds);
  return {
    bytes, contentType, requestId, model: model.id, requestedSeconds: seconds,
    priceUsdMicros: musicPriceUsdMicros(model.id, seconds), elapsedMs: Date.now() - started,
    outputKeys: output && typeof output === "object" ? Object.keys(output).slice(0, 12) : [],
  };
}
