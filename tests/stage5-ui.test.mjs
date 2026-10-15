// Stage 5: presentation-only view models, the visual autopilot planner, the
// fal adapter (fake transport only) and the universality guard for new code.
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  codexOf,
  holdingsNavLabel,
  holdingsOf,
  partyOf,
  resourcesOf,
  worldClock,
} from "../src/lib/ui/campaign-view.ts";
import { itemRarity, itemTypeKey } from "../src/lib/ui/rarity.ts";
import {
  defaultAutopilotSettings,
  parseAutopilotSettings,
  parseLedger,
  planVisualAutopilot,
  subjectKey,
} from "../src/lib/ui/visual-autopilot.ts";
import { appendToComposerDraft } from "../src/lib/ui/composer-draft.ts";
import { journalKey } from "../src/lib/gameplay/client-state.ts";
import {
  falImagePriceUsdMicros,
  falQueueRoot,
  falRequestBody,
  generateFalImage,
  permittedFalMediaUrl,
} from "../src/lib/visual-frame/fal-image.ts";
import { shovSample } from "../src/lib/ui/preview/stage5-fixture.ts";
import { noirSample } from "../src/lib/ui/preview/stage5-noir.ts";

const root = join(fileURLToPath(new URL(".", import.meta.url)), "..");

test("resources pair a counter with its _max and keep money apart, whatever the ruleset names them", () => {
  const { resources, money } = resourcesOf({ resources: { resource_stress: 2, resource_stress_max: 6, resource_favors: 3, currency_credits: 1240 } });
  assert.deepEqual(resources.map((row) => [row.key, row.value, row.max]), [["resource_stress", 2, 6], ["resource_favors", 3, null]]);
  assert.deepEqual(money.map((row) => [row.key, row.value]), [["currency_credits", 1240]]);
  assert.equal(money[0].label, "Credits");
});

test("holdings: camp always, transports from records, label follows the kinds", () => {
  const noir = noirSample.snapshot();
  const holdings = holdingsOf(noir);
  assert.deepEqual(holdings.map((row) => row.kind), ["camp", "transport"]);
  assert.equal(holdings[1].items.length, 1);
  assert.equal(holdingsNavLabel(holdings, "ru"), "Имущество");
  const campOnly = { ...noir, entities: noir.entities.filter((row) => row.kind !== "transport"), storages: noir.storages.filter((row) => row.kind !== "transport") };
  assert.equal(holdingsNavLabel(holdingsOf(campOnly), "ru"), "Лагерь");
  assert.equal(holdingsNavLabel(holdingsOf(campOnly), "en"), "Camp");
  const empty = { ...campOnly, storages: [] };
  assert.equal(holdingsOf(empty)[0].kind, "camp", "the camp is shown even before it has a storage");
});

test("party presence follows the public play configuration; codex lists only player-visible records", () => {
  const data = shovSample.snapshot();
  const play = shovSample.play();
  const party = partyOf(data, play);
  assert.ok(party.length >= 5);
  assert.equal(party.filter((row) => !row.present).length, 1);
  const groups = codexOf(data, "", "ru");
  assert.deepEqual(groups.map((group) => group.id), ["allies", "known"]);
  assert.equal(codexOf(data, "zzz-nobody", "en").length, 0);
});

test("world clock", () => {
  assert.equal(worldClock(4 * 1440 + 400, "ru"), "День 5 · 06:40");
  assert.equal(worldClock(null, "en"), null);
});

test("rarity is never guessed from item text; item types normalize for one shared image", () => {
  const item = { name: "Ancient magic relic «Rune»", category: "misc", description: "story item, magic", mechanics: "magical", quantity: 1 };
  assert.equal(itemRarity(item), null);
  assert.equal(itemRarity({ ...item, rarity: "relic" }), "relic");
  assert.equal(itemTypeKey({ name: "  Stim  Patch. ", category: "Consumable" }), itemTypeKey({ name: "stim patch", category: "consumable" }));
  assert.notEqual(itemTypeKey({ name: "Rope", category: "gear" }), itemTypeKey({ name: "Rope", category: "tool" }));
});

