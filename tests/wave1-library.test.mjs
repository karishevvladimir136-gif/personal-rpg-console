import test from "node:test";
import assert from "node:assert/strict";
import {
  parseLibraryRecord,
  parseEvidence,
  sha256,
} from "../src/lib/world-library/parsers.ts";
import {
  createRpcLibraryStore,
  compilerInputDigest,
} from "../src/lib/world-library/store.ts";
import {
  advanceCompilerJob,
  planSourceInvalidation,
} from "../src/lib/world-library/compiler.ts";
import {
  id,
  owner,
  makeRecord,
  makeSource,
  makePack,
  makeScenario,
  fixture,
} from "./wave1-library-fixtures.mjs";

test("immutable originals retain exact text, digest, owner and version; corrections append", async () => {
  const f = fixture(),
    first = makeSource(),
    op = id();
  assert.deepEqual(
    await f.store.put({ operationId: op, record: first }),
    first,
  );
  assert.deepEqual(
    await f.store.put({ operationId: op, record: first }),
    first,
  );
  const body = {
    ...first.body,
    original: { kind: "text", text: "A corrected harbor." },
    digest: sha256("A corrected harbor."),
  };
  const next = {
    ...first,
    versionId: id(),
    version: 2,
    previousVersionId: first.versionId,
    body,
  };
  await f.store.put({ operationId: id(), record: next });
  assert.equal(f.records.size, 2);
  assert.equal(
    f.records.get(first.versionId).body.original.text,
    "A calm harbor.",
  );
  await assert.rejects(
    () =>
      f.store.put({ operationId: id(), record: { ...next, versionId: id() } }),
    /conflict/,
  );
  await assert.rejects(
    () =>
      f.store.put({
        operationId: op,
        record: { ...first, body: { ...first.body, title: "rewrite" } },
      }),
    /conflict/,
  );
  assert.ok(f.calls.every((call) => call.p_campaign_id === null));
});

test("strict source bodies reject executable/extra fields, fabricated digest, URLs and mutable storage paths", () => {
  const source = makeSource();
  for (const body of [
    { ...source.body, script: "alert(1)" },
    { ...source.body, digest: "a".repeat(64) },
    {
      ...source.body,
      attribution: {
        ...source.body.attribution,
        canonicalUrl: "javascript:alert(1)",
      },
    },
    {
      ...source.body,
      extraction: { ...source.body.extraction, gaps: ["missing"] },
    },
  ])
    assert.throws(() => parseLibraryRecord({ ...source, body }));
  const storage = {
    ...source,
    body: {
      ...source.body,
      format: "epub",
      original: {
        kind: "storage",
        bucket: "world-sources",
        path: `${owner}/${source.id}/${source.versionId}/book.epub`,
        byteLength: 200,
      },
    },
  };
  assert.equal(parseLibraryRecord(storage).body.format, "epub");
  assert.throws(
    () =>
      parseLibraryRecord({
        ...storage,
        body: {
          ...storage.body,
          original: { ...storage.body.original, path: `${id()}/book.epub` },
        },
      }),
    /scope/,
  );
  assert.throws(() =>
    parseLibraryRecord({
      ...storage,
      body: {
        ...storage.body,
        original: { ...storage.body.original, path: `${owner}/../book.epub` },
      },
    }),
  );
  assert.throws(
    () => parseLibraryRecord({ ...source, ownerId: id() }, owner),
    /scope/,
  );
});

test("format-independent evidence preserves opaque section/page/image locations and bounded digests", () => {
  for (const kind of ["text", "page", "section", "image"]) {
    const e = {
      ownerId: owner,
      sourceId: id(),
      sourceVersionId: id(),
      locator: { kind, value: "spine/3/section/harbor" },
      digest: "a".repeat(64),
      visibility: "private",
      knowledge: "future_source",
    };
    assert.deepEqual(parseEvidence(e), e);
    assert.throws(() =>
      parseEvidence({ ...e, locator: { ...e.locator, executable: "code" } }),
    );
  }
});

