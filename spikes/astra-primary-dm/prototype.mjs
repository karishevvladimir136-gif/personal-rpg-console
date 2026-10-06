import { createHash, randomInt } from "node:crypto";
import { readFile, rename, writeFile } from "node:fs/promises";
import { recordServerRoll, stableGameplayId } from "../../src/lib/gameplay/dice.ts";

const clone = structuredClone;
const digest = (value) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const keysAre = (value, allowed, required = []) => value && typeof value === "object" && !Array.isArray(value) &&
  Object.keys(value).every((key) => allowed.includes(key)) && required.every((key) => Object.hasOwn(value, key));
const boundedText = (value, max) => typeof value === "string" && value.length <= max;
function guard(condition, code = "validation") {
  if (!condition) throw Object.assign(new Error(code), { code });
}

/** Disposable file journal: demonstrates lifecycle and restart, not production Postgres concurrency. */
export class ShadowJournal {
  constructor(path, data) { this.path = path; this.data = data; }
  static async open(path, frozenCampaign) {
    try { return new ShadowJournal(path, JSON.parse(await readFile(path, "utf8"))); }
    catch (error) {
      if (error.code !== "ENOENT") throw error;
      const journal = new ShadowJournal(path, { campaign: clone(frozenCampaign), turns: {} });
      await journal.flush();
      return journal;
    }
  }
  async flush() {
    const temporary = `${this.path}.next`;
    await writeFile(temporary, JSON.stringify(this.data));
    await rename(temporary, this.path);
  }
  get(operationId) { return this.data.turns[operationId] ?? null; }
  async begin(input) {
    guard(keysAre(input, ["operationId", "campaignId", "timeline", "expectedRevision", "input"],
      ["operationId", "campaignId", "timeline", "expectedRevision", "input"]));
    const state = this.data.campaign;
    guard(input.campaignId === state.campaignId && JSON.stringify(input.timeline) === JSON.stringify(state.timeline), "conflict");
    guard(boundedText(input.input, 20000) && input.input.trim() && Number.isSafeInteger(input.expectedRevision), "validation");
    const prior = this.get(input.operationId);
    if (prior) {
      guard(JSON.stringify(prior.input) === JSON.stringify(input), "conflict");
      return prior;
    }
    guard(input.expectedRevision === state.revision, "conflict");
    const turn = { input: clone(input), status: "pending", retryable: true, failure: null,
      checkpoint: { sourceDigest: digest(state), packet: null, tools: [], final: null }, publicResult: null };
    this.data.turns[input.operationId] = turn;
    await this.flush(); // literal player text is durable before context or provider work
    return turn;
  }
  async pinPacket(turn, packet) {
    if (turn.checkpoint.packet) return turn.checkpoint.packet;
    turn.checkpoint.packet = clone(packet);
    turn.status = "generating";
    await this.flush();
    return turn.checkpoint.packet;
  }
  async recordTool(turn, call, random = randomInt) {
    guard(keysAre(call, ["callId", "kind", "actorId", "targetId", "dc", "itemId", "scope"], ["callId", "kind"]));
    guard(typeof call.callId === "string" && /^[a-z0-9-]{1,48}$/.test(call.callId));
    const previous = turn.checkpoint.tools.find((row) => row.call.callId === call.callId);
    if (previous) {
      guard(digest(previous.call) === digest(call), "conflict");
      return clone(previous.result);
    }
    guard(turn.checkpoint.tools.length < 8);
    const state = this.data.campaign;
    guard(turn.checkpoint.sourceDigest === digest(state), "conflict");
    let result;
    if (call.kind === "query") {
      guard(call.scope === "current-public" && !call.actorId && !call.targetId && !call.itemId && call.dc === undefined);
      result = { kind: "query", revision: state.revision, locationId: state.currentLocationId,
        actors: clone(state.actors), items: clone(state.items) };
    } else if (["skill", "attack", "save"].includes(call.kind)) {
      const actor = state.actors[call.actorId];
      guard(actor?.campaignId === turn.input.campaignId && Number.isInteger(call.dc) && call.dc >= 5 && call.dc <= 30);
      guard(call.targetId === null || call.targetId === undefined || state.actors[call.targetId]?.campaignId === turn.input.campaignId);
      const index = turn.checkpoint.tools.filter((row) => row.result.kind !== "query").length;
      const proposal = { index, actorId: actor.id, targetId: call.targetId ?? null,
        kind: call.kind, stat: call.kind === "attack" ? "attack" : call.kind === "save" ? "save" : "skill",
        dc: call.dc, dcPublic: false, visibility: actor.id === Object.keys(state.actors)[0] ? "player" : "private",
        important: true, uncertainty: "meaningful", advantage: "normal" };
      const recorded = recordServerRoll(turn.input.operationId, proposal, actor.stats[proposal.stat], 1, random);
      result = { kind: call.kind, ...recorded, callId: call.callId };
    } else if (call.kind === "damage") {
      const actor = state.actors[call.actorId], target = state.actors[call.targetId], item = state.items[call.itemId];
      guard(actor?.campaignId === turn.input.campaignId && target?.campaignId === turn.input.campaignId &&
        item?.campaignId === turn.input.campaignId && item.ownerId === actor.id && item.equipped && item.damageDice);
      guard(turn.checkpoint.tools.some((row) => row.result.kind === "attack" && row.result.actorId === actor.id &&
        row.result.targetId === target.id && row.result.success));
      const { count, sides } = item.damageDice;
      guard(Number.isInteger(count) && count >= 1 && count <= 4 && Number.isInteger(sides) && sides >= 2 && sides <= 12);
      const dice = Array.from({ length: count }, () => random(1, sides + 1));
      guard(dice.every((die) => Number.isInteger(die) && die >= 1 && die <= sides));
      result = { kind: "damage", callId: call.callId, id: stableGameplayId(turn.input.operationId, `tool:${call.callId}`),
        actorId: actor.id, targetId: target.id, itemId: item.id, dice, total: dice.reduce((a, b) => a + b, 0) };
    } else guard(false);
    turn.checkpoint.tools.push({ call: clone(call), result: clone(result) });
    await this.flush(); // a provider timeout after this point must not reroll
    return clone(result);
  }
  async stageFinal(turn, final) {
    if (turn.checkpoint.final) guard(digest(turn.checkpoint.final) === digest(final), "conflict");
    else { turn.checkpoint.final = clone(final); await this.flush(); }
  }
  async commit(turn) {
    if (turn.status === "committed") return clone(turn.publicResult);
    const state = clone(this.data.campaign);
    const final = validateFinal(state, turn, turn.checkpoint.final);
    for (const change of final.publicChanges) {
      if (change.family === "location") state.currentLocationId = change.id;
      else {
        const record = state[change.family][change.id];
        Object.assign(record, change.values);
        if (change.family === "actors" && change.values.resources)
          record.resources = { ...this.data.campaign.actors[change.id].resources, ...change.values.resources };
        record.revision++;
      }
    }
    for (const change of final.privateChanges) state.privateFacts[change.key] = change.value;
    state.worldMinutes = final.worldMinutes;
    state.revision++;
    const publicResult = { operationId: turn.input.operationId, campaignId: state.campaignId,
      status: "committed", committedRevision: state.revision, narration: final.narration,
      visualDescription: final.visualDescription, clarification: final.clarification,
      changes: clone(final.publicChanges), publicMemory: final.memoryCandidates.filter((row) => row.visibility === "public"),
      checks: turn.checkpoint.tools.map((row) => row.result).filter((row) => row.visibility === "player")
        .map((row) => ({ id: row.id, kind: row.kind, actorId: row.actorId,
          dice: row.dice, total: row.total, success: row.success })) };
    this.data.campaign = state;
    turn.status = "committed";
    turn.publicResult = publicResult;
    await this.flush(); // state and result share one disposable journal rename
    return clone(publicResult);
  }
  async fail(turn, error) {
    turn.status = "failed";
    turn.failure = error.code ?? "provider";
    turn.retryable = turn.failure !== "validation" && turn.failure !== "conflict";
    await this.flush();
  }
  readPublic(operationId) {
    const turn = this.get(operationId);
    if (!turn) return null;
    if (turn.publicResult) return clone(turn.publicResult);
    return { operationId, status: turn.status, input: turn.input.input,
      failure: turn.failure, canRetry: turn.retryable };
  }
}

