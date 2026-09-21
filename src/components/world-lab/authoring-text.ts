export function authoringText(language: "en" | "ru") {
  const en = {
    whatIf: "What if…",
    placeholder: "What if the harbor commander kept the eastern gate open?",
    introduction:
      "Describe one change. Review the interpretation before preparing an independent path through your world.",
    interpret: "Interpret What If",
    interpreting: "Interpreting your premise…",
    interpretCost:
      "Interpret sends one request to the selected model and may incur provider charges. It does not start a simulation.",
    base: "Starting checkpoint",
    model: "Simulation model",
    reasoning: "Reasoning effort",
    unavailable: "Unavailable",
    modelEmpty:
      "No compatible model is available. Configure a supported model in AI settings before interpreting.",
    noBase:
      "Create a manual save from a stable, configured World first. Finish any pending turn before saving. You can describe a new What If without an existing Scenario or Divergence.",
    drafts: "Your proposals",
    newProposal: "Describe another What If",
    revision: "Version",
    requested: "Interpretation pending",
    review: "Review proposed divergence",
    approved: "Approved & prepared",
    ownerEdited: "Owner corrections saved",
    original: "Original premise",
    savedBasis: "Starting point",
    scope: "A bounded simulation",
    scopeHelp:
      "Changes use existing actors and world threads, within supported consequences. Unsupported changes pause at a saved boundary. Your live campaign stays unchanged.",
    title: "Experiment name",
    change: "What changes",
    divergenceType: "Kind of change",
    timing: "When it changes",
    offset: "Minutes after the starting point",
    location: "Where",
    unspecified: "Not specified",
    actors: "Affected actors & factions",
    threads: "Affected world threads",
    player: "controlled by you",
    noActors: "No public actors are offered at this checkpoint.",
    noThreads: "No public active threads are offered at this checkpoint.",
    assumptions: "Proposed assumptions",
    constraints: "Constraints",
    baseline: "What stays unchanged",
    onePerLine:
      "One item per line. These are owner-reviewed branch assumptions, not new source facts.",
    horizon: "Explore ahead · minutes",
    horizonHelp:
      "1–43,200 minutes. Each explicit continuation advances at most an hour; a run has at most 32 steps.",
    ambiguities: "Resolve before approval",
    optional: "Optional clarification",
    answer: "Your answer or a narrower premise",
    ambiguityHelp:
      "Original questions remain in the record. Your answers are saved as owner-authored assumptions.",
    policy: "Saved World policy",
    policyHelp:
      "This sprint preserves the checkpoint’s simulation, autonomy and deadline policy. Change the live policy separately and save a new starting point if needed.",
    simulationOn: "Simulation enabled",
    autonomy: "Autonomy",
    deadlines: "Deadline pressure",
    save: "Save corrections",
    saving: "Saving…",
    approve: "Approve & Prepare",
    approvalHelp:
      "Approval saves immutable Scenario and Divergence versions and prepares the starting checkpoint. It makes no simulation request. Start is a separate action.",
    unsaved:
      "Save your corrections before approving. Approval always applies to the saved version.",
    saved: "Your correction is saved as a new unapproved version.",
    prepared:
      "Prepared. Choose Start simulation in the experiment below when you are ready.",
    evidence: "Original interpretation & source basis",
    evidenceHelp:
      "This immutable interpretation remains separate from your corrections. Source facts, inferences and assumptions are labelled separately. Future-source material is not automatic actor knowledge or an inevitable outcome.",
    noStatements:
      "No source statements were included; review the premise and owner assumptions.",
    uncertainty: "Uncertainty",
    knownBy: "Known by",
    selected: "Selected model",
    usage: "Recorded interpretation usage",
    inputTokens: "input tokens",
    outputTokens: "output tokens",
    loading: "Loading What If authoring…",
    refresh: "Refresh proposals",
    connection: "Authoring is unavailable. Refresh to recover saved proposals.",
    conflict:
      "The proposal or its saved inputs changed. Refresh and review before continuing.",
    validation:
      "Check the fields and choose only the offered starting point, model and affected choices.",
    authentication:
      "Your owner session is unavailable. Sign in again to continue.",
    pending:
      "The response was interrupted. This action may already be saved. Retry the same request to recover it; editing remains paused.",
    retry: "Retry the same request",
    retryInterpret: "Retry interpretation",
    retryHelp:
      "The premise and selected model were saved. Retry requests a valid interpretation and may incur provider charges if no result was recorded.",
    source_fact: "Source fact",
    source_inference: "Source inference",
    owner_assumption: "Owner assumption",
    source: "Source reference",
    canon_at_entry: "Canon at entry",
    character: "Actor knowledge",
    future_source: "Future-source knowledge",
    types: {
      circumstance: "Circumstance",
      actor_intent: "Autonomous actor intent",
      relationship: "Relationship · unsupported",
      resource: "Resource consequence",
      rule: "World rule · unsupported",
      other: "Other · requires narrower scope",
    },
    autonomyValues: { low: "Low", moderate: "Moderate", high: "High" },
    deadlineValues: {
      off: "Off",
      critical_only: "Critical only",
      normal: "Normal",
    },
    blockers: {
      interpretation_required:
        "A valid interpretation is needed before review.",
      ambiguity_unresolved:
        "Answer every consequential question before approval.",
      scope_required:
        "Choose a relevant existing actor or active world thread.",
      timing_outside_horizon:
        "The change must begin before the selected horizon.",
      player_agency:
        "An actor-intent change cannot choose a controlled player’s action.",
      unsupported_divergence:
        "This kind of change is not supported. Narrow the premise to a supported circumstance, autonomous intent or resource consequence.",
      unsupported_policy: "Restore the saved World policy before approval.",
    },
  };
  const ru: typeof en = {
    whatIf: "Что, если…",
    placeholder:
      "Что, если начальница гавани оставит восточные ворота открытыми?",
    introduction:
      "Опишите одно изменение. Проверьте предложенное толкование, прежде чем подготовить отдельный путь вашего мира.",
    interpret: "Разобрать «Что, если»",
    interpreting: "Разбираем вашу идею…",
    interpretCost:
      "Разбор отправляет один запрос выбранной модели и может быть платным у провайдера. Симуляция ещё не запускается.",
    base: "Начальная контрольная точка",
    model: "Модель симуляции",
    reasoning: "Глубина рассуждения",
    unavailable: "Недоступна",
    modelEmpty:
      "Совместимая модель недоступна. Перед разбором настройте поддерживаемую модель в настройках ИИ.",
    noBase:
      "Сначала создайте ручное сохранение стабильного настроенного мира. Завершите ожидающий ход. Для новой идеи не нужны заранее созданные сценарий и развилка.",
    drafts: "Ваши предложения",
    newProposal: "Описать новое «Что, если»",
    revision: "Версия",
    requested: "Ожидает разбора",
    review: "Проверьте предложенную развилку",
    approved: "Утверждено и подготовлено",
    ownerEdited: "Правки владельца сохранены",
    original: "Исходная идея",
    savedBasis: "Отправная точка",
    scope: "Симуляция в заданных пределах",
    scopeHelp:
      "Изменения используют существующих участников и линии мира в пределах поддерживаемых последствий. Неподдерживаемый шаг остановится у сохранённой точки. Текущая кампания не меняется.",
    title: "Название эксперимента",
    change: "Что меняется",
    divergenceType: "Вид изменения",
    timing: "Когда меняется",
    offset: "Минут после отправной точки",
    location: "Где",
    unspecified: "Не указано",
    actors: "Затронутые участники и фракции",
    threads: "Затронутые линии мира",
    player: "под вашим управлением",
    noActors: "В этой точке нет доступных открытых участников.",
    noThreads: "В этой точке нет доступных открытых активных линий мира.",
    assumptions: "Предложенные допущения",
    constraints: "Ограничения",
    baseline: "Что остаётся без изменений",
    onePerLine:
      "Один пункт на строку. Это утверждаемые владельцем допущения ветки, а не новые факты источника.",
    horizon: "Исследовать вперёд · минут",
    horizonHelp:
      "1–43 200 минут. Каждое явное продолжение продвигает время не более чем на час; всего до 32 шагов.",
    ambiguities: "Уточните перед утверждением",
    optional: "Необязательное уточнение",
    answer: "Ваш ответ или более узкая формулировка",
    ambiguityHelp:
      "Исходные вопросы остаются в истории. Ответы сохранятся как допущения владельца.",
    policy: "Сохранённая политика мира",
    policyHelp:
      "В этом этапе сохраняются симуляция, автономность и сроки из исходной точки. Для другой политики измените её в кампании и сделайте новое сохранение.",
    simulationOn: "Симуляция включена",
    autonomy: "Автономность",
    deadlines: "Давление сроков",
    save: "Сохранить правки",
    saving: "Сохраняем…",
    approve: "Утвердить и подготовить",
    approvalHelp:
      "Утверждение сохраняет неизменяемые версии сценария и развилки и готовит начальную точку. Запроса симуляции ещё нет. Запуск выполняется отдельно.",
    unsaved:
      "Сохраните правки перед утверждением. Утверждается только сохранённая версия.",
    saved: "Правка сохранена новой неутверждённой версией.",
    prepared:
      "Готово. Когда будете готовы, нажмите «Запустить симуляцию» в эксперименте ниже.",
    evidence: "Исходное толкование и источники",
    evidenceHelp:
      "Исходное толкование хранится отдельно от ваших правок. Факты, выводы и допущения отмечены отдельно. Будущие события источника не становятся автоматическим знанием участников или неизбежным исходом.",
    noStatements:
      "Утверждения из источников не включены; проверьте идею и допущения владельца.",
    uncertainty: "Неопределённость",
    knownBy: "Известно",
    selected: "Выбранная модель",
    usage: "Сохранённый расход разбора",
    inputTokens: "входных токенов",
    outputTokens: "выходных токенов",
    loading: "Загружаем предложения…",
    refresh: "Обновить предложения",
    connection:
      "Разбор недоступен. Обновите, чтобы восстановить сохранённые предложения.",
    conflict:
      "Предложение или исходные данные изменились. Обновите и проверьте их перед продолжением.",
    validation:
      "Проверьте поля и выберите только доступные исходную точку, модель и участников.",
    authentication:
      "Сеанс владельца недоступен. Войдите снова, чтобы продолжить.",
    pending:
      "Ответ был прерван. Действие уже могло сохраниться. Повторите тот же запрос для восстановления; правки пока приостановлены.",
    retry: "Повторить тот же запрос",
    retryInterpret: "Повторить разбор",
    retryHelp:
      "Идея и выбранная модель сохранены. Повтор запрашивает корректное толкование и может быть платным, если результат ещё не сохранён.",
    source_fact: "Факт источника",
    source_inference: "Вывод из источника",
    owner_assumption: "Допущение владельца",
    source: "Справка из источника",
    canon_at_entry: "Канон на момент входа",
    character: "Знание участника",
    future_source: "Будущее из источника",
    types: {
      circumstance: "Обстоятельство",
      actor_intent: "Намерение автономного участника",
      relationship: "Отношение · не поддерживается",
      resource: "Последствие для ресурса",
      rule: "Правило мира · не поддерживается",
      other: "Другое · уточните пределы",
    },
    autonomyValues: { low: "Низкая", moderate: "Умеренная", high: "Высокая" },
    deadlineValues: {
      off: "Выключено",
      critical_only: "Только критические",
      normal: "Обычное",
    },
    blockers: {
      interpretation_required: "Перед проверкой нужен корректный разбор.",
      ambiguity_unresolved:
        "Ответьте на все существенные вопросы перед утверждением.",
      scope_required:
        "Выберите существующего участника или активную линию мира.",
      timing_outside_horizon:
        "Изменение должно начаться раньше выбранного горизонта.",
      player_agency:
        "Намерение участника не может выбирать действие управляемого игроком персонажа.",
      unsupported_divergence:
        "Этот вид изменения пока не поддерживается. Уточните идею до поддерживаемого обстоятельства, автономного намерения или последствия для ресурса.",
      unsupported_policy:
        "Перед утверждением верните сохранённую политику мира.",
    },
  };
  return language === "ru" ? ru : en;
}