test("autopilot: off by default, respects toggles, cap, tried subjects and one picture per item type", () => {
  const data = noirSample.snapshot();
  const today = "2026-10-15";
  const ledger = parseLedger(null, today);
  assert.deepEqual(planVisualAutopilot(data, defaultAutopilotSettings, ledger), []);
  const on = { ...defaultAutopilotSettings, enabled: true };
  const all = planVisualAutopilot(data, on, ledger, 50);
  assert.equal(all[0].reason, "holding", "holdings come first");
  assert.ok(all.some((row) => row.reason === "portrait"));
  assert.ok(all.some((row) => row.reason === "place"));
  // Two stacks of the same type share one plan entry.
  const doubled = { ...data, items: [...data.items, { ...data.items[4], id: "7a7a7a7a-0000-4000-8000-000000000999", quantity: 2 }] };
  const types = planVisualAutopilot(doubled, on, ledger, 50).filter((row) => row.reason === "item").map((row) => row.label);
  assert.equal(new Set(types).size, types.length);
  assert.equal(planVisualAutopilot(data, { ...on, items: false, portraits: false, places: false }, ledger, 50).every((row) => row.reason === "holding"), true);
  assert.deepEqual(planVisualAutopilot(data, { ...on, dailyCap: 3 }, { ...ledger, count: 3 }, 50), []);
  const tried = { ...ledger, attempted: [subjectKey(all[0].subject)] };
  assert.notDeepEqual(planVisualAutopilot(data, on, tried)[0].subject, all[0].subject, "a tried subject is never retried automatically");
  assert.equal(parseLedger({ day: "2026-10-14", count: 9, attempted: ["entity:x"] }, today).count, 0, "the count resets each day");
  assert.equal(parseAutopilotSettings({ dailyCap: 5000, provider: "fal", enabled: true }).dailyCap, defaultAutopilotSettings.dailyCap);
  assert.equal(parseAutopilotSettings({ provider: "fal" }).provider, "fal");
});

test("composer drafts: suggested text is appended, never over a turn in flight", () => {
  const store = new Map();
  const storage = { getItem: (key) => store.get(key) ?? null, setItem: (key, value) => store.set(key, value), removeItem: (key) => store.delete(key) };
  const input = { campaignId: "c", mode: "game", companionId: null, timeline: { timelineId: "t", epoch: 1 }, text: "I travel to the Spire." };
  assert.equal(appendToComposerDraft(storage, input), true);
  assert.equal(appendToComposerDraft(storage, { ...input, text: "Quietly." }), true);
  const key = journalKey("c", "game", null, input.timeline);
  assert.equal(JSON.parse(store.get(key)).text, "I travel to the Spire.\nQuietly.");
  store.set(key, JSON.stringify({ ...JSON.parse(store.get(key)), attempt: { operationId: "op", campaignId: "c", mode: "game", companionId: null, timeline: input.timeline, input: "x" } }));
  assert.equal(appendToComposerDraft(storage, { ...input, text: "More" }), false);
});

test("fal prices follow the published per-megapixel rates", () => {
  assert.equal(falImagePriceUsdMicros("fal-ai/flux-2-pro", 1024, 1024), 30_000);
  assert.equal(falImagePriceUsdMicros("fal-ai/flux-2-pro", 1920, 1080), 45_000);
  assert.equal(falImagePriceUsdMicros("fal-ai/flux-2-pro", 1024, 576), 30_000);
  assert.equal(falImagePriceUsdMicros("fal-ai/flux-2/flash", 1024, 1024), 5_000);
  assert.equal(falQueueRoot("fal-ai/flux-2/flash"), "https://queue.fal.run/fal-ai/flux-2");
  assert.throws(() => falRequestBody({ model: "fal-ai/flux-2-pro", prompt: "x", size: "square_hd", format: "webp" }));
  assert.equal(permittedFalMediaUrl("https://v3.fal.media/files/a.jpg"), true);
  assert.equal(permittedFalMediaUrl("https://evil.example/a.jpg"), false);
});

