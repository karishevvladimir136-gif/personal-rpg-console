import type { WorldSettlement } from "../production/contracts.ts";
import type {
  PrepareWorld,
  PrepareWorldLogic,
} from "../production/turn-contract.ts";
import type { TimelineFence } from "../saves/contracts.ts";
// Lead-owned INTERNAL TYPE-ONLY contracts. Do not import runtime values into a client.
import type { CampaignSnapshot } from "../persistence/contracts.ts";
import type { ContextMemory } from "../memory/server-contracts.ts";
import type { PinnedCraft } from "../dm-craft/contracts.ts";
import type {
  ConfigurePlayInput,
  GuidanceApprovalInput,
  GuidanceApprovalResult,
  Json,
  JsonObject,
  MechanicChoice,
  PlaySnapshot,
  PublicTurn,
  ResumeInput,
  TurnFailure,
  TurnInput,
  TurnStatus,
} from "./contracts.ts";

export type CheckProposal = {
  index: number;
  actorId: string;
  targetId: string | null;
  kind: "skill" | "attack" | "save" | "transform";
  stat: "skill" | "attack" | "save";
  dc: number;
  dcPublic: boolean;
  visibility: "player" | "private";
  important: boolean;
  uncertainty: "meaningful" | "trivial" | "impossible" | "unchanged";
  advantage: "normal" | "advantage" | "disadvantage";
  /** Polish group 2 (the roll card as a moment in the story): the DM's reason
   * in the campaign language, where each bonus came from, why advantage was
   * granted, the difficulty in words, a natural 20 or 1. Absent on older checks. */
  reason?: string;
  bonuses?: { source: string; value: number }[];
  advantageReason?: string | null;
  difficulty?: "easy" | "normal" | "hard" | "very_hard" | "nearly_impossible" | null;
  natural?: "crit" | "fumble" | null;
  /** Fix run C (item 66): every part of the modifier with its own source — the sheet's skill or stat, each worn thing,
   * each bonus of the fiction, the formula's own number; they sum to the modifier. Absent on older checks. */
  addends?: CheckAddend[];
};
/** Fix S4 11a: a sheet part may carry `basis` — where its number came from («sheet: Persuasion +7 (Beguiling
 * Influence)», «sheet words: proficient +4 — …», «stat: stealth +3»). Optional; older checks have none. */
