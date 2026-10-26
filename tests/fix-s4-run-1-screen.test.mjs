// FIX_S4 item 6 (docs/stages/FIX_S4_TABLE.md, «Small screen things»): the «⚡ important turn» toggle off by default,
// on/off said plainly and following the server's flag; depth by meaning (an irreversible decision thinks deep); the
// action box empty after Send; the «Your story is ready to begin» placeholder gone once a turn exists; the hint under the
// four buttons once per campaign; the campaign editor moved off the game screen. Disposable PGlite and a scripted model
// only — no paid calls.
import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import ts from "typescript";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { fixture, id } from "./phase2-mechanics-fixtures.mjs";
import { loopCampaign } from "./dm-loop-fixture.mjs";
import { translate } from "../src/lib/i18n.ts";
import { chooseDepth, decisiveInput, irreversibleInput, tensionSignals } from "../src/lib/gameplay/dm-loop/depth.ts";
import { parseDmSettings } from "../src/lib/gameplay/dm-loop/settings.ts";
import { DM_LOOP_DEFAULT_LIMITS } from "../src/lib/gameplay/dm-loop/limits.ts";
import { DM_OPTION_DEFAULTS } from "../src/lib/gameplay/dm-loop/options.ts";
import { BOOST_USED_REASON, boostAfterTurn } from "../src/lib/ui/boost-toggle.ts";
import { firstShowing, hintKey } from "../src/lib/ui/hint-fold.ts";
import { turnSentAway } from "../src/lib/ui/composer-draft.ts";
import { journalKey, loadJournal, reconcileJournal, saveJournal } from "../src/lib/gameplay/client-state.ts";

const root = fileURLToPath(new URL("../", import.meta.url));
const require = createRequire(import.meta.url);
const src = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const noCall = () => assert.fail("a render must not call the server");

// ---- the live game screen and the owner's screen, rendered on the server with the campaign stores stubbed ----------
function sample() {
  const source = fixture();
  const data = source.snapshot;
  data.timeline = { timelineId: id("timeline"), epoch: 1 };
  data.entities = [{ ...data.entities[0], name: "James", hp: 12, max_hp: 12, stats: {}, resources: {}, conditions: [], equipment_slots: [] }];
  data.scenes = [];
  data.publicState.summary = "";
  data.publicState.current_scene_id = null;
  return { data, play: { ...source.runtime, timeline: data.timeline, rulesetId: "console-basic-v1" } };
}
function turn(data, overrides = {}) {
  return { id: id("turn"), campaign_id: data.campaign.id, session_id: data.sessions[0].id, timeline: data.timeline, mode: "game",
    input: "I step up to the sergeant's table.", companionId: null, listenerIds: [], status: "committed", expectedRevision: 1,
    committedRevision: 2, settingsRevision: 1, created_at: "2026-10-23T22:45:00Z", updated_at: "2026-10-23T22:46:00Z",
    narration: "The sergeant looks up.", visualDescription: null, checks: [], proposal: null, failure: null, canRetry: false, canCancel: false, ...overrides };
}
const dmSettings = (overrides = {}) => ({ campaignId: "c", runtime: "dm-loop-v1", dmTurn: { providerId: "anthropic", modelId: "claude-opus-5-5", reasoning: "high" },
  limits: { ...DM_LOOP_DEFAULT_LIMITS }, customLimits: false, depth: { min: "high", max: "high" }, notebookVisible: false, boostNext: false,
  voiceExamples: false, voiceMode: "off", voiceTokenCap: 30_000, split: null, snapshotsKeep: null, options: { ...DM_OPTION_DEFAULTS }, revision: 3, ...overrides });

