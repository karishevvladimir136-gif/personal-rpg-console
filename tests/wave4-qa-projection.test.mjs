import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import ts from "typescript";
import { fixture as commerceFixture, id } from "./wave4-commerce-fixtures.mjs";
import { fixture as preparationFixture } from "./wave4-preparation-fixtures.mjs";
import { moduleFromSource, source } from "./wave4-qa-fixture.mjs";
const { foundationLoopProjection } = await moduleFromSource(
  "foundation-loop/projection.ts",
);
const { parseLoopRequest } = await moduleFromSource(
  "foundation-loop/authority.ts",
);
const { buildPreparationDraft, planPreparation } = await moduleFromSource(
  "playable-world/preparation.ts",
);

test("QA projection: owner and player DTOs omit hidden Actor stock identities, names, quantities and valuation policies", () => {
  const { context } = commerceFixture();
  const hiddenActor = context.world.actors.find((a) => a.id === id("enemy"));
  hiddenActor.publicName = null;
  context.snapshot.items.find((i) => i.id === id("stock")).name =
    "HIDDEN_ACTOR_STOCK_MARKER";
  const output = foundationLoopProjection(context);
  const serialized = JSON.stringify(output);
  for (const privateId of [
    id("enemy"),
    id("merchant-storage"),
    id("stock"),
    id("private-stock"),
  ])
    assert.equal(
      serialized.includes(privateId),
      false,
      `Hidden identity ${privateId} leaked`,
    );
  assert.equal(serialized.includes("MARKER"), false);
  assert.equal(serialized.includes("PRIVATE_STOCK"), false);
});

function approvedCreationEvent(context, heroId) {
  return {
    schemaVersion: 1,
    id: id("bootstrap-event"),
    campaignId: context.foundation.campaignId,
    originTimelineId: context.foundation.timeline.timelineId,
    operationId: id("bootstrap-operation"),
    sequence: 1,
    worldMinutes: 0,
    kind: "campaign.bootstrap.created",
    visibility: "private",
    text: "Owner-reviewed protagonist creation.",
    actorIds: [],
    threadIds: [],
    evidence: [],
    payload: {
      schemaVersion: 1,
      classification: "owner_authored_protagonist",
      heroId,
      review: {
        capabilities: ["Reads tracks on the open road"],
        limitations: ["No supernatural power"],
      },
    },
  };
}

test("Character projection shows only current owner-approved creation facts, never private World Actor capabilities", () => {
  const { context } = commerceFixture();
  const player = context.snapshot.entities.find((row) => row.kind === "player");
  const hero = context.world.actors.find((row) => row.control === "player" && row.entityId === player.id);
  const other = context.world.actors.find((row) => row.control === "autonomous");
  hero.capabilities = ["Reads tracks on the open road", "PRIVATE_HERO_CAPABILITY"];
  hero.limitations = ["No supernatural power", "PRIVATE_HERO_LIMITATION"];
  other.capabilities = ["PRIVATE_OTHER_ACTOR_CAPABILITY"];
  other.limitations = ["PRIVATE_OTHER_ACTOR_LIMITATION"];
  context.events.push(approvedCreationEvent(context, player.id));
  const view = foundationLoopProjection(context);
  assert.deepEqual(view.playerCharacter, {
    entityId: player.id,
    capabilities: ["Reads tracks on the open road"],
    limitations: ["No supernatural power"],
  });
  assert.doesNotMatch(JSON.stringify(view), /PRIVATE_(HERO|OTHER_ACTOR)_/);
  hero.capabilities = ["PRIVATE_HERO_CAPABILITY"];
  assert.deepEqual(foundationLoopProjection(context).playerCharacter.capabilities, []);
  hero.publicName = null;
  assert.equal(foundationLoopProjection(context).playerCharacter, null);
});

test("Character creation-fact projection rejects absent, malformed and wrong-scope approvals", () => {
  const { context } = commerceFixture();
  const player = context.snapshot.entities.find((row) => row.kind === "player");
  assert.equal(foundationLoopProjection(context).playerCharacter, null);
  const creation = approvedCreationEvent(context, player.id);
  context.events.push({ ...creation, payload: { ...creation.payload, heroId: id("other-player") } });
  assert.equal(foundationLoopProjection(context).playerCharacter, null);
  context.events[0] = { ...creation, campaignId: id("other-campaign") };
  assert.throws(() => foundationLoopProjection(context), { code: "scope" });
  context.events[0] = { ...creation, payload: { ...creation.payload, review: {
    capabilities: ["PRIVATE_MALFORMED", 17], limitations: [],
  } } };
  assert.equal(foundationLoopProjection(context).playerCharacter, null);
});

test("QA projection: private stock, origin/provenance and private receipt payloads do not leak from ordinary owner view", () => {
  const { context } = commerceFixture();
  context.events.push({
    schemaVersion: 1,
    id: id("private-event"),
    campaignId: context.foundation.campaignId,
    originTimelineId: context.foundation.timeline.timelineId,
    operationId: id("private-operation"),
    sequence: 1,
    worldMinutes: 0,
    kind: "owner_preparation",
    actorIds: [],
    threadIds: [],
    visibility: "private",
    text: "PRIVATE_EVENT_MARKER",
    evidence: [],
    payload: { secret: "PRIVATE_PAYLOAD_MARKER" },
  });
  const serialized = JSON.stringify(foundationLoopProjection(context));
  assert.equal(serialized.includes(id("private-stock")), false);
  assert.equal(serialized.includes("PRIVATE_"), false);
  assert.equal(serialized.includes("sourceVersionIds"), false);
});