export type CheckAddend = { source: string; value: number; kind: "sheet" | "gear" | "fiction" | "formula" | "cap"; basis?: string };
export type RecordedCheck = CheckProposal & {
  id: string;
  dice: number[];
  kept: number;
  modifier: number;
  total: number;
  success: boolean;
  rollNumber: number;
};
export type PrivatePatch = {
  kind: "fact" | "clock" | "npc" | "faction" | "consequence";
  key: string;
  operation: "set" | "advance";
  value: string | null;
  amount: number | null;
};
export type DmPlan = {
  foundationAction?: JsonObject | null;
  narration: string;
  checks: CheckProposal[];
  publicPatches: MechanicChoice[];
  privatePatches: PrivatePatch[];
  visualDescription: string;
  clarification: string | null;
  guidanceProposal: string | null;
};
export type NarrationResult = {
  narration: string;
  visualDescription: string;
  clarification: string | null;
};
export type FeedbackResult = {
  narration: string;
  guidanceProposal: string | null;
  teachingCandidate?:
    import("../dm-craft/contracts.ts").TeachingCandidate | null;
  /** Fix S4 run 1 (items 3, 11b): the waiting cards an out-of-game answer withdraws (loop campaigns only; the server
   * checks each id against the paused turn's waiting cards). */
  withdrawChecks?: { id: string; reason: string | null }[];
  /** FIX_S4 item 1: a fact of the hero's story settled in this out-of-game exchange (pinned as an owner fact). */
  tableFact?: string | null;
};
export type ProviderUsage = {
  model: string;
  inputTokens: number;
  outputTokens: number;
  calls: number;
  latencyMs: number;
  reasoningTokens?: number;
  cachedInputTokens?: number;
  reasoning?: string;
  serviceTier?: string;
  requestBytes?: number;
};
export type ProviderResult<T> = { output: T; usage: ProviderUsage };
export type CurrentCheckpoint = {
  campaignId: string;
  stateRevision: number;
  settingsRevision: number;
  sourceIds: string[];
  valid: boolean;
  publicText: string;
  privateText: string | null;
};
export type RuntimeSource = {
  /** Server-owned begin pin. Missing historical values retain two-stage play. */
  astraResponseContract?: "unified-v1";
  /** Selected-context privacy boundary, privately pinned before provider work. */
  astraResponseMode?: "public-unified" | "private-informed";
  /** Private claim-pinned mechanics definitions; World authoring stays frozen. */
  astraProgressionState?: import("../foundation-loop/contracts.ts").FoundationLoopState;
  astraProgressionBaseline?: string[];
  // Private claim-only mechanics registry and agreed-job terms. These are not
  // part of the public snapshot or player-facing narration source.
  astraSettlementCurrencies?: {
    id: string; label: string; resourceKey: string; version: number;
  }[];
  astraSettlementItemPolicies?: {
    itemId: string; visibility: "public" | "private";
    trade: "allowed" | "restricted" | "quest";
  }[];
  astraSettlementJobs?: {
    questId: string; issuerId: string; rewardTerms: {
      schemaVersion?: 1;
      issuerId?: string;
      currencyName: string | null; currencyAmount: number | null;
      itemName: string | null; itemCategory: "food" | "supply" | "misc" | null;
      itemDescription: string | null;
    } | null; rewardOperationId: string | null;
  }[];
  // Server-pinned private projection for a World Logic-origin playable timeline.
  // Never include this packet in a public DTO or narration source.
  worldTakeover?: {
    schemaVersion: 1;
    sourceWorldRevision: number;
    presentEntityIds: string[];
    routeLocationIds: string[];
    actors: JsonObject[];
    policy: JsonObject;
    unresolvedThreads: JsonObject[];
    recentWorldEvents: JsonObject[];
  };
  // Server-derived exact World Logic presence; never a legacy mechanics profile.
  worldLogicPresence?: { controlledEntityIds: string[]; presentEntityIds: string[] };
  worldLogicMundaneDetail?: import("../rulesets/world-logic-contracts.ts").MundanePublicDetail;
  craft?: PinnedCraft;
  // Internal bounded DM cognition for narrate(); never part of a public DTO.
  narrationBridge?: {
    planIntent: string | null;
    characters: ReturnType<
      typeof import("./character-model.ts").characterPacket
    >;
  };
  // Legacy observable voice projection, constructed only for narrate().
  observableCharacters?: { actorId: string; observableVoice: string }[];
  privateStateRevision?: number;
  foundationOptions?: JsonObject;
  lootChecks?: JsonObject[];
  // Pinned owner-advisory Adventure and actual Party Power; never a state patch.
  adventureContext?: JsonObject;
  memory?: ContextMemory;
  /** Polish group 7: «Образцы голоса» — the owner's passages (private; the campaign's, else the
   * account default) and the campaign's switch that lets the voice layer quote them. Voice stage
   * part 3: the examples mode (off · five · all) and the token cap of «all»; `voiceExamplesOn`
   * mirrors `voiceMode !== "off"`. */
  voiceSamples?: string | null;
  voiceExamplesOn?: boolean;
  voiceMode?: "off" | "five" | "all";
  voiceTokenCap?: number;
  /** Fix run (migration 73): the campaign's DM options as stored (parse with parseDmOptions). */
  dmOptions?: import("./contracts.ts").JsonObject;
  /** Fix run B1 (migration 74): the owner's «Тайны (видит только ведущий)» of the campaign and of its world — DM-only. */
  dmSecrets?: { campaign: string; world: string; /** Fix S3-accept Ж1 (migration 202610230551): «Пожелания к приключению». */ wishes?: string };
  /** Voice stage part 5: the quotable-line check's newest flags (the line, why); quoted in the
   * next turn's tail only when they belong to the last committed turn. */
  voiceFlags?: { operationId: string; flags: { line: string; why: string }[] } | null;
  /** The replay tool's «off» voice variant only (never set by the database): no voice layer,
   * no reminder, no examples — the prompt as it was before the voice stage. */
  voiceLayerOff?: boolean;
  ownerId: string;
  snapshot: CampaignSnapshot;
  runtime: PlaySnapshot;
  privateState: JsonObject;
  checkpoint: CurrentCheckpoint | null;
  historyComplete: boolean;
};
export type RecordFamily =
  | "entities"
  | "storages"
  | "items"
  | "quests"
  | "locations"
  | "public_state"
  | "conversations"
  | "rest_records"
  | "recipes"
  | "effects"
  | "encounters"
  | "encounter_participants"
  | "pending_actions"
  | "provenance";
