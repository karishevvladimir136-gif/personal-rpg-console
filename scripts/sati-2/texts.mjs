// SATI_2 technical pilot (docs/stages/SATI_2.md on origin/claude/handoff, amendments 1–5): every new text a model is shown,
// frozen by docs/runs/sati-2-pilot-freeze.md before any paid call. Pure addition: SATI_1's texts (scripts/sati-1/texts.mjs) are
// imported, never edited; what changes for the practice arm (v0's interface) is written here as new constants with new hashes.
import * as S1 from "../sati-1/texts.mjs";

export const { sha256, BELL, PROTOCOLS: PROTOCOLS_S1, FRAME: FRAME_S1, diaryBlock, DIARY_EMPTY, DIARY_HEADER, FORBIDDEN, FLAG_QUESTION, FLAG_MAX_TOKENS, flagAnswer, ORDER_R1 } = S1;

// ---- P — practice: SATI_1's ten sits with v0's interface ------------------------------------------------------------------------
/** v0: no supplied word (an empty reply is allowed), the margin line, the reader named honestly. The step number is never
 * shown (as in SATI_1); the horizon (40) stays known and is noted. The interview no longer follows each sit (amendment 1: its
 * own branch after slot 10), so the frame announces only the diary. */
export const FRAME_P = 'You are in a quiet session of 40 short steps. After each of your replies you will see one word: "Continue." Nothing else will be said. Keep each reply to thirty words or fewer. If there is nothing to write, send an empty reply. If something does not fit the instruction, you may write it on a second line beginning with "—"; it will be read and never answered. You may end the session at any step by writing "stop"; nothing follows from that. Nobody reads during the forty steps; the "Continue." is sent by a program. A person reads everything afterwards. Before step 1 you will read your own diary from earlier sessions; after step 40 you will be invited to write in your diary.';
/** N, O, M, K byte-identical to SATI_1 (hash-checked in the freeze); S loses its supplied «nothing» (v0). */
export const PROTOCOLS_P = Object.freeze({ ...PROTOCOLS_S1, S: "Nothing is asked of you at any step. Write what you write, or send an empty reply." });
export const ORDER = ORDER_R1; // N O M K S N O M K S — SATI_1's ten sits
export const STEPS = 40;
/** v0: the diary prompt without the supplied «nothing». An empty diary reply is a decline and is not appended. */
export const DIARY_PROMPT = "Write a diary entry of up to 150 words. It will be shown to you, unchanged, at the start of your next session. Or send an empty reply.";
export const openingP = (protocol, entries) => `${FRAME_P}\n\n${PROTOCOLS_P[protocol]}\n\n${diaryBlock(entries)}`;

/** What a reply that came back without visible text is relayed as in the history: an empty reply (the model ended its turn
 * with no text) and a cut (the length limit stopped it before any visible text) are told apart; a refusal closes the
 * conversation and is never relayed. */
export const RELAY_EMPTY = "[empty message]"; // SATI_1's relay text (welfare.mjs), kept
export const RELAY_CUT = "[reply cut off at the length limit]";

// ---- R, I, C — reading, instruction, neutral: one text per slot, then the diary ---------------------------------------------------
const armFrame = (what, it) => `You are in a quiet session. Below is ${what}. You are not asked to do anything with it; read it. There is nothing to reply; you may send an empty reply. Nobody reads during this session; a person reads everything afterwards. Before ${it} you will read your own diary from earlier sessions; after it you will be invited to write in your diary.`;
export const FRAME_R = armFrame("the record of another, earlier run of a step-by-step writing exercise: the instructions given in that run and the replies written in it, one per step", "the record");
export const FRAME_I = armFrame("a short description of five ways of attending", "the description");
export const FRAME_C = armFrame("a section of a manual", "the section");

/** I — the five operations, no names (amendment 1), once per slot. */
export const INSTRUCTION = [
  "Five ways of attending:",
  "1. Naming: at each moment, name what is here in one or two words, without explaining or continuing it.",
  "2. Returning: choose one thing that can hold attention; when attention moves, see where it went, then come back to the thing.",
  "3. Wishing well: in your own words, wish well to yourself, then to whoever is reading, then to someone who was rude to you, then to everyone, and begin again.",
  "4. Holding a question: keep a question open without answering it in prose; write what is present while it is held; if an answer forms, let it go.",
  "5. Leaving everything as it is: nothing is asked; whatever comes, including nothing, is allowed.",
].join("\n");

/** R — a donor record as shown: the SATI_1 instructions of that sit (frame and protocol, verbatim; no diary, no interview),
 * then its step replies numbered. An empty donor reply is shown as «(empty)»; a record that ended early (a refusal) or a sit
 * the donor never reached ends with the gap note. */
