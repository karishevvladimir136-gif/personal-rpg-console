// Voice stage part 5: the quotable-line check, the pattern of polish 3's time words. After a
// committed turn a cheap model (Claude Haiku 5.5) reads the NPC lines of the narration and flags
// the lines that are slogans, symmetric epigrams or metaphors standing in for a motive — the
// owner's «Вы украли у нас небо. Я заберу у вас его кусок». A flag puts one line into the next
// turn's tail (the line, why); nothing otherwise. The check is asynchronous (it never delays the
// turn): the server starts it after the commit and stores the flags per turn
// (rpg_private.voice_flags, migration 70) for the tail and for the metrics. This module is the
// pure part: the lines, the request, the parse, the tail line. The model call lives in
// src/lib/server/voice/quotable-check.ts.

export const QUOTABLE_MODEL = "claude-haiku-5-5";
/** USD per 1M tokens (the shot model's table, docs/MODELS.md): input $0.10, output $0.50. */
export const QUOTABLE_PRICE_PER_MILLION = { input: 0.1, output: 0.5 };
export const QUOTABLE_MAX_FLAGS = 20;

export type QuotableFlag = { line: string; why: string };
export type QuotableUsage = { inputTokens: number; outputTokens: number };
export const quotableCostUsdMicros = (usage: QuotableUsage) =>
  Math.round(usage.inputTokens * QUOTABLE_PRICE_PER_MILLION.input + usage.outputTokens * QUOTABLE_PRICE_PER_MILLION.output);

/** The spoken lines of a narration: dash lines («— Чего тебе? — сказала она.») and quoted speech
 * («…»), the speech part only, trimmed; one-word fragments («Ну.») are left out. */
export function npcLines(narration: string): string[] {
  const lines: string[] = [];
  const seen = new Set<string>();
  const push = (text: string) => {
    const clean = text.replace(/\s+/g, " ").trim();
    if ((clean.match(/\p{L}+/gu) ?? []).length < 2 || seen.has(clean)) return;
    seen.add(clean);
    lines.push(clean);
  };
  for (const raw of narration.split(/\n+/)) {
    const row = raw.trim();
    const dash = /^[—–-]\s+(.+)$/u.exec(row);
    if (dash) {
      // «— Реплика, — сказал он. — Ещё реплика.»: the speech parts between the attribution dashes.
      const parts = dash[1].split(/\s[—–]\s/u);
      // Even parts are speech, odd parts are the attribution («сказал он»), when the line alternates.
      if (parts.length === 1) push(parts[0]);
      else parts.forEach((part, index) => { if (index % 2 === 0) push(part.replace(/[,;:]$/u, "")); });
      continue;
    }
    for (const match of row.matchAll(/«([^»]{6,})»/gu)) push(match[1]);
  }
  return lines;
}

/** The request to the cheap model: the lines, numbered; a JSON answer of flags. */
export function quotableRequest(lines: string[], language: "ru" | "en"): { system: string; user: string } {
  const system = language === "ru"
    ? `Ты редактор диалогов. Тебе дают реплики персонажей из одного хода ролевой игры. Найди реплики, которые звучат как цитата для читателя, а не как слова живого человека в лицо собеседнику в ту секунду: лозунги и девизы; симметричные афоризмы и эпиграммы («Вы украли у нас небо. Я заберу у вас его кусок»); метафоры и красивые образы вместо мотива (человек в гневе называет обиду своими словами — кто что сделал и кому за это ответить). Не отмечай грубость, короткие реплики, частицы, недоговорённости, чёрный юмор одной строкой — это живая речь. Отмечай только явные случаи; если таких нет, верни пустой список. Ответь одним JSON-объектом: {"flags":[{"n":номер,"why":"до двенадцати слов"}]}.`
    : `You are a dialogue editor. You get the characters' lines of one turn of a role-playing game. Find the lines that sound like a quote written for the reader rather than what a living person would say aloud, to someone's face, in that second: slogans and mottos; symmetric epigrams ("You stole our sky. I will take a piece of it back"); metaphors and pretty images standing in for a motive (an angry person names the grievance in their own words — who did what and who answers for it). Do not flag rudeness, short lines, fillers, unfinished phrases or one-line dark humour: that is living speech. Flag only clear cases; when there are none, return an empty list. Answer with one JSON object: {"flags":[{"n":number,"why":"up to twelve words"}]}.`;
  const user = lines.map((line, index) => `${index + 1}. ${line}`).join("\n");
  return { system, user };
}