export type RecordChange = {
  family: RecordFamily;
  id: string;
  expectedRevision: number | null;
  values: JsonObject;
};
export type PublicOutcome = {
  kind: string;
  entityIds: string[];
  itemIds: string[];
  text: string;
};
export type MechanicsResolution = {
  changes: RecordChange[];
  worldMinutes: number;
  configuration: PlaySnapshot["configuration"];
  outcomes: PublicOutcome[];
};
export type AstraToolCall = {
  kind: "query" | "skill" | "attack" | "save" | "damage";
  actorId: string | null;
  targetId: string | null;
  dc: number | null;
  itemId: string | null;
  scope: "current-public" | null;
};
export type AstraToolReceipt = {
  position: number;
  id: string;
  call: AstraToolCall;
  result: JsonObject;
};
export type AstraFinalProposal = {
  schemaVersion: 1;
  campaignId: string;
  operationId: string;
  expectedRevision: number;
  input: string;
  resolution: MechanicsResolution;
  privatePatches: PrivatePatch[];
  toolRefs: string[];
};
export type TurnCheckpoint = {
  /** dm-loop-v1 transcript, receipts and shadow delta (Stage 2). */
  dmLoop?: import("./dm-loop/contracts.ts").DmLoopCheckpoint | null;
  astraSettlement?: import("./astra-settlement.ts").AstraSettlementPlan | null;
  astraEffects?: import("./astra-settlement.ts").AstraEffectsPlan | null;
  astraPrimary?: {
    schemaVersion: 1;
    toolReceipts: AstraToolReceipt[];
    finalProposal: AstraFinalProposal | null;
  } | null;
  naturalMechanic?: import("../rulesets/natural-mechanics.ts").NaturalMechanicIntent | null;
  naturalCombatTurn?: import("../rulesets/natural-combat-turn.ts").NaturalCombatTurn | null;
  combatExchange?: import("./combat-exchange.ts").CombatExchangeCheckpoint | null;
  foundationAction?: JsonObject | null;
  foundationSettlement?:
    import("../foundation-loop/turn.ts").FoundationTurnSettlement | null;
  worldLogic?: JsonObject | null;
  worldSettlement?: WorldSettlement | null;
  plan: DmPlan | null;
  checks: RecordedCheck[];
  resolution: MechanicsResolution | null;
  narration: NarrationResult | null;
  feedback: FeedbackResult | null;
  usage: ProviderUsage[];
};
export type StoredTurn = {
  input: TurnInput;
  public: PublicTurn;
  checkpoint: TurnCheckpoint;
};
export type TurnLease = {
  // Optional only for legacy unfenced fixtures; live Phase 3.5 projections include it.
  timeline?: TimelineFence;
  campaignId: string;
  operationId: string;
  token: string;
  expectedRevision: number;
};
export type TurnClaim = {
  astraResponseContract?: "unified-v1" | null;
  astraResponseMode?: "public-unified" | "private-informed" | null;
  runtimeIdentity?: RuntimeIdentity;
  lease: TurnLease;
  turn: StoredTurn;
  source: RuntimeSource;
};
export type RuntimeIdentity = "legacy-v1" | "astra-primary-v1" | "dm-loop-v1";
export type CommitPacket = {
  /** dm-loop-v1 receipts and turn metadata, recorded with the commit event. */
  dmLoop?: {
    receipts: import("./dm-loop/contracts.ts").DmLoopReceipt[];
    meta: import("./dm-loop/contracts.ts").DmLoopMeta | null;
    usage: import("./dm-loop/contracts.ts").DmLoopUsageEntry[];
    requests: number;
  };
  teachingCandidate?:
    import("../dm-craft/contracts.ts").TeachingCandidate | null;
  foundationSettlement?:
    import("../foundation-loop/turn.ts").FoundationTurnSettlement | null;
  worldSettlement?: WorldSettlement | null;
  narration: string;
  visualDescription: string;
  resolution: MechanicsResolution;
  privatePatches: PrivatePatch[];
  checks: RecordedCheck[];
  guidanceProposal: string | null;
};
export interface TurnStore {
  advanceProgression?(campaignId: string, payload: {
    requestId: string; campaignId: string; expectedRevision: number;
    expectedWorldRevision: number; expectedStateVersion: number;
    recipientId: string; pendingId: string; optionId: string;
    expectedTrackVersion: number;
  }): Promise<{ status: "selected"; pendingId: string; optionId: string; stateVersion: number }>;
  begin(input: TurnInput, runtimeIdentity?: "astra-primary-v1" | "dm-loop-v1",
    astraResponseContract?: "unified-v1"): Promise<PublicTurn>;
  /** dm-loop-v1: append one tool receipt at a position; a replayed position
   * with the same call returns the recorded receipt (no second dice roll). */
  recordDmTool?(lease: TurnLease, position: number,
    call: import("./dm-loop/contracts.ts").DmLoopToolCall,
    result: import("./dm-loop/contracts.ts").DmLoopReceiptResult,
  ): Promise<import("./dm-loop/contracts.ts").DmLoopReceipt>;
  astraResponseContract?(campaignId: string, operationId: string):
    Promise<"legacy-two-stage" | "unified-v1" | null>;
  pinAstraResponseMode?(lease: TurnLease, mode: "public-unified" | "private-informed"):
    Promise<"public-unified" | "private-informed">;
  takeoverStatus?(campaignId: string): Promise<{ active: boolean }>;
  runtimeIdentity?(campaignId: string, operationId: string): Promise<RuntimeIdentity | null>;
  recordAstraTool?(lease: TurnLease, position: number, call: AstraToolCall, result: JsonObject): Promise<AstraToolReceipt>;
  recordAstraStage?(lease: TurnLease, diagnostic: {
    stage: "plan" | "final_validated" | "final_checkpoint" | "narration_context" | "narration_provider" |
      "narration_parse" | "narration_safety" | "narration_checkpoint" | "commit";
    phase: "entered" | "completed" | "failed";
    providerResponseReceived: boolean;
    narrationParseSucceeded: boolean;
    failureCategory: "configuration" | "provider" | "context" | "validation" |
      "conflict" | "unavailable" | null;
  }): Promise<void>;
  /** dm-loop-v1 (fix run A1, migration 72): renew the claimant's lease while a model request streams;
   * false when the lease is no longer this claimant's (another claim took the turn over, or it ended). */
  renewLease?(lease: TurnLease): Promise<boolean>;
  readPlay(campaignId: string): Promise<PlaySnapshot>;
  getPublic(campaignId: string, operationId: string): Promise<PublicTurn>;
  claim(campaignId: string, operationId: string): Promise<TurnClaim | null>;
  checkpoint(
    lease: TurnLease,
    checkpoint: TurnCheckpoint,
    status: "generating" | "awaiting_confirmation",
  ): Promise<void>;
  recordChecks(
    lease: TurnLease,
    checks: RecordedCheck[],
  ): Promise<RecordedCheck[]>;
  reroll(
    lease: TurnLease,
    command: ResumeInput,
    check: RecordedCheck,
  ): Promise<RecordedCheck[]>;
  commit(lease: TurnLease, packet: CommitPacket): Promise<PublicTurn>;
  fail(
    lease: TurnLease,
    failure: TurnFailure,
    retryable: boolean,
  ): Promise<PublicTurn>;
  cancel(command: ResumeInput): Promise<PublicTurn>;
  /** Fix S4 run 1 (migration 202610250701): one correction mark on a dm-loop turn's card — a waiting card withdrawn
   * (by the DM or the owner) or a rolled one voided (the owner's). Never while the turn runs. */
  correctCheck?(campaignId: string, payload: { operationId: string; checkId: string; kind: "withdraw" | "void";
    by: "dm" | "owner"; reason: string | null; requestId: string }): Promise<PublicTurn>;
  configure(input: ConfigurePlayInput): Promise<PlaySnapshot>;
  approveGuidance(
    input: GuidanceApprovalInput,
  ): Promise<GuidanceApprovalResult>;
}
export interface DmProvider {
  plan(
    source: RuntimeSource,
    input: TurnInput,
  ): Promise<ProviderResult<DmPlan>>;
  narrate(
    source: RuntimeSource,
    input: TurnInput,
    resolution: MechanicsResolution,
    checks: RecordedCheck[],
  ): Promise<ProviderResult<NarrationResult>>;
  feedback(
    source: RuntimeSource,
    input: TurnInput,
  ): Promise<ProviderResult<FeedbackResult>>;
}
export type TurnDependencies = {
  prepareCombatIntent?: import("./combat-exchange.ts").PrepareCombatIntent;
  prepareFoundation?: import("../foundation-loop/turn.ts").PrepareFoundation;
  store: TurnStore;
  provider: DmProvider;
  prepareWorld?: PrepareWorld;
  prepareWorldLogic?: PrepareWorldLogic;
  validateFoundation?: (claim: TurnClaim) => Promise<void>;
  /** Fix S4 run 1 (items 3, 11b): an out-of-game answer on a dm-loop campaign may withdraw the waiting cards it names;
   * the hook checks them against the paused turn's waiting cards and records the withdrawals before the answer commits. */
  withdrawChecks?: (input: TurnInput, requests: { id: string; reason: string | null }[]) => Promise<unknown>;
  /** FIX_S4 item 1: the fact an out-of-game answer settled, pinned before the answer commits (never fails it). */
  pinTableFact?: (input: TurnInput, fact: string) => Promise<unknown>;
};
export type ModelBudget = {
  model: string;
  contextLimit: number;
  outputReserve: number;
  safetyMargin: number;
  inputCap: number;
  accountingVersion: string;
};
export type ContextStage = "plan" | "narrate" | "feedback";
export type BuiltContext = {
  instructions: string;
  input: string;
  estimatedTokens: number;
  budget: ModelBudget;
  sourceCount: number;
};
export type RuntimeDiagnostic = {
  operationId: string;
  status: TurnStatus;
  usage: ProviderUsage[];
  category: TurnFailure | null;
};
// Json is re-exported for worker-owned strict validators, never for provider payload passthrough.
export type { Json };
