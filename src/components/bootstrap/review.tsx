"use client";
import { useState } from "react";
import { startTimeChoices } from "../../lib/adventures/wizard-text";
import type {
  BootstrapQuestion,
  CharacterSheetV1,
  CreationEquipmentProfile,
  CreationMechanics,
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
        actors: "Люди в сцене",
        actorsHelp:
          "Каждый станет записью кампании; имя и описание можно поправить. Героя здесь нет — он уже в сцене.",
        confirm:
          "Я прочитал начало — можно играть.",
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
          "Опишите любого героя в своём мире. Этот стиль кампании не требует класса, уровня, здоровья или человеческого тела.",
        title: "Название кампании",
        language: "Язык кампании",
        advanced: "Другие поддерживаемые правила",
        fighter: "Воин 1-го уровня · стартовые правила",
        opening: "Начало приключения",
        openingHelp:
          "Ведущий предлагает первую сцену; приключение начнётся, когда ты её утвердишь.",
        openingPreview: "Предложенное начало",
        openingNeedsDetails: "В сцене чего-то не хватает — заполни пустые поля ниже.",
        openingCorrections: "Поправить сцену и людей",
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
        actors: "People in the scene",
        actorsHelp:
          "Each becomes a record of the campaign; change any name or description. The hero is not listed — he is already there.",
        confirm:
          "I have read the opening — ready to play.",
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
          "Describe any protagonist in your world. This campaign style does not require a class, level, HP, or humanoid anatomy.",
        title: "Campaign title",
        language: "Campaign language",
        advanced: "Other supported rules",
        fighter: "Level 1 Fighter · starter rules",
        opening: "Adventure opening",
        openingHelp:
          "The DM proposes the first scene; the adventure starts when you approve it.",
        openingPreview: "Proposed opening",
        openingNeedsDetails: "Something is missing in the scene — fill in the empty fields below.",
        openingCorrections: "Change the scene and the people",
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
const defaultStructuredAttributes: NonNullable<CharacterSheetV1["attributes"]> = {
  strength: 10, dexterity: 10, constitution: 10,
  intelligence: 10, wisdom: 10, charisma: 10,
};
const defaultCombatProfile: CreationMechanics = {
  hp: 10, attack: 0, defense: 10, skill: 0,
  weaponName: null, weaponDamage: null,
};

/** A mode correction never silently approves combat mechanics. */
export function changeCharacterSheetMode(
  review: CreationReview,
  mode: CharacterSheetV1["mode"],
): CreationReview {
  if (!review.sheet || review.sheet.mode === mode) return review;
  const { mechanics: _previousMechanics, ...withoutMechanics } = review;
  void _previousMechanics;
  return {
    ...withoutMechanics,
    equipmentProfile: "none",
    sheet: {
      ...review.sheet,
      mode,
      attributes: mode === "structured_rpg" ? { ...defaultStructuredAttributes } : null,
    },
  };
}

/** Clearing anatomy also clears a weapon selection that cannot be equipped. */
export function changeCreationEquipmentProfile(
  review: CreationReview,
  profile: CreationEquipmentProfile,
): CreationReview {
  if (!review.sheet || review.sheet.mode !== "structured_rpg") return review;
  return {
    ...review,
    equipmentProfile: profile,
    ...(profile === "none" && review.mechanics ? {
      mechanics: { ...review.mechanics, weaponName: null, weaponDamage: null },
    } : {}),
  };
}

export function setCreationCombatApproval(
  review: CreationReview,
  approved: boolean,
): CreationReview {
  if (!review.sheet || review.sheet.mode !== "structured_rpg") return review;
  if (approved) return { ...review, mechanics: review.mechanics ?? { ...defaultCombatProfile } };
  const { mechanics: _previousMechanics, ...withoutMechanics } = review;
  void _previousMechanics;
  return withoutMechanics;
}
function MechanicsEditor({
  mechanics,
  possessions,
  language,
  allowWeapon,
  onChange,
}: {
  mechanics: CreationMechanics;
  possessions: CreationReview["possessions"];
  language: "en" | "ru";
  allowWeapon: boolean;
  onChange: (next: CreationMechanics) => void;
}) {
  return (
    <div className={styles.form}>
      {(["hp", "attack", "defense", "skill"] as const).map((field) => (
        <label className={styles.field} key={field}>
          {language === "ru"
            ? (field === "hp" ? "Хиты" : field === "attack" ? "Атака (модификатор)" : field === "defense" ? "Защита" : "Навык (модификатор)")
            : (field === "hp" ? "HP" : field === "attack" ? "Attack modifier" : field === "defense" ? "Defense" : "Skill modifier")}
          <input
            type="number"
            min={field === "hp" || field === "defense" ? 1 : -20}
            max={field === "hp" ? 10000 : field === "defense" ? 40 : 20}
            value={mechanics[field]}
            onChange={(event) => onChange({ ...mechanics, [field]: Number(event.target.value) })}
          />
        </label>
      ))}
      <label className={styles.field}>
        {language === "ru" ? "Утверждённое оружие" : "Approved starting weapon"}
        <select value={mechanics.weaponName ?? ""} disabled={!allowWeapon} onChange={(event) => onChange({ ...mechanics, weaponName: event.target.value || null, weaponDamage: event.target.value ? (mechanics.weaponDamage ?? 2) : null })}>
          <option value="">{language === "ru" ? "Без оружия" : "Unarmed"}</option>
          {possessions.filter((item) => item.name && item.quantity !== null).map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}
        </select>
      </label>
      {mechanics.weaponName && <label className={styles.field}>
        {language === "ru" ? "Урон оружия" : "Weapon damage"}
        <input type="number" min={1} max={20} value={mechanics.weaponDamage ?? 2}
          onChange={(event) => onChange({ ...mechanics, weaponDamage: Number(event.target.value) })} />
      </label>}
    </div>
  );
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
  const sheet = value.sheet;
  const combatApprovalNeeded = sheet?.mode === "structured_rpg" && !value.mechanics;
  const attributeFields = ["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"] as const;
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
          <div>
            <strong>{sheet ? (language === "ru" ? "Открытые способности для записи" : "Public capabilities to record") : c.capabilities}</strong>
            {value.capabilities.length ? <ul>{value.capabilities.map((fact, i) => <li key={i}>{fact}</li>)}</ul>
              : <p className={styles.muted}>{language === "ru" ? "Не указаны" : "None recorded"}</p>}
          </div>
          <div>
            <strong>{sheet ? (language === "ru" ? "Открытые ограничения для записи" : "Public limitations to record") : c.limitations}</strong>
            {value.limitations.length ? <ul>{value.limitations.map((fact, i) => <li key={i}>{fact}</li>)}</ul>
              : <p className={styles.muted}>{language === "ru" ? "Не указаны" : "None recorded"}</p>}
          </div>
        </div>
        {sheet && <p className={styles.muted}>{language === "ru"
          ? "Эти сведения станут открытыми фактами о герое. Предложения в листе персонажа ниже не добавляют новых игровых способностей."
          : "These become public facts about your hero. The character sheet suggestions below do not add new gameplay abilities."}</p>}
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
      {sheet && (
        <section className={styles.sheetReview} aria-label={language === "ru" ? "Лист персонажа" : "Character sheet proposal"}>
          <div className={styles.sheetReviewHeader}>
            <div>
              <span className={styles.previewEyebrow}>{language === "ru" ? "Предложенный лист персонажа" : "Proposed character sheet"}</span>
              <h3>{sheet.role || value.name}</h3>
            </div>
            <span className={styles.sheetMode}>{sheet.mode === "structured_rpg" ? (language === "ru" ? "Структурированный RPG" : "Structured RPG") : (language === "ru" ? "Повествовательный" : "Narrative")}</span>
          </div>
          {sheet.background && <p className={styles.sheetBackground}>{sheet.background}</p>}
          {sheet.mode === "structured_rpg" && <p className={styles.muted}>{value.equipmentProfile === "standard_humanoid"
            ? (language === "ru" ? "Обычные слоты снаряжения для гуманоида." : "Standard humanoid equipment slots.")
            : (language === "ru" ? "Стандартные слоты снаряжения не назначены." : "No standard body equipment slots assigned.")}</p>}
          {sheet.attributes && (
            <div className={styles.sheetAttributes} aria-label={language === "ru" ? "Характеристики" : "Attributes"}>
              {attributeFields.map((field) => (
                <div key={field}><span>{field.slice(0, 3).toUpperCase()}</span><strong>{sheet.attributes![field]}</strong></div>
              ))}
            </div>
          )}
          <div className={styles.sheetFacts}>
            <div><strong>{language === "ru" ? "Навыки" : "Skills"}</strong><ul>{sheet.skills.map((entry) => <li key={entry}>{entry}</li>)}</ul></div>
            <div><strong>{language === "ru" ? "Способности" : "Abilities"}</strong><ul>{sheet.abilities.map((entry) => <li key={entry}>{entry}</li>)}</ul></div>
            <div><strong>{c.limitations}</strong><ul>{sheet.limitations.map((entry) => <li key={entry}>{entry}</li>)}</ul></div>
          </div>
          <p className={styles.muted}>{language === "ru"
            ? "Навыки и способности описывают персонажа. Они не добавляют автоматических боевых бонусов; ведущий определит, когда нужна проверка."
            : "Skills and abilities describe your character. They do not add automatic combat bonuses; the DM decides when a check is needed."}</p>
          {value.mechanics && (
            <div className={styles.sheetMechanics}>
              <strong>{language === "ru" ? "Боевые значения" : "Combat values"}</strong>
              <span>{language === "ru" ? "Хиты" : "HP"} {value.mechanics.hp} · {language === "ru" ? "Атака" : "Attack"} {value.mechanics.attack >= 0 ? "+" : ""}{value.mechanics.attack} · {language === "ru" ? "Защита" : "Defense"} {value.mechanics.defense} · {language === "ru" ? "Навык" : "Skill"} {value.mechanics.skill >= 0 ? "+" : ""}{value.mechanics.skill}</span>
              {value.mechanics.weaponName && <span>{value.mechanics.weaponName} · {language === "ru" ? "урон" : "damage"} {value.mechanics.weaponDamage}</span>}
            </div>
          )}
          <details className={styles.reviewEdits}>
            <summary>{language === "ru" ? "Исправить лист персонажа" : "Correct character sheet"}</summary>
            <div className={styles.form}>
              <label className={styles.field}>
                {language === "ru" ? "Стиль листа персонажа" : "Character sheet style"}
                <select value={sheet.mode} onChange={(event) => onChange(changeCharacterSheetMode(value, event.target.value as CharacterSheetV1["mode"]))}>
                  <option value="narrative">{language === "ru" ? "Повествовательный" : "Narrative"}</option>
                  <option value="structured_rpg">{language === "ru" ? "Структурированный RPG" : "Structured RPG"}</option>
                </select>
              </label>
              <p className={styles.muted}>{language === "ru"
                ? "Смена стиля сбрасывает характеристики до 10 и отменяет утверждение боевых значений. Проверьте эти предварительные значения перед созданием кампании."
                : "Changing style resets scores to 10 and clears combat approval. Review these starting values before creating the campaign."}</p>
              {sheet.mode === "structured_rpg" && <label className={styles.field}>
                {language === "ru" ? "Профиль снаряжения" : "Equipment profile"}
                <select value={value.equipmentProfile ?? "none"} onChange={(event) => onChange(changeCreationEquipmentProfile(value, event.target.value as CreationEquipmentProfile))}>
                  <option value="standard_humanoid">{language === "ru" ? "Обычный гуманоид" : "Standard humanoid"}</option>
                  <option value="none">{language === "ru" ? "Без стандартных слотов" : "No standard body slots"}</option>
                </select>
              </label>}
              <Field label={language === "ru" ? "Роль / архетип" : "Role / archetype"} value={sheet.role} max={120} onChange={(role) => onChange({ ...value, sheet: { ...sheet, role: role || null } })} />
              <Field label={language === "ru" ? "Предыстория" : "Background"} value={sheet.background} max={2000} large onChange={(background) => onChange({ ...value, sheet: { ...sheet, background } })} />
              {sheet.level !== null && <label className={styles.field}>
                {language === "ru" ? "Уровень" : "Level"}
                <input type="number" min={1} max={100} value={sheet.level} onChange={(event) => onChange({ ...value, sheet: { ...sheet, level: Number(event.target.value) } })} />
              </label>}
              {sheet.tier !== null && <Field label={language === "ru" ? "Ступень" : "Tier"} value={sheet.tier} max={120} onChange={(tier) => onChange({ ...value, sheet: { ...sheet, tier } })} />}
              {sheet.attributes && (
                <div className={styles.sheetAttributeEdits}>
                  {attributeFields.map((field) => (
                    <label className={styles.field} key={field}>
                      {field[0].toUpperCase() + field.slice(1)}
                      <input type="number" min={1} max={20} value={sheet.attributes![field]}
                        onChange={(event) => onChange({ ...value, sheet: { ...sheet, attributes: { ...sheet.attributes!, [field]: Number(event.target.value) } } })} />
                    </label>
                  ))}
                </div>
              )}
              <Lines label={language === "ru" ? "Навыки · по одному в строке" : "Skills · one per line"} value={sheet.skills} onChange={(skills) => onChange({ ...value, sheet: { ...sheet, skills: normalizeLines(skills) } })} />
              <Lines label={language === "ru" ? "Способности · по одной в строке" : "Abilities · one per line"} value={sheet.abilities} onChange={(abilities) => onChange({ ...value, sheet: { ...sheet, abilities: normalizeLines(abilities) } })} />
              <Lines label={c.limitations} value={sheet.limitations} onChange={(limitations) => onChange({ ...value, sheet: { ...sheet, limitations: normalizeLines(limitations) } })} />
              {sheet.spells.length > 0 && <Lines label={language === "ru" ? "Заклинания · по одному в строке" : "Spells · one per line"} value={sheet.spells} onChange={(spells) => onChange({ ...value, sheet: { ...sheet, spells: normalizeLines(spells) } })} />}
              {sheet.mode === "structured_rpg" && <>
                <label className={styles.field}>
                  <input type="checkbox" checked={!!value.mechanics}
                    onChange={(event) => onChange(setCreationCombatApproval(value, event.target.checked))} />
                  {language === "ru" ? "Утвердить боевой профиль" : "Approve a combat profile"}
                </label>
                {value.mechanics && <MechanicsEditor
                  mechanics={value.mechanics}
                  possessions={value.possessions}
                  language={language}
                  allowWeapon={value.equipmentProfile !== "none"}
                  onChange={(mechanics) => onChange({ ...value, mechanics })}
                />}
              </>}
            </div>
          </details>
        </section>
      )}
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
      {!sheet && <details className={styles.reviewEdits}>
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
        {value.mechanics && <MechanicsEditor mechanics={value.mechanics} possessions={value.possessions} language={language} allowWeapon onChange={(mechanics) => onChange({ ...value, mechanics })} />}
      </details>}
      <Questions
        questions={questions}
        answers={value.answers}
        onChange={(answers) => onChange({ ...value, answers })}
        language={language}
        visible={(question) => !creationQuestionIsNumeric(question, value)}
        help={c.questionHelp}
      />
      <p role="status" className={missing || combatApprovalNeeded ? styles.notice : styles.muted}>
        {missing ? c.missingDetails(missing) : combatApprovalNeeded
          ? (language === "ru" ? "Откройте «Исправить лист персонажа», чтобы проверить и утвердить боевой профиль перед созданием кампании." : "Open Correct character sheet to review and approve the combat profile before creating the campaign.")
          : c.reviewComplete}
      </p>
    </div>
  );
}
export function OpeningReviewFields({
  value,
  onChange,
  language,
  questions,
  startMinutes = null,
  onStartMinutes,
}: {
  value: OpeningReview;
  onChange: (v: OpeningReview) => void;
  language: "en" | "ru";
  questions: BootstrapQuestion[];
  /** Polish group 10: the clock of the opening scene, read from its words; the owner corrects it. */
  startMinutes?: number | null;
  onStartMinutes?: (minutes: number | null) => void;
}) {
  const c = bootstrapText(language);
  const timeChoices = startTimeChoices(language);
  const clock = (minutes: number) => `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, "0")}`;
  const needsDetails = !value.location.name?.trim() ||
    !value.location.description?.trim() ||
    !value.situation?.trim() ||
    !value.narration?.trim() ||
    value.actors.some((actor) => !actor.name.trim() || !actor.description.trim());
  return (
    <div className={styles.form}>
      <section className={styles.openingPreview} aria-label={c.openingPreview}>
        <span className={styles.previewEyebrow}>{c.openingPreview}</span>
        {value.location.name && <h3>{value.location.name}</h3>}
        {value.location.description && <p>{value.location.description}</p>}
        {value.situation && <p className={styles.openingSituation}>{value.situation}</p>}
        {value.narration && <p className={styles.openingNarration}>{value.narration}</p>}
        {value.actors.length > 0 && (
          <div className={styles.openingPeople}>
            <h4>{c.actors}</h4>
            <div className={styles.openingPeopleGrid}>
              {value.actors.map((actor, index) => (
                <article key={`${actor.name}-${index}`}>
                  <strong>{actor.name}</strong>
                  <p>{actor.description}</p>
                  {actor.capabilities.length > 0 && <small>{c.capabilities}: {actor.capabilities.join(" · ")}</small>}
                  {actor.limitations.length > 0 && <small>{c.limitations}: {actor.limitations.join(" · ")}</small>}
                </article>
              ))}
            </div>
          </div>
        )}
      </section>
      {needsDetails && <p role="status" className={styles.notice}>{c.openingNeedsDetails}</p>}
      <details className={styles.reviewEdits} open={!!needsDetails}>
        <summary>{c.openingCorrections}</summary>
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
        </div>
      </details>
      <Questions
        questions={questions}
        answers={value.answers}
        onChange={(answers) => onChange({ ...value, answers })}
        language={language}
      />
      {onStartMinutes && (
        <label className={styles.field}>
          {language === "ru" ? "Время начала сцены" : "Time the scene starts"}
          <select value={startMinutes ?? ""} onChange={(event) => onStartMinutes(event.target.value === "" ? null : Number(event.target.value))}>
            <option value="">{language === "ru" ? "Не задано · часы пойдут с полуночи" : "Not set · the clock starts at midnight"}</option>
            {startMinutes !== null && !timeChoices.some((row) => row.minutes === startMinutes) && (
              <option value={startMinutes}>{language === "ru" ? `Как в тексте · ${clock(startMinutes)}` : `As written · ${clock(startMinutes)}`}</option>
            )}
            {timeChoices.map((row) => <option key={row.minutes} value={row.minutes}>{row.label}</option>)}
          </select>
          <small className={styles.muted}>{language === "ru" ? "Прочитано из вступления; поправь, если сцена начинается в другой час." : "Read from the opening; correct it if the scene starts at another hour."}</small>
        </label>
      )}
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
