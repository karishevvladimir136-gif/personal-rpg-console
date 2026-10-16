// Russian blind samples: is a turn fully Russian? Lists the Latin-script words
// in the narration and in the text the game master wrote into its tool calls
// (names, descriptions, notes, roll reasons). IDs, reference keys and enum values
// are not prose and are skipped. The receipts' summaries are the app's own
// templates, not the game master's words, so they are not checked here.

// Identifier-like arguments (a fact key, a dice formula, a sheet field) and enum values are not prose.
const SKIP_KEYS = new Set(["id", "ref", "localKey", "key", "formula", "modifierField"]);

/** Distinct Latin-script words of two letters or more, in order of appearance. */
export function latinWords(text) {
  return [...new Set(String(text ?? "").match(/\p{Script=Latin}{2,}/gu) ?? [])];
}

/** Every string the game master wrote into the calls' arguments, without IDs, references and enum values. */
export function recordTexts(receipts) {
  const texts = [];
  const walk = (value, key) => {
    if (typeof value === "string") {
      if (SKIP_KEYS.has(key) || /Refs?$|Id$/.test(key ?? "")) return;
      if (/^[a-z][a-z0-9_.:-]*$/.test(value)) return;
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) return;
      texts.push(value);
    } else if (Array.isArray(value)) value.forEach((entry) => walk(entry, key));
    else if (value && typeof value === "object") for (const [k, v] of Object.entries(value)) walk(v, k);
  };
  for (const receipt of receipts ?? []) walk(receipt.call?.arguments ?? {}, null);
  return texts;
}

/** The language verdict of one turn: Latin words in its narration and in its records (a turn without narration is not Russian). */
export function russianVerdict(narration, receipts) {
  const narrationLatin = latinWords(narration);
  const recordsLatin = latinWords(recordTexts(receipts).join("\n"));
  return { fullyRussian: Boolean(narration?.trim()) && !narrationLatin.length && !recordsLatin.length, narrationLatin, recordsLatin };
}
