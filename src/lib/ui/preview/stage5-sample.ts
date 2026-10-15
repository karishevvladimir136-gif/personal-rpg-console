// The shape every synthetic Stage 5 preview campaign provides.
import type { Campaign, CampaignSnapshot } from "../../persistence/contracts.ts";
import type { PlaySnapshot } from "../../gameplay/contracts.ts";
import type { LiveTurnView } from "../../gameplay/live-turn-client.ts";
import type { PublicAdventure } from "../../adventures/contracts.ts";
import type { DmSettings } from "../../gameplay/dm-loop/settings.ts";

export type PreviewSample = {
  key: "shov" | "noir";
  /** The interface language the sample is shown in by default. */
  language: "en" | "ru";
  snapshot: () => CampaignSnapshot;
  play: (options?: { combat?: boolean }) => PlaySnapshot;
  live: (language: "en" | "ru") => LiveTurnView;
  adventure: () => PublicAdventure | null;
  dmSettings: DmSettings;
  library: Campaign[];
  /** Sample art by subject ID; previews only. */
  images: Record<string, string>;
  /** Subjects shown in the "drawing" state. */
  drawing: Set<string>;
  figure: string | null;
  atlas: string | null;
  /** A companion to open the talk drawer with in the Party preview. */
  talkTo: string | null;
};
