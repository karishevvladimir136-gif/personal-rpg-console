import russian from "./locales/ru.json" with { type: "json" };

export type Language = "en" | "ru";
export const languageOptions: { value: Language; label: string }[] = [
  { value: "en", label: "English" },
  { value: "ru", label: "Русский" },
];

// English source phrases are stable dictionary keys, including mock content.
// Translate at the display boundary; never translate user input or state IDs.
export function translate(
  language: Language,
  key: string | number,
  values: Record<string, string | number> = {},
): string {
  const source = String(key);
  const message =
    language === "ru" && Object.hasOwn(russian, source)
      ? russian[source as keyof typeof russian]
      : source;
  return message.replace(/\{(\w+)\}/g, (token, name: string) =>
    Object.hasOwn(values, name) ? String(values[name]) : token,
  );
}
