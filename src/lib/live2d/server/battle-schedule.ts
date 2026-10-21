import "server-only";
import { after } from "next/server";
import { dossierService } from "../../server/dossier";
import { battleLocationOf } from "../battle/contracts";
import { prepareBattleMap } from "./battle";

// Fixes before session 3 (docs/stages/FIX_S3_PRE.md Part 3): the live fight had no painted background — the battle map
// reads the place's top-down picture, and nothing but a «battle.prepare» action asked for one, which no screen sent.
// Now a turn that starts a fight asks for it after the commit, off the turn's path: the place of the fight's
// battlefield, from its scene sheet; a place that already has its background, has no prepared scene, or is over the
// pictures' cap is left as it is (prepareBattleMap decides, LIVE2D_1 Part 2: «a new background only when a fight starts
// somewhere new»). Never fails the turn; text play never waits for it.

const log = (event: string, data: Record<string, unknown>) => console.info(JSON.stringify({ event, ...data }));

export function scheduleBattleBackground(ownerId: string, campaignId: string): void {
  const run = () => startBattleBackground(ownerId, campaignId);
  try { after(run); } catch { void run(); }
}

async function startBattleBackground(ownerId: string, campaignId: string): Promise<void> {
  try {
    const source = await (await dossierService(ownerId, campaignId)).source();
    const locationId = battleLocationOf(source.runtime.encounters);
    if (!locationId) return log("live2d_battle_skipped", { campaignId, reason: "no_place" });
    const result = await prepareBattleMap(campaignId, { locationId });
    log("live2d_battle_requested", { campaignId, locationId, status: result.status });
  } catch (error) {
    log("live2d_battle_skipped", { campaignId, reason: String((error as Error)?.message ?? error).slice(0, 200) });
  }
}
