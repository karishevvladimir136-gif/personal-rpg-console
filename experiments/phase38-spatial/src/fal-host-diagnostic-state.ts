import { readFileSync } from "node:fs";
import { join, resolve, sep } from "node:path";
import { experimentRoot } from "./freeze.ts";
import {
  canonical,
  hash,
  object,
  protocolHash,
  type Dict,
} from "./protocol.ts";
import { initialize, Ledger, type Entry } from "./ledger.ts";
import {
  retrieval,
  retrievalHash,
  requireRetrieval as check,
} from "./fal-retrieval-contract.ts";
import {
  verifyRetrievalSources,
  type RetrievalSources,
} from "./fal-retrieval-source.ts";
type Bindings = Record<string, string> & {
  retrievalFiles: Record<string, string>;
};
type Contract = {
  version: string;
  bindings: Bindings;
  requestId: string;
  provider: string;
  model: string;
  resultURL: string;
  limits: Record<string, number>;
  accounting: Record<string, number | null>;
};
export const diagnostic = JSON.parse(
  readFileSync(join(experimentRoot, "fal-host-diagnostic.json"), "utf8"),
) as Contract;
function freeze(x: unknown) {
  if (x && typeof x === "object") {
    Object.freeze(x);
    Object.values(x).forEach(freeze);
  }
}
freeze(diagnostic);
export const diagnosticHash = hash(canonical(diagnostic));
const c = diagnostic;
check(
  c.bindings.retrievalHash === retrievalHash &&
    c.requestId === retrieval.requestId &&
    c.provider === "fal" &&
    c.model === retrieval.model &&
    c.resultURL === retrieval.resultURL,
  "diagnostic_binding",
);
for (const key of [
  "originalExecutionSHA",
  "originalProtocolHash",
  "continuationHash",
  "originalStopEvidenceCommit",
  "originalStopEvidenceSHA256",
  "recoveryPreparationSHA",
  "recoveryIdentity",
  "recoveryHash",
  "completedStatusEvidenceCommit",
  "completedStatusEvidenceSHA256",
  "completedBodySHA256",
  "recoveryTerminalDigest",
] as const)
  check(c.bindings[key] === retrieval[key], "diagnostic_ancestry_binding");
