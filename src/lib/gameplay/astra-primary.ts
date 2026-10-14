import { randomInt } from "node:crypto";
import type { PublicTurn, ResumeInput, TurnInput, JsonObject } from "./contracts.ts";
import type {
  AstraFinalProposal, AstraToolCall, AstraToolReceipt, BuiltContext,
  MechanicsResolution, PrivatePatch, ProviderResult, RecordedCheck,
  RuntimeSource, TurnClaim, TurnStore,
} from "./server-contracts.ts";
import { buildContext } from "./dm-context.ts";
import { astraCapabilities, type AstraCapabilities } from "./astra-capabilities.ts";
import { buildAstraPlanContext } from "./astra-plan-context.ts";
export { astraCapabilities } from "./astra-capabilities.ts";
export type { AstraCapabilities } from "./astra-capabilities.ts";
import { checkModifier } from "./mechanics/resolve.ts";
import { basicProfile } from "./mechanics/profile.ts";
import { isDisplayedCheck, recordServerRoll } from "./dice.ts";
import { publicSource } from "./turn-engine.ts";
import { requireClaimTimeline, requireTurnTimeline } from "./timeline.ts";
import { requireRule, safeTurnFailure, TurnError } from "./turn-errors.ts";
import { DmError } from "./dm-errors.ts";
import { withMemory } from "../memory/context.ts";
import { validateCharacterPatches } from "./character-model.ts";
import type { MemoryStore, SummaryProvider } from "../memory/server-contracts.ts";
import { preflightAstraPlanMemory } from "../memory/lifecycle.ts";
import { planAstraSettlement,
  legacySettlementKind,
  settlementNarrationProjection, effectsNarrationProjection,
  type AstraSettlementIntent, type AstraEffectIntent } from "./astra-settlement.ts";
import { planAstraOrderedEffects } from "./astra-ordered-effects.ts";

export const ASTRA_PRIMARY_RUNTIME = "astra-primary-v1" as const;
export function selectAstraPrimaryRuntime(
  pinned: "legacy-v1" | "astra-primary-v1" | null,
  optIn: boolean,
  mode: TurnInput["mode"],
  rulesetId: string | null,
  worldTakeover = false,
): boolean {
  if (pinned !== null) return pinned === ASTRA_PRIMARY_RUNTIME;
  return optIn && mode === "game" && (rulesetId === "console-basic-v1" ||
    (rulesetId === "world-logic-v1" && worldTakeover));
}
export type AstraPrivateFinal = {
  worldMinutes: number;
  changes: MechanicsResolution["changes"];
  outcomes: MechanicsResolution["outcomes"];
  privatePatches: PrivatePatch[];
  settlement?: AstraSettlementIntent | null;
  effects?: AstraEffectIntent[];
};
export type AstraDecision =
  | { type: "tool"; call: AstraToolCall; final: null }
  | { type: "final"; call: null; final: AstraPrivateFinal };
export interface AstraPrimaryProvider {
  next(context: BuiltContext, input: TurnInput, receipts: AstraToolReceipt[],
    checks: RecordedCheck[], capabilities: AstraCapabilities,
    source: RuntimeSource, observe?: (diagnostic: {
      responseReceived: boolean;
      phase: "preflight" | "request" | "error-body" | "response-body" |
        "provider-json" | "provider-state" | "output-parse" | "completed";
    }) => void): Promise<ProviderResult<AstraDecision>>;
  narrate(context: BuiltContext, input: TurnInput, observe?: (diagnostic: {
    responseReceived: boolean;
    phase: "preflight" | "request" | "error-body" | "response-body" |
      "provider-json" | "provider-state" | "output-parse" | "completed";
  }) => void): Promise<ProviderResult<{
    narration: string; visualDescription: string; clarification: null;
  }>>;
}
export type AstraDependencies = {
  store: TurnStore;
  memory: MemoryStore;
  summaries: SummaryProvider;
  provider: AstraPrimaryProvider;
  random?: (min:number,max:number)=>number;
};

function assertAstraStore(store: TurnStore): asserts store is TurnStore & Required<Pick<TurnStore,"recordAstraTool">> {
  requireRule(typeof store.recordAstraTool === "function");
}

