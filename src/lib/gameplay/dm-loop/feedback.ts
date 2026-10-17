// Chat with DM and Teach DM on a loop campaign (stage task §2b): the
// out-of-game question is answered by the campaign's own model, from the same
// first two layers a turn sees (how to run, the world) and the public parts of
// the dossier — never the private notes, plans or Character Models — and it may
// propose a DM Style change or a craft card through the existing
// approve/reject flow (a teachingCandidate, validated by the old turn engine).
import type { DmProvider, FeedbackResult, ProviderResult, RuntimeSource } from "../server-contracts.ts";
import type { TurnInput } from "../contracts.ts";
import type { DmModel, DmMessage, DmSystemBlock } from "../../server/dm/model/contracts.ts";
import type { DmEffort } from "../../model-runtime/dm-models.ts";
import { parseFeedback } from "../dm-schema.ts";
import { buildDmLoopContext } from "./context.ts";

const FEEDBACK_INSTRUCTIONS = `This is an out-of-game question or feedback from the player, not a turn: no time passes, no state changes, no dice. Answer in the campaign language as the game master talking to the player about the game: narration, tone, pacing, rules, what the hero may try, companions. Never reveal secrets, private notes, hidden rolls or anything the hero does not know. Reply with one JSON object and nothing else:
{
  "narration": "your answer to the player (up to 6000 characters)",
  "guidanceProposal": "a short proposed change to how you run this campaign, when the feedback asks for one; otherwise null",
  "teachingCandidate": null | { "kind": "campaign_style", "explanation": "why", "styleDelta": { "companionAgency": null | "low" | "normal" | "high", "descriptionDensity": null | "sparse" | "balanced" | "rich", "dialogueDensity": null | "sparse" | "balanced" | "rich", "dramaticPace": null | "slow" | "balanced" | "fast", "mystery": null | "low" | "normal" | "high", "failForward": null | "low" | "normal" | "high", "tone": null | "grounded" | "warm" | "grim" | "playful" } }
                        | { "kind": "global_craft", "explanation": "why", "entry": { "category": "short category", "stages": ["plan","narrate"], "triggers": ["literal", "words"], "en": { "title": "", "guidance": "", "avoid": "" }, "ru": { "title": "", "guidance": "", "avoid": "" }, "provenance": "Proposed owner-reviewed generalized lesson" } }
}
Rules for teachingCandidate: campaign_style changes one to three of the seven fields and leaves the rest null; global_craft is only for a lesson the player explicitly wants for every campaign, must contain no campaign names, facts, secrets or identifiers, and keeps guidance under 1600 characters per language. When unsure, teachingCandidate is null. Nothing here takes effect until the owner approves it.`;

/** A DmProvider whose feedback stage runs on the campaign's DM model; plan and
 * narrate are never called for feedback/ooc turns. */
export function loopFeedbackProvider(model: DmModel, effort: DmEffort, base: DmProvider): DmProvider {
  return {
    plan: base.plan.bind(base),
    narrate: base.narrate.bind(base),
    feedback: async (source: RuntimeSource, input: TurnInput): Promise<ProviderResult<FeedbackResult>> => {
      // publicSource (the old engine) already stripped the private state; the
      // dossier then holds only public records.
      const context = buildDmLoopContext(source, { ...input, mode: "game" });
      // Every layer but «now» (polish item 12: the stable dossier and the session's tail), then the question.
      const prefix = context.system.slice(0, -1);
      const now = context.system.at(-1)!;
      const system: DmSystemBlock[] = [...prefix, { text: `${now.text}\n\n${FEEDBACK_INSTRUCTIONS}`, cache: false }];
      const messages: DmMessage[] = [{ role: "user", text: `Player (out of game): ${input.input}` }];
      const started = performance.now();
      let text = "";
      let usage = { inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0, reasoningTokens: null as number | null };
      for await (const event of model.stream({ system, messages, toolset: null, effort, maxOutputTokens: 4000, operationId: input.operationId, cacheKey: input.campaignId })) {
        if (event.type === "text_delta") text += event.text;
        else if (event.type === "usage") usage = event.usage;
      }
      const start = text.indexOf("{"), end = text.lastIndexOf("}");
      let parsed: unknown;
      try { parsed = JSON.parse(start >= 0 && end > start ? text.slice(start, end + 1) : text); }
      catch { parsed = { narration: text.trim().slice(0, 6000) || "…", guidanceProposal: null, teachingCandidate: null }; }
      const output = parseFeedback(parsed);
      return { output, usage: { model: model.modelId, inputTokens: usage.inputTokens, outputTokens: usage.outputTokens, calls: 1,
        latencyMs: Math.round(performance.now() - started), cachedInputTokens: usage.cacheReadTokens, reasoningTokens: usage.reasoningTokens ?? undefined } };
    },
  };
}
