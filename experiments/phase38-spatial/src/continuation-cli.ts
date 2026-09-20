import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { experimentRoot, verifyFreeze } from "./freeze.ts";
import { authorization } from "./cli.ts";
import {
  continuation,
  continuationHash,
  initializeContinuation,
  ContinuationLedger,
} from "./continuation-ledger.ts";
import { recoverRoom } from "./room-recovery.ts";
import { runNext, approve, bill } from "./runner.ts";
import { httpTransport } from "./transport.ts";
import { hash, integer, must, object, protocolHash, text } from "./protocol.ts";

export async function main(args = process.argv.slice(2)) {
  verifyFreeze();
  const action = args[0] ?? "inspect",
    repo = resolve(experimentRoot, "../..");
  if (action === "inspect") {
    console.log(
      JSON.stringify(
        { stage: "OFFLINE_PREPARATION_ONLY", continuationHash, continuation },
        null,
        2,
      ),
    );
    return;
  }
  const git = (...params: string[]) =>
    execFileSync("git", params, { cwd: repo, encoding: "utf8" }).trim();
  const head = git("rev-parse", "HEAD");
  authorization(args, head, git("status", "--porcelain").length > 0);
  must(
    ["init", "recover-room", "next", "review", "billing", "status"].includes(
      action,
    ),
    "unknown_action",
  );
  const original = args.filter((x) => x.startsWith("--original-repo="));
  must(original.length === 1, "original_history_required");
  must(
    args.every(
      (x, i) =>
        i === 0 ||
        x === "--live" ||
        x === `--approved-sha=${head}` ||
        x === original[0] ||
        (["review", "billing"].includes(action) && x.startsWith("--record=")),
    ),
    "unsupported_argument",
  );
  const originalRepo = resolve(original[0].slice("--original-repo=".length));
  const root = join(experimentRoot, "private-continuation");
  if (action === "init") {
    initializeContinuation(root, head, originalRepo);
    console.log(
      "New continuation initialized once with original accounting; no provider calls.",
    );
    return;
  }
  const ledger = new ContinuationLedger(root, head, originalRepo);
  try {
    if (action === "status") {
      console.log(JSON.stringify(ledger.summary()));
      return;
    }
    if (["review", "billing"].includes(action)) {
      const paths = args.filter((x) => x.startsWith("--record="));
      must(paths.length === 1, "record_required");
      const bytes = readFileSync(paths[0].slice(9));
      must(bytes.length <= 16384, "record_too_large");
      const record = object(JSON.parse(bytes.toString()));
      must(
        record.continuationHash === continuationHash &&
          record.protocolHash === protocolHash,
        "stale_review",
      );
      if (action === "review") approve(ledger, text(record.jobId), record);
      else
        bill(
          ledger,
          text(record.jobId),
          text(record.requestId),
          integer(record.microUSD),
          "dashboard",
          hash(bytes),
        );
      console.log("Appended local review/billing only.");
      return;
    }
    // No credentials or transport are consulted before exact-SHA/freeze/history/ledger gates.
    if (existsSync(join(repo, ".env.local")))
      process.loadEnvFile(join(repo, ".env.local"));
    const credentials = {
      worldlabs: process.env.WORLD_LABS_API_KEY ?? "",
      fal: process.env.FAL_KEY ?? "",
    };
    const result =
      action === "recover-room"
        ? await recoverRoom(ledger, httpTransport(), credentials)
        : await runNext(ledger, httpTransport(), credentials);
    console.log(JSON.stringify(result));
  } finally {
    ledger.close();
  }
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
)
  main().catch(() => {
    console.error(
      "Stopped: continuation authorization/history/ledger/validation failed. No retry.",
    );
    process.exitCode = 1;
  });
