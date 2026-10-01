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
};
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
};
export type ProviderUsage = {
  model: string;
  inputTokens: number;
  outputTokens: number;
  calls: number;
  latencyMs: number;
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
export type TurnCheckpoint = {
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
  lease: TurnLease;
  turn: StoredTurn;
  source: RuntimeSource;
};
export type CommitPacket = {
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
  begin(input: TurnInput): Promise<PublicTurn>;
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
  prepareFoundation?: import("../foundation-loop/turn.ts").PrepareFoundation;
  store: TurnStore;
  provider: DmProvider;
  prepareWorld?: PrepareWorld;
  prepareWorldLogic?: PrepareWorldLogic;
  validateFoundation?: (claim: TurnClaim) => Promise<void>;
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
