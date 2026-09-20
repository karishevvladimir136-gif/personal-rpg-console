import test from "node:test";
import assert from "node:assert/strict";
import {
  resolveWorldLogic,
  parseWorldLogicProposal,
  worldLogicContext,
  validateWorldLogicSettlement,
} from "../src/lib/rulesets/world-logic.ts";
import { LEGACY_RULESET_REF } from "../src/lib/rulesets/profiles.ts";
import { fixture, proposal, id } from "./wave2-logic-fixtures.mjs";
import { bind, evidence } from "./wave1-world-fixtures.mjs";

test("World Logic resolves a literal free-text action without legacy configuration or HP/dice", () => {
  const input = fixture(),
    before = structuredClone(input);
  const result = resolveWorldLogic(input, proposal(input));
  assert.equal(result.status, "staged");
  assert.deepEqual(result.resolution.changes, []);
  assert.equal(result.resolution.configuration, null);
  assert.equal(result.settlement.events[0].kind, "world.logic.resolved");
  assert.equal(result.settlement.events[0].payload.input, input.input.input);
  assert.deepEqual(result.settlement.nextWorld, input.snapshot.world);
  assert.deepEqual(input, before);
  assert.deepEqual(resolveWorldLogic(input, proposal(input)), result);
  assert.deepEqual(
    validateWorldLogicSettlement(input, result.proposal, result.settlement),
    result,
  );
});

test("World Logic stages travel only to an existing known location with exact current revisions", () => {
  const input = fixture();
  input.input.input = "I walk into the courtyard.";
  const result = resolveWorldLogic(
    input,
    proposal(input, {
      action: "move",
      capabilityRefs: ["walking"],
      destinationId: id("destination"),
      elapsedMinutes: 5,
      publicText: "You reach the courtyard.",
    }),
  );
  assert.equal(result.status, "staged");
  assert.equal(result.settlement.throughWorldMinutes, 5);
  assert.deepEqual(
    result.resolution.changes.map((c) => c.family),
    ["public_state", "locations"],
  );
  assert.equal(
    result.resolution.changes[0].values.current_location_id,
    id("destination"),
  );
  assert.equal(result.resolution.changes[1].values.status, "visited");
  assert.equal(
    result.settlement.nextWorld.actors[0].locationId,
    id("destination"),
  );
  assert.equal(result.settlement.nextWorld.actors[0].revision, 2);
  assert.deepEqual(
    result.settlement.nextWorld.actors[1],
    input.snapshot.world.actors[1],
  );
  assert.deepEqual(input.snapshot.world.actors[0].locationId, id("location"));
});

test("World Logic supports player entity identity before a WorldActor is registered", () => {
  const input = fixture();
  input.snapshot.world.actors = [];
  const result = resolveWorldLogic(
    input,
    proposal(input, { capabilityRefs: [] }),
  );
  assert.equal(result.status, "staged");
  assert.deepEqual(result.settlement.events[0].actorIds, []);
  assert.equal(result.settlement.events[0].payload.actorId, id("player"));
  assert.deepEqual(result.settlement.nextWorld, input.snapshot.world);
});

test("explicit uncertainty pauses without narrative, effects, time or partial settlement", () => {
  for (const uncertainty of [
    "missing_evidence",
    "contradiction",
    "unsupported",
  ]) {
    const input = fixture();
    const result = resolveWorldLogic(
      input,
      proposal(input, { uncertainty, elapsedMinutes: 0 }),
    );
    assert.deepEqual(result, {
      status: "paused",
      reason: uncertainty === "unsupported" ? "unsupported" : "uncertainty",
    });
    assert.throws(() =>
      resolveWorldLogic(
        input,
        proposal(input, { uncertainty, elapsedMinutes: 1 }),
      ),
    );
  }
});

