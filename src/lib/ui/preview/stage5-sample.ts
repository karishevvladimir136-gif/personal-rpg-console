// The shape every synthetic Stage 5 preview campaign provides.
import type { Campaign, CampaignSnapshot } from "../../persistence/contracts.ts";
import type { PlaySnapshot } from "../../gameplay/contracts.ts";
import type { LiveTurnView } from "../../gameplay/live-turn-client.ts";
import type { PublicAdventure } from "../../adventures/contracts.ts";
import type { DmSettings } from "../../gameplay/dm-loop/settings.ts";
import type { MapPlacement } from "../../map/placement-contracts.ts";
import type { WorldCatalog } from "../../adventures/contracts.ts";
import type { PictureBoard } from "../../visual-frame/pictures.ts";

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
  placements: MapPlacement[];
  /** A place to preset as the course on the Map preview. */
  course: string | null;
  worlds: WorldCatalog;
  /** A companion to open the talk drawer with in the Party preview. */
  talkTo: string | null;
  /** Stage V: the sample picture board (anchors, frames, style) and its images by picture ID. */
  pictures: { board: PictureBoard; images: Record<string, string> };
};
