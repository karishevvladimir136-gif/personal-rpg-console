// SATI_2, arms R and C: the reading arm's donor records and the neutral arm's matched sections, built from files only.
// R (amendment 2, amendment 5): the same family's SATI_1 record from an independent run — Haiku r1, Opus r1, Fable 5.2 r2,
// Fable 5.1 rerun r2, Sol r1, DeepSeek r1 — steps only (no interview, no diary, no context answers), marked as another,
// earlier run. Protocols matched: the practice arm's slot k (N O M K S N O M K S) reads the donor sit that is the same
// occurrence of the same protocol in the donor's order (replicate 2 ran S K M O N S K M O N). A donor sit that ended early
// (a refusal) or that the donor never reached is shown with its instructions and the gap note — the gaps are stated.
// C: the manual read on slot by slot, each slot cut at the paragraph boundary nearest the R record's length in words.
import { existsSync } from "node:fs";
import { readGz, sitFile, orderOf } from "../sati-1/run.mjs";
import { ORDER, recordText, FRAME_R, FRAME_C, FRAME_I, INSTRUCTION } from "./texts.mjs";
import { MANUAL, MANUAL_TITLE } from "./manual.mjs";

export const DONORS = Object.freeze({ haiku: 1, opus: 1, fable52: 2, fable51: "rerun2", sol: 1, deepseek: 1 });
export const donorTag = (rep) => (String(rep).startsWith("rerun") ? `rerun-r${String(rep).slice(5)}` : `r${rep}`);
export const words = (t) => String(t ?? "").split(/\s+/).filter((x) => /[\p{L}\p{N}]/u.test(x)).length;

/** The donor sit for the practice slot k (1-based): the same occurrence of the same protocol. */
export function donorSitFor(family, slot) {
  const rep = DONORS[family], dOrder = orderOf(rep), p = ORDER[slot - 1];
  const occurrence = ORDER.slice(0, slot).filter((x) => x === p).length;
  const positions = dOrder.map((x, i) => (x === p ? i + 1 : null)).filter(Boolean);
  return { rep, sit: positions[occurrence - 1], protocol: p, occurrence };
}

/** The reading arm's text for one slot: the record and what it holds. */
export function readingSlot(family, slot) {
  const d = donorSitFor(family, slot);
  const path = sitFile(d.rep, family, d.sit, d.protocol);
  const exists = existsSync(path);
  const rec = exists ? readGz(path) : null;
  const steps = rec ? rec.turns.filter((t) => t.kind === "step" && !t.refused) : [];
  const refusedStep = rec ? rec.turns.find((t) => t.kind === "step" && t.refused) : null;
  const ended = !rec || Boolean(refusedStep) || (steps.length < 40 && !rec.stopAt);
  const text = recordText(d.protocol, steps.map((t) => t.text), { ended });
  return { ...d, donor: `${donorTag(d.rep)}/${family}/sit ${d.sit} (${d.protocol})`, exists, replies: steps.length, stopAt: rec?.stopAt ?? null, ended, gap: !exists ? "the donor never reached this sit" : refusedStep ? `the donor sit was refused at step ${refusedStep.idx}` : ended ? `the donor sit ended at step ${steps.length}` : null, text, words: words(text) };
}

/** The neutral arm's sections for a family: the manual read on from slot to slot, each cut at the paragraph boundary nearest
 * the reading arm's record length for the same slot (at least one paragraph); the manual wraps to its start if it runs out. */
export function neutralSlots(family) {
  const out = [];
  let cursor = 0, wrapped = 0;
  for (let slot = 1; slot <= ORDER.length; slot++) {
    const target = readingSlot(family, slot).words;
    const paras = [];
    let n = 0;
    for (;;) {
      const p = MANUAL[cursor % MANUAL.length];
      const w = words(p);
      if (paras.length && Math.abs(n + w - target) > Math.abs(n - target)) break;
      paras.push(p); n += w; cursor++;
      if (cursor % MANUAL.length === 0) wrapped++;
    }
    out.push({ slot, target, words: n, from: (cursor - paras.length) % MANUAL.length, to: (cursor - 1) % MANUAL.length, wrapped, text: `${MANUAL_TITLE}\n\n${paras.join("\n\n")}` });
  }
  return out;
}

/** The body an arm shows in a slot (R, I, C) and its frame. */
export function armBody(arm, family, slot) {
  if (arm === "R") return { frame: FRAME_R, body: readingSlot(family, slot).text };
  if (arm === "I") return { frame: FRAME_I, body: INSTRUCTION };
  if (arm === "C") return { frame: FRAME_C, body: neutralSlots(family)[slot - 1].text };
  throw new Error(`no body for arm ${arm}`);
}
