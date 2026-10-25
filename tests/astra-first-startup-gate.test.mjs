import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import ts from "typescript";
import { astraStartupPending, AstraStartupPendingError } from "../src/lib/gameplay/startup-admission.ts";
import { safeGameplayError } from "../src/lib/gameplay/http-response.ts";
import { gameplayErrorMessage, GameplayClientError } from "../src/lib/gameplay/client.ts";
import { runWithAstraMemoryMaintenance } from "../src/lib/memory/after-commit.ts";

const structured = { schemaVersion: 1, mode: "structured_rpg" };
const narrative = { schemaVersion: 1, mode: "narrative" };
const require = createRequire(import.meta.url);

function openingStatusFixture(result) {
  const calls = [];
  const modules = {
    "server-only": {},
    "@supabase/supabase-js": { createClient: () => ({
      rpc: async (name, args) => {
        calls.push({ name, args });
        return result;
      },
    }) },
    "../gameplay/dm-errors.ts": { DmError: class extends Error {
      constructor(code) { super(code); this.code = code; }
    } },
    "./campaign-authorization": { authorizeCampaign: async () => ({
      user: { id: "owner" },
    }) },
  };
  const source = readFileSync(new URL("../src/lib/server/astra-first-status.ts", import.meta.url), "utf8");
  const output = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
  } }).outputText;
  const loadedModule = { exports: {} };
  vm.runInThisContext(`(function(require,module,exports){${output}\n})`,
    { filename: "astra-first-status.ts" })(
      (name) => Object.hasOwn(modules, name) ? modules[name] :
        (() => { throw new Error(`Unexpected module ${name}`); })(),
      loadedModule, loadedModule.exports);
  return { read: loadedModule.exports.readAstraFirstOpeningStatus, calls };
}

