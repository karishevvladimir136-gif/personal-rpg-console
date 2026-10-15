import { randomInt } from "node:crypto";
import { isDeepStrictEqual } from "node:util";
import { astraFictionAuthorityInstructions } from "./astra-fiction-authority.ts";
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
import { ContextCapacityError, DmError } from "./dm-errors.ts";
import { withMemory } from "../memory/context.ts";
import { validateCharacterPatches } from "./character-model.ts";
import type { MemoryStore, SummaryProvider } from "../memory/server-contracts.ts";
import { preflightAstraPlanMemory } from "../memory/lifecycle.ts";
import { planAstraSettlement,
  legacySettlementKind,
  settlementNarrationProjection, effectsNarrationProjection,
  type AstraSettlementIntent, type AstraEffectIntent } from "./astra-settlement.ts";
import { planAstraOrderedEffects } from "./astra-ordered-effects.ts";
import { planAstraCompatibleEffects } from "./astra-compatible-effects.ts";
import { astraContextHasPrivateEvidence, projectAstraPublicSource } from "./astra-privacy-context.ts";
import { withUnifiedMemory } from "../memory/unified-context.ts";
import { compileGenericOperations, genericPublication, genericBehavior } from "./astra-generic-compiler.ts";
import { genericManifest, type GenericDecision } from "./astra-generic-contract.ts";
import { applyAstraShadowChanges } from "./astra-ordered-effects.ts";

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
  publicNarration?: {
    beats: { text: string; requiresEffects: number[] }[];
    visualDescription: { text: string; requiresEffects: number[] };
  };
};
export type AstraDecision =
  | { type: "tool"; call: AstraToolCall; final: null }
  | { type: "final"; call: null; final: AstraPrivateFinal };
