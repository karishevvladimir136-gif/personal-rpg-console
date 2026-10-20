"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { BookOpen } from "lucide-react";
import type { CampaignSnapshot } from "@/lib/persistence/contracts";
import type { PlaySnapshot } from "@/lib/gameplay/contracts";
import { appendToComposerDraft, draftStorage } from "@/lib/ui/composer-draft";
import { anchorFor } from "@/lib/visual-frame/pictures";
import { battleMapOf, type Live2dBoard } from "@/lib/live2d/contracts";
import { fightCard } from "@/lib/live2d/battle/battlefield";
import { usePictures } from "../../registry/live-frames";
import { useChrome, type CampaignScreenId } from "../../registry/shell";
import { registry as r, useCopy } from "../../registry/primitives";
import { activeEncounter, battleView, damageFloats, endedEncounter, hpOf, initials, latestCombatChanges, zoneRowOf, type BattleView } from "./battle-model";
import { BattleMap, type Float, type Template } from "./battle-map";
import s from "./battle.module.css";

// The combat screen (Part 2, «как в Friends & Fables»): the initiative ribbon,
// the field as zones or as the map, the fight's log, the target's card, the
// hero's footer, the reaction card, the end-of-fight card. The DM and the rules
// decide; the records remember; the screen shows and turns clicks into words.

