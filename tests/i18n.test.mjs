import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import test from "node:test";
import ts from "typescript";
import russian from "../src/lib/locales/ru.json" with { type: "json" };
import { translate, languageOptions } from "../src/lib/i18n.ts";
import {
  navigation,
  items,
  clues,
  locations,
  documents,
} from "../src/lib/mock-data.ts";

test("English source dictionary and Russian preserve interpolation parameters", () => {
  const parameters = (text) =>
    [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();
  for (const [english, translated] of Object.entries(russian)) {
    assert.ok(translated.trim(), `Empty translation: ${english}`);
    assert.deepEqual(parameters(translated), parameters(english), english);
    assert.equal(translate("en", english), english);
    assert.equal(translate("ru", english), translated);
  }
});

test("translator supports both languages, safe fallback, and literal interpolation", () => {
  assert.deepEqual(
    languageOptions.map((option) => option.value),
    ["en", "ru"],
  );
  assert.equal(translate("ru", "Settings"), "Настройки");
  assert.equal(translate("ru", "Session {number}", { number: 4 }), "Сессия 4");
  assert.equal(
    translate("en", "Select {location}", { location: "New York" }),
    "Select New York",
  );
  assert.equal(
    translate("ru", "Select {location}", { location: "$& {unchanged}" }),
    "Выбрать: $& {unchanged}",
  );
  assert.equal(translate("ru", "An unknown key"), "An unknown key");
  assert.equal(translate("ru", "toString"), "toString");
  assert.equal(translate("ru", 4), "4");
});

test("every navigation and player-readable mock field has a Russian translation", () => {
  for (const [, label] of navigation)
    assert.ok(Object.hasOwn(russian, label), label);
  const visibleFields = [
    "name",
    "title",
    "category",
    "detail",
    "mechanics",
    "storage",
    "type",
    "description",
    "region",
    "status",
    "supplies",
    "body",
  ];
  for (const record of [...items, ...clues, ...locations, ...documents]) {
    for (const field of visibleFields) {
      if (field in record)
        assert.ok(Object.hasOwn(russian, record[field]), record[field]);
    }
  }
});

test("UI phrases use the dictionary, including conditional labels and accessibility text", () => {
  const files = readdirSync(new URL("../src/components/", import.meta.url))
    .filter((file) => file.endsWith(".tsx"))
    .map((file) => new URL(`../src/components/${file}`, import.meta.url))
    .concat(new URL("../src/app/not-found.tsx", import.meta.url));
  function checkMessage(expression, file) {
    if (ts.isStringLiteral(expression)) {
      assert.ok(
        Object.hasOwn(russian, expression.text),
        `${file}: missing ${expression.text}`,
      );
    } else if (ts.isConditionalExpression(expression)) {
      checkMessage(expression.whenTrue, file);
      checkMessage(expression.whenFalse, file);
    } else if (
      ts.isBinaryExpression(expression) &&
      expression.operatorToken.kind === ts.SyntaxKind.BarBarToken
    ) {
      checkMessage(expression.right, file);
    }
  }
  for (const file of files) {
    const ast = ts.createSourceFile(
      file.pathname,
      readFileSync(file, "utf8"),
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    );
    function visit(node) {
      if (ts.isCallExpression(node) && node.expression.getText(ast) === "t")
        checkMessage(node.arguments[0], file.pathname);
      if (ts.isJsxText(node))
        assert.ok(
          !/[A-Za-zА-Яа-яЁё]/.test(node.text),
          `${file.pathname}: untranslated JSX ${node.text.trim()}`,
        );
      if (
        ts.isJsxAttribute(node) &&
        node.name.getText(ast) === "message" &&
        node.initializer &&
        ts.isStringLiteral(node.initializer)
      )
        checkMessage(node.initializer, file.pathname);
      if (
        ts.isJsxAttribute(node) &&
        ["title", "label", "aria-label", "placeholder"].includes(
          node.name.getText(ast),
        ) &&
        node.initializer &&
        ts.isStringLiteral(node.initializer)
      ) {
        assert.fail(`${file.pathname}: untranslated ${node.name.getText(ast)}`);
      }
      // Translated display labels must never replace stable selection values or keys.
      if (
        ts.isJsxAttribute(node) &&
        node.name.getText(ast) === "key" &&
        node.initializer &&
        ts.isJsxExpression(node.initializer)
      ) {
        assert.ok(
          !node.initializer.getText(ast).includes("t("),
          `${file.pathname}: translated key`,
        );
      }
      ts.forEachChild(node, visit);
    }
    visit(ast);
  }
});

// Fixes before session 3 (docs/stages/FIX_S3_PRE.md 2.4): the battle components, the soundtrack's words and the
// server-built player strings are in the scan — the class the audit found (42 F rows) is caught here.
test("2.4: the fight's words, the soundtrack's reasons and titles read in Russian; the stored words stay English", async () => {
  const { conditionWord, conditionsText, outcomeWord, CONDITION_RU } = await import("../src/lib/live2d/battle/words.ts");
  const owner = { dying: "при смерти", unconscious: "без сознания", concentrating: "концентрируется", surprised: "застигнут врасплох", fled: "бежал",
    surrendered: "сдался", hidden: "скрыт", prone: "лежит", paralysed: "парализован", poisoned: "отравлен", frightened: "напуган", grappled: "схвачен",
    restrained: "опутан", stunned: "оглушён", blinded: "ослеплён", deafened: "оглох", invisible: "невидим", incapacitated: "недееспособен" };
  for (const [en, ru] of Object.entries(owner)) assert.equal(conditionWord(en, "ru"), ru, en);
  assert.equal(CONDITION_RU.dying, "при смерти");
  assert.equal(conditionWord("dying", "en"), "dying");
  assert.equal(conditionWord("связан", "ru"), "связан", "a word the DM wrote in Russian stays");
  assert.equal(conditionsText(["dying", "prone"], "ru"), "при смерти, лежит");
  assert.deepEqual(["victory", "defeat", "retreat", "truce"].map((o) => outcomeWord(o, "ru")), ["победа", "поражение", "отход", "перемирие"]);
  const { moodReasonText, trackTitle } = await import("../src/lib/audio/words.ts");
  assert.equal(moodReasonText("an encounter is active (unchanged)", "ru"), "идёт бой (без смены)");
  assert.equal(moodReasonText("on the road (first track)", "ru"), "в дороге (первый трек)");
  assert.equal(moodReasonText("a tense conversation (held for 2 turns)", "ru"), "напряжённый разговор (держалось 2 хода)");
  assert.equal(moodReasonText("a quiet scene (waiting: 1/2 turns, 40 s of 90)", "ru"), "тихая сцена (ждёт: 1/2 хода, 40 с из 90)");
  assert.equal(moodReasonText("skipped by hand", "ru"), "переключено вручную");
  assert.equal(moodReasonText("on the road", "en"), "on the road");
  assert.equal(trackTitle("On the road 1", "ru"), "Дорога 1");
  assert.equal(trackTitle("Tavern 2", "ru"), "Таверна 2");
  assert.equal(trackTitle("On the road 1", "en"), "On the road 1");
  // The mood reasons the selector writes are all known to the map.
  const select = readFileSync(new URL("../src/lib/audio/mood-select.ts", import.meta.url), "utf8");
  for (const [, phrase] of select.matchAll(/reason: "([^"]+)"/g)) assert.notEqual(moodReasonText(phrase, "ru"), phrase, phrase);
});

test("2.4: the battle components and the 2D screen render every word through the language — no raw condition, outcome or unit", () => {
  const folder = new URL("../src/components/live2d/", import.meta.url);
  const files = readdirSync(folder, { recursive: true }).filter((file) => String(file).endsWith(".tsx")).map((file) => new URL(String(file), folder));
  assert.ok(files.length >= 3);
  for (const file of files) {
    const text = readFileSync(file, "utf8");
    const name = file.pathname.split("/src/")[1];
    assert.doesNotMatch(text, /conditions(?:\.slice\(\d+, \d+\))?\.map\(\(word\) => <span[^>]*>\{word\}<\/span>/, `${name}: a raw condition word`);
    assert.doesNotMatch(text, /title=\{word\}>\{word\.slice/, `${name}: a raw condition tag`);
    assert.doesNotMatch(text, /\$\{[^}]+\} ft`/, `${name}: «ft» outside the language`);
    if (/<span>\{outcome\}/.test(text)) assert.match(text, /const outcome = outcomeWord\(/, `${name}: a raw outcome`);
    // The Russian slot of c(ru, en) holds no English word (2D and DM are names, not words).
    const ast = ts.createSourceFile(file.pathname, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const visit = (node) => {
      if (ts.isCallExpression(node) && node.expression.getText(ast) === "c" && node.arguments.length === 2 && ts.isStringLiteral(node.arguments[0])) {
        const ru = node.arguments[0].text.replace(/\b(2D|DM|HP|DC|ID|URL)\b/g, "");
        assert.doesNotMatch(ru, /[A-Za-z]{3,}/, `${name}: English in the Russian slot «${node.arguments[0].text}»`);
      }
      ts.forEachChild(node, visit);
    };
    visit(ast);
  }
});

test("2.4: the server-built player strings of a Russian fight carry no English word (conditions, outcomes, the camp, units)", async () => {
  const { loopCampaign } = await import("./dm-loop-fixture.mjs");
  const c = await loopCampaign({ language: "ru" });
  try {
    const played = await c.turn("Бой у брода.", [{ text: "Бой. ", toolCalls: [
      { name: "upsert_character", arguments: { localKey: "yan", name: "Ян", kind: "npc", present: true, hp: 11, maxHp: 11 } },
      { name: "item", arguments: { action: "create", name: "Верёвка", category: "gear", quantity: 2, ownerRef: "camp" } },
      { name: "item", arguments: { action: "transfer", itemRef: "Верёвка", quantity: 1, ownerRef: c.hero } },
      { name: "combat", arguments: { action: "start", summary: "Брод", grid: { cols: 10, rows: 8 }, rules: true,
        placements: [{ actorRef: c.hero, x: 2, y: 2, initiative: 12 }, { actorRef: "yan", x: 3, y: 2, initiative: 8 }], hp: [{ actorRef: "yan", current: 11, max: 11, ac: 12 }] } },
      { name: "combat", arguments: { action: "condition", actorRef: c.hero, add: ["prone", "concentrating"] } },
      { name: "combat", arguments: { action: "condition", actorRef: "yan", add: ["surprised", "frightened"] } },
      { name: "combat", arguments: { action: "move", actorRef: c.hero, x: 2, y: 3 } },
      { name: "combat", arguments: { action: "attack", actorRef: c.hero, targetRef: "yan", attackBonus: 5, damage: "1d8+3", reason: "Удар" } },
      { name: "combat", arguments: { action: "next_turn" } },
      { name: "combat", arguments: { action: "end", outcome: "victory", summary: "Ян бежал" } }] },
      { text: "Ян бежит.", toolCalls: [{ name: "finish_turn", arguments: { sceneKinds: ["combat"], spotlight: [], playerMoment: false } }] }], { dice: [15, 4] });
    assert.equal(played.result.status, "committed", JSON.stringify(c.errors));
    const receipts = (await c.row(played.input.operationId)).checkpoint.dmLoop.receipts;
    const lines = receipts.map((r) => r.result.ok ? r.result.player : null).filter(Boolean);
    assert.ok(lines.length >= 6, lines.join("\n"));
    const english = /\b(dying|unconscious|concentrating|surprised|frightened|prone|fled|victory|escape|the camp|someone|ft|from|gear)\b/i;
    for (const line of lines) assert.doesNotMatch(line, english, line);
    assert.ok(lines.some((line) => /лежит, концентрируется/.test(line)), "the condition chip in Russian");
    assert.ok(lines.some((line) => /Бой окончен: победа/.test(line)));
  } finally { await c.f.db.close(); }
});

// Fix S3-accept Г2 (docs/stages/FIX_S3_ACCEPT.md): the owner's sheet showed the counter «Shaman tusk» — its key made
// readable. Every rendering of a counter names it through counterLabel (the campaign language), and the owner's counter
// gets its Russian name once (migration 202610230501, written by shape, tested here on PGlite).
test("Г2: every counter rendering names the counter in the campaign language — «Клык шамана», never «Shaman tusk»", async () => {
  const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
  const { counterLabel, counterLabelled } = await import("../src/lib/inventory/model.ts");
  const { sheetCounters } = await import("../src/lib/inventory/owner-moves.ts");
  const records = read("src/components/persistent-records.tsx");
  assert.match(records, /<dt title=\{key\}>\{resourcePresentation\(key\)\.kind === "money" \? t\(resourcePresentation\(key\)\.label\) : counterLabel\(selected, key, language\)\}<\/dt>/, "the records' resource list");
  assert.match(records, /\.map\(\(\[key, value\]\) => <div key=\{key\}><dt>\{counterLabel\(entity, key, language\)\}<\/dt>/, "the earlier sheet's «Resources»");
  assert.match(records, /labelOf=\{entity \? \(key\) => \(resourcePresentation\(key\)\.kind === "money" \? t\(resourcePresentation\(key\)\.label\) : counterLabel\(entity, key, language\)\) : undefined\}/, "the record editor");
  assert.doesNotMatch(records, /resources\)\.map\(\(\[key, value\]\) => \(\s*<div key=\{key\}>\s*<dt>\{key\}<\/dt>/, "no raw counter key");
  assert.doesNotMatch(records, /kind === "resource"\)\.map\(\(\[key, value\]\) => <div key=\{key\}><dt>\{t\(resourcePresentation\(key\)\.label\)\}/);
  assert.match(read("src/components/persistent-game.tsx"), /resourcePresentation\(key\)\.kind === "money" \? t\(resourcePresentation\(key\)\.label\) : counterLabel\(player, key, language\)/);
  assert.match(read("src/components/registry/character-screen.tsx"), /const counters = sheetCounters\(entity, c\.language\);/);
  assert.match(read("src/components/registry/game-screen.tsx"), /<dt>\{hero \? counterLabel\(hero, resource\.key, c\.language\) : c\.label\(resource\.label\)\}<\/dt>/);
  assert.match(read("src/lib/inventory/owner-moves.ts"), /label: counterLabel\(entity, key, language\), labelled: counterLabelled\(entity, key\)/);
  // The owner's counter with its name: the sheet's row reads Russian and loses the «?».
  const tusk = { resources: { shaman_tusk: 2, shaman_tusk_max: 3 }, public_profile: { counterLabels: { shaman_tusk: "Клык шамана" } } };
  assert.deepEqual(sheetCounters(tusk, "ru"), [{ key: "shaman_tusk", label: "Клык шамана", labelled: true, value: 2, max: 3 }]);
  assert.equal(counterLabel({ public_profile: {} }, "shaman_tusk", "ru"), "Shaman tusk", "without the name: the key made readable, flagged «?»");
  assert.equal(counterLabelled({ public_profile: {} }, "shaman_tusk"), false);
  // The migration on a disposable campaign: by shape, once, a name already given untouched.
  const { loopCampaign } = await import("./dm-loop-fixture.mjs");
  const c = await loopCampaign({ language: "ru" });
  try {
    await c.f.query("update public.rpg_entities set resources = resources || '{\"shaman_tusk\": 2, \"shaman_tusk_max\": 3}'::jsonb where id = $1", [c.hero]);
    await c.f.query("update public.rpg_entities set resources = resources || '{\"shaman_tusk\": 1}'::jsonb, public_profile = public_profile || '{\"counterLabels\": {\"shaman_tusk\": \"Бивень\"}}'::jsonb where id = $1", [c.npc]);
    const before = await c.f.one("select revision from public.rpg_entities where id = $1", [c.hero]);
    const migration = readFileSync(new URL("../supabase/migrations/202610230501_fix_s3_accept_counter_label.sql", import.meta.url), "utf8");
    await c.f.db.exec(migration);
    const hero = await c.f.one("select revision, resources, public_profile from public.rpg_entities where id = $1", [c.hero]);
    assert.equal(hero.public_profile.counterLabels.shaman_tusk, "Клык шамана");
    assert.deepEqual([hero.resources.shaman_tusk, hero.resources.shaman_tusk_max], [2, 3], "the value and the maximum stay");
    assert.equal(hero.revision, before.revision + 1);
    assert.equal(counterLabel(hero, "shaman_tusk", "ru"), "Клык шамана");
    assert.equal((await c.f.one("select public_profile from public.rpg_entities where id = $1", [c.npc])).public_profile.counterLabels.shaman_tusk, "Бивень", "a given name is kept");
    await c.f.db.exec(migration);
    assert.equal((await c.f.one("select revision from public.rpg_entities where id = $1", [c.hero])).revision, hero.revision, "idempotent");
  } finally { await c.f.db.close(); }
});
