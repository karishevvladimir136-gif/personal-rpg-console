// The Russian voice layer's slots (polish group 7, POLISH.md «In scope from group 7»).
// The voice stage fills them from passages the owner chooses; until then they are
// empty and change nothing. Everything here is mechanics: where the voice part
// sits (layer 1, cached), where the short reminder sits (the last, uncached layer
// next to the player's input) and how the owner's «Образцы голоса» are quoted
// when the campaign's switch allows it. No prose is composed here (the owner
// rejected the planner's rewrites; see the voice item of POLISH.md).

/** The voice part of layer 1 for a Russian campaign — native Russian prose, written
 * by the voice stage. Empty: no behaviour change. */
export const VOICE_LAYER_RU = "";
/** The short reminder (≤ 120 tokens) in the last layer next to the player's input. Empty: off. */
export const VOICE_REMINDER_RU = "";
/** Up to this many characters of the owner's samples reach the voice layer when the switch is on. */
export const VOICE_SAMPLES_CAP = 12_000;

/** The owner's samples as examples for the voice layer: only when the campaign's
 * «use voice samples» switch is on and the samples exist. The passages are the
 * owner's or other people's texts — they live in the database only, never in the
 * repository, the logs or the fixtures (the caller never logs this block). */
export function voiceExamplesBlock(samples: string | null | undefined, on: boolean): string {
  const text = (samples ?? "").trim();
  if (!on || !text) return "";
  const clipped = text.length > VOICE_SAMPLES_CAP ? `${text.slice(0, VOICE_SAMPLES_CAP).trimEnd()}…` : text;
  const passages = clipped.split(/\n\s*\n/).map((row) => row.trim()).filter(Boolean).slice(0, 5);
  return `Образцы голоса (отрывки прозы, которую любит игрок; учись у их интонации и ритма, не копируй сюжет и имена):\n${passages.map((row) => `<example>\n${row}\n</example>`).join("\n")}`;
}

/** The voice part of layer 1: the native voice prose when the campaign is Russian,
 * then the owner's examples when allowed. Empty until the voice stage fills the slot. */
export function voiceLayer(language: "Russian" | "English", samples: string | null | undefined, examplesOn: boolean): string {
  const prose = language === "Russian" ? VOICE_LAYER_RU : "";
  return [prose, voiceExamplesBlock(samples, examplesOn)].filter(Boolean).join("\n\n");
}

/** The reminder for the last layer; empty until the voice stage fills it. */
export function voiceReminder(language: "Russian" | "English"): string {
  return language === "Russian" ? VOICE_REMINDER_RU : "";
}
