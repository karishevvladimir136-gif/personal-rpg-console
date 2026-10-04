import type {
  MechanicsResolution,
  TurnClaim,
  ProviderUsage,
} from "../gameplay/server-contracts.ts";
import type { WorldSettlement } from "./contracts.ts";
import type { JsonObject } from "../gameplay/contracts.ts";
import type { MundanePublicDetail } from "../rulesets/world-logic-contracts.ts";
import type { NaturalMechanicIntent } from "../rulesets/natural-mechanics.ts";

// Internal integration seam, never a provider or client-controlled settlement.
export type PreparedWorld = {
  settlement: WorldSettlement;
  resolution: MechanicsResolution;
  usage?: ProviderUsage[];
} | null;
export type PrepareWorld = (
  claim: TurnClaim,
  resolution: MechanicsResolution,
  previous: WorldSettlement | null,
) => Promise<PreparedWorld>;

// Returns null for the exact legacy profile. The ordinary turn engine retains
// persistence, checks, narration and atomic commit ownership for both paths.
export type PrepareWorldLogic = (
  claim: TurnClaim,
  previous: JsonObject | null,
) => Promise<{
  proposal: JsonObject | null;
  mechanicIntent?: NaturalMechanicIntent;
  foundationAction?: JsonObject | null;
  resolution: MechanicsResolution | null;
  usage: ProviderUsage | null;
  mundaneDetail?: MundanePublicDetail;
  presence?: { controlledEntityIds: string[]; presentEntityIds: string[] };
} | null>;
