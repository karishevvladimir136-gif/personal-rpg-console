"use client";
// Fix run after session 2, stage F (items 10–13, 15, 20, 21, 34): one new-campaign wizard in story order —
// 1 Мир (pick or create; its text becomes the campaign's canon), 2 Герой (built by the DM in one pass),
// 3 Приключение (what we play, the pace, who goes with the hero; the whole text reaches every turn),
// 4 Ведущий (model, depth range, «Что мне нравится», voice samples), 5 Первая сцена (the DM proposes the opening from
// all of it; its people become records; the owner's answers reach them; «Играть»).
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { AdventureCatalog, AdventurePacing, PublicWorld, WorldCatalog } from "../../lib/adventures/contracts";
import type { BootstrapTransport, CreationDraft, OpeningDraft, StartCommand } from "../../lib/adventures/bootstrap-contracts";
import {
  createAdventureTransport,
  prepareAdventureAttempt,
  versionAdventureAttempt,
  type AdventureTransport,
} from "../../lib/adventures/client";
import { depthRangeLabel, wizardAdventurePremise, wizardAdventureSetup, wizardSteps } from "../../lib/adventures/wizard-text";
import { dmTurnModels, loadDmSettings, saveDmSettings, type DmSettings } from "../../lib/gameplay/dm-settings-client";
import { DEFAULT_DEPTH_RANGE, EFFORT_ORDER, type DepthRange } from "../../lib/gameplay/dm-loop/depth";
import { loadCampaign, readJson } from "../../lib/persistence/client";
import { effortLabel } from "../../lib/ui/effort";
import { detectRulesSystem } from "../../lib/rulesets/rules-system";
import { WorldPicker } from "../adventures/worlds";
import { adventureText } from "../adventures/text";
import { Plate, Segmented, registry as r } from "../registry/primitives";
import { OWNER_WISHES_MAX_CHARS } from "../registry/owner-secrets";
import { HeroStep, type HeroCreated } from "./hero-step";
import { OpeningBootstrap } from "./opening";
import lib from "../registry/library.module.css";
import w from "./wizard.module.css";

type Lang = "en" | "ru";
type VoiceMode = DmSettings["voiceMode"];
const PROGRESS_KEY = "rpg:wizard:progress";
type Progress = { campaignId: string; hero: HeroCreated; worldTitle: string; adventureId: string | null; dmSaved: boolean };
const readProgress = (): Progress | null => {
  try {
    const value = JSON.parse(sessionStorage.getItem(PROGRESS_KEY) ?? "null");
    return value && typeof value.campaignId === "string" && value.hero && typeof value.hero.name === "string" ? value as Progress : null;
  } catch { return null; }
};
const writeProgress = (value: Progress | null) => {
  try { if (value) sessionStorage.setItem(PROGRESS_KEY, JSON.stringify(value)); else sessionStorage.removeItem(PROGRESS_KEY); } catch { /* the wizard still works in memory */ }
};

/** What a synthetic preview shows at each step (no request leaves the page). */
export type WizardPreview = {
  heroDraft?: CreationDraft;
  created?: HeroCreated;
  catalog?: AdventureCatalog;
  adventure?: { title: string; premise: string; companions: string };
  createdWorld?: boolean;
  openingDraft?: OpeningDraft | null;
  /** The thing whose fields are open on the sheet. */
  openItem?: number | null;
};

