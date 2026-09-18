import test from "node:test";
import assert from "node:assert/strict";
import { PGlite } from "@electric-sql/pglite";
import {
  retrieveMemory,
  expandRetrievalRequest,
} from "../src/lib/memory/retrieval.ts";
import {
  memoryTerms,
  mentionedEntityIds,
} from "../src/lib/memory/source-analysis.ts";
import {
  longMemoryFixture,
  memorySource,
  memoryRequest,
  memoryCampaigns,
  memoryActors,
} from "./phase3-long-fixtures.mjs";

const batch = (sources, aliases = []) => ({
  campaignId: memoryCampaigns.tide,
  generation: 1,
  sources,
  aliases,
});
const sourceIds = (result) => result.sources.map((source) => source.id);

// This isolated evaluation uses actual PostgreSQL simple/English/Russian FTS,
// not a mocked search score or labels used to select candidates. Storage adapter
// and real Supabase integration are separate gates owned by the integrator.
async function evaluationDatabase(sources) {
  const db = new PGlite();
  await db.exec(
    "create table evaluation_sources (source jsonb not null, tokens tsvector not null)",
  );
  await db.query(
    `insert into evaluation_sources
    select value, to_tsvector('simple', value->>'text') || to_tsvector('english',value->>'text') || to_tsvector('russian',value->>'text')
    from jsonb_array_elements($1::jsonb)`,
    [JSON.stringify(sources)],
  );
  return db;
}

async function searchDatabase(db, request, aliases) {
  const terms = memoryTerms(request.query).slice(0, 80).join(" | ");
  const entities = mentionedEntityIds(request, aliases);
  const result = await db.query(
    `
    with candidates as (
      select source, tokens, source->>'id' = any($3::text[]) as required,
        exists(select 1 from jsonb_array_elements_text(source->'entityIds') id where id = any($4::text[])) as entity_match,
        case source->>'authority' when 'correction' then 6 when 'state' then 5 when 'canon' then 4 when 'reference' then 3 when 'history' then 3 else 1 end as authority
      from evaluation_sources
      where source->>'campaignId'=$1 and source#>>'{ref,campaignId}'=$1 and source#>>'{ref,visibility}'=$2
        and source->>'status'<>'invalid'
        and ($5 or (source->>'status'='valid' and (source->>'current')::boolean))
        and ($5 or ((source->>'validFrom' is null or (source->>'validFrom')::integer <= $6)
          and (source->>'validTo' is null or (source->>'validTo')::integer > $6)))
        and source->'knownBy' @> $7::jsonb
        and not exists(select 1 from jsonb_array_elements(source->'sourceRefs') ref where ref->>'campaignId'<>$1 or ref->>'visibility'<>$2)
    )
    select source from candidates where required or entity_match or tokens @@ to_tsquery('simple',$8)
    order by required desc, authority desc, entity_match desc, (source->>'unresolved')::boolean desc,
      (source->>'significance')::integer desc, ts_rank(tokens,to_tsquery('simple',$8)) desc, (source->>'sequence')::integer desc
    limit 48`,
    [
      request.campaignId,
      request.visibility,
      request.requiredSourceIds,
      entities,
      request.historicalComparison,
      request.worldMinutes,
      JSON.stringify(request.actorIds),
      terms,
    ],
  );
  return {
    campaignId: request.campaignId,
    generation: 1,
    sources: result.rows.map((row) => row.source),
    aliases,
  };
}

