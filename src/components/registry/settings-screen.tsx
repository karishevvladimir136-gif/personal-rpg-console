"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import type { CampaignSnapshot } from "@/lib/persistence/contracts";
import { checkFrequencyOptions, dicePresentationOptions, effectiveDmStyle } from "@/lib/campaign-settings";
import { dmTurnModels, saveDmSettings, type DmSettings } from "@/lib/gameplay/dm-settings-client";
import { dmLoopLimits } from "@/lib/gameplay/dm-loop/limits";
import { readJson } from "@/lib/persistence/client";
import { FAL_IMAGE_MODELS, usd } from "@/lib/visual-frame/fal-image";
import { workshopJobs, type AutopilotSettings } from "@/lib/ui/visual-autopilot";
import { effortLabel } from "@/lib/ui/effort";
import { useChrome, useDmSettings, type CampaignScreenId } from "./shell";
import { useAutopilot } from "./visual-autopilot";
import { LaterLine, Panel, Plate, registry as r, Segmented, Switch, useCopy, useSubjectImage, type SubjectRef } from "./primitives";
import s from "./settings.module.css";

type ProviderInfo = { fal: { configured: boolean; persistence: boolean } } | null;

export function RegistrySettings({ data, more, preview }: {
  data: CampaignSnapshot;
  /** All earlier campaign settings, kept under "More". */
  more?: ReactNode;
  preview?: { providers: ProviderInfo };
}) {
  const c = useCopy();
  const chrome = useChrome();
  const loaded = useDmSettings(data.campaign.id);
  const [dm, setDm] = useState<DmSettings | null>(null);
  const current = dm ?? loaded;
  const [model, setModel] = useState<string | null>(null);
  const [effort, setEffort] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [providers, setProviders] = useState<ProviderInfo>(preview?.providers ?? null);
  const autopilot = useAutopilot();
  useEffect(() => {
    if (preview) return;
    readJson<NonNullable<ProviderInfo>>(`/api/visual-frame?action=image-providers&campaignId=${encodeURIComponent(data.campaign.id)}`)
      .then(setProviders, () => setProviders(null));
  }, [data.campaign.id, preview]);
  const href = (screen: CampaignScreenId) => chrome?.href?.(screen) ?? `/campaigns/${encodeURIComponent(data.campaign.id)}/${screen}`;
  const chosenModel = model ?? (current?.dmTurn ? current.dmTurn.modelId : null);
  const entry = dmTurnModels.find((row) => row.modelId === chosenModel) ?? null;
  // Without a saved choice the effort is the selected model's own default, as the server resolves it.
  const chosenEffort = effort ?? current?.dmTurn?.reasoning ?? entry?.defaultEffort ?? "";
  const save = async (next: { runtime?: DmSettings["runtime"]; modelId?: string | null; reasoning?: string }) => {
    if (!current || saving || chrome?.href) return;
    setSaving(true);
    setError("");
    try {
      const target = dmTurnModels.find((row) => row.modelId === (next.modelId === undefined ? chosenModel : next.modelId)) ?? null;
      const saved = await saveDmSettings(data.campaign.id, {
        expectedRevision: current.revision,
        runtime: next.runtime ?? current.runtime,
        dmTurn: target ? { providerId: target.providerId, modelId: target.modelId, reasoning: next.reasoning ?? chosenEffort } : null,
      });
      setDm(saved);
      setModel(null);
      setEffort(null);
    } catch {
      setError(c("Не удалось сохранить. Проверь соединение и попробуй ещё раз.", "Could not save. Check the connection and try again."));
    } finally {
      setSaving(false);
    }
  };
  const settings = data.settings.values;
  const style = effectiveDmStyle(settings);
  const toneLabel = { hopeful_humanist: c("Надежда", "Hope"), balanced: c("Поровну света и тьмы", "Balanced"), bleak: c("Мрачно", "Bleak") }[style.emotionalTone];
  const frequency = checkFrequencyOptions.find((row) => row.value === settings.checkFrequency);
  const dice = dicePresentationOptions.find((row) => row.value === settings.dicePresentation);
  const samples = [...data.entities.map((row) => ({ kind: "entity" as const, id: row.id, name: row.name })), ...data.locations.map((row) => ({ kind: "location" as const, id: row.id, name: row.name }))];
  const jobs = workshopJobs(data).slice(0, 8);
  const statusLabel = (status: string) => ({
    queued: c("в очереди", "queued"), generating: c("рисуется", "drawing"), draft: c("ждёт решения", "awaiting decision"),
    completed: c("готово", "done"), failed: c("не вышло", "failed"), cancelled: c("отменено", "cancelled"),
    uncertain: c("неясно, проверь", "uncertain"), discarded: c("отклонено", "discarded"),
  } as Record<string, string>)[status] ?? status;
  const set = (patch: Partial<AutopilotSettings>) => autopilot && autopilot.save({ ...autopilot.settings, ...patch });
  return (
    <div className={s.page}>
      <Plate eyebrow={c(`Кампания «${data.campaign.title}» · настройки этой кампании`, `Campaign “${data.campaign.title}” · settings of this campaign`)}
        title={c("Ведущий и картинки", "Game Master and pictures")} sub={c("Ключи хранятся только у тебя на компьютере", "Keys stay on your own computer")} />
      <div className={s.columns}>
        <div className={s.column}>
          <Panel eyebrow={c("Кто ведёт игру", "Who runs the game")}>
            <div className={r.stack}>
              <div className={r.choices}>
                {dmTurnModels.map((row) => (
                  <button key={row.modelId} type="button" className={r.choice} aria-pressed={chosenModel === row.modelId} disabled={saving || !current}
                    onClick={() => void save({ modelId: row.modelId })}>
                    <span className={r.eyebrow}>{row.providerId === "anthropic" ? "Anthropic" : "OpenAI"}</span>
                    <span className={r.choiceTitle}>{row.label}</span>
                  </button>
                ))}
              </div>
              {!chosenModel && current && <p className={r.note}>{c("Сейчас: модель по умолчанию из общих настроек.", "Now: the default model from the general settings.")}</p>}
              {entry && (
                <div className={r.stack} style={{ gap: 6 }}>
                  <span className={r.eyebrow}>{c("Глубина размышлений", "Reasoning effort")}</span>
                  <Segmented label={c("Глубина", "Effort")} value={chosenEffort} disabled={saving}
                    options={entry.efforts.map((value) => ({ value, label: effortLabel(value, c.language) }))}
                    onChange={(value) => { setEffort(value); void save({ reasoning: value }); }} />
                </div>
              )}
              <div className={s.runtime}>
                <span>{current?.runtime === "astra-primary-v1"
                  ? c("Кампания играет на прежнем ходе Astra.", "This campaign plays on the previous Astra turn.")
                  : c("Новый ход: ведущий пишет свободно и меняет мир через проверенные инструменты.", "New turn loop: the DM writes freely and changes the world through checked tools.")}</span>
                {current?.runtime === "astra-primary-v1" && (
                  <button type="button" className={r.btnMain} disabled={saving} onClick={() => void save({ runtime: "dm-loop-v1" })}>{c("Перевести на новый ход", "Switch to the new turn")}</button>
                )}
              </div>
              {error && <p className={r.error} role="alert">{error}</p>}
              <p className={r.note}>{c("Модель можно сменить посреди кампании: память, мир и квитанции общие. Новый ведущий продолжит с того же места; ход, который уже идёт, доиграет прежний.", "You can switch models mid-campaign: memory, world and receipts are shared. The new DM continues from the same place; a turn in progress finishes with the previous one.")}</p>
              <LaterLine>{c("Сводка последних ходов и записка «что мне нравится» появятся, когда приложение начнёт их отдавать.", "A summary of recent turns and the “what I enjoy” note appear once the app provides them.")}</LaterLine>
            </div>
          </Panel>
          <Panel eyebrow={c("Как ведущий работает", "How the DM works")}>
            <div className={r.stack}>
              <div>
                <span className={r.eyebrow}>{c("Рассказчик", "Narrator")}</span>
                <Segmented label={c("Рассказчик", "Narrator")} value="single" onChange={() => {}}
                  options={[{ value: "single", label: c("Один ведущий", "One DM") }, { value: "two", label: c("Два этапа · позже", "Two stages · later"), disabled: true }]} />
              </div>
              <div className={r.kv}>
                <div><span>{c("Тон истории", "Story tone")}</span><span>{toneLabel}</span></div>
                <div><span>{c("Как часто броски", "How often checks")}</span><span>{frequency ? c.t(frequency.label) : settings.checkFrequency}</span></div>
                <div><span>{c("Показ бросков", "Showing rolls")}</span><span>{dice ? c.t(dice.label) : settings.dicePresentation}</span></div>
                <div><span>{c("Важные броски кидаю я", "I roll important checks")}</span><span>{settings.interactiveDice ? c("да", "yes") : c("нет", "no")}</span></div>
              </div>
              <a className={r.btnGhost} href="#more-settings">{c("Изменить в полных настройках", "Change in the full settings")}</a>
            </div>
          </Panel>
          <Panel eyebrow={c("Правила и пределы кампании", "Rules and campaign limits")}>
            <div className={r.stack}>
              <div className={r.row}>
                <span className={r.muted}>{c("Правила:", "Rules:")}</span>
                <span className={r.chip}>{settings.rulesSystem.label}</span>
                <Link className={r.btnGhost} href={href("library")}>{c("Книги правил в библиотеке", "Rule books in the library")}</Link>
              </div>
              <p className={r.note}>{c("Правила — это знания ведущего, а не код. Подойдёт любая система.", "Rules are the DM's knowledge, not code. Any system works.")}</p>
              <div className={r.kv}>
                <div><span>{c("Запросов к модели за ход", "Model requests per turn")}</span><span>{dmLoopLimits.maxModelRequests}</span></div>
                <div><span>{c("Действий за ход", "Actions per turn")}</span><span>{dmLoopLimits.maxToolCalls}</span></div>
                <div><span>{c("Денег за одно действие", "Money per action")}</span><span>{dmLoopLimits.maxMoneyPerCall.toLocaleString(c.language)}</span></div>
                <div><span>{c("Предметов в стопке", "Items per stack")}</span><span>{dmLoopLimits.maxItemQuantity.toLocaleString(c.language)}</span></div>
              </div>
              <p className={r.note}>{c("Пределы пока только для чтения; их можно будет менять после этапа 3.", "Limits are read-only for now; they become editable after stage 3.")}</p>
            </div>
          </Panel>
        </div>
        <div className={s.column}>
          <Panel eyebrow={c("Картинки", "Pictures")} action={providers?.fal.configured ? <span className={r.badgeGreen}>fal · {c("ключ есть", "key set")}</span> : <span className={r.badgeIron}>fal · {c("нет ключа", "no key")}</span>}>
            <div className={r.stack}>
              <div>
                <span className={r.eyebrow}>{c("Кто рисует", "Who draws")}</span>
                <Segmented label={c("Поставщик картинок", "Image provider")} value={autopilot?.settings.provider ?? "openai"} onChange={(value) => set({ provider: value })}
                  options={[{ value: "fal", label: "fal" }, { value: "openai", label: "OpenAI" }]} />
              </div>
              {(autopilot?.settings.provider ?? "openai") === "fal" && (
                <div className={r.stack} style={{ gap: 6 }}>
                  {FAL_IMAGE_MODELS.map((row) => (
                    <div key={row.id} className={s.model}>
                      <b>{row.label}</b><span className={r.num}>{usd(row.firstMegapixelUsdMicros)} / {c("картинка 1 Мп", "1 MP image")}</span>
                      <span className={r.note}>{c(row.note.ru, row.note.en)}</span>
                    </div>
                  ))}
                  <p className={r.note}>{c("Сохранение картинок от fal заработает после обновления базы (этап 3/4): сейчас база принимает только задания OpenAI.", "Saving fal pictures starts after the database update (stage 3/4): today the database accepts OpenAI jobs only.")}</p>
                </div>
              )}
              <Switch title={c("Рисовать само", "Draw automatically")} hint={c("После хода, в фоне. Ход никогда не ждёт картинку.", "After a turn, in the background. A turn never waits for a picture.")}
                checked={!!autopilot?.settings.enabled} disabled={!autopilot} onChange={(value) => set({ enabled: value })} />
              <Switch title={c("Новые предметы", "New items")} hint={c("Одна картинка на вид предмета", "One picture per item type")} checked={!!autopilot?.settings.items} disabled={!autopilot?.settings.enabled} onChange={(value) => set({ items: value })} />
              <Switch title={c("Портреты героя и спутников", "Hero and companion portraits")} hint={c("Прохожим — по кнопке «Нарисовать»", "Others by the Draw button")} checked={!!autopilot?.settings.portraits} disabled={!autopilot?.settings.enabled} onChange={(value) => set({ portraits: value })} />
              <Switch title={c("Посещённые места", "Visited places")} checked={!!autopilot?.settings.places} disabled={!autopilot?.settings.enabled} onChange={(value) => set({ places: value })} />
              <Switch title={c("Транспорт и ездовые", "Transport and mounts")} checked={!!autopilot?.settings.holdings} disabled={!autopilot?.settings.enabled} onChange={(value) => set({ holdings: value })} />
              <Switch title={c("Принимать готовые сразу", "Keep finished pictures at once")} hint={c("Только если проверка не нашла замечаний; иначе картинка ждёт твоего решения", "Only when the check raised no warning; otherwise it waits for you")} checked={!!autopilot?.settings.autoAccept} disabled={!autopilot?.settings.enabled} onChange={(value) => set({ autoAccept: value })} />
              <label className={s.cap}>
                <span>{c("Лимит в день", "Daily limit")}</span>
                <input type="number" min={0} max={200} value={autopilot?.settings.dailyCap ?? 20} disabled={!autopilot}
                  onChange={(event) => set({ dailyCap: Math.max(0, Math.min(200, Number(event.target.value) || 0)) })} />
              </label>
              <div className={r.gauge}>
                <div className={r.gaugeTop}><span>{c("Сегодня нарисовано", "Drawn today")}</span><span className={r.num}>{autopilot?.ledger.count ?? 0} / {autopilot?.settings.dailyCap ?? 20}</span></div>
                <div className={r.tubeThin}><i className={r.tubeFill} style={{ width: `${Math.min(100, Math.round(((autopilot?.ledger.count ?? 0) / Math.max(1, autopilot?.settings.dailyCap ?? 20)) * 100))}%` }} /></div>
              </div>
              <p className={r.note}>{autopilotStatusText(autopilot?.status, c)}</p>
              <p className={r.note}>{c("Настройки автокартинок пока хранятся на этом устройстве; в кампанию они переедут вместе с этапом 3.", "Auto-picture settings live on this device for now; they move into the campaign with stage 3.")}</p>
            </div>
          </Panel>
          <Panel eyebrow={c("Стиль мира · визуальная библия", "World style · Visual Bible")} action={<Link className={r.small} href={href("frame")} style={{ color: "var(--brass)" }}>{c("Изменить", "Edit")}</Link>}>
            <div className={r.stack}>
              <p style={{ margin: 0 }}>{settings.visualStyle || c("Стиль пока не задан.", "No style set yet.")}</p>
              <div className={s.samples}>
                {samples.map((row) => <SampleThumb key={row.id} subject={row} name={c(`образец: ${row.name}`, `sample: ${row.name}`)} />)}
              </div>
            </div>
          </Panel>
          <Panel eyebrow={c("Мастерская художника", "Artist's workshop")}>
            {jobs.length ? (
              <div className={r.roster}>
                {jobs.map((job) => (
                  <div key={job.id}>
                    <span className={r.badge}>{statusLabel(job.status)}</span>
                    <span>{job.name}</span>
                    <span className={`${r.small} ${r.muted}`}>{job.review === "review_warning" ? c("есть замечание", "has a warning") : ""}</span>
                  </div>
                ))}
              </div>
            ) : <p className={r.empty}>{c("Заданий художнику пока не было.", "No picture jobs yet.")}</p>}
            <p className={r.note}>{c("Ход никогда не ждёт картинку. При перерисовке старая версия остаётся, пока новая не готова; прошлые версии сохраняются.", "A turn never waits for a picture. When redrawing, the old version stays until the new one is ready; earlier versions are kept.")}</p>
          </Panel>
        </div>
      </div>
      {more && (
        <details id="more-settings" className={s.more}>
          <summary>{c("Ещё · все прежние настройки кампании", "More · all earlier campaign settings")}</summary>
          {more}
        </details>
      )}
    </div>
  );
}

