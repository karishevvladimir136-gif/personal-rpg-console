import "server-only";
import type { BootstrapTicket } from "../adventures/bootstrap-service.ts";
import type { CreationInput } from "../adventures/bootstrap-contracts.ts";
import type { ProviderResult } from "../gameplay/server-contracts.ts";
import { manualHeroProposal, readHeroDraft, type HeroProposal } from "../adventures/hero-draft.ts";
import { buildHeroDraftRequest, HERO_DRAFT_OUTPUT_TOKENS, type HeroDraftContext } from "../adventures/hero-draft-request.ts";
import { dmModelSpec, dmUsageCost, type DmEffort, type DmUsage } from "../model-runtime/dm-models.ts";
import { DmModelError, type DmModel } from "./dm/model/contracts.ts";
import { createDmModel } from "./dm/model/index.ts";

// Fix run after session 2, stage F (items 16, 20): the hero built by the campaign's DM in one call. The ticket's pinned
// profile names the model (the wizard's default DM, Claude Opus 5.5 at high, or the campaign's own choice). The answer
// is read tolerantly (src/lib/adventures/hero-draft.ts); a failed or unreadable call still opens the review — a sheet to
// fill in by hand with the reason in plain words — so the owner is never stuck on «503». Every attempt and every
// refusal reason is logged (item 16: the old draft's three refusals left nothing behind).

const reasonText = (error: unknown, language: "en" | "ru") => {
  const ru = language === "ru";
  if (error instanceof DmModelError) {
    if (error.kind === "not_configured") return ru ? "Ведущий не настроен (нет ключа модели) — заполни лист вручную." : "The DM is not configured (no model key) — fill in the sheet by hand.";
    if (error.kind === "rate_limited") return ru ? "Модель ведущего сейчас перегружена — заполни лист вручную или нажми «Собрать заново» чуть позже." : "The DM's model is busy — fill in the sheet by hand or press “Build again” a little later.";
    return ru ? "Ведущий не ответил (сбой связи с моделью) — заполни лист вручную или нажми «Собрать заново»." : "The DM did not answer (the model's connection failed) — fill in the sheet by hand or press “Build again”.";
  }
  return ru ? "Ведущий не ответил — заполни лист вручную или нажми «Собрать заново»." : "The DM did not answer — fill in the sheet by hand or press “Build again”.";
};
const unreadable = (stop: string | null, language: "en" | "ru") => language === "ru"
  ? stop === "max_tokens" ? "Ответ ведущего оборвался на середине (слишком длинный) — лист пустой: заполни его вручную или нажми «Собрать заново»." : "Ответ ведущего не удалось прочитать — лист пустой: заполни его вручную или нажми «Собрать заново»."
  : stop === "max_tokens" ? "The DM's answer was cut off (too long) — the sheet is empty: fill it in by hand or press “Build again”." : "The DM's answer could not be read — the sheet is empty: fill it in by hand or press “Build again”.";

export function heroDraftContext(ticket: BootstrapTicket): HeroDraftContext {
  const input = ticket.input as CreationInput;
  return { language: input.language, name: input.name, description: input.description, world: { title: ticket.world.title, premise: ticket.world.premise } };
}

export function createHeroDraftProvider(deps: { model?: (selection: { providerId: string; modelId: string }) => DmModel } = {}) {
  return async (ticket: BootstrapTicket): Promise<ProviderResult<HeroProposal>> => {
    const input = ticket.input as CreationInput;
    const effort = (ticket.profile.reasoning ?? "high") as DmEffort;
    const base = { kind: "creation", draft: "hero-one-pass", provider: ticket.profile.providerId, model: ticket.profile.modelId, reasoning: effort };
    const started = Date.now();
    console.info(JSON.stringify({ event: "bootstrap_provider_attempt", ...base }));
    const request = buildHeroDraftRequest(heroDraftContext(ticket), effort);
    let text = "", stop: string | null = null;
    let usage: DmUsage | null = null;
    const result = (output: HeroProposal): ProviderResult<HeroProposal> => ({ output, usage: { model: ticket.profile.modelId,
      inputTokens: usage?.inputTokens ?? 0, outputTokens: usage?.outputTokens ?? 0, calls: 1, latencyMs: Date.now() - started } });
    try {
      const model = (deps.model ?? createDmModel)({ providerId: ticket.profile.providerId, modelId: ticket.profile.modelId });
      for await (const event of model.stream({ system: request.system, messages: request.messages, toolset: null, effort,
        maxOutputTokens: HERO_DRAFT_OUTPUT_TOKENS, operationId: input.requestId })) {
        if (event.type === "text_delta") text += event.text;
        else if (event.type === "usage") usage = event.usage;
        else if (event.type === "stop") stop = event.reason;
      }
    } catch (error) {
      console.info(JSON.stringify({ event: "bootstrap_provider_refused", ...base, latencyMs: Date.now() - started,
        code: error instanceof DmModelError ? error.kind : (error as { code?: unknown })?.code ?? null, name: error instanceof Error ? error.name : null,
        httpStatus: error instanceof DmModelError ? error.detail.httpStatus ?? null : null,
        message: error instanceof Error ? error.message.slice(0, 300) : String(error).slice(0, 300) }));
      return result(manualHeroProposal(input, reasonText(error, input.language)));
    }
    const spec = dmModelSpec(ticket.profile.providerId, ticket.profile.modelId);
    const costUsd = usage && spec ? Number(dmUsageCost(spec, usage).toFixed(4)) : null;
    const proposal = readHeroDraft(text, input);
    if (!proposal) {
      // The answer is DM-side text about the owner's own hero; its head goes to the owner's own log only.
      console.info(JSON.stringify({ event: "bootstrap_provider_refused", ...base, latencyMs: Date.now() - started, code: "unreadable", stop, costUsd,
        chars: text.length, head: text.slice(0, 300) }));
      return result(manualHeroProposal(input, unreadable(stop, input.language)));
    }
    console.info(JSON.stringify({ event: "bootstrap_provider_done", ...base, latencyMs: Date.now() - started, stop, costUsd,
      inputTokens: usage?.inputTokens ?? null, outputTokens: usage?.outputTokens ?? null, items: proposal.possessions.length,
      counters: proposal.counters.length, spells: proposal.sheet.spells?.length ?? 0, notes: proposal.notes.length }));
    return result(proposal);
  };
}
