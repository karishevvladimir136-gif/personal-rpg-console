import { must, protocol } from "./protocol.ts";
export type Request = {
  url: string;
  method: "GET" | "POST";
  headers: Record<string, string>;
  body?: string;
  limit: number;
  timeoutMs: number;
};
export type Reply = {
  status: number;
  url: string;
  headers: Record<string, string>;
  bytes: Buffer;
};
export type Transport = (request: Request) => Promise<Reply>;
export function httpTransport(fetcher: typeof fetch = fetch): Transport {
  return async (request) => {
    const response = await fetcher(request.url, {
      method: request.method,
      headers: request.headers,
      body: request.body,
      redirect: "manual",
      signal: AbortSignal.timeout(request.timeoutMs),
    });
    must(
      response.status === 200 && response.url === request.url,
      "http_or_redirect_failure",
    );
    const declared = response.headers.get("content-length");
    if (declared !== null)
      must(
        Number.isSafeInteger(Number(declared)) &&
          Number(declared) <= request.limit,
        "response_too_large",
      );
    must(response.body, "missing_body");
    const reader = response.body.getReader(),
      parts: Uint8Array[] = [];
    let size = 0;
    try {
      while (true) {
        const r = await reader.read();
        if (r.done) break;
        size += r.value.length;
        must(size <= request.limit, "response_too_large");
        parts.push(r.value);
      }
    } catch (error) {
      await reader.cancel();
      throw error;
    }
    const headers: Record<string, string> = {};
    for (const key of [
      "content-type",
      "x-fal-request-id",
      "x-fal-billable-units",
      "x-fal-served-from",
    ]) {
      const v = response.headers.get(key);
      if (v !== null) headers[key] = v;
    }
    return {
      status: response.status,
      url: response.url,
      headers,
      bytes: Buffer.concat(parts),
    };
  };
}
export function authHeaders(
  provider: string,
  credentials: Record<string, string>,
  submission: boolean,
): Record<string, string> {
  const value = credentials[provider];
  must(value && !/[\r\n]/.test(value), "credentials_missing");
  if (provider === "worldlabs")
    return { "WLT-Api-Key": value, "Content-Type": "application/json" };
  return {
    Authorization: `Key ${value}`,
    "Content-Type": "application/json",
    ...(submission ? protocol.falHeaders : {}),
  };
}
