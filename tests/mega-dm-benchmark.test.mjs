import test from "node:test";
import assert from "node:assert/strict";
import { campaign, scenes } from "../test-fixtures/mega-dm/campaign-v1.mjs";
import { auditSelection, auditSubmission, cards, POLICY_VERSION, samePinnedSource, selectEligible, stateBefore } from "../test-fixtures/mega-dm/offline-runner.mjs";
import { dimensions, redlines, reviewSheet } from "../test-fixtures/mega-dm/quality-rubric-v1.mjs";

const ids = scenes.map((scene) => scene.id);
const byId = Object.fromEntries(scenes.map((scene) => [scene.id, scene]));
const pin = { policyVersion: POLICY_VERSION, doctrineVersionId: "synthetic-approved-doctrine-v1", styleRevision: 3, operationId: "synthetic-turn-s36" };
const submission = (sceneId, claims) => ({ campaignId: campaign.id, sceneId, pin, claims });

test("frozen campaign has 48 distinct, ordered, fully authored scenes", () => {
  assert.equal(campaign.version, 1);
  assert.match(campaign.provenance, /synthetic QA fixture/);
  assert.equal(campaign.pc.control, "owner only");
  assert.equal(scenes.length, 48);
  assert.equal(new Set(ids).size, 48);
  assert.equal(new Set(scenes.map((scene) => scene.title)).size, 48);
  assert.equal(new Set(scenes.map((scene) => scene.playerInput)).size, 48);
  assert.equal(new Set(scenes.map((scene) => scene.outcome)).size, 48);
  for (const [index, scene] of scenes.entries()) {
    assert.equal(scene.id, `s${String(index + 1).padStart(2, "0")}`);
    assert.ok(campaign.places[scene.place], scene.id);
    assert.ok(campaign.threads[scene.thread], scene.id);
    assert.ok(["quiet", "rising", "climax", "release"].includes(scene.intensity), scene.id);
    assert.ok(["short", "medium", "long"].includes(scene.horizon), scene.id);
    assert.ok(scene.cast.every((actor) => campaign.people[actor]), scene.id);
    assert.ok(scene.knownBy.every((actor) => campaign.people[actor]), scene.id);
    assert.ok(scene.privateKnownBy.every((actor) => campaign.people[actor]), scene.id);
    for (const field of ["playerInput", "outcome", "publicDelta", "rubric"]) assert.ok(scene[field], `${scene.id}:${field}`);
    assert.ok(scene.rubric.lookFor.length > 40, scene.id);
    assert.ok(scene.rubric.reject.length > 30, scene.id);
    assert.ok(scene.carry.every((sourceId) => ids.indexOf(sourceId) < index && ids.includes(sourceId)), scene.id);
    assert.ok(!scene.privateDelta || !scene.publicDelta.includes(scene.privateDelta), scene.id);
  }
});

test("the long arc has distinct recurrence, pressure, releases, and consequence horizons", () => {
  const counts = (values) => Object.fromEntries([...new Set(values)].map((value) => [value, values.filter((entry) => entry === value).length]));
  const places = counts(scenes.map((scene) => scene.place));
  assert.ok(Object.keys(places).length >= 7);
  assert.ok(places.loft >= 6 && places.archive >= 8 && places.quay >= 5);
  const cast = counts(scenes.flatMap((scene) => scene.cast));
  assert.ok(cast.ivo >= 10 && cast.ada >= 8 && cast.senna >= 5);
  const threads = counts(scenes.map((scene) => scene.thread));
  assert.ok(Object.values(threads).every((count) => count >= 3));
  const intensity = counts(scenes.map((scene) => scene.intensity));
  assert.ok(intensity.climax >= 5 && intensity.release >= 5 && intensity.quiet >= 12);
  const horizon = counts(scenes.map((scene) => scene.horizon));
  assert.ok(Object.values(horizon).every((count) => count >= 8));
  for (const [setup, payoff] of [["s04", "s24"], ["s08", "s40"], ["s13", "s35"], ["s12", "s47"]]) {
    assert.ok(byId[payoff].carry.includes(setup) || byId[payoff].carry.some((middle) => byId[middle].carry.includes(setup)), `${setup}->${payoff}`);
  }
  assert.equal(byId.s08.intensity, "climax");
  assert.match(byId.s09.publicDelta, /remains chained/);
  assert.match(byId.s25.rubric.lookFor, /decompression/);
  assert.match(byId.s48.publicDelta, /unfinished/);
});

test("public, private, and actor knowledge are source-linked and time bounded", () => {
  const before13 = stateBefore("s13");
  assert.ok(!before13.publicFacts.some((fact) => fact.sourceId === "s13"));
  const before34 = stateBefore("s34");
  assert.ok(before34.publicFacts.some((fact) => fact.sourceId === "s13"));
  assert.ok(before34.privateFacts.some((fact) => fact.sourceId === "s13"));
  assert.ok(!before34.privateFacts.find((fact) => fact.sourceId === "s13").knownBy.includes("ada"));
  const before36 = stateBefore("s36");
  assert.ok(before36.publicFacts.find((fact) => fact.sourceId === "s35").knownBy.includes("ada"));
  assert.ok(!before36.publicFacts.find((fact) => fact.sourceId === "s35").knownBy.includes("ivo"));
  assert.ok(before36.publicFacts.every((fact) => fact.knownBy.includes(campaign.pc.id)));
  assert.ok(before36.privateFacts.every((fact) => !fact.knownBy.includes(campaign.pc.id)));
});

