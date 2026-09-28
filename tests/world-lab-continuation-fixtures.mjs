import { compositionFixture } from "./d2a-composition-fixtures.mjs";
import { labUiFixture, uiId } from "./d1-ui-fixtures.mjs";
import { authoringUiFixture } from "./d2a-ui-fixtures.mjs";
import {
  buildCompositionBasis,
  requestCompositionPlan,
} from "../src/lib/world-lab/composition.ts";
import {
  canonicalLabJson,
  prepareLabInput,
} from "../src/lib/world-lab/inputs.ts";
import { sha256 } from "../src/lib/world-library/parsers.ts";
import { randomUUID } from "node:crypto";

export function checkpointFixture() {
  const f = compositionFixture(),
    original = prepareLabInput(f.request, f.authority);
  const sourceRunId = randomUUID(),
    sourceTimelineId = randomUUID(),
    checkpointId = randomUUID();
  Object.assign(f.state.manifest, {
    id: checkpointId,
    timelineId: sourceTimelineId,
    schemaVersion: 3,
    runId: sourceRunId,
  });
  f.state.run = {
    id: sourceRunId,
    ownerId: f.state.ownerId,
    campaignId: f.state.campaignId,
    timelineId: sourceTimelineId,
    label: "Source NON-CANON experiment",
    input: original.input,
    inputDigest: original.inputDigest,
    status: "running",
    reason: null,
    revision: 3,
    leaseGeneration: 1,
    headRevision: 0,
    headManifestId: checkpointId,
    lastCheckpointId: checkpointId,
    currentWorldMinutes: 60,
  };
  const continuation = {
    sourceRunId,
    sourceCheckpointId: checkpointId,
    sourceRunRevision: 3,
    sourceInputDigest: original.inputDigest,
  };
  const envelope = f.base();
  envelope.continuation = continuation;
  envelope.basisDigest = sha256(
    canonicalLabJson({
      ownerId: f.state.ownerId,
      campaignId: f.state.campaignId,
      saveId: envelope.base.saveId,
      manifestId: checkpointId,
      canonGeneration: f.state.canonGeneration,
      sourceHeads: envelope.sourceHeads,
      documents: envelope.documents,
      continuation,
    }),
  );
  const prepared = buildCompositionBasis(envelope);
  const requested = requestCompositionPlan({
    ...prepared,
    operationId: randomUUID(),
    premise: "What if Mara changed her plan at this recorded moment?",
    language: "en",
    composeProfile: f.requested.composition.composeProfile,
    simulationProfile: f.requested.composition.simulationProfile,
  });
  return { ...f, envelope, continuation, prepared, requested };
}
export function continuationUiFixture(language = "en", options = {}) {
  const campaign = labUiFixture(language),
    sourceRun = campaign.runs[0],
    selected = sourceRun.checkpoints[1];
  const source = {
    sourceRunId: sourceRun.id,
    sourceCheckpointId: selected.id,
    expectedRevision: sourceRun.revision,
  };
  const inspection = {
    campaignId: campaign.campaignId,
    nonCanon: true,
    source: {
      runId: sourceRun.id,
      timelineId: sourceRun.timelineId,
      label: sourceRun.label,
      revision: sourceRun.revision,
      status: sourceRun.status,
    },
    checkpoint: selected,
    eligible: true,
  };
  const authoring = authoringUiFixture(language, options),
    draft = structuredClone(authoring.draft);
  draft.base = {
    ...draft.base,
    timelineId: sourceRun.timelineId,
    label: sourceRun.label,
    worldMinutes: selected.worldMinutes,
  };
  draft.proposal.startWorldMinutes = selected.worldMinutes;
  draft.proposal.selectedModel.reasoning = "high";
  const catalog = {
    campaignId: campaign.campaignId,
    source,
    models: authoring.authoring.models,
    drafts: options.empty ? [] : [draft],
  };
  const child = {
    ...structuredClone(sourceRun),
    id: uiId(301),
    timelineId: uiId(302),
    continuation: {
      sourceRunId: source.sourceRunId,
      sourceCheckpointId: source.sourceCheckpointId,
    },
    label: draft.proposal.review?.title ?? "Child experiment",
    status: "prepared",
    revision: 1,
    startWorldMinutes: selected.worldMinutes,
    currentWorldMinutes: selected.worldMinutes,
    throughWorldMinutes: selected.worldMinutes + 180,
    base: structuredClone(draft.base),
    scenario: { ...sourceRun.scenario, scenarioVersionId: draft.versionId },
    checkpoints: [
      {
        id: uiId(303),
        ordinal: 0,
        worldMinutes: selected.worldMinutes,
        summary: "Checkpoint recorded.",
        events: [],
      },
    ],
    execution: {
      modelId: "gpt-6-astra",
      reasoning: "high",
      recordedResponses: 0,
      inputTokens: null,
      outputTokens: null,
    },
  };
  return { campaign, source, inspection, catalog, draft, child };
}