export function verifyDiagnosticEvidence(bytes: Buffer) {
  check(
    hash(bytes) === c.bindings.retrievalEvidenceSHA256,
    "diagnostic_evidence_hash",
  );
  const e = object(JSON.parse(bytes.toString("utf8"))),
    obs = object(e.observation),
    http = object(obs.http),
    id = object(obs.identity),
    end = object(obs.terminal);
  check(
    e.executionSHA === c.bindings.retrievalPreparationSHA &&
      e.retrievalHash === retrievalHash &&
      e.requestId === c.requestId &&
      e.provider === c.provider &&
      e.requestedModel === c.model &&
      e.originalExecutionSHA === c.bindings.originalExecutionSHA &&
      e.originalProtocolHash === c.bindings.originalProtocolHash &&
      e.continuationHash === c.bindings.continuationHash &&
      e.completedStatusEvidenceCommit ===
        c.bindings.completedStatusEvidenceCommit,
    "diagnostic_evidence_identity",
  );
  check(
    http.httpStatus === 200 &&
      http.responseURLMatches === true &&
      http.redirect === false &&
      id.requestId === c.requestId &&
      id.bodyHash === c.bindings.previousResultBodySHA256 &&
      end.finding === "B_INVALID_OUTPUT_OR_ASSET_URL" &&
      end.reason === "asset_host_not_allowed" &&
      object(e.network).artifactDownloads === 0,
    "diagnostic_prior_result_required",
  );
  return e;
}
export function verifyRetrievalHistory(root: string) {
  const evidence = verifyDiagnosticEvidence(
    readFileSync(join(experimentRoot, c.bindings.retrievalEvidenceFile)),
  );
  for (const [p, h] of Object.entries(c.bindings.retrievalFiles))
    check(
      hash(readFileSync(join(root, p))) === h,
      "diagnostic_retrieval_history_changed",
    );
  const ident = object(
    JSON.parse(readFileSync(join(root, "identity.json"), "utf8")),
  );
  check(
    ident.commit === c.bindings.retrievalPreparationSHA &&
      ident.protocolHash === protocolHash &&
      canonical(ident.continuation) ===
        canonical({ retrievalHash, contract: retrieval }),
    "diagnostic_prior_identity",
  );
  const raw = readFileSync(join(root, "journal.jsonl"), "utf8");
  check(raw.endsWith("\n"), "diagnostic_partial_history");
  const rows = raw
      .trim()
      .split("\n")
      .map((x) => JSON.parse(x) as Entry),
    witness = readFileSync(join(root, "witness.jsonl"), "utf8")
      .trim()
      .split("\n");
  check(rows.length === 5 && witness.length === 5, "diagnostic_history_count");
  rows.forEach((r, i) => {
    const { digest, ...body } = r;
    check(
      r.sequence === i &&
        r.previous === (i ? rows[i - 1].digest : "GENESIS") &&
        r.protocolHash === protocolHash &&
        hash(canonical(body)) === digest &&
        witness[i] === digest,
      "diagnostic_history_chain",
    );
  });
  const obs = object(evidence.observation);
  for (const [kind, key] of [
    ["retrieval_http", "http"],
    ["retrieval_identity", "identity"],
    ["retrieval_end", "terminal"],
  ])
    check(
      canonical(rows.find((r) => r.kind === kind)?.data) ===
        canonical(obs[key]),
      "diagnostic_history_observation",
    );
  check(
    rows.at(-1)?.digest === c.bindings.retrievalTerminalDigest,
    "diagnostic_history_terminal",
  );
  return {
    retrievalTerminalDigest: c.bindings.retrievalTerminalDigest,
    retrievalEvidenceSHA256: c.bindings.retrievalEvidenceSHA256,
  };
}
export type DiagnosticSources = RetrievalSources & { retrievalRoot: string };
export function verifyDiagnosticSources(s: DiagnosticSources): Dict {
  return {
    ...verifyRetrievalSources(s),
    ...verifyRetrievalHistory(s.retrievalRoot),
  };
}
type Verify = typeof verifyDiagnosticSources;
const identity = () => ({ diagnosticHash, contract: c });
export function initializeDiagnostic(
  root: string,
  commit: string,
  sources: DiagnosticSources,
  verify: Verify = verifyDiagnosticSources,
) {
  const target = resolve(root).toLowerCase();
  for (const p of Object.values(sources)) {
    const origin = resolve(p).toLowerCase();
    check(
      target !== origin &&
        !target.startsWith(origin + sep) &&
        !origin.startsWith(target + sep),
      "diagnostic_separate_history",
    );
  }
  verify(sources);
  initialize(root, commit, identity());
}
export class DiagnosticLedger extends Ledger {
  readonly sources: DiagnosticSources;
  readonly verify: Verify;
  constructor(
    root: string,
    commit: string,
    sources: DiagnosticSources,
    verify: Verify = verifyDiagnosticSources,
  ) {
    verify(sources);
    super(root, commit, identity());
    this.sources = Object.freeze({ ...sources });
    this.verify = verify;
  }
  override append(kind: string, data: Dict) {
    if (kind === "diagnostic_begin" || kind === "diagnostic_request")
      this.verify(this.sources);
    super.append(kind, data);
  }
  override audit() {
    super.audit();
    let state = "empty";
    for (const [i, e] of this.entries.entries()) {
      const d = e.data;
      check(state !== "terminal", "diagnostic_terminal");
      switch (e.kind) {
        case "diagnostic_begin":
          check(
            i === 0 &&
              state === "empty" &&
              d.diagnosticHash === diagnosticHash &&
              d.requestId === c.requestId,
            "diagnostic_once",
          );
          state = "begun";
          break;
        case "diagnostic_request":
          check(
            state === "begun" &&
              d.method === "GET" &&
              d.stage === "result" &&
              d.requestId === c.requestId &&
              d.urlHash === hash(c.resultURL),
            "diagnostic_one_result_only",
          );
          state = "requested";
          break;
        case "diagnostic_http":
          check(
            state === "requested" &&
              d.stage === "result" &&
              d.requestId === c.requestId,
            "diagnostic_http_order",
          );
          state = "http";
          break;
        case "diagnostic_body": {
          const h = this.rows("diagnostic_http")[0];
          check(
            state === "http" &&
              h?.httpStatus === 200 &&
              h.responseURLMatches === true &&
              h.redirect === false &&
              typeof d.bodyHash === "string" &&
              /^[a-f0-9]{64}$/.test(d.bodyHash) &&
              d.matchesPrevious ===
                (d.bodyHash === c.bindings.previousResultBodySHA256),
            "diagnostic_body_order",
          );
          state = "body";
          break;
        }
        case "diagnostic_identity":
          check(
            state === "body" &&
              this.rows("diagnostic_body")[0]?.matchesPrevious === true &&
              d.requestId === c.requestId,
            "diagnostic_no_changed_body_interpretation",
          );
          state = "identity";
          break;
        case "diagnostic_descriptor":
          check(state === "identity", "diagnostic_descriptor_order");
          state = "descriptor";
          break;
        case "diagnostic_end":
          check(
            state !== "empty" && i === this.entries.length - 1,
            "diagnostic_end_order",
          );
          if (d.classification !== undefined)
            check(
              state === "descriptor",
              "diagnostic_classification_before_metadata",
            );
          state = "terminal";
          break;
        default:
          check(false, "diagnostic_event_forbidden");
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
      apiRequests: this.rows("diagnostic_request").length,
      downloads: 0,
      diagnosticHash,
      accounting: c.accounting,
      newReservations: 0,
      newGenerations: 0,
      terminal: this.rows("diagnostic_end")[0] ?? null,
    };
  }
}