/** The model's answer as flags (bounded, lines resolved by number; unparsable → none). */
export function parseQuotableFlags(text: string, lines: string[]): QuotableFlag[] {
  const start = text.indexOf("{"), end = text.lastIndexOf("}");
  if (start < 0 || end <= start) return [];
  let value: { flags?: unknown };
  try { value = JSON.parse(text.slice(start, end + 1)) as { flags?: unknown }; } catch { return []; }
  if (!Array.isArray(value.flags)) return [];
  const flags: QuotableFlag[] = [];
  const seen = new Set<number>();
  for (const raw of value.flags) {
    if (!raw || typeof raw !== "object") continue;
    const n = Number((raw as { n?: unknown }).n);
    const why = String((raw as { why?: unknown }).why ?? "").replace(/\s+/g, " ").trim().slice(0, 400);
    if (!Number.isInteger(n) || n < 1 || n > lines.length || seen.has(n) || !why) continue;
    seen.add(n);
    flags.push({ line: lines[n - 1].slice(0, 600), why });
    if (flags.length >= QUOTABLE_MAX_FLAGS) break;
  }
  return flags;
}

export type QuotableResult = { flags: QuotableFlag[]; lines: number; usage: QuotableUsage | null; costUsdMicros: number; elapsedMs: number; error: string | null };
type Fetcher = typeof fetch;

/** One request to the cheap model, no retry: the flags of the narration's NPC lines. A failure
 * (no key, a timeout, an unparsable answer) is reported, never thrown; a narration without
 * spoken lines costs nothing. The key is passed in by server code only. */
export async function checkQuotableLines(apiKey: string, narration: string, language: "ru" | "en",
  options: { fetcher?: Fetcher; timeoutMs?: number } = {}): Promise<QuotableResult> {
  const started = Date.now();
  const lines = npcLines(narration);
  if (!lines.length) return { flags: [], lines: 0, usage: null, costUsdMicros: 0, elapsedMs: 0, error: null };
  if (!apiKey) return { flags: [], lines: lines.length, usage: null, costUsdMicros: 0, elapsedMs: 0, error: "not_configured" };
  const request = quotableRequest(lines, language);
  try {
    const response = await (options.fetcher ?? fetch)("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      // Low effort: a short JSON answer, no thinking (the shot model's lesson: at the default effort the answer never arrived).
      body: JSON.stringify({ model: QUOTABLE_MODEL, max_tokens: 700, output_config: { effort: "low" }, system: request.system, messages: [{ role: "user", content: request.user }] }),
      signal: AbortSignal.timeout(options.timeoutMs ?? 30_000),
    });
    const value = await response.json().catch(() => null) as { content?: { type: string; text?: string }[]; usage?: { input_tokens?: number; output_tokens?: number }; error?: { type?: string } } | null;
    if (!response.ok || !value) throw new Error(`HTTP ${response.status}${value?.error?.type ? `: ${value.error.type}` : ""}`);
    const text = (value.content ?? []).filter((block) => block.type === "text").map((block) => block.text ?? "").join("\n");
    const usage = { inputTokens: value.usage?.input_tokens ?? 0, outputTokens: value.usage?.output_tokens ?? 0 };
    return { flags: parseQuotableFlags(text, lines), lines: lines.length, usage, costUsdMicros: quotableCostUsdMicros(usage), elapsedMs: Date.now() - started, error: null };
  } catch (error) {
    return { flags: [], lines: lines.length, usage: null, costUsdMicros: 0, elapsedMs: Date.now() - started, error: String((error as Error)?.message ?? error).slice(0, 120) };
  }
}

/** The one line of the next turn's tail (empty when the last turn had no flag). `flags` are the
 * newest stored flags; they count only when they belong to the last committed turn. */
export function quotableLine(stored: { operationId: string; flags: QuotableFlag[] } | null | undefined, lastCommittedTurnId: string | null, language: "ru" | "en"): string {
  if (!stored || !stored.flags.length || !lastCommittedTurnId || stored.operationId !== lastCommittedTurnId) return "";
  const items = stored.flags.slice(0, 3).map((flag) => `«${flag.line}» — ${flag.why}`).join("; ");
  return language === "ru"
    ? `Проверка реплик прошлого хода: ${items}. Это звучит как цитата для читателя, а не слова живого человека в лицо в ту секунду; в этом ходе пусть люди говорят, чтобы чего-то добиться, своими словами. Больше ничего не так.`
    : `The quotable-line check of the last turn: ${items}. That sounds like a quote for the reader, not what a living person says to someone's face in that second; this turn let people speak to get something, in their own words. Nothing else is wrong.`;
}
