// Stage 3 §1: the database itself guards the invariants of the turn loop.
// Every probe here bypasses TypeScript and writes SQL directly on PGlite; each
// attempt to violate an invariant must fail.
import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { loopCampaign } from "./dm-loop-fixture.mjs";
import { world } from "./phase35-storage-fixture.mjs";

/** A campaign with money, a stack of bread, an NPC and a paid quest reward. */
async function prepared() {
  const c = await loopCampaign();
  const setup = await c.turn("I take the organiser's job and buy bread.", [
    { text: "Chalked up. ", toolCalls: [
      { name: "money", arguments: { action: "grant", currency: "coins", amount: 20, toRef: c.hero, reason: "an advance" } },
      { name: "item", arguments: { action: "create", localKey: "loaf", name: "Loaf of bread", category: "consumable", quantity: 3, ownerRef: c.hero } },
      { name: "upsert_character", arguments: { localKey: "miller", name: "Oswin the miller", kind: "npc", description: "Floury.", present: true, maxHp: 8 } },
      { name: "resource", arguments: { actorRef: "miller", resource: "stamina", set: 2, max: 5, reason: "tired" } },
      { name: "quest", arguments: { action: "create", localKey: "flour", title: "Haul flour", description: "Twenty sacks.", issuerRef: "miller", reward: { currency: "coins", amount: 5 } } },
      { name: "quest", arguments: { action: "complete", questRef: "flour" } },
      { name: "quest", arguments: { action: "claim_reward", questRef: "flour" } },
      { name: "advance_time", arguments: { minutes: 30, reason: "the job" } },
      { name: "finish_turn", arguments: { sceneKinds: ["trade"], spotlight: ["miller"], playerMoment: false } },
    ] },
  ]);
  assert.equal(setup.result.status, "committed", JSON.stringify(c.errors));
  const receipts = (await c.row(setup.input.operationId)).checkpoint.dmLoop.receipts;
  assert.ok(receipts.every((r) => r.result.ok), JSON.stringify(receipts.filter((r) => !r.result.ok).map((r) => r.result.reason)));
  const state = await c.state();
  const miller = state.entities.find((row) => row.name === "Oswin the miller");
  const quest = state.quests.find((row) => row.title === "Haul flour");
  const loaf = state.items.find((row) => row.name === "Loaf of bread");
  return { c, op: setup.input.operationId, miller, quest, loaf, hero: state.entities.find((row) => row.id === c.hero) };
}

test("SQL invariants: quantities, balances and bounded counters cannot go out of range by direct writes", async () => {
  const { c, miller, loaf, hero } = await prepared();
  const q = c.f.one;
  try {
    assert.equal(hero.resources.currency_coins, 25);
    assert.deepEqual(miller.resources, { stamina: 2, stamina_max: 5 });
    // Item quantity below zero.
    await assert.rejects(q("update public.rpg_items set quantity=-1 where id=$1", [loaf.id]), /check constraint/);
    // An equipped item must have stock.
    await assert.rejects(q("update public.rpg_items set equipped_entity_id=$2,equipped_slot='hand',quantity=0 where id=$1", [loaf.id, c.hero]), /check constraint/);
    // Money below zero, for any holder.
    await assert.rejects(q(`update public.rpg_entities set resources=resources||'{"currency_coins":-1}' where id=$1`, [c.hero]), /rpg_entities_resources_within_bounds/);
    await assert.rejects(q(`update public.rpg_entities set resources='{"currency_coins":-100}' where id=$1`, [miller.id]), /rpg_entities_resources_within_bounds/);
    // A named counter above its stored cap, or below zero.
    await assert.rejects(q(`update public.rpg_entities set resources='{"stamina":6,"stamina_max":5}' where id=$1`, [miller.id]), /rpg_entities_resources_within_bounds/);
    await assert.rejects(q(`update public.rpg_entities set resources='{"stamina":-1,"stamina_max":5}' where id=$1`, [miller.id]), /rpg_entities_resources_within_bounds/);
    // A counter without a stored cap has no upper bound here (whatever the ruleset stores is respected).
    await q(`update public.rpg_entities set resources='{"stamina":5,"stamina_max":5,"renown":40}' where id=$1`, [miller.id]);
    // HP within 0..max_hp (temporary HP would be its own stored counter).
    await assert.rejects(q("update public.rpg_entities set hp=9 where id=$1", [miller.id]), /check constraint/);
    await assert.rejects(q("update public.rpg_entities set hp=-1 where id=$1", [miller.id]), /check constraint/);
    await assert.rejects(q("update public.rpg_entities set max_hp=null where id=$1", [miller.id]), /check constraint/);
    await q("update public.rpg_entities set hp=0 where id=$1", [miller.id]);
    const after = await q("select hp,max_hp,resources from public.rpg_entities where id=$1", [miller.id]);
    assert.deepEqual(after, { hp: 0, max_hp: 8, resources: { stamina: 5, stamina_max: 5, renown: 40 } });
  } finally { await c.f.db.close(); }
});

