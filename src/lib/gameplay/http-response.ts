import { publicJson } from "../persistence/route-response.ts";

const statuses = {
  unauthenticated: 401,
  forbidden: 403,
  not_found: 404,
  conflict: 409,
  validation: 422,
  context: 422,
  configuration: 503,
  not_configured: 503,
  provider: 503,
  unavailable: 503,
} as const;
export function safeGameplayError(cause: unknown) {
  const candidate =
    cause && typeof cause === "object" && "code" in cause
      ? String(cause.code)
      : "unavailable";
  const code = Object.hasOwn(statuses, candidate)
    ? (candidate as keyof typeof statuses)
    : "unavailable";
  return { status: statuses[code], body: { error: { code, message: code } } };
}
export function gameplayErrorResponse(cause: unknown) {
  const error = safeGameplayError(cause);
  return publicJson(error.body, error.status);
}
