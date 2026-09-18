import type { DmFeedbackMessage, MutationInput } from "./contracts.ts";

export const feedbackMaxCharacters = 20000;

// Feedback is an owner-authored record, never a game action or a Guide edit.
export function feedbackSend(campaignId: string, body: string): MutationInput {
  if (!body.trim() || body.length > feedbackMaxCharacters)
    throw new Error("Feedback must contain 1 to 20,000 characters.");
  return {
    operation: "feedback.send",
    campaignId,
    expectedRevision: 0,
    payload: { body },
  };
}

export function campaignFeedback(
  campaignId: string,
  messages: readonly DmFeedbackMessage[],
): DmFeedbackMessage[] {
  return messages
    .filter((message) => message.campaign_id === campaignId)
    .sort(
      (a, b) =>
        a.sequence - b.sequence || a.id.localeCompare(b.id),
    );
}
