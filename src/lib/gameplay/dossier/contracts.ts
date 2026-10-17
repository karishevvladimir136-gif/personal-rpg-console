// The dossier's owner-facing records (stage 4): pinned facts, the player-likes
// note, the theme question, the campaign status and play time (public,
// campaign-level), and the DM prep notebook (private; shown to the owner only
// through the campaign's notebookVisible setting).
import type { PinnedFact } from "../../persistence/contracts.ts";

export type DossierView = {
  campaignId: string;
  pinned: PinnedFact[];
  /** The player's own words (the wizard and the owner's edits; the DM never rewrites them). */
  playerLikes: string;
  /** The DM's observations (finish_turn and the digest; polish item 15). */
  dmLikes: string;
  theme: string;
  status: "active" | "finished";
  playMinutes: number;
  revision: number;
};
export type NotebookView = { campaignId: string; notebook: string | null; digestedSessionId: string | null };

export type DossierRpc = (args: {
  p_owner_id: string; p_campaign_id: string; p_action: string; p_payload: unknown; p_timeline: unknown;
}) => Promise<{ data: unknown; error?: { message?: string; code?: string } | null }>;

export class DossierError extends Error {
  constructor(readonly code: "validation" | "unavailable") { super(code); this.name = "DossierError"; }
}

export function parseDossier(value: unknown): DossierView {
  if (!value || typeof value !== "object") throw new DossierError("unavailable");
  const v = value as Record<string, unknown>;
  if (typeof v.campaignId !== "string" || !Array.isArray(v.pinned) || typeof v.playerLikes !== "string" || typeof v.theme !== "string" ||
    (v.status !== "active" && v.status !== "finished") || !Number.isSafeInteger(v.playMinutes) || !Number.isSafeInteger(v.revision))
    throw new DossierError("unavailable");
  const pinned = v.pinned.filter((pin): pin is PinnedFact => !!pin && typeof pin === "object" && typeof (pin as PinnedFact).id === "string" && typeof (pin as PinnedFact).text === "string");
  return { campaignId: v.campaignId, pinned, playerLikes: v.playerLikes, dmLikes: typeof v.dmLikes === "string" ? v.dmLikes : "", theme: v.theme, status: v.status, playMinutes: v.playMinutes as number, revision: v.revision as number };
}

export function parseNotebook(value: unknown): NotebookView {
  if (!value || typeof value !== "object") throw new DossierError("unavailable");
  const v = value as Record<string, unknown>;
  if (typeof v.campaignId !== "string") throw new DossierError("unavailable");
  return { campaignId: v.campaignId, notebook: typeof v.notebook === "string" ? v.notebook : null,
    digestedSessionId: typeof v.digestedSessionId === "string" ? v.digestedSessionId : null };
}
