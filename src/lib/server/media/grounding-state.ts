import type { FrameGroundingVerdict } from "../../visual-frame/closed-world.ts";
import { parseFrameGroundingVerdict } from "../../visual-frame/closed-world.ts";
import type { FrameSafetyVerdict } from "../../visual-frame/illustration-review.ts";
import { parseFrameSafetyVerdict } from "../../visual-frame/illustration-review.ts";
import { exactKeys } from "../../visual-frame/real-frame.ts";

// Operational presentation evidence only. This receipt is never a gameplay patch.
export type FrameCheckResult = {
  schemaVersion: 1 | 2;
  verdict: FrameGroundingVerdict | FrameSafetyVerdict;
  actualModel: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
};
export const FRAME_CHECK_MODEL = "gpt-5.4";
export const FRAME_CHECK_REASONING = "high";
export const FRAME_CHECK_RESERVATION_USD_MICROS = 200_000;
export const FRAME_CHECK_INPUT_CEILING = 20_000;
export const FRAME_CHECK_OUTPUT_CAP = 4_096;
export function isFrameCheckResult(value: unknown): value is FrameCheckResult {
  return (
    exactKeys(value, [
      "schemaVersion",
      "verdict",
      "actualModel",
      "inputTokens",
      "outputTokens",
      "latencyMs",
    ]) &&
    ((value.schemaVersion === 1 &&
      parseFrameGroundingVerdict(value.verdict) !== null) ||
      (value.schemaVersion === 2 &&
        parseFrameSafetyVerdict(value.verdict) !== null)) &&
    typeof value.actualModel === "string" &&
    /^gpt-5\.4(?:-\d{4}-\d{2}-\d{2})?$/.test(value.actualModel) &&
    Number.isSafeInteger(value.inputTokens) &&
    (value.inputTokens as number) >= 0 &&
    (value.inputTokens as number) <= FRAME_CHECK_INPUT_CEILING &&
    Number.isSafeInteger(value.outputTokens) &&
    (value.outputTokens as number) >= 0 &&
    (value.outputTokens as number) <= FRAME_CHECK_OUTPUT_CAP &&
    Number.isSafeInteger(value.latencyMs) &&
    (value.latencyMs as number) >= 0 &&
    (value.latencyMs as number) <= 180_000
  );
}
