"use client";
import type {
  BootstrapQuestion,
  CreationReview,
  OpeningReview,
} from "../../lib/adventures/bootstrap-contracts";
import styles from "../adventures/adventures.module.css";
export function bootstrapText(language: "en" | "ru") {
  return language === "ru"
    ? {
        name: "Имя",
        who: "Кто вы?",
        capabilities: "Умения",
        limitations: "Ограничения",
        possessions: "Вещи",
        resources: "Ресурсы",
        quantity: "Количество",
        amount: "Запас",
        add: "Добавить",
        remove: "Убрать",
        description: "Описание",
        questions: "Что нужно уточнить",
        required: "Нужен ответ",
        optional: "По желанию",
        review: "Проверьте предложение",
        editHelp:
          "Исправьте любые поля вручную. Это ваш персонаж; предложение ещё ничего не создаёт.",
        location: "Начальное место",
        situation: "Видимая ситуация",
        narration: "Начало истории",
        actors: "Кто здесь находится",
        confirm:
          "Я проверил начало: только открытые факты, без скрытого объяснения, исхода, награды или решений героя.",
        pending:
          "Ответ пока не подтверждён. Восстановите тот же запрос; повторного обращения к ИИ не будет.",
        recover: "Восстановить результат",
        newProposal: "Подготовить новое предложение",
        unavailable:
          "Не удалось подготовить или сохранить предложение. Проверьте настройку ИИ и актуальность начала.",
        cancel: "Отмена",
        prepare: "Подготовить предложение с ИИ",
        create: "Создать персонажа и кампанию",
        start: "Утвердить начало и играть",
        cost: "Только эта кнопка обращается к настроенному ИИ и может стоить денег. Проверка и правки вручную бесплатны.",
        ready: "Кампания готова",
        next: "Подготовить первое приключение",
        intro:
          "Опишите любого героя в своём мире. World Logic не требует класса, уровня, здоровья или человеческого тела.",
        title: "Название кампании",
        language: "Язык кампании",
        advanced: "Другие поддерживаемые правила",
        fighter: "Воин 1-го уровня · стартовые правила",
        opening: "Начало приключения",
        openingHelp:
          "Сначала проверьте открытое начало. Приключение начнётся только после вашего утверждения.",
        linesHelp: "По одному пункту в строке.",
      }
    : {
        name: "Name",
        who: "Who are you?",
        capabilities: "Capabilities",
        limitations: "Limitations",
        possessions: "Possessions",
        resources: "Resources",
        quantity: "Quantity",
        amount: "Balance",
        add: "Add",
        remove: "Remove",
        description: "Description",
        questions: "Clarifications",
        required: "Answer required",
        optional: "Optional",
        review: "Review the proposal",
        editHelp:
          "Correct any field by hand. This is your protagonist; the proposal has not created anything yet.",
        location: "Starting place",
        situation: "Visible situation",
        narration: "Opening narration",
        actors: "Who is here",
        confirm:
          "I reviewed this public opening: no hidden explanation, outcome, reward or decisions for the protagonist.",
        pending:
          "The response is not confirmed. Recover the same request; it will not call the AI again.",
        recover: "Recover result",
        newProposal: "Prepare a new proposal",
        unavailable:
          "The proposal could not be prepared or saved. Check AI configuration and whether the starting point changed.",
        cancel: "Cancel",
        prepare: "Prepare proposal with AI",
        create: "Create protagonist and campaign",
        start: "Approve opening and play",
        cost: "Only this button requests the configured AI and may cost money. Manual review and corrections are free.",
        ready: "Campaign ready",
        next: "Prepare the first Adventure",
        intro:
          "Describe any protagonist in your world. World Logic requires no class, level, HP or human body.",
        title: "Campaign title",
        language: "Campaign language",
        advanced: "Other supported rules",
        fighter: "Level 1 Fighter · starter rules",
        opening: "Adventure opening",
        openingHelp:
          "Review the public opening first. The Adventure starts only after your approval.",
        linesHelp: "One entry per line.",
      };
}
function Field({
  label,
  value,
  onChange,
  large = false,
  max = 2000,
}: {
  label: string;
  value: string | null;
  onChange: (v: string) => void;
  large?: boolean;
  max?: number;
}) {
  return (
    <label className={styles.field}>
      {label}
      {large ? (
        <textarea
          rows={4}
          maxLength={max}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          maxLength={max}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </label>
  );
}
function Lines({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
}) {
  return (
    <Field
      label={label}
      large
      value={value.join("\n")}
      max={5000}
      onChange={(v) => onChange(v.split("\n"))}
    />
  );
}
export function normalizeLines(values: string[]) {
  return values.map((v) => v.trim()).filter(Boolean);
}
export function Questions({
  questions,
  answers,
  onChange,
  language,
}: {
  questions: BootstrapQuestion[];
  answers: (string | null)[];
  onChange: (v: (string | null)[]) => void;
  language: "en" | "ru";
}) {
  const c = bootstrapText(language);
  return questions.length ? (
    <div className={styles.form}>
      <h3>{c.questions}</h3>
      {questions.map((q, i) => (
        <Field
          key={i}
          label={`${q.question} · ${q.consequential ? c.required : c.optional}`}
          value={answers[i]}
          large
          onChange={(v) =>
            onChange(
              answers.map((a, j) => (j === i ? (v.trim() ? v : null) : a)),
            )
          }
        />
      ))}
    </div>
  ) : null;
}
export function CharacterReview({
  value,
  onChange,
  language,
  questions,
}: {
  value: CreationReview;
  onChange: (v: CreationReview) => void;
  language: "en" | "ru";
  questions: BootstrapQuestion[];
}) {
  const c = bootstrapText(language);
  return (
    <div className={styles.form}>
      <h3>{c.review}</h3>
      <p className={styles.muted}>{c.editHelp}</p>
      <Field
        label={c.name}
        value={value.name}
        max={200}
        onChange={(name) => onChange({ ...value, name })}
      />
      <Field
        label={c.who}
        value={value.description}
        max={8000}
        large
        onChange={(description) => onChange({ ...value, description })}
      />
      <Lines
        label={`${c.capabilities} · ${c.linesHelp}`}
        value={value.capabilities}
        onChange={(capabilities) => onChange({ ...value, capabilities })}
      />
      <Lines
        label={c.limitations}
        value={value.limitations}
        onChange={(limitations) => onChange({ ...value, limitations })}
      />
      <h3>{c.possessions}</h3>
      {value.possessions.map((p, i) => (
        <div className={styles.setup} key={i}>
          <Field
            label={c.name}
            value={p.name}
            max={200}
            onChange={(name) =>
              onChange({
                ...value,
                possessions: value.possessions.map((a, j) =>
                  j === i ? { ...a, name } : a,
                ),
              })
            }
          />
          <Field
            label={c.description}
            value={p.description}
            large
            onChange={(description) =>
              onChange({
                ...value,
                possessions: value.possessions.map((a, j) =>
                  j === i ? { ...a, description } : a,
                ),
              })
            }
          />
          <label className={styles.field}>
            {c.quantity}
            <input
              type="number"
              min={1}
              max={20}
              value={p.quantity ?? ""}
              onChange={(e) =>
                onChange({
                  ...value,
                  possessions: value.possessions.map((a, j) =>
                    j === i
                      ? {
                          ...a,
                          quantity:
                            e.target.value === ""
                              ? null
                              : Number(e.target.value),
                        }
                      : a,
                  ),
                })
              }
            />
          </label>
          <div className={styles.actions}>
            <button
              type="button"
              onClick={() =>
                onChange({
                  ...value,
                  possessions: value.possessions.filter((_, j) => i !== j),
                })
              }
            >
              {c.remove}
            </button>
          </div>
        </div>
      ))}
      <div className={styles.actions}>
        <button
          type="button"
          disabled={value.possessions.length >= 12}
          onClick={() =>
            onChange({
              ...value,
              possessions: [
                ...value.possessions,
                { name: "", description: "", quantity: null },
              ],
            })
          }
        >
          {c.add} · {c.possessions}
        </button>
      </div>
      <h3>{c.resources}</h3>
      {value.resources.map((r, i) => (
        <div className={styles.setup} key={r.key}>
          <Field
            label={c.name}
            value={r.label}
            max={100}
            onChange={(label) =>
              onChange({
                ...value,
                resources: value.resources.map((a, j) =>
                  j === i ? { ...a, label } : a,
                ),
              })
            }
          />
          <label className={styles.field}>
            {c.amount}
            <input
              type="number"
              min={0}
              max={1000000}
              value={r.amount ?? ""}
              onChange={(e) =>
                onChange({
                  ...value,
                  resources: value.resources.map((a, j) =>
                    j === i
                      ? {
                          ...a,
                          amount:
                            e.target.value === ""
                              ? null
                              : Number(e.target.value),
                        }
                      : a,
                  ),
                })
              }
            />
          </label>
          <div className={styles.actions}>
            <button
              type="button"
              onClick={() =>
                onChange({
                  ...value,
                  resources: value.resources.filter((_, j) => i !== j),
                })
              }
            >
              {c.remove}
            </button>
          </div>
        </div>
      ))}
      <div className={styles.actions}>
        <button
          type="button"
          disabled={value.resources.length >= 8}
          onClick={() => {
            let i = 1;
            while (value.resources.some((r) => r.key === `resource_${i}`)) i++;
            onChange({
              ...value,
              resources: [
                ...value.resources,
                { key: `resource_${i}`, label: "", amount: null },
              ],
            });
          }}
        >
          {c.add} · {c.resources}
        </button>
      </div>
      <Questions
        questions={questions}
        answers={value.answers}
        onChange={(answers) => onChange({ ...value, answers })}
        language={language}
      />
    </div>
  );
}
export function OpeningReviewFields({
  value,
  onChange,
  language,
  questions,
}: {
  value: OpeningReview;
  onChange: (v: OpeningReview) => void;
  language: "en" | "ru";
  questions: BootstrapQuestion[];
}) {
  const c = bootstrapText(language);
  return (
    <div className={styles.form}>
      <Field
        label={c.location}
        value={value.location.name}
        max={200}
        onChange={(name) =>
          onChange({
            ...value,
            location: { ...value.location, name: name || null },
          })
        }
      />
      <Field
        label={c.description}
        value={value.location.description}
        max={4000}
        large
        onChange={(description) =>
          onChange({
            ...value,
            location: { ...value.location, description: description || null },
          })
        }
      />
      <Field
        label={c.situation}
        value={value.situation}
        max={4000}
        large
        onChange={(situation) =>
          onChange({ ...value, situation: situation || null })
        }
      />
      <Field
        label={c.narration}
        value={value.narration}
        max={8000}
        large
        onChange={(narration) =>
          onChange({ ...value, narration: narration || null })
        }
      />
      <h3>{c.actors}</h3>
      {value.actors.map((actor, i) => (
        <div className={`${styles.setup} ${styles.form}`} key={i}>
          <Field
            label={c.name}
            value={actor.name}
            max={200}
            onChange={(name) =>
              onChange({
                ...value,
                actors: value.actors.map((a, j) =>
                  j === i ? { ...a, name } : a,
                ),
              })
            }
          />
          <Field
            label={c.description}
            value={actor.description}
            large
            onChange={(description) =>
              onChange({
                ...value,
                actors: value.actors.map((a, j) =>
                  j === i ? { ...a, description } : a,
                ),
              })
            }
          />
          <Lines
            label={c.capabilities}
            value={actor.capabilities}
            onChange={(capabilities) =>
              onChange({
                ...value,
                actors: value.actors.map((a, j) =>
                  j === i ? { ...a, capabilities } : a,
                ),
              })
            }
          />
          <Lines
            label={c.limitations}
            value={actor.limitations}
            onChange={(limitations) =>
              onChange({
                ...value,
                actors: value.actors.map((a, j) =>
                  j === i ? { ...a, limitations } : a,
                ),
              })
            }
          />
          <div className={styles.actions}>
            <button
              type="button"
              onClick={() =>
                onChange({
                  ...value,
                  actors: value.actors.filter((_, j) => i !== j),
                })
              }
            >
              {c.remove}
            </button>
          </div>
        </div>
      ))}
      <div className={styles.actions}>
        <button
          type="button"
          disabled={value.actors.length >= 4}
          onClick={() =>
            onChange({
              ...value,
              actors: [
                ...value.actors,
                {
                  name: "",
                  description: "",
                  capabilities: [],
                  limitations: [],
                },
              ],
            })
          }
        >
          {c.add} · {c.actors}
        </button>
      </div>
      <Questions
        questions={questions}
        answers={value.answers}
        onChange={(answers) => onChange({ ...value, answers })}
        language={language}
      />
      <label className={styles.checks}>
        <span>
          <input
            type="checkbox"
            checked={value.publicOpeningConfirmed}
            onChange={(e) =>
              onChange({ ...value, publicOpeningConfirmed: e.target.checked })
            }
          />{" "}
          {c.confirm}
        </span>
      </label>
    </div>
  );
}
