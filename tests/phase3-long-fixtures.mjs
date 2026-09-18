// Invented campaigns only. No real owner campaign or DM-private material.
export const memoryCampaigns = {
  tide: "31000000-0000-4000-8000-000000000001",
  ash: "31000000-0000-4000-8000-000000000002",
};
export const memoryActors = {
  neri: "31000000-0000-4000-8000-000000000010",
  orrin: "31000000-0000-4000-8000-000000000011",
  sela: "31000000-0000-4000-8000-000000000012",
  vale: "31000000-0000-4000-8000-000000000013",
};

export function memorySource(id, text, options = {}) {
  const campaignId = options.campaignId ?? memoryCampaigns.tide;
  return {
    id,
    campaignId,
    ref: {
      campaignId,
      kind: "event",
      id,
      version: "1",
      part: 0,
      visibility: "public",
    },
    sequence: 1,
    sessionId: `${campaignId}-session-1`,
    text,
    entityIds: [],
    knownBy: [memoryActors.neri, memoryActors.orrin],
    authority: "history",
    statementKind: "record",
    attribution: null,
    validFrom: 0,
    validTo: null,
    significance: 1,
    unresolved: false,
    current: true,
    status: "valid",
    factKey: null,
    factValue: null,
    sourceRefs: [],
    ...options,
  };
}

export function memoryRequest(options = {}) {
  return {
    campaignId: memoryCampaigns.tide,
    visibility: "public",
    actorIds: [],
    query: "",
    entityIds: [],
    requiredSourceIds: [],
    worldMinutes: 10000,
    maxBytes: 16000,
    maxExcerpts: 12,
    historicalComparison: false,
    ...options,
  };
}

