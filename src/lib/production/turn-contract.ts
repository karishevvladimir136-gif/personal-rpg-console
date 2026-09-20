import type {
  MechanicsResolution,
  TurnClaim,
} from "../gameplay/server-contracts.ts";
import type { WorldSettlement } from "./contracts.ts";

// Internal integration seam, never a provider or client-controlled settlement.
export type PreparedWorld = {
  settlement: WorldSettlement;
  resolution: MechanicsResolution;
} | null;
export type PrepareWorld = (
  claim: TurnClaim,
  resolution: MechanicsResolution,
  previous: WorldSettlement | null,
) => Promise<PreparedWorld>;
