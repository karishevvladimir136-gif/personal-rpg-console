// Inert, shared field validation. Contains no Library records or server authority.
export class FoundationValidationError extends Error {
  readonly code:
    "validation" | "scope" | "conflict" | "unavailable" | "configuration";
  constructor(
    code:
      | "validation"
      | "scope"
      | "conflict"
      | "unavailable"
      | "configuration" = "validation",
  ) {
    super(`Foundation ${code}`);
    this.name = "FoundationValidationError";
    this.code = code;
  }
}
export function ensure(
  condition: unknown,
  code: FoundationValidationError["code"] = "validation",
): asserts condition {
  if (!condition) throw new FoundationValidationError(code);
}
export function object(
  value: unknown,
  keys: readonly string[],
): Record<string, unknown> {
  ensure(value !== null && typeof value === "object" && !Array.isArray(value));
  ensure(
    Object.getPrototypeOf(value) === Object.prototype ||
      Object.getPrototypeOf(value) === null,
  );
  const result = value as Record<string, unknown>;
  ensure(
    Object.keys(result).length === keys.length &&
      keys.every((key) => Object.hasOwn(result, key)),
  );
  return result;
}
export function text(value: unknown, max = 4000): string {
  ensure(
    typeof value === "string" &&
      value.trim().length > 0 &&
      value.length <= max &&
      !value.includes("\u0000"),
  );
  return value;
}
export function uuid(value: unknown): string {
  const result = text(value, 36);
  ensure(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(
      result,
    ),
  );
  return result;
}
export function digest(value: unknown): string {
  const result = text(value, 64);
  ensure(/^[a-f0-9]{64}$/.test(result));
  return result;
}
export function integer(
  value: unknown,
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
): number {
  ensure(
    typeof value === "number" &&
      Number.isSafeInteger(value) &&
      value >= min &&
      value <= max,
  );
  return value;
}
export function literal<T extends string | number>(
  value: unknown,
  values: readonly T[],
): T {
  ensure(values.includes(value as T));
  return value as T;
}
export function list<T>(
  value: unknown,
  parse: (input: unknown) => T,
  max = 200,
): T[] {
  ensure(Array.isArray(value) && value.length <= max);
  return value.map(parse);
}
export function unique<T>(
  value: T[],
  key: (row: T) => unknown = (row) => row,
): T[] {
  ensure(new Set(value.map(key)).size === value.length);
  return value;
}
export function ids(value: unknown, max = 200): string[] {
  return unique(list(value, uuid, max));
}
export function nullable<T>(
  value: unknown,
  parse: (input: unknown) => T,
): T | null {
  return value === null ? null : parse(value);
}
export function sameSet(
  left: readonly string[],
  right: readonly string[],
): boolean {
  return (
    left.length === right.length && left.every((item) => right.includes(item))
  );
}
export function priority(sources: string[], value: unknown): string[] {
  const result = ids(value);
  ensure(sameSet(sources, result));
  return result;
}
