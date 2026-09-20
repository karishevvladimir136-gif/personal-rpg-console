import { lookup } from "node:dns/promises";
import { request as httpsRequest } from "node:https";
import { BlockList, isIP } from "node:net";
import { must, safeFailureReason } from "./protocol.ts";
import { validatedAssetURL } from "./outputs.ts";
import type { Request, Reply, Transport } from "./transport.ts";

// Conservative global-unicast filter. Transitional/mapped/local/documentation space is excluded.
const blocked4 = new BlockList();
for (const [address, prefix] of [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.0.2.0", 24],
  ["192.88.99.0", 24],
  ["192.168.0.0", 16],
  ["198.18.0.0", 15],
  ["198.51.100.0", 24],
  ["203.0.113.0", 24],
  ["224.0.0.0", 4],
  ["240.0.0.0", 4],
] as const)
  blocked4.addSubnet(address, prefix, "ipv4");
const global6 = new BlockList(),
  blocked6 = new BlockList();
global6.addSubnet("2000::", 3, "ipv6");
blocked6.addSubnet("2001::", 23, "ipv6");
blocked6.addSubnet("2001:db8::", 32, "ipv6");
blocked6.addSubnet("2002::", 16, "ipv6");
blocked6.addSubnet("3fff::", 20, "ipv6");
export function isPublicAddress(address: string): boolean {
  if (isIP(address) === 4) return !blocked4.check(address, "ipv4");
  return (
    isIP(address) === 6 &&
    !address.includes("%") &&
    global6.check(address, "ipv6") &&
    !blocked6.check(address, "ipv6")
  );
}
type Address = { address: string; family: number };
type Resolver = (hostname: string) => Promise<Address[]>;
export function assetDownloadTransport(
  resolve: Resolver = (hostname) =>
    lookup(hostname, { all: true, verbatim: true }),
  connect: typeof httpsRequest = httpsRequest,
): Transport {
  return async (request: Request): Promise<Reply> => {
    must(
      request.asset && request.url === validatedAssetURL(request.asset),
      "asset_request_mismatch",
    );
    must(
      request.method === "GET" &&
        request.body === undefined &&
        Object.keys(request.headers).length === 0,
      "asset_credentials_forbidden",
    );
    const url = new URL(request.url),
      deadline = Date.now() + request.timeoutMs;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let addresses: Address[];
    try {
      addresses = await Promise.race([
        resolve(url.hostname),
        new Promise<never>((_, reject) => {
          timer = setTimeout(() => {
            try {
              must(false, "asset_timeout");
            } catch (e) {
              reject(e);
            }
          }, request.timeoutMs);
        }),
      ]);
    } catch (error) {
      if (safeFailureReason(error) === "asset_timeout") throw error;
      must(false, "asset_dns_failure");
    } finally {
      clearTimeout(timer);
    }
    must(
      addresses.length > 0 &&
        addresses.every(
          (a) => isIP(a.address) === a.family && isPublicAddress(a.address),
        ),
      "asset_destination_not_public",
    );
    const selected = addresses[0];
    must(Date.now() < deadline, "asset_timeout");
    try {
      return await new Promise<Reply>((resolveReply, reject) => {
        const req = connect(
          url,
          {
            method: "GET",
            headers: {},
            agent: false,
            ...({ autoSelectFamily: false } satisfies {
              autoSelectFamily: boolean;
            }),
            family: selected.family,
            servername: url.hostname,
            rejectUnauthorized: true,
            // No second DNS resolution and no alternate-address connection retry.
            lookup: (hostname, _options, callback) => {
              if (hostname !== url.hostname)
                callback(new Error("asset_request_mismatch"), "", 0);
              else callback(null, selected.address, selected.family);
            },
            signal: AbortSignal.timeout(Math.max(1, deadline - Date.now())),
          },
          async (response) => {
            try {
              // node:https does not follow redirects; reject every non-200 without a second request.
              must(response.statusCode === 200, "http_or_redirect_failure");
              const declared = response.headers["content-length"];
              if (declared !== undefined)
                must(
                  Number.isSafeInteger(Number(declared)) &&
                    Number(declared) >= 0 &&
                    Number(declared) <= request.limit,
                  "response_too_large",
                );
              const parts: Buffer[] = [];
              let size = 0;
              for await (const chunk of response) {
                const bytes = Buffer.from(chunk);
                size += bytes.length;
                must(size <= request.limit, "response_too_large");
                parts.push(bytes);
              }
              resolveReply({
                status: 200,
                url: request.url,
                headers: {
                  ...(typeof response.headers["content-type"] === "string"
                    ? { "content-type": response.headers["content-type"] }
                    : {}),
                },
                bytes: Buffer.concat(parts),
              });
            } catch (error) {
              response.destroy();
              req.destroy();
              reject(error);
            }
          },
        );
        req.once("error", reject);
        req.end();
      });
    } catch (error) {
      if (safeFailureReason(error) !== "unexplained_or_invalid_response")
        throw error;
      must(false, "asset_network_failure");
    }
  };
}