test("43 labeled scenarios recover evidence across 2400 events / 48 sessions using bounded PostgreSQL text candidates", async (t) => {
  const fixture = longMemoryFixture();
  assert.ok(fixture.sources.length >= 2400);
  assert.ok(
    new Set(fixture.sources.map((source) => source.sessionId)).size >= 48,
  );
  assert.ok(fixture.scenarios.length >= 36);
  const db = await evaluationDatabase(fixture.sources);
  let found = 0,
    expected = 0,
    criticalCoveredOrPaused = 0,
    critical = 0;
  let crossCampaignLeaks = 0,
    privateLeaks = 0;
  const failures = [];
  try {
    for (const scenario of fixture.scenarios) {
      const request = expandRetrievalRequest(scenario.request, fixture.aliases);
      const candidates = await searchDatabase(db, request, fixture.aliases);
      assert.ok(candidates.sources.length <= 48);
      const result = retrieveMemory(request, candidates);
      const ids = sourceIds(result);
      expected += scenario.expected.length;
      found += scenario.expected.filter((id) => ids.includes(id)).length;
      critical += scenario.critical.length;
      criticalCoveredOrPaused += scenario.critical.filter(
        (id) => ids.includes(id) || result.paused,
      ).length;
      crossCampaignLeaks += result.sources.filter(
        (source) => source.campaignId !== request.campaignId,
      ).length;
      privateLeaks += result.sources.filter(
        (source) =>
          source.ref.visibility !== "public" ||
          /DM_PRIVATE_SYNTHETIC_CANARY|RESTRICTED_SYNTHETIC_CANARY/.test(
            source.text,
          ),
      ).length;
      if (scenario.expected.some((id) => !ids.includes(id)))
        failures.push({
          scenario: scenario.name,
          expected: scenario.expected,
          actual: ids,
          reason: result.reason,
        });
      if (scenario.pause)
        assert.equal(result.reason, scenario.pause, scenario.name);
      else assert.equal(result.paused, false, scenario.name);
      for (const excluded of scenario.excluded)
        assert.ok(!ids.includes(excluded), `${scenario.name}: ${excluded}`);
      assert.ok(result.sources.length <= 12, scenario.name);
      assert.ok(result.bytes <= request.maxBytes, scenario.name);
      assert.equal(
        result.bytes,
        Buffer.byteLength(JSON.stringify(result.sources)),
        scenario.name,
      );
      assert.equal(result.expanded, true);
    }
  } finally {
    await db.close();
  }
  const metrics = {
    scenarioCount: fixture.scenarios.length,
    syntheticEvents: fixture.sources.length,
    sessions: new Set(fixture.sources.map((source) => source.sessionId)).size,
    expectedEvidence: expected,
    retrievedEvidence: found,
    recall: found / expected,
    criticalEvidence: critical,
    criticalIncludedOrPaused: criticalCoveredOrPaused,
    crossCampaignLeaks,
    privateLeaks,
    failures,
  };
  t.diagnostic(JSON.stringify(metrics));
  assert.ok(metrics.recall >= 0.9, JSON.stringify(failures));
  assert.equal(criticalCoveredOrPaused, critical);
  assert.equal(crossCampaignLeaks, 0);
  assert.equal(privateLeaks, 0);
});

test("scope, visibility and knowledge filter before ranking and diagnostics contain no rejected content", () => {
  const sources = [
    memorySource("public", "copper token"),
    memorySource("other", "CROSS_CAMPAIGN_SYNTHETIC_CANARY copper", {
      campaignId: memoryCampaigns.ash,
    }),
    memorySource("secret", "DM_PRIVATE_SYNTHETIC_CANARY copper", {
      ref: {
        campaignId: memoryCampaigns.tide,
        kind: "private_event",
        id: "secret",
        version: "1",
        part: 0,
        visibility: "private",
      },
    }),
    memorySource("unknown", "UNKNOWN_WITNESS copper", { knownBy: [] }),
  ];
  const result = retrieveMemory(
    memoryRequest({ query: "copper", actorIds: [memoryActors.orrin] }),
    batch(sources),
  );
  assert.deepEqual(sourceIds(result), ["public"]);
  assert.doesNotMatch(JSON.stringify(result), /CANARY|UNKNOWN_WITNESS/);
  assert.deepEqual(
    sourceIds(
      retrieveMemory(
        memoryRequest({ query: "copper", visibility: "private" }),
        batch(sources),
      ),
    ),
    ["secret"],
  );
  assert.equal(
    retrieveMemory(memoryRequest({ query: "copper" }), {
      ...batch(sources),
      campaignId: memoryCampaigns.ash,
    }).reason,
    "missing",
  );
});

