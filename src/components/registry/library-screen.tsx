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
import { loadDmSettings, saveDmSettings, type DmSettings } from "@/lib/gameplay/dm-settings-client";
import { characterViewModel } from "@/lib/character-view-model";
import { currentPlace, currentSession, heroOf, sessionNumber } from "@/lib/ui/campaign-view";
import { effortLabel } from "@/lib/ui/effort";
import { CampaignWizard, type WizardPreview } from "../bootstrap/wizard";
import { useWorkspaceData } from "../persistence-context";
import { dmModelLabel } from "./shell";
import { Art, Panel, registry as r, useCopy } from "./primitives";
import s from "./library.module.css";

export type LibraryPreview = {
  campaigns: Campaign[];
  snapshots: Record<string, CampaignSnapshot>;
  dmSettings: Record<string, DmSettings>;
  worlds: WorldCatalog;
  href: (campaignId: string, screen: string) => string;
};

const campaignHref = (id: string, screen: string) => `/campaigns/${encodeURIComponent(id)}/${screen}`;

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
              {(world.campaignCount !== undefined || world.rulesLabel || world.hasVisualStyle) && (
                <span className={`${r.small} ${r.muted}`}>{[world.campaignCount !== undefined ? c(`кампаний: ${world.campaignCount}`, `campaigns: ${world.campaignCount}`) : null,
                  world.rulesLabel ?? null, world.hasVisualStyle ? c("стиль задан", "visual style set") : null].filter(Boolean).join(" · ")}</span>
              )}
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
      <span className={`${r.small} ${r.muted}`}>{[campaign.subtitle, sessions ? c(`${sessions} сесс.`, `${sessions} sessions`) : null,
        campaign.play_minutes ? c(`${Math.round(campaign.play_minutes / 60 * 10) / 10} ч игры`, `${Math.round(campaign.play_minutes / 60 * 10) / 10} h played`) : null].filter(Boolean).join(" · ")}</span>
      {campaign.status === "finished" && <span className={r.badgeAmber}>{c("завершена", "finished")}</span>}
      {old && <span className={r.note}>{c("Играет на прежнем ходе Astra. Можно перевести на новый — история и сейвы сохранятся.", "Plays on the previous Astra turn. You can switch it — story and saves stay.")}</span>}
      <div className={r.row}>
        <Link className={r.btn} href={href(campaign.id, "game")}>{c("Продолжить", "Continue")}</Link>
        {old ? <button type="button" className={r.btnGhost} disabled={switching} onClick={onSwitch}>{c("Перевести на новый ход", "Switch to the new turn")}</button>
          : <Link className={r.btnGhost} href={href(campaign.id, "adventures")}>{c("Новое приключение", "New adventure")}</Link>}
      </div>
    </article>
  );
}

/** Fix run F (item 21): the new-campaign wizard in story order — Мир → Герой → Приключение → Ведущий → Первая сцена
 * (src/components/bootstrap/wizard.tsx). The preview shows each step over synthetic records; nothing is sent. */
export function RegistryNewCampaign({ worlds, onClose, onCreated, preview = false, initialStep = 0, transport, bootstrapTransport, wizardPreview }: {
  worlds: WorldCatalog | null;
  onClose: () => void;
  onCreated: () => Promise<void>;
  preview?: boolean;
  initialStep?: number;
  transport?: AdventureTransport;
  bootstrapTransport?: BootstrapTransport;
  wizardPreview?: WizardPreview;
}) {
  const c = useCopy();
  return (
    <CampaignWizard language={c.language} worlds={worlds} onClose={onClose} onCreated={onCreated} initialStep={initialStep}
      preview={preview ? wizardPreview ?? {} : null} transport={transport} bootstrapTransport={bootstrapTransport} />
  );
}
