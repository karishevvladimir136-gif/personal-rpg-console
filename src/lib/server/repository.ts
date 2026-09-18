import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CampaignSnapshot,
  DocumentVersion,
  Mutation,
  MutationResult,
  Workspace,
} from "../persistence/contracts";
import { defaultPreferences } from "../persistence/contracts";
import {
  isUuid,
  validateMutation,
  ValidationError,
} from "../persistence/validation";
import { requireOwner } from "./auth";
import { databaseError, PersistenceError } from "./errors";
import { collectPages } from "./pagination";

// Explicit projections are a privacy boundary. Adding a database column never exposes it by default.
const base = "id,campaign_id,revision,updated_at";
const columns = {
  campaigns: `${base},title,subtitle,language`,
  settings: "campaign_id,revision,updated_at,values",
  settings_revisions: "id,campaign_id,revision,values,created_at",
  documents: `${base},title,status,current_version_id,body`,
  entities: `${base},kind,name,details,hp,max_hp,stats,resources,conditions,equipment_slots`,
  storages: `${base},name,kind,entity_id`,
  items: `${base},name,category,quantity,description,mechanics,owner_entity_id,storage_id,equipped_entity_id,equipped_slot`,
  sessions: `${base},title,status,recap`,
  scenes: `${base},session_id,title,body,role,settings_revision,created_at`,
  public_state:
    "campaign_id,revision,updated_at,summary,current_session_id,current_scene_id,current_location_id",
  quests: `${base},title,description,status`,
  locations: `${base},name,description,status`,
  assets: `${base},title,kind,storage_path,description`,
  dm_feedback: "id,campaign_id,body,created_at",
  dm_guides: "campaign_id,document_id",
};
// Supabase caps a response page. Traverse complete ordered collections rather than
// silently omitting older sessions, messages, or immutable document versions.
async function rows(
  client: SupabaseClient,
  table: string,
  projection: string,
  filters: Record<string, string> = {},
  order = "id",
  ascending = true,
): Promise<Record<string, unknown>[]> {
  return collectPages(async (start, end) => {
    let query = client.from(table).select(projection);
    for (const [key, value] of Object.entries(filters))
      query = query.eq(key, value);
    query = query.order(order, { ascending });
    if (order !== "id" && projection.split(",").includes("id"))
      query = query.order("id");
    const response = await query.range(start, end);
    if (response.error) throw databaseError(response.error);
    const page = response.data as unknown as Record<string, unknown>[];
    return page;
  });
}
function id(value: string) {
  if (!isUuid(value)) throw new PersistenceError("not_found");
}
export async function readWorkspace(): Promise<Workspace> {
  const { client, user } = await requireOwner();
  const [campaigns, preferences] = await Promise.all([
    rows(client, "rpg_campaigns", columns.campaigns, {}, "updated_at", false),
    client
      .from("rpg_preferences")
      .select("revision,updated_at,language,largeText,suggestions")
      .eq("owner_id", user.id)
      .maybeSingle(),
  ]);
  if (preferences.error) throw databaseError(preferences.error);
  return {
    campaigns,
    preferences: preferences.data ?? defaultPreferences,
  } as unknown as Workspace;
}
export async function readCampaign(
  campaignId: string,
): Promise<CampaignSnapshot> {
  id(campaignId);
  const { client } = await requireOwner();
  const campaign = await client
    .from("rpg_campaigns")
    .select(columns.campaigns)
    .eq("id", campaignId)
    .maybeSingle();
  if (campaign.error) throw databaseError(campaign.error);
  if (!campaign.data) throw new PersistenceError("not_found");
  const names = [
    "settings",
    "settings_revisions",
    "documents",
    "entities",
    "storages",
    "items",
    "sessions",
    "scenes",
    "public_state",
    "quests",
    "locations",
    "assets",
    "dm_feedback",
    "dm_guides",
  ] as const;
  const results = await Promise.all(
    names.map((name) =>
      rows(
        client,
        `rpg_${name}`,
        columns[name],
        { campaign_id: campaignId },
        name === "settings_revisions"
          ? "revision"
          : name === "settings" ||
              name === "public_state" ||
              name === "dm_guides"
            ? "campaign_id"
            : name === "scenes" || name === "dm_feedback"
              ? "created_at"
              : "id",
      ),
    ),
  );
  const data = Object.fromEntries(
    names.map((name, index) => [name, results[index]]),
  );
  if (!data.settings?.[0] || !data.public_state?.[0] || !data.dm_guides?.[0])
    throw new PersistenceError("unavailable");
  return {
    campaign: campaign.data,
    settings: data.settings[0],
    settingsHistory: data.settings_revisions,
    documents: data.documents,
    entities: data.entities,
    storages: data.storages,
    items: data.items,
    sessions: data.sessions,
    scenes: data.scenes,
    publicState: data.public_state[0],
    quests: data.quests,
    locations: data.locations,
    assets: data.assets,
    feedback: data.dm_feedback,
    dmGuideDocumentId: data.dm_guides[0].document_id,
  } as unknown as CampaignSnapshot;
}
export async function readDocumentVersions(
  campaignId: string,
  documentId: string,
): Promise<DocumentVersion[]> {
  id(campaignId);
  id(documentId);
  const { client } = await requireOwner();
  const document = await client
    .from("rpg_documents")
    .select("id")
    .eq("campaign_id", campaignId)
    .eq("id", documentId)
    .maybeSingle();
  if (document.error) throw databaseError(document.error);
  if (!document.data) throw new PersistenceError("not_found");
  return (await rows(
    client,
    "rpg_document_versions",
    "id,campaign_id,document_id,version,title,status,body,restored_from,created_at",
    { campaign_id: campaignId, document_id: documentId },
    "version",
    false,
  )) as unknown as DocumentVersion[];
}
export async function applyMutation(value: unknown): Promise<MutationResult> {
  const { client } = await requireOwner();
  let input: Mutation;
  try {
    input = validateMutation(value);
  } catch (error) {
    if (error instanceof ValidationError)
      throw new PersistenceError("validation");
    throw error;
  }
  const result = await client.rpc("rpg_apply_mutation", {
    p_request_id: input.requestId,
    p_operation: input.operation,
    p_campaign_id: "campaignId" in input ? input.campaignId : null,
    p_expected_revision: input.expectedRevision,
    p_payload: input.payload,
  });
  if (result.error) throw databaseError(result.error);
  const data = result.data as MutationResult | null;
  if (!data || !isUuid(data.id) || !Number.isInteger(data.revision))
    throw new PersistenceError("unavailable");
  return {
    id: data.id,
    revision: data.revision,
    ...(data.campaign_id ? { campaign_id: data.campaign_id } : {}),
  };
}
