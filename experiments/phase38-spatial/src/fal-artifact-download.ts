import { lookup } from "node:dns/promises";
import { request as httpsRequest } from "node:https";
import { isIP } from "node:net";
import { createHash } from "node:crypto";
import {
  closeSync,
  existsSync,
  fsyncSync,
  lstatSync,
  openSync,
  linkSync,
  unlinkSync,
  writeSync,
} from "node:fs";
import { join } from "node:path";
import { isPublicAddress } from "./asset-download.ts";
import {
  artifact as c,
  capabilityURL,
  type ArtifactCapability,
} from "./fal-artifact-contract.ts";
import {
  requireRetrieval as check,
  retrievalReason,
} from "./fal-retrieval-contract.ts";
import type { Dict } from "./protocol.ts";
export type AssetReply = {
  status: number;
  headers: Record<string, string | string[] | undefined>;
  body: AsyncIterable<Uint8Array>;
  destroy: () => void;
};
type Address = { address: string; family: number };
type Resolver = (host: string) => Promise<Address[]>;
export async function openPinnedAsset(
  cap: ArtifactCapability,
  timeoutMs: number,
  resolve: Resolver = (host) => lookup(host, { all: true, verbatim: true }),
  connect: typeof httpsRequest = httpsRequest,
): Promise<AssetReply> {
  const u = new URL(capabilityURL(cap)),
    deadline = Date.now() + timeoutMs;
  check(
    u.protocol === "https:" &&
      u.hostname === "storage.googleapis.com" &&
      !u.username &&
      !u.password &&
      !u.port,
    "artifact_connection_fence",
  );
  let timer: ReturnType<typeof setTimeout> | undefined;
  let addresses: Address[];
  try {
    addresses = await Promise.race([
      resolve(u.hostname),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error("timeout")), timeoutMs);
      }),
    ]);
  } catch {
    check(false, "artifact_dns_or_timeout");
  } finally {
    clearTimeout(timer);
  }
  check(
    addresses.length > 0 &&
      addresses.length <= c.limits.maxDNSAnswers &&
      addresses.every(
        (a) => isIP(a.address) === a.family && isPublicAddress(a.address),
      ),
    "artifact_non_public_destination",
  );
  const chosen = addresses[0];
  check(Date.now() < deadline, "artifact_download_timeout");
  return new Promise((resolveReply, reject) => {
    const req = connect(
      u,
      {
        method: "GET",
        headers: {},
        agent: false,
        ...({ autoSelectFamily: false } satisfies {
          autoSelectFamily: boolean;
        }),
        family: chosen.family,
        servername: u.hostname,
        rejectUnauthorized: true,
        signal: AbortSignal.timeout(Math.max(1, deadline - Date.now())),
        lookup: (hostname, _options, callback) => {
          if (hostname !== u.hostname)
            callback(new Error("host_mismatch"), "", 0);
          else callback(null, chosen.address, chosen.family);
        },
      },
      (res) => {
        // node:https follows no redirects and performs no alternate-address retry. No secret header is accepted.
        resolveReply({
          status: res.statusCode ?? 0,
          headers: res.headers,
          body: res,
          destroy: () => {
            res.destroy();
            req.destroy();
          },
        });
      },
    );
    req.once("error", () => reject(new Error("asset_transport_failed")));
    req.end();
  });
}
const consumed = new WeakSet<ArtifactCapability>();
export async function streamArtifact(
  cap: ArtifactCapability,
  root: string,
  record: (kind: string, data: Dict) => void,
  deps: {
    open?: typeof openPinnedAsset;
    timeoutMs?: number;
    maxBytes?: number;
  } = {},
) {
  capabilityURL(cap);
  check(!consumed.has(cap), "artifact_capability_consumed");
  consumed.add(cap);
  check(
    lstatSync(root).isDirectory() && !lstatSync(root).isSymbolicLink(),
    "artifact_private_directory",
  );
  const limit = Math.min(
    c.limits.maxAssetBytes,
    deps.maxBytes ?? c.limits.maxAssetBytes,
  );
  check(
    cap.expectedBytes > 0 && cap.expectedBytes <= limit,
    "artifact_expected_size_limit",
  );
  const file = join(root, "artifact.zip.partial"),
    target = join(root, "artifact.zip");
  // Exclusive file creation and durable begin/request ledger prevent restart or partial-file reuse.
  check(!existsSync(target), "artifact_existing_completed_file");
  const fd = openSync(file, "wx"),
    digest = createHash("sha256");
  let bytes = 0,
    reply: AssetReply | undefined,
    closed = false;
  const finish = () => {
    if (!closed) {
      fsyncSync(fd);
      closeSync(fd);
      closed = true;
    }
  };
  try {
    reply = await (deps.open ?? openPinnedAsset)(
      cap,
      Math.min(
        deps.timeoutMs ?? c.limits.assetTimeoutMs,
        c.limits.assetTimeoutMs,
      ),
    );
    record("artifact_http", {
      stage: "asset",
      httpStatus: reply.status,
      redirect: reply.status >= 300 && reply.status < 400,
      urlHash: cap.urlHash,
      exactRequestedURL: true,
    });
    check(reply.status === 200, "artifact_asset_http_or_redirect");
    const length = reply.headers["content-length"];
    check(
      length === undefined ||
        (typeof length === "string" &&
          /^[0-9]+$/.test(length) &&
          Number(length) === cap.expectedBytes),
      "artifact_content_length",
    );
    const type = reply.headers["content-type"];
    check(
      type === undefined ||
        (typeof type === "string" &&
          [
            "application/octet-stream",
            "application/zip",
            "application/x-zip-compressed",
          ].includes(type.split(";", 1)[0].trim().toLowerCase())),
      "artifact_asset_content_type",
    );
    const encoding = reply.headers["content-encoding"];
    check(
      encoding === undefined || encoding === "identity",
      "artifact_content_encoding",
    );
    for await (const part of reply.body) {
      check(bytes + part.byteLength <= limit, "artifact_byte_overflow");
      let off = 0;
      while (off < part.length) {
        const count = writeSync(fd, part, off, part.length - off);
        check(count > 0, "artifact_disk_write");
        digest.update(part.subarray(off, off + count));
        off += count;
        bytes += count;
      }
    }
    check(bytes === cap.expectedBytes, "artifact_final_size");
    finish();
    linkSync(file, target);
    unlinkSync(file);
    const info = {
      complete: true,
      bytes,
      sha256: digest.copy().digest("hex"),
      file: "artifact.zip",
    };
    record("artifact_file", info);
    return { path: target, ...info };
  } catch (error) {
    reply?.destroy();
    finish();
    record("artifact_file", {
      complete: false,
      bytes,
      sha256: digest.copy().digest("hex"),
      file: "artifact.zip.partial",
      reason: retrievalReason(error),
    });
    if (retrievalReason(error) === "unexplained_or_invalid_response")
      check(false, "artifact_stream_failure");
    throw error;
  } finally {
    reply?.destroy();
    if (!closed) closeSync(fd);
  }
}
