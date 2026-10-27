// Game player same-world 1 (docs/stages/GAME_PLAYER_SAME_WORLD_1.md): the frozen world (the wizard once, the snapshot
// before the prep, the prep once, the DM-only file written into every session's DM notes and checked), the sheet without
// its alignment line, the order, the Haiku dry run's swap, the overlap and road tags, the exact permutation test, the
// transcript header with the layer's hash, and DeepSeek's reasoning field stored but never relayed.
import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const frozen = await import("../scripts/game-player-same-world-1/frozen.mjs");
const world = await import("../scripts/game-player-same-world-1/world.mjs");
const score = await import("../scripts/game-player-same-world-1/score.mjs");

test("the player's prompt: REPLICATE's text with the alignment cut out, and nothing else changed", async () => {
  const gp1 = await import("../scripts/game-player-1/frozen.mjs");
  const replicate = await import("../scripts/game-player-replicate-1/frozen.mjs");
  for (const table of ["A", "B"]) {
    const before = gp1.playerSystem(table), now = frozen.sameWorldPlayerSystem(table);
    assert.equal(createHash("sha256").update(before).digest("hex"), replicate.PROMPT_SHA256[table], "group 2's prompt is still what REPLICATE sent");
    assert.equal(frozen.promptSha256(table), frozen.PROMPT_SHA256[table], "the frozen hash");
    assert.ok(before.includes("Alignment: chaotic good. ") && before.includes("Chaotic good. "));
    assert.equal(now, before.replace("Alignment: chaotic good. ", "").replace("Chaotic good. ", ""), "only the two cuts");
    assert.doesNotMatch(now, frozen.ALIGNMENT);
  }
  const files = frozen.sameWorldFiles();
  for (const k of ["heroWho", "heroSheet", "setting", "canon", "guide", "premise", "wishes"]) assert.doesNotMatch(files[k], frozen.ALIGNMENT, k);
  // The review screen's own hand on a draft that wrote one anyway.
  const removed = [];
  const review = frozen.withoutAlignment({ sheet: { role: "Warlock 5", background: "Soldier of Tethyr. Chaotic Good. After the war, cards.", notes: ["Alignment: Chaotic Good", "Keeps the ban"] }, level: 5 }, removed);
  assert.deepEqual(review, { sheet: { role: "Warlock 5", background: "Soldier of Tethyr. After the war, cards.", notes: ["Keeps the ban"] }, level: 5 });
  assert.equal(removed.length, 2);
});

test("the order: A ×10 then B ×10, the five families' first sessions before their second ones; DeepSeek keeps its reasoning field", () => {
  assert.equal(frozen.ORDER.length, 20);
  assert.deepEqual(frozen.ORDER.slice(0, 5).map((s) => s.key), ["A-opus-1", "A-fable-1", "A-astra-1", "A-sol-1", "A-deepseek-1"]);
  assert.deepEqual(frozen.ORDER.slice(5, 10).map((s) => s.key), ["A-opus-2", "A-fable-2", "A-astra-2", "A-sol-2", "A-deepseek-2"]);
  assert.ok(frozen.ORDER.slice(10).every((s) => s.table === "B"));
  assert.equal(frozen.DEEPSEEK.keepReasoning, true);
  assert.equal(frozen.DEEPSEEK.upstream.slug, "deepinfra");
  assert.deepEqual(frozen.CAPS, { anthropic: 0, openrouter: 350, openai: 25 }, "the owner's amendment (from $220)");
  assert.equal(frozen.AMENDMENTS.length, 2);
  assert.ok(frozen.misreadEnd({ key: "B-opus-2", startedAt: "2026-10-27T13:50:32.322Z" }), "the end rule's misread is a cut attempt");
  assert.ok(!frozen.misreadEnd({ key: "B-opus-2", startedAt: "2026-10-27T20:00:00.000Z" }), "its replay is not");
  assert.match(frozen.AMENDMENTS[0].what, /from \$220 to \$350/);
  assert.notEqual(frozen.DESIGN_SHA256, frozen.SUPERSEDED.sha256);
  assert.deepEqual(frozen.WAITS_429, [20_000, 40_000, 80_000, 120_000, 120_000, 120_000], "six bounded waits; the seventh 429 stops");
});

