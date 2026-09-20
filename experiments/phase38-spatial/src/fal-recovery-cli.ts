import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { verifyFreeze, experimentRoot } from "./freeze.ts";
import { must } from "./protocol.ts";
import { falRecovery, falRecoveryHash } from "./fal-recovery-contract.ts";
import {
  binding,
  initializeFalRecovery,
  FalRecoveryLedger,
} from "./fal-recovery-ledger.ts";
import { runFalRecovery } from "./fal-recovery.ts";
export async function main(args = process.argv.slice(2)) {
  verifyFreeze();
  const action = args[0] ?? "inspect";
  if (action === "inspect") {
    must(args.length <= 1, "unsupported_argument");
    console.log(
      JSON.stringify({
        stage: "OFFLINE_PREPARATION_ONLY",
        falRecoveryHash,
        limits: falRecovery.limits,
        accounting: falRecovery.accounting,
        resultRetrievalReleased: false,
      }),
    );
    return;
  }
  must(
    ["init", "observe-status", "status"].includes(action),
    "fal_recovery_action_forbidden",
  );
  const repo = resolve(experimentRoot, "../.."),
    git = (...a: string[]) =>
      execFileSync("git", a, { cwd: repo, encoding: "utf8" }).trim(),
    head = git("rev-parse", "HEAD");
  must(
    args.includes("--live") &&
      args.filter((x) => x.startsWith("--approved-sha=")).length === 1 &&
      args.includes(`--approved-sha=${head}`) &&
      !git("status", "--porcelain"),
    "live_authorization_required",
  );
  const src = args.filter((x) => x.startsWith("--source-root="));
  must(src.length === 1, "source_history_required");
  must(
    args.every(
      (x, i) =>
        i === 0 ||
        x === "--live" ||
        x === `--approved-sha=${head}` ||
        x === src[0],
    ),
    "unsupported_argument",
  );
  const source = binding(resolve(src[0].slice("--source-root=".length))),
    root = join(experimentRoot, "private-fal-recovery");
  if (action === "init") {
    initializeFalRecovery(root, head, source);
    console.log(
      "Recovery identity initialized once; no new reservation or generation.",
    );
    return;
  }
  const ledger = new FalRecoveryLedger(root, head, source);
  try {
    if (action === "status") {
      console.log(JSON.stringify(ledger.summary()));
      return;
    }
    // Only an explicitly authorized future observation loads a local server secret.
    if (existsSync(join(repo, ".env.local")))
      process.loadEnvFile(join(repo, ".env.local"));
    console.log(
      JSON.stringify(await runFalRecovery(ledger, process.env.FAL_KEY ?? "")),
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
      "Recovery stopped. Do not retry, reset or resubmit. Inspect safe local evidence only.",
    );
    process.exitCode = 1;
  });
