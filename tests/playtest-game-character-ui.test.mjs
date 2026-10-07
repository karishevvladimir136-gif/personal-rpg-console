import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import ts from "typescript";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { fixture, id } from "./phase2-mechanics-fixtures.mjs";
import { translate } from "../src/lib/i18n.ts";
import { characterDescription } from "../src/components/character-presentation.ts";
import { foundationText } from "../src/components/foundation-loop/text.ts";
import { foundationUiFixture } from "./wave4-ui-fixtures.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const require = createRequire(import.meta.url);
const noCall = () =>
  assert.fail("Presentation must not call providers or mutate persisted state");

function sample() {
  const source = fixture();
  const data = source.snapshot;
  data.timeline = { timelineId: id("timeline"), epoch: 1 };
  data.entities = [
    {
      ...data.entities[0],
      name: "Garrick",
      details: "An ordinary Level 1 Fighter.",
      hp: 12,
      max_hp: 12,
      stats: { level: 1, attack: 3, defense: 12, skill: 1 },
      resources: { crowns: 20 },
      conditions: [],
      equipment_slots: [
        { id: "hand", label: "Main hand", accepts: ["weapon", "shield"] },
        { id: "offhand", label: "Off hand", accepts: ["weapon", "shield"] },
        { id: "body", label: "Body", accepts: ["armor"] },
      ],
    },
  ];
  data.items = [{ ...data.items.at(-1), name: "Ordinary sword", quantity: 1 }];
  data.publicState.current_scene_id = id("opening");
  data.publicState.summary =
    "The public meeting house is quiet. An organiser offers ordinary paid work.";
  data.locations[0].name = "Settlement meeting house";
  data.scenes = [
    {
      id: id("opening"),
      campaign_id: data.campaign.id,
      session_id: data.sessions[0].id,
      role: "narration",
      title: "An ordinary beginning",
      body: data.publicState.summary,
      revision: 1,
      settings_revision: 1,
      sequence: 1,
      created_at: "2026-09-29T00:00:00Z",
      updated_at: "2026-09-29T00:00:00Z",
    },
  ];
  const play = {
    ...source.runtime,
    timeline: data.timeline,
    rulesetId: "console-basic-v1",
  };
  return { data, play };
}
function turn(data, overrides = {}) {
  return {
    id: id("turn"),
    campaign_id: data.campaign.id,
    session_id: data.sessions[0].id,
    timeline: data.timeline,
    mode: "game",
    input: "I ask about paid work.",
    companionId: null,
    listenerIds: [],
    status: "committed",
    expectedRevision: 1,
    committedRevision: 2,
    settingsRevision: 1,
    created_at: "2026-09-29T00:00:00Z",
    updated_at: "2026-09-29T00:00:00Z",
    narration:
      "The organiser looks up. ‘A few crates need carrying. What sort of work can you do?’",
    visualDescription: null,
    checks: [],
    proposal: null,
    failure: null,
    canRetry: false,
    canCancel: false,
    ...overrides,
  };
}
function renderer({
  data,
  play,
  language = "en",
  memoryError = "",
  noMemoryRead = false,
  react,
} = {}) {
  const cache = new Map();
  const memory = {
    snapshot: {
      campaignId: data.campaign.id,
      timeline: data.timeline,
      runtimeRevision: 1,
      currentBoundary: null,
      sessions: [],
    },
    loading: false,
    error: memoryError,
    refresh: noCall,
  };
  function load(relative) {
    let path = resolve(root, relative);
    if (!existsSync(path)) path += existsSync(path + ".tsx") ? ".tsx" : ".ts";
    if (cache.has(path)) return cache.get(path);
    if (path.endsWith(".json")) return JSON.parse(readFileSync(path, "utf8"));
    const loadedModule = { exports: {} };
    cache.set(path, loadedModule.exports);
    const output = ts.transpileModule(readFileSync(path, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
      },
    }).outputText;
    function localRequire(name) {
      if (name === "react" && react) return { ...require("react"), ...react };
      if (name.endsWith("language-context"))
        return {
          useLanguage: () => ({
            language,
            t: (key, values) => translate(language, key, values),
          }),
        };
      if (name.endsWith("persistence-context"))
        return {
          useCampaignData: () => ({
            campaignId: data.campaign.id,
            data,
            loading: false,
            error: "",
            refresh: noCall,
            mutate: noCall,
          }),
          useOptionalCampaignData: () => ({
            campaignId: data.campaign.id,
            data,
            loading: false,
            error: "",
            refresh: noCall,
            mutate: noCall,
          }),
          useCampaignDraftScope: () => ({
            timeline: data.timeline,
            stale: false,
          }),
          useUnsavedChanges() {},
          TimelineDraftNotice: () => null,
        };
      if (name.endsWith("gameplay-runtime"))
        return {
          useGameplayRuntime: () => ({
            play,
            loading: false,
            error: "",
            afterMutation: noCall,
            refresh: noCall,
          }),
          notifyGameplayChanged: noCall,
        };
      if (name.endsWith("session-memory-runtime"))
        return { useSessionMemory: () => (noMemoryRead ? noCall() : memory) };
      if (name === "next/link") return { __esModule: true, default: "a" };
      if (name === "next/image") return { __esModule: true, default: "img" };
      if (name === "next/navigation")
        return { useRouter: () => ({ push: noCall }) };
      if (name.endsWith(".css"))
        return {
          __esModule: true,
          default: new Proxy({}, { get: (_, key) => String(key) }),
        };
      if (name === "server-only") return noCall();
      if (name.startsWith(".") || name.startsWith("@/")) {
        const target = name.startsWith("@/")
          ? resolve(root, "src", name.slice(2))
          : resolve(dirname(path), name);
        return load(target);
      }
      return require(name);
    }
    vm.runInThisContext(`(function(require,module,exports){${output}\n})`, {
      filename: path,
    })(localRequire, loadedModule, loadedModule.exports);
    cache.set(path, loadedModule.exports);
    return loadedModule.exports;
  }
  return load;
}
function render(screen, state, props = {}) {
  const load = renderer(state);
  const component =
    screen === "game"
      ? load("src/components/persistent-game.tsx").PersistentGame
      : screen === "party"
        ? load("src/components/persistent-records.tsx").PersistentParty
        : screen === "inventory"
          ? load("src/components/persistent-records.tsx").PersistentInventory
      : load("src/components/persistent-records.tsx").PersistentCharacter;
  return renderToStaticMarkup(createElement(component, props));
}

