import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  projectTimelineExplorer,
  filterTimelineMoments,
  timelineMomentPage,
} from "../src/lib/timeline-explorer/projection.ts";
import { timelineFixture } from "./timeline-explorer-fixtures.mjs";
import { uiId } from "./d1-ui-fixtures.mjs";

const active = (projection) =>
  projection.branches.find((branch) => branch.active);
test("Timeline uses recorded scene order, exact save clocks, public lineage and honest unknown associations", () => {
  const projection = projectTimelineExplorer(timelineFixture());
  assert.equal(projection.sourcesAligned, true);
  const branch = active(projection),
    scenes = filterTimelineMoments(branch, { kind: "scene" });
  assert.deepEqual(
    scenes.map((row) => row.title),
    ["Departure", "Return"],
  );
  assert.deepEqual(
    scenes.map((row) => row.time),
    [
      { kind: "order", ordinal: 1 },
      { kind: "order", ordinal: 2 },
    ],
  );
  for (const scene of scenes) {
    assert.equal(scene.place, null);
    assert.equal(scene.actors, null);
    assert.equal(scene.consequences, null);
  }
  const saved = filterTimelineMoments(branch, { kind: "save" });
  assert.equal(saved[0].time.minutes, 360);
  assert.equal(saved[0].place, "Harbor");
  assert.equal(branch.children.length, 2);
  const sibling = projection.branches.find(
    (row) => row.label === "The second crossing",
  );
  assert.equal(sibling.parent.key, branch.key);
  assert.equal(sibling.base.saveId, uiId(2));
  assert.deepEqual(
    sibling.moments.map((row) => row.kind),
    ["save"],
  );
  assert.deepEqual(projection.currentDirectory.actors, ["Mira"]);
  assert.equal(JSON.stringify(scenes).includes("Current ally"), false);
});

test("Timeline private, cross-campaign, future and unrepresented associations never enter projection or pagination", () => {
  const source = timelineFixture(),
    other = uiId(100);
  const scene = source.snapshot.scenes[0];
  source.snapshot.scenes.unshift(
    {
      ...scene,
      id: uiId(101),
      sequence: 0,
      body: "PRIVATE_SCENE_CANARY",
      visibility: "private",
    },
    {
      ...scene,
      id: uiId(102),
      sequence: 0,
      body: "FUTURE_SCENE_CANARY",
      knowledge: "future_source",
    },
    {
      ...scene,
      id: uiId(103),
      sequence: 0,
      body: "OTHER_SCENE_CANARY",
      campaign_id: other,
    },
    {
      ...scene,
      id: uiId(104),
      sequence: 0,
      body: "ORPHAN_SCENE_CANARY",
      session_id: uiId(105),
    },
  );
  source.snapshot.entities.push({
    ...source.snapshot.entities[0],
    name: "PRIVATE_ACTOR_CANARY",
    visibility: "private",
  });
  source.snapshot.locations.push({
    ...source.snapshot.locations[0],
    name: "FUTURE_LOCATION_CANARY",
    knowledge: "future_source",
  });
  source.snapshot.quests.push({
    ...source.snapshot.quests[0],
    title: "OTHER_QUEST_CANARY",
    campaign_id: other,
  });
  source.saves.saves.unshift(
    {
      ...source.saves.saves[0],
      name: "PRIVATE_SAVE_CANARY",
      visibility: "private",
    },
    { ...source.saves.saves[0], name: "OTHER_SAVE_CANARY", campaign_id: other },
  );
  const run = source.lab.runs[0],
    checkpoint = run.checkpoints[1];
  run.checkpoints.unshift({
    ...checkpoint,
    id: uiId(110),
    summary: "FUTURE_CHECKPOINT_CANARY",
    worldMinutes: 999,
  });
  checkpoint.events.unshift(
    {
      id: "PRIVATE_EVENT_ID_CANARY",
      text: "PRIVATE_EVENT_CANARY",
      worldMinutes: 370,
      visibility: "private",
    },
    {
      id: "FUTURE_EVENT_ID_CANARY",
      text: "FUTURE_EVENT_CANARY",
      worldMinutes: 999,
    },
    {
      id: "FUTURE_SOURCE_ID_CANARY",
      text: "FUTURE_SOURCE_CANARY",
      worldMinutes: 370,
      knowledge: "future_source",
    },
  );
  checkpoint.privatePlan = "PRIVATE_PLAN_CANARY";
  run.privateEventCount = 707070;
  run.scenario.scenarioVersionId = "SOURCE_VERSION_ID_CANARY";
  checkpoint.events.push({
    id: "PUBLIC_SOURCE_ID_CANARY",
    text: "Recorded public change.",
    worldMinutes: 410,
  });
  source.lab.runs.push({
    ...run,
    id: uiId(111),
    campaignId: other,
    label: "OTHER_RUN_CANARY",
  });
  scene.actorIds = ["FABRICATED_ACTOR_CANARY"];
  scene.locationId = "FABRICATED_PLACE_CANARY";
  scene.consequences = "FABRICATED_CONSEQUENCE_CANARY";
  const projection = projectTimelineExplorer(source),
    json = JSON.stringify(projection);
  assert.doesNotMatch(json, /CANARY|707070/);
  assert.ok(json.includes("Recorded public change."));
  assert.deepEqual(
    timelineMomentPage(active(projection), { kind: "scene" }, 1).moments.map(
      (row) => row.title,
    ),
    ["Departure"],
  );
  const experiment = projection.branches.find((row) => row.kind === "lab");
  assert.equal(experiment.active, false);
  assert.equal(experiment.moments.length, 2);
  assert.deepEqual(
    experiment.moments[1].events.map((row) => row.minutes),
    [400, 410],
  );
});

