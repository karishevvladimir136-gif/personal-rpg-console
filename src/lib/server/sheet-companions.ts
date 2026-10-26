import "server-only";
import { randomUUID } from "node:crypto";
import type { Mutation } from "../persistence/contracts";
import { entityPayload } from "../inventory/owner-moves.ts";
import { sheetCompanionCorrections } from "../adventures/sheet-records.ts";
import { applyMutation, readCampaign } from "./repository";

/** Fix S4 11l (companions included): after the opening is committed, a companion it brought in at the house baseline
 * (HP 8, AC 10) takes the HP and AC the hero's sheet states for it — the cat at 2 HP and AC 12 — through the ordinary
 * validated owner-correction save, so the party line and the sheet agree from the first turn. */
export async function applySheetCompanions(campaignId: string) {
  const snapshot = await readCampaign(campaignId);
  for (const row of sheetCompanionCorrections(snapshot)) {
    const entity = snapshot.entities.find((candidate) => candidate.id === row.entity.id);
    if (!entity) continue;
    await applyMutation({ requestId: randomUUID(), operation: "entity.save", campaignId, expectedRevision: entity.revision, timeline: snapshot.timeline,
      correctionScope: "timeline", payload: { ...entityPayload(entity), hp: row.hp, max_hp: row.hp, stats: { ...entity.stats, defense: row.defense } } } as Mutation);
  }
}
