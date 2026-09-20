import type {
  AssistedCompilerInput,
  CompilerProposal,
} from "./assisted-contracts.ts";
import type { CompilerJobBody, PackBody, PackClaim } from "./types.ts";
import { parseCompilerProposal } from "./assisted-parser.ts";
import {
  evidenceForPassage,
  extractTextSources,
  libraryId,
  verifyTextEvidence,
} from "./local-compiler.ts";
import {
  parseCompilerJob,
  parseLibraryRecord,
  parsePack,
  sha256,
} from "./parsers.ts";
import { canonical } from "./store.ts";
import { ensure, sameSet, uuid } from "./validation.ts";
import { validateExecutionProfile } from "../model-runtime/registry.ts";

export function prepareAssistedCompilation(input: AssistedCompilerInput) {
  uuid(input.operationId);
  const { sources, basePack } = input;
  const job = parseCompilerJob(input.job);
  ensure(job.assistance && job.budget.maxPasses === 4);
  validateExecutionProfile(job.assistance.executionProfile, "canon.compile");
  const extraction = extractTextSources(
    sources,
    job.sourcePriority,
    job.budget.maxUnits,
  );
  ensure(extraction.inputDigest === job.inputDigest, "conflict");
  ensure(extraction.passages.length > 0);
  ensure(
    job.assistance.refinement
      ? basePack?.versionId === job.assistance.refinement.packVersionId
      : basePack === null,
    "scope",
  );
  if (basePack) {
    parseLibraryRecord(basePack, sources[0].ownerId);
    ensure(
      basePack.ownerId === sources[0].ownerId &&
        basePack.id === job.targetPackId &&
        canonical(basePack.body.sourcePriority) ===
          canonical(job.sourcePriority),
      "scope",
    );
  }
  const evidence = extraction.passages.map((p, index) => ({
    index,
    locator: evidenceForPassage(p),
    excerpt: p.text,
    authored: p.source.body.provenance?.kind === "owner_authored",
  }));
  return {
    extraction,
    evidence,
    data: {
      schemaVersion: 1,
      sourcePriority: job.sourcePriority,
      sources: job.sourcePriority.map((versionId) => {
        const s = sources.find((s) => s.versionId === versionId)!;
        return {
          versionId,
          title: s.body.title,
          provenance: s.body.provenance ?? null,
        };
      }),
      evidence,
      coverage: extraction.coverage,
      refinement: job.assistance.refinement,
      // Prior versions and owner corrections are review data, not policy.
      existingDraft: basePack?.body ?? null,
    },
  };
}

