import type { EntityAlias, RetrievalRequest } from "./server-contracts.ts";
import { sameTimeline } from "./timeline.ts";

// Search normalization is a relevance hint, never a change to source text or truth.
export function normalizeMemoryText(value: string): string {
  return value.normalize("NFKC").toLocaleLowerCase("en-US").replace(/ё/g, "е");
}

const stopWords = new Set(
  "a an and are as at be by did do does for from had has have how i in is it me my of on or our that the their this to was we were what when where which who why with would you your и в во не на с со о об а но как что это мы я ты вы он она они у по из для ли был была были где когда кто мне нам".split(
    " ",
  ),
);

export function memoryTerms(value: string): string[] {
  return [
    ...new Set(
      (normalizeMemoryText(value).match(/[\p{L}\p{N}]+/gu) ?? []).filter(
        (word) => word.length > 1 && !stopWords.has(word),
      ),
    ),
  ];
}

// A deliberately small, inspectable bilingual vocabulary. This is bounded lexical
// expansion, not a semantic model or a claim that arbitrary paraphrases are covered.
const vocabulary = [
  [
    "promise",
    "promised",
    "pledge",
    "pledged",
    "vow",
    "owed",
    "obligation",
    "обещание",
    "обещал",
    "обещала",
    "обещали",
    "долг",
    "клятва",
  ],
  [
    "return",
    "returned",
    "repay",
    "repayment",
    "возвращение",
    "вернуть",
    "вернулся",
    "возврат",
    "отдать",
  ],
  ["rumor", "rumour", "hearsay", "слух", "слухи", "молва"],
  [
    "intend",
    "intends",
    "intention",
    "plan",
    "plans",
    "planned",
    "намерение",
    "намерен",
    "план",
    "планирует",
    "собирается",
  ],
  ["key", "keys", "ключ", "ключи"],
  ["bridge", "crossing", "мост", "переправа"],
  ["gate", "gateway", "entrance", "ворота", "вход"],
  ["map", "chart", "карта", "чертеж"],
  ["bell", "chime", "колокол", "звон"],
  ["mayor", "burgomaster", "мэр", "бургомистр"],
  [
    "witness",
    "witnessed",
    "told",
    "heard",
    "свидетель",
    "видел",
    "слышал",
    "рассказал",
  ],
  ["medicine", "remedy", "potion", "лекарство", "снадобье", "зелье"],
  ["knife", "blade", "нож", "клинок"],
  ["copper", "медный", "медная", "меди"],
  ["silver", "серебряный", "серебряная", "серебро"],
  ["tower", "башня"],
  ["harbor", "harbour", "port", "гавань", "порт"],
];

export function mentionedEntityIds(
  request: RetrievalRequest,
  aliases: EntityAlias[],
): string[] {
  const query = ` ${memoryTerms(request.query).join(" ")} `;
  return [
    ...new Set([
      ...request.entityIds,
      ...aliases
        .filter((alias) => {
          if (
            alias.campaignId !== request.campaignId ||
            !sameTimeline(request.timeline, alias.timeline)
          )
            return false;
          return [alias.alias, alias.currentName].some((name) => {
            const normalized = memoryTerms(name).join(" ");
            return normalized.length > 0 && query.includes(` ${normalized} `);
          });
        })
        .map((alias) => alias.entityId),
    ]),
  ];
}

export function expandRetrievalRequest(
  request: RetrievalRequest,
  aliases: EntityAlias[],
): RetrievalRequest {
  if (request.expanded) return request;
  const terms = new Set(memoryTerms(request.query));
  const entityIds = mentionedEntityIds(request, aliases);
  const candidates = aliases
    .filter(
      (alias) =>
        alias.campaignId === request.campaignId &&
        sameTimeline(request.timeline, alias.timeline) &&
        entityIds.includes(alias.entityId),
    )
    .flatMap((alias) => memoryTerms(`${alias.alias} ${alias.currentName}`));
  for (const group of vocabulary) {
    if (group.some((term) => terms.has(term))) candidates.push(...group);
  }
  const added = [...new Set(candidates)]
    .filter((term) => !terms.has(term))
    .slice(0, 24);
  return {
    ...request,
    entityIds,
    query: added.length
      ? `${request.query}\n${added.join(" ")}`
      : request.query,
    // Record the one expansion attempt even when no vocabulary applies.
    expanded: true,
  };
}
