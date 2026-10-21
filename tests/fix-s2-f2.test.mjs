// Fix run after session 2, stage F part 2 — the screens and settings (docs/runs/session2-owner-notes.md items 4–7, 22,
// 25, 26, 29, 30): who does what in the AI block, readable sizes, «Крупный текст истории» on the game screen, the DM
// Craft cards, the campaign screens filling the window, the Library's one document panel, the rules in words, the
// opening's frame, and the quiet tools.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { providerSettings } from "../src/lib/production/configuration.ts";
import { wave2ConfigText } from "../src/lib/locales/wave2-config.ts";
import { guideFirstLine, rulesInWords } from "../src/lib/ui/rules-words.ts";
import { openingAnchorTarget } from "../src/lib/visual-frame/pictures.ts";

const src = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const ru = JSON.parse(src("src/lib/locales/ru.json"));

test("F2 item 4: the AI block says who does what — three provider keys as flags, the DM and pictures per campaign, the background model", () => {
  const view = providerSettings({ OPENAI_API_KEY: "SYNTHETIC_OPENAI", ANTHROPIC_API_KEY: "SYNTHETIC_ANTHROPIC", FAL_KEY: "" });
  assert.deepEqual(view.providers.map((row) => [row.id, row.status]), [
    ["openai", "configured_not_tested"], ["anthropic", "configured_not_tested"], ["fal", "unavailable"],
  ], "OpenAI first (callers read it by id), then Anthropic and fal");
  const json = JSON.stringify(view);
  assert.ok(!json.includes("SYNTHETIC_OPENAI") && !json.includes("SYNTHETIC_ANTHROPIC"), "never a key, only whether it is set");
  assert.ok(view.models.every((model) => model.providerId === "openai"), "the background model's choices stay OpenAI's");
  const text = wave2ConfigText("ru");
  assert.equal(text.aiTitle, "ИИ: кто что делает");
  assert.equal(text.keyPresent, "ключ есть");
  assert.equal(text.keyMissing, "нет ключа");
  assert.match(text.dmWho, /^Ведущий — в настройках каждой кампании \(по умолчанию Claude Opus 5\.5\)/);
  assert.match(text.picturesWho, /^Картинки — в настройках кампании/);
  assert.equal(text.backgroundTitle, "Фоновая модель OpenAI");
  assert.match(text.backgroundUses, /канон мира в «Мирах»/);
  const block = src("src/components/production-settings.tsx");
  const ai = block.slice(block.indexOf("export function AIProviderSettings"), block.indexOf("function KeyStatus"));
  assert.match(ai, /<KeyStatus value=\{provider\.status\} \/>/);
  assert.match(ai, /<details className=\{styles\.overrides\}>\s*<summary>\{c\.details\}<\/summary>[\s\S]*data\.models\.map/, "the model chips under «Подробнее»");
  assert.doesNotMatch(ai, /<Badge>\{"OpenAI"\}<\/Badge>|c\.campaignHint|c\.statusHelp/, "no «Кампании наследуют эту модель», no OpenAI-only badge");
  assert.match(src("src/lib/server/gameplay-service.ts"), /providers\.providers\.find\(\(provider\) => provider\.id === "openai"\)/);
});

