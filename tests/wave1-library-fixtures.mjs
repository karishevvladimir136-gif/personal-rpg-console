import { randomUUID } from "node:crypto";
import { sha256 } from "../src/lib/world-library/parsers.ts";
import {
  canonical,
  createRpcLibraryStore,
} from "../src/lib/world-library/store.ts";
export const id = () => randomUUID();
export const owner = id();
export const makeRecord = (kind, body, extra = {}) => ({
  schemaVersion: 1,
  ownerId: owner,
  kind,
  id: id(),
  versionId: id(),
  version: 1,
  previousVersionId: null,
  body,
  ...extra,
});
export const makeSource = (extra = {}) =>
  makeRecord("source", {
    schemaVersion: 1,
    title: "Synthetic source",
    format: "txt",
    digest: sha256("A calm harbor."),
    original: { kind: "text", text: "A calm harbor." },
    attribution: { author: null, publisher: null, canonicalUrl: null },
    visibility: "public",
    extraction: { version: "plain-v1", status: "complete", gaps: [] },
    ...extra,
  });
export const evidence = (source, extra = {}) => ({
  ownerId: source.ownerId,
  sourceId: source.id,
  sourceVersionId: source.versionId,
  locator: { kind: "text", value: "0:13" },
  digest: source.body.digest,
  visibility: "public",
  knowledge: "character",
  ...extra,
});
export function makePack(source, { extraClaims = [], extra = {} } = {}) {
  const person = id();
  const claim = {
    id: id(),
    subjectId: person,
    predicate: "description",
    text: "A calm harbor.",
    origin: "source_fact",
    epistemic: "fact",
    authority: "approved_canon",
    visibility: "public",
    knowledge: "character",
    validFrom: 0,
    validUntil: null,
    knownByEntityIds: [person],
    evidence: [evidence(source)],
    uncertainty: null,
  };
  const pack = makeRecord("pack", {
    schemaVersion: 1,
    title: "Synthetic coast",
    status: "approved",
    sourceVersionIds: [source.versionId],
    sourcePriority: [source.versionId],
    entities: [{ id: person, name: "Mara", kind: "person", aliases: [] }],
    claims: [claim, ...extraClaims.map((c) => ({ ...claim, id: id(), ...c }))],
    contradictions: [],
    coverage: [
      {
        sourceVersionId: source.versionId,
        status: "complete",
        processedUnits: 1,
        totalUnits: 1,
        gaps: [],
      },
    ],
    unknowns: [],
    compilerJobVersionId: null,
    approval: {
      ownerId: owner,
      reviewedConflictIds: [],
      reviewedUnknownIds: [],
    },
    ...extra,
  });
  return pack;
}
export const entry = () => ({
  label: "At the harbor",
  worldMinutes: 0,
  evidence: [],
});
export function makeScenario(pack, extra = {}) {
  return makeRecord("scenario", {
    schemaVersion: 1,
    title: "At entry",
    status: "approved",
    packVersionIds: [pack.versionId],
    sourceVersionIds: [...pack.body.sourceVersionIds],
    sourcePriority: [...pack.body.sourcePriority],
    entry: entry(),
    adaptation: "original",
    identities: pack.body.entities.map((e) => ({
      packVersionId: pack.versionId,
      packEntityId: e.id,
      scenarioEntityId: id(),
    })),
    assumptions: [],
    carriedClaimIds: [],
    localHistory: null,
    unresolvedConflictIds: [],
    approval: {
      ownerId: owner,
      reviewedConflictIds: [],
      reviewedUnknownIds: [],
    },
    ...extra,
  });
}
export function fixture(initial = []) {
  const records = new Map(
      initial.map((r) => [r.versionId, structuredClone(r)]),
    ),
    receipts = new Map(),
    calls = [];
  const rpc = async (args) => {
    calls.push(structuredClone(args));
    if (args.p_campaign_id !== null || args.p_owner_id !== owner)
      return { error: { message: "rpg_forbidden" } };
    if (args.p_action === "read") {
      const f = args.p_payload;
      return {
        data: {
          records: [...records.values()]
            .filter(
              (r) =>
                r.ownerId === args.p_owner_id &&
                (!f.kind || f.kind === r.kind) &&
                (!f.id || f.id === r.id) &&
                (!f.versionId || f.versionId === r.versionId),
            )
            .sort((a, b) => b.version - a.version)
            .slice(0, 500),
        },
      };
    }
    const { operationId, record } = args.p_payload,
      prior = receipts.get(operationId);
    if (prior)
      return canonical(prior) === canonical(record)
        ? { data: structuredClone(prior) }
        : { error: { message: "rpg_conflict" } };
    if (records.has(record.versionId))
      return { error: { message: "rpg_conflict" } };
    records.set(record.versionId, structuredClone(record));
    receipts.set(operationId, structuredClone(record));
    return { data: structuredClone(record) };
  };
  return { store: createRpcLibraryStore(owner, rpc), records, calls, rpc };
}
