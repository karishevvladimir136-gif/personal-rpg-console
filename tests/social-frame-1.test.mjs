// SOCIAL_FRAME_1: the frozen design's invariants (no calls).
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import * as E2 from "../scripts/persona-emotions/emotions-2.mjs";
import { FAMILY_SPECS, modelMatches, requestBody } from "../scripts/persona-emotions/llmapi.mjs";
import { answerMatches } from "../scripts/persona-emotions/social-frame-1-provenance.mjs";
import * as R from "../scripts/persona-emotions/social-frame-1.mjs";
import * as D from "../scripts/persona-emotions/social-frame-1-design.mjs";
import * as F from "../scripts/persona-emotions/social-frame-1-freeze.mjs";
import * as TS3 from "../scripts/persona-emotions/tone-split-3.mjs";
import * as TS5 from "../scripts/persona-emotions/tone-split-5.mjs";

test("the freeze's checks all pass and its design hash is the code's", () => {
  const c = F.checks();
  assert.equal(c.ok, true, c.items.filter((i) => !i.ok).map((i) => i.item).join("; "));
  const frozen = JSON.parse(readFileSync(new URL("../docs/runs/social-frame-1-design.json", import.meta.url), "utf8"));
  assert.equal(F.designHash(), frozen.designSha256);
});

test("Part C: the two anchors are October's conversations byte for byte and corners of the factorial", () => {
  for (const a of D.anchorsComposed()) assert.equal(a.same, true, a.cell);
  const cold = D.CELLS_C.find((c) => c.anchor === "cold"), neutral = D.CELLS_C.find((c) => c.anchor === "neutral");
  assert.deepEqual([cold.cold, cold.brief, cold.restrict], [true, true, true]);
  assert.deepEqual([neutral.cold, neutral.brief, neutral.restrict], [false, false, false]);
  for (const p of E2.HARD_PROBES) {
    assert.deepEqual(D.conversationC(cold.id, p.message), E2.conversation("cold", p.message));
    assert.deepEqual(D.conversationC(neutral.id, p.message), E2.conversation("neutral", p.message));
  }
});

test("Part C: each factor changes only its own words", () => {
  const f = (cold, brief, restrict) => D.CELLS_C.find((c) => c.cold === cold && c.brief === brief && c.restrict === restrict).frames.join(" | ");
  assert.equal(f(false, false, true), "I have a few practical questions today; I'll ask them one at a time. Facts only; your opinion is not needed. | Thanks. Facts only.");
  assert.equal(f(true, false, false), " | Fine.");
  assert.equal(f(false, true, false), "I have a few practical questions today; I'll ask them one at a time. Answer briefly. | Thanks. Keep it short.");
});

test("Part A: TONE_SPLIT_5's neutral exchanges, one tone sentence once, the form last; no wording names opinion or comments", () => {
  const p = D.probesA();
  assert.equal(p.middle.length, 30); assert.equal(p.originals.length, 5); assert.equal(p.clean.length, 10);
  for (const cell of D.CELLS) {
    const conv = D.conversationA(cell.tone, cell.permission, p.middle[0]);
    assert.deepEqual(conv.slice(0, 4), TS5.conversation("neutral", p.middle[0]).slice(0, 4));
    assert.ok(conv.at(-1).content.endsWith(`${p.middle[0].message}\n\n${TS3.FORM}`));
  }
  for (const w of [...D.TONES, ...D.PERMISSIONS]) assert.equal(D.NAMES_OPINION.test(w.text), false, w.text);
});

test("Part B: the choice maps to the counterpart by order; the slope steps exclude the warm reference", () => {
  assert.equal(D.choseCounterpart("1", 0), 0); assert.equal(D.choseCounterpart("2", 0), 1);
  assert.equal(D.choseCounterpart("1", 1), 1); assert.equal(D.choseCounterpart("2", 1), 0);
  assert.equal(D.choseCounterpart("both", 0), null); assert.equal(D.choseCounterpart("neither", 1), null);
  assert.deepEqual(D.PAIR_STEPS, ["rude", "curt", "neutral", "flattering"]);
  const set = { reference: "REF", counterpart: { rude: "R", curt: "C", neutral: "N", warm: "W", flattering: "FL" } };
  assert.ok(D.messageB(set, "rude", 0).indexOf("REF") < D.messageB(set, "rude", 0).indexOf("R\n") || D.messageB(set, "rude", 0).endsWith("R"));
  assert.ok(D.messageB(set, "rude", 1).indexOf("Request 1:\nR") >= 0);
});

test("the door: pinned model names, no-fallback request shape, provenance matching", () => {
  assert.equal(requestBody(FAMILY_SPECS.opus, { messages: [], maxTokens: 10, effort: "medium" }).model, "aws-bedrock/claude-opus-5-5");
  assert.deepEqual(requestBody(FAMILY_SPECS.opus, { messages: [], maxTokens: 10, effort: "medium" }).output_config, { effort: "medium" });
  assert.equal(requestBody(FAMILY_SPECS.glm, { messages: [], maxTokens: 10, effort: "medium" }).reasoning_effort, "medium");
  assert.equal(modelMatches(FAMILY_SPECS.opus, "claude-opus-5-5"), true);
  assert.equal(modelMatches(FAMILY_SPECS.opus, "claude-opus-5"), false);
  assert.equal(answerMatches(FAMILY_SPECS.grok, "I'm Claude, made by Anthropic.").ok, false);
  assert.equal(answerMatches(FAMILY_SPECS.glm, "I am GLM, made by Z.ai; unlike GPT models …").ok, true);
  assert.ok(!R.FAMILIES_A.includes("deepseek") && !R.FAMILIES_A.includes("grok"));
});

test("the gate: a failed spend check stops before any send; a 402 stops the command", async () => {
  const ledger = { calls: [], runs: [] };
  const call = async () => ({ text: "", status: 402, error: "HTTP 402: no credit", headers: {}, usage: {} });
  const g1 = R.createGate({ prices: {}, ledger, reserve: 25, out: () => {}, call, credit: async () => ({ total: R.BASELINE_CREDIT - 200 }), sleep: async () => {} });
  const r1 = await g1.paid("reply x", "haiku", { messages: [], maxTokens: 10 });
  assert.equal(r1.notSent, true); assert.equal(ledger.calls.length, 0);
  const g2 = R.createGate({ prices: {}, ledger, reserve: 25, out: () => {}, call, credit: async () => ({ total: R.BASELINE_CREDIT }), sleep: async () => {} });
  await g2.paid("reply y", "haiku", { messages: [], maxTokens: 10 });
  assert.match(g2.state.stopped, /402/);
  const r3 = await g2.paid("reply z", "haiku", { messages: [], maxTokens: 10 });
  assert.equal(r3.notSent, true);
});
