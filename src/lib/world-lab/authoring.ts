// Owner authoring over the existing immutable Library. No world mutation API.
import { isDeepStrictEqual } from "node:util";
import type { LabAuthoringCatalog, LabAuthoringRequest, LabAuthoringResult, LabCompositionItem } from "./authoring-contracts.ts";
import type { LabRpc } from "./server-contracts.ts";
import type { LibraryStore } from "../world-library/store.ts";
import type { TypedRecord, ScenarioBody, DivergenceBody } from "../world-library/types.ts";
import type { ExecutionProfile } from "../production/contracts.ts";
import type { ProviderResult } from "../gameplay/server-contracts.ts";
import type { CompositionMetadata, CompositionScenarioBody } from "./composition-contracts.ts";
import type { CompositionProposal } from "./composition-public.ts";
import type { createLabService } from "./service.ts";
import { buildCompositionBasis, requestCompositionPlan, recordCompositionPlan, editCompositionPlan, approveCompositionPlan, projectComposition } from "./composition.ts";
import type { CompositionBaseInput } from "./composition.ts";
import { parseCompositionReview } from "./composition-validation.ts";
import { readDetachedState } from "../saves/detached-reader.ts";
import { parseLabDocumentPins, parseLabSourceHeads } from "./inputs.ts";
import { libraryId } from "../world-library/local-compiler.ts";
import { parseLibraryRecord } from "../world-library/parsers.ts";
import { registryVersion, validateModelSelection, validateExecutionProfile } from "../model-runtime/registry.ts";
import { validateRuntimePolicy } from "../model-runtime/registry.ts";
import { ensure, FoundationValidationError, integer, literal, object, text, uuid } from "../foundation-loop/fields.ts";

export function parseLabAuthoringRequest(value: unknown): LabAuthoringRequest {
  const envelope = object(value, ["action", "input"]);
  const action = literal(envelope.action, ["interpret", "edit", "approve", "retry_interpret"] as const);
  const input = object(envelope.input, ["operationId", "campaignId", ...(action === "interpret" ? ["saveId", "premise", "model"] : action === "edit" ? ["versionId", "review", "model"] : ["versionId"])]);
  const command = { operationId: uuid(input.operationId), campaignId: uuid(input.campaignId) };
  if (action === "interpret") return { action, input: { ...command, saveId: uuid(input.saveId), premise: text(input.premise, 6000), model: {...validateModelSelection(input.model), providerId: "openai"} } };
  if (action === "edit") return { action, input: { ...command, versionId: uuid(input.versionId), review: parseCompositionReview(input.review), model: {...validateModelSelection(input.model), providerId: "openai"} } };
  return { action, input: { ...command, versionId: uuid(input.versionId) } };
}

