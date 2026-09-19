// Disposable local Phase 3.5 acceptance. Appends only synthetic fixtures.
// No provider method or live model endpoint is invoked by this script.
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";
import {
  acceptanceEnvironment,
  httpSession,
  credentials,
  authenticatedNonowner,
  createGameplayFixtures,
  pathFor,
} from "./gameplay-acceptance-helpers.mjs";
import { testClient } from "./persistence-fixtures.mjs";
import { createRpcMemoryStore } from "../src/lib/memory/store.ts";
import { processMemoryJobs } from "../src/lib/memory/jobs.ts";

const { config, base } = acceptanceEnvironment();
const owner = httpSession(base);
const marker = "SYNTHETIC_PRIVATE_PHASE35_CANARY";
const checks = [];
const pass = (name) => {
  checks.push(name);
  console.log(`PASS: ${name}`);
};
let publicResponses = 0;
const request = async (path, body, expected = 200, session = owner) => {
  const result = await session.request(path, body, expected);
  assert.ok(
    !JSON.stringify(result).includes(marker),
    "Private canary absent from ordinary responses",
  );
  publicResponses++;
  return result;
};
await request("/api/auth/sign-in", credentials("OWNER"));
const service = createClient(
  config.url,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);
const serviceRpc = async (
  cid,
  action,
  payload = {},
  name = "rpg_runtime",
  timeline,
) => {
  const result = await service.rpc(name, {
    p_owner_id: process.env.RPG_OWNER_USER_ID,
    p_campaign_id: cid,
    p_action: action,
    p_payload: payload,
    ...(timeline ? { p_timeline: timeline } : {}),
  });
  assert.ok(
    !result.error,
    `Synthetic ${name}/${action} failed (${result.error?.code ?? ""})`,
  );
  return result.data;
};
// Fresh-fixture convenience only. Stale/duplicate checks below always retain their original envelopes.
const fixtureApi = {
  request: async (path, body, ...rest) => {
    if (body?.campaignId && !body.timeline) {
      const snapshot = await request(pathFor(body.campaignId));
      body = { ...body, timeline: snapshot.timeline };
      if (
        path === "/api/mutations" &&
        !["campaign.save", "feedback.send", "asset.save"].includes(
          body.operation,
        )
      )
        body.correctionScope =
          body.operation.startsWith("document.") &&
          body.payload.id !== snapshot.dmGuideDocumentId
            ? "campaign"
            : "timeline";
    }
    return request(path, body, ...rest);
  },
};
const fixtures = await createGameplayFixtures(fixtureApi);
for (const [i, f] of fixtures.entries()) {
  const snapshot = await request(pathFor(f.campaignId));
  await fixtureApi.request("/api/mutations", {
    requestId: randomUUID(),
    campaignId: f.campaignId,
    expectedRevision: snapshot.campaign.revision,
    operation: "campaign.save",
    payload: {
      title: `Synthetic Phase 3.5 · ${i ? "Silver Current" : "Amber Observatory"}`,
      subtitle: "Invented save/timeline acceptance; no real campaign data",
    },
  });
}
const [a, b] = fixtures,
  cid = a.campaignId,
  root = pathFor(cid);
const read = () => request(root);
const play = () => request(`${root}/play`);
const catalog = () => request(`${root}/saves`);
const saveBody = async (fields) => {
  const s = await catalog();
  return {
    requestId: randomUUID(),
    campaignId: cid,
    timeline: s.timeline,
    expectedRevision: s.runtimeRevision,
    expectedSavesRevision: s.revision,
    ...fields,
  };
};
const saveCommand = async (action, fields) =>
  request(`${root}/saves/${action}`, await saveBody(fields));
