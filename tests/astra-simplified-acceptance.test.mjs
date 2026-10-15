import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { simplifiedFixture, finalDecision, fakeUsage, publicNarration,
  privateCanary } from "./astra-simplified-fixture.mjs";
import { runAstraTurn } from "../src/lib/gameplay/astra-primary.ts";
import { astraPlanProviderInput, astraPlanRequestBytes } from "../src/lib/gameplay/astra-plan-context.ts";
import { astraPlanResponseSchema } from "../src/lib/gameplay/astra-plan-schema.ts";
import { maintainAstraMemoryAfterCommit } from "../src/lib/memory/lifecycle.ts";

const freeForm = [
  "i go to mill and ask miller for job",
  "i insult the mayor's hat",
  "i sit by the road and watch people pass",
  "i follow a stray dog",
  "i ask the guard whether he is happy with his life",
  "i throw my boot at the tavern sign",
  "i tell the merchant i'll work for dinner instead of money",
];
const noNarrator = () => assert.fail("Unified ordinary play must not request a dedicated narrator");
const actions = (choices) => ({ kind: "mechanic_actions", actions: choices, restSafety: null });
const committed = (turn, errors) => assert.equal(turn.result.status, "committed", JSON.stringify(errors));

test("seven free-form inputs commit literal fiction in one Astra response without bespoke mechanics", async (t) => {
  const h = await simplifiedFixture({ publicSceneOnly: true });
  try {
    const before = await h.snapshot();
    for (const [index, text] of freeForm.entries()) await t.test(text, async () => {
      let calls = 0;
      const provider = { next: async (context, input, _receipts, _checks, _caps, source) => {
        calls++;
        assert.equal(JSON.parse(context.input).mandatory.input, text);
        assert.equal(input.input, text);
        assert.equal(source.astraResponseContract, "unified-v1");
        const packet = JSON.parse(context.input).mandatory;
        assert.equal(packet.current.entities.find((row) => row.id === h.hero).hp, 10);
        return finalDecision(source, `Ordinary fictional response ${index + 1}: the scene continues naturally.`);
      }, narrate: noNarrator };
      const turn = await h.turn(text, provider);
      committed(turn, h.errors);
      assert.equal(calls, 1);
      assert.equal(turn.result.failure, null);
      assert.equal(turn.result.narration, `Ordinary fictional response ${index + 1}: the scene continues naturally.`);
      assert.doesNotMatch(JSON.stringify(turn.result), /publicNarration|toolReceipts|privatePatches|SYNTHETIC_UNREVEALED/);
      assert.equal((await runAstraTurn(turn.input, turn.deps)).status, "committed");
      assert.equal(calls, 1, "Exact replay returns the committed receipt without another provider request");
    });
    const after = await h.snapshot();
    assert.deepEqual(after.state, before.state);
    assert.deepEqual(after.items, before.items);
    assert.equal(after.rests, before.rests);
    assert.equal(after.events - before.events, freeForm.length);
    assert.equal(after.turns - before.turns, freeForm.length);
    assert.equal(h.summaryCalls(), 0);
    assert.equal(h.memoryCalls.includes("claim"), false);
  } finally { await h.f.db.close(); }
});

test("unified fiction survives rejected optional effect while dependent false consequence and visual are removed", async () => {
  const h = await simplifiedFixture({ publicSceneOnly: true });
  try {
    const before = await h.snapshot();
    const result = await h.turn("I ask about work, steady myself, and imagine a magical reward.", {
      next: async (_context, _input, _receipts, _checks, _caps, source) => finalDecision(source, "", {
        effects: [actions([{ kind: "resource.spend", entityId: h.hero, resource: "focus", amount: 1 }]),
          { kind: "unsupported_optional", description: "An imagined magical reward has no authority." }],
        publicNarration: { beats: [
          { text: "Nera considers the request and asks what sort of work you can do.", requiresEffects: [] },
          { text: "You spend one Focus to steady yourself.", requiresEffects: [0] },
          { text: "A magical crown appears and makes you invulnerable.", requiresEffects: [1] },
        ], visualDescription: { text: "A magical crown surrounds the hero.", requiresEffects: [1] } },
      }), narrate: noNarrator,
    });
    committed(result, h.errors);
    assert.match(result.result.narration, /Nera considers/);
    assert.match(result.result.narration, /one Focus/);
    assert.doesNotMatch(result.result.narration, /crown|invulnerable/);
    assert.equal(result.result.visualDescription, "");
    const after = await h.snapshot();
    assert.equal(after.state.resources.focus, before.state.resources.focus - 1);
    assert.deepEqual(after.items, before.items);
    assert.equal(after.state.hp, before.state.hp);
    const plan = (await h.f.one("select astra_ordered_effects plan from rpg_private.turns where id=$1", [result.input.operationId])).plan;
    assert.deepEqual(plan.indices, [0]);
    assert.deepEqual(plan.rejected, [{ index: 1, reason: "not_authorized" }]);
    assert.equal((await runAstraTurn(result.input, result.deps)).status, "committed");
    assert.deepEqual(await h.snapshot(), after);
  } finally { await h.f.db.close(); }
});

