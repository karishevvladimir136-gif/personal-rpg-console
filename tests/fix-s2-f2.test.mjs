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
  assert.match(screen, /href=\{`\$\{href\("library"\)\}\?doc=\$\{encodeURIComponent\(rules\.guideId\)\}`\}/, "the link opens the DM guide in the Library");
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
