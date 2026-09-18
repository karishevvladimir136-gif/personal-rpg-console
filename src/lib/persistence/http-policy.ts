import type { ErrorCode } from "./contracts.ts";

const statuses: Record<ErrorCode, number> = {
  unauthenticated: 401,
  forbidden: 403,
  not_configured: 503,
  validation: 422,
  conflict: 409,
  not_found: 404,
  unavailable: 503,
};
export function safeError(error: unknown) {
  const candidate =
    error && typeof error === "object" && "code" in error
      ? String(error.code)
      : "unavailable";
  const code = Object.hasOwn(statuses, candidate)
    ? (candidate as ErrorCode)
    : "unavailable";
  return { status: statuses[code], body: { error: { code, message: code } } };
}
export class RequestError extends Error {
  code: ErrorCode;
  constructor(code: ErrorCode) {
    super(code);
    this.code = code;
  }
}
export async function readWriteRequest(request: Request): Promise<unknown> {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin)
    throw new RequestError("forbidden");
  if (
    request.headers.get("content-type")?.split(";")[0].trim() !==
    "application/json"
  )
    throw new RequestError("validation");
  const limit = 1_000_000;
  if (Number(request.headers.get("content-length")) > limit)
    throw new RequestError("validation");
  if (!request.body) throw new RequestError("validation");
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let size = 0;
  let body = "";
  try {
    for (;;) {
      const chunk = await reader.read();
      if (chunk.done) break;
      size += chunk.value.byteLength;
      if (size > limit) {
        await reader.cancel();
        throw new RequestError("validation");
      }
      body += decoder.decode(chunk.value, { stream: true });
    }
    body += decoder.decode();
    return JSON.parse(body);
  } catch (cause) {
    if (cause instanceof RequestError) throw cause;
    throw new RequestError("validation");
  } finally {
    reader.releaseLock();
  }
}
