"use client";
// Fix run after session 2, stage F (items 13, 16, 19, 20): the wizard's «Герой» step. The owner writes who the hero is
// in his own words and presses one button; the campaign's DM builds the whole sheet in one call; the sheet opens to be
// changed in place; «Утвердить героя» creates the campaign with that hero. A DM that fails still opens a sheet to fill
// in by hand, with the reason in plain words.
import { useEffect, useState } from "react";
import type {
  BootstrapDraft,
  BootstrapTransport,
  CreationDraft,
  HeroProposal,
  HeroReview,
} from "../../lib/adventures/bootstrap-contracts";
import type { NewHeroResult, PublicWorld } from "../../lib/adventures/contracts";
import { heroBlockedReason, heroReviewForCommit, heroLimits, initialHeroReview, parseHeroReview } from "../../lib/adventures/hero-draft";
import { capitalizedName } from "../../lib/adventures/wizard-text";
import r from "../registry/registry.module.css";
import { useBootstrap } from "./use-bootstrap";
import { HeroSheetReview } from "./hero-sheet";
import w from "./wizard.module.css";

type Lang = "en" | "ru";
export type HeroCreated = NewHeroResult & { name: string; role: string | null; language: Lang; title: string };

export function HeroStep({ language, world, persistPending = true, transport, preview, onDirty, onCreated, dmLabel }: {
  language: Lang;
  world: PublicWorld | null;
  persistPending?: boolean;
  transport?: BootstrapTransport;
  /** A synthetic preview: its draft is shown as if the DM had just built it; nothing is sent. */
  preview?: { draft: CreationDraft; openItem?: number | null } | null;
  onDirty: (dirty: boolean) => void;
  onCreated: (created: HeroCreated) => Promise<void> | void;
  /** «Claude Opus 5.5» — who builds the hero. */
  dmLabel: string;
}) {
  const ru = language === "ru";
  const workflow = useBootstrap("rpg:bootstrap:creation", persistPending, transport,
    preview?.draft && preview.draft.proposal.schemaVersion === 3 ? { draft: preview.draft as BootstrapDraft, review: initialHeroReview(preview.draft.input, preview.draft.proposal) } : undefined);
  const [title, setTitle] = useState(""),
    [name, setName] = useState(""),
    [description, setDescription] = useState(""),
    [chosenLanguage, setCampaignLanguage] = useState<Lang | null>(null);
  // The interface language until the owner picks another (the interface may settle its language after the first render).
  const campaignLanguage: Lang = chosenLanguage ?? language;
  const draft = workflow.draft?.kind === "creation" ? workflow.draft : null;
  const heroProposal: HeroProposal | null = draft && draft.proposal.schemaVersion === 3 ? draft.proposal : null;
  const hero = draft && heroProposal ? { draftId: draft.draftId, input: draft.input, proposal: heroProposal } : null;
  const review = hero ? (workflow.review as HeroReview | null) : null;
  const dirty = !!name || !!description || !!title || !!draft || !!workflow.pending;
  useEffect(() => { onDirty(dirty); }, [dirty, onDirty]);
  useEffect(() => () => onDirty(false), [onDirty]);
  const frozen = !workflow.ready || workflow.busy || !!workflow.pending;
  const properName = name.trim() ? capitalizedName(name) : "";
  const committed = async (value: unknown) => {
    const result = value as NewHeroResult;
    const final = review ? heroReviewForCommit(review) : null;
    onDirty(false);
    await onCreated({ ...result, name: final?.name ?? hero?.input.name ?? name, role: final?.sheet.role ?? null,
      language: hero?.input.language ?? campaignLanguage, title: hero?.input.title ?? title });
  };
  const commit = (final: HeroReview) => {
    if (!hero || frozen) return;
    if (preview) { void committed({ requestId: hero.draftId, campaignId: "00000000-0000-4000-8000-000000000000", heroId: "00000000-0000-4000-8000-000000000001" }); return; }
    void workflow.execute({ action: "creation.commit", input: { requestId: crypto.randomUUID(), draftId: hero.draftId, review: final } }, committed);
  };
  const propose = () => {
    if (!world || frozen || !name.trim() || !description.trim()) return;
    const campaignTitle = title.trim() || `${name.trim()} · ${world.title}`.slice(0, 200);
    void workflow.execute({ action: "creation.propose", input: { requestId: crypto.randomUUID(), worldId: world.id, worldVersion: world.version,
      title: campaignTitle, name: name.trim(), description, language: campaignLanguage } }, committed);
  };
  if (draft && !hero)
    return (
      <div className={w.stack}>
        <p className={w.warn} role="status">{ru ? "Это черновик героя старого вида. Собери героя заново — теперь ведущий делает весь лист за один раз." : "This is an older hero draft. Build the hero again — the DM now makes the whole sheet in one pass."}</p>
        <div className={w.footer}><button type="button" className={r.btnMain} onClick={workflow.resetProposal}>{ru ? "Собрать заново" : "Build again"}</button></div>
      </div>
    );
  if (hero && review)
    return (
      <HeroDraftReview draft={hero} review={review} onChange={workflow.setReview} worldTitle={world?.title ?? ""} frozen={frozen} busy={workflow.busy}
        error={workflow.error} onCommit={commit} onReset={workflow.resetProposal} initialOpen={preview?.openItem ?? null} />
    );
  return (
    <form className={w.stack} onSubmit={(event) => { event.preventDefault(); propose(); }}>
      <fieldset disabled={frozen} className={w.stack} style={{ border: 0, margin: 0, padding: 0, minWidth: 0 }}>
        <label className={w.field}><span>{ru ? "Имя героя" : "The hero's name"}</span>
          <input required maxLength={200} value={name} onChange={(event) => setName(event.target.value)} /></label>
        {properName && properName !== name.trim() && (
          <p className={w.help}><button type="button" className={w.link} onClick={() => setName(properName)}>{ru ? `Писать как имя: ${properName}` : `Write it as a name: ${properName}`}</button></p>
        )}
        <label className={w.field}><span>{ru ? "Кто вы?" : "Who are you?"}</span>
          <textarea required rows={10} style={{ minHeight: 240 }} maxLength={heroLimits.description} value={description} onChange={(event) => setDescription(event.target.value)}
            placeholder={ru ? "Своими словами: кто он, класс и уровень, характеристики, умения, заклинания, вещи и деньги — сколько хочешь подробностей. Числа, которые ты напишешь, останутся как есть."
              : "In your own words: who the hero is, class and level, scores, skills, spells, things and money — as much detail as you like. The numbers you write are kept as they are."} /></label>
        <div className={w.grid2}>
          <label className={w.field}><span>{ru ? "Название кампании" : "Campaign title"}</span>
            <input maxLength={200} value={title} placeholder={name.trim() && world ? `${name.trim()} · ${world.title}` : ""} onChange={(event) => setTitle(event.target.value)} /></label>
          <label className={w.field}><span>{ru ? "Язык кампании" : "Campaign language"}</span>
            <select value={campaignLanguage} onChange={(event) => setCampaignLanguage(event.target.value === "en" ? "en" : "ru")}>
              <option value="ru">Русский</option><option value="en">English</option>
            </select></label>
        </div>
      </fieldset>
      <p className={w.help}>{ru ? `${dmLabel} соберёт весь лист за один раз — характеристики, умения, заклинания, вещи на кукле, деньги. Обычно минута-две; это платный запрос к модели. Потом всё можно поправить.`
        : `${dmLabel} builds the whole sheet in one pass — scores, skills, spells, things on the doll, money. Usually a minute or two; it is a paid model request. You can change everything afterwards.`}</p>
      <div className={w.footer}>
        <button type="submit" className={r.btnMain} disabled={frozen || !world || !name.trim() || !description.trim()}>{ru ? "Собрать героя" : "Build the hero"}</button>
        {!world && <span className={w.help}>{ru ? "Сначала выбери мир." : "Pick a world first."}</span>}
      </div>
      {workflow.busy && <p className={w.status} role="status">{ru ? `Ведущий собирает героя… обычно минута-две.` : `The DM is building the hero… usually a minute or two.`}</p>}
      {workflow.pending && !workflow.busy && (
        <div className={w.warn} role="status">
          <p style={{ margin: 0 }}>{ru ? "Ответ ведущего ещё не получен. Можно забрать тот же ответ — второго запроса к модели не будет." : "The DM's answer has not arrived yet. You can collect the same answer — the model is not asked again."}</p>
          <div className={w.footer}>
            <button type="button" className={r.btn} onClick={() => void workflow.execute(workflow.pending!, committed)}>{ru ? "Забрать ответ" : "Collect the answer"}</button>
            {workflow.error && <button type="button" className={r.btnGhost} onClick={workflow.resetProposal}>{ru ? "Начать заново" : "Start over"}</button>}
          </div>
        </div>
      )}
      {workflow.error && !workflow.pending && <p className={w.warn} role="alert">{ru ? "Не удалось собрать героя. Попробуй ещё раз." : "The hero could not be built. Try again."}</p>}
    </form>
  );
}