function narrowContext(built: BuiltContext, instructions: string, extra?: JsonObject): BuiltContext {
  const packet = JSON.parse(built.input) as { mandatory?: Record<string, unknown> };
  if (packet.mandatory) {
    delete packet.mandatory.houseRules;
    if (packet.mandatory.worldTakeover && extra?.capabilities) {
      const current = packet.mandatory.current as {
        entities?: { id: string }[];
        locations?: { id: string }[];
        publicState?: { current_location_id: string | null };
      } | undefined;
      const caps = extra.capabilities as AstraCapabilities;
      if (current?.entities) current.entities = current.entities.filter((e) =>
        caps.entityIds.includes(e.id));
      if (current?.locations) current.locations = current.locations.filter((l) =>
        l.id === current.publicState?.current_location_id ||
        caps.locationIds.includes(l.id));
    }
  }
  const input = JSON.stringify(extra ? { ...packet, astraPrimary: extra } : packet);
  // The accepted production budget remains the upper bound. The existing
  // builder already sized a larger packet and larger legacy schema.
  requireRule(new TextEncoder().encode(input).length +
    new TextEncoder().encode(instructions).length <= built.budget.inputCap);
  return { ...built, instructions, input };
}

const publicInstructions = `You are the same primary DM, narrating this already adjudicated turn. This context is the public and validated outcome projection. Use only the supplied public facts, checks, after-values and accepted astraPrimary.effectsOutcome or historical settlementOutcome; never claim a rejected effect changed HP, money, inventory, Quest or other protected state. Ordinary conversation and temporary fictional permissions may continue without a mechanical record, but do not add an unrecorded payment, item, objective or other mechanical result or expose hidden truth. Preserve suspense, character voice, tactical clarity and earned callbacks. Describe each consequence once; compress repetition and connective prose by roughly 15–20% without reducing good NPC dialogue. Do not choose the player's next action or output a choice menu by default. Return the required narration contract.`;
const naturalEnglishGuidance = "Use idiomatic, natural conversational English that preserves each character's voice and the setting. Avoid literal-translation constructions and unnecessary bureaucratic phrasing; archaic or fantasy wording should sound intentional for that speaker.";

function safePublicSource(source: RuntimeSource, input: TurnInput): RuntimeSource {
  const projected = publicSource(source, input);
  return { ...projected, narrationBridge: undefined, foundationOptions: undefined,
    worldTakeover: undefined, worldLogicPresence: undefined,
    astraSettlementCurrencies: undefined, astraSettlementItemPolicies: undefined,
    astraSettlementJobs: undefined,
    snapshot: source.worldTakeover
      ? { ...projected.snapshot, entities: projected.snapshot.entities.filter((e) =>
          source.worldTakeover!.presentEntityIds.includes(e.id)) }
      : projected.snapshot,
    privateState: {}, memory: projected.memory ? {
      ...projected.memory, privateHistorical: [], privateSummary: null,
    } : undefined };
}

function availableEntity(source: RuntimeSource, caps: AstraCapabilities, id: string | null) {
  requireRule(!!id && caps.entityIds.includes(id));
  const actor = source.snapshot.entities.find((e) => e.id === id && e.campaign_id === source.snapshot.campaign.id);
  requireRule(actor);
  return actor;
}

function activeParticipant(source: RuntimeSource, entityId: string) {
  const encounter = source.runtime.encounters.find((e) => e.status === "active");
  if (!encounter) return null;
  const participant = source.runtime.participants.find((p) =>
    p.campaign_id === source.snapshot.campaign.id &&
    p.encounter_id === encounter.id && p.entity_id === entityId);
  return participant && participant.public_resources.active === true &&
    participant.public_resources.withdrawn !== true ? participant : null;
}

function assertNoPrivateDisclosure(source: RuntimeSource, input: TurnInput, publicText: string) {
  const fact = source.privateState.fact;
  const values = fact && typeof fact === "object" && !Array.isArray(fact)
    ? Object.values(fact).filter((v):v is string=>typeof v === "string") : [];
  const privateMemory = [ ...(source.memory?.privateHistorical ?? []),
    ...(source.memory?.exactEvents.filter((e)=>e.ref.visibility === "private") ?? []) ]
    .map((e)=>e.text);
  const lower = publicText.toLocaleLowerCase();
  for (const secret of [...values,...privateMemory]) {
    const text = secret.trim();
    if (text.length >= 8 && !input.input.toLocaleLowerCase().includes(text.toLocaleLowerCase()))
      requireRule(!lower.includes(text.toLocaleLowerCase()));
  }
}

