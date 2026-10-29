// Chat with DM and Teach DM on a loop campaign (stage task §2b): the
// out-of-game question is answered by the campaign's own model, from the same
// first two layers a turn sees (how to run, the world) and the public parts of
// the dossier — never the private notes, plans or Character Models — and it may
// propose a DM Style change or a craft card through the existing
// approve/reject flow (a teachingCandidate, validated by the old turn engine).
// Fix S4 run 1 (items 3, 11b): a «?» may come while a roll card waits. The answer then sees the waiting cards (their
// public face: what is checked, what adds to the die, the difficulty — never the die, which the player may not have
// seen yet) and may withdraw a card that should not have been called; the turn keeps waiting for the die either way.
import type { DmProvider, FeedbackResult, ProviderResult, RuntimeSource } from "../server-contracts.ts";
import type { PublicTurn, TurnInput } from "../contracts.ts";
import type { DmModel, DmMessage, DmSystemBlock } from "../../server/dm/model/contracts.ts";
import type { DmEffort } from "../../model-runtime/dm-models.ts";
import { parseFeedback } from "../dm-schema.ts";
import { buildDmLoopContext } from "./context.ts";
import { waitingCardsOf } from "./check-corrections.ts";
import { companyOn, companyRequest } from "./company.ts";

const FEEDBACK_INSTRUCTIONS = `This is an out-of-game question or feedback from the player, not a turn: no time passes, no state changes, no dice. Answer in the campaign language as the game master talking to the player about the game: narration, tone, pacing, rules, what the hero may try, companions. Never reveal secrets, private notes, hidden rolls or anything the hero does not know. Reply with one JSON object and nothing else:
{
  "narration": "your answer to the player (up to 6000 characters)",
  "guidanceProposal": "a short proposed change to how you run this campaign, when the feedback asks for one; otherwise null",
  "teachingCandidate": null | { "kind": "campaign_style", "explanation": "why", "styleDelta": { "companionAgency": null | "low" | "normal" | "high", "descriptionDensity": null | "sparse" | "balanced" | "rich", "dialogueDensity": null | "sparse" | "balanced" | "rich", "dramaticPace": null | "slow" | "balanced" | "fast", "mystery": null | "low" | "normal" | "high", "failForward": null | "low" | "normal" | "high", "tone": null | "grounded" | "warm" | "grim" | "playful" } }
                        | { "kind": "global_craft", "explanation": "why", "entry": { "category": "short category", "stages": ["plan","narrate"], "triggers": ["literal", "words"], "en": { "title": "", "guidance": "", "avoid": "" }, "ru": { "title": "", "guidance": "", "avoid": "" }, "provenance": "Proposed owner-reviewed generalized lesson" } }
}
FIX_S4 item 1 — a fact settled here: when this exchange settles a fact of the hero's story (the owner says what his hero said, did or is; you state a fact about the hero and the owner agrees), add "tableFact": "that fact in one line, in the campaign language" — it becomes an owner-pinned fact you see in every turn after, and the owner sees it pinned; otherwise leave it out. Never a secret, never a guess, never something the owner disputes.
Rules for teachingCandidate: campaign_style changes one to three of the seven fields and leaves the rest null; global_craft is only for a lesson the player explicitly wants for every campaign, must contain no campaign names, facts, secrets or identifiers, and keeps guidance under 1600 characters per language. When unsure, teachingCandidate is null. Nothing here takes effect until the owner approves it.`;

const signed = (n: number) => `${n >= 0 ? "+" : "−"}${Math.abs(n)}`;

/** The waiting cards in the answer's context, and the one field that may withdraw them (null: no card waits). */
export function waitingCardsBlock(turns: readonly PublicTurn[]): string | null {
  const waiting = waitingCardsOf(turns);
  if (!waiting.length) return null;
  const lines = waiting.map(({ check }) => {
    const adds = check.addends?.length ? check.addends.map((a) => `${signed(a.value)} ${a.source}`).join(", ") : signed(check.modifier);
    return `- id ${check.id}: ${check.actorName} · ${check.kind} — ${check.reason?.trim() || check.kind}; adds to the die: ${adds}` +
      `${check.dc !== null ? `; DC ${check.dc}` : ""}${check.advantage !== "normal" ? `; ${check.advantage}` : ""}`;
  });
  return [
    "A roll card waits for the player in the current turn. This answer does not resolve it: the turn waits for the die until the player rolls and goes on. The cards that wait:",
    ...lines,
    "If the player's message shows that a waiting check should not have been called (the hero told the truth, the action needs no roll, the card adds the wrong number and the check must be called again), you may withdraw it: add to your JSON \"withdrawChecks\": [{ \"id\": \"<the card's id>\", \"reason\": \"one short line\" }]. A withdrawn card disappears and its roll does not count; when the turn goes on you narrate without it or call a new, correct check. Never withdraw a check because its result might be bad for the hero, and say in your answer what you withdrew. Otherwise leave \"withdrawChecks\" out. Name only ids from this list.",
  ].join("\n");
}

