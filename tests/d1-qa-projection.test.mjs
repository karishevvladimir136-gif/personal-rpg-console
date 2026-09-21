import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
import test from "node:test";
import { moduleFromSource } from "./d1-qa-fixture.mjs";

const { runFixture, event, knowledge } = await moduleFromSource(
  "tests/d1-reader-fixtures.mjs",
);
const { projectLabRun } = await moduleFromSource(
  "src/lib/world-lab/projection.ts",
);
const hash = (text) => createHash("sha256").update(text).digest("hex");

function spanFixture() {
  const f = runFixture();
  const text = "The harbor opens. Unobserved facts stay outside this span.";
  f.source.body.original.text = text;
  f.source.body.digest = hash(text);
  f.source.body.extraction.version = "text-evidence-v1";
  f.evidence.locator.value = "0:17";
  f.evidence.digest = hash(text.slice(0, 17));
  return f;
}

test("D1 QA valid public span evidence survives projection; invalid spans cannot borrow a whole-source digest", () => {
  const f = spanFixture();
  const visible = event(f.read, {
    text: "The harbor opens.",
    evidence: [f.evidence],
  });
  const project = (raw = f.read) =>
    projectLabRun(raw.run, [raw], f.options).checkpoints[0].events;
  assert.deepEqual(
    project().map((row) => row.id),
    [visible.payload.id],
  );
  for (const patch of [
    { digest: f.source.body.digest },
    { locator: { kind: "text", value: "0:99999" } },
    { locator: { kind: "text", value: "17:0" } },
    { locator: { kind: "text", value: "0:0" } },
    { locator: { kind: "text", value: "not-a-span" } },
    { sourceVersionId: randomUUID() },
    { sourceId: randomUUID() },
    { ownerId: randomUUID() },
    { knowledge: "future_source" },
    { visibility: "private" },
  ]) {
    const raw = structuredClone(f.read);
    Object.assign(
      raw.versions.find((row) => row.id === visible.id).payload.event
        .evidence[0],
      patch,
    );
    assert.deepEqual(project(raw), [], JSON.stringify(patch));
  }
});

test("D1 QA adding private rows does not change public event counts, summaries, or serialization", () => {
  const f = runFixture();
  event(f.read, { text: "A public bell rings." });
  const before = projectLabRun(f.read.run, [f.read], f.options);
  for (let index = 0; index < 40; index++) {
    event(f.read, {
      visibility: "private",
      text: `QA_PRIVATE_EVENT_${index}`,
      payload: { title: "QA_PRIVATE_TITLE", sourceCount: 7131 },
    });
    event(f.read, {
      worldMinutes: 30,
      text: `QA_FUTURE_EVENT_${index}`,
    });
  }
  f.read.manifest.publicMetadata.privateTitle = "QA_PRIVATE_TITLE";
  f.read.manifest.publicMetadata.privateCount = 7131;
  const after = projectLabRun(f.read.run, [f.read], f.options);
  assert.deepEqual(after, before);
  assert.doesNotMatch(JSON.stringify(after), /QA_PRIVATE|QA_FUTURE|7131/);
});

test("D1 QA Actor knowledge requires a valid exact public source including transitive grants", () => {
  const f = runFixture(),
    actor = randomUUID(),
    other = randomUUID();
  const earlier = event(f.read, { text: "Witnessed earlier fact." });
  const now = event(f.read, {
    text: "Actor observes a consequence.",
    actorIds: [actor],
  });
  const earlyGrant = knowledge(f.read, earlier, [actor]);
  const grant = knowledge(f.read, now, [actor], {
    source_refs: [
      {
        campaignId: f.read.campaignId,
        kind: "event",
        id: earlier.payload.id,
        version: "1",
        part: 0,
        visibility: "public",
      },
    ],
  });
  const project = (raw, actorIds = [actor]) =>
    projectLabRun(raw.run, [raw], { ...f.options, actorIds }).checkpoints[0]
      .events;
  assert.deepEqual(
    project(f.read).map((row) => row.id),
    [earlier.payload.id, now.payload.id],
  );
  for (const actors of [[], [other], [actor, other]])
    assert.deepEqual(project(f.read, actors), []);
  for (const patch of [
    { known_by: [] },
    { status: "invalid" },
    { current: false },
    { valid_from: 11 },
    { valid_to: 10 },
  ]) {
    const raw = structuredClone(f.read);
    Object.assign(
      raw.versions.find((row) => row.id === earlyGrant.id).payload,
      patch,
    );
    assert.deepEqual(project(raw), []);
  }
  const cycle = structuredClone(f.read);
  cycle.versions.find((row) => row.id === earlyGrant.id).payload.source_refs = [
    {
      campaignId: f.read.campaignId,
      kind: "event",
      id: now.payload.id,
      version: "1",
      part: 0,
      visibility: "public",
    },
  ];
  assert.deepEqual(project(cycle), []);
  const foreign = structuredClone(f.read);
  foreign.versions.find(
    (row) => row.id === grant.id,
  ).payload.source_refs[0].campaignId = randomUUID();
  assert.deepEqual(
    project(foreign).map((row) => row.id),
    [earlier.payload.id],
  );
});