export function CampaignWizard({ language, worlds, onClose, onCreated, preview, initialStep = 0, transport: injected, bootstrapTransport }: {
  language: Lang;
  worlds: WorldCatalog | null;
  onClose: () => void;
  onCreated: () => Promise<void>;
  preview?: WizardPreview | null;
  initialStep?: number;
  transport?: AdventureTransport;
  bootstrapTransport?: BootstrapTransport;
}) {
  const ru = language === "ru";
  const router = useRouter();
  const transport = useMemo(() => injected ?? createAdventureTransport(), [injected]);
  const steps = wizardSteps(language);
  const [step, setStep] = useState(Math.max(0, Math.min(4, initialStep)));
  const [catalogWorlds, setCatalogWorlds] = useState<WorldCatalog | null>(worlds);
  const [worldId, setWorldId] = useState(() => (preview && (initialStep > 0 || preview.createdWorld) ? worlds?.worlds[0]?.id ?? "" : ""));
  const [worldBusy, setWorldBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [created, setCreated] = useState<HeroCreated | null>(preview?.created ?? null);
  const [catalog, setCatalog] = useState<AdventureCatalog | null>(preview?.catalog ?? null);
  const [adventureId, setAdventureId] = useState<string | null>(preview?.catalog?.adventures[0]?.id ?? null);
  // The DM step.
  const [model, setModel] = useState(dmTurnModels[0].modelId);
  const [depth, setDepth] = useState<DepthRange>({ ...DEFAULT_DEPTH_RANGE });
  const [likes, setLikes] = useState("");
  const [voiceMode, setVoiceMode] = useState<VoiceMode>("off");
  const [dmSaved, setDmSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [start, setStart] = useState<StartCommand | null>(null);
  // The adventure step's fields survive going back and forth between the steps.
  const [adventureDraft, setAdventureDraft] = useState<AdventureDraft | null>(null);
  const world: PublicWorld | null = catalogWorlds?.worlds.find((row) => row.id === worldId) ?? null;
  const entry = dmTurnModels.find((row) => row.modelId === model) ?? dmTurnModels[0];
  // Fix S3 item 3: the rules system the world's description names — the server gives it to the campaign at creation.
  const namedRules = world ? detectRulesSystem(`${world.title}\n${world.premise}`) : null;

  // A reload after the campaign exists comes back to the step it reached (the campaign is real; nothing is redone).
  useEffect(() => {
    if (preview) return;
    const saved = readProgress();
    if (!saved) return;
    queueMicrotask(() => {
      setCreated(saved.hero);
      setAdventureId(saved.adventureId);
      setDmSaved(saved.dmSaved);
      setStep(saved.adventureId ? (saved.dmSaved ? 4 : 3) : 2);
    });
  }, [preview]);
  const progress = (patch: Partial<Progress>) => {
    if (preview || !created) return;
    const current = readProgress();
    writeProgress({ campaignId: created.campaignId, hero: created, worldTitle: world?.title ?? current?.worldTitle ?? "", adventureId: adventureId, dmSaved, ...current, ...patch });
  };
  const campaignId = created?.campaignId ?? null;

  const readCatalog = async (): Promise<AdventureCatalog> => {
    const snapshot = await loadCampaign(campaignId!);
    if (!snapshot.timeline) throw new Error("timeline");
    return transport.read(campaignId!, snapshot.timeline);
  };

  return (
    <div className={lib.page}>
      <Plate eyebrow={ru ? "Нулевая сессия" : "Session zero"} title={ru ? "Новая кампания" : "New campaign"}
        aside={<button type="button" className={r.btnGhost} onClick={() => {
          // Closing ends this wizard: the next «Новая кампания» starts afresh (a created campaign stays and can be
          // started from its «Приключения» screen).
          if (!dirty || window.confirm(ru ? "Отменить несохранённое?" : "Discard unsaved changes?")) { if (!preview) writeProgress(null); onClose(); }
        }}>{created ? (ru ? "Закрыть" : "Close") : (ru ? "Отмена" : "Cancel")}</button>} />
      <ol className={lib.steps} aria-label={ru ? "Шаги" : "Steps"}>
        {steps.map((row, index) => (
          <li key={row.id}>
            <span className={lib.step} aria-current={index === step ? "step" : undefined} data-done={index < step}>
              <span className={lib.stepNum}>{index < step ? "✓" : index + 1}</span>
              <span><b>{row.title}</b><span className={`${r.small} ${r.muted}`}>{row.hint}</span></span>
            </span>
          </li>
        ))}
      </ol>
      <div className={lib.newLayout}>
        <section className={lib.newMain} aria-label={steps[step].title}>
          {error && <p className={w.warn} role="alert">{error}</p>}
          {step === 0 && (
            <div className={w.stack}>
              <h2 className={r.h2}>{ru ? "Где будет история?" : "Where does the story happen?"}</h2>
              <WorldPicker language={language} wizard worldId={worldId} disabled={false} onSelect={setWorldId} onCatalog={setCatalogWorlds}
                onBusy={setWorldBusy} onDirty={setDirty} initial={worlds ?? undefined} transport={transport} persistPending={!preview}
                previewCreated={preview?.createdWorld ?? false} />
              <div className={w.footer}>
                <button type="button" className={r.btnMain} disabled={!world || worldBusy} onClick={() => setStep(1)}>{ru ? "Дальше →" : "Next →"}</button>
              </div>
            </div>
          )}
          {step === 1 && (
            <div className={w.stack}>
              <h2 className={r.h2}>{ru ? "Кто твой герой?" : "Who is your hero?"}</h2>
              <HeroStep language={language} world={world} persistPending={!preview} transport={bootstrapTransport} preview={preview?.heroDraft ? { draft: preview.heroDraft, openItem: preview.openItem ?? null } : null}
                dmLabel={dmTurnModels[0].label} onDirty={setDirty}
                onCreated={async (hero) => {
                  setCreated(hero);
                  if (!preview) writeProgress({ campaignId: hero.campaignId, hero, worldTitle: world?.title ?? "", adventureId: null, dmSaved: false });
                  setStep(2);
                  await onCreated();
                }} />
              <div className={w.footer}><button type="button" className={w.link} onClick={() => setStep(0)}>{ru ? "← Другой мир" : "← Another world"}</button></div>
            </div>
          )}
          {step === 2 && (
            <AdventureStep language={language} initial={adventureDraft ?? (preview?.adventure ? { ...preview.adventure, pace: "evening", custom: "", wishes: "" } : null)} busy={busy} hasPrepared={!!adventureId}
              onSave={async (setup, draft) => {
                setAdventureDraft(draft);
                if (preview || !campaignId) { setStep(3); return; }
                setBusy(true); setError(null);
                try {
                  // Fix S3-accept Ж1: the wishes go to the owner-only store (no rebuild: the campaign's first prep reads them).
                  if (draft.wishes.trim()) await saveWishes(campaignId, draft.wishes);
                  const current = await readCatalog();
                  const prepared = adventureId ? current.adventures.find((row) => row.id === adventureId && row.status === "prepared") : null;
                  // Back after a reload with empty fields: the saved adventure stays as it is.
                  if (prepared && !draft.premise.trim() && !draft.companions.trim()) { setCatalog(current); setStep(3); return; }
                  const result = await transport.send(prepared ? versionAdventureAttempt(current, prepared.id, "edit", setup) : prepareAdventureAttempt(current, { ...setup }));
                  const next = result.snapshot.adventures.find((row) => row.status === "prepared") ?? null;
                  setCatalog(result.snapshot);
                  setAdventureId(next?.id ?? null);
                  progress({ adventureId: next?.id ?? null });
                  setStep(3);
                } catch {
                  setError(ru ? "Приключение не сохранилось. Проверь текст и попробуй ещё раз." : "The adventure was not saved. Check the text and try again.");
                } finally { setBusy(false); }
              }} />
          )}
          {step === 3 && (
            <div className={w.stack}>
              <h2 className={r.h2}>{ru ? "Кто ведёт игру?" : "Who runs the game?"}</h2>
              <div className={r.choices}>
                {dmTurnModels.map((row) => (
                  <button key={row.modelId} type="button" className={r.choice} aria-pressed={model === row.modelId}
                    onClick={() => { setModel(row.modelId); setDmSaved(false); }}>
                    <span className={r.eyebrow}>{row.providerId === "anthropic" ? "Anthropic" : "OpenAI"}</span>
                    <span className={r.choiceTitle}>{row.label}</span>
                  </button>
                ))}
              </div>
              <div className={w.stack} style={{ gap: 8 }}>
                <span className={w.lead}><b>{ru ? "Глубина мысли" : "Depth of thought"}</b> · {depthRangeLabel(depth, language)}</span>
                <p className={w.help}>{ru ? "Обычный ход думает на нижней границе; «⚡ важный ход» и кульминация боя — на верхней (или на шаг глубже, если границы совпадают)."
                  : "An ordinary turn thinks at the lower bound; «⚡ important move» and a fight's climax at the upper one (or one step deeper when both are the same)."}</p>
                <div className={w.row}><span className={w.help} style={{ minWidth: 70 }}>{ru ? "обычно" : "usually"}</span>
                  <Segmented label={ru ? "Обычная глубина" : "Usual depth"} value={depth.min}
                    options={entry.efforts.map((value) => ({ value, label: effortLabel(value, language) }))}
                    onChange={(value) => { setDepth((current) => ({ min: value as DepthRange["min"], max: EFFORT_ORDER.indexOf(value as DepthRange["min"]) > EFFORT_ORDER.indexOf(current.max) ? value as DepthRange["max"] : current.max })); setDmSaved(false); }} /></div>
                <div className={w.row}><span className={w.help} style={{ minWidth: 70 }}>{ru ? "в важном" : "important"}</span>
                  <Segmented label={ru ? "Глубина важного хода" : "Depth of an important move"} value={depth.max}
                    options={entry.efforts.filter((value) => EFFORT_ORDER.indexOf(value as DepthRange["max"]) >= EFFORT_ORDER.indexOf(depth.min)).map((value) => ({ value, label: effortLabel(value, language) }))}
                    onChange={(value) => { setDepth((current) => ({ ...current, max: value as DepthRange["max"] })); setDmSaved(false); }} /></div>
              </div>
              <label className={w.field}><span>{ru ? "Что мне нравится в играх" : "What I enjoy in games"}</span>
                <textarea rows={4} style={{ minHeight: 120 }} maxLength={2000} value={likes} onChange={(event) => { setLikes(event.target.value); setDmSaved(false); }}
                  placeholder={ru ? "Темы, виды сцен, темп боёв — то, что ты сказал бы мастеру на нулевой сессии." : "Themes, kinds of scenes, the pace of fights — what you would tell the DM at session zero."} /></label>
              <div className={w.stack} style={{ gap: 8 }}>
                <span className={w.lead}><b>{ru ? "Образцы голоса в подсказке ведущего" : "Voice samples in the DM's prompt"}</b></span>
                <Segmented label={ru ? "Образцы голоса" : "Voice samples"} value={voiceMode}
                  options={[{ value: "off", label: ru ? "Выключено" : "Off" }, { value: "five", label: ru ? "Пять" : "Five" }, { value: "all", label: ru ? "Все" : "All" }]}
                  onChange={(value) => { setVoiceMode(value as VoiceMode); setDmSaved(false); }} />
                <p className={w.help}>{ru ? "Отрывки прозы, которую ты любишь (их пишут в настройках кампании): «Пять» — пять разных на всю сессию, «Все» — весь банк."
                  : "Passages of prose you like (written in the campaign settings): «Five» — five different ones for a session, «All» — the whole bank."}</p>
              </div>
              <div className={w.footer}>
                <button type="button" className={r.btnMain} disabled={busy} onClick={() => void (async () => {
                  if (preview || !campaignId) { setDmSaved(true); setStep(4); return; }
                  setBusy(true); setError(null);
                  try {
                    const current = await loadDmSettings(campaignId);
                    await saveDmSettings(campaignId, { expectedRevision: current.revision, runtime: "dm-loop-v1",
                      dmTurn: { providerId: entry.providerId, modelId: entry.modelId, reasoning: depth.min }, depth, voiceMode });
                    if (likes.trim())
                      await readJson(`/api/campaigns/${encodeURIComponent(campaignId)}/dossier`, { method: "POST", headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ action: "likes", playerLikes: likes.trim() }) }).catch(() => undefined);
                    setDmSaved(true);
                    progress({ dmSaved: true });
                    setStep(4);
                  } catch {
                    setError(ru ? "Настройки ведущего не сохранились. Попробуй ещё раз." : "The DM settings were not saved. Try again.");
                  } finally { setBusy(false); }
                })()}>{ru ? "Дальше →" : "Next →"}</button>
                <button type="button" className={w.link} onClick={() => setStep(2)}>{ru ? "← Приключение" : "← Adventure"}</button>
              </div>
            </div>
          )}
          {step === 4 && (
            <div className={w.stack}>
              <h2 className={r.h2}>{ru ? "Первая сцена" : "The first scene"}</h2>
              <p className={w.lead}>{ru ? "Ведущий предложит начало из всего, что ты выбрал: мира, героя, приключения и того, что тебе нравится. Люди в сцене станут записями кампании; поправь что хочешь — и играй."
                : "The DM proposes the opening from everything you chose: the world, the hero, the adventure and what you enjoy. The people in it become the campaign's records; change what you like — and play."}</p>
              {preview?.openingDraft ? (
                <OpeningBootstrap campaignId={preview.openingDraft.command.input.campaignId} start={null} language={language} wizard persistPending={false}
                  previewDraft={preview.openingDraft} transport={bootstrapTransport} onDirty={() => {}} onStarted={async () => {}} onCancel={() => {}} />
              ) : preview || !campaignId ? (
                <div className={w.footer}><button type="button" className={r.btnMain} disabled>{ru ? "Предложить первую сцену" : "Propose the first scene"}</button>
                  <span className={w.help}>{ru ? "Предпросмотр: запросы не отправляются." : "Preview: nothing is sent."}</span></div>
              ) : start ? (
                <OpeningBootstrap campaignId={campaignId} start={start} language={created?.language ?? language} wizard autoPropose
                  onDirty={setDirty} onStarted={async () => { writeProgress(null); router.push(`/campaigns/${encodeURIComponent(campaignId)}/game`); }}
                  onCancel={() => setStart(null)} />
              ) : (
                <div className={w.footer}>
                  <button type="button" className={r.btnMain} disabled={busy || !adventureId} onClick={() => void (async () => {
                    setBusy(true); setError(null);
                    try {
                      const current = await readCatalog();
                      const prepared = current.adventures.find((row) => row.id === adventureId && row.status === "prepared");
                      if (!prepared) throw new Error("adventure");
                      const command = versionAdventureAttempt(current, prepared.id, "start");
                      if (command.action === "start") setStart(command);
                    } catch {
                      setError(ru ? "Не удалось подготовить начало: приключение не найдено. Вернись на шаг «Приключение»." : "The opening could not be prepared: the adventure is missing. Go back to “Adventure”.");
                    } finally { setBusy(false); }
                  })()}>{ru ? "Предложить первую сцену" : "Propose the first scene"}</button>
                  <span className={w.help}>{ru ? "Это платный запрос к модели ведущего, обычно меньше минуты." : "A paid request to the DM's model, usually under a minute."}</span>
                  <button type="button" className={w.link} onClick={() => setStep(3)}>{ru ? "← Ведущий" : "← DM"}</button>
                </div>
              )}
            </div>
          )}
        </section>
        <aside className={lib.summary} aria-label={ru ? "Сводка" : "Summary"}>
          <span className={r.eyebrow}>{ru ? "Сводка" : "Summary"}</span>
          <div className={r.kv}>
            <div><span>{ru ? "Мир" : "World"}</span><span>{world?.title ?? (created ? readProgressTitle() : "—")}</span></div>
            <div><span>{ru ? "Герой" : "Hero"}</span><span>{created ? [created.name, created.role].filter(Boolean).join(" · ") : "—"}</span></div>
            <div><span>{ru ? "Приключение" : "Adventure"}</span><span>{catalog?.adventures.find((row) => row.id === adventureId)?.title ?? (adventureId ? "✓" : "—")}</span></div>
            <div><span>{ru ? "Ведущий" : "DM"}</span><span>{entry.label} · {depthRangeLabel(depth, language)}</span></div>
            <div><span>{ru ? "Правила" : "Rules"}</span><span>{!world ? "—" : namedRules ? `${namedRules.label} · ${ru ? "из описания мира" : "from the world's description"}` : ru ? "логика мира" : "World Logic"}</span></div>
            <div><span>{ru ? "Картинки" : "Pictures"}</span><span>{ru ? "стиль мира" : "world style"}</span></div>
          </div>
          <span className={w.help}>{ru ? "Всё, кроме мира, можно поменять потом в настройках кампании." : "Everything but the world can change later in campaign settings."}</span>
        </aside>
      </div>
    </div>
  );
}
function readProgressTitle(): string {
  return readProgress()?.worldTitle || "—";
}

