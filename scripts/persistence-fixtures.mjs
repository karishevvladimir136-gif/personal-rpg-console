import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const projectConfig = readFileSync(new URL("../supabase/config.toml", import.meta.url), "utf8");
const apiConfig = projectConfig.split("[api]")[1]?.split(/\r?\n\[/)[0];
const ownerApiPort = apiConfig?.match(/^port\s*=\s*(\d+)\s*$/m)?.[1];
if (!ownerApiPort) throw new Error("Could not identify the normal local Supabase port.");

export const testOptIn =
  "CREATE_SYNTHETIC_RECORDS_IN_DISPOSABLE_LOCAL_DATABASE";
export function testConfig() {
  if (process.env.RPG_ALLOW_DISPOSABLE_TESTS !== testOptIn)
    throw new Error(
      "Explicit disposable-test opt-in is required. See SUPABASE_SETUP.md.",
    );
  const required = [
    "SUPABASE_URL",
    "RPG_TEST_OWNER_EMAIL",
    "RPG_TEST_OWNER_PASSWORD",
  ];
  if (!process.env.SUPABASE_PUBLISHABLE_KEY && !process.env.SUPABASE_ANON_KEY)
    required.push("SUPABASE_PUBLISHABLE_KEY");
  const missing = required.filter((name) => !process.env[name]);
  if (missing.length)
    throw new Error(`Missing test configuration: ${missing.join(", ")}`);
  const url = new URL(process.env.SUPABASE_URL);
  if (
    !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) ||
    url.protocol !== "http:"
  )
    throw new Error(
      "This script only permits a disposable local Supabase URL. It will not seed a hosted project.",
    );
  // Keep the former owner address protected during the local port transition too.
  if ([ownerApiPort, "54321"].includes(url.port))
    throw new Error(
      "Synthetic acceptance cannot target the normal owner Supabase project. Start a separate disposable project and use its API port.",
    );
  return {
    url: url.origin,
    key: process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY,
  };
}
export function testClient(config) {
  return createClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
export async function signInTestOwner(config) {
  const client = testClient(config);
  const { error } = await client.auth.signInWithPassword({
    email: process.env.RPG_TEST_OWNER_EMAIL,
    password: process.env.RPG_TEST_OWNER_PASSWORD,
  });
  if (error) throw new Error("Disposable test owner could not sign in.");
  const owner = await client.rpc("rpg_is_owner");
  if (owner.error || owner.data !== true)
    throw new Error("Disposable test account is not the registered owner.");
  return client;
}
export async function apply(
  client,
  operation,
  campaignId,
  payload,
  revision = 0,
  requestId = crypto.randomUUID(),
) {
  const response = await client.rpc("rpg_apply_mutation", {
    p_request_id: requestId,
    p_operation: operation,
    p_campaign_id: campaignId,
    p_expected_revision: revision,
    p_payload: payload,
  });
  if (response.error)
    throw new Error(
      `Synthetic mutation failed (${operation}; code ${response.error.code || "unavailable"}).`,
    );
  return response.data;
}
export async function seedSynthetic(client) {
  const existing = await client.from("rpg_campaigns").select("id").limit(1);
  if (existing.error)
    throw new Error(
      "Could not inspect the target schema. Apply migrations and register the owner first.",
    );
  if (existing.data.length)
    throw new Error(
      "Seeding refused: target already contains a campaign. No data was changed.",
    );
  const results = [];
  for (const [index, title, subtitle, name] of [
    [
      0,
      "Synthetic · Tidal Observatory",
      "Invented ocean survey; no real campaign material",
      "Neri",
    ],
    [
      1,
      "Synthetic · Copper Orchard",
      "Unrelated invented rural mystery",
      "Olan",
    ],
  ]) {
    const campaign = await apply(client, "campaign.create", null, {
      title,
      subtitle,
      language: index ? "ru" : "en",
    });
    const cid = campaign.id;
    const entity = await apply(client, "entity.save", cid, {
      kind: "player",
      name: `Synthetic ${name}`,
      details: "Invented test record",
      hp: 8,
      max_hp: 10,
      stats: { resolve: 2 },
      resources: { focus: 2 },
      conditions: [],
      equipment_slots: [{ id: "hand", label: "Hand", accepts: ["tool"] }],
    });
    const storage = await apply(client, "storage.save", cid, {
      name: `${name} pack`,
      kind: "player",
      entity_id: entity.id,
    });
    const item = await apply(client, "item.save", cid, {
      name: index ? "Copper lens" : "Tide ruler",
      category: "tool",
      quantity: 1,
      description: "Invented test item",
      mechanics: "Owner-written manual record",
      owner_entity_id: entity.id,
      storage_id: storage.id,
      equipped_entity_id: entity.id,
      equipped_slot: "hand",
    });
    const document = await apply(client, "document.save", cid, {
      title: "Synthetic setting notes",
      status: "canon",
      body: `Entirely invented ${subtitle.toLowerCase()}.`,
    });
    const session = await apply(client, "session.save", cid, {
      title: "Synthetic session one",
      status: "open",
      recap: "Owner-written invented recap.",
    });
    const scene = await apply(client, "scene.save", cid, {
      session_id: session.id,
      title: "Arrival",
      body: "An invented arrival, written manually. No AI ran.",
      role: "narration",
    });
    const location = await apply(client, "location.save", cid, {
      name: index ? "Copper orchard" : "Tidal tower",
      description: "Synthetic location",
      status: "visited",
    });
    await apply(
      client,
      "state.save",
      cid,
      {
        summary: "Synthetic saved arrival",
        current_session_id: session.id,
        current_scene_id: scene.id,
        current_location_id: location.id,
      },
      1,
    );
    await apply(client, "quest.save", cid, {
      title: "Inspect the invented site",
      description: "Synthetic open objective",
      status: "open",
    });
    await apply(client, "entity.save", cid, {
      kind: "npc",
      name: index ? "Synthetic orchard keeper" : "Synthetic surveyor",
      details: "Invented known contact",
      hp: null,
      max_hp: null,
      stats: {},
      resources: {},
      conditions: [],
      equipment_slots: [],
    });
    results.push({
      campaign,
      entity,
      storage,
      item,
      document,
      session,
      scene,
      location,
    });
  }
  return results;
}
