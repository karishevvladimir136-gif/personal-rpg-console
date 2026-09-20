// Lead-owned Wave 4 contracts. Types only; private context is never a client DTO.
import type { FoundationCommand, FoundationSnapshot, CommittedWorldEvent, RulesetProfileRef } from "../production/contracts.ts";
import type { CampaignSnapshot } from "../persistence/contracts.ts";
import type { RecordChange } from "../gameplay/server-contracts.ts";
import type { WorldState } from "../world/contracts.ts";

export type CurrencyDefinition = { id: string; label: string; resourceKey: string; version: number };
export type ItemPolicy = {
  itemId: string; version: number; currencyId: string; unitValue: number;
  trade: "allowed" | "restricted" | "quest"; origin: "legitimate" | "stolen";
  visibility: "public" | "private";
};
export type MerchantDefinition = {
  actorId: string; entityId: string; version: number; label: string;
  storageId: string; currencyIds: string[]; available: boolean;
  acceptsStolen: boolean; usesFunds: boolean; capacity: number | null;
  buyBasisPoints: number; sellBasisPoints: number; haggleLimitBasisPoints: number;
};
export type AdvancementOption = { id: string; label: string; capability: string };
export type ProgressionTrack = {
  id: string; version: number; label: string; kind: "classic_xp" | "milestone" | "generic";
  thresholds: number[]; choices: AdvancementOption[];
};
export type CharacterProgress = { entityId: string; trackId: string; value: number; rank: number; unlocks: string[] };
export type PendingAdvancement = { id: string; entityId: string; trackId: string; trackVersion: number; rank: number; options: AdvancementOption[] };
export type RewardEntry =
  | { kind: "progression"; trackId: string; amount: number }
  | { kind: "currency"; currencyId: string; amount: number }
  | { kind: "item"; itemId: string; quantity: number };
export type RewardSource = { kind: "quest" | "thread" | "event"; id: string };
export type RewardDefinition = {
  id: string; version: number; label: string; source: RewardSource;
  distribution: "actor" | "party_equal"; recipientIds: string[]; entries: RewardEntry[];
};
export type PreparationOrigin = {
  bindingId: string; packVersionId: string; packEntityId: string;
  entityId: string; actorId: string; sourceVersionIds: string[];
  aliases: string[]; limitations: string[]; ownerDescription: string;
};
export type FoundationLoopState = {
  schemaVersion: 1; version: number; profile: RulesetProfileRef;
  progression: "off" | "on";
  currencies: CurrencyDefinition[]; itemPolicies: ItemPolicy[]; merchants: MerchantDefinition[];
  tracks: ProgressionTrack[]; rewards: RewardDefinition[];
  progress: CharacterProgress[]; pending: PendingAdvancement[];
  preparations: PreparationOrigin[];
};
export type LoopContext = {
  foundation: FoundationSnapshot; state: FoundationLoopState;
  snapshot: CampaignSnapshot; world: WorldState;
  // Current inherited Events plus same-timeline vaulted reward receipts, never sibling future history.
  events: CommittedWorldEvent[];
};
export type LoopEvent = {
  kind: string; visibility: "public" | "private"; text: string;
  actorIds: string[]; threadIds: string[]; payload: Record<string, unknown>;
};
export type LoopPlan = {
  state: FoundationLoopState; world: WorldState; changes: RecordChange[]; events: LoopEvent[];
};
export type TradeIntent = {
  merchantActorId: string; playerEntityId: string;
  // Merchant gives these existing item quantities; player gives the offer quantities.
  take: { itemId: string; quantity: number }[];
  give: { itemId: string; quantity: number }[];
  currencyId: string;
  haggle: "none" | "favorable";
};
export type TradeQuote = {
  schemaVersion: 1; id: string; command: FoundationCommand;
  intent: TradeIntent; profile: RulesetProfileRef; stateVersion: number; merchantVersion: number;
  lines: { itemId: string; direction: "take" | "give"; quantity: number; itemRevision: number; policyVersion: number; unitValue: number; totalValue: number }[];
  // Positive: player pays merchant; negative: merchant pays player.
  payment: number; modifierBasisPoints: number;
};
export type PreparationEntityEdit = {
  packEntityId: string; selected: boolean; name: string; aliases: string[];
  kind: "npc" | "group" | "faction" | "location";
  description: string; capabilities: string[]; limitations: string[];
  merchant: boolean; merchantLabel: string;
};
export type PreparationThreadEdit = {
  id: string; selected: boolean; title: string; goal: string;
  entityIds: string[]; policy: "background" | "surface_before_complete";
};
export type PreparationDraft = {
  schemaVersion: 1; bindingId: string; packVersionId: string;
  entities: PreparationEntityEdit[]; threads: PreparationThreadEdit[];
};
