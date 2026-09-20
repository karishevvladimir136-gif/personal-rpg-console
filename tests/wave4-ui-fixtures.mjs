export const uiId = (n) =>
  `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
export function foundationUiFixture() {
  const currency = {
    id: uiId(11),
    label: "Marks",
    resourceKey: "marks",
    version: 2,
  };
  const track = {
    id: uiId(12),
    label: "Fieldcraft",
    kind: "generic",
    version: 3,
    thresholds: [5, 10],
    choices: [
      { id: uiId(13), label: "Trail reading", capability: "Read tracks" },
    ],
  };
  const merchant = {
    actorId: uiId(3),
    entityId: uiId(3),
    version: 4,
    label: "Riverside trader",
    storageId: uiId(4),
    currencyIds: [currency.id],
    available: true,
    acceptsStolen: false,
    usesFunds: true,
    capacity: 100,
    buyBasisPoints: 5000,
    sellBasisPoints: 10000,
    haggleLimitBasisPoints: 1000,
  };
  const stock = {
    id: uiId(5),
    name: "Travel cloak <script>unsafe()</script>",
    quantity: 4,
    currencyId: currency.id,
    unitValue: 12,
    trade: "allowed",
    origin: "legitimate",
    equipped: false,
  };
  const offered = {
    ...stock,
    id: uiId(6),
    name: "Herbs",
    quantity: 2,
    unitValue: 3,
  };
  const restricted = {
    ...stock,
    id: uiId(7),
    name: "Sealed letter",
    trade: "quest",
    quantity: 1,
  };
  return {
    campaignId: uiId(1),
    command: {
      campaignId: uiId(1),
      timeline: { timelineId: uiId(2), epoch: 1 },
      expectedRevision: 8,
      expectedRuntimeRevision: 9,
      expectedHeadId: uiId(8),
    },
    profile: {
      id: "world-logic-v1",
      version: 1,
      mode: "world_logic",
      validatorVersion: "world-logic-v1",
    },
    stateVersion: 7,
    commerce: {
      schemaVersion: 1,
      playerEntityId: uiId(9),
      currencies: [{ id: currency.id, label: currency.label, balance: 40 }],
      inventory: [offered, restricted],
      merchants: [
        {
          actorId: merchant.actorId,
          label: merchant.label,
          currencyIds: merchant.currencyIds,
          acceptsStolen: false,
          stock: [stock],
        },
      ],
    },
    progression: {
      enabled: true,
      version: 7,
      progress: [
        {
          entityId: uiId(9),
          entityName: "Mira",
          trackId: track.id,
          trackLabel: track.label,
          kind: track.kind,
          value: 6,
          rank: 0,
          unlocks: [],
          nextThreshold: 10,
        },
      ],
      pending: [
        {
          id: uiId(14),
          entityId: uiId(9),
          trackId: track.id,
          trackVersion: track.version,
          rank: 1,
          options: track.choices,
          selectable: true,
          reason: null,
        },
      ],
    },
    availableRewards: [{ id: uiId(15), version: 1, label: "Safe arrival" }],
    owner: {
      currencies: [currency],
      itemPolicies: [stock, offered, restricted].map((item) => ({
        itemId: item.id,
        version: 1,
        currencyId: item.currencyId,
        unitValue: item.unitValue,
        trade: item.trade,
        origin: item.origin,
        visibility: "public",
      })),
      merchants: [merchant],
      progression: "on",
      tracks: [track],
      rewards: [
        {
          id: uiId(15),
          version: 1,
          label: "Safe arrival",
          source: { kind: "quest", id: uiId(16) },
          distribution: "actor",
          recipientIds: [uiId(9)],
          entries: [{ kind: "progression", trackId: track.id, amount: 5 }],
        },
      ],
      entities: [
        { id: uiId(9), name: "Mira", kind: "player" },
        { id: uiId(3), name: merchant.label, kind: "npc" },
      ],
      storages: [{ id: uiId(4), name: "River stockroom", entityId: uiId(3) }],
      items: [stock, offered, restricted].map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        ownerEntityId: item.id === stock.id ? uiId(3) : uiId(9),
        storageId: uiId(4),
      })),
      sources: [{ kind: "quest", id: uiId(16), label: "Reach the river" }],
    },
    history: [
      { id: uiId(17), text: "Mira completed the crossing.", worldMinutes: 32 },
    ],
  };
}