export function astraToolResult(source: RuntimeSource, input: TurnInput,
  call: AstraToolCall, receipts: AstraToolReceipt[], checks: RecordedCheck[],
  caps = astraCapabilities(source), random: (min:number,max:number)=>number = randomInt): JsonObject {
  requireRule(receipts.length < 32 && ["query","skill","attack","save","damage"].includes(call.kind));
  if (call.kind === "query") {
    requireRule(call.scope === "current-public" && call.actorId === null &&
      call.targetId === null && call.dc === null && call.itemId === null);
    return { kind: "query", stateRevision: source.runtime.revision,
      state: {
        worldMinutes: source.runtime.worldMinutes,
        currentLocationId: source.snapshot.publicState.current_location_id,
        entities: source.snapshot.entities.filter((e)=>caps.entityIds.includes(e.id))
          .map((e) => ({ id:e.id,name:e.name,
          hp:e.hp,resources:e.resources })).sort((a,b)=>a.id.localeCompare(b.id)),
        items: source.snapshot.items.filter((i)=>i.campaign_id===source.snapshot.campaign.id &&
          ((i.owner_entity_id!==null && source.runtime.configuration?.controlledEntityIds.includes(i.owner_entity_id)) ||
            (i.equipped_entity_id!==null && caps.entityIds.includes(i.equipped_entity_id)) ||
            (!!i.storage_id && source.runtime.configuration?.nearbyStorageIds.includes(i.storage_id))))
          .map((i) => ({ id:i.id,name:i.name,
          quantity:i.quantity })).sort((a,b)=>a.id.localeCompare(b.id)),
      } };
  }
  requireRule(call.scope === null);
  const actor = availableEntity(source, caps, call.actorId);
  if (call.kind === "damage") {
    const target = availableEntity(source, caps, call.targetId);
    requireRule(call.dc === null && checks.some((check) => check.kind === "attack" &&
      check.actorId === actor.id && check.targetId === target.id && check.success) &&
      receipts.some((r) => r.call.kind === "attack" && r.call.actorId === actor.id &&
        r.call.targetId === target.id && r.call.itemId === call.itemId) &&
      !receipts.some((r) => r.call.kind === "damage" && r.call.actorId === actor.id &&
        r.call.targetId === target.id && r.call.itemId === call.itemId));
    const item = call.itemId === null ? null : source.snapshot.items.find((i) =>
      i.id === call.itemId && caps.toolItemIds.includes(i.id) &&
      i.owner_entity_id === actor.id && i.equipped_entity_id === actor.id);
    requireRule(call.itemId === null || !!item);
    const sides = item ? source.runtime.configuration?.itemRules.find((r) =>
      r.itemId === item.id && r.tag === "weapon")?.damage ?? basicProfile.weaponDamage
      : basicProfile.weaponDamage;
    requireRule(Number.isInteger(sides) && sides >= 1 && sides <= 20);
    const die = random(1, sides + 1);
    requireRule(Number.isInteger(die) && die >= 1 && die <= sides);
    return { kind: "damage", actorId: actor.id, targetId: target.id,
      itemId: call.itemId, dice: [die], modifier: 0, total: die };
  }
  const target = call.kind === "attack" ? availableEntity(source, caps, call.targetId) : null;
  const participant = call.kind === "attack" || call.kind === "skill"
    ? activeParticipant(source, actor.id) : null;
  if ((call.kind === "attack" || call.kind === "skill") &&
    source.runtime.encounters.some((e) => e.status === "active")) requireRule(participant);
  if (participant) requireRule(Number(participant.public_resources.action) === 1 &&
    !receipts.some((r) => ["attack","skill"].includes(r.call.kind) &&
      r.call.actorId === actor.id));
  if (target && source.runtime.encounters.some((e) => e.status === "active"))
    requireRule(activeParticipant(source,target.id));
  requireRule(call.kind === "attack" ? call.dc === null :
    call.targetId === null && Number.isInteger(call.dc) && call.dc! >= 1 && call.dc! <= 40);
  const item = call.itemId === null ? null : source.snapshot.items.find((i) =>
    i.id === call.itemId && caps.toolItemIds.includes(i.id) &&
    i.owner_entity_id === actor.id && i.equipped_entity_id === actor.id);
  requireRule(call.itemId === null || (call.kind === "attack" && !!item));
  const dc = target ? Number(target.stats.defense ?? 10) : call.dc!;
  requireRule(Number.isInteger(dc) && dc >= 1 && dc <= 40);
  requireRule(checks.length < 8);
  const proposal = { index: checks.length, actorId: actor.id,
    targetId: target?.id ?? null, kind: call.kind, stat: call.kind,
    dc, dcPublic: false,
    visibility: source.runtime.configuration?.controlledEntityIds.includes(actor.id) ? "player" as const : "private" as const,
    important: true, uncertainty: "meaningful" as const, advantage: "normal" as const };
  const roll = recordServerRoll(input.operationId, proposal, checkModifier(source, proposal), 1, random);
  return roll as unknown as JsonObject;
}

