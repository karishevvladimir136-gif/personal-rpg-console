// Persona memory 1: what a backend does. The library validates and decides (ids, provenance, ranges, scoring); a
// backend stores and applies each write atomically, and refuses what would break an invariant: an episode's original
// fields never change, notes only append, a fold marks only unfolded episodes (all or none), a superseded dossier line
// or a replaced fact is closed — never rewritten or deleted.
import type { DossierLine, Episode, EpisodeNote, Fact, Fold } from "./schema.ts";

export interface PersonaStore {
  readonly kind: "files" | "postgres";
  insertEpisode(episode: Episode): Promise<void>;
  episodes(): Promise<Episode[]>;
  /** Appends the note; a note that `closes` sets the episode's `validTo` (once). Returns the episode after it. */
  appendNote(episodeId: string, note: EpisodeNote): Promise<Episode>;
  /** Stores the fold and marks its episodes `foldedInto` — all of them or, when any is missing or folded, none. */
  insertFold(fold: Fold): Promise<void>;
  folds(): Promise<Fold[]>;
  dossier(): Promise<DossierLine[]>;
  /** Appends the lines; a line that `supersedes` another closes it at the new line's `validFrom`. */
  appendDossier(lines: DossierLine[]): Promise<void>;
  facts(): Promise<Fact[]>;
  /** Stores the fact; an open fact with the same key is closed at the new one's `validFrom`. */
  setFact(fact: Fact): Promise<void>;
  embeddingsGet(model: string, keys: string[]): Promise<Map<string, number[]>>;
  embeddingsPut(model: string, entries: { key: string; vector: number[] }[]): Promise<void>;
}
