import type { CreationReview } from "./bootstrap-contracts.ts";

/** Historical v1 reviews have no sheet. Modern Astra-first reviews need real mechanics. */
export function astraFirstCreationReviewReady(
  review: Pick<CreationReview, "sheet" | "mechanics">,
): boolean {
  return review.sheet === undefined ||
    (review.sheet.mode === "structured_rpg" && review.mechanics !== undefined);
}
