// Fix run after session 2 (migration 73): the DM's switches, stored as one object on the campaign's DM
// settings. Its own module (no server imports) so the settings screen reads the same names and defaults.
//   - continuation (A3): the request after a tool result thinks as the first one ("same") or one notch
//     lower ("lighter": xhigh → high, high → medium) — the default is set by the probes' result;
//   - instructions (B4): the DM's core instructions in native Russian ("ru") or English ("en") — Russian by
//     default since the stage B probes (records as exact, cleaner speech); an English campaign ignores it;
//   - companionRolls (item 44): the DM rolls for the companions as compact lines ("dm") or the player gets
//     their cards ("player");
//   - secretsVisible (B1): the owner opted in to read the DM's hidden layer;
//   - memory (A2, item 23): «Память ведущего» — how much the DM reads verbatim each turn: «компактно»
//     (session 2's budgets), «стандарт» (recent scenes 200k, private facts ×3, codex 50k — about 300k in
//     all) or «широко» (about 500k); older story lives in the dossier and the recaps. «стандарт» by default
//     since the stage B probes: «компактно» forgot a fact told 35 turns back and the memory search did not
//     bring it back; «стандарт» holds about 120 turns for about $0.13 a turn more (docs/runs/fix-s2-report.md).
export type DmOptions = {
  continuation: "same" | "lighter";
  instructions: "ru" | "en";
  companionRolls: "dm" | "player";
  secretsVisible: boolean;
  memory: DmMemoryPreset;
};
export type DmMemoryPreset = "compact" | "standard" | "wide";
/** The budgets (estimated tokens) of each «Память ведущего» preset: the recent scenes and exchanges read
 * verbatim, the private facts, the codex of people and the Character Models of the session's tail. `bucket`: how
 * many of the oldest rows leave the full window at once — every slide rewrites the cached history, so a wider
 * window slides in bigger steps (measured: «стандарт» rewrote 200k tokens every 8 turns at 16 rows). */
export const MEMORY_PRESETS: Readonly<Record<DmMemoryPreset, { history: number; secrets: number; codex: number; models: number; bucket: number }>> = Object.freeze({
  compact: { history: 45_000, secrets: 3_500, codex: 30_000, models: 16_000, bucket: 16 },
  standard: { history: 200_000, secrets: 10_500, codex: 50_000, models: 32_000, bucket: 40 },
  wide: { history: 380_000, secrets: 17_500, codex: 80_000, models: 48_000, bucket: 72 },
});
export const DM_OPTION_DEFAULTS: DmOptions = Object.freeze({ continuation: "same", instructions: "ru", companionRolls: "dm", secretsVisible: false, memory: "standard" });
export const DM_OPTION_VALUES: { readonly [K in keyof DmOptions]: readonly DmOptions[K][] } = {
  continuation: ["same", "lighter"], instructions: ["ru", "en"], companionRolls: ["dm", "player"], secretsVisible: [true, false], memory: ["compact", "standard", "wide"],
};

/** The stored options with the defaults filled in; an unknown key or value (a newer or older row) is ignored. */
export function parseDmOptions(value: unknown): DmOptions {
  const options: DmOptions = { ...DM_OPTION_DEFAULTS };
  if (!value || typeof value !== "object" || Array.isArray(value)) return options;
  for (const [key, allowed] of Object.entries(DM_OPTION_VALUES) as [keyof DmOptions, readonly unknown[]][]) {
    const given = (value as Record<string, unknown>)[key];
    if (allowed.includes(given)) (options as Record<string, unknown>)[key] = given;
  }
  return options;
}

/** A save's options: only known keys with allowed values; throws a RangeError naming the key otherwise. */
export function parseDmOptionsPatch(value: unknown): Partial<DmOptions> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new RangeError("options must be an object");
  const patch: Partial<DmOptions> = {};
  for (const [key, given] of Object.entries(value as Record<string, unknown>)) {
    const allowed = (DM_OPTION_VALUES as Record<string, readonly unknown[]>)[key];
    if (!allowed || !allowed.includes(given)) throw new RangeError(`options.${key} is not allowed`);
    (patch as Record<string, unknown>)[key] = given;
  }
  return patch;
}
