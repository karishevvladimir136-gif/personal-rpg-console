// Fix run F (item 20): the one-pass hero on the live DM — the app's own provider (src/lib/server/hero-draft-provider.ts)
// with the wizard's default DM (Claude Opus 5.5 at high) on two synthetic descriptions: a detailed 5e wizard with the
// owner's own numbers, gear, spells and money, and a short one with no numbers. Reports per hero: cost, seconds, the
// stop, what the sheet holds, and whether every number the owner wrote was kept. Synthetic texts only (the repository
// is public).
//   FIX_S2_STAGE=F node scripts/eval/fix-s2/hero-probe.mjs --budget-usd 2 [--out docs/runs/fix-s2-hero-probe.json]
import { registerHooks } from "node:module";
import { randomUUID } from "node:crypto";
import { writeFile } from "node:fs/promises";
import { openRun } from "../real-replay/lib/ledger.mjs";
import { createBudget, guardedModel, MODELS } from "../real-replay/lib/models.mjs";
import { providerKey } from "../lib/keys.mjs";
import { dmModelSpec, dmUsageCost } from "../../../src/lib/model-runtime/dm-models.ts";

const hook = registerHooks({ resolve(specifier, context, nextResolve) {
  return specifier === "server-only" ? { url: "data:text/javascript,export%20{}", shortCircuit: true } : nextResolve(specifier, context);
} });
const { createHeroDraftProvider } = await import("../../../src/lib/server/hero-draft-provider.ts");
const { initialHeroReview, heroBlockedReason } = await import("../../../src/lib/adventures/hero-draft.ts");
hook.deregister();

const arg = (name, fallback) => (process.argv.includes(name) ? process.argv[process.argv.indexOf(name) + 1] : fallback);
const budgetUsd = Number(arg("--budget-usd", 0));
if (!(budgetUsd > 0)) throw new Error("--budget-usd N is required");
const out = arg("--out", null);
const apiKey = providerKey("ANTHROPIC_API_KEY");
if (!apiKey) throw new Error("ANTHROPIC_API_KEY is needed (.env.local)");

const world = {
  title: "Берег Туманов (синтетика)",
  premise: "Синтетический мир для пробы: портовые города, гильдия магов, торговый тракт вдоль скал, пираты и старые руины. Правила — D&D 5e (2014).",
};
const heroes = [
  {
    label: "detailed 5e wizard with the owner's numbers",
    name: "Ирвен Сайл",
    description: [
      "Волшебник 9 уровня, школа воплощения, предыстория — мудрец. Человек, 41 год, бывший преподаватель гильдии магов.",
      "Характеристики: Сила 8, Ловкость 14, Телосложение 14, Интеллект 20, Мудрость 12, Харизма 10.",
      "Хиты 58, КД 15 (с «Доспехом мага» 15, без него 12). Скорость 30 футов.",
      "Спасброски: Интеллект и Мудрость. Навыки: Магия, История, Анализ, Расследование.",
      "Снаряжение: боевой посох, кинжал, кольцо защиты (+1 к КД и спасброскам, настроено), плащ путника, шляпа, книга заклинаний,",
      "мешочек с компонентами, два зелья лечения, 12 свечей, верёвка 50 футов, дорожный набор.",
      "Деньги: 60 зм, 57 см, 14 мм.",
      "Заговоры: Огненный снаряд, Луч холода, Свет, Волшебная рука, Фокусы.",
      "Подготовлено: Щит, Волшебная стрела, Доспех мага, Обнаружение магии, Туманный шаг, Паутина, Огненный шар, Контрзаклинание,",
      "Полёт, Ледяная буря, Дверь измерений, Конус холода.",
      "Особенности: Магическое восстановление, Мастер воплощения, Сильные заклинания.",
    ].join("\n"),
    numbers: { intelligence: 20, strength: 8, dexterity: 14, constitution: 14, wisdom: 12, charisma: 10, hp: 58, armorClass: 15, level: 9,
      coins: { зм: 60, см: 57, мм: 14 } },
  },
  {
    label: "short description, no numbers",
    name: "Марта Вейл",
    description: "Бывшая лучница городской стражи, ушла после того, как капитан продал её отряд пиратам. Хорошо стреляет, плохо врёт. Обычное снаряжение.",
    numbers: null,
  },
];

