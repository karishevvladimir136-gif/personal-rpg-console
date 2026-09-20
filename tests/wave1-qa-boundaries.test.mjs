import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import { registerHooks } from "node:module";
import {
  resolveExecutionProfile,
  validateRuntimePolicy,
} from "../src/lib/model-runtime/registry.ts";
import { readFoundationSave } from "../src/lib/production-adapters/foundation-saves.ts";
import { runtimeFixture } from "./phase2-runtime-fixtures.mjs";
const hook = registerHooks({
  resolve(specifier, context, next) {
    return specifier === "server-only"
      ? { url: "data:text/javascript,export%20{}", shortCircuit: true }
      : next(specifier, context);
  },
});
const { createDmProvider } = await import("../src/lib/server/dm/index.ts");
hook.deregister();
const root = fileURLToPath(new URL("../src/", import.meta.url));
async function files(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await files(full)));
    else if (/\.tsx?$/.test(full)) out.push(full);
  }
  return out;
}
async function resolveImport(from, name) {
  const base = name.startsWith("@/")
    ? path.join(root, name.slice(2))
    : name.startsWith(".")
      ? path.resolve(path.dirname(from), name)
      : null;
  if (!base) return null;
  for (const candidate of [
    base,
    base + ".ts",
    base + ".tsx",
    path.join(base, "index.ts"),
    path.join(base, "index.tsx"),
  ]) {
    try {
      if ((await stat(candidate)).isFile()) return candidate;
    } catch {}
  }
  assert.fail(
    `Unresolved client import ${name} from ${path.relative(root, from)}`,
  );
}

test("QA all client entry import graphs exclude private foundations, server modules and credentials", async () => {
  const sources = await files(root),
    contents = new Map(
      await Promise.all(
        sources.map(async (file) => [file, await readFile(file, "utf8")]),
      ),
    );
  const roots = sources.filter((file) =>
      /^\s*["']use client["'];/m.test(contents.get(file)),
    ),
    visited = new Set();
  assert.ok(roots.length > 0);
  async function visit(file) {
    if (visited.has(file)) return;
    visited.add(file);
    const text = contents.get(file) ?? (await readFile(file, "utf8"));
    assert.doesNotMatch(
      path.relative(root, file).replaceAll("\\", "/"),
      /(^|\/)server\/|^lib\/(world-library|world-packs|production-adapters|model-runtime)\//,
    );
    assert.doesNotMatch(
      text,
      /(?:OPENAI_API_KEY|SUPABASE_SERVICE_ROLE_KEY|FAL_KEY|rpg_world|rpg_library|rpg_execution_profile)/,
    );
    assert.doesNotMatch(text, /(?:import\s*["']server-only["'])/);
    const pattern =
      /(?:import|export)\s+(?!type\b)(?:[^;]*?\s+from\s*)?["']([^"']+)["']/g;
    for (const match of text.matchAll(pattern)) {
      const next = await resolveImport(file, match[1]);
      if (next) await visit(next);
    }
    for (const match of text.matchAll(/import\(\s*["']([^"']+)["']\s*\)/g)) {
      const next = await resolveImport(file, match[1]);
      if (next) await visit(next);
    }
  }
  for (const file of roots) await visit(file);
  assert.ok(visited.size >= roots.length);
});

test("QA unsupported explicit profiles never fall back or expose private provider strings in failures", async () => {
  const prior = process.env.OPENAI_API_KEY;
  process.env.OPENAI_API_KEY = "QA_SYNTHETIC_SERVER_ONLY_SECRET";
  try {
    let requests = 0;
    const { source, input } = runtimeFixture();
    const good = resolveExecutionProfile({
      task: "dm.plan",
      profileId: randomUUID(),
      globalDefault: {
        providerId: "openai",
        modelId: "gpt-6-astra",
        reasoning: "xhigh",
      },
    });
    for (const patch of [
      { providerId: "QA_PRIVATE_PROVIDER_MARKER" },
      { modelId: "QA_PRIVATE_MODEL_MARKER" },
      { reasoning: "QA_PRIVATE_OPTION_MARKER" },
      { registryVersion: "QA_PRIVATE_REGISTRY_MARKER" },
      { apiKey: "QA_SYNTHETIC_SERVER_ONLY_SECRET" },
      { task: "dm.narrate" },
    ]) {
      const provider = createDmProvider({
        resolveProfile: () => ({ ...good, ...patch }),
        fetcher: async () => {
          requests++;
          throw Error("FORBIDDEN_NETWORK_PATH");
        },
      });
      await assert.rejects(
        () => provider.plan(source, input),
        (error) => {
          assert.equal(error.code, "configuration");
          assert.doesNotMatch(
            JSON.stringify(error) + String(error),
            /QA_PRIVATE|QA_SYNTHETIC|FORBIDDEN_NETWORK/,
          );
          return true;
        },
      );
    }
    assert.equal(requests, 0);
    assert.throws(
      () =>
        validateRuntimePolicy({
          schemaVersion: 1,
          revision: 1,
          primary: {
            providerId: "openai",
            modelId: "gpt-6-astra",
            reasoning: "xhigh",
          },
          taskOverrides: { "dm.plan": null },
        }),
      { code: "configuration" },
    );
    assert.throws(
      () =>
        resolveExecutionProfile({
          task: "dm.plan",
          profileId: randomUUID(),
          globalDefault: {
            providerId: "openai",
            modelId: "gpt-6-astra",
            reasoning: "xhigh",
          },
          providerAvailable: () => false,
        }),
      { code: "configuration" },
    );
  } finally {
    if (prior === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = prior;
  }
});

test("QA legacy foundation adapter refuses invented saved state and restores an empty world without provider resolution", () => {
  const serving = {
    ownerId: randomUUID(),
    campaignId: randomUUID(),
    timeline: { timelineId: randomUUID(), epoch: 12 },
    runtimeRevision: 18,
    headId: randomUUID(),
    worldMinutes: 80,
  };
  const restored = readFoundationSave(1, null, serving);
  assert.equal(restored.world, null);
  assert.deepEqual(restored.bindings, []);
  assert.equal(restored.executionPolicy, null);
  assert.equal(restored.ruleset.id, "console-basic-v1");
  assert.throws(() => readFoundationSave(1, restored, serving));
  for (const key of ["ownerId", "campaignId"])
    assert.throws(() =>
      readFoundationSave(2, restored, { ...serving, [key]: randomUUID() }),
    );
  assert.throws(() =>
    readFoundationSave(2, restored, { ...serving, worldMinutes: 81 }),
  );
  const next = readFoundationSave(2, restored, {
    ...serving,
    timeline: { timelineId: randomUUID(), epoch: 13 },
  });
  assert.equal(next.timeline.epoch, 13);
  assert.equal(restored.timeline.epoch, 12);
});