const mutate = async (
  operation,
  payload,
  expectedRevision = 0,
  scope = "timeline",
  timeline,
) => {
  const current = timeline ?? (await read()).timeline;
  return request("/api/mutations", {
    requestId: randomUUID(),
    campaignId: cid,
    timeline: current,
    correctionScope: scope,
    operation,
    payload,
    expectedRevision,
  });
};
const mechanic = async (choice) => {
  const p = await play();
  const result = await request(`${root}/turns`, {
    operationId: randomUUID(),
    campaignId: cid,
    timeline: p.timeline,
    expectedRevision: p.revision,
    mode: "mechanic",
    input: "Synthetic deterministic mechanical acceptance",
    companionId: null,
    listenerIds: [],
    mechanic: choice,
  });
  assert.equal(
    result.status,
    choice.kind === "forage" ? "awaiting_confirmation" : "committed",
    `Synthetic ${choice.kind} completes through authoritative code`,
  );
  return result;
};
const core = (s) =>
  Object.fromEntries(
    [
      "entities",
      "storages",
      "items",
      "sessions",
      "scenes",
      "publicState",
      "quests",
      "locations",
      "settings",
    ].map((key) => [key, s[key]]),
  );
const initialB = await request(pathFor(b.campaignId));
const initial = await read(),
  initialPlay = await play();
pass("real owner Auth and two unrelated synthetic campaigns");

const manualInput = await saveBody({
  kind: "manual",
  name: "Before the synthetic fork",
});
const manual = await request(`${root}/saves/create`, manualInput);
const duplicateManual = await request(`${root}/saves/create`, manualInput);
assert.equal(duplicateManual.saveId, manual.saveId);
assert.equal(
  duplicateManual.snapshot.saves.length,
  manual.snapshot.saves.length,
);
const quick1 = await saveCommand("create", {
  kind: "quick",
  name: "Quick Save",
});
const quick2 = await saveCommand("create", {
  kind: "quick",
  name: "Quick Save",
});
assert.notEqual(quick1.saveId, quick2.saveId);
assert.equal(
  quick2.snapshot.timelines.find((t) => t.active).quickSaveId,
  quick2.saveId,
);
pass("manual/quick creation, pointer replacement and duplicate receipt");

const pending = await mechanic({
  kind: "forage",
  actorId: a.actorId,
  outputStorageId: a.packId,
});
assert.equal(pending.status, "awaiting_confirmation");
const pendingSave = await saveCommand("create", {
  kind: "manual",
  name: "Recorded pending dice",
});
const resultBefore = pending.checks;
const continueInput = {
  commandId: randomUUID(),
  campaignId: cid,
  operationId: pending.id,
  action: "continue",
  checkId: null,
  timeline: (await play()).timeline,
};
assert.equal(
  (await request(`${root}/turns/${pending.id}/resume`, continueInput)).status,
  "committed",
);
for (let index = 0; index < 2; index++)
  await mechanic({
    kind: "item.consume",
    actorId: a.actorId,
    itemId: a.items.healing,
    quantity: 1,
  });
await mechanic({
  kind: "resource.spend",
  entityId: a.actorId,
  resource: "focus",
  amount: 1,
});
await mechanic({
  kind: "quest.transition",
  questId: a.questId,
  status: "complete",
});
await mechanic({ kind: "location.move", locationId: a.destinationId });

// Seed one explicitly synthetic private/public event through the existing service-only durable lifecycle.
let p = await play();
const eventInput = {
  operationId: randomUUID(),
  campaignId: cid,
  expectedRevision: p.revision,
  mode: "game",
  input: "Synthetic witness event; no model call",
  companionId: null,
  listenerIds: [],
  mechanic: null,
};
await serviceRpc(cid, "begin", eventInput, "rpg_runtime", p.timeline);
const claim = await serviceRpc(
  cid,
  "claim",
  { operationId: eventInput.operationId },
  "rpg_runtime",
  p.timeline,
);
await serviceRpc(
  cid,
  "commit",
  {
    ...claim.lease,
    packet: {
      narration:
        "SYNTHETIC_AMBER_FUTURE: Mira and the companion learned the bell code ORCHID-92.",
      visualDescription: "",
      resolution: {
        changes: [],
        worldMinutes: claim.source.runtime.worldMinutes,
        configuration: claim.source.runtime.configuration,
        outcomes: [],
      },
      privatePatches: [
        {
          kind: "fact",
          key: "phase35synthetic",
          operation: "set",
          value: marker,
          amount: null,
        },
      ],
      checks: [],
      guidanceProposal: null,
    },
  },
  "rpg_runtime",
  p.timeline,
);
const memory = createRpcMemoryStore(
  process.env.RPG_OWNER_USER_ID,
  (args) => service.rpc("rpg_memory", args),
  p.timeline,
);
await memory.enqueue(cid, "pressure");
for (let i = 0; i < 16; i++) {
  const result = await processMemoryJobs(
    cid,
    memory,
    {
      summarize: async (job) => ({
        output: {
          schemaVersion: 1,
          selections: job.sources.map((s) => ({
            sourceId: s.id,
            version: s.ref.version,
          })),
        },
        usage: {},
      }),
    },
    4,
    p.timeline,
  );
  assert.equal(result.failed, false);
  if (result.processed === 0) break;
}
const future = await read(),
  futurePlay = await play();
