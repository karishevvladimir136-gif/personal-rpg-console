import type { PublicTurn, ResumeInput, TurnInput } from "./contracts.ts";
import type {
  MechanicsResolution,
  DmPlan,
  RuntimeSource,
  TurnClaim,
  TurnDependencies,
} from "./server-contracts.ts";
import { isDisplayedCheck, recordServerRoll } from "./dice.ts";
import { parsePlan } from "./dm-schema.ts";
import { validateTeachingCandidate } from "../dm-craft/teaching.ts";
import {
  checkModifier,
  mechanicPlan,
  resolveMechanics,
  validatePlan,
} from "./mechanics/resolve.ts";
import { naturalMechanicPlan } from "../rulesets/natural-mechanics.ts";
import { naturalCombatTurnPlan } from "../rulesets/natural-combat-turn.ts";
import { completeCombatExchange, emptyCombatExchange, exhaustedControlledTurn } from "./combat-exchange.ts";
import {
  clarificationMessages,
  mechanicalNarration,
} from "./mechanics/messages.ts";
import { requireRule, safeTurnFailure, TurnError } from "./turn-errors.ts";
import { requireClaimTimeline, requireTurnTimeline } from "./timeline.ts";
import { characterPacket } from "./character-model.ts";

/** Safe text is trusted application copy, never the private-inclusive planner's clarification. */
export const clarificationNarration = clarificationMessages.en;

const emptyResolution = (source: RuntimeSource): MechanicsResolution => ({
  changes: [],
  worldMinutes: source.runtime.worldMinutes,
  configuration: source.runtime.configuration,
  outcomes: [],
});