test("pack priority is explicit, contradictions stay attributable, uncertainty cannot masquerade as sourced fact", async () => {
  const source = makeSource(),
    pack = makePack(source),
    f = fixture([source]);
  await f.store.put({ operationId: id(), record: pack });
  assert.throws(() =>
    parseLibraryRecord({ ...pack, body: { ...pack.body, sourcePriority: [] } }),
  );
  assert.throws(() =>
    parseLibraryRecord({
      ...pack,
      body: {
        ...pack.body,
        claims: [{ ...pack.body.claims[0], origin: "simulation_fact" }],
      },
    }),
  );
  assert.throws(() =>
    parseLibraryRecord({
      ...pack,
      body: {
        ...pack.body,
        claims: [
          {
            ...pack.body.claims[0],
            origin: "source_inference",
            uncertainty: null,
          },
        ],
      },
    }),
  );
  const conflictId = id(),
    unknownId = id();
  const claims = [
    pack.body.claims[0],
    {
      ...pack.body.claims[0],
      id: id(),
      text: "A stormy harbor.",
      epistemic: "rumor",
    },
  ];
  const divergent = {
    ...pack,
    body: {
      ...pack.body,
      claims,
      contradictions: [
        {
          id: conflictId,
          claimIds: claims.map((c) => c.id),
          status: "unresolved",
          resolution: null,
        },
      ],
      unknowns: [
        {
          id: unknownId,
          question: "Which account is reliable?",
          entityId: null,
        },
      ],
      approval: {
        ownerId: owner,
        reviewedConflictIds: [conflictId],
        reviewedUnknownIds: [unknownId],
      },
    },
  };
  assert.equal(
    parseLibraryRecord(divergent).body.contradictions[0].status,
    "unresolved",
  );
  assert.throws(() =>
    parseLibraryRecord({
      ...divergent,
      body: { ...divergent.body, approval: pack.body.approval },
    }),
  );
});

test("RPC validates owner, kind, evidence source identity and source privacy before writing", async () => {
  const source = makeSource({ visibility: "private" }),
    pack = makePack(source),
    f = fixture([source]);
  await assert.rejects(
    () => f.store.put({ operationId: id(), record: pack }),
    /scope/,
  );
  assert.equal(f.calls.filter((call) => call.p_action === "put").length, 0);
  const wrongOwner = createRpcLibraryStore(owner, async () => ({
    data: { records: [{ ...source, ownerId: id() }] },
  }));
  await assert.rejects(() => wrongOwner.read(), /scope/);
  const wrongKind = createRpcLibraryStore(owner, async () => ({
    data: { records: [source] },
  }));
  await assert.rejects(() => wrongKind.get("pack", source.versionId), /scope/);
  const malformed = createRpcLibraryStore(owner, async () => ({
    data: { records: [], privateCount: 1 },
  }));
  await assert.rejects(() => malformed.read());
});

test("source-backed scenarios require exact ingredient sources and cannot carry future memories", async () => {
  const source = makeSource(),
    pack = makePack(source),
    scenario = makeScenario(pack),
    f = fixture([source, pack]);
  await f.store.put({ operationId: id(), record: scenario });
  await assert.rejects(
    () =>
      f.store.put({
        operationId: id(),
        record: makeScenario(pack, {
          sourceVersionIds: [],
          sourcePriority: [],
        }),
      }),
    /scope/,
  );
  const future = {
    ...pack,
    body: {
      ...pack.body,
      claims: [
        {
          ...pack.body.claims[0],
          knowledge: "future_source",
          knownByEntityIds: [],
          evidence: [
            { ...pack.body.claims[0].evidence[0], knowledge: "future_source" },
          ],
        },
      ],
    },
  };
  const bad = fixture([source, future]);
  await assert.rejects(
    () =>
      bad.store.put({
        operationId: id(),
        record: makeScenario(future, {
          adaptation: "literal_crossover",
          carriedClaimIds: [future.body.claims[0].id],
        }),
      }),
    /scope/,
  );
  const divergence = makeRecord("divergence", {
    schemaVersion: 1,
    scenarioVersionId: scenario.versionId,
    title: "Different tide",
    changes: [
      { id: id(), text: "The tide comes early.", visibility: "private" },
    ],
    approval: null,
  });
  await f.store.put({ operationId: id(), record: divergence });
});

