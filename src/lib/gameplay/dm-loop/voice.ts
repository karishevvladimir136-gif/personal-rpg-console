// The Russian voice layer (the voice stage, docs/stages/VOICE.md «The build» part 1) and the
// mechanics around it (polish group 7, voice stage part 3). Where the voice part sits: layer 1,
// cached, right after the turn shape; the short reminder: the last, uncached layer next to the
// player's input. The owner's «Образцы голоса» are quoted here when the campaign's examples mode
// allows it — five diverse passages or the whole bank up to a token cap, both in the cached
// layer. The prose below is written natively in Russian from the stage's research: people speak
// to get something from the listener; speaking is not answering; the particles and word order
// of spoken Russian; game information in the narration, not in speeches; metaphors with the
// narrator; the quotable-line test; humour dark, dry, one line, never explained; the «Э?» pause.
import { estimateTokens } from "./tokens.ts";

/** The voice part of layer 1 for a Russian campaign — native Russian prose, about 400–600
 * tokens. Says what to do and why, in the spirit of Галь and Чуковский: verbs, plain words,
 * meaning over structure. */
export const VOICE_LAYER_RU = `Голос. Люди говорят, чтобы добиться чего-то от того, кто перед ними, а не чтобы их процитировали. Прежде чем человек откроет рот, реши, чего он хочет от героя сейчас; реплика работает на это. У каждого своё хотение: отказать, выторговать, выведать, отвязаться.

Говорить — не значит отвечать. Живой человек не отвечает на всё по порядку полными фразами: цепляется за одно, остальное мимо ушей, перебивает, спрашивает в ответ, молчит. Реплики короче, чем хочется; между ними — жест, пауза, дело в руках. Двое не пересказывают друг другу известное обоим и не называют чувств вслух — их видно по поступкам.

Русская речь живёт частицами и порядком слов: же, ведь, -то, ну, вот, уж, небось, разве; главное слово — в конец или в начало; обрыв вместо точки. Слово простое, глагол вместо отглагольного имени.

Цены, условия, риски — в рассказ, не в чужие рты: человек говорит, а не объясняет игру. Сравнения остаются у рассказчика, и редко. В гневе человек называет обиду своими словами — кто что сделал и кому ответить, — а не чеканит афоризм. Проверь каждую реплику: сказал бы это живой человек вслух, в лицо, в ту секунду? Словечко или жест персонажа — не чаще раза за сцену.

Юмор чёрный и сухой: одна строка, что переворачивает чужие слова буквально и мрачно — смерть, долг, утопленники, глупость годятся, — и никто её не объясняет; не игра звуков. Когда герой говорит дикость, человек напротив сначала не понимает: «Э?», пауза — и только потом отвечает.`;

/** The short reminder (≤ 120 tokens) in the last layer next to the player's input: the two or
 * three rules that drift first — the want, the assistant habit, game information in speeches,
 * the owner's test. */
export const VOICE_REMINDER_RU = `Перед репликой — чего человек хочет от героя сейчас; говорит он, чтобы это получить. Не отвечай на всё по порядку: одно зацепить, остальное мимо. Цены и условия — в рассказ, не в реплики. Сказал бы это живой человек вслух, в лицо, в ту секунду?`;

// --- «Образцы голоса»: the passage format and the examples mode (part 3) ---------------------

/** The campaign's examples mode: off · five (diverse by kind, stable per session) · all (many-shot up to the cap). */
export type VoiceMode = "off" | "five" | "all";
export const VOICE_MODES: readonly VoiceMode[] = ["off", "five", "all"];
export const isVoiceMode = (value: unknown): value is VoiceMode => typeof value === "string" && (VOICE_MODES as readonly string[]).includes(value);
/** The token cap of the «all» mode (the setting's default, floor and ceiling), estimated tokens. */
export const VOICE_TOKEN_CAP_DEFAULT = 30_000;
export const VOICE_TOKEN_CAP_MIN = 1_000;
export const VOICE_TOKEN_CAP_MAX = 150_000;
/** The samples' store holds this many characters (migration 70; the bank of 40 passages is about 80 000). */
export const VOICE_SAMPLES_MAX_CHARS = 200_000;
export const VOICE_FIVE = 5;

export type VoicePassage = { kind: string | null; text: string };

/** The passage format: passages separated by a line `---`; a passage may start with `## <kind>`
 * (торг, ссора, быт, драка, тишина, смешное…). A text without any `---` line is one passage, so a
 * multi-paragraph piece never splits into several. */
export function parseVoicePassages(samples: string | null | undefined): VoicePassage[] {
  const text = (samples ?? "").replace(/\r\n?/g, "\n").trim();
  if (!text) return [];
  return text.split(/^\s*---+\s*$/mu).map((block) => block.trim()).filter(Boolean).map((block) => {
    const head = /^##\s*(.+?)\s*\n/u.exec(block);
    return head ? { kind: head[1].trim() || null, text: block.slice(head[0].length).trim() } : { kind: null, text: block };
  }).filter((row) => row.text);
}