function autopilotStatusText(status: string | undefined, c: ReturnType<typeof useCopy>) {
  switch (status) {
    case "working": return c("Рисую следующую картинку…", "Drawing the next picture…");
    case "idle": return c("Всё нарисовано; жду новых предметов, мест и людей.", "All caught up; waiting for new items, places and people.");
    case "cap_reached": return c("Дневной лимит исчерпан. Картинку можно заказать вручную.", "Daily limit reached. You can still order a picture by hand.");
    case "not_configured": return c("Рисование не настроено на сервере (нет модели или бюджета).", "Picture generation is not set up on the server (no model or budget).");
    case "fal_pending": return c("fal выбран: автокартинки начнут сохраняться после обновления базы.", "fal selected: auto pictures start saving after the database update.");
    case "error": return c("Последняя попытка не удалась; повтора не будет — закажи вручную.", "The last attempt failed; it will not repeat — order by hand.");
    default: return c("Автокартинки выключены.", "Auto pictures are off.");
  }
}

/** An accepted picture of the campaign, shown as a style sample; nothing when there is none. */
function SampleThumb({ subject, name }: { subject: SubjectRef; name: string }) {
  const image = useSubjectImage(subject);
  // eslint-disable-next-line @next/next/no-img-element
  return image.url ? <img src={image.url} alt={name} /> : null;
}