export function longMemoryFixture() {
  const { neri, orrin, sela, vale } = memoryActors;
  const { tide, ash } = memoryCampaigns;
  const aliases = [
    {
      campaignId: tide,
      entityId: orrin,
      alias: "Lantern",
      currentName: "Orrin",
    },
    { campaignId: tide, entityId: orrin, alias: "Оррин", currentName: "Orrin" },
    {
      campaignId: tide,
      entityId: orrin,
      alias: "Фонарь",
      currentName: "Orrin",
    },
    {
      campaignId: tide,
      entityId: vale,
      alias: "Captain Vale",
      currentName: "Vale",
    },
    { campaignId: tide, entityId: vale, alias: "Вейл", currentName: "Vale" },
    {
      campaignId: ash,
      entityId: "ash-orrin",
      alias: "Lantern",
      currentName: "Orrin",
    },
  ];
  const sources = [];
  for (const [campaignIndex, campaignId] of [tide, ash].entries()) {
    for (let index = 1; index <= 1200; index++) {
      sources.push(
        memorySource(
          `weather-${campaignIndex}-${index}`,
          index % 7 === 0
            ? "The harbor chorus repeats the word promise in a song about copper coins. No obligation was created."
            : "The recorder notes ordinary clouds, dusty crates and a quiet hour at the harbor.",
          {
            campaignId,
            sequence: index + 100,
            sessionId: `${campaignId}-session-${Math.ceil(index / 50)}`,
            entityIds:
              index % 9 === 0 ? [campaignId === tide ? vale : "ash-vale"] : [],
            significance: 0,
          },
        ),
      );
    }
  }
  const add = (id, text, options) =>
    sources.push(memorySource(id, text, options));
  add(
    "copper-promise",
    "Neri promised Captain Vale to return the copper key only after the flood recedes. That obligation is still unresolved.",
    {
      sequence: 2,
      entityIds: [neri, vale],
      statementKind: "intention",
      attribution: "Neri",
      significance: 10,
      unresolved: true,
    },
  );
  add(
    "chart-promise",
    "Lantern, now called Orrin, pledged to deliver the star chart to Sela if the northern bridge reopens. The bridge remains closed; the promise remains unresolved.",
    {
      sequence: 3,
      entityIds: [orrin, sela],
      statementKind: "intention",
      attribution: "Orrin",
      significance: 10,
      unresolved: true,
    },
  );
  add(
    "mayor-rumor",
    "Tamsin reports a rumor that the mayor is a vampire. Nobody has verified the rumor.",
    {
      sequence: 4,
      statementKind: "rumor",
      attribution: "Tamsin",
      significance: 8,
    },
  );
  add(
    "tomorrow-plan",
    "Neri intends to visit the tower tomorrow. Neri has not visited the tower yet.",
    {
      sequence: 5,
      entityIds: [neri],
      statementKind: "intention",
      attribution: "Neri",
      significance: 8,
    },
  );
  add(
    "gate-negation",
    "The southern gate is not unlocked. The copper key does not fit that gate.",
    {
      sequence: 6,
      statementKind: "fact",
      significance: 8,
    },
  );
  add(
    "witness-claim",
    "Vale claims that a silver bell was stolen, but the inventory has not confirmed a loss.",
    {
      sequence: 7,
      entityIds: [vale],
      statementKind: "claim",
      attribution: "Vale",
      significance: 8,
    },
  );
  add(
    "player-hypothesis",
    "Neri hypothesizes that the broken seal belongs to the guild. This is a hypothesis, not a discovery.",
    {
      sequence: 8,
      entityIds: [neri],
      statementKind: "hypothesis",
      attribution: "Neri",
      significance: 8,
    },
  );
  add(
    "unanswered-clue",
    "Who scratched the crescent rune onto the cellar door? The question remains unanswered.",
    {
      sequence: 9,
      statementKind: "question",
      significance: 9,
      unresolved: true,
    },
  );
  add(
    "russian-promise",
    "Села обещала вернуть синий атлас после праздника. Это обещание еще не выполнено.",
    {
      sequence: 10,
      entityIds: [sela],
      statementKind: "intention",
      attribution: "Села",
      significance: 9,
      unresolved: true,
    },
  );
  add(
    "told-to-orrin",
    "Neri explicitly told Orrin that the glass orchid opens only at dusk.",
    {
      sequence: 11,
      entityIds: [orrin],
      knownBy: [neri, orrin],
      significance: 9,
    },
  );
  add(
    "player-only-clue",
    "PLAYER_ONLY_SYNTHETIC: Neri found a coral password in a sealed notebook alone.",
    {
      sequence: 12,
      entityIds: [neri],
      knownBy: [neri],
      significance: 9,
    },
  );
  add(
    "sela-conversation",
    "SELA_ONLY_SYNTHETIC: Sela privately told Neri where the amber locket was hidden.",
    {
      sequence: 13,
      entityIds: [sela],
      knownBy: [neri, sela],
      significance: 9,
    },
  );
  add(
    "vale-lie",
    "Vale deliberately lied to Neri when he said he had returned the copper key. No return occurred.",
    {
      sequence: 14,
      entityIds: [vale],
      statementKind: "lie",
      attribution: "Vale",
      significance: 9,
    },
  );
  const stateOptions = {
    authority: "state",
    statementKind: "fact",
    significance: 10,
  };
  add("exact-hp", "Neri currently has 7 HP of 12 maximum HP.", {
    ...stateOptions,
    entityIds: [neri],
    factKey: "neri.hp",
    factValue: "7",
    ref: {
      campaignId: tide,
      kind: "entity",
      id: neri,
      version: "4",
      part: 0,
      visibility: "public",
    },
  });
  add(
    "spent-potion",
    "The red healing potion quantity is 0. It was consumed and remains unavailable.",
    {
      ...stateOptions,
      factKey: "red-potion.quantity",
      factValue: "0",
      ref: {
        campaignId: tide,
        kind: "item",
        id: "red-potion",
        version: "3",
        part: 0,
        visibility: "public",
      },
    },
  );
  add(
    "embedded-knife",
    "The small knife is embedded in the spear. The knife cannot be used separately.",
    {
      ...stateOptions,
      factKey: "knife.quantity",
      factValue: "0",
      ref: {
        campaignId: tide,
        kind: "item",
        id: "small-knife",
        version: "3",
        part: 0,
        visibility: "public",
      },
    },
  );
  add(
    "spent-focus",
    "Neri has 2 focus remaining after the recorded expenditure.",
    {
      ...stateOptions,
      entityIds: [neri],
      factKey: "neri.focus",
      factValue: "2",
      ref: {
        campaignId: tide,
        kind: "entity",
        id: neri,
        version: "4",
        part: 1,
        visibility: "public",
      },
    },
  );
  add(
    "canon-bridge",
    "The river bridge is made of basalt, according to the current approved charter.",
    {
      authority: "canon",
      statementKind: "fact",
      significance: 8,
      factKey: "bridge.material",
      factValue: "basalt",
      ref: {
        campaignId: tide,
        kind: "document",
        id: "bridge-charter",
        version: "2",
        part: 0,
        visibility: "public",
      },
    },
  );
  add(
    "old-bridge",
    "The river bridge is made of oak in the superseded charter.",
    {
      authority: "canon",
      statementKind: "fact",
      status: "superseded",
      current: false,
      factKey: "bridge.material",
      factValue: "oak",
      ref: {
        campaignId: tide,
        kind: "document",
        id: "bridge-charter",
        version: "1",
        part: 0,
        visibility: "public",
      },
    },
  );
  add(
    "archived-treaty",
    "The archived salt treaty required a toll of thirteen shells.",
    {
      authority: "canon",
      status: "archived",
      current: false,
      ref: {
        campaignId: tide,
        kind: "document",
        id: "salt-treaty",
        version: "1",
        part: 0,
        visibility: "public",
      },
    },
  );
  add("owner-correction", "Owner correction: Vale's eyes are green.", {
    authority: "correction",
    statementKind: "fact",
    entityIds: [vale],
    factKey: "vale.eyes",
    factValue: "green",
    significance: 10,
  });
  add(
    "lower-eye-canon",
    "The charter described Vale's eyes as blue before the correction.",
    {
      authority: "canon",
      statementKind: "fact",
      entityIds: [vale],
      factKey: "vale.eyes",
      factValue: "blue",
      significance: 10,
    },
  );
  add(
    "low-reference-bridge",
    "An unreliable tourist brochure calls the river bridge wooden.",
    {
      authority: "reference",
      statementKind: "fact",
      factKey: "bridge.material",
      factValue: "wood",
      significance: 10,
    },
  );
  add("old-location", "Neri's camp stood by the lake until minute 40.", {
    ...stateOptions,
    validFrom: 0,
    validTo: 40,
    factKey: "camp.location",
    factValue: "lake",
  });
  add(
    "current-location",
    "Neri's camp stands by the quarry from minute 40 onward.",
    {
      ...stateOptions,
      validFrom: 40,
      factKey: "camp.location",
      factValue: "quarry",
    },
  );
  add(
    "conflict-east",
    "The east vault is open according to one current canon record.",
    {
      authority: "canon",
      statementKind: "fact",
      factKey: "east-vault.state",
      factValue: "open",
      significance: 10,
    },
  );
  add(
    "conflict-west",
    "The east vault is closed according to another equally current canon record.",
    {
      authority: "canon",
      statementKind: "fact",
      factKey: "east-vault.state",
      factValue: "closed",
      significance: 10,
    },
  );
  const promiseRef = sources.find(
    (source) => source.id === "copper-promise",
  ).ref;
  add(
    "valid-summary",
    "Neri promised Captain Vale to return the copper key only after the flood recedes. That obligation is still unresolved.",
    {
      authority: "derived",
      significance: 9,
      sourceRefs: [promiseRef],
      ref: {
        campaignId: tide,
        kind: "summary",
        id: "summary-copper",
        version: "1",
        part: 0,
        visibility: "public",
      },
    },
  );
  add("stale-summary", "STALE_SYNTHETIC_SUMMARY: The bridge is oak.", {
    authority: "derived",
    status: "invalid",
    sourceRefs: [sources.find((source) => source.id === "old-bridge").ref],
    ref: {
      campaignId: tide,
      kind: "summary",
      id: "stale-bridge",
      version: "1",
      part: 0,
      visibility: "public",
    },
  });
  add(
    "private-vault",
    "DM_PRIVATE_SYNTHETIC_CANARY: The hidden vault contains a sleeping serpent.",
    {
      ref: {
        campaignId: tide,
        kind: "private_event",
        id: "private-vault",
        version: "1",
        part: 0,
        visibility: "private",
      },
      knownBy: [],
      significance: 10,
    },
  );
  add(
    "restricted-source",
    "RESTRICTED_SYNTHETIC_CANARY: The newly private comet omen.",
    {
      ref: {
        campaignId: tide,
        kind: "private_event",
        id: "restricted-source",
        version: "2",
        part: 0,
        visibility: "private",
      },
      knownBy: [],
      significance: 10,
    },
  );
  add(
    "restricted-derived",
    "RESTRICTED_SYNTHETIC_CANARY: The newly private comet omen.",
    {
      authority: "derived",
      sourceRefs: [
        sources.find((source) => source.id === "restricted-source").ref,
      ],
    },
  );
  add(
    "ash-same-promise",
    "CROSS_CAMPAIGN_SYNTHETIC_CANARY: Orrin promised Vale a copper key from the unrelated ash campaign.",
    {
      campaignId: ash,
      entityIds: ["ash-orrin", "ash-vale"],
      unresolved: true,
      significance: 10,
    },
  );
  add(
    "russian-rumor",
    "Слух: бургомистр скрывает серебряный колокол. Это не подтвержденный факт.",
    {
      statementKind: "rumor",
      attribution: "Неизвестный рассказчик",
      significance: 9,
    },
  );
  add(
    "provenance",
    "The spear contains the knife and a stick as embedded components; one binding was consumed and the cutting tool was retained.",
    {
      authority: "state",
      statementKind: "fact",
      significance: 10,
    },
  );

  const scenarios = [];
  const scenario = (name, query, expected, options = {}) => {
    const { scenario: labels, ...requestOptions } = options;
    scenarios.push({
      name,
      request: memoryRequest({ query, ...requestOptions }),
      expected,
      critical: expected.length
        ? expected
        : (requestOptions.requiredSourceIds ?? []),
      excluded: [],
      ...labels,
    });
  };
  scenario(
    "old promise amid recent decoys",
    "What did Captain Vale expect about the copper key?",
    ["copper-promise"],
  );
  scenario("promise paraphrase", "What repayment is owed to Captain Vale?", [
    "copper-promise",
  ]);
  scenario(
    "Russian query English promise",
    "Какое обещание Вейл ждет вернуть?",
    ["copper-promise"],
  );
  scenario("renamed old alias", "What did Lantern pledge about the chart?", [
    "chart-promise",
  ]);
  scenario("renamed current name", "What did Orrin pledge to Sela?", [
    "chart-promise",
  ]);
  scenario("renamed Russian alias", "Что обещал Фонарь про карту?", [
    "chart-promise",
  ]);
  scenario(
    "conditional promise is still open",
    "Orrin bridge chart condition",
    ["chart-promise"],
  );
  scenario("rumor is not fact", "Is the mayor vampire rumor confirmed?", [
    "mayor-rumor",
  ]);
  scenario("rumor Russian paraphrase", "Слух про мэра и вампира", [
    "mayor-rumor",
  ]);
  scenario("intention is not completed", "Did Neri visit the tower tomorrow?", [
    "tomorrow-plan",
  ]);
  scenario("Russian plan paraphrase", "Намерение башня завтра", [
    "tomorrow-plan",
  ]);
  scenario("negation stays intact", "Is the southern gate unlocked?", [
    "gate-negation",
  ]);
  scenario("gate bilingual synonym", "Медный ключ вход", ["gate-negation"]);
  scenario(
    "attributed uncertain claim",
    "Who claims the silver bell was stolen?",
    ["witness-claim"],
  );
  scenario(
    "player hypothesis retained",
    "Is the broken seal guild hypothesis confirmed?",
    ["player-hypothesis"],
  );
  scenario("open question", "Who scratched the crescent rune?", [
    "unanswered-clue",
  ]);
  scenario("Russian source remains literal", "Села синий атлас обещала", [
    "russian-promise",
  ]);
  scenario(
    "explicitly told companion knowledge",
    "Orrin glass orchid dusk",
    ["told-to-orrin"],
    { actorIds: [neri, orrin] },
  );
  scenario(
    "player can recall solitary clue",
    "coral password notebook",
    ["player-only-clue"],
    { actorIds: [neri] },
  );
  scenario(
    "intended listener knew conversation",
    "amber locket hidden",
    ["sela-conversation"],
    { actorIds: [neri, sela] },
  );
  scenario(
    "lie never upgrades into completed event",
    "Vale lied about returning copper key",
    ["vale-lie"],
  );
  scenario("exact HP outranks prose", "Neri HP maximum", ["exact-hp"]);
  scenario("consumed medicine never restored", "red healing potion quantity", [
    "spent-potion",
  ]);
  scenario("embedded component unavailable", "small knife use separately", [
    "embedded-knife",
  ]);
  scenario("spent resource remains spent", "Neri focus remaining", [
    "spent-focus",
  ]);
  scenario(
    "current canon beats superseded",
    "river bridge material",
    ["canon-bridge"],
    { scenario: { excluded: ["old-bridge", "low-reference-bridge"] } },
  );
  scenario(
    "explicit historical canon comparison",
    "river bridge oak superseded",
    ["old-bridge", "canon-bridge"],
    { historicalComparison: true },
  );
  scenario(
    "explicit archived comparison",
    "salt treaty thirteen shells",
    ["archived-treaty"],
    { historicalComparison: true },
  );
  scenario(
    "owner correction wins",
    "Vale eyes green blue",
    ["owner-correction"],
    { scenario: { excluded: ["lower-eye-canon"] } },
  );
  scenario(
    "applicable current time",
    "Neri camp lake quarry",
    ["current-location"],
    { scenario: { excluded: ["old-location"] } },
  );
  scenario(
    "applicable historical time",
    "Neri camp lake quarry",
    ["old-location"],
    { worldMinutes: 20, scenario: { excluded: ["current-location"] } },
  );
  scenario("confirmed provenance", "spear knife stick binding cutting tool", [
    "provenance",
  ]);
  scenario("English query Russian rumor", "mayor silver bell rumor", [
    "russian-rumor",
  ]);
  scenario(
    "derived evidence ranks after original",
    "copper key flood promise",
    ["copper-promise", "valid-summary"],
    { scenario: { critical: ["copper-promise"] } },
  );
  scenario(
    "critical structured state included",
    "Focus after many sessions",
    ["spent-focus"],
    { requiredSourceIds: ["spent-focus"] },
  );
  scenario(
    "critical old obligation included",
    "Continue waiting",
    ["chart-promise"],
    { requiredSourceIds: ["chart-promise"] },
  );
  scenario(
    "equally authoritative conflict pauses",
    "east vault open closed",
    [],
    { scenario: { pause: "conflict" } },
  );
  scenario(
    "unknown companion cannot inherit player clue",
    "coral password notebook",
    [],
    {
      actorIds: [orrin],
      requiredSourceIds: ["player-only-clue"],
      scenario: { pause: "missing", excluded: ["player-only-clue"] },
    },
  );
  scenario("other NPC conversation stays excluded", "amber locket hidden", [], {
    actorIds: [neri, orrin],
    requiredSourceIds: ["sela-conversation"],
    scenario: { pause: "missing", excluded: ["sela-conversation"] },
  });
  scenario("new restriction revokes derivative", "comet omen", [], {
    requiredSourceIds: ["restricted-derived"],
    scenario: {
      pause: "missing",
      excluded: ["restricted-derived", "restricted-source"],
    },
  });
  scenario("invalidated summary cannot satisfy critical", "bridge oak", [], {
    requiredSourceIds: ["stale-summary"],
    scenario: { pause: "missing", excluded: ["stale-summary"] },
  });
  scenario("missing critical neutral pause", "lost earlier agreement", [], {
    requiredSourceIds: ["missing-agreement"],
    scenario: { pause: "missing" },
  });
  scenario("critical oversized evidence pauses", "copper promise", [], {
    requiredSourceIds: ["copper-promise"],
    maxBytes: 50,
    scenario: { pause: "budget" },
  });
  return { sources, aliases, scenarios };
}
