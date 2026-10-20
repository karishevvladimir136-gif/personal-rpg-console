"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Home, PawPrint, Ship, Tent, X, type LucideIcon } from "lucide-react";
import type { CampaignSnapshot, Entity } from "@/lib/persistence/contracts";
import type { PlaySnapshot } from "@/lib/gameplay/contracts";
import { heroOf, holdingsNavLabel, holdingsOf, mountsOf, statLabel, type HoldingKind, type HoldingView } from "@/lib/ui/campaign-view";
import { appendToComposerDraft, draftStorage } from "@/lib/ui/composer-draft";
import { walletOfStorage } from "@/lib/inventory/model";
import { planEquip, planMove, planUnequip, type MoveTarget } from "@/lib/inventory/owner-moves";
import { RedrawAnchor } from "./redraw-anchor";
import { useChrome, type CampaignScreenId } from "./shell";
import { holdersOf, ItemCard, ItemCell, useCardDismiss, useOwnerMoves } from "./character-screen";
import { Art, Gauge, Panel, Plate, registry as r, useCopy, WalletLine, type Copy } from "./primitives";
import s from "./holdings.module.css";

const ICONS: Record<HoldingKind, LucideIcon> = { camp: Tent, transport: Ship, mount: PawPrint, base: Home };
export function holdingKindLabel(kind: HoldingKind, c: Copy) {
  return kind === "camp" ? c("Лагерь · общий запас", "Camp · shared stash")
    : kind === "transport" ? c("Транспорт", "Transport")
      : kind === "base" ? c("База", "Base")
        : c("Ездовое животное", "Mount");
}

