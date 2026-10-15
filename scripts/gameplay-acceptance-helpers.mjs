// Local-only synthetic acceptance. Never logs credentials, cookies or provider payloads.
import assert from "node:assert/strict";
import { createServerClient } from "@supabase/ssr";
import { testConfig } from "./persistence-fixtures.mjs";
import { requirePreviewBase } from "../tests/preview-target.mjs";

export const privateMarker = "SYNTHETIC_PRIVATE_PHASE2_CANARY";
export function acceptanceEnvironment() {
  const config = testConfig();
  // Explicit isolated server only; port 3000 (the owner app) needs an opt-in.
  const url = new URL(requirePreviewBase());
  assert.ok(["127.0.0.1", "localhost"].includes(url.hostname));
  assert.equal(url.protocol, "http:");
  return { config, base: url.origin };
}

export function httpSession(base) {
  const jar = new Map();
  return {
    jar,
    async request(path, payload, expected = 200, origin = base) {
      const headers = {
        cookie: [...jar].map(([name, value]) => `${name}=${value}`).join("; "),
      };
      if (payload !== undefined)
        Object.assign(headers, { "content-type": "application/json", origin });
      const response = await fetch(base + path, {
        method: payload === undefined ? "GET" : "POST",
        headers,
        body: payload === undefined ? undefined : JSON.stringify(payload),
        redirect: "manual",
      });
      for (const cookie of response.headers.getSetCookie()) {
        const pair = cookie.split(";")[0];
        const split = pair.indexOf("=");
        if (pair.slice(split + 1))
          jar.set(pair.slice(0, split), pair.slice(split + 1));
        else jar.delete(pair.slice(0, split));
      }
      const text = await response.text();
      assert.ok(
        !text.includes(privateMarker),
        "Synthetic private marker leaked",
      );
      assert.equal(
        response.status,
        expected,
        `${path}: unexpected HTTP status`,
      );
      assert.match(response.headers.get("cache-control") || "", /no-store/);
      const result = JSON.parse(text);
      if (expected >= 400) {
        assert.deepEqual(Object.keys(result), ["error"]);
        assert.deepEqual(Object.keys(result.error).sort(), ["code", "message"]);
        assert.equal(result.error.code, result.error.message);
      }
      return result;
    },
  };
}
export const credentials = (role) => ({
  email: process.env[`RPG_TEST_${role}_EMAIL`],
  password: process.env[`RPG_TEST_${role}_PASSWORD`],
});
export async function authenticatedNonowner(config, base) {
  const session = httpSession(base);
  const client = createServerClient(config.url, config.key, {
    cookies: {
      getAll: () => [...session.jar].map(([name, value]) => ({ name, value })),
      setAll: (values) =>
        values.forEach(({ name, value }) => session.jar.set(name, value)),
    },
  });
  const { error } = await client.auth.signInWithPassword(
    credentials("NONOWNER"),
  );
  assert.ok(!error, "Synthetic non-owner authentication failed");
  return session;
}
export const pathFor = (id) => `/api/campaigns/${id}`;
export function mutation(
  session,
  campaignId,
  operation,
  payload,
  expectedRevision = 0,
  expected = 200,
  requestId = crypto.randomUUID(),
) {
  return session.request(
    "/api/mutations",
    {
      operation,
      campaignId,
      payload,
      expectedRevision,
      requestId,
    },
    expected,
  );
}