test("unified compatible fiction cannot authorize foreign campaign effects or raw HP/money writes", async (t) => {
  const h = await simplifiedFixture({ secondCampaign: true, publicSceneOnly: true });
  try {
    const foreignActor = (await h.f.mutation("entity.save", h.foreignCampaignId, {
      kind: "player", name: "Foreign hero", details: "Other campaign only", hp: 8, max_hp: 8,
      stats: {}, resources: { focus: 3 }, conditions: [], equipment_slots: [],
    })).id;
    for (const [name, extra] of [
      ["foreign effect", { effects: [actions([{ kind: "resource.spend", entityId: foreignActor, resource: "focus", amount: 1 }])] }],
      ["unsupported raw HP increase", { changes: (source) => [{ family: "entities", id: h.hero,
        expectedRevision: source.snapshot.entities.find((row) => row.id === h.hero).revision,
        values: { hp: 999 } }] }],
      ["unsupported raw resource mint", { changes: (source) => [{ family: "entities", id: h.hero,
        expectedRevision: source.snapshot.entities.find((row) => row.id === h.hero).revision,
        values: { resources: { focus: 999, silver: 1000000 } } }] }],
    ]) await t.test(name, async () => {
      const before = await h.snapshot();
      const turn = await h.turn("I make an ordinary request.", {
        next: async (_ctx, _input, _receipts, _checks, _caps, source) => finalDecision(source,
          "The conversation continues.", { ...extra,
            ...(extra.changes ? { changes: extra.changes(source) } : {}) }),
        narrate: noNarrator,
      });
      assert.equal(turn.result.status, "failed");
      assert.equal(turn.result.failure, "validation");
      assert.deepEqual(await h.snapshot(), before);
      assert.equal((await h.f.one("select input#>>'{input}' literal from rpg_private.turns where id=$1", [turn.input.operationId])).literal,
        "I make an ordinary request.");
      assert.equal((await h.f.one("select resources->>'focus' focus from public.rpg_entities where id=$1", [foreignActor])).focus, "3");
    });
  } finally { await h.f.db.close(); }
});

test("a real optional rest validation failure preserves lodging dialogue without false recovery", async () => {
  const h = await simplifiedFixture({ publicSceneOnly: true });
  try {
    await h.f.one("update public.rpg_items set quantity=0 where id=$1", [h.supplies]);
    await h.f.one("update public.rpg_entities set hp=4 where id=$1", [h.hero]);
    const before = await h.snapshot();
    const turn = await h.turn("May I sleep here tonight? I could help in the morning.", {
      next: async (_context, _input, _receipts, _checks, _caps, source) => finalDecision(source, "", {
        effects: [{ kind: "formal_rest", restKind: "long",
          restSafety: { locationId: source.snapshot.publicState.current_location_id, suitable: true } }],
        publicNarration: { beats: [
          { text: "Nera allows you to sleep nearby and considers your offer to help tomorrow.", requiresEffects: [] },
          { text: "Morning arrives and the completed rest restores your health.", requiresEffects: [0] },
        ], visualDescription: { text: "Morning after a completed rest.", requiresEffects: [0] } },
      }), narrate: noNarrator,
    });
    committed(turn, h.errors);
    assert.match(turn.result.narration, /allows you to sleep/);
    assert.doesNotMatch(turn.result.narration, /Morning arrives|restores your health/);
    assert.equal(turn.result.visualDescription, "");
    const after = await h.snapshot();
    assert.deepEqual(after.state, before.state);
    assert.deepEqual(after.items, before.items);
    assert.equal(after.rests, before.rests);
    assert.equal(after.events - before.events, 1);
    const effects = (await h.f.one("select astra_ordered_effects plan from rpg_private.turns where id=$1", [turn.input.operationId])).plan;
    assert.deepEqual(effects.indices, []);
    assert.deepEqual(effects.rejected, [{ index: 0, reason: "not_authorized" }]);
  } finally { await h.f.db.close(); }
});

