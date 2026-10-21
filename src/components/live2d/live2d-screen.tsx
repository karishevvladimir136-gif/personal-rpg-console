"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { BookOpen } from "lucide-react";
import type { CampaignSnapshot } from "@/lib/persistence/contracts";
import type { PlaySnapshot } from "@/lib/gameplay/contracts";
import type { MapPlacement } from "@/lib/map/placement-contracts";
import { loadMapLayout } from "@/lib/map/placement-client";
import { appendToComposerDraft, draftStorage } from "@/lib/ui/composer-draft";
import { anchorFor, pictureCostUsdMicros, type PublicPicture } from "@/lib/visual-frame/pictures";
import { usd } from "@/lib/visual-frame/fal-image";
import { emptyLive2dBoard, regionMapOf, sceneOf, MARKER_VISIBILITIES, type Live2dBoard, type MarkerVisibility, type Poi, type SceneSheet } from "@/lib/live2d/contracts";
import { defaultLive2dTransport, type Live2dAction, type Live2dTransport } from "@/lib/live2d/client";
import { live2dCrumbs, live2dOpeningLevel, live2dView, parentChain, type Live2dLevel, type Live2dPin } from "@/lib/live2d/hierarchy";
import { markerLabel, trackedPlaceIds, visiblePins } from "@/lib/live2d/markers";
import { placeIntent, poiIntent } from "@/lib/live2d/intents";
import { scenePois } from "@/lib/live2d/scene";
import { newPlacesSince } from "@/lib/live2d/region";
import { routePath, startTravel, travelMinutesOf, travelPoint, travelProgress, type Travel } from "@/lib/live2d/travel";
import { usePictures } from "../registry/live-frames";
import { BattleScreen } from "./battle/battle-screen";
import b from "./battle/battle.module.css";
import { useChrome, type CampaignScreenId } from "../registry/shell";
import { Plate, registry as r, useCopy } from "../registry/primitives";
import s from "./live2d.module.css";

// The 2D Live screen (docs/stages/LIVE2D_1.md): the painted region with the party
// marker and travel, the town with its districts, the scene with hotspots. The
// DM and the rules decide what happened; the records remember it; this screen
// only shows it and turns clicks into intents in the action box.

export type Live2dPreviewInput = {
  board: Live2dBoard;
  placements: MapPlacement[];
  /** Sample art by picture ID. */
  images: Record<string, string>;
  level?: Live2dLevel;
  anchorId?: string | null;
  travel?: { fromId: string; toId: string; minutes: number };
};
type Position = { level: Live2dLevel; focusId: string | null };

const pct = (value: number) => `${(value * 100).toFixed(2)}%`;
const busy = (board: Live2dBoard) => board.scenes.some((row) => row.status === "drawing") || board.regionMaps.some((row) => row.status === "drawing");