function validateFinal(source: RuntimeSource, input: TurnInput, next: AstraPrivateFinal,
  receipts: AstraToolReceipt[]): AstraFinalProposal {
  requireRule(next && typeof next === "object" && Array.isArray(next.changes) &&
    next.changes.length <= 12 && Array.isArray(next.outcomes) && next.outcomes.length <= 12 &&
    Array.isArray(next.privatePatches) && next.privatePatches.length <= 6 &&
    Number.isInteger(next.worldMinutes) &&
    next.worldMinutes >= source.runtime.worldMinutes &&
    next.worldMinutes <= source.runtime.worldMinutes + 1440);
  const caps = astraCapabilities(source);
  const seen = new Set<string>();
  for (const change of next.changes) {
    requireRule(change && typeof change === "object" && !!change.values &&
      typeof change.values === "object" && !Array.isArray(change.values) &&
      !seen.has(`${change.family}:${change.id}`));
    seen.add(`${change.family}:${change.id}`);
    if (change.family === "entities") {
      const actor = availableEntity(source, caps, change.id);
      requireRule(change.expectedRevision === actor.revision &&
        Object.keys(change.values).every((key) => ["hp","resources"].includes(key)));
      if (change.values.resources) {
        requireRule(typeof change.values.resources === "object" && !Array.isArray(change.values.resources));
        for (const [key, value] of Object.entries(change.values.resources))
          requireRule(Object.hasOwn(actor.resources, key) && Number.isInteger(value) &&
            Number(value) >= 0 && Number(value) <= Number(actor.resources[key]));
      }
      if (change.values.hp !== undefined) {
        const damage = receipts.filter((r)=>r.call.kind === "damage" &&
          r.call.targetId === actor.id).reduce((sum,r)=>sum+Number(r.result.total),0);
        requireRule(damage > 0 && Number.isInteger(change.values.hp) &&
          Number(change.values.hp) === Math.max(0,Number(actor.hp)-damage));
      }
    } else if (change.family === "items") {
      const item = source.snapshot.items.find((i) => i.id === change.id && caps.itemIds.includes(i.id));
      requireRule(item && change.expectedRevision === item.revision &&
        Object.keys(change.values).length === 1 &&
        Number.isInteger(change.values.quantity) &&
        Number(change.values.quantity) >= 0 && Number(change.values.quantity) <= item.quantity);
    } else if (change.family === "public_state") {
      requireRule(change.id === input.campaignId &&
        change.expectedRevision === source.snapshot.publicState.revision &&
        Object.keys(change.values).length === 1 &&
        typeof change.values.current_location_id === "string" &&
        caps.locationIds.includes(change.values.current_location_id) &&
        next.worldMinutes > source.runtime.worldMinutes);
    } else if (change.family === "encounter_participants") {
      const p = source.runtime.participants.find((p) => p.id === change.id && caps.participantIds.includes(p.id));
      const actionCost = receipts.filter((r) => ["attack","skill"].includes(r.call.kind) &&
        r.call.actorId === p?.entity_id).length;
      const position = String((change.values.public_position as JsonObject)?.position);
      const moveCost = p && position !== p.public_position.position ? 1 : 0;
      const defeated = next.changes.some((c) => c.family === "entities" &&
        c.id === p?.entity_id && c.values.hp === 0);
      requireRule(p && change.expectedRevision === null &&
        Object.keys(change.values).length === 2 &&
        ["nearby","far","cover"].includes(position) &&
        actionCost <= 1 && (actionCost > 0 || moveCost > 0 || defeated) &&
        (actionCost === 0 || Number(p.public_resources.action) === 1) &&
        (moveCost === 0 || Number(p.public_resources.move) === 1) &&
        JSON.stringify(change.values.public_resources) === JSON.stringify({
          ...p.public_resources,
          action:Number(p.public_resources.action)-actionCost,
          move:Number(p.public_resources.move)-moveCost,
          withdrawn:p.public_resources.withdrawn === true || defeated}));
    } else throw new DmError("validation");
  }
  for (const receipt of receipts.filter((r)=>r.call.kind === "damage" && Number(r.result.total)>0))
    requireRule(next.changes.some((c)=>c.family === "entities" &&
      c.id === receipt.call.targetId && c.values.hp !== undefined));
  for (const receipt of receipts.filter((r)=>["attack","skill"].includes(r.call.kind))) {
    const p = activeParticipant(source,receipt.call.actorId!);
    if (p) requireRule(next.changes.some((c)=>c.family === "encounter_participants" && c.id === p.id));
  }
  for (const changed of next.changes.filter((c)=>c.family === "entities" && c.values.hp === 0)) {
    const p = activeParticipant(source,changed.id);
    if (p) requireRule(next.changes.some((c)=>c.family === "encounter_participants" && c.id === p.id));
  }
  for (const outcome of next.outcomes) {
    requireRule(outcome && typeof outcome === "object" &&
      typeof outcome.kind === "string" && outcome.kind.length <= 80 &&
      typeof outcome.text === "string" && outcome.text.length <= 1000 &&
      Array.isArray(outcome.entityIds) && Array.isArray(outcome.itemIds) &&
      outcome.entityIds.every((id)=>caps.entityIds.includes(id)) &&
      outcome.itemIds.every((id)=>[...caps.itemIds,...caps.toolItemIds].includes(id)));
  }
  for (const patch of next.privatePatches) {
    requireRule(patch && typeof patch === "object" &&
      ["fact","clock","npc","faction","consequence"].includes(patch.kind) &&
      /^[a-zA-Z0-9_-]{1,80}$/.test(patch.key) &&
      !(patch.kind === "npc" && patch.key.startsWith("character_")) &&
      ((patch.operation === "set" && typeof patch.value === "string" &&
        patch.value.length <= 2000 && patch.amount === null) ||
       (patch.operation === "advance" && patch.kind === "clock" &&
        patch.value === null && Number.isInteger(patch.amount) &&
        patch.amount! >= 0 && patch.amount! <= 100)));
  }
  assertNoPrivateDisclosure(source,input,next.outcomes.map((o)=>o.text).join("\n"));
  validateCharacterPatches(source, input, next.privatePatches);
  const travel = next.changes.some((change) => change.family === "public_state");
  // World Logic-origin actor locations are historical after handoff. An
  // already-present companion remains with the party; local NPCs do not.
  // This is server-derived; the provider has no configuration write capability.
  const configuration = source.worldTakeover && travel && source.runtime.configuration
    ? { ...source.runtime.configuration,
        presentEntityIds: source.runtime.configuration.presentEntityIds.filter((id) =>
          source.runtime.configuration!.controlledEntityIds.includes(id) ||
          source.snapshot.entities.some((entity) => entity.id === id &&
            entity.campaign_id === input.campaignId && entity.kind === "companion")),
        nearbyStorageIds: [] }
    : source.runtime.configuration;
  const resolution: MechanicsResolution = { changes: next.changes,
    worldMinutes: next.worldMinutes, configuration,
    outcomes: next.outcomes };
  return { schemaVersion: 1, campaignId: input.campaignId,
    operationId: input.operationId, expectedRevision: input.expectedRevision,
    input: input.input, resolution, privatePatches: next.privatePatches,
    toolRefs: receipts.filter((r) => r.call.kind !== "query").map((r) => r.id) };
}

