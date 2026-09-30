import type {
  BootstrapQuestion,
  CreationReview,
} from "./bootstrap-contracts";

// Older immutable proposals may contain a duplicate "how many" question. Only
// collapse it when it names exactly one reviewed numeric field and asks nothing
// else. Other consequential questions keep their normal approval gate.
function numericTarget(question: string, review: CreationReview) {
  if (!/^(?:how (?:many|much)\b|сколько(?:\s|$))/iu.test(question.trim()))
    return null;
  if (/[,;:/]|\b(?:and|or|denomination|currency|unit|type|kind|which|why|when|if|before|after|whether)\b|(?:^|\s)(?:и|или)(?:\s|$)|(?:номинал|валют|единиц|како[йе]|почему|когда|если|до встречи|после)/iu.test(question))
    return null;
  const words = (text: string) =>
    (text.toLocaleLowerCase().match(/[\p{L}\p{N}]+/gu) ?? []).filter(
      (word) => word.length >= 4,
    );
  const asked = new Set(words(question));
  const targets = [
    ...review.possessions.map((item, index) => ({
      kind: "possession" as const,
      index,
      label: item.name,
      value: item.quantity,
    })),
    ...review.resources.map((resource, index) => ({
      kind: "resource" as const,
      index,
      label: resource.label,
      value: resource.amount,
    })),
  ];
  const ranked = targets
    .map((target) => ({
      ...target,
      score: words(target.label).filter((word) => asked.has(word)).length,
    }))
    .filter((target) => target.score > 0)
    .sort((a, b) => b.score - a.score);
  return ranked.length === 1 || ranked[0]?.score > ranked[1]?.score
    ? ranked[0]
    : null;
}

export function creationQuestionIsNumeric(
  question: BootstrapQuestion,
  review: CreationReview,
) {
  return numericTarget(question.question, review) !== null;
}

export function creationReviewForCommit(
  review: CreationReview,
  questions: BootstrapQuestion[],
): CreationReview {
  return {
    ...review,
    answers: questions.map((question, index) => {
      const existing = review.answers[index];
      if (existing !== null && existing !== undefined) return existing;
      const target = numericTarget(question.question, review);
      return target?.value === null || target?.value === undefined
        ? null
        : `${target.value} ${target.label}`;
    }),
  };
}

export function creationMissingDetails(
  review: CreationReview,
  questions: BootstrapQuestion[],
) {
  const corrected = creationReviewForCommit(review, questions);
  return (
    review.possessions.filter(
      (item) =>
        !Number.isInteger(item.quantity) ||
        item.quantity! < 1 ||
        item.quantity! > 20,
    ).length +
    review.resources.filter(
      (resource) =>
        !Number.isInteger(resource.amount) ||
        resource.amount! < 0 ||
        resource.amount! > 1000000,
    ).length +
    questions.filter(
      (question, index) =>
        question.consequential &&
        !creationQuestionIsNumeric(question, review) &&
        corrected.answers[index] === null,
    ).length
  );
}