export function Live2dScreen({ snapshot, play, preview, transport = defaultLive2dTransport }: {
  snapshot: CampaignSnapshot; play: PlaySnapshot | null; preview?: Live2dPreviewInput; transport?: Live2dTransport;
}) {
  const c = useCopy();
  const chrome = useChrome();
  const pictures = usePictures();
  const campaignId = snapshot.campaign.id;
  const currentId = snapshot.publicState.current_location_id;
  const href = (screen: CampaignScreenId) => chrome?.href?.(screen) ?? `/campaigns/${encodeURIComponent(campaignId)}/${screen}`;
  const [placements, setPlacements] = useState<MapPlacement[]>(preview?.placements ?? []);
  const [board, setBoard] = useState<Live2dBoard>(preview?.board ?? emptyLive2dBoard(campaignId));
  const [note, setNote] = useState<{ text: string; kind: "ok" | "warn" } | null>(null);
  const [position, setPosition] = useState<Position | null>(preview?.level ? { level: preview.level, focusId: preview.anchorId === undefined ? currentId : preview.anchorId } : null);
  const [editing, setEditing] = useState(false);
  // Part 2: while a fight is on, the screen can switch to the battle map; «К карте мира» returns.
  const fighting = !!play?.encounters.some((row) => row.status === "active");
  const [battle, setBattle] = useState<boolean | null>(null);

  // The board and the placements from the server; polled while something is being drawn.
  const refresh = useCallback(async () => {
    if (preview) return;
    try { setBoard(await transport.board(campaignId)); } catch { /* the last board stays */ }
  }, [preview, transport, campaignId]);
  useEffect(() => {
    if (preview) return;
    let alive = true;
    void loadMapLayout(campaignId).then((layout) => { if (alive) setPlacements(layout.placements); }, () => {});
    queueMicrotask(() => void refresh());
    return () => { alive = false; };
  }, [preview, campaignId, refresh, snapshot.publicState.revision, snapshot.timeline?.epoch]);
  useEffect(() => {
    if (preview || !busy(board)) return;
    const timer = setTimeout(() => void refresh(), 3000);
    return () => clearTimeout(timer);
  }, [preview, board, refresh]);

  const send = useCallback(async (action: Live2dAction, input: unknown) => {
    if (preview) { setNote({ text: c("Синтетический просмотр: ничего не отправляется.", "Synthetic preview: nothing is sent."), kind: "warn" }); return null; }
    try {
      const result = await transport.send(action, campaignId, input);
      await refresh();
      return result;
    } catch {
      setNote({ text: c("Не удалось отправить запрос; попробуй ещё раз.", "The request could not be sent; try again."), kind: "warn" });
      return null;
    }
  }, [preview, transport, campaignId, refresh, c]);

  const urlFor = useCallback((pictureId: string | null): string | null => {
    if (!pictureId) return null;
    if (preview) return preview.images[pictureId] ?? null;
    const picture = pictures?.board.pictures.find((row) => row.id === pictureId) ?? null;
    return picture && pictures ? pictures.urlFor(picture) : null;
  }, [preview, pictures]);
  // Anchors (a place's illustration, a portrait) come from the pictures provider; previews read the sample board the same way.
  const anchorUrl = useCallback((subject: { kind: "entity" | "location"; id: string }, composition: PublicPicture["composition"]) => {
    const picture = anchorFor({ pictures: pictures?.board.pictures ?? [] }, subject, composition).picture;
    return picture ? urlFor(picture.id) : null;
  }, [pictures, urlFor]);

  // Where the screen stands: the chosen level and focus, else the deepest level the records open.
  const opening = useMemo(() => live2dOpeningLevel(snapshot, placements, currentId), [snapshot, placements, currentId]);
  const level = position?.level ?? opening.level;
  const focusId = position ? position.focusId : currentId;
  const crumbs = useMemo(() => live2dCrumbs(snapshot, placements, focusId), [snapshot, placements, focusId]);
  const anchorId = level === "scene" ? focusId : crumbs.find((row) => row.level === level)?.anchorId ?? null;
  const view = useMemo(() => live2dView(snapshot, placements, level, anchorId, focusId), [snapshot, placements, level, anchorId, focusId]);
  const tracked = useMemo(() => trackedPlaceIds(snapshot), [snapshot]);
  const language = c.language === "ru" ? "ru" : "en";
  const name = (locationId: string | null) => snapshot.locations.find((row) => row.id === locationId)?.name ?? "";
  const topOf = useCallback((locationId: string | null) => (locationId ? parentChain(snapshot, locationId).at(-1)?.id ?? locationId : null), [snapshot]);

  // Travel as presentation: the marker glides when the party's place changes.
  const regionPins = useMemo(() => live2dView(snapshot, placements, "region", crumbs.find((row) => row.level === "region")?.anchorId ?? null, focusId).pins, [snapshot, placements, crumbs, focusId]);
  const pinOf = useCallback((locationId: string | null) => regionPins.find((row) => row.locationId === topOf(locationId)) ?? null, [regionPins, topOf]);
  // A preview may open mid-glide; a live campaign starts still.
  const [travel, setTravel] = useState<Travel | null>(() => {
    const from = preview?.travel ? pinOf(preview.travel.fromId) : null, to = preview?.travel ? pinOf(preview.travel.toId) : null;
    return from && to && preview?.travel ? startTravel(null, { fromId: from.locationId, toId: to.locationId, from, to, minutes: preview.travel.minutes, now: Date.now() }) : null;
  });
  const [now, setNow] = useState(() => Date.now());
  const previousId = useRef<string | null>(currentId);
  const glide = useCallback((fromId: string, toId: string, minutes: number | null) => {
    const from = pinOf(fromId), to = pinOf(toId);
    if (!from || !to || from.locationId === to.locationId) return;
    const at = Date.now();
    setTravel((previous) => startTravel(previous, { fromId: from.locationId, toId: to.locationId, from, to, minutes, now: at }));
    setNow(at);
  }, [pinOf]);
  useEffect(() => {
    if (previousId.current === currentId) return;
    const from = previousId.current;
    previousId.current = currentId;
    if (!from || !currentId) return;
    const latest = play?.turns.filter((turn) => turn.status === "committed" && turn.mode === "game" && turn.changes?.length).at(-1);
    glide(from, currentId, travelMinutesOf(latest?.changes ?? []));
  }, [currentId, play, glide]);
  useEffect(() => {
    if (!travel || travelProgress(travel, now) >= 1 || typeof requestAnimationFrame !== "function") return;
    const frame = requestAnimationFrame(() => setNow(Date.now()));
    return () => cancelAnimationFrame(frame);
  }, [travel, now]);
  const gliding = !!travel && travelProgress(travel, now) < 1;

  // Clicks become words in the action box.
  const intent = (text: string) => {
    if (preview) { setNote({ text: c(`В поле действия: «${text}»`, `In the action box: “${text}”`), kind: "ok" }); return; }
    const written = appendToComposerDraft(draftStorage(), { campaignId, mode: "game", companionId: null, timeline: snapshot.timeline, text });
    setNote(written
      ? { text: c(`Записано в поле действия: «${text}». Ведущий решит.`, `Written into the action box: “${text}”. The DM decides.`), kind: "ok" }
      : { text: c("Ход ещё идёт: поле действия занято.", "A turn is in flight: the action box is busy."), kind: "warn" });
  };
  const go = (next: Position) => { setPosition(next); setNote(null); setEditing(false); };
  const openPin = (pin: Live2dPin) => {
    const location = snapshot.locations.find((row) => row.id === pin.locationId);
    if (pin.hasChildren) go({ level: level === "region" ? "town" : "district", focusId: pin.locationId });
    else if (location?.status === "visited") go({ level: "scene", focusId: pin.locationId });
  };

  const textLink = <Link className={s.textLink} href={href("game")}><BookOpen size={16} aria-hidden="true" />{c("Текст", "Text")}</Link>;
  const crumbBar = (
    <nav className={s.crumbs} aria-label={c("Уровни", "Levels")}>
      {crumbs.map((crumb, index) => (
        <span key={`${crumb.level}:${crumb.anchorId ?? "known"}`} className={r.row} style={{ gap: 8 }}>
          {index > 0 && <span className={s.sep} aria-hidden="true">›</span>}
          <button type="button" aria-current={crumb.level === level ? "true" : undefined} onClick={() => go({ level: crumb.level, focusId })}>
            {crumb.level === "world" ? (crumb.name || c("Мир", "World")) : crumb.level === "region" ? (crumb.name || c("Известный край", "The known region")) : crumb.name}
          </button>
        </span>
      ))}
      {textLink}
    </nav>
  );

  const markers = board.settings.markers;
  const saveMarkers = (value: MarkerVisibility) => {
    setBoard((prior) => ({ ...prior, settings: { ...prior.settings, markers: value } }));
    void send("settings.save", { expectedRevision: board.settings.revision, markers: value });
  };

  let body: React.ReactNode;
  if (level === "world" || level === "region") {
    const regionMap = level === "region" ? regionMapOf(board, view.anchorId) : null;
    const art = level === "region" ? urlFor(regionMap?.pictureId ?? null) : view.anchorId ? anchorUrl({ kind: "location", id: view.anchorId }, "location") : null;
    const shown = visiblePins(markers, view.pins, { currentId: topOf(currentId), destinationId: travel?.toId ?? null, trackedIds: tracked });
    const party = level === "region" ? (gliding && travel ? travelPoint(travel, now) : pinOf(currentId)) : null;
    const fresh = regionMap ? newPlacesSince(regionMap.signature, view.pins) : [];
    body = (
      <>
        <div className={s.stage} aria-label={c("Карта региона", "Region map")}>
          {art && <Art src={art} />}
          <div className={s.grain} aria-hidden="true" />
          <span className={s.artLabel}>{art ? c("Рисованная карта · условный фон", "Painted map · illustrative background") : c("Известные места · по записям", "Known places · from the records")}</span>
          <div className={s.layer}>
            {travel && (
              <svg className={s.route} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d={routePath(travel.from, travel.to)} /></svg>
            )}
            {shown.map((pin) => {
              const isCurrent = pin.locationId === topOf(currentId);
              const status = pin.status === "visited" ? s.visitedPin : pin.status === "rumored" ? s.rumoredPin : s.knownPin;
              return (
                <button key={pin.locationId} type="button" className={[s.pin, status, tracked.has(pin.locationId) ? s.trackedPin : ""].join(" ")}
                  style={{ left: pct(pin.x), top: pct(pin.y) }} data-pin={pin.locationId}
                  aria-label={`${pin.name}${isCurrent ? ` · ${c("вы здесь", "you are here")}` : ""}${pin.hasChildren ? ` · ${c("можно открыть", "can be opened")}` : ""}`}
                  onClick={() => (isCurrent && pin.hasChildren ? openPin(pin) : intent(placeIntent(pin.name, language)))}
                  onDoubleClick={() => openPin(pin)}>
                  <span className={s.pinMark} aria-hidden="true" />
                  <span className={s.pinLabel}>{pin.name}</span>
                </button>
              );
            })}
            {party && <span className={[s.party, gliding ? s.partyGliding : ""].join(" ")} style={{ left: pct(party.x), top: pct(party.y) }} aria-hidden="true" />}
          </div>
        </div>
        <div className={s.strip}>
          {gliding && travel ? <b>{c("в пути", "on the way")}: {name(travel.fromId)} → {name(travel.toId)}</b> : currentId ? <b>{c("Вы", "You")}: {name(currentId)}</b> : null}
          {level === "region" && (
            <span className={r.row} role="group" aria-label={c("Метки на карте", "Map markers")}>
              {MARKER_VISIBILITIES.map((option) => (
                <button key={option} type="button" className={r.chipButton} aria-pressed={markers === option} onClick={() => saveMarkers(option)}>{markerLabel(option, language)}</button>
              ))}
            </span>
          )}
          {level === "region" && (
            <button type="button" className={r.btnGhost} disabled={regionMap?.status === "drawing"} onClick={() => void send("region.draw", { anchorId: view.anchorId })}>
              {regionMap?.status === "drawing" ? c("Карта рисуется…", "Drawing the map…") : regionMap?.pictureId ? c("Перерисовать карту региона", "Redraw the region map") : c("Нарисовать карту региона", "Draw the region map")} · {usd(pictureCostUsdMicros("quality", "region"))}
            </button>
          )}
        </div>
        {fresh.length > 0 && <p className={`${s.note} ${s.warn}`}>{c("На карте появилось новое место", "A new place appeared on the map")}: {fresh.map((row) => row.name).join(", ")}. {c("Карту можно перерисовать.", "The map can be redrawn.")}</p>}
        {shown.some((pin) => pin.hasChildren) && <p className={`${r.small} ${r.muted}`}>{c("Нажатие на место — «идём туда» в поле действия; двойное нажатие на город открывает его.", "Tap a place — “we go there” in the action box; double-tap a town to open it.")}</p>}
      </>
    );
  } else if (level === "town" || level === "district") {
    const art = view.anchorId ? anchorUrl({ kind: "location", id: view.anchorId }, "location") : null;
    const shown = visiblePins(markers, view.pins, { currentId, destinationId: null, trackedIds: tracked });
    body = (
      <>
        <div className={`${s.stage} ${s.stageTall}`} aria-label={view.anchorName}>
          {art && <Art src={art} />}
          <div className={s.grain} aria-hidden="true" />
          <span className={s.artLabel}>{art ? c("Иллюстрация места", "Illustration of the place") : c("Известные части · по записям", "Known parts · from the records")}</span>
          <div className={s.layer}>
            {shown.map((pin) => {
              const location = snapshot.locations.find((row) => row.id === pin.locationId);
              const hasScene = !!sceneOf(board, pin.locationId);
              return (
                <button key={pin.locationId} type="button" className={[s.pin, pin.status === "visited" ? s.visitedPin : pin.status === "rumored" ? s.rumoredPin : s.knownPin].join(" ")}
                  style={{ left: pct(pin.x), top: pct(pin.y) }} data-pin={pin.locationId}
                  aria-label={`${pin.name}${pin.locationId === currentId ? ` · ${c("вы здесь", "you are here")}` : ""}`}
                  onClick={() => (pin.hasChildren || (location?.status === "visited" && (hasScene || pin.locationId === currentId)) ? openPin(pin) : intent(placeIntent(pin.name, language)))}>
                  <span className={s.pinMark} aria-hidden="true" />
                  <span className={s.pinLabel}>{pin.name}</span>
                </button>
              );
            })}
            {currentId && shown.some((pin) => pin.locationId === currentId) && (() => { const pin = shown.find((row) => row.locationId === currentId)!; return <span className={s.party} style={{ left: pct(pin.x), top: pct(pin.y + 0.06) }} aria-hidden="true" />; })()}
          </div>
        </div>
        <div className={s.strip}><b>{view.anchorName}</b>{!shown.length && <span>{c("Известных частей пока нет.", "No known parts yet.")}</span>}</div>
      </>
    );
  } else {
    body = (
      <SceneLevel snapshot={snapshot} play={play} board={board} locationId={focusId} urlFor={urlFor} anchorUrl={anchorUrl} send={send} intent={intent}
        editing={editing} setEditing={setEditing} preview={!!preview} setBoard={setBoard} />
    );
  }

  if (fighting && (battle ?? preview?.level === undefined))
    return <BattleScreen snapshot={snapshot} play={play} board={board} images={preview?.images} preview={!!preview} onBack={() => setBattle(false)} />;
  return (
    <div className={s.screen}>
      {fighting && (
        <div className={b.banner} role="status">
          <span>{c("Идёт бой", "A fight is on")}</span>
          <button type="button" onClick={() => setBattle(true)}>{c("Открыть карту боя", "Open the battle map")}</button>
        </div>
      )}
      <Plate eyebrow={c("2D", "2D LIVE")} title={level === "scene" ? name(focusId) : level === "region" ? (view.anchorName || c("Известный край", "The known region")) : view.anchorName || c("Мир", "World")}
        sub={c("Ведущий решает, что случилось; записи помнят; экран только показывает.", "The DM decides what happened; the records remember; the screen only shows.")} />
      {crumbBar}
      {body}
      {note && <p className={`${s.note} ${note.kind === "warn" ? s.warn : ""}`} role="status">{note.text} {note.kind === "ok" && !preview && <Link href={href("game")} style={{ color: "var(--brass)" }}>{c("Открыть текст", "Open the text")}</Link>}</p>}
    </div>
  );
}