async function astraExecute(claim: TurnClaim, deps: AstraDependencies,
  command: ResumeInput | null): Promise<PublicTurn> {
  const { store, memory, provider, summaries } = deps;
  assertAstraStore(store);
  const { source, lease } = claim;
  const input = claim.turn.input;
  const checkpoint = structuredClone(claim.turn.checkpoint);
  type Stage = Parameters<NonNullable<TurnStore["recordAstraStage"]>>[1]["stage"];
  let stage: Stage = "plan";
  let providerResponseReceived = false;
  let narrationParseSucceeded = false;
  const recordStage = async (next: Stage, phase: "entered" | "completed") => {
    stage = next;
    await store.recordAstraStage?.(lease, { stage: next, phase,
      providerResponseReceived, narrationParseSucceeded, failureCategory: null });
  };
  try {
    if (source.worldTakeover)
      source.worldLogicPresence = {
        controlledEntityIds: source.runtime.configuration?.controlledEntityIds ?? [],
        presentEntityIds: source.worldTakeover.presentEntityIds,
      };
    requireRule(claim.runtimeIdentity === ASTRA_PRIMARY_RUNTIME && input.mode === "game" &&
      !!checkpoint.astraPrimary && input.expectedRevision === source.runtime.revision);
    const astra = checkpoint.astraPrimary!;
    const caps = astraCapabilities(source);
    if (command?.action === "reroll") {
      const check = checkpoint.checks.find((c) => c.id === command.checkId && isDisplayedCheck(source,c));
      requireRule(check && !astra.finalProposal &&
        source.snapshot.settings.values.difficulty.rerolls !== "disabled");
      const replacement = recordServerRoll(input.operationId, check, check.modifier,
        check.rollNumber + 1,deps.random);
      checkpoint.checks = await store.reroll(lease, command, replacement);
      await store.checkpoint(lease, checkpoint, "awaiting_confirmation");
      return store.getPublic(input.campaignId, input.operationId);
    }
    if (command?.action === "continue") {
      requireRule(checkpoint.checks.some((c) => isDisplayedCheck(source,c)));
      await store.checkpoint(lease, checkpoint, "generating");
    }
    if (!astra.finalProposal) {
      await recordStage("plan", "entered");
      const { selected, context } = await preflightAstraPlanMemory(
        source, input, memory, summaries,
        (candidate, request, requiredOnly) => buildAstraPlanContext(candidate, request,
          { requiredOnly, caps }));
      // A turn may use all 32 receipt slots and still needs one final response.
      for (let step=astra.toolReceipts.length;step<=32;step++) {
        const response = await provider.next(context,input,astra.toolReceipts,checkpoint.checks,caps,selected,
          (diagnostic) => { providerResponseReceived = diagnostic.responseReceived; });
        checkpoint.usage.push(response.usage);
        const decision = response.output;
        if (decision.type === "final") {
          requireRule(decision.call === null);
          await recordStage("plan", "completed");
          await recordStage("final_validated", "entered");
          astra.finalProposal = validateFinal(selected,input,decision.final,astra.toolReceipts);
          if (decision.final.effects) {
            const effects = planAstraOrderedEffects(selected,input,decision.final.effects,
              astra.finalProposal.resolution);
            if (effects) {
              checkpoint.astraEffects = effects;
              checkpoint.astraSettlement = null;
            }
          } else {
            if (decision.final.settlement)
              requireRule(legacySettlementKind(decision.final.settlement.kind));
            const settlement = planAstraSettlement(selected,input,decision.final.settlement,
              astra.finalProposal.resolution.changes);
            if (settlement) checkpoint.astraSettlement = settlement;
          }
          await recordStage("final_validated", "completed");
          checkpoint.resolution = astra.finalProposal.resolution;
          await recordStage("final_checkpoint", "entered");
          await store.checkpoint(lease,checkpoint,"generating");
          await recordStage("final_checkpoint", "completed");
          break;
        }
        requireRule(decision.type === "tool" && decision.final === null);
        requireRule(step < 32);
        const result = astraToolResult(source,input,decision.call,astra.toolReceipts,
          checkpoint.checks,caps,deps.random);
        const receipt = await store.recordAstraTool(lease,astra.toolReceipts.length,decision.call,result);
        astra.toolReceipts.push(receipt);
        if (["skill","attack","save"].includes(decision.call.kind)) {
          checkpoint.checks.push(receipt.result as unknown as RecordedCheck);
          const check = checkpoint.checks.at(-1)!;
          if (isDisplayedCheck(source,check) &&
              (source.snapshot.settings.values.interactiveDice ||
                source.snapshot.settings.values.difficulty.rerolls !== "disabled")) {
            await store.checkpoint(lease,checkpoint,"awaiting_confirmation");
            return store.getPublic(input.campaignId,input.operationId);
          }
        }
      }
      requireRule(astra.finalProposal);
    }
    const final = astra.finalProposal!;
    if (!checkpoint.narration) {
      await recordStage("narration_context", "entered");
      const safe = safePublicSource(source,input);
      const selected = await withMemory(safe,input,memory,false,{model:"gpt-6-astra",stage:"narrate"});
      const narrationResolution = checkpoint.astraEffects?.schemaVersion === 2
        ? checkpoint.astraEffects.resolution : final.resolution;
      const base = buildContext(selected,input,"narrate",{model:"gpt-6-astra",
        resolution:narrationResolution,checks:checkpoint.checks});
      const effectsOutcome = effectsNarrationProjection(checkpoint.astraEffects ?? null);
      const settlementOutcome = settlementNarrationProjection(checkpoint.astraSettlement ?? null);
      const narrationInstructions = source.snapshot.campaign.language === "en"
        ? `${publicInstructions} ${naturalEnglishGuidance}` : publicInstructions;
      const context = narrowContext(base,narrationInstructions,
        effectsOutcome ? {effectsOutcome} : settlementOutcome ? {settlementOutcome} : undefined);
      await recordStage("narration_context", "completed");
      await recordStage("narration_provider", "entered");
      const response = await provider.narrate(context,input,(diagnostic) => {
        providerResponseReceived = diagnostic.responseReceived;
        if (diagnostic.phase === "output-parse") stage = "narration_parse";
        if (diagnostic.phase === "completed") narrationParseSucceeded = true;
      });
      providerResponseReceived = true;
      narrationParseSucceeded = true;
      await recordStage("narration_provider", "completed");
      await recordStage("narration_parse", "completed");
      checkpoint.narration = response.output;
      checkpoint.usage.push(response.usage);
      await recordStage("narration_safety", "entered");
      requireRule(typeof checkpoint.narration.narration === "string" &&
        checkpoint.narration.narration.trim().length > 0 &&
        checkpoint.narration.narration.length <= 6000);
      assertNoPrivateDisclosure(source,input,
        checkpoint.narration.narration+"\n"+checkpoint.narration.visualDescription);
      await recordStage("narration_safety", "completed");
      await recordStage("narration_checkpoint", "entered");
      await store.checkpoint(lease,checkpoint,"generating");
      await recordStage("narration_checkpoint", "completed");
    }
    await recordStage("commit", "entered");
    return await store.commit(lease,{ narration:checkpoint.narration.narration,
      visualDescription:checkpoint.narration.visualDescription,
      resolution:final.resolution,privatePatches:final.privatePatches,
      checks:checkpoint.checks,guidanceProposal:null });
  } catch (error) {
    const safe = safeTurnFailure(error);
    try { await store.recordAstraStage?.(lease, {stage,phase:"failed",
      providerResponseReceived,narrationParseSucceeded,
      failureCategory:safe.code}); } catch { /* Preserve the original failure. */ }
    try { return await store.fail(lease,safe.code,safe.retryable); }
    catch { throw new TurnError(safe.code,safe.retryable); }
  }
}

