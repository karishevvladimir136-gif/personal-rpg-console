// TOWN_8 amendment 1's proofs at $0: the branch point (sol-unknown's record replayed from a fresh squeeze town to the end
// of c48, byte-identical to its saved world) and the continuation c49–c72 on the scripted gateway — Sol on OpenRouter
// pinned to OpenAI, the judges on OpenRouter's Messages route pinned to Anthropic, provenance checked on every call, the
// amendment's own ledger and ceiling, the after-question with its one added sentence, the replay identical from cycle 1.
//   node --test --test-reporter=spec scripts/town-8/continue.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { saveWorld } from "../town-0/town.mjs";
import { sha256, systemTextOf } from "../town-0/interface.mjs";
import { A1, AFTER_CONTINUED, NAME, SOL_OR, branchPoint, runC72 } from "./continue.mjs";
import { scriptedGateway } from "./scripted-gateway.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const gz = (f) => JSON.parse(gunzipSync(readFileSync(f)));
const quiet = () => {};
function scratch(name, gateway = {}) {
  const dir = mkdtempSync(join(tmpdir(), `town-8-a1-${name}-`));
  const paths = { out: join(dir, "out"), work: join(dir, "work"), source: join(ROOT, "docs", "runs", "town-8-worlds", "sol-unknown"), dir: join(dir, "out", NAME), ledger: join(dir, "work", "ledger.json"), root: ROOT };
  mkdirSync(paths.dir, { recursive: true });
  return { paths, keys: { llmapi: "x", openrouter: "x" }, fetcher: scriptedGateway({ distressAt: [], ...gateway }), scripted: true };
}

test("A1 the branch point: sol-unknown's record replayed through a fresh squeeze town to the end of c48 is byte-identical to its saved world", async () => {
  const ctx = scratch("a1");
  const bp = await branchPoint(ctx);
  assert.equal(bp.identical, true);
  assert.deepEqual(bp.cursor, { round: 48, order: null, pos: 0 });
  assert.equal(bp.savedSha256, sha256(saveWorld(gz(join(ctx.paths.source, "world.json.gz")))));
  assert.equal(bp.rations, 0);
});

test("A2 sol-unknown-c72 on the scripted gateway: c49–72 from the proven branch point on the OpenRouter routes (provenance true on every call), the amendment's ledger under $15, every citizen asked the after-question with the continuation's sentence, replay identical from cycle 1", async () => {
  const ctx = scratch("a2");
  await branchPoint(ctx);
  await runC72(ctx, { log: quiet, town11Spent: 195 }); // the scripted balance ($150) holds the need only with TOWN_11 spent
  const world = gz(join(ctx.paths.dir, "world.json.gz")), record = gz(join(ctx.paths.dir, "record.json.gz")), calls = gz(join(ctx.paths.dir, "calls.json.gz"));
  assert.ok(world.state.clock.round > A1.from);
  assert.equal(record.replay.identical, true);
  assert.ok(calls.length > 0 && calls.every((c) => c.provenance === true), "every call served by the pinned model and host");
  assert.ok(calls.some((c) => c.family === SOL_OR.name && c.upstream === "OpenAI"));
  assert.ok(calls.some((c) => c.family === "judge" && c.upstream === "Anthropic"));
  assert.ok(JSON.parse(readFileSync(join(ctx.paths.dir, "ledger.json"), "utf8")).totalUsd < A1.ceiling);
  for (const a of Object.values(record.agents)) { assert.equal(a.after?.asked, true); assert.ok(a.after.question.includes(AFTER_CONTINUED)); assert.ok(a.afterC48?.asked, "the c48 after-answers kept apart"); }
  assert.equal(record.interfaceSha256, sha256(systemTextOf(world.state)), "the same interface text (door unknown) as sol-unknown");
  assert.equal(world.log.filter((e) => e.agent === "operator" && e.tool === "notice").length, 1, "no new hand of the operator");
});
