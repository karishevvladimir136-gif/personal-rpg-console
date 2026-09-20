import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { verifyFreeze, experimentRoot } from "./freeze.ts";
import { hash } from "./protocol.ts";
import { requireRetrieval as check } from "./fal-retrieval-contract.ts";
import { artifact as c, artifactHash } from "./fal-artifact-contract.ts";
import { initializeArtifact, ArtifactLedger } from "./fal-artifact-state.ts";
import { runExactArtifact } from "./fal-artifact.ts";
import {
  requireArtifactPrivateIgnore,
  requireArtifactCheckout,
} from "./fal-artifact-preflight.ts";
export async function main(args = process.argv.slice(2)) {
  verifyFreeze();
  const action = args[0] ?? "inspect";
  if (action === "inspect") {
    check(args.length <= 1, "artifact_arguments");
    console.log(
      JSON.stringify({
        stage: "OFFLINE_PREPARATION_ONLY",
        identity: c.version,
        artifactHash,
        limits: c.limits,
        zip: c.zip,
        accounting: c.accounting,
      }),
    );
    return;
  }
  check(
    ["init", "retrieve", "audit"].includes(action),
    "artifact_action_forbidden",
  );
  const repo = resolve(experimentRoot, "../.."),
    git = (...a: string[]) =>
      execFileSync("git", a, { cwd: repo, encoding: "utf8" }).trim(),
    head = git("rev-parse", "HEAD");
  const flag = (name: string) => {
    const hits = args.filter((x) => x.startsWith(name + "="));
    check(hits.length === 1, "artifact_arguments");
    return hits[0].slice(name.length + 1);
  };
  check(
    args.length === 7 &&
      args.includes("--live") &&
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
              "--diagnostic-root=",
            ].some((p) => x.startsWith(p)),
        ),
    "artifact_arguments",
  );
  requireArtifactCheckout(
    repo,
    flag("--approved-sha"),
    args.includes("--live"),
  );
  for (const [commit, file, sha256] of [
    [c.sourceEvidenceCommit, c.sourceEvidenceFile, c.sourceEvidenceSHA256],
    [
      c.recovery.stopEvidenceCommit,
      c.recovery.stopEvidenceFile,
      c.recovery.stopEvidenceSHA256,
    ],
  ]) {
    execFileSync("git", ["merge-base", "--is-ancestor", commit, head], {
      cwd: repo,
      stdio: "pipe",
    });
    check(
      hash(
        execFileSync(
          "git",
          ["show", `${commit}:experiments/phase38-spatial/${file}`],
          { cwd: repo },
        ),
      ) === sha256,
      "artifact_evidence_commit",
    );
  }
  const sources = {
      continuationRoot: resolve(flag("--continuation-root")),
      recoveryRoot: resolve(flag("--recovery-root")),
      retrievalRoot: resolve(flag("--retrieval-root")),
      diagnosticRoot: resolve(flag("--diagnostic-root")),
    },
    root = requireArtifactPrivateIgnore(repo);
  if (action === "init") {
    initializeArtifact(root, head, sources);
    console.log(
      "Artifact identity initialized once; zero requests, DNS, reservations or generations.",
    );
    return;
  }
  const ledger = new ArtifactLedger(root, head, sources);
  try {
    if (action === "audit") {
      console.log(JSON.stringify(ledger.summary()));
      return;
    }
    if (existsSync(join(repo, ".env.local")))
      process.loadEnvFile(join(repo, ".env.local"));
    console.log(
      JSON.stringify(await runExactArtifact(ledger, process.env.FAL_KEY ?? "")),
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
      "Artifact retrieval stopped. Do not retry, reset or continue; inspect sanitized local evidence only.",
    );
    process.exitCode = 1;
  });
