import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { requireRetrieval as check } from "./fal-retrieval-contract.ts";

// The CLI supplies its own repository root, never an operator-selected private path.
// The repo argument also permits isolated synthetic Git fixtures in offline tests.
export function requireArtifactPrivateIgnore(repo: string): string {
  const root = join(
    repo,
    "experiments",
    "phase38-spatial",
    "private-fal-artifact",
  );
  for (const path of [join(root, "artifact.zip.partial"), root + ".anchor"]) {
    let ignored = false;
    try {
      execFileSync("git", ["check-ignore", "-q", "--", path], {
        cwd: repo,
        stdio: "pipe",
      });
      ignored = true;
    } catch {
      /* No Git output/path is exposed as an error. Fail closed. */
    }
    check(ignored, "artifact_private_ignore_required");
  }
  return root;
}
export function requireArtifactCheckout(
  repo: string,
  approvedSHA: string,
  live: boolean,
): string {
  const git = (...args: string[]) =>
    execFileSync("git", args, { cwd: repo, encoding: "utf8" }).trim();
  const head = git("rev-parse", "HEAD");
  check(
    live && approvedSHA === head && !git("status", "--porcelain"),
    "artifact_authorization_required",
  );
  return head;
}
