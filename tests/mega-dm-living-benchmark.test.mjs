import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { livingCast, livingHistory, livingProbes, cognitiveProbes, afterglowProbes, LIVING_FIXTURE_DIGEST } from "../test-fixtures/mega-dm/living-characters-v1.mjs";
import { livingQualityRubric, afterglowOwnerReview, blindFingerprintArtifact, predictCharacterArtifact } from "../test-fixtures/mega-dm/living-review-v1.mjs";

const FROZEN_DIGEST = "ed81a09089193e9e6f38170809f276281866aaeee5a5ff9a020eb04536fbe2f8";

test("48-scene synthetic cast and 20 living-character probes are frozen and source-linked", () => {
  assert.equal(LIVING_FIXTURE_DIGEST, FROZEN_DIGEST);
  assert.equal(Object.keys(livingCast).length, 5);
  assert.equal(livingHistory.length, 48);
  assert.equal(livingProbes.length, 20);
  assert.equal(new Set(livingHistory.map((scene) => scene.id)).size, 48);
  assert.equal(new Set(livingProbes.map((probe) => probe.id)).size, 20);
  const ids = new Set(livingHistory.map((scene) => scene.id));
  for (const [index, scene] of livingHistory.entries()) {
    assert.equal(scene.id, `lc${String(index + 1).padStart(2, "0")}`);
    assert.ok(scene.cast.every((actor) => actor in livingCast));
    assert.ok(scene.knownBy.every((actor) => scene.cast.includes(actor)));
    assert.match(scene.provenance, /synthetic/);
  }
  for (const probe of livingProbes) {
    assert.ok(probe.actor in livingCast);
    assert.ok(probe.sourceIds.every((id) => ids.has(id)));
    assert.ok(probe.criterion.length > 20);
  }
  const body = JSON.stringify({ livingCast, livingHistory, livingProbes, cognitiveProbes, afterglowProbes });
  assert.equal(createHash("sha256").update(body).digest("hex"), FROZEN_DIGEST);
  assert.doesNotMatch(body, /James|Jinn|Baldur|private owner/i);
});

test("cognitive and afterglow benchmarks cover consequence, learning, rhythm and manipulation redlines", () => {
  assert.equal(cognitiveProbes.length, 13);
  assert.equal(afterglowProbes.length, 8);
  for (const id of ["mystery-learning-progress", "bounded-social-echo", "session-landing", "decompression"])
    assert.ok(cognitiveProbes.includes(id));
  for (const id of ["character-shaped-support", "tragedy-integrity", "owner-inactivity"])
    assert.ok(afterglowProbes.includes(id));
  assert.ok(livingQualityRubric.hardFailures.some((entry) => entry.includes("mind reading")));
  assert.ok(livingQualityRubric.hardFailures.some((entry) => entry.includes("inactivity guilt")));
  assert.deepEqual(afterglowOwnerReview.guardrails, ["Depletion", "Manipulation", "Did this feel like therapy?"]);
  assert.equal(afterglowOwnerReview.qualities.length, 7);
  assert.match(afterglowOwnerReview.notes, /Do not average/);
});

test("blind fingerprint and predict-character artifacts are human review, not automatic truth", () => {
  const blind = blindFingerprintArtifact();
  assert.equal(blind.fixtureDigest, FROZEN_DIGEST);
  assert.ok(blind.cases.every((row) => row.output === null && row.ownerObservation === null));
  assert.ok(blind.cases.every((row) => /^[A-D]$/.test(row.anonymousActor)));
  const prediction = predictCharacterArtifact();
  assert.equal(prediction.characterCards.length, 4);
  assert.equal(prediction.prompts.length, 4);
  assert.ok(prediction.characterCards.every((row) => row.establishedHistory.length >= 5));
});