test("arbitrary patches, invented capabilities, invalid references and extra dice fail closed", () => {
  const input = fixture();
  for (const extra of [
    { hp: 0 },
    { checks: [{ total: 20 }] },
    { privateText: "secret" },
    { nextWorld: {} },
    { capabilityRefs: ["reality-rewrite"] },
    { circumstanceRefs: ["future-source"] },
    { evidenceIndexes: [0] },
    { actorId: id("enemy") },
    { actorId: id("foreign") },
    { input: "I attack instead." },
    { elapsedMinutes: 61 },
    { elapsedMinutes: -1 },
    { action: "move", destinationId: id("unknown") },
    { action: "observe", destinationId: id("destination") },
    { action: "wait", elapsedMinutes: 0 },
    { circumstanceRefs: [] },
  ])
    assert.throws(
      () => resolveWorldLogic(input, proposal(input, extra)),
      JSON.stringify(extra),
    );
  assert.throws(() =>
    parseWorldLogicProposal({
      ...proposal(input),
      capabilityRefs: ["walking", "walking"],
    }),
  );
});

test("a stale or unfenced proposal cannot execute on another revision, branch, owner or input", () => {
  for (const mutate of [
    (i) => {
      i.command.timeline.epoch++;
    },
    (i) => {
      i.command.expectedHeadId = id("other-head");
    },
    (i) => {
      i.source.ownerId = id("other-owner");
    },
    (i) => {
      i.input.expectedRevision++;
    },
    (i) => {
      delete i.input.timeline;
    },
    (i) => {
      i.snapshot.ruleset = { ...LEGACY_RULESET_REF };
    },
    (i) => {
      i.input.mode = "feedback";
    },
    (i) => {
      i.source.snapshot.sessions[0].status = "closed";
    },
    (i) => {
      i.snapshot.world = null;
    },
  ]) {
    const input = fixture();
    mutate(input);
    assert.throws(() => resolveWorldLogic(input, proposal(input)));
  }
  const input = fixture(),
    result = resolveWorldLogic(input, proposal(input));
  result.settlement.events[0].text = "Forged state";
  assert.throws(() =>
    validateWorldLogicSettlement(input, proposal(input), result.settlement),
  );
});

test("action projection excludes private, source-only and future evidence and hidden actor capabilities", () => {
  const input = fixture();
  bind(input);
  input.source.privateState = { private: "PRIVATE_SECRET_MARKER" };
  input.snapshot.world.actors[1].capabilities = ["HIDDEN_CAPABILITY_MARKER"];
  input.snapshot.world.actors[0].knowledge = [
    evidence({ locator: { kind: "text", value: "PRIVATE_EVIDENCE_MARKER" } }),
    evidence({
      visibility: "public",
      knowledge: "source",
      locator: { kind: "text", value: "SOURCE_ONLY_MARKER" },
    }),
    evidence({
      visibility: "public",
      knowledge: "future_source",
      locator: { kind: "text", value: "FUTURE_EVIDENCE_MARKER" },
    }),
    evidence({
      visibility: "public",
      knowledge: "character",
      locator: { kind: "text", value: "CURRENT_KNOWN_LOCATOR" },
    }),
  ];
  const context = worldLogicContext(input),
    serialized = JSON.stringify(context);
  assert.equal(context.actors[0].evidence.length, 1);
  for (const marker of [
    "PRIVATE_SECRET_MARKER",
    "HIDDEN_CAPABILITY_MARKER",
    "PRIVATE_EVIDENCE_MARKER",
    "SOURCE_ONLY_MARKER",
    "FUTURE_EVIDENCE_MARKER",
  ])
    assert.equal(serialized.includes(marker), false);
  const result = resolveWorldLogic(
    input,
    proposal(input, { evidenceIndexes: [0] }),
  );
  assert.equal(result.settlement.events[0].evidence[0].knowledge, "character");
  assert.equal(JSON.stringify(result).includes("FUTURE_EVIDENCE_MARKER"), true); // Internal nextWorld preserves authoritative history, never public DTO.
  assert.equal(JSON.stringify(result.publicEvents).includes("MARKER"), false);
});

test("active legacy encounters prevent movement without spending or converting mechanics", () => {
  const input = fixture();
  input.source.runtime.encounters.push({ status: "active" });
  assert.deepEqual(
    resolveWorldLogic(
      input,
      proposal(input, { action: "move", destinationId: id("destination") }),
    ),
    { status: "paused", reason: "unsupported" },
  );
});