export async function runAstraTurn(input: TurnInput,deps:AstraDependencies):Promise<PublicTurn> {
  const current = requireTurnTimeline(await deps.store.begin(input,ASTRA_PRIMARY_RUNTIME),
    input.campaignId,input.operationId,input.timeline);
  if (["committed","cancelled","awaiting_confirmation"].includes(current.status) ||
      (current.status === "failed" && !current.canRetry)) return current;
  const claim = await deps.store.claim(input.campaignId,input.operationId);
  if (claim) requireClaimTimeline(claim,input.campaignId,input.operationId,input.timeline);
  return requireTurnTimeline(claim ? await astraExecute(claim,deps,null) :
    await deps.store.getPublic(input.campaignId,input.operationId),
    input.campaignId,input.operationId,input.timeline);
}

export async function resumeAstraTurn(command:ResumeInput,deps:AstraDependencies):Promise<PublicTurn> {
  const current = requireTurnTimeline(await deps.store.getPublic(command.campaignId,command.operationId),
    command.campaignId,command.operationId,command.timeline);
  if (["committed","cancelled"].includes(current.status)) return current;
  if (command.action === "cancel") return deps.store.cancel(command);
  requireRule(command.action === "retry" ? current.status === "failed" && current.canRetry :
    current.status === "awaiting_confirmation");
  const claim = await deps.store.claim(command.campaignId,command.operationId);
  if (claim) requireClaimTimeline(claim,command.campaignId,command.operationId,command.timeline);
  return requireTurnTimeline(claim ? await astraExecute(claim,deps,command) :
    await deps.store.getPublic(command.campaignId,command.operationId),
    command.campaignId,command.operationId,command.timeline);
}
