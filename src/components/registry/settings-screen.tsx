"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import type { CampaignSnapshot } from "@/lib/persistence/contracts";
import type { PlaySnapshot } from "@/lib/gameplay/contracts";
import type { DossierView, NotebookView } from "@/lib/gameplay/dossier/contracts";
import { turnStatsOf } from "@/lib/ui/campaign-view";
import { EFFORT_ORDER } from "@/lib/gameplay/dm-loop/depth";
import { checkFrequencyOptions, dicePresentationOptions, effectiveDmStyle } from "@/lib/campaign-settings";
import { DM_LOOP_DEFAULT_LIMITS, DM_LOOP_LIMIT_CEILINGS, DM_LOOP_LIMIT_KEYS, dmTurnModels, saveDmSettings, type DmLoopTurnLimits, type DmSettings } from "@/lib/gameplay/dm-settings-client";
import { dmLoopLimits } from "@/lib/gameplay/dm-loop/limits";
import { readJson } from "@/lib/persistence/client";
import { FAL_IMAGE_MODELS, usd } from "@/lib/visual-frame/fal-image";
import { workshopJobs } from "@/lib/ui/visual-autopilot";
import { readImageAsDataUrl } from "@/lib/ui/pictures-client";
import { activeStyle, pictureCostUsdMicros, STYLE_PRESETS, stylePreset, styleTextFor, styleVersions, type PictureAutopilot, type PictureSettings, type PublicPicture } from "@/lib/visual-frame/pictures";
import { usePictures } from "./live-frames";
import { effortLabel } from "@/lib/ui/effort";
import { useChrome, useDmSettings, type CampaignScreenId } from "./shell";
import { useAutopilot } from "./visual-autopilot";
import { Panel, Plate, registry as r, Segmented, Switch, useCopy, useSubjectImage, type SubjectRef } from "./primitives";
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
  // The six per-turn limits (stage 3) as the owner edits them; null = nothing being edited.
  const [limitsDraft, setLimitsDraft] = useState<Record<keyof DmLoopTurnLimits, string> | null>(null);
  const [limitsError, setLimitsError] = useState("");
  // Stage 4: the player-likes note and the theme question (owner-editable), the
  // depth range, the notebook option, the last turns' numbers.
  const [dossier, setDossier] = useState<DossierView | null>(null);
  const [likesDraft, setLikesDraft] = useState<string | null>(null);
  const [themeDraft, setThemeDraft] = useState<string | null>(null);
  const [notebook, setNotebook] = useState<NotebookView | null>(null);
  const [play, setPlay] = useState<PlaySnapshot | null>(null);
  useEffect(() => {
    if (preview) return;
    const id = encodeURIComponent(data.campaign.id);
    readJson<DossierView>(`/api/campaigns/${id}/dossier`).then(setDossier, () => setDossier(null));
    readJson<PlaySnapshot>(`/api/campaigns/${id}/play`).then(setPlay, () => setPlay(null));
  }, [data.campaign.id, preview]);
  const notebookVisible = !preview && !!current?.notebookVisible;
  useEffect(() => {
    if (!notebookVisible) return;
    let live = true;
    readJson<NotebookView | null>(`/api/campaigns/${encodeURIComponent(data.campaign.id)}/dossier?view=notebook`)
      .then((value) => { if (live) setNotebook(value); }, () => { if (live) setNotebook(null); });
    return () => { live = false; };
  }, [data.campaign.id, notebookVisible]);
  const saveNote = async (action: "likes" | "theme", value: string) => {
    if (chrome?.href) return;
    try {
      const saved = await readJson<DossierView>(`/api/campaigns/${encodeURIComponent(data.campaign.id)}/dossier`, { method: "POST",
        headers: { "Content-Type": "application/json" }, body: JSON.stringify(action === "likes" ? { action, playerLikes: value } : { action, theme: value }) });
      setDossier(saved);
      if (action === "likes") setLikesDraft(null); else setThemeDraft(null);
    } catch { setError(c("Не удалось сохранить записку.", "Could not save the note.")); }
  };
  const saveDepth = async (patch: { depth?: { min: string; max: string } | null; notebookVisible?: boolean }) => {
    if (!current || saving || chrome?.href) return;
    setSaving(true);
    try {
      const saved = await saveDmSettings(data.campaign.id, { expectedRevision: current.revision, runtime: current.runtime, dmTurn: current.dmTurn,
        ...(patch.depth !== undefined ? { depth: patch.depth as DmSettings["depth"] } : {}), ...(patch.notebookVisible !== undefined ? { notebookVisible: patch.notebookVisible } : {}) });
      setDm(saved);
    } catch { setError(c("Не удалось сохранить. Проверь соединение и попробуй ещё раз.", "Could not save. Check the connection and try again.")); }
    finally { setSaving(false); }
  };
  const stats = play ? turnStatsOf(play.turns) : null;
  const likes = likesDraft ?? dossier?.playerLikes ?? data.campaign.player_likes ?? "";
  const theme = themeDraft ?? dossier?.theme ?? data.campaign.theme ?? "";
  const depthMin = current?.depth?.min ?? null;
  const depthMax = current?.depth?.max ?? null;
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
  const limitLabels: Record<keyof DmLoopTurnLimits, string> = {
    moneyPerTurn: c("Денег создаётся за ход", "Money created per turn"),
    itemsPerTurn: c("Новых предметов за ход", "Items created per turn"),
    charactersPerTurn: c("Новых персонажей за ход", "New characters per turn"),
    minutesPerTurn: c("Игровых минут за ход", "Game minutes per turn"),
    toolCallsPerTurn: c("Действий за ход", "Tool calls per turn"),
    modelRequestsPerTurn: c("Запросов к модели за ход", "Model requests per turn"),
  };
  const shownLimits = current?.limits ?? DM_LOOP_DEFAULT_LIMITS;
  const limitValue = (key: keyof DmLoopTurnLimits) => limitsDraft ? limitsDraft[key] : String(shownLimits[key]);
  const editLimit = (key: keyof DmLoopTurnLimits, value: string) => {
    const base = limitsDraft ?? Object.fromEntries(DM_LOOP_LIMIT_KEYS.map((k) => [k, String(shownLimits[k])])) as Record<keyof DmLoopTurnLimits, string>;
    setLimitsDraft({ ...base, [key]: value });
  };
  /** Saves the edited limits (or returns the campaign to the defaults) through the same settings API as the model. */
  const saveLimits = async (limits: DmLoopTurnLimits | null) => {
    if (!current || saving || chrome?.href) return;
    setSaving(true);
    setLimitsError("");
    try {
      const saved = await saveDmSettings(data.campaign.id, { expectedRevision: current.revision, runtime: current.runtime, dmTurn: current.dmTurn, limits });
      setDm(saved);
      setLimitsDraft(null);
    } catch {
      setLimitsError(c("Не удалось сохранить пределы. Проверь числа и соединение.", "Could not save the limits. Check the numbers and the connection."));
    } finally {
      setSaving(false);
    }
  };
  const submitLimits = () => {
    if (!limitsDraft) return;
    const parsed = {} as DmLoopTurnLimits;
    for (const key of DM_LOOP_LIMIT_KEYS) {
      const n = Number(limitsDraft[key]);
      const bound = DM_LOOP_LIMIT_CEILINGS[key];
      if (!Number.isInteger(n) || n < bound.min || n > bound.max) {
        setLimitsError(c(`«${limitLabels[key]}»: целое число от ${bound.min} до ${bound.max.toLocaleString(c.language)}.`, `“${limitLabels[key]}”: a whole number between ${bound.min} and ${bound.max.toLocaleString(c.language)}.`));
        return;
      }
      parsed[key] = n;
    }
    void saveLimits(parsed);
  };
  const settings = data.settings.values;
  const style = effectiveDmStyle(settings);
  const toneLabel = { hopeful_humanist: c("Надежда", "Hope"), balanced: c("Поровну света и тьмы", "Balanced"), bleak: c("Мрачно", "Bleak") }[style.emotionalTone];
  const frequency = checkFrequencyOptions.find((row) => row.value === settings.checkFrequency);
  const dice = dicePresentationOptions.find((row) => row.value === settings.dicePresentation);
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
              {entry && (
                <div className={r.stack} style={{ gap: 6 }}>
                  <span className={r.eyebrow}>{c("Глубина по сцене", "Depth per scene")}</span>
                  <p className={r.note} style={{ margin: 0 }}>{c("Диапазон: спокойные сцены идут по нижней границе, напряжённые и бой — по верхней. Без диапазона каждый ход идёт на выбранной выше глубине.", "A range: calm scenes run at the bottom, tense ones and combat at the top. Without a range every turn runs at the effort chosen above.")}</p>
                  <div className={r.row}>
                    <span className={r.muted}>{c("от", "from")}</span>
                    <Segmented label={c("Нижняя граница", "Lower bound")} value={depthMin ?? "off"} disabled={saving}
                      options={[{ value: "off", label: c("нет", "none") }, ...entry.efforts.map((value) => ({ value, label: effortLabel(value, c.language) }))]}
                      onChange={(value) => void saveDepth({ depth: value === "off" ? null : { min: value, max: depthMax && EFFORT_ORDER.indexOf(depthMax as never) >= EFFORT_ORDER.indexOf(value as never) ? depthMax : value } })} />
                    <span className={r.muted}>{c("до", "to")}</span>
                    <Segmented label={c("Верхняя граница", "Upper bound")} value={depthMax ?? "off"} disabled={saving || !depthMin}
                      options={[{ value: "off", label: c("нет", "none") }, ...entry.efforts.map((value) => ({ value, label: effortLabel(value, c.language) }))]}
                      onChange={(value) => void saveDepth({ depth: value === "off" || !depthMin ? null : { min: EFFORT_ORDER.indexOf(depthMin as never) <= EFFORT_ORDER.indexOf(value as never) ? depthMin : value, max: value } })} />
                  </div>
                </div>
              )}
              <div className={r.stack} style={{ gap: 6 }}>
                <span className={r.eyebrow}>{c("Последние ходы", "Recent turns")}</span>
                {stats ? (
                  <div className={r.kv}>
                    <div><span>{c("Ходов в сводке", "Turns counted")}</span><span>{stats.turns}</span></div>
                    <div><span>{c("Первые слова, медиана", "First words, median")}</span><span>{stats.medianFirstWordMs === null ? "–" : `${(stats.medianFirstWordMs / 1000).toFixed(1)} s`}</span></div>
                    <div><span>{c("Ход, медиана", "Turn, median")}</span><span>{`${(stats.medianTurnMs / 1000).toFixed(1)} s`}</span></div>
                    <div><span>{c("Цена хода, средняя", "Cost per turn, average")}</span><span>{`$${stats.avgCostUsd.toFixed(3)}`}</span></div>
                    <div><span>{c("Из кэша", "From cache")}</span><span>{stats.cacheReadShare === null ? "–" : `${Math.round(stats.cacheReadShare * 100)}%`}</span></div>
                    <div><span>{c("Отклонённых действий", "Rejected actions")}</span><span>{stats.rejectedCalls}</span></div>
                  </div>
                ) : <p className={r.note} style={{ margin: 0 }}>{c("Сводка появится после первых ходов на новом ходе.", "The summary appears after the first turns on the new loop.")}</p>}
              </div>
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
              <div className={r.stack} style={{ gap: 6 }}>
                <span className={r.eyebrow}>{c("Что мне нравится", "What I enjoy")}</span>
                <p className={r.note} style={{ margin: 0 }}>{c("Записка ведущего о том, что тебе нравится в игре. Её видишь ты, её пишет ведущий, и ты можешь поправить.", "The DM's note on what you enjoy in the game. You see it, the DM writes it, and you can correct it.")}</p>
                <textarea className={s.note} rows={3} value={likes} maxLength={2000} disabled={!!chrome?.href} aria-label={c("Что мне нравится", "What I enjoy")}
                  onChange={(event) => setLikesDraft(event.target.value)} />
                {likesDraft !== null && <div className={r.row}><button type="button" className={r.btnMain} onClick={() => void saveNote("likes", likesDraft)}>{c("Сохранить", "Save")}</button><button type="button" className={r.btnGhost} onClick={() => setLikesDraft(null)}>{c("Отмена", "Cancel")}</button></div>}
                <span className={r.eyebrow}>{c("Тема кампании (вопрос)", "Campaign theme (a question)")}</span>
                <input className={s.note} value={theme} maxLength={500} disabled={!!chrome?.href} aria-label={c("Тема кампании", "Campaign theme")}
                  placeholder={c("Например: что стоит верность, когда никто не смотрит?", "For example: what does loyalty cost when nobody is watching?")}
                  onChange={(event) => setThemeDraft(event.target.value)} />
                {themeDraft !== null && <div className={r.row}><button type="button" className={r.btnMain} onClick={() => void saveNote("theme", themeDraft)}>{c("Сохранить", "Save")}</button><button type="button" className={r.btnGhost} onClick={() => setThemeDraft(null)}>{c("Отмена", "Cancel")}</button></div>}
                <Switch title={c("Заглянуть в блокнот мастера", "Peek into the DM's notebook")} hint={c("Показывает заметки подготовки между сессиями. По умолчанию выключено.", "Shows the prep notes between sessions. Off by default.")}
                  checked={!!current?.notebookVisible} disabled={saving || !current || !!chrome?.href} onChange={(value) => void saveDepth({ notebookVisible: value })} />
                {current?.notebookVisible && (
                  <div className={r.stack} style={{ gap: 4 }}>
                    <span className={r.eyebrow}>{c("Блокнот мастера", "DM notebook")}</span>
                    {notebookVisible && notebook?.notebook ? <p className={r.note} style={{ margin: 0, whiteSpace: "pre-wrap" }}>{notebook.notebook}</p>
                      : <p className={r.note} style={{ margin: 0 }}>{c("Пока пусто: блокнот пишется после закрытия сессии.", "Empty so far: the notebook is written after a session closes.")}</p>}
                  </div>
                )}
              </div>
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
              <div className={r.stack} style={{ gap: 6 }}>
                <span className={r.eyebrow}>{c("Пределы одного хода", "Limits of one turn")}</span>
                {DM_LOOP_LIMIT_KEYS.map((key) => (
                  <label key={key} className={s.limit}>
                    <span>{limitLabels[key]}</span>
                    <input type="number" inputMode="numeric" min={DM_LOOP_LIMIT_CEILINGS[key].min} max={DM_LOOP_LIMIT_CEILINGS[key].max}
                      value={limitValue(key)} disabled={saving || !current || !!chrome?.href} aria-label={limitLabels[key]}
                      onChange={(event) => editLimit(key, event.target.value)} />
                  </label>
                ))}
                <div className={r.row}>
                  <button type="button" className={r.btnMain} disabled={saving || !limitsDraft} onClick={submitLimits}>{c("Сохранить пределы", "Save limits")}</button>
                  <button type="button" className={r.btnGhost} disabled={saving || !current || (!current.customLimits && !limitsDraft)} onClick={() => void saveLimits(null)}>{c("Вернуть по умолчанию", "Back to defaults")}</button>
                  {current?.customLimits && <span className={r.chip}>{c("свои пределы", "custom limits")}</span>}
                </div>
                {limitsError && <p className={r.error} role="alert">{limitsError}</p>}
              </div>
              <div className={r.kv}>
                <div><span>{c("Денег за одно действие", "Money per action")}</span><span>{dmLoopLimits.maxMoneyPerCall.toLocaleString(c.language)}</span></div>
                <div><span>{c("Предметов в стопке", "Items per stack")}</span><span>{dmLoopLimits.maxItemQuantity.toLocaleString(c.language)}</span></div>
                <div><span>{c("Бросков за ход", "Checks per turn")}</span><span>{dmLoopLimits.maxChecksPerTurn}</span></div>
              </div>
              <p className={r.note}>{c("Пределы — защита записей, а не правила игры: ход, который в них упёрся, не падает, а ведущий получает причину. Новые значения действуют со следующего хода.", "Limits protect the records, they are not game rules: a turn that hits one does not fail, the DM gets the reason. New values apply from the next turn.")}</p>
            </div>
          </Panel>
        </div>
        <div className={s.column}>
          <PicturesBlock data={data} providers={providers} />
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
    case "cap_reached": return c("Дневной лимит исчерпан. Картинку можно заказать вручную завтра или поднять лимит.", "Daily limit reached. Order by hand tomorrow or raise the limit.");
    case "not_configured": return c("Рисование не настроено на сервере (нет ключа, модели или бюджета).", "Picture generation is not set up on the server (no key, model or budget).");
    case "error": return c("Последняя попытка не удалась; повтора не будет — закажи вручную.", "The last attempt failed; it will not repeat — order by hand.");
    case "loading": return c("Загружаю настройки картинок…", "Loading the picture settings…");
    default: return c("Автокартинки выключены.", "Auto pictures are off.");
  }
}

