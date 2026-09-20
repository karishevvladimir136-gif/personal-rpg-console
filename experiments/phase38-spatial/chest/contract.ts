import { readFileSync } from "node:fs";
import { dirname, resolve, join, sep } from "node:path";
import { fileURLToPath } from "node:url";
import {
  canonical,
  hash,
  jobById,
  protocolHash,
  safeFailureReason,
  type Job,
  type Dict,
} from "../src/protocol.ts";
import { verifyFreeze as verifyOriginalFreeze } from "../src/freeze.ts";
export const chestRoot = dirname(fileURLToPath(import.meta.url));
export const experimentRoot = resolve(chestRoot, "..");
export const repoRoot = resolve(experimentRoot, "../..");
export type Manifest = {
  version: string;
  baseSHA: string;
  originalProtocolHash: string;
  continuationHash: string;
  originalFreezeSHA256: string;
  sources: Record<string, string>;
  evidenceFiles: Record<string, string>;
  privateHistory: { worktree: string; path: string; sha256: string }[];
  acceptedFalWorld: Dict;
  job: Job;
  accounting: Record<string, number | null>;
  limits: Record<string, number>;
  inspection: Record<string, number | string>;
  privateRoot: string;
  terminalOnly: boolean;
  productionAcceptance: boolean;
  inheritedAssetAccounting: { downloadedBytes: number; ceilingBytes: number };
};
export const manifest = JSON.parse(
  readFileSync(join(chestRoot, "manifest.json"), "utf8"),
) as Manifest;
function freeze(value: unknown) {
  if (value && typeof value === "object") {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
}
freeze(manifest);
export const manifestHash = hash(canonical(manifest));
const errors = new WeakMap<Error, string>();
export function check(ok: unknown, code: string): asserts ok {
  if (!ok) {
    const error = new Error(code);
    errors.set(error, code);
    throw error;
  }
}
export function reason(error: unknown) {
  return (
    (error instanceof Error ? errors.get(error) : undefined) ??
    safeFailureReason(error)
  );
}
export function validateContract(c: Manifest = manifest) {
  check(
    c.version === "phase38b-chest-final-1" &&
      c.privateRoot === "private-chest" &&
      c.terminalOnly &&
      !c.productionAcceptance,
    "chest_identity",
  );
  check(
    c.originalProtocolHash === protocolHash &&
      protocolHash ===
        "496360cc4171778eb153009ff4fe445d8ef75b08ab9aa0c4e884452e21c3bacb" &&
      c.continuationHash ===
        "9b3f84c9e74a3be531d322dc59b623400e3de15a2b09e7231cfeb730cc56a8e1",
    "chest_protocol_binding",
  );
  check(
    canonical(c.job) === canonical(jobById("spatial-chest-1")),
    "chest_frozen_job",
  );
  check(
    canonical(c.accounting) ===
      canonical({
        priorReservedMicroUSD: 4150000,
        knownReportedMicroUSD: 2528000,
        falWorldReservedMicroUSD: 350000,
        falWorldReportedMicroUSD: null,
        chestAllocationMicroUSD: 600000,
        ceilingMicroUSD: 4750000,
        priorGenerations: 3,
        priorAPIRequests: 47,
        priorDownloads: 9,
      }),
    "chest_accounting",
  );
  check(
    canonical(c.limits) ===
      canonical({
        submissions: 1,
        polls: 45,
        pollIntervalMs: 20000,
        resultReads: 1,
        downloads: 1,
        apiRequests: 47,
        totalHTTPRequests: 48,
        retries: 0,
        fallbacks: 0,
        concurrentGenerations: 1,
        deadlineMs: 900000,
        requestTimeoutMs: 60000,
        maxJsonBytes: 2097152,
        maxAssetBytes: 268435456,
      }),
    "chest_limits",
  );
  check(
    c.inheritedAssetAccounting.downloadedBytes === 112407427 &&
      c.inheritedAssetAccounting.ceilingBytes === 1073741824 &&
      c.inheritedAssetAccounting.downloadedBytes + c.limits.maxAssetBytes <=
        c.inheritedAssetAccounting.ceilingBytes,
    "chest_total_asset_limit",
  );
  check(
    c.acceptedFalWorld.ownerAcceptedStructuralOnly === true &&
      c.acceptedFalWorld.classification ===
        "STRUCTURALLY_USABLE_PLY_WORLD_CANDIDATE" &&
      c.acceptedFalWorld.noRetry === true,
    "chest_prior_acceptance",
  );
}
validateContract();
export function selectChest(id = "spatial-chest-1", c = manifest) {
  validateContract(c);
  check(id === c.job.id, "chest_only");
  return c.job;
}
export function verifyFiles(
  files: Record<string, string>,
  read: (path: string) => Buffer,
) {
  for (const [path, sha] of Object.entries(files))
    check(hash(read(path)) === sha, "chest_history_changed");
}
export function verifySources() {
  verifyOriginalFreeze();
  check(
    hash(readFileSync(join(experimentRoot, "freeze.json"))) ===
      manifest.originalFreezeSHA256,
    "chest_old_freeze",
  );
  verifyFiles(manifest.evidenceFiles, (p) =>
    readFileSync(join(experimentRoot, p)),
  );
  const ply = JSON.parse(
    readFileSync(
      join(experimentRoot, "results/fal-ply-inspection-001.json"),
      "utf8",
    ),
  );
  check(
    ply.classification === manifest.acceptedFalWorld.classification &&
      ply.layers.length === 3 &&
      ply.layers.every(
        (x: Dict) =>
          x.structuralClassification === "VALID_NONEMPTY_MESH_STRUCTURE",
      ) &&
      ply.source.artifactSHA256 === manifest.acceptedFalWorld.artifactSHA256,
    "chest_ply_binding",
  );
  for (const item of manifest.privateHistory) {
    const base = resolve(repoRoot, "..", item.worktree),
      target = resolve(base, item.path);
    check(target.startsWith(base + sep), "chest_history_path");
    check(
      hash(readFileSync(target)) === item.sha256,
      "chest_private_history_changed",
    );
  }
}