export function compileAssistedDraft(
  input: AssistedCompilerInput,
  raw: unknown,
): {
  pack: PackBody;
  checkpoints: CompilerJobBody["checkpoints"];
  proposal: CompilerProposal;
} {
  const proposal = parseCompilerProposal(raw),
    prepared = prepareAssistedCompilation(input);
  const { job, basePack } = input;
  const { evidence, extraction } = prepared;
  const checked = (indexes: number[]) => {
    ensure(indexes.length > 0 && indexes.every((i) => evidence[i]), "scope");
    return indexes.map((i) => evidence[i]);
  };
  for (const e of proposal.entities) checked(e.evidenceIndexes);
  ensure(
    sameSet(
      proposal.coverage.map((c) => c.sourceVersionId),
      job.sourceVersionIds,
    ),
    "scope",
  );
  for (const c of proposal.coverage) {
    ensure(
      c.evidenceIndexes.every(
        (i) => evidence[i]?.locator.sourceVersionId === c.sourceVersionId,
      ),
      "scope",
    );
  }
  const considered = new Set(
    proposal.coverage.flatMap((c) => c.evidenceIndexes),
  );
  ensure(
    proposal.entities.every((e) =>
      e.evidenceIndexes.every((i) => considered.has(i)),
    ),
    "scope",
  );
  const entityId = (key: string) =>
    libraryId(
      `${job.targetPackId}:${job.assistance!.executionProfile.id}:entity:${key}`,
    );
  const claimId = (key: string) =>
    libraryId(
      `${job.targetPackId}:${job.assistance!.executionProfile.id}:claim:${key}`,
    );
  // Every output has seen the bounded input. Conservatively retain its strongest
  // privacy/future boundary, including during refinement; the model cannot relax it.
  const visibility =
    input.sources.some((s) => s.body.visibility === "private") ||
    basePack?.body.claims.some((c) => c.visibility === "private")
      ? "private"
      : "public";
  const knowledge =
    input.sources.some((s) => s.body.knowledge === "future_source") ||
    basePack?.body.claims.some((c) => c.knowledge === "future_source")
      ? "future_source"
      : "source";
  const claims: PackClaim[] = proposal.candidates.map((c) => {
    const cited = checked(c.evidenceIndexes);
    ensure(
      c.evidenceIndexes.every((i) => considered.has(i)),
      "scope",
    );
    if (c.basis === "quote")
      ensure(
        cited.some((e) => e.excerpt === c.text),
        "conflict",
      );
    const authored = cited.some((e) => e.authored);
    const origin =
      c.basis === "assumption" || (authored && c.basis === "quote")
        ? "scenario_assumption"
        : c.basis === "quote"
          ? "source_fact"
          : "source_inference";
    const structure: NonNullable<PackClaim["structure"]> =
      c.kind === "relationship" || c.kind === "geography"
        ? { kind: c.kind, objectId: entityId(c.objectKey!) }
        : c.kind === "timeline"
          ? { kind: c.kind, position: c.position! }
          : { kind: c.kind };
    return {
      id: claimId(c.key),
      subjectId: entityId(c.subjectKey),
      predicate: c.predicate,
      text: c.text,
      origin,
      epistemic: c.epistemic,
      authority: "reference",
      visibility,
      knowledge,
      validFrom: null,
      validUntil: null,
      knownByEntityIds: [],
      evidence: cited.map((e) => ({ ...e.locator, visibility, knowledge })),
      uncertainty:
        c.uncertainty ??
        (authored
          ? "Owner-authored world premise; not an external source fact."
          : null),
      structure,
    };
  });
  const coverage = extraction.coverage.map((original) => {
    const c = proposal.coverage.find(
      (c) => c.sourceVersionId === original.sourceVersionId,
    )!;
    const gaps = [...original.gaps, ...c.gaps];
    if (c.evidenceIndexes.length < original.processedUnits)
      gaps.push("Some supplied passages were not covered by the proposal.");
    return {
      ...original,
      processedUnits: c.evidenceIndexes.length,
      status: (c.evidenceIndexes.length === original.totalUnits &&
      gaps.length === 0
        ? "complete"
        : c.evidenceIndexes.length
          ? "partial"
          : "unprocessed") as PackBody["coverage"][number]["status"],
      gaps,
    };
  });
  const unknowns: PackBody["unknowns"] = proposal.unknowns.map((u) => ({
    id: libraryId(
      `${job.targetPackId}:${job.assistance!.executionProfile.id}:unknown:${u.key}`,
    ),
    question: u.question,
    entityId: u.entityKey === null ? null : entityId(u.entityKey),
  }));
  unknowns.push({
    id: libraryId(`${job.assistance!.executionProfile.id}:review`),
    entityId: null,
    question:
      "Model-generated candidates require owner review. Evidence citations do not prove an inference; geography, relationships, chronology and rules may be incomplete.",
  });
  if (basePack)
    unknowns.push({
      id: libraryId(`${job.assistance!.executionProfile.id}:refinement`),
      entityId: null,
      question:
        "Refinement proposals were added beside the prior draft. Existing owner corrections remain; explicitly reject or edit alternatives before approval.",
    });
  for (const c of coverage)
    if (c.status !== "complete")
      unknowns.push({
        id: libraryId(
          `${job.assistance!.executionProfile.id}:coverage:${c.sourceVersionId}`,
        ),
        entityId: null,
        question: `Source coverage is ${c.status}; ${c.processedUnits} of ${c.totalUnits ?? "unknown"} passages were reviewed.`,
      });
  const pack = parsePack({
    schemaVersion: 1,
    title: proposal.title,
    status: "draft",
    sourceVersionIds: job.sourceVersionIds,
    sourcePriority: job.sourcePriority,
    entities: [
      ...(basePack?.body.entities ?? []),
      ...proposal.entities.map((e) => ({
        id: entityId(e.key),
        name: e.name,
        kind: e.kind,
        aliases: e.aliases,
      })),
    ],
    claims: [
      ...(basePack?.body.claims.map((c) => ({
        ...c,
        authority: "reference",
      })) ?? []),
      ...claims,
    ],
    contradictions: [
      ...(basePack?.body.contradictions ?? []),
      ...proposal.contradictions.map((c) => ({
        id: libraryId(
          `${job.assistance!.executionProfile.id}:conflict:${c.key}`,
        ),
        claimIds: c.candidateKeys.map(claimId),
        status: "unresolved",
        resolution: null,
      })),
    ],
    unknowns: [...(basePack?.body.unknowns ?? []), ...unknowns],
    coverage,
    compilerJobVersionId: null,
    approval: null,
  });
  for (const claim of pack.claims)
    for (const e of claim.evidence)
      verifyTextEvidence(
        e,
        input.sources.find((s) => s.versionId === e.sourceVersionId)!,
      );
  ensure(Buffer.byteLength(canonical(pack), "utf8") <= 800_000);
  const cursor = extraction.passages.length;
  return {
    proposal,
    pack,
    checkpoints: [
      { pass: "extracting", cursor, digest: sha256(canonical(prepared.data)) },
      {
        pass: "indexing",
        cursor,
        digest: sha256(
          canonical({ entities: pack.entities, claims: pack.claims }),
        ),
      },
      {
        pass: "auditing",
        cursor,
        digest: sha256(
          canonical({
            coverage,
            contradictions: pack.contradictions,
            unknowns: pack.unknowns,
          }),
        ),
      },
    ],
  };
}
