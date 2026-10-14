/** Labels for public gameplay resources. Persistence keys are never changed. */
export function resourcePresentation(
  key: string,
  currencies: readonly { resourceKey: string; label: string }[] = [],
): { kind: "money" | "resource"; label: string } {
  const defined = currencies.find((currency) => currency.resourceKey === key);
  if (defined) return { kind: "money", label: readableLabel(defined.label) };
  const currency = /^currency_([a-z][a-z0-9]*(?:_[a-z0-9]+)*)$/i.exec(key);
  if (currency) return { kind: "money", label: safePublicResourceLabel(currency[1]) };
  const resource = /^resource_([a-z][a-z0-9]*(?:_[a-z0-9]+)*)$/i.exec(key);
  if (resource) return { kind: "resource", label: safePublicResourceLabel(resource[1]) };
  return {
    kind: "resource",
    label: safePublicResourceLabel(key),
  };
}

function safePublicResourceLabel(key: string): string {
  if (
    key.length > 80 ||
    !/^[\p{L}][\p{L}\p{N}]*(?:[_ -][\p{L}\p{N}]+)*$/u.test(key) ||
    /(?:^|[_ -])(?:dm|private|secret|internal|database|db|system|sys)(?:[_ -]|$)/i.test(key) ||
    /^[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}$/i.test(key)
  ) return "Resource";
  return readableLabel(key.replaceAll(/[_-]/g, " "));
}

export function readableLabel(label: string): string {
  const clean = label.trim().replace(/\s+/gu, " ");
  return clean ? clean.charAt(0).toLocaleUpperCase() + clean.slice(1) : "Resource";
}
