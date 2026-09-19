// Internal type-only interface; no private snapshot DTO is client-accessible.
import type { CampaignSnapshot } from "../persistence/contracts.ts";
import type {
  CreateSaveInput,
  LoadSaveInput,
  SavePolicyInput,
  SaveResult,
  SavesSnapshot,
  SwitchTimelineInput,
  TimelineFence,
} from "./contracts.ts";

export interface SaveStore {
  read(campaignId: string): Promise<SavesSnapshot>;
  fence(campaignId: string): Promise<TimelineFence>;
  campaign(campaignId: string): Promise<CampaignSnapshot>;
  create(input: CreateSaveInput): Promise<SaveResult>;
  load(input: LoadSaveInput): Promise<SaveResult>;
  switchTimeline(input: SwitchTimelineInput): Promise<SaveResult>;
  policy(input: SavePolicyInput): Promise<SaveResult>;
}
