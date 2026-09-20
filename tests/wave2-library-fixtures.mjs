import { createOwnerLibraryAuthoring } from "../src/lib/world-library/authoring.ts";
import { fixture, owner, id } from "./wave1-library-fixtures.mjs";
export { owner, id };
export const sourceInput = (extra = {}) => ({
  action: "source.save",
  operationId: id(),
  sourceId: null,
  expectedVersionId: null,
  title: "Synthetic harbor",
  format: "md",
  text: "person: Mara\r\nlocation: Harbor\r\nalias: Captain\r\n",
  author: "Synthetic author",
  visibility: "private",
  knowledge: "source",
  ...extra,
});
export function authoringFixture() {
  const f = fixture();
  return { ...f, service: createOwnerLibraryAuthoring(owner, f.store) };
}
export async function createDraft(f, inputs = [sourceInput()], maxUnits = 180) {
  const sources = [];
  for (const input of inputs) sources.push(await f.service.execute(input));
  const initial = await f.service.execute({
    action: "compiler.start",
    operationId: id(),
    sourcePriority: sources.map((s) => s.versionId),
    maxUnits,
  });
  let job = initial;
  for (let step = 0; step < 4; step++)
    job = await f.service.execute({
      action: "compiler.step",
      operationId: id(),
      expectedVersionId: job.versionId,
    });
  const pack = (await f.service.read()).packs[0];
  return { sources, job, initial, pack: await f.service.pack(pack.versionId) };
}
export function packSave(detail, extra = {}) {
  return {
    action: "pack.save",
    operationId: id(),
    expectedVersionId: detail.versionId,
    title: detail.title,
    claims: detail.body.claims.map(
      ({
        id,
        text,
        origin,
        epistemic,
        visibility,
        knowledge,
        validFrom,
        validUntil,
        knownByEntityIds,
        uncertainty,
      }) => ({
        id,
        text,
        origin,
        epistemic,
        visibility,
        knowledge,
        validFrom,
        validUntil,
        knownByEntityIds,
        uncertainty,
      }),
    ),
    resolutions: detail.body.contradictions.map(({ id, resolution }) => ({
      id,
      resolution,
    })),
    ...extra,
  };
}
export function approveInput(detail, extra = {}) {
  return {
    action: "pack.approve",
    operationId: id(),
    expectedVersionId: detail.versionId,
    reviewedConflictIds: detail.body.contradictions.map((c) => c.id),
    reviewedUnknownIds: detail.body.unknowns.map((u) => u.id),
    acknowledgeCoverage: true,
    canonClaimIds: [],
    ...extra,
  };
}
