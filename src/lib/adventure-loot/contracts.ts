import type { Item, ItemInput } from "../persistence/contracts.ts";
import type {
  ItemPolicy,
  LoopContext,
  LoopPlan,
} from "../foundation-loop/contracts.ts";
import type { RecordedCheck } from "../gameplay/server-contracts.ts";
import type { RulesetProfileRef } from "../production/contracts.ts";

// Server-only domain contracts. All definitions come from trusted profile/owner
// content; none are model patches or a second inventory/reward state store.
export type SecuredObjectFact = {
  schemaVersion: 1;
  campaignId: string;
  id: string;
  revision: number;
  storageId: string;
  locationId: string;
  ownerEntityId: string;
  label: string;
  access: "open" | "closed" | "locked" | "sealed" | "jammed" | "broken";
  lockClass: string | null;
  structureClass: string | null;
  environmentTags: string[];
  portable: boolean | null;
  contentsEstablished: boolean;
  materializationId: string | null;
  knownBy: string[];
  contentsKnownBy: string[];
};
export type LootItemDefinition = {
  key: string;
  visible: Omit<
    ItemInput,
    "storage_id" | "owner_entity_id" | "equipped_entity_id" | "equipped_slot"
  >;
  commerce: Omit<ItemPolicy, "itemId" | "version">;
  private: {
    trueIdentity: string | null;
    properties: string[];
    provenance: string | null;
    usableCapabilities: string[];
  };
  fragile: boolean;
};
export type TrustedLootPolicy = {
  schemaVersion: 1;
  campaignId: string;
  objectId: string;
  id: string;
  version: number;
  profile: RulesetProfileRef;
  discoveryCheck: {
    index: number;
    stat: "skill" | "attack" | "save";
    dc: number;
  } | null;
  contents: LootItemDefinition[];
  approaches: {
    id: string;
    capability: string;
    from: SecuredObjectFact["access"][];
    lockClass: string | null;
    structureClass: string | null;
    environmentTags: string[];
    requiresPortable: boolean;
    requiredItemIds: string[];
    resourceCost: { resource: string; amount: number } | null;
    check: {
      index: number;
      stat: "skill" | "attack" | "save";
      dc: number;
    } | null;
    to: "open" | "broken";
    noise: boolean;
    fragileLoss: number;
  }[];
};
export type LootIntent =
  | { kind: "search"; actorId: string; objectId: string }
  | { kind: "access"; actorId: string; objectId: string; approachId: string }
  | {
      kind: "take";
      actorId: string;
      objectId: string;
      itemId: string;
      quantity: number;
      destinationStorageId: string;
    };
export type LootResolution = {
  policy: TrustedLootPolicy;
  checks: RecordedCheck[];
};
export type LootPlanResult =
  | { status: "planned"; plan: LoopPlan }
  | { status: "paused"; reason: "unsupported" | "review_required" };
export type PublicLootObject = {
  id: string;
  campaign_id: string;
  label: string;
  access: SecuredObjectFact["access"];
  lockClass: string | null;
  structureClass: string | null;
  environmentTags: string[];
  portable: boolean | null;
  contents:
    | Pick<
        Item,
        "id" | "name" | "quantity" | "category" | "description" | "mechanics"
      >[]
    | null;
};
export type LootLoop = LoopContext;
