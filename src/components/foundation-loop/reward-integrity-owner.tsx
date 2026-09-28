"use client";
import { useState } from "react";
import type { FoundationLoopView } from "@/lib/foundation-loop/client-contracts";
import type { RewardIntegrityInput } from "@/lib/progression/reward-integrity-authority";
import { useLanguage } from "../language-context";
import { useUnsavedChanges } from "../persistence-context";
import type { ApplyFoundation } from "./commerce-settings";
import { Button } from "../ui";

function RewardBounds({
  view,
  rewardId,
  apply,
}: {
  view: FoundationLoopView;
  rewardId: string;
  apply: ApplyFoundation;
}) {
  const { language } = useLanguage(),
    ru = language === "ru",
    reward = view.owner.rewards.find((r) => r.id === rewardId)!;
  const before = view.owner.rewardIntegrity?.find(
    (p) => p.rewardId === rewardId,
  );
  const initial = {
    rewardId,
    expectedRewardVersion: reward.version,
    expectedPolicyVersion: before?.expectedPolicyVersion ?? null,
    sourceSignificance: before?.sourceSignificance ?? "ordinary",
    usablePowerCeiling: before?.usablePowerCeiling ?? null,
    meaningfulnessFloor: before?.meaningfulnessFloor ?? null,
    powerAggregation: before?.powerAggregation ?? "maximum",
    nonItemSignificance: before?.nonItemSignificance ?? 0,
    deliberateFloorException: before?.deliberateFloorException ?? null,
    items: reward.entries
      .filter((e) => e.kind === "item")
      .map((e) => ({
        itemId: e.itemId,
        rarity: before?.items.find((i) => i.itemId === e.itemId)?.rarity ?? "",
        usablePower:
          before?.items.find((i) => i.itemId === e.itemId)?.usablePower ?? null,
        narrativeSignificance:
          before?.items.find((i) => i.itemId === e.itemId)
            ?.narrativeSignificance ?? null,
      })),
  };
  const [draft, setDraft] = useState(initial);
  const dirty = JSON.stringify(initial) !== JSON.stringify(draft);
  useUnsavedChanges(dirty);
  const number = (
    label: string,
    value: number | null,
    onChange: (v: number | null) => void,
    optional = true,
  ) => (
    <label className="field-label">
      {label}
      <input
        type="number"
        min="0"
        max="1000000"
        required={!optional}
        value={value ?? ""}
        onChange={(e) =>
          onChange(e.target.value === "" ? null : Number(e.target.value))
        }
      />
    </label>
  );
  return (
    <form
      className="form-grid"
      onSubmit={(e) => {
        e.preventDefault();
        if (
          draft.items.some(
            (i) =>
              i.usablePower === null ||
              i.narrativeSignificance === null ||
              !i.rarity.trim(),
          )
        )
          return;
        apply("reward.integrity.configure", draft as RewardIntegrityInput);
      }}
    >
      <p className="muted">
        {ru
          ? "Это оценки владельца по активным правилам. Редкость, сила и ценность не заменяют друг друга. Пустое ограничение не задаёт универсальное правило баланса."
          : "These are owner assessments under the active rules. Rarity, power and value remain separate. A blank limit does not impose a universal balance rule."}
      </p>
      <label className="field-label">
        {ru ? "Значимость достижения" : "Importance of the achievement"}
        <select
          value={draft.sourceSignificance}
          onChange={(e) =>
            setDraft({
              ...draft,
              sourceSignificance: e.target.value as "ordinary" | "meaningful",
            })
          }
        >
          <option value="ordinary">{ru ? "Обычное" : "Ordinary"}</option>
          <option value="meaningful">{ru ? "Значимое" : "Meaningful"}</option>
        </select>
      </label>
      {number(
        ru
          ? "Максимальная доступная сила награды (необязательно)"
          : "Maximum usable reward power (optional)",
        draft.usablePowerCeiling,
        (v) => setDraft({ ...draft, usablePowerCeiling: v }),
      )}
      {number(
        ru
          ? "Минимальная значимость (необязательно)"
          : "Minimum significance (optional)",
        draft.meaningfulnessFloor,
        (v) => setDraft({ ...draft, meaningfulnessFloor: v }),
      )}
      <label className="field-label">
        {ru ? "Как считать силу" : "How to assess power"}
        <select
          value={draft.powerAggregation}
          onChange={(e) =>
            setDraft({
              ...draft,
              powerAggregation: e.target.value as "maximum" | "sum",
            })
          }
        >
          <option value="maximum">
            {ru ? "Самый сильный предмет" : "Strongest item"}
          </option>
          <option value="sum">
            {ru ? "Сумма с учётом количества" : "Total including quantities"}
          </option>
        </select>
      </label>
      {number(
        ru
          ? "Значимость денег, опыта или иных непредметных наград"
          : "Significance of money, experience or other rewards",
        draft.nonItemSignificance,
        (v) => setDraft({ ...draft, nonItemSignificance: v ?? 0 }),
        false,
      )}
      {draft.items.map((item, index) => (
        <fieldset key={item.itemId}>
          <legend>
            {view.owner.items.find((i) => i.id === item.itemId)?.name ??
              (ru ? "Предмет" : "Item")}
          </legend>
          <label className="field-label">
            {ru ? "Редкость" : "Rarity"}
            <input
              required
              maxLength={100}
              value={item.rarity}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  items: draft.items.map((i, n) =>
                    n === index ? { ...i, rarity: e.target.value } : i,
                  ),
                })
              }
            />
          </label>
          {number(
            ru ? "Доступная механическая сила" : "Usable mechanical power",
            item.usablePower,
            (v) =>
              setDraft({
                ...draft,
                items: draft.items.map((i, n) =>
                  n === index ? { ...i, usablePower: v } : i,
                ),
              }),
            false,
          )}
          {number(
            ru ? "Значимость в истории" : "Narrative significance",
            item.narrativeSignificance,
            (v) =>
              setDraft({
                ...draft,
                items: draft.items.map((i, n) =>
                  n === index ? { ...i, narrativeSignificance: v } : i,
                ),
              }),
            false,
          )}
        </fieldset>
      ))}
      <label className="field-label">
        {ru
          ? "Причина намеренного исключения из минимума (необязательно)"
          : "Reason for a deliberate minimum exception (optional)"}
        <textarea
          maxLength={2000}
          value={draft.deliberateFloorException ?? ""}
          onChange={(e) =>
            setDraft({
              ...draft,
              deliberateFloorException: e.target.value.trim()
                ? e.target.value
                : null,
            })
          }
        />
      </label>
      <Button disabled={!dirty} type="submit">
        {ru ? "Сохранить новую версию оценок" : "Save a new assessment version"}
      </Button>
    </form>
  );
}
export function RewardIntegrityOwner({
  view,
  apply,
}: {
  view: FoundationLoopView;
  apply: ApplyFoundation;
}) {
  const { language } = useLanguage();
  return (
    <details>
      <summary>
        {language === "ru"
          ? "Оценки и ограничения наград"
          : "Reward assessments and limits"}
      </summary>
      {view.owner.rewards.length ? (
        view.owner.rewards.map((r) => (
          <details key={r.id}>
            <summary>{r.label}</summary>
            <RewardBounds
              key={`${view.stateVersion}:${r.version}`}
              view={view}
              rewardId={r.id}
              apply={apply}
            />
          </details>
        ))
      ) : (
        <p className="muted">
          {language === "ru"
            ? "Сначала задайте награду за известное достижение."
            : "First define a reward for a known achievement."}
        </p>
      )}
    </details>
  );
}