test("model-authored outcomes cannot smuggle a rejected durable consequence into public Memory", async () => {
  const h = await simplifiedFixture({ publicSceneOnly: true });
  try {
    const before = await h.snapshot();
    const falseReward = "UNAUTHORIZED_REWARD_MEMORY_CANARY: you receive one thousand silver.";
    const turn = await h.turn("I ask Nera about ordinary work.", {
      next: async (_ctx, _input, _receipts, _checks, _caps, source) => finalDecision(source, "", {
        outcomes: [{ kind: "currency.grant", entityIds: [h.hero], itemIds: [], text: falseReward }],
        effects: [{ kind: "unsupported_optional", description: "No authority supports an imagined reward." }],
        publicNarration: { beats: [
          { text: "Nera asks what sort of ordinary work you can do.", requiresEffects: [] },
          { text: "You receive one thousand silver.", requiresEffects: [0] },
        ], visualDescription: { text: "", requiresEffects: [] } },
      }), narrate: noNarrator,
    });
    assert.equal(turn.result.status, "failed");
    assert.equal(turn.result.failure, "validation");
    assert.equal(turn.result.narration, null);
    assert.deepEqual(await h.snapshot(), before);
    assert.equal((await h.f.one(`select count(*)::integer n from rpg_private.memory_public_sources
      where campaign_id=$1 and text like '%UNAUTHORIZED_REWARD_MEMORY_CANARY%'`, [h.f.cid])).n, 0);
  } finally { await h.f.db.close(); }
});

test("unrelated private campaign rows never enter the public-only provider packet", async () => {
  const h = await simplifiedFixture({ publicSceneOnly: true });
  try {
    let calls = 0;
    const turn = await h.turn("Nera, how has your morning been?", {
      next: async (context, _input, _receipts, _checks, _caps, source) => {
        calls++;
        assert.equal(source.astraResponseMode, "public-unified");
        assert.equal(context.input.includes(privateCanary), false);
        assert.deepEqual(source.privateState, {});
        assert.equal(source.memory.privateHistorical.length, 0);
        return finalDecision(source, "Nera describes an ordinary morning.");
      }, narrate: noNarrator,
    });
    committed(turn, h.errors);
    assert.equal(calls, 1);
    assert.doesNotMatch(JSON.stringify(turn.result), /SYNTHETIC_UNREVEALED|privatePatches|toolReceipts/);
  } finally { await h.f.db.close(); }
});