export function createLabAuthoringService(options: {
  ownerId: string; execute: LabRpc; library: LibraryStore;
  lab: ReturnType<typeof createLabService>; language: "en" | "ru";
  models: LabAuthoringCatalog["models"];
  compose: (metadata: CompositionMetadata) => Promise<ProviderResult<CompositionProposal>>;
}) {
  const { ownerId, library, language } = options;
  uuid(ownerId);
  const id = (operationId: string, stage: string) => libraryId(`${ownerId}:d2a:${operationId}:${stage}`);
  async function basis(campaignId: string, saveId: string) {
    const response = await options.execute({ p_owner_id: ownerId, p_campaign_id: campaignId, p_action: "composition_base", p_payload: { saveId } });
    if (response.error) throw new FoundationValidationError(response.error.message?.includes("rpg_conflict") ? "conflict" : "unavailable");
    const envelope = object(response.data, ["state", "sourceHeads", "documents", "base", "basisDigest"]);
    const state = readDetachedState(envelope.state, { ownerId, campaignId, runId: null });
    const policy = state.records["rpg_private.world_foundations"][0].execution_policy;
    return { ...buildCompositionBasis({ state, sourceHeads: parseLabSourceHeads(envelope.sourceHeads), documents: parseLabDocumentPins(envelope.documents), base: envelope.base as CompositionBaseInput["base"], basisDigest: text(envelope.basisDigest, 64) }), policyRevision: policy ? validateRuntimePolicy(policy).revision : 0 };
  }
  function profile(model: Pick<ExecutionProfile, "providerId" | "modelId" | "reasoning">, operationId: string, task: "world.compose" | "world.resolve", revision: number): ExecutionProfile {
    const selected = validateModelSelection({providerId: model.providerId, modelId: model.modelId, reasoning: model.reasoning});
    ensure(options.models.some((m) => m.modelId === selected.modelId && m.available && m.reasoning.includes(selected.reasoning!)), "configuration");
    return validateExecutionProfile({ ...selected, schemaVersion: 1, id: id(operationId, task), policyRevision: revision, registryVersion, task }, task);
  }
  async function get(versionId: string, campaignId: string): Promise<TypedRecord<"scenario"> & { body: CompositionScenarioBody }> {
    const record = await library.get("scenario", versionId);
    ensure(record.body.composition?.basis.campaignId === campaignId && record.body.composition.basis.ownerId === ownerId, "scope");
    return record as TypedRecord<"scenario"> & { body: CompositionScenarioBody };
  }
  function project(record: TypedRecord<"scenario">): LabCompositionItem {
    const metadata = record.body.composition!;
    return { id: record.id, versionId: record.versionId, version: record.version,
      base: { saveId: metadata.basis.saveId, timelineId: metadata.basis.baseTimelineId, label: record.body.entry.label, worldMinutes: metadata.basis.startWorldMinutes },
      proposal: projectComposition(metadata) };
  }
  async function lookup(operationId: string, stage: string, campaignId: string) {
    const records = await library.read({ kind: "scenario", versionId: id(operationId, stage) });
    if (!records.length) return null;
    return get(records[0].versionId, campaignId);
  }
  async function saveScenario(body: ScenarioBody, operationId: string, stage: string, previous: TypedRecord<"scenario"> | null) {
    const record = parseLibraryRecord({ schemaVersion: 1, ownerId, kind: "scenario", id: previous?.id ?? id(operationId, "scenario"), versionId: id(operationId, stage), version: (previous?.version ?? 0) + 1, previousVersionId: previous?.versionId ?? null, body }, ownerId);
    ensure(record.kind === "scenario");
    return await library.put({ operationId: id(operationId, `${stage}:receipt`), record }) as TypedRecord<"scenario"> & { body: CompositionScenarioBody };
  }
  async function interpret(request: Extract<LabAuthoringRequest, { action: "interpret" }> | Extract<LabAuthoringRequest, { action: "approve" | "retry_interpret" }>) {
    const { campaignId, operationId } = request.input;
    let previous: (TypedRecord<"scenario"> & { body: CompositionScenarioBody }) | null = null;
    let requested = await lookup(operationId, "requested", campaignId);
    if (request.action === "retry_interpret") {
      previous = await get(request.input.versionId, campaignId);
      ensure(previous.body.composition.phase === "requested", "conflict");
    }
    if (!requested) {
      const selection = request.action === "interpret" ? request.input : null;
      const saveId = selection?.saveId ?? previous!.body.composition.basis.saveId;
      const current = await basis(campaignId, saveId);
      const model = selection?.model ?? previous!.body.composition.simulationProfile;
      // The selection is explicit and this authoring operation owns its revision.
      const revision = previous?.body.composition.simulationProfile.policyRevision ?? current.policyRevision;
      const composeProfile = profile(model, operationId, "world.compose", revision);
      ensure(composeProfile.task === "world.compose");
      const body = requestCompositionPlan({ ...current, operationId, premise: selection?.premise ?? previous!.body.composition.premise, language: previous?.body.composition.language ?? language, composeProfile: { ...composeProfile, task: "world.compose" }, simulationProfile: profile(model, operationId, "world.resolve", revision) });
      requested = await saveScenario(body, operationId, "requested", previous);
    } else if (request.action === "interpret") {
      ensure(requested.body.composition.premise === request.input.premise && requested.body.composition.basis.saveId === request.input.saveId && isDeepStrictEqual(validateModelSelection(request.input.model), validateModelSelection({ providerId: requested.body.composition.simulationProfile.providerId, modelId: requested.body.composition.simulationProfile.modelId, reasoning: requested.body.composition.simulationProfile.reasoning })), "conflict");
    } else ensure(requested.previousVersionId === previous!.versionId, "conflict");
    const recorded = await lookup(operationId, "interpreted", campaignId);
    if (recorded) { ensure(recorded.previousVersionId === requested.versionId, "conflict"); return recorded; }
    const fresh = await basis(campaignId, requested.body.composition.basis.saveId);
    ensure(isDeepStrictEqual(fresh.basis, requested.body.composition.basis), "conflict");
    // Saved first: neither transport failure nor process loss erases the premise.
    const response = await options.compose(structuredClone(requested.body.composition));
    return saveScenario(recordCompositionPlan(requested.body, response.output, response.usage), operationId, "interpreted", requested);
  }
  async function catalog(campaignId: string): Promise<LabAuthoringCatalog> {
    uuid(campaignId);
    const records = await library.read({ kind: "scenario" });
    const latest = new Map<string, TypedRecord<"scenario">>();
    for (const row of records) if (row.kind === "scenario" && row.body.composition?.basis.campaignId === campaignId && (!latest.has(row.id) || latest.get(row.id)!.version < row.version)) latest.set(row.id, row);
    const drafts: LabCompositionItem[] = [];
    for (const row of latest.values()) {
      try { const fresh = await basis(campaignId, row.body.composition!.basis.saveId); if (isDeepStrictEqual(fresh.basis, row.body.composition!.basis)) drafts.push(project(row)); } catch { /* stale/private source basis is never reprojected */ }
    }
    return { models: structuredClone(options.models), drafts };
  }
  async function perform(value: LabAuthoringRequest): Promise<LabAuthoringResult> {
    const request = parseLabAuthoringRequest(value);
    const { campaignId, operationId } = request.input;
    if (request.action === "interpret" || request.action === "retry_interpret") return { draft: project(await interpret(request)), run: null };
    const current = await get(request.input.versionId, campaignId);
    if (request.action === "edit") {
      const existing = await lookup(operationId, "edit", campaignId);
      const selected = validateModelSelection(request.input.model);
      const old = current.body.composition.simulationProfile;
      const modelChanged = !isDeepStrictEqual(selected, { providerId: old.providerId, modelId: old.modelId, reasoning: old.reasoning });
      const body = editCompositionPlan(current.body, { review: request.input.review, ownerId, fromVersionId: current.versionId, ...(modelChanged ? { simulationProfile: profile(selected, operationId, "world.resolve", old.policyRevision) } : {}) });
      if (existing) ensure(existing.previousVersionId === current.versionId && isDeepStrictEqual(existing.body, body), "conflict");
      return { draft: project(existing ?? await saveScenario(body, operationId, "edit", current)), run: null };
    }
    let approved = await lookup(operationId, "approved", campaignId);
    let divergence: DivergenceBody;
    if (!approved) {
      const fresh = await basis(campaignId, current.body.composition.basis.saveId);
      let ordinal = 0;
      const plan = approveCompositionPlan(current.body, { basis: fresh.basis, ownerId, scenarioVersionId: id(operationId, "approved"), allocateId: () => id(operationId, `assumption:${ordinal++}`) });
      approved = await saveScenario(plan.scenario, operationId, "approved", current);
      divergence = plan.divergence;
    } else {
      ensure(approved.previousVersionId === current.versionId && approved.body.composition.phase === "approved", "conflict");
      // Same deterministic identity as the first approval; source changes may
      // prevent preparation, but never substitute a new approval or basis.
      let ordinal = 0;
      divergence = approveCompositionPlan(current.body, { basis: approved.body.composition.basis, ownerId, scenarioVersionId: approved.versionId, allocateId: () => id(operationId, `assumption:${ordinal++}`) }).divergence;
    }
    const dv = parseLibraryRecord({ schemaVersion: 1, ownerId, kind: "divergence", id: id(operationId, "divergence"), versionId: id(operationId, "divergence:version"), version: 1, previousVersionId: null, body: divergence }, ownerId);
    await library.put({ operationId: id(operationId, "divergence:receipt"), record: dv });
    const run = await options.lab.perform({ action: "prepare", input: { operationId: id(operationId, "prepare"), campaignId, saveId: approved.body.composition.basis.saveId, scenarioVersionId: approved.versionId, divergenceVersionId: dv.versionId, label: approved.body.title.slice(0, 160), horizonMinutes: integer(approved.body.composition.review!.horizonMinutes, 1, 43_200) } });
    return { draft: project(approved), run };
  }
  return { catalog, perform };
}