test("modern campaign awaiting Astra opening has a recovery link and no gameplay composer", () => {
  const state = sample();
  state.play.rulesetId = "world-logic-v1";
  state.play.startupPending = true;
  const before = structuredClone(state);
  const page = render("game", state);
  assert.match(page, /Review Adventure opening/);
  assert.match(page, new RegExp(`/campaigns/${state.data.campaign.id}/adventures`));
  assert.doesNotMatch(page, /<textarea\b/);
  assert.doesNotMatch(page, /Combat &amp; rest/);
  assert.doesNotMatch(page, /game-frame-controls|game-video-controls|Capture this moment|A cinematic view/);
  const ruLoad = renderer({ ...state, language: "ru" });
  const ruPage = renderToStaticMarkup(createElement(
    ruLoad("src/components/persistent-game.tsx").PersistentGame,
  ));
  assert.match(ruPage, /Проверить вступление/);
  assert.deepEqual(state, before);
});

test("Party includes companions only while Journal correction access retains known NPCs", () => {
  const state = sample();
  const protagonist = state.data.entities[0];
  state.data.entities.push(
    { ...protagonist, id: id("known-innkeeper"), kind: "npc", name: "Mara the innkeeper" },
    { ...protagonist, id: id("travel-companion"), kind: "companion", name: "Edren the traveler" },
  );
  const before = structuredClone(state);
  const party = render("party", state);
  assert.match(party, /Edren the traveler/);
  assert.doesNotMatch(party, /Mara the innkeeper/);
  const load = renderer(state);
  const people = renderToStaticMarkup(createElement(
    load("src/components/persistent-records.tsx").KnownPeopleCorrections,
    { data: state.data },
  ));
  assert.match(people, /Mara the innkeeper/);
  assert.doesNotMatch(people, /Edren the traveler/);
  assert.deepEqual(state, before);
});

