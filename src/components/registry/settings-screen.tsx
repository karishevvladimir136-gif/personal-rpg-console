"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import type { CampaignSnapshot } from "@/lib/persistence/contracts";
import type { PlaySnapshot } from "@/lib/gameplay/contracts";
import type { DossierView, NotebookView } from "@/lib/gameplay/dossier/contracts";
import { pinnedOf, turnStatsOf } from "@/lib/ui/campaign-view";
import { PinnedList } from "./pins";
import { EFFORT_ORDER } from "@/lib/gameplay/dm-loop/depth";
import { checkFrequencyOptions, dicePresentationOptions, effectiveDmStyle, updateCampaignSettings, type CampaignSettingsAction } from "@/lib/campaign-settings";
import { dmArchitectureOf, dmArchitectures, dmBookkeeperModels, dmTurnModels, dmWriterModels, saveDmSettings,
  type DmSettings, type DmSplit } from "@/lib/gameplay/dm-settings-client";
import { createMutationAttempt, readJson } from "@/lib/persistence/client";
import { rulesInWords } from "@/lib/ui/rules-words";
import { useOptionalCampaignData } from "../persistence-context";
import { usd } from "@/lib/visual-frame/fal-image";
import { workshopJobs } from "@/lib/ui/visual-autopilot";
import { readImageAsDataUrl } from "@/lib/ui/pictures-client";
import { activeStyle, DEFAULT_TIER_MODELS, modelForTier, PICTURE_MODELS, pictureCostUsdMicros, pictureModel, STYLE_PRESETS, stylePreset, styleTextFor, styleVersions, type PictureAutopilot, type PictureSettings, type PictureTier, type PublicPicture } from "@/lib/visual-frame/pictures";
import { usePictures } from "./live-frames";
import { effortLabel } from "@/lib/ui/effort";
import { useChrome, useDmSettings, type CampaignScreenId } from "./shell";
import { useAutopilot } from "./visual-autopilot";
import { Panel, Plate, registry as r, Segmented, Switch, useCopy, useSubjectImage, type SubjectRef } from "./primitives";
import { OwnerSecretsPanel } from "./owner-secrets";
import s from "./settings.module.css";

