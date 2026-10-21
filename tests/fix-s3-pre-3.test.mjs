// Fixes before session 3 (docs/stages/FIX_S3_PRE.md) 2.3 — the campaign the owner will play: the data the code's
// defaults do not reach. Each finding of the audit re-checked on the candidate first (docs/runs/fix-s3-pre-report.md).
// Disposable PGlite databases and pure functions only.
import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { fixture } from "./phase35-storage-fixture.mjs";
import { setup } from "./universal-bootstrap-fixture.mjs";
import { prepDecision, FIRST_TURN_PREP_WAIT_MS } from "../src/lib/gameplay/dm-loop/prep-schedule.ts";
import { buildPrepRequest } from "../src/lib/gameplay/dm-loop/hidden-layer.ts";
import { parseDigest } from "../src/lib/gameplay/dm-loop/digest.ts";
import { FIRST_TURN_COMPANIONS } from "../src/lib/gameplay/dm-loop/context.ts";
import { HEADERS_RU } from "../src/lib/gameplay/dm-loop/roles-ru.ts";
import { parseGalleryTurns, galleryTurnsOr } from "../src/lib/visual-frame/gallery-turns.ts";
import { chronicleChapters } from "../src/lib/visual-frame/pictures.ts";
import { readErrorMessage, ClientPersistenceError, RECORDS_READ_FAILED } from "../src/lib/persistence/client.ts";
import { DM_OPTION_DEFAULTS } from "../src/lib/gameplay/dm-loop/options.ts";

const src = (file) => readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
const SHOW_DC = "202610210402_fix_s3_pre_show_dc.sql";
const GALLERY = "202610210403_fix_s3_pre_gallery_turns.sql";

test("2.3 A-39 / A-71: the migration shows the DC on a campaign stored with it hidden — a new settings revision, the history kept; new campaigns are seeded with it shown", async () => {
  const files = (await readdir(new URL("../supabase/migrations/", import.meta.url))).filter((name) => name.endsWith(".sql")).sort();
  const f = await fixture(files.indexOf(SHOW_DC));
  try {
    const cid = await f.campaign("Кампания владельца (синтетика)");
    const before = await f.one("select values->>'showDc' dc, revision from public.rpg_settings where campaign_id=$1", [cid]);
    assert.equal(before.dc, "false", "campaign.create seeded the DC hidden");
    await f.db.exec(await readFile(new URL(SHOW_DC, f.folder), "utf8"));
    const after = await f.one("select values->>'showDc' dc, revision from public.rpg_settings where campaign_id=$1", [cid]);
    assert.deepEqual([after.dc, after.revision], ["true", before.revision + 1]);
    const history = await f.query("select revision, values->>'showDc' dc from public.rpg_settings_revisions where campaign_id=$1 order by revision", [cid]);
    assert.deepEqual(history.at(-1), { revision: before.revision + 1, dc: "true" });
    assert.ok(history.some((row) => row.dc === "false"), "the old revision stays in the history");
    const freshId = await f.campaign("Новая кампания (синтетика)");
    assert.equal((await f.one("select values->>'showDc' dc from public.rpg_settings where campaign_id=$1", [freshId])).dc, "true", "campaign.create seeds it shown");
  } finally { await f.db.close(); }
});

