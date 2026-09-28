import type { Language } from "../../lib/i18n.ts";
const en = {
  title: "Places of Belonging",
  subtitle: "Familiar places. Accumulating meaning.",
  reference: "Owner reference only",
  referenceHelp:
    "These are your reference notes, not new world facts. They do not change Canon, record a visit, begin a rest, or unlock storage. Like other campaign reference edits, saving may require World Lab experiments to be reviewed again.",
  newPlace: "Keep a place",
  places: "Your familiar places",
  empty:
    "Choose an existing known or visited place to keep its meaning and your return notes together.",
  noLocations:
    "No known places have been recorded yet. Continue playing or correct a location in Map before choosing a familiar place.",
  known: "Known",
  visited: "Visited",
  changed: "Location changed · review selection",
  review: "Review and reselect",
  edit: "Edit reference notes",
  editor: "A place to return to",
  location: "Existing campaign location",
  label: "Your name for this place",
  role: "Place in your story",
  belonging: "Why it feels like belonging",
  returnNote: "On returning · what changed?",
  historyNote: "History worth keeping",
  noteHelp:
    "Write only what you want to remember. A return note is a manual observation; it does not establish a visit or a consequence.",
  save: "Save reference notes",
  saving: "Saving…",
  saved: "Reference notes saved. Earlier versions remain available.",
  cancel: "Close editor",
  discard: "Discard unsaved notes and continue?",
  none: "No note recorded.",
  select: "Choose a place",
  history: "Note history",
  historyHelp:
    "Saved owner references, preserved as written. This is note history, not a visit log or a record of world changes.",
  historyEmpty: "No readable reference versions are available.",
  historyLoading: "Loading saved notes…",
  retry: "Retry",
  version: "Version",
  recorded: "Saved",
  close: "Close",
  context: "Known place",
  current: "Current public context",
  notCurrent:
    "This is not the recorded current location. No current scene is linked here.",
  noDescription: "No public description has been recorded.",
  unknownVisits: "A dated visit history has not been linked to this place.",
  unknownRelationships:
    "No relationship connections are recorded for this place.",
  stash: "Campaign shared stash",
  stashHelp:
    "These are existing campaign storage records. No location connection is recorded. Choosing a home grants no item access; normal camp rules still apply.",
  stashEmpty: "No shared stash has been recorded.",
  stale:
    "The place or active timeline changed after you opened these notes. Your draft is preserved. Review the current selection before saving.",
  documentChanged:
    "A newer note version is available. Close this draft and reopen the saved reference to review it.",
  reselect: "Use the current location record",
  reselectHelp:
    "Review the current public description below. Saving explicitly attaches your notes to this location revision.",
  refreshError:
    "The notes were saved, but campaign refresh failed. Reload to view the saved reference.",
  genericError:
    "The save could not be confirmed. Your draft is preserved; retry when ready.",
  invalid: "Check the selected place and note lengths before saving.",
  revision: "Location record",
  back: "Back to places",
  roles: {
    home: "Home",
    camp: "Camp",
    base: "Base",
    ship: "Ship",
    tavern: "Tavern",
    other: "Other",
  },
};
const ru: typeof en = {
  title: "Места, где мы свои",
  subtitle: "Знакомые места. Накопленный смысл.",
  reference: "Только личные справочные заметки",
  referenceHelp:
    "Это ваши справочные заметки, а не новые факты мира. Они не меняют канон, не отмечают посещение, не начинают отдых и не открывают доступ к хранилищу. Как и другие правки справочных записей кампании, сохранение может потребовать повторной проверки экспериментов World Lab.",
  newPlace: "Сохранить место",
  places: "Ваши знакомые места",
  empty:
    "Выберите известное или посещённое место, чтобы хранить рядом его значение для вас и заметки о возвращении.",
  noLocations:
    "Известных мест пока нет. Продолжите игру или исправьте место на карте, прежде чем выбирать знакомое место.",
  known: "Известно",
  visited: "Посещено",
  changed: "Место изменилось · проверьте выбор",
  review: "Проверить и выбрать заново",
  edit: "Изменить справочные заметки",
  editor: "Место для возвращения",
  location: "Существующее место кампании",
  label: "Ваше название этого места",
  role: "Роль в вашей истории",
  belonging: "Почему здесь чувствуешь себя своим",
  returnNote: "При возвращении · что изменилось?",
  historyNote: "История, которую стоит сохранить",
  noteHelp:
    "Запишите то, что хотите помнить. Заметка о возвращении — ваше наблюдение; она не устанавливает посещение или последствие.",
  save: "Сохранить справочные заметки",
  saving: "Сохранение…",
  saved: "Справочные заметки сохранены. Предыдущие версии доступны.",
  cancel: "Закрыть редактор",
  discard: "Отбросить несохранённые заметки и продолжить?",
  none: "Заметка не записана.",
  select: "Выберите место",
  history: "История заметок",
  historyHelp:
    "Ваши сохранённые справочные записи в исходном виде. Это история заметок, а не журнал посещений или изменений мира.",
  historyEmpty: "Доступных справочных версий нет.",
  historyLoading: "Загрузка сохранённых заметок…",
  retry: "Повторить",
  version: "Версия",
  recorded: "Сохранено",
  close: "Закрыть",
  context: "Известное место",
  current: "Текущий открытый контекст",
  notCurrent:
    "Это не текущее место в сохранённом состоянии. Текущая сцена с ним не связана.",
  noDescription: "Открытое описание пока не записано.",
  unknownVisits: "История посещений с датами с этим местом не связана.",
  unknownRelationships: "Связи с персонажами для этого места не записаны.",
  stash: "Общий тайник кампании",
  stashHelp:
    "Это существующие хранилища кампании. Связь с местом не записана. Выбор дома не даёт доступа к предметам; действуют обычные правила лагеря.",
  stashEmpty: "Общий тайник пока не записан.",
  stale:
    "Место или активная временная линия изменились после открытия заметок. Ваш черновик сохранён. Проверьте текущий выбор перед сохранением.",
  documentChanged:
    "Доступна новая версия заметок. Закройте черновик и снова откройте сохранённую запись для проверки.",
  reselect: "Использовать текущую запись места",
  reselectHelp:
    "Проверьте текущее открытое описание ниже. Сохранение явно свяжет ваши заметки с этой версией места.",
  refreshError:
    "Заметки сохранены, но обновить кампанию не удалось. Перезагрузите страницу, чтобы увидеть сохранённую запись.",
  genericError:
    "Сохранение не подтверждено. Ваш черновик сохранён; повторите попытку, когда будете готовы.",
  invalid: "Проверьте выбранное место и длину заметок перед сохранением.",
  revision: "Запись места",
  back: "Вернуться к местам",
  roles: {
    home: "Дом",
    camp: "Лагерь",
    base: "База",
    ship: "Корабль",
    tavern: "Таверна",
    other: "Другое",
  },
};
export function belongingText(language: Language) {
  return language === "ru" ? ru : en;
}
