// Fix run A6 (owner's decision 2026-10-20 00:38: session 3 plays on «пишет — записывает»): the ledger
// checker. After the bookkeeper has recorded the turn, a cheap model (Claude Haiku 5.5, the quotable-line
// check's model) compares the narration, the writer's ledger and the records actually accepted — every
// take / drink / spend / give / wound / heal / learn the story shows must have a matching record. A miss
// sends the bookkeeper one correcting message; what still does not match becomes the owner's chip
// («не записано: седло Дирка») and a log line. The check runs before the commit, while the player already
// reads the text (the «recording» state), so the correction lands in the same atomic commit.
// Session 2's known misses — the saddle, three bandits' weapons, the key, a shot bolt — are its probe cases.
// This module is the pure part (the request, the parse); the call is `checkLedger` below.
import type { DmLoopReceipt } from "./contracts.ts";
import { walletLine, walletOfEntity, walletOfStorage } from "../../inventory/model.ts";
import { QUOTABLE_MODEL, QUOTABLE_PRICE_PER_MILLION } from "./quotable.ts";

export const LEDGER_CHECK_MODEL = QUOTABLE_MODEL;
export const LEDGER_CHECK_MAX_MISSES = 12;

export type LedgerMiss = { event: string; expected: string };
/** What the records already hold (the stage A probes: without it the checker took known companions for new people and
 * asked for arrows nobody tracks): the people on record and what the party's members track — counters and items. */
export type LedgerCheckState = { people: string[]; tracked: string[] };
type StateSource = { snapshot: { entities: { id: string; name: string; kind: string; resources?: Record<string, number> | null }[];
  items: { name: string; quantity: number; owner_entity_id: string | null; storage_id?: string }[];
  storages?: { id: string; name: string; kind: string; detail?: { locationId?: string; wallet?: Record<string, number> } }[];
  publicState?: { current_location_id?: string | null } | null; settings?: { values?: { language?: string } } | null };
  runtime: { configuration?: { controlledEntityIds?: string[]; presentEntityIds?: string[] } | null } };
export function ledgerCheckState(source: StateSource): LedgerCheckState {
  const party = new Set(source.runtime.configuration?.controlledEntityIds ?? []);
  for (const row of source.snapshot.entities) if (row.kind === "player") party.add(row.id);
  const names = new Map(source.snapshot.entities.map((row) => [row.id, row.name]));
  const people = source.snapshot.entities.filter((row) => row.kind !== "faction").map((row) => row.name).slice(0, 80);
  const counters = source.snapshot.entities.filter((row) => party.has(row.id))
    .flatMap((row) => Object.entries(row.resources ?? {}).filter(([key]) => !key.startsWith("currency_")).map(([key, value]) => `${row.name}: ${key} ${value}`));
  const language = source.snapshot.settings?.values?.language;
  const wallets = source.snapshot.entities.filter((row) => party.has(row.id) && Object.values(walletOfEntity({ resources: row.resources ?? {} })).some((amount) => amount > 0))
    .map((row) => `${row.name}: ${walletLine(walletOfEntity({ resources: row.resources ?? {} }), language)}`);
  const items = source.snapshot.items.filter((row) => row.quantity > 0 && row.owner_entity_id && party.has(row.owner_entity_id))
    .map((row) => `${names.get(row.owner_entity_id!) ?? "?"}: ${row.name} ×${row.quantity}`);
  // Fix run D (§4): what the people present carry and what lies here — a search lists them from the records.
  const present = new Set(source.runtime.configuration?.presentEntityIds ?? []);
  const carried = source.snapshot.items.filter((row) => row.quantity > 0 && row.owner_entity_id && present.has(row.owner_entity_id) && !party.has(row.owner_entity_id))
    .map((row) => `${names.get(row.owner_entity_id!) ?? "?"} (present): ${row.name} ×${row.quantity}`);
  const here = source.snapshot.publicState?.current_location_id ?? null;
  const pile = (source.snapshot.storages ?? []).find((row) => row.kind === "place" && row.detail?.locationId === here);
  const lying = pile ? [...source.snapshot.items.filter((row) => row.quantity > 0 && row.storage_id === pile.id).map((row) => `${pile.name}: ${row.name} ×${row.quantity}`),
    ...(Object.keys(walletOfStorage(pile)).length ? [`${pile.name}: ${walletLine(walletOfStorage(pile), language)}`] : [])] : [];
  return { people, tracked: [...counters, ...wallets, ...items, ...carried, ...lying].slice(0, 160) };
}
export type LedgerCheckResult = { misses: LedgerMiss[]; usage: { inputTokens: number; outputTokens: number } | null; costUsdMicros: number; elapsedMs: number; error: string | null };