assert.equal(future.items.find((i) => i.id === a.items.healing).quantity, 0);
assert.equal(
  future.entities.find((e) => e.id === a.actorId).resources.focus,
  2,
);
assert.equal(future.quests.find((q) => q.id === a.questId).status, "complete");
assert.equal(future.publicState.current_location_id, a.destinationId);
assert.ok(futurePlay.worldMinutes > initialPlay.worldMinutes);
assert.ok(JSON.stringify(await memory.source(cid, "game")).includes(marker));
const futureHead = await saveCommand("create", {
  kind: "manual",
  name: "Preserved future A",
});
const oldTimeline = futureHead.timelineId;
const staleItem = {
  requestId: randomUUID(),
  campaignId: cid,
  timeline: future.timeline,
  correctionScope: "timeline",
  operation: "quest.save",
  expectedRevision: future.quests.find((q) => q.id === a.questId).revision,
  payload: {
    id: a.questId,
    title: "Stale tab draft",
    description: "Must not write",
    status: "open",
  },
};
const loadInput = await saveBody({
  saveId: manual.saveId,
  label: "Alternate synthetic path",
  recovery: false,
});
const loaded = await request(`${root}/saves/load`, loadInput);
assert.notEqual(loaded.timelineId, oldTimeline);
assert.ok(loaded.safetySaveId);
assert.ok(
  loaded.snapshot.saves.some(
    (s) => s.id === loaded.safetySaveId && s.kind === "safety",
  ),
);
assert.deepEqual(core(await read()), core(initial));
assert.equal((await play()).worldMinutes, initialPlay.worldMinutes);
assert.ok((await play()).revision > futurePlay.revision);
const loadedMemory = createRpcMemoryStore(
  process.env.RPG_OWNER_USER_ID,
  (args) => service.rpc("rpg_memory", args),
  loaded.snapshot.timeline,
);
const restoredSource = await loadedMemory.source(cid, "game");
assert.ok(!JSON.stringify(restoredSource).includes(marker));
assert.ok(!JSON.stringify(restoredSource).includes("SYNTHETIC_AMBER_FUTURE"));
const search = await loadedMemory.search({
  campaignId: cid,
  timeline: loaded.snapshot.timeline,
  visibility: "public",
  actorIds: [a.companionId],
  query: "ORCHID-92 bell code",
  entityIds: [],
  requiredSourceIds: [],
  worldMinutes: 0,
  maxBytes: 12000,
  maxExcerpts: 12,
  historicalComparison: false,
});
assert.ok(!JSON.stringify(search).includes("ORCHID-92"));
await request("/api/mutations", staleItem, 409);
const dupLoad = await request(`${root}/saves/load`, loadInput);
assert.equal(dupLoad.timelineId, loaded.timelineId);
assert.equal(dupLoad.safetySaveId, loaded.safetySaveId);
assert.equal(
  dupLoad.snapshot.timelines.length,
  loaded.snapshot.timelines.length,
);
pass(
  "atomic safety/fork restores exact records and excludes abandoned public/private/NPC/summary future",
);
pass("duplicate load and stale two-tab write do not mutate the new timeline");

const quest = (await read()).quests.find((q) => q.id === a.questId);
await mutate(
  "quest.save",
  {
    id: quest.id,
    title: quest.title,
    description: "B-only branch correction",
    status: "open",
  },
  quest.revision,
);
const branchB = await read();
await saveCommand("switch", { timelineId: oldTimeline, recovery: false });
assert.deepEqual(core(await read()), core(future));
assert.equal((await play()).worldMinutes, futurePlay.worldMinutes);
await saveCommand("switch", { timelineId: loaded.timelineId, recovery: false });
assert.deepEqual(core(await read()), core(branchB));
pass(
  "switching returns exact previous heads and preserves branch-only corrections",
);

