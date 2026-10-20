// Fix run B3 (item 60, report §14): every roll the player saw is told in the story. Session 2's turns came in pieces
// (text → roll → continuation) and the piece after a roll started from the next actor: the hero's Lightning Bolt and
// a Fire Bolt at a horse were rolled, shown on cards, and never told — twice, after a prompt line already asked for it.
// So the check is in code: when the narration is complete, a cheap model (Haiku 5.5, as the quotable-line and ledger
// checks) reads the narration and the rolls the player saw; a roll whose outcome the story does not tell gets one
// continuation asking the DM to tell it, in order, without repeating the text. Never fails the turn.
import type { DmLoopReceipt } from "./contracts.ts";
import { QUOTABLE_MODEL, QUOTABLE_PRICE_PER_MILLION } from "./quotable.ts";

export type RollCheckResult = { untold: number[]; costUsdMicros: number; error: string | null };

/** The rolls the player saw this turn (a roll card or a hit on the party): one line each. */
export function visibleRolls(receipts: DmLoopReceipt[]): { position: number; line: string }[] {
  return receipts.filter((receipt) => receipt.call.name === "roll" && receipt.result.ok && !!receipt.result.player)
    .map((receipt) => ({ position: receipt.position, line: `${receipt.result.ok ? receipt.result.summary : ""}`.slice(0, 300) }));
}

export function rollCheckRequest(input: { narration: string; rolls: string[]; language: "ru" | "en" }): { system: string; user: string } {
  const system = input.language === "ru"
    ? `Ты проверяешь рассказ ведущего ролевой игры. Игрок видел броски (они пронумерованы). Для каждого броска реши: рассказывает ли история его исход как событие — попал или промахнулся, сколько урона и куда, удалось или нет то, что пытались. Броска, исход которого в рассказе не показан (о нём только намерение, подготовка или следующее действие), — нет в рассказе. Ответь одним JSON-объектом: {"untold":[номера бросков без рассказа]}; если все рассказаны — {"untold":[]}.`
    : `You check the narration of a role-playing game's turn. The player saw these rolls (numbered). For each roll decide whether the story tells its outcome as an event — hit or miss, how much damage and where, whether the attempt worked. A roll whose outcome the story never shows (only the intent, the preparation or the next actor) is untold. Answer with one JSON object: {"untold":[the numbers of the untold rolls]}; when every roll is told, {"untold":[]}.`;
  return { system, user: `NARRATION:\n${input.narration.slice(0, 16000)}\n\nROLLS THE PLAYER SAW:\n${input.rolls.map((line, index) => `${index + 1}. ${line}`).join("\n")}` };
}

export function parseUntold(text: string, count: number): number[] {
  const start = text.indexOf("{"), end = text.lastIndexOf("}");
  if (start < 0 || end <= start) return [];
  try {
    const value = JSON.parse(text.slice(start, end + 1)) as { untold?: unknown };
    if (!Array.isArray(value.untold)) return [];
    return [...new Set(value.untold.map((n) => Number(n)).filter((n) => Number.isInteger(n) && n >= 1 && n <= count))].sort((a, b) => a - b);
  } catch { return []; }
}

/** The continuation that asks for the untold rolls (the writer adds no new ledger; the single DM closes again). */
export function untoldRollsMessage(language: "ru" | "en", rolls: string[], role: "dm" | "writer"): string {
  const list = rolls.map((line, index) => `${index + 1}) ${line}`).join("\n");
  return language === "ru"
    ? `Эти броски игрок видел, а в рассказе их исхода нет:\n${list}\nРасскажи исход каждого сейчас, по порядку, продолжая рассказ и не повторяя уже написанного. ${role === "writer" ? "Новая ведомость не нужна." : "Потом снова вызови finish_turn."}`
    : `The player saw these rolls but the story does not tell their outcome:\n${list}\nTell each outcome now, in order, continuing the narration without repeating it. ${role === "writer" ? "No new ledger is needed." : "Then call finish_turn again."}`;
}

type Fetcher = typeof fetch;
/** One request to the cheap model, no retry; a failure is reported, never thrown. */
export async function checkRollsTold(apiKey: string, input: { narration: string; rolls: string[]; language: "ru" | "en" },
  options: { fetcher?: Fetcher; timeoutMs?: number } = {}): Promise<RollCheckResult> {
  if (!input.rolls.length || !input.narration.trim()) return { untold: [], costUsdMicros: 0, error: null };
  if (!apiKey) return { untold: [], costUsdMicros: 0, error: "not_configured" };
  const request = rollCheckRequest(input);
  try {
    const response = await (options.fetcher ?? fetch)("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model: QUOTABLE_MODEL, max_tokens: 300, output_config: { effort: "low" }, system: request.system, messages: [{ role: "user", content: request.user }] }),
      signal: AbortSignal.timeout(options.timeoutMs ?? 20_000),
    });
    const value = await response.json().catch(() => null) as { content?: { type: string; text?: string }[]; usage?: { input_tokens?: number; output_tokens?: number }; error?: { type?: string } } | null;
    if (!response.ok || !value) throw new Error(`HTTP ${response.status}${value?.error?.type ? `: ${value.error.type}` : ""}`);
    const text = (value.content ?? []).filter((block) => block.type === "text").map((block) => block.text ?? "").join("\n");
    return { untold: parseUntold(text, input.rolls.length),
      costUsdMicros: Math.round((value.usage?.input_tokens ?? 0) * QUOTABLE_PRICE_PER_MILLION.input + (value.usage?.output_tokens ?? 0) * QUOTABLE_PRICE_PER_MILLION.output), error: null };
  } catch (error) {
    return { untold: [], costUsdMicros: 0, error: String((error as Error)?.message ?? error).slice(0, 120) };
  }
}
