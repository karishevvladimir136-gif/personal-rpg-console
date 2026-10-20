import { Fragment } from "react";
import { parseMarkdown, type Inline } from "@/lib/ui/markdown";

// Fix run after session 2 (item 25): a Library document read as a page — headings, lists, quotes — from plain data
// (src/lib/ui/markdown.ts), never from HTML in the document's text.
function Text({ inline }: { inline: Inline[] }) {
  return (
    <>
      {inline.map((part, index) =>
        part.kind === "strong" ? <strong key={index}>{part.text}</strong>
          : part.kind === "em" ? <em key={index}>{part.text}</em>
            : part.kind === "code" ? <code key={index}>{part.text}</code>
              : <Fragment key={index}>{part.text}</Fragment>,
      )}
    </>
  );
}

/** `title`: a document whose text opens with its own title as a heading does not show it twice. */
export function MarkdownView({ text, title }: { text: string; title?: string }) {
  const blocks = parseMarkdown(text);
  const first = blocks[0];
  const same = (value: string) => value.trim().toLocaleLowerCase();
  if (title && first?.kind === "heading" && same(first.inline.map((part) => part.text).join("")) === same(title)) blocks.shift();
  return (
    <div className="markdown-view">
      {blocks.map((block, index) => {
        switch (block.kind) {
          case "heading": {
            const Tag = (["h2", "h3", "h4", "h5"] as const)[block.level - 1];
            return <Tag key={index}><Text inline={block.inline} /></Tag>;
          }
          case "list": {
            const List = block.ordered ? "ol" : "ul";
            return <List key={index}>{block.items.map((item, at) => <li key={at}><Text inline={item} /></li>)}</List>;
          }
          case "quote":
            return <blockquote key={index}><Text inline={block.inline} /></blockquote>;
          case "rule":
            return <hr key={index} />;
          default:
            return <p key={index}><Text inline={block.inline} /></p>;
        }
      })}
    </div>
  );
}
