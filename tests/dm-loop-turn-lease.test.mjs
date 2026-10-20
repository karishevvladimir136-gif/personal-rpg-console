// The stuck-turn fix (session 2, sandbox turn of 2026-10-20): a dm-loop-v1 turn that runs longer
// than its 300 s claim lease. Before migration 71 nothing renewed the lease, so such a turn could
// neither commit nor fail and stayed `generating`; its public `canRetry` retry was refused (422),
// and the composer kept re-sending that refused command on every later click.
//   * every tool receipt, checkpoint, commit and failure renews the lease of its claimant;
//   * a stuck turn (generating, expired lease) can be retried from its checkpoint or cancelled;
//   * another claim still fences the old claimant out;
//   * the composer drops a command the server refused, so the next click sends the chosen action.
// Disposable PGlite databases and scripted models only.
import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { loopCampaign } from "./dm-loop-fixture.mjs";
import { resumeDmLoopTurn, retryClaimable, runDmLoopTurn } from "../src/lib/gameplay/dm-loop/loop.ts";
import { resumeCampaignTurn } from "../src/lib/gameplay/dm-loop/two-pass/runtime.ts";
import { createScriptedDmModel } from "../src/lib/gameplay/dm-loop/scripted-model.ts";
import { DmError } from "../src/lib/gameplay/dm-errors.ts";
import { dropRefusedCommand, journalKey, loadJournal, prepareCommand, saveJournal } from "../src/lib/gameplay/client-state.ts";
import { GameplayClientError, resumeTurn } from "../src/lib/gameplay/client.ts";

// A hidden DM roll (the hero's own rolls are shown and pause the turn for the player).
const rounds = (hero, label) => [
  { text: `${label}: the organiser looks up from the notice board. `, toolCalls: [
    { name: "roll", arguments: { formula: "2d6", reason: "the organiser's mood today", actorRef: "dm", visibility: "private" } },
  ] },
  { text: "She taps the board and names the pay. ", toolCalls: [
    { name: "advance_time", arguments: { minutes: 5, reason: "a short talk" } },
    { name: "finish_turn", arguments: { sceneKinds: ["conversation"], spotlight: [], playerMoment: false } },
  ] },
];

async function harness() {
  const c = await loopCampaign();
  const lease = (operationId) => c.f.one(`select status,lease_token,extract(epoch from lease_until-now())::float8 seconds
    from rpg_private.turns where id=$1`, [operationId]);
  const setLease = (operationId, seconds) => c.f.query(
    "update rpg_private.turns set lease_until=now()+make_interval(secs=>$2) where id=$1", [operationId, seconds]);
  const scenes = async () => (await c.f.query("select count(*)::int n from public.rpg_scenes where campaign_id=$1", [c.cid]))[0].n;
  /** A turn whose server process died after the lease expired (the sandbox turn): the commit and the
   * failure are never written, so the row stays `generating` with an expired lease and a checkpoint. */
  const stuck = async (label) => {
    const model = createScriptedDmModel(rounds(c.hero, label));
    const d = await c.deps(model);
    const leases = [];
    const store = { ...d.store,
      checkpoint: (held, ...rest) => { leases.push(held); return d.store.checkpoint(held, ...rest); },
      commit: async (held) => { await setLease(held.operationId, -1); throw new DmError("unavailable", true); },
      fail: async () => { throw new DmError("unavailable", true); } };
    const input = await c.input(`I ask about the paid work (${label}).`);
    await assert.rejects(runDmLoopTurn(input, { ...d, store }), (error) => error.name === "TurnError");
    return { input, model, lease: leases.at(-1) };
  };
  const command = (input, action) => ({ commandId: randomUUID(), campaignId: c.cid, operationId: input.operationId,
    timeline: input.timeline, action, checkId: null });
  return { c, lease, setLease, scenes, stuck, command };
}

test("a turn whose lease expires before the commit still commits: receipts and checkpoints renew the lease of the claimant", async () => {
  const { c, lease, setLease } = await harness();
  try {
    const model = createScriptedDmModel(rounds(c.hero, "Long turn"));
    const d = await c.deps(model);
    const left = [];
    // Each write comes when the lease is nearly gone (a receipt) or already gone (a checkpoint, the
    // commit): the turn ran past five minutes and nobody else claimed it.
    const store = { ...d.store,
      recordDmTool: async (held, ...rest) => {
        await setLease(held.operationId, 2);
        const receipt = await d.store.recordDmTool(held, ...rest);
        left.push((await lease(held.operationId)).seconds);
        return receipt;
      },
      checkpoint: async (held, ...rest) => {
        await setLease(held.operationId, -1);
        await d.store.checkpoint(held, ...rest);
        left.push((await lease(held.operationId)).seconds);
      },
      commit: async (held, packet) => {
        await setLease(held.operationId, -1);
        return d.store.commit(held, packet);
      } };
    const input = await c.input("I ask about the paid work and wait for the organiser's answer.");
    const result = await runDmLoopTurn(input, { ...d, store });
    assert.equal(result.status, "committed", JSON.stringify(c.errors));
    assert.deepEqual(c.errors, [], "no write was refused");
    assert.ok(left.length >= 5, "receipts and checkpoints were written");
    for (const seconds of left) assert.ok(seconds > 290 && seconds <= 300, `the lease was renewed to 300 s (${seconds})`);
    const row = await c.row(input.operationId);
    assert.equal(row.status, "committed");
    assert.match(row.narration, /Long turn: the organiser looks up[\s\S]*names the pay/);
    const after = await lease(input.operationId);
    assert.equal(after.lease_token, null, "a committed turn holds no lease");
  } finally { await c.f.db.close(); }
});

