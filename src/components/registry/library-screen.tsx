"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Plus } from "lucide-react";
import type { Campaign, CampaignSnapshot } from "@/lib/persistence/contracts";
import type { WorldCatalog } from "@/lib/adventures/contracts";
import type { AdventureTransport } from "@/lib/adventures/client";
import type { BootstrapTransport } from "@/lib/adventures/bootstrap-contracts";
import { createAdventureTransport } from "@/lib/adventures/client";
import { loadCampaign } from "@/lib/persistence/client";
import { dmTurnModels, loadDmSettings, saveDmSettings, type DmSettings } from "@/lib/gameplay/dm-settings-client";
import { characterViewModel } from "@/lib/character-view-model";
import { currentPlace, currentSession, heroOf, sessionNumber } from "@/lib/ui/campaign-view";
import { effortLabel } from "@/lib/ui/effort";
import { NewCampaignForm } from "../bootstrap/new-campaign";
import { useWorkspaceData } from "../persistence-context";
import { dmModelLabel } from "./shell";
import { Art, LaterLine, Panel, Plate, registry as r, useCopy } from "./primitives";
import s from "./library.module.css";

export type LibraryPreview = {
  campaigns: Campaign[];
  snapshots: Record<string, CampaignSnapshot>;
  dmSettings: Record<string, DmSettings>;
  worlds: WorldCatalog;
  href: (campaignId: string, screen: string) => string;
};

const campaignHref = (id: string, screen: string) => `/campaigns/${encodeURIComponent(id)}/${screen}`;

/** A model's own default effort (its capabilities' default, as the server resolves it). */
function defaultEffort(entry: (typeof dmTurnModels)[number]) {
  return entry.defaultEffort;
}

/** The previous closed session's recap: the "Previously in…" block. Hidden when absent. */
export function previouslyIn(snapshot: CampaignSnapshot) {
  const current = snapshot.publicState.current_session_id;
  const closed = snapshot.sessions.filter((row) => row.status === "closed" && row.recap.trim() && row.id !== current);
  return closed.sort((a, b) => b.updated_at.localeCompare(a.updated_at))[0]?.recap ?? null;
}

