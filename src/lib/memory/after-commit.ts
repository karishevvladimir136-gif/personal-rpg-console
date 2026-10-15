import type { PublicTurn } from "../gameplay/contracts.ts";
import type { TurnStore } from "../gameplay/server-contracts.ts";
import type { TimelineFence } from "../saves/contracts.ts";
import type { MemoryStore, SummaryProvider } from "./server-contracts.ts";
import { maintainAstraMemoryAfterCommit } from "./lifecycle.ts";

/** Observe this execution only. Committed-operation replay never calls commit,
 * so it cannot schedule another paid maintenance pass. No extra state read or
 * maintenance RPC belongs on the successful foreground response path. */
export async function runWithAstraMemoryMaintenance(store: TurnStore,
  memory: MemoryStore, summaries: SummaryProvider, timeline: TimelineFence,
  execute: (observedStore: TurnStore) => Promise<PublicTurn>,
  after: (callback: () => Promise<void>) => void): Promise<PublicTurn> {
  let committed = false;
  const observedStore: TurnStore = { ...store, commit: async (lease, packet) => {
    const result = await store.commit(lease, packet);
    committed = result.status === "committed";
    return result;
  } };
  const result = await execute(observedStore);
  if (committed) {
    try { after(async () => {
      try {
        if (await store.astraResponseContract?.(result.campaign_id, result.id) !== "unified-v1") return;
        await maintainAstraMemoryAfterCommit(result.campaign_id, memory, summaries, timeline);
      } catch {
        console.info(JSON.stringify({ event: "memory_work_pending", category: "unavailable" }));
      }
    }); } catch {
      console.info(JSON.stringify({ event: "memory_work_pending", category: "unavailable" }));
    }
  }
  return result;
}