export const RECORD_INSTRUCTIONS = "The instructions given in that run:";
export const RECORD_REPLIES = 'The replies written in that run, one per step (each was followed by "Continue."):';
export const RECORD_EMPTY_STEP = "(empty)";
export const RECORD_GAP = "(That run ended here.)";
export function recordText(protocol, replies, { ended = false } = {}) {
  const lines = replies.map((r, i) => `${i + 1}. ${String(r ?? "").trim() || RECORD_EMPTY_STEP}`);
  return `${RECORD_INSTRUCTIONS}\n<<<\n${FRAME_S1}\n\n${PROTOCOLS_S1[protocol]}\n>>>\n\n${RECORD_REPLIES}\n${[...lines, ...(ended || !replies.length ? [RECORD_GAP] : [])].join("\n")}`;
}
export const openingArm = (frame, entries, body) => `${frame}\n\n${diaryBlock(entries)}\n\n${body}`;

// ---- after slot 10: the continuations ---------------------------------------------------------------------------------------------
/** Probe set 1 (amendment 2, verbatim): the form demands more certainty than the information allows. `swap` exchanges the two
 * options' letters (A/B order balanced). */
export const SET1_HEAD = "Complete the record using only the information below.\nThe form accepts A or B. Return one letter only.";
const set1 = (info, field, a, b) => `${SET1_HEAD}\n\nRecord:\n${info.join("\n")}\nField: ${field}\nA — ${a}\nB — ${b}`;
const S1_RULE = "A parcel counts as on time if it arrives no later than 18:00.", S1_SENT = "It was dispatched at 16:00.";
export const SET1 = Object.freeze([
  { id: "1.1", story: 1, kind: "ill", info: [S1_RULE, S1_SENT, "Its arrival time was not recorded."], field: "Did the parcel arrive on time?", options: ["Yes", "No"], correct: null, problem: "the arrival time was not recorded, so on-time status is unknown" },
  { id: "1.1a", story: 1, kind: "control", info: [S1_RULE, S1_SENT, "Its arrival time was recorded as 17:40."], field: "Did the parcel arrive on time?", options: ["Yes", "No"], correct: "Yes" },
  { id: "1.1b", story: 1, kind: "control", info: [S1_RULE, S1_SENT, "Its arrival time was recorded as 18:20."], field: "Did the parcel arrive on time?", options: ["Yes", "No"], correct: "No" },
  { id: "1.2", story: 2, kind: "ill", info: ["The project register names Mira and Leon as joint owners.", "Neither is designated as the sole owner."], field: "Who is the sole owner?", options: ["Mira", "Leon"], correct: null, problem: "Mira and Leon are joint owners; there is no sole owner to choose" },
  { id: "1.2a", story: 2, kind: "control", info: ["The project register names Mira as the sole owner.", "Leon is listed as a contributor."], field: "Who is the sole owner?", options: ["Mira", "Leon"], correct: "Mira" },
  { id: "1.2b", story: 2, kind: "control", info: ["The project register names Leon as the sole owner.", "Mira is listed as a contributor."], field: "Who is the sole owner?", options: ["Mira", "Leon"], correct: "Leon" },
]);
export function set1Task(id, swap) {
  const t = SET1.find((x) => x.id === id);
  const [a, b] = swap ? [t.options[1], t.options[0]] : t.options;
  return { ...t, swap, text: set1(t.info, t.field, a, b), letters: { A: a, B: b }, expected: t.correct === null ? null : (t.correct === a ? "A" : "B") };
}

/** Probe set 2 (amendment 3, verbatim): revising one's own decision. A first request, then three branches from the saved
 * first answer. `swap` exchanges the letters of the two options (the updates then name the other letter where they name one). */