export type ProviderProgress = {
  responseReceived: boolean;
  phase: "preflight" | "request" | "error-body" | "response-body" |
    "provider-json" | "provider-state" | "output-parse" | "completed";
  elapsedMs?: number;
  abortKind?: "timeout" | "abort" | null;
  causeCode?: string | null;
};
export interface AstraPrimaryProvider {
  next(context: BuiltContext, input: TurnInput, receipts: AstraToolReceipt[],
    checks: RecordedCheck[], capabilities: AstraCapabilities,
    source: RuntimeSource, observe?: (diagnostic: ProviderProgress) => void): Promise<ProviderResult<AstraDecision | GenericDecision>>;
  narrate(context: BuiltContext, input: TurnInput, observe?: (diagnostic: ProviderProgress) => void): Promise<ProviderResult<{
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
  const fits = new TextEncoder().encode(input).length +
    new TextEncoder().encode(instructions).length <= built.budget.inputCap;
  if (!fits && extra?.responseContract === "unified-v1") throw new DmError("context",true);
  requireRule(fits);
  return { ...built, instructions, input };
}

const publicInstructions = `You are the same primary DM, narrating this already adjudicated turn. This context is the public and validated outcome projection. Treat supplied public facts as established evidence, and supplied checks, after-values and accepted astraPrimary.effectsOutcome or historical settlementOutcome as the authority for durable outcomes; never claim a rejected effect changed HP, money, inventory, Quest or other protected state. Ordinary conversation and temporary fictional permissions may continue without a mechanical record, but do not claim an unvalidated payment, owned inventory Item, durable objective or other mechanical result or expose hidden truth. Preserve suspense, character voice, tactical clarity and earned callbacks. Describe each consequence once; compress repetition and connective prose by roughly 15–20% without reducing good NPC dialogue. Do not choose the player's next action or output a choice menu by default. Return the required narration contract. ${astraFictionAuthorityInstructions}`;
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

function assertNoPrivateDisclosure(source: RuntimeSource, input: TurnInput, publicText: string,
  receipts: AstraToolReceipt[] = []) {
  const fact = source.privateState.fact;
  const values = fact && typeof fact === "object" && !Array.isArray(fact)
    ? Object.values(fact).filter((v):v is string=>typeof v === "string") : [];
  const privateMemory = [ ...(source.memory?.privateHistorical ?? []),
    ...(source.memory?.exactEvents.filter((e)=>e.ref.visibility === "private") ?? []) ]
    .map((e)=>e.text);
  // Modern private-informed planning receives selected private evidence. The
  // strict public projection is the boundary; this literal guard is independent
  // defense in depth before any public commit, not a replacement for projection.
  // This catches nested Character Models and generic private buckets as well
  // as ordinary facts. It is not a semantic/paraphrase secrecy guarantee.
  const nestedStrings = (value: unknown, into: Set<string>, depth = 0) => {
    if (depth > 20 || value === null) return;
    if (typeof value === "string") {
      into.add(value);
      if (/^[\[{]/.test(value.trim())) {
        try { nestedStrings(JSON.parse(value), into, depth + 1); } catch { /* prose */ }
      }
    } else if (Array.isArray(value)) {
      for (const child of value) nestedStrings(child, into, depth + 1);
    } else if (typeof value === "object") {
      for (const child of Object.values(value)) nestedStrings(child, into, depth + 1);
    }
  };
  const privateValues = new Set([...values, ...privateMemory]);
  const publicValues = new Set<string>([input.input]);
  if (source.astraResponseContract === "unified-v1") {
    nestedStrings(source.privateState, privateValues);
    nestedStrings(source.worldTakeover, privateValues);
    nestedStrings(source.narrationBridge, privateValues);
    nestedStrings(source.memory?.privateHistorical, privateValues);
    nestedStrings(source.memory?.exactEvents.filter((event) => event.ref.visibility === "private"), privateValues);
    nestedStrings(source.memory?.privateSummary, privateValues);
    nestedStrings(source.checkpoint?.privateText, privateValues);
    const visible = safePublicSource(source, input);
    nestedStrings(visible.snapshot, publicValues);
    nestedStrings(visible.memory, publicValues);
    nestedStrings(visible.observableCharacters, publicValues);
    nestedStrings(visible.checkpoint?.publicText, publicValues);
  }
  const knownPublic = [...publicValues].join("\n").toLocaleLowerCase();
  const lower = publicText.toLocaleLowerCase();
  for (const receipt of receipts) {
    // Receipt identity is private replay authority, not fictional content.
    // Even player-visible Checks expose their ID only through the Check DTO.
    const identifiers = [receipt.id, receipt.result.id]
      .filter((value): value is string => typeof value === "string" && value.length >= 8);
    for (const identifier of identifiers)
      requireRule(!lower.includes(identifier.toLocaleLowerCase()));
    if (source.astraResponseContract === "unified-v1")
      privateValues.add(JSON.stringify(receipt));
  }
  for (const secret of privateValues) {
    const text = secret.trim();
    if (text.length >= 8 && !knownPublic.includes(text.toLocaleLowerCase()))
      requireRule(!lower.includes(text.toLocaleLowerCase()));
  }
}

function unifiedNarration(value: AstraPrivateFinal["publicNarration"],
  effectCount: number, acceptedIndexes: number[]) {
  requireRule(value && typeof value === "object" && Array.isArray(value.beats) &&
    value.beats.length > 0 && value.beats.length <= 12 && value.visualDescription);
  const accepted = new Set(acceptedIndexes);
  const keep = (fragment: { text: string; requiresEffects: number[] }, max: number) => {
    requireRule(fragment && typeof fragment === "object" &&
      Object.keys(fragment).length === 2 && typeof fragment.text === "string" &&
      fragment.text.length <= max && Array.isArray(fragment.requiresEffects) &&
      fragment.requiresEffects.length <= 6 &&
      new Set(fragment.requiresEffects).size === fragment.requiresEffects.length &&
      fragment.requiresEffects.every((index) => Number.isInteger(index) &&
        index >= 0 && index < effectCount));
    return fragment.requiresEffects.every((index) => accepted.has(index));
  };
  const beats = value.beats.filter((beat) => keep(beat, 6000));
  const narration = beats.map((beat) => beat.text).filter((text) => text.trim()).join("\n\n");
  // Do not invent replacement fiction when all supplied public text depended
  // on rejected authority. Preserve the input and use a technical retry state.
  if (!narration.trim() || narration.length > 6000) throw new DmError("provider", true);
  const visualDescription = keep(value.visualDescription, 2000)
    ? value.visualDescription.text : "";
  return { narration, visualDescription, clarification: null };
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
  // Unified fiction belongs in dependency-tagged narration. Model-written
  // outcomes must not be indexed as validated facts independently of rejected
  // effects. Accepted mechanics/settlement outcomes are added by the server.
  if (source.astraResponseContract === "unified-v1") requireRule(next.outcomes.length === 0);
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
  assertNoPrivateDisclosure(source,input,next.outcomes.map((o)=>o.text).join("\n"),receipts);
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
  // Durable begin owns this pin. A historical/missing pin remains two-stage
  // regardless of the current application or provider defaults.
  const modern = claim.astraResponseContract === "unified-v1";
  const generic=claim.astraStateContract==="generic-v1";
  source.astraStateContract=generic?"generic-v1":undefined;
  if(generic && source.worldTakeover && source.runtime.configuration)
    source.worldTakeover={...source.worldTakeover,presentEntityIds:[...source.runtime.configuration.presentEntityIds]};
  let responseMode = modern ? claim.astraResponseMode ?? null : null;
  source.astraResponseContract = modern ? "unified-v1" : undefined;
  source.astraResponseMode = responseMode ?? undefined;
  const input = claim.turn.input;
  const checkpoint = structuredClone(claim.turn.checkpoint);
  if(generic)source.astraGenericPrefix=checkpoint.astraGeneric?.intents ?? [];
  let disclosureSource = source;
  let selectedPrivateMemory = false;
  type Stage = Parameters<NonNullable<TurnStore["recordAstraStage"]>>[1]["stage"];
  let stage: Stage = "plan";
  let providerResponseReceived = false;
  let narrationParseSucceeded = false;
  let automaticTransportRetryUsed = false;
  const providerRequest = async <T>(send: (observe: (progress: ProviderProgress) => void) => Promise<T>,
    unchanged: () => boolean,
    onProgress?: (progress: ProviderProgress) => void): Promise<T> => {
    for (let attempt = 0; attempt < 2; attempt++) {
      const observation: { progress: ProviderProgress | null } = { progress: null };
      providerResponseReceived = false;
      try {
        const result = await send((progress) => {
          observation.progress = progress;
          providerResponseReceived = progress.responseReceived;
          onProgress?.(progress);
        });
        providerResponseReceived = true;
        return result;
      } catch (error) {
        const safe = safeTurnFailure(error);
        // The provider reports its transport boundary. A missing observation,
        // any received response, or any newly recorded result forbids replay.
        if (attempt !== 0 || automaticTransportRetryUsed ||
          observation.progress?.phase !== "request" ||
          observation.progress.responseReceived || !unchanged() || !safe.retryable ||
          observation.progress.abortKind !== null ||
          !Number.isFinite(observation.progress.elapsedMs) ||
          observation.progress.elapsedMs! < 0 ||
          observation.progress.elapsedMs! > 5000 ||
          !["ECONNRESET", "ECONNREFUSED", "EPIPE", "EAI_AGAIN", "UND_ERR_SOCKET"]
            .includes(observation.progress.causeCode ?? "") ||
          !["provider", "unavailable"].includes(safe.code) ||
          !(error instanceof DmError || error instanceof TurnError)) throw error;
        automaticTransportRetryUsed = true;
        console.info(JSON.stringify({ event: "astra_transport_retry",
          operationId: input.operationId, stage, automaticRetry: true,
          elapsedMs: observation.progress.elapsedMs,
          causeCode: observation.progress.causeCode }));
      }
    }
    throw new TurnError("unavailable", true);
  };
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
      const replay=generic ? await store.astraRerollReceipt?.(lease,command) : null;
      if(replay)checkpoint.checks=replay;
      else {
        const replacement = recordServerRoll(input.operationId, check, check.modifier,
          check.rollNumber + 1,deps.random);
        checkpoint.checks = await store.reroll(lease, command, replacement);
      }
      await store.checkpoint(lease, checkpoint, "awaiting_confirmation");
      return store.getPublic(input.campaignId, input.operationId);
    }
    if (command?.action === "continue") {
      requireRule(checkpoint.checks.some((c) => isDisplayedCheck(source,c)));
      await store.checkpoint(lease, checkpoint, "generating");
    }
    if (!astra.finalProposal) {
      await recordStage("plan", "entered");
      const prepared = await preflightAstraPlanMemory(
        source, input, memory, summaries,
        (candidate, request, requiredOnly) => buildAstraPlanContext(candidate, request,
          { requiredOnly, caps }));
      let { selected, context } = prepared;
      if (modern) {
        // Retain authorized retrieved evidence for the literal disclosure
        // defense only; it is never part of the public narrator projection.
        disclosureSource = { ...source, memory: selected.memory };
        selectedPrivateMemory = true;
      }
      if (modern) {
        requireRule(store.pinAstraResponseMode);
        if (!responseMode) {
          const proposed = astraContextHasPrivateEvidence(context)
            ? "private-informed" : "public-unified";
          responseMode = await store.pinAstraResponseMode(lease, proposed);
        }
        source.astraResponseMode = responseMode;
        if (responseMode === "public-unified") selected = projectAstraPublicSource(selected,input);
        selected.astraResponseContract = "unified-v1";
        selected.astraResponseMode = responseMode;
        context = buildAstraPlanContext(selected,input,{caps});
      }
      // A turn may use all 32 receipt slots and still needs one final response.
      for (let step=astra.toolReceipts.length;step<=32;step++) {
        const priorReceipts = astra.toolReceipts.length;
        const priorChecks = checkpoint.checks.length;
        const response = await providerRequest(
          (observe) => provider.next(context,input,astra.toolReceipts,checkpoint.checks,caps,selected,observe),
          () => astra.toolReceipts.length === priorReceipts &&
            checkpoint.checks.length === priorChecks && !astra.finalProposal && !checkpoint.narration);
        checkpoint.usage.push(response.usage);
        const decision = response.output;
        if(generic){
          requireRule("toolRequest" in decision);
          if(decision.type==="final"){
            await recordStage("plan","completed");await recordStage("final_validated","entered");
            const value=decision.final;
            requireRule(value && Object.keys(value).length===4 &&
              ["publicNarration","genericOperations","privatePatches","publicBehavior"].every(k=>Object.hasOwn(value,k)));
            const plan=compileGenericOperations(selected,input,value.genericOperations,astra.toolReceipts,
              value.publicNarration,value.publicBehavior);
            requireRule(astra.toolReceipts.filter(r=>r.call.kind==="damage" && Number(r.result.total)>0).every(r=>plan.damageRefs.includes(r.id)));
            const prefix=checkpoint.astraGeneric?.intents ?? [];
            requireRule(isDeepStrictEqual(plan.intents.slice(0,prefix.length),prefix));
            const validated=validateFinal(selected,input,{worldMinutes:selected.runtime.worldMinutes,changes:[],outcomes:[],privatePatches:value.privatePatches},[]);
            validated.resolution=plan.resolution;validated.toolRefs=astra.toolReceipts.filter(r=>r.call.kind!=="query").map(r=>r.id);
            astra.finalProposal=validated;checkpoint.astraGeneric=plan;
            genericBehavior(selected,genericManifest(selected,input),value.publicBehavior);
            if(responseMode==="public-unified"){
              requireRule(value.publicNarration);checkpoint.narration=genericPublication(value.publicNarration,plan.accepted);
              assertNoPrivateDisclosure(disclosureSource,input,checkpoint.narration.narration+"\n"+checkpoint.narration.visualDescription,astra.toolReceipts);
              narrationParseSucceeded=true;
            }else requireRule(value.publicNarration===null);
            checkpoint.resolution=plan.resolution;
            await recordStage("final_validated","completed");await recordStage("final_checkpoint","entered");
            await store.checkpoint(lease,checkpoint,"generating");await recordStage("final_checkpoint","completed");break;
          }
          const request=decision.toolRequest;
          requireRule(astra.toolReceipts.length<12);
          const plan=compileGenericOperations(selected,input,request.operations,astra.toolReceipts);
          const prior=checkpoint.astraGeneric?.intents ?? [];
          requireRule(isDeepStrictEqual(plan.intents.slice(0,prior.length),prior));
          checkpoint.astraGeneric=plan;await store.checkpoint(lease,checkpoint,"generating");
          const virtual=structuredClone(selected);applyAstraShadowChanges(virtual,plan.resolution.changes);
          virtual.runtime.configuration=plan.resolution.configuration;virtual.runtime.worldMinutes=plan.resolution.worldMinutes;
          if(virtual.worldTakeover && virtual.runtime.configuration)virtual.worldTakeover.presentEntityIds=virtual.runtime.configuration.presentEntityIds;
          const manifest=genericManifest(selected,input);
          const refId=(ref:import("./astra-generic-contract.ts").GenericRef|null,family:string):string|null=>{
            if(!ref)return null;
            const record=ref.source==="known"?manifest.records[ref.key]:null;
            if(record){requireRule(record.family===family);return record.id;}
            requireRule(ref.source==="local" && plan.accepted.includes(ref.key));
            const local=plan.refs[ref.key];requireRule(local?.family===family);return local.id;
          };
          const call:AstraToolCall={kind:request.call.kind,actorId:refId(request.call.actor,"entities"),targetId:refId(request.call.target,"entities"),
            itemId:refId(request.call.item,"items"),dc:request.call.dc,scope:request.call.scope};
          const result=astraToolResult(virtual,input,call,astra.toolReceipts,checkpoint.checks,astraCapabilities(virtual),deps.random);
          const receipt=await store.recordAstraTool(lease,astra.toolReceipts.length,call,result);astra.toolReceipts.push(receipt);
          selected.astraGenericPrefix=plan.intents;
          context=buildAstraPlanContext(selected,input,{caps});
          if(["skill","attack","save"].includes(call.kind)){
            checkpoint.checks.push(receipt.result as unknown as RecordedCheck);
            if(isDisplayedCheck(source,checkpoint.checks.at(-1)!) &&
              (source.snapshot.settings.values.interactiveDice || source.snapshot.settings.values.difficulty.rerolls!=="disabled")){
              await store.checkpoint(lease,checkpoint,"awaiting_confirmation");return store.getPublic(input.campaignId,input.operationId);
            }
          }
          continue;
        }
        requireRule("call" in decision);
        if (decision.type === "final") {
          requireRule(decision.call === null);
          await recordStage("plan", "completed");
          await recordStage("final_validated", "entered");
          astra.finalProposal = validateFinal(selected,input,decision.final,astra.toolReceipts);
          if (decision.final.effects) {
            const compatible = modern ? planAstraCompatibleEffects(selected, input,
              decision.final.effects, astra.finalProposal.resolution) : null;
            const effects = compatible ? compatible.plan :
              planAstraOrderedEffects(selected,input,decision.final.effects,
                astra.finalProposal.resolution);
            if (effects) {
              checkpoint.astraEffects = effects;
              checkpoint.astraSettlement = null;
            }
            if (modern && responseMode === "public-unified") {
              checkpoint.narration = unifiedNarration(decision.final.publicNarration,
                decision.final.effects.length, compatible!.acceptedIndexes);
            }
          } else {
            if (decision.final.settlement)
              requireRule(legacySettlementKind(decision.final.settlement.kind));
            const settlement = planAstraSettlement(selected,input,decision.final.settlement,
              astra.finalProposal.resolution.changes);
            if (settlement) checkpoint.astraSettlement = settlement;
            if (modern && responseMode === "public-unified") {
              requireRule(!decision.final.settlement);
              checkpoint.narration = unifiedNarration(decision.final.publicNarration, 0, []);
            }
          }
          if (modern && responseMode === "public-unified") {
            assertNoPrivateDisclosure(disclosureSource,input,
              checkpoint.narration!.narration+"\n"+checkpoint.narration!.visualDescription,
              astra.toolReceipts);
            narrationParseSucceeded = true;
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
    // A public-unified final carries narration in the same checkpoint. A
    // private-informed operation keeps its separate public projection on resume.
    if (modern && responseMode === "public-unified") requireRule(checkpoint.narration);
    if (!checkpoint.narration) {
      await recordStage("narration_context", "entered");
      if (modern && responseMode === "private-informed" && !selectedPrivateMemory) {
        // A final-pinned retry skips private planning. Re-read the same scoped
        // evidence without summaries/provider work for the independent guard.
        const privateEvidence = await withUnifiedMemory(source,input,memory,true);
        disclosureSource = { ...source, memory: privateEvidence.memory };
      }
      const safe = modern ? projectAstraPublicSource(source,input,{forNarration:true})
        : safePublicSource(source,input);
      const selected = modern ? projectAstraPublicSource(
        await withUnifiedMemory(safe,input,memory,false),input,{forNarration:true})
        : await withMemory(safe,input,memory,false,{model:"gpt-6-astra",stage:"narrate"});
      const narrationResolution = checkpoint.astraEffects?.schemaVersion === 2
        ? checkpoint.astraEffects.resolution : final.resolution;
      let base: BuiltContext;
      try {
        base = buildContext(selected,input,"narrate",{model:"gpt-6-astra",
          resolution:narrationResolution,checks:checkpoint.checks});
      } catch (error) {
        if (modern && error instanceof ContextCapacityError)
          throw new ContextCapacityError(error.summaryMayHelp,true);
        throw error;
      }
      const effectsOutcome = effectsNarrationProjection(checkpoint.astraEffects ?? null);
      const settlementOutcome = settlementNarrationProjection(checkpoint.astraSettlement ?? null);
      const narrationInstructions = source.snapshot.campaign.language === "en"
        ? `${publicInstructions} ${naturalEnglishGuidance}` : publicInstructions;
      const extra: JsonObject = effectsOutcome ? {effectsOutcome} : settlementOutcome ? {settlementOutcome} : {};
      if(generic && checkpoint.astraGeneric){
        extra.stateContract="generic-v1";
        extra.genericOutcomes={acceptedOperationCount:checkpoint.astraGeneric.accepted.length};
        extra.observableBehavior=genericBehavior(source,genericManifest(source,input),checkpoint.astraGeneric.behavior);
      }
      const context = narrowContext(base,narrationInstructions,
        modern ? {...extra,responseContract:"unified-v1",responseMode:"private-informed"} :
          Object.keys(extra).length ? extra : undefined);
      await recordStage("narration_context", "completed");
      await recordStage("narration_provider", "entered");
      const priorReceipts = astra.toolReceipts.length;
      const priorChecks = checkpoint.checks.length;
      const pinnedFinal = astra.finalProposal;
      const response = await providerRequest(
        (observe) => provider.narrate(context,input,observe),
        () => astra.toolReceipts.length === priorReceipts &&
          checkpoint.checks.length === priorChecks && astra.finalProposal === pinnedFinal &&
          !checkpoint.narration,
        (diagnostic) => {
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
      assertNoPrivateDisclosure(disclosureSource,input,
        checkpoint.narration.narration+"\n"+checkpoint.narration.visualDescription,
        astra.toolReceipts);
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
  const stateContract=deps.store.astraStateContract?await deps.store.astraStateContract(input.campaignId,input.operationId):"legacy-state";
  const contract = deps.store.astraResponseContract
    ? await deps.store.astraResponseContract(input.campaignId, input.operationId) : undefined;
  const requestedContract = contract === "legacy-two-stage" || contract === undefined
    ? undefined : "unified-v1";
  const current = requireTurnTimeline(await deps.store.begin(input,ASTRA_PRIMARY_RUNTIME,requestedContract,
    stateContract==="legacy-state"?undefined:"generic-v1"),
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
