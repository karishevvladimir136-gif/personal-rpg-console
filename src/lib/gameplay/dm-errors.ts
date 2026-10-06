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

// A valid source can be too large even after all optional evidence is removed.
// Keep the public error category stable while distinguishing this from a stale
// or incomplete Memory projection inside the server.
export class ContextCapacityError extends DmError {
  readonly summaryMayHelp: boolean;
  constructor(summaryMayHelp = false) {
    super("context");
    this.name = "ContextCapacityError";
    this.message = "context_capacity_mandatory";
    this.summaryMayHelp = summaryMayHelp;
  }
}