export function RegistryCampaigns({ preview, more }: { preview?: LibraryPreview; more?: ReactNode }) {
  const c = useCopy();
  const workspace = useWorkspaceData();
  const campaigns = useMemo(() => [...(preview?.campaigns ?? workspace.data?.campaigns ?? [])]
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at)), [preview, workspace.data]);
  const [snapshots, setSnapshots] = useState<Record<string, CampaignSnapshot>>(preview?.snapshots ?? {});
  const [settings, setSettings] = useState<Record<string, DmSettings>>(preview?.dmSettings ?? {});
  const [worlds, setWorlds] = useState<WorldCatalog | null>(preview?.worlds ?? null);
  const [creating, setCreating] = useState(false);
  const [switching, setSwitching] = useState<string | null>(null);
  const href = preview?.href ?? campaignHref;
  useEffect(() => {
    if (preview) return;
    let live = true;
    for (const campaign of campaigns) {
      loadCampaign(campaign.id).then((value) => { if (live) setSnapshots((current) => ({ ...current, [campaign.id]: value })); }, () => {});
      loadDmSettings(campaign.id).then((value) => { if (live) setSettings((current) => ({ ...current, [campaign.id]: value })); }, () => {});
    }
    createAdventureTransport().worlds().then((value) => { if (live) setWorlds(value); }, () => {});
    return () => { live = false; };
  }, [campaigns, preview]);
  const switchRuntime = async (campaignId: string) => {
    const current = settings[campaignId];
    if (!current || preview || switching) return;
    setSwitching(campaignId);
    try {
      const saved = await saveDmSettings(campaignId, { expectedRevision: current.revision, runtime: "dm-loop-v1", dmTurn: current.dmTurn });
      setSettings((value) => ({ ...value, [campaignId]: saved }));
    } finally {
      setSwitching(null);
    }
  };
  if (creating)
    return <RegistryNewCampaign worlds={worlds} onClose={() => setCreating(false)} onCreated={async () => { await workspace.refresh().catch(() => {}); }} preview={!!preview} />;
  const [featured, ...others] = campaigns;
  return (
    <div className={s.page}>
      <header className={s.header}>
        <div>
          <span className={r.eyebrow}>{c("Твои истории ждут", "Your stories are waiting")}</span>
          <h1 className={r.h1}>{c("Мои кампании", "My campaigns")}</h1>
        </div>
        <button type="button" className={r.btnMain} onClick={() => setCreating(true)}><Plus size={18} aria-hidden="true" />{c("Новая кампания", "New campaign")}</button>
      </header>
      {workspace.loading && !preview && <p className={r.muted} role="status">{c("Загружаю кампании…", "Loading campaigns…")}</p>}
      {featured ? (
        <FeaturedCard campaign={featured} snapshot={snapshots[featured.id] ?? null} settings={settings[featured.id] ?? null} href={href}
          onSwitch={() => void switchRuntime(featured.id)} switching={switching === featured.id} />
      ) : !workspace.loading || preview ? (
        <Panel><p className={r.empty}>{c("Кампаний пока нет. Начни первую — мир, герой, ведущий и первая сцена.", "No campaigns yet. Start the first: world, hero, DM and the first scene.")}</p></Panel>
      ) : null}
      <section className={s.others} aria-label={c("Другие кампании", "Other campaigns")}>
        {others.map((campaign) => (
          <CampaignCard key={campaign.id} campaign={campaign} snapshot={snapshots[campaign.id] ?? null} settings={settings[campaign.id] ?? null} href={href}
            onSwitch={() => void switchRuntime(campaign.id)} switching={switching === campaign.id} />
        ))}
        <button type="button" className={s.newCard} onClick={() => setCreating(true)}>
          <span className={s.plus}>+</span>
          <span className={r.choiceTitle}>{c("Новая кампания", "New campaign")}</span>
          <span className={r.muted}>{c("мир, герой, ведущий — и первая сцена", "world, hero, DM — and the first scene")}</span>
        </button>
      </section>
      <section className={s.worlds} aria-label={c("Миры", "Worlds")}>
        <div className={s.worldsHead}>
          <h2 className={r.h2}>{c("Миры", "Worlds")}</h2>
          <span className={r.muted}>{c("У мира может быть много кампаний.", "A world can hold many campaigns.")}</span>
        </div>
        <div className={s.worldGrid}>
          {(worlds?.worlds ?? []).map((world) => (
            <article key={world.id} className={s.world}>
              <span className={r.eyebrow}>{c(`мир · версия ${world.version}`, `world · version ${world.version}`)}</span>
              <span className={r.choiceTitle}>{world.title}</span>
              {world.premise && <span className={`${r.small} ${r.muted}`}>{world.premise.slice(0, 220)}</span>}
            </article>
          ))}
          <button type="button" className={s.worldNew} onClick={() => setCreating(true)}>
            <span className={r.eyebrow}>{c("новый мир", "new world")}</span>
            <span className={r.choiceTitle}>{c("Свой мир своими словами", "Your own world, in your words")}</span>
            <span className={`${r.small} ${r.muted}`}>{c("Пара абзацев о мире — ведущий развернёт остальное по ходу игры.", "A couple of paragraphs; the DM unfolds the rest in play.")}</span>
          </button>
          <Link className={s.worldNew} href={preview ? "#" : "/world-library"}>
            <span className={r.eyebrow}>{c("продвинуто", "advanced")}</span>
            <span className={r.choiceTitle}>{c("Мир из источников", "A world from sources")}</span>
            <span className={`${r.small} ${r.muted}`}>{c("Книги, заметки, вики — с проверкой фактов и каноном.", "Books, notes, wikis — with fact checks and canon.")}</span>
          </Link>
        </div>
      </section>
      {more && <details className={s.more}><summary>{c("Ещё · прежний список и пустая кампания", "More · earlier list and empty campaign")}</summary>{more}</details>}
    </div>
  );
}

function RuntimeBadge({ settings }: { settings: DmSettings | null }) {
  const c = useCopy();
  if (!settings) return null;
  return settings.runtime === "astra-primary-v1" ? <span className={r.badgeAmber}>{c("старый ход", "previous runtime")}</span> : null;
}