test("a failure after the lease expired is recorded as a retryable failure, never left generating; the retry commits", async () => {
  const { c, setLease } = await harness();
  try {
    const model = createScriptedDmModel([rounds(c.hero, "Broken stream")[0], { failBefore: "transport" }, rounds(c.hero, "x")[1]]);
    const d = await c.deps(model);
    const store = { ...d.store, fail: async (held, ...rest) => { await setLease(held.operationId, -1); return d.store.fail(held, ...rest); } };
    const input = await c.input("I ask about the paid work while the connection drops.");
    const failed = await runDmLoopTurn(input, { ...d, store });
    assert.equal(failed.status, "failed", JSON.stringify(c.errors));
    assert.equal(failed.failure, "provider");
    assert.equal(failed.canRetry, true);
    const row = await c.row(input.operationId);
    assert.equal(row.status, "failed");
    assert.equal(row.retryable, true);
    const retried = await c.retry({ input, model }, "retry");
    assert.equal(retried.result.status, "committed", JSON.stringify(c.errors));
    assert.match((await c.row(input.operationId)).narration, /Broken stream: the organiser[\s\S]*names the pay/);
  } finally { await c.f.db.close(); }
});

test("a stuck turn (generating, expired lease) shows canRetry, and its retry resumes from the checkpoint on both resume paths", async () => {
  const { c, lease, setLease, scenes, stuck, command } = await harness();
  try {
    for (const [label, resume] of [["First stuck", resumeDmLoopTurn], ["Second stuck", resumeCampaignTurn]]) {
      const s = await stuck(label);
      const before = await c.row(s.input.operationId);
      assert.equal(before.status, "generating", "the incident state");
      assert.ok((await lease(s.input.operationId)).seconds < 0, "its lease expired");
      const shown = await c.f.runtime(c.cid, "get", { operationId: s.input.operationId });
      assert.equal(shown.status, "generating");
      assert.equal(shown.canRetry, true);
      assert.equal(retryClaimable(shown), true);
      const requests = s.model.requests.length;
      const scenesBefore = await scenes();
      // While a claimant still holds a live lease, a retry changes nothing (no second runner).
      await setLease(s.input.operationId, 120);
      const live = await c.f.runtime(c.cid, "get", { operationId: s.input.operationId });
      assert.equal(live.canRetry, false);
      const untouched = await resume(command(s.input, "retry"), { ...(await c.deps(s.model)), split: null });
      assert.equal(untouched.status, "generating");
      assert.equal(s.model.requests.length, requests);
      // Once the lease expired, the retry takes the turn over and commits what the checkpoint holds.
      await setLease(s.input.operationId, -1);
      const retried = await resume(command(s.input, "retry"), { ...(await c.deps(s.model)), split: null });
      assert.equal(retried.status, "committed", JSON.stringify(c.errors));
      assert.equal(s.model.requests.length, requests, "a finished turn needs no new model request");
      const after = await c.row(s.input.operationId);
      assert.deepEqual(after.checkpoint.dmLoop.receipts, before.checkpoint.dmLoop.receipts, "the dice were not rolled again");
      assert.equal(after.narration, before.checkpoint.dmLoop.text.trim());
      assert.equal(await scenes(), scenesBefore + 2, "one player scene and one narration scene");
    }
  } finally { await c.f.db.close(); }
});

test("a stuck turn can be cancelled; the campaign plays on and the old claimant can no longer write", async () => {
  const { c, scenes, stuck, command } = await harness();
  try {
    const s = await stuck("Abandoned");
    const scenesBefore = await scenes();
    const stateBefore = await c.state();
    const cancelled = await resumeDmLoopTurn(command(s.input, "cancel"), await c.deps(s.model));
    assert.equal(cancelled.status, "cancelled", JSON.stringify(c.errors));
    assert.equal((await c.row(s.input.operationId)).status, "cancelled");
    assert.equal(await scenes(), scenesBefore, "nothing of the cancelled turn was applied");
    assert.deepEqual((await c.state()).runtime, stateBefore.runtime);
    // A late write of the claimant that went silent is refused, the failure too.
    const store = (await c.deps(s.model)).store;
    await assert.rejects(store.checkpoint(s.lease, (await c.row(s.input.operationId)).checkpoint, "generating"), (e) => e.code === "conflict");
    await assert.rejects(store.fail(s.lease, "provider", true), (e) => e.code === "conflict");
    assert.equal((await c.row(s.input.operationId)).status, "cancelled");
    const next = await c.turn("I read the notice board again.", rounds(c.hero, "After the cancel"));
    assert.equal(next.result.status, "committed", JSON.stringify(c.errors));
  } finally { await c.f.db.close(); }
});

