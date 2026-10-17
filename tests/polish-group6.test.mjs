// Polish stage, group 6 (docs/stages/POLISH.md): the game screen layout — one stage, one page
// scroll, a compact composer with icon tools, one «Ведущий думает…», the turn's changes
// folded and led by items and money, no timers, no adventure card, «Зацепки» and «Долги и
// обещания», the goal from the taken quest, the addressee read from the text.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { detectAddressee, orderChanges, questsOf, timeOfDayWord, worldClock } from "../src/lib/ui/campaign-view.ts";
import { belongsToChannel } from "../src/lib/gameplay/client-state.ts";
import russian from "../src/lib/locales/ru.json" with { type: "json" };

const src = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("no timers: the header clock says the time of day in words", () => {
  assert.equal(worldClock(10, "ru"), "День 1 · ночь");
  assert.equal(worldClock(7 * 60, "ru"), "День 1 · утро");
  assert.equal(worldClock(12 * 60 + 30, "ru"), "День 1 · полдень");
  assert.equal(worldClock(15 * 60, "ru"), "День 1 · день");
  assert.equal(worldClock(1440 + 19 * 60, "en"), "Day 2 · evening");
  assert.equal(timeOfDayWord(23 * 60, "en"), "night");
  const game = src("src/components/registry/game-screen.tsx");
  assert.doesNotMatch(game, /adventureElapsed|envelopeLabel|Приключение", "Adventure"/, "the adventure card and its pace badge left the game screen");
});

test("the addressee is read from the text: «@Тамсин» or «Тамсин, …» among the people present; narration about a person is not an address", () => {
  const present = [{ id: "t", name: "Тамсин Вейл" }, { id: "m", name: "Мокей" }];
  assert.equal(detectAddressee("Тамсин, что ты знаешь о ящике?", present)?.id, "t");
  assert.equal(detectAddressee("@Мокей держи линь", present)?.id, "m");
  assert.equal(detectAddressee("Мокею: помоги с воротом", present)?.id, "m", "an inflected name still matches by its stem");
  assert.equal(detectAddressee("Тамсин смотрит на меня, а я иду к стойке.", present), null, "no comma, no @: not an address");
  assert.equal(detectAddressee("Иду к стойке, Тамсин идёт следом.", present), null);
  assert.equal(detectAddressee("", present), null);
  assert.equal(belongsToChannel({ mode: "companion", companionId: "t", id: "x" }, "game", null), true, "a talk with a companion is a scene in the story");
  assert.equal(belongsToChannel({ mode: "feedback", companionId: null, id: "x" }, "game", null), false);
});

test("the turn's changes are folded and lead with items and money; the goal falls back to the open arc", () => {
  const ordered = orderChanges([{ name: "advance_time", summary: "t" }, { name: "upsert_character", summary: "p" }, { name: "money", summary: "m" }, { name: "item", summary: "i" }, { name: "resource", summary: "hp" }]);
  assert.deepEqual(ordered.map((row) => row.name), ["item", "money", "resource", "upsert_character", "advance_time"]);
  const quest = (over) => ({ id: over.id, status: "open", kind: over.kind, title: over.title, updated_at: over.updated_at ?? "2026-10-17T00:00:00Z", detail: {} });
  assert.equal(questsOf({ quests: [quest({ id: "a", kind: "arc", title: "The valve" })] }).goal?.title, "The valve", "the open arc is the goal when no quest was taken");
  assert.equal(questsOf({ quests: [quest({ id: "a", kind: "arc", title: "The valve" }), quest({ id: "q", kind: "quest", title: "Ящик с «Сельди»" })] }).goal?.title, "Ящик с «Сельди»", "the taken quest wins");
  const game = src("src/components/registry/game-screen.tsx");
  assert.match(game, /<details key=\{view\.operationId\} className=\{g\.changes\}>/);
  assert.match(game, /Изменения за ход · \$\{changes\.length\}/);
  assert.match(game, /думал глубже · /);
  assert.doesNotMatch(game, /the DM is writing… \(provisional until saved\)/, "one quiet indicator: the turn's own «Ведущий думает…» line");
  assert.equal(russian["DM is thinking…"], "Ведущий думает…");
});

test("one stage, one page scroll, a compact composer with icon tools; «Зацепки» and «Долги и обещания» in the sidebar", () => {
  const game = src("src/components/registry/game-screen.tsx");
  const css = src("src/components/registry/game.module.css");
  assert.match(game, /stageFrameUrl \? \(/, "the live frame takes the stage once ready");
  assert.match(game, /<FramesPanel data=\{data\} play=\{play\} live=\{live\} stage /);
  assert.doesNotMatch(game, /К последнему ходу|Важный ход|Important turn|Открытые нити|Open threads|quickStats/);
  assert.match(game, /c\("Зацепки", "Leads"\)/);
  assert.match(game, /c\("Долги и обещания", "Debts and promises"\)/);
  assert.match(game, /\{quests\.goal && \(/, "an empty goal panel is hidden");
  assert.match(game, /className=\{g\.toolsRow\}/);
  assert.doesNotMatch(game, /c\("Кому:", "To:"\)/, "no permanent addressee row");
  assert.doesNotMatch(css, /max-height: min\(68vh, 900px\)/, "the story is not its own scroll box");
  assert.match(css, /\.game :global\(\.gameplay-channel form\) \{\n  position: sticky;\n  bottom: 0;/);
  assert.match(css, /\.game :global\(\.gameplay-channel textarea\) \{[^}]*font-size: 17px/, "the player's text reads at the story size");
  const composer = src("src/components/gameplay-composer.tsx");
  assert.match(composer, /rows=\{mode === "feedback" \? 5 : 2\}/, "a compact composer");
  assert.match(composer, /resolveSend\?\.\(current\.current\.text\)/, "the addressee decides the mode at send time");
  assert.match(composer, /<div className="button-group gameplay-send-row">[\s\S]*\{inputTools\}\n          <\/div>/, "the tools sit next to «Отправить»");
  const turn = src("src/components/gameplay-turn.tsx");
  assert.match(turn, /optionsVisible && \(/, "«Другие действия» stays out of the way while the DM thinks");
  const frames = src("src/components/registry/live-frames.tsx");
  assert.match(frames, /<details className=\{f\.earlier\}>/, "the strip of earlier frames folds away");
});