/** A small stable hash (FNV-1a) for the per-session offset. */
function hashOf(seed: string): number {
  let hash = 2166136261;
  for (let at = 0; at < seed.length; at++) { hash ^= seed.charCodeAt(at); hash = Math.imul(hash, 16777619) >>> 0; }
  return hash;
}

/** Five passages diverse by kind: round-robin over the kinds in their order of first appearance,
 * each kind's own order rotated by the seed (the session), so the pick is stable for a session —
 * the cached layer does not change turn to turn — and different sessions see different pieces. */
export function pickFivePassages(passages: VoicePassage[], seed: string, count = VOICE_FIVE): VoicePassage[] {
  if (passages.length <= count) return passages;
  const kinds: string[] = [];
  const byKind = new Map<string, VoicePassage[]>();
  for (const row of passages) {
    const kind = row.kind ?? "";
    if (!byKind.has(kind)) { kinds.push(kind); byKind.set(kind, []); }
    byKind.get(kind)!.push(row);
  }
  const offset = hashOf(seed);
  const rotated = new Map(kinds.map((kind, index) => {
    const rows = byKind.get(kind)!;
    const start = (offset + index) % rows.length;
    return [kind, [...rows.slice(start), ...rows.slice(0, start)]];
  }));
  const picked: VoicePassage[] = [];
  const kindStart = offset % kinds.length;
  for (let round = 0; picked.length < count; round++) {
    let any = false;
    for (let k = 0; k < kinds.length && picked.length < count; k++) {
      const rows = rotated.get(kinds[(kindStart + k) % kinds.length])!;
      if (round < rows.length) { picked.push(rows[round]); any = true; }
    }
    if (!any) break;
  }
  return picked;
}

export const VOICE_EXAMPLES_HEAD = "Образцы голоса (отрывки прозы, которую любит игрок; учись у их интонации и ритма, не копируй сюжет и имена):";

export type VoiceExamples = { text: string; mode: VoiceMode; passages: number; total: number; tokens: number; dropped: number };

/** The owner's samples as examples for the voice layer by the campaign's mode. The passages are
 * the owner's or other people's texts — they live in the database only, never in the repository,
 * the logs or the fixtures (the caller never logs this block). `all` keeps whole passages in
 * order until the token cap; what the cap drops is counted, never silently lost. */
export function voiceExamplesBlock(samples: string | null | undefined, mode: VoiceMode | boolean,
  options: { tokenCap?: number; seed?: string } = {}): VoiceExamples {
  const effective: VoiceMode = mode === true ? "five" : mode === false ? "off" : mode;
  const all = parseVoicePassages(samples);
  const empty: VoiceExamples = { text: "", mode: effective, passages: 0, total: all.length, tokens: 0, dropped: 0 };
  if (effective === "off" || !all.length) return empty;
  const cap = Math.min(VOICE_TOKEN_CAP_MAX, Math.max(VOICE_TOKEN_CAP_MIN, options.tokenCap ?? VOICE_TOKEN_CAP_DEFAULT));
  const chosen = effective === "five" ? pickFivePassages(all, options.seed ?? "") : all;
  const kept: VoicePassage[] = [];
  let tokens = estimateTokens(VOICE_EXAMPLES_HEAD);
  for (const row of chosen) {
    const cost = estimateTokens(row.text) + 8;
    if (tokens + cost > cap) { if (effective === "all") break; continue; }
    kept.push(row);
    tokens += cost;
  }
  if (!kept.length) return { ...empty, dropped: chosen.length };
  const text = `${VOICE_EXAMPLES_HEAD}\n${kept.map((row) => `<example>\n${row.text}\n</example>`).join("\n")}`;
  return { text, mode: effective, passages: kept.length, total: all.length, tokens, dropped: chosen.length - kept.length };
}

/** The voice part of layer 1: the native voice prose when the campaign is Russian, then the
 * owner's examples by the mode. `layerOff` (the replay tool's «off» variant only) leaves both out. */
export function voiceLayer(language: "Russian" | "English", samples: string | null | undefined, mode: VoiceMode | boolean,
  options: { tokenCap?: number; seed?: string; layerOff?: boolean } = {}): string {
  if (options.layerOff) return "";
  const prose = language === "Russian" ? VOICE_LAYER_RU : "";
  return [prose, voiceExamplesBlock(samples, mode, options).text].filter(Boolean).join("\n\n");
}

/** The reminder for the last layer (Russian campaigns only; off with the layer). */
export function voiceReminder(language: "Russian" | "English", options: { layerOff?: boolean } = {}): string {
  return language === "Russian" && !options.layerOff ? VOICE_REMINDER_RU : "";
}