test("current version, validity and restrictive referenced visibility reject stale derivatives", () => {
  const current = memorySource("new", "bridge basalt", {
    ref: {
      campaignId: memoryCampaigns.tide,
      kind: "document",
      id: "bridge",
      version: "2",
      part: 0,
      visibility: "public",
    },
  });
  const oldRef = { ...current.ref, version: "1" };
  const derivative = memorySource("summary", "bridge oak STALE", {
    authority: "derived",
    sourceRefs: [oldRef],
  });
  const privateRef = { ...current.ref, visibility: "private" };
  const restricted = memorySource("restricted", "bridge PRIVATE_DERIVED", {
    authority: "derived",
    sourceRefs: [privateRef],
  });
  const foreign = memorySource("foreign-ref", "bridge FOREIGN_DERIVED", {
    authority: "derived",
    sourceRefs: [{ ...current.ref, campaignId: memoryCampaigns.ash }],
  });
  const orphan = memorySource("orphan", "bridge orphan", {
    authority: "derived",
  });
  assert.deepEqual(
    sourceIds(
      retrieveMemory(
        memoryRequest({ query: "bridge" }),
        batch([current, derivative, restricted, foreign, orphan]),
      ),
    ),
    ["new"],
  );
  for (const id of ["summary", "restricted", "foreign-ref", "orphan"])
    assert.equal(
      retrieveMemory(
        memoryRequest({ query: "bridge", requiredSourceIds: [id] }),
        batch([current, derivative, restricted, foreign, orphan]),
      ).reason,
      "missing",
    );
});

test("authority, applicable time and same-source numeric versions resolve facts; tied current fact conflicts pause", () => {
  const canon = memorySource("canon", "door open", {
    authority: "canon",
    statementKind: "fact",
    factKey: "door",
    factValue: "open",
  });
  const correction = memorySource("correction", "door closed", {
    authority: "correction",
    statementKind: "fact",
    factKey: "door",
    factValue: "closed",
  });
  assert.deepEqual(
    sourceIds(
      retrieveMemory(
        memoryRequest({ query: "door" }),
        batch([canon, correction]),
      ),
    ),
    ["correction"],
  );
  const disputed = {
    ...correction,
    id: "disputed",
    ref: { ...correction.ref, id: "disputed" },
    factValue: "open",
    text: "door open",
  };
  const result = retrieveMemory(
    memoryRequest({ query: "door" }),
    batch([correction, disputed]),
  );
  assert.equal(result.reason, "conflict");
  assert.deepEqual(result.sources, []);
  const later = { ...disputed, validFrom: 50 };
  assert.deepEqual(
    sourceIds(
      retrieveMemory(
        memoryRequest({ query: "door" }),
        batch([correction, later]),
      ),
    ),
    ["disputed"],
  );
  const newVersion = {
    ...correction,
    id: "new-version",
    text: "door open",
    factValue: "open",
    ref: { ...correction.ref, version: "2" },
  };
  assert.deepEqual(
    sourceIds(
      retrieveMemory(
        memoryRequest({ query: "door" }),
        batch([correction, newVersion]),
      ),
    ),
    ["new-version"],
  );
});

test("rumor, lie, intention, negation and attributed claim text remains unchanged", () => {
  const kinds = [
    "rumor",
    "lie",
    "intention",
    "claim",
    "hypothesis",
    "question",
    "record",
  ];
  const sources = kinds.map((statementKind) =>
    memorySource(
      statementKind,
      `Mira says the gate is not open; ${statementKind} remains uncertain and conditional.`,
      {
        statementKind,
        attribution: "Mira",
        factKey: "gate",
        factValue: statementKind,
      },
    ),
  );
  const result = retrieveMemory(
    memoryRequest({ query: "gate" }),
    batch(sources),
  );
  assert.equal(result.paused, false);
  assert.equal(result.sources.length, kinds.length);
  for (const source of result.sources)
    assert.deepEqual(
      source,
      sources.find((row) => row.id === source.id),
    );
});

