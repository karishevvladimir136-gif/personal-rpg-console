import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { parseMapPlacementCommand } from "../src/lib/map/placement-contracts.ts";

test("owner map edit accepts an exact bounded presentation command", () => {
  const command = {
    requestId: randomUUID(),
    timeline: { timelineId: randomUUID(), epoch: 2 },
    locationId: randomUUID(),
    expectedRevision: null,
    level: "world",
    parentLocationId: null,
    x: 0,
    y: 1,
  };
  assert.deepEqual(parseMapPlacementCommand(command), command);
  for (const invalid of [
    { ...command, currentLocationId: command.locationId },
    { ...command, timeline: { ...command.timeline, epoch: 0 } },
    { ...command, expectedRevision: 0 },
    { ...command, x: 1.001 },
    { ...command, y: -0.001 },
    { ...command, y: null },
    { ...command, level: "region" },
    { ...command, parentLocationId: command.locationId },
  ]) assert.equal(parseMapPlacementCommand(invalid), null);
});
