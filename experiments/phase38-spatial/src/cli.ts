import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { experimentRoot, verifyFreeze } from "./freeze.ts";
import { initialize, Ledger } from "./ledger.ts";
import {
  hash,
  integer,
  must,
  object,
  protocol,
  protocolHash,
  text,
} from "./protocol.ts";
import { approve, bill, runNext } from "./runner.ts";
import { httpTransport } from "./transport.ts";
export function authorization(args: string[], head: string, dirty: boolean) {
  must(
    args.includes("--live") &&
      args.includes(`--approved-sha=${head}`) &&
      /^[a-f0-9]{40}$/.test(head) &&
      !dirty,
    "exact_sha_owner_authorization_required",
  );
}
export async function main(args = process.argv.slice(2)) {
  verifyFreeze();
  const action = args[0] ?? "inspect",
    repo = resolve(experimentRoot, "../..");
  if (action === "inspect") {
    console.log(
      JSON.stringify(
        {
          stage: "PREPARATION_ONLY",
          protocolHash,
          jobs: protocol.jobs,
          limits: protocol.limits,
        },
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
    ["init", "next", "review", "billing", "status"].includes(action),
    "unknown_action",
  );
  must(
    args.every(
      (x, i) =>
        i === 0 ||
        x === "--live" ||
        x === `--approved-sha=${head}` ||
        ((action === "review" || action === "billing") &&
          x.startsWith("--record=")),
    ),
    "unsupported_argument",
  );
  const root = join(experimentRoot, "private-run");
  if (action === "init") {
    initialize(root, head);
    console.log("Initialized once. No provider calls.");
    return;
  }
  const ledger = new Ledger(root, head);
  try {
    if (action === "status") {
      console.log(JSON.stringify(ledger.summary()));
      return;
    }
    if (action === "billing" || action === "review") {
      const arg = args.find((x) => x.startsWith("--record="));
      must(arg, "record_required");
      const bytes = readFileSync(arg.slice(9));
      must(bytes.length <= 16384, "record_too_large");
      const record = object(JSON.parse(bytes.toString()));
      if (action === "billing") {
        must(record.protocolHash === protocolHash, "stale_receipt");
        bill(
          ledger,
          text(record.jobId),
          text(record.requestId),
          integer(record.microUSD),
          "dashboard",
          hash(bytes),
        );
      } else approve(ledger, text(record.jobId), record);
      console.log("Appended local review record. No provider calls.");
      return;
    }
    // Only an explicitly approved exact-SHA invocation reaches environment loading/network.
    const envFile = join(repo, ".env.local");
    if (existsSync(envFile)) process.loadEnvFile(envFile);
    const credentials = {
      worldlabs: process.env.WORLD_LABS_API_KEY ?? "",
      fal: process.env.FAL_KEY ?? "",
    };
    console.log(
      JSON.stringify(await runNext(ledger, httpTransport(), credentials)),
    );
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
      "Stopped: authorization, freeze, ledger, review or local setup check failed. No automatic retry.",
    );
    process.exitCode = 1;
  });