/** The answer's withdrawals, kept only for cards that wait now (at most four, each named once). */
export function parseWithdrawals(value: unknown, waitingIds: ReadonlySet<string>): { id: string; reason: string | null }[] {
  if (!Array.isArray(value)) return [];
  const out: { id: string; reason: string | null }[] = [];
  for (const entry of value.slice(0, 4)) {
    const id = typeof entry === "string" ? entry : entry && typeof entry === "object" ? (entry as { id?: unknown }).id : null;
    const reason = entry && typeof entry === "object" ? (entry as { reason?: unknown }).reason : null;
    if (typeof id !== "string" || !waitingIds.has(id) || out.some((row) => row.id === id)) continue;
    out.push({ id, reason: typeof reason === "string" && reason.trim() ? reason.trim().slice(0, 300) : null });
  }
  return out;
}

/** FIX_S4 item 1: the answer's settled fact, one line (null when absent or empty). */
export const TABLE_FACT_PREFIX = "Agreed at the table: ";
export function parseTableFact(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const line = value.replace(/\s+/g, " ").trim().slice(0, 280);
  return line.length >= 3 ? line : null;
}

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
      // Fix S4 run 1: an out-of-game question while a card waits sees the waiting cards (never on Teach DM).
      const cards = input.mode === "ooc" ? waitingCardsBlock(source.runtime.turns) : null;
      const waitingIds = new Set(input.mode === "ooc" ? waitingCardsOf(source.runtime.turns).map(({ check }) => check.id) : []);
      const system: DmSystemBlock[] = [...prefix, { text: `${now.text}\n\n${FEEDBACK_INSTRUCTIONS}${cards ? `\n\n${cards}` : ""}`, cache: false }];
      const messages: DmMessage[] = [{ role: "user", text: `Player (out of game): ${input.input}` }];
      const started = performance.now();
      let text = "";
      let usage = { inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0, reasoningTokens: null as number | null };
      // Multi-hero 1: a company table's answer is asked in the company's words (company.ts).
      const asked = companyOn(source.dmOptions) ? companyRequest({ system, messages, toolset: null }) : { system, messages, toolset: null };
      for await (const event of model.stream({ ...asked, effort, maxOutputTokens: 4000, operationId: input.operationId, cacheKey: input.campaignId })) {
        if (event.type === "text_delta") text += event.text;
        else if (event.type === "usage") usage = event.usage;
      }
      const start = text.indexOf("{"), end = text.lastIndexOf("}");
      let parsed: unknown;
      try { parsed = JSON.parse(start >= 0 && end > start ? text.slice(start, end + 1) : text); }
      catch { parsed = { narration: text.trim().slice(0, 6000) || "…", guidanceProposal: null, teachingCandidate: null }; }
      // The withdrawals are this runtime's own field: read apart from the shared feedback schema, checked against the
      // cards that wait now (the server checks them once more when it records them).
      const { withdrawChecks: named, tableFact: fact, ...rest } = parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? parsed as Record<string, unknown> : { withdrawChecks: undefined, tableFact: undefined };
      const withdrawals = parseWithdrawals(named, waitingIds);
      // FIX_S4 item 1: a fact of the hero's story settled out of game (out-of-game questions only, never Teach DM).
      const tableFact = input.mode === "ooc" ? parseTableFact(fact) : null;
      const output: FeedbackResult = { ...parseFeedback(parsed && typeof parsed === "object" && !Array.isArray(parsed) ? rest : parsed),
        ...(withdrawals.length ? { withdrawChecks: withdrawals } : {}), ...(tableFact ? { tableFact } : {}) };
      return { output, usage: { model: model.modelId, inputTokens: usage.inputTokens, outputTokens: usage.outputTokens, calls: 1,
        latencyMs: Math.round(performance.now() - started), cachedInputTokens: usage.cacheReadTokens, reasoningTokens: usage.reasoningTokens ?? undefined } };
    },
  };
}