/** The review of a one-pass hero: the sheet, why the button is grey (when it is), «Утвердить героя», «Собрать заново». */
export function HeroDraftReview({ draft, review, onChange, worldTitle, frozen, busy, error, onCommit, onReset, initialOpen = null }: {
  initialOpen?: number | null;
  draft: { draftId: string; input: CreationDraft["input"]; proposal: HeroProposal };
  review: HeroReview;
  onChange: (review: HeroReview) => void;
  worldTitle: string;
  frozen: boolean;
  busy: boolean;
  error: boolean;
  onCommit: (review: HeroReview) => void;
  onReset: () => void;
}) {
  const language = draft.input.language;
  const ru = language === "ru";
  const blocked = heroBlockedReason(review, language);
  return (
    <form className={w.stack} onSubmit={(event) => {
      event.preventDefault();
      if (blocked || frozen) return;
      onCommit(parseHeroReview(heroReviewForCommit(review), draft.proposal));
    }}>
      <p className={w.lead}>{ru ? `Ведущий собрал героя для мира «${worldTitle}». Поправь что хочешь прямо в листе — и утверди.` : `The DM built the hero for “${worldTitle}”. Change anything right in the sheet — then approve.`}</p>
      <fieldset disabled={frozen} style={{ border: 0, margin: 0, padding: 0, minWidth: 0 }}>
        <HeroSheetReview value={review} onChange={onChange} language={language} questions={draft.proposal.questions} notes={draft.proposal.notes} initialOpen={initialOpen} />
      </fieldset>
      {blocked && <p className={w.warn} role="status">{blocked}</p>}
      <div className={w.footer}>
        <button type="submit" className={r.btnMain} disabled={frozen || !!blocked}>{ru ? "Утвердить героя" : "Approve the hero"}</button>
        <button type="button" className={r.btnGhost} disabled={frozen} onClick={onReset}>{ru ? "Собрать заново" : "Build again"}</button>
        {busy && <span className={w.help} role="status">{ru ? "Создаём кампанию и героя…" : "Creating the campaign and the hero…"}</span>}
      </div>
      {error && <p className={w.warn} role="alert">{ru ? "Не удалось создать кампанию. Проверь лист и нажми «Утвердить героя» ещё раз." : "The campaign could not be created. Check the sheet and press “Approve the hero” again."}</p>}
    </form>
  );
}
