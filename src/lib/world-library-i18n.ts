import { worldLibraryText } from "./locales/wave2-library.ts";

export const WORLD_AUTHORING_RU: Record<string, string> = {
  "Your world begins here": "Здесь начинается ваш мир",
  "Upload Sources": "Загрузить источники",
  "Describe From Scratch": "Описать с нуля",
  Combine: "Объединить",
  Research: "Исследование",
  "Future · unavailable": "В будущем · недоступно",
  "Preserve your notes or a TXT / Markdown file.":
    "Сохраните заметки или файл TXT / Markdown.",
  "Describe a world in your own words. No special format needed.":
    "Опишите мир своими словами. Специальный формат не нужен.",
  "Mix your own premise with uploaded sources, then choose their priority.":
    "Соедините свой замысел с загруженными источниками и выберите их приоритет.",
  "Research is not available. No web search or external import runs here.":
    "Исследование недоступно. Поиск в интернете и внешний импорт здесь не запускаются.",
  "Add your description": "Добавить своё описание",
  "Add an uploaded source": "Добавить загружаемый источник",
  "A new world, in your own words": "Новый мир своими словами",
  "Describe the place, people, factions, tensions and rules that matter. Say what is certain and what should remain open.":
    "Опишите места, людей, фракции, конфликты и важные правила. Укажите, что точно известно, а что должно остаться открытым.",
  "World title": "Название мира",
  "Your world description": "Ваше описание мира",
  "Description language": "Язык описания",
  English: "Английский",
  Russian: "Русский",
  "Example ideas": "Примеры идей",
  "Medieval Europe, but dragons have replaced cavalry. Coastal kingdoms control breeding grounds. Who can afford a dragon, and what has changed for ordinary farmers? Leave the answers open.":
    "Средневековая Европа, где драконы заменили конницу. Прибрежные королевства контролируют места размножения. Кто может позволить себе дракона и как изменилась жизнь крестьян? Оставьте ответы открытыми.",
  "A quiet city built around a sleeping sea. Three families share the harbor, and every treaty expires at the next tide. Magic can remember, but cannot predict.":
    "Тихий город вокруг спящего моря. Три семьи делят гавань, и каждый договор действует лишь до следующего прилива. Магия умеет помнить, но не предсказывать.",
  "Your exact words are preserved as an owner-authored source. Saving makes no model request. They remain authored premises, never external source facts.":
    "Ваш текст сохраняется точно как авторский источник. Сохранение не обращается к модели. Это авторский замысел, а не факты внешнего источника.",
  "Preserve description": "Сохранить описание",
  "Save revised description": "Сохранить исправленное описание",
  "Owner-authored description": "Авторское описание",
  "Uploaded source": "Загруженный источник",
  "Choose sources, then review": "Выберите источники и проверьте результат",
  "Source priority": "Приоритет источников",
  "Highest priority first. Conflicting alternatives stay visible.":
    "Сначала самый высокий приоритет. Противоречащие варианты остаются видимыми.",
  "No sources selected yet.": "Источники пока не выбраны.",
  "Compiler approach": "Способ сборки",
  "Local source indexing": "Локальная индексация источников",
  "Configured model assistance": "Помощь настроенной модели",
  "Preserves source passages locally. No provider request or charge.":
    "Сохраняет фрагменты локально. Без запроса к провайдеру и оплаты.",
  "Uses the configured compiler model. An explicit request sends selected source excerpts to the provider and may incur a charge; the cost is unknown here. No substitute model is selected if unavailable.":
    "Использует настроенную модель компиляции. Явный запрос отправляет выбранные фрагменты провайдеру и может оплачиваться; стоимость здесь неизвестна. При недоступности модель не заменяется.",
  "Work limit": "Лимит работы",
  "Create assisted job": "Создать задачу с помощью модели",
  "Creating a job checks configuration and saves the selected profile. Continue each stage explicitly; opening this page never calls a model.":
    "Создание задачи проверяет настройки и сохраняет выбранный профиль. Каждый этап запускается явно; открытие страницы не обращается к модели.",
  "Compiler jobs": "Задачи компиляции",
  "Model pinned for this job": "Модель закреплена для этой задачи",
  "Request assisted draft": "Запросить черновик у модели",
  "Prepare explicit retry": "Подготовить явный повтор",
  "Request status is uncertain. Reload first; an explicit retry abandons the pending response and may lead to another charged request.":
    "Статус запроса неизвестен. Сначала обновите библиотеку; явный повтор отклоняет ожидающий ответ и может привести к ещё одному платному запросу.",
  "Paused: the configured provider or model is unavailable. Check Model Runtime setup before an explicit retry. No fallback was used.":
    "Приостановлено: настроенный провайдер или модель недоступны. Перед явным повтором проверьте настройки моделей. Замены модели не было.",
  "Paused: the last proposal could not be completed or validated. Your sources and earlier versions are preserved.":
    "Приостановлено: последнее предложение не удалось завершить или проверить. Источники и прежние версии сохранены.",
  "Assistance is unavailable. Check the configured compiler model and provider setup. No substitute model was selected.":
    "Помощь модели недоступна. Проверьте настроенную модель компиляции и провайдера. Другая модель не выбиралась.",
  "Review your world": "Проверьте свой мир",
  "1 · People and places": "1 · Люди и места",
  "Correct names, aliases and types by hand. Save a new draft below; original sources and earlier versions stay intact.":
    "Исправляйте имена, другие названия и типы вручную. Сохраните новый черновик ниже; исходные источники и прежние версии останутся неизменными.",
  "Edit identity": "Исправить сведения",
  "Display name": "Отображаемое имя",
  "Entity type": "Тип сущности",
  "Aliases (one per line)": "Другие имена или названия (по одному в строке)",
  "Up to 20 distinct aliases, 240 characters each. Empty lines are ignored.":
    "До 20 разных имён или названий, по 240 символов. Пустые строки пропускаются.",
  "Add your own answer, correction or decision to leave a question open. Notes are owner-authored reference, not source facts or Canon; the original question stays visible.":
    "Добавьте свой ответ, исправление или решение оставить вопрос открытым. Это авторские справочные заметки, а не факты источника или канон; исходный вопрос остаётся видимым.",
  "Owner note / resolution (optional)":
    "Заметка / решение владельца (необязательно)",
  "2 · Evidence and open questions": "2 · Свидетельства и открытые вопросы",
  "3 · Choose Canon, then approve": "3 · Выберите канон и утвердите",
  "People and other entities": "Люди и другие сущности",
  Factions: "Фракции",
  Locations: "Места",
  "None proposed yet.": "Предложений пока нет.",
  "Assumptions and inferences": "Допущения и выводы",
  "No authored assumptions or inferences in this version.":
    "В этой версии нет авторских допущений или выводов.",
  "Relationships, geography, timeline and rules":
    "Связи, география, хронология и правила",
  "No structured connections proposed yet.":
    "Структурированные связи пока не предложены.",
  "All proposals remain reference until you explicitly select eligible claims and approve. Character knowledge requires its own review.":
    "Все предложения остаются справочными, пока вы явно не выберете подходящие утверждения и не утвердите пакет. Знания персонажа проверяются отдельно.",
  "Read evidence / edit": "Свидетельства / правка",
  "Keep uncertain": "Оставить неопределённым",
  "Retain as reference": "Оставить справочным",
  Reject: "Отклонить",
  "Undo rejection": "Отменить отклонение",
  "Rejected for the next draft": "Отклонено для следующего черновика",
  "Nothing is deleted from earlier versions. Save a new draft to apply edits or rejections, then review that version before approval.":
    "Прежние версии не удаляются. Сохраните новый черновик с правками и отклонениями, затем проверьте его перед утверждением.",
  "Mark as Canon on approval": "Отметить как канон при утверждении",
  "Canon candidates": "Кандидаты в канон",
  "Remaining reference": "Останется справочным",
  "No claims selected as Canon.": "Ни одно утверждение не выбрано как канон.",
  "Claims marked Canon will become authoritative only when you approve this version. Pin the approved version separately in campaign settings.":
    "Отмеченные утверждения станут каноном только после утверждения версии. Закрепите её отдельно в настройках кампании.",
  "Keep this claim uncertain until the owner resolves it.":
    "Оставить утверждение неопределённым до решения владельца.",
  "Ask to refine": "Попросить доработать",
  "Describe what to clarify or add": "Опишите, что уточнить или добавить",
  "For example: clarify the factions’ interests, preserve the unresolved border dispute, and identify missing geography.":
    "Например: уточни интересы фракций, сохрани нерешённый пограничный спор и укажи пробелы в географии.",
  "Refinement keeps your saved corrections and creates another unapproved version. Save or discard current edits first. Approval and campaign pins remain explicit.":
    "Доработка сохраняет ваши записанные исправления и создаёт новую неутверждённую версию. Сначала сохраните или отмените текущие правки. Утверждение и закрепление в кампании остаются явными.",
  "Prepare refinement job": "Подготовить задачу доработки",
  person: "человек",
  group: "группа",
  faction: "фракция",
  location: "место",
  object: "объект",
  institution: "организация",
  relationship: "связь",
  geography: "география",
  timeline: "хронология",
  rule: "правило",
  premise: "замысел",
  description: "описание",
};

export function worldAuthoringText(
  language: "en" | "ru",
  key: string,
  values: Record<string, string | number> = {},
) {
  let result =
    language === "ru"
      ? (WORLD_AUTHORING_RU[key] ?? worldLibraryText(language, key))
      : key;
  for (const [name, value] of Object.entries(values))
    result = result.replaceAll(`{${name}}`, String(value));
  return result;
}
