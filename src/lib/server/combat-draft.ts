import "server-only";
import { combatDraftRequest, parseCombatDraft, type CombatDraft } from "../gameplay/combat-draft.ts";
import { combatReadiness } from "./combat-readiness";
import { readCampaign } from "./repository";
import { PersistenceError } from "./errors";
import type { CombatReadinessProposal } from "../gameplay/combat-readiness.ts";
import { anthropicApiKey, anthropicEndpoint } from "./anthropic-endpoint";

// Polish 2 §6: the combat profile drafted on demand by Claude Sonnet 5.5 from the hero's text (the
// records are public; nothing private travels). One request, no retry; the reply is a proposal the
// owner edits and approves in the combat-readiness review. Price per 1M tokens: input $2, output $10.
const MODEL = "claude-sonnet-5-5";
export type CombatDraftResult = { status: "drafted"; draft: CombatDraft; proposal: CombatReadinessProposal; usage: { inputTokens: number; outputTokens: number; costUsdMicros: number } } | { status: "not_configured" | "failed"; error?: string };

export async function draftCombatProfile(campaignId: string, options: { fetcher?: typeof fetch } = {}): Promise<CombatDraftResult> {
  const apiKey = anthropicApiKey();
  if (!apiKey) return { status: "not_configured" };
  const proposal = await combatReadiness(campaignId, "inspect", {}) as CombatReadinessProposal;
  if (!("hero" in proposal)) throw new PersistenceError("unavailable");
  const snapshot = await readCampaign(campaignId);
  const hero = snapshot.entities.find((row) => row.id === proposal.hero.id) ?? snapshot.entities.find((row) => row.kind === "player");
  if (!hero) throw new PersistenceError("not_found");
  const items = snapshot.items.filter((item) => item.owner_entity_id === hero.id && item.quantity > 0).map((item) => item.name).slice(0, 20);
  const request = combatDraftRequest({ name: hero.name, details: hero.details, sheet: hero.character_sheet ?? null, items, conditions: hero.conditions }, proposal, snapshot.settings.values.language === "en" ? "en" : "ru");
  const started = Date.now();
  try {
    const door = anthropicEndpoint();
    const response = await (options.fetcher ?? fetch)(door.messagesUrl, {
      method: "POST",
      headers: door.headers(apiKey),
      body: JSON.stringify({ model: door.modelId(MODEL), max_tokens: 2000, output_config: { effort: "low" }, system: request.system, messages: [{ role: "user", content: request.user }] }),
      signal: AbortSignal.timeout(40_000),
    });
    const value = await response.json().catch(() => null) as { content?: { type: string; text?: string }[]; usage?: { input_tokens?: number; output_tokens?: number }; error?: { type?: string } } | null;
    if (!response.ok || !value) return { status: "failed", error: `HTTP ${response.status}${value?.error?.type ? `: ${value.error.type}` : ""}` };
    const text = (value.content ?? []).filter((block) => block.type === "text").map((block) => block.text ?? "").join("\n");
    const usage = { inputTokens: value.usage?.input_tokens ?? 0, outputTokens: value.usage?.output_tokens ?? 0 };
    const costUsdMicros = Math.round(usage.inputTokens * 2 + usage.outputTokens * 10);
    const draft = parseCombatDraft(text, proposal);
    console.info(JSON.stringify({ event: "combat_draft", campaignId, ok: !!draft, ms: Date.now() - started, usage, costUsdMicros }));
    if (!draft) return { status: "failed", error: "unparsable" };
    return { status: "drafted", draft, proposal, usage: { ...usage, costUsdMicros } };
  } catch (error) {
    return { status: "failed", error: String((error as Error)?.message ?? error).slice(0, 120) };
  }
}
