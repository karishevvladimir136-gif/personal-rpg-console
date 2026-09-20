import {
  closeSync,
  existsSync,
  fsyncSync,
  lstatSync,
  mkdirSync,
  openSync,
  readFileSync,
  readdirSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { join, resolve } from "node:path";
import {
  canonical,
  hash,
  integer,
  jobById,
  must,
  object,
  protocol,
  protocolHash,
  text,
  type Dict,
} from "./protocol.ts";
export type Entry = {
  sequence: number;
  previous: string;
  protocolHash: string;
  kind: string;
  data: Dict;
  digest: string;
};
function durable(path: string, content: string, flag: "wx" | "a") {
  const fd = openSync(path, flag);
  try {
    writeFileSync(fd, content);
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
}
export function initialize(root: string, commit: string, continuation?: Dict) {
  must(/^[a-f0-9]{40}$/.test(commit), "invalid_commit");
  must(
    !existsSync(root) && !existsSync(root + ".anchor"),
    "run_already_exists",
  );
  durable(
    root + ".anchor",
    canonical({
      version: 1,
      protocolHash,
      commit,
      ...(continuation ? { continuation } : {}),
    }) + "\n",
    "wx",
  );
  mkdirSync(root);
  mkdirSync(join(root, "evidence"));
  durable(
    join(root, "identity.json"),
    canonical({
      version: 1,
      protocolHash,
      commit,
      ...(continuation ? { continuation } : {}),
    }) + "\n",
    "wx",
  );
  durable(join(root, "journal.jsonl"), "", "wx");
  durable(join(root, "witness.jsonl"), "", "wx");
}
export class Ledger {
  readonly root: string;
  readonly commit: string;
  entries: Entry[] = [];
  private lock: number | undefined;
  constructor(root: string, commit: string, continuation?: Dict) {
    this.commit = commit;
    this.root = resolve(root);
    must(!lstatSync(root).isSymbolicLink(), "symlink_run");
    this.lock = openSync(join(root, "exclusive.lock"), "wx");
    try {
      const identity = object(
        JSON.parse(readFileSync(join(root, "identity.json"), "utf8")),
      );
      must(
        identity.protocolHash === protocolHash && identity.commit === commit,
        "run_identity_mismatch",
      );
      must(
        readFileSync(root + ".anchor", "utf8").trim() === canonical(identity),
        "run_anchor_mismatch",
      );
      must(
        canonical(identity.continuation ?? null) ===
          canonical(continuation ?? null),
        "continuation_identity_mismatch",
      );
      const raw = readFileSync(join(root, "journal.jsonl"), "utf8"),
        witness = readFileSync(join(root, "witness.jsonl"), "utf8");
      must(
        (!raw || raw.endsWith("\n")) && (!witness || witness.endsWith("\n")),
        "partial_journal",
      );
      this.entries = raw
        .split("\n")
        .filter(Boolean)
        .map((x) => JSON.parse(x));
      const seals = witness.split("\n").filter(Boolean);
      must(seals.length === this.entries.length, "truncated_journal");
      for (const [i, e] of this.entries.entries()) {
        const { digest, ...body } = e;
        must(
          e.sequence === i &&
            e.previous === (i ? this.entries[i - 1].digest : "GENESIS") &&
            e.protocolHash === protocolHash &&
            digest === hash(canonical(body)) &&
            seals[i] === digest,
          "journal_integrity",
        );
      }
      this.audit();
      const referenced = new Set(
        this.entries
          .filter((e) => e.kind === "evidence")
          .map((e) => text(e.data.file)),
      );
      must(
        !lstatSync(join(root, "evidence")).isSymbolicLink(),
        "symlink_evidence",
      );
      for (const f of readdirSync(join(root, "evidence")))
        must(referenced.has(f), "orphan_evidence");
      for (const e of this.entries.filter((e) => e.kind === "evidence")) {
        const f = text(e.data.file);
        must(/^[a-f0-9]{64}\.(json|bin)$/.test(f), "evidence_path");
        must(
          !lstatSync(join(root, "evidence", f)).isSymbolicLink(),
          "symlink_evidence",
        );
        must(
          hash(readFileSync(join(root, "evidence", f))) === e.data.sha256,
          "evidence_hash",
        );
      }
    } catch (error) {
      this.close();
      throw error;
    }
  }
  append(kind: string, data: Dict) {
    must(this.lock !== undefined, "ledger_closed");
    const body = {
      sequence: this.entries.length,
      previous: this.entries.at(-1)?.digest ?? "GENESIS",
      protocolHash,
      kind,
      data,
    };
    const e = { ...body, digest: hash(canonical(body)) };
    this.entries.push(e);
    try {
      this.audit();
    } catch (error) {
      this.entries.pop();
      throw error;
    }
    durable(join(this.root, "journal.jsonl"), canonical(e) + "\n", "a");
    durable(join(this.root, "witness.jsonl"), e.digest + "\n", "a");
  }
  evidence(data: Uint8Array, kind: "json" | "bin") {
    const sha256 = hash(data),
      file = `${sha256}.${kind}`;
    const prior = this.rows("evidence").find((x) => x.file === file);
    if (prior) {
      must(hash(this.readEvidence(file)) === sha256, "evidence_hash");
      return { file, sha256, bytes: data.length };
    }
    must(!existsSync(join(this.root, "evidence", file)), "orphan_evidence");
    const fd = openSync(join(this.root, "evidence", file), "wx");
    try {
      writeFileSync(fd, data);
      fsyncSync(fd);
    } finally {
      closeSync(fd);
    }
    this.append("evidence", { file, sha256, bytes: data.length });
    return { file, sha256, bytes: data.length };
  }
  readEvidence(file: string) {
    must(/^[a-f0-9]{64}\.(json|bin)$/.test(file), "evidence_path");
    const e = this.entries.find(
      (e) => e.kind === "evidence" && e.data.file === file,
    );
    must(e, "unknown_evidence");
    const bytes = readFileSync(join(this.root, "evidence", file));
    must(hash(bytes) === e.data.sha256, "evidence_hash");
    return bytes;
  }
  rows(kind: string, id?: string) {
    return this.entries
      .filter(
        (e) => e.kind === kind && (id === undefined || e.data.jobId === id),
      )
      .map((e) => e.data);
  }
  audit() {
    const reserves = this.rows("reserve"),
      ids = new Set<string>();
    let total = 0;
    for (const [index, e] of reserves.entries()) {
      const j = jobById(text(e.jobId));
      must(!ids.has(j.id), "duplicate_submission");
      must(j.id === protocol.jobs[index]?.id, "job_order");
      ids.add(j.id);
      must(e.microUSD === j.reserveMicroUSD, "reservation_mismatch");
      total += integer(e.microUSD);
    }
    must(reserves.length <= 4 && total <= 4750000, "reservation_ceiling");
    const requests = this.rows("request");
    for (const e of requests) {
      must(ids.has(text(e.jobId)), "unreserved_request");
      must(
        ["submit", "poll", "world", "result", "download"].includes(
          text(e.type),
        ),
        "unapproved_request_type",
      );
    }
    must(
      requests.filter((x) => x.type !== "download").length <= 190,
      "api_limit",
    );
    must(
      requests.filter((x) => x.type === "download").length <= 14,
      "download_limit",
    );
    must(
      requests.filter((x) => x.type === "result").length <= 2,
      "result_limit",
    );
    must(
      requests.filter((x) => x.type === "world").length <= 4,
      "world_read_limit",
    );
    for (const j of protocol.jobs) {
      const r = requests.filter((x) => x.jobId === j.id);
      must(
        r.filter((x) => x.type === "submit").length <= 1,
        "duplicate_submission",
      );
      must(r.filter((x) => x.type === "poll").length <= 45, "poll_limit");
      must(r.filter((x) => x.type === "world").length <= 2, "world_read_limit");
      must(r.filter((x) => x.type === "result").length <= 1, "result_limit");
    }
    for (const kind of ["result", "approval", "billing"]) {
      const seen = new Set();
      for (const e of this.rows(kind)) {
        must(
          ids.has(text(e.jobId)) && !seen.has(e.jobId),
          "duplicate_or_unreserved_record",
        );
        seen.add(e.jobId);
      }
    }
  }
  summary() {
    const reserved = this.rows("reserve").reduce(
      (n, x) => n + integer(x.microUSD),
      0,
    );
    const bills = this.rows("billing");
    const unknown = this.rows("reserve")
      .filter((x) => !bills.some((b) => b.jobId === x.jobId))
      .map((x) => x.jobId);
    return {
      attempted: this.rows("reserve").length,
      reservedMicroUSD: reserved,
      knownReportedMicroUSD: bills.reduce((n, x) => n + integer(x.microUSD), 0),
      reportedMicroUSD: unknown.length
        ? null
        : bills.reduce((n, x) => n + integer(x.microUSD), 0),
      unknownChargeJobs: unknown,
      apiRequests: this.rows("request").filter((x) => x.type !== "download")
        .length,
      downloads: this.rows("request").filter((x) => x.type === "download")
        .length,
    };
  }
  close() {
    if (this.lock !== undefined) {
      closeSync(this.lock);
      this.lock = undefined;
      unlinkSync(join(this.root, "exclusive.lock"));
    }
  }
}
