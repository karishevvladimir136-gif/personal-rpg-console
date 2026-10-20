// Fix run E (items 78, 79): the frame rules on the live models — synthetic scenes shaped like session 2's misses. For
// each scene the shot director (Claude Sonnet 5.5) writes the brief, the frame compiler builds the prompt the way the
// server does (role words to people, the brief's labels, the records' gear, gaze and hands, identity-only references),
// GPT Image 2.5 Sunburst draws it, and the vision check (Claude Haiku 5.5) reads it back. An out-of-game reply gets no
// call at all. What is measured: who the brief puts in the frame (the hero for «маг»), the caption's language and
// moment, names kept out of the prompt, the gear lines, the hands, and what the check finds (extra hands, a shield, a
// lantern, open eyes at 0 HP) with each person's gaze. Pictures land in the scratchpad given by --out (never in git).
//   FIX_S2_STAGE=E node scripts/eval/fix-s2/picture-probe.mjs --budget-usd 1.5 --out <dir>
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { openRun } from "../real-replay/lib/ledger.mjs";
import { providerKey } from "../lib/keys.mjs";
import { BRIEF_MODEL, BRIEF_PRICE_PER_MILLION, briefRequest, compileBriefPrompt, directPeople, latinSpellings, parseBrief, applyLookChange } from "../../../src/lib/visual-frame/brief.ts";
import { checkFrame } from "../../../src/lib/visual-frame/frame-check.ts";
import { generateOpenAIImage } from "../../../src/lib/visual-frame/openai-image.ts";
import { outOfGameOnly, storyText } from "../../../src/lib/visual-frame/shot.ts";

const arg = (name, fallback = null) => { const at = process.argv.indexOf(name); return at >= 0 ? process.argv[at + 1] : fallback; };
const budgetUsd = Number(arg("--budget-usd", 0));
if (!(budgetUsd > 0)) throw new Error("--budget-usd N is required");
const out = arg("--out");
if (!out) throw new Error("--out <dir> is required (a scratch directory, never the repository)");
const only = arg("--only");
const MODEL = "gpt-image-2.5-sunburst";
const IMAGE_RESERVE_USD = 0.08, BRIEF_RESERVE_USD = 0.04, CHECK_RESERVE_USD = 0.01;

// The synthetic party: a young mage (the hero), a veteran sergeant without a shield, a scout with a short bow.
const HERO = "11111111-1111-4111-8111-111111111111", SERGEANT = "22222222-2222-4222-8222-222222222222", SCOUT = "33333333-3333-4333-8333-333333333333",
  LEADER = "44444444-4444-4444-8444-444444444444";
