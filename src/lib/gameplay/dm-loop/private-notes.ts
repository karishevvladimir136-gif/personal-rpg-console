// Fix run after session 2, B2 (item 85): the DM's private notes keep their history. Session 2's private-facts layer
// reached 17k tokens against a 3 500-token budget and dropped facts silently, in storage order. Now:
// - a note set by the DM carries «true since» (the world minute it was written) and, once the DM closes it, «until»;
//   a note overwritten with a different text is not lost — the old text is kept closed under an archive key
//   (`<key>--until-<minute>`), so the recall tool can answer «what was true then» («Тарр на складе — до дня 4»);
// - the notes reach the DM in priority order: the hidden layer and the owner's secrets (never budget-dropped), then the
//   open clocks and consequences, then the open facts, newest first; closed notes last, newest first — so a budget cuts
//   the closed ones first, and the digest folds them;
// - the stored value stays a string (the commit's per-key patches, SQL's 6 000-character limit): an envelope
//   `{"v": text, "since": minute, "until": minute|null}`; a plain string is a note from before the fix run.
// Clocks stay integers (SQL advances them); a clock's description and validity live in the fact with the same key.
import type { RuntimeSource } from "../server-contracts.ts";

export const HIDDEN_LAYER_KEY = "hidden_layer";
export const ARCHIVE_INFIX = "--until-";

export function hiddenLayerOf(source: Pick<RuntimeSource, "privateState">): string {
  const facts = source.privateState.fact;
  const value = facts && typeof facts === "object" && !Array.isArray(facts) ? facts[HIDDEN_LAYER_KEY] : undefined;
  return typeof value === "string" ? value.trim() : "";
}

/** The owner's own «Тайны (видит только ведущий)» — the world's and the campaign's (migration 74). */
export function ownerSecretsText(source: Pick<RuntimeSource, "dmSecrets">): string {
  const world = source.dmSecrets?.world?.trim() ?? "", campaign = source.dmSecrets?.campaign?.trim() ?? "";
  return [world ? `The world's secrets:\n${world}` : "", campaign ? `This campaign's secrets:\n${campaign}` : ""].filter(Boolean).join("\n\n");
}

/** Fix S3-accept Ж1: the owner's «Пожелания к приключению» (migration 202610230551) — a wish about the adventure (genre,
 * tone, what should happen), never the truth itself. Only the hidden-layer prep reads it; never a turn, never the player. */
export function ownerWishesText(source: Pick<RuntimeSource, "dmSecrets">): string {
  return source.dmSecrets?.wishes?.trim() ?? "";
}

export type NoteKind = "fact" | "clock" | "consequence";
export type PrivateNote = { kind: NoteKind; key: string; text: string; since: number | null; until: number | null; archived: boolean };

export function parseNoteValue(raw: unknown): { text: string; since: number | null; until: number | null } {
  if (typeof raw === "number") return { text: String(raw), since: null, until: null };
  if (typeof raw !== "string") return { text: raw === undefined || raw === null ? "" : JSON.stringify(raw), since: null, until: null };
  if (raw.startsWith("{\"v\":")) {
    try {
      const value = JSON.parse(raw) as { v?: unknown; since?: unknown; until?: unknown };
      if (typeof value.v === "string") return { text: value.v, since: Number.isFinite(value.since) ? Number(value.since) : null,
        until: Number.isFinite(value.until) ? Number(value.until) : null };
    } catch { /* a plain note that happens to start like an envelope */ }
  }
  return { text: raw, since: null, until: null };
}

export function serializeNote(text: string, since: number | null, until: number | null = null): string {
  return JSON.stringify({ v: text, since, until });
}

export function archiveKey(key: string, until: number): string {
  const suffix = `${ARCHIVE_INFIX}${until}`;
  return `${key.slice(0, 120 - suffix.length)}${suffix}`;
}

/** Every private note (facts, clocks, consequences) with its validity — plans, the hidden layer and the server's own
 * keys excluded (`skip`). A clock's validity is its same-key fact's. */
export function privateNotes(privateState: Record<string, unknown>, skip: (kind: NoteKind, key: string) => boolean = () => false): PrivateNote[] {
  const notes: PrivateNote[] = [];
  const bucketOf = (kind: NoteKind) => {
    const bucket = privateState[kind];
    return bucket && typeof bucket === "object" && !Array.isArray(bucket) ? bucket as Record<string, unknown> : {};
  };
  const facts = bucketOf("fact");
  for (const kind of ["fact", "clock", "consequence"] as const) {
    for (const [key, raw] of Object.entries(bucketOf(kind))) {
      if (skip(kind, key)) continue;
      const parsed = parseNoteValue(raw);
      const validity = kind === "clock" && key in facts ? parseNoteValue(facts[key]) : parsed;
      if (!parsed.text.trim()) continue;
      notes.push({ kind, key, text: kind === "clock" ? `${parsed.text}${key in facts ? ` — ${parseNoteValue(facts[key]).text}` : ""}` : parsed.text,
        since: validity.since, until: validity.until, archived: key.includes(ARCHIVE_INFIX) });
    }
  }
  return notes;
}

/** The DM's reading order (B2 (1)): open clocks and consequences, open facts newest first, closed notes last
 * (newest closed first). A fact that only describes a clock travels with the clock. */
export function rankNotes(notes: PrivateNote[]): PrivateNote[] {
  const clockKeys = new Set(notes.filter((note) => note.kind === "clock").map((note) => note.key));
  const open = notes.filter((note) => note.until === null && !(note.kind === "fact" && clockKeys.has(note.key)));
  const closed = notes.filter((note) => note.until !== null && !(note.kind === "fact" && clockKeys.has(note.key)));
  const rank = (note: PrivateNote) => (note.kind === "clock" ? 0 : note.kind === "consequence" ? 1 : 2);
  const newest = (a: PrivateNote, b: PrivateNote) => (b.since ?? -1) - (a.since ?? -1);
  return [...open.sort((a, b) => rank(a) - rank(b) || newest(a, b)), ...closed.sort((a, b) => (b.until ?? 0) - (a.until ?? 0))];
}

/** Notes that match a query (every word of it, in the key or the text, any case), optionally valid at a world minute;
 * at most `limit`, open before closed. The recall tool's search (B2 (3), (5)). */
export function recallNotes(notes: PrivateNote[], query: string, at: number | null = null, limit = 12): PrivateNote[] {
  const words = query.toLowerCase().split(/[\s,.;:!?«»"'()]+/).filter((word) => word.length >= 2);
  const hits = notes.filter((note) => {
    const hay = `${note.key} ${note.text}`.toLowerCase();
    if (words.length && !words.every((word) => hay.includes(word))) return false;
    if (at === null) return true;
    return (note.since === null || note.since <= at) && (note.until === null || at < note.until);
  });
  return rankNotes(hits).slice(0, limit);
}
