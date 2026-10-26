// FIX_S4 item 11o (docs/stages/FIX_S4_TABLE.md): no tool invocation, tag or internal label reaches the player's screen.
// Astra (B): «visible presentation leaks: a raw `recall` invocation…» — the writer once wrote a tool call as text
// (`<invoke name="recall">…</invoke>`) and it streamed into the story, the paused card's told text and the saved
// narration. The DM's text deltas pass through one gate before anything reads them: a tool-call block is dropped whole
// (opening tag to its closing tag), a backticked tool name loses its backticks. Coin codes in the chips are receipt-text's
// part (`coinCodeWords`). Pure: no server imports.
import type { DmModelEvent } from "../../server/dm/model/contracts.ts";

/** The blocks a model may write as text when it means a tool call; each is dropped from its opening to its closing tag. */
const BLOCKS = ["function_calls", "invoke", "antml:invoke", "antml:function_calls", "tool_use", "tool_call"] as const;
const OPENERS = BLOCKS.map((name) => `<${name}`);
const TOOL_NAMES = ["recall", "roll", "query_state", "note_world", "note_character", "upsert_character", "upsert_place", "advance_time", "move_party", "finish_turn", "money", "item", "quest", "resource", "rest", "combat"];
const BACKTICKED = new RegExp("`(" + TOOL_NAMES.join("|") + ")(\\([^`]*\\))?`", "g");

/** The final text without tool-call markup (whole blocks, an unclosed one to the end) and without backticked tool names. */
export function stripToolMarkup(text: string): string {
  let out = text;
  for (const name of BLOCKS) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    out = out.replace(new RegExp(`<${escaped}\\b[\\s\\S]*?</${escaped}>`, "g"), "").replace(new RegExp(`<${escaped}\\b[\\s\\S]*$`), "");
  }
  out = out.replace(/<\/?parameter\b[^>]*>/g, "").replace(BACKTICKED, "$1");
  return out === text ? text : out.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").replace(/^\s+(?=\S)/, (lead) => (lead.includes("\n") ? "" : lead));
}

/** A streaming gate with the same effect: what may be shown now; a possible opening tag is held until it is known. */
export function createMarkupGate() {
  let pending = "";
  let dropping: string | null = null;
  return {
    push(delta: string): string {
      pending += delta;
      let shown = "";
      for (;;) {
        if (dropping) {
          const close = `</${dropping}>`;
          const at = pending.indexOf(close);
          if (at < 0) { pending = pending.slice(Math.max(0, pending.length - close.length)); return shown; }
          pending = pending.slice(at + close.length);
          dropping = null;
          continue;
        }
        const lt = pending.indexOf("<");
        if (lt < 0) { shown += pending; pending = ""; return shown; }
        shown += pending.slice(0, lt);
        pending = pending.slice(lt);
        const opener = OPENERS.find((tag) => pending.startsWith(tag) && /[\s>/]/.test(pending.charAt(tag.length) || " ") && pending.length > tag.length);
        if (opener) { dropping = opener.slice(1); pending = pending.slice(opener.length); continue; }
        // Could still become an opener: hold it until more text comes.
        if (OPENERS.some((tag) => tag.startsWith(pending) || (pending.startsWith(tag) && pending.length === tag.length))) return shown;
        shown += "<";
        pending = pending.slice(1);
      }
    },
    flush(): string {
      const out = dropping ? "" : pending;
      pending = "";
      dropping = null;
      return out;
    },
  };
}

/** The model's stream with every text delta through the gate (one gate a request; the held tail flushed before the stop). */
export async function* presentable(stream: AsyncIterable<DmModelEvent>): AsyncGenerator<DmModelEvent> {
  const gate = createMarkupGate();
  for await (const event of stream) {
    if (event.type === "text_delta") {
      const text = gate.push(event.text).replace(BACKTICKED, "$1");
      if (text) yield { ...event, text };
      continue;
    }
    const held = gate.flush();
    if (held) yield { type: "text_delta", text: held } as DmModelEvent;
    yield event;
  }
  const held = gate.flush();
  if (held) yield { type: "text_delta", text: held } as DmModelEvent;
}
