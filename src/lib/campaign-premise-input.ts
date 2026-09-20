import type { CampaignPremiseInput } from "./production/premise-contracts.ts";

/** Public input shape only; no private compiler or command authority. */
export function isCampaignPremiseInput(
  value: unknown,
): value is CampaignPremiseInput {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  if (
    Object.getPrototypeOf(value) !== Object.prototype &&
    Object.getPrototypeOf(value) !== null
  )
    return false;
  const v = value as Record<string, unknown>;
  return (
    Object.keys(v).length === 2 &&
    Object.hasOwn(v, "text") &&
    Object.hasOwn(v, "language") &&
    typeof v.text === "string" &&
    v.text.trim().length > 0 &&
    v.text.length <= 20_000 &&
    !v.text.includes("\u0000") &&
    (v.language === "en" || v.language === "ru")
  );
}
