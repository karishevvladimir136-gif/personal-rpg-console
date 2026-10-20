import "server-only";
import { listTurnSnapshots, readTurnSnapshot } from "./turn-snapshots";
import { dmViewOf, type DmView } from "../gameplay/dm-loop/dm-view";

/** Fix run A5: «Что видит ведущий» for the campaign's last committed turn (or the one asked for). */
export async function readDmView(campaignId: string, turnNo?: number): Promise<DmView | null> {
  const list = await listTurnSnapshots(campaignId);
  const latest = [...list.snapshots].sort((a, b) => b.turnNo - a.turnNo)[0];
  const which = turnNo ?? latest?.turnNo;
  if (!which) return null;
  const row = await readTurnSnapshot(campaignId, { turnNo: which });
  return dmViewOf(row.payload.source, row.payload.input, row.turnNo);
}
