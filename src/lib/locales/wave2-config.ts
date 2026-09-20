import type { Language } from "../i18n.ts";

const en = {
  aiTitle: "AI Providers / Models",
  aiIntro: "Choose the voice and reasoning behind your campaigns.",
  providers: "Provider availability",
  configured: "Configured · not tested",
  unavailable: "Unavailable",
  statusHelp:
    "Configuration status only. Opening these settings makes no AI requests.",
  globalDefault: "Application default",
  noDefault: "No available application default",
  setupTitle: "Set the application default",
  setupIntro:
    "The application reads its default from the server settings file.",
  setupSteps:
    "On the computer running this app, open .env.local, set OPENAI_API_KEY and OPENAI_DM_MODEL, then restart the app. OPENAI_DM_REASONING is optional. Refresh this panel to check the configuration.",
  campaignHint:
    "Campaigns inherit this default unless you choose a campaign model or a task override below.",
  supported: "Available model choices",
  reasoning: "Reasoning effort",
  modelDefault: "Model default",
  model: "Model",
  refresh: "Refresh saved settings",
  loading: "Loading AI and world settings…",
  loadError: "Settings could not be loaded. Try again.",
  retryLoad: "Retry loading",
  campaignTitle: "AI, World & Rules",
  campaignIntro: "Set how this world continues and how its DM responds.",
  campaignModel: "Campaign model",
  inheritGlobal: "Inherit application default",
  inheritCampaign: "Inherit campaign model",
  inheritedGlobal: "Uses application default",
  inheritedCampaign: "Uses campaign model",
  explicit: "Explicit task choice",
  noFallback:
    "An unavailable selection pauses the request. It is never silently replaced with another model.",
  overrides: "Task model overrides",
  overridesHelp:
    "Leave tasks inherited to use one campaign model. An override changes only its named task.",
  plan: "DM planning",
  narrate: "DM narration",
  feedback: "DM feedback",
  summary: "Memory summaries",
  resolve: "World reasoning",
  historyHelp:
    "New choices apply to future actions. Pending actions keep their saved models, checks and results.",
  worldTitle: "Living world",
  simulation: "World simulation",
  on: "On",
  off: "Off",
  simulationHelp:
    "Advance background events as in-world time and meaningful actions progress. Turning this off does not accumulate a backlog.",
  autonomy: "World autonomy",
  low: "Low",
  moderate: "Moderate",
  high: "High",
  autonomyHelp:
    "How broadly the world develops beyond the current scene when simulation is on.",
  deadline: "Deadline pressure",
  critical: "Critical only",
  normal: "Normal",
  deadlineHelp:
    "Off prevents time from expiring quests and world threads. Critical only allows established scenario-critical deadlines. Immediate consequences of your actions can still resolve.",
  rulesTitle: "Rules profile",
  basic: "Console Basic · house rules",
  logic: "World Logic",
  basicHelp:
    "Use the existing character resources, inventory mechanics and server-rolled checks.",
  logicHelp:
    "Use supported narrative actions grounded in this world's capabilities and constraints. Actions needing unsupported mechanics pause for review.",
  boundaryHelp:
    "Finish or cancel an unfinished action in Game before changing these settings. Existing history stays intact.",
  save: "Save AI, world & rules",
  saving: "Saving…",
  retry: "Retry the same save",
  saved: "Settings saved.",
  dirty: "Unsaved changes",
  idle: "Changes take effect after Save.",
  useSaved: "Use saved values",
  discard: "Discard your unsaved changes?",
  scopeChanged:
    "The active timeline changed. Your draft is retained. Refresh, then use saved values to review this timeline before saving.",
  changed:
    "The saved state changed. Your draft is retained. Refresh and use saved values before editing again.",
  conflict:
    "This campaign changed or has an unfinished action. Open Game to finish, review or cancel the action, then refresh these settings and review your draft.",
  uncertain:
    "The save could not be confirmed. Your exact request is retained. Retry the same save before editing or starting another.",
  invalid:
    "These choices could not be applied. Review the selected models and rules, then try again.",
  signIn: "Please sign in again. Your draft is retained.",
  forbidden: "Only the configured owner can change these settings.",
  unavailableChoice: "Saved selection unavailable",
  reviewGame: "Review unfinished action in Game",
  worldManaged: "World autonomy is managed in AI, World & Rules below.",
  logicManaged:
    "World Logic is selected. Its supported narrative actions use world constraints; the house-rule difficulty and dice controls are retained for Console Basic.",
  providerDefault: "Provider default",
  savedRefresh:
    "Settings were saved, but the campaign view could not refresh. Refresh saved settings before continuing.",
};
const ru: Record<keyof typeof en, string> = {
  aiTitle: "ИИ: провайдеры и модели",
  aiIntro: "Выберите модели, которые ведут и осмысляют ваши кампании.",
  providers: "Доступность провайдеров",
  configured: "Настроено · не проверено",
  unavailable: "Недоступно",
  statusHelp:
    "Показано состояние настроек. Открытие этой страницы не отправляет запросы к ИИ.",
  globalDefault: "Модель приложения по умолчанию",
  noDefault: "Доступная модель по умолчанию не задана",
  setupTitle: "Настройка модели приложения",
  setupIntro:
    "Приложение читает модель по умолчанию из файла настроек сервера.",
  setupSteps:
    "На компьютере, где запущено приложение, откройте .env.local, задайте OPENAI_API_KEY и OPENAI_DM_MODEL, затем перезапустите приложение. OPENAI_DM_REASONING необязателен. Обновите эту панель, чтобы проверить настройки.",
  campaignHint:
    "Кампании наследуют эту модель, пока вы не выберете другую модель кампании или отдельной задачи.",
  supported: "Доступные варианты моделей",
  reasoning: "Глубина рассуждений",
  modelDefault: "По умолчанию для модели",
  model: "Модель",
  refresh: "Обновить сохранённые настройки",
  loading: "Загрузка настроек ИИ и мира…",
  loadError: "Не удалось загрузить настройки. Попробуйте ещё раз.",
  retryLoad: "Повторить загрузку",
  campaignTitle: "ИИ, мир и правила",
  campaignIntro: "Настройте развитие мира и работу его ведущего.",
  campaignModel: "Модель кампании",
  inheritGlobal: "Наследовать модель приложения",
  inheritCampaign: "Наследовать модель кампании",
  inheritedGlobal: "Используется модель приложения",
  inheritedCampaign: "Используется модель кампании",
  explicit: "Отдельная модель задачи",
  noFallback:
    "Если выбранная модель недоступна, запрос приостанавливается. Приложение не подменяет её другой моделью.",
  overrides: "Модели отдельных задач",
  overridesHelp:
    "Оставьте наследование, чтобы все задачи использовали модель кампании. Отдельный выбор меняет только указанную задачу.",
  plan: "Планирование ведущего",
  narrate: "Повествование ведущего",
  feedback: "Обратная связь с ведущим",
  summary: "Сводки памяти",
  resolve: "Рассуждения о мире",
  historyHelp:
    "Новые настройки действуют для будущих действий. Незавершённые действия сохраняют свои модели, проверки и результаты.",
  worldTitle: "Живой мир",
  simulation: "Симуляция мира",
  on: "Вкл.",
  off: "Выкл.",
  simulationHelp:
    "Фоновые события развиваются с игровым временем и значимыми действиями. Когда симуляция выключена, отложенные события не накапливаются.",
  autonomy: "Автономность мира",
  low: "Низкая",
  moderate: "Умеренная",
  high: "Высокая",
  autonomyHelp:
    "Насколько широко развивается мир за пределами текущей сцены при включённой симуляции.",
  deadline: "Давление сроков",
  critical: "Только критические",
  normal: "Обычное",
  deadlineHelp:
    "В режиме «Выкл.» течение времени не закрывает задания и сюжетные линии. «Только критические» учитывает установленные ключевые сроки сценария. Непосредственные последствия ваших действий сохраняются.",
  rulesTitle: "Профиль правил",
  basic: "Console Basic · домашние правила",
  logic: "Логика мира",
  basicHelp:
    "Используются существующие ресурсы персонажей, механика инвентаря и серверные броски кубиков.",
  logicHelp:
    "Поддерживаемые повествовательные действия опираются на возможности и ограничения мира. Неподдерживаемая механика требует уточнения.",
  boundaryHelp:
    "Перед изменением настроек завершите или отмените незавершённое действие на странице «Игра». История сохраняется.",
  save: "Сохранить ИИ, мир и правила",
  saving: "Сохранение…",
  retry: "Повторить тот же запрос",
  saved: "Настройки сохранены.",
  dirty: "Есть несохранённые изменения",
  idle: "Изменения вступают в силу после сохранения.",
  useSaved: "Использовать сохранённое",
  discard: "Отменить несохранённые изменения?",
  scopeChanged:
    "Активная временная линия изменилась. Черновик сохранён. Обновите настройки, затем выберите сохранённые значения этой линии перед записью.",
  changed:
    "Сохранённое состояние изменилось. Черновик сохранён. Обновите настройки и выберите сохранённые значения перед редактированием.",
  conflict:
    "Кампания изменилась или содержит незавершённое действие. Откройте «Игру», завершите, проверьте или отмените действие, затем обновите настройки и проверьте черновик.",
  uncertain:
    "Подтверждение сохранения не получено. Точный запрос сохранён. Повторите его, прежде чем редактировать или начинать новый.",
  invalid:
    "Не удалось применить этот выбор. Проверьте модели и правила, затем повторите попытку.",
  signIn: "Войдите в приложение заново. Черновик сохранён.",
  forbidden: "Только настроенный владелец может менять эти параметры.",
  unavailableChoice: "Сохранённая модель недоступна",
  reviewGame: "Проверить незавершённое действие в «Игре»",
  worldManaged:
    "Автономность мира настраивается ниже, в разделе «ИИ, мир и правила».",
  logicManaged:
    "Выбрана «Логика мира». Повествовательные действия опираются на ограничения мира; параметры сложности и кубиков сохранены для Console Basic.",
  providerDefault: "По умолчанию у провайдера",
  savedRefresh:
    "Настройки сохранены, но представление кампании не обновилось. Обновите сохранённые настройки перед продолжением.",
};
export const wave2ConfigText = (language: Language) =>
  language === "ru" ? ru : en;
