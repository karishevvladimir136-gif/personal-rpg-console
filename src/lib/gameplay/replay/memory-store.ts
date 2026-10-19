// Polish 3 §4: an isolated copy of one turn, restored from a snapshot. The turn store the
// loop needs (begin → claim → checkpoints → commit) over the snapshot's runtime source,
// in memory: the live campaign is never read or written, nothing is persisted, and what
// the turn produced (the narration, the receipts, the changes, the usage) is read back
// from the store afterwards. The tools' validators run against the shadow state as in
// the app; the SQL commit's own checks do not run here (there is no database).
import { randomUUID } from "node:crypto";
import type { PublicTurn, ResumeInput, TurnInput, TurnStatus, TurnFailure, VisibleCheck } from "../contracts.ts";
import type { CommitPacket, RecordedCheck, RuntimeSource, StoredTurn, TurnCheckpoint, TurnClaim, TurnLease, TurnStore } from "../server-contracts.ts";
import type { DmLoopReceipt, DmLoopReceiptResult, DmLoopToolCall } from "../dm-loop/contracts.ts";
import type { MemoryStore } from "../../memory/server-contracts.ts";
import { isDisplayedCheck } from "../dice.ts";
import type { TurnSnapshotPayload } from "../turn-snapshot.ts";

export type ReplayCommit = { packet: CommitPacket; narration: string; receipts: DmLoopReceipt[] };

export type SnapshotTurnStore = TurnStore & {
  /** What the turn committed (null until it did). */
  committed(): ReplayCommit | null;
  /** The turn's checkpoint as last persisted (the transcript, the receipts, the diagnostics). */
  lastCheckpoint(): TurnCheckpoint | null;
  /** The snapshot's source, untouched by the turn (a copy is handed to every claim). */
  readonly source: RuntimeSource;
};

const emptyCheckpoint = (input: TurnInput): TurnCheckpoint => ({
  dmLoop: { schemaVersion: 1, createdTimeline: input.timeline ?? null, receipts: [], transcript: [], text: "", meta: null, usage: [], diagnostics: [], requests: 0, pin: null, shadow: null },
  plan: null, checks: [], resolution: null, narration: null, feedback: null, usage: [],
});

function visible(source: RuntimeSource, check: RecordedCheck): VisibleCheck | null {
  if (!isDisplayedCheck(source, check)) return null;
  const actor = source.snapshot.entities.find((row) => row.id === check.actorId);
  return { id: check.id, kind: check.kind, actorId: check.actorId, actorName: actor?.name ?? "", dice: [...check.dice], kept: check.kept, modifier: check.modifier,
    total: check.total, success: check.success === true, dc: check.dcPublic ? check.dc : null, advantage: check.advantage, interactive: false, canReroll: false,
    rollNumber: check.rollNumber, reason: check.reason ?? null, bonuses: check.bonuses ?? [], advantageReason: check.advantageReason ?? null,
    difficulty: check.difficulty ?? null, natural: check.natural ?? null } as VisibleCheck;
}

