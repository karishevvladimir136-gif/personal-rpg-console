"use client";
import { useState } from "react";
import type {
  BootstrapQuestion,
  CreationReview,
  OpeningReview,
} from "../../lib/adventures/bootstrap-contracts";
import {
  creationMissingDetails,
  creationQuestionIsNumeric,
} from "../../lib/adventures/bootstrap-review";
import { bootstrapLimits } from "../../lib/adventures/bootstrap-validation";
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
        correctProtagonist: "Исправить сведения о герое",
        correctItem: "Исправить вещь",
        correctResource: "Исправить ресурс",
        noEntries: "Пока не указано",
        missingDetails: (count: number) =>
          `Осталось заполнить: ${count}`,
        reviewComplete: "Не осталось открытых вопросов о количестве и запасах.",
        startingGear: "Начальные вещи и ресурсы",
        recordedAmount: "Записано",
        questions: "Что нужно уточнить",
        questionHelp: "Количество вещей и запасов укажите в строках выше. Здесь ответьте только на оставшиеся смысловые вопросы.",
        required: "Нужен ответ",
        valueRequired: "Укажите значение перед созданием",
        optional: "По желанию",
        review: "Проверьте предложение",
        editHelp:
          "Исправьте любые поля вручную. Это ваш персонаж; предложение ещё ничего не создаёт.",
        location: "Начальное место",
        situation: "Видимая ситуация",
        narration: "Начало истории",
        actors: "Новые видимые люди / существа",
        actorsHelp:
          "Не включайте героя или уже существующих персонажей. Герой уже существует и будет находиться в начальном месте.",
        confirm:
          "Я проверил начало: только открытые факты, без скрытого объяснения, исхода, награды или решений героя.",
        pending:
          "Ответ пока не подтверждён. Восстановите тот же запрос; повторного обращения к ИИ не будет.",
        preparing: "Подготавливаем предложение…",
        creating: "Создаём персонажа и кампанию…",
        starting: "Начинаем приключение…",
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
        correctProtagonist: "Correct protagonist details",
        correctItem: "Correct item",
        correctResource: "Correct resource",
        noEntries: "None recorded yet",
        missingDetails: (count: number) =>
          `${count} ${count === 1 ? "detail still needs" : "details still need"} your input`,
        reviewComplete: "No unresolved quantities, balances or clarifications.",
        startingGear: "Starting gear and resources",
        recordedAmount: "Recorded",
        questions: "Clarifications",
        questionHelp: "Enter item counts and balances in the rows above. Answer only the remaining story details here.",
        required: "Answer required",
        valueRequired: "Enter a value before creation",
        optional: "Optional",
        review: "Review the proposal",
        editHelp:
          "Correct any field by hand. This is your protagonist; the proposal has not created anything yet.",
        location: "Starting place",
        situation: "Visible situation",
        narration: "Opening narration",
        actors: "New visible people / creatures",
        actorsHelp:
          "Do not include the protagonist or existing characters. Your protagonist already exists and will be present at the starting place.",
        confirm:
          "I reviewed this public opening: no hidden explanation, outcome, reward or decisions for the protagonist.",
        pending:
          "The response is not confirmed. Recover the same request; it will not call the AI again.",
        preparing: "Preparing proposal…",
        creating: "Creating protagonist and campaign…",
        starting: "Starting Adventure…",
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
function InlineNumber({
  label,
  value,
  min,
  max,
  onChange,
  valueRequired,
}: {
  label: string;
  value: number | null;
  min: number;
  max: number;
  onChange: (value: number | null) => void;
  valueRequired: string;
}) {
  const [editing, setEditing] = useState(value === null);
  const valid = value !== null && Number.isInteger(value) && value >= min && value <= max;
  return editing || !valid ? (
    <label className={styles.compactNumber}>
      {label}
      <input
        type="number"
        min={min}
        max={max}
        required
        aria-invalid={!valid}
        value={value ?? ""}
        onChange={(event) =>
          onChange(event.target.value === "" ? null : Number(event.target.value))
        }
        onBlur={() => { if (valid) setEditing(false); }}
      />
      {!valid && <small>{value === null ? valueRequired : `${min}–${max}`}</small>}
    </label>
  ) : (
    <span>×{value}</span>
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
  visible,
  help,
}: {
  questions: BootstrapQuestion[];
  answers: (string | null)[];
  onChange: (v: (string | null)[]) => void;
  language: "en" | "ru";
  visible?: (question: BootstrapQuestion, index: number) => boolean;
  help?: string;
}) {
  const c = bootstrapText(language);
  const shown = questions
    .map((question, index) => ({ question, index }))
    .filter(({ question, index }) => !visible || visible(question, index));
  return shown.length ? (
    <div className={styles.form}>
      <h3>{c.questions}</h3>
      {help && <p className={styles.muted}>{help}</p>}
      {shown.map(({ question: q, index: i }) => (
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
  const missing = creationMissingDetails(value, questions);
  const possession = (
    index: number,
    change: Partial<CreationReview["possessions"][number]>,
  ) =>
    onChange({
      ...value,
      possessions: value.possessions.map((item, i) =>
        i === index ? { ...item, ...change } : item,
      ),
    });
  const resource = (
    index: number,
    change: Partial<CreationReview["resources"][number]>,
  ) =>
    onChange({
      ...value,
      resources: value.resources.map((item, i) =>
        i === index ? { ...item, ...change } : item,
      ),
    });
  return (
    <div className={styles.characterReview}>
      <h3>{c.review}</h3>
      <p className={styles.muted}>{c.editHelp}</p>
      <div className={styles.characterIdentity}>
        <h4>{value.name}</h4>
        <p>{value.description}</p>
        <div className={styles.characterFacts}>
          <div><strong>{c.capabilities}</strong><ul>{value.capabilities.map((fact, i) => <li key={i}>{fact}</li>)}</ul></div>
          <div><strong>{c.limitations}</strong><ul>{value.limitations.map((fact, i) => <li key={i}>{fact}</li>)}</ul></div>
        </div>
        <details className={styles.reviewEdits}>
          <summary>{c.correctProtagonist}</summary>
          <div className={styles.form}>
            <Field label={c.name} value={value.name} max={200} onChange={(name) => onChange({ ...value, name })} />
            <Field label={c.who} value={value.description} max={8000} large onChange={(description) => onChange({ ...value, description })} />
            <Lines label={`${c.capabilities} · ${c.linesHelp}`} value={value.capabilities} onChange={(capabilities) => onChange({ ...value, capabilities })} />
            <Lines label={c.limitations} value={value.limitations} onChange={(limitations) => onChange({ ...value, limitations })} />
          </div>
        </details>
      </div>
      <h3>{c.startingGear}</h3>
      {!value.possessions.length && !value.resources.length && <p className={styles.muted}>{c.noEntries}</p>}
      {value.possessions.map((p, i) => (
        <div className={styles.gearRow} key={i}>
          <div className={styles.gearHeading}>
            <strong>{p.name || c.name}</strong>
            <InlineNumber label={c.quantity} value={p.quantity} min={1} max={bootstrapLimits.possessionQuantity}
              valueRequired={c.valueRequired} onChange={(quantity) => possession(i, { quantity })} />
          </div>
          <details className={styles.reviewEdits}>
            <summary>{c.correctItem}</summary>
            <div className={styles.form}>
              <Field label={c.name} value={p.name} max={200} onChange={(name) => possession(i, { name })} />
              <Field label={`${c.description} · ${c.optional}`} value={p.description} large onChange={(description) => possession(i, { description })} />
              {p.quantity !== null && <label className={styles.field}>{c.quantity}<input type="number" min={1} max={bootstrapLimits.possessionQuantity} required value={p.quantity} onChange={(e) => possession(i, { quantity: e.target.value === "" ? null : Number(e.target.value) })} /></label>}
              <div className={styles.actions}><button type="button" onClick={() => onChange({ ...value, possessions: value.possessions.filter((_, j) => i !== j) })}>{c.remove}</button></div>
            </div>
          </details>
        </div>
      ))}
      {value.resources.map((r, i) => (
        <div className={styles.gearRow} key={r.key}>
          <div className={styles.gearHeading}>
            <strong>{r.label || c.resources}</strong>
            <InlineNumber label={c.amount} value={r.amount} min={0} max={1000000}
              valueRequired={c.valueRequired} onChange={(amount) => resource(i, { amount })} />
          </div>
          <details className={styles.reviewEdits}>
            <summary>{c.correctResource}</summary>
            <div className={styles.form}>
              <Field label={c.name} value={r.label} max={100} onChange={(label) => resource(i, { label })} />
              {r.amount !== null && <label className={styles.field}>{c.amount}<input type="number" min={0} max={1000000} required value={r.amount} onChange={(e) => resource(i, { amount: e.target.value === "" ? null : Number(e.target.value) })} /></label>}
              <div className={styles.actions}><button type="button" onClick={() => onChange({ ...value, resources: value.resources.filter((_, j) => i !== j) })}>{c.remove}</button></div>
            </div>
          </details>
        </div>
      ))}
      <details className={styles.reviewEdits}>
        <summary>{c.add} · {c.startingGear}</summary>
        <div className={styles.actions}>
          <button type="button" disabled={value.possessions.length >= 12} onClick={() => onChange({ ...value, possessions: [...value.possessions, { name: "", description: "", quantity: null }] })}>{c.add} · {c.possessions}</button>
          <button type="button" disabled={value.resources.length >= 8} onClick={() => {
            let i = 1;
            while (value.resources.some((item) => item.key === `resource_${i}`)) i++;
            onChange({ ...value, resources: [...value.resources, { key: `resource_${i}`, label: "", amount: null }] });
          }}>{c.add} · {c.resources}</button>
        </div>
      </details>
      <details className={styles.reviewEdits}>
        <summary>{language === "ru" ? "Механика боя (по желанию)" : "Combat readiness (optional)"}</summary>
        <p className={styles.muted}>{language === "ru"
          ? "Утвердите эти значения явно. Без них бой не начнётся автоматически. Только выбранный предмет будет записан как оружие."
          : "Approve these values explicitly. Combat stays unavailable without them. Only the selected approved possession becomes an equipped weapon."}</p>
        <label className={styles.field}>
          <input type="checkbox" checked={!!value.mechanics} onChange={(event) => {
            if (event.target.checked)
              onChange({ ...value, mechanics: { hp: 10, attack: 0, defense: 10, skill: 0, weaponName: null, weaponDamage: null } });
            else {
              const { mechanics: _removed, ...review } = value;
              void _removed;
              onChange(review);
            }
          }} />
          {language === "ru" ? "Утвердить боевой профиль" : "Approve a combat profile"}
        </label>
        {value.mechanics && <div className={styles.form}>
          {(["hp", "attack", "defense", "skill"] as const).map((field) => (
            <label className={styles.field} key={field}>
              {field === "hp" ? "HP" : field === "attack" ? "Attack modifier" : field === "defense" ? "Defense" : "Skill modifier"}
              <input type="number" min={field === "hp" || field === "defense" ? 1 : -20} max={field === "hp" ? 10000 : field === "defense" ? 40 : 20}
                value={value.mechanics![field]} onChange={(event) => onChange({ ...value, mechanics: { ...value.mechanics!, [field]: Number(event.target.value) } })} />
            </label>
          ))}
          <label className={styles.field}>
            {language === "ru" ? "Утверждённое оружие" : "Approved starting weapon"}
            <select value={value.mechanics.weaponName ?? ""} onChange={(event) => onChange({ ...value, mechanics: { ...value.mechanics!, weaponName: event.target.value || null, weaponDamage: event.target.value ? 2 : null } })}>
              <option value="">{language === "ru" ? "Без оружия" : "Unarmed"}</option>
              {value.possessions.filter((item) => item.name && item.quantity !== null).map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}
            </select>
          </label>
          {value.mechanics.weaponName && <label className={styles.field}>
            {language === "ru" ? "Урон оружия" : "Weapon damage"}
            <input type="number" min={1} max={20} value={value.mechanics.weaponDamage ?? 2}
              onChange={(event) => onChange({ ...value, mechanics: { ...value.mechanics!, weaponDamage: Number(event.target.value) } })} />
          </label>}
        </div>}
      </details>
      <Questions
        questions={questions}
        answers={value.answers}
        onChange={(answers) => onChange({ ...value, answers })}
        language={language}
        visible={(question) => !creationQuestionIsNumeric(question, value)}
        help={c.questionHelp}
      />
      <p role="status" className={missing ? styles.notice : styles.muted}>
        {missing ? c.missingDetails(missing) : c.reviewComplete}
      </p>
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
      <p className={styles.muted}>{c.actorsHelp}</p>
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
