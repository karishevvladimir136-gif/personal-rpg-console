/** Historical v1 reviews have no sheet. Modern Astra-first reviews need real mechanics (schema 2 and the
 * one-pass hero of schema 3 alike). */
export function astraFirstCreationReviewReady(
  review: { sheet?: { mode: string }; mechanics?: unknown },
): boolean {
  return review.sheet === undefined ||
    (review.sheet.mode === "structured_rpg" && review.mechanics !== undefined);
}
