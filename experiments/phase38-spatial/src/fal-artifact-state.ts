import { readFileSync } from "node:fs";
import { join, resolve, sep } from "node:path";
import { experimentRoot } from "./freeze.ts";
import { canonical, hash, object, type Dict } from "./protocol.ts";
import { initialize, Ledger, type Entry } from "./ledger.ts";
import {
  verifyDiagnosticSources,
  type DiagnosticSources,
} from "./fal-host-diagnostic-state.ts";
import { requireRetrieval as check } from "./fal-retrieval-contract.ts";
import { artifact as c, artifactHash } from "./fal-artifact-contract.ts";
export type ArtifactSources = DiagnosticSources & { diagnosticRoot: string };
export function verifyArtifactEvidence(bytes: Buffer) {
  check(hash(bytes) === c.sourceEvidenceSHA256, "artifact_evidence_hash");
  const e = object(JSON.parse(bytes.toString("utf8"))),
    o = object(e.observation);
  check(
    e.executionSHA === c.diagnosticExecutionSHA &&
      e.diagnosticIdentity === c.diagnosticIdentity &&
      e.diagnosticHash === c.diagnosticHash &&
      e.requestId === c.requestId &&
      canonical(e.bindings) === canonical(c.bindings),
    "artifact_evidence_binding",
  );
  check(
    object(o.http).httpStatus === 200 &&
      object(o.http).responseURLMatches === true &&
      object(o.http).redirect === false &&
      object(o.body).bodyHash === c.resultBodySHA256 &&
      object(o.body).matchesPrevious === true &&
      canonical(o.descriptor) === canonical(c.descriptor) &&
      object(o.terminal).reason === "host_not_approved",
    "artifact_evidence_observation",
  );
  check(
    object(e.network).providerHTTPRequests === 1 &&
      object(e.network).artifactDownloads === 0 &&
      object(e.network).assetDNSRequests === 0,
    "artifact_evidence_network",
  );
  return e;
}
export function verifyArtifactSources(s: ArtifactSources) {
  const prior = verifyDiagnosticSources(s),
    e = verifyArtifactEvidence(
      readFileSync(join(experimentRoot, c.sourceEvidenceFile)),
    );
  for (const [p, h] of Object.entries(c.diagnosticFiles))
    check(
      hash(readFileSync(join(s.diagnosticRoot, p))) === h,
      "artifact_diagnostic_history_changed",
    );
  const rows = readFileSync(join(s.diagnosticRoot, "journal.jsonl"), "utf8")
    .trim()
    .split("\n")
    .map((x) => JSON.parse(x) as Entry);
  check(
    rows.length === 7 && rows.at(-1)?.digest === c.diagnosticTerminalDigest,
    "artifact_diagnostic_terminal",
  );
  const o = object(e.observation);
  for (const [kind, key] of [
    ["diagnostic_http", "http"],
    ["diagnostic_body", "body"],
    ["diagnostic_identity", "identity"],
    ["diagnostic_descriptor", "descriptor"],
    ["diagnostic_end", "terminal"],
  ])
    check(
      canonical(rows.find((r) => r.kind === kind)?.data) === canonical(o[key]),
      "artifact_diagnostic_observation",
    );
  return {
    ...prior,
    diagnosticTerminalDigest: c.diagnosticTerminalDigest,
    diagnosticEvidenceSHA256: c.sourceEvidenceSHA256,
  };
}
type Verify = typeof verifyArtifactSources;
const identity = () => ({ artifactHash, contract: c });
export function initializeArtifact(
  root: string,
  commit: string,
  sources: ArtifactSources,
  verify: Verify = verifyArtifactSources,
) {
  const target = resolve(root).toLowerCase();
  for (const p of Object.values(sources)) {
    const origin = resolve(p).toLowerCase();
    check(
      target !== origin &&
        !target.startsWith(origin + sep) &&
        !origin.startsWith(target + sep),
      "artifact_separate_history",
    );
  }
  verify(sources);
  initialize(root, commit, identity());
}
export class ArtifactLedger extends Ledger {
  readonly sources: ArtifactSources;
  readonly verify: Verify;
  constructor(
    root: string,
    commit: string,
    sources: ArtifactSources,
    verify: Verify = verifyArtifactSources,
  ) {
    verify(sources);
    super(root, commit, identity());
    this.sources = Object.freeze({ ...sources });
    this.verify = verify;
  }
  override append(kind: string, data: Dict) {
    check(
      [
        "artifact_begin",
        "artifact_request",
        "artifact_http",
        "artifact_body",
        "artifact_identity",
        "artifact_capability",
        "artifact_file",
        "artifact_inventory",
        "artifact_inspection",
        "artifact_end",
      ].includes(kind),
      "artifact_event_forbidden",
    );
    if (kind === "artifact_begin" || kind === "artifact_request")
      this.verify(this.sources);
    super.append(kind, data);
  }
  override audit() {
    super.audit();
    let state = "empty";
    for (const [i, e] of this.entries.entries()) {
      const d = e.data;
      check(state !== "terminal", "artifact_terminal");
      switch (e.kind) {
        case "artifact_begin":
          check(
            i === 0 &&
              d.artifactHash === artifactHash &&
              d.requestId === c.requestId,
            "artifact_once",
          );
          state = "begun";
          break;
        case "artifact_request":
          check(
            d.method === "GET" && d.requestId === c.requestId,
            "artifact_get_only",
          );
          if (d.stage === "result") {
            check(
              state === "begun" && d.urlHash === hash(c.resultURL),
              "artifact_one_result",
            );
            state = "result_requested";
          } else {
            check(
              d.stage === "asset" &&
                state === "capability" &&
                d.urlHash === c.descriptor.urlSHA256,
              "artifact_one_asset",
            );
            state = "asset_requested";
          }
          break;
        case "artifact_http":
          check(
            (state === "result_requested" && d.stage === "result") ||
              (state === "asset_requested" && d.stage === "asset"),
            "artifact_http_order",
          );
          state = d.stage === "result" ? "result_http" : "asset_http";
          break;
        case "artifact_body": {
          const h = this.rows("artifact_http")[0];
          check(
            state === "result_http" &&
              h.httpStatus === 200 &&
              h.responseURLMatches === true &&
              h.redirect === false &&
              d.matchesPrevious === (d.bodyHash === c.resultBodySHA256),
            "artifact_body_order",
          );
          state = "body";
          break;
        }
        case "artifact_identity":
          check(
            state === "body" &&
              this.rows("artifact_body")[0].matchesPrevious === true &&
              d.requestId === c.requestId,
            "artifact_identity_order",
          );
          state = "identity";
          break;
        case "artifact_capability":
          check(
            state === "identity" && canonical(d) === canonical(c.descriptor),
            "artifact_capability_order",
          );
          state = "capability";
          break;
        case "artifact_file":
          check(
            ["asset_requested", "asset_http"].includes(state) &&
              typeof d.sha256 === "string" &&
              /^[a-f0-9]{64}$/.test(d.sha256) &&
              Number.isSafeInteger(d.bytes) &&
              Number(d.bytes) >= 0 &&
              Number(d.bytes) <= c.limits.maxAssetBytes,
            "artifact_file_order",
          );
          if (d.complete === true)
            check(
              state === "asset_http" &&
                this.rows("artifact_http").at(-1)?.httpStatus === 200 &&
                d.bytes === c.descriptor.fileSize &&
                d.file === "artifact.zip",
              "artifact_complete_file",
            );
          else
            check(
              d.complete === false && d.file === "artifact.zip.partial",
              "artifact_partial_file",
            );
          state = "file";
          break;
        case "artifact_inventory":
          check(
            state === "file" && this.rows("artifact_file")[0].complete === true,
            "artifact_inventory_order",
          );
          state = "inventory";
          break;
        case "artifact_inspection":
          check(state === "inventory", "artifact_inspection_order");
          state = "inspected";
          break;
        case "artifact_end":
          check(
            state !== "empty" &&
              i === this.entries.length - 1 &&
              d.billing === "UNKNOWN",
            "artifact_end_order",
          );
          if (d.status === "RETRIEVED_AWAITING_OWNER_REVIEW")
            check(state === "inspected", "artifact_success_order");
          state = "terminal";
          break;
        default:
          check(false, "artifact_event_forbidden");
      }
    }
  }
  override summary() {
    return {
      attempted: 3,
      reservedMicroUSD: 4150000,
      knownReportedMicroUSD: 2528000,
      reportedMicroUSD: null,
      unknownChargeJobs: ["spatial-fal-world-1"],
      artifactHash,
      accounting: c.accounting,
      apiRequests: this.rows("artifact_request").filter(
        (r) => r.stage === "result",
      ).length,
      assetAttempts: this.rows("artifact_request").filter(
        (r) => r.stage === "asset",
      ).length,
      downloads: this.rows("artifact_file").filter((r) => r.complete === true)
        .length,
      newReservations: 0,
      newGenerations: 0,
      terminal: this.rows("artifact_end")[0] ?? null,
    };
  }
}
