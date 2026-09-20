import type { PublicTurn, ResumeInput, TurnInput } from "./contracts.ts";
import type {
  MechanicsResolution,
  RuntimeSource,
  TurnClaim,
  TurnDependencies,
} from "./server-contracts.ts";
import { isDisplayedCheck, recordServerRoll } from "./dice.ts";
import { parsePlan } from "./dm-schema.ts";
import {
  checkModifier,
  mechanicPlan,
  resolveMechanics,
  validatePlan,
} from "./mechanics/resolve.ts";
import {
  clarificationMessages,
  mechanicalNarration,
} from "./mechanics/messages.ts";
import { requireRule, safeTurnFailure, TurnError } from "./turn-errors.ts";
import { requireClaimTimeline, requireTurnTimeline } from "./timeline.ts";

/** Safe text is trusted application copy, never the private-inclusive planner's clarification. */
export const clarificationNarration = clarificationMessages.en;

const emptyResolution = (source: RuntimeSource): MechanicsResolution => ({
  changes: [],
  worldMinutes: source.runtime.worldMinutes,
  configuration: source.runtime.configuration,
  outcomes: [],
});

function publicSource(source: RuntimeSource): RuntimeSource {
  return {
    ...source,
    privateState: {},
    memory: source.memory
      ? {
          ...source.memory,
          privateHistorical: [],
          privateSummary: null,
          exactEvents: source.memory.exactEvents.filter(
            (row) => row.ref.visibility === "public",
          ),
        }
      : undefined,
    checkpoint: source.checkpoint
      ? { ...source.checkpoint, privateText: null }
      : null,
  };
}

function validateMode(source: RuntimeSource, input: TurnInput) {
  requireRule(
    input.campaignId === source.snapshot.campaign.id &&
      input.campaignId === source.runtime.campaignId,
  );
  requireRule(source.runtime.revision === input.expectedRevision);
  const currentSession = source.snapshot.sessions.find(
    (row) =>
      row.id === source.snapshot.publicState.current_session_id &&
      row.campaign_id === input.campaignId &&
      row.status === "open",
  );
  if (input.mode !== "feedback") requireRule(currentSession);
  requireRule(input.input.trim().length > 0 && input.input.length <= 20000);
  requireRule(
    input.mode === "mechanic"
      ? input.mechanic !== null
      : input.mechanic === null,
  );
  requireRule(
    new Set(input.listenerIds).size === input.listenerIds.length &&
      input.listenerIds.length <= 20,
  );
  if (input.mode === "companion") {
    const companion = source.snapshot.entities.find(
      (row) =>
        row.id === input.companionId &&
        row.campaign_id === input.campaignId &&
        row.kind === "companion",
    );
    requireRule(
      companion &&
        source.runtime.configuration?.presentEntityIds.includes(companion.id),
    );
    requireRule(
      !companion.conditions.some((condition) =>
        ["dead", "withdrawn"].includes(condition),
      ),
    );
    requireRule(
      input.listenerIds.every((id) =>
        source.runtime.configuration?.presentEntityIds.includes(id),
      ),
    );
  } else
    requireRule(input.companionId === null && input.listenerIds.length === 0);
}

