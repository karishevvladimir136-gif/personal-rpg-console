// Pure collection helper, with no environment access or database credentials.
// Kept separate so the row-limit boundary can be exercised in ordinary Node tests.
export async function collectPages<T>(
  load: (start: number, end: number) => Promise<T[]>,
  size = 500,
): Promise<T[]> {
  if (!Number.isInteger(size) || size < 1 || size > 500)
    throw new Error("Invalid page size.");
  const collected: T[] = [];
  for (let start = 0; ; start += size) {
    const page = await load(start, start + size - 1);
    if (page.length > size) throw new Error("Invalid page response.");
    collected.push(...page);
    if (page.length < size) return collected;
  }
}
