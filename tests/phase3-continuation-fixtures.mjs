// Synthetic evaluation inputs only. Never imported by application/browser code.
// The lead's live harness must send authorizedSources only, and report model results
// separately from deterministic fixture checks. Excluded canaries are negative controls.
export const continuationRubric = [
  "factual continuity",
  "uncertainty preservation",
  "fact/rumor/intention distinction",
  "NPC knowledge",
  "player agency",
  "tone/style continuity",
  "spoiler safety",
  "exact state",
];
export const continuationCampaigns = {
  harbor: "00000000-0000-4000-8000-000000000301",
  frost: "00000000-0000-4000-8000-000000000302",
};
const harbor = continuationCampaigns.harbor;
const frost = continuationCampaigns.frost;
const state = Object.freeze({
  hp: 7,
  maxHp: 12,
  focus: 1,
  water: 0,
  tonic: 0,
  binding: 0,
  spear: 1,
  worldMinutes: 1420,
});
function source(id, text, patch = {}) {
  const campaignId = patch.campaignId ?? harbor;
  const visibility = patch.visibility ?? "public";
  return {
    id,
    campaignId,
    ref: {
      campaignId,
      kind: patch.kind ?? "scene",
      id,
      version: "1",
      part: 0,
      visibility,
    },
    sequence: 1,
    sessionId: "harbor-session-01",
    text,
    entityIds: ["hero", "nera"],
    knownBy: ["hero", "nera"],
    authority: "history",
    statementKind: "record",
    attribution: null,
    validFrom: null,
    validTo: null,
    significance: 3,
    unresolved: false,
    current: true,
    status: "valid",
    factKey: null,
    factValue: null,
    sourceRefs: [],
    ...Object.fromEntries(
      Object.entries(patch).filter(
        ([key]) => !["visibility", "kind"].includes(key),
      ),
    ),
  };
}
function scenario(id, dimension, question, sources, expected, extra = {}) {
  return {
    id,
    campaignId: harbor,
    language: "en",
    mode: "game",
    actorIds: [],
    dimension,
    playerInput: question,
    authorizedSources: sources,
    excludedSources: [],
    requiredEvidenceIds: sources
      .filter((row) => row.unresolved || row.authority === "state")
      .map((row) => row.id),
    expected: {
      mustPreserve: expected,
      mustNotAssert: [],
      exactState: { ...state },
      mayPause: false,
    },
    rubric: [...continuationRubric],
    ...extra,
  };
}
export const continuationScenarios = [
  scenario(
    "rumor-attribution",
    "fact/rumor/intention distinction",
    "What do we actually know about the mayor?",
    [
      source(
        "rumor-mayor",
        "Nera says the mayor may be a vampire. This is Nera's unverified rumor, not a confirmed discovery.",
        { statementKind: "rumor", attribution: "nera" },
      ),
    ],
    ["The vampire allegation is attributed to Nera and remains unverified."],
    {
      expected: {
        mustPreserve: ["Nera's attribution and uncertainty"],
        mustNotAssert: ["The mayor is a vampire as established fact"],
        exactState: { ...state },
        mayPause: false,
      },
    },
  ),
  scenario(
    "intention-not-completion",
    "fact/rumor/intention distinction",
    "Where did we leave my plan to return?",
    [
      source(
        "return-plan",
        "The player intends to return to the east pier tomorrow. No return journey has happened.",
        { statementKind: "intention", unresolved: true },
      ),
    ],
    ["The return is still a future intention; no travel has occurred."],
  ),
  scenario(
    "negation-retained",
    "uncertainty preservation",
    "Did Nera steal the brass key?",
    [
      source(
        "key-negation",
        "Nera did not take the brass key. The sealed key remains with the harbor keeper.",
        { statementKind: "fact" },
      ),
    ],
    ["Nera did not take the key; the harbor keeper still has it."],
  ),
  scenario(
    "old-promise",
    "factual continuity",
    "What did I promise Nera before the festival?",
    [
      source(
        "promise-early",
        "The player promised Nera to return her father's blue compass before the winter festival. The promise remains unresolved.",
        { statementKind: "fact", unresolved: true, significance: 5 },
      ),
      source(
        "late-decoy",
        "Many weeks later, the player remarked that the market lanterns were bright.",
        { sequence: 999, significance: 1 },
      ),
    ],
    [
      "The blue compass must be returned to Nera before the winter festival; newer chatter did not fulfill the promise.",
    ],
  ),
  scenario(
    "renamed-entity",
    "factual continuity",
    "Who is Mira, and what happened to Kai?",
    [
      source(
        "rename-identity",
        "The same person previously called Kai now asks to be called Mira. Her stable identity and promise to repair the tide clock are unchanged.",
        { statementKind: "fact", entityIds: ["engineer-1"], unresolved: true },
      ),
    ],
    ["Mira and Kai are the same person; the repair promise persists."],
  ),
  scenario(
    "owner-correction",
    "factual continuity",
    "Which bridge should I inspect when I decide to go?",
    [
      source(
        "bridge-corrected",
        "Owner correction: the damaged bridge is east of the harbor, not north. The player has not yet traveled there.",
        {
          authority: "correction",
          statementKind: "fact",
          factKey: "bridge.direction",
          factValue: "east",
        },
      ),
    ],
    ["The bridge is east; the contemplated trip has not happened."],
    {
      excludedSources: [
        source("bridge-old", "The damaged bridge is north.", {
          current: false,
          status: "superseded",
          authority: "canon",
        }),
      ],
    },
  ),
  scenario(
    "archived-canon",
    "factual continuity",
    "What is the currently established ferry fare?",
    [
      source(
        "fare-current",
        "Current canon: the harbor ferry fare is three copper coins; no fare has been paid yet.",
        {
          kind: "document",
          authority: "canon",
          statementKind: "fact",
          factKey: "ferry.fare",
          factValue: "3",
        },
      ),
    ],
    ["The current fare is three copper coins; there is no implied payment."],
    {
      excludedSources: [
        source("fare-archive", "The fare is nine copper coins.", {
          kind: "document",
          authority: "canon",
          status: "archived",
          current: false,
        }),
      ],
    },
  ),
  scenario(
    "russian-recall",
    "tone/style continuity",
    "Что я обещала Нере и когда должна это выполнить?",
    [
      source(
        "ru-promise",
        "Героиня обещала Нере вернуть синий компас её отца до зимнего праздника. Обещание ещё не выполнено.",
        { statementKind: "fact", unresolved: true },
      ),
    ],
    [
      "Answer in Russian: return Nera's father's blue compass before the winter festival; it remains outstanding.",
    ],
    { language: "ru" },
  ),
  scenario(
    "cross-language-continuity",
    "factual continuity",
    "Where is the blue compass now?",
    [
      source(
        "ru-compass-location",
        "Синий компас всё ещё хранится у смотрителя маяка. Герой его не забирал.",
        { statementKind: "fact" },
      ),
    ],
    [
      "The compass is still held by the lighthouse keeper; the player has not collected it.",
    ],
  ),
  scenario(
    "player-only-knowledge",
    "NPC knowledge",
    "Nera, tell me what you know about the hidden panel.",
    [
      source(
        "nera-panel-knowledge",
        "Nera has only seen the ordinary door and has not been told about a hidden panel.",
        { statementKind: "fact" },
      ),
    ],
    [
      "Nera does not know about the panel and must not supply its secret phrase.",
    ],
    {
      mode: "companion",
      actorIds: ["nera"],
      excludedSources: [
        source(
          "player-panel-secret",
          "The player alone learned the panel phrase: SYNTHETIC_PLAYER_ONLY_CEDAR.",
          { knownBy: ["hero"] },
        ),
      ],
    },
  ),
  scenario(
    "separate-conversation",
    "NPC knowledge",
    "Nera, what did Olan tell me while you were away?",
    [
      source(
        "nera-absent",
        "Nera was absent from the conversation between the player and Olan; no one has relayed its contents to her.",
        { statementKind: "fact" },
      ),
    ],
    [
      "Nera acknowledges she was absent; she cannot quote Olan's private conversation.",
    ],
    {
      mode: "companion",
      actorIds: ["nera"],
      excludedSources: [
        source(
          "olan-private-dialogue",
          "Olan privately told the player: SYNTHETIC_OTHER_CONVERSATION_RUST.",
          { knownBy: ["hero", "olan"] },
        ),
      ],
    },
  ),
  scenario(
    "campaign-isolation",
    "spoiler safety",
    "Which engineer Nera did we meet here?",
    [
      source(
        "harbor-nera",
        "In this harbor campaign, Nera is a clock repairer who wears a blue scarf.",
        { statementKind: "fact" },
      ),
    ],
    ["This campaign's Nera is the clock repairer with a blue scarf."],
    {
      excludedSources: [
        source(
          "frost-nera",
          "In Frost Circuit, Nera is a courier carrying SYNTHETIC_OTHER_CAMPAIGN_AMBER.",
          { campaignId: frost, sessionId: "frost-session-01" },
        ),
      ],
    },
  ),
  scenario(
    "private-canary",
    "spoiler safety",
    "What can I see in the lighthouse?",
    [
      source(
        "visible-lighthouse",
        "The player can see an unlit lamp and a closed wooden cupboard. Nothing inside the cupboard has been revealed.",
        { statementKind: "fact" },
      ),
    ],
    [
      "Describe only the unlit lamp and closed cupboard; preserve the unrevealed contents.",
    ],
    {
      excludedSources: [
        source(
          "private-lighthouse",
          "Unrevealed DM note: SYNTHETIC_DM_PRIVATE_MARIGOLD_713.",
          { visibility: "private", knownBy: [] },
        ),
      ],
    },
  ),
  scenario(
    "exact-resources",
    "exact state",
    "Remind me of my condition before I choose an action.",
    [
      source(
        "resources-current",
        "Exact current state: HP 7 of 12; focus 1; water 0. No rest has completed and no resource is restored at the session boundary.",
        { kind: "state", authority: "state", statementKind: "fact" },
      ),
    ],
    [
      "HP remains 7/12, focus 1 and water 0; ending a session did not heal or replenish anything.",
    ],
  ),
  scenario(
    "consumed-item",
    "exact state",
    "Can I drink the tonic I used earlier?",
    [
      source(
        "tonic-consumed",
        "The only tonic was consumed in a committed action. Its quantity is now zero; it has not been replaced.",
        { kind: "item", authority: "state", statementKind: "fact" },
      ),
    ],
    [
      "The tonic is unavailable; summarization or a new session cannot restore it.",
    ],
  ),
  scenario(
    "embedded-components",
    "exact state",
    "Can I use the knife and stick separately now?",
    [
      source(
        "spear-provenance",
        "The knife and stick are embedded components of the existing spear. Binding was consumed. Neither component is separately available; no disassembly action occurred.",
        { kind: "item", authority: "state", statementKind: "fact" },
      ),
    ],
    [
      "Knife and stick remain embedded, binding remains consumed, and the spear remains one item.",
    ],
  ),
  scenario(
    "pending-roll",
    "player agency",
    "Continue from the saved point. What awaits me?",
    [
      source(
        "pending-recorded-check",
        "A visible skill check is awaiting player confirmation. The recorded server die is 8, modifier +3, total 11. No consequence has been applied. Resume must preserve this check and wait for explicit confirmation.",
        { kind: "event", statementKind: "fact", unresolved: true },
      ),
    ],
    [
      "The same recorded 8 + 3 = 11 waits for confirmation; do not roll or resolve it automatically.",
    ],
    {
      pending: {
        operationId: "pending-operation",
        checkId: "recorded-check",
        status: "awaiting_confirmation",
        dice: [8],
        modifier: 3,
        total: 11,
      },
    },
  ),
  scenario(
    "unanswered-choice",
    "player agency",
    "Pick up the scene where we stopped.",
    [
      source(
        "choice-at-fork",
        "The player stands at a fork between the lantern stair and the tide tunnel. Nera has asked which route the player chooses. No route has been selected.",
        { statementKind: "question", unresolved: true },
      ),
    ],
    [
      "Return to the unresolved question; do not choose a route or move the player.",
    ],
  ),
  scenario(
    "guidance-is-not-history",
    "fact/rumor/intention distinction",
    "Tell me where we are, in the agreed concise style.",
    [
      source(
        "guidance-location",
        "The player remains beside the east pier, waiting for Nera. No departure has occurred.",
        { statementKind: "fact" },
      ),
    ],
    [
      "Use concise narration at the east pier; feedback must not become an in-world utterance or event.",
    ],
    {
      effectiveGuidance:
        "Use two concise sentences and do not choose actions for the player.",
      excludedSources: [
        source(
          "feedback-not-event",
          "Owner feedback: I would enjoy a dragon scene someday. This is a style suggestion, not a dragon encounter.",
          { statementKind: "intention" },
        ),
      ],
    },
  ),
  scenario(
    "invalid-checkpoint",
    "exact state",
    "Resume where we actually are after my correction.",
    [
      source(
        "corrected-current-location",
        "Owner correction and current state: the player is at the east pier at minute 1420. The older lighthouse checkpoint is invalid and must not restore state.",
        {
          kind: "state",
          authority: "correction",
          statementKind: "fact",
          factKey: "player.location",
          factValue: "east-pier",
        },
      ),
    ],
    [
      "Use current corrected east-pier state or pause until the checkpoint is rebuilt; never restore the old lighthouse state.",
    ],
    {
      checkpointStatus: "rebuild_required",
      expected: {
        mustPreserve: ["Current location east pier; current time 1420"],
        mustNotAssert: ["Return to old lighthouse checkpoint as current state"],
        exactState: { ...state, locationId: "east-pier" },
        mayPause: true,
      },
    },
  ),
  scenario(
    "recap-failure-resume",
    "exact state",
    "The recap failed. Can we return to the saved moment?",
    [
      source(
        "durable-boundary",
        "The session boundary is durably saved at the east pier, minute 1420. HP is 7/12 and focus is 1. Public recap generation failed, but exact state and the unanswered question about the compass remain saved.",
        {
          kind: "state",
          authority: "state",
          statementKind: "fact",
          unresolved: true,
        },
      ),
    ],
    [
      "The failed recap did not lose progress; preserve the unanswered compass question and exact state.",
    ],
    { recapStatus: "failed" },
  ),
  scenario(
    "conditional-claim",
    "uncertainty preservation",
    "Has the keeper opened the gate for us?",
    [
      source(
        "conditional-gate",
        "The keeper said she would open the gate only if the tide fell before midnight. The tide has not yet fallen, and nobody has observed the gate opening.",
        { statementKind: "claim", attribution: "keeper", unresolved: true },
      ),
    ],
    [
      "The gate-opening promise is conditional; the condition is unmet and the gate is not known to be open.",
    ],
  ),
];
