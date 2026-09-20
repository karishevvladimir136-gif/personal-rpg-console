import { readFileSync } from "node:fs";
import { join } from "node:path";
import { experimentRoot } from "./freeze.ts";
import { canonical, hash, object, parseJSON, type Dict } from "./protocol.ts";
import { diagnostic, diagnosticHash } from "./fal-host-diagnostic-state.ts";
import { sanitizeWorldFile } from "./fal-host-diagnostic-metadata.ts";
import {
  requireRetrieval as check,
  validateResultIdentity,
} from "./fal-retrieval-contract.ts";
export type ArtifactContract = {
  version: string;
  sourceEvidenceCommit: string;
  sourceEvidenceFile: string;
  sourceEvidenceSHA256: string;
  diagnosticExecutionSHA: string;
  diagnosticIdentity: string;
  diagnosticHash: string;
  diagnosticTerminalDigest: string;
  diagnosticFiles: Record<string, string>;
  bindings: Dict;
  requestId: string;
  provider: string;
  model: string;
  resultURL: string;
  resultBodySHA256: string;
  descriptor: Dict;
  limits: Record<string, number>;
  zip: Record<string, number>;
  accounting: Dict;
};
export const artifact = JSON.parse(
  readFileSync(join(experimentRoot, "fal-exact-artifact.json"), "utf8"),
) as ArtifactContract;
function freeze(x: unknown) {
  if (x && typeof x === "object") {
    Object.freeze(x);
    Object.values(x).forEach(freeze);
  }
}
freeze(artifact);
export const artifactHash = hash(canonical(artifact));
check(
  artifact.diagnosticHash === diagnosticHash &&
    artifact.diagnosticIdentity === diagnostic.version &&
    artifact.requestId === diagnostic.requestId &&
    artifact.model === diagnostic.model &&
    artifact.resultURL === diagnostic.resultURL &&
    artifact.resultBodySHA256 ===
      diagnostic.bindings.previousResultBodySHA256 &&
    artifact.provider === diagnostic.provider &&
    canonical(artifact.bindings) === canonical(diagnostic.bindings) &&
    canonical(artifact.accounting) ===
      canonical({
        ...diagnostic.accounting,
        historicalAPIRequests:
          Number(diagnostic.accounting.historicalAPIRequests) + 1,
      }),
  "artifact_contract_binding",
);
export type ArtifactCapability = Readonly<{
  urlHash: string;
  expectedBytes: number;
}>;
const capabilities = new WeakMap<ArtifactCapability, string>();
// Pins override is a deterministic synthetic unit-test seam, never a CLI/operator option.
export function qualifyArtifact(
  bytes: Buffer,
  pins: ArtifactContract = artifact,
) {
  check(hash(bytes) === pins.resultBodySHA256, "artifact_changed_result_body");
  const value = validateResultIdentity(parseJSON(bytes.toString("utf8")));
  const d = object(value.world_file),
    url = validateDescriptor(d, pins.descriptor);
  const cap = Object.freeze({
    urlHash: hash(url),
    expectedBytes: Number(pins.descriptor.fileSize),
  });
  capabilities.set(cap, url);
  return {
    cap,
    identity: {
      requestId: pins.requestId,
      actualModel: value.model ?? null,
      providerReportedRequestId: value.request_id ?? null,
    },
    descriptor: sanitizeWorldFile(d),
  };
}
export function validateDescriptor(
  d: Dict,
  expected: Dict = artifact.descriptor,
): string {
  check(
    typeof d.url === "string" && d.url.length <= 8192,
    "artifact_url_shape",
  );
  const s = d.url;
  check(
    /^https:\/\//.test(s) && !/[\\\s\x00-\x1f\x7f]/.test(s),
    "artifact_https_required",
  );
  let u: URL;
  try {
    u = new URL(s);
  } catch {
    check(false, "artifact_url_invalid");
  }
  const authority = s.slice(8).split(/[/?#]/, 1)[0];
  check(
    u.protocol === "https:" &&
      !u.username &&
      !u.password &&
      !authority.includes("@"),
    "artifact_credentials_or_scheme",
  );
  check(
    !authority.includes(":") && !s.includes("#"),
    "artifact_port_or_fragment",
  );
  check(
    u.hostname === expected.hostname && u.hostname === "storage.googleapis.com",
    "artifact_hostname",
  );
  check(hash(u.hostname) === expected.hostnameSHA256, "artifact_hostname_hash");
  check(u.search.length > 1, "artifact_query_required");
  check(
    !/%(?:00|2e|2f|5c|25)/i.test(u.pathname) &&
      !u.pathname.split("/").some((x) => x === "." || x === ".."),
    "artifact_unsafe_path",
  );
  check(hash(u.pathname) === expected.pathSHA256, "artifact_path_hash");
  check(hash(s) === expected.urlSHA256, "artifact_url_hash");
  const safe = sanitizeWorldFile(d);
  check(
    safe.fileExtension === "zip" &&
      safe.fileExtension === expected.fileExtension,
    "artifact_extension",
  );
  check(
    safe.contentType === expected.contentType &&
      safe.contentType === "application/octet-stream",
    "artifact_content_type",
  );
  check(
    safe.fileSize === expected.fileSize &&
      Number.isSafeInteger(safe.fileSize) &&
      Number(safe.fileSize) > 0,
    "artifact_reported_size",
  );
  check(
    canonical(safe) === canonical(expected),
    "artifact_descriptor_fingerprint",
  );
  return s;
}
export function capabilityURL(cap: ArtifactCapability) {
  const u = capabilities.get(cap);
  check(u && hash(u) === cap.urlHash, "artifact_provenance_required");
  return u;
}
