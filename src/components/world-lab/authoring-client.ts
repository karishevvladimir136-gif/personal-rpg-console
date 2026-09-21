// Public field/response boundary. Authority is resolved again by the server.
import type { LabCatalog } from "../../lib/world-lab/contracts.ts";
import type {
  LabAuthoringCatalog,
  LabAuthoringRequest,
  LabAuthoringResult,
  LabCompositionItem,
  LabModelSelection,
} from "../../lib/world-lab/authoring-contracts.ts";
import type {
  CompositionReview,
  PublicComposition,
} from "../../lib/world-lab/composition-public.ts";
import {
  parseCompositionPolicy,
  parseCompositionReview,
} from "../../lib/world-lab/composition-validation.ts";
import {
  LabClientError,
  array,
  base,
  number,
  readPublicLabRun,
  requireValue,
  responseJson,
  row,
  text,
  unique,
  uuid,
} from "./client.ts";

function choice<T extends string>(value: unknown, values: readonly T[]): T {
  requireValue(typeof value === "string" && values.includes(value as T));
  return value as T;
}
const indexes = (value: unknown, max = 63) =>
  unique(
    array(value, (v) => number(v, 0, max), 64),
    String,
  );
function model(value: unknown): LabModelSelection {
  const m = row(value, ["providerId", "modelId", "reasoning"]);
  requireValue(m.providerId === "openai");
  return {
    providerId: "openai",
    modelId: text(m.modelId, 120),
    reasoning: m.reasoning === null ? null : text(m.reasoning, 40),
  };
}
export function readPublicComposition(value: unknown): PublicComposition {
  const r = row(value, [
    "phase",
    "premise",
    "language",
    "startWorldMinutes",
    "review",
    "ambiguities",
    "statements",
    "choices",
    "selectedModel",
    "ownerEdited",
    "blockers",
    "usage",
  ]);
  const c = row(r.choices, ["actors", "locations", "threads", "policy"]),
    selected = row(r.selectedModel, ["modelId", "reasoning"]);
  const choices: PublicComposition["choices"] = {
    actors: array(
      c.actors,
      (value) => {
        const a = row(value, ["label", "control"]);
        return {
          label: text(a.label, 240),
          control: choice(a.control, ["player", "autonomous"] as const),
        };
      },
      64,
    ),
    locations: array(
      c.locations,
      (value) => {
        const l = row(value, ["label"]);
        return { label: text(l.label, 240) };
      },
      64,
    ),
    threads: array(
      c.threads,
      (value) => {
        const t = row(value, ["label", "actorIndexes", "locationIndexes"]);
        return {
          label: text(t.label, 240),
          actorIndexes: indexes(t.actorIndexes),
          locationIndexes: indexes(t.locationIndexes),
        };
      },
      64,
    ),
    policy: parseCompositionPolicy(c.policy),
  };
  requireValue(
    choices.threads.every(
      (t) =>
        t.actorIndexes.every((i) => i < choices.actors.length) &&
        t.locationIndexes.every((i) => i < choices.locations.length),
    ),
  );
  const review = r.review === null ? null : parseCompositionReview(r.review);
  const ambiguities = array(
    r.ambiguities,
    (value) => {
      const a = row(value, ["question", "consequential"]);
      requireValue(typeof a.consequential === "boolean");
      return {
        question: text(a.question, 500),
        consequential: a.consequential,
      };
    },
    12,
  );
  if (review) {
    requireValue(
      review.ambiguityAnswers.length === ambiguities.length &&
        review.affectedActorIndexes.every((i) => i < choices.actors.length) &&
        review.affectedThreadIndexes.every((i) => i < choices.threads.length) &&
        (review.locationIndex === null ||
          review.locationIndex < choices.locations.length),
    );
  }
  const phase = choice(r.phase, ["requested", "review", "approved"] as const);
  requireValue((phase === "requested") === (review === null));
  requireValue(typeof r.ownerEdited === "boolean");
  const result: PublicComposition = {
    phase,
    premise: text(r.premise, 6000),
    language: choice(r.language, ["en", "ru"] as const),
    startWorldMinutes: number(r.startWorldMinutes),
    review,
    ambiguities,
    choices,
    statements: array(
      r.statements,
      (value) => {
        const s = row(value, [
          "text",
          "origin",
          "knowledge",
          "evidenceIndexes",
          "actorIndexes",
          "uncertainty",
        ]);
        const actors = indexes(s.actorIndexes);
        requireValue(actors.every((i) => i < choices.actors.length));
        return {
          text: text(s.text, 2000),
          origin: choice(s.origin, [
            "source_fact",
            "source_inference",
            "owner_assumption",
          ] as const),
          knowledge: choice(s.knowledge, [
            "source",
            "canon_at_entry",
            "character",
            "future_source",
            "owner_assumption",
          ] as const),
          evidenceIndexes: indexes(s.evidenceIndexes, 95),
          actorIndexes: actors,
          uncertainty: s.uncertainty === null ? null : text(s.uncertainty, 500),
        };
      },
      32,
    ),
    selectedModel: {
      modelId: text(selected.modelId, 120),
      reasoning:
        selected.reasoning === null ? null : text(selected.reasoning, 40),
    },
    ownerEdited: r.ownerEdited,
    blockers: unique(
      array(
        r.blockers,
        (v) =>
          choice(v, [
            "interpretation_required",
            "ambiguity_unresolved",
            "scope_required",
            "timing_outside_horizon",
            "timing_unresolved",
            "timing_review_required",
            "player_agency",
            "unsupported_divergence",
            "unsupported_policy",
          ] as const),
        9,
      ),
      String,
    ),
    usage:
      r.usage === null
        ? null
        : (() => {
            const u = row(r.usage, [
              "model",
              "inputTokens",
              "outputTokens",
              "calls",
              "latencyMs",
            ]);
            return {
              model: text(u.model, 120),
              inputTokens: number(u.inputTokens),
              outputTokens: number(u.outputTokens),
              calls: number(u.calls, 1),
              latencyMs: number(u.latencyMs),
            };
          })(),
  };
  requireValue(phase !== "approved" || result.blockers.length === 0);
  return result;
}
export function readCompositionItem(value: unknown): LabCompositionItem {
  const r = row(value, ["id", "versionId", "version", "base", "proposal"]);
  const result = {
    id: uuid(r.id),
    versionId: uuid(r.versionId),
    version: number(r.version, 1),
    base: base(r.base),
    proposal: readPublicComposition(r.proposal),
  };
  requireValue(result.base.worldMinutes === result.proposal.startWorldMinutes);
  return result;
}
export function readAuthoringCatalog(value: unknown): LabAuthoringCatalog {
  const r = row(value, ["models", "drafts"]);
  return {
    models: unique(
      array(
        r.models,
        (value) => {
          const m = row(value, ["modelId", "label", "reasoning", "available"]);
          requireValue(typeof m.available === "boolean");
          const reasoning = unique(
            array(m.reasoning, (v) => text(v, 40), 10),
            String,
          );
          requireValue(reasoning.length > 0);
          return {
            modelId: text(m.modelId, 120),
            label: text(m.label, 160),
            reasoning,
            available: m.available,
          };
        },
        20,
      ),
      (m) => m.modelId,
    ),
    drafts: unique(array(r.drafts, readCompositionItem), (d) => d.versionId),
  };
}
export function readAuthoringResult(
  value: unknown,
  campaignId: string,
): LabAuthoringResult {
  const r = row(value, ["draft", "run"]);
  const draft = readCompositionItem(r.draft),
    run = r.run === null ? null : readPublicLabRun(r.run, campaignId);
  requireValue(
    run === null ||
      (run.base.saveId === draft.base.saveId &&
        run.scenario.scenarioVersionId === draft.versionId &&
        draft.proposal.phase === "approved"),
  );
  return { draft, run };
}
/** A successful HTTP response still has to correspond to the exact pending
 * action. Mismatched/partial replies preserve that action for receipt replay. */