const pendingBranch = await saveCommand("load", {
  saveId: pendingSave.saveId,
  label: "Pending check restored",
  recovery: false,
});
const sameCheck = await request(`${root}/turns/${pending.id}`);
assert.equal(sameCheck.status, "awaiting_confirmation");
assert.deepEqual(sameCheck.checks, resultBefore);
const retry = {
  commandId: randomUUID(),
  campaignId: cid,
  operationId: pending.id,
  action: "retry",
  checkId: null,
  timeline: pendingBranch.snapshot.timeline,
};
assert.deepEqual(
  (await request(`${root}/turns/${pending.id}/resume`, retry)).checks,
  resultBefore,
);
await request(`${root}/turns/${pending.id}/resume`, {
  ...retry,
  commandId: randomUUID(),
  action: "continue",
});
const anotherRoll = await mechanic({
  kind: "forage",
  actorId: a.actorId,
  outputStorageId: a.packId,
});
assert.notEqual(anotherRoll.id, pending.id);
assert.notEqual(anotherRoll.checks[0].id, resultBefore[0].id);
await request(`${root}/turns/${anotherRoll.id}/resume`, {
  commandId: randomUUID(),
  campaignId: cid,
  operationId: anotherRoll.id,
  action: "continue",
  checkId: null,
  timeline: (await play()).timeline,
});
pass(
  "pending dice restored/retried unchanged; new future action has a new roll identity",
);

const settingsPoint = await saveCommand("create", {
  kind: "manual",
  name: "Before settings and guide changes",
});
const settingsBefore = await read();
const oldGuide = settingsBefore.documents.find(
  (d) => d.id === settingsBefore.dmGuideDocumentId,
);
await mutate(
  "document.save",
  {
    id: oldGuide.id,
    title: oldGuide.title,
    status: oldGuide.status,
    body: "Synthetic future guide only.",
  },
  oldGuide.revision,
);
await mutate(
  "settings.save",
  { ...settingsBefore.settings.values, language: "ru" },
  settingsBefore.settings.revision,
);
const changedSettings = await read();
const changedGuide = changedSettings.documents.find(
  (d) => d.id === oldGuide.id,
);
await saveCommand("load", {
  saveId: settingsPoint.saveId,
  label: "Original rules and guidance",
  recovery: false,
});
const restoredSettings = await read();
assert.deepEqual(
  restoredSettings.settings.values,
  settingsBefore.settings.values,
);
assert.equal(
  restoredSettings.documents.find((d) => d.id === oldGuide.id).body,
  oldGuide.body,
);
const newGuide = await mutate(
  "document.save",
  {
    id: oldGuide.id,
    title: oldGuide.title,
    status: oldGuide.status,
    body: "Synthetic new branch guidance.",
  },
  oldGuide.revision,
);
assert.ok(newGuide.revision > changedGuide.revision);
const guideVersions = await request(
  `${root}/documents/${oldGuide.id}/versions`,
);
assert.ok(
  JSON.stringify(guideVersions).includes("Synthetic future guide only."),
);
assert.ok(
  JSON.stringify(guideVersions).includes("Synthetic new branch guidance."),
);
const newSettings = await mutate(
  "settings.save",
  restoredSettings.settings.values,
  restoredSettings.settings.revision,
);
assert.ok(newSettings.revision > changedSettings.settings.revision);
pass(
  "effective settings/guide restore while new immutable versions stay above sibling version numbers",
);

const canon = (await read()).documents.find(
  (d) => d.id !== oldGuide.id && d.status === "canon",
);
await mutate(
  "document.save",
  {
    id: canon.id,
    title: canon.title,
    status: "canon",
    body: "Synthetic global correction: the lighthouse is violet in every timeline.",
  },
  canon.revision,
  "campaign",
);
await saveCommand("load", {
  saveId: manual.saveId,
  label: "Old state with corrected global canon",
  recovery: false,
});
assert.match(
  (await read()).documents.find((d) => d.id === canon.id).body,
  /lighthouse is violet/,
);
await saveCommand("switch", { timelineId: oldTimeline, recovery: false });
assert.match(
  (await read()).documents.find((d) => d.id === canon.id).body,
  /lighthouse is violet/,
);
pass(
  "campaign-wide canon remains corrected across older forks and preserved heads",
);