test("an expired lease taken over by another claim fences the old claimant out: no renewal, no write, no failure", async () => {
  const { c, lease, stuck } = await harness();
  try {
    const s = await stuck("Taken over");
    const store = (await c.deps(s.model)).store;
    const claim = await store.claim(c.cid, s.input.operationId);
    assert.ok(claim, "an expired lease can be claimed");
    assert.notEqual(claim.lease.token, s.lease.token);
    const held = await lease(s.input.operationId);
    const checkpoint = (await c.row(s.input.operationId)).checkpoint;
    await assert.rejects(store.checkpoint(s.lease, checkpoint, "generating"), (e) => e.code === "conflict");
    // (The receipt's lease check has always answered as a validation error.)
    await assert.rejects(store.recordDmTool(s.lease, checkpoint.dmLoop.receipts.length,
      { id: "late_call", name: "advance_time", arguments: { minutes: 1, reason: "late" } }, { ok: true, value: {}, player: null, check: null }),
      (e) => e.code === "conflict" || e.code === "validation");
    await assert.rejects(store.fail(s.lease, "provider", true), (e) => e.code === "conflict");
    const after = await lease(s.input.operationId);
    assert.equal(after.status, "generating");
    assert.equal(after.lease_token, claim.lease.token, "the new claimant keeps the turn");
    assert.ok(after.seconds <= held.seconds, "the old token renewed nothing");
    // The new claimant's own write renews its lease as usual.
    await store.checkpoint(claim.lease, checkpoint, "generating");
    assert.ok((await lease(s.input.operationId)).seconds > 290);
  } finally { await c.f.db.close(); }
});

test("the composer drops a resume command the server refused (4xx) and keeps one whose outcome is unknown", async () => {
  const attempt = { operationId: "operation-a", campaignId: "campaign-a", expectedRevision: 3, mode: "game", input: "I wait.",
    companionId: null, listenerIds: [], mechanic: null };
  const retry = prepareCommand(null, { campaignId: "campaign-a", operationId: "operation-a", action: "retry", checkId: null }, () => "command-retry");
  const journal = { text: "", attempt, command: retry, recovered: true };
  for (const status of [400, 404, 409, 422]) assert.equal(dropRefusedCommand(journal, status).command, null, `refused ${status}`);
  for (const status of [null, 500, 503]) assert.equal(dropRefusedCommand(journal, status), journal, `unknown outcome ${status}`);
  assert.deepEqual(dropRefusedCommand(journal, 422), { ...journal, command: null }, "the attempt stays, so its turn stays reachable");
  // The sandbox sequence: a refused retry stays in the tab's journal; «Отказаться» then re-sent it.
  // After the drop the cancel click is a cancel, also after a reload of the tab.
  assert.equal(prepareCommand(journal.command, { campaignId: "campaign-a", operationId: "operation-a", action: "cancel", checkId: null }), retry,
    "a stored command is re-sent as it is (an uncertain reroll must never become a second roll)");
  const storage = new Map();
  const tab = { getItem: (key) => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value), removeItem: (key) => storage.delete(key) };
  saveJournal(tab, journalKey("campaign-a", "game"), dropRefusedCommand(journal, 422));
  const reloaded = loadJournal(tab, "campaign-a", "game");
  assert.equal(reloaded.command, null);
  const cancel = prepareCommand(reloaded.command, { campaignId: "campaign-a", operationId: "operation-a", action: "cancel", checkId: null }, () => "command-cancel");
  assert.equal(cancel.action, "cancel");
  assert.equal(cancel.commandId, "command-cancel");
});

test("the transport reports the HTTP status of a refused command, and the composer sends every resume through the drop", async () => {
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async () => Response.json({ error: { code: "validation", message: "validation" } }, { status: 422 });
    await assert.rejects(resumeTurn({ commandId: "command-a", campaignId: "campaign-a", operationId: "operation-a", action: "retry", checkId: null }),
      (error) => error instanceof GameplayClientError && error.code === "validation" && error.status === 422);
    globalThis.fetch = async () => { throw new TypeError("network down"); };
    await assert.rejects(resumeTurn({ commandId: "command-a", campaignId: "campaign-a", operationId: "operation-a", action: "retry", checkId: null }),
      (error) => error instanceof GameplayClientError && error.code === "unavailable" && error.status === null);
  } finally { globalThis.fetch = originalFetch; }
  const composer = await readFile(new URL("../src/components/gameplay-composer.tsx", import.meta.url), "utf8");
  assert.equal(composer.match(/\bresumeTurn\(/g)?.length, 1, "one call site, inside the helper");
  assert.match(composer, /const resume = async \(pending: ResumeInput\) => \{\s*try \{\s*return await resumeTurn\(pending\);\s*\} catch \(cause\) \{\s*const next = dropRefusedCommand\(/);
  assert.equal(composer.match(/await resume\(/g)?.length, 3, "the stored command, the recovered retry and the turn's buttons");
});
