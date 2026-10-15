// Inserts suggested text ("Наметить курс", quick rolls) into the composer's own
// saved draft, so the existing composer picks it up when it (re)mounts. The draft
// is a local recovery aid only; nothing is sent until the owner presses Send.
import { journalKey, loadJournal, saveJournal, type DraftStorage } from "../gameplay/client-state.ts";
import type { TurnMode } from "../gameplay/contracts.ts";
import type { TimelineFence } from "../saves/contracts.ts";

export function appendToComposerDraft(
  storage: DraftStorage | null,
  input: { campaignId: string; mode: TurnMode; companionId: string | null; timeline: TimelineFence | undefined; text: string },
) {
  const journal = loadJournal(storage, input.campaignId, input.mode, input.companionId, input.timeline);
  // A turn in flight keeps its exact text and identity.
  if (journal.attempt || journal.command || !input.text.trim()) return false;
  const text = journal.text.trim() ? `${journal.text.trimEnd()}\n${input.text.trim()}` : input.text.trim();
  return saveJournal(storage, journalKey(input.campaignId, input.mode, input.companionId, input.timeline), {
    ...journal,
    timeline: input.timeline,
    text,
  });
}

export function draftStorage(): DraftStorage | null {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}