test("Inventory separates equipped and carried records with visible category filters", () => {
  const state = sample();
  const carried = {
    ...state.data.items[0],
    id: id("carried-supply"),
    name: "Trail supplies",
    category: "gear",
    equipped_entity_id: null,
    equipped_slot: null,
  };
  state.data.items.push(carried);
  const before = structuredClone(state);
  const html = render("inventory", state);
  assert.match(html, /Equipped/);
  assert.match(html, /class="storage-layout with-doll"/);
  assert.match(html, /class="paper-doll recordDoll"/);
  assert.match(html, /class="item-slot-grid"/);
  assert.match(html, /Ordinary sword/);
  assert.match(html, /Trail supplies/);
  assert.match(html, /Inspect Ordinary sword, quantity 1, Equipped/);
  assert.match(html, /Inspect Trail supplies, quantity 1, Stored/);
  assert.match(html, /aria-label="Item category filter"/);
  assert.match(html, /aria-pressed="true"/);
  assert.doesNotMatch(html, /World Logic|ACTIVE RULES PROFILE|Use, transfer &amp; trade/);
  assert.deepEqual(state, before);
});

test("Inventory keeps an Equipment section visible when no gear is assigned", () => {
  const state = sample();
  state.data.items = [];
  state.data.entities[0].equipment_slots = [];
  const html = render("inventory", state);
  assert.match(html, /class="paper-doll recordDoll"/);
  assert.match(html, /No equipment assigned yet\./);
  assert.doesNotMatch(html, /No equipment profile is established|ACTIVE RULES PROFILE/);
});

test("trade appears only for an eligible merchant in the same campaign and timeline", () => {
  const state = sample();
  const availableMerchant = renderer(state)("src/components/persistent-records.tsx").availableMerchant;
  const view = {
    campaignId: state.data.campaign.id,
    command: { timeline: state.data.timeline },
    commerce: { merchants: [{ label: "Mara the trader" }] },
  };
  assert.equal(availableMerchant(view, state.data), "Mara the trader");
  assert.equal(availableMerchant({ ...view, commerce: { merchants: [] } }, state.data), null);
  assert.equal(availableMerchant({ ...view, campaignId: id("other-campaign") }, state.data), null);
  assert.equal(availableMerchant({ ...view, command: { timeline: { ...state.data.timeline, epoch: 2 } } }, state.data), null);
});

test("reviewed character sheet displays approved traits and recorded mechanics without inventing powers", () => {
  const state = sample();
  state.data.entities[0].stats.level = 2;
  state.data.entities[0].character_sheet = {
    schemaVersion: 1,
    mode: "narrative",
    role: "Greenmarch scout",
    background: "Knows the old woodland paths.",
    level: null,
    tier: null,
    attributes: null,
    skills: ["Tracking", "Wilderness craft"],
    abilities: ["Reading weather signs"],
    limitations: ["No formal magic"],
    spells: [],
  };
  const before = structuredClone(state);
  const html = render("character", state);
  assert.match(html, /Greenmarch scout/);
  assert.match(html, /Level 2/);
  assert.match(html, /Tracking/);
  assert.match(html, /Core stats/);
  assert.doesNotMatch(html, /Spells \/ Powers/);
  assert.doesNotMatch(html, /no automatic check bonuses/i);
  assert.deepEqual(state, before);
});