test("fal adapter: submit, poll, fetch; the key never reaches the media CDN", async () => {
  const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
  const calls = [];
  let polls = 0;
  const json = (value, status = 200) => new Response(JSON.stringify(value), { status, headers: { "Content-Type": "application/json" } });
  const fetcher = async (url, init = {}) => {
    calls.push({ url: String(url), auth: init.headers?.Authorization ?? null, method: init.method ?? "GET" });
    if (url === "https://queue.fal.run/fal-ai/flux-2-pro") return json({ request_id: "req-123456789" });
    if (String(url).endsWith("/status?logs=0")) return json({ status: polls++ ? "COMPLETED" : "IN_PROGRESS" });
    if (url === "https://queue.fal.run/fal-ai/flux-2-pro/requests/req-123456789") return json({ images: [{ url: "https://v3.fal.media/files/x.png", width: 1024, height: 1024 }] });
    if (url === "https://v3.fal.media/files/x.png") return new Response(png, { headers: { "Content-Type": "image/png" } });
    throw new Error("unexpected " + url);
  };
  const result = await generateFalImage("test-key", { model: "fal-ai/flux-2-pro", prompt: "A lantern", size: "square_hd", format: "png" }, { fetcher, sleep: async () => {} });
  assert.equal(result.contentType, "image/png");
  assert.equal(result.priceUsdMicros, 30_000);
  assert.equal(calls.filter((row) => row.method === "POST").length, 1, "one submit, never retried");
  assert.equal(calls.find((row) => row.url.includes("fal.media")).auth, null);
  assert.ok(calls.filter((row) => row.url.includes("queue.fal.run")).every((row) => row.auth === "Key test-key"));
  const refused = async () => json({ detail: "The content could not be processed" }, 422);
  await assert.rejects(generateFalImage("k", { model: "fal-ai/flux-2-pro", prompt: "x", size: "square_hd", format: "png" }, { fetcher: refused }),
    (error) => error.code === "validation" && /HTTP 422/.test(error.detail) && !/k/.test(error.detail.replace(/[a-z]/g, (m) => (m === "k" ? "K" : m)).replace("K", "")));
  await assert.rejects(generateFalImage("", { model: "fal-ai/flux-2-pro", prompt: "x", size: "square_hd", format: "png" }), (error) => error.code === "not_configured");
});

// Universality: sample content lives only in preview fixtures, and new Stage 5
// code carries no ruleset vocabulary (it comes from records and helpers).
const STAGE5_FILES = [
  "src/components/registry", "src/lib/ui", "src/app/registry.css", "src/app/fonts.ts",
  "src/lib/visual-frame/fal-image.ts", "src/lib/server/media/fal-image-provider.ts", "src/app/preview/stage-5",
];
function walk(path) {
  const full = join(root, path);
  if (statSync(full).isFile()) return [full];
  return readdirSync(full).flatMap((name) => walk(join(path, name)));
}
const stage5Code = STAGE5_FILES.flatMap(walk)
  .filter((file) => !relative(root, file).replaceAll("\\", "/").startsWith("src/lib/ui/preview/"));
const SAMPLE_WORDS = ["Мир Шва", "Шва", "Джеймс", "Хейл", "Мэг", "Урзул", "Вольф", "Зарга", "Ирэна", "Изольд", "Тиаго", "Альвареш", "Женев", "Лиссабон", "Бабк",
  "эфирит", "Neon & Rain", "Dana", "Okafor", "Lazarus", "Kowloon", "Velvet", "Citroën", "Rook", "Mara"];
const RULESET_WORDS = [/\bКД\b/u, /\bКС\b/u, /spell_slot/i, /\bd20\b/i, /armor_class/i, /\bСИЛ\b/u, /\bЛОВ\b/u, /Ячейки/u, /\bзм\b/u, /sorcery/i, /Гримуар/u, /(?<!--)\bgold\b/i];

test("Stage 5 app code holds no sample names and no ruleset-specific labels", () => {
  assert.ok(stage5Code.length > 20);
  for (const file of stage5Code) {
    const text = readFileSync(file, "utf8");
    for (const word of SAMPLE_WORDS) assert.ok(!text.includes(word), `${relative(root, file)} contains sample content “${word}”`);
    for (const pattern of RULESET_WORDS) assert.ok(!pattern.test(text), `${relative(root, file)} contains ruleset vocabulary ${pattern}`);
  }
});

test("both preview samples build valid-looking public snapshots; the second has no D&D sheet", () => {
  for (const sample of [shovSample, noirSample]) {
    const data = sample.snapshot();
    const play = sample.play();
    assert.equal(play.campaignId, data.campaign.id);
    assert.ok(data.entities.some((row) => row.kind === "player"));
    for (const item of data.items) assert.ok(data.storages.some((row) => row.id === item.storage_id), item.name);
  }
  const hero = noirSample.snapshot().entities.find((row) => row.kind === "player");
  assert.equal(hero.character_sheet.attributes, null);
  assert.equal(hero.character_sheet.level, null);
  assert.ok(!Object.keys(hero.resources).some((key) => /spell|gold/.test(key)));
});

import { liveChanges, livePlayerMoment, liveTurnPhase } from "../src/lib/ui/live-turn-view.ts";
import { effortLabel } from "../src/lib/ui/effort.ts";

