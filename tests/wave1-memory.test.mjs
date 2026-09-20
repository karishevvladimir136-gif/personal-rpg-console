import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { worldEventMemorySource } from "../src/lib/production-adapters/world-memory.ts";
import { retrieveMemory } from "../src/lib/memory/retrieval.ts";
import {
  buildSummaryContext,
  parseSummary,
} from "../src/lib/memory/summary.ts";

function fixture(visibility = "public") {
  const ownerId = randomUUID(),
    campaignId = randomUUID(),
    witnessId = randomUUID(),
    sourceVersionId = randomUUID();
  const event = {
    schemaVersion: 1,
    id: randomUUID(),
    campaignId,
    originTimelineId: randomUUID(),
    operationId: randomUUID(),
    sequence: 7,
    worldMinutes: 45,
    kind: "thread_outcome",
    actorIds: [randomUUID()],
    threadIds: [randomUUID()],
    visibility,
    text: 'A messenger reports a rumor: "The bridge may be closed." The report is unconfirmed.',
    evidence: [
      {
        ownerId,
        sourceId: randomUUID(),
        sourceVersionId,
        locator: { kind: "section", value: "SYNTHETIC_PRIVATE_LOCATOR" },
        digest: "exact-digest",
        visibility,
        knowledge: "canon_at_entry",
      },
    ],
    payload: { privateCausality: "SYNTHETIC_PRIVATE_CAUSE" },
  };
  const scope = {
    ownerId,
    campaignId,
    timeline: { timelineId: randomUUID(), epoch: 4 },
    worldMinutes: 45,
    memberEventIds: new Set([event.id]),
    sourceVersionIds: new Set([sourceVersionId]),
    visibility,
    actorIds: [],
    knownBy: [witnessId],
  };
  return { event, scope, witnessId };
}

test("Wave 1 committed World Event reuses ordinary Memory sources without rewriting epistemic text", () => {
  const { event, scope } = fixture();
  const source = worldEventMemorySource(event, scope);
  assert.equal(source.ref.kind, "event");
  assert.equal(
    source.ref.version,
    `world-event-v1:${event.operationId}:${event.sequence}`,
  );
  assert.equal(source.text, event.text);
  assert.equal(source.authority, "history");
  assert.equal(source.statementKind, "record");
  assert.deepEqual(source.timeline, scope.timeline);
  assert.notEqual(source.timeline.timelineId, event.originTimelineId);
  assert.ok(!JSON.stringify(source).includes("SYNTHETIC_PRIVATE"));
  assert.ok(
    !JSON.stringify(source).includes(event.evidence[0].sourceVersionId),
  );
  source.entityIds.push("mutated");
  assert.equal(event.actorIds.length, 1);
});

test("Wave 1 event indexing rejects proposed, sibling, future, cross-scope, private and stale-source records", () => {
  const { event, scope } = fixture();
  const excluded = [
    { ...event, sequence: undefined },
    { ...event, sequence: 0 },
    { ...event, campaignId: randomUUID() },
    { ...event, id: randomUUID() },
    { ...event, worldMinutes: 46 },
    { ...event, visibility: "private" },
    { ...event, evidence: [{ ...event.evidence[0], ownerId: randomUUID() }] },
    {
      ...event,
      evidence: [{ ...event.evidence[0], sourceVersionId: randomUUID() }],
    },
    ...["future_source", "source"].map((knowledge) => ({
      ...event,
      evidence: [{ ...event.evidence[0], knowledge }],
    })),
    { ...event, evidence: [{ ...event.evidence[0], visibility: "private" }] },
  ];
  for (const row of excluded)
    assert.equal(worldEventMemorySource(row, scope), null);
  assert.equal(
    worldEventMemorySource(event, { ...scope, memberEventIds: new Set() }),
    null,
  );
  assert.equal(
    worldEventMemorySource(event, { ...scope, sourceVersionIds: new Set() }),
    null,
  );
  assert.throws(
    () =>
      worldEventMemorySource(event, {
        ...scope,
        timeline: { ...scope.timeline, epoch: 0 },
      }),
    { code: "context" },
  );
});

test("Wave 1 actor participation grants no knowledge; exact witnesses enter existing retrieval/summary", () => {
  const { event, scope, witnessId } = fixture();
  assert.equal(
    worldEventMemorySource(event, { ...scope, actorIds: event.actorIds }),
    null,
  );
  const source = worldEventMemorySource(event, {
    ...scope,
    actorIds: [witnessId],
  });
  assert.ok(source);
  const request = {
    campaignId: scope.campaignId,
    timeline: scope.timeline,
    visibility: "public",
    actorIds: [witnessId],
    query: "bridge rumor",
    entityIds: [],
    requiredSourceIds: [source.id],
    worldMinutes: 45,
    maxBytes: 12000,
    maxExcerpts: 12,
    historicalComparison: false,
  };
  const batch = {
    campaignId: scope.campaignId,
    timeline: scope.timeline,
    generation: 1,
    sources: [source],
    aliases: [],
  };
  assert.deepEqual(retrieveMemory(request, batch).sources, [source]);
  assert.equal(
    retrieveMemory({ ...request, actorIds: [randomUUID()] }, batch).sources
      .length,
    0,
  );
  assert.equal(
    retrieveMemory(
      { ...request, timeline: { ...scope.timeline, epoch: 5 } },
      batch,
    ).sources.length,
    0,
  );
  const job = {
    campaignId: scope.campaignId,
    timeline: scope.timeline,
    id: randomUUID(),
    boundaryId: null,
    visibility: "public",
    generation: 1,
    token: randomUUID(),
    attempts: 1,
    stateRevision: 1,
    settingsRevision: 1,
    guideVersionId: randomUUID(),
    fromSequence: 0,
    throughSequence: 7,
    sources: [source],
    requiredSourceIds: [source.id],
  };
  const output = {
    schemaVersion: 1,
    selections: [{ sourceId: source.id, version: source.ref.version }],
  };
  assert.deepEqual(parseSummary(output, job), output);
  assert.ok(
    buildSummaryContext(job, "gpt-6-astra").input.includes("unconfirmed"),
  );
  assert.ok(
    !buildSummaryContext(job, "gpt-6-astra").input.includes(
      "SYNTHETIC_PRIVATE",
    ),
  );
});

test("Wave 1 private World Events use only existing private_event Memory lane", () => {
  const { event, scope } = fixture("private");
  event.text = "SYNTHETIC_PRIVATE_EVENT";
  const source = worldEventMemorySource(event, scope);
  assert.equal(source.ref.kind, "private_event");
  assert.equal(source.ref.visibility, "private");
  assert.equal(
    worldEventMemorySource(event, { ...scope, visibility: "public" }),
    null,
  );
  const request = {
    campaignId: scope.campaignId,
    timeline: scope.timeline,
    visibility: "public",
    actorIds: [],
    query: "event",
    entityIds: [],
    requiredSourceIds: [],
    worldMinutes: 45,
    maxBytes: 12000,
    maxExcerpts: 12,
    historicalComparison: false,
  };
  const result = retrieveMemory(request, {
    campaignId: scope.campaignId,
    timeline: scope.timeline,
    generation: 1,
    sources: [source],
    aliases: [],
  });
  assert.ok(!JSON.stringify(result).includes("SYNTHETIC_PRIVATE"));
});
