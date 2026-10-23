// Persona memory 1: the whole store as markdown — the owner can always read (and keep) everything the persona
// remembers, with the provenance of every line, the validity of every entry, the folds and the closed lines.
import { DOSSIER_SECTIONS, DOSSIER_SECTION_TITLES, editedByHand, type DossierLine, type Episode, type Fact, type Fold, type Line, type Quote } from "./schema.ts";

export type ExportedStore = { files: Record<string, string>; text: string; counts: { episodes: number; dossier: number; facts: number; folds: number } };

const when = (instant: string) => instant.replace("T", " ").replace(/:\d{2}\.\d{3}Z$/, "").replace(/ 00:00$/, "");
const tagged = (line: Line) => `[${line.tag} · ${line.author}] ${line.text.replace(/\n+/g, " ⏎ ")}`;
const quoted = (quote: Quote) => `> «${quote.text}» — ${quote.speaker} [${quote.tag} · ${quote.author}]`;

export function episodeMarkdown(episode: Episode, foldsById: Map<string, Fold> = new Map()): string {
  const validity = episode.validTo ? `valid ${when(episode.validFrom)} → ${when(episode.validTo)}` : `valid from ${when(episode.validFrom)} (open)`;
  const out = [`### ${when(episode.validFrom)} — ${episode.title || "(untitled)"} · \`${episode.id}\``, "",
    `salience ${episode.salience} · cues: ${episode.cues.join(", ")} · ${validity} · recorded ${when(episode.recordedAt)} · source ${episode.source}`];
  if (episode.foldedInto) out.push(`Folded into \`${episode.foldedInto}\`${foldsById.get(episode.foldedInto) ? `: ${foldsById.get(episode.foldedInto)!.summary.map((l) => l.text).join(" ")}` : ""} (the original is kept below).`);
  if (editedByHand(episode)) out.push("**Edited by hand after recording** (the original fields no longer match their recorded checksum).");
  out.push("", ...episode.lines.map((line) => `- ${tagged(line)}`), "", "State:", ...episode.state.map((line) => `- ${tagged(line)}`));
  if (episode.quotes.length) out.push("", "Exact lines:", ...episode.quotes.map(quoted));
  if (episode.notes.length) out.push("", "Notes (added later; the entry above is unchanged):",
    ...episode.notes.flatMap((note) => note.lines.map((line, index) => `- ${when(note.at)}: ${tagged(line)}${index === 0 && note.closes ? ` — closes the entry at ${when(note.closes)}` : ""}`)));
  return out.join("\n");
}

export function dossierMarkdown(lines: DossierLine[]): string {
  const entry = (line: DossierLine) => `- ${tagged(line)} — since ${when(line.validFrom)}${line.validTo ? `, until ${when(line.validTo)}` : ""}${line.supersedes ? `, replaces \`${line.supersedes}\`` : ""} · \`${line.id}\``;
  const out = ["# Self-dossier", ""];
  for (const section of DOSSIER_SECTIONS) {
    const open = lines.filter((line) => line.section === section && line.validTo === null);
    if (open.length) out.push(`## ${DOSSIER_SECTION_TITLES[section]}`, "", ...open.map(entry), "");
  }
  const closed = lines.filter((line) => line.validTo !== null);
  if (closed.length) out.push("## Closed lines (history)", "", ...closed.map(entry), "");
  if (!lines.length) out.push("(empty)");
  return out.join("\n").trimEnd();
}

export function exportMarkdown(input: { episodes: Episode[]; dossier: DossierLine[]; facts: Fact[]; folds: Fold[]; at: string; unreadable?: string[] }): ExportedStore {
  const episodes = [...input.episodes].sort((a, b) => a.validFrom.localeCompare(b.validFrom));
  const foldsById = new Map(input.folds.map((fold) => [fold.id, fold]));
  const months = new Map<string, Episode[]>();
  for (const episode of episodes) months.set(episode.validFrom.slice(0, 7), [...(months.get(episode.validFrom.slice(0, 7)) ?? []), episode]);
  const files: Record<string, string> = {};
  files["dossier.md"] = dossierMarkdown(input.dossier);
  for (const [month, list] of months) files[`journal/${month}.md`] = [`# Journal — ${month}`, "", ...list.map((episode) => `${episodeMarkdown(episode, foldsById)}\n`)].join("\n").trimEnd();
  const facts = [...input.facts].sort((a, b) => a.key.localeCompare(b.key) || a.validFrom.localeCompare(b.validFrom));
  files["facts.md"] = ["# Facts", "", ...(facts.length ? facts.map((fact) => `- **${fact.key}** ${tagged(fact)} — ${fact.validTo ? `was true ${when(fact.validFrom)} → ${when(fact.validTo)}` : `since ${when(fact.validFrom)}`} · source ${fact.source}`) : ["(none)"])].join("\n");
  files["folds.md"] = ["# Folds", "", "A fold condenses episodes into summary lines; the episodes themselves are kept, marked «folded into».", "",
    ...(input.folds.length ? input.folds.map((fold) => [`## \`${fold.id}\` — ${when(fold.range.from ?? fold.recordedAt)} → ${when(fold.range.to ?? fold.recordedAt)} (recorded ${when(fold.recordedAt)})`, "",
      ...fold.summary.map((line) => `- ${tagged(line)}`), "", `Episodes: ${fold.episodeIds.map((id) => `\`${id}\``).join(", ")}${fold.cues.length ? ` · cues: ${fold.cues.join(", ")}` : ""}`, ""].join("\n")) : ["(none)"])].join("\n").trimEnd();
  const counts = { episodes: episodes.length, dossier: input.dossier.length, facts: input.facts.length, folds: input.folds.length };
  files["README.md"] = ["# Persona memory — export", "", `Exported ${when(input.at)}. Episodes ${counts.episodes}, dossier lines ${counts.dossier}, facts ${counts.facts}, folds ${counts.folds}.`, "",
    "Every line carries its provenance: `[tag · author]` — tag `stated` (the owner's own words), `observed`, `inferred`; author `self` (the persona at the moment), `background` (a script or a background pass), `owner`.",
    "Entries are never rewritten: a later re-reading is a dated note; a closed entry or line keeps its text with the dates it was valid.",
    ...(input.unreadable?.length ? ["", `Files the store could not read (edited by hand into invalid JSON?): ${input.unreadable.join(", ")}`] : []),
    "", "Files: `dossier.md`, `journal/<month>.md`, `facts.md`, `folds.md`."].join("\n");
  const order = ["README.md", "dossier.md", ...[...months.keys()].map((month) => `journal/${month}.md`), "facts.md", "folds.md"];
  return { files, text: order.map((name) => files[name]).join("\n\n---\n\n"), counts };
}
