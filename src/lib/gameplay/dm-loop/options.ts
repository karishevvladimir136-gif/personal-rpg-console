// Fix run after session 2 (migration 73): the DM's switches, stored as one object on the campaign's DM
// settings. Its own module (no server imports) so the settings screen reads the same names and defaults.
//   - continuation (A3): the request after a tool result thinks as the first one ("same") or one notch
//     lower ("lighter": xhigh → high, high → medium) — the default is set by the probes' result;
//   - instructions (B4): the DM's core instructions in native Russian ("ru") or English ("en");
//   - companionRolls (item 44): the DM rolls for the companions as compact lines ("dm") or the player gets
//     their cards ("player");
//   - secretsVisible (B1): the owner opted in to read the DM's hidden layer;
//   - historyWindow (A2, item 23): «Окно истории» — the tokens of recent scenes and exchanges the DM reads
//     verbatim (older story lives in the dossier and the recaps).
export type DmOptions = {
  continuation: "same" | "lighter";
  instructions: "ru" | "en";
  companionRolls: "dm" | "player";
  secretsVisible: boolean;
  historyWindow: number;
};
/** The sizes «Окно истории» offers (tokens of recent scenes; 45 000 is the window session 2 played with). */
export const HISTORY_WINDOWS = [45_000, 100_000, 150_000, 200_000] as const;
export const DM_OPTION_DEFAULTS: DmOptions = Object.freeze({ continuation: "same", instructions: "en", companionRolls: "dm", secretsVisible: false, historyWindow: 45_000 });
export const DM_OPTION_VALUES: { readonly [K in keyof DmOptions]: readonly DmOptions[K][] } = {
  continuation: ["same", "lighter"], instructions: ["ru", "en"], companionRolls: ["dm", "player"], secretsVisible: [true, false], historyWindow: HISTORY_WINDOWS,
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