test("QA projection: a public reward source cannot expose a private item through its owner-editable reward entry", () => {
  const { context } = commerceFixture();
  context.state.rewards = [
    {
      id: "secret-stock-package",
      version: 1,
      label: "Recorded source reward",
      source: { kind: "quest", id: context.snapshot.quests[0].id },
      distribution: "actor",
      recipientIds: [id("player")],
      entries: [{ kind: "item", itemId: id("private-stock"), quantity: 1 }],
    },
  ];
  const serialized = JSON.stringify(foundationLoopProjection(context));
  assert.equal(
    serialized.includes(id("private-stock")),
    false,
    "Private inventory identity escaped via owner.rewards.entries",
  );
});

test("QA public boundary: request parsing rejects server plans, generated patches, reward amounts and alternate authority envelopes", () => {
  const { command } = commerceFixture();
  const request = {
    command,
    kind: "reward",
    input: { rewardId: "approved", expectedRewardVersion: 1 },
  };
  assert.deepEqual(parseLoopRequest(request), request);
  for (const extra of [
    "plan",
    "state",
    "changes",
    "events",
    "privateState",
    "amount",
    "resolution",
  ])
    assert.throws(() => parseLoopRequest({ ...request, [extra]: {} }));
  for (const kind of [
    "theft",
    "reward.granted",
    "loop_commit",
    "patch",
    "owner.override",
  ])
    assert.throws(() => parseLoopRequest({ ...request, kind }));
});

test("QA Pack preparation: changing later campaign time cannot reveal canon that was future at the pinned entry", () => {
  const f = preparationFixture();
  const claim = f.source.pack.body.claims[0];
  claim.text = "FUTURE_ENTRY_MARKER";
  claim.validFrom = f.source.binding.entry.worldMinutes + 1;
  f.source.worldMinutes = claim.validFrom + 100;
  f.context.foundation.worldMinutes = f.source.worldMinutes;
  const draft = buildPreparationDraft(f.source, f.context);
  assert.equal(JSON.stringify(draft).includes("FUTURE_ENTRY_MARKER"), false);
  for (const entity of draft.entities) entity.selected = false;
  for (const thread of draft.threads) thread.selected = false;
  const plan = planPreparation(f.context, f.source, draft);
  assert.equal(
    JSON.stringify(plan.events).includes("FUTURE_ENTRY_MARKER"),
    false,
  );
});

async function walk(dir) {
  const result = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const item = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...(await walk(item)));
    else if (/\.[cm]?[jt]sx?$/.test(entry.name)) result.push(item);
  }
  return result;
}

test("QA import graph: browser entry points cannot reach private Wave 4 context, planners, service RPCs or Node authority", async () => {
  const root = fileURLToPath(source("src/"));
  const files = await walk(root),
    texts = new Map(
      await Promise.all(files.map(async (f) => [f, await readFile(f, "utf8")])),
    );
  const clients = files.filter((f) =>
    /^[\s]*(?:["']use client["']);?/m.test(texts.get(f)),
  );
  const forbidden =
    /[/\\]lib[/\\](?:server[/\\]|foundation-loop[/\\](?:authority|state|projection|configuration)\.|commerce[/\\](?:index|trade|context|transfer|haggle)\.|progression[/\\](?:index|planning|public|validation)\.|playable-world[/\\]preparation\.)/;
  const graph = new Map();
  for (const file of files) {
    const ast = ts.createSourceFile(
        file,
        texts.get(file),
        ts.ScriptTarget.Latest,
        true,
      ),
      imports = [];
    for (const node of ast.statements) {
      if (
        ts.isImportDeclaration(node) &&
        !node.importClause?.isTypeOnly &&
        !(
          node.importClause?.namedBindings &&
          ts.isNamedImports(node.importClause.namedBindings) &&
          !node.importClause.name &&
          node.importClause.namedBindings.elements.length &&
          node.importClause.namedBindings.elements.every((e) => e.isTypeOnly)
        )
      )
        imports.push(node.moduleSpecifier.text);
      if (
        ts.isExportDeclaration(node) &&
        node.moduleSpecifier &&
        !node.isTypeOnly &&
        !(
          node.exportClause &&
          ts.isNamedExports(node.exportClause) &&
          node.exportClause.elements.every((e) => e.isTypeOnly)
        )
      )
        imports.push(node.moduleSpecifier.text);
    }
    graph.set(file, imports);
  }
  const resolve = async (from, name) => {
    const base = name.startsWith("@/")
      ? path.join(root, name.slice(2))
      : name.startsWith(".")
        ? path.resolve(path.dirname(from), name)
        : null;
    if (!base) return null;
    for (const candidate of [
      base,
      `${base}.ts`,
      `${base}.tsx`,
      `${base}.js`,
      path.join(base, "index.ts"),
      path.join(base, "index.tsx"),
    ]) {
      if (texts.has(candidate)) return candidate;
      try {
        if ((await stat(candidate)).isFile()) return null;
      } catch {
        /* absent extension */
      }
    }
    return null;
  };
  const visited = new Set(),
    queue = clients.map((f) => [f, f]);
  while (queue.length) {
    const [file, entry] = queue.pop();
    if (visited.has(file)) continue;
    visited.add(file);
    assert.equal(
      forbidden.test(file),
      false,
      `Client ${path.relative(root, entry)} reaches private ${path.relative(root, file)}`,
    );
    for (const name of graph.get(file) ?? []) {
      assert.equal(
        name.startsWith("node:") || name === "server-only",
        false,
        `Client ${path.relative(root, entry)} reaches ${name}`,
      );
      const target = await resolve(file, name);
      if (target) queue.push([target, entry]);
    }
  }
  assert.ok(clients.length > 0);
});