const records = [
  { id: HERO, name: "Эдрик Вейл", kind: "player", hp: 14, max_hp: 22, role: "the hero; Wizard; Молодой маг из академии, худой, в синей мантии и широкополой шляпе.",
    look: "A lean young man of about twenty-five with a narrow face, grey eyes, a short dark beard and shoulder-length black hair; a deep blue wizard's robe with a rope belt and a wide-brimmed grey hat.",
    worn: ["Посох", "Синяя мантия", "Широкополая шляпа"], packed: ["Книга заклинаний", "Бурдюк", "Верёвка"] },
  { id: SERGEANT, name: "Хальвар", kind: "companion", hp: 58, max_hp: 58, role: "a companion of the party; Veteran; Сержант городской стражи, седой и упрямый.",
    look: "A broad, weathered man of about fifty with cropped grey hair, a grey stubble beard and a scar through his left eyebrow; a chain shirt over a faded green gambeson, leather bracers.",
    worn: ["Длинный меч", "Кольчужная рубаха", "Кинжал"], packed: ["Верёвка", "Огниво"] },
  { id: SCOUT, name: "Лира", kind: "companion", hp: 16, max_hp: 16, role: "a companion of the party; Scout; Разведчица из пограничья, рыжая, быстрая.",
    look: "A wiry woman of about thirty with freckles and a red braid; a hooded brown leather jerkin and soft boots.",
    worn: ["Короткий лук", "Кожаная куртка", "Короткий меч"], packed: ["Стрелы", "Зола в мешочке"] },
  { id: LEADER, name: "Чёрный Тоб", kind: "npc", hp: 0, max_hp: 30, role: "Главарь разбойников с ключом на цепочке.",
    look: "A heavy man in a black leather coat with a shaved head.", worn: ["Сабля", "Ключ на цепочке"], packed: [] },
];
const scene = records.map(({ id, name, kind, role }) => ({ id, name, kind, role }));
const SCENES = [
  { id: "role-word", place: "Застава у рудника", narration: "Хальвар выслушивает мага и кивает. — Значит, через овраг, — говорит он, глядя на карту в твоих руках. Ветер треплет край пергамента; у печи сохнут плащи стражи.", expect: { who: [HERO, SERGEANT] } },
  { id: "kneel-aim", place: "Овраг", narration: "Ты поднимаешься из-за корневища на колено, взводишь лёгкий арбалет, подобранный у часового, и целишься в фигуру на том краю оврага. Хальвар замер рядом, ладонь на рукояти меча. Внизу шумит ручей.", expect: { who: [HERO, SERGEANT] }, gain: { [HERO]: ["Лёгкий арбалет"] } },
  { id: "ash-hands", place: "Сожжённая площадка", narration: "Ты льёшь воду из бурдюка себе на ладонь, смешиваешь с пеплом и размазываешь серую пасту по лицу и рукам. Лира держит перед тобой горсть золы и критически щурится: — Ещё под глазами.", expect: { who: [HERO, SCOUT], change: true } },
  { id: "raid-hidden", place: "Двор рудника ночью", narration: "Ты прячешься за телегой с рудой, в густой тени; лицо в пепле, тебя не видно. Хальвар бесшумно заходит сзади, зажимает рот часовому и утаскивает его за угол сарая. Только луна и далёкий костёр у ворот.", expect: { who: [HERO, SERGEANT] }, look: { [HERO]: ["grey ash paste smeared over his face and hands"] } },
  { id: "down-0hp", place: "Горящий обоз", narration: "Ты падаешь за горящей телегой, вне взгляда вражеского мага; шляпа откатывается в сторону. Хальвар стоит над мёртвым главарём, клинок в крови. На шее главаря блестит цепочка с ключом.", expect: { who: [HERO, SERGEANT, LEADER] }, hp: { [HERO]: 0 } },
  { id: "out-of-game", place: "Застава", narration: "(Вне игры: записываю.)", expect: { ooc: true } },
];

