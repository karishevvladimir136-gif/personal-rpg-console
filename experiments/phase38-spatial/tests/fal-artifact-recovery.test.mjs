import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  existsSync,
  readdirSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  requireArtifactPrivateIgnore,
  requireArtifactCheckout,
} from "../src/fal-artifact-preflight.ts";
import {
  artifact as c,
  artifactHash,
  originalArtifact,
} from "../src/fal-artifact-contract.ts";
import {
  verifyArtifactStopEvidence,
  initializeArtifact,
  ArtifactLedger,
} from "../src/fal-artifact-state.ts";
import { initialize } from "../src/ledger.ts";
import { hash, canonical } from "../src/protocol.ts";
import { main } from "../src/fal-artifact-cli.ts";
globalThis.fetch = async () => {
  throw Error("OFFLINE_NETWORK_FORBIDDEN");
};
const COMMIT = "1".repeat(40),
  EXPERIMENT = "experiments/phase38-spatial";
function fixture(
  t,
  patterns = "private-fal-artifact/\nprivate-fal-artifact.anchor\n",
) {
  const repo = mkdtempSync(
    join(tmpdir(), "phase38-artifact-ignore-regression-"),
  );
  const git = (...a) =>
    execFileSync("git", a, {
      cwd: repo,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();
  git("init", "--initial-branch=codex/synthetic-ignore");
  mkdirSync(join(repo, ".git", "empty-hooks"));
  writeFileSync(join(repo, ".git", "empty-excludes"), "");
  git("config", "core.hooksPath", join(repo, ".git", "empty-hooks"));
  git("config", "core.excludesFile", join(repo, ".git", "empty-excludes"));
  git("config", "commit.gpgsign", "false");
  git("config", "user.name", "Synthetic Test");
  git("config", "user.email", "synthetic@example.invalid");
  const experiment = join(repo, EXPERIMENT),
    root = join(experiment, "private-fal-artifact"),
    anchor = root + ".anchor";
  mkdirSync(experiment, { recursive: true });
  writeFileSync(join(experiment, ".gitignore"), patterns);
  git("add", ".");
  git("commit", "-m", "Synthetic local fixture");
  t.after(() => rmSync(repo, { recursive: true, force: true }));
  return { repo, git, experiment, root, anchor };
}
function absent(f) {
  assert.equal(existsSync(f.root), false);
  assert.equal(existsSync(f.anchor), false);
  assert.equal(existsSync(join(f.root, "artifact.zip.partial")), false);
}
test("actual fresh-init helper reproduces old failure, passes while directory/anchor absent and creates nothing", (t) => {
  const f = fixture(t);
  absent(f);
  assert.equal(
    readFileSync(join(f.experiment, ".gitignore"), "utf8"),
    "private-fal-artifact/\nprivate-fal-artifact.anchor\n",
  );
  // Reproduce the exact old call shape before exercising the helper used by the corrected CLI.
  const before = f.git("check-ignore", f.root, f.anchor).split("\n");
  assert.equal(before.length, 1);
  const children = readdirSync(f.experiment),
    status = f.git("status", "--porcelain");
  assert.equal(requireArtifactPrivateIgnore(f.repo), f.root);
  absent(f);
  assert.deepEqual(readdirSync(f.experiment), children);
  assert.equal(f.git("status", "--porcelain"), status);
});
for (const [label, patterns] of [
  ["directory pattern removed", "private-fal-artifact.anchor\n"],
  ["anchor pattern removed", "private-fal-artifact/\n"],
  ["both patterns removed", "# none\n"],
  [
    "only an alternate private directory ignored",
    "alternate-private/\nprivate-fal-artifact.anchor\n",
  ],
  [
    "child explicitly unignored",
    "private-fal-artifact/*\n!private-fal-artifact/artifact.zip.partial\nprivate-fal-artifact.anchor\n",
  ],
])
  test(`fresh-init ignore guard fails with ${label}`, (t) => {
    const f = fixture(t, patterns);
    absent(f);
    assert.throws(
      () => requireArtifactPrivateIgnore(f.repo),
      /artifact_private_ignore_required/,
    );
    absent(f);
    assert.equal(f.git("status", "--porcelain"), "");
  });
test("nonignored alternate path fails Git check; helper never accepts operator-selected root", (t) => {
  const f = fixture(t),
    alternate = join(f.experiment, "alternate-private", "artifact.zip.partial");
  const r = spawnSync("git", ["check-ignore", "-q", "--", alternate], {
    cwd: f.repo,
  });
  assert.equal(r.status, 1);
  assert.equal(requireArtifactPrivateIgnore(f.repo), f.root);
  absent(f);
});
test("actual CLI checkout helper accepts exact clean authorized synthetic checkpoint without creating state", (t) => {
  const f = fixture(t),
    head = f.git("rev-parse", "HEAD");
  assert.equal(requireArtifactCheckout(f.repo, head, true), head);
  absent(f);
});
for (const mode of [
  "dirty tracked",
  "dirty untracked",
  "wrong SHA",
  "missing live approval",
])
  test(`fresh-init authorization refuses ${mode}`, (t) => {
    const f = fixture(t),
      head = f.git("rev-parse", "HEAD");
    if (mode === "dirty tracked")
      writeFileSync(join(f.experiment, ".gitignore"), "# changed\n");
    if (mode === "dirty untracked")
      writeFileSync(join(f.repo, "untracked.txt"), "SYNTHETIC");
    assert.throws(
      () =>
        requireArtifactCheckout(
          f.repo,
          mode === "wrong SHA" ? "0".repeat(40) : head,
          mode !== "missing live approval",
        ),
      /artifact_authorization_required/,
    );
    absent(f);
  });
function args() {
  return [
    "init",
    "--live",
    "--approved-sha=" + "0".repeat(40),
    "--continuation-root=C:/synthetic-not-used/continuation",
    "--recovery-root=C:/synthetic-not-used/status",
    "--retrieval-root=C:/synthetic-not-used/retrieval",
    "--diagnostic-root=C:/synthetic-not-used/diagnostic",
  ];
}
test("actual CLI rejects unauthorized fresh init before source reads or state creation", async () => {
  await assert.rejects(main(args()), /artifact_authorization_required/);
  assert.equal(
    existsSync(new URL("../private-fal-artifact/", import.meta.url)),
    false,
  );
  assert.equal(
    existsSync(new URL("../private-fal-artifact.anchor", import.meta.url)),
    false,
  );
});
for (const flag of [
  "--url=https://synthetic.invalid/file.zip",
  "--hash=" + "0".repeat(64),
  "--max-requests=3",
  "--max-bytes=999999999",
  "--private-root=C:/synthetic-alternate",
  "--manifest=alternate.json",
])
  test(`actual CLI refuses override ${flag.split("=")[0]}`, async () => {
    await assert.rejects(main([...args(), flag]), /artifact_arguments/);
  });
test("new identity inherits exact old pins, limits, ZIP and accounting with no capability expansion", () => {
  assert.equal(c.version, "phase38b-fal-exact-artifact-recovery-1");
  assert.equal(originalArtifact.version, "phase38b-fal-exact-artifact-1");
  const { recovery, ...same } = c;
  assert.equal(
    canonical({ ...same, version: originalArtifact.version }),
    canonical(originalArtifact),
  );
  assert.equal(
    recovery.originalPreparationSHA,
    "dcbf8105ce7e18928901620dcf899d76ec000e8b",
  );
  assert.equal(
    recovery.originalManifestHash,
    "310e802e1df5781a97336f9915668855421a50ff17e0c74532c44fc5df647f53",
  );
  assert.equal(
    hash(canonical(originalArtifact)),
    recovery.originalManifestHash,
  );
  assert.equal(artifactHash, hash(canonical(c)));
  assert.notEqual(artifactHash, recovery.originalManifestHash);
});
test("exact immutable stop evidence proves zero initialization and network before recovery", () => {
  const bytes = readFileSync(
      new URL("../results/fal-exact-artifact-001.json", import.meta.url),
    ),
    e = verifyArtifactStopEvidence(bytes);
  assert.equal(
    c.recovery.stopEvidenceCommit,
    "5c01cb463ea677186de5ed85aba874a4a363c746",
  );
  assert.equal(
    hash(bytes),
    "a7eb980b950c3a30f0c4686fdd9c4529d9e02927d38b63ab2df6ecf65c915760",
  );
  assert.equal(e.initialization.successfulInitializations, 0);
  assert.equal(e.terminal.assertion, "artifact_private_ignore_required");
  assert.ok(Object.values(e.network).every((v) => v === 0));
  assert.equal(e.accounting.changed, false);
});
for (const field of [
  "executionSHA",
  "retrievalIdentity",
  "retrievalHash",
  "initialization",
  "network",
  "accounting",
  "bindings",
])
  test(`modified stop ${field} is rejected`, () => {
    const e = JSON.parse(
      readFileSync(
        new URL("../results/fal-exact-artifact-001.json", import.meta.url),
      ),
    );
    e[field] = "MODIFIED_SYNTHETIC";
    assert.throws(
      () => verifyArtifactStopEvidence(Buffer.from(JSON.stringify(e))),
      /artifact_stop_evidence_hash/,
    );
  });
test("old identity can never be reused/reset as the recovery identity", (t) => {
  const f = fixture(t),
    sources = {
      continuationRoot: join(f.repo, "synthetic-old"),
      recoveryRoot: join(f.repo, "synthetic-status"),
      retrievalRoot: join(f.repo, "synthetic-retrieval"),
      diagnosticRoot: join(f.repo, "synthetic-diagnostic"),
    };
  initialize(f.root, COMMIT, {
    artifactHash: c.recovery.originalManifestHash,
    contract: originalArtifact,
  });
  assert.throws(
    () => initializeArtifact(f.root, COMMIT, sources, () => ({})),
    /run_already_exists/,
  );
  assert.throws(
    () => new ArtifactLedger(f.root, COMMIT, sources, () => ({})),
    /continuation_identity_mismatch/,
  );
  assert.equal(
    JSON.parse(readFileSync(join(f.root, "identity.json"), "utf8")).continuation
      .contract.version,
    "phase38b-fal-exact-artifact-1",
  );
});
test("CLI uses the tested fixed-root helper and retains no generic path override", () => {
  const cli = readFileSync(
    new URL("../src/fal-artifact-cli.ts", import.meta.url),
    "utf8",
  );
  assert.ok(cli.includes("root = requireArtifactPrivateIgnore(repo)"));
  assert.match(cli, /requireArtifactCheckout\(\s*repo/);
  assert.equal(
    cli.includes('git("check-ignore", root, root + ".anchor")'),
    false,
  );
  const helper = readFileSync(
    new URL("../src/fal-artifact-preflight.ts", import.meta.url),
    "utf8",
  );
  assert.ok(helper.includes('["check-ignore", "-q", "--", path]'));
  assert.equal(/mkdir|writeFile|appendFile/.test(helper), false);
});