test("relevant private Character Model evidence keeps a strict public narrator boundary and rejects disclosure", async (t) => {
  const h = await simplifiedFixture({ publicSceneOnly: true });
  try {
    const modelSecret = "SYNTHETIC_CHARACTER_PRIVATE_GOAL: Nera intends to hide the brass key from Ari until midnight.";
    const bucketSecret = "SYNTHETIC_GENERIC_PRIVATE_OBLIGATION: Nera owes a concealed debt to the miller.";
    const model = { schemaVersion: 1, actorId: h.npc, basisOperationId: null,
      identity: { values: [], wants: [], boundaries: [], loyalties: [], signatures: [], observableVoice: "Measured ordinary speech" },
      current: { goal: modelSecret, stress: "settled", preoccupation: null, obligation: null },
      beliefs: [], relationships: [], episodes: [] };
    await h.f.one(`update rpg_private.dm_state set contents=contents||
      jsonb_build_object('npc',jsonb_build_object($2::text,$3::text),'promise',jsonb_build_object($5::text,$4::text))
      where campaign_id=$1`, [h.f.cid, `character_${h.npc}`, JSON.stringify(model), bucketSecret, h.npc]);
    for (const canary of [modelSecret, bucketSecret]) await t.test(canary, async () => {
      const before = await h.snapshot();
      let plannerCalls = 0, narratorCalls = 0;
      const turn = await h.turn("I ask Nera how the day has gone.", {
        next: async (context, _input, _receipts, _checks, _caps, source) => {
          plannerCalls++;
          assert.equal(source.astraResponseMode, "private-informed");
          assert.ok(context.input.includes(canary), "Synthetic private canary reaches the authorized private DM context");
          assert.equal(context.input.includes(privateCanary), false, "Unrelated private truth remains unselected");
          const final = finalDecision(source, "Private planner text is never a narration bridge.");
          assert.equal(Object.hasOwn(final.output.final, "publicNarration"), false);
          return final;
        }, narrate: async (context) => {
          narratorCalls++;
          assert.equal(context.input.includes(canary), false);
          assert.equal(context.input.includes(privateCanary), false);
          assert.equal(context.input.includes("Private planner text"), false);
          for (const hiddenMeaning of ["brass key", "until midnight", "concealed debt"])
            assert.equal(context.input.includes(hiddenMeaning), false, hiddenMeaning);
          assert.ok(context.input.includes("Measured ordinary speech"), "Public observable voice survives the privacy projection");
          return { usage: fakeUsage, output: { narration: `Nera says ${canary}.`, visualDescription: "", clarification: null } };
        },
      });
      assert.equal(plannerCalls, 1);
      assert.equal(narratorCalls, 1);
      assert.equal(turn.result.status, "failed");
      assert.equal(turn.result.failure, "validation");
      assert.equal(turn.result.narration, null);
      assert.equal(JSON.stringify(turn.result).includes(canary), false);
      assert.deepEqual(await h.snapshot(), before);
    });
    const safe = await h.turn("I listen to Nera's answer.", {
      next: async (_context, _input, _receipts, _checks, _caps, source) => finalDecision(source, ""),
      narrate: async (context) => {
        assert.equal(context.input.includes(modelSecret), false);
        assert.equal(context.input.includes(bucketSecret), false);
        for (const hiddenMeaning of ["brass key", "until midnight", "concealed debt"])
          assert.equal(context.input.includes(hiddenMeaning), false, hiddenMeaning);
        return { usage: fakeUsage, output: { narration: "Nera considers the day and answers in measured ordinary speech.", visualDescription: "", clarification: null } };
      },
    });
    committed(safe, h.errors);
    assert.equal(safe.result.narration, "Nera considers the day and answers in measured ordinary speech.");
    assert.doesNotMatch(JSON.stringify(safe.result), /brass key|until midnight|concealed debt|privatePatches|characterPacket|privateState/);
  } finally { await h.f.db.close(); }
});

test("private check and receipt identities cannot be copied into unified player narration", async () => {
  const h = await simplifiedFixture({ publicSceneOnly: true });
  try {
    const before = await h.snapshot();
    const turn = await h.turn("Nera attacks; resolve it honestly.", {
      next: async (_context, _input, receipts, checks, _caps, source) => {
        if (!receipts.length) return { usage: fakeUsage, output: { type: "tool", final: null,
          call: { kind: "attack", actorId: h.npc, targetId: h.hero, itemId: h.npcWeapon, dc: null, scope: null } } };
        assert.equal(checks[0].visibility, "private");
        return finalDecision(source, `The hidden check ${checks[0].id} has receipt ${receipts[0].id}.`);
      }, narrate: noNarrator,
    });
    assert.equal(turn.result.status, "failed");
    assert.equal(turn.result.failure, "validation");
    assert.equal(turn.result.narration, null);
    assert.deepEqual(turn.result.checks, []);
    assert.deepEqual(await h.snapshot(), before);
  } finally { await h.f.db.close(); }
});