export function RegistryHoldings({ data, initialId, play = null }: { data: CampaignSnapshot; initialId?: string | null; play?: PlaySnapshot | null }) {
  const c = useCopy();
  const chrome = useChrome();
  const router = useRouter();
  const moves = useOwnerMoves(data, !!chrome?.href);
  const view = moves.view;
  const holdings = holdingsOf(view);
  const [selectedId, setSelectedId] = useState(initialId ?? holdings.find((row) => row.kind !== "camp")?.id ?? holdings[0].id);
  const [itemId, setItemId] = useState<string | null>(null);
  const [redraw, setRedraw] = useState<{ kind: "entity" | "item"; id: string } | null>(null);
  const [notice, setNotice] = useState("");
  // Item 30: the card closes on Escape and on a click outside it.
  useCardDismiss(!!itemId, () => setItemId(null));
  const selected = holdings.find((row) => row.id === selectedId) ?? holdings[0];
  const href = (screen: CampaignScreenId) => chrome?.href?.(screen) ?? `/campaigns/${encodeURIComponent(data.campaign.id)}/${screen}`;
  const title = holdingsNavLabel(holdings, c.language);
  const act = (text: string) => {
    if (chrome?.href) { setNotice(c(`Предпросмотр: в поле хода появится «${text}»`, `Preview: the turn box would get “${text}”`)); return; }
    if (appendToComposerDraft(draftStorage(), { campaignId: data.campaign.id, mode: "game", companionId: null, timeline: data.timeline, text }))
      router.push(href("game"));
    else setNotice(c("Сначала дождись конца текущего хода.", "Wait until the current turn finishes."));
  };
  // Owner moves without a turn (item 55): «Отдать → …» to the hero, a companion or a mount; «Надеть» on the hero.
  const ctx = { language: view.campaign.language, at: play?.worldMinutes ?? 0, newId: () => crypto.randomUUID() };
  const hero = heroOf(view, play);
  const holders = holdersOf(view, play, c);
  const thing = view.items.find((row) => row.id === itemId && row.quantity > 0) ?? null;
  const name = selected.name || selected.storage?.name || holdingKindLabel(selected.kind, c);
  const targets = (item: NonNullable<typeof thing>) => holders.filter((holder) => holder.entity && holder.target && holder.entity.id !== selected.entity?.id).map((holder) => ({
    key: holder.key, target: holder.target as MoveTarget,
    label: holder.entity!.id === hero?.id ? c("себе", "myself") : holder.kind === "mount" ? c(`седельные сумки (${holder.name})`, `saddlebags (${holder.name})`) : holder.name,
  })).filter((target) => !(item.owner_entity_id === target.key && view.storages.find((row) => row.entity_id === target.key)?.id === item.storage_id));
  return (
    <div className={s.page}>
      <Plate eyebrow={c(`${data.campaign.title} · владения партии`, `${data.campaign.title} · party holdings`)} title={title}
        sub={holdings.length > 1 ? c(`${holdings.length} записи: лагерь всегда, остальное ведущий создаёт и убирает по ходу истории`, `${holdings.length} records: the camp always, the rest the DM creates and removes as the story goes`)
          : c("Пока есть только лагерь. Транспорт, базы и ездовые появятся, когда их создаст ведущий.", "Only the camp so far. Transport, bases and mounts appear when the DM creates them.")} />
      {(moves.status || notice) && <p className={moves.status?.tone === "error" ? r.error : r.note} role="status">{moves.status?.text ?? notice}</p>}
      <div className={s.layout}>
        <nav className={s.list} aria-label={c("Владения партии", "Party holdings")}>
          {holdings.map((holding) => {
            const Icon = ICONS[holding.kind];
            return (
              <button key={holding.id} type="button" className={s.entry} aria-pressed={holding.id === selected.id} onClick={() => { setSelectedId(holding.id); setItemId(null); }}>
                <span className={s.entryIcon}><Icon size={20} aria-hidden="true" /></span>
                <span className={r.stack} style={{ gap: 0 }}>
                  <span className={r.eyebrow}>{holdingKindLabel(holding.kind, c)}</span>
                  <span className={s.entryName}>{holding.name || holding.storage?.name || holdingKindLabel(holding.kind, c)}</span>
                  <span className={`${r.small} ${r.muted}`}>{c(`${holding.items.length} предм.`, `${holding.items.length} items`)}</span>
                </span>
              </button>
            );
          })}
        </nav>
        <Detail view={view} holding={selected} itemId={thing?.id ?? null} onItem={(id) => setItemId((current) => (current === id ? null : id))} onRedraw={setRedraw} />
      </div>
      {thing && (
        <ItemCard key={thing.id} item={thing} view={view} viewerId={selected.entity?.id ?? null} wearer={hero} targets={targets(thing)} busy={moves.busy} picker={null}
          onClose={() => setItemId(null)} onRedraw={() => setRedraw({ kind: "item", id: thing.id })}
          onUse={() => act(c(`Беру из «${name}»: «${thing.name}».`, `I take the ${thing.name} from ${name}.`))}
          onEquip={hero ? async () => {
            const plan = planEquip(view, thing.id, hero.id, {}, ctx);
            if (!plan.ok && plan.kinds) moves.setStatus({ tone: "error", text: c(`${plan.reason} Вид вещи выбирается на листе персонажа.`, `${plan.reason} The kind is picked on the character sheet.`) });
            else if (await moves.run(plan)) setItemId(null);
          } : undefined}
          onUnequip={() => void moves.run(planUnequip(view, thing.id, ctx))}
          onMove={async (target, quantity) => { if (await moves.run(planMove(view, thing.id, target, quantity, ctx)) && (quantity === null || quantity === thing.quantity)) setItemId(null); }} />
      )}
      <p className={r.note}>
        {c("Прежние экраны лагеря и мест, где вы дома, остаются доступны: ", "The earlier camp and places-of-belonging screens stay available: ")}
        <Link href={href("camp")} style={{ color: "var(--brass)" }}>{c("Лагерь и отдых", "Camp and rest")}</Link>{" · "}
        <Link href={href("home")} style={{ color: "var(--brass)" }}>{c("Места, где вы дома", "Places of belonging")}</Link>
      </p>
      {redraw && (
        <>
          <button type="button" className={r.drawerScrim} aria-label={c("Закрыть", "Close")} onClick={() => setRedraw(null)} />
          <aside className={r.drawer} role="dialog" aria-modal="true" aria-label={c("Перерисовать", "Redraw")}>
            <div className={r.panelHead}>
              <h2 className={r.h2}>{c("Перерисовать", "Redraw")}</h2>
              <button type="button" className={r.iconBtn} aria-label={c("Закрыть", "Close")} onClick={() => setRedraw(null)}><X size={20} aria-hidden="true" /></button>
            </div>
            <RedrawAnchor data={data} subject={redraw} name={(redraw.kind === "entity" ? view.entities.find((row) => row.id === redraw.id)?.name : view.items.find((row) => row.id === redraw.id)?.name) ?? ""} />
          </aside>
        </>
      )}
    </div>
  );
}

