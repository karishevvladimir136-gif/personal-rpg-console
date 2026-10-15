import "server-only";
import { DmError } from "../../gameplay/dm-errors.ts";
import type { TurnFailure } from "../../gameplay/contracts.ts";
import type { ProviderTransportDiagnostic } from "./provider.ts";

// Fixed codes only: never derive a diagnostic value from model output or a
// provider error. This diagnostic is private to the server process.
export const PLAN_DIAGNOSTIC_REASONS = [
  "output_message_shape",
  "output_content_shape",
  "output_chunk_count",
  "output_json_invalid",
  "output_semantic_invalid",
  "decision_root_shape",
  "decision_tool_shape",
  "decision_tool_selection",
  "decision_final_shape",
  "decision_final_limits",
  "decision_change_shape",
  "decision_change_scope",
  "decision_effect_scope",
  "decision_effect_shape",
  "decision_effect_kind",
  "decision_effect_fields",
  "decision_rest_safety",
  "decision_rest_kind",
  "decision_mechanic_actions",
  "decision_public_narration_shape",
  "decision_public_narration_bounds",
  "narration_contract_invalid",
  "narration_clarification_present",
] as const;
export type PlanDiagnosticReasonCode = typeof PLAN_DIAGNOSTIC_REASONS[number];
const allowedReasons: ReadonlySet<string> = new Set(PLAN_DIAGNOSTIC_REASONS);

export type PlanDiagnostic = {
  httpStatus: number | null;
  phase: ProviderTransportDiagnostic["phase"];
  resultStatus: TurnFailure | "success";
  reasonCode: PlanDiagnosticReasonCode | null;
};

const validationReasons = new WeakMap<DmError, PlanDiagnosticReasonCode>();

export class PlanValidationError extends DmError {
  constructor(reasonCode: PlanDiagnosticReasonCode) {
    super("validation");
    if (allowedReasons.has(reasonCode)) validationReasons.set(this, reasonCode);
  }
}

export function planValidationReason(error: unknown): PlanDiagnosticReasonCode | null {
  const reason = error instanceof DmError ? validationReasons.get(error) : null;
  return reason && allowedReasons.has(reason) ? reason : null;
}

export function planValidation(reasonCode: PlanDiagnosticReasonCode): never {
  throw new PlanValidationError(reasonCode);
}