// One module loader for every render (transpiling the screen's modules is the slow part); the stubs read the state of
// the render in progress.
const current = { data: null, play: null, language: "en" };
const load = (() => {
  const cache = new Map();
  const memory = () => ({ snapshot: { campaignId: current.data.campaign.id, timeline: current.data.timeline, runtimeRevision: 1, currentBoundary: null, sessions: [] }, loading: false, error: "", refresh: noCall });
  const campaign = () => ({ campaignId: current.data.campaign.id, data: current.data, loading: false, error: "", refresh: noCall, mutate: noCall });
  return function load(relative) {
    let path = resolve(root, relative);
    if (!existsSync(path)) path += existsSync(`${path}.tsx`) ? ".tsx" : ".ts";
    if (cache.has(path)) return cache.get(path);
    if (path.endsWith(".json")) return JSON.parse(readFileSync(path, "utf8"));
    const loaded = { exports: {} };
    cache.set(path, loaded.exports);
    const output = ts.transpileModule(readFileSync(path, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
    const localRequire = (name) => {
      if (name.endsWith("language-context")) return { useLanguage: () => ({ language: current.language, t: (key, values) => translate(current.language, key, values) }), LanguageProvider: ({ children }) => children };
      if (name.endsWith("persistence-context")) return { useCampaignData: campaign, useOptionalCampaignData: campaign, useWorkspaceData: () => null,
        useCampaignDraftScope: () => ({ timeline: current.data.timeline, stale: false }), useUnsavedChanges() {}, TimelineDraftNotice: () => null };
      if (name.endsWith("gameplay-runtime")) return { useGameplayRuntime: () => ({ play: current.play, loading: false, error: "", afterMutation: noCall, refresh: noCall }), notifyGameplayChanged: noCall };
      if (name.endsWith("session-memory-runtime")) return { useSessionMemory: memory };
      if (name === "next/link") return { __esModule: true, default: "a" };
      if (name === "next/image") return { __esModule: true, default: "img" };
      if (name === "next/navigation") return { useRouter: () => ({ push: noCall }), usePathname: () => `/campaigns/${current.data.campaign.id}/game` };
      if (name.endsWith(".css")) return { __esModule: true, default: new Proxy({}, { get: (_, key) => String(key) }) };
      if (name === "server-only") return noCall();
      if (name.startsWith(".") || name.startsWith("@/")) return load(name.startsWith("@/") ? resolve(root, "src", name.slice(2)) : resolve(dirname(path), name));
      return require(name);
    };
    vm.runInThisContext(`(function(require,module,exports){${output}\n})`, { filename: path })(localRequire, loaded, loaded.exports);
    cache.set(path, loaded.exports);
    return loaded.exports;
  };
})();
/** The live «Игра» (or «Для владельца») page; `settings` stands for the campaign's DM settings the shell reads. */
function render(screen, state, settings) {
  Object.assign(current, { data: state.data, play: state.play, language: state.language ?? "en" });
  const page = createElement(screen === "owner" ? load("src/components/registry/routes.tsx").OwnerRoute : load("src/components/persistent-game.tsx").PersistentGame);
  const { RegistryChrome } = load("src/components/registry/shell.tsx");
  return renderToStaticMarkup(settings === undefined ? page : createElement(RegistryChrome, { value: { dmSettings: settings } }, page));
}
const boostButton = (html) => /<button[^>]*data-testid="boost-toggle"[^>]*>[^<]*<\/button>/.exec(html)?.[0] ?? null;

// ---- 1. «⚡ important turn» ------------------------------------------------------------------------------------------
test("⚡ important turn: off by default and said plainly — «⚡ Important turn: off/on», in both languages", () => {
  // The flag is off unless the server says on: a fresh campaign, a row written before the flag, any non-true value.
  assert.equal(parseDmSettings({ campaignId: "c", runtime: "dm-loop-v1", dmTurn: null, limits: null, depth: null, notebookVisible: false, revision: 0 }).boostNext, false);
  assert.equal(parseDmSettings({ campaignId: "c", runtime: "dm-loop-v1", dmTurn: null, limits: null, depth: null, notebookVisible: false, boostNext: "yes", revision: 2 }).boostNext, false);
  const off = boostButton(render("game", sample(), dmSettings()));
  assert.ok(off, "the toggle is on the game screen when the campaign has a depth range");
  assert.match(off, /aria-pressed="false"/);
  assert.match(off, />⚡ Important turn: off<\/button>$/);
  assert.match(off, /class="chipButton"/, "a labelled toggle, not a lit icon");
  const on = boostButton(render("game", sample(), dmSettings({ boostNext: true })));
  assert.match(on, /aria-pressed="true"/);
  assert.match(on, />⚡ Important turn: on<\/button>$/);
  const ru = boostButton(render("game", { ...sample(), language: "ru" }, dmSettings()));
  assert.match(ru, />⚡ Важный ход: выкл<\/button>$/);
  assert.match(boostButton(render("game", { ...sample(), language: "ru" }, dmSettings({ boostNext: true }))), />⚡ Важный ход: вкл<\/button>$/);
  assert.match(off, /title="A manual override: the DM thinks the next turn through deeper\. When something irreversible is decided/);
  assert.equal(boostButton(render("game", sample(), dmSettings({ depth: null }))), null, "a fixed effort has no depth to boost");
});

test("⚡ important turn follows the server: a press saves on a fresh revision; a saved boosted turn turns it off; any other saved turn reads the flag again", () => {
  // The cause of the 268-second plain reply: the second press saved with the revision read when the page opened, was
  // refused as stale and flipped the button back to «on»; and after the boosted turn the screen kept its own «on».
  const game = src("src/components/registry/game-screen.tsx");
  const toggle = game.slice(game.indexOf("const toggleBoost"), game.indexOf("const place = currentPlace"));
  assert.match(toggle, /const fresh = await loadDmSettings\(data\.campaign\.id\);\n\s+setBoost\(\(await saveDmSettings\(data\.campaign\.id, \{ expectedRevision: fresh\.revision,/);
  assert.doesNotMatch(toggle, /expectedRevision: dmSettings\.revision/, "never the revision read when the page opened");
  assert.match(toggle, /const afterSaved = boostAfterTurn\(savedTurn\);/);
  assert.match(toggle, /if \(afterSaved === "spent"\) queueMicrotask\(\(\) => \{ if \(live\) setBoost\(false\); \}\);\n\s+else loadDmSettings\(data\.campaign\.id\)\.then\(\(fresh\) => \{ if \(live\) setBoost\(fresh\.boostNext\); \}/);
  // The rule the screen mirrors: the turn that took «important turn» records it as its depth reason.
  const boosted = chooseDepth({ min: "high", max: "max" }, "high", null, { tension: "calm", reason: "no tension signal" }, true);
  assert.equal(boosted.reason, BOOST_USED_REASON);
  assert.equal(boosted.effort, "max");
  assert.equal(boostAfterTurn({ status: "committed", stats: { depthReason: BOOST_USED_REASON } }), "spent");
  assert.equal(boostAfterTurn({ status: "committed", stats: { depthReason: "no tension signal; the base of the range" } }), "read");
  assert.equal(boostAfterTurn({ status: "committed" }), "read", "an older turn without stats: read the flag");
  for (const status of ["pending", "generating", "awaiting_confirmation", "failed", "cancelled"])
    assert.equal(boostAfterTurn({ status, stats: { depthReason: BOOST_USED_REASON } }), null, `${status}: the flag waits for the turn that commits`);
  assert.equal(boostAfterTurn(undefined), null);
});

// ---- 1b. depth by meaning --------------------------------------------------------------------------------------------
const decisive = [
  "I set the deck on her table and push it across. “Take them. I give up the cards.”",
  "“You have my word. Your letter reaches the temple, and nobody else reads it.”",
  "I nod slowly. “It's a deal — twenty gold, and you never see me again.”",
  "“I swear it on the Lady's coin: I won't sit at a table again.”",
  "I quietly slit his throat while he sleeps.",
  "I break the seal and read it, even though she asked me not to.",
  "Тихо говорю: «Клянусь, я больше не сяду за карты».",
  "Отдаю ей карты и ухожу, не оглядываясь.",
  "По рукам. Двадцать золотых — и ты меня больше не увидишь.",
  "Ладно, по рукам.",
  "Сжигаю письмо в камине, пока она смотрит.",
  "Я выдаю его страже.",
];
const ordinary = [
  "I ask the sergeant where the Low Lantern is.",
  "I put the eight silver on the bar and ask for a room.",
  "“I'll take it to the Hall. No promises about what happens after.”",
  "I kill time by the window, watching the street.",
  "I'm not going to betray him.",
  "What did I promise Nera before the festival?",
  "If I swear, will you let him go?",
  "Спрашиваю Марту про рыбу и сажусь у окна.",
  "Бью Фрола веслом по рукам и прыгаю за ящиком.",
];
test("depth by meaning: a calm-looking line that decides something irreversible is read as decisive, in English and Russian", () => {
  for (const line of decisive) assert.equal(irreversibleInput(line), true, line);
  for (const line of ordinary) assert.equal(irreversibleInput(line), false, line);
  assert.equal(decisiveInput(decisive[0]), false, "the old reading saw nothing here: no attack, no jump, no confession");
});

test("depth by meaning: the irreversible line is a climax that thinks deep without the button; a quiet line, a fight and a council line keep their old rule", () => {
  const source = fixture();
  const input = (text, mode = "game") => ({ operationId: id("op"), campaignId: source.snapshot.campaign.id, expectedRevision: 1, mode, input: text,
    companionId: mode === "companion" ? id("companion") : null, listenerIds: [], mechanic: null });
  const quiet = "I set the deck on her table and push it across. “Take them. I give up the cards.”";
  const signal = tensionSignals(source, input(quiet), "calm");
  assert.deepEqual(signal, { tension: "climax", reason: "something irreversible is being decided", irreversible: true }, "not scored as calm, even after a calm hint");
  const deep = chooseDepth({ min: "high", max: "high" }, "high", null, signal, false);
  assert.equal(deep.effort, "xhigh", "the deep level of the default range, without «⚡»");
  assert.equal(deep.reason, "something irreversible is being decided");
  assert.equal(chooseDepth({ min: "high", max: "max" }, "high", null, signal, false).effort, "max");
  // A plain line stays calm at the base.
  const plain = tensionSignals(source, input("I ask the sergeant where the Low Lantern is."), null);
  assert.equal(plain.tension, "calm");
  assert.equal(chooseDepth({ min: "high", max: "max" }, "high", null, plain, false).effort, "high", "a plain reply never runs at «max» by itself");
  // A decisive but reversible input keeps fix run A3's rule: a climax by name, the base of the range.
  const attack = tensionSignals(source, input("Бью Фрола веслом и прыгаю за ящиком."), null);
  assert.equal(attack.irreversible, undefined);
  assert.equal(chooseDepth({ min: "high", max: "high" }, "high", null, attack, false).effort, "high");
  // A council line is a light call; in a fight the DM's climax hint decides (fix run A3).
  assert.equal(tensionSignals(source, input("Клянусь, я вернусь за тобой.", "companion"), null).irreversible, undefined);
  const fight = structuredClone(source);
  fight.runtime.encounters = [{ id: id("encounter"), status: "active" }];
  assert.deepEqual(tensionSignals(fight, input("I finish him off."), null), { tension: "climax", reason: "active combat" });
});

test("depth by meaning on the loop: the quiet decisive line runs one notch deeper and says why; the next plain line is back at the base", async () => {
  const finish = { name: "finish_turn", arguments: { sceneKinds: ["conversation"], spotlight: [], playerMoment: false, nextTension: "calm" } };
  const c = await loopCampaign();
  try {
    const current = await c.settings.read();
    await c.settings.save({ expectedRevision: current.revision, runtime: "dm-loop-v1", dmTurn: { providerId: "anthropic", modelId: "claude-opus-5-5", reasoning: "high" }, depth: { min: "high", max: "high" } });
    assert.equal((await c.settings.read()).boostNext, false, "the button is not lit");
    const quiet = await c.turn("“You have my word. Your letter reaches the temple, and nobody else reads it.”", [{ text: "She nods. ", toolCalls: [finish] }]);
    assert.equal(quiet.result.status, "committed", JSON.stringify(c.errors));
    assert.equal(quiet.model.requests[0].effort, "xhigh");
    assert.match((await c.row(quiet.input.operationId)).checkpoint.dmLoop.pin.depth.reason, /irreversible/);
    assert.equal((await c.row(quiet.input.operationId)).checkpoint.dmLoop.pin.depth.boosted, false, "not the button");
    assert.equal((await c.settings.read()).boostNext, false, "the flag was never set, so nothing is spent");
    const plain = await c.turn("I ask where the Low Lantern is.", [{ text: "East. ", toolCalls: [finish] }]);
    assert.equal(plain.model.requests[0].effort, "high");
  } finally { await c.f.db.close(); }
});

// ---- 2. the action box empties after Send ---------------------------------------------------------------------------
test("the action box is empty once the turn is sent — in flight and waiting on a card; the words come back only on a failure kept for «Try again»", () => {
  const attempt = { operationId: "op-1", campaignId: "c", expectedRevision: 1, mode: "game", input: "I give up the cards.", companionId: null, listenerIds: [], mechanic: null };
  const journal = { text: attempt.input, attempt, command: null };
  assert.equal(turnSentAway(journal, undefined, true, ""), true, "in flight: the request is out, the stream tells the turn");
  assert.equal(turnSentAway(journal, { status: "generating" }, false, ""), true);
  assert.equal(turnSentAway(journal, { status: "awaiting_confirmation" }, false, ""), true, "a roll card waits: the words are in the story, not in the box");
  assert.equal(turnSentAway(journal, { status: "failed" }, false, ""), false, "a failed turn shows its words for «Try again»");
  assert.equal(turnSentAway(journal, undefined, false, "The DM connection was interrupted. Try again."), false, "an unknown outcome keeps them on screen");
  assert.equal(turnSentAway({ text: "a draft", attempt: null, command: null }, undefined, false, ""), false, "an unsent draft is the player's");
  // The commit still clears the journal itself (unchanged): no attempt, no words.
  assert.deepEqual(reconcileJournal(journal, { id: "op-1", status: "committed", input: attempt.input }), { text: "", attempt: null, command: null });
  const composer = src("src/components/gameplay-composer.tsx");
  assert.match(composer, /const boxText = recording \? held\.text : turnSentAway\(journal, knownAttempt, busy, error\) \? "" : journal\.text;/);
  assert.match(composer, /value=\{boxText\}/);
});

test("a line sent to a companion from «Игра» keeps its attempt on a reload, so its commit clears the box; the composer is not keyed by the addressee", () => {
  // Polish group 6 sends «Mags, …» as a companion turn from the game channel. The game journal dropped that attempt on
  // any reload (its mode is «companion»), so the commit could no longer clear the words.
  const store = new Map();
  const storage = { getItem: (key) => store.get(key) ?? null, setItem: (key, value) => store.set(key, value), removeItem: (key) => store.delete(key) };
  const timeline = { timelineId: "t", epoch: 1 };
  const attempt = { operationId: "op-2", campaignId: "c", timeline, expectedRevision: 1, mode: "companion", input: "Mags, what do you know?", companionId: "mags", listenerIds: [], mechanic: null };
  saveJournal(storage, journalKey("c", "game", null, timeline), { timeline, text: attempt.input, attempt, command: null });
  const reloaded = loadJournal(storage, "c", "game", null, timeline);
  assert.equal(reloaded.attempt?.operationId, "op-2");
  assert.deepEqual(reconcileJournal(reloaded, { id: "op-2", status: "committed", input: attempt.input }), { timeline, text: "", attempt: null, command: null });
  assert.equal(loadJournal(storage, "c", "feedback", null, timeline).attempt, null, "another channel never takes it");
  saveJournal(storage, journalKey("c", "ooc", null, timeline), { timeline, text: "x", attempt: { ...attempt, operationId: "op-3" }, command: null });
  assert.equal(loadJournal(storage, "c", "ooc", null, timeline).attempt, null, "only the game channel sends companion lines");
  const game = src("src/components/registry/game-screen.tsx");
  assert.match(game, /key=\{`\$\{mode\}:\$\{nonce\}`\}/);
  assert.match(game, /companionId=\{null\}/);
  assert.doesNotMatch(game, /talkTo/);
});

// ---- 3. the placeholder ---------------------------------------------------------------------------------------------
test("«Your story is ready to begin» shows only while no turn exists; a real opening text stays", () => {
  const placeholder = "Your story is ready to begin. The opening scene will appear here.";
  const empty = sample();
  assert.ok(render("game", empty).includes(placeholder), "a campaign with no turn yet");
  for (const status of ["pending", "awaiting_confirmation", "committed", "failed"]) {
    const state = sample();
    state.play.turns = [turn(state.data, { status, narration: status === "committed" ? "The sergeant looks up." : null, canRetry: status === "failed" })];
    assert.equal(render("game", state).includes(placeholder), false, `after a first turn that is ${status}`);
  }
  const ooc = sample();
  ooc.play.turns = [turn(ooc.data, { mode: "ooc", input: "? Is the cat with me?", narration: "Yes." })];
  assert.equal(render("game", ooc).includes(placeholder), false, "a «?» before the first action is a turn too");
  const ru = sample();
  ru.play.turns = [turn(ru.data)];
  assert.equal(render("game", { ...ru, language: "ru" }).includes("История готова начаться"), false);
  // A saved opening is the story, not a placeholder: it stays above the first turn.
  const opened = sample();
  opened.data.publicState.summary = "The gangplank bumps against the stones of Baldur's Gate.";
  opened.play.turns = [turn(opened.data, { status: "pending", narration: null })];
  assert.ok(render("game", opened).includes("The gangplank bumps against the stones of Baldur&#x27;s Gate."));
  assert.match(src("src/components/registry/game-screen.tsx"), /const anyTurn = !!play\?\.turns\.length \|\| !!live;/, "the first turn on its way counts too");
});

// ---- 4. the hint under the four buttons -----------------------------------------------------------------------------
test("the hint under the four buttons shows once per campaign, then folds; storage failures never break the screen", () => {
  const store = new Map();
  const storage = { getItem: (key) => store.get(key) ?? null, setItem: (key, value) => store.set(key, value) };
  assert.equal(firstShowing(storage, "player-actions", "campaign-a"), true, "the first visit opens it");
  assert.equal(store.get(hintKey("player-actions", "campaign-a")), "1", "and remembers it for this campaign");
  assert.equal(firstShowing(storage, "player-actions", "campaign-a"), false, "every later visit: folded");
  assert.equal(firstShowing(storage, "player-actions", "campaign-a"), false);
  assert.equal(firstShowing(storage, "player-actions", "campaign-b"), true, "another campaign shows it once too");
  assert.equal(firstShowing(null, "player-actions", "campaign-a"), true, "no storage (a private window): it simply shows");
  const broken = { getItem: () => { throw new Error("blocked"); }, setItem: () => { throw new Error("blocked"); } };
  assert.equal(firstShowing(broken, "player-actions", "campaign-a"), true, "a blocked storage never throws");
  // On the screen: the line sits in a fold under the four buttons, closed until the first visit opens it.
  const html = render("game", sample());
  const hint = /<details class="actionsHint" data-testid="actions-hint"><summary>What these buttons do<\/summary><span class="note">“Camp” — rest and healing\./.exec(html);
  assert.ok(hint, "the explanation is inside the fold");
  assert.ok(html.indexOf("Take note") < html.indexOf('data-testid="actions-hint"'), "under the buttons");
  assert.match(render("game", { ...sample(), language: "ru" }), /<summary>Что делают эти кнопки<\/summary><span class="note">«Лагерь» — отдых и лечение\./);
  const game = src("src/components/registry/game-screen.tsx");
  assert.match(game, /firstShowing\(hintStorage\(\), "player-actions", data\.campaign\.id\)\) setHintOpen\(true\)/);
  assert.match(game, /open=\{hintOpen\} onToggle=\{\(event\) => setHintOpen\(event\.currentTarget\.open\)\}/);
  assert.match(src("src/lib/ui/hint-fold.ts"), /return window\.localStorage;\n  \} catch \{\n    return null;/);
});

// ---- 5. the campaign editor leaves the game screen --------------------------------------------------------------------
test("«Campaign editor · for the owner» is off the game screen and on «More → For the owner», tools unchanged", () => {
  for (const language of ["en", "ru"]) {
    const words = (ru, en) => (language === "ru" ? ru : en);
    const state = { ...sample(), language };
    state.play.turns = [turn(state.data)];
    const game = render("game", state);
    assert.equal(game.includes(words("Редактор кампании · для владельца", "Campaign editor · for the owner")), false, `${language}: not on the game screen`);
    assert.equal(game.includes(words("Правка точки продолжения", "Edit the resume point")), false);
    const owner = render("owner", state);
    const editor = owner.indexOf(words("Редактор кампании · для владельца", "Campaign editor · for the owner"));
    assert.ok(editor > owner.indexOf(words("Цена ходов", "The price of turns")), `${language}: on the owner's screen, after the price of turns`);
    for (const tool of [words("Правка точки продолжения", "Edit the resume point"), words("Добавить запись в стенограмму", "Add a transcript record"),
      words("Сессии", "Sessions"), translate(language, "Manual encounter controls")])
      assert.ok(owner.indexOf(tool, editor) > editor, `${language}: «${tool}» is in the editor`);
    assert.match(owner, /<details class="more" data-testid="campaign-editor">/, "folded until the owner opens it (item 57)");
    assert.match(owner, new RegExp(words("Ниже — редактор кампании для правки записей\\.", "Below, the campaign editor for correcting the records\\.")));
  }
  // «For the owner» is one of the shell's «More» entries.
  const shell = src("src/components/registry/shell.tsx");
  const more = shell.slice(shell.indexOf("const secondary: NavItem[]"), shell.indexOf("const all = "));
  assert.match(more, /\{ id: "owner", label: c\("Для владельца", "For the owner"\), icon: Gauge \}/);
});
