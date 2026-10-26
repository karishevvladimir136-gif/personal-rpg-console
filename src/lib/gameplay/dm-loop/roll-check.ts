// Fix run B3 (item 60, report §14): every roll the player saw is told in the story. Session 2's turns came in pieces
// (text → roll → continuation) and the piece after a roll started from the next actor: the hero's Lightning Bolt and
// a Fire Bolt at a horse were rolled, shown on cards, and never told — twice, after a prompt line already asked for it.
// So the check is in code: when the narration is complete, a cheap model (Haiku 5.5, as the quotable-line and ledger
// checks) reads the narration and the rolls the player saw; a roll whose outcome the story does not tell gets one
// continuation asking the DM to tell it, in order, without repeating the text. Never fails the turn.
// Fix S3-pre 2 (the merge's checks 1 and 2): the attack cards of the fight count as rolls the player saw; the hero's
// own decisive roll is told only by the narration itself (a companion's line or the card is not the event); and the
// actions the player declared (an attack, a spell, a check) are each rolled or explained out of game — the 2D
// session's finding was three turns narrated around declared attacks with nothing rolled.
import type { DmLoopDiagnostic, DmLoopReceipt } from "./contracts.ts";
import type { RecordedCheck } from "../server-contracts.ts";
import { rerollHistory, standingSummary } from "./standing-roll.ts";
import { QUOTABLE_MODEL, QUOTABLE_PRICE_PER_MILLION } from "./quotable.ts";
import { anthropicEndpoint } from "../../server/anthropic-endpoint.ts";

export type RollCheckResult = { untold: number[]; undeclared?: string[]; costUsdMicros: number; error: string | null };
export type RollCheckInput = { narration: string; rolls: string[]; language: "ru" | "en";
  /** The player's line of this turn: the declared actions are read from it. */
  playerInput?: string;
  /** The numbers (1-based) of the rolls that are the hero's own. */
  heroRolls?: number[] };

const isAttackCard = (receipt: DmLoopReceipt) => receipt.call.name === "combat" && receipt.call.arguments.action === "attack";

/** The rolls the player saw this turn (a roll card, a hit on the party, an attack card of the fight): one line each;
 * `hero` marks the hero's own roll. Fix S4 11k: a rerolled check's line is the roll that stands (the checker read the
 * first roll's verdict against a story that told the reroll). */
export function visibleRolls(receipts: DmLoopReceipt[], heroId: string | null = null, checks: readonly RecordedCheck[] = [],
  diagnostics: readonly DmLoopDiagnostic[] = []): { position: number; line: string; hero: boolean }[] {
  return receipts.filter((receipt) => (receipt.call.name === "roll" || isAttackCard(receipt)) && receipt.result.ok && !!receipt.result.player)
    .map((receipt) => {
      const result = receipt.result.ok ? receipt.result : null;
      const hero = !!heroId && (result?.check?.actorId === heroId || receipt.call.arguments.actorRef === heroId);
      const standing = result?.check ? checks.find((row) => row.id === result.check!.id) ?? null : null;
      const summary = result && standing ? standingSummary(result.summary, standing, rerollHistory(standing.id, standing, diagnostics, result.check)) : result?.summary ?? "";
      return { position: receipt.position, line: summary.slice(0, 300), hero };
    });
}

/** Whether the player's line declares an action that a roll may decide (an attack, a spell, a check) — the gate of the
 * declared-action check on a turn without rolls (the check costs about $0.0005 and a second). */
export function declaresAction(text: string): boolean {
  return /(^|[^\p{L}])(бь[юёе]|бить|удар|руб[лиь]|кол[юи]|реж[уь]|стреля|выстрел|атаку|напада|кида|броса[юе]|мета[юе]|колду|заклина|твор[юи]|наклады|каст|пыта[юе]|попроб|пробу[юе]|проверя|обыск|взлам|вскрыва|крад[уё]|подкрад|прячусь|пряч[уе]|лез[уе]|карабка|прыга|перепрыг|убежда|уговари|обманыва|запугива|добива|толка[юе]|хвата[юе]|сбива|метну|стрелу|attack|strike|hit|slash|stab|shoot|fire at|cast|try|attempt|search|pick the|sneak|hide|climb|jump|persuade|deceive|intimidate|grapple|shove)/iu.test(text);
}