test("F2 item 6: «Крупный текст истории» reaches the game screen — the campaign shell sets the class, the story is clearly larger, the line kept", () => {
  const shell = src("src/components/registry/shell.tsx");
  assert.match(shell, /const largeText = chrome\?\.largeText \?\? !!workspace\?\.data\?\.preferences\.largeText;/);
  assert.match(shell, /<div className=\{`\$\{s\.app\} \$\{largeText \? "large-text" : ""\}`\}>/);
  const css = src("src/components/registry/game.module.css");
  assert.match(css, /:global\(\.large-text\) \.game :global\(\.gameplay-narration \.prose\),[\s\S]*?font-size: 21px;/);
  assert.match(css, /:global\(\.large-text\) \.game :global\(\.gameplay-owner-words \.prose\) \{\n  font-size: 18px;/);
  assert.match(css, /\.opening \{\n  max-width: 82ch;/, "the line length is kept in characters");
  assert.equal(ru["Story text on the game screen is larger."], "Текст истории на экране игры крупнее.");
  assert.match(src("src/components/persistent-settings.tsx"), /\? "Story text on the game screen is larger\."/);
});

test("F2 item 26: the campaign's rules in words from the DM guide's first line; no per-turn limits on the owner's screen; DC and dice shown for every rules system", () => {
  assert.equal(guideFirstLine("# Руководство ведущего\n\nD&D 5e (2014), правила по книге игрока.\nДальше…"), "D&D 5e (2014), правила по книге игрока");
  assert.equal(guideFirstLine("**Правила:** D&D 5e"), "Правила: D&D 5e");
  assert.equal(guideFirstLine("  \n- \n"), null);
  const long = guideFirstLine("Стимпанк-приключение по свободным правилам, где каждая проверка решается одной костью и здравым смыслом ведущего, без таблиц");
  assert.ok(long.endsWith("…") && long.length <= 92, long);
  assert.deepEqual(rulesInWords({ dmGuideDocumentId: "g", documents: [{ id: "g", body: "D&D 5e" }] }), { guideId: "g", line: "D&D 5e" });
  assert.deepEqual(rulesInWords({ dmGuideDocumentId: "g", documents: [{ id: "g", body: "" }] }), { guideId: "g", line: null });
  const screen = src("src/components/registry/settings-screen.tsx");
  assert.doesNotMatch(screen, /Правила и пределы кампании|Пределы одного хода|Сохранить пределы|DM_LOOP_LIMIT_KEYS|rulesSystem\.label/);
  assert.match(screen, /c\(`\$\{rules\.line\} — по руководству ведущего`/);
  assert.match(screen, /c\("Свои правила — руководство ведущего пока пустое"/);
  assert.match(screen, /href=\{`\$\{href\("library"\)\}\$\{href\("library"\)\.includes\("\?"\) \? "&" : "\?"\}doc=\$\{encodeURIComponent\(rules\.guideId\)\}`\}/,
    "the link opens the DM guide in the Library");
  for (const title of ["Показывать сложность (DC)", "Важные броски кидаю я", "Перебросы"]) assert.ok(screen.includes(`c("${title}"`), title);
  assert.match(screen, /operation: "settings\.save", timeline: data\.timeline, correctionScope: "timeline"/);
  assert.match(screen, /value: value \? "limited" : "disabled"/);
  assert.match(screen, /if \(fold instanceof HTMLDetailsElement\) fold\.open = true;/, "«Изменить в полных настройках» opens the fold");
  // The limits stay on the server: the settings API still takes them.
  assert.match(src("src/lib/gameplay/dm-settings-client.ts"), /limits/);
});

test("F2 item 29: the opening's frame is the starting place's anchor, asked once when the opening shows; the header says «рисуется…»", () => {
  const board = (pictures = [], settings = {}) => ({ pictures, settings: { frames: "every", dailyCap: 60, ...settings }, today: { count: 0 } });
  const snapshot = { publicState: { current_location_id: "beregost" }, locations: [{ id: "beregost", status: "visited" }] };
  assert.equal(openingAnchorTarget(board(), snapshot, []), "beregost");
  assert.equal(openingAnchorTarget(board([], { frames: "off" }), snapshot, []), null, "frames off — no frame");
  assert.equal(openingAnchorTarget(board([], { dailyCap: 0 }), snapshot, []), null, "the daily cap");
  assert.equal(openingAnchorTarget(board(), snapshot, [{ mode: "game", status: "committed", narration: "Рассвет." }]), null, "after the first turn the turns have their frames");
  assert.equal(openingAnchorTarget(board(), snapshot, [{ mode: "ooc", status: "committed", narration: "Вне игры." }]), "beregost");
  const tried = { kind: "anchor", subjectKind: "location", subjectId: "beregost", composition: "location", status: "failed" };
  assert.equal(openingAnchorTarget(board([tried]), snapshot, []), null, "one attempt, never retried on its own");
  assert.equal(openingAnchorTarget(board(), { ...snapshot, locations: [{ id: "beregost", status: "rumored" }] }, []), null);
  const frames = src("src/components/registry/live-frames.tsx");
  assert.match(frames, /export function useOpeningFrame/);
  assert.match(frames, /send\("pictures\.anchor", \{ subject: \{ kind: "location", id: target \}, trigger: "autopilot" \}\)/);
  const game = src("src/components/registry/game-screen.tsx");
  assert.match(game, /useOpeningFrame\(data, preview \? null : play\);/);
  assert.match(game, /drawingLabel=\{c\("кадр сцены рисуется…", "drawing the scene…"\)\}/);
  assert.match(src("src/lib/server/media/pictures-service.ts"), /if \(inWork\) return \{ status: "queued" as const, picture: inWork \};/, "a second tab gets the picture in work");
});

test("F2 item 30: «Закончить сессию» is the quietest tool, last in the row; HP corrections behind «Исправить хиты…»; the card closes outside", () => {
  const end = src("src/components/registry/session-end.tsx");
  assert.match(end, /if \(!closed && compact\) \{[\s\S]*?className=\{g\.quietButton\}/);
  const css = src("src/components/registry/game.module.css");
  assert.match(css, /\.quietButton \{[^}]*border: 0;[^}]*background: transparent;[^}]*font-size: 14px;/);
  const game = src("src/components/registry/game-screen.tsx");
  assert.ok(game.indexOf('{c("Что я знаю?", "What do I know?")}') < game.indexOf("<SessionEnd sessionId={session?.id ?? null} compact />"), "last in the row");
  const sheet = src("src/components/registry/character-screen.tsx");
  assert.match(sheet, /if \(!open\) return <button type="button" className=\{s\.linkButton\} onClick=\{\(\) => setOpen\(true\)\}>\{c\("Исправить хиты…", "Correct hit points…"\)\}<\/button>;/);
  assert.match(sheet, /export function useCardDismiss/);
  assert.match(sheet, /document\.addEventListener\("pointerdown", outside\)/);
  assert.match(sheet, /target\.closest\("\[data-item-pick\], \[role='dialog'\], \[data-keep-card\]"\)/);
  assert.equal((sheet.match(/data-item-pick=""/g) ?? []).length, 3, "the slot, the row and the cell open a card");
  assert.match(src("src/components/registry/holdings-screen.tsx"), /useCardDismiss\(!!itemId, \(\) => setItemId\(null\)\);/);
});

test("F2 item 5: nothing on the owner's screens is under 13px; helper and muted text at least 14px; body text 16px", async () => {
  const { readdirSync, statSync } = await import("node:fs");
  const files = [];
  const walk = (dir) => {
    for (const name of readdirSync(new URL(`../${dir}`, import.meta.url))) {
      const path = `${dir}/${name}`;
      if (statSync(new URL(`../${path}`, import.meta.url)).isDirectory()) walk(path);
      else if (path.endsWith(".css")) files.push(path);
    }
  };
  walk("src");
  const small = [];
  for (const file of files) {
    // Fix S3-pre A-5: World Lab and the old sheet's fold (.combat-stats) keep the floor too; the old combat screen's
    // rules stay outside this pass.
    const text = src(file);
    for (const block of text.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      const selector = block[1].replace(/\/\*[\s\S]*?\*\//g, "").trim();
      if (/::(before|after)/.test(selector)) continue;
      if (file.endsWith("globals.css") && /combat|initiative/i.test(selector) && !/combat-stats/.test(selector)) continue;
      // Merge after session 2: the 2D Live battle map's on-token badges (initiative, HP, condition letters, the
      // opportunity-attack flag, the phone token's initials) and the SVG's feature labels (grid units) are the map's
      // drawing, sized to the 44 px token; every text panel of the 2D screens keeps the 13 px floor.
      if (file.endsWith("live2d/battle/battle.module.css") && /^\.(init|hpNum|condChip|oa|tokenFace|featureLabel)$/.test(selector)) continue;
      for (const size of block[2].matchAll(/font-size:\s*([0-9.]+)(px|rem)/g)) {
        const px = size[2] === "px" ? Number(size[1]) : Number(size[1]) * 16;
        if (px > 0 && px < 13) small.push(`${file}: ${selector} ${size[1]}${size[2]}`);
      }
    }
  }
  assert.deepEqual(small, [], "every chip and label at least 13px");
  const globals = src("src/app/globals.css");
  assert.match(globals, /\nbody \{[^}]*font-size: 16px;/);
  assert.match(globals, /\n\.setting-row p \{[^}]*font-size: 15px;/);
  assert.match(globals, /\n\.panel-heading \.muted \{\n  font-size: 14px;/);
  assert.match(src("src/app/registry.css"), /\n\.muted \{\n  color: var\(--muted\);\n  font-size: 15px;/);
  assert.match(src("src/components/registry/registry.module.css"), /\n\.note \{\n  font-size: 15px;/);
  assert.match(src("src/components/registry/registry.module.css"), /@media \(min-width: 2200px\) \{[\s\S]*\.note,[\s\S]*font-size: 16\.5px;/, "a step larger on a big monitor");
});

test("F2 item 7: «Мастерство Ведущего» — one-size cards with a short description, the main doctrine first, the whole card in a dialog with its own folded history", async () => {
  const { craftSummary, craftCategoryLabel, craftOrder } = await import("../src/lib/ui/craft-view.ts");
  assert.equal(craftSummary("Коротко. Второе предложение здесь. Третье не нужно."), "Коротко. Второе предложение здесь.");
  const long = "Это первое предложение достаточно длинное, чтобы одного хватило для карточки в сетке мастерства ведущего. Второе.";
  assert.equal(craftSummary(long), long.split(" Второе")[0]);
  assert.ok(craftSummary("слово ".repeat(80), 220).endsWith("…"));
  assert.equal(craftCategoryLabel("cognitive", "ru"), "разум мира");
  assert.equal(craftCategoryLabel("voice", "ru"), "голос");
  assert.equal(craftCategoryLabel("mystery-x", "ru"), null, "no English word in Russian tags");
  assert.equal(craftCategoryLabel("voice", "en"), "voice");
  const ordered = craftOrder([{ key: "b", kind: "card", title: "Б" }, { key: "core-doctrine", kind: "doctrine", title: "Как вести игру" }, { key: "a", kind: "card", title: "А" }]);
  assert.equal(ordered.main.key, "core-doctrine");
  assert.deepEqual(ordered.cards.map((row) => row.key), ["a", "b"]);
  const screen = src("src/components/dm-craft-owner.tsx");
  assert.match(screen, /aria-haspopup="dialog"/);
  assert.match(screen, /<Modal title=\{versionText\(opened, language\)\.title\}/);
  assert.match(screen, /history=\{view\.versions\.filter\(\(version\) => version\.key === opened\.key\)/, "the history of that card only");
  assert.match(screen, /<details className=\{k\.history\}>/, "folded");
  assert.match(screen, /t\("Make it the approved version"\)/);
  assert.doesNotMatch(screen, /<Panel title=\{t\("Version history"\)\}>/, "no page-long history of every card");
  const tile = screen.slice(screen.indexOf("const tile ="), screen.indexOf("  return (\n    <>"));
  assert.doesNotMatch(tile, /Edit and review a new version|version\.category|Avoid:/, "the grid card: no edit button, no tags, no «Избегать»");
  const css = src("src/components/dm-craft.module.css");
  assert.match(css, /grid-auto-rows: 1fr;/, "the cards are one size");
  assert.match(css, /-webkit-line-clamp: 3;/);
  assert.match(css, /@media \(min-width: 1280px\) \{\n  \.grid \{\n    grid-template-columns: repeat\(3, minmax\(0, 1fr\)\);/);
  assert.match(css, /@media \(min-width: 1800px\) \{\n  \.grid \{\n    grid-template-columns: repeat\(4, minmax\(0, 1fr\)\);/);
  assert.equal(ru["Craft card"], "Карточка");
  assert.equal(ru["Make it the approved version"], "Сделать одобренной");
});

test("F2 item 22: the shell fills the window — the full-height sticky menu, the content at least the window's height, the width used on big monitors", () => {
  const css = src("src/components/registry/shell.module.css");
  assert.doesNotMatch(css, /max-width: 1920px/, "no 1920px cap with empty bands at 2560");
  assert.match(css, /\.nav \{\n  position: sticky;\n  top: 16px;\n  align-self: start;\n  height: calc\(100dvh - 32px\);/);
  assert.match(css, /\.dm \{\n[^}]*margin-top: auto;/, "the DM box at the foot of the menu");
  assert.match(css, /\.app > \.main \{\n    min-height: calc\(100dvh - 32px\);/);
  assert.match(css, /@media \(min-width: 2200px\) \{\n  \.app \{\n    grid-template-columns: 300px minmax\(0, 1fr\);/);
  assert.match(src("scripts/fix-s2-screenshots.mjs"), /\[1440, 900, "900p"\], \[1920, 1080, "1080p"\], \[2560, 1440, "1440p"\], \[390, 844, "phone"\]/);
});

test("F item 22: the campaign list and the new-campaign wizard widen on a big monitor", () => {
  assert.match(src("src/components/registry/library.module.css"), /@media \(min-width: 2200px\) \{\s*\.page \{\s*max-width: 1800px;/);
});

test("F2 item 25: the Library's document — Markdown read safely, one panel, no system paragraphs, «Загрузить файл» as a link, history behind «Версии»", async () => {
  const { parseMarkdown, parseInline } = await import("../src/lib/ui/markdown.ts");
  const blocks = parseMarkdown("# Заголовок\n\nАбзац **жирный** и *курсив*.\nВторая строка.\n\n- один\n- два\n\n1. первый\n2. второй\n\n> цитата\n\n---\n<script>alert(1)</script>");
  assert.deepEqual(blocks.map((block) => block.kind), ["heading", "paragraph", "list", "list", "quote", "rule", "paragraph"]);
  assert.equal(blocks[0].level, 1);
  assert.deepEqual(blocks[1].inline.map((part) => part.kind), ["text", "strong", "text", "em", "text"]);
  assert.match(blocks[1].inline.at(-1).text, /\nВторая строка/, "line breaks inside a paragraph are kept");
  assert.equal(blocks[2].ordered, false);
  assert.equal(blocks[3].ordered, true);
  assert.deepEqual(blocks[6].inline, [{ kind: "text", text: "<script>alert(1)</script>" }], "markup in a document is text, never HTML");
  assert.deepEqual(parseInline("`код` и __важно__"), [{ kind: "code", text: "код" }, { kind: "text", text: " и " }, { kind: "strong", text: "важно" }]);
  assert.doesNotMatch(src("src/components/markdown-view.tsx"), /dangerouslySetInnerHTML/);
  const docs = src("src/components/persistent-documents.tsx");
  const library = docs.slice(docs.indexOf("export function LibraryDocumentEditor"));
  assert.doesNotMatch(library, /Guidance changes apply to the current timeline\.|Save or restore guidance explicitly|Plain text and Markdown are stored as written|Refresh saved data|Use saved values/,
    "no system paragraphs or record-keeping buttons in the Library");
  assert.match(library, /className="text-link"\s*onClick=\{\(\) => fileInput\.current\?\.click\(\)\}/, "«Загрузить файл» as a small link");
  assert.match(library, /t\("Versions"\)/);
  assert.match(library, /const afterSave = \(id: string\) => \{[\s\S]*?setSavedId\(id\);\n    setSelectedId\(null\);/, "saving closes the panel");
  assert.match(src("src/app/campaigns/[campaignId]/[screen]/page.tsx"), /<PersistentLibrary initialDocumentId=\{typeof doc === "string" \? doc : null\} \/>/);
  for (const [key, value] of [["Edit this document", "Изменить"], ["Save the document", "Сохранить"], ["Versions", "Версии"], ["Upload a file", "Загрузить файл"]])
    assert.equal(ru[key], value);
});

test("F item 25: the opening asks «Покинуть страницу…» only for a request in flight or a review the owner edited", () => {
  const opening = src("src/components/bootstrap/opening.tsx");
  const dirty = opening.match(/const dirty = ([^;]+);/)?.[1] ?? "";
  assert.ok(dirty, "the opening computes its unsaved state");
  assert.ok(!/!!start\b/.test(dirty), "a saved adventure's start is not an unsaved change");
  assert.ok(!/\|\| !!draft\s*$/.test(dirty) && !/^!!draft\b/.test(dirty), "an untouched proposal (kept in the tab's storage) is not an unsaved change");
  assert.match(dirty, /w\.pending/, "a request in flight is");
  assert.match(dirty, /edited === draft\.draftId/, "an edited review of this draft is");
  assert.match(opening, /onChange=\{\(value\) => \{\s*setEdited\(draft\.draftId\);\s*w\.setReview\(value\);/, "only the owner's edit marks the review");
});
