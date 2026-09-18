import type { TurnFailure } from "./contracts.ts";

// Never attach a provider response, SQL error, prompt or private-state cause.
export class DmError extends Error {
  readonly code: TurnFailure;
  readonly retryable: boolean;
  constructor(code: TurnFailure, retryable = false) {
    super(code);
    this.name = "DmError";
    this.code = code;
    this.retryable = retryable;
  }
}
