// A synthetic campaign's snapshots for the replay tool's proof (polish 3 §4): a fresh loop
// campaign on PGlite plays the first turns of the Russian harbour replay with scripted
// answers, and the state before each turn — exactly what the app saves at a commit — is
// written to a file the replay reads with --snapshots. Nothing paid, nothing of the owner's.
//   node scripts/eval/real-replay/synthetic.mjs --out scripts/eval/out/synthetic-snapshots.json [--turns 3]
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { loopCampaign } from "../../../tests/dm-loop-fixture.mjs";
import { snapshotSource } from "../../../src/lib/gameplay/turn-snapshot.ts";
import { ROOT } from "./lib/ledger.mjs";

const args = { out: join(ROOT, "scripts", "eval", "out", "synthetic-snapshots.json"), turns: 3 };
for (let i = 2; i < process.argv.length; i++) {
  const flag = process.argv[i], value = () => process.argv[++i];
  if (flag === "--out") args.out = join(ROOT, value());
  else if (flag === "--turns") args.turns = Number(value());
  else throw new Error(`unknown argument ${flag}`);
}

const scenario = JSON.parse(await readFile(join(ROOT, "scripts", "eval", "scenarios", "19-polish-ru-replay.json"), "utf8"));
const c = await loopCampaign({ language: scenario.language, example: scenario.fixture, startMinutes: scenario.startMinutes });
const rows = [];
try {
  await c.activateStage4Craft();
  const steps = scenario.steps.filter((step) => step.say !== undefined).slice(0, args.turns);
  const scripted = [
    { text: "Ты оглядываешься: причал, лодки, Ганна у кабака вытирает руки о передник.", toolCalls: [
      { name: "upsert_character", arguments: { localKey: "ganna", name: "Ганна", kind: "npc", present: true, important: true, description: "хозяйка кабака «Кривой Ключ»" } },
      { name: "advance_time", arguments: { minutes: 10, reason: "оглядывается" } },
      { name: "finish_turn", arguments: { sceneKinds: ["exploration"], spotlight: ["marta"], playerMoment: false, nextTension: "calm" } } ] },
    { text: "— Работа есть, — говорит Ганна. — Сорок монет ты мне должен, помнишь.", toolCalls: [
      { name: "quest", arguments: { action: "create", localKey: "debt", kind: "debt", title: "Долг Ганне", description: "сорок монет", counterpartRef: "Ганна" } },
      { name: "advance_time", arguments: { minutes: 15, reason: "разговор" } },
      { name: "finish_turn", arguments: { sceneKinds: ["conversation"], spotlight: ["Ганна"], playerMoment: false, nextTension: "tense" } } ] },
    { text: "Фрол кивает на лодку: «Пойдём, пока прилив».", toolCalls: [
      { name: "upsert_character", arguments: { localKey: "frol", name: "Фрол", kind: "npc", present: true, description: "старый лодочник" } },
      { name: "advance_time", arguments: { minutes: 20, reason: "к лодке" } },
      { name: "finish_turn", arguments: { sceneKinds: ["travel"], spotlight: ["mokey"], playerMoment: false, nextTension: "calm" } } ] },
  ];
  for (const [index, step] of steps.entries()) {
    let captured = null;
    const played = await c.turn(step.say, [scripted[index % scripted.length]], { deps: {
      afterCommit: async ({ input, source }) => { captured = { input, source: snapshotSource(source) }; } } });
    if (played.result.status !== "committed") throw new Error(`turn ${index + 1} ${played.result.status}: ${JSON.stringify(c.errors)}`);
    if (!captured) throw new Error("afterCommit did not deliver the source");
    const settings = await c.settings.read();
    rows.push({ turnNo: index + 1, payload: { schemaVersion: 1, input: captured.input, source: captured.source, takenAt: new Date().toISOString(),
      settings: { limits: settings.limits, depth: settings.depth, split: settings.split, dmTurn: settings.dmTurn } } });
  }
} finally { await c.f.db.close(); }
await mkdir(dirname(args.out), { recursive: true });
await writeFile(args.out, JSON.stringify({ campaignId: rows[0]?.payload.input.campaignId ?? "synthetic", title: scenario.title, snapshots: rows }), "utf8");
console.log(`${rows.length} synthetic snapshot(s) written to ${args.out.replace(`${ROOT}/`, "")}`);
