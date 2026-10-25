// Fix run B2 (2) (item 85): at a fight's end, the private notes written during it — positions, per-round states, who
// hit whom — fold into one line each that keeps what still matters (wounds, who fled, what was found, grudges). A cheap
// model (Haiku 5.5) proposes the folds, off the turn's path; the server applies them through the private-notes write.
// The session digest folds closed notes the same way. Pure part here: the request and the parse.
import type { PrivateNote } from "./private-notes.ts";
import { QUOTABLE_MODEL, QUOTABLE_PRICE_PER_MILLION } from "./quotable.ts";
import { anthropicEndpoint } from "../../server/anthropic-endpoint.ts";

export const FOLD_WINDOW_MINUTES = 240;
export type NoteFold = { keys: { kind: PrivateNote["kind"]; key: string }[]; line: string };

/** The notes a fight left: written within the window before its end, not already a fold, not a clock (clocks stay). */
export function fightNotes(notes: PrivateNote[], nowMinutes: number): PrivateNote[] {
  return notes.filter((note) => note.kind !== "clock" && note.since !== null && note.since >= nowMinutes - FOLD_WINDOW_MINUTES && !note.key.startsWith("fold_"));
}

export function foldRequest(notes: PrivateNote[], language: "ru" | "en"): { system: string; user: string } {
  const system = `A fight in a role-playing campaign has just ended. These are the DM's private notes written during it. Fold the notes that only describe the fight itself (positions, per-round states, who hit whom, setup) into as few lines as possible — each line keeps what still matters after the fight: wounds, who fled and where, what was found or lost, debts and grudges. Leave every note about anything else out of the folds. Write the lines in ${language === "ru" ? "Russian" : "English"}. Answer with one JSON object: {"folds":[{"keys":["kind:key", "..."],"line":"..."}]}; each fold names two or more notes; {"folds":[]} when nothing is worth folding.`;
  return { system, user: notes.map((note) => `${note.kind}:${note.key}${note.until !== null ? " (closed)" : ""}: ${note.text.slice(0, 500)}`).join("\n") };
}

export function parseFolds(text: string, notes: PrivateNote[]): NoteFold[] {
  const start = text.indexOf("{"), end = text.lastIndexOf("}");
  if (start < 0 || end <= start) return [];
  let value: { folds?: unknown };
  try { value = JSON.parse(text.slice(start, end + 1)) as { folds?: unknown }; } catch { return []; }
  const known = new Map(notes.map((note) => [`${note.kind}:${note.key}`, note]));
  const used = new Set<string>();
  const folds: NoteFold[] = [];
  for (const raw of Array.isArray(value.folds) ? value.folds.slice(0, 10) : []) {
    const f = raw && typeof raw === "object" ? raw as Record<string, unknown> : {};
    const keys = (Array.isArray(f.keys) ? f.keys : []).map(String).filter((k) => known.has(k) && !used.has(k));
    const line = typeof f.line === "string" ? f.line.replace(/\s+/g, " ").trim().slice(0, 600) : "";
    if (keys.length < 2 || !line) continue;
    keys.forEach((k) => used.add(k));
    folds.push({ keys: keys.map((k) => ({ kind: known.get(k)!.kind, key: known.get(k)!.key })), line });
  }
  return folds;
}

type Fetcher = typeof fetch;
export async function proposeFolds(apiKey: string, notes: PrivateNote[], language: "ru" | "en", options: { fetcher?: Fetcher } = {}):
  Promise<{ folds: NoteFold[]; costUsdMicros: number; error: string | null }> {
  if (notes.length < 3) return { folds: [], costUsdMicros: 0, error: null };
  if (!apiKey) return { folds: [], costUsdMicros: 0, error: "not_configured" };
  const request = foldRequest(notes, language);
  try {
    const door = anthropicEndpoint();
    const response = await (options.fetcher ?? fetch)(door.messagesUrl, {
      method: "POST", headers: door.headers(apiKey),
      body: JSON.stringify({ model: door.modelId(QUOTABLE_MODEL), max_tokens: 900, output_config: { effort: "low" }, system: request.system, messages: [{ role: "user", content: request.user }] }),
      signal: AbortSignal.timeout(30_000),
    });
    const value = await response.json().catch(() => null) as { content?: { type: string; text?: string }[]; usage?: { input_tokens?: number; output_tokens?: number } } | null;
    if (!response.ok || !value) throw new Error(`HTTP ${response.status}`);
    const text = (value.content ?? []).filter((block) => block.type === "text").map((block) => block.text ?? "").join("\n");
    return { folds: parseFolds(text, notes), costUsdMicros: Math.round((value.usage?.input_tokens ?? 0) * QUOTABLE_PRICE_PER_MILLION.input + (value.usage?.output_tokens ?? 0) * QUOTABLE_PRICE_PER_MILLION.output), error: null };
  } catch (error) { return { folds: [], costUsdMicros: 0, error: String((error as Error)?.message ?? error).slice(0, 120) }; }
}

/** The private-notes writes of the folds: one fold note each (open when any folded note was open), the sources removed. */
export function foldWrites(folds: NoteFold[], notes: PrivateNote[], tag: string, nowMinutes: number, serialize: (text: string, since: number | null, until: number | null) => string) {
  const set: { kind: "fact"; key: string; value: string }[] = [];
  const remove: { kind: PrivateNote["kind"]; key: string }[] = [];
  folds.forEach((fold, index) => {
    const covered = notes.filter((note) => fold.keys.some((k) => k.kind === note.kind && k.key === note.key));
    const since = Math.min(...covered.map((note) => note.since ?? nowMinutes));
    const open = covered.some((note) => note.until === null);
    set.push({ kind: "fact", key: `fold_${tag}_${index}`.slice(0, 120), value: serialize(fold.line, Number.isFinite(since) ? since : null, open ? null : nowMinutes) });
    remove.push(...fold.keys);
  });
  return { set, remove };
}
