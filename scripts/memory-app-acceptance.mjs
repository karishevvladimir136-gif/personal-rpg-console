// Real local Auth/Postgres/application integration. Synthetic records only.
// prepare injects one failed supporting job explicitly; it makes no model calls.
import assert from "node:assert/strict";
import { readFile, writeFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";
import {
  acceptanceEnvironment,
  httpSession,
  credentials,
  authenticatedNonowner,
  createGameplayFixtures,
  mutation,
  pathFor,
} from "./gameplay-acceptance-helpers.mjs";
import { testClient } from "./persistence-fixtures.mjs";
import { createRpcMemoryStore } from "../src/lib/memory/store.ts";

const { config, base } = acceptanceEnvironment();
const owner = httpSession(base);
await owner.request("/api/auth/sign-in", credentials("OWNER"));
assert.ok(
  process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.RPG_OWNER_USER_ID,
);
const client = createClient(config.url, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});
const rpc = async (cid, action, payload = {}, name = "rpg_memory") => {
  const r = await client.rpc(name, {
    p_owner_id: process.env.RPG_OWNER_USER_ID,
    p_campaign_id: cid,
    p_action: action,
    p_payload: payload,
  });
  assert.ok(!r.error, `Synthetic ${action} RPC failed`);
  return r.data;
};
const memory = createRpcMemoryStore(process.env.RPG_OWNER_USER_ID, (a) =>
  client.rpc("rpg_memory", a),
);
const reportPath = "test-results/phase3-app-acceptance.json";
const marker = "SYNTHETIC_PRIVATE_PHASE3_CANARY";
const command = process.argv[2] ?? "verify";
if (command === "prepare") {
  let exists = false;
  try {
    await readFile(reportPath);
    exists = true;
  } catch (e) {
    if (e.code !== "ENOENT") throw e;
  }
  assert.equal(
    exists,
    false,
    "Reuse existing fixtures; prepare never overwrites a prior record.",
  );
  const fixtures = await createGameplayFixtures(owner);
  const report = {
    at: new Date().toISOString(),
    fixtures,
    providerCallsDuringPreparation: 0,
  };
  await writeFile(reportPath, JSON.stringify(report, null, 2));
  for (const [i, f] of fixtures.entries()) {
    const root = pathFor(f.campaignId);
    let snapshot = await owner.request(root);
    await mutation(
      owner,
      f.campaignId,
      "campaign.save",
      {
        title: `Synthetic Phase 3 · ${i ? "Frost Circuit" : "Lantern Harbor"}`,
        subtitle:
          "Disposable long-term memory acceptance; invented history only.",
      },
      snapshot.campaign.revision,
    );
    await mutation(owner, f.campaignId, "scene.save", {
      session_id: f.sessionId,
      title: "Synthetic old promise",
      role: "narration",
      body: i
        ? "Нера обещала вернуть медный компас после отлива. Обещание ещё не выполнено."
        : "Nera promised to return the brass compass after the tide falls. The promise remains unresolved.",
    });
    const guideBefore = JSON.stringify(
      snapshot.documents.find((d) => d.id === snapshot.dmGuideDocumentId),
    );
    await mutation(owner, f.campaignId, "feedback.send", {
      body: "SYNTHETIC_FEEDBACK_NOT_HISTORY: please keep narration concise.",
    });
    snapshot = await owner.request(root);
    assert.equal(
      JSON.stringify(
        snapshot.documents.find((d) => d.id === snapshot.dmGuideDocumentId),
      ),
      guideBefore,
    );
    const input = {
      operationId: crypto.randomUUID(),
      campaignId: f.campaignId,
      expectedRevision: (await owner.request(`${root}/play`)).revision,
      mode: "game",
      input:
        "Synthetic fixture event: stand quietly; no action, check or world-time change.",
      companionId: null,
      listenerIds: [],
      mechanic: null,
    };
    await rpc(f.campaignId, "begin", input, "rpg_runtime");
    const claim = await rpc(
      f.campaignId,
      "claim",
      { operationId: input.operationId },
      "rpg_runtime",
    );
    await rpc(
      f.campaignId,
      "commit",
      {
        ...claim.lease,
        packet: {
          narration:
            "Synthetic fixture: the companions remain beside the shelter. Nothing has been consumed or moved.",
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
              key: "phase3synthetic",
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
    );
  }
  const [a, b] = fixtures;
  const input = {
    operationId: crypto.randomUUID(),
    campaignId: a.campaignId,
    expectedRevision: (await owner.request(`${pathFor(a.campaignId)}/play`))
      .revision,
    mode: "mechanic",
    input: "Synthetic pending forage check; wait for owner confirmation.",
    companionId: null,
    listenerIds: [],
    mechanic: { kind: "forage", actorId: a.actorId, outputStorageId: a.packId },
  };
  const pending = await owner.request(`${pathFor(a.campaignId)}/turns`, input);
  assert.equal(pending.status, "awaiting_confirmation");
  report.pending = { input, turn: pending };
  report.beforeA = await owner.request(pathFor(a.campaignId));
  report.beforeB = await owner.request(pathFor(b.campaignId));
  const ended = await memory.end({
    requestId: crypto.randomUUID(),
    campaignId: b.campaignId,
    expectedRevision: (await owner.request(`${pathFor(b.campaignId)}/play`))
      .revision,
    sessionId: b.sessionId,
  });
  const job = await memory.claim(b.campaignId);
  assert.equal(job.visibility, "public");
  await memory.fail(job, "provider");
  report.injectedFailureBoundary = ended.currentBoundary.id;
  assert.equal(
    (await owner.request(`${pathFor(b.campaignId)}/memory`)).currentBoundary
      .recap.status,
    "failed",
  );
  await writeFile(reportPath, JSON.stringify(report, null, 2));
  console.log(
    JSON.stringify({
      prepared: fixtures.map((f) => f.campaignId),
      pendingRoll: pending.checks[0].total,
      failedRecapInjected: true,
      modelCalls: 0,
    }),
  );
} else if (command === "correct") {
  const report = JSON.parse(await readFile(reportPath, "utf8"));
  assert.ok(!report.correction, "Correction fixture already recorded.");
  const [a, b] = report.fixtures;
  const beforeA = await owner.request(pathFor(a.campaignId));
  const snapshot = await owner.request(pathFor(b.campaignId));
  const scene = snapshot.scenes.find(
    (s) => s.title === "Synthetic old promise",
  );
  assert.ok(scene);
  await mutation(
    owner,
    b.campaignId,
    "scene.save",
    {
      id: scene.id,
      session_id: scene.session_id,
      title: scene.title,
      role: scene.role,
      body: "Исправление владельца: Нера обещала вернуть красный компас после отлива. Обещание ещё не выполнено; прежнее упоминание медного компаса ошибочно.",
    },
    scene.revision,
  );
  const memoryState = await owner.request(`${pathFor(b.campaignId)}/memory`);
  assert.equal(memoryState.sessions[0].checkpointStatus, "rebuild_required");
  assert.equal(memoryState.sessions[0].recap.text, null);
  const evidence = await memory.search({
    campaignId: b.campaignId,
    visibility: "public",
    actorIds: [],
    query: "компас",
    entityIds: [],
    requiredSourceIds: [],
    worldMinutes: 0,
    maxBytes: 12000,
    maxExcerpts: 12,
    historicalComparison: false,
  });
  const corrected = evidence.sources.filter((s) => s.ref.id === scene.id);
  assert.equal(corrected.length, 1);
  assert.equal(corrected[0].ref.version, String(scene.revision + 1));
  assert.ok(corrected[0].text.includes("красный"));
  assert.deepEqual(await owner.request(pathFor(a.campaignId)), beforeA);
  report.correction = {
    sceneId: scene.id,
    version: scene.revision + 1,
    immediateRevocation: true,
    otherCampaignUnchanged: true,
    providerCalls: 0,
  };
  await writeFile(reportPath, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report.correction));
} else {
  assert.equal(command, "verify");
  const report = JSON.parse(await readFile(reportPath, "utf8"));
  const [a, b] = report.fixtures;
  const nonowner = await authenticatedNonowner(config, base),
    anonymous = httpSession(base);
  for (const session of [nonowner, anonymous]) {
    const code = session === anonymous ? 401 : 403;
    await session.request(`${pathFor(a.campaignId)}/memory`, undefined, code);
    for (const action of ["end", "continue", "retry"])
      await session.request(
        `${pathFor(a.campaignId)}/memory/${action}`,
        {},
        code,
      );
  }
  await owner.request(
    `${pathFor(a.campaignId)}/memory/end`,
    {},
    403,
    "https://unrelated.invalid",
  );
  for (const role of ["ANONYMOUS", "OWNER", "NONOWNER"]) {
    const ordinary = testClient(config);
    if (role !== "ANONYMOUS")
      assert.ok(
        !(await ordinary.auth.signInWithPassword(credentials(role))).error,
      );
    assert.ok(
      (
        await ordinary.rpc("rpg_memory", {
          p_owner_id: process.env.RPG_OWNER_USER_ID,
          p_campaign_id: a.campaignId,
          p_action: "context",
          p_payload: { actorIds: [], includePrivate: true },
        })
      ).error,
    );
    assert.ok(
      (
        await ordinary
          .schema("rpg_private")
          .from("memory_private_sources")
          .select("id")
          .limit(1)
      ).error,
    );
    const publicSummaries = await ordinary
      .from("rpg_memory_summaries")
      .select("*")
      .eq("campaign_id", a.campaignId);
    if (role === "NONOWNER") assert.equal(publicSummaries.data?.length ?? 0, 0);
    assert.ok(!JSON.stringify(publicSummaries).includes(marker));
  }
  const scans = [];
  for (const f of report.fixtures) {
    const root = pathFor(f.campaignId);
    const snapshot = await owner.request(root),
      play = await owner.request(`${root}/play`),
      state = await owner.request(`${root}/memory`);
    assert.ok(snapshot.campaign.title.startsWith("Synthetic Phase 3"));
    scans.push(snapshot, play, state);
    if (f === a) {
      assert.deepEqual(snapshot.entities, report.beforeA.entities);
      assert.deepEqual(snapshot.quests, report.beforeA.quests);
      if (!report.pending.turn.checks[0].success)
        assert.deepEqual(snapshot.items, report.beforeA.items);
      const recall = play.turns.find((t) =>
        t.input.startsWith("What did Nera promise about the brass compass?"),
      );
      if (recall) {
        assert.equal(recall.status, "committed");
        assert.equal(recall.checks.length, 0);
        assert.match(recall.narration, /brass compass/i);
        assert.match(recall.narration, /tide/i);
        report.gameplayRecall = {
          operationId: recall.id,
          publicNarration: recall.narration,
          worldMinutes: play.worldMinutes,
        };
      }
    }
    for (const turn of play.turns)
      scans.push(await owner.request(`${root}/turns/${turn.id}`));
    const evidence = await memory.search({
      campaignId: f.campaignId,
      visibility: "public",
      actorIds: [],
      query: "SYNTHETIC_FEEDBACK_NOT_HISTORY",
      entityIds: [],
      requiredSourceIds: [],
      worldMinutes: play.worldMinutes,
      maxBytes: 12000,
      maxExcerpts: 12,
      historicalComparison: false,
    });
    assert.ok(
      evidence.sources.every(
        (s) => !s.text.includes("SYNTHETIC_FEEDBACK_NOT_HISTORY"),
      ),
    );
    assert.ok(state.sessions.every((s) => s.campaign_id === f.campaignId));
    if (f === b) {
      assert.deepEqual(snapshot.entities, report.beforeB.entities);
      assert.deepEqual(snapshot.items, report.beforeB.items);
      assert.deepEqual(snapshot.quests, report.beforeB.quests);
    }
  }
  const saved = await owner.request(
    `${pathFor(a.campaignId)}/turns/${report.pending.turn.id}`,
  );
  const recorded = (checks) =>
    checks.map((check) =>
      Object.fromEntries(
        Object.entries(check).filter(
          ([key]) => !["canReroll", "interactive"].includes(key),
        ),
      ),
    );
  assert.deepEqual(
    recorded(saved.checks),
    recorded(report.pending.turn.checks),
  );
  await owner.request("/api/auth/sign-out", {});
  await owner.request("/api/auth/sign-in", credentials("OWNER"));
  assert.deepEqual(
    await owner.request(`${pathFor(a.campaignId)}/turns/${saved.id}`),
    saved,
  );
  for (const value of scans) {
    const text = JSON.stringify(value);
    assert.ok(!text.includes(marker));
    assert.ok(
      !/"(?:privateState|privatePatches|privateWatermark|privateHistorical|privateSummary|lease_token|exactState)"\s*:/.test(
        text,
      ),
    );
    for (const name of ["OPENAI_API_KEY", "SUPABASE_SERVICE_ROLE_KEY"])
      assert.ok(!text.includes(process.env[name]));
  }
  async function files(dir) {
    const all = [];
    for (const e of await readdir(dir, { withFileTypes: true })) {
      const path = join(dir, e.name);
      if (e.isDirectory()) all.push(...(await files(path)));
      else if (e.name.endsWith(".js")) all.push(path);
    }
    return all;
  }
  const bundles = await files(".next/static");
  for (const path of bundles) {
    const text = await readFile(path, "utf8");
    assert.ok(!text.includes(marker));
    for (const name of ["OPENAI_API_KEY", "SUPABASE_SERVICE_ROLE_KEY"])
      assert.ok(!text.includes(name) && !text.includes(process.env[name]));
  }
  report.verification = {
    at: new Date().toISOString(),
    responses: scans.length,
    bundles: bundles.length,
    authIsolation: true,
    feedbackExcluded: true,
    recordedDiceAndRelogin: true,
    privateLeaks: 0,
    providerCalls: 0,
  };
  await writeFile(reportPath, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report.verification));
}
