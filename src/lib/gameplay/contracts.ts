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
      action: "attack" | "defend" | "move" | "end-turn" | "intercept" | "item";
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
  requestId: string;
  campaignId: string;
  expectedRevision: number;
  configuration: MechanicsConfiguration;
};
export type TurnInput = {
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
};
export type GuidanceProposal = {
  id: string;
  text: string;
  status: "proposed" | "approved";
  scope: "session" | "campaign" | null;
  sessionId: string | null;
  documentRevision: number;
};
export type PublicTurn = {
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
  visualDescription: string | null;
  checks: VisibleCheck[];
  proposal: GuidanceProposal | null;
  failure: TurnFailure | null;
  canRetry: boolean;
  canCancel: boolean;
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
  requestId: string;
  campaignId: string;
  operationId: string;
  proposalId: string;
  scope: "session" | "campaign";
  sessionId: string | null;
  expectedGuideRevision: number;
};
export type GuidanceApprovalResult = {
  proposal: GuidanceProposal;
  revision: number;
};