test("SQL invariants: a quest reward is claimed at most once, and the claim points at a real operation of the campaign", async () => {
  const { c, op, quest } = await prepared();
  const q = c.f.one;
  try {
    assert.equal(quest.reward_operation_id, op, "the loop's claim marked the quest row");
    // The claim never moves or clears.
    await assert.rejects(q("update public.rpg_quests set reward_operation_id=null where id=$1", [quest.id]), /rpg_reward_claimed/);
    await assert.rejects(q("update public.rpg_quests set reward_operation_id=$2 where id=$1", [quest.id, randomUUID()]), /rpg_reward_claimed/);
    await q("update public.rpg_quests set reward_operation_id=$2 where id=$1", [quest.id, op]);
    // An unpaid quest can only be claimed by an operation of its own campaign.
    const other = await c.turn("I take a second job.", [
      { text: "Another line in the ledger. ", toolCalls: [
        { name: "quest", arguments: { action: "create", localKey: "roof", title: "Mend the roof", description: "Shingles.", reward: { currency: "coins", amount: 2 } } },
        { name: "finish_turn", arguments: { sceneKinds: ["trade"], spotlight: [], playerMoment: false } },
      ] },
    ]);
    assert.equal(other.result.status, "committed", JSON.stringify(c.errors));
    const roof = (await c.state()).quests.find((row) => row.title === "Mend the roof");
    assert.equal(roof.reward_operation_id, null);
    await assert.rejects(q("update public.rpg_quests set reward_operation_id=$2 where id=$1", [roof.id, randomUUID()]), /foreign key/);
    const w = await world(c.f, "Another campaign");
    const foreignTurn = await q("select id from rpg_private.turns where campaign_id<>$1 limit 1", [c.cid]);
    if (foreignTurn) await assert.rejects(q("update public.rpg_quests set reward_operation_id=$2 where id=$1", [roof.id, foreignTurn.id]), /foreign key/);
    assert.ok(w.cid !== c.cid);
  } finally { await c.f.db.close(); }
});

