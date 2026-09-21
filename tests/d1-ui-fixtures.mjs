export const uiId = (value) => `11111111-1111-4111-8111-${String(value).padStart(12, "0")}`;
export function labUiFixture(language = "en") {
  const ru = language === "ru";
  const base = { saveId: uiId(2), timelineId: uiId(3), label: ru ? "Тихая гавань" : "The quiet harbor", worldMinutes: 360 };
  const scenario = { scenarioVersionId: uiId(4), divergenceVersionId: uiId(5), scenarioTitle: ru ? "Побережье на рассвете" : "The coast at daybreak", divergenceTitle: ru ? "Ворота остаются открытыми" : "The gates stay open", assumptions: [ru ? "Совет ещё не объявил своё решение." : "The council has not announced its decision."], changes: [ru ? "Ворота гавани останутся открытыми." : "The harbor gates will remain open."] };
  const run = { id: uiId(6), campaignId: uiId(1), timelineId: uiId(7), label: ru ? "За открытыми воротами" : "Beyond the open gates", purpose: "simulation", nonCanon: true, status: "running", reason: null, revision: 3, base, scenario, startWorldMinutes: 360, throughWorldMinutes: 540, currentWorldMinutes: 420, checkpoints: [
    { id: uiId(8), ordinal: 0, worldMinutes: 360, summary: ru ? "Первые лучи солнца касаются тихой воды. Мир ждёт у порога другого пути." : "The first light catches the still water. The world waits at the threshold of another path.", events: [] },
    { id: uiId(9), ordinal: 1, worldMinutes: 420, summary: ru ? "В гавани начинается утро. Сохранённый шаг мира завершён." : "Morning begins in the harbor. The recorded world step is complete.", events: [{ id: uiId(10), worldMinutes: 400, text: ru ? "По набережной проходит дозор. У восточных ворот сменяется караул." : "A patrol crosses the waterfront. The watch changes at the eastern gate." }] },
  ] };
  return { campaignId: uiId(1), bases: [base], scenarios: [scenario], runs: [run] };
}
