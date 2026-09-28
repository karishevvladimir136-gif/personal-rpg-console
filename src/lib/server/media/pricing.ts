import type {
  FrameParameters,
  FrameUsage,
} from "../../visual-frame/real-frame.ts";
// Verified 2026-09-27 against the official GPT Image 2.5 output calculator.
// https://developers.openai.com/api/docs/guides/image-generation#costs
export const MAX_FRAME_PROMPT_UTF8 = 60_000;
export const FRAME_RESERVATION_USD_MICROS = 400_000;
export function imageOutputTokens(parameters: FrameParameters) {
  const [width, height] = parameters.size.split("x").map(Number);
  const longGrid = { low: 16, medium: 24, high: 48 }[parameters.quality];
  const raw = longGrid / (Math.max(width, height) / Math.min(width, height));
  const floor = Math.floor(raw);
  const shortGrid = raw - floor === 0.5 ? floor + (floor % 2) : Math.round(raw);
  return Math.ceil(
    (longGrid * shortGrid * (2_000_000 + width * height)) / 4_000_000,
  );
}
export function textOnlyReservationFloor(
  prompt: string,
  parameters: FrameParameters,
) {
  const bytes = new TextEncoder().encode(prompt).length;
  if (bytes > MAX_FRAME_PROMPT_UTF8) throw new Error("validation");
  // A UTF8 byte-level tokenization upper bound; direct Images uses no cached-input discount.
  return bytes * 5 + imageOutputTokens(parameters) * 30;
}
export function reportedUsageCost(usage: FrameUsage | null): number | null {
  return usage === null
    ? null
    : usage.textInputTokens * 5 +
        usage.imageInputTokens * 8 +
        usage.outputTokens * 30;
}
