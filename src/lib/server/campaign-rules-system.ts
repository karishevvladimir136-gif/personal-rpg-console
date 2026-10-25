import "server-only";
import { randomUUID } from "node:crypto";
import type { PublicWorld } from "../adventures/contracts";
import type { Mutation } from "../persistence/contracts";
import { creationRulesSystemSave, detectRulesSystem } from "../rulesets/rules-system.ts";
import { applyMutation, readCampaign } from "./repository";

/** Fix S3 item 3: a just-created campaign whose world names D&D 5e or Pathfinder gets that rules system — the label of
 * its rules setting through the ordinary validated settings save; the ruleset id the turn path reads stays. */
export async function applyWorldRulesSystem(campaignId: string, world: Pick<PublicWorld, "title" | "premise">) {
  if (!detectRulesSystem(`${world.title}\n${world.premise}`)) return;
  const save = creationRulesSystemSave(await readCampaign(campaignId), world);
  if (save) await applyMutation({ ...save, requestId: randomUUID() } as Mutation);
}
