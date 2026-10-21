"use client";

import { useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import type { CampaignSnapshot } from "@/lib/persistence/contracts";
import { adjacentIds, caught, lineCells, lineTemplateCells, lightAt, moveCost, sight, sphereCells, type Cell } from "@/lib/live2d/battle/geometry";
import type { Feature } from "@/lib/live2d/battle/contracts";
import { useCopy } from "../../registry/primitives";
import { hpOf, initials, type BattleView } from "./battle-model";
import s from "./battle.module.css";
import { conditionWord, conditionsText } from "@/lib/live2d/battle/words";

// The battle map (Part 2): the top-down picture under a 5-ft grid, the features
// (cover, difficult ground, light, fire, walls, ledges), light and line of sight
// from the hero, tokens that glide, floating numbers, the hero's drag that
// previews a path and writes the intent into the action box, area templates.
// Nothing here moves anyone: the DM records, the records remember, the map shows.

export type Template = "sphere" | "line" | null;
export type Float = { key: string; name: string; text: string; crit: boolean; miss: boolean };

export function BattleMap({ view, snapshot, art, portraitUrl, target, onTarget, template, floats, intent, phone }: {
  view: BattleView; snapshot: CampaignSnapshot; art: string | null;
  portraitUrl: (entityId: string | null) => string | null;
  target: string | null; onTarget: (participantId: string | null) => void;
  template: Template; floats: Float[]; intent: (text: string) => void; phone: boolean;
}) {
  const c = useCopy();
  const { field, fighters, hero } = view;
  const { cols, rows, feetPerCell } = field.grid;
  const wrap = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<Cell | null>(null);
  const [hover, setHover] = useState<Cell | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const panStart = useRef<{ x: number; y: number; px: number; py: number } | null>(null);

  const heroX = hero?.placement.x ?? null, heroY = hero?.placement.y ?? null;
  const heroCell = useMemo<Cell | null>(() => (heroX !== null && heroY !== null ? { x: heroX, y: heroY } : null), [heroX, heroY]);
  const others = useMemo(() => fighters.filter((row) => row.placement.x !== null).map((row) => ({ id: row.participantId, placement: row.placement })), [fighters]);
  const cellAt = (event: ReactPointerEvent): Cell | null => {
    const bounds = wrap.current?.getBoundingClientRect();
    if (!bounds || !bounds.width || !bounds.height) return null;
    const x = Math.floor(((event.clientX - bounds.left) / bounds.width) * cols), y = Math.floor(((event.clientY - bounds.top) / bounds.height) * rows);
    return x >= 0 && y >= 0 && x < cols && y < rows ? { x, y } : null;
  };
  const featureAt = (cell: Cell): Feature | null => field.features.find((row) => row.kind !== "elevation" && row.cells.some(([x, y]) => x === cell.x && y === cell.y)) ?? field.features.find((row) => row.cells.some(([x, y]) => x === cell.x && y === cell.y)) ?? null;

  // The shading, computed once per field: dark cells, dim cells, cells the hero cannot see.
  const shade = useMemo(() => {
    const dark: Cell[] = [], dim: Cell[] = [], blind: Cell[] = [];
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      const cell = { x, y };
      if (field.ambient !== "bright") { const light = lightAt(field, cell).light; if (light === "dark") dark.push(cell); else if (light === "dim") dim.push(cell); }
      if (heroCell && !(heroCell.x === x && heroCell.y === y) && !sight(field, heroCell, cell).visible) blind.push(cell);
    }
    return { dark, dim, blind };
  }, [field, cols, rows, heroCell]);

  // The drag preview: the path, its length against the movement left, the opportunity attacks.
  const preview = useMemo(() => {
    if (!drag || !heroCell || !hero) return null;
    const cost = moveCost(field, heroCell, drag);
    const left = hero.combatant.economy.moveFeet;
    const foes = adjacentIds(field, heroCell, others.filter((row) => fighters.find((f) => f.participantId === row.id)?.combatant.side !== "party"))
      .filter((id) => { const foe = others.find((row) => row.id === id)!; return Math.max(Math.abs(drag.x - foe.placement.x!), Math.abs(drag.y - foe.placement.y!)) > 1; });
    return { cells: lineCells(heroCell, drag).slice(1), feet: cost.feet, left, over: cost.feet > left || !!cost.blocked, blocked: cost.blocked, foes };
  }, [drag, heroCell, hero, field, others, fighters]);
  const templateCells = useMemo(() => {
    if (!template || !hover) return [];
    return template === "sphere" ? sphereCells(field, hover, 20) : heroCell ? lineTemplateCells(field, heroCell, hover, 30) : [];
  }, [template, hover, field, heroCell]);
  const caughtNames = useMemo(() => caught(templateCells, others).map((id) => fighters.find((row) => row.participantId === id)?.name ?? "").filter(Boolean), [templateCells, others, fighters]);

  const release = (cell: Cell | null) => {
    if (!drag || !preview || !heroCell) { setDrag(null); return; }
    setDrag(null);
    const to = cell ?? drag;
    if (to.x === heroCell.x && to.y === heroCell.y) return;
    const feature = featureAt(to);
    const feet = moveCost(field, heroCell, to).feet;
    intent(feature
      ? (c.language === "ru" ? `Подхожу к ${feature.label}, ${feet} фт.` : `I approach ${feature.label}, ${feet} ft.`)
      : (c.language === "ru" ? `Иду в клетку (${to.x}, ${to.y}), ${feet} фт.` : `I move to cell (${to.x}, ${to.y}), ${feet} ft.`));
  };
  const place = (cell: Cell) => {
    if (!template || !templateCells.length) return;
    const names = caughtNames.length ? caughtNames.join(", ") : c.language === "ru" ? "никого" : "nobody";
    intent(c.language === "ru" ? `${template === "sphere" ? "Шар" : "Линия"} в точку (${cell.x}, ${cell.y}) — в области: ${names}.` : `${template === "sphere" ? "Sphere" : "Line"} at (${cell.x}, ${cell.y}) — in the area: ${names}.`);
  };

  const pct = (cell: number, span: number) => `${((cell + 0.5) / span) * 100}%`;
  const cellRect = (cell: Cell, className: string, key: string) => <rect key={key} className={className} x={cell.x} y={cell.y} width={1} height={1} />;
  const lightSources = field.features.filter((row) => row.kind === "light" || row.kind === "burning");

  return (
    <div className={s.fieldPanel}>
      <div ref={wrap} className={s.mapWrap} style={{ aspectRatio: `${cols} / ${rows}` }} aria-label={c("Карта боя", "Battle map")}
        onPointerMove={(event) => {
          if (panStart.current && phone && !drag) { setPan({ x: panStart.current.px + (event.clientX - panStart.current.x), y: panStart.current.py + (event.clientY - panStart.current.y) }); return; }
          const cell = cellAt(event);
          if (cell) { setHover(cell); if (drag) setDrag(cell); }
        }}
        onPointerUp={(event) => { panStart.current = null; if (drag) release(cellAt(event)); }}
        onPointerCancel={() => { panStart.current = null; setDrag(null); }}
        onPointerLeave={() => { if (!drag) setHover(null); }}
        onPointerDown={(event) => { if (phone && !drag && (event.target as HTMLElement).closest?.(`[data-token]`) === null) panStart.current = { x: event.clientX, y: event.clientY, px: pan.x, py: pan.y }; }}
        onClick={(event) => { if (template) { const cell = cellAt(event as unknown as ReactPointerEvent); if (cell) place(cell); } }}>
        <div className={s.mapInner} style={{ aspectRatio: `${cols} / ${rows}`, transform: phone ? `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` : undefined }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {art ? <img className={s.mapArt} src={art} alt="" /> : <div className={s.mapGround} aria-hidden="true" />}
          <svg className={s.mapSvg} viewBox={`0 0 ${cols} ${rows}`} preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <pattern id="battle-grid" width={1} height={1} patternUnits="userSpaceOnUse"><path className={s.gridLine} d="M 1 0 L 0 0 0 1" /></pattern>
              {lightSources.map((row) => <radialGradient key={row.key} id={`glow-${row.key}`}><stop offset="0%" stopColor={row.kind === "burning" ? "#ff9a3c" : "#ffe6a8"} stopOpacity={0.55} /><stop offset="55%" stopColor={row.kind === "burning" ? "#ff9a3c" : "#ffe6a8"} stopOpacity={0.18} /><stop offset="100%" stopColor="#ffe6a8" stopOpacity={0} /></radialGradient>)}
            </defs>
            {shade.dark.map((cell) => cellRect(cell, s.dark, `d${cell.x}-${cell.y}`))}
            {shade.dim.map((cell) => cellRect(cell, s.dim, `m${cell.x}-${cell.y}`))}
            {lightSources.map((row) => row.cells.map(([x, y]) => <circle key={`${row.key}-${x}-${y}`} cx={x + 0.5} cy={y + 0.5} r={(row.dimRadiusFeet ?? (row.radiusFeet ?? (row.kind === "burning" ? 10 : 20)) * 2) / feetPerCell} fill={`url(#glow-${row.key})`} />))}
            <rect x={0} y={0} width={cols} height={rows} fill="url(#battle-grid)" />
            {field.features.map((row) => row.cells.map(([x, y]) => <rect key={`${row.key}-${x}-${y}`} className={row.kind === "cover" ? s.cover : row.kind === "difficult" ? s.difficult : row.kind === "burning" ? s.burning : row.kind === "wall" ? s.wall : row.kind === "elevation" ? s.elevation : s.hoverCell} x={x} y={y} width={1} height={1} data-feature={row.key} />))}
            {field.features.filter((row) => row.kind !== "light").map((row) => { const [x, y] = row.cells[0]; return <text key={`l-${row.key}`} className={s.featureLabel} x={x + 0.1} y={y - 0.15}>{row.label}{row.cover ? ` · ${row.cover === "half" ? "½" : row.cover === "three-quarters" ? "¾" : "■"}` : ""}{row.heightFeet ? ` · +${row.heightFeet} ${c("фт", "ft")}` : ""}</text>; })}
            {shade.blind.map((cell) => cellRect(cell, s.blind, `b${cell.x}-${cell.y}`))}
            {templateCells.map((cell) => cellRect(cell, s.template, `t${cell.x}-${cell.y}`))}
            {preview?.cells.map((cell) => cellRect(cell, `${s.pathCell} ${preview.over ? s.pathBad : ""}`, `p${cell.x}-${cell.y}`))}
            {hover && template && cellRect(hover, s.hoverCell, "hover")}
          </svg>
          <div className={s.tokens}>
            {fighters.filter((row) => row.placement.x !== null && row.placement.y !== null).map((row) => {
              const isHero = hero?.participantId === row.participantId;
              const cell = isHero && drag ? drag : { x: row.placement.x!, y: row.placement.y! };
              const hp = hpOf(row, snapshot);
              const down = row.combatant.conditions.some((word) => /dead|unconscious|без сознания|мертв|fled|бежал/iu.test(word)) || (hp !== null && hp.current <= 0);
              const url = portraitUrl(row.entityId);
              const classes = [s.token, row.combatant.side === "party" ? "ally" : "foe", row.combatant.side === "party" ? s.ally : s.foe, view.active?.participantId === row.participantId ? s.tokenActive : "", target === row.participantId ? s.tokenTarget : "", down ? s.tokenDown : "", isHero ? s.tokenHero : "", isHero && drag ? s.tokenDragging : ""].filter(Boolean).join(" ");
              return (
                <button key={row.participantId} type="button" className={classes} data-token={row.participantId} data-cell={`${cell.x},${cell.y}`} style={{ left: pct(cell.x, cols), top: pct(cell.y, rows) }}
                  aria-label={`${row.name}${hp ? ` · ${hp.current}/${hp.max}` : ""}${row.combatant.conditions.length ? ` · ${conditionsText(row.combatant.conditions, c.language)}` : ""}${isHero ? ` · ${c("перетащи, чтобы наметить ход", "drag to plan a move")}` : ""}`}
                  onPointerDown={(event) => { if (isHero && heroCell && view.active?.participantId === hero?.participantId) { event.preventDefault(); event.stopPropagation(); setDrag(heroCell); } }}
                  onClick={(event) => { event.stopPropagation(); if (row.combatant.side !== "party") onTarget(target === row.participantId ? null : row.participantId); }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {url ? <img className={s.tokenFace} src={url} alt="" /> : <span className={s.tokenFace} aria-hidden="true">{initials(row.name)}</span>}
                  {row.combatant.side !== "party" && hp && <><span className={s.hpBar} aria-hidden="true"><span className={s.hpFill} style={{ width: `${Math.max(0, Math.min(100, (hp.current / hp.max) * 100))}%` }} /></span><span className={s.hpNum}>{hp.current}/{hp.max}</span></>}
                  {row.combatant.conditions.length > 0 && <span className={s.condChips} aria-hidden="true">{row.combatant.conditions.slice(0, 3).map((word) => <span key={word} className={s.condChip} title={conditionWord(word, c.language)}>{conditionWord(word, c.language).slice(0, 2)}</span>)}</span>}
                  {preview?.foes.includes(row.participantId) && <span className={s.oa}>{c("атака по возможности", "opportunity attack")}</span>}
                </button>
              );
            })}
            {floats.map((row) => {
              const who = fighters.find((f) => f.name === row.name);
              if (!who || who.placement.x === null || who.placement.y === null) return null;
              return <span key={row.key} className={[s.float, row.miss ? s.floatMiss : "", row.crit ? s.floatCrit : ""].join(" ")} style={{ left: pct(who.placement.x, cols), top: pct(who.placement.y - 0.6, rows) }}>{row.text}{row.crit && !row.miss ? "!" : ""}</span>;
            })}
            {preview && drag && (
              <span className={[s.pathNote, preview.over ? s.pathNoteBad : ""].join(" ")} style={{ left: pct(drag.x, cols), top: pct(drag.y + 0.6, rows) }}>
                {preview.blocked ? (c.language === "ru" ? `стена: ${preview.blocked.label}` : `blocked: ${preview.blocked.label}`) : `${preview.feet} ${c("фт из", "ft of")} ${preview.left}`}
              </span>
            )}
            {template && hover && templateCells.length > 0 && <span className={s.caughtNote}>{c("В области", "In the area")}: {caughtNames.length ? caughtNames.join(", ") : c("никого", "nobody")}</span>}
          </div>
          <span className={s.mapLabel}>{art ? c("Карта боя · условный фон", "Battle map · illustrative background") : c("Карта боя · сетка 5 фт", "Battle map · 5-ft grid")}</span>
        </div>
      </div>
      {phone && (
        <span className={s.zoom} role="group" aria-label={c("Масштаб", "Zoom")}>
          <button type="button" onClick={() => setZoom((value) => Math.min(3, value + 0.5))}>+</button>
          <button type="button" onClick={() => { setZoom((value) => Math.max(1, value - 0.5)); if (zoom <= 1.5) setPan({ x: 0, y: 0 }); }}>−</button>
        </span>
      )}
    </div>
  );
}
