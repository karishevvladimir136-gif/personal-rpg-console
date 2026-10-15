import type { TimelineFence, CorrectionScope } from "../saves/contracts.ts";
import type { CampaignSettings } from "../campaign-settings.ts";
import type { Language } from "../i18n.ts";
import type { CampaignPremiseInput } from "../production/premise-contracts.ts";

// Public DTOs only. No DM-private shape, value, identifier, or service credential belongs here.
export type Revision = { revision: number; updated_at: string };
export type ScopedRow = Revision & { id: string; campaign_id: string };
export type Campaign = ScopedRow & {
  title: string;
  subtitle: string;
  language: Language;
};
export type Preferences = Revision & {
  language: Language;
  largeText: boolean;
  suggestions: boolean;
};
export type SettingsRecord = Revision & {
  campaign_id: string;
  values: CampaignSettings;
};
export type SettingsRevision = {
  id: string;
  campaign_id: string;
  revision: number;
  values: CampaignSettings;
  created_at: string;
};
export type DocumentRecord = ScopedRow & {
  title: string;
  status: "canon" | "reference" | "archived";
  current_version_id: string;
  body: string;
};
export type DocumentVersion = {
  id: string;
  campaign_id: string;
  document_id: string;
  version: number;
  title: string;
  status: DocumentRecord["status"];
  body: string;
  restored_from: string | null;
  created_at: string;
};
export type EquipmentSlot = { id: string; label: string; accepts: string[] };
export type Entity = ScopedRow & {
  kind: "player" | "companion" | "npc" | "transport" | "mount";
  name: string;
  details: string;
  hp: number | null;
  max_hp: number | null;
  stats: Record<string, number>;
  resources: Record<string, number>;
  conditions: string[];
  equipment_slots: EquipmentSlot[];
  /** Reviewed public profile. Historical entities and saves omit it or use NULL. */
  character_sheet?: import("../adventures/bootstrap-contracts.ts").CharacterSheetV1 | null;
};
export type Storage = ScopedRow & {
  name: string;
  kind: "player" | "companion" | "camp" | "transport" | "merchant" | "ground";
  entity_id: string | null;
  location_id?: string | null;
  locale_key?: string | null;
};
export type Item = ScopedRow & {
  name: string;
  category: string;
  quantity: number;
  description: string;
  mechanics: string;
  owner_entity_id: string | null;
  storage_id: string;
  equipped_entity_id: string | null;
  equipped_slot: string | null;
};
export type Session = ScopedRow & {
  title: string;
  status: "open" | "closed";
  recap: string;
};
export type Scene = ScopedRow & {
  /** Public incidental continuity; no private cognition or gameplay write authority. */
  public_continuity?: import("../gameplay/astra-natural-continuity.ts").SceneContinuityV1 | null;
  sequence: number;
  session_id: string;
  title: string;
  body: string;
  role: "narration" | "player" | "note";
  settings_revision: number;
  created_at: string;
};
export type PublicState = Revision & {
  campaign_id: string;
  summary: string;
  current_session_id: string | null;
  current_scene_id: string | null;
  current_location_id: string | null;
};
export type Quest = ScopedRow & {
  title: string;
  description: string;
  status: "open" | "complete" | "archived";
};
export type Location = ScopedRow & {
  name: string;
  description: string;
  status: "known" | "visited";
};
export type Asset = ScopedRow & {
  title: string;
  kind: "image" | "video" | "document";
  storage_path: string | null;
  description: string;
};
export type Workspace = { campaigns: Campaign[]; preferences: Preferences };
export type DmFeedbackMessage = {
  sequence: number;
  id: string;
  campaign_id: string;
  body: string;
  created_at: string;
};
export type CampaignSnapshot = {
  // Optional only for legacy unfenced fixtures; live Phase 3.5 projections include it.
  timeline?: TimelineFence;
  campaign: Campaign;
  settings: SettingsRecord;
  settingsHistory: SettingsRevision[];
  documents: DocumentRecord[];
  entities: Entity[];
  storages: Storage[];
  items: Item[];
  sessions: Session[];
  scenes: Scene[];
  publicState: PublicState;
  quests: Quest[];
  locations: Location[];
  assets: Asset[];
  feedback: DmFeedbackMessage[];
  dmGuideDocumentId: string;
};
export type EntityInput = Omit<Entity, keyof ScopedRow | "character_sheet">;
export type StorageInput = Omit<Storage, keyof ScopedRow>;
export type ItemInput = Omit<Item, keyof ScopedRow>;
export type SessionInput = Omit<Session, keyof ScopedRow>;
export type SceneInput = Omit<
  Scene,
  keyof ScopedRow | "created_at" | "settings_revision" | "sequence"
>;
type Save<T> = T & { id?: string };
type Request = { requestId: string; expectedRevision: number };
type CampaignRequest = Request & {
  campaignId: string;
  timeline?: TimelineFence;
  correctionScope?: CorrectionScope;
};
export type Mutation =
  | (CampaignRequest & {
      operation: "feedback.send";
      payload: { body: string };
    })
  | (Request & {
      operation: "campaign.create";
      payload: {
        title: string;
        subtitle: string;
        language: Language;
        premise?: CampaignPremiseInput;
      };
    })
  | (CampaignRequest & {
      operation: "campaign.save";
      payload: { title: string; subtitle: string };
    })
  | (Request & {
      operation: "preferences.save";
      payload: Pick<Preferences, "language" | "largeText" | "suggestions">;
    })
  | (CampaignRequest & {
      operation: "settings.save";
      payload: CampaignSettings;
    })
  | (CampaignRequest & {
      operation: "document.save";
      payload: Save<{
        title: string;
        status: DocumentRecord["status"];
        body: string;
      }>;
    })
  | (CampaignRequest & {
      operation: "document.restore";
      payload: { id: string; versionId: string };
    })
  | (CampaignRequest & { operation: "entity.save"; payload: Save<EntityInput> })
  | (CampaignRequest & {
      operation: "storage.save";
      payload: Save<StorageInput>;
    })
  | (CampaignRequest & { operation: "item.save"; payload: Save<ItemInput> })
  | (CampaignRequest & {
      operation: "session.save";
      payload: Save<SessionInput>;
    })
  | (CampaignRequest & { operation: "scene.save"; payload: Save<SceneInput> })
  | (CampaignRequest & {
      operation: "state.save";
      payload: Omit<PublicState, keyof Revision | "campaign_id">;
    })
  | (CampaignRequest & {
      operation: "quest.save";
      payload: Save<Omit<Quest, keyof ScopedRow>>;
    })
  | (CampaignRequest & {
      operation: "location.save";
      payload: Save<Omit<Location, keyof ScopedRow>>;
    })
  | (CampaignRequest & {
      operation: "asset.save";
      payload: Save<Omit<Asset, keyof ScopedRow>>;
    });
export type MutationResult = {
  // Optional only for legacy unfenced fixtures; live Phase 3.5 projections include it.
  timeline?: TimelineFence;
  id: string;
  campaign_id?: string;
  revision: number;
};
export type MutationInput = Mutation extends infer M
  ? M extends Mutation
    ? Omit<M, "requestId">
    : never
  : never;
export type ErrorCode =
  | "unauthenticated"
  | "forbidden"
  | "not_configured"
  | "validation"
  | "conflict"
  | "not_found"
  | "unavailable";
export type ApiError = { error: { code: ErrorCode; message: string } };
export const defaultPreferences: Preferences = {
  language: "en",
  largeText: false,
  suggestions: false,
  revision: 0,
  updated_at: "",
};