test("legacy Character uses the same player-facing sheet while public World facts stay scope checked", () => {
  const state = sample();
  state.data.entities[0].character_sheet = null;
  state.data.entities[0].details = `A scout who follows ordinary tracks. ${"The long road through Greenmarch is remembered. ".repeat(7)}FULL_BACKGROUND_END`;
  const hero = state.data.entities[0];
  const load = renderer(state);
  const facts = load("src/components/persistent-records.tsx").acceptedPublicCharacterFacts;
  const view = {
    campaignId: state.data.campaign.id,
    command: { timeline: state.data.timeline },
    playerCharacter: {
      entityId: hero.id,
      capabilities: ["Tracks game through rough woods"],
      limitations: ["Does not know formal magic"],
    },
  };
  assert.deepEqual(facts(view, state.data, hero), {
    capabilities: view.playerCharacter.capabilities,
    limitations: view.playerCharacter.limitations,
  });
  assert.equal(facts({ ...view, campaignId: id("other-campaign") }, state.data, hero), null);
  assert.equal(facts({ ...view, command: { timeline: { ...state.data.timeline, epoch: 2 } } }, state.data, hero), null);
  assert.equal(facts({ ...view, playerCharacter: { ...view.playerCharacter, entityId: id("other-hero") } }, state.data, hero), null);
  const html = render("character", state);
  assert.match(html, /Character sections/);
  assert.match(html, /class="character-grid characterGrid"/);
  assert.match(html, /class="character-stats characterStats"/);
  assert.match(html, /class="paper-doll paperDoll"/);
  assert.match(html, /role="img" aria-label="No portrait yet"><svg[^>]+lucide-sparkles/);
  assert.match(html, /Ordinary sword/);
  assert.match(html, /attack/);
  assert.match(html, /Read full background/);
  assert.doesNotMatch(html, /FULL_BACKGROUND_END/);
  assert.doesNotMatch(html, /STR<\/span>|Reading weather signs/);
});

test("Journal current adventure presents the public active chapter without management actions", () => {
  const state = sample();
  const catalog = {
    campaignId: state.data.campaign.id,
    timeline: state.data.timeline,
    activeAdventureId: id("active-adventure"),
    adventures: [{
      id: id("active-adventure"),
      status: "active",
      title: "The Greenmarch Road",
      premise: `Follow the missing caravan's trail. ${"A long public premise. ".repeat(15)}PREMISE_END`,
      summary: `The party found the caravan and learned the bridge is unsafe. ${"A long public recap. ".repeat(30)}SUMMARY_END`,
      review: { notes: "PRIVATE_REVIEW_NOT_STORY" },
    }],
  };
  const before = structuredClone(state);
  const load = renderer(state);
  const html = renderToStaticMarkup(createElement(
    load("src/components/current-adventure.tsx").CurrentAdventure,
    { snapshot: state.data, initialCatalog: catalog },
  ));
  assert.match(html, /Current Adventure/);
  assert.match(html, /The Greenmarch Road/);
  assert.match(html, /Follow the missing caravan/);
  assert.match(html, /Read full premise/);
  assert.match(html, /PREMISE_END/);
  assert.match(html, /Story so far/);
  assert.match(html, /The party found the caravan and learned the bridge is unsafe/);
  assert.match(html, /Read full story/);
  assert.match(html, /SUMMARY_END/);
  assert.doesNotMatch(html, /PRIVATE_REVIEW_NOT_STORY/);
  assert.match(html, /Continue adventure/);
  assert.doesNotMatch(html, /End Adventure|Abandon|Prepare Adventure/);
  assert.deepEqual(state, before);
});