test("live stream view: accepted changes only, the player-moment signal, and the turn phase", () => {
  const view = {
    operationId: "op", text: "The rope holds.", status: "generating",
    changes: [
      { name: "money", ok: true, summary: "−12 credits · the ferryman" },
      { name: "item", ok: false, summary: "Unknown item" },
      { name: "finish_turn", ok: true, summary: "Your moment: describe how you do it" },
    ],
  };
  assert.deepEqual(liveChanges(view).map((change) => change.summary), ["−12 credits · the ferryman"]);
  assert.equal(livePlayerMoment(view), true);
  assert.equal(livePlayerMoment({ ...view, changes: [{ name: "finish_turn", ok: true, summary: "Turn recorded" }] }), false);
  assert.equal(liveTurnPhase(view, []), "streaming");
  assert.equal(liveTurnPhase(view, [{ id: "op", status: "generating" }]), "streaming");
  assert.equal(liveTurnPhase(view, [{ id: "op", status: "committed" }]), "saved");
  assert.equal(liveTurnPhase(view, [{ id: "op", status: "failed" }]), "discarded");
  assert.equal(liveTurnPhase({ ...view, status: "cancelled" }, []), "discarded");
  // The banner relies on finish_turn's public receipt summary; if a later stage rewords it, this fails.
  const execute = readFileSync(join(root, "src/lib/gameplay/dm-loop/execute.ts"), "utf8");
  assert.ok(execute.includes('"Your moment: describe how you do it"'));
});

test("effort names follow the model's own levels", () => {
  assert.equal(effortLabel("xhigh", "en"), "extra high");
  assert.equal(effortLabel("xhigh", "ru"), "очень высокая");
  assert.equal(effortLabel("max", "en"), "max");
  assert.equal(effortLabel("turbo", "en"), "turbo", "an unknown level is shown as the model names it");
});

import { displayLabel } from "../src/lib/ui/labels.ts";
import { placePinLabels } from "../src/lib/map/label-layout.ts";
import { translate } from "../src/lib/i18n.ts";

test("display labels: a label the record provides wins, then the catalog (numbered keys too), then the raw phrase", () => {
  const ru = (key, values) => translate("ru", key, values);
  const en = (key, values) => translate("en", key, values);
  assert.equal(displayLabel("Armor class", ru), "Класс доспеха");
  assert.equal(displayLabel("Spell slots 1", ru), "Ячейки заклинаний 1");
  assert.equal(displayLabel("Spell slots 1", en), "Spell slots 1", "the English sample stays English");
  assert.equal(displayLabel("Armor class", en), "Armor class");
  assert.equal(displayLabel("Nerve", ru), "Nerve", "an unknown ruleset key is shown as the record names it");
  assert.equal(displayLabel("Gold", ru, "Дукаты"), "Дукаты");
  for (const phrase of ["Spell dc", "Sorcery points", "Gold", "Crew", "Cargo", "Tool", "Misc"]) assert.notEqual(displayLabel(phrase, ru), phrase, phrase);
});

test("pin labels: the current place is always placed; crowded labels go above, then hide", () => {
  const mark = (x, y) => ({ x, y, w: 17, h: 17 });
  const label = { w: 90, h: 22 };
  // Three pins 30 px apart on one row, one far away: labels avoid other labels and marks.
  const layout = placePinLabels([
    { id: "far", mark: mark(400, 300), label, priority: 4 },
    { id: "b", mark: mark(130, 100), label, priority: 3 },
    { id: "current", mark: mark(100, 100), label, priority: 0 },
    { id: "c", mark: mark(160, 100), label, priority: 3 },
  ]);
  assert.equal(layout.current, "below");
  assert.equal(layout.far, "below");
  assert.equal(layout.b, "above");
  assert.equal(layout.c, "hidden");
  // Later priorities never push the current place away.
  assert.equal(placePinLabels([{ id: "x", mark: mark(100, 100), label, priority: 3 }, { id: "cur", mark: mark(100, 100), label, priority: 0 }]).cur, "below");
});

import { dmTurnModels } from "../src/lib/gameplay/dm-settings-client.ts";
import { dmModelSpec } from "../src/lib/model-runtime/dm-models.ts";

test("the client model list carries each model's own default effort and levels, as the server resolves them", () => {
  for (const entry of dmTurnModels) {
    const spec = dmModelSpec(entry.providerId, entry.modelId);
    assert.ok(spec, entry.modelId);
    assert.equal(entry.defaultEffort, spec.defaultReasoning, entry.modelId);
    assert.deepEqual([...entry.efforts], [...spec.reasoning], entry.modelId);
  }
});
