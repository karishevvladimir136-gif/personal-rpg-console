// Polish 2, part 4 (docs/stages/POLISH_2.md §4): the conversation's history as
// append-only cached blocks. Each turn appends its own rows; the blocks written
// before never change, so the cache finds the prefix up to the previous turn at
// the block boundaries; the window slides in buckets, not one row per turn; the
// volatile «now» keeps only what changes; the Anthropic body has four explicit
// breakpoints and no top-level one. Fake model, disposable PGlite.
import assert from "node:assert/strict";
import test from "node:test";
import { registerHooks } from "node:module";
import { conversationHistory, estimateTokens, HISTORY_BUCKET, HISTORY_BUDGET } from "../src/lib/gameplay/dm-loop/context.ts";
import { loopCampaign } from "./dm-loop-fixture.mjs";

// The transport is a server-only module; the test loads it with that marker stubbed out.
const hook = registerHooks({ resolve(specifier, context, nextResolve) {
  return specifier === "server-only" ? { url: "data:text/javascript,export%20{}", shortCircuit: true } : nextResolve(specifier, context);
} });
const { anthropicRequestBody } = await import("../src/lib/server/dm/model/anthropic.ts");
hook.deregister();

const finish = (extra = {}) => ({ name: "finish_turn", arguments: { sceneKinds: ["conversation"], spotlight: [], playerMoment: false, ...extra } });

test("a turn appends its rows to the history: the earlier blocks are byte-identical, the last block carries the breakpoint, «now» has no scenes", async () => {
  const c = await loopCampaign({ language: "ru" });
  try {
    const first = await c.turn("Оглядываюсь на причале.", [{ text: "Причал пуст, только чайки. ", toolCalls: [finish()] }]);
    assert.equal(first.result.status, "committed", JSON.stringify(c.errors));
    const second = await c.turn("Иду к Марте.", [{ text: "Марта вытирает кружку. ", toolCalls: [finish()] }]);
    assert.equal(second.result.status, "committed", JSON.stringify(c.errors));
    const third = await c.turn("Спрашиваю о долге.", [{ text: "— Сорок монет, — говорит она. ", toolCalls: [finish()] }]);
    const a = second.model.requests[0].system, b = third.model.requests[0].system;
    const historyOf = (system) => system.slice(2, -3);
    const ha = historyOf(a), hb = historyOf(b);
    assert.ok(hb.length === ha.length + 2, `the third turn's history has the second turn's player line and narration (${ha.length} → ${hb.length})`);
    for (let i = 0; i < ha.length; i++) assert.equal(hb[i].text, ha[i].text, `history block ${i} unchanged`);
    assert.match(hb.at(-2).text, /^\[player\] Иду к Марте\.$/);
    assert.match(hb.at(-1).text, /^\[narration\] Марта вытирает кружку\./);
    assert.match(hb[0].text, /^Recent scenes and exchanges \(oldest first; the conversation so far, public\):\n\[/);
    assert.ok(hb.slice(0, -1).every((block) => block.breakpoint === false) && hb.at(-1).breakpoint === true);
    assert.ok(hb.every((block) => block.cache && block.ttl === "1h"));
    // «now» keeps the state; the scenes and exchanges are not repeated there.
    const now = b.at(-1).text;
    assert.match(now, /Current state \(before this turn/);
    assert.doesNotMatch(now, /Recent scenes|Recent exchanges|Марта вытирает кружку/);
    // The stable prefix: how to DM and the world are identical across turns; the living dossier follows the history.
    assert.equal(a[0].text, b[0].text);
    assert.equal(a[1].text, b[1].text);
    assert.deepEqual([b.at(-3).cache, b.at(-3).ttl, b.at(-2).cache, b.at(-1).cache], [true, "5m", false, false]);
    // The body: breakpoints on how to DM, the world, the last history block and the living dossier; nothing top-level.
    const body = anthropicRequestBody("claude-opus-5-5", { system: b, messages: [{ role: "user", text: "x" }], toolset: null, effort: "high", maxOutputTokens: 100 });
    const marked = body.system.map((block, index) => (block.cache_control ? index : null)).filter((v) => v !== null);
    assert.deepEqual(marked, [0, 1, b.length - 4, b.length - 3]);
    assert.equal(body.system[b.length - 4].cache_control.ttl, "1h");
    assert.equal("ttl" in body.system[b.length - 3].cache_control, false, "the living dossier at the 5-minute rate");
    assert.equal("cache_control" in body, false);
    // The layer report has one row per block and the cached prefix counts the history and the living dossier.
    const started = c.observations.filter((o) => o.type === "request_started").at(-1);
    assert.equal(started.layers.length, b.length);
    const bytes = (text) => new TextEncoder().encode(text).length;
    assert.equal(started.cachedPrefixBytes, b.slice(0, -2).reduce((sum, block) => sum + bytes(block.text), 0));
  } finally { await c.f.db.close(); }
});

test("the window slides in buckets: within the budget nothing is dropped; past it the oldest rows leave sixteen at a time", () => {
  // Fixed-width rows, so every row costs the same number of estimated tokens.
  const scene = (i, size = 400) => ({ role: "narration", body: `${String(i).padStart(3, "0")}:${"x".repeat(size)}` });
  const source = (rows) => ({ snapshot: { scenes: rows } });
  const small = conversationHistory(source([scene(0), scene(1), scene(2)]));
  assert.equal(small.blocks.length, 3);
  assert.deepEqual(small.dropped, []);
  assert.match(small.blocks[0], /^Recent scenes and exchanges[^\n]*\n\[narration\] 000:/);
  assert.match(small.blocks[2], /^\[narration\] 002:/);
  // Rows of about a hundred tokens each, costed as the window costs them: the budget holds `fits` of them.
  const perRow = estimateTokens(`[narration] 999:${"x".repeat(400)}`) + 2;
  const fits = Math.floor(HISTORY_BUDGET / perRow);
  const exactly = conversationHistory(source(Array.from({ length: fits }, (_, i) => scene(i))));
  assert.equal(exactly.blocks.length, fits, "everything that fits stays");
  const over = conversationHistory(source(Array.from({ length: fits + 1 }, (_, i) => scene(i))));
  assert.equal(over.blocks.length, fits + 1 - HISTORY_BUCKET, "one row over the budget drops a whole bucket");
  assert.deepEqual(over.dropped, ["older scenes before the window"]);
  assert.match(over.blocks[0], new RegExp(`\\n\\[narration\\] 0${HISTORY_BUCKET}:`), "the window starts at a bucket boundary");
  // The next rows keep the same start until the budget passes the next bucket boundary: no rewrite per turn.
  for (let extra = 2; extra < HISTORY_BUCKET; extra++) {
    const more = conversationHistory(source(Array.from({ length: fits + extra }, (_, i) => scene(i))));
    assert.match(more.blocks[0], new RegExp(`\\n\\[narration\\] 0${HISTORY_BUCKET}:`), `start unchanged with ${extra} rows past the budget`);
    assert.equal(more.blocks.length, fits + extra - HISTORY_BUCKET);
  }
  const next = conversationHistory(source(Array.from({ length: fits + HISTORY_BUCKET + 1 }, (_, i) => scene(i))));
  assert.match(next.blocks[0], new RegExp(`\\n\\[narration\\] 0${HISTORY_BUCKET * 2}:`), "then the next bucket");
  assert.ok(next.used <= HISTORY_BUDGET);
});