function FeaturedCard({ campaign, snapshot, settings, href, onSwitch, switching }: {
  campaign: Campaign; snapshot: CampaignSnapshot | null; settings: DmSettings | null; href: (id: string, screen: string) => string; onSwitch: () => void; switching: boolean;
}) {
  const c = useCopy();
  const session = snapshot ? currentSession(snapshot) : null;
  const number = snapshot ? sessionNumber(snapshot, session?.id) : null;
  const place = snapshot ? currentPlace(snapshot) : null;
  const hero = snapshot ? heroOf(snapshot) : null;
  const model = hero && snapshot ? characterViewModel(snapshot, hero) : null;
  const companions = snapshot?.entities.filter((row) => row.kind === "companion").length ?? 0;
  const recap = snapshot ? previouslyIn(snapshot) : null;
  const effort = settings?.dmTurn?.reasoning;
  return (
    <article className={s.featured}>
      <div className={s.cover}>
        {place ? <Art subject={{ kind: "location", id: place.id }} name={campaign.title} position="center 40%" /> : <div className={r.blankArt} aria-hidden="true" />}
        <div className={s.coverText}>
          <span className={r.eyebrow}>{c("Текущая история", "Current story")}</span>
          <div className={s.coverTitle}>{campaign.title}</div>
          {campaign.subtitle && <div className={r.muted}>{campaign.subtitle}</div>}
        </div>
      </div>
      <div className={s.info}>
        <div className={r.row}>
          <span className={r.badgeGreen}>{c("идёт", "in progress")}</span>
          <RuntimeBadge settings={settings} />
          {settings && <span className={r.pill}>{dmModelLabel(settings, true)}{effort ? ` · ${effortLabel(effort, c.language)}` : ""}</span>}
        </div>
        <div className={`${r.row} ${r.small} ${r.muted}`}>
          {session && <span>{number ? c(`Сессия ${number}`, `Session ${number}`) : ""}{number ? " · " : ""}«{session.title}»</span>}
          {place && <span>· {place.name}</span>}
        </div>
        {recap && (
          <div className={s.recap}>
            <span className={r.eyebrow}>{c(`Ранее в «${campaign.title}»…`, `Previously in “${campaign.title}”…`)}</span>
            <span>{recap}</span>
          </div>
        )}
        {hero && (
          <div className={s.hero}>
            <span className={r.avatarSmall}><Art subject={{ kind: "entity", id: hero.id }} name={hero.name} position="center 25%" /></span>
            <div>
              <b>{hero.name}</b>
              <div className={`${r.small} ${r.muted}`}>{[model?.sheet.role, model?.level !== null && model?.level !== undefined ? c.t("Level {level}", { level: model.level }) : null,
                companions ? c(`отряд из ${companions}`, `party of ${companions}`) : null].filter(Boolean).join(" · ")}</div>
            </div>
          </div>
        )}
        <div className={r.row}>
          <Link className={r.btnMain} href={href(campaign.id, "game")}>{c("Продолжить", "Continue")}</Link>
          <Link className={r.btnGhost} href={href(campaign.id, "timeline")}>{c("Хроника", "Chronicle")}</Link>
          <Link className={r.btnGhost} href={href(campaign.id, "saves")}>{c("Сейвы", "Saves")}</Link>
          <Link className={r.btn} href={href(campaign.id, "adventures")}>{c("Новое приключение", "New adventure")}</Link>
          {settings?.runtime === "astra-primary-v1" && <button type="button" className={r.btnGhost} disabled={switching} onClick={onSwitch}>{c("Перевести на новый ход", "Switch to the new turn")}</button>}
        </div>
      </div>
    </article>
  );
}