export function publicSource(source: RuntimeSource, input?: TurnInput): RuntimeSource {
  return {
    ...source,
    privateState: {},
    observableCharacters: input && input.mode !== "feedback" && input.mode !== "ooc"
      ? characterPacket(source, input, "narrate")
      : [],
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

/** Private DM-to-DM handoff. The plan is schema/authority validated before this
 * is called; its prose is bounded intent, never a state patch or public text. */
export function narrationSource(source: RuntimeSource, input: TurnInput, plan: DmPlan | null): RuntimeSource {
  const validatedPlan = plan ? parsePlan(plan) : null;
  if (validatedPlan) validatePlan(source, input, validatedPlan);
  const result = publicSource(source, input);
  return {
    ...result,
    narrationBridge: {
      planIntent: validatedPlan?.narration || null,
      characters: characterPacket(source, input, "plan"),
    },
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
        checkpoint.feedback = {
          ...response.output,
          teachingCandidate: validateTeachingCandidate(source, input, response.output.teachingCandidate),
        };
        checkpoint.usage.push(response.usage);
        await store.checkpoint(lease, checkpoint, "generating");
      }
      requireRule(
        typeof checkpoint.feedback.narration === "string" &&
          checkpoint.feedback.narration.length > 0 &&
          checkpoint.feedback.narration.length <= 20000,
      );
      const teachingCandidate = validateTeachingCandidate(source, input, checkpoint.feedback.teachingCandidate);
      // Fix S4 run 1 (items 3, 11b): the waiting cards an out-of-game answer withdraws, recorded before it commits
      // (a retry from the checkpoint records them again; the record is idempotent). Never fails the answer.
      if (input.mode === "ooc" && dependencies.withdrawChecks && checkpoint.feedback.withdrawChecks?.length)
        await dependencies.withdrawChecks(input, checkpoint.feedback.withdrawChecks).catch(() => {});
      const committed = await store.commit(lease, {
        narration: checkpoint.feedback.narration,
        visualDescription: "",
        resolution: emptyResolution(source),
        privatePatches: [],
        checks: [],
        guidanceProposal: input.mode === "feedback"
          ? checkpoint.feedback.guidanceProposal ?? teachingCandidate?.explanation ?? null
          : null,
        ...(input.mode === "feedback" ? { teachingCandidate } : {}),
      });
      // FIX_S4 item 1: a fact of the hero's story settled here becomes an owner-pinned fact (a retry pins nothing twice).
      // The pin moves the runtime revision, so it waits for the answer's own commit (before it, the answer failed with
      // «conflict»), and it is left out while a roll card waits (it would fail the waiting turn the same way; the
      // exchange still reaches the DM as a table note).
      if (input.mode === "ooc" && dependencies.pinTableFact && checkpoint.feedback.tableFact &&
        !source.runtime.turns.some((turn) => turn.status === "awaiting_confirmation"))
        await dependencies.pinTableFact(input, checkpoint.feedback.tableFact).catch(() => {});
      return committed;
    }
    const logic = await dependencies.prepareWorldLogic?.(
      claim,
      checkpoint.worldLogic ?? null,
    );
    if (logic) {
      source.worldLogicPresence = logic.presence;
      source.worldLogicMundaneDetail = logic.mundaneDetail;
    }
    if (logic && !logic.mechanicIntent && !logic.combatTurn) {
      requireRule(
        input.mode === "game" &&
          checkpoint.checks.length === 0 &&
          command?.action !== "reroll" &&
          command?.action !== "continue",
      );
      requireRule(logic.proposal);
      checkpoint.worldLogic = logic.proposal;
      if (logic.foundationAction !== undefined)
        checkpoint.foundationAction = logic.foundationAction;
      checkpoint.resolution = logic.resolution;
      if (logic.usage) checkpoint.usage.push(logic.usage);
      // A neutral legacy envelope lets old checkpoint/save readers retain their
      // exact shape without invoking the legacy mechanics interpreter.
      checkpoint.plan ??= {
        narration: "",
        checks: [],
        publicPatches: [],
        privatePatches: [],
        visualDescription: "",
        clarification: null,
        guidanceProposal: null,
      };
      await store.checkpoint(lease, checkpoint, "generating");
      requireRule(logic.resolution);
    } else {
      if (logic?.mechanicIntent) {
        requireRule(input.mode === "game" && !checkpoint.worldLogic);
        checkpoint.naturalMechanic = logic.mechanicIntent;
        if (dependencies.prepareCombatIntent)
          checkpoint.combatExchange ??= emptyCombatExchange();
        if (logic.usage) checkpoint.usage.push(logic.usage);
      }
      if (logic?.combatTurn) {
        requireRule(input.mode === "game" && !checkpoint.worldLogic && !checkpoint.naturalMechanic);
        checkpoint.naturalCombatTurn = logic.combatTurn;
        checkpoint.combatExchange ??= emptyCombatExchange(2);
        if (logic.usage) checkpoint.usage.push(logic.usage);
      }
      const newPlan = !checkpoint.plan;
      if (newPlan) {
        if (logic?.mechanicIntent) {
          if (checkpoint.combatExchange && exhaustedControlledTurn(source, logic.mechanicIntent.actorId)) {
            checkpoint.combatExchange.resumeOnly = true;
            checkpoint.plan = { narration: "The actor's Action was already spent. Do not narrate the newly requested attack as attempted or successful. The remaining turn passes, opponents act, then offer the next player choice.",
              checks: [], publicPatches: [], privatePatches: [], visualDescription: "",
              clarification: null, guidanceProposal: null };
          } else checkpoint.plan = naturalMechanicPlan(source, input, logic.mechanicIntent);
        }
        else if (logic?.combatTurn)
          checkpoint.plan = naturalCombatTurnPlan(source, input, logic.combatTurn);
        else if (input.mode === "mechanic")
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
      if (
        canPause &&
        command?.action !== "continue" &&
        !checkpoint.resolution &&
        !checkpoint.combatExchange?.playerConfirmed
      ) {
        await store.checkpoint(lease, checkpoint, "awaiting_confirmation");
        return await store.getPublic(input.campaignId, input.operationId);
      }
      if (checkpoint.combatExchange && command?.action === "continue" &&
          !checkpoint.combatExchange.playerConfirmed) {
        checkpoint.combatExchange.playerConfirmed = true;
        await store.checkpoint(lease, checkpoint, "generating");
      }
      if (!checkpoint.resolution) {
        checkpoint.resolution = checkpoint.combatExchange
          ? await completeCombatExchange(source, input, checkpoint, store, lease,
              dependencies.prepareCombatIntent)
          : resolveMechanics(source, input, checkpoint.plan, checkpoint.checks);
        await store.checkpoint(lease, checkpoint, "generating");
      }
    }
    requireRule(checkpoint.resolution);
    if (dependencies.prepareWorld) {
      const prepared = await dependencies.prepareWorld(
        { ...claim, turn: { ...claim.turn, checkpoint } },
        checkpoint.resolution,
        checkpoint.worldSettlement ?? null,
      );
      if (prepared) {
        checkpoint.worldSettlement = prepared.settlement;
        checkpoint.resolution = prepared.resolution;
        checkpoint.usage.push(...(prepared.usage ?? []));
        await store.checkpoint(lease, checkpoint, "generating");
      }
    }
    if (dependencies.prepareFoundation) {
      const prepared = await dependencies.prepareFoundation({
        ...claim,
        turn: { ...claim.turn, checkpoint },
      });
      if (prepared) {
        checkpoint.foundationSettlement = prepared;
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
        const narrating = narrationSource(source, input, checkpoint.plan);
        if (checkpoint.combatExchange?.npcIntents?.length && narrating.narrationBridge)
          narrating.narrationBridge.planIntent =
            `${narrating.narrationBridge.planIntent ?? ""}\nValidated autonomous intents: ${checkpoint.combatExchange.npcIntents.map((row) => `${row.actorId}: ${row.description}`).join("; ")}. Describe only actions and outcomes present in the validated resolution.`;
        const response = await provider.narrate(
          narrating,
          input,
          checkpoint.foundationSettlement
            ? {
                ...checkpoint.resolution,
                outcomes: [
                  ...checkpoint.resolution.outcomes.filter((row) => row.kind !== "world.logic.receipt"),
                  ...checkpoint.foundationSettlement.plan.events
                    .filter((e) => e.visibility === "public")
                    .map((e) => ({
                      kind: e.kind,
                      text: e.text,
                      entityIds: e.actorIds,
                      itemIds: [],
                    })),
                ],
              }
            : {
                ...checkpoint.resolution,
                outcomes: checkpoint.resolution.outcomes.filter((row) => row.kind !== "world.logic.receipt"),
              },
          [...checkpoint.checks, ...(checkpoint.combatExchange?.npcChecks ?? [])],
        );
        checkpoint.narration = response.output;
        checkpoint.usage.push(response.usage);
      }
      // Fair-warning receipts require visible delivery even if a model omits an outcome.
      const observations = checkpoint.resolution.outcomes
        .filter((row) => row.kind === "world.observed")
        .map((row) => row.text);
      observations.push(
        ...(checkpoint.foundationSettlement?.plan.events
          .filter((e) => e.visibility === "public")
          .map((e) => e.text) ?? []),
      );
      for (const text of observations) {
        if (!checkpoint.narration.narration.includes(text))
          checkpoint.narration.narration += "\n\n" + text;
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
      privatePatches: checkpoint.plan?.privatePatches ?? [],
      checks: checkpoint.checks,
      ...(checkpoint.foundationSettlement
        ? { foundationSettlement: checkpoint.foundationSettlement }
        : {}),
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