/** Fix S3-accept Ж1: «Пожелания к приключению» to the owner-only store (the settings screen's route); `rebuild: false` —
 * a campaign still in the wizard has no opening yet, and its first hidden-layer prep reads them. */
async function saveWishes(campaignId: string, body: string) {
  await readJson(`/api/campaigns/${encodeURIComponent(campaignId)}/dm-secrets`, { method: "PUT", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ scope: "wishes", body: body.trim(), rebuild: false }) });
}

const PACES: AdventurePacing["kind"][] = ["quick", "evening", "mini_arc", "open", "custom"];
// Fix S3-accept Ж1: `wishes` — «Пожелания к приключению», owner-only; saved to the DM-only store, never into the adventure.
type AdventureDraft = { title: string; premise: string; companions: string; pace: AdventurePacing["kind"]; custom: string; wishes: string };
function AdventureStep({ language, initial, busy, hasPrepared, onSave }: {
  language: Lang; initial: AdventureDraft | null; busy: boolean; hasPrepared: boolean;
  onSave: (setup: { title: string; premise: string; pacing: AdventurePacing }, draft: AdventureDraft) => Promise<void>;
}) {
  const ru = language === "ru";
  const t = adventureText(language);
  const [title, setTitle] = useState(initial?.title ?? (ru ? "Первое приключение" : "First adventure"));
  const [premise, setPremise] = useState(initial?.premise ?? "");
  const [companions, setCompanions] = useState(initial?.companions ?? "");
  const [pace, setPace] = useState<AdventurePacing["kind"]>(initial?.pace ?? "evening");
  const [custom, setCustom] = useState(initial?.custom ?? "");
  const [wishes, setWishes] = useState(initial?.wishes ?? "");
  const paceLabel = (kind: AdventurePacing["kind"]) => ({ quick: t.quick, evening: t.evening, mini_arc: t.mini, open: t.open, custom: t.custom }[kind]);
  return (
    <form className={w.stack} onSubmit={(event) => {
      event.preventDefault();
      const text = wizardAdventurePremise(premise, companions, language) || wizardAdventureSetup({ choice: "dm", phrase: "" }, language).premise;
      // A custom pace needs its words; without them the adventure is open-ended.
      const pacing: AdventurePacing = pace === "custom" ? (custom.trim() ? { kind: "custom", custom: custom.trim() } : { kind: "open", custom: null }) : { kind: pace, custom: null };
      void onSave({ title: title.trim() || (ru ? "Первое приключение" : "First adventure"), premise: text.slice(0, 20000), pacing },
        { title, premise, companions, pace, custom, wishes });
    }}>
      <h2 className={r.h2}>{ru ? "Во что играем?" : "What do we play?"}</h2>
      <label className={w.field}><span>{ru ? "Название приключения" : "Adventure title"}</span>
        <input maxLength={200} value={title} onChange={(event) => setTitle(event.target.value)} /></label>
      <label className={w.field}><span>{ru ? "Во что играем" : "What we play"}</span>
        <textarea rows={8} style={{ minHeight: 200 }} maxLength={19000} value={premise} onChange={(event) => setPremise(event.target.value)}
          placeholder={ru ? "Завязка своими словами: где начинаем, какое дело, чего хочется — сколько угодно подробностей. Пусто — ведущий выберет начало сам."
            : "The set-up in your own words: where we start, what the job is, what you want — any detail. Empty — the DM picks the start."} /></label>
      <p className={w.help}>{ru ? "Весь этот текст ведущий видит в каждом ходе, пока идёт приключение." : "The DM sees all of this text on every turn while the adventure is active."}</p>
      <label className={w.field}><span>{ru ? "Пожелания к приключению (видит только ведущий)" : "Wishes for the adventure (the DM only)"}</span>
        <textarea rows={4} style={{ minHeight: 110 }} maxLength={OWNER_WISHES_MAX_CHARS} value={wishes} onChange={(event) => setWishes(event.target.value)}
          placeholder={ru ? "Жанр, тон, что должно случиться — пожелание, не сама правда. Игрок этого не увидит; ведущий строит на этом тайный слой."
            : "Genre, tone, what should happen — a wish, not the truth itself. The player never sees it; the DM builds the hidden layer on it."} /></label>
      <label className={w.field}><span>{ru ? "Кто идёт с героем (по желанию)" : "Who goes with the hero (optional)"}</span>
        <textarea rows={2} maxLength={1000} value={companions} onChange={(event) => setCompanions(event.target.value)}
          placeholder={ru ? "Например: два стражника тракта — Брам, ветеран, и Лис, новобранец." : "For example: two road wardens — Bram, a veteran, and Fox, a recruit."} /></label>
      <div className={w.stack} style={{ gap: 8 }}>
        <span className={w.lead}><b>{ru ? "Темп" : "Pace"}</b></span>
        <Segmented label={ru ? "Темп" : "Pace"} value={pace} options={PACES.map((value) => ({ value, label: paceLabel(value) }))} onChange={(value) => setPace(value as AdventurePacing["kind"])} />
        {pace === "custom" && <label className={w.field}><span>{t.customPrompt}</span><input maxLength={500} value={custom} onChange={(event) => setCustom(event.target.value)} /></label>}
      </div>
      <div className={w.footer}>
        <button type="submit" className={r.btnMain} disabled={busy}>{busy ? (ru ? "Сохраняем…" : "Saving…") : ru ? "Дальше →" : "Next →"}</button>
        {hasPrepared && <span className={w.help}>{ru ? "Приключение уже сохранено; изменения заменят его текст." : "The adventure is saved; changes replace its text."}</span>}
      </div>
    </form>
  );
}