function CampaignCard({ campaign, snapshot, settings, href, onSwitch, switching }: {
  campaign: Campaign; snapshot: CampaignSnapshot | null; settings: DmSettings | null; href: (id: string, screen: string) => string; onSwitch: () => void; switching: boolean;
}) {
  const c = useCopy();
  const sessions = snapshot?.sessions.length ?? 0;
  const old = settings?.runtime === "astra-primary-v1";
  return (
    <article className={s.card}>
      <div className={s.cardTop}>
        <span className={r.choiceTitle}>{campaign.title}</span>
        <RuntimeBadge settings={settings} />
      </div>
      <span className={`${r.small} ${r.muted}`}>{[campaign.subtitle, sessions ? c(`${sessions} сесс.`, `${sessions} sessions`) : null].filter(Boolean).join(" · ")}</span>
      {old && <span className={r.note}>{c("Играет на прежнем ходе Astra. Можно перевести на новый — история и сейвы сохранятся.", "Plays on the previous Astra turn. You can switch it — story and saves stay.")}</span>}
      <div className={r.row}>
        <Link className={r.btn} href={href(campaign.id, "game")}>{c("Продолжить", "Continue")}</Link>
        {old ? <button type="button" className={r.btnGhost} disabled={switching} onClick={onSwitch}>{c("Перевести на новый ход", "Switch to the new turn")}</button>
          : <Link className={r.btnGhost} href={href(campaign.id, "adventures")}>{c("Новое приключение", "New adventure")}</Link>}
      </div>
    </article>
  );
}

/** Four steps over the existing bootstrap flow: World and Hero run the existing
 * creation form (world pick, free text, AI draft sheet review); DM and Start
 * follow once the campaign exists. */
