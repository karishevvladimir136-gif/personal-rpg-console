// Polish stage, group 5 (docs/stages/POLISH.md): pictures — one picture path for
// every button (the Stage V store), the legacy «OpenAI draws the anchors» trap
// removed, «Кадр сцены» acting on the Stage V frames, «Скрыть» hiding the frame
// of the turn, and the strip's lightbox.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { frameFor, framesOfTurn, parsePictureAutopilot, parsePictureSettings } from "../src/lib/visual-frame/pictures.ts";

const src = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
// The frames panel is a React client module (CSS modules, next/link): its pure helpers are
// re-implemented here from the source text, the component itself is checked as text.
const frameHelpers = src("src/components/registry/live-frames.tsx");
const helper = (name) => { const match = frameHelpers.match(new RegExp(`export function ${name}\\([^)]*\\)[^{]*\\{([\\s\\S]*?)\\n\\}`)); return match ? match[1] : null; };
const currentFrameTurnId = new Function("play", "live", helper("currentFrameTurnId").replace(/: [A-Za-z<>\[\]| ]+(?=[=,)])/g, ""));
const frameCaption = new Function("turn", helper("frameCaption"));
const picture = (over) => ({ id: over.id, kind: "frame", subjectKind: "turn", subjectId: over.turnId, composition: "frame", timeline: { timelineId: "t", epoch: 1 },
  version: over.version ?? 1, status: over.status ?? "ready", hidden: over.hidden ?? false, model: "m", tier: "fast", trigger: "live", styleVersionId: null,
  width: 1024, height: 576, costUsdMicros: 0, error: null, createdAt: `2026-10-17T00:00:0${over.version ?? 1}Z`, shotText: null });

test("«Скрыть»: a hidden frame is never the shown one; the versions stay listed for «Показать»; the newest unhidden version shows", () => {
  const board = { pictures: [picture({ id: "a", turnId: "turn-1", version: 1 }), picture({ id: "b", turnId: "turn-1", version: 2, hidden: true })] };
  assert.equal(frameFor(board, "turn-1").picture.id, "a", "the older unhidden version shows when the newest is hidden");
  assert.equal(framesOfTurn(board, "turn-1").length, 2, "hidden versions stay in the list");
  const allHidden = { pictures: board.pictures.map((row) => ({ ...row, hidden: true })) };
  assert.equal(frameFor(allHidden, "turn-1").picture, null, "a turn whose frames are all hidden shows none");
  assert.equal(frameFor(allHidden, "turn-1").drawing, false);
});

test("the frames panel hides every ready version of the turn and offers «Показать»; the thumbnails open a lightbox with the turn's first line, «←/→» and Esc", () => {
  const panel = src("src/components/registry/live-frames.tsx");
  assert.match(panel, /const hideTurn = async \(\) =>[\s\S]*versions\.filter\(\(version\) => !version\.hidden\)\)[\s\S]*"pictures\.hide", \{ id: row\.id, hidden: true \}/);
  assert.match(panel, /hiddenOnly && versions\.at\(-1\)[\s\S]*"pictures\.hide", \{ id: versions\.at\(-1\)!\.id, hidden: false \}/);
  assert.match(panel, /function FrameLightbox/);
  assert.match(panel, /event\.key === "Escape"\) onClose\(\)/);
  assert.match(panel, /event\.key === "ArrowLeft"/);
  assert.match(panel, /event\.key === "ArrowRight"/);
  assert.match(panel, /role="dialog" aria-modal="true" aria-label=\{c\("Кадр крупно", "Frame, large"\)\}/);
  assert.match(panel, /<button key=\{turn\.id\} type="button" role="listitem" className=\{f\.thumb\}[^\n]*onClick=\{\(\) => openEntry\(picture!\.id\)\}/, "a thumbnail opens the lightbox instead of jumping to the saved turn");
  assert.match(panel, /id="registry-frames"/, "the composer's «Кадр сцены» scrolls to the panel");
  assert.equal(frameCaption({ input: "Иду к стойке.", narration: "Марта смотрит на пояс.\nВторая строка." }), "Марта смотрит на пояс.");
  assert.equal(frameCaption({ input: "Иду к стойке.", narration: null }), "Иду к стойке.");
  assert.equal(frameCaption({ input: "x", narration: "а".repeat(200) }).length, 158);
  const play = { turns: [{ id: "t1", mode: "game" }, { id: "f1", mode: "feedback" }] };
  assert.equal(currentFrameTurnId(play, null), "t1");
  assert.equal(currentFrameTurnId(play, { operationId: "t2", status: "generating" }), "t2", "the streaming turn's frame");
  assert.equal(currentFrameTurnId(play, { operationId: "t1", status: "committed" }), "t1");
  assert.equal(currentFrameTurnId(null, null), null);
});

test("«Кадр сцены» acts on the Stage V frames; the legacy FRAME and video blocks leave the player's screen", () => {
  const game = src("src/components/registry/game-screen.tsx");
  assert.doesNotMatch(game, /CurrentSceneMediaFrame|CurrentSceneVideo|mediaOpen/);
  assert.match(game, /pictures\.send\("pictures\.frame", \{ operationId: frameTurnId, trigger: "redraw" \}\)/);
  assert.match(game, /getElementById\("registry-frames"\)\?\.scrollIntoView/);
});

test("one picture path for every button: the portrait, figure, item, holding and place buttons draw through the Stage V store", () => {
  for (const path of ["src/components/registry/party-screen.tsx", "src/components/registry/character-screen.tsx", "src/components/registry/holdings-screen.tsx",
    "src/components/atlas-map.tsx", "src/components/persistent-records.tsx"]) {
    const text = src(path);
    assert.doesNotMatch(text, /GenerateVisual|GenerateMap/, `${path} no longer uses the legacy path`);
    assert.match(text, /RedrawAnchor/, `${path} draws through the Stage V store`);
  }
  const redraw = src("src/components/registry/redraw-anchor.tsx");
  assert.match(redraw, /pictures\.send\("pictures\.anchor", \{ subject, trigger: "manual"/);
  assert.match(redraw, /result\?\.status === "cap"/, "the daily cap is explained, never a dead button");
  // Polish 2 §6: «Создать карту» is back as a Stage V «atlas» picture through the same store; the legacy artwork path stays gone.
  assert.doesNotMatch(src("src/components/atlas-map.tsx"), /Atlas artwork for this view/, "the legacy atlas artwork path leaves the map screen");
  assert.match(src("src/components/atlas-map.tsx"), /pictures\.send\("pictures\.anchor", \{ subject: \{ kind: "location", id: atlasSubjectId \}, composition: "atlas", trigger: "manual" \}\)/);
});

test("the legacy «OpenAI draws the anchors» choice is gone: a stored setting reads as fal and the settings screen no longer offers it", () => {
  assert.equal(parsePictureAutopilot({ provider: "openai", enabled: true }).provider, "fal");
  assert.equal(parsePictureSettings({ autopilot: { provider: "openai" } }).autopilot.provider, "fal");
  const settings = src("src/components/registry/settings-screen.tsx");
  assert.doesNotMatch(settings, /value: "openai", label: "OpenAI"/);
  assert.doesNotMatch(settings, /Кто рисует анкеры/);
  // Polish 2: the catalogue of both providers with a model per tier, GPT Image 2.5 by default.
  assert.match(settings, /Модели картинок/);
  assert.match(settings, /data-testid=\{`picture-model-\$\{tier\}`\}/);
  assert.match(settings, /PICTURE_MODELS\.map/);
  assert.match(settings, /DEFAULT_TIER_MODELS/);
});