export function BattleScreen({ snapshot, play, board, images, preview = false, onBack, initialMode = "map" }: {
  snapshot: CampaignSnapshot; play: PlaySnapshot | null; board: Live2dBoard;
  /** Sample art by picture ID (previews). */
  images?: Record<string, string>; preview?: boolean; onBack?: () => void; initialMode?: "zones" | "map";
}) {
  const c = useCopy();
  const chrome = useChrome();
  const pictures = usePictures();
  const campaignId = snapshot.campaign.id;
  const href = (screen: CampaignScreenId) => chrome?.href?.(screen) ?? `/campaigns/${encodeURIComponent(campaignId)}/${screen}`;
  const [mode, setMode] = useState<"zones" | "map">(initialMode);
  const [target, setTarget] = useState<string | null>(null);
  const [template, setTemplate] = useState<Template>(null);
  const [note, setNote] = useState<{ text: string; kind: "ok" | "warn" } | null>(null);
  const [phone, setPhone] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const query = window.matchMedia("(max-width: 480px)");
    const apply = () => setPhone(query.matches);
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);

  const urlFor = (pictureId: string | null) => {
    if (!pictureId) return null;
    if (images && pictureId in images) return images[pictureId];
    const picture = pictures?.board.pictures.find((row) => row.id === pictureId) ?? null;
    return picture && pictures ? pictures.urlFor(picture) : null;
  };
  const portraitUrl = (entityId: string | null) => (entityId ? urlFor(anchorFor({ pictures: pictures?.board.pictures ?? [] }, { kind: "entity", id: entityId }, "portrait").picture?.id ?? null) : null);

  const encounter = activeEncounter(play);
  const ended = endedEncounter(play);
  const view = useMemo(() => (play && encounter ? battleView(play, snapshot, encounter) : null), [play, snapshot, encounter]);
  const endedView = useMemo(() => (play && ended ? battleView(play, snapshot, ended) : null), [play, snapshot, ended]);

  // Floating numbers: the latest turn's hits and misses, shown once each.
  const shown = useRef(new Set<string>());
  const [floats, setFloats] = useState<Float[]>([]);
  const latest = latestCombatChanges(play);
  useEffect(() => {
    if (!latest) return;
    const fresh = damageFloats(latest.turn.id, latest.lines).filter((row) => !shown.current.has(row.key));
    if (!fresh.length) return;
    for (const row of fresh) shown.current.add(row.key);
    setFloats((prior) => [...prior, ...fresh]);
    const timer = setTimeout(() => setFloats((prior) => prior.filter((row) => !fresh.some((f) => f.key === row.key))), 1800);
    return () => clearTimeout(timer);
  }, [latest]);

  const intent = (text: string) => {
    if (preview) { setNote({ text: c(`В поле действия: «${text}»`, `In the action box: “${text}”`), kind: "ok" }); return; }
    const written = appendToComposerDraft(draftStorage(), { campaignId, mode: "game", companionId: null, timeline: snapshot.timeline, text });
    setNote(written
      ? { text: c(`Записано в поле действия: «${text}». Ведущий решит.`, `Written into the action box: “${text}”. The DM decides.`), kind: "ok" }
      : { text: c("Ход ещё идёт: поле действия занято.", "A turn is in flight: the action box is busy."), kind: "warn" });
  };
  const textLink = <Link className={s.headLink} href={href("game")}><BookOpen size={16} aria-hidden="true" />{c("Текст", "Text")}</Link>;
  const back = onBack ? <button type="button" className={s.headLink} onClick={onBack}>{c("К карте мира", "To the world map")}</button> : null;

  if (!view) {
    return (
      <div className={s.screen}>
        <div className={s.head}><h2>{c("Боя нет", "No fight")}</h2><span>{c("Когда ведущий начнёт бой, здесь появятся порядок хода и поле.", "When the DM starts a fight, the order and the field appear here.")}</span>{back}{textLink}</div>
        {endedView && <EndCard view={endedView} />}
      </div>
    );
  }
  const { field, fighters, hero, active } = view;
  const place = field.locationId ? snapshot.locations.find((row) => row.id === field.locationId) ?? null : null;
  const art = urlFor(field.locationId ? battleMapOf(board, field.locationId)?.pictureId ?? null : null);
  const ambient = c.language === "ru" ? { bright: "светло", dim: "полумрак", dark: "темно" }[field.ambient] : field.ambient;
  const targetFighter = fighters.find((row) => row.participantId === target) ?? view.foes.find((row) => row.participantId === active?.participantId) ?? view.foes[0] ?? null;
  const reaction = field.pendingReaction ? fighters.find((row) => row.participantId === field.pendingReaction!.targetId) ?? null : null;
  const yourTurn = !!hero && active?.participantId === hero.participantId;
  const logLines = [...field.log.map((row) => ({ key: `${row.round}:${row.actor}:${row.what}:${row.result}`, text: `${c("р.", "r.")} ${row.round} · ${row.actor} · ${row.what} → ${row.result}` })),
    ...(latest?.lines ?? []).map((row, index) => ({ key: `t:${index}`, text: row.summary }))];

  return (
    <div className={s.screen}>
      <div className={s.head}>
        <h2>{c("Бой", "Combat")} · {c("раунд", "round")} {encounter!.round}</h2>
        <span>{place?.name ?? ""}{place ? " · " : ""}{ambient}{active ? ` · ${c("ходит", "to act")}: ${active.name}` : ""}</span>
        {back}{textLink}
      </div>
      <div className={s.ribbon} role="group" aria-label={c("Порядок хода", "Initiative order")}>
        {fighters.map((row) => {
          const hp = hpOf(row, snapshot);
          const down = row.combatant.conditions.some((word) => /dead|unconscious|без сознания|мертв|fled|бежал/iu.test(word)) || (hp !== null && hp.current <= 0);
          const url = portraitUrl(row.entityId);
          const foe = row.combatant.side !== "party";
          return (
            <button key={row.participantId} type="button" data-slot={row.participantId}
              className={[s.slot, foe ? s.foe : s.ally, foe ? s.slotFoe : "", active?.participantId === row.participantId ? s.slotActive : "", target === row.participantId ? s.slotTarget : "", down ? s.slotDown : ""].filter(Boolean).join(" ")}
              aria-current={active?.participantId === row.participantId ? "true" : undefined} aria-pressed={foe ? target === row.participantId : undefined}
              onClick={() => { if (foe) setTarget(target === row.participantId ? null : row.participantId); }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {url ? <img className={s.portrait} src={url} alt="" /> : <span className={s.portrait} aria-hidden="true">{initials(row.name)}</span>}
              {row.combatant.initiative !== null && <span className={s.init} aria-label={c("инициатива", "initiative")}>{row.combatant.initiative}</span>}
              <span className={s.slotName}>{row.name}</span>
            </button>
          );
        })}
      </div>
      <div className={s.body}>
        <div className={s.fieldPanel}>
          <div className={s.toolbar}>
            <span className={s.switch} role="group" aria-label={c("Вид поля", "Field view")}>
              <button type="button" aria-pressed={mode === "zones"} onClick={() => setMode("zones")}>{c("Зоны", "Zones")}</button>
              <button type="button" aria-pressed={mode === "map"} onClick={() => setMode("map")}>{c("Карта", "Map")}</button>
            </span>
            {mode === "map" && (
              <span className={r.row} role="group" aria-label={c("Шаблон области", "Area template")}>
                <button type="button" className={r.chipButton} aria-pressed={template === "sphere"} onClick={() => setTemplate(template === "sphere" ? null : "sphere")}>{c("Шар 20 фт", "Sphere 20 ft")}</button>
                <button type="button" className={r.chipButton} aria-pressed={template === "line"} onClick={() => setTemplate(template === "line" ? null : "line")}>{c("Линия 30 фт", "Line 30 ft")}</button>
              </span>
            )}
            {mode === "map" && <span>{c("Перетащи свою фишку — ход встанет в поле ввода.", "Drag your token — the move goes into the action box.")}</span>}
          </div>
          {mode === "map"
            ? <BattleMap view={view} snapshot={snapshot} art={art} portraitUrl={portraitUrl} target={target} onTarget={setTarget} template={template} floats={floats} intent={intent} phone={phone} />
            : <Zones view={view} snapshot={snapshot} target={target} onTarget={setTarget} />}
          {reaction && reaction.combatant.side === "party" && field.pendingReaction && (
            <div className={s.reaction} role="dialog" aria-label={c("Реакция", "Reaction")} style={{ position: "relative", inset: "auto", background: "transparent" }}>
              <div className={s.reactionCard}>
                <b>{c("Реакция", "Reaction")}: {reaction.name}</b>
                <p>{field.pendingReaction.trigger}</p>
                <div className={s.options}>
                  {field.pendingReaction.options.map((option) => (
                    <button key={option} type="button" className={r.btnMain} data-reaction={option} onClick={() => intent(c.language === "ru" ? `Реакция: ${option}` : `Reaction: ${option}`)}>{option}</button>
                  ))}
                </div>
              </div>
            </div>
          )}
          <div className={s.log} aria-label={c("Ход боя", "Fight log")}>
            <span className={s.logTitle}>{c("Ход боя", "Fight log")}</span>
            {logLines.length ? logLines.slice(-20).map((row) => <span key={row.key}>{row.text}</span>) : <span>{c("Пока тихо.", "Quiet so far.")}</span>}
          </div>
        </div>
        <aside className={s.aside}>
          {targetFighter && <TargetCard fighter={targetFighter} snapshot={snapshot} portrait={portraitUrl(targetFighter.entityId)} view={view} />}
          {hero && (
            <div className={[s.card, yourTurn ? s.yourTurn : ""].join(" ")} aria-label={c("Твой ход", "Your turn")}>
              <div className={s.cardHead}><b>{yourTurn ? c(`Твой ход, ${hero.name}`, `Your turn, ${hero.name}`) : hero.name}</b>{!yourTurn && active && <span>{c("ходит", "to act")}: {active.name}</span>}</div>
              <div className={s.economy}>
                {[[c("Действие", "Action"), hero.combatant.economy.action], [c("Бонусное", "Bonus"), hero.combatant.economy.bonus], [c("Реакция", "Reaction"), hero.combatant.economy.reaction]].map(([label, left]) => (
                  <span key={String(label)}><i className={[s.dot, left ? "" : s.dotSpent].join(" ")} aria-hidden="true" />{label}</span>
                ))}
                <span><i className={[s.dot, hero.combatant.economy.moveFeet > 0 ? "" : s.dotSpent].join(" ")} aria-hidden="true" />{c("Движение", "Movement")} {hero.combatant.economy.moveFeet} {c("фт", "ft")}</span>
              </div>
              {hero.combatant.conditions.length > 0 && <div className={s.conds}>{hero.combatant.conditions.map((word) => <span key={word} className={r.chip}>{word}</span>)}</div>}
              {hero.combatant.deathSaves && <span className={r.small}>{c("Спасброски от смерти", "Death saves")}: {"✓".repeat(hero.combatant.deathSaves.success)}{"○".repeat(Math.max(0, 3 - hero.combatant.deathSaves.success))} · {"✗".repeat(hero.combatant.deathSaves.fail)}{"○".repeat(Math.max(0, 3 - hero.combatant.deathSaves.fail))}</span>}
              <p className={`${r.small} ${r.muted}`} style={{ margin: 0 }}>{c("Опиши, что делаешь — кнопки только подсказки.", "Describe what you do — buttons are only hints.")}</p>
            </div>
          )}
        </aside>
      </div>
      {note && <p className={`${s.note} ${note.kind === "warn" ? s.warn : ""}`} role="status">{note.text} {note.kind === "ok" && !preview && <Link href={href("game")} style={{ color: "var(--brass)" }}>{c("Открыть текст", "Open the text")}</Link>}</p>}
    </div>
  );
}