test("SQL invariants: the loop's commit refuses a second payment and a pinned limit overrun, even from a forged packet", async () => {
  const { c, op, quest } = await prepared();
  try {
    const craft = async (mutate) => {
      const input = await c.input("A forged turn.");
      const d = await c.deps(null);
      await d.store.begin(input, "dm-loop-v1");
      const claim = await d.store.claim(c.cid, input.operationId);
      assert.ok(claim, "claimed");
      const minutes = claim.source.runtime.worldMinutes;
      const packet = { narration: "Forged.", visualDescription: "", checks: [], guidanceProposal: null,
        resolution: { changes: [], worldMinutes: minutes, configuration: claim.source.runtime.configuration, outcomes: [] },
        privatePatches: [], dmLoop: { receipts: [], meta: null, usage: [], requests: 0 } };
      await mutate(packet, claim, d.store);
      const error = await d.store.commit(claim.lease, packet).then(() => null, (error) => error);
      // A refused forged commit fails its operation (as the loop would), so the next probe can begin.
      if (error) await d.store.fail(claim.lease, "validation", false);
      return { error, operationId: input.operationId };
    };
    // 1. Paying an already paid reward again through a private settlement patch.
    const again = await craft(async (packet, claim) => {
      packet.privatePatches.push({ kind: "fact", key: `quest_reward_${quest.id}`, operation: "set", amount: null,
        value: JSON.stringify({ currency: "coins", amount: 5, items: [], note: null, issuerId: null, paidOperationId: claim.lease.operationId }) });
    });
    assert.equal(again.error?.code, "validation");
    assert.match(c.errors.at(-1).message, /rpg_reward_claimed/);
    assert.equal((await c.f.one("select reward_operation_id from public.rpg_quests where id=$1", [quest.id])).reward_operation_id, op);
    // 2. Re-opening the terms of a paid reward ("not paid") is refused too.
    const reopen = await craft(async (packet) => {
      packet.privatePatches.push({ kind: "fact", key: `quest_reward_${quest.id}`, operation: "set", amount: null,
        value: JSON.stringify({ currency: "coins", amount: 50, items: [], note: null, issuerId: null, paidOperationId: null }) });
    });
    assert.equal(reopen.error?.code, "validation");
    assert.match(c.errors.at(-1).message, /rpg_reward_claimed/);
    // 3. More time than the pinned limit allows.
    const pin = (limits) => ({ providerId: "openai", modelId: "gpt-6-astra", effort: "medium", runtime: "dm-loop-v1", privacy: "single-narrator",
      limits: { moneyPerTurn: 1000, itemsPerTurn: 5, charactersPerTurn: 1, minutesPerTurn: 60, toolCallsPerTurn: 10, modelRequestsPerTurn: 3, ...limits } });
    const tooLong = await craft(async (packet, claim, store) => {
      const checkpoint = structuredClone(claim.turn.checkpoint);
      checkpoint.dmLoop.pin = pin({});
      await store.checkpoint(claim.lease, checkpoint, "generating");
      packet.resolution.worldMinutes += 120;
    });
    assert.equal(tooLong.error?.code, "validation");
    assert.match(c.errors.at(-1).message, /rpg_limit_exceeded/);
    // 4. More new characters than the pinned limit allows.
    const crowd = await craft(async (packet, claim, store) => {
      const checkpoint = structuredClone(claim.turn.checkpoint);
      checkpoint.dmLoop.pin = pin({});
      await store.checkpoint(claim.lease, checkpoint, "generating");
      for (const name of ["Ann", "Bert"]) packet.resolution.changes.push({ family: "entities", id: randomUUID(), expectedRevision: null,
        values: { kind: "npc", name, details: "", hp: null, max_hp: null, stats: {}, resources: {}, conditions: [], equipment_slots: [] } });
    });
    assert.equal(crowd.error?.code, "validation");
    assert.match(c.errors.at(-1).message, /rpg_limit_exceeded/);
    // 5. The same packet within the limits commits (the guards are the only difference).
    const fine = await craft(async (packet, claim, store) => {
      const checkpoint = structuredClone(claim.turn.checkpoint);
      checkpoint.dmLoop.pin = pin({});
      await store.checkpoint(claim.lease, checkpoint, "generating");
      packet.resolution.worldMinutes += 60;
      packet.resolution.changes.push({ family: "entities", id: randomUUID(), expectedRevision: null,
        values: { kind: "npc", name: "Ann", details: "", hp: null, max_hp: null, stats: {}, resources: {}, conditions: [], equipment_slots: [] } });
    });
    assert.equal(fine.error, null, JSON.stringify(c.errors.at(-1)));
    assert.equal((await c.row(fine.operationId)).status, "committed");
  } finally { await c.f.db.close(); }
});

