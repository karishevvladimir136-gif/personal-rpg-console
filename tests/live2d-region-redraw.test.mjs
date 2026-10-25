// 2D Live, the sandbox before session 3: «Перерисовать карту региона · $0.040» did nothing — the button sent
// `region.draw` without `force`, the server kept a ready map of the same places («existing», 200) and the
// screen shows nothing for that answer. Now a press on an existing map is a forced redraw (one quality
// picture), a map that is drawing is never drawn twice, and the button is off while its request runs.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { regionDrawDecision, regionDrawInput } from "../src/lib/live2d/region.ts";

const anchor = "4b763705-9a28-5be1-b9ba-7641f65a6c46";
const picture = "6878e4cd-7ed3-4852-a930-bf61c6ff9d5a";

test("the button: the first map asks plainly, an existing map asks for a forced redraw", () => {
  assert.deepEqual(regionDrawInput(null, null), { anchorId: null });
  assert.deepEqual(regionDrawInput(anchor, null), { anchorId: anchor });
  assert.deepEqual(regionDrawInput(null, { pictureId: null }), { anchorId: null }, "a first draw that failed has no picture yet");
  assert.deepEqual(regionDrawInput(null, { pictureId: picture }), { anchorId: null, force: true });
  assert.deepEqual(regionDrawInput(anchor, { pictureId: picture }), { anchorId: anchor, force: true });
});

test("the server: a forced redraw of the same places draws, a drawing map is never drawn twice", () => {
  const ready = { status: "ready", signature: anchor };
  assert.equal(regionDrawDecision(ready, anchor, false), "existing", "without force a ready map of the same places stays");
  assert.equal(regionDrawDecision(ready, anchor, true), "draw", "«Перерисовать карту региона» draws a new map");
  assert.equal(regionDrawDecision(ready, `${anchor},${picture}`, false), "draw", "a new place still redraws on its own");
  assert.equal(regionDrawDecision({ status: "drawing", signature: anchor }, anchor, true), "drawing", "the drawing guard holds against force");
  assert.equal(regionDrawDecision({ status: "drawing", signature: "" }, anchor, false), "drawing");
  assert.equal(regionDrawDecision({ status: "failed", signature: anchor }, anchor, false), "draw");
  assert.equal(regionDrawDecision(null, anchor, false), "draw");
});

test("the wiring: drawRegionMap decides before any picture is ordered, and the button sends through the guarded path", () => {
  const server = readFileSync(new URL("../src/lib/live2d/server/region.ts", import.meta.url), "utf8");
  const body = server.slice(server.indexOf("export async function drawRegionMap"), server.indexOf("export async function seedArea"));
  assert.match(body, /const decision = regionDrawDecision\(existing, signature, value\.force === true\);\s*if \(decision !== "draw"\) return \{ status: decision, anchorId \};/);
  const decideAt = body.indexOf("regionDrawDecision(");
  assert.ok(decideAt > 0 && body.indexOf("capRemaining(") > decideAt && body.indexOf("createPictureRow(") > decideAt);
  assert.doesNotMatch(body, /existing\?\.status === "drawing"/, "one rule, in the helper");
  const screen = readFileSync(new URL("../src/components/live2d/live2d-screen.tsx", import.meta.url), "utf8");
  assert.match(screen, /disabled=\{regionSending \|\| regionMap\?\.status === "drawing"\} aria-busy=\{regionSending\} onClick=\{\(\) => void drawRegion\(regionDrawInput\(view\.anchorId, regionMap\)\)\}/);
  assert.match(screen, /if \(regionSendingNow\.current\) return;\s*regionSendingNow\.current = true;\s*setRegionSending\(true\);/);
  assert.match(screen, /finally \{ regionSendingNow\.current = false; setRegionSending\(false\); \}/);
  assert.equal(screen.match(/send\("region\.draw"/g)?.length, 1, "the region request is sent only through the guarded path");
});