const run = `hero-probe-${new Date().toISOString().replace(/[-:]/g, "").replace(/\..+$/, "").replace("T", "-")}`;
const ledger = await openRun(run, budgetUsd, "fix run F: the one-pass hero on the live DM (two synthetic descriptions)");
const budget = createBudget(ledger.budgetUsd);
const log = [];
const spec = dmModelSpec(MODELS.opus.providerId, MODELS.opus.modelId);
const results = [];
try {
  for (const hero of heroes) {
    if (budget.exhausted) break;
    const { model, settle, abandon } = guardedModel({ ...MODELS.opus }, budget, apiKey, log);
    let usage = null;
    const measured = { ...model, async *stream(request) {
      for await (const event of model.stream(request)) {
        if (event.type === "usage") usage = event.usage;
        yield event;
      }
    } };
    const ticket = { kind: "creation", input: { requestId: randomUUID(), worldId: randomUUID(), worldVersion: 1, title: "Проба", language: "ru",
      name: hero.name, description: hero.description }, world, profile: { providerId: "anthropic", modelId: "claude-opus-5-5", reasoning: "high" }, context: {} };
    const started = Date.now();
    let proposal = null, error = null;
    try { proposal = (await createHeroDraftProvider({ model: () => measured })(ticket)).output; }
    catch (cause) { error = String(cause?.message ?? cause).slice(0, 300); }
    const costUsd = usage ? dmUsageCost(spec, usage) : null;
    if (costUsd !== null) settle(costUsd); else abandon();
    const sheet = proposal?.sheet ?? null;
    const coins = Object.fromEntries((proposal?.wallet ?? []).map((coin) => [coin.code, coin.amount]));
    const kept = hero.numbers && sheet ? {
      abilities: ["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"].every((key) => sheet.attributes?.[key] === hero.numbers[key]),
      hp: proposal.mechanics?.hp === hero.numbers.hp, armorClass: (sheet.armorClass ?? proposal.mechanics?.defense) === hero.numbers.armorClass,
      level: sheet.level === hero.numbers.level, coins: Object.entries(hero.numbers.coins).every(([code, amount]) => coins[code] === amount),
    } : null;
    const review = proposal ? initialHeroReview({ name: hero.name, description: hero.description }, proposal) : null;
    results.push({
      label: hero.label, seconds: Number(((Date.now() - started) / 1000).toFixed(1)), costUsd: costUsd === null ? null : Number(costUsd.toFixed(4)),
      inputTokens: usage?.inputTokens ?? null, outputTokens: usage?.outputTokens ?? null, error,
      manual: proposal ? proposal.possessions.length === 0 && /заполни/.test(proposal.notes.join(" ")) : null,
      role: sheet?.role ?? null, level: sheet?.level ?? null, attributes: sheet?.attributes ?? null,
      hp: proposal?.mechanics?.hp ?? null, armorClass: sheet?.armorClass ?? proposal?.mechanics?.defense ?? null, speed: sheet?.speed ?? null,
      items: (proposal?.possessions ?? []).map((item) => `${item.name}×${item.quantity} ${item.kind ?? "?"}${item.slot ? `@${item.slot}` : ""}`),
      worn: (proposal?.possessions ?? []).filter((item) => item.slot).length,
      counters: (proposal?.counters ?? []).map((row) => `${row.key} «${row.label}» ${row.value}/${row.max}`),
      wallet: proposal?.wallet ?? [], spells: sheet?.spells?.length ?? 0,
      cantrips: (sheet?.spells ?? []).filter((spell) => spell.level === 0).length,
      saves: sheet?.saves ?? [], skills: sheet?.skills ?? [], attacks: sheet?.attacks ?? [], questions: proposal?.questions?.length ?? 0,
      notes: proposal?.notes ?? [], kept, blockedReason: review ? heroBlockedReason(review, "ru") : null,
    });
  }
} finally {
  await ledger.settle(budget.spentUsd, `scripts/eval/fix-s2/hero-probe.mjs (${run})`);
}
const report = { run, model: "claude-opus-5-5 (high)", spentUsd: Number(budget.spentUsd.toFixed(4)), results, transport: log };
if (out) await writeFile(out, `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify(report, null, 2));
