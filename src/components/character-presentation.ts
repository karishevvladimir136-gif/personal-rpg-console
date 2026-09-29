// Display aliases for unchanged stock template copy. Owner-authored text is
// returned verbatim; this never changes the persisted character description.
const starterDescriptions = new Set([
  "An ordinary Level 1 Fighter. Bounded house profile; not complete D&D 5e.",
  "Обычный воин 1-го уровня. Домашний ограниченный профиль, не полная D&D 5e.",
]);

export function characterDescription(
  text: string,
  translate: (key: string) => string,
) {
  return starterDescriptions.has(text)
    ? translate("An ordinary Level 1 Fighter. Uses the starter house ruleset.")
    : text;
}