export function readAuthoringReply(
  value: unknown,
  attempt: LabAuthoringRequest,
  catalog?: LabAuthoringCatalog | null,
): LabAuthoringResult {
  try {
    const result = readAuthoringResult(value, attempt.input.campaignId);
    if (attempt.action === "interpret")
      requireValue(
        result.draft.base.saveId === attempt.input.saveId &&
          result.draft.proposal.premise === attempt.input.premise,
      );
    else {
      const previous = catalog?.drafts.find(
        (d) => d.versionId === attempt.input.versionId,
      );
      if (previous)
        requireValue(
          previous.id === result.draft.id &&
            previous.version <= result.draft.version,
        );
    }
    requireValue(
      attempt.action === "approve"
        ? result.run !== null && result.draft.proposal.phase === "approved"
        : result.run === null,
    );
    return result;
  } catch {
    throw new LabClientError("uncertain");
  }
}
export function readAuthoringAttempt(
  value: unknown,
  campaignId: string,
): LabAuthoringRequest {
  const r = row(value, ["action", "input"]),
    action = choice(r.action, [
      "interpret",
      "edit",
      "approve",
      "retry_interpret",
    ] as const);
  const fields =
    action === "interpret"
      ? ["saveId", "premise", "model"]
      : action === "edit"
        ? ["versionId", "review", "model"]
        : ["versionId"];
  const input = row(r.input, ["operationId", "campaignId", ...fields]);
  requireValue(uuid(input.campaignId) === uuid(campaignId));
  const command = { operationId: uuid(input.operationId), campaignId };
  if (action === "interpret")
    return {
      action,
      input: {
        ...command,
        saveId: uuid(input.saveId),
        premise: text(input.premise, 6000),
        model: model(input.model),
      },
    };
  if (action === "edit")
    return {
      action,
      input: {
        ...command,
        versionId: uuid(input.versionId),
        review: parseCompositionReview(input.review),
        model: model(input.model),
      },
    };
  return { action, input: { ...command, versionId: uuid(input.versionId) } };
}
export function assertOfferedModel(
  selection: LabModelSelection,
  catalog: LabAuthoringCatalog,
) {
  const offered = catalog.models.find((m) => m.modelId === selection.modelId);
  requireValue(
    selection.providerId === "openai" &&
      offered?.available &&
      selection.reasoning !== null &&
      offered.reasoning.includes(selection.reasoning),
  );
}
export function interpretAttempt(
  campaign: LabCatalog,
  catalog: LabAuthoringCatalog,
  input: { saveId: string; premise: string; model: LabModelSelection },
  allocate = () => crypto.randomUUID(),
): LabAuthoringRequest {
  row(input, ["saveId", "premise", "model"]);
  requireValue(campaign.bases.some((b) => b.saveId === input.saveId));
  assertOfferedModel(input.model, catalog);
  return readAuthoringAttempt(
    {
      action: "interpret",
      input: {
        ...input,
        campaignId: campaign.campaignId,
        operationId: allocate(),
      },
    },
    campaign.campaignId,
  );
}
export function editAttempt(
  campaignId: string,
  catalog: LabAuthoringCatalog,
  draft: LabCompositionItem,
  review: CompositionReview,
  selection: LabModelSelection,
  allocate = () => crypto.randomUUID(),
): LabAuthoringRequest {
  requireValue(
    catalog.drafts.some((d) => d.versionId === draft.versionId) &&
      draft.proposal.review !== null,
  );
  assertOfferedModel(selection, catalog);
  const parsed = parseCompositionReview(review),
    choices = draft.proposal.choices;
  requireValue(
    parsed.affectedActorIndexes.every((i) => i < choices.actors.length) &&
      parsed.affectedThreadIndexes.every((i) => i < choices.threads.length) &&
      (parsed.locationIndex === null ||
        parsed.locationIndex < choices.locations.length) &&
      parsed.ambiguityAnswers.length === draft.proposal.ambiguities.length,
  );
  return readAuthoringAttempt(
    {
      action: "edit",
      input: {
        campaignId,
        operationId: allocate(),
        versionId: draft.versionId,
        review: parsed,
        model: selection,
      },
    },
    campaignId,
  );
}
export function compositionAttempt(
  action: "approve" | "retry_interpret",
  campaignId: string,
  catalog: LabAuthoringCatalog,
  draft: LabCompositionItem,
  allocate = () => crypto.randomUUID(),
): LabAuthoringRequest {
  requireValue(catalog.drafts.some((d) => d.versionId === draft.versionId));
  requireValue(
    action === "approve"
      ? draft.proposal.phase === "review" &&
          draft.proposal.blockers.length === 0
      : draft.proposal.phase === "requested",
  );
  return readAuthoringAttempt(
    {
      action,
      input: {
        campaignId,
        operationId: allocate(),
        versionId: draft.versionId,
      },
    },
    campaignId,
  );
}
export function mergeComposition(
  catalog: LabAuthoringCatalog,
  draft: LabCompositionItem,
): LabAuthoringCatalog {
  const previous = catalog.drafts.find((d) => d.id === draft.id);
  if (previous && previous.version > draft.version) return catalog;
  return {
    ...catalog,
    drafts: [draft, ...catalog.drafts.filter((d) => d.id !== draft.id)],
  };
}
export const pendingAuthoringKey = (campaignId: string) =>
  `world-lab-composition-pending:${uuid(campaignId)}`;
