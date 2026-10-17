"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Home, PawPrint, Ship, Tent, X, type LucideIcon } from "lucide-react";
import type { CampaignSnapshot } from "@/lib/persistence/contracts";
import { holdingsNavLabel, holdingsOf, statLabel, type HoldingKind, type HoldingView } from "@/lib/ui/campaign-view";
import { appendToComposerDraft, draftStorage } from "@/lib/ui/composer-draft";
import { RedrawAnchor } from "./redraw-anchor";
import { useChrome, type CampaignScreenId } from "./shell";
import { ItemCard, ItemCell } from "./character-screen";
import { Art, Gauge, Panel, Plate, registry as r, useCopy, type Copy } from "./primitives";
import s from "./holdings.module.css";

const ICONS: Record<HoldingKind, LucideIcon> = { camp: Tent, transport: Ship, mount: PawPrint, base: Home };
export function holdingKindLabel(kind: HoldingKind, c: Copy) {
  return kind === "camp" ? c("Лагерь · общий запас", "Camp · shared stash")
    : kind === "transport" ? c("Транспорт", "Transport")
      : kind === "base" ? c("База", "Base")
        : c("Ездовое животное", "Mount");
}

export function RegistryHoldings({ data, initialId }: { data: CampaignSnapshot; initialId?: string | null }) {
  const c = useCopy();
  const chrome = useChrome();
  const router = useRouter();
  const holdings = holdingsOf(data);
  const [selectedId, setSelectedId] = useState(initialId ?? holdings.find((row) => row.kind !== "camp")?.id ?? holdings[0].id);
  const [itemId, setItemId] = useState<string | null>(null);
  const [redraw, setRedraw] = useState<{ kind: "entity" | "item"; id: string } | null>(null);
  const [notice, setNotice] = useState("");
  const selected = holdings.find((row) => row.id === selectedId) ?? holdings[0];
  const href = (screen: CampaignScreenId) => chrome?.href?.(screen) ?? `/campaigns/${encodeURIComponent(data.campaign.id)}/${screen}`;
  const title = holdingsNavLabel(holdings, c.language);
  const act = (text: string) => {
    if (chrome?.href) { setNotice(c(`Предпросмотр: в поле хода появится «${text}»`, `Preview: the turn box would get “${text}”`)); return; }
    if (appendToComposerDraft(draftStorage(), { campaignId: data.campaign.id, mode: "game", companionId: null, timeline: data.timeline, text }))
      router.push(href("game"));
    else setNotice(c("Сначала дождись конца текущего хода.", "Wait until the current turn finishes."));
  };
  return (
    <div className={s.page}>
      <Plate eyebrow={c(`${data.campaign.title} · владения партии`, `${data.campaign.title} · party holdings`)} title={title}
        sub={holdings.length > 1 ? c(`${holdings.length} записи: лагерь всегда, остальное ведущий создаёт и убирает по ходу истории`, `${holdings.length} records: the camp always, the rest the DM creates and removes as the story goes`)
          : c("Пока есть только лагерь. Транспорт, базы и ездовые появятся, когда их создаст ведущий.", "Only the camp so far. Transport, bases and mounts appear when the DM creates them.")} />
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
        <Detail holding={selected} itemId={itemId} onItem={setItemId}
          onRedraw={setRedraw} onAct={act} />
      </div>
      {notice && <p className={r.note} role="status">{notice}</p>}
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
            <RedrawAnchor data={data} subject={redraw} name={(redraw.kind === "entity" ? data.entities.find((row) => row.id === redraw.id)?.name : data.items.find((row) => row.id === redraw.id)?.name) ?? ""} />
          </aside>
        </>
      )}
    </div>
  );
}

/** Features, armament and people aboard (UI_DATA_NEEDS #12). */
function HoldingDetails({ holding }: { holding: HoldingView }) {
  const c = useCopy();
  const details = holding.details;
  return (
    <Panel eyebrow={c("Особенности и люди на борту", "Features and people aboard")}>
      {details && (details.features.length || details.armament || details.passengers.length) ? (
        <div className={r.stack} style={{ gap: 8 }}>
          {details.features.length > 0 && (
            <div className={r.kv}>{details.features.map((row) => <div key={row.name}><span>{row.name}</span><span>{row.description}</span></div>)}</div>
          )}
          {details.armament && <div className={r.row}><span className={r.eyebrow}>{c("Вооружение", "Armament")}</span><span>{details.armament}</span></div>}
          {details.passengers.length > 0 && (
            <div className={r.stack} style={{ gap: 4 }}>
              <span className={r.eyebrow}>{c("На борту", "Aboard")}</span>
              <div className={r.chips}>{details.passengers.map((row) => <span key={row.id} className={r.chip}>{row.name}</span>)}</div>
            </div>
          )}
        </div>
      ) : <p className={r.empty}>{c("Ведущий ещё не записал особенностей, вооружения или людей на борту.", "The DM has not recorded features, armament or people aboard yet.")}</p>}
    </Panel>
  );
}

function Detail({ holding, itemId, onItem, onRedraw, onAct }: {
  holding: HoldingView; itemId: string | null; onItem: (id: string) => void;
  onRedraw: (subject: { kind: "entity" | "item"; id: string }) => void; onAct: (text: string) => void;
}) {
  const c = useCopy();
  const entity = holding.entity;
  const selected = holding.items.find((item) => item.id === itemId) ?? holding.items[0] ?? null;
  const name = holding.name || holding.storage?.name || holdingKindLabel(holding.kind, c);
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
              {Object.keys(entity.stats).length > 0 && (
                <div className={r.kv}>
                  {Object.entries(entity.stats).map(([key, value]) => <div key={key}><span>{c.label(statLabel(key))}</span><span>{value}</span></div>)}
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
        {holding.items.length ? (
          <div className={r.stack}>
            <div className={r.grid}>
              {holding.items.map((item) => <ItemCell key={item.id} item={item} pressed={item.id === selected?.id} onPick={() => onItem(item.id)} />)}
            </div>
            {selected && (
              <ItemCard item={selected} entity={null} onRedraw={() => onRedraw({ kind: "item", id: selected.id })}
                onUse={() => onAct(c(`Беру из «${name}»: «${selected.name}».`, `I take the ${selected.name} from ${name}.`))}
                onGive={() => onAct(c(`Передаю «${selected.name}» из «${name}» `, `I hand the ${selected.name} from ${name} to `))} />
            )}
          </div>
        ) : <p className={r.empty}>{holding.storage ? c("Пусто.", "Empty.") : c("У лагеря пока нет хранилища в записях.", "The camp has no storage record yet.")}</p>}
      </Panel>
    </div>
  );
}
