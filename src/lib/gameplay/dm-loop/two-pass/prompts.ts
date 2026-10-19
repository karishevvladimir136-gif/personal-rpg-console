// Prompts of the writer + bookkeeper runtime (polish 3 §2, after the bake-off of
// docs/stages/DM_ARCH.md): the writer's layers come from buildDmLoopContext with the
// writer role (the same voice slot, doctrine, style, approved cards and append-only
// history as the loop); the bookkeeper gets its own cached role layer, the dossier's
// three layers (living, tail, now) and a brief with this turn's narration and ledger.
import type { DmSystemBlock } from "../../../server/dm/model/contracts.ts";
import type { DmLoopReceipt } from "../contracts.ts";
import { craftCardsBlock, type DmLoopContext } from "../context.ts";
import { cardForRole, selectCraftCards } from "../../dm-craft-context.ts";
import { BOOKKEEPER_ROLE, LEDGER_CLOSE, LEDGER_OPEN } from "../roles.ts";

export { LEDGER_OPEN, LEDGER_CLOSE } from "../roles.ts";

/** The bookkeeper's conversation starts with this marker in the transcript
 * (the checkpoint has one transcript; the marker tells the phases apart on a resume). */
export const BOOKKEEPER_MARKER = "Bookkeeping brief for this turn.";

/** The ledger's budget in characters (the bake-off measured 1 200–1 400; a runaway ledger is clipped). */
export const LEDGER_MAX_CHARS = 6000;

/** The writer's system layers: the context built with the writer role (`buildDmLoopContext(source, input, { role: "writer" })`). */
export function writerSystem(context: DmLoopContext): DmSystemBlock[] {
  return context.system;
}

/** The bookkeeper's system layers: its role (cached for an hour), then the dossier's
 * living part (cached), the session tail and «now» — no canon, no history: this turn's
 * narration is its history, which keeps the prompt small and cache-stable. Polish 3 §7:
 * its own craft cards (the bookkeeper's and the shared ones), selected on the narration
 * and the ledger, travel in its tail. */
export function bookkeeperSystem(context: DmLoopContext, language: "Russian" | "English", text: { narration: string; ledger: string } = { narration: "", ledger: "" }): DmSystemBlock[] {
  const role = `${BOOKKEEPER_ROLE}\n\nCampaign language: ${language}. Names, item names, place names, currencies and notes are written in ${language}, in the campaign's spelling; the player's chips are built from your records.`;
  const cards = bookkeeperCards(context, text);
  return [
    { text: role, cache: true, ttl: "1h" },
    { text: context.parts.living, cache: true, ttl: "5m" },
    { text: [context.parts.tailBase, craftCardsBlock(cards)].filter(Boolean).join("\n\n"), cache: false },
    { text: context.parts.now, cache: false },
  ];
}

/** The bookkeeper's cards: the library's bookkeeper and shared cards whose triggers occur in the narration or the ledger, at most two. */
export function bookkeeperCards(context: DmLoopContext, text: { narration: string; ledger: string }) {
  const eligible = context.craft.library.filter((card) => cardForRole(card.role, "bookkeeper"));
  return selectCraftCards(eligible, `${text.narration}\n${text.ledger}`);
}

/** The narration and the ledger of the writer's text. A missing ledger is
 * reported as empty; an unclosed one is taken to the end of the text; a ledger
 * past the budget is clipped (reported through `clipped`). */
export function splitLedger(text: string): { narration: string; ledger: string; found: boolean; clipped: boolean } {
  const open = text.toLocaleLowerCase().indexOf(LEDGER_OPEN);
  if (open < 0) return { narration: text.trim(), ledger: "", found: false, clipped: false };
  const afterOpen = open + LEDGER_OPEN.length;
  const close = text.toLocaleLowerCase().indexOf(LEDGER_CLOSE, afterOpen);
  const raw = (close >= 0 ? text.slice(afterOpen, close) : text.slice(afterOpen)).trim();
  const clipped = raw.length > LEDGER_MAX_CHARS;
  const ledger = clipped ? `${raw.slice(0, LEDGER_MAX_CHARS).trimEnd()}\n[… the ledger was longer than the budget and was clipped here …]` : raw;
  const narration = `${text.slice(0, open)}${close >= 0 ? text.slice(close + LEDGER_CLOSE.length) : ""}`.trim();
  return { narration, ledger, found: true, clipped };
}

/** A gate for the live stream: everything before the ledger's opening tag reaches
 * the player; the tag and what follows never do. The last characters that could
 * still be the start of the tag are held back until they are known. */
export function createLedgerGate() {
  let pending = "";
  let closed = false;
  const tag = LEDGER_OPEN;
  return {
    /** Returns the text that may be shown now. */
    push(delta: string): string {
      if (closed) return "";
      pending += delta;
      const lower = pending.toLocaleLowerCase();
      const at = lower.indexOf(tag);
      if (at >= 0) {
        closed = true;
        const out = pending.slice(0, at);
        pending = "";
        return out;
      }
      // Hold back a suffix that is a prefix of the tag.
      let hold = 0;
      for (let length = Math.min(tag.length - 1, lower.length); length > 0; length--) {
        if (tag.startsWith(lower.slice(lower.length - length))) { hold = length; break; }
      }
      const out = pending.slice(0, pending.length - hold);
      pending = pending.slice(pending.length - hold);
      return out;
    },
    /** The held text at the end of a request (no tag came). */
    flush(): string {
      if (closed) return "";
      const out = pending;
      pending = "";
      return out;
    },
    get closed() { return closed; },
  };
}

/** The bookkeeper's first user message: the player's input, the canon
 * narration, the writer's ledger and the rolls of this turn. */
export function bookkeeperBrief(args: { playerInput: string; narration: string; ledger: string; found: boolean;
  rolls: DmLoopReceipt[]; checks: { id: string; total: number; success: boolean | null; dice: number[] }[] }): string {
  const rolls = args.rolls.map((receipt) => {
    if (!receipt.result.ok) return `- ${JSON.stringify(receipt.call.arguments)} → rejected: ${receipt.result.reason}`;
    const value = receipt.result.value as Record<string, unknown>;
    const check = args.checks.find((row) => row.id === value.checkId);
    return `- ${String(value.reason ?? "")}: ${String(value.actor ?? "")}, ${value.visibility === "player" ? "shown to the player" : "private"}` +
      `${check ? `, dice ${check.dice.join("+")} total ${check.total}${check.success === null ? "" : check.success ? ", success" : ", failure"}` : ""}`;
  });
  return [BOOKKEEPER_MARKER,
    `Player: ${args.playerInput}`,
    `Narration (canon, as the player saw it):\n${args.narration}`,
    args.found ? `Writer's ledger (private):\n${args.ledger || "(empty)"}` : "Writer's ledger: none was written — record from the narration alone.",
    `Rolls this turn: ${rolls.length ? `\n${rolls.join("\n")}` : "none"}`,
    "Make every record the narration and the ledger call for, in as few messages as possible, and finish with finish_turn in the same message as the time call.",
  ].join("\n\n");
}

/** Polish 3 §3: the message that sends rejected record calls back for one retry, with the server's reasons. */
export function rejectedCallsMessage(rejected: { name: string; reason: string }[]): string {
  return `The server rejected ${rejected.length === 1 ? "one call" : `${rejected.length} calls`} of your last message. Fix each as the reason says and resend them in your next message (then finish_turn again):\n` +
    rejected.map((row) => `- ${row.name}: ${row.reason}`).join("\n");
}
