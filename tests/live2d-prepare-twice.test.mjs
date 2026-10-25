// 2D Live, the sandbox before session 3: «Подготовить сцену» pressed twice on one place sent two requests
// while the first was still building its sheet; both read «no scene», the second's first save was refused
// (scene.save raises rpg_conflict when a row exists) and the screen showed «Не удалось отправить запрос»,
// although the first request drew the scene. Now the button is off while its request runs, and a second
// prepare that loses the race answers «drawing» (it joins the first) instead of a 409.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { joinConcurrentPrepare } from "../src/lib/live2d/scene.ts";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const conflict = () => Object.assign(new Error("This record changed. Reload before saving again."), { code: "conflict" });

// The store keeps scene.save's rule of migration 202610210200: a first save (expectedRevision null) on a
// place that already has a scene is a conflict; otherwise the revision must match.
function sceneStore() {
  return {
    scene: null,
    draws: 0,
    async save(expectedRevision) {
      if (expectedRevision === null) {
        if (this.scene) throw conflict();
        this.scene = { revision: 1, status: "draft" };
      } else {
        if (!this.scene || this.scene.revision !== expectedRevision) throw conflict();
        this.scene = { ...this.scene, revision: this.scene.revision + 1 };
      }
      return this.scene;
    },
  };
}

// prepareScene's order: read the board, build the sheet (the slow paid call), save, mark «drawing», draw.
async function prepare(store, sheetMs) {
  const existing = store.scene;
  if (existing?.status === "drawing") return "drawing";
  await sleep(sheetMs);
  const outcome = await joinConcurrentPrepare(() => store.save(existing ? existing.revision : null), async () => store.scene);
  if ("joined" in outcome) return "drawing";
  store.scene = { ...outcome.saved, status: "drawing" };
  store.draws += 1;
  return "queued";
}

test("two «Подготовить сцену» on one place at once: the second joins the first («drawing»), never a 409, and the scene is drawn once", async () => {
  const store = sceneStore();
  const [first, second] = await Promise.all([prepare(store, 20), prepare(store, 30)]);
  assert.equal(first, "queued");
  assert.equal(second, "drawing");
  assert.equal(store.draws, 1);
  assert.deepEqual(store.scene, { revision: 1, status: "drawing" });
  // A later press finds the scene drawing and builds no second sheet.
  assert.equal(await prepare(store, 0), "drawing");
});

test("only a lost first save joins: any other failure, or a conflict with no scene on the re-read, stays an error", async () => {
  assert.deepEqual(await joinConcurrentPrepare(async () => "row", async () => null), { saved: "row" });
  let reread = 0;
  await assert.rejects(
    joinConcurrentPrepare(async () => { throw Object.assign(new Error("down"), { code: "unavailable" }); }, async () => { reread += 1; return {}; }),
    /down/);
  assert.equal(reread, 0, "a failure that is not a conflict is not re-read");
  await assert.rejects(joinConcurrentPrepare(async () => { throw conflict(); }, async () => null), /record changed/);
  await assert.rejects(joinConcurrentPrepare(async () => { throw new Error("plain"); }, async () => ({})), /plain/);
  assert.deepEqual(await joinConcurrentPrepare(async () => { throw conflict(); }, async () => ({ status: "draft" })), { joined: true });
});

test("the wiring: prepareScene answers «drawing» when it joins, and the button is off while its request runs", () => {
  const scenes = readFileSync(new URL("../src/lib/live2d/server/scenes.ts", import.meta.url), "utf8");
  const prepareBody = scenes.slice(scenes.indexOf("export async function prepareScene"), scenes.indexOf("export async function redrawScene"));
  assert.match(prepareBody, /joinConcurrentPrepare\(\s*\(\) => saveScene\(ctx, \{ locationId, sheet, source: "model", expectedRevision: existing \? existing\.revision : null \}\),\s*async \(\) => sceneOf\(await boardOf\(ctx\), locationId\)\)/);
  assert.match(prepareBody, /if \("joined" in outcome\) return \{ status: "drawing", locationId \};/);
  const joinAt = prepareBody.indexOf("joinConcurrentPrepare(");
  assert.ok(joinAt > 0 && prepareBody.indexOf("updateScene(ctx") > joinAt && prepareBody.indexOf("schedule(") > joinAt,
    "a joined request neither marks the scene nor schedules a second drawing");
  const screen = readFileSync(new URL("../src/components/live2d/live2d-screen.tsx", import.meta.url), "utf8");
  assert.match(screen, /disabled=\{preparing\} aria-busy=\{preparing\} onClick=\{\(\) => void prepare\(location\.id\)\}/);
  assert.match(screen, /if \(preparingNow\.current\) return;\s*preparingNow\.current = true;\s*setPreparing\(true\);/);
  assert.match(screen, /finally \{ preparingNow\.current = false; setPreparing\(false\); \}/);
  assert.equal(screen.match(/send\("scene\.prepare"/g)?.length, 1, "the prepare request is sent only through the guarded path");
});