type ProviderInfo = { fal: { configured: boolean; persistence: boolean }; openai?: { configured: boolean } } | null;

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
  // Fix run after session 2 (items 26, 39): the checks and dice that act in play, on this short screen. The per-turn
  // record limits stay on the server (saveDmSettings still takes them) and leave the owner's settings.
  const campaign = useOptionalCampaignData();
  const [diceValues, setDiceValues] = useState(data.settings.values);
  const [diceBusy, setDiceBusy] = useState(false);
  const [diceError, setDiceError] = useState("");
  // The preview keeps its toggles locally; the live screen shows the saved record.
  const shownDice = chrome?.href || !campaign ? diceValues : data.settings.values;
  const changeDice = async (action: CampaignSettingsAction) => {
    if (diceBusy) return;
    const next = updateCampaignSettings(shownDice, action);
    setDiceError("");
    if (chrome?.href || !campaign) { setDiceValues(next); return; }
    setDiceBusy(true);
    try {
      await campaign.mutate(createMutationAttempt(null, { operation: "settings.save", timeline: data.timeline, correctionScope: "timeline",
        campaignId: data.campaign.id, expectedRevision: data.settings.revision, payload: next }));
      await campaign.refresh().catch(() => {});
    } catch {
      setDiceError(c("Не удалось сохранить. Обнови страницу и попробуй ещё раз.", "Could not save. Reload the page and try again."));
    } finally { setDiceBusy(false); }
  };
  // Stage 4: the player-likes note and the theme question (owner-editable), the
  // depth range, the notebook option, the last turns' numbers.
  const [dossier, setDossier] = useState<DossierView | null>(null);
  const [likesDraft, setLikesDraft] = useState<string | null>(null);
  const [themeDraft, setThemeDraft] = useState<string | null>(null);
  const [notebook, setNotebook] = useState<NotebookView | null>(null);
  // Polish group 7: «Образцы голоса» — the owner's passages (private), per campaign with an account default.
  const [voice, setVoice] = useState<{ campaign: string; account: string } | null>(null);
  const [voiceScope, setVoiceScope] = useState<"campaign" | "account">("campaign");
  const [voiceDraft, setVoiceDraft] = useState<string | null>(null);
  const [play, setPlay] = useState<PlaySnapshot | null>(null);
  useEffect(() => {
    if (preview) return;
    const id = encodeURIComponent(data.campaign.id);
    readJson<DossierView>(`/api/campaigns/${id}/dossier`).then(setDossier, () => setDossier(null));
    readJson<{ campaign: string; account: string }>(`/api/campaigns/${id}/dossier?view=voice`).then(setVoice, () => setVoice(null));
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
  const saveDepth = async (patch: { depth?: { min: string; max: string } | null; notebookVisible?: boolean; voiceMode?: DmSettings["voiceMode"]; voiceTokenCap?: number;
    options?: Partial<DmSettings["options"]> }) => {
    if (!current || saving || chrome?.href) return;
    setSaving(true);
    try {
      const saved = await saveDmSettings(data.campaign.id, { expectedRevision: current.revision, runtime: current.runtime, dmTurn: current.dmTurn,
        ...(patch.depth !== undefined ? { depth: patch.depth as DmSettings["depth"] } : {}), ...(patch.notebookVisible !== undefined ? { notebookVisible: patch.notebookVisible } : {}),
        ...(patch.voiceMode !== undefined ? { voiceMode: patch.voiceMode } : {}), ...(patch.voiceTokenCap !== undefined ? { voiceTokenCap: patch.voiceTokenCap } : {}),
        ...(patch.options ? { options: patch.options } : {}) });
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
  // Polish 3 §2: the DM architecture — today's loop or a writer + bookkeeper pair — saved as the campaign's split.
  const split = current?.split ?? null;
  const architecture = dmArchitectureOf(split);
  const saveSplit = async (next: DmSplit | null) => {
    if (!current || saving || chrome?.href) return;
    setSaving(true);
    setError("");
    try {
      const saved = await saveDmSettings(data.campaign.id, { expectedRevision: current.revision, runtime: current.runtime, dmTurn: current.dmTurn, split: next });
      setDm(saved);
    } catch {
      setError(c("Не удалось сохранить. Проверь соединение и попробуй ещё раз.", "Could not save. Check the connection and try again."));
    } finally {
      setSaving(false);
    }
  };
  const writerEntry = split ? dmWriterModels.find((row) => row.modelId === split.writer.modelId) ?? null : null;
  const bookkeeperEntry = split ? dmBookkeeperModels.find((row) => row.modelId === split.bookkeeper.modelId) ?? null : null;
  const settings = data.settings.values;
  const rules = rulesInWords(data);
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
              <div className={r.stack} style={{ gap: 6 }} data-testid="dm-architecture">
                <span className={r.eyebrow}>{c("Ведущий", "Game master")}</span>
                <div className={r.choices}>
                  {dmArchitectures.map((row) => (
                    <button key={row.id} type="button" className={r.choice} aria-pressed={architecture === row.id} disabled={saving || !current}
                      onClick={() => void saveSplit(row.split)}>
                      <span className={r.choiceTitle}>{c(row.ru, row.en)}</span>
                      <span className={r.eyebrow}>{c(`первое слово ~${row.firstWordS} с · ~$${row.sessionUsd} за сессию`, `first word ~${row.firstWordS} s · ~$${row.sessionUsd} a session`)}</span>
                    </button>
                  ))}
                </div>
                <p className={r.note} style={{ margin: 0 }}>{c("Числа — медиана первого слова и цена сессии в 41 ход: пробы 20 октября после исправлений (у Fable — сравнение 17 октября). В паре писатель рассказывает и бросает кости, а бухгалтер записывает: текст приходит сразу, фишки — через 40–60 секунд, после записи и проверки записей. «Opus пишет — Opus записывает» — твой выбор для третьей сессии; «Opus ведёт один» — по умолчанию для новой кампании.",
                  "The numbers are the median first word and the cost of a 41-turn session: the probes of 20 October after the fixes (Fable's from the bake-off of 17 October). In a pair the writer narrates and rolls the dice while the bookkeeper records: the text arrives at once, the chips 40–60 seconds later, after the records and their check. «Opus writes — Opus records» is your choice for session 3; «Opus runs alone» is the default for a new campaign.")}</p>
                <details>
                  <summary>{c("Подробнее", "More")}</summary>
                  <div className={r.stack} style={{ gap: 8 }}>
                    <p className={r.note} style={{ margin: 0 }}>{c("Любая пара: писатель и бухгалтер по отдельности. Fable пишет только на высокой глубине (на очень высокой её цена и ожидание удваиваются); бухгалтер работает на своей постоянной глубине.",
                      "Any pair: the writer and the bookkeeper separately. Fable writes at high only (extra high doubles its cost and wait); the bookkeeper runs at its own fixed effort.")}</p>
                    <Segmented label={c("Писатель", "Writer")} value={split?.writer.modelId ?? "single"} disabled={saving || !current}
                      options={[{ value: "single", label: c("нет пары", "no pair") }, ...dmWriterModels.map((row) => ({ value: row.modelId, label: row.label }))]}
                      onChange={(value) => {
                        if (value === "single") { void saveSplit(null); return; }
                        const writer = dmWriterModels.find((row) => row.modelId === value)!;
                        void saveSplit({ writer: { providerId: "anthropic", modelId: writer.modelId, reasoning: writer.modelId === "claude-fable-5-1" ? "high" : split?.writer.reasoning ?? writer.defaultEffort },
                          bookkeeper: split?.bookkeeper ?? { providerId: "anthropic", modelId: "claude-sonnet-5-5", reasoning: "high" } });
                      }} />
                    {split && (
                      <>
                        <Segmented label={c("Бухгалтер", "Bookkeeper")} value={split.bookkeeper.modelId} disabled={saving}
                          options={dmBookkeeperModels.map((row) => ({ value: row.modelId, label: row.label }))}
                          onChange={(value) => void saveSplit({ writer: split.writer, bookkeeper: { providerId: "anthropic", modelId: value, reasoning: split.bookkeeper.reasoning ?? "high" } })} />
                        <Segmented label={c("Глубина бухгалтера", "Bookkeeper effort")} value={split.bookkeeper.reasoning ?? bookkeeperEntry?.defaultEffort ?? "high"} disabled={saving}
                          options={(bookkeeperEntry?.efforts ?? ["medium", "high"]).map((value) => ({ value, label: effortLabel(value, c.language) }))}
                          onChange={(value) => void saveSplit({ writer: split.writer, bookkeeper: { ...split.bookkeeper, reasoning: value } })} />
                        {writerEntry && writerEntry.efforts.length > 1 && (
                          <Segmented label={c("Глубина писателя", "Writer effort")} value={split.writer.reasoning ?? writerEntry.defaultEffort} disabled={saving}
                            options={writerEntry.efforts.map((value) => ({ value, label: effortLabel(value, c.language) }))}
                            onChange={(value) => void saveSplit({ writer: { ...split.writer, reasoning: value }, bookkeeper: split.bookkeeper })} />
                        )}
                      </>
                    )}
                  </div>
                </details>
              </div>
              {split && <span className={r.eyebrow}>{c("Модель сегодняшнего хода (без пары)", "The model of today's loop (no pair)")}</span>}
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
              </div>
              {/* Item 39: the link opens the folded full settings before it jumps there. */}
              <a className={r.btnGhost} href="#more-settings" onClick={() => {
                const fold = document.getElementById("more-settings");
                if (fold instanceof HTMLDetailsElement) fold.open = true;
              }}>{c("Изменить в полных настройках", "Change in the full settings")}</a>
              <div className={r.stack} style={{ gap: 6 }}>
                <span className={r.eyebrow}>{c("Что мне нравится", "What I enjoy")}</span>
                <p className={r.note} style={{ margin: 0 }}>{c("Твои собственные слова о том, что тебе нравится в игре: из мастера создания и твоих правок. Ведущий их читает и никогда не переписывает.", "Your own words on what you enjoy in the game, from the wizard and your edits. The DM reads them and never rewrites them.")}</p>
                <textarea className={s.note} rows={3} value={likes} maxLength={2000} disabled={!!chrome?.href} aria-label={c("Что мне нравится", "What I enjoy")}
                  onChange={(event) => setLikesDraft(event.target.value)} />
                {likesDraft !== null && <div className={r.row}><button type="button" className={r.btnMain} onClick={() => void saveNote("likes", likesDraft)}>{c("Сохранить", "Save")}</button><button type="button" className={r.btnGhost} onClick={() => setLikesDraft(null)}>{c("Отмена", "Cancel")}</button></div>}
                {(dossier?.dmLikes ?? data.campaign.dm_likes ?? "").trim() && (
                  <>
                    <span className={r.eyebrow}>{c("Наблюдения ведущего", "The DM's observations")}</span>
                    <p className={r.note} style={{ margin: 0 }} data-testid="dm-likes">{dossier?.dmLikes ?? data.campaign.dm_likes}</p>
                  </>
                )}
                <span className={r.eyebrow}>{c("Тема кампании (вопрос)", "Campaign theme (a question)")}</span>
                <input className={s.note} value={theme} maxLength={500} disabled={!!chrome?.href} aria-label={c("Тема кампании", "Campaign theme")}
                  placeholder={c("Например: что стоит верность, когда никто не смотрит?", "For example: what does loyalty cost when nobody is watching?")}
                  onChange={(event) => setThemeDraft(event.target.value)} />
                {themeDraft !== null && <div className={r.row}><button type="button" className={r.btnMain} onClick={() => void saveNote("theme", themeDraft)}>{c("Сохранить", "Save")}</button><button type="button" className={r.btnGhost} onClick={() => setThemeDraft(null)}>{c("Отмена", "Cancel")}</button></div>}
                <span className={r.eyebrow}>{c("Что ведущий помнит всегда", "What the DM always remembers")}</span>
                <p className={r.note} style={{ margin: 0 }}>{c("Факты, закреплённые булавкой в журнале, кодексе или сцене: они всегда перед ведущим.", "Facts pinned in the journal, the codex or a scene: they are always in front of the DM.")}</p>
                <PinnedList campaignId={data.campaign.id} pinned={pinnedOf(data)} />

                <span className={r.eyebrow}>{c("Образцы голоса", "Voice samples")}</span>
                <p className={r.note} style={{ margin: 0 }}>{c("Отрывки прозы, которую ты любишь: ведущий учится у их интонации и ритма. Формат: отрывки разделяет строка «---», отрывок может начинаться со строки «## вид» (торг, ссора, быт, драка, тишина, смешное). Хранятся только в базе, приватно; в репозиторий, логи и примеры не попадают.", "Passages of prose you like: the DM learns their tone and rhythm. Format: a line «---» separates passages; a passage may start with a line «## kind» (bargaining, argument, everyday, fight, quiet, funny). Stored only in the database, privately; never in the repository, logs or fixtures.")}</p>
                <Segmented label={c("Чьи образцы", "Which samples")} value={voiceScope} disabled={!!chrome?.href}
                  options={[{ value: "campaign", label: c("Этой кампании", "This campaign") }, { value: "account", label: c("По умолчанию для всех", "Default for all campaigns") }]}
                  onChange={(value) => { setVoiceScope(value); setVoiceDraft(null); }} />
                <textarea className={s.note} rows={6} maxLength={200000} disabled={!!chrome?.href || !voice} aria-label={c("Образцы голоса", "Voice samples")}
                  value={voiceDraft ?? voice?.[voiceScope] ?? ""} placeholder={c("## торг\nОтрывок…\n---\n## тишина\nДругой отрывок…", "## bargaining\nA passage…\n---\n## quiet\nAnother passage…")}
                  onChange={(event) => setVoiceDraft(event.target.value)} />
                {voiceDraft !== null && (
                  <div className={r.row}>
                    <button type="button" className={r.btnMain} onClick={() => void (async () => {
                      try {
                        const next = await readJson<{ campaign: string; account: string }>(`/api/campaigns/${encodeURIComponent(data.campaign.id)}/dossier`, { method: "POST",
                          headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "voice_save", scope: voiceScope, samples: voiceDraft }) });
                        setVoice(next); setVoiceDraft(null);
                      } catch { /* the draft stays for another try */ }
                    })()}>{c("Сохранить", "Save")}</button>
                    <button type="button" className={r.btnGhost} onClick={() => setVoiceDraft(null)}>{c("Отмена", "Cancel")}</button>
                  </div>
                )}
                <span className={r.eyebrow}>{c("Образцы в подсказке ведущего", "Samples in the DM's prompt")}</span>
                <Segmented label={c("Образцы в подсказке ведущего", "Samples in the DM's prompt")} value={current?.voiceMode ?? "off"} disabled={saving || !current || !!chrome?.href}
                  options={[{ value: "off", label: c("Выключено", "Off") }, { value: "five", label: c("Пять", "Five") }, { value: "all", label: c("Все", "All") }]}
                  onChange={(value) => void saveDepth({ voiceMode: value })} />
                <p className={r.note} style={{ margin: 0 }}>{c("«Пять» — пять разных отрывков по видам, одни и те же всю сессию (так подсказка остаётся в кэше). «Все» — весь банк до предела токенов ниже, в кэшируемом слое: дороже на первом ходе сессии, потом почти даром.", "«Five» — five passages of different kinds, the same ones for a whole session (so the prompt stays cached). «All» — the whole bank up to the token cap below, in the cached layer: dearer on a session's first turn, almost free after.")}</p>
                {current?.voiceMode === "all" && (
                  <label className={r.note} style={{ margin: 0, display: "flex", gap: 8, alignItems: "center" }}>
                    <span>{c("Предел токенов для «Все»", "Token cap for «All»")}</span>
                    <input className={s.note} type="number" min={1000} max={150000} step={1000} style={{ width: 120 }} aria-label={c("Предел токенов", "Token cap")}
                      defaultValue={current.voiceTokenCap} disabled={saving || !!chrome?.href}
                      onBlur={(event) => { const next = Number(event.target.value); if (Number.isSafeInteger(next) && next >= 1000 && next <= 150000 && next !== current.voiceTokenCap) void saveDepth({ voiceTokenCap: next }); }} />
                  </label>
                )}

                <Switch title={c("Заглянуть в блокнот мастера", "Peek into the DM's notebook")} hint={c("Показывает заметки подготовки между сессиями. По умолчанию выключено.", "Shows the prep notes between sessions. Off by default.")}
                  checked={!!current?.notebookVisible} disabled={saving || !current || !!chrome?.href} onChange={(value) => void saveDepth({ notebookVisible: value })} />
                {current?.notebookVisible && (
                  <div className={r.stack} style={{ gap: 4 }}>
                    <span className={r.eyebrow}>{c("Блокнот мастера", "DM notebook")}</span>
                    {notebookVisible && notebook?.notebook ? <p className={r.note} style={{ margin: 0, whiteSpace: "pre-wrap" }}>{notebook.notebook}</p>
                      : <p className={r.note} style={{ margin: 0 }}>{c("Пока пусто: блокнот пишется после закрытия сессии.", "Empty so far: the notebook is written after a session closes.")}</p>}
                  </div>
                )}
                {/* Fix run A2/A3/A5: the DM's options (migration 73), measured on the stage A probes. */}
                <div className={r.stack} style={{ gap: 6 }} data-testid="dm-options">
                  <span className={r.eyebrow}>{c("Продолжение хода", "Turn continuation")}</span>
                  <Segmented label={c("Продолжение хода", "Turn continuation")} value={current?.options.continuation ?? "same"} disabled={saving || !current || !!chrome?.href}
                    options={[{ value: "same", label: c("как основной запрос", "as the first request") }, { value: "lighter", label: c("на ступень легче", "one notch lighter") }]}
                    onChange={(value) => void saveDepth({ options: { continuation: value as DmSettings["options"]["continuation"] } })} />
                  <p className={r.note} style={{ margin: 0 }}>{c("Запрос после броска думает так же глубоко, как первый, или на ступень меньше. На пробах «на ступень легче» дважды из трёх раз оставил итог боя без рассказа, поэтому по умолчанию — как основной запрос.",
                    "The request after a roll thinks as deep as the first one, or one notch less. On the probes «one notch lighter» twice in three left the fight's outcome untold, so the default is «as the first request».")}</p>
                  {data.settings.values.language === "ru" && (
                    <>
                      <span className={r.eyebrow}>{c("Инструкции ведущего", "DM instructions")}</span>
                      <Segmented label={c("Инструкции ведущего", "DM instructions")} value={current?.options.instructions ?? "ru"} disabled={saving || !current || !!chrome?.href}
                        options={[{ value: "ru", label: c("русские", "Russian") }, { value: "en", label: c("английские", "English") }]}
                        onChange={(value) => void saveDepth({ options: { instructions: value as DmSettings["options"]["instructions"] } })} />
                      <p className={r.note} style={{ margin: 0 }}>{c("На каком языке ведущий читает свои правила. Русские написаны по-русски, а не переводом. На пробах с русскими речь чище (без калек, меньше рубленых абзацев), первое слово раньше, а записи так же точны — поэтому по умолчанию русские.",
                        "The language of the DM's own rules. The Russian ones are written in Russian, not translated. On the probes the Russian ones gave cleaner speech (no calques, fewer choppy paragraphs), an earlier first word and records as exact — so they are the default.")}</p>
                    </>
                  )}
                  <span className={r.eyebrow}>{c("Память ведущего", "DM memory")}</span>
                  <Segmented label={c("Память ведущего", "DM memory")} value={current?.options.memory ?? "standard"} disabled={saving || !current || !!chrome?.href}
                    options={[{ value: "compact", label: c("компактно", "compact") }, { value: "standard", label: c("стандарт", "standard") }, { value: "wide", label: c("широко", "wide") }]}
                    onChange={(value) => void saveDepth({ options: { memory: value as DmSettings["options"]["memory"] } })} />
                  <p className={r.note} style={{ margin: 0 }}>{c("Сколько последних сцен ведущий читает дословно. «Компактно» — около 45 тысяч токенов, примерно 30 последних ходов: на пробе ведущий не вспомнил сказанное 35 ходов назад. «Стандарт» — около 200 тысяч, примерно 120 ходов (больше сессии); по умолчанию. «Широко» — около 380 тысяч. Обычный ход: около $0,37 / $0,50 / $0,61; первый ход сессии: $0,95 / $2,07 / $3,48. Более старое ведущий помнит по досье и итогам сессий.",
                    "How many recent scenes the DM reads verbatim. «Compact» about 45 thousand tokens, roughly the last 30 turns: on the probe the DM did not recall what was said 35 turns back. «Standard» about 200 thousand, roughly 120 turns (more than a session); the default. «Wide» about 380 thousand. An ordinary turn: about $0.37 / $0.50 / $0.61; a session's first turn: $0.95 / $2.07 / $3.48. The dossier and the session recaps keep the older story.")}</p>
                </div>
                <Switch title={c("Показывать мне тайны ведущего", "Show me the DM's secrets")} hint={c("Открывает тайный слой в «Для владельца → Что видит ведущий»: досье, заметки, планы. Это спойлеры. По умолчанию выключено.", "Opens the private layers in «For the owner → What the DM sees»: the dossier, notes, plans. These are spoilers. Off by default.")}
                  checked={!!current?.options.secretsVisible} disabled={saving || !current || !!chrome?.href} onChange={(value) => void saveDepth({ options: { secretsVisible: value } })} />
              </div>
            </div>
          </Panel>
          <OwnerSecretsPanel campaignId={data.campaign.id} preview={!!preview} />
          {/* Fix run after session 2 (items 26, 39): the campaign's rules in words with the way to the DM guide, and
              the checks and dice that act in play — shown for every rules system, never hidden behind «Логика мира».
              The per-turn record limits are guards on the server, not something the owner plays with. */}
          <Panel eyebrow={c("Правила и кости", "Rules and dice")} label={c("Правила и кости", "Rules and dice")}>
            <div className={r.stack} data-testid="rules-and-dice">
              <div className={r.stack} style={{ gap: 4 }}>
                <span className={r.eyebrow}>{c("Правила этой кампании", "This campaign's rules")}</span>
                <p className={s.rules}>{rules.line
                  ? c(`${rules.line} — по руководству ведущего`, `${rules.line} — by the DM guide`)
                  : c("Свои правила — руководство ведущего пока пустое", "Own rules — the DM guide is still empty")}</p>
                {rules.guideId && (
                  <Link className={s.inlineLink} href={`${href("library")}?doc=${encodeURIComponent(rules.guideId)}`}>
                    {rules.line ? c("Открыть и изменить руководство ведущего", "Open and edit the DM guide") : c("Написать руководство ведущего", "Write the DM guide")}
                  </Link>
                )}
                <p className={r.note} style={{ margin: 0 }}>{c("Правила — это знания ведущего, а не код: он читает руководство перед каждым ходом. Подойдёт любая система.", "Rules are the DM's knowledge, not code: the DM reads the guide before every turn. Any system works.")}</p>
              </div>
              <div className={r.stack} style={{ gap: 4 }}>
                <span className={r.eyebrow}>{c("Проверки и кости", "Checks and dice")}</span>
                <Switch title={c("Показывать сложность (DC)", "Show the difficulty (DC)")}
                  hint={c("После броска на карточке видно, какое число нужно было выбросить. Тайные проверки ведущего не показываются никогда.", "After a roll the card shows the number that was needed. The DM's secret checks are never shown.")}
                  checked={shownDice.showDc} disabled={diceBusy || shownDice.dicePresentation === "hidden"} onChange={(value) => void changeDice({ type: "showDc", value })} />
                <Switch title={c("Важные броски кидаю я", "I roll the important checks")}
                  hint={c("Ход ждёт, пока ты сам бросишь кость героя в важной проверке. Выкл — бросает сервер, ход не останавливается.", "The turn waits until you roll the hero's die in an important check. Off — the server rolls and the turn goes on.")}
                  checked={shownDice.interactiveDice} disabled={diceBusy || shownDice.dicePresentation === "hidden"} onChange={(value) => void changeDice({ type: "interactiveDice", value })} />
                <Switch title={c("Перебросы", "Rerolls")}
                  hint={shownDice.difficulty.rerolls === "disabled"
                    ? c("Выкл: результат броска окончателен, как в D&D 5e.", "Off: a roll stands, as in D&D 5e.")
                    : c(`Вкл: после броска можно попросить переброс (${shownDice.difficulty.rerolls === "unlimited" ? "без ограничения" : `до ${shownDice.difficulty.rerollsPerSession} за сессию`}). Домашнее правило, не 5e.`,
                      `On: after a roll you may ask for a reroll (${shownDice.difficulty.rerolls === "unlimited" ? "unlimited" : `up to ${shownDice.difficulty.rerollsPerSession} a session`}). A house rule, not 5e.`)}
                  checked={shownDice.difficulty.rerolls !== "disabled"} disabled={diceBusy}
                  onChange={(value) => void changeDice({ type: "difficulty", key: "rerolls", value: value ? "limited" : "disabled" })} />
                {shownDice.dicePresentation === "hidden" && <p className={r.note} style={{ margin: 0 }}>{c("Броски скрыты («Показ бросков» в полных настройках), поэтому сложность и свои броски сейчас не действуют.", "Rolls are hidden («Showing rolls» in the full settings), so the difficulty and your own rolls do not apply now.")}</p>}
                {diceError && <p className={r.error} role="alert">{diceError}</p>}
              </div>
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
  // Polish 2: the model of each tier is the owner's choice (the blind picks' defaults until then).
  const tierModel = (tier: PictureTier) => modelForTier(tier, settings);
  const framePrice = (tier: PictureTier) => usd(pictureCostUsdMicros(tier, "frame", tierModel(tier)));
  const seconds = (id: string) => { const m = pictureModel(id)?.medianSeconds; return m === null || m === undefined ? "?" : m < 10 ? m.toFixed(1).replace(/\.0$/, "") : String(Math.round(m)); };
  const tierLabel = (tier: PictureTier) => `${pictureModel(tierModel(tier))?.label ?? tierModel(tier)} · ~${seconds(tierModel(tier))} ${c("с", "s")} · ${framePrice(tier)}`;
  const pickModel = (tier: PictureTier, id: string) => set({ models: { ...(settings?.models ?? {}), [tier]: id } });
  const providerBadge = (name: string, configured: boolean | undefined) =>
    configured ? <span key={name} className={r.badgeGreen}>{name} · {c("ключ есть", "key set")}</span> : <span key={name} className={r.badgeIron}>{name} · {c("нет ключа", "no key")}</span>;
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
      <Panel eyebrow={c("Картинки", "Pictures")} action={<span className={r.row} style={{ gap: 6 }}>{providerBadge("OpenAI", providers?.openai?.configured)}{providerBadge("fal", providers?.fal.configured)}</span>}>
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
              options={[{ value: "fast", label: c(`Быстро · ${tierLabel("fast")}`, `Fast · ${tierLabel("fast")}`) }, { value: "quality", label: c(`Лучше · ${tierLabel("quality")}`, `Better · ${tierLabel("quality")}`) }]} />
            <p className={r.note}>{c("Анкеры (портреты, места, вещи), перерисовки и ключевые моменты всегда идут на модели «лучше».", "Anchors (portraits, places, things), redraws and key moments always use the «better» model.")}</p>
          </div>
          <div>
            <span className={r.eyebrow}>{c("Модели картинок", "Picture models")}</span>
            <p className={r.note}>{c("По твоему слепому выбору (17 и 18.10.2026): всё на GPT Image 2.5 Sunburst — анкеры, ключевые кадры, перерисовки и живые кадры. Flare — быстрый вариант для живых кадров (около 16 с вместо 30). Остальные модели остаются в каталоге — можно переключить любой из двух уровней.", "By your blind picks (2026-10-17 and 18): everything on GPT Image 2.5 Sunburst — anchors, key frames, redraws and live frames. Flare is the fast choice for live frames (about 16 s instead of 30). The other models stay in the catalogue — either tier can be switched.")}</p>
            {([["quality", c("Лучше: анкеры, ключевые кадры, перерисовки", "Better: anchors, key frames, redraws")], ["fast", c("Быстро: живые кадры", "Fast: live frames")]] as [PictureTier, string][]).map(([tier, label]) => (
              <label key={tier} className={s.pick}>
                <span className={r.small}>{label}{tierModel(tier) === DEFAULT_TIER_MODELS[tier] ? "" : ` · ${c("своя", "custom")}`}</span>
                <select value={tierModel(tier)} disabled={disabled} aria-label={label} data-testid={`picture-model-${tier}`} onChange={(event) => pickModel(tier, event.target.value)}>
                  {PICTURE_MODELS.map((row) => (
                    <option key={row.id} value={row.id}>{row.label} · ~{seconds(row.id)} {c("с", "s")} · {usd(pictureCostUsdMicros(tier, "frame", row.id))} · {c(row.note.ru, row.note.en)}</option>
                  ))}
                </select>
              </label>
            ))}
          </div>
          <Switch title={c("Режиссёр кадра", "Shot director")} hint={c("Модель читает весь ход и пишет подробное описание кадра (люди, место, свет, камера); выкл — кадр по одной строке из первого абзаца. Около цента и 5 секунд на кадр.", "A model reads the whole turn and writes a detailed brief for the frame (people, place, light, camera); off — the one-line shot from the first paragraph. About a cent and five seconds per frame.")}
            checked={settings?.director ?? true} disabled={disabled} onChange={(value) => set({ director: value })} />
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
            <p className={r.note}>{c("Смена стиля создаёт новую версию; прошлые версии остаются, их можно вернуть. Прошлые кадры хранят свой стиль; любой кадр можно перерисовать в галерее.", "Changing the style creates a new version; earlier versions stay and can be restored. Past frames keep their style; any frame can be redrawn in the gallery.")}</p>
          </>
        )}
      </div>
    </Panel>
  );
}