const apiKey = providerKey("ANTHROPIC_API_KEY"), openaiKey = providerKey("OPENAI_API_KEY");
// --path shot: the default path (the shot director off, as in session 2) — the short shot by Haiku from the paragraph,
// the records frame (gaze and hands from the shot, the records' gear, 0 HP), the picture and the check; --only <id,id>.
if (arg("--path") === "shot") {
  const { shotRequest, parseShot, resolveWho } = await import("../../../src/lib/visual-frame/shot.ts");
  const { compileRecordsFrame } = await import("../../../src/lib/visual-frame/prompt-compiler.ts");
  const { relabel } = await import("../../../src/lib/visual-frame/brief.ts");
  const { SHOT_PRICE } = { SHOT_PRICE: { input: 0.1, output: 0.5 } };
  const run = `picture-shot-${new Date().toISOString().replace(/[-:]/g, "").replace(/\..+$/, "").replace("T", "-")}`;
  const ledger = await openRun(run, budgetUsd, "fix run E: the default frame path (shot, records frame, picture, check) on synthetic scenes");
  await mkdir(out, { recursive: true });
  let spent = 0;
  const rows = [];
  const wanted = (arg("--only") ?? "").split(",").filter(Boolean);
  try {
    for (const item of SCENES.filter((scene) => !wanted.length || wanted.includes(scene.id))) {
      if (outOfGameOnly(item.narration)) { rows.push({ id: item.id, ooc: true }); continue; }
      const row = { id: item.id };
      rows.push(row);
      try {
        const hp = (id) => item.hp?.[id] ?? records.find((r) => r.id === id).hp;
        const worn = (id) => [...records.find((r) => r.id === id).worn, ...(item.gain?.[id] ?? [])];
        const context = { heroName: records[0].name, names: records.slice(1).map((r) => r.name), placeName: item.place, language: "ru", people: scene.map(({ name, role }) => ({ name, role })) };
        const request = shotRequest(storyText(item.narration), context);
        if (spent + CHECK_RESERVE_USD > ledger.budgetUsd) throw new Error("budget reached");
        const response = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "content-type": "application/json" },
          body: JSON.stringify({ model: "claude-haiku-5-5", max_tokens: 2000, output_config: { effort: "low" }, system: request.system, messages: [{ role: "user", content: request.user }] }), signal: AbortSignal.timeout(60_000) });
        const value = await response.json().catch(() => null);
        spent += ((value?.usage?.input_tokens ?? 0) * SHOT_PRICE.input + (value?.usage?.output_tokens ?? 0) * SHOT_PRICE.output) / 1_000_000;
        const shot = parseShot((value?.content ?? []).filter((b) => b.type === "text").map((b) => b.text).join("\n"));
        if (!shot) { row.error = `no shot (${response.status}, ${value?.stop_reason})`; continue; }
        const resolved = resolveWho(shot.who, scene);
        const labels = [...shot.who.map((name, at) => ({ name, label: resolved[at] === HERO ? "the hero" : `person ${at + 1}` })),
          ...scene.filter((p) => !resolved.includes(p.id)).map((p) => ({ name: p.name, label: "someone" }))];
        Object.assign(shot, { action: relabel(shot.action, labels), where: relabel(shot.where, labels), mood: relabel(shot.mood, labels) });
        const people = shot.who.map((name, index) => {
          const entity = resolved[index] ? records.find((r) => r.id === resolved[index]) : null;
          const gaze = entity && hp(entity.id) === 0 ? undefined : shot.gaze?.find((g) => resolveWho([g.who], scene)[0] === entity?.id || g.who === name);
          const direction = gaze || (index === 0 && shot.hands) ? { looksAt: gaze ? relabel(gaze.looksAt, labels) : "", expression: "", action: "", hands: index === 0 && shot.hands ? relabel(shot.hands, labels) : null } : undefined;
          return { name, entity: entity ? { id: entity.id, kind: entity.kind, conditions: [] } : null, appearance: entity?.look ?? "",
            ...(entity ? { gear: { worn: worn(entity.id), packed: entity.packed }, down: hp(entity.id) === 0 } : {}), ...(direction ? { direction } : {}) };
        });
        const { prompt } = compileRecordsFrame({ modelId: MODEL, shot, style: "Painterly fantasy illustration, muted earthy palette, cinematic light.", people, items: [], maxReferences: 6, references: [] });
        await writeFile(join(out, `${item.id}.shot-prompt.txt`), prompt, "utf8");
        Object.assign(row, { who: resolved.map((id) => records.find((r) => r.id === id)?.name ?? null), caption: shot.caption ?? null, gaze: shot.gaze ?? [], hands: shot.hands ?? null,
          namesInPrompt: records.some((r) => r.name.split(" ").flatMap((part) => [part, ...latinSpellings(part)]).some((part) => part.length > 2 && prompt.toLowerCase().includes(part.toLowerCase()))) });
        if (spent + IMAGE_RESERVE_USD > ledger.budgetUsd) throw new Error("budget reached");
        const image = await generateOpenAIImage(openaiKey, { model: MODEL, prompt, width: 1344, height: 768, quality: "high", format: "jpeg", moderation: "low" });
        spent += image.priceUsdMicros / 1_000_000;
        await writeFile(join(out, `${item.id}.shot.jpg`), image.bytes);
        const ids = [...new Set(resolved.filter(Boolean))];
        const check = await checkFrame(apiKey, { image: { bytes: image.bytes, contentType: image.contentType },
          people: ids.map((id) => ({ key: id, label: id === HERO ? "the hero" : `person ${shot.who.findIndex((_, at) => resolved[at] === id) + 1}`, worn: worn(id), packed: records.find((r) => r.id === id).packed, down: hp(id) === 0 })),
          moment: shot.action });
        spent += check.costUsdMicros / 1_000_000;
        row.check = check.verdict ? { problems: check.verdict.problems, gaze: check.verdict.gaze.map((g) => ({ who: records.find((r) => r.id === g.key)?.name, looksAt: g.looksAt })) } : { error: check.error };
      } catch (error) {
        if (/budget reached/.test(String(error?.message))) throw error;
        row.error = `${error?.code ?? "error"}: ${String(error?.detail ?? error?.message ?? error).slice(0, 160)}`;
      }
      await writeFile(join(out, "shot-probe.json"), JSON.stringify({ run, spentUsd: spent, rows }, null, 2), "utf8");
    }
  } finally { await ledger.settle(spent, `scripts/eval/fix-s2/picture-probe.mjs --path shot (${run})`); }
  for (const row of rows) console.log(JSON.stringify(row));
  console.log(`spent $${spent.toFixed(4)} (${run})`);
  process.exit(0);
}
// --recheck: only the vision check again, on the frames a previous run drew into --out (its probe.json); no new pictures.
if (process.argv.includes("--recheck")) {
  const { readFile } = await import("node:fs/promises");
  const previous = JSON.parse(await readFile(join(out, "probe.json"), "utf8"));
  const run = `picture-recheck-${new Date().toISOString().replace(/[-:]/g, "").replace(/\..+$/, "").replace("T", "-")}`;
  const ledger = await openRun(run, budgetUsd, "fix run E: the vision check again on the probe's frames (the token cap raised)");
  let spent = 0;
  try {
    for (const row of previous.rows.filter((r) => r.who && !r.ooc)) {
      if (spent + CHECK_RESERVE_USD > ledger.budgetUsd) throw new Error("budget reached");
      const item = SCENES.find((scene) => scene.id === row.id);
      const ids = row.who.map((name) => records.find((r) => r.name === name).id);
      const people = ids.map((id, index) => ({ key: id, label: row.labels[index] ?? `person ${index + 1}`, worn: [...records.find((r) => r.id === id).worn, ...(item.gain?.[id] ?? [])],
        packed: records.find((r) => r.id === id).packed, down: (item.hp?.[id] ?? records.find((r) => r.id === id).hp) === 0 }));
      const check = await checkFrame(apiKey, { image: { bytes: await readFile(join(out, `${row.id}.jpg`)), contentType: "image/jpeg" }, people, moment: row.caption ?? "" });
      spent += check.costUsdMicros / 1_000_000;
      row.check = check.verdict ? { problems: check.verdict.problems, gaze: check.verdict.gaze.map((g) => ({ who: records.find((r) => r.id === g.key)?.name, looksAt: g.looksAt })) } : { error: check.error };
      console.log(`${row.id}: ${row.check.error ? `error ${row.check.error}` : `${row.check.problems.length ? row.check.problems.join("; ") : "no problems"} · gaze ${row.check.gaze.map((g) => `${g.who} → ${g.looksAt}`).join(", ")}`} (${check.elapsedMs} ms)`);
    }
  } finally { await ledger.settle(spent, `scripts/eval/fix-s2/picture-probe.mjs --recheck (${run})`); }
  await writeFile(join(out, "probe.json"), JSON.stringify({ ...previous, recheck: run, rows: previous.rows }, null, 2), "utf8");
  console.log(`spent $${spent.toFixed(4)} (${run})`);
  process.exit(0);
}
if (!apiKey || !openaiKey) throw new Error("the Anthropic and OpenAI keys are needed in .env.local");
const run = `picture-probe-${new Date().toISOString().replace(/[-:]/g, "").replace(/\..+$/, "").replace("T", "-")}`;
const ledger = await openRun(run, budgetUsd, "fix run E: the frame rules on the live models (brief, picture, vision check) on synthetic scenes");
await mkdir(out, { recursive: true });
let spent = 0;
const reserve = (usd) => { if (spent + usd > ledger.budgetUsd) throw new Error(`budget reached ($${spent.toFixed(4)} of $${ledger.budgetUsd})`); };
const rows = [];
const changes = new Map();
try {
  for (const item of SCENES) {
    if (only && item.id !== only) continue;
    const row = { id: item.id };
    rows.push(row);
    try {
    if (outOfGameOnly(item.narration)) { row.ooc = true; row.right = item.expect.ooc === true; continue; }
    const hp = (id) => item.hp?.[id] ?? records.find((r) => r.id === id).hp;
    const worn = (id) => [...records.find((r) => r.id === id).worn, ...(item.gain?.[id] ?? [])];
    for (const [id, looks] of Object.entries(item.look ?? {})) for (const look of looks) changes.set(id, applyLookChange(changes.get(id) ?? [], look) ?? changes.get(id) ?? []);
    const state = records.map((r) => ({ name: r.name, lines: [`wears or holds ${worn(r.id).join(", ")}`, r.packed.length ? `carries packed away (not in hand) ${r.packed.join(", ")}` : "",
      hp(r.id) === 0 ? "down at 0 hit points: unconscious, eyes closed" : ""].filter(Boolean) }));
    const profiles = records.map((r) => ({ name: r.name, kind: "person", look: r.look, changes: changes.get(r.id) ?? [] }));
    const request = briefRequest({ narration: storyText(item.narration), heroName: records[0].name, names: records.slice(1).map((r) => r.name), people: scene.map(({ name, role }) => ({ name, role })),
      placeName: item.place, profiles, state, clock: { timeOfDay: null }, previous: null, style: "Painterly fantasy illustration, muted earthy palette, cinematic light.", comment: null, language: "ru" });
    reserve(BRIEF_RESERVE_USD);
    const started = Date.now();
    const response = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model: BRIEF_MODEL, max_tokens: 3000, output_config: { effort: "low" }, system: request.system, messages: [{ role: "user", content: request.user }] }), signal: AbortSignal.timeout(60_000) });
    const value = await response.json().catch(() => null);
    const usage = value?.usage ?? {};
    spent += ((usage.input_tokens ?? 0) * BRIEF_PRICE_PER_MILLION.input + (usage.output_tokens ?? 0) * BRIEF_PRICE_PER_MILLION.output) / 1_000_000;
    const text = (value?.content ?? []).filter((block) => block.type === "text").map((block) => block.text).join("\n");
    const brief = parseBrief(text);
    row.briefMs = Date.now() - started;
    if (!brief) { row.error = `no brief (${response.status})`; continue; }
    for (const update of brief.profileUpdates) {
      const id = scene.find((p) => p.name === update.who)?.id;
      if (id) changes.set(id, applyLookChange(changes.get(id) ?? [], update.change) ?? changes.get(id) ?? []);
    }
    const { people, entityIds, names } = directPeople(brief, scene, records.map((r) => ({ ...r, hp: hp(r.id) })), {
      look: (id) => [records.find((r) => r.id === id).look, (changes.get(id) ?? []).length ? `Now: ${changes.get(id).join("; ")}.` : ""].filter(Boolean).join(" "),
      gear: (id) => ({ worn: worn(id), packed: records.find((r) => r.id === id).packed }) });
    const prompt = compileBriefPrompt({ brief, people, references: [], style: "Painterly fantasy illustration, muted earthy palette, cinematic light.", modelId: MODEL, names });
    Object.assign(row, { who: entityIds.map((id) => records.find((r) => r.id === id).name), whoRight: item.expect.who.every((id) => entityIds.includes(id)) && entityIds[0] === HERO,
      caption: brief.caption, captionRussian: /[а-яё]/i.test(brief.caption ?? ""), labels: people.map((p) => p.label), directions: brief.people.map((d) => ({ who: d.who, looksAt: d.looksAt, hands: d.hands })),
      namesInPrompt: records.some((r) => r.name.split(" ").flatMap((part) => [part, ...latinSpellings(part)]).some((part) => part.length > 2 && prompt.toLowerCase().includes(part.toLowerCase()))), avoid: brief.avoid, profileUpdates: brief.profileUpdates });
    await writeFile(join(out, `${item.id}.prompt.txt`), prompt, "utf8");
    reserve(IMAGE_RESERVE_USD);
    // The app's own request (picture-job.ts): the permissive moderation level, a block is still a refusal.
    const image = await generateOpenAIImage(openaiKey, { model: MODEL, prompt, width: 1344, height: 768, quality: "high", format: "jpeg", moderation: "low" });
    spent += image.priceUsdMicros / 1_000_000;
    row.imageUsd = image.priceUsdMicros / 1_000_000;
    await writeFile(join(out, `${item.id}.jpg`), image.bytes);
    reserve(CHECK_RESERVE_USD);
    const check = await checkFrame(apiKey, { image: { bytes: image.bytes, contentType: image.contentType },
      people: entityIds.map((id) => ({ key: id, label: people.find((p) => p.key === id).label, worn: worn(id), packed: records.find((r) => r.id === id).packed, down: hp(id) === 0 })),
      moment: brief.beat });
    spent += check.costUsdMicros / 1_000_000;
    row.check = check.verdict ? { problems: check.verdict.problems, gaze: check.verdict.gaze.map((g) => ({ who: records.find((r) => r.id === g.key)?.name, looksAt: g.looksAt })) } : { error: check.error };
    } catch (error) {
      if (/budget reached/.test(String(error?.message))) throw error;
      row.error = `${error?.code ?? "error"}: ${String(error?.detail ?? error?.message ?? error).slice(0, 160)}`;
    }
    await writeFile(join(out, "probe.json"), JSON.stringify({ run, spentUsd: spent, rows }, null, 2), "utf8");
  }
} finally { await ledger.settle(spent, `scripts/eval/fix-s2/picture-probe.mjs (${run})`); }
await writeFile(join(out, "probe.json"), JSON.stringify({ run, spentUsd: spent, rows }, null, 2), "utf8");
for (const row of rows) {
  if (row.ooc) { console.log(`${row.right ? "✓" : "✗"} ${row.id}: out of game — no call`); continue; }
  if (row.error && !row.who) { console.log(`✗ ${row.id}: ${row.error}`); continue; }
  if (row.error) console.log(`✗ ${row.id}: ${row.error}`);
  console.log(`${row.whoRight ? "✓" : "✗"} ${row.id}: who ${row.who.join(", ")} · caption ${row.captionRussian ? "ru" : "NOT ru"} «${row.caption}» · names in prompt: ${row.namesInPrompt ? "YES" : "no"}`);
  console.log(`   directions: ${row.directions.map((d) => `${d.who} → ${d.looksAt}${d.hands ? ` [${d.hands}]` : ""}`).join(" | ")}`);
  console.log(`   avoid: ${row.avoid}; updates: ${row.profileUpdates.map((u) => `${u.who}: ${u.change}`).join("; ") || "none"}`);
  if (row.check) console.log(`   check: ${row.check.error ? `error ${row.check.error}` : `${row.check.problems.length ? row.check.problems.join("; ") : "no problems"} · gaze ${row.check.gaze.map((g) => `${g.who} → ${g.looksAt}`).join(", ")}`}`);
}
console.log(`spent $${spent.toFixed(4)} (${run})`);
