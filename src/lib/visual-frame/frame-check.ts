// Fix run after session 2, stage E (items 78, 79): the cheap vision check of a drawn frame. Claude Haiku 5.5 looks
// at the picture with what the records say about the people in it — how many, what each wears, holds or carries,
// who is down at 0 hit points — and lists the problems a player sees at once: an extra or a missing arm, hand or
// leg (James's three hands), a thing the person does not have (the sergeant's shield, the hero's lantern), open
// eyes on an unconscious person; and where each person looks (the report counts the same gaze across frames). A
// failed check queues one automatic redraw with the problems as corrections, or marks the frame for the owner.
// No retry; a failure of the check itself is reported, never thrown, and never blocks the picture.
import { QUOTABLE_MODEL, QUOTABLE_PRICE_PER_MILLION } from "../gameplay/dm-loop/quotable.ts";

export const FRAME_CHECK_MODEL = QUOTABLE_MODEL;
/** Anthropic takes images up to 5 MB; a bigger picture is not checked. */
export const FRAME_CHECK_MAX_BYTES = 3_700_000;
/** The answer's ceiling, thinking included. */
export const FRAME_CHECK_MAX_TOKENS = 3000;

export type FrameCheckPerson = { key: string; label: string; worn: string[]; packed: string[]; down: boolean };
export type FrameCheckInput = { image: { bytes: Uint8Array; contentType: string }; people: FrameCheckPerson[]; moment: string };
export type FrameCheckVerdict = { problems: string[]; gaze: { key: string; looksAt: string }[] };
export type FrameCheckResult = { verdict: FrameCheckVerdict | null; usage: { inputTokens: number; outputTokens: number } | null; costUsdMicros: number; elapsedMs: number; error: string | null };

export function frameCheckRequest(input: Omit<FrameCheckInput, "image">): string {
  const people = input.people.map((row, index) => `${index + 1}. ${row.label}: ${row.worn.length ? `wears or holds ${row.worn.join(", ")}` : "holds no weapon or tool of their own"}` +
    `${row.packed.length ? `; carries packed away ${row.packed.join(", ")}` : ""}${row.down ? "; DOWN at 0 hit points — unconscious, eyes must be closed" : ""}.`);
  return [
    "You check one illustration of a role-playing game for mistakes a player would notice at once. You get the picture, the moment it shows and what the game's records say about the people in it.",
    `The moment: ${input.moment.replace(/\s+/g, " ").trim().slice(0, 600) || "(not given)"}`,
    input.people.length ? `The people the picture should show (${input.people.length}):\n${people.join("\n")}` : "The picture should show no people.",
    "Report only clear mistakes, each in a few words naming the person by the label above:",
    "- a person with an extra or a missing arm, hand or leg (three hands, a hand coming out of nowhere);",
    "- a weapon, a shield, a lantern, a torch or another light held or worn that the records above do not give that person (a thing that only lies in the scene is fine; clothes, belts, bags and jewellery are part of how a person looks and are fine; a packed thing in hand is a mistake only when it is a shield or a light);",
    "- open eyes on a person who is down at 0 hit points;",
    "- more or fewer of the listed people than listed, when the difference is plain; other figures the moment itself names (a sentry, a figure in the distance, a crowd) are fine.",
    "Do not report style, composition, small details, clothing colours or anything you are unsure about.",
    "Also say where each listed person looks: at another person (by label), at a thing, at the viewer, or a direction (up-right, up-left, down, far away).",
    "Answer with one JSON object only: {\"problems\":[\"...\"],\"gaze\":[{\"person\":1,\"looksAt\":\"...\"}]}; with no mistakes, \"problems\":[].",
  ].join("\n");
}

export function parseFrameCheck(text: string, people: FrameCheckPerson[]): FrameCheckVerdict | null {
  const start = text.indexOf("{"), end = text.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  let value: { problems?: unknown; gaze?: unknown };
  try { value = JSON.parse(text.slice(start, end + 1)) as typeof value; } catch { return null; }
  if (!Array.isArray(value.problems)) return null;
  const problems = value.problems.map((row) => String(row ?? "").replace(/\s+/g, " ").trim().slice(0, 160)).filter(Boolean).slice(0, 6);
  const gaze = Array.isArray(value.gaze) ? value.gaze.flatMap((row) => {
    const r = (row ?? {}) as { person?: unknown; looksAt?: unknown };
    const person = people[Number(r.person) - 1];
    const looksAt = String(r.looksAt ?? "").replace(/\s+/g, " ").trim().slice(0, 80);
    return person && looksAt ? [{ key: person.key, looksAt }] : [];
  }).slice(0, 6) : [];
  return { problems, gaze };
}

/** The corrections a failed check adds to the redraw's prompt. */
export const correctionLine = (problems: string[]) =>
  `Correct these mistakes of an earlier drawing of this moment: ${problems.map((row) => row.replace(/[.\s]+$/, "")).join("; ")}. Every person has exactly two arms and two hands; nobody holds anything the text above does not give them.`;

type Fetcher = typeof fetch;
/** One request to the cheap model; the key comes from server code. */
export async function checkFrame(apiKey: string, input: FrameCheckInput, options: { fetcher?: Fetcher; timeoutMs?: number } = {}): Promise<FrameCheckResult> {
  const started = Date.now();
  if (!apiKey) return { verdict: null, usage: null, costUsdMicros: 0, elapsedMs: 0, error: "not_configured" };
  if (input.image.bytes.byteLength > FRAME_CHECK_MAX_BYTES) return { verdict: null, usage: null, costUsdMicros: 0, elapsedMs: 0, error: "too_large" };
  if (!["image/png", "image/jpeg", "image/webp"].includes(input.image.contentType)) return { verdict: null, usage: null, costUsdMicros: 0, elapsedMs: 0, error: "unsupported_type" };
  try {
    const response = await (options.fetcher ?? fetch)("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      // The model thinks before it answers even at low effort; 700 tokens were all thinking in the probe (3 of 5 unreadable).
      body: JSON.stringify({ model: FRAME_CHECK_MODEL, max_tokens: FRAME_CHECK_MAX_TOKENS, output_config: { effort: "low" }, messages: [{ role: "user", content: [
        { type: "image", source: { type: "base64", media_type: input.image.contentType, data: Buffer.from(input.image.bytes).toString("base64") } },
        { type: "text", text: frameCheckRequest(input) },
      ] }] }),
      signal: AbortSignal.timeout(options.timeoutMs ?? 40_000),
    });
    const value = await response.json().catch(() => null) as { content?: { type: string; text?: string }[]; usage?: { input_tokens?: number; output_tokens?: number }; error?: { type?: string } } | null;
    if (!response.ok || !value) throw new Error(`HTTP ${response.status}${value?.error?.type ? `: ${value.error.type}` : ""}`);
    const text = (value.content ?? []).filter((block) => block.type === "text").map((block) => block.text ?? "").join("\n");
    const usage = { inputTokens: value.usage?.input_tokens ?? 0, outputTokens: value.usage?.output_tokens ?? 0 };
    const verdict = parseFrameCheck(text, input.people);
    return { verdict, usage, costUsdMicros: Math.round(usage.inputTokens * QUOTABLE_PRICE_PER_MILLION.input + usage.outputTokens * QUOTABLE_PRICE_PER_MILLION.output),
      elapsedMs: Date.now() - started, error: verdict ? null : "unparsable" };
  } catch (error) {
    return { verdict: null, usage: null, costUsdMicros: 0, elapsedMs: Date.now() - started, error: String((error as Error)?.message ?? error).slice(0, 120) };
  }
}
