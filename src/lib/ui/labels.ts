// Display labels for keys that come from records and rulesets (stat keys,
// resource and money names, item categories). The English phrase is what the
// shared presentation helpers already produce; a localized label the record
// or ruleset provides wins, then the shared catalog (including "<phrase> {n}"
// patterns for numbered keys), then the raw phrase. No vocabulary lives here.
export type Translate = (key: string, values?: Record<string, string | number>) => string;

const NUMBERED = /^(.*\S)\s+(\d+)$/u;

export function displayLabel(phrase: string, t: Translate, provided?: string | null): string {
  if (provided && provided.trim()) return provided.trim();
  const direct = t(phrase);
  if (direct !== phrase) return direct;
  const match = NUMBERED.exec(phrase);
  if (match) {
    const pattern = `${match[1]} {n}`;
    const translated = t(pattern, { n: match[2] });
    if (translated !== pattern.replace("{n}", match[2])) return translated;
  }
  return phrase;
}
