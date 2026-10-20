import type { TimelineFence } from "../saves/contracts.ts";
// Lead-owned PUBLIC transport contract. Never add private fields or provider payloads.
export type Json =
  null | boolean | number | string | Json[] | { [key: string]: Json };
export type JsonObject = { [key: string]: Json };
export type TurnMode = "game" | "companion" | "feedback" | "ooc" | "mechanic";
export type TurnStatus =
  | "pending"
  | "generating"
  | "awaiting_confirmation"
  | "committed"
  | "failed"
  | "cancelled";
export type TurnFailure =
  | "configuration"
  | "provider"
  | "context"
  | "validation"
  | "conflict"
  | "unavailable";
export type ItemQuantity = { itemId: string; quantity: number };
export type EncounterOutcome =
  "victory" | "escape" | "surrender" | "negotiation" | "objective-completion";
export type MechanicChoice =
  | {
      kind: "resource.spend";
      entityId: string;
      resource: string;
      amount: number;
    }
  | { kind: "item.consume"; actorId: string; itemId: string; quantity: number }
  | {
      kind: "item.transfer";
      actorId: string;
      itemId: string;
      quantity: number;
      destinationStorageId: string;
    }
  | { kind: "item.equip"; actorId: string; itemId: string; slot: string | null }
  | {
      kind: "quest.transition";
      questId: string;
      status: "open" | "complete" | "archived";
    }
  | { kind: "location.move"; locationId: string }
  | { kind: "encounter.start"; participantIds: string[] }
  | {
      kind: "encounter.action";
      actorId: string;
      action: "attack" | "attempt" | "defend" | "move" | "end-turn" | "intercept" | "item";
      targetId: string | null;
      itemId: string | null;
      position: "nearby" | "far" | "cover" | null;
    }
  | { kind: "encounter.end"; outcome: EncounterOutcome }
  | { kind: "rest.enter"; restKind: "short" | "long"; participantIds: string[] }
  | { kind: "rest.leave"; restId: string }
  | { kind: "rest.complete"; restId: string; supplies: ItemQuantity[] }
  | {
      kind: "recipe.prepare";
      actorId: string;
      recipe: "meal" | "coffee";
      ingredients: ItemQuantity[];
      outputStorageId: string;
    }
  | {
      kind: "recipe.serve";
      actorId: string;
      itemId: string;
      recipientIds: string[];
    }
  | {
      kind: "item.transform";
      actorId: string;
      recipe: "improvised-spear";
      inputs: ItemQuantity[];
      toolIds: string[];
      outputStorageId: string;
    }
  | { kind: "forage"; actorId: string; outputStorageId: string };
export type ItemTag =
  | "supply"
  | "meat"
  | "coffee"
  | "water"
  | "knife"
  | "stick"
  | "binding"
  | "cutting-tool"
  | "weapon"
  | "healing"
  | "meal-serving"
  | "coffee-serving";
