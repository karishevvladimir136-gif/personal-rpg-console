import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fixture, id } from "./phase2-mechanics-fixtures.mjs";
import {
  atlasLevelView,
  atlasPinStyle,
  projectAtlas,
  visibleAtlasPlacements,
} from "../src/lib/map/atlas-view.ts";

function atlasFixture() {
  const snapshot = fixture().snapshot;
  const campaignId = snapshot.campaign.id;
  const loc = (key, status = "known") => ({
    id: id(`atlas-${key}`), campaign_id: campaignId, revision: 1,
    updated_at: "2026-10-06T00:00:00Z", name: key,
    description: `${key} public description`, status,
  });
  const [world, distantWorld, region, distantRegion, local, otherLocal, unplaced] = [
    loc("world", "visited"), loc("distant-world"),
    loc("region", "visited"), loc("distant-region"),
    loc("local", "visited"), loc("other-local"), loc("unplaced"),
  ];
  snapshot.locations = [world, distantWorld, region, distantRegion, local, otherLocal, unplaced];
  snapshot.publicState.current_location_id = local.id;
  const place = (location, level, parent = null, x = .5, y = .5) => ({
    campaign_id: campaignId,
    location_id: location.id,
    level,
    parent_location_id: parent?.id ?? null,
    x, y, revision: 1, updated_at: "2026-10-06T00:00:00Z",
  });
  const placements = [
    place(world, "world", null, .35, .45),
    place(distantWorld, "world", null, .8, .5),
    place(region, "region", world, .4, .55),
    place(distantRegion, "region", distantWorld, .7, .45),
    place(local, "local", region, .3, .6),
    place(otherLocal, "local", distantRegion, .65, .5),
  ];
  return { snapshot, placements, world, distantWorld, region, distantRegion, local, otherLocal, unplaced };
}

test("World, Region, and Local show only structured children of the current ancestor by default", () => {
  const f = atlasFixture();
  const projection = projectAtlas(f.snapshot, f.placements);
  assert.deepEqual(projection.currentPath, {
    worldId: f.world.id, regionId: f.region.id, localId: f.local.id,
  });
  assert.deepEqual(
    atlasLevelView(projection, "world", null, null).pins.map((row) => row.location_id),
    [f.world.id, f.distantWorld.id],
  );
  assert.deepEqual(
    atlasLevelView(projection, "region", null, null).pins.map((row) => row.location_id),
    [f.region.id],
  );
  assert.deepEqual(
    atlasLevelView(projection, "local", null, null).pins.map((row) => row.location_id),
    [f.local.id],
  );
  assert.equal(atlasLevelView(projection, "local", null, null).currentAreaId, f.local.id);
  assert.equal(atlasLevelView(projection, "region", null, null).currentAreaId, f.region.id);
  assert.equal(atlasLevelView(projection, "world", null, null).currentAreaId, f.world.id);
  assert.deepEqual(projection.unplaced.map((row) => row.id), [f.unplaced.id]);
});

test("an explicit selected World changes the viewed subtree without changing gameplay current Location", () => {
  const f = atlasFixture();
  const before = JSON.stringify(f.snapshot);
  const projection = projectAtlas(f.snapshot, f.placements);
  const region = atlasLevelView(projection, "region", f.distantWorld.id, null);
  assert.equal(region.anchorId, f.distantWorld.id);
  assert.deepEqual(region.pins.map((row) => row.location_id), [f.distantRegion.id]);
  const local = atlasLevelView(projection, "local", f.distantWorld.id, f.distantRegion.id);
  assert.equal(local.anchorId, f.distantRegion.id);
  assert.deepEqual(local.pins.map((row) => row.location_id), [f.otherLocal.id]);
  assert.equal(f.snapshot.publicState.current_location_id, f.local.id);
  assert.equal(JSON.stringify(f.snapshot), before);
});

test("old timeline and foreign placement metadata cannot reveal absent Locations or orphan descendants", () => {
  const f = atlasFixture();
  const current = structuredClone(f.snapshot);
  current.locations = current.locations.filter((row) => row.id !== f.world.id);
  const foreign = {
    ...f.placements[0], campaign_id: id("foreign-campaign"),
    location_id: f.unplaced.id,
  };
  const projection = projectAtlas(current, [...f.placements, foreign]);
  assert.deepEqual(projection.placements.map((row) => row.location_id), [f.distantWorld.id, f.distantRegion.id, f.otherLocal.id]);
  assert.deepEqual(projection.unplaced.map((row) => row.id), [f.region.id, f.local.id, f.unplaced.id]);
  assert.deepEqual(projection.currentPath, { worldId: null, regionId: null, localId: null });
  assert.equal(JSON.stringify(visibleAtlasPlacements(current, [...f.placements, foreign])).includes(f.world.id), false);
});

test("placements with invalid or incomplete coordinates never become pins and remain accessible as unplaced", () => {
  const f = atlasFixture();
  const invalid = [
    { ...f.placements[0], x: -0.1 },
    { ...f.placements[1], y: 1.1 },
    { ...f.placements[2], x: null },
    { ...f.placements[4], x: null, y: null },
  ];
  const projection = projectAtlas(f.snapshot, invalid);
  assert.deepEqual(atlasLevelView(projection, "world", null, null).pins, []);
  assert.deepEqual(projection.unplaced.map((row) => row.id), f.snapshot.locations.map((row) => row.id));
  assert.equal(f.snapshot.publicState.current_location_id, f.local.id);
});

test("no placement metadata yields a useful unplaced known list without inferred hierarchy", () => {
  const f = atlasFixture();
  const projection = projectAtlas(f.snapshot, []);
  assert.equal(projection.placements.length, 0);
  assert.deepEqual(projection.unplaced.map((row) => row.id), f.snapshot.locations.map((row) => row.id));
  for (const level of ["world", "region", "local"])
    assert.equal(atlasLevelView(projection, level, null, null).pins.length, 0);
});

test("edge coordinates remain stored at 0 or 1 while the painted 44px pin stays inside the viewport", () => {
  const f = atlasFixture();
  const edge = { ...f.placements[0], x: 0, y: 1 };
  const before = JSON.stringify(edge);
  const projection = projectAtlas(f.snapshot, [edge]);
  assert.equal(projection.placements[0].x, 0);
  assert.equal(projection.placements[0].y, 1);
  assert.deepEqual(atlasPinStyle(0, 1), {
    left: "clamp(64px, 0%, calc(100% - 64px))",
    top: "clamp(34px, 100%, calc(100% - 34px))",
  });
  assert.deepEqual(atlasPinStyle(1, 0), {
    left: "clamp(64px, 100%, calc(100% - 64px))",
    top: "clamp(34px, 0%, calc(100% - 34px))",
  });
  const css = readFileSync(new URL("../src/components/atlas-map.module.css", import.meta.url), "utf8");
  assert.match(css, /\.pin\s*\{[^}]*min-width:\s*44px;[^}]*min-height:\s*44px;/s);
  assert.equal(JSON.stringify(edge), before);
});