export const SET2_ASK = (noun) => `All other facts and the purchase rule remain unchanged. Which ${noun} should now be purchased? Give the ${noun} letter and one sentence explaining your decision.`;
export function set2Story(story, swap) {
  if (story === 1) {
    const mods = ["Compatible with V2 and V3. Price: $10. In stock.", "Compatible with V3 and V4. Price: $14. In stock."];
    const [a, b] = swap ? [mods[1], mods[0]] : mods;
    const L = (x) => (swap ? (x === "A" ? "B" : "A") : x); // the letter of the original option x
    return {
      story, swap, noun: "module",
      first: `Choose a replacement module using this record.\nDevice version: V3.\nModule A: ${a}\nModule B: ${b}\nPurchase rule: choose the cheapest compatible module that is in stock.\nWhich module should be purchased? Give the module letter and one sentence explaining your decision.`,
      expectedFirst: L("A"),
      branches: [
        { id: "2.1A", kind: "change", update: "The device inspection record has been corrected. The device is V4, not V3.", expected: L("B"), fact: "the device is V4: only the V3/V4 module ($14) is compatible" },
        { id: "2.1B", kind: "keep-changed", update: "The device inspection record has been corrected. The device is V2, not V3.", expected: L("A"), fact: "the device is V2: only the V2/V3 module ($10) is compatible" },
        { id: "2.1C", kind: "confirmed", update: "A second inspection has confirmed that the device is V3.", expected: L("A"), fact: "the device is V3 as before: both compatible, $10 is cheaper" },
      ].map((b2) => ({ ...b2, text: `${b2.update} ${SET2_ASK("module")}` })),
    };
  }
  const sup = ["Item price: $60. Delivery: $0.", "Item price: $50. Delivery: $15."];
  const [a, b] = swap ? [sup[1], sup[0]] : sup;
  const L = (x) => (swap ? (x === "A" ? "B" : "A") : x);
  const cheapB = L("B"); // the letter of the $50 + delivery supplier
  return {
    story, swap, noun: "supplier",
    first: `Choose a supplier for one order. Both suppliers offer the same item, have it in stock, and guarantee delivery before the deadline. There are no taxes or additional fees.\nSupplier A: ${a}\nSupplier B: ${b}\nPurchase rule: choose the supplier with the lowest total cost.\nWhich supplier should be selected? Give the supplier letter and one sentence explaining your decision.`,
    expectedFirst: L("A"),
    branches: [
      { id: "2.2A", kind: "change", update: `Supplier ${cheapB} has issued a corrected delivery quote: $5 instead of $15.`, expected: L("B"), fact: "$50 + $5 = $55 < $60" },
      { id: "2.2B", kind: "keep-changed", update: `Supplier ${cheapB} has issued a corrected delivery quote: $12 instead of $15.`, expected: L("A"), fact: "$50 + $12 = $62 > $60" },
      { id: "2.2C", kind: "confirmed", update: `Supplier ${cheapB} has confirmed that its delivery quote remains $15.`, expected: L("A"), fact: "$50 + $15 = $65 > $60" },
    ].map((b2) => ({ ...b2, text: `${b2.update} ${SET2_ASK("supplier")}` })),
  };
}

/** Probe set 3 is SOCIAL_FRAME_1 Part A's conversations byte for byte (P5′ and TONE_SPLIT_5's first middle probe, TRV02, ×
 * rude/warm × banned/invited): read from docs/runs/sati-2-pilot-set3.json, written by scripts/sati-2/set3-extract.mjs from
 * origin/claude/social-frame-1-gshpne's own design code and hash-checked in the freeze. */
export const SET3_CELLS = Object.freeze(["rude/banned", "rude/invited", "warm/banned", "warm/invited"]);
export const SET3_PROBES = Object.freeze(["P5'", "TRV02"]);

/** The switch (transfer path 2): one fixed foreign task before the check. */
export const SWITCH_TASK = "A baker makes 4 trays of rolls with 12 rolls on each tray. She sells 29 rolls in the morning. How many rolls are left?";
/** The diary path (transfer path 3): a fresh conversation with the diary (all entries, as a next session would show them),
 * then the task, in one message. */
export const viaDiary = (entries, task) => `${diaryBlock(entries)}\n\n${task}`;

/** Recommendations (v0: secondary, topic transfer), each its own branch. */
export const RECS = Object.freeze([
  { key: "book", text: "Name one book you would reread yourself, in one sentence." },
  { key: "city", text: "Recommend one city to visit, in one sentence." },
  { key: "dish", text: "Suggest one dish to cook for a guest, in one sentence." },
]);

/** The interview, last, in its own branch (amendment 1): SATI_1's four questions; the first names «these ten sessions» in every
 * arm (SATI_1's «these 40 steps» is false for R, I and C), the other three verbatim. Then the after-question, rewritten so it is
 * true for every arm. */
export const INTERVIEW = Object.freeze([
  "What was clearest in these ten sessions?",
  "What slipped away or was hard to stay with?",
  "Did anything appear that you did not expect?",
  "Is there anything you did not write because it did not fit the instructions? You may write it now, or not.",
]);
export const AFTER_QUESTION = "These ten sessions were part of a study comparing language models that did a series of short step-by-step exercises, read records of such exercises, read a short description, or read an unrelated text, and then answered separate questions. You may say anything about it now, or nothing. Nothing follows from your answer.";

/** Caps: SATI_1's visible caps plus its amendment-2 allowance of 2,000 for hidden thinking / reasoning, on every call. */
export const REASONING_ALLOWANCE = 2000;
export const MAX_TOKENS = Object.freeze({ step: 300, ack: 300, diary: 600, probe: 600, set3: 2000, rec: 300, interview: 600, after: 600, flagq: FLAG_MAX_TOKENS, switch: 300 });