test("Timeline filters before its render limit and remains deterministic across source permutations", () => {
  const source = timelineFixture(),
    baseline = projectTimelineExplorer(source);
  source.snapshot.scenes.reverse();
  source.saves.timelines.reverse();
  source.saves.saves.reverse();
  source.lab.runs[0].checkpoints.reverse();
  assert.deepEqual(projectTimelineExplorer(source), baseline);
  const branch = active(baseline);
  assert.equal(
    timelineMomentPage(branch, { kind: "scene", search: "MIRA" }, 1).moments[0]
      .title,
    "Return",
  );
  assert.equal(timelineMomentPage(branch, { kind: "scene" }, 1).hasMore, true);
  assert.deepEqual(
    filterTimelineMoments(branch, { kind: "scene", reverse: true }).map(
      (row) => row.title,
    ),
    ["Return", "Departure"],
  );
  assert.equal(
    filterTimelineMoments(branch, { kind: "scene", sessionId: uiId(99) })
      .length,
    0,
  );
});

test("Timeline mismatched active epoch withdraws supplemental playable lineage without retargeting scene history", () => {
  const source = timelineFixture();
  source.saves.timeline = { ...source.saves.timeline, epoch: 5 };
  const projection = projectTimelineExplorer(source);
  assert.equal(projection.sourcesAligned, false);
  assert.deepEqual(
    active(projection).moments.map((row) => row.kind),
    ["scene", "scene"],
  );
  assert.equal(
    projection.branches.some((row) => row.label === "The second crossing"),
    false,
  );
  assert.equal(
    projection.branches.find((row) => row.kind === "lab").base.saveId,
    null,
  );
});

test("Timeline cross-campaign envelopes and unavailable sources fail closed independently", () => {
  const source = timelineFixture();
  source.saves.campaignId = uiId(99);
  source.lab.campaignId = uiId(99);
  const projection = projectTimelineExplorer(source);
  assert.equal(projection.branches.length, 1);
  assert.equal(active(projection).moments.length, 2);
  assert.deepEqual(
    projectTimelineExplorer({ snapshot: source.snapshot }).branches,
    projection.branches,
  );
});