for (const language of ["en", "ru"]) {
  test(`${language} ordinary Game puts the opening and composer before optional owner tools`, () => {
    const state = sample(),
      before = structuredClone(state);
    const html = render("game", { ...state, language });
    assert.ok(
      html.indexOf("public meeting house is quiet") < html.indexOf("<textarea"),
    );
    assert.ok(
      html.indexOf("<textarea") <
        html.indexOf(
          translate(language, "Session & continuity").replaceAll("&", "&amp;"),
        ),
    );
    assert.ok(
      html.indexOf("<textarea") <
        html.indexOf(
          translate(language, "Advanced · records & corrections").replaceAll(
            "&",
            "&amp;",
          ),
        ),
    );
    assert.match(html, /<details class="secondary"><summary>/);
    assert.ok(
      html.includes(translate(language, "Edit public state and resume point")),
    );
    assert.ok(html.includes(translate(language, "Add transcript record")));
    const sceneMedia = language === "ru"
      ? "Создать изображение этой сцены"
      : "Create art for this scene";
    assert.ok(html.includes(sceneMedia));
    assert.ok(html.indexOf(sceneMedia) < html.indexOf("<textarea"));
    assert.doesNotMatch(html, /FRAME &amp; VIDEO · this scene/);
    const tools = html.indexOf('class="composer-tools"');
    assert.ok(tools > html.indexOf("<textarea"));
    assert.ok(html.includes(translate(language, "OOC")));
    assert.ok(html.includes(translate(language, "Take note")));
    assert.ok(html.includes(translate(language, "What do I know?")));
    assert.ok(html.includes("journal?tab=Notes&amp;compose=note"));
    assert.ok(html.includes("journal?tab=Evidence"));
    assert.doesNotMatch(html, /class="tabs" aria-label="Input mode"/);
    assert.ok(html.includes('href="#play-action"'));
    assert.equal(html.includes("SYNTHETIC_PRIVATE_MARKER"), false);
    assert.deepEqual(state, before);
  });
  test(`${language} Character uses the Phase-0 three-column composition with only recorded Fighter slots`, () => {
    const state = sample(),
      before = structuredClone(state);
    const html = render("character", { ...state, language });
    assert.match(html, /class="character-grid characterGrid"/);
    assert.match(html, /class="panel character-sheet characterSheet"/);
    assert.match(html, /class="character-stats characterStats"><h2 class="character-name">Garrick<\/h2>/);
    assert.match(html, /class="panel visual-inventory-panel inventory-panel inventoryPanel"/);
    assert.ok(
      html.includes(translate(language, "Level {level}", { level: 1 })),
    );
    assert.ok(
      html.includes(
        translate(
          language,
          "No portrait yet",
        ),
      ),
    );
    assert.equal(html.includes("James"), false);
    assert.equal(html.includes("Human"), false);
    assert.ok(html.includes("12 / 12"));
    assert.match(html, /<dt>crowns<\/dt><dd>20<\/dd>/);
    assert.match(html, /class="equipment-slots equipmentSlots"/);
    assert.match(html, /class="equipment-slot equipmentSlot" aria-label="Main hand: Ordinary sword"/);
    assert.match(html, /class="equipment-slot equipmentSlot" aria-label="Off hand: [^"]+" disabled=""/);
    assert.ok(html.includes("Ordinary sword"));
    assert.equal(
      (html.match(/class="equipment-slot equipmentSlot"/g) ?? []).length,
      3,
    );
    assert.equal(
      (html.match(/class="equipment-slot equipmentSlot"[^>]*disabled=""/g) ?? []).length,
      2,
    );
    for (const slot of ["Main hand", "Off hand", "Body"])
      assert.ok(html.includes(slot));
    assert.doesNotMatch(
      html,
      /<small>(?:Head|Neck|Ring|Boots)<\/small>|<img|<image/,
    );
    assert.ok(
      html.includes(translate(language, "Edit public character record")),
    );
    assert.deepEqual(state, before);
  });
}

test("Game keeps the saved opening before the first committed exchange", () => {
  const state = sample();
  const first = turn(state.data);
  state.play.turns = [first];
  state.data.scenes.push(
    {
      ...state.data.scenes[0],
      id: id("first-player-scene"),
      role: "player",
      title: "Player action",
      body: first.input,
      sequence: 2,
    },
    {
      ...state.data.scenes[0],
      id: id("first-dm-scene"),
      title: "DM",
      body: first.narration,
      sequence: 3,
    },
  );
  state.data.publicState.current_scene_id = id("first-dm-scene");
  const html = render("game", state);
  const opening = "The public meeting house is quiet";
  const openingArticle = html.indexOf('<article class="opening">');
  assert.ok(
    openingArticle >= 0,
    "Saved opening must remain in the story surface",
  );
  const openingMarkup = html.slice(
    openingArticle,
    html.indexOf("</article>", openingArticle),
  );
  assert.equal(openingMarkup.split(opening).length - 1, 1);
  assert.ok(openingArticle < html.indexOf(first.input));
  assert.ok(html.indexOf(first.input) < html.indexOf("The organiser looks up"));
});

test("OOC history does not repeat the Game opening", () => {
  const state = sample();
  state.play.turns = [turn(state.data)];
  const html = render("game", {
    ...state,
    react: {
      useState: (initial) => [
        initial === "game"
          ? "ooc"
          : typeof initial === "function"
            ? initial()
            : initial,
        () => {},
      ],
    },
  });
  assert.doesNotMatch(html, /<article class="opening">/);
  assert.ok(html.includes(translate("en", "Brief out-of-character remark")));
  assert.ok(html.includes(translate("en", "A question outside the story…")));
  assert.match(html, /aria-pressed="true" class="selected"/);
  assert.doesNotMatch(html, /class="tabs" aria-label="Input mode"/);
});

