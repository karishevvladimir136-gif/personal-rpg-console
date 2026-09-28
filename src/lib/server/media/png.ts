import { createHash } from "node:crypto";
import {
  frameStoragePath,
  isFrameUsage,
} from "../../visual-frame/real-frame.ts";
import type {
  FrameParameters,
  FrameUsage,
} from "../../visual-frame/real-frame.ts";
import type { MediaPixels } from "./orchestration.ts";
export const MAX_FRAME_IMAGE_BYTES = 12_000_000;
function crc32(bytes: Uint8Array) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++)
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
export function checkedPng(bytes: Uint8Array, parameters?: FrameParameters) {
  if (
    bytes.byteLength < 33 ||
    bytes.byteLength > MAX_FRAME_IMAGE_BYTES ||
    ![137, 80, 78, 71, 13, 10, 26, 10].every((v, i) => bytes[i] === v) ||
    new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(
      8,
    ) !== 13 ||
    String.fromCharCode(...bytes.slice(12, 16)) !== "IHDR"
  )
    throw new Error("invalid_image");
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const width = view.getUint32(16),
    height = view.getUint32(20);
  if (
    ![1024, 1536].includes(width) ||
    ![1024, 1536].includes(height) ||
    (width === 1536 && height === 1536) ||
    (parameters && parameters.size !== `${width}x${height}`)
  )
    throw new Error("invalid_image");
  let offset = 8,
    imageData = false,
    ended = false;
  while (offset + 12 <= bytes.byteLength) {
    const length = view.getUint32(offset),
      end = offset + 12 + length;
    if (
      end > bytes.byteLength ||
      crc32(bytes.subarray(offset + 4, end - 4)) !== view.getUint32(end - 4)
    )
      throw new Error("invalid_image");
    const type = String.fromCharCode(...bytes.slice(offset + 4, offset + 8));
    if (type === "IDAT") imageData = true;
    if (type === "IEND") {
      if (length !== 0 || end !== bytes.byteLength)
        throw new Error("invalid_image");
      ended = true;
    }
    offset = end;
  }
  if (!imageData || !ended || offset !== bytes.byteLength)
    throw new Error("invalid_image");
  return createHash("sha256").update(bytes).digest("hex");
}
export function storedPixels(
  campaignId: string,
  jobId: string,
  bytes: Uint8Array,
  usage: FrameUsage | null = null,
  providerRequestId: string | null = null,
): MediaPixels {
  return {
    bytes,
    output: {
      storagePath: frameStoragePath(campaignId, jobId),
      sha256: checkedPng(bytes),
      bytes: bytes.byteLength,
      contentType: "image/png",
      usage,
      providerRequestId,
    },
  };
}
export function imageResponsePixels(
  value: unknown,
  campaignId: string,
  jobId: string,
  parameters: FrameParameters,
  requestId: string | null,
): MediaPixels {
  if (
    !value ||
    typeof value !== "object" ||
    !("data" in value) ||
    !Array.isArray(value.data) ||
    value.data.length !== 1 ||
    !value.data[0] ||
    typeof value.data[0].b64_json !== "string"
  )
    throw new Error("invalid_image");
  const encoded: string = value.data[0].b64_json;
  if (
    encoded.length > Math.ceil(MAX_FRAME_IMAGE_BYTES / 3) * 4 ||
    !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(
      encoded,
    )
  )
    throw new Error("invalid_image");
  const bytes = new Uint8Array(Buffer.from(encoded, "base64"));
  checkedPng(bytes, parameters);
  let usage: FrameUsage | null = null;
  if ("usage" in value && value.usage && typeof value.usage === "object") {
    const raw = value.usage as {
      input_tokens_details?: { text_tokens?: unknown; image_tokens?: unknown };
      output_tokens?: unknown;
      output_tokens_details?: { image_tokens?: unknown };
    };
    const candidate = {
      textInputTokens: raw.input_tokens_details?.text_tokens,
      imageInputTokens: raw.input_tokens_details?.image_tokens,
      outputTokens:
        raw.output_tokens_details?.image_tokens ?? raw.output_tokens,
    };
    if (!isFrameUsage(candidate)) throw new Error("invalid_usage");
    usage = candidate;
  }
  const safeRequestId =
    requestId && /^[a-zA-Z0-9_-]{1,200}$/.test(requestId) ? requestId : null;
  return storedPixels(campaignId, jobId, bytes, usage, safeRequestId);
}
