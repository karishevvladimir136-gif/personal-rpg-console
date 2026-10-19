/** Tokens, estimated: Latin text runs about four characters per token, Cyrillic
 * and other non-ASCII text about 2.4 (both providers tokenize Russian in
 * syllable-sized pieces). Good to about ±15%, which is what a budget needs.
 * (Its own module since the voice stage: the voice slot measures its examples
 * with it and the context builder imports the slot.) */
export function estimateTokens(text: string): number {
  let ascii = 0, other = 0;
  for (let at = 0; at < text.length; at++) { if (text.charCodeAt(at) < 128) ascii++; else other++; }
  return Math.ceil(ascii / 4 + other / 2.4);
}