test("stock starter description is presentation-only, localized, and never overwrites owner-authored text", () => {
  const stock = [
    "An ordinary Level 1 Fighter. Bounded house profile; not complete D&D 5e.",
    "Обычный воин 1-го уровня. Домашний ограниченный профиль, не полная D&D 5e.",
  ];
  for (const language of ["en", "ru"]) {
    for (const description of stock) {
      const state = sample();
      state.data.entities[0].details = description;
      const before = structuredClone(state),
        html = render("character", { ...state, language });
      assert.ok(
        html.includes(
          translate(
            language,
            "An ordinary Level 1 Fighter. Uses the starter house ruleset.",
          ),
        ),
      );
      assert.doesNotMatch(
        html,
        /Bounded house profile|not complete D&amp;D|Домашний ограниченный профиль/,
      );
      assert.deepEqual(state, before);
    }
    for (const custom of [
      "An ordinary Level 1 Fighter. Owner's custom description.",
      "An ordinary Level 1 Fighter. Bounded house profile; not complete D&D 5e. My own addition.",
      "Моё описание героя.",
    ])
      assert.equal(
        characterDescription(custom, (key) => translate(language, key)),
        custom,
      );
  }
});

test("XP presentation shows recorded Level 1 and 0 / 100, with original taxonomy in closed details only", () => {
  for (const language of ["en", "ru"]) {
    const state = sample(),
      load = renderer({ ...state, language });
    const view = foundationUiFixture();
    view.campaignId = state.data.campaign.id;
    view.command.campaignId = view.campaignId;
    view.command.timeline = state.data.timeline;
    view.profile.id = "console-basic-v1";
    view.progression.progress = [
      {
        entityId: state.data.entities[0].id,
        entityName: "Garrick",
        trackId: "house-experience",
        trackLabel:
          language === "en"
            ? "Experience · house track"
            : "Опыт · домашняя шкала",
        kind: "classic_xp",
        value: 0,
        rank: 0,
        unlocks: [],
        nextThreshold: 100,
      },
    ];
    view.progression.pending = [];
    view.availableRewards = [];
    const before = structuredClone(view),
      c = foundationText(language);
    const { FoundationLoopEditor } = load(
      "src/components/foundation-loop/foundation-loop.tsx",
    );
    const html = renderToStaticMarkup(
      createElement(FoundationLoopEditor, {
        section: "progression",
        initialData: view,
        characterLevels: { [state.data.entities[0].id]: 1 },
        load: noCall,
        send: noCall,
      }),
    );
    for (const label of [
      c.progression,
      c.starterRules,
      c.xpProgression,
      `${c.level} 1`,
      "0 / 100",
    ])
      assert.ok(html.includes(label), label);
    assert.doesNotMatch(html, /Console Basic/);
    const details = html.match(
      /<details class="progressDetails">[\s\S]*?<\/details>/,
    )?.[0];
    assert.ok(details);
    assert.ok(details.includes(view.progression.progress[0].trackLabel));
    assert.ok(details.includes(c.classic_xp));
    const primary = html.replace(details, "");
    assert.ok(!primary.includes(view.progression.progress[0].trackLabel));
    assert.ok(!primary.includes(c.classic_xp));
    assert.deepEqual(view, before);
    const noLevel = renderToStaticMarkup(
      createElement(FoundationLoopEditor, {
        section: "progression",
        initialData: view,
        load: noCall,
        send: noCall,
      }),
    );
    assert.ok(!noLevel.includes(`${c.level} 1`));
    view.progression.progress[0].trackLabel = "Owner's custom track";
    assert.ok(
      renderToStaticMarkup(
        createElement(FoundationLoopEditor, {
          section: "progression",
          initialData: view,
        }),
      ).includes("Owner&#x27;s custom track"),
    );
  }
});

