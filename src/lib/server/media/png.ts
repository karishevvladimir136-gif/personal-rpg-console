import { createHash } from "node:crypto";
import { inflateSync } from "node:zlib";
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
function paeth(left: number, above: number, upperLeft: number) {
  const prediction = left + above - upperLeft;
  const dl = Math.abs(prediction - left),
    da = Math.abs(prediction - above),
    du = Math.abs(prediction - upperLeft);
  return dl <= da && dl <= du ? left : da <= du ? above : upperLeft;
}
export function checkedPng(bytes: Uint8Array, parameters?: FrameParameters) {
  if (
    bytes.byteLength < 33 ||
    bytes.byteLength > MAX_FRAME_IMAGE_BYTES ||
    ![137, 80, 78, 71, 13, 10, 26, 10].every((v, i) => bytes[i] === v)
  )
    throw new Error("invalid_image");
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (
    view.getUint32(8) !== 13 ||
    String.fromCharCode(...bytes.slice(12, 16)) !== "IHDR"
  )
    throw new Error("invalid_image");
  const width = view.getUint32(16),
    height = view.getUint32(20),
    depth = bytes[24],
    color = bytes[25];
  const formats: Record<number, { depths: number[]; channels: number }> = {
    0: { depths: [1, 2, 4, 8, 16], channels: 1 },
    2: { depths: [8, 16], channels: 3 },
    3: { depths: [1, 2, 4, 8], channels: 1 },
    4: { depths: [8, 16], channels: 2 },
    6: { depths: [8, 16], channels: 4 },
  };
  const format = formats[color];
  // W3C PNG IHDR/scanlines: https://www.w3.org/TR/png/#11IHDR
  // Adam7 and animated PNG are unsupported here; fail closed without re-encoding or a paid retry.
  if (
    ![1024, 1536].includes(width) ||
    ![1024, 1536].includes(height) ||
    (width === 1536 && height === 1536) ||
    (parameters && parameters.size !== `${width}x${height}`) ||
    !format?.depths.includes(depth) ||
    bytes[26] !== 0 ||
    bytes[27] !== 0 ||
    bytes[28] !== 0
  )
    throw new Error("invalid_image");
  const rowBytes = Math.ceil((width * depth * format.channels) / 8),
    stride = rowBytes + 1,
    decodedLimit = stride * height;
  const data: Uint8Array[] = [];
  let offset = 8,
    ended = false,
    dataEnded = false,
    paletteEntries = 0,
    transparency = false;
  while (offset + 12 <= bytes.byteLength) {
    const length = view.getUint32(offset),
      end = offset + 12 + length;
    if (
      end > bytes.byteLength ||
      crc32(bytes.subarray(offset + 4, end - 4)) !== view.getUint32(end - 4)
    )
      throw new Error("invalid_image");
    const type = String.fromCharCode(...bytes.slice(offset + 4, offset + 8));
    if (
      !/^[A-Za-z]{2}[A-Z][A-Za-z]$/.test(type) ||
      ["acTL", "fcTL", "fdAT"].includes(type)
    )
      throw new Error("invalid_image");
    if (type !== "IDAT" && data.length) dataEnded = true;
    if (type === "IHDR") {
      if (offset !== 8 || length !== 13) throw new Error("invalid_image");
    } else if (type === "PLTE") {
      if (
        paletteEntries ||
        data.length ||
        transparency ||
        color === 0 ||
        color === 4 ||
        length < 3 ||
        length > 768 ||
        length % 3 ||
        (color === 3 && length / 3 > 2 ** depth)
      )
        throw new Error("invalid_image");
      paletteEntries = length / 3;
    } else if (type === "tRNS") {
      if (
        transparency ||
        data.length ||
        !(
          (color === 0 && length === 2) ||
          (color === 2 && length === 6) ||
          (color === 3 &&
            paletteEntries &&
            length >= 1 &&
            length <= paletteEntries)
        )
      )
        throw new Error("invalid_image");
      transparency = true;
    } else if (type === "IDAT") {
      if (dataEnded || (color === 3 && !paletteEntries))
        throw new Error("invalid_image");
      data.push(bytes.subarray(offset + 8, end - 4));
    } else if (type === "IEND") {
      if (length !== 0 || end !== bytes.byteLength)
        throw new Error("invalid_image");
      ended = true;
    } else if (/^[A-Z]/.test(type)) throw new Error("invalid_image");
    offset = end;
  }
  if (!data.length || !ended || offset !== bytes.byteLength)
    throw new Error("invalid_image");
  const compressed = Buffer.concat(data);
  let rows: Uint8Array;
  try {
    // maxOutputLength is enforced before allocation grows beyond these fixed dimensions.
    // info exposes consumed input, so runtimes predating rejectGarbageAfterEnd also reject trailing data.
    const decoded = inflateSync(compressed, {
      maxOutputLength: decodedLimit,
      info: true,
    }) as unknown as { buffer: Uint8Array; engine: { bytesWritten: number } };
    if (
      decoded.buffer.byteLength !== decodedLimit ||
      decoded.engine.bytesWritten !== compressed.byteLength
    )
      throw new Error("invalid_image");
    rows = decoded.buffer;
  } catch {
    throw new Error("invalid_image");
  }
  let previous = new Uint8Array(rowBytes),
    current = new Uint8Array(rowBytes);
  for (let y = 0; y < height; y++) {
    const start = y * stride,
      filter = rows[start];
    if (filter > 4) throw new Error("invalid_image");
    if (color !== 3 || paletteEntries === 2 ** depth) continue;
    // Indexed pixels must address the actual palette. Reverse the byte filters before reading packed indexes.
    for (let x = 0; x < rowBytes; x++) {
      const left = x ? current[x - 1] : 0,
        above = previous[x],
        upperLeft = x ? previous[x - 1] : 0;
      const adjustment = [
        0,
        left,
        above,
        Math.floor((left + above) / 2),
        paeth(left, above, upperLeft),
      ][filter];
      current[x] = (rows[start + 1 + x] + adjustment) & 255;
    }
    for (let x = 0; x < width; x++) {
      const bit = x * depth,
        index =
          (current[Math.floor(bit / 8)] >> (8 - depth - (bit % 8))) &
          (2 ** depth - 1);
      if (index >= paletteEntries) throw new Error("invalid_image");
    }
    const swap = previous;
    previous = current;
    current = swap;
  }
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
