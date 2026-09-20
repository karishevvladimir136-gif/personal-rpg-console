import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { hash } from "./protocol.ts";
import { requireRetrieval as check } from "./fal-retrieval-contract.ts";
import { verifyFreeze, experimentRoot } from "./freeze.ts";
import {
  diagnostic as c,
  diagnosticHash,
  initializeDiagnostic,
  DiagnosticLedger,
} from "./fal-host-diagnostic-state.ts";
import { runHostDiagnostic } from "./fal-host-diagnostic.ts";
export async function main(args = process.argv.slice(2)) {
  verifyFreeze();
  const action = args[0] ?? "inspect";
  if (action === "inspect") {
    check(args.length <= 1, "diagnostic_arguments");
    console.log(
      JSON.stringify({
        stage: "OFFLINE_PREPARATION_ONLY",
        identity: c.version,
        diagnosticHash,
        limits: c.limits,
        accounting: c.accounting,
        resultURL: c.resultURL,
      }),
    );
    return;
  }
  check(
    ["init", "observe-host", "audit"].includes(action),
    "diagnostic_action_forbidden",
  );
  const repo = resolve(experimentRoot, "../.."),
    git = (...a: string[]) =>
      execFileSync("git", a, { cwd: repo, encoding: "utf8" }).trim(),
    head = git("rev-parse", "HEAD");
  const flag = (name: string) => {
    const matches = args.filter((x) => x.startsWith(name + "="));
    check(matches.length === 1, "diagnostic_arguments");
    return matches[0].slice(name.length + 1);
  };
  check(
    flag("--approved-sha") === head &&
      args.includes("--live") &&
      !git("status", "--porcelain"),
    "diagnostic_authorization_required",
  );
  execFileSync(
    "git",
    ["merge-base", "--is-ancestor", c.bindings.retrievalEvidenceCommit, head],
    { cwd: repo, stdio: "pipe" },
  );
  check(
    hash(
      execFileSync(
        "git",
        [
          "show",
          `${c.bindings.retrievalEvidenceCommit}:experiments/phase38-spatial/${c.bindings.retrievalEvidenceFile}`,
        ],
        { cwd: repo },
      ),
    ) === c.bindings.retrievalEvidenceSHA256,
    "diagnostic_evidence_commit",
  );
  const sources = {
    continuationRoot: resolve(flag("--continuation-root")),
    recoveryRoot: resolve(flag("--recovery-root")),
    retrievalRoot: resolve(flag("--retrieval-root")),
  };
  check(
    args.length === 6 &&
      args
        .slice(1)
        .every(
          (x) =>
            x === "--live" ||
            [
              "--approved-sha=",
              "--continuation-root=",
              "--recovery-root=",
              "--retrieval-root=",
            ].some((p) => x.startsWith(p)),
        ),
    "diagnostic_arguments",
  );
  const root = join(experimentRoot, "private-fal-host-diagnostic");
  if (action === "init") {
    initializeDiagnostic(root, head, sources);
    console.log(
      "Diagnostic initialized once; no request, reservation or generation.",
    );
    return;
  }
  const ledger = new DiagnosticLedger(root, head, sources);
  try {
    if (action === "audit") {
      console.log(JSON.stringify(ledger.summary()));
      return;
    }
    if (existsSync(join(repo, ".env.local")))
      process.loadEnvFile(join(repo, ".env.local"));
    console.log(
      JSON.stringify(
        await runHostDiagnostic(ledger, process.env.FAL_KEY ?? ""),
      ),
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
      "Diagnostic stopped. Do not repeat or download; inspect safe local evidence only.",
    );
    process.exitCode = 1;
  });
