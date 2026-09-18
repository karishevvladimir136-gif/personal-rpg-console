import type { TurnFailure } from "./contracts.ts";

/** Safe categories only: never carry a provider, SQL, or private-state cause. */
export class TurnError extends Error {
  code: TurnFailure;
  retryable: boolean;
  constructor(code: TurnFailure = "validation", retryable = false) {
    super(`Gameplay ${code}`);
    this.name = "TurnError";
    this.code = code;
    this.retryable = retryable;
  }
}

export function requireRule(value: unknown): asserts value {
  if (!value) throw new TurnError("validation");
}

export function safeTurnFailure(error: unknown) {
  const codes: TurnFailure[] = [
    "configuration",
    "provider",
    "context",
    "validation",
    "conflict",
    "unavailable",
  ];
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    codes.includes(error.code as TurnFailure)
  ) {
    return {
      code: error.code as TurnFailure,
      retryable:
        "retryable" in error &&
        error.retryable === true &&
        error.code !== "conflict",
    };
  }
  return { code: "unavailable" as TurnFailure, retryable: true };
}