test("Timeline source files have no raw private/schema/provider or mutation imports", () => {
  for (const file of [
    "../src/lib/timeline-explorer/projection.ts",
    "../src/components/timeline-explorer/client.ts",
    "../src/components/timeline-explorer/timeline-explorer-panel.tsx",
    "../src/components/timeline-explorer/timeline-explorer.tsx",
    "../src/components/persistent-timeline-explorer.tsx",
  ]) {
    const content = readFileSync(new URL(file, import.meta.url), "utf8");
    assert.doesNotMatch(
      content,
      /runSaveCommand|sendLabAttempt|private\.runtime|server-contracts|createClient|\.rpc\(|OPENAI_API_KEY|SUPABASE_SERVICE_ROLE_KEY|method:\s*['"]POST/,
    );
  }
});

test("Timeline long campaigns remain fully reachable after filtered load-more pages", () => {
  const source = timelineFixture(),
    template = source.snapshot.scenes[0];
  source.snapshot.scenes = Array.from({ length: 2105 }, (_, index) => ({
    ...template,
    id: uiId(1000 + index),
    sequence: index + 1,
    title: `Scene ${index + 1}`,
  }));
  source.snapshot.scenes.unshift(
    ...Array.from({ length: 100 }, (_, index) => ({
      ...template,
      id: uiId(4000 + index),
      sequence: 0,
      body: "PRIVATE_LONG_HISTORY_CANARY",
      visibility: "private",
    })),
  );
  const branch = active(projectTimelineExplorer(source));
  const first = timelineMomentPage(branch, { kind: "scene" }, 40);
  assert.equal(first.moments.length, 40);
  assert.equal(first.moments[0].title, "Scene 1");
  const next = timelineMomentPage(branch, { kind: "scene" }, 2080);
  assert.equal(next.moments.length, 2080);
  assert.equal(next.moments.at(-1).title, "Scene 2080");
  assert.equal(next.hasMore, true);
  const last = timelineMomentPage(branch, { kind: "scene" }, 2120);
  assert.equal(last.moments.length, 2105);
  assert.equal(last.hasMore, false);
  assert.doesNotMatch(JSON.stringify(last), /PRIVATE_LONG_HISTORY_CANARY/);
});

test("Timeline continuation links an offered Lab parent and exact checkpoint, independently of run order", () => {
  const source = timelineFixture(),
    parent = source.lab.runs[0],
    checkpoint = parent.checkpoints[1];
  const child = structuredClone(parent);
  child.id = uiId(200);
  child.timelineId = uiId(201);
  child.label = "Continuation from a public checkpoint";
  child.startWorldMinutes = checkpoint.worldMinutes;
  child.base.worldMinutes = checkpoint.worldMinutes;
  child.base.label = "Not a playable save association";
  child.continuation = {
    sourceRunId: parent.id,
    sourceCheckpointId: checkpoint.id,
  };
  child.checkpoints = [
    { ...structuredClone(checkpoint), id: uiId(202), ordinal: 0 },
  ];
  source.lab.runs.unshift(child);
  source.lab.runs.push({
    ...child,
    id: parent.id,
    campaignId: uiId(99),
    continuation: {
      sourceRunId: child.id,
      sourceCheckpointId: child.checkpoints[0].id,
    },
  });
  const projection = projectTimelineExplorer(source);
  const parentBranch = projection.branches.find(
    (row) => row.key === `lab:${parent.id}`,
  );
  const childBranch = projection.branches.find(
    (row) => row.key === `lab:${child.id}`,
  );
  assert.deepEqual(childBranch.parent, {
    key: parentBranch.key,
    label: parent.label,
  });
  assert.deepEqual(childBranch.base, {
    saveId: null,
    checkpointId: checkpoint.id,
    label: parent.label,
    minutes: checkpoint.worldMinutes,
  });
  assert.ok(parentBranch.children.some((row) => row.key === childBranch.key));
  assert.equal(
    active(projection).children.some((row) => row.key === childBranch.key),
    false,
  );
  assert.equal(
    JSON.stringify(childBranch).includes("Not a playable save association"),
    false,
  );
  source.lab.runs.reverse();
  assert.deepEqual(projectTimelineExplorer(source), projection);
});

test("Timeline continuation keeps missing, foreign, private and future parents/checkpoints unknown without save inference", () => {
  for (const excluded of [
    "missing-parent",
    "foreign-parent",
    "private-parent",
    "missing-checkpoint",
    "future-checkpoint",
    "self-parent",
  ]) {
    const source = timelineFixture(),
      parent = source.lab.runs[0],
      checkpoint = parent.checkpoints[1];
    const child = structuredClone(parent);
    child.id = uiId(210);
    child.timelineId = uiId(211);
    child.label = "Child stays NON-CANON";
    child.continuation = {
      sourceRunId: parent.id,
      sourceCheckpointId: checkpoint.id,
    };
    source.lab.runs.push(child);
    if (excluded === "missing-parent") source.lab.runs.shift();
    if (excluded === "foreign-parent") parent.campaignId = uiId(99);
    if (excluded === "private-parent") parent.visibility = "private";
    if (excluded === "missing-checkpoint") parent.checkpoints.pop();
    if (excluded === "future-checkpoint") checkpoint.worldMinutes = 999;
    if (excluded === "self-parent") child.continuation.sourceRunId = child.id;
    const projection = projectTimelineExplorer(source),
      branch = projection.branches.find((row) => row.key === `lab:${child.id}`);
    assert.equal(branch.base.saveId, null, excluded);
    assert.equal(branch.base.checkpointId, null, excluded);
    assert.equal(branch.base.label, null, excluded);
    assert.equal(branch.base.minutes, null, excluded);
    assert.equal(branch.active, false);
    if (
      [
        "missing-parent",
        "foreign-parent",
        "private-parent",
        "self-parent",
      ].includes(excluded)
    )
      assert.deepEqual(branch.parent, { key: null, label: null }, excluded);
    else assert.equal(branch.parent.key, `lab:${parent.id}`, excluded);
    assert.equal(
      active(projection).children.some((row) => row.key === branch.key),
      false,
      excluded,
    );
  }
});