export function rollCheckRequest(input: RollCheckInput): { system: string; user: string } {
  const declared = !!input.playerInput?.trim();
  // Fix S3-pre 2.6 (the paid check on the merge's ford turn 4): asked only «told or not», the checker passed a hero's
  // critical shot that the story told through a companion's line; it now quotes the sentence that tells each roll,
  // and an empty quote is an untold roll.
  const system = input.language === "ru"
    ? `Ты проверяешь рассказ ведущего ролевой игры. Игрок видел броски (они пронумерованы; «[герой]» — собственный бросок героя). Для каждого броска найди в рассказе предложение, которое рассказывает его исход как событие — попал или промахнулся, сколько урона и куда, удалось или нет то, что пытались — и процитируй его. Если такого предложения нет (о броске только намерение, подготовка или следующее действие), цитата пустая. Для броска героя цитата должна показывать само действие героя и его исход («стрела Ярвен входит ему в плечо»); реплика спутника, реакция цели, последствие или намёк («он теперь без арбалета», «он шипит сквозь зубы») — не исход, цитата пустая.${declared ? ` Ещё прочти СТРОКУ ИГРОКА: какие действия героя (атака, заклинание, проверка) игрок заявил на этот ход? Действие, для которого нет броска в списке и про которое рассказ вне игры не говорит, почему оно не состоялось (условие не наступило, цель вне досягаемости, сначала нужно другое), — пропущено; действие, которое по рассказу случилось без броска, тоже пропущено.` : ""} Ответь одним JSON-объектом: {"rolls":[{"n":номер,"quote":"предложение из рассказа или пустая строка"}],"untold":[номера бросков с пустой цитатой]${declared ? `,"undeclared":["заявленное действие коротко, словами игрока"]` : ""}}.`
    : `You check the narration of a role-playing game's turn. The player saw these rolls (numbered; "[hero]" marks the hero's own roll). For each roll find the sentence of the story that tells its outcome as an event — hit or miss, how much damage and where, whether the attempt worked — and quote it. When there is no such sentence (only the intent, the preparation or the next actor), the quote is empty. For the hero's own roll the quote must show the hero's action itself and its result ("her arrow takes him in the shoulder"); a companion's line, the target's reaction, an aftermath or an implication ("he has no crossbow now", "he hisses through his teeth") is not the outcome: the quote is empty.${declared ? ` Also read the PLAYER'S LINE: which actions of the hero (an attack, a spell, a check) did the player declare for this turn? An action with no roll for it in the list, and no out-of-game sentence in the story saying why it did not happen (the condition did not come, the target is out of reach, something else comes first), is missed; so is an action the story shows happening without a roll.` : ""} Answer with one JSON object: {"rolls":[{"n":number,"quote":"the sentence from the story, or an empty string"}],"untold":[the numbers of the rolls with an empty quote]${declared ? `,"undeclared":["the declared action, briefly, in the player's words"]` : ""}}.`;
  const heroRolls = new Set(input.heroRolls ?? []);
  const rolls = input.rolls.length ? input.rolls.map((line, index) => `${index + 1}. ${heroRolls.has(index + 1) ? (input.language === "ru" ? "[герой] " : "[hero] ") : ""}${line}`).join("\n") : "(none)";
  return { system, user: `${declared ? `PLAYER'S LINE:\n${input.playerInput!.slice(0, 2000)}\n\n` : ""}NARRATION:\n${input.narration.slice(0, 16000)}\n\nROLLS THE PLAYER SAW:\n${rolls}` };
}

export function parseUntold(text: string, count: number): number[] {
  return parseRollCheck(text, count).untold;
}

/** The checker's answer: the untold rolls' numbers and the declared actions left without a roll or a reason. */
export function parseRollCheck(text: string, count: number): { untold: number[]; undeclared: string[] } {
  const start = text.indexOf("{"), end = text.lastIndexOf("}");
  if (start < 0 || end <= start) return { untold: [], undeclared: [] };
  try {
    const value = JSON.parse(text.slice(start, end + 1)) as { untold?: unknown; undeclared?: unknown; rolls?: unknown };
    // A roll whose quote is empty is untold too, whatever the list says (the quotes are the checker's evidence).
    const quoted = Array.isArray(value.rolls) ? value.rolls.flatMap((row) => {
      const r = row as { n?: unknown; quote?: unknown } | null;
      return r && Number.isInteger(Number(r.n)) && typeof r.quote === "string" && !r.quote.trim() ? [Number(r.n)] : [];
    }) : [];
    const listed = Array.isArray(value.untold) ? value.untold.map((n) => Number(n)) : [];
    const untold = [...new Set([...listed, ...quoted].filter((n) => Number.isInteger(n) && n >= 1 && n <= count))].sort((a, b) => a - b);
    const undeclared = Array.isArray(value.undeclared) ? [...new Set(value.undeclared.filter((row): row is string => typeof row === "string").map((row) => row.trim().slice(0, 160)).filter(Boolean))].slice(0, 4) : [];
    return { untold, undeclared };
  } catch { return { untold: [], undeclared: [] }; }
}

/** The continuation that asks for the untold rolls and the declared actions (the writer adds no new ledger; the single DM closes again). */
export function untoldRollsMessage(language: "ru" | "en", rolls: string[], role: "dm" | "writer", undeclared: string[] = []): string {
  const list = rolls.map((line, index) => `${index + 1}) ${line}`).join("\n");
  const actions = undeclared.map((line, index) => `${index + 1}) ${line}`).join("\n");
  const close = role === "writer" ? (language === "ru" ? "Новая ведомость не нужна." : "No new ledger is needed.") : (language === "ru" ? "Потом снова вызови finish_turn." : "Then call finish_turn again.");
  if (language === "ru") return [
    rolls.length ? `Эти броски игрок видел, а в рассказе их исхода нет:\n${list}\nРасскажи исход каждого сейчас, по порядку, продолжая рассказ и не повторяя уже написанного.` : "",
    undeclared.length ? `Игрок заявил эти действия героя, а ход их не бросил и не сказал, почему нет:\n${actions}\nБрось каждое сейчас (в бою — roll kind attack с целью) и расскажи исход — или одной строкой вне игры скажи, почему его не может быть. Если ход остановился ради ответа игрока (спутник вслух возразил, герою задан вопрос), это и есть причина: скажи это одной строкой вне игры и не доигрывай действие. Воля героя — у игрока.` : "",
    close].filter(Boolean).join("\n");
  return [
    rolls.length ? `The player saw these rolls but the story does not tell their outcome:\n${list}\nTell each outcome now, in order, continuing the narration without repeating it.` : "",
    undeclared.length ? `The player declared these actions of the hero, and the turn neither rolled them nor said why not:\n${actions}\nRoll each now (in a fight: roll kind attack with its target) and tell the outcome — or say in one out-of-game line why it cannot happen. If the turn stopped for the player's answer (a companion objected aloud, a question was put to the hero), that is the reason: say so in one out-of-game line and do not play the action. The hero's will is the player's.` : "",
    close].filter(Boolean).join("\n");
}

type Fetcher = typeof fetch;
/** One request to the cheap model, no retry; a failure is reported, never thrown. */
export async function checkRollsTold(apiKey: string, input: RollCheckInput,
  options: { fetcher?: Fetcher; timeoutMs?: number } = {}): Promise<RollCheckResult> {
  if ((!input.rolls.length && !input.playerInput?.trim()) || !input.narration.trim()) return { untold: [], undeclared: [], costUsdMicros: 0, error: null };
  if (!apiKey) return { untold: [], undeclared: [], costUsdMicros: 0, error: "not_configured" };
  const request = rollCheckRequest(input);
  try {
    const door = anthropicEndpoint();
    const response = await (options.fetcher ?? fetch)(door.messagesUrl, {
      method: "POST",
      headers: door.headers(apiKey),
      // Fix S3-pre 2.6: no thinking. At low effort the model still thought, and on the quoting prompt it spent the
      // whole allowance on it (899 of 900 tokens, no answer: the check passed every turn); without thinking the answer
      // came in ~1 s and flagged the hero's untold critical shot of the merge's ford turn 4, 5 of 5.
      body: JSON.stringify({ model: door.modelId(QUOTABLE_MODEL), max_tokens: 900, thinking: { type: "disabled" }, output_config: { effort: "low" }, system: request.system, messages: [{ role: "user", content: request.user }] }),
      signal: AbortSignal.timeout(options.timeoutMs ?? 20_000),
    });
    const value = await response.json().catch(() => null) as { content?: { type: string; text?: string }[]; usage?: { input_tokens?: number; output_tokens?: number }; error?: { type?: string } } | null;
    if (!response.ok || !value) throw new Error(`HTTP ${response.status}${value?.error?.type ? `: ${value.error.type}` : ""}`);
    const text = (value.content ?? []).filter((block) => block.type === "text").map((block) => block.text ?? "").join("\n");
    const parsed = parseRollCheck(text, input.rolls.length);
    // A declared action is asked only on a turn where the hero rolled nothing: when the hero's roll is there, an untold
    // one is the untold list's job — asking for the action too would roll the same attack twice.
    return { untold: parsed.untold, undeclared: input.playerInput?.trim() && !input.heroRolls?.length ? parsed.undeclared : [],
      costUsdMicros: Math.round((value.usage?.input_tokens ?? 0) * QUOTABLE_PRICE_PER_MILLION.input + (value.usage?.output_tokens ?? 0) * QUOTABLE_PRICE_PER_MILLION.output), error: null };
  } catch (error) {
    return { untold: [], undeclared: [], costUsdMicros: 0, error: String((error as Error)?.message ?? error).slice(0, 120) };
  }
}
