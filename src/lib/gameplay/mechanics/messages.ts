import type { MechanicsResolution } from "../server-contracts.ts";

const russianOutcomes: Record<string, string> = {
  "The recorded resource cost was spent.": "Учтённый ресурс израсходован.",
  "One healing item was consumed and recovery was applied.":
    "Израсходован один лечебный предмет; восстановление применено.",
  "The requested quantity was transferred.":
    "Указанное количество предметов перемещено.",
  "Equipment assignment was updated.": "Назначение снаряжения обновлено.",
  "The quest status changed prospectively.": "Текущий статус задания обновлён.",
  "The party reached the selected known location.":
    "Группа прибыла в выбранное известное место.",
  "Rest began. Recovery requires explicit completion.":
    "Отдых начат. Для восстановления нужно явно завершить отдых.",
  "Rest ended without recovery. Completed transfers and preparation remain saved.":
    "Отдых прерван без восстановления. Перемещения и приготовление сохранены.",
  "The rest completed with its recorded supply costs and recovery.":
    "Отдых завершён: припасы израсходованы, восстановление применено по сохранённым правилам.",
  "Ingredients were consumed to prepare one serving. No benefit has been applied.":
    "Ингредиенты израсходованы на одну порцию. Эффект ещё не применён.",
  "Servings were consumed. Benefits activate after this long rest and never stack.":
    "Порции употреблены. Эффекты начнут действовать после этого длительного отдыха и не складываются.",
  "Assembly succeeded. Components were embedded and binding consumed; the cutting tool remains.":
    "Сборка успешна. Детали встроены, обвязка израсходована; режущий инструмент сохранён.",
  "Assembly failed. Binding and ten minutes were spent; components and the cutting tool remain.":
    "Сборка не удалась. Израсходованы обвязка и десять минут; детали и режущий инструмент сохранены.",
  "Foraging produced the configured quantity of supplies.":
    "Поиск дал количество припасов, установленное правилами.",
  "Foraging used one hour without finding supplies.":
    "За час поиска припасы не найдены.",
  "The encounter began with recorded participants and separate action, move and reaction budgets.":
    "Сцена столкновения начата; участники и отдельные лимиты действия, перемещения и реакции сохранены.",
  "The attack hit; code-validated damage was applied.":
    "Атака попала; применён урон, рассчитанный по правилам.",
  "The attack missed; its action cost was spent.":
    "Атака промахнулась; действие израсходовано.",
  "The actor defends until their next turn.":
    "Участник защищается до своего следующего хода.",
  "The public position changed; the move budget was spent.":
    "Позиция изменена; перемещение израсходовано.",
  "A reaction was spent to protect the selected ally.":
    "Реакция израсходована на защиту выбранного союзника.",
  "One healing item and the action budget were spent.":
    "Израсходованы один лечебный предмет и действие.",
  "The next eligible participant may act.":
    "Следующий доступный участник может действовать.",
  "The encounter ended with its recorded outcome; health and inventory remain authoritative.":
    "Столкновение завершено с сохранённым исходом; здоровье и инвентарь остаются без дополнительного восстановления.",
};

export function mechanicalNarration(
  resolution: MechanicsResolution,
  language: "en" | "ru",
) {
  const lines = resolution.outcomes.map((outcome) =>
    language === "ru" && outcome.kind !== "world.observed"
      ? (russianOutcomes[outcome.text] ??
        "Действие выполнено по установленным правилам.")
      : outcome.text,
  );
  return `${language === "ru" ? "Результат по правилам" : "Mechanical result"}: ${lines.join(" ")}`;
}

export const clarificationMessages = {
  en: "Please clarify the action or the established campaign facts before continuing. No gameplay changes were applied.",
  ru: "Уточните действие или установленные факты кампании перед продолжением. Игровое состояние не изменено.",
};