/** The accepted records of the turn as short lines (the receipts' own summaries). */
export function recordLines(receipts: DmLoopReceipt[]): string[] {
  return receipts.filter((receipt) => receipt.result.ok && receipt.call.name !== "finish_turn" && receipt.call.name !== "query_state")
    .map((receipt) => `${receipt.call.name}: ${receipt.result.ok ? receipt.result.summary : ""}`.slice(0, 300));
}

export function ledgerCheckRequest(input: { narration: string; ledger: string; records: string[]; language: "ru" | "en"; state?: LedgerCheckState }): { system: string; user: string } {
  const system = input.language === "ru"
    ? `Ты проверяешь учёт хода ролевой игры. Тебе дают рассказ ведущего, его черновой список изменений (ledger) и записи, которые сервер принял. Найди события рассказа, у которых нет подходящей записи: герой или спутник что-то взял, нашёл, купил, отдал, потерял, выпил или съел, потратил или получил деньги, был ранен или вылечен, израсходовал заряды или стрелы, кто-то новый появился, время заметно прошло. Не отмечай то, что лишь упомянуто, обдумано или предложено, и то, что уже записано другими словами. Человек из списка «люди в записях» — не новый. Найденное, что рассказ показывает лежащим (в сундуке, на теле), но никто ещё не взял, тоже требует записи там, где лежит (item create / money grant на «here»). Расход стрел, болтов, зарядов, зелий, еды отмечай только для того, что есть в списке «что ведёт партия». Отмечай только явные пропуски. Ответь одним JSON-объектом: {"misses":[{"event":"что случилось, словами рассказа (только то, что видел игрок), до десяти слов","expected":"какая запись нужна: item / money / resource / upsert_character / advance_time и что именно"}]}; если пропусков нет — {"misses":[]}.`
    : `You check the bookkeeping of one turn of a role-playing game. You get the DM's narration, its draft list of changes (the ledger) and the records the server accepted. Find the events of the story that have no matching record: the hero or a companion took, found, bought, gave, lost, drank or ate something, spent or received money, was wounded or healed, used charges or arrows, someone new appeared, notable time passed. Do not flag what is only mentioned, considered or offered, nor what is already recorded in other words. A person on the PEOPLE ON RECORD list is not new. Loot the story shows lying (in a chest, on a body) that nobody took yet still needs a record where it lies (item create / money grant to "here"). Flag the use of arrows, bolts, charges, potions or food only for what the TRACKED list holds. Flag only clear misses. Answer with one JSON object: {"misses":[{"event":"what happened, in the narration's words (only what the player read), up to ten words","expected":"the record needed: item / money / resource / upsert_character / advance_time and what exactly"}]}; with no misses, {"misses":[]}.`;
  const user = [`NARRATION:\n${input.narration.slice(0, 16000)}`, `LEDGER:\n${input.ledger.slice(0, 6000) || "(none)"}`,
    `ACCEPTED RECORDS:\n${input.records.length ? input.records.map((line, index) => `${index + 1}. ${line}`).join("\n") : "(none)"}`,
    ...(input.state ? [`PEOPLE ON RECORD:\n${input.state.people.join("; ") || "(none)"}`, `TRACKED BY THE PARTY (counters and items):\n${input.state.tracked.join("\n") || "(nothing)"}`] : [])].join("\n\n");
  return { system, user };
}