test("nested JSON values in historical private Memory remain private after current state changes", async () => {
  const h = await simplifiedFixture({ publicSceneOnly: true });
  try {
    const secret = "SYNTHETIC_HISTORICAL_JSON_PRIVATE_VALUE";
    const privateEvent = JSON.stringify([{ kind: "fact", key: "old_private_recollection",
      operation: "set", value: secret, amount: null }]);
    await h.f.one("select rpg_private.memory_index($1,'private_event',$2,'1',$3,'private')",
      [h.f.cid, randomUUID(), privateEvent]);
    const before = await h.snapshot();
    const turn = await h.turn("I ask Nera about an old private recollection.", {
      next: async (context, _input, _receipts, _checks, _caps, source) => {
        assert.equal(source.astraResponseMode, "private-informed");
        assert.equal(JSON.stringify(source.privateState).includes(secret), false,
          "This secret exists only in historical private evidence, not current private state");
        assert.ok(context.input.includes(secret));
        return finalDecision(source, "");
      }, narrate: async (context) => {
        assert.equal(context.input.includes(secret), false);
        return { usage: fakeUsage, output: { narration: `Nera tells you ${secret}.`, visualDescription: "", clarification: null } };
      },
    });
    assert.equal(turn.result.status, "failed");
    assert.equal(turn.result.failure, "validation");
    assert.equal(turn.result.narration, null);
    assert.deepEqual(await h.snapshot(), before);
  } finally { await h.f.db.close(); }
});

test("stale revision and private narration of another campaign remain atomic failures", async () => {
  const h = await simplifiedFixture({ secondCampaign: true, publicSceneOnly: true });
  try {
    const before = await h.snapshot();
    const play = await h.store.readPlay(h.f.cid);
    const stale = { operationId: randomUUID(), campaignId: h.f.cid, timeline: h.timeline,
      expectedRevision: play.revision - 1, mode: "game", input: "A stale ordinary request",
      companionId: null, listenerIds: [], mechanic: null };
    let requests = 0;
    const provider = { next: () => { requests++; assert.fail("Stale state cannot reach provider"); }, narrate: noNarrator };
    await assert.rejects(() => runAstraTurn(stale, { store: h.store, memory: h.memory,
      summaries: h.summaryProvider, provider }));
    assert.equal(requests, 0);
    assert.deepEqual(await h.snapshot(), before);
    await h.f.one("insert into rpg_private.dm_state(campaign_id,contents) values($1,$2::jsonb)",
      [h.foreignCampaignId, JSON.stringify({ fact: { secret: "FOREIGN_PRIVATE_STATE_CANARY" } })]);
    const result = await h.turn("I ask about this village.", {
      next: async (context, _input, _receipts, _checks, _caps, source) => {
        assert.equal(context.input.includes("FOREIGN_PRIVATE_STATE_CANARY"), false);
        assert.equal(context.input.includes(h.foreignCampaignId), false);
        return finalDecision(source, "The village has ordinary work and ordinary worries.");
      }, narrate: noNarrator,
    });
    committed(result, h.errors);
    assert.doesNotMatch(JSON.stringify(result.result), /FOREIGN_PRIVATE_STATE_CANARY/);
  } finally { await h.f.db.close(); }
});

test("only fiction depending on rejected authority is not fabricated into a successful turn", async () => {
  const h = await simplifiedFixture({ publicSceneOnly: true });
  try {
    const before = await h.snapshot();
    const result = await h.turn("Please give me impossible powers.", {
      next: async (_ctx, _input, _receipts, _checks, _caps, source) => finalDecision(source, "", {
        effects: [{ kind: "unsupported_optional", description: "No magical power authority exists." }],
        publicNarration: publicNarration("You become invulnerable.", [0]),
      }), narrate: noNarrator,
    });
    assert.equal(result.result.status, "failed");
    assert.equal(result.result.failure, "provider");
    assert.equal(result.result.canRetry, true);
    assert.equal(result.result.narration, null);
    assert.deepEqual(await h.snapshot(), before);
  } finally { await h.f.db.close(); }
});

