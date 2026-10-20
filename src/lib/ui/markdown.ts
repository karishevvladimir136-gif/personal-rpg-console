// Fix run after session 2 (item 25): a small, safe Markdown reader for the Library's documents — headings, lists,
// quotes, rules and paragraphs with **bold**, *italic* and `code`. It builds plain data (never HTML), so a document's
// text can never inject markup; anything it does not know reads as ordinary text.

export type Inline = { kind: "text" | "strong" | "em" | "code"; text: string };
export type Block =
  | { kind: "heading"; level: 1 | 2 | 3 | 4; inline: Inline[] }
  | { kind: "paragraph"; inline: Inline[] }
  | { kind: "list"; ordered: boolean; items: Inline[][] }
  | { kind: "quote"; inline: Inline[] }
  | { kind: "rule" };

const INLINE = /(\*\*[^*\n]+\*\*|__[^_\n]+__|`[^`\n]+`|\*[^*\s][^*\n]*\*|_[^_\s][^_\n]*_)/u;

export function parseInline(text: string): Inline[] {
  const out: Inline[] = [];
  for (const part of text.split(INLINE)) {
    if (!part) continue;
    if ((part.startsWith("**") && part.endsWith("**") && part.length > 4) || (part.startsWith("__") && part.endsWith("__") && part.length > 4))
      out.push({ kind: "strong", text: part.slice(2, -2) });
    else if (part.startsWith("`") && part.endsWith("`") && part.length > 2) out.push({ kind: "code", text: part.slice(1, -1) });
    else if ((part.startsWith("*") && part.endsWith("*") && part.length > 2) || (part.startsWith("_") && part.endsWith("_") && part.length > 2))
      out.push({ kind: "em", text: part.slice(1, -1) });
    else if (out.at(-1)?.kind === "text") out[out.length - 1] = { kind: "text", text: out.at(-1)!.text + part };
    else out.push({ kind: "text", text: part });
  }
  return out;
}

const HEADING = /^\s{0,3}(#{1,6})\s+(.*?)\s*#*\s*$/u;
const BULLET = /^\s{0,3}[-*+]\s+(.*)$/u;
const NUMBERED = /^\s{0,3}\d{1,3}[.)]\s+(.*)$/u;
const QUOTE = /^\s{0,3}>\s?(.*)$/u;
const RULE = /^\s{0,3}(?:-\s*){3,}$|^\s{0,3}(?:\*\s*){3,}$|^\s{0,3}(?:_\s*){3,}$/u;

export function parseMarkdown(source: string): Block[] {
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  let quote: string[] = [];
  const flush = () => {
    // Line breaks inside a paragraph are kept (plain-text documents use them for structure).
    if (paragraph.length) blocks.push({ kind: "paragraph", inline: parseInline(paragraph.join("\n")) });
    if (list) blocks.push({ kind: "list", ordered: list.ordered, items: list.items.map(parseInline) });
    if (quote.length) blocks.push({ kind: "quote", inline: parseInline(quote.join(" ")) });
    paragraph = [];
    list = null;
    quote = [];
  };
  for (const raw of source.replace(/\r\n?/g, "\n").split("\n")) {
    const line = raw.replace(/\s+$/u, "");
    if (!line.trim()) { flush(); continue; }
    if (RULE.test(line)) { flush(); blocks.push({ kind: "rule" }); continue; }
    const heading = HEADING.exec(line);
    if (heading) {
      flush();
      blocks.push({ kind: "heading", level: Math.min(4, heading[1].length) as 1 | 2 | 3 | 4, inline: parseInline(heading[2]) });
      continue;
    }
    const bullet = BULLET.exec(line);
    const numbered = bullet ? null : NUMBERED.exec(line);
    if (bullet || numbered) {
      const ordered = !!numbered;
      if (!list || list.ordered !== ordered) { flush(); list = { ordered, items: [] }; }
      list.items.push((bullet ?? numbered)![1]);
      continue;
    }
    const quoted = QUOTE.exec(line);
    if (quoted) {
      if (!quote.length) flush();
      quote.push(quoted[1]);
      continue;
    }
    // A wrapped list item continues the item; otherwise the line joins the paragraph.
    if (list && /^\s{2,}\S/u.test(raw)) { list.items[list.items.length - 1] += ` ${line.trim()}`; continue; }
    if (list || quote.length) flush();
    paragraph.push(line.trim());
  }
  flush();
  return blocks;
}
