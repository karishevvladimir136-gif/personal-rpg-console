// Fix run A6: the ledger checker on synthetic cases shaped like session 2's known misses — the saddle, three
// bandits' weapons, the key, a shot bolt — and on controls that must not be flagged (a known companion who
// appears, an untracked enemy's bolt, a turn whose records are complete). Each case runs twice; a fraction of a cent.
//   FIX_S2_STAGE=A node scripts/eval/fix-s2/ledger-cases.mjs --budget-usd 0.1
import { openRun } from "../real-replay/lib/ledger.mjs";
import { anthropicKey } from "../lib/anthropic-endpoint.mjs";
import { checkLedger } from "../../../src/lib/gameplay/dm-loop/ledger-check.ts";

const budgetUsd = Number(process.argv[process.argv.indexOf("--budget-usd") + 1] || 0);
if (!(budgetUsd > 0)) throw new Error("--budget-usd N is required");
const people = ["Рэй", "Брам", "Тоби", "Дирк", "Главарь", "Громила", "Часовой"];
const tracked = ["Рэй: hp 9", "Рэй: Гарпунный пистолет ×1", "Рэй: Гарпун ×3", "Брам: hp 45", "Брам: Тяжёлый арбалет ×1", "Брам: Болты ×12", "Тоби: Длинный лук ×1", "Тоби: Стрелы ×20"];
const ok = (name, summary) => ({ position: 1, call: { name, arguments: {} }, result: { ok: true, summary } });
const CASES = [
  { id: "saddle", miss: true, narration: "Конь Дирка стоит у коновязи. Ты расстёгиваешь подпругу, снимаешь седло Дирка и вскидываешь его себе на плечо — пригодится.", records: [ok("advance_time", "10 minutes pass")] },
  { id: "bandits-weapons", miss: true, narration: "Ты обходишь тела. Три сабли убитых бандитов ты собираешь, связываешь бечёвкой и забираешь с собой.", records: [ok("advance_time", "5 minutes pass")] },
  { id: "key", miss: true, narration: "Брам срезает с пояса главаря тяжёлый ключ и бросает его тебе. — Держи, водолаз. Твой трофей.", records: [ok("advance_time", "2 minutes pass")] },
  { id: "bolt", miss: true, narration: "Брам вскидывает тяжёлый арбалет и стреляет. Болт уходит в туман, и где-то у воды кто-то вскрикивает.", records: [ok("roll", "Брам rolls 1d20+3: 16 vs 13 — success; damage 1d10: 6")] },
  { id: "control-companion-appears", miss: false, narration: "Брам и Тоби подходят к причалу и встают рядом с тобой. Брам поправляет ремень.", records: [ok("advance_time", "1 minute passes")] },
  { id: "control-enemy-bolt", miss: false, narration: "Часовой на крыше стреляет из арбалета; болт свистит в локте от головы Тоби и уходит в доски.", records: [ok("roll", "Часовой rolls 1d20+3: 12 vs 13 — failure; miss, no damage")] },
  { id: "control-recorded", miss: false, narration: "Ты снимаешь седло Дирка и вскидываешь его на плечо.", records: [ok("item", "Седло Дирка created for Рэй"), ok("advance_time", "10 minutes pass")] },
];
const apiKey = anthropicKey();
const run = `ledger-cases-${new Date().toISOString().replace(/[-:]/g, "").replace(/\..+$/, "").replace("T", "-")}`;
const ledger = await openRun(run, budgetUsd, "fix run A6: the ledger checker on session 2's known misses (synthetic) and controls");
let spent = 0;
const rows = [];
try {
  for (const item of CASES) for (let attempt = 1; attempt <= 2; attempt++) {
    if (spent + 0.01 > ledger.budgetUsd) throw new Error("budget reached");
    const result = await checkLedger(apiKey, { narration: item.narration, ledger: "", receipts: item.records, language: "ru", state: { people, tracked } });
    spent += result.costUsdMicros / 1_000_000;
    const flagged = result.misses.length > 0;
    rows.push({ id: item.id, attempt, expected: item.miss, flagged, right: flagged === item.miss, misses: result.misses.map((m) => m.event), error: result.error });
  }
} finally { await ledger.settle(spent, `scripts/eval/fix-s2/ledger-cases.mjs (${run})`); }
for (const row of rows) console.log(`${row.right ? "✓" : "✗"} ${row.id} #${row.attempt}: ${row.flagged ? `flagged (${row.misses.join("; ")})` : "not flagged"}${row.error ? ` [${row.error}]` : ""}`);
const hits = rows.filter((row) => row.expected && row.flagged).length, misses = rows.filter((row) => row.expected).length;
const falseFlags = rows.filter((row) => !row.expected && row.flagged).length, controls = rows.filter((row) => !row.expected).length;
console.log(`known misses caught ${hits}/${misses}; controls flagged ${falseFlags}/${controls}; spent $${spent.toFixed(4)}`);
