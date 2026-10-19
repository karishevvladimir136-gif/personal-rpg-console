// The writer + bookkeeper runtime (polish 3 §2): a campaign chooses it in its DM
// settings («Ведущий»); runCampaignTurn / resumeCampaignTurn dispatch a turn to it
// or to the default loop. The bake-off's server flag is gone.
export { runTwoPassTurn, resumeTwoPassTurn, executeTwoPassTurn, runCampaignTurn, resumeCampaignTurn, bookkeeperOf, bookkeeperStart,
  writerEffort, writerToolset, bookkeeperToolset, TWO_PASS_RUNTIME, FABLE_WRITER_EFFORT,
  type TwoPassDependencies, type TwoPassBookkeeper, type BookkeeperSelection, type CampaignTurnDependencies, type TwoPassObservation } from "./runtime.ts";
export { writerSystem, bookkeeperSystem, bookkeeperBrief, splitLedger, createLedgerGate, rejectedCallsMessage, LEDGER_OPEN, LEDGER_CLOSE,
  LEDGER_MAX_CHARS, BOOKKEEPER_MARKER } from "./prompts.ts";
