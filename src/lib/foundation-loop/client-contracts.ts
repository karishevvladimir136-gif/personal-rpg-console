// Allowlisted owner/player DTOs. No private snapshots, receipts or source content.
import type {
  FoundationCommand,
  RulesetProfileRef,
} from "../production/contracts.ts";
import type {
  CurrencyDefinition,
  ItemPolicy,
  MerchantDefinition,
  ProgressionTrack,
  RewardDefinition,
} from "./contracts.ts";
import type { CommerceProjection } from "../commerce/projection.ts";
import type { PublicProgression } from "../progression/public.ts";

export type FoundationLoopView = {
  /** Public routing capability only; the private takeover marker stays server-side. */
  postTakeover?: boolean;
  /** Public stock IDs whose current records fit the bounded Astra purchase path. */
  postTakeoverPurchasableItemIds?: string[];
  campaignId: string;
  /** Public, descriptive protagonist facts only; no World Actor or hidden knowledge DTO. */
  playerCharacter?: {
    entityId: string;
    capabilities: string[];
    limitations: string[];
  } | null;
  command: Omit<FoundationCommand, "operationId">;
  profile: RulesetProfileRef;
  stateVersion: number;
  commerce: CommerceProjection | null;
  progression: PublicProgression;
  availableRewards: { id: string; version: number; label: string }[];
  owner: {
    currencies: CurrencyDefinition[];
    itemPolicies: ItemPolicy[];
    merchants: MerchantDefinition[];
    progression: "off" | "on";
    tracks: ProgressionTrack[];
    rewards: RewardDefinition[];
    rewardIntegrity?: (Omit<
      import("../progression/reward-integrity-authority.ts").RewardIntegrityInput,
      "items"
    > & {
      items: {
        itemId: string;
        rarity: string;
        usablePower: number | null;
        narrativeSignificance: number;
      }[];
    })[];
    entities: { id: string; name: string; kind: string }[];
    storages: { id: string; name: string; entityId: string | null }[];
    items: {
      id: string;
      name: string;
      quantity: number;
      ownerEntityId: string | null;
      storageId: string;
    }[];
    sources: {
      kind: "quest" | "thread" | "event";
      id: string;
      label: string;
    }[];
  };
  history: { id: string; text: string; worldMinutes: number }[];
};
export type FoundationUiCommand = {
  command: FoundationCommand;
  kind:
    | "quote"
    | "trade"
    | "loot.configure"
    | "reward.integrity.configure"
    | "commerce.configure"
    | "progression.configure"
    | "progression.correct"
    | "reward"
    | "advancement"
    | "prepare";
  input: unknown;
};