/** A picture of the board: short-lived authenticated URLs, which next/image cannot proxy. */
function Art({ src, className = s.art }: { src: string; className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img className={className} src={src} alt="" />;
}

function SceneLevel({ snapshot, play, board, locationId, urlFor, anchorUrl, send, intent, editing, setEditing, preview, setBoard }: {
  snapshot: CampaignSnapshot; play: PlaySnapshot | null; board: Live2dBoard; locationId: string | null;
  urlFor: (pictureId: string | null) => string | null;
  anchorUrl: (subject: { kind: "entity" | "location"; id: string }, composition: PublicPicture["composition"]) => string | null;
  send: (action: Live2dAction, input: unknown) => Promise<unknown>; intent: (text: string) => void;
  editing: boolean; setEditing: (value: boolean) => void; preview: boolean; setBoard: (update: (prior: Live2dBoard) => Live2dBoard) => void;
}) {
  const c = useCopy();
  const pictures = usePictures();
  const language = c.language === "ru" ? "ru" : "en";
  const location = snapshot.locations.find((row) => row.id === locationId) ?? null;
  const scene = locationId ? sceneOf(board, locationId) : null;
  const presentIds = play?.configuration?.presentEntityIds ?? null;
  const pois = useMemo(() => (locationId ? scenePois(board.pois, snapshot, locationId, { presentIds, includeHidden: editing }) : []), [board.pois, snapshot, locationId, presentIds, editing]);
  const art = urlFor(scene?.pictureId ?? null) ?? (locationId ? anchorUrl({ kind: "location", id: locationId }, "location") : null);
  const [comment, setComment] = useState("");
  const [sheetDraft, setSheetDraft] = useState<{ summary: string; light: string; never: string } | null>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<{ id: string; x: number; y: number } | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const pointAt = (event: ReactPointerEvent) => {
    const bounds = stage.current?.getBoundingClientRect();
    if (!bounds || !bounds.width || !bounds.height) return null;
    return { x: Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width)), y: Math.min(1, Math.max(0, (event.clientY - bounds.top) / bounds.height)) };
  };
  const endDrag = (event: ReactPointerEvent) => {
    if (!drag) return;
    const point = pointAt(event) ?? { x: drag.x, y: drag.y };
    const poi = board.pois.find((row) => row.id === drag.id);
    setDrag(null);
    if (!poi) return;
    const x = Number(point.x.toFixed(3)), y = Number(point.y.toFixed(3));
    setBoard((prior) => ({ ...prior, pois: prior.pois.map((row) => (row.id === poi.id ? { ...row, x, y, approximate: false, source: "owner" } : row)) }));
    void send("poi.save", { id: poi.id, expectedRevision: poi.revision, x, y, hidden: poi.hidden });
  };
  const hide = (poi: Poi, hidden: boolean) => {
    setBoard((prior) => ({ ...prior, pois: prior.pois.map((row) => (row.id === poi.id ? { ...row, hidden } : row)) }));
    void send("poi.save", { id: poi.id, expectedRevision: poi.revision, x: poi.x, y: poi.y, hidden });
  };

  if (!location) return <p className={s.note}>{c("Место не найдено в записях.", "The place is not in the records.")}</p>;
  if (location.status !== "visited")
    return <div className={`${s.stage} ${s.empty}`}><p>{c("Место ещё не посещали: сцена появится после первого визита.", "Not visited yet: the scene appears after the first visit.")}</p></div>;

  const status = !scene ? null
    : scene.status === "drawing" ? { text: c("Сцена рисуется…", "The scene is being drawn…"), warn: false }
    : scene.status === "flagged" ? { text: c("Картинка не сошлась с записями — проверь сцену. Чего нет, перечислено рядом.", "The picture did not match the records — check the scene. What is missing is listed beside it."), warn: true }
    : scene.status === "failed" ? { text: `${c("Сцену нарисовать не удалось", "The scene could not be drawn")}${scene.error ? `: ${scene.error}` : "."}`, warn: true }
    : scene.status === "draft" ? { text: c("Лист сцены готов; картинка ещё не нарисована.", "The scene sheet is ready; the picture is not drawn yet."), warn: false } : null;
  const price = usd(pictureCostUsdMicros("quality", "scene"));
  const draft = sheetDraft ?? (scene ? { summary: scene.sheet.summary, light: scene.sheet.light, never: scene.sheet.never.join("\n") } : { summary: "", light: "", never: "" });
  const saveSheet = () => {
    if (!scene) return;
    const sheet: SceneSheet = { ...scene.sheet, summary: draft.summary.trim(), light: draft.light.trim(), never: draft.never.split(/\n/).map((row) => row.trim()).filter(Boolean) };
    void send("scene.sheet.save", { locationId: scene.locationId, expectedRevision: scene.revision, sheet });
  };
  const token = (poi: Poi) => {
    if (poi.kind !== "person" || !poi.entityId) return <span className={[s.ring, poi.kind === "exit" ? s.ringExit : "", poi.approximate ? s.ringApprox : ""].join(" ")} aria-hidden="true" />;
    const url = anchorUrl({ kind: "entity", id: poi.entityId }, "portrait");
    const initials = poi.label.split(/\s+/).map((word) => word[0] ?? "").join("").slice(0, 2);
    return url ? <Art src={url} className={s.token} /> : <span className={s.token} aria-hidden="true">{initials}</span>;
  };

  return (
    <>
      <div ref={stage} className={s.stage} aria-label={c("Сцена", "Scene")} onPointerMove={(event) => { if (drag) { const point = pointAt(event); if (point) setDrag({ ...drag, ...point }); } }} onPointerUp={endDrag} onPointerCancel={() => setDrag(null)}>
        {art && <Art src={art} />}
        <div className={s.grain} aria-hidden="true" />
        <span className={s.artLabel}>{scene?.pictureId ? c("Сцена · условный фон", "Scene · illustrative background") : c("Сцена не нарисована", "Scene not drawn")}</span>
        <div className={s.layer}>
          {pois.map((poi) => {
            const live = drag?.id === poi.id ? drag : poi;
            const label = `${poi.label}${poi.approximate ? ` · ${c("примерно", "approximate")}` : ""}${poi.hidden ? ` · ${c("скрыто", "hidden")}` : ""}`;
            return (
              <button key={poi.id} type="button" className={[s.hotspot, drag?.id === poi.id ? s.hotspotDragging : ""].join(" ")} data-poi={poi.key} data-kind={poi.kind}
                style={{ left: pct(live.x!), top: pct(live.y!), opacity: poi.hidden ? 0.45 : 1 }} aria-label={label} aria-pressed={selected === poi.id}
                onPointerDown={(event) => { if (editing) { event.preventDefault(); setDrag({ id: poi.id, x: poi.x!, y: poi.y! }); } }}
                onClick={() => (editing ? setSelected(selected === poi.id ? null : poi.id) : intent(poiIntent(poi, language)))}
                onFocus={() => setSelected(poi.id)} onMouseEnter={() => setSelected(poi.id)} onMouseLeave={() => { if (!editing) setSelected(null); }}>
                {token(poi)}
                {selected === poi.id && <span className={s.tip} role="tooltip"><b>{poi.label}</b>{poi.note || (poi.kind === "exit" ? c("Выход", "An exit") : "")}{poi.approximate && <i> · {c("положение примерное", "position approximate")}</i>}</span>}
              </button>
            );
          })}
        </div>
      </div>
      {status && <p className={`${s.note} ${status.warn ? s.warn : ""}`} role="status">{status.text}</p>}
      {scene && scene.sideList.length > 0 && (
        <p className={s.sideList}><span style={{ border: 0, padding: 0, color: "var(--muted)" }}>{c("Здесь также", "Also here")}:</span>{scene.sideList.map((item) => <span key={item}>{item}</span>)}</p>
      )}
      {!scene && (
        <div className={s.strip}>
          <span>{c("Сцена этого места ещё не подготовлена: лист из записей, картинка, проверка.", "This place's scene is not prepared yet: a sheet from the records, the picture, the check.")}</span>
          <button type="button" className={r.btnMain} onClick={() => void send("scene.prepare", { locationId: location.id })}>{c("Подготовить сцену", "Prepare the scene")} · {price}</button>
        </div>
      )}
      {pois.length === 0 && scene && scene.status !== "drawing" && <p className={`${r.small} ${r.muted}`}>{c("Точек пока нет: ничего из записей не найдено на картинке.", "No hotspots yet: nothing from the records was found in the picture.")}</p>}
      {scene && (
        <details className={s.tools}>
          <summary>{c("Ещё", "More")}</summary>
          <div className={s.toolsBody}>
            <label className={s.field}>{c("Перерисовать с замечанием", "Redraw with a comment")}
              <input value={comment} onChange={(event) => setComment(event.target.value.slice(0, 300))} placeholder={c("Например: колодец ближе к центру", "For example: the well nearer the centre")} />
            </label>
            <div className={r.row}>
              <button type="button" className={r.btn} disabled={scene.status === "drawing"} onClick={() => void send("scene.redraw", { locationId: scene.locationId, comment: comment.trim() || null })}>{c("Перерисовать", "Redraw")} · {price}</button>
              <button type="button" className={r.btnGhost} aria-pressed={editing} onClick={() => { setEditing(!editing); setSelected(null); }}>{editing ? c("Готово", "Done") : c("Править точки", "Edit hotspots")}</button>
              {editing && selected && (() => { const poi = board.pois.find((row) => row.id === selected); return poi ? <button type="button" className={r.btnGhost} onClick={() => hide(poi, !poi.hidden)}>{poi.hidden ? c("Показать", "Show") : c("Скрыть", "Hide")}: {poi.label}</button> : null; })()}
            </div>
            {editing && <p className={`${r.small} ${r.muted}`}>{c("Перетащи точку на её место; нажатие выбирает точку.", "Drag a hotspot to its place; a tap selects it.")}</p>}
            <label className={s.field}>{c("Лист сцены: что здесь есть", "Scene sheet: what is here")}
              <textarea value={draft.summary} onChange={(event) => setSheetDraft({ ...draft, summary: event.target.value.slice(0, 1200) })} />
            </label>
            <label className={s.field}>{c("Свет", "Light")}
              <input value={draft.light} onChange={(event) => setSheetDraft({ ...draft, light: event.target.value.slice(0, 240) })} />
            </label>
            <label className={s.field}>{c("Чего здесь никогда нет (по строке)", "What is never here (one per line)")}
              <textarea value={draft.never} onChange={(event) => setSheetDraft({ ...draft, never: event.target.value.slice(0, 1500) })} />
            </label>
            <div className={r.row}>
              <button type="button" className={r.btn} disabled={!sheetDraft} onClick={saveSheet}>{c("Сохранить лист", "Save the sheet")}</button>
              {scene.check && <span className={`${r.small} ${r.muted}`}>{c("Проверка", "Check")}: {scene.check.items.filter((row) => row.visible).length}/{scene.check.items.length} {c("найдено", "found")}{scene.check.contradictions.length ? ` · ${c("лишнее", "extra")}: ${scene.check.contradictions.map((row) => row.what).join(", ")}` : ""}</span>}
              {preview && pictures?.preview && <span className={`${r.small} ${r.muted}`}>{c("Просмотр", "Preview")}</span>}
            </div>
          </div>
        </details>
      )}
    </>
  );
}
