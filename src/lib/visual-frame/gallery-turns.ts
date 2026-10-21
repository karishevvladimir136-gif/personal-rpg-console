// Fixes before session 3 (2.3, audit row B-13): the turns the gallery groups its frames by — every committed game turn
// of the campaign (rpg_gallery_turns, migration 202610210403), with the first line of its input and narration for the
// captions and «К ходу». The shape chronicleChapters reads. Pure, client-safe.
export type GalleryTurn = { id: string; session_id: string | null; created_at: string; status: string; mode: string; input: string; narration: string | null };

const text = (value: unknown, max: number) => (typeof value === "string" ? value.slice(0, max) : "");
export function parseGalleryTurns(value: unknown): GalleryTurn[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((row) => {
    if (!row || typeof row !== "object") return [];
    const r = row as Record<string, unknown>;
    if (typeof r.id !== "string" || !r.id) return [];
    return [{ id: r.id, session_id: typeof r.session_id === "string" ? r.session_id : null, created_at: text(r.created_at, 40), status: text(r.status, 40) || "committed",
      mode: text(r.mode, 40) || "game", input: text(r.input, 300), narration: text(r.narration, 300) || null }];
  });
}

/** The gallery's turns: the own read when it came, else the /play window (a preview, or the read failed). */
export function galleryTurnsOr(own: GalleryTurn[] | null, play: readonly GalleryTurn[]): GalleryTurn[] {
  return own && own.length ? own : [...play];
}
