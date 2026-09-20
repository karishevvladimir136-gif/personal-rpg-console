import test from "node:test";
import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import {
  waveFixture,
  configuredWorld,
  stage,
} from "./wave1-integration-fixture.mjs";
import { fixture as worldFixture } from "./wave1-world-fixtures.mjs";
import {
  configurationProjection,
  providerSettings,
} from "../src/lib/production/configuration.ts";
import {
  makeSource,
  makePack,
  owner,
  id,
  entry,
  evidence,
} from "./wave1-library-fixtures.mjs";
import { buildCampaignBinding } from "../src/lib/world-packs/bindings.ts";
import { projectCharacterKnowledge } from "../src/lib/world-packs/projection.ts";

test("independent QA: Wave 2 browser dependency graphs contain no server modules or credentials", async () => {
  const root = fileURLToPath(new URL("../", import.meta.url));
  const seen = new Set();
  async function visit(file) {
    if (seen.has(file)) return;
    seen.add(file);
    assert.doesNotMatch(file.replaceAll("\\", "/"), /\/lib\/server\//, file);
    const source = await readFile(file, "utf8");
    const parsed = ts.createSourceFile(
      file,
      source,
      ts.ScriptTarget.Latest,
      true,
    );
    const modules = [];
    function walk(node) {
      // Setup copy may legitimately name an environment variable; executable
      // identifiers or indexed environment access must not read its value.
      const secret =
        /^(?:OPENAI_API_KEY|SUPABASE_SERVICE_ROLE_KEY|FAL_KEY|FAL_API_KEY)$/;
      if (ts.isIdentifier(node)) assert.doesNotMatch(node.text, secret, file);
      if (
        ts.isElementAccessExpression(node) &&
        /(?:process|import\.meta)\.env/.test(node.expression.getText(parsed)) &&
        ts.isStringLiteral(node.argumentExpression)
      )
        assert.doesNotMatch(node.argumentExpression.text, secret, file);
      if (
        ts.isImportDeclaration(node) &&
        node.moduleSpecifier &&
        ts.isStringLiteral(node.moduleSpecifier)
      ) {
        const clause = node.importClause;
        const bindings = clause?.namedBindings;
        const typeOnly =
          clause?.isTypeOnly ||
          (clause &&
            !clause.name &&
            bindings &&
            ts.isNamedImports(bindings) &&
            bindings.elements.every((e) => e.isTypeOnly));
        if (!typeOnly) modules.push(node.moduleSpecifier.text);
      }
      if (
        ts.isExportDeclaration(node) &&
        !node.isTypeOnly &&
        node.moduleSpecifier &&
        ts.isStringLiteral(node.moduleSpecifier)
      )
        modules.push(node.moduleSpecifier.text);
      if (
        ts.isCallExpression(node) &&
        node.expression.kind === ts.SyntaxKind.ImportKeyword &&
        node.arguments.length === 1 &&
        ts.isStringLiteral(node.arguments[0])
      )
        modules.push(node.arguments[0].text);
      ts.forEachChild(node, walk);
    }
    walk(parsed);
    for (const specifier of modules) {
      assert.notEqual(specifier, "server-only", file);
      assert.ok(!specifier.startsWith("node:"), `${file}: ${specifier}`);
      if (!specifier.startsWith(".") && !specifier.startsWith("@/")) continue;
      const base = specifier.startsWith("@/")
        ? path.join(root, "src", specifier.slice(2))
        : path.resolve(path.dirname(file), specifier);
      if (/\.(css|json)$/.test(base)) continue;
      const candidates = path.extname(base)
        ? [base]
        : [
            base + ".ts",
            base + ".tsx",
            path.join(base, "index.ts"),
            path.join(base, "index.tsx"),
          ];
      let found = false;
      for (const candidate of candidates) {
        try {
          await access(candidate);
        } catch {
          continue;
        }
        found = true;
        await visit(candidate);
        break;
      }
      assert.ok(found, `${file}: unresolved ${specifier}`);
    }
  }
  for (const file of [
    "production-settings.tsx",
    "campaign-pack-settings.tsx",
    "world-library/world-library.tsx",
  ])
    await visit(path.join(root, "src", "components", file));
  assert.ok(
    seen.size > 15,
    "audit follows transitive runtime imports, not just direct imports",
  );
});

test("independent QA: configuration projection excludes private world text and secret environment fields", () => {
  const { snapshot } = worldFixture();
  snapshot.world.threads[0].title = "QA_PRIVATE_THREAD_NAME";
  snapshot.world.threads[0].steps[0].privateText = "QA_PRIVATE_FUTURE_CAUSE";
  const projected = configurationProjection(
    snapshot,
    providerSettings({
      OPENAI_API_KEY: "QA_PROVIDER_SECRET",
      SUPABASE_SERVICE_ROLE_KEY: "QA_SERVICE_SECRET",
      OPENAI_DM_MODEL: "gpt-6-astra",
    }),
    "moderate",
  );
  assert.deepEqual(Object.keys(projected).sort(), [
    "campaignId",
    "headId",
    "pins",
    "providers",
    "revision",
    "ruleset",
    "runtimePolicy",
    "runtimeRevision",
    "timeline",
    "worldPolicy",
  ]);
  assert.doesNotMatch(
    JSON.stringify(projected),
    /QA_PRIVATE|QA_PROVIDER_SECRET|QA_SERVICE_SECRET|ownerId|threadId|stepId/,
  );
});

test("independent QA: only known, current, public, approved character claims cross the pack projection", () => {
  const source = makeSource();
  const pack = makePack(source, {
    extraClaims: [
      { text: "QA_FUTURE_CLAIM", validFrom: 100 },
      { text: "QA_EXPIRED_CLAIM", validUntil: 10 },
      { text: "QA_REFERENCE_CLAIM", authority: "reference" },
      {
        text: "QA_PRIVATE_CLAIM",
        visibility: "private",
        evidence: [evidence(source, { visibility: "private" })],
      },
      {
        text: "QA_SOURCE_ONLY",
        knowledge: "source",
        knownByEntityIds: [],
        evidence: [evidence(source, { knowledge: "source" })],
      },
      {
        text: "QA_FUTURE_SOURCE",
        knowledge: "future_source",
        knownByEntityIds: [],
        evidence: [evidence(source, { knowledge: "future_source" })],
      },
    ],
  });
  const binding = buildCampaignBinding({
    id: id(),
    campaignId: id(),
    ownerId: owner,
    pack,
    sourcePriority: [source.versionId],
    entry: entry(),
    allocateEntityId: id,
  });
  const result = projectCharacterKnowledge(
    pack,
    binding,
    binding.mappings[0].entityId,
    50,
  );
  assert.deepEqual(result, [{ text: "A calm harbor.", epistemic: "fact" }]);
  assert.doesNotMatch(JSON.stringify(result), /QA_/);
  assert.throws(() => projectCharacterKnowledge(pack, binding, id(), 50));
  const foreign = structuredClone(pack);
  foreign.ownerId = id();
  assert.throws(() =>
    projectCharacterKnowledge(
      foreign,
      binding,
      binding.mappings[0].entityId,
      50,
    ),
  );
});

test("independent QA: pending recovery and committed runtime responses omit internal stages, future steps and private Events", async () => {
  const f = await waveFixture();
  try {
    const w = await configuredWorld(f);
    const future = structuredClone(w.state.threads[0].steps[0]);
    future.id = id();
    future.trigger.atWorldMinutes = 100;
    future.privateText = "QA_PRIVATE_FUTURE_CAUSE";
    future.publicOutcome.text = "QA_UNREACHED_FUTURE_TEXT";
    w.state.threads[0].steps.push(future);
    await f.write(w.cid, "configure", { world: w.state });
    const pending = await stage(f, w);
    const before = await f.runtime(w.cid, "play");
    assert.match(JSON.stringify(before), /worldRecovery/);
    assert.doesNotMatch(
      JSON.stringify(before),
      /PRIVATE_|QA_UNREACHED|worldSettlement|worldLogic|authority|nextWorld|expectedHeadId|capabilityRefs/,
    );
    await f.runtime(w.cid, "commit", {
      ...pending.claim.lease,
      packet: pending.packet,
    });
    const after = await f.runtime(w.cid, "play");
    assert.doesNotMatch(
      JSON.stringify(after),
      /PRIVATE_|QA_UNREACHED|worldSettlement|worldLogic|authority|nextWorld/,
    );
    const privateEvents = await f.query(
      "select event from rpg_private.world_events where campaign_id=$1 and event->>'visibility'='private'",
      [w.cid],
    );
    assert.equal(privateEvents.length, 1);
    assert.match(JSON.stringify(privateEvents), /PRIVATE_WAVE1_EVENT/);
    const publicSources = await f.query(
      "select text from rpg_private.memory_public_sources where campaign_id=$1 and kind='event' and current",
      [w.cid],
    );
    assert.equal(publicSources.length, 1);
    assert.doesNotMatch(JSON.stringify(publicSources), /PRIVATE_|QA_UNREACHED/);
  } finally {
    await f.db.close();
  }
});

test("independent QA: World Logic context rejects non-player action identity and strips private/future source material", async () => {
  const {
    fixture,
    proposal,
    id: stableId,
  } = await import("./wave2-logic-fixtures.mjs");
  const { worldLogicContext, resolveWorldLogic } =
    await import("../src/lib/rulesets/world-logic.ts");
  const { bind, evidence: locator } =
    await import("./wave1-world-fixtures.mjs");
  const input = fixture();
  bind(input);
  input.source.privateState = { future: "QA_PRIVATE_DM_FACT" };
  input.snapshot.world.actors[1].capabilities = ["QA_HIDDEN_NPC_CAPABILITY"];
  input.snapshot.world.actors[0].knowledge = [
    locator({ locator: { kind: "text", value: "QA_PRIVATE_LOCATOR" } }),
    locator({
      visibility: "public",
      knowledge: "future_source",
      locator: { kind: "text", value: "QA_FUTURE_LOCATOR" },
    }),
    locator({
      visibility: "public",
      knowledge: "character",
      locator: { kind: "text", value: "KNOWN_LOCATOR" },
    }),
  ];
  const context = worldLogicContext(input);
  assert.doesNotMatch(
    JSON.stringify(context),
    /QA_PRIVATE|QA_HIDDEN|QA_FUTURE/,
  );
  assert.equal(context.actors[0].evidence.length, 1);
  assert.throws(() =>
    resolveWorldLogic(input, proposal(input, { actorId: stableId("enemy") })),
  );
  for (const language of ["en", "ru"]) {
    input.source.snapshot.campaign.language = language;
    input.input.input =
      language === "ru" ? "Я смотрю на двор." : "I look at the courtyard.";
    const before = structuredClone(input.source.snapshot.entities);
    const result = resolveWorldLogic(
      input,
      proposal(input, { evidenceIndexes: [0] }),
    );
    assert.equal(result.status, "staged");
    assert.equal(worldLogicContext(input).language, language);
    assert.deepEqual(result.resolution.changes, []);
    assert.deepEqual(input.source.snapshot.entities, before);
    assert.doesNotMatch(
      JSON.stringify(result.publicEvents),
      /QA_PRIVATE|QA_HIDDEN|QA_FUTURE|hp|d20|checks/,
    );
  }
});

test("independent QA: public pending-turn projection cannot reveal a private-only staged Event", async () => {
  const f = await waveFixture();
  try {
    const w = await configuredWorld(f);
    w.state.threads[0].steps[0].publicOutcome = null;
    await f.write(w.cid, "configure", { world: w.state });
    const pending = await stage(f, w);
    assert.equal(pending.proposal.settlement.events.length, 1);
    assert.equal(pending.proposal.settlement.events[0].visibility, "private");
    const projected = await f.one(
      "select rpg_private.runtime_public_turn(t) staged, rpg_private.runtime_public_turn(jsonb_populate_record(null::rpg_private.turns,to_jsonb(t)#-'{checkpoint,worldSettlement}')) unstaged from rpg_private.turns t where t.campaign_id=$1 and t.id=$2",
      [w.cid, pending.input.operationId],
    );
    assert.deepEqual(projected.staged, projected.unstaged);
  } finally {
    await f.db.close();
  }
});
