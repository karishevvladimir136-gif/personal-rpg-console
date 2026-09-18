import { randomUUID } from "node:crypto";
import { applyResolution } from "./phase2-mechanics-fixtures.mjs";
import { visibleChecks } from "../src/lib/gameplay/dice.ts";
import { TurnError } from "../src/lib/gameplay/turn-errors.ts";

/** Deterministic contract double only; SQL/Auth/lease enforcement is covered separately. */
export function memoryStore(initial) {
  const state = {
    source: structuredClone(initial),
    turns: new Map(),
    claims: new Map(),
    rerolls: new Map(),
    quota: 0,
    rollsWritten: 0,
    commits: 0,
    clock: 0,
  };
  const stored = (cid, id) => {
    if (cid !== state.source.snapshot.campaign.id)
      throw new TurnError("validation");
    const turn = state.turns.get(id);
    if (!turn) throw new TurnError("validation");
    return turn;
  };
  function fenced(lease) {
    const claim = state.claims.get(lease.operationId);
    if (!claim || claim.token !== lease.token || claim.until <= state.clock)
      throw new TurnError("conflict");
    if (lease.expectedRevision !== state.source.runtime.revision)
      throw new TurnError("conflict");
    return stored(lease.campaignId, lease.operationId);
  }
  function publicTurn(turn) {
    const checks = visibleChecks(
      state.source,
      turn.checkpoint.checks,
      turn.public.status === "awaiting_confirmation" &&
        (state.source.snapshot.settings.values.difficulty.rerolls ===
          "unlimited" ||
          state.quota <
            state.source.snapshot.settings.values.difficulty.rerollsPerSession),
    );
    return structuredClone({ ...turn.public, checks });
  }
  const store = {
    async begin(input) {
      if (input.campaignId !== state.source.snapshot.campaign.id)
        throw new TurnError("validation");
      const existing = state.turns.get(input.operationId);
      if (existing) {
        if (JSON.stringify(existing.input) !== JSON.stringify(input))
          throw new TurnError("conflict");
        return publicTurn(existing);
      }
      if (input.expectedRevision !== state.source.runtime.revision)
        throw new TurnError("conflict");
      if (
        input.mode !== "feedback" &&
        [...state.turns.values()].some(
          (t) =>
            t.input.mode !== "feedback" &&
            !["committed", "cancelled"].includes(t.public.status) &&
            !(t.public.status === "failed" && !t.public.canRetry),
        )
      )
        throw new TurnError("conflict");
      const turn = {
        input: structuredClone(input),
        public: {
          id: input.operationId,
          campaign_id: input.campaignId,
          session_id: state.source.snapshot.publicState.current_session_id,
          mode: input.mode,
          input: input.input,
          companionId: input.companionId,
          listenerIds: input.listenerIds,
          status: "pending",
          expectedRevision: input.expectedRevision,
          committedRevision: null,
          settingsRevision: state.source.snapshot.settings.revision,
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
          narration: null,
          visualDescription: null,
          checks: [],
          proposal: null,
          failure: null,
          canRetry: true,
          canCancel: true,
        },
        checkpoint: {
          plan: null,
          checks: [],
          resolution: null,
          narration: null,
          feedback: null,
          usage: [],
        },
      };
      state.turns.set(input.operationId, turn);
      return publicTurn(turn);
    },
    async getPublic(cid, id) {
      return publicTurn(stored(cid, id));
    },
    async readPlay(cid) {
      if (cid !== state.source.runtime.campaignId)
        throw new TurnError("validation");
      return {
        ...structuredClone(state.source.runtime),
        turns: [...state.turns.values()].map(publicTurn),
      };
    },
    async claim(cid, id) {
      const turn = stored(cid, id),
        old = state.claims.get(id);
      if (old?.until > state.clock) return null;
      if (turn.input.expectedRevision !== state.source.runtime.revision) {
        Object.assign(turn.public, {
          status: "failed",
          failure: "conflict",
          canRetry: false,
          canCancel: false,
        });
        return null;
      }
      const lease = {
        campaignId: cid,
        operationId: id,
        token: randomUUID(),
        expectedRevision: turn.input.expectedRevision,
      };
      state.claims.set(id, { ...lease, until: state.clock + 300 });
      const copy = structuredClone(turn);
      turn.public.status = "generating";
      return { lease, turn: copy, source: structuredClone(state.source) };
    },
    async checkpoint(lease, checkpoint, status) {
      const turn = fenced(lease);
      turn.checkpoint = structuredClone(checkpoint);
      turn.public.status = status;
      if (status === "awaiting_confirmation")
        state.claims.delete(lease.operationId);
    },
    async recordChecks(lease, checks) {
      const turn = fenced(lease);
      if (!turn.checkpoint.checks.length) {
        turn.checkpoint.checks = structuredClone(checks);
        state.rollsWritten += checks.length;
      }
      return structuredClone(turn.checkpoint.checks);
    },
    async reroll(lease, command, check) {
      const turn = fenced(lease),
        existing = state.rerolls.get(command.commandId);
      if (existing) {
        if (
          existing.operationId !== command.operationId ||
          existing.checkId !== command.checkId
        )
          throw new TurnError("conflict");
        return structuredClone(turn.checkpoint.checks);
      }
      const policy = state.source.snapshot.settings.values.difficulty;
      if (
        policy.rerolls === "disabled" ||
        (policy.rerolls === "limited" &&
          state.quota >= policy.rerollsPerSession)
      )
        throw new TurnError("validation");
      const old = turn.checkpoint.checks.find((c) => c.id === command.checkId);
      if (!old || check.rollNumber !== old.rollNumber + 1)
        throw new TurnError("validation");
      turn.checkpoint.checks = turn.checkpoint.checks.map((c) =>
        c.id === check.id ? structuredClone(check) : c,
      );
      state.quota++;
      state.rollsWritten++;
      state.rerolls.set(command.commandId, {
        operationId: command.operationId,
        checkId: command.checkId,
      });
      return structuredClone(turn.checkpoint.checks);
    },
    async commit(lease, packet) {
      const turn = fenced(lease);
      state.source = applyResolution(state.source, packet.resolution);
      state.commits++;
      Object.assign(turn.public, {
        status: "committed",
        narration: packet.narration,
        visualDescription: packet.visualDescription,
        committedRevision: state.source.runtime.revision,
        failure: null,
        canRetry: false,
        canCancel: false,
        proposal: packet.guidanceProposal
          ? {
              id: randomUUID(),
              text: packet.guidanceProposal,
              status: "proposed",
              scope: null,
              sessionId: null,
              documentRevision: 1,
            }
          : null,
      });
      state.claims.delete(lease.operationId);
      return publicTurn(turn);
    },
    async fail(lease, failure, retryable) {
      const turn = fenced(lease);
      Object.assign(turn.public, {
        status: "failed",
        failure,
        canRetry: retryable,
        canCancel: retryable,
      });
      state.claims.delete(lease.operationId);
      return publicTurn(turn);
    },
    async cancel(command) {
      const turn = stored(command.campaignId, command.operationId);
      Object.assign(turn.public, {
        status: "cancelled",
        canRetry: false,
        canCancel: false,
      });
      state.claims.delete(command.operationId);
      return publicTurn(turn);
    },
  };
  return { state, store };
}