/** The zones view: three rows from the same coordinates the map draws. */
function Zones({ view, snapshot, target, onTarget }: { view: BattleView; snapshot: CampaignSnapshot; target: string | null; onTarget: (id: string | null) => void }) {
  const c = useCopy();
  const rows = [
    { key: "adjacent", title: c("Вплотную", "Adjacent"), sub: c("до 5 фт", "up to 5 ft") },
    { key: "near", title: c("Рядом", "Near"), sub: c("~30 фт", "~30 ft") },
    { key: "far", title: c("Далеко", "Far"), sub: c("60 фт+", "60 ft+") },
  ] as const;
  return (
    <div className={s.zones} aria-label={c("Зоны", "Zones")}>
      {rows.map((row) => {
        const here = view.fighters.filter((fighter) => fighter.participantId !== view.hero?.participantId && zoneRowOf(view, fighter).row === row.key);
        return (
          <div key={row.key} className={s.zone} data-zone={row.key}>
            <span className={s.zoneTitle}>{row.title}<small>{row.sub}</small></span>
            <div className={s.zoneChips}>
              {here.length ? here.map((fighter) => {
                const zone = zoneRowOf(view, fighter);
                const hp = hpOf(fighter, snapshot);
                const foe = fighter.combatant.side !== "party";
                return (
                  <button key={fighter.participantId} type="button" className={[s.chip, foe ? s.chipFoe : s.chipAlly].join(" ")} data-zone-chip={fighter.participantId} aria-pressed={foe ? target === fighter.participantId : undefined}
                    onClick={() => { if (foe) onTarget(target === fighter.participantId ? null : fighter.participantId); }}>
                    {fighter.name}{hp && foe ? ` ${hp.current}/${hp.max}` : ""}
                    {zone.feet !== null && <span className={s.chipTag}>{zone.feet} {c("фт", "ft")}</span>}
                    {zone.cover && <span className={s.chipTag}>{c("за укрытием", "behind cover")}</span>}
                    {zone.hidden && <span className={s.chipTag}>{c("не видно", "out of sight")}</span>}
                    {fighter.combatant.conditions.slice(0, 2).map((word) => <span key={word} className={s.chipTag}>{word}</span>)}
                  </button>
                );
              }) : <span className={`${r.small} ${r.muted}`}>—</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** The target's card: the portrait, HP as numbers, conditions, what is known, the intent when noticed. */
function TargetCard({ fighter, snapshot, portrait, view }: { fighter: BattleView["fighters"][number]; snapshot: CampaignSnapshot; portrait: string | null; view: BattleView }) {
  const c = useCopy();
  const hp = hpOf(fighter, snapshot);
  const foe = fighter.combatant.side !== "party";
  const noticedBy = fighter.combatant.intent?.noticedBy ? view.fighters.find((row) => row.entityId === fighter.combatant.intent!.noticedBy)?.name ?? snapshot.entities.find((row) => row.id === fighter.combatant.intent!.noticedBy)?.name ?? null : null;
  const unknown = Math.max(0, 3 - fighter.combatant.known.length);
  return (
    <div className={s.card} aria-label={c("Цель", "Target")} data-target={fighter.participantId}>
      <div className={s.cardHead}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {portrait ? <img className={s.portrait} src={portrait} alt="" /> : <span className={s.portrait} aria-hidden="true">{initials(fighter.name)}</span>}
        <span style={{ display: "grid" }}><b>{fighter.name}</b><span>{foe ? c("противник", "enemy") : c("союзник", "ally")}{fighter.combatant.initiative !== null ? ` · ${c("инициатива", "initiative")} ${fighter.combatant.initiative}` : ""}</span></span>
      </div>
      {hp ? (
        <>
          <div className={s.bar} role="meter" aria-valuemin={0} aria-valuemax={hp.max} aria-valuenow={Math.max(0, hp.current)} aria-label={c("Хиты", "Hit points")}><div className={[s.barFill, foe ? "" : s.barAlly].join(" ")} style={{ width: `${Math.max(0, Math.min(100, (hp.current / hp.max) * 100))}%` }} /></div>
          <span className={s.barNum}>{hp.current} / {hp.max}</span>
        </>
      ) : <span className={`${r.small} ${r.muted}`}>{c("Хиты неизвестны", "Hit points unknown")}</span>}
      {fighter.combatant.conditions.length > 0 && <div className={s.conds}>{fighter.combatant.conditions.map((word) => <span key={word} className={r.chip}>{word}</span>)}</div>}
      {foe && (
        <>
          <span className={s.logTitle}>{c("Что известно", "What is known")}</span>
          <ul className={s.known}>
            {fighter.combatant.known.filter((row) => row.revealed).map((row) => <li key={row.text}>{row.text}</li>)}
            {Array.from({ length: unknown + fighter.combatant.known.filter((row) => !row.revealed).length }, (_, index) => <li key={`u${index}`} className={s.unknown}>???</li>)}
          </ul>
          {fighter.combatant.intent && noticedBy && <div className={s.intent}><b>{c("Замысел", "Intent")}</b> · {c("заметил(а)", "noticed by")} {noticedBy}: {fighter.combatant.intent.text}</div>}
        </>
      )}
    </div>
  );
}

/** The end-of-fight card: damage dealt and taken, hits and misses, close calls, the fallen. */
function EndCard({ view }: { view: BattleView }) {
  const c = useCopy();
  const card = fightCard({ round: view.encounter.round, log: view.field.log, fighters: view.fighters });
  const outcome = view.encounter.outcome ?? "";
  return (
    <div className={[s.card, s.endCard].join(" ")} aria-label={c("Итог боя", "Fight card")} data-end-card="true">
      <div className={s.cardHead}><b>{c("Бой окончен", "The fight is over")}</b><span>{outcome}{view.encounter.public_summary ? ` · ${view.encounter.public_summary}` : ""}</span></div>
      <div className={s.endStats}>
        <span className={s.endStat}><b>{card.rounds}</b><span>{c("раундов", "rounds")}</span></span>
        <span className={s.endStat}><b>{card.dealt}</b><span>{c("нанесено", "dealt")}</span></span>
        <span className={s.endStat}><b>{card.taken}</b><span>{c("получено", "taken")}</span></span>
        <span className={s.endStat}><b>{card.hits}/{card.hits + card.misses}</b><span>{c("попаданий", "hits")}{card.crits ? ` · ${card.crits} ${c("крит.", "crit")}` : ""}</span></span>
      </div>
      {card.closeCalls.length > 0 && <span className={r.small}>{c("На грани", "Close calls")}: {card.closeCalls.join(", ")}</span>}
      {card.fallen.length > 0 && <span className={r.small}>{c("Повержены", "Fallen")}: {card.fallen.join(", ")}</span>}
    </div>
  );
}
