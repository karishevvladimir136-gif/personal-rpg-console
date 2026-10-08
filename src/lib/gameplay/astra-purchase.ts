import type { TurnInput, PublicTurn } from "./contracts.ts";
import type { TurnStore, TurnCheckpoint } from "./server-contracts.ts";
import { planAstraSettlement, type AstraSettlementIntent } from "./astra-settlement.ts";
import { requireRule } from "./turn-errors.ts";
import { safeTurnFailure, TurnError } from "./turn-errors.ts";
import { isDeepStrictEqual } from "node:util";

/** Explicit recorded-stock purchase. The player authorizes the quote; the
 * existing Astra turn, pinned settlement and runtime_change commit own the
 * result. No model or World authoring pass is involved. */
export async function commitRecordedPurchase(
  store: TurnStore, input: TurnInput,
  intent: Extract<AstraSettlementIntent,{kind:"mundane_purchase"}>,
  publicItemName: string,
): Promise<PublicTurn> {
  const started = await store.begin(input,"astra-primary-v1");
  if (started.status === "committed" || started.status === "cancelled" ||
    started.status === "awaiting_confirmation" ||
    (started.status === "failed" && !started.canRetry)) return started;
  const claim = await store.claim(input.campaignId,input.operationId);
  if (!claim) return store.getPublic(input.campaignId,input.operationId);
  const {source,lease} = claim;
  try {
    requireRule(claim.runtimeIdentity === "astra-primary-v1" &&
      !!source.worldTakeover && input.mode === "game" &&
      source.runtime.revision === input.expectedRevision);
    const checkpoint: TurnCheckpoint = structuredClone(claim.turn.checkpoint);
    requireRule(checkpoint.astraPrimary &&
      checkpoint.astraPrimary.toolReceipts.length === 0 &&
      checkpoint.checks.length === 0);
    if (!checkpoint.astraPrimary.finalProposal) {
      const settlement = planAstraSettlement(source,input,intent,[]);
      requireRule(settlement?.kind === "mundane_purchase" &&
        settlement.publicOutcome.item?.name === publicItemName);
      const resolution = {changes:[],worldMinutes:source.runtime.worldMinutes,
        configuration:source.runtime.configuration,outcomes:[]};
      checkpoint.astraPrimary.finalProposal = {schemaVersion:1,
        campaignId:input.campaignId,operationId:input.operationId,
        expectedRevision:input.expectedRevision,input:input.input,
        resolution,privatePatches:[],toolRefs:[]};
      checkpoint.astraSettlement = settlement;
      checkpoint.resolution = resolution;
      const cost = settlement.publicOutcome.currency;
      const name = settlement.publicOutcome.item;
      checkpoint.narration = {narration:
        `You buy ${name.quantity} ${name.name} for ${Math.abs(cost!.amount)} ${cost!.name}.`,
        visualDescription:"",clarification:null};
      await store.checkpoint(lease,checkpoint,"generating");
    }
    requireRule(checkpoint.astraPrimary.finalProposal &&
      checkpoint.narration && checkpoint.astraSettlement?.kind === "mundane_purchase" &&
      isDeepStrictEqual(checkpoint.astraSettlement.intent,intent));
    const final = checkpoint.astraPrimary.finalProposal;
    return await store.commit(lease,{narration:checkpoint.narration.narration,
      visualDescription:checkpoint.narration.visualDescription,
      resolution:final.resolution,privatePatches:final.privatePatches,
      checks:checkpoint.checks,guidanceProposal:null});
  } catch(error) {
    const safe=safeTurnFailure(error);
    try {return await store.fail(lease,safe.code,safe.retryable);}
    catch {throw new TurnError(safe.code,safe.retryable);}
  }
}