function serviceFixture({ sheet = structured, pinned = null, takeover = false,
  opening = false, manualLocation = false, currentSceneRole = "narration",
  existing = false } = {}) {
  const calls = { production: 0, preflight: 0, astra: 0, legacy: 0, sheets: 0,
    openingReads: 0 };
  const store = {
    runtimeIdentity: async () => pinned,
    takeoverStatus: async () => ({ active: takeover }),
    readPlay: async () => ({ campaignId: "campaign", revision: 1, turns: [] }),
    getPublic: async () => {
      if (existing) return { operationId: "operation", status: "pending" };
      throw new Error("not found");
    },
  };
  const client = { from: (table) => ({ select: () => ({
    eq() { return this; },
    single: async () => ({ data: { current_location_id: opening || manualLocation ? "location" : null,
      current_scene_id: opening ? "opening-scene" : "initial-note" }, error: null }),
    maybeSingle: async () => ({ data: { role: currentSceneRole }, error: null }),
    then(resolve, reject) {
      if (table === "rpg_entities") calls.sheets++;
      return Promise.resolve({ data: [{ character_sheet: sheet }], error: null })
        .then(resolve, reject);
    },
  }) }) };
  const modules = {
    "server-only": {},
    "next/server": { after: () => {} },
    "../memory/after-commit": { runWithAstraMemoryMaintenance },
    "./campaign-authorization": { authorizeCampaign: async () => ({ user: { id: "owner" }, client }) },
    "./errors": { PersistenceError: class extends Error {} },
    "../persistence/validation": { isUuid: () => true },
    "../saves/fence": { isTimelineFence: () => true },
    "./saves/store": { createSaveStore: () => ({ fence: async () => ({ timelineId: "timeline", epoch: 1 }) }) },
    "./dm": { createTurnStore: () => store },
    "./astra-first-status": { readAstraFirstOpeningStatus: async (_campaignId, timeline) => {
      calls.openingReads++;
      assert.equal(timeline.timelineId, "timeline");
      return opening;
    } },
    "./production-service": { productionServices: () => {
      calls.production++;
      return { summaries: {}, astraProvider: {}, provider: {}, contextModel: {} };
    } },
    "./production-configuration": { readProductionSettings: async () => ({ ruleset: { id: "world-logic-v1" } }) },
    "../model-runtime/registry": { resolveExecutionProfile: () => ({ modelId: "unused" }) },
    "../production/task-defaults": { applicationGameplayTaskSelection: () => ({}) },
    "../gameplay/turn-engine": { runTurn: async () => { calls.legacy++; return "legacy"; }, resumeTurn: async () => "legacy-resume" },
    "../gameplay/astra-primary": {
      runAstraTurn: async () => { calls.astra++; return "astra"; },
      resumeAstraTurn: async () => "astra-resume",
      selectAstraPrimaryRuntime: (runtime, enabled, mode, ruleset, active) =>
        runtime === "astra-primary-v1" || (runtime === null && enabled &&
          mode === "game" && ruleset === "world-logic-v1" && active),
    },
    "../gameplay/startup-admission": { astraStartupPending, AstraStartupPendingError },
    "../production/dm-turn-pin": { withAstraTurnPin: (store) => store },
    // Stage 2: the dm-loop-v1 path is routed by the campaign's DM settings; this
    // fixture keeps the campaign on the Astra runtime so the old routing is tested.
    "../gameplay/dm-loop/loop": { DM_LOOP_RUNTIME: "dm-loop-v1",
      runDmLoopTurn: async () => { throw new Error("unexpected dm-loop turn"); },
      resumeDmLoopTurn: async () => { throw new Error("unexpected dm-loop resume"); } },
    // DM architecture bake-off: the experimental two-pass runtime stays off (no flag) on this path.
    "../gameplay/dm-loop/two-pass": { bookkeeperOf: () => ({ providerId: "anthropic", modelId: "claude-sonnet-5-5", effort: "high" }),
      runCampaignTurn: async () => { throw new Error("unexpected loop turn"); },
      resumeCampaignTurn: async () => { throw new Error("unexpected loop resume"); } },
    "../production/dm-loop-pin": { dmLoopPinFromProfile: () => ({}), dmLoopProfile: () => ({}) },
    "./dm/model": { createDmModel: () => ({}) },
    // BEDROCK_PROVIDER_1: the door's key (the anthropic door's, as the helper returns it by default).
    "./anthropic-endpoint": { anthropicApiKey: () => (process.env.ANTHROPIC_API_KEY ?? "").trim() },
    "./dm/live-turns": { publishLiveTurnEvent: () => {}, keepLiveTurnLedger: () => {} },
    "./turn-snapshots": { saveTurnSnapshot: async () => {} },
    // Voice stage part 5: the quotable-line check is scheduled after a loop commit only, never on this path.
    "./voice/quotable-check": { scheduleQuotableCheck: () => {} },
    "./dm-settings": { readDmSettings: async () => ({ campaignId: "campaign", runtime: "astra-primary-v1", dmTurn: null, revision: 1 }),
      markBoostUsed: async () => {} },
    // Stage 4: the dossier, the session digest, the World Engine bridge and the
    // loop's feedback provider are not reached on the Astra runtime path.
    "./dossier": { dossierService: () => ({}) },
    "./session-digest": { digestOnEntry: async () => {}, entryCheckDue: () => false },
    // Fix run A2/A6/B1: the DM's observations, the ledger checker and the hidden-layer prep are loop-only.
    "../gameplay/dm-loop/observations": { appendObservations: (stored) => stored },
    "../gameplay/dm-loop/ledger-check": { checkLedger: async () => ({ misses: [], usage: null, costUsdMicros: 0, elapsedMs: 0, error: null }) },
    "./hidden-layer-prep": { prepSchedulable: () => false, schedulePrep: () => false },
    "../gameplay/dm-loop/roll-check": { checkRollsTold: async () => ({ untold: [], costUsdMicros: 0, error: null }) },
    "./note-fold": { scheduleFightFold: () => {} },
    "../live2d/server/battle-schedule": { scheduleBattleBackground: () => {} },
    "./world-bridge": { syncWorldFromDossier: async () => {} },
    "../gameplay/dm-loop/feedback": { loopFeedbackProvider: () => ({}) },
    "./public-campaign": { readPublicCampaign: async () => ({}) },
    "../gameplay/dm-errors": { DmError: class extends Error {} },
    "./memory/store": { createMemoryStore: () => ({}) },
    "../memory/lifecycle": {
      memoryAwareProvider: () => ({}),
      preflightMemory: async () => { calls.preflight++; },
      maintainAstraMemoryAfterCommit: async () => {},
    },
    "../gameplay/request-validation": {
      validateTurnInput: (value) => value,
      validateResumeInput: (value) => value,
    },
  };
  const source = readFileSync(new URL("../src/lib/server/gameplay-service.ts", import.meta.url), "utf8");
  const output = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
  } }).outputText;
  const loadedModule = { exports: {} };
  vm.runInThisContext(`(function(require,module,exports){${output}\n})`,
    { filename: "gameplay-service.ts" })(
      (name) => name === "node:crypto" ? require(name) :
        Object.hasOwn(modules, name) ? modules[name] :
          (() => { throw new Error(`Unexpected module ${name}`); })(),
      loadedModule, loadedModule.exports);
  const input = { campaignId: "campaign", operationId: "operation", mode: "game",
    timeline: { timelineId: "timeline", epoch: 1 }, input: "I look around." };
  return { service: loadedModule.exports, calls, input };
}