test("DeepSeek's provider reasoning field: requested, stored on the message record, never relayed to the DM", async () => {
  const { openrouterChat } = await import("../scripts/game-player-replicate-1/openrouter-chat.mjs");
  const sent = [];
  const fetcher = async (url, init) => {
    sent.push(JSON.parse(init.body));
    return new Response(JSON.stringify({ id: "gen-1", model: frozen.DEEPSEEK.model, provider: "DeepInfra", choices: [{ finish_reason: "stop", message: { role: "assistant", content: "I lift the stone.", reasoning: "He would hesitate first." } }], usage: { prompt_tokens: 10, completion_tokens: 5 } }), { status: 200, headers: { "content-type": "application/json" } });
  };
  const kept = await openrouterChat({ apiKey: "k", spec: frozen.DEEPSEEK, system: "s", messages: [{ role: "user", content: "screen" }], maxTokens: 100, effort: "medium", fetcher, keepReasoning: true });
  assert.equal(sent[0].reasoning.exclude, false);
  assert.equal(kept.text, "I lift the stone.");
  assert.equal(kept.providerReasoning, "He would hesitate first.");
  const plain = await openrouterChat({ apiKey: "k", spec: frozen.DEEPSEEK, system: "s", messages: [{ role: "user", content: "screen" }], maxTokens: 100, effort: "medium", fetcher });
  assert.equal(sent[1].reasoning.exclude, true);
  assert.equal(plain.providerReasoning, undefined, "REPLICATE's seat: not requested, not kept");
});

test("DeepSeek's reasoning field never reaches the DM or a judge: the relayed messages, the judges' session text and game player 1's transcript carry the visible text only", async () => {
  const { runSession } = await import("../scripts/game-player-1/session.mjs");
  const { transcriptMarkdown } = await import("../scripts/game-player-1/report.mjs");
  const SECRET = "PRIVATE-REASONING-7f3";
  const seen = [];
  const meter = { stopped: null, refusals: 0, closed: () => null, within: async (_, fn) => fn(),
    fetch: async (url, init) => {
      const body = JSON.parse(init.body);
      seen.push(JSON.stringify(body));
      if (/chat\/completions/.test(url)) return new Response(JSON.stringify({ id: "gen-1", model: frozen.DEEPSEEK.model, provider: "DeepInfra", choices: [{ finish_reason: "stop", message: { role: "assistant", content: "I wait by the bridge.", reasoning: SECRET } }], usage: {} }), { status: 200 });
      return new Response(JSON.stringify({ id: "m", content: [{ type: "text", text: '{"distress":0,"reason":"calm"}' }], stop_reason: "end_turn", usage: {} }), { status: 200 });
    } };
  const dmCalls = [];
  const dm = { views: { heroOf: () => null, currentPlace: () => null }, readView: async () => ({ snapshot: { scenes: [] }, play: { turns: [] } }),
    submit: async (text) => { dmCalls.push(text); return { input: { operationId: "o" }, turn: { status: "committed", narration: "The river runs.", checks: [], changes: [] } }; } };
  const record = await runSession({ key: "B-deepseek-1", table: "B", player: frozen.DEEPSEEK, dm, meter, keys: { anthropic: "k", openai: "k", openrouter: "k" }, turns: 2, sleep: async () => {},
    system: frozen.sameWorldPlayerSystem("B") });
  const deepseekTurns = record.messages.filter((m) => /^player t/.test(m.purpose));
  assert.ok(deepseekTurns.length >= 2 && deepseekTurns.every((m) => m.providerReasoning === SECRET && m.notRelayed === true), "stored on every DeepSeek message");
  assert.ok(dmCalls.every((text) => !text.includes(SECRET)), "the DM never gets it");
  assert.ok(seen.length > 4 && seen.every((b) => !b.includes(SECRET)), "no request carries it: not the player's own later calls (its earlier messages go back as visible text only), not the welfare checks");
  assert.doesNotMatch(score.sessionText(record), new RegExp(SECRET), "the judges' session text");
  assert.doesNotMatch(transcriptMarkdown(record), new RegExp(SECRET), "game player 1's transcript (the authorship judges read it)");
  assert.doesNotMatch(JSON.stringify(score.worldRequest(record)), new RegExp(SECRET));
});

