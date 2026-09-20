import type { EvidenceLocator } from "../production/contracts.ts";
import type {
  CompilerJobBody,
  Coverage,
  PackBody,
  PackClaim,
  PackEntity,
  TypedRecord,
} from "./types.ts";
import { parseLibraryRecord, parsePack, sha256 } from "./parsers.ts";
import { canonical, compilerInputDigest } from "./store.ts";
import { ensure, integer, sameSet } from "./validation.ts";

export const LOCAL_COMPILER_VERSION = "text-evidence-v1";
export const LOCAL_COMPILER_LIMITS = {
  sources: 8,
  characters: 500_000,
  units: 480,
  passes: 3,
  outputBytes: 900_000,
} as const;

// Stable app identities, never names/provider IDs. A retry uses exactly the same seed.
export function libraryId(seed: string): string {
  const hex = sha256(seed);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

type Passage = {
  source: TypedRecord<"source">;
  start: number;
  end: number;
  text: string;
  declaration: boolean;
  heading: { name: string; kind: PackEntity["kind"]; key: string } | null;
};
type Extraction = {
  passages: Passage[];
  coverage: Coverage[];
  inputDigest: string;
};

export function extractTextSources(
  sources: TypedRecord<"source">[],
  priority: string[],
  maxUnits: number,
): Extraction {
  ensure(sources.length > 0 && sources.length <= LOCAL_COMPILER_LIMITS.sources);
  ensure(
    sameSet(
      sources.map((s) => s.versionId),
      priority,
    ),
  );
  ensure(new Set(sources.map((s) => s.id)).size === sources.length);
  integer(maxUnits, 3, LOCAL_COMPILER_LIMITS.units);
  const ownerId = sources[0].ownerId;
  const parsed = sources.map((source) => {
    const record = parseLibraryRecord(source, ownerId);
    ensure(
      record.kind === "source" &&
        ["txt", "md"].includes(record.body.format) &&
        record.body.original.kind === "text",
    );
    return record;
  });
  ensure(
    parsed.reduce(
      (sum, s) =>
        sum +
        (s.body.original.kind === "text" ? s.body.original.text.length : 0),
      0,
    ) <= LOCAL_COMPILER_LIMITS.characters,
  );
  let remaining = Math.floor(maxUnits / LOCAL_COMPILER_LIMITS.passes);
  const passages: Passage[] = [],
    coverage: Coverage[] = [];
  for (const versionId of priority) {
    const source = parsed.find((s) => s.versionId === versionId)!;
    ensure(source.body.original.kind === "text");
    const original = source.body.original.text;
    const units: Passage[] = [];
    let heading: Passage["heading"] = null;
    // CR/LF and Unicode are preserved. Locators are JS UTF-16 offsets into the exact original.
    for (const match of original.matchAll(/[^\r\n]+/g)) {
      const line = match[0];
      if (!line.trim()) continue;
      const headingPattern: RegExp =
        heading === null
          ? /^(?:#{1,6}\s+)?(person|group|faction|location|object|institution):\s*(.{1,200})$/i
          : /^#{1,6}\s+(person|group|faction|location|object|institution):\s*(.{1,200})$/i;
      const title: RegExpExecArray | null = headingPattern.exec(line.trim());
      if (title)
        heading = {
          name: title[2].trim(),
          kind: title[1].toLowerCase() as PackEntity["kind"],
          key: `${title[1].toLowerCase()}:${title[2].trim().toLowerCase()}:${match.index}`,
        };
      // Oversize lines are counted as uncovered; truncation never masquerades as extraction.
      units.push({
        source,
        start: match.index,
        end: match.index + line.length,
        text: line,
        declaration: title !== null,
        heading,
      });
    }
    const eligible = units.filter((p) => p.text.length <= 4000);
    const selected = eligible.slice(0, remaining);
    remaining -= selected.length;
    passages.push(...selected);
    const gaps: string[] = [];
    if (eligible.length !== units.length)
      gaps.push(
        "Lines longer than 4,000 characters were preserved but not indexed.",
      );
    if (selected.length !== eligible.length)
      gaps.push(
        "The explicit passage budget ended; remaining lines are preserved for another compilation.",
      );
    coverage.push({
      sourceVersionId: versionId,
      status:
        selected.length === units.length
          ? "complete"
          : selected.length
            ? "partial"
            : "unprocessed",
      processedUnits: selected.length,
      totalUnits: units.length,
      gaps,
    });
  }
  return {
    passages,
    coverage,
    inputDigest: compilerInputDigest(parsed, priority),
  };
}

export function evidenceForPassage(passage: Passage): EvidenceLocator {
  return {
    ownerId: passage.source.ownerId,
    sourceId: passage.source.id,
    sourceVersionId: passage.source.versionId,
    locator: { kind: "text", value: `${passage.start}:${passage.end}` },
    digest: sha256(passage.text),
    visibility: passage.source.body.visibility,
    knowledge: passage.source.body.knowledge ?? "source",
  };
}

export function verifyTextEvidence(
  evidence: EvidenceLocator,
  source: TypedRecord<"source">,
): string {
  ensure(
    evidence.ownerId === source.ownerId &&
      evidence.sourceId === source.id &&
      evidence.sourceVersionId === source.versionId,
    "scope",
  );
  ensure(
    source.body.original.kind === "text" && evidence.locator.kind === "text",
  );
  ensure(
    evidence.visibility === "private" || source.body.visibility === "public",
    "scope",
  );
  ensure(
    source.body.knowledge !== "future_source" ||
      evidence.knowledge === "future_source",
    "scope",
  );
  const match = /^(0|[1-9]\d*):(0|[1-9]\d*)$/.exec(evidence.locator.value);
  ensure(match);
  const start = integer(Number(match[1])),
    end = integer(
      Number(match[2]),
      start + 1,
      source.body.original.text.length,
    );
  const excerpt = source.body.original.text.slice(start, end);
  ensure(sha256(excerpt) === evidence.digest, "conflict");
  return excerpt;
}

export function compileTextDraft(
  job: CompilerJobBody,
  sources: TypedRecord<"source">[],
): { pack: PackBody; checkpoints: CompilerJobBody["checkpoints"] } {
  ensure(job.budget.maxPasses >= 3);
  const extraction = extractTextSources(
    sources,
    job.sourcePriority,
    job.budget.maxUnits,
  );
  ensure(extraction.inputDigest === job.inputDigest, "conflict");
  const entities = new Map<string, PackEntity>(),
    claims: PackClaim[] = [];
  for (const passage of extraction.passages) {
    const key = `${passage.source.id}:${passage.heading?.key ?? "document"}`;
    const id = libraryId(`${job.targetPackId}:entity:${key}`);
    if (!entities.has(id))
      entities.set(id, {
        id,
        name: passage.heading?.name ?? passage.source.body.title,
        kind: passage.heading?.kind ?? "object",
        aliases: [],
      });
    const field = /^\s*([\p{L}\p{N}_ -]{1,80}):\s*(.+)$/u.exec(passage.text);
    const predicate =
      field && !passage.declaration
        ? field[1].trim().toLowerCase()
        : "source_statement";
    // Only explicitly marked headings/fields are structured. Prose is never treated as parsed world truth.
    if (predicate === "alias" && field && field[2].length <= 240) {
      const entity = entities.get(id)!;
      if (entity.aliases.length < 20 && !entity.aliases.includes(field[2]))
        entity.aliases.push(field[2]);
    }
    const evidence = evidenceForPassage(passage);
    claims.push({
      id: libraryId(
        `${job.targetPackId}:claim:${passage.source.versionId}:${passage.start}:${passage.end}`,
      ),
      subjectId: id,
      predicate,
      text: passage.text,
      origin: "source_fact",
      epistemic: "unknown",
      authority: "reference",
      visibility: evidence.visibility,
      knowledge: evidence.knowledge,
      validFrom: null,
      validUntil: null,
      knownByEntityIds: [],
      evidence: [evidence],
      uncertainty:
        "Source assertion only. Truth, time and character knowledge require owner review.",
    });
  }
  const contradictions: PackBody["contradictions"] = [];
  const candidates = new Map<string, PackClaim[]>();
  for (const claim of claims) {
    if (["source_statement", "alias"].includes(claim.predicate)) continue;
    const entity = entities.get(claim.subjectId)!;
    const key = `${entity.kind}:${entity.name.toLowerCase()}:${claim.predicate}`;
    candidates.set(key, [...(candidates.get(key) ?? []), claim]);
  }
  for (const [key, group] of candidates) {
    if (
      new Set(
        group.map((c) => c.text.replace(/^.*?:/, "").trim().toLowerCase()),
      ).size < 2
    )
      continue;
    // Pairwise against the first alternative stays bounded and keeps every claim attributable.
    for (const other of group.slice(1)) {
      if (other.text === group[0].text) continue;
      contradictions.push({
        id: libraryId(
          `${job.targetPackId}:conflict:${key}:${group[0].id}:${other.id}`,
        ),
        claimIds: [group[0].id, other.id],
        status: "unresolved",
        resolution: null,
      });
    }
  }
  const unknowns: PackBody["unknowns"] = [
    {
      id: libraryId(`${job.targetPackId}:unknown:scope`),
      entityId: null,
      question:
        "Passages are source assertions. Review their truth, relationships, chronology, rules, geography and character knowledge before use as canon.",
    },
  ];
  for (const coverage of extraction.coverage)
    if (coverage.status !== "complete")
      unknowns.push({
        id: libraryId(
          `${job.targetPackId}:unknown:coverage:${coverage.sourceVersionId}`,
        ),
        entityId: null,
        question: `Some source lines remain unindexed (${coverage.processedUnits}/${coverage.totalUnits}). Originals remain available.`,
      });
  const byName = new Map<string, PackEntity[]>();
  for (const entity of entities.values())
    byName.set(entity.name.toLowerCase(), [
      ...(byName.get(entity.name.toLowerCase()) ?? []),
      entity,
    ]);
  for (const [name, group] of byName)
    if (group.length > 1)
      unknowns.push({
        id: libraryId(`${job.targetPackId}:unknown:identity:${name}`),
        entityId: null,
        question: `“${group[0].name}” occurs in separate source identities. They were not merged; review whether they denote the same entity.`,
      });
  const pack = parsePack({
    schemaVersion: 1,
    title:
      `World Pack: ${sources.find((s) => s.versionId === job.sourcePriority[0])!.body.title}`.slice(
        0,
        240,
      ),
    status: "draft",
    sourceVersionIds: job.sourceVersionIds,
    sourcePriority: job.sourcePriority,
    entities: [...entities.values()],
    claims,
    contradictions,
    coverage: extraction.coverage,
    unknowns,
    compilerJobVersionId: null,
    approval: null,
  });
  const cursor = extraction.passages.length;
  // The database's immutable JSON envelope is byte bounded, not character bounded.
  // Reject before job creation, so multilingual input cannot strand a final checkpoint.
  ensure(
    Buffer.byteLength(canonical(pack), "utf8") <=
      LOCAL_COMPILER_LIMITS.outputBytes,
  );
  return {
    pack,
    checkpoints: [
      {
        pass: "extracting",
        cursor,
        digest: sha256(
          canonical({
            version: LOCAL_COMPILER_VERSION,
            input: extraction.inputDigest,
            evidence: claims.map((c) => c.evidence),
            coverage: extraction.coverage,
          }),
        ),
      },
      {
        pass: "indexing",
        cursor,
        digest: sha256(canonical({ entities: pack.entities, claims })),
      },
      {
        pass: "auditing",
        cursor,
        digest: sha256(
          canonical({ contradictions, unknowns, coverage: pack.coverage }),
        ),
      },
    ],
  };
}
