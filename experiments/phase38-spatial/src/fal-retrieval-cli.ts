import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { hash } from "./protocol.ts";
import { verifyFreeze, experimentRoot } from "./freeze.ts";
import {
  retrieval as c,
  retrievalHash,
  requireRetrieval as check,
} from "./fal-retrieval-contract.ts";
import {
  initializeRetrieval,
  RetrievalLedger,
} from "./fal-retrieval-ledger.ts";
import { runFalRetrieval } from "./fal-retrieval.ts";
export async function main(args = process.argv.slice(2)) {
  verifyFreeze();
  const action = args[0] ?? "inspect";
  if (action === "inspect") {
    check(args.length <= 1, "retrieval_arguments");
    console.log(
      JSON.stringify({
        stage: "OFFLINE_PREPARATION_ONLY",
        retrievalIdentity: c.version,
        retrievalHash,
        resultURL: c.resultURL,
        limits: c.limits,
        accounting: c.accounting,
      }),
    );
    return;
  }
  check(
    ["init", "retrieve", "audit"].includes(action),
    "retrieval_action_forbidden",
  );
  const repo = resolve(experimentRoot, "../.."),
    git = (...a: string[]) =>
      execFileSync("git", a, { cwd: repo, encoding: "utf8" }).trim(),
    head = git("rev-parse", "HEAD");
  const flag = (name: string) => {
    const matches = args.filter((x) => x.startsWith(name + "="));
    check(matches.length === 1, "retrieval_arguments");
    return matches[0].slice(name.length + 1);
  };
  check(
    flag("--approved-sha") === head &&
      args.includes("--live") &&
      !git("status", "--porcelain"),
    "retrieval_authorization_required",
  );
  execFileSync(
    "git",
    ["merge-base", "--is-ancestor", c.completedStatusEvidenceCommit, head],
    { cwd: repo, stdio: "pipe" },
  );
  check(
    hash(
      execFileSync(
        "git",
        [
          "show",
          `${c.completedStatusEvidenceCommit}:experiments/phase38-spatial/${c.completedStatusEvidenceFile}`,
        ],
        { cwd: repo },
      ),
    ) === c.completedStatusEvidenceSHA256,
    "retrieval_evidence_commit",
  );
  const sources = {
    continuationRoot: resolve(flag("--continuation-root")),
    recoveryRoot: resolve(flag("--recovery-root")),
  };
  check(
    args.length === 5 &&
      args
        .slice(1)
        .every(
          (x) =>
            x === "--live" ||
            [
              "--approved-sha=",
              "--continuation-root=",
              "--recovery-root=",
            ].some((p) => x.startsWith(p)),
        ),
    "retrieval_arguments",
  );
  const root = join(experimentRoot, "private-fal-retrieval");
  if (action === "init") {
    initializeRetrieval(root, head, sources);
    console.log(
      "Retrieval identity initialized once; no request or reservation.",
    );
    return;
  }
  const ledger = new RetrievalLedger(root, head, sources);
  try {
    if (action === "audit") {
      console.log(JSON.stringify(ledger.summary()));
      return;
    }
    if (existsSync(join(repo, ".env.local")))
      process.loadEnvFile(join(repo, ".env.local"));
    console.log(
      JSON.stringify(await runFalRetrieval(ledger, process.env.FAL_KEY ?? "")),
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
      "Retrieval stopped. No retry or repeat; inspect safe local evidence only.",
    );
    process.exitCode = 1;
  });
