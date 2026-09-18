import "server-only";
import type { ErrorCode } from "../persistence/contracts";

const messages: Record<ErrorCode, string> = {
  unauthenticated: "Please sign in to continue.",
  forbidden: "This account does not have access.",
  not_configured: "Persistence setup is required.",
  validation: "Please check the entered values.",
  conflict: "This record changed. Reload before saving again.",
  not_found: "This record was not found.",
  unavailable:
    "The service is unavailable. Your changes have not been confirmed.",
};
export class PersistenceError extends Error {
  readonly code: ErrorCode;
  constructor(code: ErrorCode) {
    super(messages[code]);
    this.code = code;
  }
}
export function databaseError(error: {
  code?: string;
  message?: string;
}): PersistenceError {
  if (error.code === "P0001" && error.message === "rpg_conflict")
    return new PersistenceError("conflict");
  if (error.code === "P0001" && error.message === "rpg_not_found")
    return new PersistenceError("not_found");
  if (error.code === "42501") return new PersistenceError("forbidden");
  if (
    error.code?.startsWith("22") ||
    error.code?.startsWith("23") ||
    error.code === "P0001"
  )
    return new PersistenceError("validation");
  return new PersistenceError("unavailable");
}