test("SQL invariants: a commit touches only its own campaign and timeline; revision checks hold", async () => {
  const { c, miller } = await prepared();
  const q = c.f.one;
  try {
    const w = await world(c.f, "Another campaign");
    const foreignEntity = await q("select id,revision from public.rpg_entities where campaign_id=$1 limit 1", [w.cid]);
    const op = randomUUID();
    // Another campaign's record cannot be adopted or updated through the applier …
    await assert.rejects(q("select rpg_private.runtime_change($1,$2,$3::jsonb)", [c.cid, op,
      JSON.stringify({ family: "entities", id: foreignEntity.id, expectedRevision: foreignEntity.revision, values: { name: "Stolen" } })]), /rpg_validation/);
    await assert.rejects(q("select rpg_private.runtime_change($1,$2,$3::jsonb)", [c.cid, op,
      JSON.stringify({ family: "entities", id: foreignEntity.id, expectedRevision: null,
        values: { kind: "npc", name: "Stolen", details: "", hp: null, max_hp: null, stats: {}, resources: {}, conditions: [], equipment_slots: [] } })]), /rpg_validation/);
    // … nor by a composite reference: an item of this campaign owned by that campaign's character.
    const storage = await q("select id from public.rpg_storages where campaign_id=$1 limit 1", [c.cid]);
    await assert.rejects(q(`insert into public.rpg_items(id,campaign_id,name,category,quantity,description,mechanics,owner_entity_id,storage_id,revision)
      values($1,$2,'Smuggled','misc',1,'','',$3,$4,1)`, [randomUUID(), c.cid, foreignEntity.id, storage.id]), /foreign key/);
    // A stale revision is a conflict, not a silent overwrite.
    await assert.rejects(q("select rpg_private.runtime_change($1,$2,$3::jsonb)", [c.cid, op,
      JSON.stringify({ family: "entities", id: miller.id, expectedRevision: miller.revision + 5, values: { name: "Oswin" } })]), /rpg_conflict/);
    // A turn of another timeline epoch cannot write.
    const fence = await c.f.fence(c.cid);
    const input = await c.input("Fenced out.");
    await c.f.runtime(c.cid, "begin", { ...input, timeline: undefined, serverRuntime: "dm-loop-v1" });
    const claim = await c.f.runtime(c.cid, "claim", { operationId: input.operationId });
    await assert.rejects(c.f.runtime(c.cid, "commit", { ...claim.lease, packet: { narration: "x", visualDescription: "", checks: [], guidanceProposal: null,
      resolution: { changes: [], worldMinutes: claim.source.runtime.worldMinutes, configuration: claim.source.runtime.configuration, outcomes: [] },
      privatePatches: [], dmLoop: { receipts: [], meta: null, usage: [], requests: 0 } } },
    { ...fence, epoch: fence.epoch + 1 }), /rpg_conflict/);
    assert.equal(w.cid.length, 36);
  } finally { await c.f.db.close(); }
});

test("SQL invariants: operation IDs stay unique; a committed turn is never re-committed, rewritten or deleted", async () => {
  const { c, op } = await prepared();
  const q = c.f.one;
  try {
    const row = await q("select * from rpg_private.turns where id=$1", [op]);
    assert.equal(row.status, "committed");
    await assert.rejects(q(`insert into rpg_private.turns(id,campaign_id,owner_id,session_id,input,expected_revision,settings_revision,settings,guide_revision)
      values($1,$2,$3,$4,$5::jsonb,$6,$7,$8::jsonb,$9)`, [op, c.cid, c.owner, row.session_id, JSON.stringify(row.input),
      row.expected_revision, row.settings_revision, JSON.stringify(row.settings), row.guide_revision]), /duplicate key/);
    await assert.rejects(q("update rpg_private.turns set status='pending' where id=$1", [op]), /rpg_immutable_history/);
    await assert.rejects(q("update rpg_private.turns set status='failed',retryable=true where id=$1", [op]), /rpg_immutable_history/);
    await assert.rejects(q("update rpg_private.turns set narration='Rewritten.' where id=$1", [op]), /rpg_immutable_history/);
    await assert.rejects(q(`update rpg_private.turns set input=input||'{"input":"something else"}' where id=$1`, [op]), /rpg_immutable_history/);
    await assert.rejects(q("delete from rpg_private.turns where id=$1", [op]), /rpg_immutable_history/);
    // Bookkeeping that older wrappers do after a commit stays allowed.
    await q("update rpg_private.turns set committed_revision=committed_revision,lease_token=null where id=$1", [op]);
    // A second commit of the same operation through the RPC is a conflict, the first result stays.
    await assert.rejects(c.f.runtime(c.cid, "commit", { campaignId: c.cid, operationId: op, token: randomUUID(), expectedRevision: row.expected_revision,
      packet: { narration: "again" } }), /rpg_conflict/);
    const same = await q("select narration,committed_revision from rpg_private.turns where id=$1", [op]);
    assert.equal(same.narration, row.narration);
    assert.equal(same.committed_revision, row.committed_revision);
    // A failed, cancelled turn can still be deleted by restore machinery only; here it simply is not committed.
    const pending = await q("select count(*)::int n from rpg_private.turns where campaign_id=$1 and status<>'committed'", [c.cid]);
    assert.equal(pending.n, 0);
  } finally { await c.f.db.close(); }
});
