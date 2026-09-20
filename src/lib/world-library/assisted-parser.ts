import type {
  CompilerCandidate,
  CompilerProposal,
} from "./assisted-contracts.ts";
import {
  ensure,
  integer,
  list,
  literal,
  nullable,
  object,
  text,
  unique,
  uuid,
} from "./validation.ts";

export const ASSISTED_COMPILER_LIMITS = {
  entities: 48,
  candidates: 96,
  issues: 24,
  evidence: 160,
  bytes: 160_000,
} as const;
const key = (v: unknown) => {
  const result = text(v, 48);
  ensure(/^[a-zA-Z0-9_-]+$/.test(result));
  return result;
};
const indexes = (v: unknown) => unique(list(v, (i) => integer(i, 0, 159), 32));
const short = (v: unknown) => text(v, 240);

export function matchesCompilerModel(actual: string, pinned: string): boolean {
  return (
    actual === pinned ||
    (actual.startsWith(pinned) &&
      /^-\d{4}-\d{2}-\d{2}$/.test(actual.slice(pinned.length)))
  );
}

export function parseCompilerProposal(value: unknown): CompilerProposal {
  ensure(
    Buffer.byteLength(JSON.stringify(value) ?? "", "utf8") <=
      ASSISTED_COMPILER_LIMITS.bytes,
  );
  const v = object(value, [
    "schemaVersion",
    "title",
    "entities",
    "candidates",
    "contradictions",
    "unknowns",
    "coverage",
  ]);
  const entities = unique(
    list(
      v.entities,
      (entry) => {
        const e = object(entry, [
          "key",
          "name",
          "kind",
          "aliases",
          "evidenceIndexes",
        ]);
        return {
          key: key(e.key),
          name: short(e.name),
          kind: literal(e.kind, [
            "person",
            "group",
            "faction",
            "location",
            "object",
            "institution",
          ] as const),
          aliases: unique(list(e.aliases, short, 12)),
          evidenceIndexes: indexes(e.evidenceIndexes),
        };
      },
      48,
    ),
    (e) => e.key,
  );
  const candidates = unique(
    list(
      v.candidates,
      (entry): CompilerCandidate => {
        const c = object(entry, [
          "key",
          "subjectKey",
          "kind",
          "predicate",
          "text",
          "basis",
          "epistemic",
          "evidenceIndexes",
          "uncertainty",
          "objectKey",
          "position",
        ]);
        const result = {
          key: key(c.key),
          subjectKey: key(c.subjectKey),
          kind: literal(c.kind, [
            "description",
            "premise",
            "relationship",
            "geography",
            "timeline",
            "rule",
          ] as const),
          predicate: text(c.predicate, 100),
          text: text(c.text, 2000),
          basis: literal(c.basis, [
            "quote",
            "inference",
            "assumption",
          ] as const),
          epistemic: literal(c.epistemic, [
            "fact",
            "rumor",
            "lie",
            "hypothesis",
            "intention",
            "unknown",
          ] as const),
          evidenceIndexes: indexes(c.evidenceIndexes),
          uncertainty: nullable(c.uncertainty, short),
          objectKey: nullable(c.objectKey, key),
          position: nullable(c.position, short),
        };
        ensure(entities.some((e) => e.key === result.subjectKey));
        ensure(
          (result.kind === "relationship" || result.kind === "geography") ===
            (result.objectKey !== null),
        );
        ensure(
          result.objectKey === null ||
            entities.some((e) => e.key === result.objectKey),
        );
        ensure((result.kind === "timeline") === (result.position !== null));
        ensure(result.evidenceIndexes.length > 0);
        ensure(result.basis === "quote" || result.uncertainty !== null);
        return result;
      },
      96,
    ),
    (c) => c.key,
  );
  const contradictions = unique(
    list(
      v.contradictions,
      (entry) => {
        const c = object(entry, ["key", "candidateKeys"]);
        const candidateKeys = unique(list(c.candidateKeys, key, 12));
        ensure(
          candidateKeys.length >= 2 &&
            candidateKeys.every((k) => candidates.some((p) => p.key === k)),
        );
        return { key: key(c.key), candidateKeys };
      },
      24,
    ),
    (c) => c.key,
  );
  const unknowns = unique(
    list(
      v.unknowns,
      (entry) => {
        const u = object(entry, ["key", "question", "entityKey"]);
        const entityKey = nullable(u.entityKey, key);
        ensure(entityKey === null || entities.some((e) => e.key === entityKey));
        return { key: key(u.key), question: short(u.question), entityKey };
      },
      24,
    ),
    (u) => u.key,
  );
  const coverage = unique(
    list(
      v.coverage,
      (entry) => {
        const c = object(entry, ["sourceVersionId", "evidenceIndexes", "gaps"]);
        return {
          sourceVersionId: uuid(c.sourceVersionId),
          evidenceIndexes: unique(
            list(c.evidenceIndexes, (i) => integer(i, 0, 159), 160),
          ),
          gaps: list(c.gaps, short, 12),
        };
      },
      8,
    ),
    (c) => c.sourceVersionId,
  );
  ensure(entities.length > 0 && candidates.length > 0);
  return {
    schemaVersion: literal(v.schemaVersion, [1]),
    title: short(v.title),
    entities,
    candidates,
    contradictions,
    unknowns,
    coverage,
  };
}