async function execute(
  claim: TurnClaim,
  dependencies: TurnDependencies,
  command: ResumeInput | null,
): Promise<PublicTurn> {
  const { store, provider } = dependencies;
  const { source, lease } = claim;
  const input = claim.turn.input;
  const checkpoint = structuredClone(claim.turn.checkpoint);
  try {
    validateMode(source, input);
    await dependencies.validateFoundation?.(claim);
    if (input.mode === "feedback" || input.mode === "ooc") {
      requireRule(
        command?.action !== "reroll" && command?.action !== "continue",
      );
      if (!checkpoint.feedback) {
        const response = await provider.feedback(publicSource(source), input);
        checkpoint.feedback = response.output;
        checkpoint.usage.push(response.usage);
        await store.checkpoint(lease, checkpoint, "generating");
      }
      requireRule(
        typeof checkpoint.feedback.narration === "string" &&
          checkpoint.feedback.narration.length > 0 &&
          checkpoint.feedback.narration.length <= 20000,
      );
      return await store.commit(lease, {
        narration: checkpoint.feedback.narration,
        visualDescription: "",
        resolution: emptyResolution(source),
        privatePatches: [],
        checks: [],
        guidanceProposal:
          input.mode === "feedback"
            ? checkpoint.feedback.guidanceProposal
            : null,
      });
    }
    const newPlan = !checkpoint.plan;
    if (newPlan) {
      if (input.mode === "mechanic")
        checkpoint.plan = mechanicPlan(source, input);
      else {
        const response = await provider.plan(source, input);
        checkpoint.plan = response.output;
        checkpoint.usage.push(response.usage);
      }
    }
    // One strict transport schema for provider output, explicit mechanics and
    // recovered checkpoints; mechanics then validates against current authority.
    checkpoint.plan = parsePlan(checkpoint.plan);
    validatePlan(source, input, checkpoint.plan);
    requireRule(checkpoint.plan.guidanceProposal === null);
    if (newPlan) await store.checkpoint(lease, checkpoint, "generating");
    if (checkpoint.plan.clarification !== null) {
      return await store.commit(lease, {
        narration:
          clarificationMessages[source.snapshot.settings.values.language],
        visualDescription: "",
        resolution: emptyResolution(source),
        privatePatches: [],
        checks: [],
        guidanceProposal: null,
      });
    }
    if (!checkpoint.checks.length && checkpoint.plan.checks.length) {
      const rolls = checkpoint.plan.checks.map((check) =>
        recordServerRoll(
          input.operationId,
          check,
          checkModifier(source, check),
        ),
      );
      checkpoint.checks = await store.recordChecks(lease, rolls);
    }
    const displayed = checkpoint.checks.filter((check) =>
      isDisplayedCheck(source, check),
    );
    if (command?.action === "reroll") {
      const check = displayed.find((check) => check.id === command.checkId);
      requireRule(
        check &&
          source.snapshot.settings.values.difficulty.rerolls !== "disabled",
      );
      const replacement = recordServerRoll(
        input.operationId,
        check,
        check.modifier,
        check.rollNumber + 1,
      );
      checkpoint.checks = await store.reroll(lease, command, replacement);
      checkpoint.resolution = null;
      checkpoint.narration = null;
      await store.checkpoint(lease, checkpoint, "awaiting_confirmation");
      return await store.getPublic(input.campaignId, input.operationId);
    }
    if (command?.action === "continue")
      requireRule(displayed.length > 0 && command.checkId === null);
    // Even non-interactive displayed results can be explicitly rerolled before commitment.
    const canPause =
      displayed.length > 0 &&
      (source.snapshot.settings.values.interactiveDice ||
        source.snapshot.settings.values.difficulty.rerolls !== "disabled");
    if (canPause && command?.action !== "continue" && !checkpoint.resolution) {
      await store.checkpoint(lease, checkpoint, "awaiting_confirmation");
      return await store.getPublic(input.campaignId, input.operationId);
    }
    if (!checkpoint.resolution) {
      checkpoint.resolution = resolveMechanics(
        source,
        input,
        checkpoint.plan,
        checkpoint.checks,
      );
      await store.checkpoint(lease, checkpoint, "generating");
    }
    if (dependencies.prepareWorld) {
      const prepared = await dependencies.prepareWorld(
        claim,
        checkpoint.resolution,
        checkpoint.worldSettlement ?? null,
      );
      if (prepared) {
        checkpoint.worldSettlement = prepared.settlement;
        checkpoint.resolution = prepared.resolution;
        await store.checkpoint(lease, checkpoint, "generating");
      }
    }
    if (!checkpoint.narration) {
      if (input.mode === "mechanic")
        checkpoint.narration = {
          narration: mechanicalNarration(
            checkpoint.resolution,
            source.snapshot.settings.values.language,
          ),
          visualDescription: "",
          clarification: null,
        };
      else {
        const response = await provider.narrate(
          publicSource(source),
          input,
          checkpoint.resolution,
          checkpoint.checks,
        );
        checkpoint.narration = response.output;
        checkpoint.usage.push(response.usage);
      }
      requireRule(
        typeof checkpoint.narration.narration === "string" &&
          checkpoint.narration.narration.length > 0 &&
          checkpoint.narration.narration.length <= 20000,
      );
      await store.checkpoint(lease, checkpoint, "generating");
    }
    return await store.commit(lease, {
      ...(checkpoint.worldSettlement
        ? { worldSettlement: checkpoint.worldSettlement }
        : {}),
      narration: checkpoint.narration.narration,
      visualDescription: checkpoint.narration.visualDescription,
      resolution: checkpoint.resolution,
      privatePatches: checkpoint.plan.privatePatches,
      checks: checkpoint.checks,
      guidanceProposal: null,
    });
  } catch (error) {
    const safe = safeTurnFailure(error);
    if (command?.action === "reroll" && safe.code === "validation") {
      // A forged/stale/disallowed reroll never discards the already-recorded check.
      await store.checkpoint(lease, checkpoint, "awaiting_confirmation");
      return await store.getPublic(input.campaignId, input.operationId);
    }
    try {
      return await store.fail(lease, safe.code, safe.retryable);
    } catch {
      throw new TurnError(safe.code, safe.retryable);
    }
  }
}

