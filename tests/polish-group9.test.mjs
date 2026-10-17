// Polish stage, group 9 (docs/stages/POLISH.md «Codex, map, journal»): the map lays out a place
// the DM put under a parent by itself (rumours dashed), the codex is about the whole world, the
// journal hides empty sections and links the goal, the pinned list leaves the player screens,
// and the quest's reward line is in the campaign language with one full stop.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { loopCampaign } from "./dm-loop-fixture.mjs";
import { derivedPlacements, presentationAtlasPlacements, projectAtlas, atlasOpeningLevel } from "../src/lib/map/atlas-view.ts";

const src = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const finish = (extra = {}) => ({ name: "finish_turn", arguments: { sceneKinds: ["exploration"], spotlight: [], playerMoment: false, ...extra } });

const snapshotWith = (locations, currentId) => ({
  campaign: { id: "c", language: "ru" }, publicState: { current_location_id: currentId },
  locations: locations.map((row) => ({ campaign_id: "c", revision: 1, updated_at: "2026-10-17T00:00:00Z", description: "", ...row })),
});

test("a place under a parent gets a deterministic marker without manual placing; a rumour is laid out too; the map opens where the hero is", () => {
  const harbour = { id: "11111111-1111-4111-8111-111111111111", name: "Скрипучая Гавань", status: "visited" };
  const market = { id: "22222222-2222-4222-8222-222222222222", name: "Понтонный рынок", status: "known", detail: { parentId: harbour.id, whereabouts: "у понтонов" } };
  const breakwater = { id: "33333333-3333-4333-8333-333333333333", name: "Чёрный волнорез", status: "rumored", detail: { parentId: harbour.id, whereabouts: "на краю гавани" } };
  const tavern = { id: "44444444-4444-4444-8444-444444444444", name: "Кабак Марты", status: "visited", detail: { parentId: market.id } };
  const snapshot = snapshotWith([harbour, market, breakwater, tavern], harbour.id);
  const placed = [{ campaign_id: "c", location_id: harbour.id, level: "world", parent_location_id: null, x: 0.5, y: 0.5, revision: 3, updated_at: "2026-10-17T00:00:00Z" }];
  const derived = derivedPlacements(snapshot, placed);
  const byId = Object.fromEntries(derived.map((row) => [row.location_id, row]));
  assert.equal(byId[market.id].level, "region", "a place under the world is a region");
  assert.equal(byId[market.id].parent_location_id, harbour.id);
  assert.equal(byId[breakwater.id].level, "region", "the rumour is laid out under its parent as well");
  assert.equal(byId[tavern.id].level, "local", "a place under a region is local (the chain resolves in later passes)");
  assert.equal(byId[tavern.id].parent_location_id, market.id);
  for (const row of derived) { assert.ok(row.x > 0 && row.x < 1 && row.y > 0 && row.y < 1); assert.equal(row.revision, 0, "derived rows are provisional, never saved"); }
  assert.deepEqual(derivedPlacements(snapshot, placed).map((row) => [row.x, row.y]), derived.map((row) => [row.x, row.y]), "deterministic");
  assert.notDeepEqual([byId[market.id].x, byId[market.id].y], [byId[breakwater.id].x, byId[breakwater.id].y], "two places do not share a spot");
  const projection = projectAtlas(snapshot, placed);
  assert.ok(projection.locations.some((row) => row.id === breakwater.id), "the placed rumour is on the map");
  assert.ok(!projection.unplaced.some((row) => row.id === market.id), "no longer among the unplaced");
  assert.equal(presentationAtlasPlacements(snapshot, placed).length, 4);
  const inTavern = snapshotWith([harbour, market, breakwater, tavern], tavern.id);
  assert.equal(atlasOpeningLevel(projectAtlas(inTavern, placed)), "local", "the map opens at the level where the hero is");
});

