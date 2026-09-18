import type { PublicTurn, TurnMode } from "../gameplay/contracts.ts";
import type {
  ContinueSessionInput,
  EndSessionInput,
  MemorySnapshot,
  PublicSessionMemory,
  RecapStatus,
  RetryMemoryInput,
} from "./contracts.ts";

export type MemoryAttempt =
  | { kind: "end"; input: EndSessionInput }
  | {
      kind: "continue";
      input: ContinueSessionInput;
      fromState: "ended" | "resuming";
    }
  | { kind: "retry"; input: RetryMemoryInput };
type NewAttempt =
  | { kind: "end"; input: Omit<EndSessionInput, "requestId"> }
  | {
      kind: "continue";
      input: Omit<ContinueSessionInput, "requestId">;
      fromState: "ended" | "resuming";
    }
  | { kind: "retry"; input: Omit<RetryMemoryInput, "requestId"> };
type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;
export const memoryAttemptKey = (campaignId: string) =>
  `rpg-session-request-v1:${campaignId}`;
export function prepareMemoryAttempt(
  previous: MemoryAttempt | null,
  next: NewAttempt,
  createId = () => crypto.randomUUID(),
): MemoryAttempt {
  // An uncertain operation must be reconciled; changed UI state cannot replace its identity.
  return (
    previous ??
    ({
      ...next,
      input: { ...next.input, requestId: createId() },
    } as MemoryAttempt)
  );
}
export function loadMemoryAttempt(
  storage: StorageLike | null,
  campaignId: string,
): MemoryAttempt | null {
  try {
    const value = JSON.parse(
      storage?.getItem(memoryAttemptKey(campaignId)) || "null",
    ) as MemoryAttempt | null;
    if (
      !value ||
      !["end", "continue", "retry"].includes(value.kind) ||
      value.input?.campaignId !== campaignId ||
      typeof value.input.requestId !== "string" ||
      !value.input.requestId
    )
      return null;
    if (
      value.kind !== "retry" &&
      (!Number.isSafeInteger(value.input.expectedRevision) ||
        value.input.expectedRevision < 0)
    )
      return null;
    if (value.kind === "end" && typeof value.input.sessionId !== "string")
      return null;
    if (
      value.kind === "continue" &&
      (typeof value.input.boundaryId !== "string" ||
        !["ended", "resuming"].includes(value.fromState))
    )
      return null;
    if (
      value.kind === "retry" &&
      !(
        value.input.boundaryId === null ||
        typeof value.input.boundaryId === "string"
      )
    )
      return null;
    return value;
  } catch {
    return null;
  }
}
export function saveMemoryAttempt(
  storage: StorageLike | null,
  campaignId: string,
  attempt: MemoryAttempt | null,
): boolean {
  try {
    if (!storage) return false;
    if (attempt)
      storage.setItem(memoryAttemptKey(campaignId), JSON.stringify(attempt));
    else storage.removeItem(memoryAttemptKey(campaignId));
    return true;
  } catch {
    return false;
  }
}
export function memoryAttemptConfirmed(
  attempt: MemoryAttempt,
  snapshot: MemorySnapshot,
): boolean {
  if (attempt.input.campaignId !== snapshot.campaignId) return false;
  const boundaries = snapshot.currentBoundary
    ? [snapshot.currentBoundary, ...snapshot.sessions]
    : snapshot.sessions;
  if (attempt.kind === "end")
    return boundaries.some((row) => row.sessionId === attempt.input.sessionId);
  const boundary = boundaries.find(
    (row) => row.id === attempt.input.boundaryId,
  );
  if (!boundary) return false;
  if (attempt.kind === "continue")
    return (
      boundary.state === "continued" ||
      (attempt.fromState === "ended" && boundary.state === "resuming")
    );
  return (
    boundary.recap.status === "ready" &&
    !boundary.recap.canRetry &&
    boundary.checkpointStatus === "ready"
  );
}
export function hasPendingSessionTurn(boundary: PublicSessionMemory): boolean {
  return (
    !!boundary.resume.pendingOperationId &&
    boundary.resume.pendingStatus !== "committed" &&
    boundary.resume.pendingStatus !== "cancelled"
  );
}
export function sessionGate(
  snapshot: MemorySnapshot | null,
  mode: TurnMode,
  operationId: string | null = null,
): boolean {
  if (mode === "feedback" || mode === "ooc") return true;
  if (!snapshot) return false;
  const boundary = snapshot.currentBoundary;
  if (!boundary || boundary.state === "continued") return true;
  if (boundary.checkpointStatus !== "ready") return false;
  return (
    boundary.state === "resuming" &&
    !!operationId &&
    operationId === boundary.resume.pendingOperationId
  );
}
export function turnAllowedBySession(
  snapshot: MemorySnapshot | null,
  turn: PublicTurn,
): boolean {
  return sessionGate(snapshot, turn.mode, turn.id);
}
export function sessionBoundaryView(boundary: PublicSessionMemory) {
  const pending = hasPendingSessionTurn(boundary);
  const valid = boundary.checkpointStatus === "ready";
  return {
    pending,
    canContinue:
      valid &&
      (boundary.state === "ended" ||
        (boundary.state === "resuming" && !pending)),
    recapText:
      valid && boundary.recap.status === "ready" ? boundary.recap.text : null,
  };
}
export const recapStatusLabels: Record<RecapStatus, string> = {
  pending: "Your session is saved. The public recap is pending.",
  generating: "Your session is saved. Preparing the public recap…",
  ready: "Public recap saved",
  failed:
    "Your session is saved. The recap could not finish; you can retry it.",
  stale: "Campaign records changed. Refresh the recap before using it.",
};
export const sessionGateLabels = {
  loading: "Checking the saved session…",
  ended:
    "This session has ended. Choose Continue from saved point before resuming an action.",
  resuming:
    "Finish or cancel the saved action, then choose Continue to next session.",
};

