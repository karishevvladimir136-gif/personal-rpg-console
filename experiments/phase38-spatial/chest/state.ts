import {
  readFileSync,
  writeFileSync,
  openSync,
  closeSync,
  fsyncSync,
} from "node:fs";
import { join } from "node:path";
import { Ledger, initialize } from "../src/ledger.ts";
import { canonical, hash, type Dict } from "../src/protocol.ts";
import {
  manifest as c,
  manifestHash,
  check,
  verifySources,
  selectChest,
} from "./contract.ts";
const identity = () => ({ chestHash: manifestHash, contract: c });
export function initializeChest(
  root: string,
  commit: string,
  verify = verifySources,
) {
  verify();
  initialize(root, commit, identity());
}
export class ChestLedger extends Ledger {
  readonly verify: () => void;
  constructor(root: string, commit: string, verify = verifySources) {
    verify();
    super(root, commit, identity());
    this.verify = verify;
    try {
      for (const row of this.rows("file")) {
        const bytes = readFileSync(join(root, "chest.glb"));
        check(
          bytes.length === row.bytes && hash(bytes) === row.sha256,
          "chest_retained_asset_changed",
        );
      }
    } catch (error) {
      this.close();
      throw error;
    }
  }
  override append(kind: string, data: Dict) {
    check(
      [
        "reserve",
        "request",
        "response",
        "receipt",
        "queue",
        "asset",
        "file",
        "inspection",
        "end",
      ].includes(kind),
      "chest_event_forbidden",
    );
    if (kind === "reserve" || kind === "request") this.verify();
    super.append(kind, data);
  }
  override audit() {
    let phase = "empty",
      requestId: string | null = null,
      lastRequest: Dict | null = null,
      queueAt = 0,
      polls = 0,
      requests = 0;
    let assetHash: unknown = null;
    for (const [i, e] of this.entries.entries()) {
      const d = e.data;
      check(phase !== "terminal", "chest_terminal");
      check(d.jobId === c.job.id, "chest_only");
      if (e.kind === "reserve") {
        check(
          i === 0 &&
            d.microUSD === 600000 &&
            d.cumulativeMicroUSD === 4750000 &&
            d.inputHash === hash(canonical(c.job.input)) &&
            d.model === c.job.model &&
            d.endpoint === c.job.endpoint &&
            typeof d.started === "number",
          "chest_reservation",
        );
        check(
          Number(c.accounting.priorReservedMicroUSD) + Number(d.microUSD) ===
            4750000,
          "chest_ceiling",
        );
        phase = "reserved";
      } else if (e.kind === "request") {
        check(
          ++requests <= 48 && typeof d.at === "number",
          "chest_request_limit",
        );
        if (d.type === "submit")
          check(
            phase === "reserved" &&
              d.method === "POST" &&
              d.urlHash === hash(c.job.endpoint),
            "chest_single_submission",
          );
        else {
          check(
            d.method === "GET" && d.requestId === requestId,
            "chest_request_identity",
          );
          if (d.type === "poll") {
            check(
              phase === "waiting" &&
                ++polls <= 45 &&
                Number(d.at) >= queueAt + 20000,
              "chest_poll_bound",
            );
          } else if (d.type === "result")
            check(phase === "completed", "chest_result_once");
          else if (d.type === "download")
            check(
              phase === "asset" && d.urlHash === assetHash,
              "chest_download_once",
            );
          else check(false, "chest_request_forbidden");
        }
        lastRequest = d;
        phase = "pending";
      } else if (e.kind === "response") {
        check(
          phase === "pending" &&
            lastRequest &&
            d.type === lastRequest.type &&
            typeof d.status === "number",
          "chest_response_order",
        );
        phase =
          d.status === 200 && d.exactURL === true
            ? String(d.type) + "_response"
            : "failed_response";
      } else if (e.kind === "receipt") {
        check(
          phase === "submit_response" && typeof d.requestId === "string",
          "chest_receipt_order",
        );
        requestId = d.requestId;
        phase = "receipt";
      } else if (e.kind === "queue") {
        check(
          ["receipt", "poll_response"].includes(phase) &&
            d.requestId === requestId &&
            ["IN_QUEUE", "IN_PROGRESS", "COMPLETED"].includes(
              String(d.state),
            ) &&
            typeof d.at === "number",
          "chest_queue_order",
        );
        queueAt = Number(d.at);
        phase = d.state === "COMPLETED" ? "completed" : "waiting";
      } else if (e.kind === "asset") {
        check(
          phase === "result_response" &&
            d.requestId === requestId &&
            typeof d.urlHash === "string",
          "chest_asset_order",
        );
        assetHash = d.urlHash;
        phase = "asset";
      } else if (e.kind === "file") {
        check(
          phase === "download_response" &&
            Number(d.bytes) > 0 &&
            Number(d.bytes) <= c.limits.maxAssetBytes &&
            typeof d.sha256 === "string" &&
            /^[a-f0-9]{64}$/.test(d.sha256) &&
            d.file === "chest.glb",
          "chest_file_order",
        );
        phase = "file";
      } else if (e.kind === "inspection") {
        check(phase === "file", "chest_inspection_order");
        phase = "inspected";
      } else if (e.kind === "end") {
        check(
          phase !== "empty" &&
            i === this.entries.length - 1 &&
            d.approval === false &&
            d.nextReleased === false &&
            d.billing === "UNKNOWN",
          "chest_terminal_shape",
        );
        if (d.status === "AWAITING_OWNER_REVIEW")
          check(phase === "inspected", "chest_incomplete");
        else check(d.status === "STOPPED", "chest_terminal_status");
        phase = "terminal";
      } else check(false, "chest_event_forbidden");
    }
  }
  retain(bytes: Buffer) {
    check(
      bytes.length > 0 && bytes.length <= c.limits.maxAssetBytes,
      "chest_asset_bytes",
    );
    const path = join(this.root, "chest.glb"),
      fd = openSync(path, "wx");
    try {
      writeFileSync(fd, bytes);
      fsyncSync(fd);
    } finally {
      closeSync(fd);
    }
    const info = {
      jobId: c.job.id,
      file: "chest.glb",
      bytes: bytes.length,
      sha256: hash(bytes),
    };
    this.append("file", info);
    return info;
  }
  override summary() {
    const used = this.rows("reserve").length;
    return {
      attempted: 3 + used,
      reservedMicroUSD: 4150000 + used * 600000,
      knownReportedMicroUSD: 2528000,
      reportedMicroUSD: null,
      unknownChargeJobs: used
        ? ["spatial-fal-world-1", "spatial-chest-1"]
        : ["spatial-fal-world-1"],
      apiRequests:
        47 + this.rows("request").filter((x) => x.type !== "download").length,
      downloads: 9 + this.rows("file").length,
      chestReservedMicroUSD: used * 600000,
      remainingReservationMicroUSD: used ? 0 : 600000,
      terminal: this.rows("end")[0] ?? null,
    };
  }
}
export function reserveChest(
  ledger: ChestLedger,
  started: number,
  id = "spatial-chest-1",
) {
  const job = selectChest(id);
  check(ledger.entries.length === 0, "chest_attempt_already_started");
  ledger.append("reserve", {
    jobId: job.id,
    microUSD: 600000,
    cumulativeMicroUSD: 4750000,
    inputHash: hash(canonical(job.input)),
    model: job.model,
    endpoint: job.endpoint,
    started,
  });
}