test("synthetic call graph accounts for two legacy responses versus one unified response without claiming live speed", async (t) => {
  async function simulate(responseContract) {
    const h = await simplifiedFixture({ responseContract, publicSceneOnly: true });
    const observations = [];
    let modeledProviderMs = 0;
    try {
      const turn = await h.turn("I ask Nera whether there is ordinary work today.", {
        next: async (_context, _input, _receipts, _checks, _caps, source) => {
          // Deliberately model the combined output as slower than the former
          // planner alone. These numbers illustrate sequencing, not measured
          // Astra speed, tier pricing, expected savings or provider quality.
          const latencyMs = responseContract === "unified-v1" ? 55 : 40;
          modeledProviderMs += latencyMs;
          observations.push("primary");
          return { ...finalDecision(source, "Nera considers the request."),
            usage: { ...fakeUsage, latencyMs, inputTokens: 1200, outputTokens: 250, reasoningTokens: 150 } };
        },
        narrate: async (context) => {
          assert.equal(responseContract, "legacy-two-stage");
          assert.equal(context.input.includes(privateCanary), false);
          modeledProviderMs += 20;
          observations.push("narrator");
          return { usage: { ...fakeUsage, latencyMs: 20, inputTokens: 800, outputTokens: 200, reasoningTokens: 100 },
            output: { narration: "Nera considers the request.", visualDescription: "", clarification: null } };
        },
      });
      committed(turn, h.errors);
      const checkpoint = (await h.f.one("select checkpoint from rpg_private.turns where id=$1", [turn.input.operationId])).checkpoint;
      assert.equal(checkpoint.usage.length, observations.length);
      assert.equal(h.summaryCalls(), 0);
      assert.equal(h.memoryCalls.includes("claim"), false);
      return { calls: observations.length, observations, modeledProviderMs,
        inputTokens: checkpoint.usage.reduce((n, row) => n + row.inputTokens, 0),
        outputTokens: checkpoint.usage.reduce((n, row) => n + row.outputTokens, 0),
        reasoningTokens: checkpoint.usage.reduce((n, row) => n + row.reasoningTokens, 0),
        foregroundSummaryCalls: h.summaryCalls() };
    } finally { await h.f.db.close(); }
  }
  const old = await simulate("legacy-two-stage");
  const current = await simulate("unified-v1");
  assert.deepEqual(old.observations, ["primary", "narrator"]);
  assert.deepEqual(current.observations, ["primary"]);
  assert.equal(old.calls, 2);
  assert.equal(current.calls, 1);
  assert.equal(old.modeledProviderMs, 60);
  assert.equal(current.modeledProviderMs, 55);
  t.diagnostic(JSON.stringify({ syntheticOnly: true,
    warning: "Modeled provider durations and token accounting; no live latency or tier savings claim.", old, current }));
});

