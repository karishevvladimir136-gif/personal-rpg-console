// The length of an audio file from its bytes, without decoding: WAV from the
// header, MP3 from the Xing/Info frame or by walking the frames. Null when the
// container is not understood (the player then reads the length after decoding).
// Pure; used by the server on uploads and generated tracks.
import { sniffAudio } from "./models.ts";

const MPEG_BITRATES: Record<string, number[]> = {
  // kbps by bitrate index (1..14) for MPEG1 layer III, MPEG2/2.5 layer III.
  "1-3": [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320],
  "2-3": [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160],
  "1-2": [0, 32, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 384],
  "2-2": [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160],
  "1-1": [0, 32, 64, 96, 128, 160, 192, 224, 256, 288, 320, 352, 384, 416, 448],
  "2-1": [0, 32, 48, 56, 64, 80, 96, 112, 128, 144, 160, 176, 192, 224, 256],
};
const SAMPLE_RATES: Record<string, number[]> = { "1": [44100, 48000, 32000], "2": [22050, 24000, 16000], "2.5": [11025, 12000, 8000] };

type Frame = { length: number; samples: number; sampleRate: number; version: "1" | "2" | "2.5"; layer: number; channels: number };

function mpegFrame(bytes: Uint8Array, at: number): Frame | null {
  if (at + 4 > bytes.length || bytes[at] !== 0xff || (bytes[at + 1] & 0xe0) !== 0xe0) return null;
  const versionBits = (bytes[at + 1] >> 3) & 3, layerBits = (bytes[at + 1] >> 1) & 3;
  if (versionBits === 1 || layerBits === 0) return null;
  const version = versionBits === 3 ? "1" : versionBits === 2 ? "2" : "2.5";
  const layer = 4 - layerBits;
  const bitrateIndex = bytes[at + 2] >> 4, rateIndex = (bytes[at + 2] >> 2) & 3, padding = (bytes[at + 2] >> 1) & 1;
  if (bitrateIndex === 0 || bitrateIndex === 15 || rateIndex === 3) return null;
  const kbps = MPEG_BITRATES[`${version === "1" ? 1 : 2}-${layer}`][bitrateIndex];
  const sampleRate = SAMPLE_RATES[version][rateIndex];
  const samples = layer === 1 ? 384 : layer === 2 || version === "1" ? 1152 : 576;
  const length = layer === 1 ? ((12 * kbps * 1000) / sampleRate + padding) * 4 : Math.floor((samples / 8) * kbps * 1000 / sampleRate) + padding;
  const channels = ((bytes[at + 3] >> 6) & 3) === 3 ? 1 : 2;
  return { length: Math.floor(length), samples, sampleRate, version, layer, channels };
}

export function mp3DurationMs(bytes: Uint8Array): number | null {
  let at = 0;
  if (bytes.length > 10 && bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) {
    const size = ((bytes[6] & 0x7f) << 21) | ((bytes[7] & 0x7f) << 14) | ((bytes[8] & 0x7f) << 7) | (bytes[9] & 0x7f);
    at = 10 + size + ((bytes[5] & 0x10) ? 10 : 0);
  }
  // Find the first frame that is followed by another valid frame (not a false sync).
  let first: Frame | null = null;
  for (; at < bytes.length - 4 && at < 1_000_000; at += 1) {
    const frame = mpegFrame(bytes, at);
    if (frame && frame.length > 4 && (at + frame.length >= bytes.length || mpegFrame(bytes, at + frame.length))) { first = frame; break; }
  }
  if (!first) return null;
  // A Xing/Info header carries the frame count of a VBR file.
  const sideInfo = first.version === "1" ? (first.channels === 1 ? 17 : 32) : first.channels === 1 ? 9 : 17;
  const tagAt = at + 4 + sideInfo;
  const tag = bytes.length > tagAt + 16 ? String.fromCharCode(bytes[tagAt], bytes[tagAt + 1], bytes[tagAt + 2], bytes[tagAt + 3]) : "";
  if (tag === "Xing" || tag === "Info") {
    const flags = bytes[tagAt + 7];
    if (flags & 1) {
      const frames = (bytes[tagAt + 8] << 24) | (bytes[tagAt + 9] << 16) | (bytes[tagAt + 10] << 8) | bytes[tagAt + 11];
      // The Info frame itself holds no audio.
      return Math.round(((frames - 1) * first.samples * 1000) / first.sampleRate);
    }
  }
  let frames = 0, position = at;
  while (position + 4 <= bytes.length) {
    const frame = mpegFrame(bytes, position);
    if (!frame || frame.length < 4) break;
    frames += 1;
    position += frame.length;
  }
  return frames ? Math.round((frames * first.samples * 1000) / first.sampleRate) : null;
}

export function wavDurationMs(bytes: Uint8Array): number | null {
  if (bytes.length < 44) return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let at = 12, byteRate = 0;
  while (at + 8 <= bytes.length) {
    const id = String.fromCharCode(bytes[at], bytes[at + 1], bytes[at + 2], bytes[at + 3]);
    const size = view.getUint32(at + 4, true);
    if (id === "fmt " && at + 24 <= bytes.length) byteRate = view.getUint32(at + 16, true);
    if (id === "data") return byteRate > 0 ? Math.round((Math.min(size, bytes.length - at - 8) * 1000) / byteRate) : null;
    at += 8 + size + (size % 2);
  }
  return null;
}

/** Milliseconds of audio in the file, or null when unknown. */
export function audioDurationMs(bytes: Uint8Array): number | null {
  switch (sniffAudio(bytes)) {
    case "audio/mpeg": return mp3DurationMs(bytes);
    case "audio/wav": return wavDurationMs(bytes);
    default: return null;
  }
}
