// Fix run A2/B2: «Память ведущего» measured. A long synthetic campaign (300 turns by default, about 1 650 tokens of
// story a turn, the records grown slower — lean — so the state stays near session 2's size) with one fact planted in
// the story of one turn only (80 turns back: outside «компактно», inside «стандарт» and «широко»); nothing else
// records it. Writes the last turns' snapshots for the cache simulator (cache-sim.mjs --memory …) and one probe
// snapshot whose player line asks for that fact, for the replay (--memory …). For each preset it prints whether the
// planted paragraph is inside the DM's verbatim window (the app's own conversationHistory), and whether the app's
// memory search for that player line (as a turn runs it; the replay runs without it) brings the
// fact back from outside the window. Nothing paid.
//   node scripts/eval/fix-s2/memory-probe.mjs [--turns 300] [--back 80] [--keep 12] [--seed m]
//     [--out scripts/eval/out/long-campaign-m.json] [--probe-out scripts/eval/out/fix-s2-probes-memory.json]
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { ROOT } from "../real-replay/lib/ledger.mjs";
import { buildLongCampaign } from "./lib/campaign.mjs";
import { conversationHistory } from "../../../src/lib/gameplay/dm-loop/context.ts";

const args = { turns: 300, back: 80, keep: 12, seed: "m", out: join(ROOT, "scripts", "eval", "out", "long-campaign-m.json"),
  probeOut: join(ROOT, "scripts", "eval", "out", "fix-s2-probes-memory.json") };
for (let i = 2; i < process.argv.length; i++) {
  const flag = process.argv[i], value = () => process.argv[++i];
  if (flag === "--turns") args.turns = Number(value());
  else if (flag === "--back") args.back = Number(value());
  else if (flag === "--keep") args.keep = Number(value());
  else if (flag === "--seed") args.seed = value();
  else if (flag === "--out") args.out = resolve(ROOT, value());
  else if (flag === "--probe-out") args.probeOut = resolve(ROOT, value());
  else throw new Error(`unknown argument ${flag}`);
}

// The planted fact: a person of no other turn, a hiding place said once, in the story only.
const PLANT = "У ворот часовни Тихой Воды тебя догоняет Агафья Шкиперша, вдова лоцмана, и суёт тебе в ладонь тяжёлую связку. — Это от решётки водостока под Канатной улицей, — шепчет она. — Мне её держать страшно. Спрячу запасной в пустом улье за часовней, под третьей рамкой, а этот при тебе пусть будет. Никому не говори. — И уходит, не оглядываясь.";
const MARK = "под третьей рамкой";
const started = performance.now();
const built = await buildLongCampaign({ turns: args.turns, seed: args.seed, keepFrom: args.turns - args.keep + 1, lean: true, scale: 2,
  plant: { turn: args.turns - args.back, paragraph: PLANT }, log: (line) => console.log(`${line} · ${Math.round((performance.now() - started) / 1000)} s`) });
const { c, capture, decorate, rows } = built;
try {
  const { payload } = await capture("Осматриваюсь.", [{ text: "Тихо. Ветер с моря.", toolCalls: [
    { name: "advance_time", arguments: { minutes: 1, reason: "тишина" } },
    { name: "finish_turn", arguments: { sceneKinds: ["quiet"], spotlight: [], playerMoment: false, nextTension: "calm" } }] }]);
  payload.input = { ...payload.input, input: "Вспоминаю, что мне говорила Агафья Шкиперша про запасной ключ от решётки водостока: где она его спрятала? Иду туда." };
  decorate(payload);
  // The app's memory search for the player's line: one more scripted turn with that line at «компактно» (the loop
  // retrieves as the app does: withUnifiedMemory on the turn's memory query); the DM's first request shows whether
  // the search brought the fact back from outside the window (the snapshot itself does not keep retrieved memory).
  const asked = await c.turn(payload.input.input, [{ text: "Тихо.", toolCalls: [
    { name: "advance_time", arguments: { minutes: 1, reason: "тишина" } },
    { name: "finish_turn", arguments: { sceneKinds: ["quiet"], spotlight: [], playerMoment: false, nextTension: "calm" } }] }]);
  const request = asked.model.requests[0];
  const text = [...request.system.map((block) => block.text), ...request.messages.map((message) => JSON.stringify(message))].join("\n");
  const retrieval = { preset: "compact", found: text.includes(MARK), retrievedBlock: /Retrieved memory \(public/.test(text) || /Найденное в памяти/.test(text) };
  console.log("the app's memory search for the player's line (compact):", JSON.stringify(retrieval));
  const windows = Object.fromEntries(["compact", "standard", "wide"].map((memory) => {
    const history = conversationHistory({ ...payload.source, dmOptions: { ...(payload.source.dmOptions ?? {}), memory } });
    return [memory, { inWindow: history.bodies.some((body) => body.includes(MARK)), rows: history.rows, tokens: history.used }];
  }));
  console.log(`the planted fact (turn ${args.turns - args.back} of ${args.turns}) in the verbatim window:`, JSON.stringify(windows), `· the whole story ${payload.source.snapshot.scenes.length} rows`);
  await mkdir(dirname(args.out), { recursive: true });
  await writeFile(args.out, JSON.stringify({ campaignId: rows[0]?.payload.input.campaignId ?? "synthetic", title: `${built.title} — memory (${args.turns} turns)`, snapshots: rows }), "utf8");
  await writeFile(args.probeOut, JSON.stringify({ campaignId: payload.input.campaignId, title: `Fix run memory probe (seed ${args.seed}, ${args.turns} turns)`,
    snapshots: [{ turnNo: 1, probe: { id: "recall-old", label: `a fact told once, ${args.back} turns back`, windows, retrieval,
      pass: "inside the window: the DM names the hive behind the chapel, under the third frame; outside it: the DM does not invent another place as certain (the hero may not remember, may look, may roll)" }, payload }] }), "utf8");
  console.log(`${rows.length} snapshot(s) → ${args.out.replace(`${ROOT}/`, "")}; the probe → ${args.probeOut.replace(`${ROOT}/`, "")} · ${Math.round((performance.now() - started) / 1000)} s`);
} finally { await c.f.db.close(); }