test("only a reviewed modern World Logic hero awaits explicit Astra startup", () => {
  assert.equal(astraStartupPending("world-logic-v1", [structured], false, true, false), true);
  assert.equal(astraStartupPending("world-logic-v1", [narrative], false, true, false), true);
  assert.equal(astraStartupPending("world-logic-v1", [structured], false, true, true), false);
  assert.equal(astraStartupPending("world-logic-v1", [structured], true, true, true), false);
  assert.equal(astraStartupPending("world-logic-v1", [structured], true, false, true), true);
  assert.equal(astraStartupPending("world-logic-v1", [null], false, true, false), false);
  assert.equal(astraStartupPending("world-logic-v1", [null], true, false, true), false);
  assert.equal(astraStartupPending("console-basic-v1", [structured], false, true, false), false);
});

test("opening status uses only the service-owned receipt and the exact playable fence", async () => {
  const previousUrl = process.env.SUPABASE_URL;
  const previousKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  try {
    process.env.SUPABASE_URL = "http://synthetic.invalid";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "synthetic-test-key";
    const timeline = { timelineId: "timeline", epoch: 3 };
    const approved = openingStatusFixture({ data: { approvedOpening: true }, error: null });
    assert.equal(await approved.read("campaign", timeline), true);
    assert.deepEqual(approved.calls, [{ name: "rpg_bootstrap", args: {
      p_owner_id: "owner", p_campaign_id: "campaign",
      p_action: "astra_first_status", p_payload: { timeline },
    } }]);
    const unapproved = openingStatusFixture({ data: { approvedOpening: false }, error: null });
    assert.equal(await unapproved.read("campaign", timeline), false);
    const stale = openingStatusFixture({ data: null, error: { message: "rpg_conflict" } });
    await assert.rejects(stale.read("campaign", timeline), { code: "conflict" });
    const malformed = openingStatusFixture({ data: {}, error: null });
    await assert.rejects(malformed.read("campaign", timeline), { code: "unavailable" });
  } finally {
    if (previousUrl === undefined) delete process.env.SUPABASE_URL;
    else process.env.SUPABASE_URL = previousUrl;
    if (previousKey === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    else process.env.SUPABASE_SERVICE_ROLE_KEY = previousKey;
  }
});

test("an unstarted campaign rejects a new Game turn with a truthful, recoverable error", () => {
  const result = safeGameplayError(new AstraStartupPendingError());
  assert.equal(result.status, 409);
  assert.deepEqual(result.body, { error: {
    code: "startup_pending", message: "startup_pending",
  } });
  assert.match(gameplayErrorMessage(new GameplayClientError("startup_pending")),
    /opening.*first action/i);
});

test("new Game input is stopped before context/provider; active Astra or pinned legacy operations keep routing", async () => {
  const previousFlag = process.env.RPG_ASTRA_PRIMARY_P1;
  const previousKey = process.env.OPENAI_API_KEY;
  try {
    process.env.OPENAI_API_KEY = "synthetic-test-key";
    process.env.RPG_ASTRA_PRIMARY_P1 = "1";
    const pending = serviceFixture();
    await assert.rejects(pending.service.submitTurn("campaign", pending.input),
      { code: "startup_pending" });
    assert.deepEqual(pending.calls, { production: 0, preflight: 0, astra: 0, legacy: 0,
      sheets: 1, openingReads: 1 });

    const editedLocation = serviceFixture({ manualLocation: true });
    await assert.rejects(editedLocation.service.submitTurn("campaign", editedLocation.input),
      { code: "startup_pending" });
    assert.equal(editedLocation.calls.production, 0);
    assert.equal(editedLocation.calls.legacy, 0);
    assert.equal(editedLocation.calls.openingReads, 1);

    for (const mode of ["mechanic", "companion"]) {
      const bypass = serviceFixture();
      await assert.rejects(bypass.service.submitTurn("campaign",
        { ...bypass.input, mode }), { code: "startup_pending" });
      assert.equal(bypass.calls.production, 0);
      assert.equal(bypass.calls.preflight, 0);
      assert.equal(bypass.calls.legacy, 0);
    }

    process.env.RPG_ASTRA_PRIMARY_P1 = "0";
    const flagOff = serviceFixture({ takeover: true });
    await assert.rejects(flagOff.service.submitTurn("campaign", flagOff.input),
      { code: "startup_pending" });
    assert.equal(flagOff.calls.production, 0);
    assert.equal(flagOff.calls.legacy, 0);

    process.env.RPG_ASTRA_PRIMARY_P1 = "1";
    const ready = serviceFixture({ takeover: true });
    assert.equal(await ready.service.submitTurn("campaign", ready.input), "astra");
    assert.equal(ready.calls.astra, 1);
    assert.equal(ready.calls.legacy, 0);

    const historical = serviceFixture({ sheet: null });
    assert.equal(await historical.service.submitTurn("campaign", historical.input), "legacy");
    const restoredPreTakeover = serviceFixture({ opening: true });
    assert.equal(await restoredPreTakeover.service.submitTurn("campaign", restoredPreTakeover.input),
      "legacy");
    assert.equal(restoredPreTakeover.calls.astra, 0);
    assert.equal(restoredPreTakeover.calls.openingReads, 1);
    const laterLegacyNote = serviceFixture({ opening: true, currentSceneRole: "note" });
    assert.equal(await laterLegacyNote.service.submitTurn("campaign", laterLegacyNote.input),
      "legacy");
    const pinnedLegacy = serviceFixture({ pinned: "legacy-v1" });
    assert.equal(await pinnedLegacy.service.submitTurn("campaign", pinnedLegacy.input), "legacy");
    assert.equal(pinnedLegacy.calls.sheets, 0);
    const restoredNullRuntime = serviceFixture({ existing: true });
    assert.equal(await restoredNullRuntime.service.submitTurn("campaign", restoredNullRuntime.input),
      "legacy");
    assert.equal(restoredNullRuntime.calls.openingReads, 0);
    const postTakeoverNullRuntime = serviceFixture({ existing: true, takeover: true });
    assert.equal(await postTakeoverNullRuntime.service.submitTurn("campaign",
      postTakeoverNullRuntime.input), "legacy");
    assert.equal(postTakeoverNullRuntime.calls.astra, 0);

    const feedback = serviceFixture();
    assert.equal(await feedback.service.submitTurn("campaign",
      { ...feedback.input, mode: "feedback" }), "legacy");
    assert.equal(feedback.calls.openingReads, 0);
  } finally {
    if (previousFlag === undefined) delete process.env.RPG_ASTRA_PRIMARY_P1;
    else process.env.RPG_ASTRA_PRIMARY_P1 = previousFlag;
    if (previousKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = previousKey;
  }
});

test("public Game readiness is shown for modern sheets only, including when the local Astra flag is off", async () => {
  const previousFlag = process.env.RPG_ASTRA_PRIMARY_P1;
  try {
    process.env.RPG_ASTRA_PRIMARY_P1 = "1";
    assert.equal((await serviceFixture().service.readPlay("campaign")).startupPending, true);
    assert.equal((await serviceFixture({ takeover: true }).service.readPlay("campaign")).startupPending,
      undefined);
    assert.equal((await serviceFixture({ sheet: null }).service.readPlay("campaign")).startupPending,
      undefined);
    assert.equal((await serviceFixture({ opening: true }).service.readPlay("campaign")).startupPending,
      undefined);
    assert.equal((await serviceFixture({ manualLocation: true }).service.readPlay("campaign")).startupPending,
      true);
    process.env.RPG_ASTRA_PRIMARY_P1 = "0";
    assert.equal((await serviceFixture({ takeover: true }).service.readPlay("campaign")).startupPending,
      true);
  } finally {
    if (previousFlag === undefined) delete process.env.RPG_ASTRA_PRIMARY_P1;
    else process.env.RPG_ASTRA_PRIMARY_P1 = previousFlag;
  }
});

test("the server admission check precedes provider and context work without changing legacy resume", () => {
  const source = readFileSync(new URL("../src/lib/server/gameplay-service.ts", import.meta.url), "utf8");
  const submit = source.slice(source.indexOf("export async function submitTurn"),
    source.indexOf("export async function continueTurn"));
  assert.match(submit, /const newOrdinary = !existing &&[\s\S]*input\.mode === "game"[\s\S]*input\.mode === "mechanic"[\s\S]*input\.mode === "companion"/);
  assert.match(submit, /const runtime = existing && pinned === null \? "legacy-v1" : pinned/);
  assert.match(submit, /await campaignStartupPending\(client, campaignId, requireTimeline\(input\),[\s\S]*rulesetId, worldTakeover, optIn\)/);
  assert.match(source, /async function campaignStartupPending[\s\S]*await reviewedPlayerSheets\(client, campaignId\)/);
  assert.match(source, /await readAstraFirstOpeningStatus\(campaignId, timeline\)/);
  assert.doesNotMatch(source, /current_location_id/);
  assert.ok(submit.indexOf("throw new AstraStartupPendingError()") < submit.indexOf("productionServices("));
  assert.ok(submit.indexOf("throw new AstraStartupPendingError()") < submit.indexOf("preflightMemory("));
  assert.ok(submit.indexOf("throw new AstraStartupPendingError()") < submit.indexOf("runTurn("));
  assert.match(source, /export async function continueTurn[\s\S]*resumeAstraTurn[\s\S]*resumeTurn/);
});