/** An accepted picture of the campaign, shown as a style sample; nothing when there is none. */
function SampleThumb({ subject, name }: { subject: SubjectRef; name: string }) {
  const image = useSubjectImage(subject);
  // eslint-disable-next-line @next/next/no-img-element
  return image.url ? <img src={image.url} alt={name} /> : null;
}

/** The picture block: frames and the autopilot on the campaign's own settings, the world or
 * campaign style with versions and a reference image, the artist's workshop. */
function PicturesBlock({ data, providers }: { data: CampaignSnapshot; providers: ProviderInfo }) {
  const c = useCopy();
  const autopilot = useAutopilot();
  const pictures = usePictures();
  const board = pictures?.board ?? null;
  const settings = autopilot?.settings ?? null;
  const samples = [...data.entities.map((row) => ({ kind: "entity" as const, id: row.id, name: row.name })), ...data.locations.map((row) => ({ kind: "location" as const, id: row.id, name: row.name }))];
  const legacyJobs = workshopJobs(data).slice(0, 4);
  const set = (patch: Partial<PictureSettings>) => autopilot && void autopilot.save(patch);
  const setAuto = (patch: Partial<PictureAutopilot>) => autopilot && void autopilot.save({ autopilot: { ...autopilot.settings.autopilot, ...patch } });
  const disabled = !autopilot || autopilot.saving || autopilot.status === "loading";
  const framePrice = (tier: "fast" | "quality") => usd(pictureCostUsdMicros(tier, "frame"));
  const statusLabel = (status: string) => ({
    queued: c("в очереди", "queued"), generating: c("рисуется", "drawing"), ready: c("готово", "done"), failed: c("не вышло", "failed"),
    draft: c("ждёт решения", "awaiting decision"), completed: c("готово", "done"), cancelled: c("отменено", "cancelled"), uncertain: c("неясно, проверь", "uncertain"), discarded: c("отклонено", "discarded"),
  } as Record<string, string>)[status] ?? status;
  const subjectName = (row: PublicPicture) => row.subjectKind === "turn" ? c("кадр хода", "turn frame")
    : row.subjectKind === "entity" ? data.entities.find((entity) => entity.id === row.subjectId)?.name ?? "—"
    : row.subjectKind === "item" ? data.items.find((item) => item.id === row.subjectId)?.name ?? "—"
    : data.locations.find((location) => location.id === row.subjectId)?.name ?? "—";
  const recent = board ? [...board.pictures].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 8) : [];
  const todayCount = autopilot?.today.count ?? 0;
  const cap = settings?.dailyCap ?? 60;
  return (
    <>
      <Panel eyebrow={c("Картинки", "Pictures")} action={providers?.fal.configured ? <span className={r.badgeGreen}>fal · {c("ключ есть", "key set")}</span> : <span className={r.badgeIron}>fal · {c("нет ключа", "no key")}</span>}>
        <div className={r.stack}>
          <div>
            <span className={r.eyebrow}>{c("Живые кадры", "Live frames")}</span>
            <Segmented label={c("Кадры", "Frames")} value={settings?.frames ?? "every"} disabled={disabled} onChange={(value) => set({ frames: value })}
              options={[{ value: "every", label: c("На каждое действие", "Every action") }, { value: "key", label: c("Только ключевые", "Key moments only") }, { value: "off", label: c("Выкл", "Off") }]} />
            <p className={r.note}>{c("Кадр рисуется по первому абзацу, пока ведущий ещё пишет; в «Твой момент» и на развязке боя — перерисовка лучшей моделью.", "A frame is drawn from the first paragraph while the DM is still writing; on «Your moment» and a fight's end a better model redraws it.")}</p>
          </div>
          <div>
            <span className={r.eyebrow}>{c("Качество живых кадров", "Live frame quality")}</span>
            <Segmented label={c("Качество живых кадров", "Live frame quality")} value={settings?.quality ?? "fast"} disabled={disabled} onChange={(value) => set({ quality: value })}
              options={[{ value: "fast", label: c(`Быстро · ~4 с · ${framePrice("fast")}`, `Fast · ~4 s · ${framePrice("fast")}`) }, { value: "quality", label: c(`Лучше · ~16 с · ${framePrice("quality")}`, `Better · ~16 s · ${framePrice("quality")}`) }]} />
            <p className={r.note}>{c("Анкеры (портреты, места, вещи) и перерисовка ключевых моментов всегда идут на лучшей модели.", "Anchors (portraits, places, things) and key-moment re-renders always use the better model.")}</p>
          </div>
          <div>
            <span className={r.eyebrow}>{c("Кто рисует анкеры", "Who draws the anchors")}</span>
            <Segmented label={c("Поставщик картинок", "Image provider")} value={settings?.autopilot.provider ?? "fal"} disabled={disabled} onChange={(value) => setAuto({ provider: value })}
              options={[{ value: "fal", label: "fal" }, { value: "openai", label: "OpenAI" }]} />
            {(settings?.autopilot.provider ?? "fal") === "fal" && (
              <div className={r.stack} style={{ gap: 6, marginTop: 6 }}>
                {FAL_IMAGE_MODELS.map((row) => (
                  <div key={row.id} className={s.model}>
                    <b>{row.label}</b><span className={r.num}>{usd(row.firstMegapixelUsdMicros)} / {c("картинка 1 Мп", "1 MP image")}</span>
                    <span className={r.note}>{c(row.note.ru, row.note.en)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <Switch title={c("Рисовать само", "Draw automatically")} hint={c("После хода, в фоне. Ход никогда не ждёт картинку.", "After a turn, in the background. A turn never waits for a picture.")}
            checked={!!settings?.autopilot.enabled} disabled={disabled} onChange={(value) => setAuto({ enabled: value })} />
          <Switch title={c("Новые предметы", "New items")} hint={c("Одна картинка на вид предмета", "One picture per item type")} checked={!!settings?.autopilot.items} disabled={disabled || !settings?.autopilot.enabled} onChange={(value) => setAuto({ items: value })} />
          <Switch title={c("Портреты героя и спутников", "Hero and companion portraits")} hint={c("Прохожим — по кнопке «Нарисовать»", "Others by the Draw button")} checked={!!settings?.autopilot.portraits} disabled={disabled || !settings?.autopilot.enabled} onChange={(value) => setAuto({ portraits: value })} />
          <Switch title={c("Фигура героя в полный рост", "Hero's full-length figure")} hint={c("Рядом с портретом", "Beside the portrait")} checked={!!settings?.autopilot.figures} disabled={disabled || !settings?.autopilot.enabled || !settings?.autopilot.portraits} onChange={(value) => setAuto({ figures: value })} />
          <Switch title={c("Посещённые места", "Visited places")} checked={!!settings?.autopilot.places} disabled={disabled || !settings?.autopilot.enabled} onChange={(value) => setAuto({ places: value })} />
          <Switch title={c("Транспорт и ездовые", "Transport and mounts")} checked={!!settings?.autopilot.holdings} disabled={disabled || !settings?.autopilot.enabled} onChange={(value) => setAuto({ holdings: value })} />
          {settings?.autopilot.provider === "openai" && (
            <Switch title={c("Принимать готовые сразу", "Keep finished pictures at once")} hint={c("Только если проверка не нашла замечаний; иначе картинка ждёт твоего решения", "Only when the check raised no warning; otherwise it waits for you")} checked={!!settings?.autopilot.autoAccept} disabled={disabled || !settings?.autopilot.enabled} onChange={(value) => setAuto({ autoAccept: value })} />
          )}
          <label className={s.cap}>
            <span>{c("Лимит в день (кадры и анкеры вместе)", "Daily limit (frames and anchors together)")}</span>
            <input type="number" min={0} max={500} value={cap} disabled={disabled}
              onChange={(event) => set({ dailyCap: Math.max(0, Math.min(500, Number(event.target.value) || 0)) })} />
          </label>
          <div className={r.gauge}>
            <div className={r.gaugeTop}><span>{c("Сегодня нарисовано", "Drawn today")}</span><span className={r.num}>{todayCount} / {cap} · {usd(autopilot?.today.costUsdMicros ?? 0)}</span></div>
            <div className={r.tubeThin}><i className={r.tubeFill} style={{ width: `${Math.min(100, Math.round((todayCount / Math.max(1, cap)) * 100))}%` }} /></div>
          </div>
          <p className={r.note}>{autopilotStatusText(autopilot?.status, c)}</p>
        </div>
      </Panel>
      <StylePanel data={data} samples={samples} />
      <Panel eyebrow={c("Мастерская художника", "Artist's workshop")}>
        {recent.length || legacyJobs.length ? (
          <div className={r.roster}>
            {recent.map((row) => (
              <div key={row.id}>
                <span className={row.status === "failed" ? r.badgeRed : row.status === "ready" ? r.badge : r.badgeAmber}>{statusLabel(row.status)}</span>
                <span>{subjectName(row)}{row.version > 1 ? ` · v${row.version}` : ""}</span>
                <span className={`${r.small} ${r.muted}`}>{row.status === "failed" ? row.error?.split(":")[0] ?? "" : row.costUsdMicros ? usd(row.costUsdMicros) : ""}</span>
              </div>
            ))}
            {legacyJobs.map((job) => (
              <div key={job.id}>
                <span className={r.badge}>{statusLabel(job.status)}</span>
                <span>{job.name}</span>
                <span className={`${r.small} ${r.muted}`}>{job.review === "review_warning" ? c("есть замечание", "has a warning") : "OpenAI"}</span>
              </div>
            ))}
          </div>
        ) : <p className={r.empty}>{c("Заданий художнику пока не было.", "No picture jobs yet.")}</p>}
        <p className={r.note}>{c("Ход никогда не ждёт картинку. При перерисовке старая версия остаётся, пока новая не готова; прошлые версии сохраняются.", "A turn never waits for a picture. When redrawing, the old version stays until the new one is ready; earlier versions are kept.")}</p>
      </Panel>
    </>
  );
}

/** The world's style with versions: a preset to start from, editable text, one reference image,
 * a campaign override, roll-back, and the re-render of the anchor set with its price. */
function StylePanel({ data, samples }: { data: CampaignSnapshot; samples: (SubjectRef & { name: string })[] }) {
  const c = useCopy();
  const pictures = usePictures();
  const board = pictures?.board ?? null;
  const active = board ? activeStyle(board) : null;
  const [editing, setEditing] = useState(false);
  const [scope, setScope] = useState<"world" | "campaign">("campaign");
  const [preset, setPreset] = useState<string>(active?.preset ?? "custom");
  const [label, setLabel] = useState(active?.label ?? "");
  const [text, setText] = useState(active?.styleText ?? data.settings.values.visualStyle);
  const [reference, setReference] = useState<string | null>(null);
  const [keepReference, setKeepReference] = useState(true);
  const [pending, setPending] = useState(false);
  const [estimate, setEstimate] = useState<{ count: number; fastUsdMicros: number; qualityUsdMicros: number } | null>(null);
  const [error, setError] = useState("");
  const styleText = board ? styleTextFor(board, data.settings.values.visualStyle) : data.settings.values.visualStyle;
  const canWorld = !!board?.worldId;
  const versions = board ? [...styleVersions(board, "campaign"), ...styleVersions(board, "world")] : [];
  const begin = (fromPreset?: string) => {
    const chosen = fromPreset ? stylePreset(fromPreset) : null;
    setPreset(chosen ? chosen.key : active?.preset ?? "custom");
    setLabel(chosen ? c(chosen.label.ru, chosen.label.en) : active?.label ?? "");
    setText(chosen ? chosen.text : active?.styleText ?? data.settings.values.visualStyle);
    setScope(active?.scope === "world" || (!active && canWorld) ? "world" : "campaign");
    setReference(null);
    setKeepReference(!fromPreset);
    setError("");
    setEditing(true);
  };
  const act = async (work: () => Promise<unknown>) => {
    if (!pictures || pictures.preview || pending) return;
    setPending(true);
    setError("");
    try { await work(); } catch { setError(c("Не удалось сохранить. Проверь соединение и попробуй ещё раз.", "Could not save. Check the connection and try again.")); } finally { setPending(false); }
  };
  const save = () => act(async () => {
    await pictures!.send("pictures.style.save", { scope, preset, label: label.trim() || c("Свой стиль", "Own style"), styleText: text, activate: true,
      referenceDataUrl: reference ?? undefined, keepReferenceOf: !reference && keepReference && active?.hasReference ? active.id : undefined });
    setEditing(false);
    const next = await pictures!.send("pictures.restyle", { dryRun: true }) as { count: number; fastUsdMicros: number; qualityUsdMicros: number };
    setEstimate(next);
  });
  const chooseFile = async (file: File | undefined) => {
    if (!file) return;
    try { setReference(await readImageAsDataUrl(file)); setError(""); } catch { setError(c("Файл не подходит: нужна картинка до 5 МБ.", "That file will not do: an image up to 5 MB.")); }
  };
  return (
    <Panel eyebrow={c("Стиль мира · визуальная библия", "World style · Visual Bible")}
      action={!editing ? <button type="button" className={r.btnGhost} disabled={!board || pictures?.preview} onClick={() => begin()}>{c("Изменить", "Edit")}</button> : undefined}>
      <div className={r.stack}>
        {!editing && (
          <>
            {active ? (
              <div className={r.row}>
                <span className={r.chip}>{active.scope === "world" ? c("стиль мира", "world style") : c("стиль кампании", "campaign style")} · v{active.version}</span>
                <b>{active.label}</b>
              </div>
            ) : null}
            <p style={{ margin: 0 }}>{styleText || c("Стиль пока не задан: картинки рисуются в нейтральной кинематографичной манере.", "No style set yet: pictures use a neutral cinematic look.")}</p>
            {active?.hasReference && pictures?.styleUrlFor(active) && (
              <div className={s.samples}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={pictures.styleUrlFor(active)!} alt={c("Образец стиля", "Style reference")} />
              </div>
            )}
            <div className={r.chips} aria-label={c("Готовые стили", "Starting presets")}>
              {STYLE_PRESETS.map((row) => (
                <button key={row.key} type="button" className={r.chipButton} disabled={!board || pictures?.preview} aria-pressed={active?.preset === row.key} onClick={() => begin(row.key)}>{c(row.label.ru, row.label.en)}</button>
              ))}
            </div>
            <div className={s.samples}>
              {samples.map((row) => <SampleThumb key={row.id} subject={row} name={c(`образец: ${row.name}`, `sample: ${row.name}`)} />)}
            </div>
            {versions.length > 0 && (
              <details>
                <summary className={r.small}>{c(`Версии стиля (${versions.length})`, `Style versions (${versions.length})`)}</summary>
                <div className={r.roster}>
                  {versions.map((row) => (
                    <div key={row.id}>
                      <span className={row.active ? r.badgeGreen : r.badge}>{row.scope === "world" ? c("мир", "world") : c("кампания", "campaign")} · v{row.version}</span>
                      <span>{row.label}</span>
                      {!row.active ? (
                        <button type="button" className={r.btnGhost} disabled={pending || pictures?.preview} onClick={() => void act(() => pictures!.send("pictures.style.activate", { styleId: row.id }))}>{c("Вернуть", "Restore")}</button>
                      ) : <span className={`${r.small} ${r.muted}`}>{c("действует", "in force")}</span>}
                    </div>
                  ))}
                </div>
                {active?.scope === "campaign" && (
                  <button type="button" className={r.btnGhost} disabled={pending || pictures?.preview} onClick={() => void act(() => pictures!.send("pictures.style.clear", { scope: "campaign" }))}>{c("Снять переопределение кампании", "Drop the campaign override")}</button>
                )}
              </details>
            )}
            {estimate && (
              <div className={r.stack} style={{ gap: 6 }}>
                <span className={r.small}>{estimate.count
                  ? c(`Перерисовать ${estimate.count} анкеров в новом стиле: быстро ${usd(estimate.fastUsdMicros)}, лучше ${usd(estimate.qualityUsdMicros)}. Старые остаются, пока новые не готовы; дневной лимит действует.`, `Re-render ${estimate.count} anchors in the new style: fast ${usd(estimate.fastUsdMicros)}, better ${usd(estimate.qualityUsdMicros)}. Old ones stay until the new are ready; the daily limit applies.`)
                  : c("Все анкеры уже в этом стиле.", "Every anchor is already in this style.")}</span>
                {estimate.count > 0 && (
                  <div className={r.row}>
                    <button type="button" className={r.btnMain} disabled={pending} onClick={() => void act(async () => { await pictures!.send("pictures.restyle", { tier: "fast" }); setEstimate(null); })}>{c("Перерисовать быстро", "Re-render fast")}</button>
                    <button type="button" className={r.btnGhost} disabled={pending} onClick={() => void act(async () => { await pictures!.send("pictures.restyle", { tier: "quality" }); setEstimate(null); })}>{c("Перерисовать лучше", "Re-render better")}</button>
                    <button type="button" className={r.btnGhost} disabled={pending} onClick={() => setEstimate(null)}>{c("Позже", "Later")}</button>
                  </div>
                )}
              </div>
            )}
            {!estimate && board && !pictures?.preview && (
              <button type="button" className={r.btnGhost} disabled={pending} onClick={() => void act(async () => setEstimate(await pictures!.send("pictures.restyle", { dryRun: true }) as typeof estimate))}>{c("Сколько стоит перерисовать всё в этом стиле?", "What would re-rendering everything in this style cost?")}</button>
            )}
          </>
        )}
        {editing && (
          <>
            <div className={r.chips}>
              {STYLE_PRESETS.map((row) => (
                <button key={row.key} type="button" className={r.chipButton} aria-pressed={preset === row.key} onClick={() => { setPreset(row.key); setLabel(c(row.label.ru, row.label.en)); setText(row.text); setKeepReference(false); }}>{c(row.label.ru, row.label.en)}</button>
              ))}
              <button type="button" className={r.chipButton} aria-pressed={preset === "custom"} onClick={() => setPreset("custom")}>{c("Свой", "Custom")}</button>
            </div>
            <label className="field"><span>{c("Название", "Name")}</span><input value={label} maxLength={120} onChange={(event) => { setLabel(event.target.value); if (preset !== "custom") setPreset("custom"); }} /></label>
            <label className="field"><span>{c("Описание стиля для художника", "Style text for the illustrator")}</span>
              <textarea rows={4} value={text} maxLength={2000} onChange={(event) => { setText(event.target.value); if (preset !== "custom" && stylePreset(preset)?.text !== event.target.value) setPreset("custom"); }} /></label>
            <label className="field"><span>{c("Образец стиля (картинка, до 5 МБ)", "Style reference image (up to 5 MB)")}</span>
              <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => void chooseFile(event.target.files?.[0])} /></label>
            {reference && (
              <div className={s.samples}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={reference} alt={c("Новый образец", "New reference")} />
              </div>
            )}
            {!reference && active?.hasReference && (
              <Switch title={c("Оставить прежний образец", "Keep the earlier reference image")} checked={keepReference} onChange={setKeepReference} />
            )}
            {canWorld && (
              <Segmented label={c("Для кого", "Scope")} value={scope} onChange={setScope}
                options={[{ value: "world", label: c("Весь мир", "Whole world") }, { value: "campaign", label: c("Только эта кампания", "This campaign only") }]} />
            )}
            {error && <p className={r.error} role="alert">{error}</p>}
            <div className={r.row}>
              <button type="button" className={r.btnMain} disabled={pending || !text.trim()} onClick={() => void save()}>{c("Сохранить как новую версию", "Save as a new version")}</button>
              <button type="button" className={r.btnGhost} disabled={pending} onClick={() => setEditing(false)}>{c("Отмена", "Cancel")}</button>
            </div>
            <p className={r.note}>{c("Смена стиля создаёт новую версию; прошлые версии остаются, их можно вернуть. Прошлые кадры хранят свой стиль; хронику можно перерисовать по запросу.", "Changing the style creates a new version; earlier versions stay and can be restored. Past frames keep their style; the chronicle can be re-rendered on request.")}</p>
          </>
        )}
      </div>
    </Panel>
  );
}
