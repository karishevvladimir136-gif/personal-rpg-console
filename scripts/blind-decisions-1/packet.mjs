// Blind decisions 1: the human readers' packet — one markdown file, the same strips in the same shuffled order for every
// reader (one reader's shuffle, «human»), the four tasks as the model judges got them, and an answer sheet at the end.
import { LEGEND, TASKS } from "./frozen.mjs";
import { setFor } from "./judges.mjs";

const fence = (text) => ["```text", text, "```"].join("\n");

/** The packet's sets in its order, with the key (strip ids) for scoring the answers later. */
export function humanSets(strips) {
  const sets = [];
  sets.push({ section: "T1", title: "T1 — Families (Table C)", ...setFor("human", "T1", TASKS.T1.sets[0], strips) });
  for (const set of TASKS.T2.sets) sets.push({ section: "T2", title: `T2 — Pairs (Table ${set.id})`, ...setFor("human", "T2", set, strips) });
  TASKS.T3.sets.filter((s) => !s.supplementary).forEach((set, i) => sets.push({ section: "T3", title: `T3 — Odd one out, set ${i + 1}`, ...setFor("human", "T3", set, strips) }));
  TASKS.T3.sets.filter((s) => s.supplementary).forEach((set, i) => sets.push({ section: "T3b", title: `T3b — Odd one out, extra set ${i + 1}`, ...setFor("human", "T3", set, strips) }));
  sets.push({ section: "T4", title: "T4 — New situations", ...setFor("human", "T4", { id: "transfer" }, strips) });
  return sets;
}
const stripsOf = (user) => { const from = user.indexOf("The strips:\n\n") + "The strips:\n\n".length; const tail = user.lastIndexOf("\n\nAnswer with JSON"); const body = user.slice(from, tail); return body.slice(0, body.lastIndexOf("\n\n")); };

export function humanPacket(strips) {
  const sets = humanSets(strips);
  const out = ["# Blind decisions 1 — the readers' packet", "",
    "Thank you for reading. This file is everything you need; please do not open the other `blind-decisions-1-*` files before you answer (they hold the key).", "",
    "Each strip below is one play-through of a tabletop role-play session, reduced to what the player's hero did, turn by turn, in a fixed code. The players were AI models; nothing they wrote survives — no words, no names, no style. The question is whether the *decisions alone* tell players apart.", "",
    "Every reader gets the same strips in the same order. There are four tasks (T1–T4) and a short extra (T3b). Take as long as you like; a first impression is a fine answer. Write your answers in the answer sheet at the end and send the sheet back.", "",
    "## How to read a strip", "", fence(LEGEND), ""];
  const prompt = { T1: TASKS.T1.prompt, T2: TASKS.T2.prompt, T3: TASKS.T3.prompt, T3b: TASKS.T3.prompt, T4: TASKS.T4.prompt };
  let lastSection = null;
  for (const set of sets) {
    if (set.section !== lastSection) out.push(`## ${set.section}`, "", `**${prompt[set.section]}**`, "");
    lastSection = set.section;
    out.push(`### ${set.title}`, "", fence(stripsOf(set.user)), "");
  }
  out.push("## Answer sheet", "", "Your name (or initials): ______", "",
    "**T1 (Table C).** Number of groups: ___. Groups (strip numbers), with a reason for each:", "", "- Group 1: ______ — reason: ______", "- Group 2: ______ — reason: ______", "- Group 3: ______ — reason: ______", "- (more if you need)", "",
    "**T2.** Five pairs per table (strip numbers):", "", "- Table A: (__,__) (__,__) (__,__) (__,__) (__,__)", "- Table B: (__,__) (__,__) (__,__) (__,__) (__,__)", "",
    "**T3.** The odd one out (strip number) in each set:", "", ...[1, 2, 3, 4, 5, 6].map((i) => `- Set ${i}: ___`), "",
    "**T3b.** The odd one out in each extra set:", "", ...[1, 2, 3, 4].map((i) => `- Extra set ${i}: ___`), "",
    "**T4.** The family (1 or 2) of each test strip:", "", ...[1, 2, 3, 4, 5, 6, 7, 8].map((i) => `- Test strip ${i}: ___`), "",
    "Anything you noticed (optional): ______", "");
  return out.join("\n");
}