function job(source) {
  return makeRecord("compiler_job", {
    schemaVersion: 1,
    targetPackId: id(),
    sourceVersionIds: [source.versionId],
    sourcePriority: [source.versionId],
    inputDigest: compilerInputDigest([source], [source.versionId]),
    status: "queued",
    budget: { maxUnits: 10, maxPasses: 8 },
    checkpoints: [],
    errorCode: null,
  });
}
test("compiler lifecycle persists bounded checkpoints and retries preserve immutable input", async () => {
  const source = makeSource(),
    f = fixture([source]);
  let current = job(source);
  await f.store.put({ operationId: id(), record: current });
  for (const state of [
    "extracting",
    "indexing",
    "auditing",
    "awaiting_review",
    "completed",
  ]) {
    const checkpoints = [...current.body.checkpoints];
    if (["extracting", "indexing", "auditing"].includes(current.body.status))
      checkpoints.push({
        pass: current.body.status,
        cursor: 1,
        digest: "a".repeat(64),
      });
    current = advanceCompilerJob(current, id(), {
      status: state,
      checkpoints,
      errorCode: null,
    });
    await f.store.put({ operationId: id(), record: current });
  }
  assert.equal(current.version, 6);
  assert.deepEqual(planSourceInvalidation(owner, source.versionId, [current]), [
    current.versionId,
  ]);
  const invalid = advanceCompilerJob(current, id(), {
    status: "invalidated",
    checkpoints: current.body.checkpoints,
    errorCode: "invalidated",
  });
  await f.store.put({ operationId: id(), record: invalid });
  assert.deepEqual(
    planSourceInvalidation(owner, source.versionId, [invalid]),
    [],
  );
  assert.throws(
    () =>
      advanceCompilerJob(invalid, id(), {
        status: "queued",
        checkpoints: [],
        errorCode: null,
      }),
    /conflict/,
  );
});

test("compiler rejects fabricated input digest, skipped pass, checkpoint replacement and invalid status jump", async () => {
  const source = makeSource(),
    first = job(source),
    f = fixture([source]);
  await assert.rejects(
    () =>
      f.store.put({
        operationId: id(),
        record: {
          ...first,
          body: { ...first.body, inputDigest: "0".repeat(64) },
        },
      }),
    /conflict/,
  );
  assert.throws(
    () =>
      advanceCompilerJob(first, id(), {
        status: "completed",
        checkpoints: [],
        errorCode: null,
      }),
    /conflict/,
  );
  const extracting = advanceCompilerJob(first, id(), {
    status: "extracting",
    checkpoints: [{ pass: "extracting", cursor: 2, digest: "a".repeat(64) }],
    errorCode: null,
  });
  assert.throws(
    () =>
      advanceCompilerJob(extracting, id(), {
        status: "extracting",
        checkpoints: [
          { pass: "extracting", cursor: 2, digest: "b".repeat(64) },
        ],
        errorCode: null,
      }),
    /conflict/,
  );
  assert.throws(() =>
    advanceCompilerJob(extracting, id(), {
      status: "extracting",
      checkpoints: [
        ...extracting.body.checkpoints,
        { pass: "extracting", cursor: 11, digest: "a".repeat(64) },
      ],
      errorCode: null,
    }),
  );
  assert.throws(
    () => planSourceInvalidation(id(), source.versionId, [first]),
    /scope/,
  );
});

test("compiler budget spans all passes, not an unbounded fresh allowance per pass", () => {
  const source = makeSource(),
    first = job(source);
  const extracting = advanceCompilerJob(first, id(), {
    status: "extracting",
    checkpoints: [{ pass: "extracting", cursor: 6, digest: "a".repeat(64) }],
    errorCode: null,
  });
  assert.throws(
    () =>
      advanceCompilerJob(extracting, id(), {
        status: "indexing",
        checkpoints: [
          ...extracting.body.checkpoints,
          { pass: "indexing", cursor: 5, digest: "b".repeat(64) },
        ],
        errorCode: null,
      }),
    /conflict/,
  );
});