export async function runTurn(
  input: TurnInput,
  dependencies: TurnDependencies,
): Promise<PublicTurn> {
  const current = requireTurnTimeline(
    await dependencies.store.begin(input),
    input.campaignId,
    input.operationId,
    input.timeline,
  );
  if (
    ["committed", "cancelled", "awaiting_confirmation"].includes(
      current.status,
    ) ||
    (current.status === "failed" && !current.canRetry)
  )
    return current;
  const claim = await dependencies.store.claim(
    input.campaignId,
    input.operationId,
  );
  if (claim)
    requireClaimTimeline(
      claim,
      input.campaignId,
      input.operationId,
      input.timeline,
    );
  const result = await (claim
    ? execute(claim, dependencies, null)
    : dependencies.store.getPublic(input.campaignId, input.operationId));
  return requireTurnTimeline(
    result,
    input.campaignId,
    input.operationId,
    input.timeline,
  );
}

export async function resumeTurn(
  command: ResumeInput,
  dependencies: TurnDependencies,
): Promise<PublicTurn> {
  const current = requireTurnTimeline(
    await dependencies.store.getPublic(command.campaignId, command.operationId),
    command.campaignId,
    command.operationId,
    command.timeline,
  );
  if (["committed", "cancelled"].includes(current.status)) return current;
  if (command.action === "cancel")
    return requireTurnTimeline(
      await dependencies.store.cancel(command),
      command.campaignId,
      command.operationId,
      command.timeline,
    );
  if (command.action === "retry") {
    if (current.status === "awaiting_confirmation") return current;
    requireRule(current.status !== "failed" || current.canRetry);
  } else requireRule(current.status === "awaiting_confirmation");
  const claim = await dependencies.store.claim(
    command.campaignId,
    command.operationId,
  );
  if (claim)
    requireClaimTimeline(
      claim,
      command.campaignId,
      command.operationId,
      command.timeline,
    );
  const result = await (claim
    ? execute(claim, dependencies, command)
    : dependencies.store.getPublic(command.campaignId, command.operationId));
  return requireTurnTimeline(
    result,
    command.campaignId,
    command.operationId,
    command.timeline,
  );
}