test("upsert_place records the parent and the whereabouts; the quest's reward line is in the campaign language with one full stop", async () => {
  const c = await loopCampaign({ language: "ru" });
  try {
    const played = await c.turn("Иду на рынок.", [{ text: "Понтоны скрипят. ", toolCalls: [
      { name: "upsert_place", arguments: { localKey: "harbour", name: "Скрипучая Гавань", description: "Портовый город.", status: "visited" } },
      { name: "upsert_place", arguments: { localKey: "market", name: "Понтонный рынок", description: "Торг на понтонах.", status: "known", parentRef: "harbour", whereabouts: "у понтонов" } },
      { name: "upsert_place", arguments: { localKey: "bw", name: "Чёрный волнорез", description: "Говорят, там что-то лежит.", status: "rumored", parentRef: "harbour", whereabouts: "на краю гавани" } },
      { name: "upsert_character", arguments: { localKey: "marta", name: "Марта", kind: "npc", present: true } },
      { name: "quest", arguments: { action: "create", localKey: "box", title: "Ящик с «Сельди»", description: "Поднять ящик со дна.", issuerRef: "marta", reward: { currency: "монеты", amount: 40 } } },
      { name: "upsert_place", arguments: { ref: "market", parentRef: "market" } },
      finish()] }]);
    assert.equal(played.result.status, "committed", JSON.stringify(c.errors));
    const receipts = (await c.row(played.input.operationId)).checkpoint.dmLoop.receipts;
    assert.equal(receipts[5].result.ok, false, "a place cannot lie in itself");
    const state = await c.state();
    const locations = await c.f.query("select id,name,status,detail from public.rpg_locations where campaign_id=$1", [c.cid]);
    const harbour = locations.find((row) => row.name === "Скрипучая Гавань");
    const market = locations.find((row) => row.name === "Понтонный рынок");
    const breakwater = locations.find((row) => row.name === "Чёрный волнорез");
    assert.equal(market.detail.parentId, harbour.id);
    assert.equal(market.detail.whereabouts, "у понтонов");
    assert.equal(breakwater.detail.parentId, harbour.id);
    assert.equal(breakwater.status, "rumored");
    const quest = state.quests.find((row) => row.title === "Ящик с «Сельди»");
    assert.equal(quest.description, "Поднять ящик со дна.\nНаграда: 40 монеты.");
    assert.doesNotMatch(quest.description, /Reward:|\.\./);
  } finally { await c.f.db.close(); }
});

test("the journal hides empty sections, links the goal, says «Зацепки»; the codex is tabs for the whole world; the pinned list lives in the settings", () => {
  const screen = src("src/components/registry/journal-codex.tsx");
  assert.match(screen, /\{journal\.arc && \(/, "an empty main arc is hidden");
  assert.match(screen, /\{\(done\.length > 0 \|\| journal\.closed\.length > 0\) && \(/, "«Выполнено · 0» is hidden");
  assert.match(screen, /<a className=\{r\.questTitle\} href=\{`#quest-\$\{goal\.id\}`\}>\{goal\.title\}<\/a>/, "the goal is one line with a link");
  assert.match(screen, /c\("Зацепки", "Leads"\)/);
  assert.doesNotMatch(screen, /Открытые нити|Open threads|Закреплено для ведущего|Pinned for the DM|PinnedList/);
  for (const tab of ["people", "places", "things", "factions", "world"]) assert.match(screen, new RegExp(`id: "${tab}"`), `the codex has the «${tab}» tab`);
  assert.match(screen, /c\("слух", "rumour"\)/, "a rumoured place is marked");
  assert.match(screen, /href=\{href\("map"\)\}/, "places link to the map");
  const settings = src("src/components/registry/settings-screen.tsx");
  assert.match(settings, /Что ведущий помнит всегда/);
  assert.match(settings, /<PinnedList campaignId=\{data\.campaign\.id\} pinned=\{pinnedOf\(data\)\} \/>/);
  assert.match(src("src/components/registry/pins.tsx"), /Ведущий всегда будет это помнить/);
  assert.match(src("src/components/atlas-map.tsx"), /styles\.rumoredPin/);
});