export function RegistryNewCampaign({ worlds, onClose, onCreated, preview = false, initialStep = 0, transport, bootstrapTransport }: {
  worlds: WorldCatalog | null;
  onClose: () => void;
  onCreated: () => Promise<void>;
  preview?: boolean;
  initialStep?: number;
  transport?: AdventureTransport;
  bootstrapTransport?: BootstrapTransport;
}) {
  const c = useCopy();
  const workspace = useWorkspaceData();
  const [step, setStep] = useState(initialStep);
  const [known] = useState(() => new Set((workspace.data?.campaigns ?? []).map((row) => row.id)));
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [model, setModel] = useState(dmTurnModels[0].modelId);
  // The effort starts at the selected model's own default (the same one the server resolves).
  const [effort, setEffort] = useState(() => defaultEffort(dmTurnModels[0]));
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);
  useEffect(() => {
    if (createdId || preview) return;
    const fresh = (workspace.data?.campaigns ?? []).find((row) => !known.has(row.id));
    if (fresh) queueMicrotask(() => { setCreatedId(fresh.id); setStep(2); });
  }, [workspace.data, known, createdId, preview]);
  const steps = [
    [c("Мир", "World"), c("существующий или новый", "existing or new")],
    [c("Герой", "Hero"), c("своими словами", "in your own words")],
    [c("Ведущий", "DM"), c("модель и глубина", "model and effort")],
    [c("Начало", "Start"), c("первая сцена", "the first scene")],
  ];
  const entry = dmTurnModels.find((row) => row.modelId === model) ?? dmTurnModels[0];
  const saveDm = async () => {
    if (!createdId || preview) { setSaved(true); return; }
    const current = await loadDmSettings(createdId);
    await saveDmSettings(createdId, { expectedRevision: current.revision, runtime: "dm-loop-v1", dmTurn: { providerId: entry.providerId, modelId: entry.modelId, reasoning: effort } });
    setSaved(true);
  };
  return (
    <div className={s.page}>
      <Plate eyebrow={c("Нулевая сессия", "Session zero")} title={c("Новая кампания", "New campaign")}
        aside={<button type="button" className={r.btnGhost} onClick={() => { if (!dirty || window.confirm(c("Отменить несохранённое?", "Discard unsaved changes?"))) onClose(); }}>{c("Отмена", "Cancel")}</button>} />
      <ol className={s.steps} aria-label={c("Шаги", "Steps")}>
        {steps.map(([title, sub], index) => (
          <li key={title}>
            <span className={s.step} aria-current={index === step ? "step" : undefined} data-done={index < step}>
              <span className={s.stepNum}>{index < step ? "✓" : index + 1}</span>
              <span><b>{title}</b><span className={`${r.small} ${r.muted}`}>{sub}</span></span>
            </span>
          </li>
        ))}
      </ol>
      <div className={s.newLayout}>
        <section className={s.newMain}>
          {step <= 1 && (
            <div className={r.stack}>
              <p className={r.note}>{c("Выбери мир, опиши героя своими словами — ведущий соберёт черновик листа по правилам кампании, ты его проверишь и поправишь.", "Pick a world and describe your hero in your own words — the DM drafts a sheet for the campaign's rules; you review and correct it.")}</p>
              {preview ? (
                <Panel>
                  <p className={r.note}>{c("Предпросмотр: здесь работает существующая форма создания (мир → герой → черновик листа → проверка).", "Preview: the existing creation form runs here (world → hero → draft sheet → review).")}</p>
                </Panel>
              ) : (
                <div className={s.legacyForm}>
                  <NewCampaignForm language={c.language} onDirty={(value) => { setDirty(value); if (value) setStep(1); }}
                    onCreated={onCreated} onCancel={onClose} initialWorlds={worlds ?? undefined} transport={transport} bootstrapTransport={bootstrapTransport} />
                </div>
              )}
            </div>
          )}
          {step === 2 && (
            <div className={r.stack}>
              <h2 className={r.h2}>{c("Какой будет игра?", "What kind of game?")}</h2>
              <div className={r.choices}>
                {dmTurnModels.map((row) => (
                  <button key={row.modelId} type="button" className={r.choice} aria-pressed={model === row.modelId} onClick={() => { setModel(row.modelId); setEffort(defaultEffort(row)); setSaved(false); }}>
                    <span className={r.eyebrow}>{row.providerId === "anthropic" ? "Anthropic" : "OpenAI"}</span>
                    <span className={r.choiceTitle}>{row.label}</span>
                  </button>
                ))}
              </div>
              <div className={r.segmented} role="group" aria-label={c("Глубина", "Effort")}>
                {entry.efforts.map((value) => <button key={value} type="button" className={r.segment} aria-pressed={effort === value} onClick={() => { setEffort(value); setSaved(false); }}>{effortLabel(value, c.language)}</button>)}
              </div>
              <p className={r.note}>{c("Тон истории, правила бросков и книги правил настраиваются в настройках кампании; поменять можно в любой момент.", "Story tone, roll rules and rule books live in the campaign settings; change them any time.")}</p>
              <LaterLine>{c("Записка «что мне нравится в играх» появится вместе с этапом 4.", "The “what I enjoy in games” note arrives with stage 4.")}</LaterLine>
              <div className={r.row}>
                <button type="button" className={r.btnMain} onClick={() => void saveDm().then(() => setStep(3))}>{c("Дальше →", "Next →")}</button>
                {saved && <span className={r.note}>{c("Сохранено", "Saved")}</span>}
              </div>
            </div>
          )}
          {step === 3 && (
            <div className={r.stack}>
              <h2 className={r.h2}>{c("С чего начнём?", "Where do we begin?")}</h2>
              <div className={r.choices}>
                <div className={r.choice} aria-pressed="true"><span className={r.choiceTitle}>{c("Ведущий решает", "The DM decides")}</span><span className={r.muted}>{c("Сцена из мира и твоей истории — сюрприз.", "A scene from the world and your story — a surprise.")}</span></div>
                <div className={r.choice}><span className={r.choiceTitle}>{c("Я опишу, где начинаю", "I describe where I start")}</span><span className={r.muted}>{c("Одна фраза — остальное ведущий.", "One sentence — the DM does the rest.")}</span></div>
              </div>
              <p className={r.note}>{c("Первая сцена готовится на экране приключений: там выбирается начало, длина приключения и проверяется вступление.", "The first scene is prepared on the adventures screen: choose the start and length, and review the opening.")}</p>
              {createdId ? <Link className={r.btnMain} href={`/campaigns/${encodeURIComponent(createdId)}/adventures`}>{c("Начать кампанию", "Start the campaign")}</Link>
                : <button type="button" className={r.btnMain} disabled>{c("Начать кампанию", "Start the campaign")}</button>}
            </div>
          )}
        </section>
        <aside className={s.summary}>
          <span className={r.eyebrow}>{c("Сводка", "Summary")}</span>
          <div className={r.kv}>
            <div><span>{c("Ведущий", "DM")}</span><span>{entry.label} · {effortLabel(effort, c.language)}</span></div>
            <div><span>{c("Ход", "Turn")}</span><span>{c("новый", "new loop")}</span></div>
            <div><span>{c("Картинки", "Pictures")}</span><span>{c("стиль мира", "world style")}</span></div>
          </div>
          <span className={r.note}>{c("Всё, кроме мира, можно поменять потом в настройках кампании.", "Everything but the world can change later in campaign settings.")}</span>
        </aside>
      </div>
    </div>
  );
}