test("EN/RU item inspection is read-only; correction is secondary and existing gameplay item actions remain", () => {
  for (const language of ["en", "ru"]) {
    const state = sample(),
      before = structuredClone(state),
      load = renderer({ ...state, language });
    const { ItemDetails } = load("src/components/persistent-records.tsx");
    const html = renderToStaticMarkup(
      createElement(ItemDetails, {
        item: state.data.items[0],
        onClose: noCall,
        onEdit: noCall,
      }),
    );
    assert.ok(html.includes("Ordinary sword"));
    assert.ok(html.includes(state.data.items[0].description));
    assert.ok(html.includes(state.data.items[0].mechanics));
    assert.ok(html.includes(translate(language, "Known properties")));
    assert.ok(html.includes("Main hand"));
    const advanced = html.match(
      /<details class="itemAdvanced">[\s\S]*?<\/details>/,
    )?.[0];
    assert.ok(advanced);
    assert.ok(
      advanced.includes(translate(language, "Advanced · owner correction")),
    );
    assert.ok(advanced.includes(translate(language, "Correct item record")));
    const normal = html.replace(advanced, "");
    assert.ok(!normal.includes(translate(language, "Correct item record")));
    assert.ok(!normal.includes(translate(language, "Save owner correction")));
    assert.doesNotMatch(
      html,
      /<textarea|Recorded owner|Recorded storage|Recorded equipped character/,
    );
    const plainItem = { ...state.data.items[0], mechanics: "" };
    const plainHtml = renderToStaticMarkup(createElement(ItemDetails, {
      item: plainItem,
      onClose: noCall,
      onEdit: noCall,
    }));
    assert.ok(!plainHtml.includes(translate(language, "Known properties")));
    assert.ok(!plainHtml.includes(translate(language, "No mechanics recorded.")));
    for (const label of [
      "Use, transfer or equip",
      "Use item",
      "Transfer item",
      "Equip item",
      "Unequip item",
    ])
      assert.ok(html.includes(translate(language, label)), label);
    assert.deepEqual(state, before);
  }
});
test("successful DM narration is prominent without redundant committed status or duplicate opening", () => {
  const state = sample();
  state.play.turns = [turn(state.data)];
  const html = render("game", state);
  assert.match(html, /class="gameplay-narration"/);
  assert.ok(html.includes("A few crates need carrying"));
  assert.ok(html.includes("I ask about paid work."));
  const story = html.slice(0, html.indexOf("<textarea"));
  const openingAt = story.indexOf("The public meeting house is quiet");
  const actionAt = story.indexOf("I ask about paid work.");
  const narrationAt = story.indexOf("A few crates need carrying");
  assert.ok(openingAt >= 0 && openingAt < actionAt && actionAt < narrationAt);
  assert.equal(story.match(/The public meeting house is quiet/g)?.length, 1);
  assert.match(html, /href="#saved-turn-/);
});
test("clarification, failure and preserved-turn recovery remain visible in the primary feed", () => {
  const state = sample();
  state.play.turns = [
    turn(state.data, {
      status: "failed",
      narration: null,
      failure: "validation",
      worldRecovery: "review_required",
      worldUncertainty: "missing_evidence",
      canRetry: true,
      canCancel: true,
    }),
  ];
  const html = render("game", state);
  assert.match(html, /role="alert"/);
  assert.ok(html.includes("needs clarification"));
  assert.ok(html.includes("needs review"));
  assert.ok(html.indexOf("needs review") < html.indexOf("Advanced · records"));
  assert.ok(html.includes("Resume this turn"));
  assert.ok(html.includes("Cancel unfinished turn"));
});
test("a failed session read expands continuity rather than hiding the recovery controls", () => {
  const html = render("game", {
    ...sample(),
    memoryError: "Saved session unavailable.",
  });
  assert.match(
    html,
    /<details class="secondary" open=""><summary>Session &amp; continuity/,
  );
  assert.ok(html.includes("Saved session unavailable."));
  assert.ok(html.includes("Retry loading"));
});

test("an isolated review-only Game does not subscribe to live session memory", () => {
  const html = render(
    "game",
    { ...sample(), play: null, noMemoryRead: true },
    { reviewOnly: true },
  );
  assert.ok(html.includes("The story so far"));
  assert.equal(html.includes("Session &amp; continuity"), false);
});
test("no scene or character metadata is fabricated for an empty or minimal continuity", () => {
  const state = sample();
  state.data.scenes = [];
  state.data.publicState.summary = "";
  state.data.publicState.current_scene_id = null;
  state.data.publicState.current_location_id = null;
  state.data.entities[0].details = "";
  state.data.entities[0].stats = {};
  state.data.entities[0].hp = null;
  state.data.entities[0].equipment_slots = [];
  const game = render("game", state),
    character = render("character", state);
  assert.ok(game.includes("Your story is ready to begin"));
  assert.equal(game.includes("An ordinary beginning"), false);
  assert.equal(character.includes("Level 1"), false);
  assert.equal(character.includes("Human"), false);
  assert.ok(character.includes("No equipment assigned yet."));
});

test("Game follows new narration until the reader scrolls back; other composers keep their layout", () => {
  function check(followLatest) {
    const state = sample(),
      effects = [];
    state.play.turns = [turn(state.data)];
    const load = renderer({
      ...state,
      react: {
        useState: (initial) => [
          typeof initial === "function" ? initial() : initial,
          () => {},
        ],
        useRef: (current) => ({ current }),
        useEffect: (effect) => effects.push(effect),
      },
    });
    const { GameplayComposer } = load("src/components/gameplay-composer.tsx");
    const element = GameplayComposer({
      play: state.play,
      onSaved: noCall,
      followLatest,
    });
    function find(node) {
      if (!node || typeof node !== "object") return null;
      if (node.props?.className === "gameplay-turns") return node;
      for (const child of [node.props?.children].flat()) {
        const found = find(child);
        if (found) return found;
      }
      return null;
    }
    const history = find(element),
      dom = { scrollTop: 0, scrollHeight: 1000, clientHeight: 250 };
    assert.ok(history);
    history.props.ref.current = dom;
    for (const effect of effects) effect();
    assert.equal(dom.scrollTop, followLatest ? 1000 : 0);
    dom.scrollTop = 100;
    history.props.onScroll({ currentTarget: dom });
    dom.scrollHeight = 1200;
    for (const effect of effects) effect();
    assert.equal(
      dom.scrollTop,
      100,
      "Reading earlier turns is not interrupted by an update",
    );
  }
  check(true);
  check(false);
});

test("Game restores a reader's scroll position after switching input modes", () => {
  const state = sample(),
    effects = [];
  state.play.turns = [turn(state.data)];
  const load = renderer({
    ...state,
    react: {
      useState: (initial) => [
        typeof initial === "function" ? initial() : initial,
        () => {},
      ],
      useRef: (current) => ({ current }),
      useEffect: (effect) => effects.push(effect),
    },
  });
  const { GameplayComposer } = load("src/components/gameplay-composer.tsx");
  let saved;
  const element = GameplayComposer({
    play: state.play,
    onSaved: noCall,
    followLatest: true,
    historyPosition: { scrollTop: 125, following: false },
    onHistoryPositionChange: (position) => {
      saved = position;
    },
  });
  function find(node) {
    if (!node || typeof node !== "object") return null;
    if (node.props?.className === "gameplay-turns") return node;
    for (const child of [node.props?.children].flat()) {
      const found = find(child);
      if (found) return found;
    }
    return null;
  }
  const history = find(element);
  const dom = { scrollTop: 0, scrollHeight: 1400, clientHeight: 250 };
  assert.ok(history);
  history.props.ref.current = dom;
  for (const effect of effects) effect();
  assert.equal(dom.scrollTop, 125);
  history.props.onScroll({ currentTarget: dom });
  assert.deepEqual(saved, { scrollTop: 125, following: false });
  dom.scrollHeight = 1600;
  for (const effect of effects) effect();
  assert.equal(dom.scrollTop, 125);
  dom.scrollTop = dom.scrollHeight - dom.clientHeight - 40;
  history.props.onScroll({ currentTarget: dom });
  assert.equal(saved.following, true);
  dom.scrollHeight = 1800;
  for (const effect of effects) effect();
  assert.equal(dom.scrollTop, 1800);
});