const activeBeforeRelogin = (await catalog()).timeline;
await request("/api/auth/sign-out", {});
await request(root, undefined, 401);
await request("/api/auth/sign-in", credentials("OWNER"));
assert.deepEqual((await catalog()).timeline, activeBeforeRelogin);
assert.deepEqual(await request(pathFor(b.campaignId)), initialB);
pass(
  "logout/relogin/refresh preserve active timeline and leave unrelated campaign unchanged",
);

const anonymous = httpSession(base),
  nonowner = await authenticatedNonowner(config, base);
for (const session of [anonymous, nonowner]) {
  const denied = session === anonymous ? 401 : 403;
  await request(`${root}/saves`, undefined, denied, session);
  await request(`${root}/saves/load`, loadInput, denied, session);
}
const publicClient = testClient(config);
assert.ok(
  (
    await publicClient.rpc("rpg_saves", {
      p_owner_id: process.env.RPG_OWNER_USER_ID,
      p_campaign_id: cid,
      p_action: "read",
      p_payload: {},
    })
  ).error,
);
assert.ok(
  (
    await publicClient
      .schema("rpg_private")
      .from("timeline_snapshots")
      .select("*")
  ).error,
);
const ownerClient = testClient(config);
assert.equal(
  (await ownerClient.auth.signInWithPassword(credentials("OWNER"))).error,
  null,
);
assert.ok(
  (
    await ownerClient.rpc("rpg_saves", {
      p_owner_id: process.env.RPG_OWNER_USER_ID,
      p_campaign_id: cid,
      p_action: "read",
      p_payload: {},
    })
  ).error,
);
await request(
  `${root}/saves/create`,
  { ...(await saveBody({ kind: "manual", name: "Wrong origin" })) },
  403,
  {
    request: (path, body, status) =>
      owner.request(path, body, status, "https://unrelated.invalid"),
  },
);
pass(
  "anonymous/non-owner/direct owner RPC/private schema access and foreign-origin writes denied",
);

// Read every ordinary API and rendered screen; no private snapshot canary may serialize.
for (const suffix of ["", "/play", "/memory", "/saves"]) {
  await request(`${root}${suffix}`);
}
const cookie = [...owner.jar].map(([k, v]) => `${k}=${v}`).join("; ");
let htmlCount = 0;
for (const screen of [
  "game",
  "saves",
  "sessions",
  "library",
  "dm-chat",
  "settings",
]) {
  const response = await fetch(`${base}/campaigns/${cid}/${screen}`, {
    headers: { cookie },
  });
  assert.equal(response.status, 200);
  assert.ok(!(await response.text()).includes(marker));
  htmlCount++;
}
let bundleCount = 0;
async function inspectBundles(folder) {
  for (const entry of await readdir(folder, { withFileTypes: true })) {
    const path = join(folder, entry.name);
    if (entry.isDirectory()) await inspectBundles(path);
    else if (entry.name.endsWith(".js")) {
      const text = await readFile(path, "utf8");
      assert.ok(!text.includes(marker));
      assert.ok(!text.includes("SUPABASE_SERVICE_ROLE_KEY"));
      bundleCount++;
    }
  }
}
await inspectBundles(".next/static");
pass(
  "ordinary owner APIs/HTML/client bundles contain no private canary or service credential name",
);
await mkdir("test-results", { recursive: true });
const report = {
  at: new Date().toISOString(),
  base,
  fixtures,
  checks,
  publicResponses,
  htmlCount,
  bundleCount,
  providerCalls: 0,
  activeTimeline: (await catalog()).timeline,
  manualSaveId: manual.saveId,
  pendingSaveId: pendingSave.saveId,
  limitations: [
    "Physical iPhone/Safari unverified",
    "Finite synthetic branch coverage is not a proof of universal correctness",
  ],
};
await writeFile(
  "test-results/phase35-app-acceptance.json",
  JSON.stringify(report, null, 2),
);
console.log(
  JSON.stringify({
    passed: checks.length,
    publicResponses,
    htmlCount,
    bundleCount,
    providerCalls: 0,
  }),
);
