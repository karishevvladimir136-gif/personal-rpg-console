import "server-only";
import { after } from "next/server";
import { dossierService } from "./dossier";
import { fightNotes, foldWrites, proposeFolds } from "../gameplay/dm-loop/note-fold";
import { privateNotes, serializeNote, HIDDEN_LAYER_KEY } from "../gameplay/dm-loop/private-notes";

/** Fix run B2 (2): after a turn that ended a fight, its notes fold in the background (never on the turn's path). */
export function scheduleFightFold(ownerId: string, campaignId: string, operationId: string): void {
  const run = () => foldFightNotes(ownerId, campaignId, operationId);
  try { after(run); } catch { void run(); }
}

async function foldFightNotes(ownerId: string, campaignId: string, operationId: string): Promise<void> {
  try {
    const dossier = await dossierService(ownerId, campaignId);
    const source = await dossier.source();
    const notes = fightNotes(privateNotes(source.privateState, (_kind, key) => key === HIDDEN_LAYER_KEY || key.startsWith("plan_") ||
      key.startsWith("quest_reward_") || key.startsWith("holding_") || ["notebook", "notebook_session", "ledger", "variety", "metrics", "depth_state"].includes(key)),
      source.runtime.worldMinutes);
    const result = await proposeFolds(process.env.ANTHROPIC_API_KEY ?? "", notes, source.snapshot.settings.values.language === "ru" ? "ru" : "en");
    if (result.folds.length) {
      const writes = foldWrites(result.folds, notes, operationId.slice(0, 8), source.runtime.worldMinutes, serializeNote);
      await dossier.privateNotes(writes, source.timeline);
    }
    console.info(JSON.stringify({ event: "fight_notes_folded", campaignId, operationId, notes: notes.length, folds: result.folds.length,
      folded: result.folds.reduce((sum, fold) => sum + fold.keys.length, 0), costUsd: result.costUsdMicros / 1_000_000, error: result.error }));
  } catch (error) {
    console.info(JSON.stringify({ event: "fight_notes_fold_failed", campaignId, operationId, message: error instanceof Error ? error.message.slice(0, 200) : String(error) }));
  }
}
