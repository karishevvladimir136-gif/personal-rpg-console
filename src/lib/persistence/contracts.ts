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
  /** Stage 4 (UI_DATA_NEEDS #17, #19, pins). Optional in older fixtures. */
  play_minutes?: number;
  status?: "active" | "finished";
  player_likes?: string;
  /** Polish item 15: the DM's observations of what the player enjoys (the DM writes it; the player's own words stay in player_likes). */
  dm_likes?: string;
  theme?: string;
  pinned_facts?: PinnedFact[];
};
/** An owner-pinned fact: always in front of the DM (plan §11). */
export type PinnedFact = { id: string; text: string; source: { kind: "entity" | "quest" | "location" | "scene" | "item"; id: string } | null; at: string };
/** What the hero knows about a person or faction (UI_DATA_NEEDS #6–#9, #11, #12). Public only. */
export type PublicProfile = {
  relation?: { group: "family" | "ally" | "murky" | "neutral" | "foe"; note: string };
  important?: boolean;
  /** A companion's observable attitude toward the hero. */
  attitude?: { text: string; lastNoticed: string };
  /** Faction records: the public note and the hero's standing with it. */
  faction?: { publicNote: string; relation: "ally" | "neutral" | "foe" | "unknown" };
  /** Membership of a person in a faction (entity ID of the faction record). */
  factionId?: string;
  /** Where this person lives when not with the party (location ID). */
  homePlaceId?: string;
  /** Holding details of a transport, base or mount. */
  holding?: { features: { name: string; description: string }[]; armament: string; passengers: string[] };
  /** Fix run D: the counters' names in the campaign language (key → label); no screen shows a raw key. */
  counterLabels?: Record<string, string>;
  /** Polish: recorded by the DM ahead of the story; the hero has not met them yet,
   * so the player's screens keep them out until the narration names them. */
  unmet?: boolean;
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
  kind: "player" | "companion" | "npc" | "transport" | "mount" | "faction";
  name: string;
  details: string;
  hp: number | null;
  max_hp: number | null;
  stats: Record<string, number>;
  resources: Record<string, number>;
  conditions: string[];
  equipment_slots: EquipmentSlot[];
  /** Reviewed public profile. Historical entities and saves omit it or use NULL. */
  character_sheet?: import("../adventures/bootstrap-contracts.ts").CharacterSheetV1 | import("../inventory/sheet.ts").CharacterSheetV2 | null;
  /** Stage 4: hero-knowledge projection (never Character Model text). */
  public_profile?: PublicProfile;
  /** Fix S3-accept Г3: a person's 5e numbers (AC, saves, attack, proficiency) the server derived for the public read;
   * never stored, never sent back. */
  derived?: import("../live2d/battle/rules-5e.ts").DerivedSheet;
};
export type Storage = ScopedRow & {
  name: string;
  kind: "player" | "companion" | "camp" | "transport" | "merchant" | "place";
  entity_id: string | null;
  /** Stage 4 (#12): a base's holding details. Fix run D: a place pile's location and any storage's coins. */
  detail?: { holding?: PublicProfile["holding"] & { kind: "base"; description: string }; locationId?: string; wallet?: Record<string, number> };
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
  /** Stage 4 (#13): significance of the item, when the DM set it. */
  rarity?: "common" | "relic" | "magic" | "story" | null;
  /** Polish item 20: where a thing went and what happened to it — pledged or
   * lent (the owner keeps title, the holder has it), lost, and its history. */
  detail?: ItemDetail;
};
export type ItemDetail = {
  status?: "pledged" | "lent" | "lost";
  holderId?: string;
  condition?: string;
  note?: string;
  history?: { at: number; event: string; note: string }[];
};
export type Session = ScopedRow & {
  title: string;
  status: "open" | "closed";
  recap: string;
  /** Polish item 11: the closing stinger «Тем временем…» the digest wrote (empty until then). */
  stinger?: string;
  /** Fix run E (item 81): how the session closed, by its length (empty until the digest; older rows omit it). */
  ending?: SessionEnding | Record<string, never>;
};
/** The session's ending: «что было» after a short session, the ending cards after a long one; the open threads;
 * the in-world channel that carried «Тем временем». Only what the hero knows. */
export type SessionEnding = {
  version: 1;
  form: "short" | "cards";
  /** Short form: what happened, a few lines. */
  lines: string[];
  /** Long form: one card per person or group met this session; «неизвестно» where the hero does not know. */
  cards: { entityId: string | null; name: string; where: string; standing: string; fate: string }[];
  threads: string[];
  /** How «Тем временем» reached the hero's world («донесение капитану стражи»); empty when there is none. */
  channel: string;
  turns: number;
  playMinutes: number;
};
export type Scene = ScopedRow & {
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
export type QuestKind = "quest" | "thread" | "debt" | "promise" | "arc";
export type QuestDetail = {
  /** The main arc's steps (kind "arc"). */
  steps?: { text: string; done: boolean }[];
  /** Places tied to the goal (UI_DATA_NEEDS #10). */
  locationIds?: string[];
  /** Session in which the thread, debt or promise was opened. */
  sinceSessionId?: string | null;
  /** Who the debt or promise is owed to / by, as the hero knows it (entity ID). */
  counterpartId?: string | null;
};
export type Quest = ScopedRow & {
  title: string;
  description: string;
  status: "open" | "complete" | "archived";
  /** Stage 4 (#3, #4): quests, threads, debts, promises and the main arc share the record. */
  kind?: QuestKind;
  detail?: QuestDetail;
};
export type Location = ScopedRow & {
  name: string;
  description: string;
  status: "known" | "visited" | "rumored";
  /** Stage 4 (#10): quests whose goal is here. Polish group 9: the parent place the DM named and
   * where this place sits in words («на краю гавани»); the map lays the marker out by itself. */
  detail?: { questIds?: string[]; parentId?: string; whereabouts?: string };
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
export type EntityInput = Omit<Entity, keyof ScopedRow>;
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
