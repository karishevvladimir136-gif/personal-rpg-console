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

test("Fix S3-accept Б2: a Russian campaign's 2D hotspots read Russian — the sheet's rule, the records-only sheet, the redone older sheet, the click's words", async () => {
  const { sheetRequest, fallbackSheet, poiCandidates } = await import("../src/lib/live2d/scene.ts");
  const { foreignTexts, foreignTo, needsLanguageRedo, parseRelangReply } = await import("../src/lib/live2d/scene-language.ts");
  const { poiIntent, placeIntent } = await import("../src/lib/live2d/intents.ts");
  // The test of «foreign»: Latin words and not one Cyrillic letter; a Russian sentence with a Latin name is Russian.
  assert.equal(foreignTo("The main door of the guard post", "ru"), true);
  assert.equal(foreignTo("Дверь поста (Olga's door)", "ru"), false);
  assert.equal(foreignTo("The main door of the guard post", "en"), false, "an English campaign reads English");
  const source = { place: { id: "p", name: "Пост стражи", description: "Бревенчатый пост у дороги." }, exits: [{ id: "8f1c2d3e-4b5a-4c6d-8e7f-9a0b1c2d3e4f", name: "Пристань", relation: "child" }],
    present: [], passages: [], timeOfDay: null, language: "ru" };
  assert.match(sheetRequest(source).system, /Write summary, description, light and never in Russian, the campaign's language/);
  // The sheet from the records alone (no model): the hotspots' notes are Russian, the illustrator keeps English.
  const fallback = fallbackSheet(source);
  assert.deepEqual(foreignTexts(fallback, "ru"), []);
  assert.equal(fallback.language, "ru");
  assert.deepEqual(fallback.features.map((row) => row.description), ["Путь внутрь.", "Дорога в Пристань."]);
  assert.deepEqual(fallback.features.map((row) => row.brief), ["the way in", "the way to Пристань"]);
  const snapshot = { campaign: { id: "c" }, locations: [], entities: [] };
  for (const candidate of poiCandidates(fallback, snapshot, "p", null)) assert.equal(foreignTo(candidate.note, "ru"), false, candidate.note);
  // An older English sheet is due for the one-time redo; the redone one is Russian and never due again.
  const old = { summary: "A guard post.", features: [{ key: "door", label: "Дверь поста", kind: "entrance", description: "The main door of the guard post", mustShow: true, targetLocationId: null }],
    people: [], light: "", timeOfDay: null, never: ["a second floor"], crowded: false };
  assert.equal(needsLanguageRedo(old, "ru"), true);
  const redone = parseRelangReply('{"summary":"Сторожевой пост.","light":"","never":["второй этаж"],"features":[{"key":"door","description":"Главная дверь сторожевого поста."}]}', old, "ru");
  assert.deepEqual(foreignTexts(redone, "ru"), []);
  assert.equal(needsLanguageRedo(redone, "ru"), false);
  assert.equal(parseRelangReply('{"summary":"A guard post.","never":["второй этаж"],"features":[{"key":"door","description":"Главная дверь."}]}', old, "ru"), null, "a reply still in English is not taken");
  // What a click on a hotspot or a place writes into the action box.
  for (const kind of ["person", "exit", "lead", "object", "feature"]) assert.doesNotMatch(poiIntent({ kind, label: "Ворота" }, "ru"), /[A-Za-z]{3,}/, kind);
  assert.doesNotMatch(placeIntent("Берегово", "ru"), /[A-Za-z]{3,}/);
});