export const emptyPlan = () => ({
  narration: "SYNTHETIC_PRIVATE_PLANNER_TEXT",
  visualDescription: "SYNTHETIC_PRIVATE_VISUAL_TEXT",
  checks: [],
  publicPatches: [],
  privatePatches: [],
  clarification: null,
  guidanceProposal: null,
});
export function providerDouble(plan = emptyPlan()) {
  const calls = { plan: 0, narrate: 0, feedback: 0, sources: [] };
  const result = (output) => ({
    output: structuredClone(output),
    usage: {
      model: "deterministic-test-only",
      inputTokens: 0,
      outputTokens: 0,
      calls: 1,
      latencyMs: 0,
    },
  });
  const provider = {
    async plan(source) {
      calls.plan++;
      calls.sources.push({ stage: "plan", source });
      return result(plan);
    },
    async narrate(source) {
      calls.narrate++;
      calls.sources.push({ stage: "narrate", source });
      return result({
        narration: "Synthetic public narration after resolution.",
        visualDescription: "A known clearing.",
        clarification: null,
      });
    },
    async feedback(source) {
      calls.feedback++;
      calls.sources.push({ stage: "feedback", source });
      return result({
        narration: "Synthetic guidance suggestion.",
        guidanceProposal: "Use concise descriptions.",
      });
    },
  };
  return { provider, calls };
}