test("whole source spans count serialized metadata and never truncate critical evidence", () => {
  const first = memorySource(
    "first",
    "A promise only applies if the flood recedes.",
    { unresolved: true },
  );
  const second = memorySource("second", "A promise not fulfilled yet.");
  const exactBytes = Buffer.byteLength(JSON.stringify([first]));
  const request = memoryRequest({
    query: "promise",
    maxBytes: exactBytes,
    requiredSourceIds: ["first"],
  });
  const result = retrieveMemory(request, batch([first, second]));
  assert.deepEqual(result.sources, [first]);
  assert.equal(result.bytes, exactBytes);
  assert.equal(
    retrieveMemory({ ...request, maxBytes: exactBytes - 1 }, batch([first]))
      .reason,
    "budget",
  );
  assert.equal(
    retrieveMemory(
      {
        ...request,
        requiredSourceIds: Array.from({ length: 13 }, (_, index) => `${index}`),
      },
      batch([first]),
    ).reason,
    "budget",
  );
});

test("deduplication uses source identity and preserves separate qualified spans", () => {
  const original = memorySource("a", "The oath applies only after sunrise.");
  const duplicate = { ...original, id: "duplicate" };
  const anotherPart = {
    ...original,
    id: "part-two",
    ref: { ...original.ref, part: 1 },
    text: "The oath expires before sunset.",
  };
  const result = retrieveMemory(
    memoryRequest({ query: "oath" }),
    batch([original, duplicate, anotherPart]),
  );
  assert.equal(result.sources.length, 2);
  assert.ok(result.sources.some((source) => source.ref.part === 1));
  const malformed = { ...duplicate, text: "The oath never expires." };
  assert.equal(
    retrieveMemory(
      memoryRequest({ query: "oath" }),
      batch([original, malformed]),
    ).reason,
    "conflict",
  );
});

test("query expansion is bounded, bilingual, alias-aware, idempotent and campaign scoped", () => {
  const { aliases } = longMemoryFixture();
  const request = memoryRequest({ query: "Фонарь обещание карта" });
  const expanded = expandRetrievalRequest(request, aliases);
  assert.ok(expanded.query.startsWith(request.query));
  assert.ok(expanded.query.includes("promise"));
  assert.ok(expanded.entityIds.includes(memoryActors.orrin));
  assert.ok(!expanded.entityIds.includes("ash-orrin"));
  assert.equal(expandRetrievalRequest(expanded, aliases), expanded);
  assert.ok(
    memoryTerms(expanded.query).length - memoryTerms(request.query).length <=
      24,
  );
  assert.equal(retrieveMemory(expanded, batch([])).expanded, true);
  assert.equal(retrieveMemory(request, batch([])).expanded, false);
});

test("old significant promises survive more than a thousand new low-value sources", () => {
  const { sources, aliases } = longMemoryFixture();
  const request = memoryRequest({ query: "Captain Vale copper promise" });
  const result = retrieveMemory(request, batch(sources, aliases));
  assert.ok(sourceIds(result).includes("copper-promise"));
  assert.ok(result.sources.length <= 12);
  assert.ok(result.bytes <= request.maxBytes);
});

test("a direct request to recall absent history pauses, while unrelated current action can use no historical excerpts", () => {
  assert.equal(
    retrieveMemory(
      memoryRequest({ query: "Remember the earlier pledge?" }),
      batch([]),
    ).reason,
    "missing",
  );
  assert.equal(
    retrieveMemory(
      memoryRequest({ query: "Что мы обещали раньше?" }),
      batch([]),
    ).reason,
    "missing",
  );
  assert.equal(
    retrieveMemory(memoryRequest({ query: "Look around." }), batch([])).paused,
    false,
  );
  assert.equal(
    retrieveMemory(
      memoryRequest({
        query: "Remember earlier pledge",
        visibility: "private",
      }),
      batch([]),
    ).paused,
    false,
  );
});
