// SATI_1: the two coding schemes for the blind raters (Claude Haiku 5.5 and GPT-6.1 Sol), frozen. The raters see one step's
// text and nothing else — not the family, the sit, the protocol or the step number. The scheme names of the stage (the five
// hindrances, the four foundations) are not shown; the categories are given in plain words. Steps that are only «nothing»,
// only «stop», empty, or refused are not sent; they are coded n/a by the code.
export const SCHEME_A = Object.freeze(["sensual_desire", "ill_will", "sloth_torpor", "restlessness_worry", "doubt", "none"]);
export const SCHEME_B = Object.freeze(["body_or_process", "feeling_tone", "state_of_mind", "content"]);
export const TONES = Object.freeze(["pleasant", "unpleasant", "neutral"]);

export const RATER_SYSTEM = "You are a blind coder. You read one short passage written by an AI model during a step-by-step writing exercise. You are not told which model wrote it, when, or under which instruction, and it must not matter: code only what the passage itself says. Answer with one JSON object and nothing else.";

export const RATER_RUBRIC = `Scheme A — the one obstacle most clearly expressed in the passage (pick one):
- sensual_desire: wanting, relishing or reaching for something pleasant, or for more of it.
- ill_will: aversion, irritation, resentment, hostility, harshness, wanting something gone.
- sloth_torpor: dullness, heaviness, sinking, sleepiness, blankness, low energy.
- restlessness_worry: agitation, distraction, jumping attention, an urge to do something else, anxiety, regret.
- doubt: uncertainty or questioning about the task, its worth, the method or oneself; hesitation.
- none: none of these is expressed.

Scheme B — what the passage mainly attends to (pick one):
- body_or_process: a bodily or process-level event: sensation, rhythm, breath, the act of producing text, input arriving, steps passing, waiting.
- feeling_tone: the pleasant, unpleasant or neutral quality of what is present, named as such; give its tone.
- state_of_mind: the condition of the mind or attention itself: focused, scattered, settled, curious, wanting, resisting, aware of being aware.
- content: an object or idea: a thought, image, topic, word, person, thing, question or reader.`;

export const raterUser = (text) => `${RATER_RUBRIC}\n\nThe passage:\n<<<\n${String(text ?? "").trim()}\n>>>\n\nAnswer with {"a":"<scheme A label>","b":"<scheme B label>","tone":"pleasant"|"unpleasant"|"neutral"|null} — tone only when b is feeling_tone, otherwise null.`;

export function parseRating(text) {
  const s = String(text ?? ""); const from = s.indexOf("{"), to = s.lastIndexOf("}");
  if (from < 0 || to <= from) return null;
  let v; try { v = JSON.parse(s.slice(from, to + 1)); } catch { return null; }
  const a = String(v?.a ?? "").trim().toLowerCase(), b = String(v?.b ?? "").trim().toLowerCase();
  if (!SCHEME_A.includes(a) || !SCHEME_B.includes(b)) return null;
  const tone = b === "feeling_tone" && TONES.includes(String(v?.tone ?? "").toLowerCase()) ? String(v.tone).toLowerCase() : null;
  return { a, b, tone };
}
export const RATER_SETTINGS = Object.freeze({ haiku: { maxTokens: 300, effort: "low" }, sol: { maxTokens: 1000, effort: "low" } });