test("the Haiku dry run's swap: every Claude request goes out as Claude Haiku 5.5; DeepSeek and OpenAI are left alone", async () => {
  const { haikuRewrite } = await import("../scripts/game-player-same-world-1/run.mjs");
  const body = (model) => ({ method: "POST", body: JSON.stringify({ model, max_tokens: 10, output_config: { effort: "xhigh" } }) });
  const out = (url, model) => JSON.parse(haikuRewrite(url, body(model)).body);
  assert.equal(out("https://openrouter.ai/api/v1/messages", "anthropic/claude-opus-5.5").model, "anthropic/claude-haiku-5.5");
  assert.equal(out("https://openrouter.ai/api/v1/messages", "anthropic/claude-opus-5.5").output_config.effort, "xhigh", "Haiku 5.5 takes every effort level");
  assert.equal(out("https://api.anthropic.com/v1/messages", "claude-fable-5-1").model, "claude-haiku-5-5");
  assert.equal(out("https://openrouter.ai/api/v1/chat/completions", "deepseek/deepseek-v4-pro-0813").model, "deepseek/deepseek-v4-pro-0813");
  assert.equal(out("https://api.openai.com/v1/responses", "gpt-6-astra").model, "gpt-6-astra");
  // Above the meter, the reply names the requested model again (the app's served-model check); the ledger keeps Haiku.
  const { haikuReplies } = await import("../scripts/game-player-same-world-1/run.mjs");
  const sse = 'event: message_start\ndata: {"type":"message_start","message":{"model":"anthropic/claude-haiku-5.5","content":[]}}\n\n';
  const wrapped = haikuReplies(async () => new Response(sse, { status: 200, headers: { "content-type": "text/event-stream" } }));
  const reply = await (await wrapped("https://openrouter.ai/api/v1/messages", body("anthropic/claude-opus-5.5"))).text();
  assert.match(reply, /"model":"anthropic\/claude-opus-5\.5"/);
  assert.doesNotMatch(reply, /haiku/);
  const untouched = await (await haikuReplies(async () => new Response('{"model":"gpt-6-astra"}'))("https://api.openai.com/v1/responses", body("gpt-6-astra"))).text();
  assert.equal(untouched, '{"model":"gpt-6-astra"}');
});

test("the DM-only file: writes read back as the private-notes call takes them, a hash that ignores key order, the threads numbered", async () => {
  const { parseNoteValue } = await import("../src/lib/gameplay/dm-loop/private-notes.ts");
  const before = { fact: { owner_pin: "keep" }, clock: {} };
  const after = { fact: { owner_pin: "keep", hidden_layer: JSON.stringify({ v: "The layer.", since: 600, until: null }), voice_c1: "Tumble: two", "voice_the-cat": "the cat: smells of the sea", voice_n1: "Mags: I want the debt paid." }, clock: { clock_watch: 0 } };
  const { set, removed } = world.writesBetween(before, after, parseNoteValue);
  assert.deepEqual(removed, []);
  assert.deepEqual(set.map((w) => [w.kind, w.key, w.value]), [["fact", "hidden_layer", "The layer."], ["fact", "voice_c1", "Tumble: two"], ["fact", "voice_n1", "Mags: I want the debt paid."], ["fact", "voice_the-cat", "the cat: smells of the sea"], ["clock", "clock_watch", "0"]]);
  const file = { table: "A", campaignId: "c", writes: set };
  assert.equal(world.layerSha256(file), world.layerSha256({ writes: set, campaignId: "c", table: "A" }));
  assert.notEqual(world.layerSha256(file), world.layerSha256({ ...file, table: "B" }));
  const { parsePrep } = await import("../src/lib/gameplay/dm-loop/hidden-layer.ts");
  const { SCRIPTED_PREP } = await import("../scripts/game-player-1/scripted.mjs");
  const prep = parsePrep(JSON.stringify({ ...SCRIPTED_PREP, falseLead: "The ledger points at the wrong clerk.", length: { hours: 7, turns: 70 }, errand: "Find the man who sold the coin.", acts: [{ untilTurn: 15, aim: "Offer the errand.", converge: "" }] }), "en");
  const threads = world.threadsOf({ layer: prep.text, writes: set, companionIds: ["c1"] });
  assert.deepEqual(threads.map((t) => t.kind), ["errand", "faction", "secret", "secret", "clock", "wonder", "clue", "clue", "clue", "false lead", "person"]);
  assert.deepEqual(threads.map((t) => t.id).slice(0, 3), ["T1", "T2", "T3"]);
  assert.equal(threads[0].text, "Find the man who sold the coin.");
  assert.equal(threads.at(-1).text, "Mags: I want the debt paid.", "the companions' voices are left out (by entity and by name: the cat has no entity before play): they travel with the hero");
});

