import type {
  PublicTurn,
  ResumeInput,
  TurnInput,
  TurnMode,
} from "./contracts.ts";
import type { TimelineFence } from "../saves/contracts.ts";
import { sameTimeline } from "../saves/client-state.ts";

export const actionMaxCharacters = 20_000;
export type DraftJournal = {
  timeline?: TimelineFence;
  text: string;
  attempt: TurnInput | null;
  command: ResumeInput | null;
  // A recovered public turn lacks the original mechanic proposal; resume it, never POST an invented replacement.
  recovered?: boolean;
};
export type DraftStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;
export const emptyJournal = (): DraftJournal => ({
  text: "",
  attempt: null,
  command: null,
});
export function journalKey(
  campaignId: string,
  mode: TurnMode,
  companionId: string | null = null,
  timeline?: TimelineFence,
) {
  return `rpg-play-draft-v1:${campaignId}:${timeline ? `${timeline.timelineId}:` : ""}${mode}:${companionId ?? ""}`;
}
// Public owner input only. This local journal is a recovery aid, never game authority.
export function loadJournal(
  storage: DraftStorage | null,
  campaignId: string,
  mode: TurnMode,
  companionId: string | null = null,
  timeline?: TimelineFence,
): DraftJournal {
  try {
    const raw = storage?.getItem(
      journalKey(campaignId, mode, companionId, timeline),
    );
    if (!raw) return emptyJournal();
    const value = JSON.parse(raw) as DraftJournal;
    if (value.timeline?.timelineId !== timeline?.timelineId)
      return emptyJournal();
    if (
      typeof value.text !== "string" ||
      value.text.length > actionMaxCharacters
    )
      return emptyJournal();
    const attempt = value.attempt;
    // FIX_S4 item 6: the game channel sends a line that names a companion as a companion turn (polish group 6), and
    // its attempt lives in the game journal — kept on a reload, so the turn's commit still clears the words.
    const ownChannel = !!attempt && ((attempt.mode === mode && attempt.companionId === companionId) ||
      (mode === "game" && companionId === null && attempt.mode === "companion"));
    if (
      attempt &&
      (attempt.campaignId !== campaignId ||
        !ownChannel ||
        attempt.timeline?.timelineId !== timeline?.timelineId ||
        typeof attempt.operationId !== "string" ||
        typeof attempt.input !== "string")
    )
      return {
        ...(value.timeline ? { timeline: value.timeline } : {}),
        text: value.text,
        attempt: null,
        command: null,
      };
    const command = value.command;
    return {
      ...(value.timeline ? { timeline: value.timeline } : {}),
      text: value.text,
      attempt: attempt ?? null,
      command:
        command?.campaignId === campaignId &&
        sameTimeline(command.timeline, attempt?.timeline) &&
        command.operationId === attempt?.operationId
          ? command
          : null,
      ...(value.recovered === true ? { recovered: true } : {}),
    };
  } catch {
    return emptyJournal();
  }
}
export function saveJournal(
  storage: DraftStorage | null,
  key: string,
  journal: DraftJournal,
) {
  try {
    storage?.setItem(key, JSON.stringify(journal));
    return !!storage;
  } catch {
    return false;
  }
}
export function prepareAttempt(
  previous: TurnInput | null,
  input: Omit<TurnInput, "operationId">,
  createId = () => crypto.randomUUID(),
): TurnInput {
  // An uncertain submission must be reconciled, not replaced with a fresh operation.
  if (previous) return previous;
  return { ...input, operationId: createId() };
}
export function reconcileJournal(
  journal: DraftJournal,
  turn: PublicTurn,
): DraftJournal {
  if (journal.attempt?.operationId !== turn.id) return journal;
  if (turn.status === "committed")
    return {
      ...(journal.timeline ? { timeline: journal.timeline } : {}),
      text: journal.text === turn.input ? "" : journal.text,
      attempt: null,
      command: null,
    };
  if (
    turn.status === "cancelled" ||
    (turn.status === "failed" && !turn.canRetry)
  )
    return {
      ...(journal.timeline ? { timeline: journal.timeline } : {}),
      text: journal.text || turn.input,
      attempt: null,
      command: null,
    };
  return journal;
}
export function journalNeedsTimelineReview(
  journal: DraftJournal,
  timeline?: TimelineFence,
) {
  return (
    !!(journal.text || journal.attempt || journal.command) &&
    !sameTimeline(journal.timeline, timeline)
  );
}
// Explicit owner review may reuse the text, never a former activation's command.
export function reviewJournalForTimeline(
  journal: DraftJournal,
  timeline?: TimelineFence,
): DraftJournal {
  return {
    text: journal.text,
    attempt: null,
    command: null,
    ...(timeline ? { timeline } : {}),
  };
}
export function prepareCommand(
  previous: ResumeInput | null,
  input: Omit<ResumeInput, "commandId">,
  createId = () => crypto.randomUUID(),
): ResumeInput {
  if (previous) return previous;
  return { ...input, commandId: createId() };
}
// A command the server refused (any 4xx) changed nothing, so it leaves the journal and the next
// click sends the action the owner chooses then. One with an unknown outcome (no answer, 5xx)
// stays and is re-sent with the same identity, which the server deduplicates.
export function dropRefusedCommand(
  journal: DraftJournal,
  status: number | null,
): DraftJournal {
  if (!journal.command || status === null || status < 400 || status > 499)
    return journal;
  return { ...journal, command: null };
}
export function isUnresolved(turn: PublicTurn) {
  return (
    turn.status === "pending" ||
    turn.status === "generating" ||
    turn.status === "awaiting_confirmation" ||
    (turn.status === "failed" && turn.canRetry)
  );
}
export function belongsToChannel(
  turn: PublicTurn,
  mode: TurnMode,
  companionId: string | null,
) {
  // Polish group 6: a talk with a companion is a scene in the world, so the game channel
  // shows it in the story; the companion channel (the party screen) keeps its own view.
  if (mode === "game") return turn.mode === "game" || turn.mode === "companion";
  return (
    turn.mode === mode &&
    (mode !== "companion" || turn.companionId === companionId)
  );
}
export const turnStatusLabels: Record<PublicTurn["status"], string> = {
  pending: "Action saved. Ready to continue.",
  generating: "The DM is composing a response…",
  awaiting_confirmation: "Review the recorded result, then continue.",
  committed: "Saved to this campaign",
  failed: "This turn could not finish. Your action is preserved.",
  cancelled: "Cancelled. No unfinished consequences were applied.",
};
export const turnFailureLabels: Record<
  NonNullable<PublicTurn["failure"]>,
  string
> = {
  configuration:
    "The DM needs local setup before it can respond. Your action is preserved.",
  provider: "The DM could not respond. Retry the same turn when ready.",
  context:
    "More campaign context is needed before play can continue. No outcome was applied.",
  validation:
    "This action needs clarification or uses unsupported rules. No outcome was applied.",
  conflict:
    "Campaign records changed. Review the latest state before sending a new action.",
  unavailable:
    "The connection was interrupted. Check the saved turn before trying again.",
};
