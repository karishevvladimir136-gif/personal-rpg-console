import test from "node:test";
import assert from "node:assert/strict";
import {
  parseFrameSafetyVerdict,
  illustrationFramePrompt,
  FRAME_REVIEW_CATEGORIES,
} from "../src/lib/visual-frame/illustration-review.ts";
const verdict = (status, category) => ({
  schemaVersion: 2,
  status,
  reasons: category
    ? [{ category, detail: "Observable public illustration deviation." }]
    : [],
});
test("bounded review statuses distinguish safe draft, minor warning, material rejection and never express acceptance", () => {
  assert.ok(parseFrameSafetyVerdict(verdict("safe_to_review")));
  assert.ok(
    parseFrameSafetyVerdict(
      verdict("review_warning", "illustrative_variation"),
    ),
  );
  assert.ok(
    parseFrameSafetyVerdict(verdict("review_warning", "uncertain_quality")),
  );
  for (const category of FRAME_REVIEW_CATEGORIES.filter(
    (c) => !["illustrative_variation", "uncertain_quality"].includes(c),
  )) {
    assert.ok(parseFrameSafetyVerdict(verdict("hard_reject", category)));
    assert.equal(
      parseFrameSafetyVerdict(verdict("review_warning", category)),
      null,
    );
  }
  for (const v of [
    verdict("accepted"),
    verdict("safe_to_review", "identity"),
    verdict("hard_reject"),
    verdict("hard_reject", "illustrative_variation"),
    { ...verdict("safe_to_review"), gameplayPatch: {} },
    verdict("review_warning", "unknown"),
  ])
    assert.equal(parseFrameSafetyVerdict(v), null);
});
test("public draft contract keeps meaningful opening/action/subject limits while allowing incidental filler; ids and private fields stay absent", () => {
  const ref = {
    subject: { kind: "entity", id: "PRIVATE_ID_CANARY" },
    label: "Ari",
    appearance: "Public hair",
    outfit: "Public coat",
    guidance: "Public style",
    campaign_id: "OTHER_CAMPAIGN_CANARY",
    privatePlans: "DM_PRIVATE_CANARY",
  };
  const text = illustrationFramePrompt(
    {
      title: "Courtyard",
      body: "Ari stands beside a bench; hands empty. A plain arch is visible.",
    },
    [ref],
    "wide",
  );
  assert.match(text, /unspecified view.*door.*window.*arch.*gate/);
  assert.match(text, /essential action/);
  assert.match(text, /absent subject or item/);
  assert.match(text, /Ordinary vegetation/);
  assert.match(text, /Owner acceptance is required separately/);
  assert.ok(text.includes("Small grip/pose variations"));
  assert.doesNotMatch(
    text,
    /PRIVATE_ID_CANARY|OTHER_CAMPAIGN_CANARY|DM_PRIVATE_CANARY/,
  );
});
test("malformed, verbose, private-id or control-character QA detail fails closed", () => {
  for (const detail of [
    "",
    "x".repeat(241),
    "private 11111111-1111-4111-8111-111111111111",
    "line\nline",
  ])
    assert.equal(
      parseFrameSafetyVerdict({
        ...verdict("hard_reject", "identity"),
        reasons: [{ category: "identity", detail }],
      }),
      null,
    );
});
