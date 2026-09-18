import { safeError } from "./http-policy";

export const noStoreHeaders = {
  "Cache-Control": "private, no-store, max-age=0",
  Vary: "Cookie",
};
export function publicJson(value: unknown, status = 200) {
  return Response.json(value, { status, headers: noStoreHeaders });
}
export function errorResponse(cause: unknown) {
  const error = safeError(cause);
  return publicJson(error.body, error.status);
}
