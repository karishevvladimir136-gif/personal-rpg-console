import type { TradeIntent } from "../foundation-loop/contracts.ts";
import type { RecordedCheck } from "../gameplay/server-contracts.ts";

/** A semantic proposal only. Values, entitlement and success come from code. */
export type FoundationActionProposal =
  | {
      schemaVersion: 1;
      action: "loot";
      input: string;
      intent: import("../adventure-loot/contracts.ts").LootIntent;
    }
  | {
      schemaVersion: 1;
      action: "quote" | "trade";
      input: string;
      intent: TradeIntent;
      // An exact condition requested by the player, never a price override.
      // Positive means player pays; negative means merchant pays.
      expectedPayment: number | null;
    }
  | {
      schemaVersion: 1;
      action: "haggle";
      input: string;
      merchantActorId: string;
      playerEntityId: string;
      checkIndex: number | null;
    }
  | {
      schemaVersion: 1;
      action: "theft" | "robbery";
      input: string;
      merchantActorId: string;
      playerEntityId: string;
      take: { itemId: string; quantity: number }[];
      currency: { currencyId: string; amount: number } | null;
      checkIndex: number | null;
      // A coarse public closure, requiring its own established capability.
      // Stealth/detection, injury and death are never inferred from this field.
      merchantUnavailable: boolean;
    };

/** Internal normal-Game boundary. Never construct this from provider output.
 * The turn service supplies its authenticated actor, original input, validated
 * profile outcome/capability references and server-recorded current rolls. */
export type FoundationActionAuthorization = {
  input: string;
  actorId: string;
  profile: "world_logic" | "console_basic";
  checks: RecordedCheck[];
  outcome: "completed" | "blocked";
  uncertainty:
    "resolved" | "missing_evidence" | "contradiction" | "unsupported";
  capabilities: string[];
};

export type TransferAction = "theft" | "robbery";
export type TransferOption = {
  action: TransferAction;
  merchantActorId: string;
  itemId: string | null;
  currencyId: string | null;
  maximum: number;
  capability: string | null;
};

/** Exact public/current options. No private inventory, merchant funds, source
 * evidence, detection state, World Threads, or future facts enter this DTO. */
export type FoundationActionContext = {
  schemaVersion: 1;
  actorId: string;
  profile: FoundationActionAuthorization["profile"];
  currencies: { id: string; label: string; balance: number }[];
  inventory: {
    id: string;
    name: string;
    quantity: number;
    currencyId: string;
    tradable: boolean;
    stolen: boolean;
  }[];
  merchants: {
    actorId: string;
    label: string;
    currencyIds: string[];
    acceptsStolen: boolean;
    stock: {
      id: string;
      name: string;
      quantity: number;
      currencyId: string;
      unitPrice: number;
      tradable: boolean;
    }[];
  }[];
  haggleOptions: { merchantActorId: string; capability: string | null }[];
  transferOptions: TransferOption[];
  merchantUnavailableOptions: { merchantActorId: string; capability: string }[];
  constraints: string[];
};