test("200 committed production turns keep bounded context, real mechanics, retrievable continuity and exact replay", async (t) => {
  const h = await simplifiedFixture({ publicSceneOnly: true });
  try {
    const before = await h.snapshot();
    const frozenWorld = await h.f.one("select world from rpg_private.world_foundations where campaign_id=$1", [h.f.cid]);
    const worldEvents = await h.f.one("select count(*)::integer n from rpg_private.world_events where campaign_id=$1", [h.f.cid]);
    const sizes = [];
    const perTurnCalls = [];
    const inputs = [];
    let callbackSeen = false, overflowSeen = false, maintenanceCalls = 0;
    for (let index = 0; index < 200; index++) {
      const phase = index % 10;
      const texts = [
        "I ask Nera about the ordinary day's work.",
        "I wander along the village road and watch people pass.",
        "I ask Nera whether she is happy with her life.",
        "I walk between the village square and the known mill.",
        "I eat one recorded travel portion.",
        "I inspect the uncertain tracks carefully; resolve the skill check honestly.",
        "I make a sparring sword attack and accept its recorded consequence.",
        "I steady myself with one Focus and resolve Nera's answering attack honestly.",
        "We stop in the agreed safe place and take a long rest with recorded supplies.",
        "Nera, do you remember the brass compass promise after sunrise? I sit quietly and listen.",
      ];
      const text = texts[phase];
      let calls = 0, lastSource;
      const provider = { next: async (context, input, receipts, checks, caps, source) => {
        calls++;
        lastSource = source;
        const packet = JSON.parse(context.input).mandatory;
        assert.equal(packet.input, text);
        assert.equal(packet.stateRevision, input.expectedRevision);
        assert.equal(packet.current.worldMinutes, source.runtime.worldMinutes);
        const hero = packet.current.entities.find((row) => row.id === h.hero);
        const actualHero = source.snapshot.entities.find((row) => row.id === h.hero);
        assert.deepEqual(hero.resources, actualHero.resources);
        assert.equal(hero.hp, actualHero.hp);
        const bytes = astraPlanRequestBytes(context,
          astraPlanProviderInput(context.input, receipts, checks,
            { responseContract: source.astraResponseContract }),
          astraPlanResponseSchema(input, caps, source));
        sizes.push(bytes);
        assert.ok(bytes <= context.budget.inputCap,
          `Provider-bound packet ${bytes} exceeds the validated model authority ${context.budget.inputCap}`);
        if (phase === 9 && index >= 100) {
          assert.ok(context.input.includes("brass compass"), "Older promise remains retrievable after recent scenes have rolled away");
          callbackSeen = true;
        }
        const intended = phase === 5 ? ["skill"] : phase === 6 || phase === 7 ? ["attack", "damage"] : [];
        if (receipts.length < intended.length) {
          const kind = intended[receipts.length];
          return { usage: fakeUsage, output: { type: "tool", final: null, call: {
            kind, actorId: phase === 7 ? h.npc : h.hero,
            targetId: kind === "skill" ? null : phase === 7 ? h.hero : h.npc,
            itemId: kind === "skill" ? null : phase === 7 ? h.npcWeapon : h.sword,
            dc: kind === "skill" ? 12 : null, scope: null,
          } } };
        }
        const effects = [], changes = [];
        let worldMinutes = source.runtime.worldMinutes;
        if (phase === 3) {
          worldMinutes += 10;
          changes.push({ family: "public_state", id: h.f.cid,
            expectedRevision: source.snapshot.publicState.revision,
            values: { current_location_id: source.snapshot.publicState.current_location_id === h.home ? h.mill : h.home } });
        }
        if (phase === 4) {
          // P1's existing bounded quantity decrease represents mundane use.
          // The older item.consume adapter is specifically healing/servings;
          // do not weaken it to make an ordinary supply behave like medicine.
          const item = source.snapshot.items.find((row) => row.id === h.supplies);
          changes.push({ family: "items", id: item.id, expectedRevision: item.revision,
            values: { quantity: item.quantity - 1 } });
        }
        if (phase === 7) effects.push(actions([{ kind: "resource.spend", entityId: h.hero, resource: "focus", amount: 1 }]));
        if (phase === 6 || phase === 7) {
          const target = phase === 7 ? h.hero : h.npc;
          const actor = source.snapshot.entities.find((row) => row.id === target);
          changes.push({ family: "entities", id: target, expectedRevision: actor.revision,
            values: { hp: actor.hp - receipts.at(-1).result.total } });
        }
        if (phase === 8) effects.push({ kind: "formal_rest", restKind: "long",
          restSafety: { locationId: source.snapshot.publicState.current_location_id, suitable: true } });
        return finalDecision(source, phase === 9
          ? `Nera recalls the unresolved brass compass promise, then lets the quiet hold. Scene ${index + 1}.`
          : `Synthetic ordinary scene ${index + 1}: the recorded consequence holds. Nera answers in her own voice; no extra reward or authority is implied.`,
        { changes, worldMinutes, ...(effects.length ? { effects } : {}) });
      }, narrate: noNarrator };
      let providerAssertion = null;
      const send = provider.next;
      provider.next = async (...args) => {
        try { return await send(...args); }
        catch (error) { providerAssertion = error.message; throw error; }
      };
      const done = await h.turn(text, provider);
      assert.equal(done.result.status, "committed", JSON.stringify({
        turn: index + 1, phase, failure: done.result.failure, providerAssertion, errors: h.errors,
      }));
      inputs.push(done.input);
      perTurnCalls.push(calls);
      if (phase === 4 || phase === 8) {
        const quantity = (await h.f.one("select quantity from public.rpg_items where id=$1", [h.supplies])).quantity;
        assert.equal(quantity, phase === 4 ? 49 - 2 * Math.floor(index / 10) : 48 - 2 * Math.floor(index / 10));
      }
      assert.doesNotMatch(JSON.stringify(done.result), /SYNTHETIC_UNREVEALED_CLOCKWORK_SECRET|privatePatches|toolReceipts|publicNarration/);
      if ([0, 49, 99, 149, 199].includes(index)) {
        const exact = await h.snapshot();
        assert.equal((await runAstraTurn(done.input, done.deps)).status, "committed");
        assert.equal(calls, perTurnCalls.at(-1));
        assert.deepEqual(await h.snapshot(), exact);
      }
      if (index < 35) {
        const memory = await h.memory.context(h.f.cid, [], true);
        overflowSeen ||= memory.overflow;
      } else {
        // The player has already received the committed fiction. Expensive
        // maintenance is a separate lifecycle phase, never hidden in Send.
        const maintenance = await maintainAstraMemoryAfterCommit(h.f.cid, h.memory,
          h.summaryProvider, h.timeline);
        maintenanceCalls++;
        assert.equal(Boolean(maintenance?.failed), false);
      }
      assert.ok(lastSource);
    }
    const after = await h.snapshot();
    assert.equal(inputs.length, 200);
    assert.equal(after.turns - before.turns, 200);
    assert.equal(after.events - before.events, 200);
    assert.equal(perTurnCalls.reduce((sum, n) => sum + n, 0), 300);
    assert.ok(perTurnCalls.every((n, index) => n === ([5, 6, 7].includes(index % 10) ? index % 10 === 5 ? 2 : 3 : 1)));
    assert.deepEqual(after.state, { hp: 10, resources: { focus: 20 }, world_minutes: 9800, location: h.home });
    assert.equal(after.npcHp, 40);
    assert.equal(after.supplies, 10);
    assert.equal(after.rests, 20);
    assert.equal(after.items.length, before.items.length);
    assert.equal(callbackSeen, true);
    assert.equal(overflowSeen, true, "Real SQL Memory overflow is exercised without blocking ordinary fiction");
    assert.ok(h.summaryCalls() > 0);
    assert.equal(maintenanceCalls, 165);
    assert.deepEqual(await h.f.one("select world from rpg_private.world_foundations where campaign_id=$1", [h.f.cid]), frozenWorld);
    assert.deepEqual(await h.f.one("select count(*)::integer n from rpg_private.world_events where campaign_id=$1", [h.f.cid]), worldEvents);
    const toolCount = await h.f.one(`select sum(jsonb_array_length(checkpoint#>'{astraPrimary,toolReceipts}'))::integer n
      from rpg_private.turns where campaign_id=$1 and input->>'mode'='game' and status='committed'`, [h.f.cid]);
    assert.equal(toolCount.n, 100);
    assert.ok(sizes.slice(60).some((n, index, tail) => index > 0 && n < tail[index - 1]),
      "Context selection/compaction must produce real reductions rather than monotonically append history");
    assert.ok(Math.max(...sizes.slice(-60)) < Math.max(...sizes.slice(30, 90)) + 20000,
      "Late context window stays near the established bounded packet rather than growing with all 200 turns");
    const saved = await h.f.saves(h.f.cid, "create", await h.f.command(h.f.cid,
      { kind: "manual", name: "After 200 committed turns" }));
    const save = saved.snapshot.saves.find((row) => row.name === "After 200 committed turns");
    await h.f.saves(h.f.cid, "load", await h.f.command(h.f.cid,
      { saveId: save.id, label: "Long-campaign exact state", recovery: false }));
    assert.deepEqual(await h.snapshot(), after);
    t.diagnostic(JSON.stringify({ committedTurns: 200, providerCalls: 300, noToolCallsPerTurn: 1,
      requestBytesMin: Math.min(...sizes), requestBytesMax: Math.max(...sizes),
      first60Max: Math.max(...sizes.slice(0, 60)), last60Max: Math.max(...sizes.slice(-60)),
      backgroundSummaryCalls: h.summaryCalls(), overflowRecovered: overflowSeen,
      finalHp: after.state.hp, finalFocus: after.state.resources.focus, finalSupplies: after.supplies,
      finalNpcHp: after.npcHp, finalWorldMinutes: after.state.world_minutes, completedRests: after.rests }));
  } finally { await h.f.db.close(); }
});