test("2.3 KF-hidden-layer: when the prep runs — never from Settings, rebuilt when «Тайны» are saved, the first turn waits once", () => {
  const base = { hasLayer: false, running: false, failedRecently: false, waitedBefore: false, committedTurns: 0 };
  assert.equal(prepDecision("settings", base), "none", "the Settings read never schedules it");
  assert.equal(prepDecision("play", base), "background");
  assert.equal(prepDecision("play", { ...base, hasLayer: true }), "none");
  assert.equal(prepDecision("play", { ...base, failedRecently: true }), "none", "a failed prep waits an hour");
  assert.equal(prepDecision("secrets_saved", { ...base, hasLayer: true }), "rebuild", "«Тайны» saved after the layer: rebuilt on them");
  assert.equal(prepDecision("secrets_saved", base), "background");
  assert.equal(prepDecision("secrets_saved", { ...base, running: true }), "none");
  assert.equal(prepDecision("first_turn", base), "wait", "a brand-new campaign's first turn waits for it");
  assert.equal(prepDecision("first_turn", { ...base, waitedBefore: true }), "none", "one wait, once");
  assert.equal(prepDecision("first_turn", { ...base, committedTurns: 3 }), "none", "a played campaign never waits");
  assert.equal(prepDecision("first_turn", { ...base, hasLayer: true }), "none");
  assert.ok(FIRST_TURN_PREP_WAIT_MS >= 90_000 && FIRST_TURN_PREP_WAIT_MS <= 180_000);
  // The wiring: the Settings screen reads /play «for=settings», the route passes prep: false, the save of «Тайны» schedules
  // the rebuild, the first turn awaits the prep.
  assert.match(src("src/components/registry/settings-screen.tsx"), /\/api\/campaigns\/\$\{id\}\/play\?for=settings/);
  assert.match(src("src/app/api/campaigns/[campaignId]/play/route.ts"), /get\("for"\) === "settings"[\s\S]*readPlay\(campaignId, forSettings \? \{ prep: false \} : \{\}\)/);
  const service = src("src/lib/server/gameplay-service.ts");
  assert.match(service, /options\.prep !== false && prepSchedulable\(campaignId\)/);
  assert.match(service, /if \(newOrdinary && input\.mode === "game"\)\s+await awaitFirstTurnPrep\(/);
  assert.match(src("src/lib/server/dm-secrets.ts"), /if \(v\.body\.trim\(\) && v\.body\.trim\(\) !== \(was \?\? ""\)\.trim\(\)\) scheduleSecretsPrep\(campaignId, user\.id\)/);
  assert.match(src("src/lib/server/hidden-layer-prep.ts"), /if \(hiddenLayerOf\(source\) && reason !== "secrets"\)/, "a rebuild runs although a layer exists");
});

test("2.3 KF-hidden-layer: the rebuild request builds on the owner's «Тайны»; the digest's rewrite of the layer (its missing test)", () => {
  const source = { snapshot: { campaign: { id: "c" }, entities: [], settings: { values: { language: "ru" } } }, runtime: { worldMinutes: 0 },
    privateState: { fact: { hidden_layer: "Тайный слой кампании: старая правда." } } };
  const minimal = { ...source, privateState: { fact: {} } };
  // parseDigest: the layer is rewritten only when the campaign has one; bounded; a blank one is ignored.
  const reply = (layer) => JSON.stringify({ recap: "Мы у заставы.", title: "Застава", notebook: "", plans: [], hiddenLayer: layer });
  assert.equal(parseDigest(reply("Тайный слой: правда стала глубже."), source, 0).hiddenLayer, "Тайный слой: правда стала глубже.");
  assert.equal(parseDigest(reply("Тайный слой: новый."), minimal, 0).hiddenLayer, null, "no layer, no rewrite (the prep writes the first one)");
  assert.equal(parseDigest(reply("   "), source, 0).hiddenLayer, null);
  assert.equal(parseDigest(reply("я".repeat(9000)), source, 0).hiddenLayer.length, 5800);
  // The rebuild's instructions (the request itself is built by buildPrepRequest on a full source in tests/fix-s2-b).
  const hidden = src("src/lib/gameplay/dm-loop/hidden-layer.ts");
  assert.match(hidden, /The owner has just written or changed his secrets for this campaign \(«Тайны»\)[\s\S]*rewrite it now so it builds on them and never contradicts them/);
  assert.match(hidden, /Keep everything play has already established/);
  void buildPrepRequest;
});

test("2.3 B-12: «Тайны» is a one-line steer — one row, 200 characters, the hint; the owner's view of the layer stays off", () => {
  const field = src("src/components/registry/owner-secrets.tsx");
  assert.match(field, /rows=\{1\} maxLength=\{OWNER_STEER_MAX_CHARS\}/);
  assert.match(field, /export const OWNER_STEER_MAX_CHARS = 200;/);
  assert.match(field, /Необязательная подсказка ведущему в одну строку, например: пусть за этим стоит культ/);
  assert.doesNotMatch(field, /Правда, которую знаешь ты и ведущий/);
  assert.equal(DM_OPTION_DEFAULTS.secretsVisible, false, "«Показывать мне тайны ведущего» stays off");
});

test("2.3 A-15: the first turn records the people going with the hero as companions — the line in both languages, gone after the first turn", async () => {
  const world = { title: "Серый тракт (синтетика)", premise: "Синтетический мир: тракт, броды, заставы. Правила — D&D 5e." };
  const adventure = "Охранять брод от разбойников.\n\nС героем идут: Тобин, лучник, и Мэй, травница.";
  const f = await setup({ world, name: "Ярвен", description: "Наёмная мечница.", caps: [], limits: [], item: null, adventure,
    location: "Кривой брод", situation: "Полдень у брода.", npc: "Тобин", narration: "Полдень у брода. Что ты делаешь?" }, "ru", 999);
  try {
    f.creation = { ...f.creation, possessions: [] };
    await f.create();
    await f.startOpening();
    const { buildDmLoopContext } = await import("../src/lib/gameplay/dm-loop/context.ts");
    const source = (await f.one("select public.rpg_dossier($1,$2,'source','{}'::jsonb,null) result", [f.owner, f.cid])).result;
    const input = { operationId: randomUUID(), campaignId: f.cid, timeline: source.timeline, expectedRevision: source.runtime.revision,
      mode: "game", input: "Иду к броду.", companionId: null, listenerIds: [], mechanic: null };
    const text = (s) => buildDmLoopContext(s, input).system.map((block) => block.text).join("\n");
    const english = text({ ...source, dmOptions: { ...(source.dmOptions ?? {}), instructions: "en" } });
    assert.ok(english.includes(FIRST_TURN_COMPANIONS), "the English instructions carry the line");
    const russian = text({ ...source, dmOptions: { ...(source.dmOptions ?? {}), instructions: "ru" } });
    assert.ok(russian.includes(HEADERS_RU[FIRST_TURN_COMPANIONS]), "the Russian instructions carry its Russian");
    assert.match(HEADERS_RU[FIRST_TURN_COMPANIONS], /^Это первый ход кампании: люди, которых владелец отметил как идущих с героем .* записываются как спутники — upsert_character kind companion, party true/);
    const played = { ...source, runtime: { ...source.runtime, turns: [...source.runtime.turns, { id: randomUUID(), status: "committed", mode: "game" }] } };
    assert.ok(!text({ ...played, dmOptions: { instructions: "en" } }).includes(FIRST_TURN_COMPANIONS), "after the first turn the line is gone");
  } finally { await f.db.close(); }
});

test("2.3 B-13: the gallery reads every committed game turn (not the /play window of 64), grouped by session; «Линии времени» in the menu", async () => {
  const files = (await readdir(new URL("../supabase/migrations/", import.meta.url))).filter((name) => name.endsWith(".sql")).sort();
  assert.ok(files.includes(GALLERY));
  const c = await (await import("./dm-loop-fixture.mjs")).loopCampaign({ language: "ru" });
  try {
    for (let i = 0; i < 66; i++) await c.turn(`Ход ${i + 1}.`, [{ text: `Рассказ хода ${i + 1}.\nВторая строка.`, toolCalls: [{ name: "finish_turn", arguments: { sceneKinds: ["quiet"], spotlight: [], playerMoment: false } }] }]);
    const play = await c.f.runtime(c.cid, "play");
    const window = play.turns.filter((turn) => turn.status === "committed" && turn.mode === "game").length;
    const own = parseGalleryTurns((await c.f.one("select public.rpg_gallery_turns($1,$2) r", [c.owner, c.cid])).r);
    assert.ok(window <= 64, "the /play window");
    assert.equal(own.length, 66, "the gallery's own read has every committed game turn");
    assert.equal(own[0].narration, "Рассказ хода 1.", "the first line only");
    assert.ok(own.every((row) => row.session_id), "each with its session");
    await assert.rejects(c.f.one("select public.rpg_gallery_turns($1,$2) r", [randomUUID(), c.cid]), /rpg_forbidden/);
    const snapshot = await c.f.saves(c.cid, "campaign");
    const frame = (turnId) => ({ id: randomUUID(), kind: "frame", composition: "frame", version: 1, subjectKind: "turn", subjectId: turnId, status: "ready", hidden: false, createdAt: "2026-10-21T00:00:00Z", caption: "" });
    const board = { pictures: [frame(own[0].id), frame(own[65].id)] };
    const chapters = chronicleChapters(snapshot, galleryTurnsOr(own, play.turns), board);
    assert.equal(chapters.flatMap((chapter) => chapter.turns).filter((row) => row.frame).length, 2, "the frame of the very first turn is in the gallery again");
    assert.deepEqual(galleryTurnsOr(null, play.turns).length, play.turns.length, "a failed read keeps the /play window");
  } finally { await c.f.db.close(); }
  assert.match(src("src/components/registry/shell.tsx"), /\{ id: "timeline", label: c\("Линии времени", "Timelines"\)/);
  assert.match(src("src/components/registry/pictures-screen.tsx"), /\/api\/campaigns\/\$\{encodeURIComponent\(data\.campaign\.id\)\}\/gallery/);
});

test("2.3 A-62: a failed records read has its own words (not «save not confirmed»); a send whose answer never came reads the stored turn", () => {
  assert.equal(readErrorMessage(new ClientPersistenceError("unavailable")), RECORDS_READ_FAILED);
  assert.equal(readErrorMessage(new Error("network")), RECORDS_READ_FAILED);
  assert.match(readErrorMessage(new ClientPersistenceError("unauthenticated")), /sign in again/, "other codes keep their words");
  assert.equal(JSON.parse(src("src/lib/locales/ru.json"))[RECORDS_READ_FAILED], "Не удалось обновить записи кампании. Сохранённое цело; страница попробует ещё раз.");
  assert.match(src("src/components/persistence-context.tsx"), /setError\(readErrorMessage\(cause\)\)/);
  assert.match(src("src/components/gameplay-composer.tsx"), /cause\.code === "unavailable"\) \{\s+const stored = await loadTurn\(campaignId, attempt\.operationId\)\.catch\(\(\) => null\);\s+if \(stored\) \{ await accept\(stored\); return; \}/);
});