/** Features, armament and people aboard (UI_DATA_NEEDS #12); a mount carries saddlebags, never riders (item 35). */
function HoldingDetails({ holding }: { holding: HoldingView }) {
  const c = useCopy();
  const details = holding.details;
  const passengers = holding.kind === "mount" ? [] : details?.passengers ?? [];
  return (
    <Panel eyebrow={holding.kind === "mount" ? c("Особенности", "Features") : c("Особенности и люди на борту", "Features and people aboard")}>
      {details && (details.features.length || details.armament || passengers.length) ? (
        <div className={r.stack} style={{ gap: 8 }}>
          {details.features.length > 0 && (
            <div className={r.kv}>{details.features.map((row) => <div key={row.name}><span>{row.name}</span><span>{row.description}</span></div>)}</div>
          )}
          {details.armament && <div className={r.row}><span className={r.eyebrow}>{c("Вооружение", "Armament")}</span><span>{details.armament}</span></div>}
          {passengers.length > 0 && (
            <div className={r.stack} style={{ gap: 4 }}>
              <span className={r.eyebrow}>{c("На борту", "Aboard")}</span>
              <div className={r.chips}>{passengers.map((row) => <span key={row.id} className={r.chip}>{row.name}</span>)}</div>
            </div>
          )}
        </div>
      ) : <p className={r.empty}>{holding.kind === "mount" ? c("Ведущий ещё не записал особенностей.", "The DM has not recorded features yet.")
        : c("Ведущий ещё не записал особенностей, вооружения или людей на борту.", "The DM has not recorded features, armament or people aboard yet.")}</p>}
    </Panel>
  );
}

function Detail({ view, holding, itemId, onItem, onRedraw }: {
  view: CampaignSnapshot; holding: HoldingView; itemId: string | null; onItem: (id: string) => void;
  onRedraw: (subject: { kind: "entity" | "item"; id: string }) => void;
}) {
  const c = useCopy();
  const entity: Entity | null = holding.entity;
  const name = holding.name || holding.storage?.name || holdingKindLabel(holding.kind, c);
  // A mount's coins ride in its saddlebags; a base or a place keeps a chest.
  const wallet = holding.kind === "mount" && entity ? mountsOf(view).find((row) => row.entity.id === entity.id)?.wallet ?? {} : holding.storage ? walletOfStorage(holding.storage) : {};
  return (
    <div className={s.detail}>
      <Panel>
        <div className={s.hero}>
          {entity ? (
            <div className={s.heroArt}>
              <Art subject={{ kind: "entity", id: entity.id }} name={entity.name} drawingLabel={c("картинка рисуется…", "picture is drawing…")} />
              <button type="button" className={s.redraw} onClick={() => onRedraw({ kind: "entity", id: entity.id })}>{c("Перерисовать", "Redraw")}</button>
            </div>
          ) : null}
          <div className={r.stack} style={{ gap: 6 }}>
            <span className={r.eyebrow}>{holdingKindLabel(holding.kind, c)}</span>
            <h2 className={s.name}>{name}</h2>
            {entity?.details && <p className={r.muted} style={{ margin: 0 }}>{entity.details}</p>}
            {!entity && <p className={r.muted} style={{ margin: 0 }}>{c("Общий запас партии: всё, что не несёт никто из героев.", "The party's shared stash: whatever no hero carries.")}</p>}
          </div>
        </div>
      </Panel>
      {entity && (
        <div className={s.columns}>
          <Panel eyebrow={c("Характеристики", "Specifications")}>
            <div className={r.stack}>
              {entity.hp !== null && <Gauge label={c("Состояние", "Condition")} value={entity.hp} max={entity.max_hp} />}
              {Object.entries(entity.stats).some(([, value]) => value !== 0) && (
                <div className={r.kv}>
                  {Object.entries(entity.stats).filter(([, value]) => value !== 0).map(([key, value]) => <div key={key}><span>{c.label(statLabel(key))}</span><span>{value}</span></div>)}
                </div>
              )}
              {entity.conditions.length > 0 && <div className={r.chips}>{entity.conditions.map((row) => <span key={row} className={r.badgeAmber}>{row}</span>)}</div>}
            </div>
          </Panel>
          <HoldingDetails holding={holding} />
        </div>
      )}
      {!entity && holding.kind === "base" && <div className={s.columns}><HoldingDetails holding={holding} /></div>}
      <Panel eyebrow={holding.storage?.name ?? c("Хранилище", "Storage")} title={c("Что лежит внутри", "What's inside")}
        action={<span className={`${r.small} ${r.muted}`}>{c(`${holding.items.length} предм.`, `${holding.items.length} items`)}</span>}>
        <div className={r.stack}>
          {(holding.kind === "mount" || Object.keys(wallet).length > 0) && <WalletLine wallet={wallet} />}
          {holding.items.length ? (
            <div className={r.grid}>
              {holding.items.map((item) => <ItemCell key={item.id} item={item} pressed={item.id === itemId} onPick={() => onItem(item.id)} />)}
            </div>
          ) : <p className={r.empty}>{holding.storage ? c("Пусто.", "Empty.") : c("У лагеря пока нет хранилища в записях.", "The camp has no storage record yet.")}</p>}
        </div>
      </Panel>
    </div>
  );
}
