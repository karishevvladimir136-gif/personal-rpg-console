import type { CampaignSnapshot } from "../persistence/contracts.ts";
import type { SavesSnapshot } from "../saves/contracts.ts";
import type { LabCatalog, LabStatus } from "../world-lab/contracts.ts";

// Only already-authorized public DTOs may enter this read model. This is not
// an adapter for raw event, manifest, memory, or resolver records.
export type TimelineSources = {
  snapshot: CampaignSnapshot;
  saves?: SavesSnapshot | null;
  lab?: LabCatalog | null;
};
export type TimelineMoment = {
  key: string;
  kind: "scene" | "save" | "checkpoint";
  title: string;
  text: string;
  time:
    { kind: "order"; ordinal: number } | { kind: "recorded"; minutes: number };
  session: { id: string; title: string; recap: string } | null;
  role: "narration" | "player" | "note" | null;
  place: string | null;
  // Existing public scene/checkpoint sources have no historical actor or
  // consequence associations. Do not derive them from names inside prose.
  actors: null;
  consequences: null;
  saveId: string | null;
  checkpointId: string | null;
  events: { text: string; minutes: number }[];
};
export type TimelineBranch = {
  key: string;
  label: string;
  kind: "playable" | "lab";
  active: boolean;
  status: LabStatus | null;
  model: string | null;
  parent: { key: string | null; label: string | null } | null;
  base: {
    saveId: string | null;
    label: string | null;
    minutes: number | null;
  } | null;
  children: { key: string; label: string; kind: "playable" | "lab" }[];
  moments: TimelineMoment[];
};
export type TimelineExplorerProjection = {
  campaignId: string;
  campaignTitle: string;
  activeKey: string;
  sourcesAligned: boolean;
  branches: TimelineBranch[];
  currentDirectory: {
    actors: string[];
    places: string[];
    quests: { title: string; status: "open" | "complete" | "archived" }[];
  };
};
export type TimelineFilters = {
  kind?: TimelineMoment["kind"];
  search?: string;
  sessionId?: string;
  reverse?: boolean;
};