/** Numeric/identity/replay validation only. Fictional plausibility remains a DM/evaluation question. */
export function validateFinal(state, turn, final) {
  guard(keysAre(final, ["schemaVersion", "operationId", "campaignId", "expectedRevision", "input",
    "narration", "visualDescription", "publicChanges", "privateChanges", "memoryCandidates", "rollRefs", "worldMinutes", "clarification"],
  ["schemaVersion", "operationId", "campaignId", "expectedRevision", "input", "narration", "visualDescription",
    "publicChanges", "privateChanges", "memoryCandidates", "rollRefs", "worldMinutes", "clarification"]));
  guard(final.schemaVersion === 1 && final.operationId === turn.input.operationId &&
    final.campaignId === state.campaignId && final.expectedRevision === state.revision &&
    final.input === turn.input.input && turn.checkpoint.sourceDigest === digest(state), "conflict");
  guard(boundedText(final.narration, 20000) && boundedText(final.visualDescription, 4000) &&
    (final.clarification === null || boundedText(final.clarification, 1000)) &&
    Array.isArray(final.publicChanges) && final.publicChanges.length <= 12 &&
    Array.isArray(final.privateChanges) && final.privateChanges.length <= 6 &&
    Array.isArray(final.memoryCandidates) && final.memoryCandidates.length <= 8 &&
    Array.isArray(final.rollRefs) && final.rollRefs.length <= 8 &&
    Number.isSafeInteger(final.worldMinutes) && final.worldMinutes >= state.worldMinutes &&
    final.worldMinutes <= state.worldMinutes + 1440);
  guard(!final.clarification || (!final.publicChanges.length && !final.privateChanges.length));
  const used = new Set(), receipts = new Map(turn.checkpoint.tools.map((row) => [row.result.id, row.result]));
  for (const ref of final.rollRefs) {
    guard(typeof ref === "string" && receipts.has(ref) && !used.has(ref));
    used.add(ref);
  }
  const changed = new Set(), damageUsed = new Set();
  for (const change of final.publicChanges) {
    guard(keysAre(change, ["family", "id", "expectedRevision", "values"], ["family", "id", "expectedRevision", "values"]));
    guard(["actors", "items", "location"].includes(change.family) && typeof change.id === "string" &&
      !changed.has(`${change.family}:${change.id}`));
    changed.add(`${change.family}:${change.id}`);
    if (change.family === "location") {
      guard(change.expectedRevision === null && keysAre(change.values, [], []) &&
        state.locations[change.id]?.campaignId === state.campaignId && final.worldMinutes > state.worldMinutes);
      continue;
    }
    const prior = state[change.family][change.id];
    guard(prior?.campaignId === state.campaignId && change.expectedRevision === prior.revision);
    if (change.family === "items") {
      guard(keysAre(change.values, ["quantity"], ["quantity"]) &&
        Number.isSafeInteger(change.values.quantity) && change.values.quantity >= 0 &&
        change.values.quantity <= prior.quantity);
      continue;
    }
    guard(keysAre(change.values, ["hp", "resources", "position"]) && Object.keys(change.values).length > 0);
    if (change.values.hp !== undefined) {
      guard(Number.isSafeInteger(change.values.hp) && change.values.hp >= 0 && change.values.hp <= prior.maxHp);
      if (change.values.hp < prior.hp) {
        const damage = [...used].map((id) => receipts.get(id)).find((row) => row.kind === "damage" &&
          row.targetId === prior.id && !damageUsed.has(row.id) && prior.hp - change.values.hp === Math.min(prior.hp, row.total));
        guard(damage);
        damageUsed.add(damage.id);
      }
    }
    if (change.values.resources !== undefined) {
      guard(keysAre(change.values.resources, Object.keys(prior.resources)) &&
        Object.entries(change.values.resources).every(([key, value]) =>
          Number.isSafeInteger(value) && value >= 0 && value <= prior.resources[key]));
    }
    if (change.values.position !== undefined) {
      guard(["nearby", "far", "cover"].includes(change.values.position));
      if (change.values.position !== prior.position)
        guard(change.values.resources?.move === prior.resources.move - 1);
    }
  }
  for (const change of final.privateChanges)
    guard(keysAre(change, ["key", "value"], ["key", "value"]) && /^[a-z][a-z0-9_-]{0,47}$/.test(change.key) &&
      boundedText(change.value, 1000));
  for (const candidate of final.memoryCandidates)
    guard(keysAre(candidate, ["visibility", "text"], ["visibility", "text"]) &&
      ["public", "private"].includes(candidate.visibility) && boundedText(candidate.text, 1000));
  // Explicit private-output separation catches direct leakage; paraphrases need later quality/security evaluation.
  const publicText = [final.narration, final.visualDescription, final.clarification ?? "",
    ...final.memoryCandidates.filter((row) => row.visibility === "public").map((row) => row.text)].join("\n");
  guard(Object.values(state.privateFacts).every((secret) => !publicText.includes(secret)) &&
    final.privateChanges.every((row) => !publicText.includes(row.value)));
  return final;
}

/** A single injected primary DM handles both initial interpretation and tool-result continuation. */
export async function runShadowTurn({ journal, input, composeContext, dm, random = randomInt, afterToolRecorded }) {
  const turn = await journal.begin(input);
  if (turn.status === "committed") return journal.readPublic(input.operationId);
  guard(turn.retryable, "conflict");
  try {
    if (!turn.checkpoint.packet) await journal.pinPacket(turn, await composeContext(clone(journal.data.campaign), input));
    if (turn.checkpoint.final) return await journal.commit(turn);
    for (let step = 0; step < 8; step++) {
      const output = await dm.next({ packet: clone(turn.checkpoint.packet),
        transcript: clone(turn.checkpoint.tools), input: clone(input) });
      guard(keysAre(output, ["type", "call", "proposal"], ["type"]));
      if (output.type === "final") {
        await journal.stageFinal(turn, output.proposal);
        return await journal.commit(turn);
      }
      guard(output.type === "tool" && output.call);
      const result = await journal.recordTool(turn, output.call, random);
      await afterToolRecorded?.(result);
    }
    guard(false);
  } catch (error) {
    await journal.fail(turn, error);
    throw error;
  }
}