export type ItemRule = { itemId: string; tag: ItemTag; damage: number | null };
export type MechanicsConfiguration = {
  profile: "console-basic-v1";
  controlledEntityIds: string[];
  presentEntityIds: string[];
  nearbyStorageIds: string[];
  safeLocationIds: string[];
  itemRules: ItemRule[];
};
export type ConfigurePlayInput = {
  // Optional only for legacy unfenced fixtures; live Phase 3.5 projections include it.
  timeline?: TimelineFence;
  requestId: string;
  campaignId: string;
  expectedRevision: number;
  configuration: MechanicsConfiguration;
};
export type TurnInput = {
  // Optional only for legacy unfenced fixtures; live Phase 3.5 projections include it.
  timeline?: TimelineFence;
  operationId: string;
  campaignId: string;
  expectedRevision: number;
  mode: TurnMode;
  input: string;
  companionId: string | null;
  listenerIds: string[];
  mechanic: MechanicChoice | null;
};
export type ResumeInput = {
  // Optional only for legacy unfenced fixtures; live Phase 3.5 projections include it.
  timeline?: TimelineFence;
  commandId: string;
  campaignId: string;
  operationId: string;
  action: "retry" | "continue" | "reroll" | "cancel";
  checkId: string | null;
};
export type VisibleCheck = {
  id: string;
  kind: "skill" | "attack" | "save" | "transform";
  actorId: string;
  actorName: string;
  dice: number[];
  kept: number;
  modifier: number;
  total: number;
  success: boolean;
  dc: number | null;
  advantage: "normal" | "advantage" | "disadvantage";
  interactive: boolean;
  canReroll: boolean;
  rollNumber: number;
  /** Polish group 2: the moment in words (the DM's reason), the bonuses and their
   * sources, why advantage was granted, the difficulty in words, a natural 20 or 1. */
  reason?: string | null;
  bonuses?: { source: string; value: number }[];
  advantageReason?: string | null;
  difficulty?: "easy" | "normal" | "hard" | "very_hard" | "nearly_impossible" | null;
  natural?: "crit" | "fumble" | null;
  /** Fix run C: every part of the modifier with its own source (sums to `modifier`); absent on older checks. */
  addends?: { source: string; value: number; kind: "sheet" | "gear" | "fiction" | "formula" | "cap" }[];
};
export type GuidanceProposal = {
  teachingCandidate?: import("../dm-craft/contracts.ts").TeachingCandidate | null;
  id: string;
  text: string;
  status: "proposed" | "approved" | "rejected";
  scope: "session" | "campaign" | "campaign_style" | "global_craft" | null;
  sessionId: string | null;
  documentRevision: number;
};
export type PublicTurn = {
  /** Public narration scene written by this committed turn, for inline media. */
  narrationSceneId?: string | null;
  worldRecovery?: "available" | "review_required" | null;
  worldUncertainty?:
    "missing_evidence" | "contradiction" | "unsupported" | null;
  // Optional only for legacy unfenced fixtures; live Phase 3.5 projections include it.
  timeline?: TimelineFence;
  id: string;
  campaign_id: string;
  session_id: string | null;
  mode: TurnMode;
  input: string;
  companionId: string | null;
  listenerIds: string[];
  status: TurnStatus;
  expectedRevision: number;
  committedRevision: number | null;
  settingsRevision: number;
  created_at: string;
  updated_at: string;
  narration: string | null;
  /** Stage C: a paused dm-loop turn's text told so far (the player read it as it streamed); absent otherwise. */
  told?: string | null;
  visualDescription: string | null;
  checks: VisibleCheck[];
  proposal: GuidanceProposal | null;
  failure: TurnFailure | null;
  canRetry: boolean;
  canCancel: boolean;
  /** Committed dm-loop-v1 turns (Stage 4, UI_DATA_NEEDS #1, #2): the public
   * receipt summaries, the player moment and the scene kinds of the finish. */
  /** `at`: where in the narration the change was made (Stage C; rolls only, absent on older turns). */
  changes?: { tool: string; ok: true; summary: string; action?: string; at?: number }[];
  playerMoment?: boolean;
  /** Polish: the accepted roll's reason the moment rests on («Ворот Мокея»). */
  playerMomentReason?: string | null;
  sceneKinds?: string[];
  spotlight?: string[];
  threads?: string[];
  nextTension?: "calm" | "tense" | "climax" | null;
  /** Owner-facing numbers of the turn (UI_DATA_NEEDS #5); no private content. */
  stats?: { requests: number; latencyMs: number; firstTextMs: number | null; costUsd: number; cacheReadShare: number | null; rejectedCalls: number; effort: string | null;
    /** Polish items 13–14: the first word from the player's send; the depth chosen and why. */
    firstWordMs?: number | null; depthReason?: string | null; depthTension?: string | null;
    /** Fix run A3: why a turn over $1 or four requests was expensive (no private content). */
    expensiveCauses?: string[];
    /** Fix run A6: what the ledger checker still found unrecorded after the correction («не записано: …»), and its cost (included in costUsd). */
    unrecorded?: string[]; checkerUsd?: number };
};
export type RestRecord = {
  id: string;
  campaign_id: string;
  kind: "short" | "long";
  status: "planned" | "interrupted" | "complete";
  settings_revision: number;
  public_outcome: JsonObject;
  created_at: string;
};
export type RecipeRecord = {
  id: string;
  campaign_id: string;
  name: string;
  ingredients: Json[];
  effect_definition: JsonObject;
};
export type EffectRecord = {
  id: string;
  campaign_id: string;
  entity_id: string;
  recipe_id: string | null;
  definition: JsonObject;
};
export type EncounterRecord = {
  id: string;
  campaign_id: string;
  status: "prepared" | "active" | "ended";
  round: number;
  outcome: EncounterOutcome | null;
  settings_revision: number;
  public_summary: string;
  /** 2D Live part 2: the battlefield (grid, features, the active turn, the log); absent or {} when the fight has no map. */
  public_field?: JsonObject;
};
export type EncounterParticipant = {
  id: string;
  campaign_id: string;
  encounter_id: string;
  entity_id: string | null;
  public_name: string;
  turn_order: number;
  public_position: JsonObject;
  public_resources: JsonObject;
};
export type PendingAction = {
  id: string;
  campaign_id: string;
  encounter_id: string;
  participant_id: string;
  status: "proposed" | "confirmed" | "resolved" | "cancelled";
  public_proposal: JsonObject;
};
export type Conversation = {
  id: string;
  campaign_id: string;
  entity_id: string;
  entries: Json[];
  created_at: string;
};
export type ApprovedGuidance = {
  id: string;
  campaign_id: string;
  session_id: string;
  text: string;
  created_at: string;
};
export type ProvenanceRecord = {
  id: string;
  campaign_id: string;
  operation_id: string;
  session_id: string;
  inputs: Array<
    ItemQuantity & { disposition: "consumed" | "embedded" | "retained" }
  >;
  outputItemIds: string[];
};
export type PlaySnapshot = {
  rulesetId?: "console-basic-v1" | "world-logic-v1";
  /** Public readiness only; the private takeover marker never enters this DTO. */
  startupPending?: boolean;
  // Optional only for legacy unfenced fixtures; live Phase 3.5 projections include it.
  timeline?: TimelineFence;
  campaignId: string;
  revision: number;
  configured: boolean;
  model: string | null;
  configuration: MechanicsConfiguration | null;
  worldMinutes: number;
  turns: PublicTurn[];
  restRecords: RestRecord[];
  recipes: RecipeRecord[];
  effects: EffectRecord[];
  encounters: EncounterRecord[];
  participants: EncounterParticipant[];
  pendingActions: PendingAction[];
  conversations: Conversation[];
  sessionGuidance: ApprovedGuidance[];
  provenance: ProvenanceRecord[];
};
export type GuidanceApprovalInput = {
  // Optional only for legacy unfenced fixtures; live Phase 3.5 projections include it.
  timeline?: TimelineFence;
  requestId: string;
  campaignId: string;
  operationId: string;
  proposalId: string;
  scope: "session" | "campaign";
  sessionId: string | null;
  expectedGuideRevision: number;
};
export type GuidanceApprovalResult = {
  // Optional only for legacy unfenced fixtures; live Phase 3.5 projections include it.
  timeline?: TimelineFence;
  proposal: GuidanceProposal;
  revision: number;
};