/** A turn store over one snapshot: exactly one operation (the snapshot's turn, or another input on the same state). */
export function createSnapshotTurnStore(payload: TurnSnapshotPayload): SnapshotTurnStore {
  const source = payload.source;
  let turn: StoredTurn | null = null;
  let status: TurnStatus = "pending";
  let failure: TurnFailure | null = null;
  let canRetry = false;
  let committed: ReplayCommit | null = null;
  let lease: TurnLease | null = null;
  const publicOf = (): PublicTurn => {
    if (!turn) throw new Error("no turn begun");
    const checks = (turn.checkpoint.checks ?? []).map((check) => visible(source, check)).filter((row): row is VisibleCheck => row !== null);
    return { ...turn.public, status, failure, canRetry, canCancel: status !== "committed" && status !== "cancelled", checks,
      narration: committed?.narration ?? null, updated_at: new Date().toISOString(),
      ...(committed ? { changes: committed.receipts.filter((r) => r.result.ok && r.result.player).map((r) => ({ tool: r.call.name, ok: true as const, summary: r.result.ok ? r.result.player ?? "" : "" })),
        sceneKinds: committed.packet.dmLoop?.meta?.sceneKinds ?? [], playerMoment: committed.packet.dmLoop?.meta?.playerMoment ?? false,
        nextTension: committed.packet.dmLoop?.meta?.nextTension ?? null, committedRevision: source.runtime.revision + 1 } : {}) };
  };
  const guard = (given: TurnLease) => {
    if (!lease || !turn || given.operationId !== turn.input.operationId || given.token !== lease.token) throw new Error("replay: a stale lease");
  };
  return {
    source,
    committed: () => committed,
    lastCheckpoint: () => turn?.checkpoint ?? null,
    async begin(input) {
      if (turn && turn.input.operationId !== input.operationId) throw new Error("replay: one turn per store");
      if (!turn) {
        const now = new Date().toISOString();
        turn = { input, checkpoint: emptyCheckpoint(input), public: { id: input.operationId, campaign_id: input.campaignId,
          session_id: source.snapshot.publicState.current_session_id ?? null, mode: input.mode, input: input.input, companionId: input.companionId,
          listenerIds: input.listenerIds, status: "pending", expectedRevision: input.expectedRevision, committedRevision: null, settingsRevision: 0,
          created_at: now, updated_at: now, narration: null, visualDescription: null, checks: [], proposal: null, failure: null, canRetry: false, canCancel: true,
          ...(input.timeline ? { timeline: input.timeline } : {}) } };
      }
      return publicOf();
    },
    async claim(campaignId, operationId) {
      if (!turn || turn.input.operationId !== operationId || turn.input.campaignId !== campaignId) return null;
      if (!(status === "pending" || status === "generating" || status === "awaiting_confirmation" || (status === "failed" && canRetry))) return null;
      status = "generating";
      failure = null;
      lease = { campaignId, operationId, token: randomUUID(), expectedRevision: turn.input.expectedRevision, ...(turn.input.timeline ? { timeline: turn.input.timeline } : {}) };
      const claim: TurnClaim = { runtimeIdentity: "dm-loop-v1", lease, turn: structuredClone(turn), source: structuredClone(source) };
      return claim;
    },
    async recordDmTool(given, position, call: DmLoopToolCall, result: DmLoopReceiptResult) {
      guard(given);
      const receipts = turn!.checkpoint.dmLoop!.receipts;
      const existing = receipts.find((row) => row.position === position);
      if (existing) return existing;
      const receipt: DmLoopReceipt = { position, id: randomUUID(), call, result };
      receipts.push(receipt);
      return receipt;
    },
    async checkpoint(given, checkpoint, next) {
      guard(given);
      turn!.checkpoint = structuredClone(checkpoint);
      status = next;
    },
    async recordChecks(given, checks) { guard(given); turn!.checkpoint.checks = checks; return checks; },
    async reroll(given, command, check) {
      guard(given);
      turn!.checkpoint.checks = turn!.checkpoint.checks.map((row) => (row.id === command.checkId ? check : row));
      return turn!.checkpoint.checks;
    },
    async commit(given, packet) {
      guard(given);
      status = "committed";
      committed = { packet: structuredClone(packet), narration: packet.narration, receipts: packet.dmLoop?.receipts ?? turn!.checkpoint.dmLoop?.receipts ?? [] };
      turn!.checkpoint.checks = packet.checks;
      return publicOf();
    },
    async fail(given, code, retryable) { guard(given); status = "failed"; failure = code; canRetry = retryable; return publicOf(); },
    async cancel(command: ResumeInput) { if (turn && turn.input.operationId === command.operationId) status = "cancelled"; return publicOf(); },
    async getPublic() { return publicOf(); },
    async readPlay() { return { ...structuredClone(source.runtime), configured: true, model: null }; },
    async runtimeIdentity() { return turn ? "dm-loop-v1" : null; },
    async configure() { throw new Error("replay: no configuration"); },
    async approveGuidance() { throw new Error("replay: no guidance"); },
  };
}

/** No memory index in a replay: the loop falls back to the snapshot's own state and canon. */
export const noMemory: MemoryStore = { context: async () => { throw new Error("replay: no memory index"); } } as unknown as MemoryStore;

/** The snapshot's own turn input, as the owner sent it: the operation and the state's revision and timeline. */
export function snapshotInput(payload: TurnSnapshotPayload, text?: string): TurnInput {
  return { ...payload.input, ...(text !== undefined ? { input: text } : {}), expectedRevision: payload.source.runtime.revision,
    ...(payload.source.runtime.timeline ? { timeline: payload.source.runtime.timeline } : {}) };
}

/** Deterministic dice per state (the same dice for every variant of a turn): a small PRNG seeded by the operation. */
export function seededRandom(seed: string): (min: number, max: number) => number {
  let h = 2166136261;
  for (const ch of seed) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; }
  let a = h || 1;
  return (min, max) => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    const unit = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    return min + Math.floor(unit * (max - min));
  };
}