// Appends new, unmistakably synthetic records. Existing campaigns are never reset.
export async function createGameplayFixtures(owner) {
  const stamp = new Date().toISOString();
  const result = [];
  for (const [title, name, locationName, language] of [
    ["Glass Orchard", "Mira", "Glass garden shelter", "en"],
    ["Quiet Comet", "Sol", "Orbital observatory", "ru"],
  ]) {
    const campaign = await owner.request("/api/mutations", {
      operation: "campaign.create",
      requestId: crypto.randomUUID(),
      expectedRevision: 0,
      payload: {
        title: `Synthetic Phase 2 · ${title} · ${stamp}`,
        subtitle: "Disposable Phase 2 acceptance; entirely invented",
        language,
      },
    });
    const cid = campaign.id;
    const save = (operation, payload, revision = 0) =>
      mutation(owner, cid, operation, payload, revision);
    const person = (kind, characterName) => ({
      kind,
      name: characterName,
      details: "Invented acceptance character; present at the shelter.",
      hp: 6,
      max_hp: 12,
      stats: { skill: 3, attack: 4, save: 2, defense: 12 },
      resources: { focus: 3 },
      conditions: [],
      equipment_slots:
        kind === "npc"
          ? []
          : [{ id: "hand", label: "Hand", accepts: ["tool", "weapon"] }],
    });
    const actor = await save(
      "entity.save",
      person("player", `Synthetic ${name}`),
    );
    const companion = await save(
      "entity.save",
      person("companion", `Synthetic ${name}'s companion`),
    );
    const adversary = await save(
      "entity.save",
      person("npc", "Synthetic training automaton"),
    );
    const pack = await save("storage.save", {
      name: "Acceptance pack",
      kind: "player",
      entity_id: actor.id,
    });
    const stash = await save("storage.save", {
      name: "Acceptance shared stash",
      kind: "camp",
      entity_id: null,
    });
    const items = {};
    const itemRules = [];
    for (const [tag, quantity, category, damage] of [
      ["supply", 8, "supply", null],
      ["meat", 3, "ingredient", null],
      ["coffee", 3, "ingredient", null],
      ["water", 3, "ingredient", null],
      ["knife", 2, "tool", null],
      ["stick", 2, "tool", null],
      ["binding", 3, "tool", null],
      ["cutting-tool", 1, "tool", null],
      ["weapon", 1, "weapon", 3],
      ["healing", 2, "supply", null],
    ]) {
      const item = await save("item.save", {
        name: `Synthetic ${tag}`,
        category,
        quantity,
        description: "Invented acceptance item",
        mechanics: "Only explicitly configured house-profile rules apply.",
        owner_entity_id: actor.id,
        storage_id: pack.id,
        equipped_entity_id: null,
        equipped_slot: null,
      });
      items[tag] = item.id;
      itemRules.push({ itemId: item.id, tag, damage });
    }
    const session = await save("session.save", {
      title: "Synthetic text DM acceptance",
      status: "open",
      recap: "Entirely invented; no prior campaign history.",
    });
    const location = await save("location.save", {
      name: locationName,
      description: "A quiet safe place with a shared stash.",
      status: "visited",
    });
    const destination = await save("location.save", {
      name: `${title} lookout`,
      description: "An invented nearby lookout.",
      status: "known",
    });
    const quest = await save("quest.save", {
      title: "Inspect the synthetic beacon",
      description: "An invented objective for acceptance tests.",
      status: "open",
    });
    await save("document.save", {
      title: "Synthetic current canon",
      status: "canon",
      body: `This is an invented ${title} setting. ${name} and their companion are at ${locationName}. The training automaton is a visible harmless practice opponent until an encounter is explicitly started. All records in this campaign are synthetic. No private lore or other campaigns belong here.`,
    });
    await save(
      "state.save",
      {
        summary: "Synthetic arrival at the shelter. No earlier events.",
        current_session_id: session.id,
        current_scene_id: null,
        current_location_id: location.id,
      },
      1,
    );
    const configuration = {
      profile: "console-basic-v1",
      controlledEntityIds: [actor.id],
      presentEntityIds: [actor.id, companion.id, adversary.id],
      nearbyStorageIds: [],
      safeLocationIds: [location.id],
      itemRules,
    };
    const play = await owner.request(`${pathFor(cid)}/play`);
    await owner.request(`${pathFor(cid)}/play/config`, {
      requestId: crypto.randomUUID(),
      campaignId: cid,
      expectedRevision: play.revision,
      configuration,
    });
    result.push({
      campaignId: cid,
      actorId: actor.id,
      companionId: companion.id,
      adversaryId: adversary.id,
      packId: pack.id,
      stashId: stash.id,
      sessionId: session.id,
      locationId: location.id,
      destinationId: destination.id,
      questId: quest.id,
      items,
    });
  }
  return result;
}
