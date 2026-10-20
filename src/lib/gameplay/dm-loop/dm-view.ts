// Fix run A5: «Что видит ведущий» — exactly what the DM received on a turn, rebuilt from the state the turn
// started from (its snapshot) with the context builder the turn used: each layer with its tokens, budget and
// what the budget dropped, the instruction language, the memory preset, the craft cards chosen for the
// turn, the owner-pinned facts. Both key findings of session 2 (English instructions; no hidden layer) were
// found by reading code — this view shows them in a minute. Owner-only; the private layers' texts (the
// living dossier, the session's tail, «now») only when the owner opted in to see the DM's secrets.
import type { TurnInput } from "../contracts.ts";
import type { RuntimeSource } from "../server-contracts.ts";
import { buildCouncilContext, buildDmLoopContext, estimateTokens, privateNotesGauge } from "./context.ts";
import { parseDmOptions } from "./options.ts";

export type DmViewLayer = { key: "howToDm" | "world" | "history" | "living" | "tail" | "now" | "council"; tokens: number; budgetTokens: number;
  dropped: string[]; blocks: number; cached: boolean; text: string | null };
export type DmView = {
  turnNo: number | null; operationId: string; input: string; mode: string;
  language: "ru" | "en"; instructions: "ru" | "en"; memory: string; secretsVisible: boolean;
  totalTokens: number; layers: DmViewLayer[]; craftCards: string[]; pinnedFacts: string[];
  /** Fix run B2 (4): the memory gauge — the private notes against their budget, how many are closed or were dropped. */
  memoryGauge: { used: number; budget: number; notes: number; closed: number; dropped: number; hiddenLayer: boolean };
};

export function dmViewOf(source: RuntimeSource, input: TurnInput, turnNo: number | null = null): DmView {
  const options = parseDmOptions(source.dmOptions);
  const council = input.mode === "companion";
  const context = council ? buildCouncilContext(source, input) : buildDmLoopContext(source, input);
  const report = (layer: number) => context.layers.filter((row) => row.layer === layer);
  const sum = (rows: { usedTokens: number }[]) => rows.reduce((total, row) => total + row.usedTokens, 0);
  const show = (text: string, isPrivate: boolean) => (!isPrivate || options.secretsVisible ? text : null);
  const layers: DmViewLayer[] = council ? [
    { key: "howToDm", tokens: estimateTokens(context.parts.howToDm), budgetTokens: report(1)[0]?.budgetTokens ?? 0, dropped: report(1)[0]?.dropped ?? [], blocks: 1, cached: true, text: context.parts.howToDm },
    { key: "council", tokens: estimateTokens(context.parts.tail), budgetTokens: report(7)[0]?.budgetTokens ?? 0, dropped: [], blocks: 1, cached: false, text: show(context.parts.tail, true) },
  ] : [
    { key: "howToDm", tokens: estimateTokens(context.parts.howToDm), budgetTokens: report(1)[0]?.budgetTokens ?? 0, dropped: report(1)[0]?.dropped ?? [], blocks: 1, cached: true, text: context.parts.howToDm },
    { key: "world", tokens: estimateTokens(context.parts.world), budgetTokens: report(2)[0]?.budgetTokens ?? 0, dropped: report(2)[0]?.dropped ?? [], blocks: 1, cached: true, text: context.parts.world },
    { key: "history", tokens: sum(report(6)), budgetTokens: report(6)[0]?.budgetTokens ?? 0, dropped: report(6).flatMap((row) => row.dropped), blocks: context.parts.history.length, cached: true,
      text: context.parts.history.join("\n") },
    { key: "living", tokens: estimateTokens(context.parts.living), budgetTokens: report(3)[0]?.budgetTokens ?? 0, dropped: report(3)[0]?.dropped ?? [], blocks: 1, cached: true, text: show(context.parts.living, true) },
    { key: "tail", tokens: estimateTokens(context.parts.tail), budgetTokens: report(4)[0]?.budgetTokens ?? 0, dropped: report(4)[0]?.dropped ?? [], blocks: 1, cached: false, text: show(context.parts.tail, true) },
    { key: "now", tokens: estimateTokens(context.parts.now), budgetTokens: report(5)[0]?.budgetTokens ?? 0, dropped: report(5)[0]?.dropped ?? [], blocks: 1, cached: false, text: show(context.parts.now, true) },
  ];
  return {
    turnNo, operationId: input.operationId, input: input.input, mode: input.mode,
    language: source.snapshot.settings.values.language === "ru" ? "ru" : "en", instructions: options.instructions, memory: options.memory,
    secretsVisible: options.secretsVisible, totalTokens: layers.reduce((total, layer) => total + layer.tokens, 0) + estimateTokens(context.user),
    layers, craftCards: context.craft.selected.map((card) => card.title),
    pinnedFacts: (source.snapshot.campaign.pinned_facts ?? []).map((pin) => pin.text),
    memoryGauge: privateNotesGauge(source),
  };
}