export function restoreAuthoringAttempt(
  value: string | null,
  campaignId: string,
): LabAuthoringRequest | null {
  if (value === null || value.length > 70_000) return null;
  try {
    return readAuthoringAttempt(JSON.parse(value), campaignId);
  } catch {
    return null;
  }
}
const url = "/api/world-lab/composition";
export type AuthoringTransport = {
  load: (
    campaignId: string,
    signal?: AbortSignal,
  ) => Promise<LabAuthoringCatalog>;
  send: (request: LabAuthoringRequest) => Promise<LabAuthoringResult>;
};
export function createAuthoringTransport(
  language: "en" | "ru",
  fetcher: typeof fetch = fetch,
): AuthoringTransport {
  return {
    async load(campaignId, signal) {
      uuid(campaignId);
      try {
        return readAuthoringCatalog(
          await responseJson(
            await fetcher(
              `${url}?campaignId=${encodeURIComponent(campaignId)}`,
              {
                signal,
                cache: "no-store",
                credentials: "same-origin",
                headers: { "Accept-Language": language },
              },
            ),
            false,
          ),
        );
      } catch (error) {
        if (
          error instanceof LabClientError ||
          (error instanceof Error && error.name === "AbortError")
        )
          throw error;
        throw new LabClientError("unavailable");
      }
    },
    async send(request) {
      const attempt = readAuthoringAttempt(request, request.input.campaignId);
      try {
        const raw = await responseJson(
          await fetcher(url, {
            method: "POST",
            credentials: "same-origin",
            headers: {
              "Content-Type": "application/json",
              "Accept-Language": language,
            },
            body: JSON.stringify(attempt),
          }),
          true,
        );
        try {
          return readAuthoringResult(raw, attempt.input.campaignId);
        } catch {
          throw new LabClientError("uncertain");
        }
      } catch (error) {
        if (error instanceof LabClientError) throw error;
        throw new LabClientError("uncertain");
      }
    },
  };
}