export function parseLedgerMisses(text: string): LedgerMiss[] {
  const start = text.indexOf("{"), end = text.lastIndexOf("}");
  if (start < 0 || end <= start) return [];
  let value: { misses?: unknown };
  try { value = JSON.parse(text.slice(start, end + 1)) as { misses?: unknown }; } catch { return []; }
  if (!Array.isArray(value.misses)) return [];
  const misses: LedgerMiss[] = [];
  for (const raw of value.misses) {
    if (!raw || typeof raw !== "object") continue;
    const event = String((raw as { event?: unknown }).event ?? "").replace(/\s+/g, " ").trim().slice(0, 160);
    const expected = String((raw as { expected?: unknown }).expected ?? "").replace(/\s+/g, " ").trim().slice(0, 240);
    if (!event) continue;
    misses.push({ event, expected });
    if (misses.length >= LEDGER_CHECK_MAX_MISSES) break;
  }
  return misses;
}

/** The bookkeeper's one correcting message. */
export function ledgerCorrectionMessage(misses: LedgerMiss[]): string {
  return `A check of the story against your records found ${misses.length === 1 ? "one event" : `${misses.length} events`} without a record. Record each with the matching tool (or leave it when the story did not really make the change), then finish_turn again; no text:\n` +
    misses.map((miss) => `- ${miss.event}${miss.expected ? ` → ${miss.expected}` : ""}`).join("\n");
}

/** The owner's chip for a miss that stayed after the correction. */
export function ledgerChip(language: "ru" | "en", miss: LedgerMiss): string {
  return language === "ru" ? `не записано: ${miss.event}` : `not recorded: ${miss.event}`;
}

type Fetcher = typeof fetch;
/** One request to the cheap model, no retry; a failure is reported, never thrown. The key comes from server code. */
export async function checkLedger(apiKey: string, input: { narration: string; ledger: string; receipts: DmLoopReceipt[]; language: "ru" | "en"; state?: LedgerCheckState },
  options: { fetcher?: Fetcher; timeoutMs?: number } = {}): Promise<LedgerCheckResult> {
  const started = Date.now();
  if (!input.narration.trim()) return { misses: [], usage: null, costUsdMicros: 0, elapsedMs: 0, error: null };
  if (!apiKey) return { misses: [], usage: null, costUsdMicros: 0, elapsedMs: 0, error: "not_configured" };
  const request = ledgerCheckRequest({ narration: input.narration, ledger: input.ledger, records: recordLines(input.receipts), language: input.language, state: input.state });
  try {
    const response = await (options.fetcher ?? fetch)("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model: LEDGER_CHECK_MODEL, max_tokens: 900, output_config: { effort: "low" }, system: request.system, messages: [{ role: "user", content: request.user }] }),
      signal: AbortSignal.timeout(options.timeoutMs ?? 30_000),
    });
    const value = await response.json().catch(() => null) as { content?: { type: string; text?: string }[]; usage?: { input_tokens?: number; output_tokens?: number }; error?: { type?: string } } | null;
    if (!response.ok || !value) throw new Error(`HTTP ${response.status}${value?.error?.type ? `: ${value.error.type}` : ""}`);
    const text = (value.content ?? []).filter((block) => block.type === "text").map((block) => block.text ?? "").join("\n");
    const usage = { inputTokens: value.usage?.input_tokens ?? 0, outputTokens: value.usage?.output_tokens ?? 0 };
    return { misses: parseLedgerMisses(text), usage, costUsdMicros: Math.round(usage.inputTokens * QUOTABLE_PRICE_PER_MILLION.input + usage.outputTokens * QUOTABLE_PRICE_PER_MILLION.output),
      elapsedMs: Date.now() - started, error: null };
  } catch (error) {
    return { misses: [], usage: null, costUsdMicros: 0, elapsedMs: Date.now() - started, error: String((error as Error)?.message ?? error).slice(0, 120) };
  }
}