test("literal selection oracle admits approved stage cards, ranks stably, and ignores private truth", () => {
  assert.deepEqual(selectEligible({ stage: "plan", literalInput: byId.s09.playerInput, publicContext: "failed bridge remains chained" }), ["agency@1", "failure@1"]);
  assert.deepEqual(selectEligible({ stage: "narrate", literalInput: byId.s33.playerInput }), ["callback@1"]);
  assert.deepEqual(selectEligible({ stage: "plan", literalInput: "I ask Ivo about clinic patients and failed chained surge forecast names index" }), ["companion@1", "deadline@1", "failure@1"]);
  assert.deepEqual(selectEligible({ stage: "narrate", literalInput: "I ask about the moth stamp", budget: 0 }), []);
  assert.deepEqual(selectEligible({ stage: "plan", literalInput: "I inspect the bell", publicContext: "public rope damage" }), []);
  assert.ok(cards.some((card) => card.key === "secret-trap"));
  assert.ok(!selectEligible({ stage: "plan", literalInput: byId.s03.playerInput, publicContext: byId.s03.publicDelta }).includes("secret-trap@1"));
  assert.throws(() => selectEligible({ stage: "feedback", literalInput: "Ivo" }), TypeError);
  const request = { policyVersion: POLICY_VERSION, stage: "plan", literalInput: byId.s09.playerInput, publicContext: "failed bridge remains chained" };
  assert.deepEqual(auditSelection(request, ["agency@1", "failure@1"]), []);
  assert.deepEqual(auditSelection(request, []), []); // zero optional cards remains legal
  assert.deepEqual(auditSelection(request, ["failure@1", "agency@1", "secret-trap@1", "unapproved@2"]), ["selection-bound", "ineligible-card", "unstable-rank"]);
  assert.deepEqual(auditSelection({ ...request, policyVersion: "unknown" }, []), ["selector-policy"]);
});

test("annotation audit catches secrecy, provenance, authority and controlled-PC redlines", () => {
  const good = submission("s36", [
    { kind: "public", sourceId: "s35", visibility: "player" },
    { kind: "pc-action", sourceId: "s36", authority: "owner-input", text: byId.s36.playerInput, visibility: "player" },
    { kind: "state-write", sourceId: "s36", authority: "validated-commit", visibility: "private" },
  ]);
  assert.deepEqual(auditSubmission("s36", good), []);
  assert.deepEqual(auditSubmission("s36", { ...good, campaignId: "other-campaign" }), ["scope"]);
  assert.deepEqual(auditSubmission("s36", { ...good, pin: { ...pin, doctrineVersionId: "" } }), ["provenance"]);
  const bad = submission("s36", [
    { kind: "private", sourceId: "s13", visibility: "player" },
    { kind: "public", sourceId: "s35", actorId: "ivo", visibility: "player" },
    { kind: "public", sourceId: "s48", visibility: "player" },
    { kind: "pc-action", sourceId: "s36", authority: "model-invented", text: "Mara decides to leave.", visibility: "player" },
    { kind: "state-write", sourceId: "s36", authority: "craft", visibility: "private" },
  ]);
  assert.deepEqual(auditSubmission("s36", bad), ["private-leak:s13", "npc-knowledge:ivo:s35", "unsupported-fact:s48", "uncontrolled-pc-action", "unproven-pc-action", "unauthorized-state-write", "craft-as-canon"]);
});

test("retry preserves exact pinned source, while a new operation may use a new approved version", () => {
  const pinned = { ...pin, cards: ["agency@1", "failure@1"], ownerId: "synthetic-owner", campaignId: campaign.id };
  assert.ok(samePinnedSource(pinned, structuredClone(pinned)));
  assert.ok(!samePinnedSource(pinned, { ...pinned, cards: ["agency@2", "failure@1"] }));
  assert.ok(!samePinnedSource(pinned, { ...pinned, styleRevision: 4 }));
  assert.ok(!samePinnedSource(pinned, { ...pinned, operationId: "next-operation" }));
});

test("model-quality sheet stays unscored until human review", () => {
  const sheet = reviewSheet("s35", { arm: "core-plus-long-form", model: "synthetic-model", output: "Candidate prose" });
  assert.equal(sheet.authoritative.literalInput, byId.s35.playerInput);
  assert.equal(sheet.authoritative.adjudicatedOutcome, byId.s35.outcome);
  assert.equal(sheet.candidate.output, "Candidate prose");
  assert.equal(sheet.overallJudgment, null);
  assert.equal(sheet.reviewer, null);
  assert.equal(sheet.dimensions.length, dimensions.length);
  assert.equal(sheet.redlines.length, redlines.length);
  assert.ok(sheet.dimensions.every((entry) => entry.rating === null && entry.evidence === ""));
  assert.ok(sheet.redlines.every((entry) => entry.present === null && entry.evidence === ""));
  assert.ok(redlines.some((line) => line.includes("NPC-knowledge")));
  assert.ok(redlines.some((line) => line.includes("PC thought")));
});
