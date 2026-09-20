import { execFileSync } from "node:child_process";
import { realpathSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import {
  manifest as c,
  manifestHash,
  chestRoot,
  repoRoot,
  check,
  reason,
  verifySources,
} from "./contract.ts";
import { hash } from "../src/protocol.ts";
import { verifyChestFreeze } from "./freeze.ts";
import { initializeChest, ChestLedger } from "./state.ts";
import { runChest } from "./runner.ts";
export function privateRoot() {
  const root = join(chestRoot, "private-chest");
  for (const p of [join(root, "chest.glb"), root + ".anchor"]) {
    let ok = false;
    try {
      execFileSync("git", ["check-ignore", "-q", "--", p], {
        cwd: repoRoot,
        stdio: "pipe",
      });
      ok = true;
    } catch {
      /* Fail closed without exposing Git output. */
    }
    check(ok, "chest_private_ignore");
  }
  return root;
}
export async function main(args = process.argv.slice(2)) {
  verifyChestFreeze();
  verifySources();
  if (args.length === 0 || (args.length === 1 && args[0] === "inspect")) {
    console.log(
      JSON.stringify({
        stage: "OFFLINE_PREPARATION_ONLY",
        identity: c.version,
        manifestHash,
        accounting: c.accounting,
        limits: c.limits,
        liveInitialized: existsSync(join(chestRoot, "private-chest")),
      }),
    );
    return;
  }
  check(
    args.length === 3 &&
      ["init", "run", "audit"].includes(args[0]) &&
      args[1] === "--live" &&
      /^--approved-sha=[a-f0-9]{40}$/.test(args[2]),
    "chest_arguments",
  );
  const git = (...a: string[]) =>
    execFileSync("git", a, { cwd: repoRoot, encoding: "utf8" }).trim();
  const head = git("rev-parse", "HEAD");
  check(
    head === args[2].slice("--approved-sha=".length) &&
      !git("status", "--porcelain"),
    "chest_exact_clean_authorization",
  );
  check(
    realpathSync(repoRoot).toLowerCase() ===
      resolve(
        "C:/Dev/personal-rpg-console-phase38-chest-final-preparation",
      ).toLowerCase(),
    "chest_execution_worktree",
  );
  for (const commit of [c.baseSHA, ...Object.values(c.sources)])
    git("merge-base", "--is-ancestor", commit, head);
  for (const [path, sha] of Object.entries(c.evidenceFiles))
    check(
      hash(
        execFileSync(
          "git",
          ["show", `${c.baseSHA}:experiments/phase38-spatial/${path}`],
          { cwd: repoRoot },
        ),
      ) === sha,
      "chest_committed_source",
    );
  const root = privateRoot();
  if (args[0] === "init") {
    initializeChest(root, head);
    console.log(
      "Chest identity initialized once; zero requests, reservations or generations.",
    );
    return;
  }
  const ledger = new ChestLedger(root, head);
  try {
    if (args[0] === "audit") {
      console.log(JSON.stringify(ledger.summary()));
      return;
    }
    // Read an existing server environment only after all explicit execution gates. Never log credentials.
    if (existsSync(join(repoRoot, ".env.local")))
      process.loadEnvFile(join(repoRoot, ".env.local"));
    console.log(
      JSON.stringify(await runChest(ledger, process.env.FAL_KEY ?? "")),
    );
  } finally {
    ledger.close();
  }
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
)
  main().catch((error) => {
    console.error(
      JSON.stringify({
        status: "STOPPED",
        reason: reason(error),
        retry: false,
      }),
    );
    process.exitCode = 1;
  });
