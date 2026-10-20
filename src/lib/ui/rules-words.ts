import type { CampaignSnapshot } from "../persistence/contracts.ts";

// Fix run after session 2 (item 26): the campaign's rules in words for the settings screen — the first line of the
// DM guide (rules are the DM's knowledge, not code), never the internal ruleset label («World Logic»).

/** A generic heading of the guide itself says nothing about the rules; the next line does. */
const GENERIC_TITLE = /^(?:руководство(?:\s+для)?\s+(?:dm|ведущего|мастера)|путеводитель\s+ведущего|dm\s+guide|game\s+master'?s?\s+guide|guide)[.:]?$/iu;
const MAX = 90;

/** The guide's first meaningful line, without Markdown marks, cut at a word to about ninety characters. */
export function guideFirstLine(body: string): string | null {
  for (const raw of body.split(/\r?\n/)) {
    const line = raw
      .replace(/^\s{0,3}(?:#{1,6}\s+|>\s*|[-*+]\s+|\d+[.)]\s+)/u, "")
      .replace(/\*\*|__|`/g, "")
      .replace(/^[*_]+|[*_]+$/g, "")
      .trim();
    if (!line || !/[\p{L}\p{N}]/u.test(line) || GENERIC_TITLE.test(line)) continue;
    if (line.length <= MAX) return line.replace(/[.:;]+$/u, "");
    const cut = line.slice(0, MAX);
    const space = cut.lastIndexOf(" ");
    return `${(space > MAX * 0.6 ? cut.slice(0, space) : cut).replace(/[\s.,:;—-]+$/u, "")}…`;
  }
  return null;
}

export function rulesInWords(data: Pick<CampaignSnapshot, "documents" | "dmGuideDocumentId">): { guideId: string | null; line: string | null } {
  const guide = data.documents.find((document) => document.id === data.dmGuideDocumentId) ?? null;
  return { guideId: guide?.id ?? null, line: guide ? guideFirstLine(guide.body ?? "") : null };
}
