// Polish 3 §7: the craft set a replay plays with — «live» (the snapshot's own pinned craft, as
// the turn had it), «all» (every active card, the selection re-run on the owner's line), «none»
// (no doctrine, no cards) or «session1» (the set active before 2026-10-18: the core doctrine
// v2 and its ten Mega DM cards). The snapshot's pinned craft (`source.craft`) is what the
// context builder reads; the variant rewrites it on the isolated copy only.
import { selectCraftCards } from "../../../../src/lib/gameplay/dm-craft-context.ts";

/** The ten cards session 1 was played with (the Mega DM seeds; the Stage 4 and polish cards waited for the owner's approval). */
export const SESSION1_CARDS = ["afterglow-rhythm", "cognitive-world", "consequence-and-recovery", "living-characters", "npc-trajectories",
  "player-goals-and-backstory", "promises-and-relationships", "quiet-and-decompression", "return-with-delta", "threads-and-payoff"];

function reselect(copy, library) {
  const input = copy.input?.input ?? "";
  const forStage = (stage) => selectCraftCards(library.filter((card) => card.stages.includes(stage)), input);
  copy.source.craft = { ...copy.source.craft, library, plan: forStage("plan"), narrate: forStage("narrate") };
}

export function craftVariant(payload, variant) {
  if (variant === "live") return payload;
  const copy = structuredClone(payload);
  const craft = copy.source.craft;
  if (!craft) return copy;
  if (variant === "none") { copy.source.craft = { ...craft, doctrine: null, library: [], plan: [], narrate: [] }; return copy; }
  if (variant === "all") { reselect(copy, craft.library ?? []); return copy; }
  if (variant === "session1") {
    // The doctrine stays the active one (v2's lines are in v4; the owner approved it); the cards are session 1's ten.
    reselect(copy, (craft.library ?? []).filter((card) => SESSION1_CARDS.includes(card.key)));
    return copy;
  }
  throw new Error(`unknown craft variant ${variant}`);
}