export type MemoryReadState = {
  snapshot: MemorySnapshot | null;
  loading: boolean;
  error: string;
};
export const initialMemoryReadState: MemoryReadState = {
  snapshot: null,
  loading: true,
  error: "",
};
// A shared public read projection only; durable session/turn authority stays on the server.
export function createMemoryReader(
  campaignId: string,
  read: (campaignId: string) => Promise<MemorySnapshot>,
  errorMessage: (error: unknown) => string,
) {
  let state = initialMemoryReadState;
  let generation = 0;
  let pending: Promise<MemorySnapshot> | null = null;
  const listeners = new Set<() => void>();
  const update = (next: MemoryReadState) => {
    state = next;
    listeners.forEach((fn) => fn());
  };
  const accept = (snapshot: MemorySnapshot) => {
    if (snapshot.campaignId !== campaignId)
      throw Error("Invalid campaign response");
    generation++;
    if (
      state.snapshot &&
      snapshot.runtimeRevision < state.snapshot.runtimeRevision
    )
      return;
    update({ snapshot, loading: false, error: "" });
  };
  const refresh = (): Promise<MemorySnapshot> => {
    if (pending) return pending;
    const request = ++generation;
    pending = read(campaignId)
      .then((snapshot) => {
        if (snapshot.campaignId !== campaignId)
          throw Error("Invalid campaign response");
        if (
          request === generation &&
          (!state.snapshot ||
            snapshot.runtimeRevision >= state.snapshot.runtimeRevision)
        )
          update({ snapshot, loading: false, error: "" });
        return snapshot;
      })
      .catch((cause: unknown) => {
        if (request === generation)
          update({ ...state, loading: false, error: errorMessage(cause) });
        throw cause;
      })
      .finally(() => {
        pending = null;
      });
    return pending;
  };
  return {
    getSnapshot: () => state,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    refresh,
    accept,
  };
}
