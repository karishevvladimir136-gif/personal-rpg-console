export function continuationText(language: "en" | "ru") {
  const en = {
    title: "Another path from a recorded moment",
    sourceSelection: "Choose a recorded starting point",
    settings: "Model settings",
    intro:
      "Inspect an exact recorded moment, then describe a new What If for one independent child experiment.",
    sourceRun: "Source experiment",
    checkpoint: "Recorded checkpoint",
    inspect: "Inspect checkpoint",
    inspecting: "Inspecting checkpoint…",
    empty: "Record an experiment checkpoint first.",
    recorded: "Exact recorded starting point",
    noEvents: "No public events are shown at this checkpoint.",
    choose: "Describe a child What If",
    whatIf: "What if…",
    placeholder: "What if the harbor patrol changed its plans at this moment?",
    model: "Child simulation model",
    reasoning: "Reasoning effort",
    interpret: "Interpret child What If",
    cost: "Interpret sends one request to the selected model and may incur provider charges. Inspection and approval make no simulation request.",
    sourceHelp:
      "The child keeps this exact starting point and remains NON-CANON. Review and approval prepare it; Start simulation is a separate action.",
    blocked:
      "This checkpoint needs a fresh supported starting point before a child can be prepared.",
    conflict:
      "The source experiment or its approved basis changed. Inspect and choose the checkpoint again before making a new proposal.",
    connection:
      "The continuation is unavailable. Your saved proposal and pending request remain recoverable.",
    validation: "Check the selected checkpoint, model and review fields.",
    pending:
      "The last result is uncertain. Retry that same request to recover its recorded result.",
    retry: "Retry saved request",
    refresh: "Refresh proposals",
    saving: "Saving child proposal…",
    saved: "Child proposal saved for review.",
    prepared:
      "Child experiment prepared. Choose Start simulation when you are ready.",
    drafts: "Child proposals at this checkpoint",
    newProposal: "Describe another child What If",
    review: "Review child What If",
    retryInterpret: "Retry interpretation",
    requested: "The premise is saved. Its interpretation is still pending.",
    nonCanon: "NON-CANON",
  };
  const ru: typeof en = {
    title: "Другой путь из сохранённого момента",
    sourceSelection: "Выбрать сохранённую отправную точку",
    settings: "Настройки модели",
    intro:
      "Осмотрите точный сохранённый момент, затем опишите новое «Что если» для одного независимого дочернего эксперимента.",
    sourceRun: "Исходный эксперимент",
    checkpoint: "Сохранённая контрольная точка",
    inspect: "Осмотреть точку",
    inspecting: "Проверяем контрольную точку…",
    empty: "Сначала сохраните контрольную точку эксперимента.",
    recorded: "Точная сохранённая отправная точка",
    noEvents: "В этой точке нет доступных публичных событий.",
    choose: "Описать дочернее «Что если»",
    whatIf: "Что если…",
    placeholder: "Что если портовый патруль изменит планы в этот момент?",
    model: "Модель дочерней симуляции",
    reasoning: "Уровень рассуждения",
    interpret: "Интерпретировать дочернее «Что если»",
    cost: "Интерпретация отправляет один запрос выбранной модели и может оплачиваться провайдеру. Осмотр и одобрение не запускают симуляцию.",
    sourceHelp:
      "Дочерний эксперимент сохраняет эту точную отправную точку и остаётся НЕ КАНОН. Проверка и одобрение подготавливают его; запуск симуляции — отдельное действие.",
    blocked:
      "Для подготовки дочернего эксперимента нужна новая поддерживаемая отправная точка.",
    conflict:
      "Исходный эксперимент или его одобренная основа изменились. Снова осмотрите и выберите точку перед новым предложением.",
    connection:
      "Продолжение недоступно. Сохранённое предложение и ожидающий запрос можно восстановить.",
    validation: "Проверьте точку, модель и поля проверки.",
    pending:
      "Результат последнего запроса неизвестен. Повторите тот же запрос для восстановления сохранённого результата.",
    retry: "Повторить сохранённый запрос",
    refresh: "Обновить предложения",
    saving: "Сохраняем дочернее предложение…",
    saved: "Дочернее предложение сохранено для проверки.",
    prepared:
      "Дочерний эксперимент подготовлен. Выберите запуск симуляции, когда будете готовы.",
    drafts: "Дочерние предложения из этой точки",
    newProposal: "Описать ещё одно дочернее «Что если»",
    review: "Проверить дочернее «Что если»",
    retryInterpret: "Повторить интерпретацию",
    requested: "Замысел сохранён. Его интерпретация ещё ожидается.",
    nonCanon: "НЕ КАНОН",
  };
  return language === "ru" ? ru : en;
}
