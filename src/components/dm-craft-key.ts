// Owner-facing drafts use titles; storage keys stay internal and deterministic.
export function craftKeyFromTitle(
  title: string,
  existingKeys: readonly string[],
): string {
  const slug = title
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60)
    .replace(/-$/g, "");
  const base = `owner-${slug || "card"}`;
  const used = new Set(existingKeys);
  let key = base;
  for (let suffix = 2; used.has(key); suffix++) key = `${base}-${suffix}`;
  return key;
}