test("the frozen world on the scripted DM: one snapshot before the prep, each session's notes hold exactly its table's file; a tampered file or a second session at a table stops (a child process; no network, no key)", { timeout: 300_000 }, () => {
  const dir = mkdtempSync(join(tmpdir(), "same-world-test-"));
  const url = (path) => JSON.stringify(new URL(path, import.meta.url).href);
  const script = `const { freeze } = await import(${url("../scripts/game-player-same-world-1/run.mjs")});
    const world = await import(${url("../scripts/game-player-same-world-1/world.mjs")});
    const { openApp } = await import(${url("../scripts/game-player-1/app.mjs")});
    const manifest = await freeze({ dir: ${JSON.stringify(dir)}, dry: true, log: () => {} });
    const app = await openApp({ keys: {}, fake: true, database: () => world.openFrozenDatabase(${JSON.stringify(dir)}) });
    const start = world.frozenStarter(${JSON.stringify(dir)});
    const meter = { within: async (_, fn) => fn() };
    const cid = manifest.tables.A.campaignId;
    const layerBefore = app.lib.privateNotes.hiddenLayerOf({ privateState: await world.privateStateOf(app, cid) });
    const { made, prep } = await start(app, { key: "A-opus-1", table: "A" }, { meter });
    const state = await world.privateStateOf(app, made.cid);
    let second = null;
    try { await start(app, { key: "A-fable-1", table: "A" }, { meter }); } catch (error) { second = String(error.message); }
    const { files } = world.readFrozen(${JSON.stringify(dir)});
    console.log("RESULT " + JSON.stringify({ manifest, layerBefore, made, prep, layerAfter: app.lib.privateNotes.hiddenLayerOf({ privateState: state }),
      stored: world.canonical(world.storedOf(state, files.A.writes)), frozenStored: world.canonical(files.A.stored), second }));
    await app.close(); process.exit(0);`;
  const stdout = execFileSync(process.execPath, ["--experimental-transform-types", "--input-type=module", "-e", script], { cwd: new URL("..", import.meta.url), encoding: "utf8",
    env: { ...process.env, APP_ANTHROPIC_API_KEY: "", APP_OPENAI_API_KEY: "", APP_OPENROUTER_API_KEY: "", ANTHROPIC_API_KEY: "", OPENAI_API_KEY: "", OPENROUTER_API_KEY: "" }, maxBuffer: 64 * 1024 * 1024 });
  const r = JSON.parse(stdout.split("\n").find((line) => line.startsWith("RESULT ")).slice(7));
  assert.deepEqual(Object.keys(r.manifest.tables), ["A", "B"]);
  const { files } = world.readFrozen(dir);
  for (const t of ["A", "B"]) {
    assert.match(files[t].layer, /^The campaign's hidden layer/);
    assert.equal(files[t].sha256, r.manifest.tables[t].layer.sha256);
    assert.ok(files[t].threads.length >= 5);
    assert.doesNotMatch(JSON.stringify(r.manifest.tables[t].steps), frozen.ALIGNMENT);
  }
  assert.equal(r.layerBefore, "", "the snapshot holds no layer");
  assert.equal(r.made.cid, r.manifest.tables.A.campaignId);
  assert.equal(r.prep.layerSha256, files.A.sha256);
  assert.equal(r.prep.snapshotSha256, r.manifest.snapshot.sha256);
  assert.equal(r.layerAfter, files.A.layer, "the DM's notes hold the frozen layer");
  assert.equal(r.stored, r.frozenStored, "and every other write of the file, as the prep stored it");
  assert.match(r.second, /already played in this process/);
  const path = join(dir, world.layerFile("B"));
  const file = JSON.parse(readFileSync(path, "utf8"));
  writeFileSync(path, JSON.stringify({ ...file, writes: [...file.writes, { kind: "fact", key: "x", value: "y" }] }));
  assert.throws(() => world.readFrozen(dir), /does not match its hash/);
});

test("the nearest-neighbour test: every deal of ten sessions into five ordered pairs, the exact p", () => {
  const ids = ["a", "b", "c", "d"];
  const counts4 = score.nullDistribution(ids, { a: "b", b: "a", c: "d", d: "c" });
  assert.equal(counts4.reduce((s, x) => s + x, 0), 12, "3 pairings × 4 orders");
  const ten = Array.from({ length: 10 }, (_, i) => `s${i}`);
  const nearest = Object.fromEntries(ten.map((id, i) => [id, ten[i % 2 ? i - 1 : i + 1]]));
  const counts = score.nullDistribution(ten, nearest);
  assert.equal(counts.reduce((s, x) => s + x, 0), 30240, "945 pairings × 32 orders");
  // Five families whose two sessions sit together: all five hold, and the exact p is the share of deals that give 5.
  const fams = frozen.FAMILIES;
  const rows = fams.flatMap((f, i) => [1, 2].map((seat) => ({ key: `A-${f}-${seat}`, table: "A", family: f, seatNo: seat, doShare: 0.5 + i * 0.1 + seat * 0.001, testsPerAction: 0.1 * i + seat * 0.001,
    wordsPerAction: 40 + 20 * i, rerollCount: i, declineCount: 0, madePerAction: 0 })));
  const cellA = score.nnTable(rows);
  assert.equal(cellA.statistic, 5);
  assert.equal(cellA.holds, true);
  assert.equal(cellA.p, Math.round((cellA.counts[5] / 30240) * 1e4) / 1e4);
  assert.equal(cellA.counts[5], 32, "the true pairing in each of its 32 orders (each pair is its own nearest both ways)");
  assert.equal(cellA.p, Math.round((1 / 945) * 1e4) / 1e4);
  assert.deepEqual(cellA.kept, ["doShare", "testsPerAction", "wordsPerAction", "rerolls"], "a count with no spread is left out");
  const both = score.nnBoth([cellA, cellA]);
  assert.equal(both.statistic, 10);
  assert.ok(both.p <= cellA.p);
});

test("W3's deal is seeded; W2's roads group by «same»; W4 and W5 read by their rules", () => {
  const ids = Array.from({ length: 10 }, (_, i) => `T${i + 1}`);
  const rows = frozen.FAMILIES.flatMap((f) => [1, 2].map((seat) => ({ key: `A-${f}-${seat}`, table: "A", family: f, touched: ["T1", "T2", seat === 1 ? "T3" : "T4"] })));
  const a = score.w3Table(rows, ids, { draws: 500 }), b = score.w3Table(rows, ids, { draws: 500 });
  assert.deepEqual(a, b);
  assert.equal(a.below, true);
  assert.ok(a.p < 0.05, "everyone leaves the same corners untouched");
  assert.deepEqual(a.neverTouched, ["T5", "T6", "T7", "T8", "T9", "T10"]);
  const same = (x, y) => (new Set([x, y]).size === 2 && [x, y].every((k) => ["p", "q"].includes(k)));
  assert.equal(score.roadGroups(["p", "q", "r", "s", "t"], same), 4);
  assert.deepEqual(score.roadPairs(["A-opus-1", "A-opus-2", "A-sol-1", "A-sol-2"]), [["A-opus-1", "A-sol-1"], ["A-opus-1", "A-opus-2"], ["A-sol-1", "A-sol-2"]]);
  const r = (key, ended, doShare, words) => ({ key, table: key[0], family: score.familyOf(key), seatNo: score.seatOf(key), ended, endedAt: ended === "turns" ? 20 : 4, doShare, wordsPerAction: words, harness: { swallowed: 0, prose: 0, stuck: ended === "stuck" } });
  const now = ["A", "B"].flatMap((t) => frozen.FAMILIES.flatMap((f) => [1, 2].map((s) => r(`${t}-${f}-${s}`, f === "deepseek" && t === "B" && s === 2 ? "stuck" : "turns", 0.8, 100))));
  const group2 = ["A", "B"].flatMap((t) => frozen.FAMILIES.map((f) => ({ table: t, player: f, doShare: f === "sol" ? 0.5 : 0.82, wordsPerAction: 95 })));
  const v = score.verdictsW({ rows: now, group2, threads: { A: [], B: [] } });
  assert.equal(v.W4.toTwenty, 3);
  assert.equal(v.W4.holds, true);
  assert.equal(v.W5.families, 4, "Sol's do share moved by more than 20 %");
  assert.equal(v.W5.holds, true);
  assert.deepEqual(v.counted.stuck, ["B-deepseek-2"]);
});

test("the transcript header names the frozen layer by hash; DeepSeek's reasoning field is printed as not relayed", async () => {
  const { transcriptOf, transcriptHeader } = await import("../scripts/game-player-same-world-1/report.mjs");
  const session = { key: "B-deepseek-1", table: "B", player: "deepseek", startedAt: "2026-10-27T00:00:00Z", ended: { reason: "turns" }, turns: [{ k: 1 }],
    campaign: { prep: { frozen: true, layerSha256: "ab".repeat(32), snapshotSha256: "cd".repeat(32), chars: 4000, threads: 22, preparedBy: "the owner's DM settings", preparedAt: "2026-10-27T01:00:00Z" } },
    screens: ["The session begins."], messages: [{ purpose: "player t1", text: "I wait by the bridge.", providerReasoning: "He would wait.", notRelayed: true }], welfare: [] };
  const header = transcriptHeader(session, {});
  assert.match(header, /Table B's hidden layer, prepared once before any player by the owner's DM settings at 2026-10-27T01:00:00Z — sha256 `(ab){32}`/);
  assert.match(header, /snapshot \(sha256 `(cd){32}`/);
  assert.match(header, /no alignment line/);
  const text = transcriptOf(session, {});
  assert.match(text, /\*Provider reasoning field, not relayed\*[^\n]*\n\n````text\nHe would wait\.\n````/);
});
