import type { TimelineFence } from "../saves/contracts.ts";

// Public boundary only. Exact manifests, source heads, private facts, character
// state and inventory remain in the existing Campaign/World authorities.
export type AdventurePacing = {
  kind: "quick" | "evening" | "mini_arc" | "custom" | "open";
  custom: string | null;
};
export type AdventureReview = {
  pacing: string | null;
  agency: string | null;
  rewards: string | null;
  payoff: string | null;
  notes: string | null;
};
export type PublicWorld = {
  id: string;
  versionId: string;
  version: number;
  title: string;
  premise: string;
  packVersionIds: string[];
  /** Stage 4 (UI_DATA_NEEDS #21); absent from older catalogs. */
  campaignCount?: number;
  rulesLabel?: string | null;
  hasVisualStyle?: boolean;
};
export type WorldCatalog = {
  worlds: PublicWorld[];
  packs: { versionId: string; title: string }[];
};
export type CampaignWorldBinding = {
  worldId: string;
  worldVersion: number;
  title: string;
};
export type AdventurePoint = { worldMinutes: number; sceneId: string | null };
export type PublicAdventure = {
  id: string;
  versionId: string;
  previousVersionId: string | null;
  version: number;
  campaignId: string;
  timelineId: string;
  worldId: string;
  worldVersion: number;
  title: string;
  premise: string;
  pacing: AdventurePacing;
  mode: "canon" | "detached";
  status: "prepared" | "active" | "completed" | "abandoned";
  start: AdventurePoint | null;
  completion: AdventurePoint | null;
  summary: string | null;
  review: AdventureReview | null;
  createdAt: string;
};
export type AdventureCatalog = {
  campaignId: string;
  timeline: TimelineFence;
  revision: number;
  runtimeRevision: number;
  expectedHeadId: string | null;
  worldBinding: CampaignWorldBinding | null;
  activeAdventureId: string | null;
  adventures: PublicAdventure[];
  history: PublicAdventure[];
  canChange: boolean;
  detachedPlayable: false;
  requiresOpening?: boolean;
};
export type AdventureSetup = {
  title: string;
  premise: string;
  pacing: AdventurePacing;
};
export type AdventureCommandBase = {
  requestId: string;
  campaignId: string;
  timeline: TimelineFence;
  expectedRevision: number;
  expectedRuntimeRevision: number;
  expectedHeadId: string | null;
};
export type AdventureVersionCommand = AdventureCommandBase & {
  adventureId: string;
  expectedAdventureVersion: number;
};
export type AdventureCommand =
  | {
      action: "bind";
      input: AdventureCommandBase & { worldId: string; worldVersion: number };
    }
  | {
      action: "prepare";
      input: AdventureCommandBase & AdventureSetup & { mode: "canon" };
    }
  | { action: "edit"; input: AdventureVersionCommand & AdventureSetup }
  | { action: "start"; input: AdventureVersionCommand }
  | {
      action: "end";
      input: AdventureVersionCommand & {
        summary: string | null;
        review: AdventureReview | null;
      };
    }
  | {
      action: "abandon";
      input: AdventureVersionCommand & { summary: string | null };
    }
  | {
      action: "review";
      input: AdventureVersionCommand & { review: AdventureReview };
    };
export type WorldCommand =
  | {
      action: "world_create";
      input: {
        requestId: string;
        title: string;
        premise: string;
        packVersionIds: string[];
      };
    }
  | {
      action: "new_campaign";
      input: {
        requestId: string;
        worldId: string;
        worldVersion: number;
        title: string;
        language: "en" | "ru";
        heroName: string;
        template: "console-basic-fighter-level1-v1";
      };
    };
export type AdventureResult = { requestId: string; snapshot: AdventureCatalog };
export type WorldResult = { requestId: string; world: PublicWorld };
export type NewHeroResult = {
  requestId: string;
  campaignId: string;
  heroId: string;
};
export type WorldCommandResult = WorldResult | NewHeroResult;

// Narrow adapter shape for the Lead-owned rpg_adventures SQL entry point.
// Read actions: worlds ({}, null campaign/timeline), read ({timeline}, scoped campaign).
// Writes: p_payload is command.input verbatim, p_timeline is its timeline or null.
// SQL authorizes owner/campaign, checks receipt equality before mutable fences,
// resolves all private exact source/start/completion refs and records versions.
export type AdventureRpc = (args: {
  p_owner_id: string;
  p_campaign_id: string | null;
  p_action:
    "worlds" | "read" | AdventureCommand["action"] | WorldCommand["action"];
  p_payload: unknown;
  p_timeline: TimelineFence | null;
}) => Promise<{
  data?: unknown;
  error?: { code?: string; message?: string } | null;
}>;
export type AdventureErrorCode =
  "validation" | "conflict" | "scope" | "not_found" | "unavailable";
export class AdventureServiceError extends Error {
  readonly code: AdventureErrorCode;
  constructor(code: AdventureErrorCode) {
    super(`Adventure ${code}`);
    this.code = code;
    this.name = "AdventureServiceError";
  }
}
