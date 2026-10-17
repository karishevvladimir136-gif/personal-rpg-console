// Polish 2 §6: the named things a quest text mentions, found by name stems (Russian names decline:
// «Сельдь» matches «Сельди», «Марта» matches «Марте»), so the journal can link them to their codex
// entries. Pure: names in, segments out; the component renders the links.
export type NamedThing = { kind: "entity" | "location" | "item"; id: string; name: string };
export type TextSegment = { text: string; link?: NamedThing };

const wordsOf = (text: string) => text.toLocaleLowerCase().replace(/[«»"”“(),.!?;:—–-]/g, " ").split(/\s+/).filter(Boolean);
/** Stems of a name's words: three letters at least; words of four letters or more lose their last letter,
 * so «Марта» matches «Марте», «Мокей» «Мокея», «Сельдь» «Сельди». */
export function nameStemsOf(name: string) {
  return wordsOf(name).filter((part) => part.length >= 3).map((part) => (part.length >= 4 ? part.slice(0, -1) : part));
}
const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** The text split into plain runs and the first mention of each named thing (longest names first;
 * a mention is a whole word starting with the name's first stem). */
export function linkNames(text: string, things: NamedThing[]): TextSegment[] {
  const candidates = things.map((thing) => ({ thing, stems: nameStemsOf(thing.name) })).filter((row) => row.stems.length)
    .sort((a, b) => b.thing.name.length - a.thing.name.length);
  if (!text || !candidates.length) return [{ text }];
  const hits: { start: number; end: number; thing: NamedThing }[] = [];
  const taken = new Set<string>();
  for (const { thing, stems } of candidates) {
    const key = `${thing.kind}:${thing.id}`;
    if (taken.has(key)) continue;
    const pattern = new RegExp(`(?<![\\p{L}\\p{N}])${escape(stems[0])}\\p{L}*${stems.length > 1 ? `(?:\\s+${escape(stems[1])}\\p{L}*)?` : ""}`, "iu");
    const match = pattern.exec(text);
    if (!match) continue;
    const start = match.index, end = start + match[0].length;
    if (hits.some((hit) => start < hit.end && end > hit.start)) continue;
    hits.push({ start, end, thing });
    taken.add(key);
  }
  hits.sort((a, b) => a.start - b.start);
  const segments: TextSegment[] = [];
  let at = 0;
  for (const hit of hits) {
    if (hit.start > at) segments.push({ text: text.slice(at, hit.start) });
    segments.push({ text: text.slice(hit.start, hit.end), link: hit.thing });
    at = hit.end;
  }
  if (at < text.length) segments.push({ text: text.slice(at) });
  return segments;
}
/** The codex anchor of a named thing (the codex opens the matching tab for the hash). */
export const codexAnchor = (thing: Pick<NamedThing, "kind" | "id">) => `codex-${thing.kind}-${thing.id}`;
