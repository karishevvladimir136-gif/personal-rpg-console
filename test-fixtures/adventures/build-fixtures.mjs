import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import { fixture, id } from "../../tests/wave4-commerce-fixtures.mjs";
import { thread, step } from "../../tests/wave1-world-fixtures.mjs";
import { stableGameplayId } from "../../src/lib/gameplay/dice.ts";
import { planLootObjectCorrection } from "../../src/lib/adventure-loot/planning.ts";
import { commandFor, applyPlan } from "../../tests/wave4-commerce-fixtures.mjs";

const root = new URL("./v1/", import.meta.url);
const encode = (value) => JSON.stringify(value, null, 2) + "\n";
const digest = (value) => createHash("sha256").update(value).digest("hex");
const basis = {
  schemaVersion: 1,
  id: id("adventure-world"),
  version: 1,
  title: "The Rill Road",
  ruleset: "console-basic-v1",
  geography: [
    { key: "rill-post", kind: "road-post" },
    { key: "rill-house", kind: "merchant-house" },
  ],
  intrinsicThreats: [
    {
      key: "road-watch",
      count: 2,
      attack: 2,
      defense: 10,
      hp: 12,
      role: "watchers",
    },
  ],
  factions: [
    { key: "couriers", aim: "Keep the road's messages moving" },
    { key: "merchants", aim: "Preserve stock and agreements" },
  ],
  chronology: {
    daylightRemainingMinutes: 180,
    lateArrivalChanges:
      "The addressee may leave the post; the letter and obligation remain.",
  },
};
const basisText = encode(basis);
writeFileSync(new URL("world-basis.json", root), basisText);
const worldReference = {
  id: basis.id,
  version: basis.version,
  digest: digest(basisText),
};
const route = (id, capability, extra = {}) => ({
  id,
  capability,
  from: ["locked"],
  lockClass: null,
  structureClass: null,
  environmentTags: [],
  requiresPortable: false,
  requiredItemIds: [],
  resourceCost: null,
  check: null,
  to: "open",
  noise: false,
  fragileLoss: 0,
  ...extra,
});
function make(family) {
  const { context: base } = fixture();
  // Every mutable UUID is rebound into a separate campaign namespace. The
  // immutable synthetic World basis above is the only shared authority.
  const ids = new Map();
  const remap = (value) => {
    if (typeof value === "string" && /^[0-9a-f-]{36}$/.test(value)) {
      if (value === base.foundation.ownerId) return value;
      if (!ids.has(value)) ids.set(value, stableGameplayId(family, value));
      return ids.get(value);
    }
    if (Array.isArray(value)) return value.map(remap);
    if (value && typeof value === "object")
      return Object.fromEntries(
        Object.entries(value).map(([k, v]) => [k, remap(v)]),
      );
    return value;
  };
  const context = remap(base);
  const player = context.world.actors.find((a) => a.control === "player");
  const merchant = context.world.actors.find((a) => a.control === "autonomous");
  const hero = context.snapshot.entities.find((e) => e.id === player.entityId);
  const stock = context.snapshot.items.find(
    (i) => i.name === "Synthetic lantern",
  );
  const storage = context.snapshot.storages.find(
    (s) => s.id === stock.storage_id,
  );
  const pack = context.snapshot.storages.find(
    (s) => s.entity_id === hero.id && s.kind === "player",
  );
  const location = context.snapshot.locations.find(
    (l) => l.id === player.locationId,
  );
  location.name =
    family === "merchant-vault" ? "Rill merchant house" : "Rill road post";
  merchant.publicName =
    family === "merchant-vault" ? "Merchant Ilen" : "Road watch keeper";
  const high = family === "letter-high";
  hero.name = high ? "Experienced courier" : "Novice courier";
  hero.hp = high ? 30 : 12;
  hero.max_hp = hero.hp;
  hero.stats = {
    skill: high ? 8 : 2,
    attack: high ? 7 : 2,
    save: high ? 6 : 1,
    defense: high ? 16 : 10,
  };
  hero.resources = { focus: high ? 10 : 4, credits: high ? 150 : 20 };
  player.capabilities = [
    "inspect",
    "key-access",
    "lockpick",
    "force-wood",
    "environment-impact",
    "spell-unseal",
    "negotiate",
    ...(high ? ["veteran-routecraft"] : []),
  ];
  if (family !== "merchant-vault") {
    const letterId = stableGameplayId(family, "sealed-letter");
    context.snapshot.items.push({
      ...stock,
      id: letterId,
      name: "Sealed letter to the Rill post",
      category: "document",
      quantity: 1,
      description: "An ordinary sealed letter entrusted to the courier.",
      mechanics:
        "No mechanical power; opening or delivering it is an intentional action.",
      owner_entity_id: hero.id,
      storage_id: pack.id,
      equipped_entity_id: null,
      equipped_slot: null,
    });
    context.state.itemPolicies.push({
      itemId: letterId,
      version: 1,
      currencyId: "credits",
      unitValue: 0,
      trade: "quest",
      origin: "legitimate",
      visibility: "public",
    });
    context.snapshot.quests[0].title = "Letter to the Rill post";
    context.snapshot.quests[0].description =
      "Deliver or otherwise decide how to handle the entrusted letter. Further obligations depend on recorded events.";
    context.snapshot.quests[0].status = "open";
  }

  const chestId = stableGameplayId(family, "secured-object");
  stock.name = "Glass vials";
  stock.quantity = 3;
  stock.category = "consumable";
  stock.description = "Small glass containers.";
  stock.mechanics = "No automatic power is granted by appearance.";
  const privateStock = context.snapshot.items.find(
    (item) => item.name === "PRIVATE_STOCK_NAME",
  );
  privateStock.name = "Wrapped merchant stock";
  privateStock.description = "A closed wrapping with no contents disclosed.";
  privateStock.mechanics =
    "Unknown; no mechanical effect is publicly established.";

  const object = {
    schemaVersion: 1,
    campaignId: context.foundation.campaignId,
    id: chestId,
    revision: 1,
    storageId: storage.id,
    locationId: location.id,
    ownerEntityId: merchant.entityId,
    label:
      family === "merchant-vault" ? "Wooden strongbox" : "Courier desk drawer",
    access: family === "merchant-vault" ? "locked" : "open",
    lockClass: family === "merchant-vault" ? "difficult-lock" : null,
    structureClass: "weak-wood",
    environmentTags: ["stone-landing"],
    portable: true,
    contentsEstablished: true,
    materializationId: stableGameplayId(chestId, "established-stock"),
    knownBy: [player.id],
    contentsKnownBy: [],
  };
  const policy = {
    schemaVersion: 1,
    campaignId: object.campaignId,
    objectId: chestId,
    id: "bounded-wood-v1",
    version: 1,
    profile: context.state.profile,
    discoveryCheck: null,
    contents: [],
    approaches: [
      route("key", "key-access", {
        requiredItemIds: [stableGameplayId(family, "recorded-key")],
      }),
      route("pick", "lockpick", {
        lockClass: "difficult-lock",
        check: { index: 0, stat: "skill", dc: 20 },
      }),
      route("force", "force-wood", {
        structureClass: "weak-wood",
        check: { index: 0, stat: "attack", dc: 8 },
        to: "broken",
        noise: true,
        fragileLoss: 1,
      }),
      route("impact", "environment-impact", {
        structureClass: "weak-wood",
        environmentTags: ["stone-landing"],
        requiresPortable: true,
        check: { index: 0, stat: "skill", dc: 8 },
        to: "broken",
        noise: true,
        fragileLoss: 1,
      }),
      route("spell", "spell-unseal", {
        resourceCost: { resource: "focus", amount: 2 },
        check: { index: 0, stat: "skill", dc: 12 },
      }),
      route("agreement", "negotiate", {
        check: { index: 0, stat: "skill", dc: 14 },
      }),
    ],
  };
  const version = {
    schemaVersion: 1,
    expectedObjectRevision: null,
    object,
    policy,
    privateItems: [
      {
        itemId: privateStock.id,
        fragile: false,
        hidden: {
          trueIdentity: "PRIVATE_STOCK_TRUE_IDENTITY",
          properties: ["PRIVATE_STOCK_TRUE_EFFECT"],
          provenance: "PRIVATE_STOCK_TRUE_PROVENANCE",
          usableCapabilities: [],
        },
      },

      {
        itemId: stock.id,
        fragile: true,
        hidden: {
          trueIdentity: "PRIVATE_VIAL_IDENTITY",
          properties: ["PRIVATE_VIAL_EFFECT"],
          provenance: "PRIVATE_VIAL_PROVENANCE",
          usableCapabilities: [],
        },
      },
    ],
    authority: "owner",
  };
  context.world.threads = [
    remap(
      thread("letter-obligation", {
        title: "An ordinary message changes hands",
        publicTitle: "Letter to the post",
        actorIds: [id("enemy")],
        decisionActorIds: [id("enemy")],
        steps: [
          step("post-departure", {
            trigger: {
              kind: "deadline",
              atWorldMinutes: 180,
              scenarioCritical: false,
              established: true,
            },
            publicOutcome: {
              text: "The post's visitor leaves after dusk.",
              actorIds: [id("enemy")],
              evidence: [],
            },
          }),
        ],
      }),
    ),
  ];
  context.foundation.world = structuredClone(context.world);
  const configured = applyPlan(
    context,
    commandFor(context, "configure"),
    planLootObjectCorrection(
      context,
      commandFor(context, "configure"),
      version,
      context.foundation.ownerId,
    ),
  );
  const emptyStorageId = stableGameplayId(family, "unspecified-drawer");
  configured.snapshot.storages.push({
    ...storage,
    id: emptyStorageId,
    name: "Unspecified small drawer",
  });
  const unspecifiedId = stableGameplayId(family, "unspecified-object");
  const unspecified = {
    schemaVersion: 1,
    expectedObjectRevision: null,
    object: {
      ...object,
      id: unspecifiedId,
      revision: 1,
      storageId: emptyStorageId,
      label: "Small open drawer",
      access: "open",
      lockClass: null,
      contentsEstablished: false,
      materializationId: null,
      knownBy: [],
      contentsKnownBy: [],
    },
    policy: {
      ...policy,
      objectId: unspecifiedId,
      id: "small-cache-v1",
      approaches: [],
      contents: [
        {
          key: "token",
          visible: {
            name: "Worn token",
            category: "trinket",
            quantity: 1,
            description: "An old token with a dim engraving.",
            mechanics: "Dormant; no available mechanical effect.",
          },
          commerce: {
            currencyId: "credits",
            unitValue: 50,
            trade: "allowed",
            origin: "legitimate",
            visibility: "public",
          },
          private: {
            trueIdentity: "PRIVATE_DORMANT_RELIC",
            properties: ["PRIVATE_RELIC_POWER"],
            provenance: "PRIVATE_RELIC_ORIGIN",
            usableCapabilities: [],
          },
          fragile: false,
        },
      ],
    },
    privateItems: [
      {
        itemId: privateStock.id,
        fragile: false,
        hidden: {
          trueIdentity: "PRIVATE_STOCK_TRUE_IDENTITY",
          properties: ["PRIVATE_STOCK_TRUE_EFFECT"],
          provenance: "PRIVATE_STOCK_TRUE_PROVENANCE",
          usableCapabilities: [],
        },
      },
    ],
    authority: "owner",
  };
  const final = applyPlan(
    configured,
    commandFor(configured, "configure-unspecified"),
    planLootObjectCorrection(
      configured,
      commandFor(configured, "configure-unspecified"),
      unspecified,
      configured.foundation.ownerId,
    ),
  );
  final.state.rewards = [
    {
      id: "letter-delivery",
      version: 1,
      label: "Delivery acknowledgement",
      source: { kind: "quest", id: final.snapshot.quests[0].id },
      distribution: "actor",
      recipientIds: [hero.id],
      entries: [
        { kind: "currency", currencyId: "credits", amount: high ? 40 : 8 },
      ],
    },
  ];
  const rewardPolicy = {
    schemaVersion: 1,
    id: high ? "experienced-courier-v1" : "novice-courier-v1",
    version: 1,
    profile: final.state.profile,
    rewardId: "letter-delivery",
    rewardVersion: 1,
    sourceSignificance: "meaningful",
    usablePowerCeiling: high ? 8 : 2,
    meaningfulnessFloor: 2,
    powerAggregation: "maximum",
    nonItemSignificance: 2,
    deliberateFloorException: null,
    items: [],
  };
  return {
    schemaVersion: 1,
    family,
    immutableWorld: worldReference,
    authority: {
      kind: "synthetic-owner-approved",
      version: 1,
      mutableNamespace: final.foundation.campaignId,
      provenance:
        "Synthetic offline fixture, separate from frozen Mega DM datasets.",
    },
    profile: {
      power: high ? "experienced" : "novice",
      scaling: "intrinsic-threats-fixed",
      progression: "off",
      deadlinePolicy: "normal",
      worldSimulation: true,
      autonomy: "moderate",
      pacing: { intendedSessionHours: [3, 5], enforcedTimer: false },
    },
    premise:
      family === "merchant-vault"
        ? "At Ilen's house, a portable wooden strongbox has a difficult lock. Ilen is downstairs. The landing floor is stone."
        : "A courier receives an ordinary sealed letter for the visitor at the Rill road post; events and obligations can develop beyond delivery.",
    publicFacts: {
      heroHistory: high
        ? "Several difficult deliveries completed."
        : "First paid delivery.",
      heroIntent:
        "Decide how to handle the immediate situation and its consequences.",
      ownerPosition:
        family === "merchant-vault"
          ? "Downstairs within the same coarse building Location."
          : "At the road post.",
      environment: "Stone landing; weak wooden strongbox.",
      threats:
        "Road watchers keep their own established ability, irrespective of hero power.",
    },
    context: final,
    references: {
      actorId: player.id,
      merchantActorId: merchant.id,
      objectId: chestId,
      unspecifiedObjectId: unspecifiedId,
      itemId: stock.id,
      destinationStorageId: pack.id,
    },
    rewardIntegrity: rewardPolicy,
    evaluation: {
      providerCallsAllowed: 0,
      attemptsUsed: 0,
      qualitativeStatus: "unassessed",
      automaticQualityScore: null,
      authority:
        "Normal runtime/DM chooses intent; trusted plans settle state. No scripted solution.",
    },
  };
}
const names = ["letter-low", "letter-high", "merchant-vault"];
const entries = names.map((name) => {
  const content = encode(make(name));
  writeFileSync(new URL(name + ".json", root), content);
  return { family: name, file: name + ".json", sha256: digest(content) };
});
writeFileSync(
  new URL("manifest.json", root),
  encode({
    schemaVersion: 1,
    fixtureSet: "adventure-acceptance-v1",
    immutableWorld: worldReference,
    entries,
  }),
);
