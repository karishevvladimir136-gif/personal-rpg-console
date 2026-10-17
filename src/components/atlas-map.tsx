"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type MouseEvent, type ReactNode } from "react";
import type { CampaignSnapshot, Location } from "@/lib/persistence/contracts";
import { errorMessage } from "@/lib/persistence/client";
import { atlasLevelView, atlasOpeningLevel, atlasPinStyle, projectAtlas, type AtlasLevel } from "@/lib/map/atlas-view";
import type { MapPlacement } from "@/lib/map/placement-contracts";
import { loadMapLayout, saveMapPlacement } from "@/lib/map/placement-client";
import { placePinLabels, sameLayout, type LabelPlacement } from "@/lib/map/label-layout";
import { selectMapVisual } from "@/lib/visual-frame/map-job";
import { selectSubjectVisual } from "@/lib/visual-frame/subject-visual";
import { RedrawAnchor } from "./registry/redraw-anchor";
import { SubjectVisual } from "./visual-frame/subject-visual";
import { useLanguage } from "./language-context";
import { Badge, Button, Icon } from "./ui";
import styles from "./atlas-map.module.css";
import { appendToComposerDraft, draftStorage } from "@/lib/ui/composer-draft";

type ReviewPreset = {
  level?: AtlasLevel;
  artwork?: "placeholder" | "collapsed";
  panel?: "edit-open" | "unplaced-open";
  detail?: boolean;
};

function AtlasDisclosure({
  title,
  children,
  open = false,
  className = "",
}: {
  title: string;
  children: ReactNode;
  open?: boolean;
  className?: string;
}) {
  const [expanded, setExpanded] = useState(open);
  return (
    <details className={`${styles.disclosure} ${className}`} open={expanded} onToggle={(event) => setExpanded(event.currentTarget.open)}>
      <summary>{title}</summary>
      {expanded && <div className={styles.disclosureBody}>{children}</div>}
    </details>
  );
}

function knownLocation(snapshot: CampaignSnapshot, id: string | null | undefined) {
  // Polish group 9: a rumoured place the DM placed under a parent shows as a dashed marker.
  return snapshot.locations.find(
    (row) =>
      row.id === id &&
      row.campaign_id === snapshot.campaign.id &&
      (row.status === "known" || row.status === "visited" || row.status === "rumored"),
  );
}

export function AtlasMap({
  snapshot,
  reviewOnly = false,
  reviewPlacements = [],
  reviewPreset,
  reviewArtworkUrl,
  reviewDestinationId,
}: {
  snapshot: CampaignSnapshot;
  reviewOnly?: boolean;
  reviewPlacements?: MapPlacement[];
  reviewPreset?: ReviewPreset;
  /** Synthetic previews only: a sample background and a preset course. */
  reviewArtworkUrl?: string;
  reviewDestinationId?: string;
}) {
  const { language, t } = useLanguage();
  const w = (en: string, ru: string) => (language === "ru" ? ru : en);
  const [chosenLevel, setChosenLevel] = useState<AtlasLevel | null>(reviewPreset?.level ?? null);
  const [placements, setPlacements] = useState<MapPlacement[]>(reviewOnly ? reviewPlacements : []);
  const [layoutError, setLayoutError] = useState("");
  const [selectedWorldId, setSelectedWorldId] = useState<string | null>(null);
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [destinationId, setDestinationId] = useState<string | null>(reviewOnly ? reviewDestinationId ?? null : null);
  const [courseInserted, setCourseInserted] = useState(false);
  const [showArtwork] = useState(reviewPreset?.artwork !== "collapsed");
  const [editLocationId, setEditLocationId] = useState("");
  const [editLevel, setEditLevel] = useState<AtlasLevel>("world");
  const [editParentId, setEditParentId] = useState<string | null>(null);
  const [editPoint, setEditPoint] = useState<{ x: number; y: number } | null>(null);
  const [placing, setPlacing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [reload, setReload] = useState(0);
  const pendingSave = useRef<{ signature: string; requestId: string } | null>(null);
  const placementSurface = useRef<HTMLDivElement>(null);
  const pinLayer = useRef<HTMLDivElement>(null);
  const [labelLayout, setLabelLayout] = useState<Record<string, LabelPlacement>>({});
  const campaignId = snapshot.campaign.id;
  const timelineId = snapshot.timeline?.timelineId;
  const timelineEpoch = snapshot.timeline?.epoch;

  useEffect(() => {
    if (reviewOnly) return;
    let alive = true;
    void loadMapLayout(campaignId).then(
      (result) => {
        if (!alive) return;
        if (
          result.timeline.timelineId !== timelineId ||
          result.timeline.epoch !== timelineEpoch
        ) {
          setPlacements([]);
          setLayoutError(w(
            "Map layout changed with the active timeline. Refresh this page to continue.",
            "Разметка карты изменилась вместе с активной линией времени. Обновите страницу.",
          ));
          return;
        }
        setPlacements(result.placements);
        setLayoutError("");
      },
      (cause) => {
        if (alive) setLayoutError(errorMessage(cause));
      },
    );
    return () => { alive = false; };
    // The active timeline and explicit reload are the only read identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId, timelineId, timelineEpoch, reload, reviewOnly]);

  const projection = useMemo(
    () => projectAtlas(snapshot, placements),
    [snapshot, placements],
  );
  const level = chosenLevel ?? atlasOpeningLevel(projection);
  const view = atlasLevelView(projection, level, selectedWorldId, selectedRegionId);
  const fallbackLevel = ({
    world: ["region", "local"],
    region: ["world", "local"],
    local: ["region", "world"],
  } as const)[level].find((option) =>
    atlasLevelView(projection, option, selectedWorldId, selectedRegionId).pins.length > 0);
  const byId = new Map(projection.placements.map((row) => [row.location_id, row]));
  const currentId = snapshot.publicState.current_location_id;
  const defaultId = view.currentAreaId && view.pins.some((row) => row.location_id === view.currentAreaId)
    ? view.currentAreaId
    : view.pins[0]?.location_id ?? currentId;
  const selected = knownLocation(snapshot, selectedLocationId ?? defaultId);
  // "Plot a course": the destination is presentation; the journey text waits in the turn box.
  const plotCourse = (location: Location) => {
    setDestinationId(location.id);
    setCourseInserted(!reviewOnly && appendToComposerDraft(draftStorage(), {
      campaignId, mode: "game", companionId: null, timeline: snapshot.timeline,
      text: w(`I travel to ${location.name}.`, `Отправляюсь. Цель — ${location.name}.`),
    }));
  };
  const routeFrom = view.pins.find((row) => row.location_id === currentId);
  const routeTo = destinationId ? view.pins.find((row) => row.location_id === destinationId) : undefined;
  // Label collision handling: measured after layout, re-measured when the viewport resizes.
  const pinSignature = view.pins.map((row) => `${row.location_id}:${row.x}:${row.y}`).join("|");
  const selectedId = selected?.id ?? null;
  useLayoutEffect(() => {
    const layer = pinLayer.current;
    if (!layer) return;
    const measure = () => {
      const pins = [...layer.querySelectorAll<HTMLElement>("[data-pin]")].flatMap((button) => {
        const id = button.dataset.pin ?? "";
        const mark = button.querySelector<HTMLElement>("[data-pin-mark]");
        const label = button.querySelector<HTMLElement>("[data-pin-label]");
        if (!mark || !label) return [];
        const box = mark.getBoundingClientRect();
        const status = button.dataset.pinStatus;
        const priority = id === currentId ? 0 : id === destinationId ? 1 : id === selectedId ? 2 : status === "visited" ? 3 : 4;
        return [{ id, mark: { x: box.left, y: box.top, w: box.width, h: box.height }, label: { w: label.offsetWidth, h: label.offsetHeight }, priority }];
      });
      const next = placePinLabels(pins);
      setLabelLayout((previous) => (sameLayout(previous, next) ? previous : next));
    };
    // ResizeObserver reports once on observe(), which is the first measurement; without it labels stay as rendered.
    if (typeof ResizeObserver !== "function") return;
    const observer = new ResizeObserver(measure);
    observer.observe(layer);
    return () => observer.disconnect();
  }, [pinSignature, currentId, destinationId, selectedId, level]);
  const selectedIllustration = selected && selectSubjectVisual(
    snapshot, { kind: "location", id: selected.id }, { acceptedOnly: true },
  );
  const destination = knownLocation(snapshot, destinationId);
  const anchor = knownLocation(snapshot, view.anchorId);
  const mapVisual = selectMapVisual(snapshot, projection.placements, level, view.anchorId);
  const acceptedArt = mapVisual.image;
  const previewArt = reviewOnly && reviewPreset?.artwork === "placeholder";
  const artworkVisible = showArtwork && (reviewOnly ? previewArt : Boolean(acceptedArt));
  // A provisional pin has no saved revision. Editing uses the actual layout row.
  const editorRow = placements.find((row) => row.location_id === editLocationId);
  const parentLevel = editLevel === "region" ? "world" : "region";
  const parentOptions = projection.placements.filter((row) =>
    row.level === parentLevel && row.revision > 0);
  const editReady = editLevel === "world" || Boolean(editParentId && parentOptions.some((row) => row.location_id === editParentId));
  const editorCanUseViewport = placing && editReady && level === editLevel &&
    (editLevel === "world" || view.anchorId === editParentId);

  useEffect(() => {
    if (editorCanUseViewport) placementSurface.current?.focus();
  }, [editorCanUseViewport]);

  function selectLocation(locationId: string) {
    setSelectedLocationId(locationId);
    const row = byId.get(locationId);
    if (!row) return;
    setChosenLevel(row.level);
    if (row.level === "world") {
      setSelectedWorldId(locationId);
      setSelectedRegionId(null);
    }
    if (row.level === "region") {
      setSelectedWorldId(row.parent_location_id);
      setSelectedRegionId(locationId);
    }
    if (row.level === "local") {
      setSelectedRegionId(row.parent_location_id);
      setSelectedWorldId(byId.get(row.parent_location_id ?? "")?.parent_location_id ?? null);
    }
  }

  function startEditing(locationId: string) {
    const row = byId.get(locationId);
    setEditLocationId(locationId);
    setEditLevel(row?.level ?? "world");
    setEditParentId(row?.parent_location_id ?? null);
    setEditPoint(row && row.x !== null && row.y !== null ? { x: row.x, y: row.y } : null);
    setPlacing(false);
    setSaveError("");
    pendingSave.current = null;
  }

  function preparePlacement() {
    if (!editLocationId || !editReady) return;
    setChosenLevel(editLevel);
    if (editLevel === "region") setSelectedWorldId(editParentId);
    if (editLevel === "local") {
      setSelectedRegionId(editParentId);
      setSelectedWorldId(byId.get(editParentId ?? "")?.parent_location_id ?? null);
    }
    setPlacing(true);
    setSaveError("");
  }

  function pickPoint(event: MouseEvent<HTMLDivElement>) {
    if (!editorCanUseViewport) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    setEditPoint({
      x: Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width)),
      y: Math.min(1, Math.max(0, (event.clientY - bounds.top) / bounds.height)),
    });
    pendingSave.current = null;
  }

  async function savePlacement() {
    if (reviewOnly || !snapshot.timeline || !editPoint || !editLocationId || !editReady || saving) return;
    const input = {
      timeline: snapshot.timeline,
      locationId: editLocationId,
      expectedRevision: editorRow?.revision ?? null,
      level: editLevel,
      parentLocationId: editLevel === "world" ? null : editParentId,
      x: editPoint.x,
      y: editPoint.y,
    };
    const signature = JSON.stringify(input);
    if (!pendingSave.current || pendingSave.current.signature !== signature)
      pendingSave.current = { signature, requestId: crypto.randomUUID() };
    setSaving(true);
    setSaveError("");
    try {
      const result = await saveMapPlacement(campaignId, {
        ...input,
        requestId: pendingSave.current.requestId,
      });
      setPlacements((prior) => [
        ...prior.filter((row) => row.location_id !== result.placement.location_id),
        result.placement,
      ]);
      pendingSave.current = null;
      setPlacing(false);
      setSelectedLocationId(editLocationId);
      setReload((value) => value + 1);
    } catch (cause) {
      setSaveError(errorMessage(cause));
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <section className={styles.atlasPanel} aria-label={w("Campaign atlas", "Атлас кампании")}>
        <div className={styles.atlasHeader}>
          <div>
            <span className="eyebrow">{w("ATLAS OF KNOWN PLACES", "АТЛАС ЗНАКОМЫХ МЕСТ")}</span>
            <h2>{level === "world" ? w("The known world", "Известный мир") : anchor?.name ?? w("Choose an area", "Выберите область")}</h2>
          </div>
          <div className={styles.levelTabs} aria-label={w("Map level", "Уровень карты")}>
            {(["world", "region", "local"] as const).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={level === option}
                className={level === option ? styles.activeTab : ""}
                onClick={() => { setChosenLevel(option); setSelectedLocationId(null); setPlacing(false); }}
              >
                {t(option[0].toUpperCase() + option.slice(1))}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.atlasColumns}>
          <div className={styles.mapColumn}>
            <div className={styles.viewport}>
              {artworkVisible && acceptedArt && !reviewOnly && (
                <Image
                  unoptimized
                  className={styles.artBackground}
                  src={acceptedArt.url}
                  alt=""
                  width={1536}
                  height={1024}
                />
              )}
              {artworkVisible && previewArt && (reviewArtworkUrl
                ? <Image unoptimized className={styles.artBackground} src={reviewArtworkUrl} alt="" width={1024} height={576} />
                : <div className={styles.previewArtwork} aria-hidden="true" />)}
              <div className={styles.atlasGrain} aria-hidden="true" />
              <span className={styles.artworkLabel}>
                {artworkVisible
                  ? w("ATLAS ARTWORK · illustrative background", "ИЗОБРАЖЕНИЕ АТЛАСА · условный фон")
                  : w("KNOWN PLACES · current public records", "ИЗВЕСТНЫЕ МЕСТА · открытые записи")}
              </span>
              <div
                ref={placementSurface}
                className={editorCanUseViewport ? styles.placeSurface : styles.staticSurface}
                role={editorCanUseViewport ? "button" : undefined}
                tabIndex={editorCanUseViewport ? 0 : undefined}
                aria-label={editorCanUseViewport ? w("Place selected pin on map", "Разместить выбранную метку на карте") : undefined}
                onClick={pickPoint}
                onKeyDown={(event) => {
                  if (!editorCanUseViewport) return;
                  const step = 0.025;
                  const delta = event.key === "ArrowLeft" ? [-step, 0]
                    : event.key === "ArrowRight" ? [step, 0]
                      : event.key === "ArrowUp" ? [0, -step]
                        : event.key === "ArrowDown" ? [0, step]
                          : event.key === "Enter" || event.key === " " ? [0, 0] : null;
                  if (!delta) return;
                  event.preventDefault();
                  setEditPoint((previous) => ({
                    x: Math.min(1, Math.max(0, (previous?.x ?? 0.5) + delta[0])),
                    y: Math.min(1, Math.max(0, (previous?.y ?? 0.5) + delta[1])),
                  }));
                  pendingSave.current = null;
                }}
              />
              <div className={styles.pinLayer} ref={pinLayer}>
                {routeFrom && routeTo && routeFrom.x !== null && routeFrom.y !== null && routeTo.x !== null && routeTo.y !== null && (
                  <svg className={styles.route} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                    <line x1={routeFrom.x * 100} y1={routeFrom.y * 100} x2={routeTo.x * 100} y2={routeTo.y * 100} />
                  </svg>
                )}
                {view.pins.map((row) => {
                  const location = knownLocation(snapshot, row.location_id);
                  if (!location || row.x === null || row.y === null) return null;
                  const isCurrent = location.id === currentId;
                  const isCurrentArea = location.id === view.currentAreaId && !isCurrent;
                  const isSelected = location.id === selected?.id;
                  const isDestination = location.id === destinationId;
                  const labelPlacement = labelLayout[location.id] ?? "below";
                  return (
                    <button
                      className={[styles.pin, location.status === "visited" ? styles.visitedPin : location.status === "rumored" ? styles.rumoredPin : styles.knownPin, isCurrent ? styles.currentPin : "", isCurrentArea ? styles.currentAreaPin : "", isSelected ? styles.selectedPin : "", isDestination ? styles.destinationPin : "", labelPlacement === "above" ? styles.labelAbove : labelPlacement === "hidden" ? styles.labelHidden : ""].filter(Boolean).join(" ")}
                      key={location.id}
                      type="button"
                      data-pin={location.id}
                      data-pin-status={location.status}
                      style={atlasPinStyle(row.x, row.y)}
                      aria-label={`${location.name} · ${location.status === "rumored" ? w("Rumour", "Слух") : t(location.status === "visited" ? "Visited" : "Known")}${isCurrent ? ` · ${t("Current location")}` : isCurrentArea ? ` · ${w("Current area", "Текущая область")}` : ""}${isDestination ? ` · ${t("Destination selected")}` : ""}`}
                      aria-pressed={isSelected}
                      onClick={() => selectLocation(location.id)}
                    >
                      <span className={styles.pinMark} data-pin-mark aria-hidden="true" />
                      <span className={styles.pinLabel} data-pin-label>{location.name}</span>
                    </button>
                  );
                })}
                {placing && editorCanUseViewport && editPoint && (
                  <span className={styles.pendingPin} style={{ left: `${editPoint.x * 100}%`, top: `${editPoint.y * 100}%` }} aria-hidden="true" />
                )}
              </div>
              {!view.pins.length && (
                <div className={styles.noPins}>
                  <p>{w(
                    `No known places are placed on this ${level} view yet. The location list remains below.`,
                    `На уровне «${t(level[0].toUpperCase() + level.slice(1))}» пока нет известных мест с метками. Список мест — ниже.`,
                  )}</p>
                  {fallbackLevel && <button type="button" onClick={() => setChosenLevel(fallbackLevel)}>
                    {w(`View ${fallbackLevel} instead`, `Открыть уровень «${t(fallbackLevel[0].toUpperCase() + fallbackLevel.slice(1))}»`)}
                  </button>}
                </div>
              )}
              {placing && <p className={styles.placementHint}>{w("Click or tap to place the pin. Keyboard: Enter places at center; arrow keys move it.", "Нажмите на карту, чтобы разместить метку. Клавиатура: Enter — центр, стрелки — перемещение.")}</p>}
            </div>
            <div className={styles.legend}>
              <span><i className={styles.legendCurrent} />{t("Current location")}</span>
              <span><i className={styles.legendVisited} />{t("Visited")}</span>
              <span><i className={styles.legendKnown} />{t("Known")}</span>
              {destinationId && <span><i className={styles.legendGoal} />{w("Goal", "Цель")}</span>}
              <span>{w("Pins are records; artwork is illustrative.", "Метки взяты из записей; фон — иллюстрация.")}</span>
            </div>
            {mapVisual.olderArtwork && artworkVisible && <p className={styles.artNote}>{w("Older map artwork · structured pins are current. Regenerate when you wish.", "Прежнее изображение карты · метки актуальны. При желании создайте новое.")}</p>}
          </div>
          <aside className={styles.detail} aria-label={w("Selected location", "Выбранное место")}>
            {selected ? (
              <>
                {selectedIllustration?.image && (
                  <div className={styles.locationIllustration}>
                    <span className="eyebrow">{w("LOCATION ILLUSTRATION", "ИЛЛЮСТРАЦИЯ МЕСТА")}</span>
                    <SubjectVisual snapshot={snapshot} subject={{ kind: "location", id: selected.id }} />
                  </div>
                )}
                <span className="eyebrow">{w("PLACE RECORD", "ЗАПИСЬ О МЕСТЕ")}</span>
                <h2>{selected.name}</h2>
                <div className={styles.badges}>
                  <Badge green={selected.status === "visited"}>{selected.status === "rumored" ? w("Rumour", "Слух") : t(selected.status === "visited" ? "Visited" : "Known")}</Badge>
                  {selected.detail?.whereabouts && <span className={styles.secondaryNote}>{selected.detail.whereabouts}</span>}
                  {selected.id === currentId && <Badge green>{t("Current location")}</Badge>}
                  {selected.id === destinationId && <Badge>{t("Destination selected")}</Badge>}
                </div>
                <p className={styles.description}>{selected.description || w("No description recorded yet.", "Описание пока не записано.")}</p>
                {byId.get(selected.id)?.revision === 0 && <p className={styles.secondaryNote}>
                  {w("This place is shown approximately.", "Это место показано приблизительно.")}
                </p>}
                <Button primary disabled={selected.id === currentId} onClick={() => plotCourse(selected)}>
                  {selected.id === currentId ? t("Current location") : destinationId === selected.id ? t("Destination selected") : w("Plot a course", "Наметить курс")}
                </Button>
                <AtlasDisclosure title={w("Location illustration & history", "Иллюстрация места и история")} open={reviewPreset?.detail}>
                  <p className={styles.secondaryNote}>{w("This illustration depicts this place. Atlas artwork depicts the wider map behind its pins. Neither image changes the place or travel rules.", "Иллюстрация показывает это место. Изображение атласа служит фоном карты за метками. Ни одно изображение не меняет место или правила путешествия.")}</p>
                  <RedrawAnchor data={snapshot} subject={{ kind: "location", id: selected.id }} name={selected.name} />
                  <time dateTime={selected.updated_at}>{new Date(selected.updated_at).toLocaleDateString(language)}</time>
                </AtlasDisclosure>
              </>
            ) : (
              <p className={styles.secondaryNote}>{w("Choose a known place to see its details.", "Выберите известное место, чтобы увидеть сведения.")}</p>
            )}
          </aside>
        </div>
      </section>
      {destination && (
        <div className={styles.destination} role="status">
          <strong>{w("Planned destination: ", "Выбранное направление: ")}{destination.name}</strong>
          <p>{courseInserted
            ? w("No travel has started. This is already in your turn box — the DM decides the road, the time and who you meet:", "Путешествие ещё не началось. В поле хода уже вставлено — путь, время и встречи решает ведущий:")
            : w("No travel has started. Describe your journey in Game:", "Путешествие ещё не началось. Опишите свой путь в Игре:")}</p>
          <p className={styles.journey}>{w(`I travel to ${destination.name}.`, `Отправляюсь. Цель — ${destination.name}.`)}</p>
          {reviewOnly ? (
            <span className="button" aria-disabled="true">{t("Game")}</span>
          ) : (
            <Link className="button" href={`/campaigns/${campaignId}/game`}>{t("Game")} <Icon name="ArrowRight" size={14} /></Link>
          )}
        </div>
      )}
      {layoutError && <p role="alert" className={styles.secondaryNote}>{layoutError}</p>}
      <div className={styles.lowerPanels}>
        <AtlasDisclosure title={w(`Unplaced known locations (${projection.unplaced.length})`, `Известные места без меток (${projection.unplaced.length})`)} open={reviewPreset?.panel === "unplaced-open"}>
          <p className={styles.secondaryNote}>{w("These places are known in the story. Their position and hierarchy have not been recorded.", "Эти места известны по истории. Их положение и иерархия ещё не записаны.")}</p>
          <LocationList rows={projection.unplaced} selectedId={selected?.id} currentId={currentId} onSelect={selectLocation} />
        </AtlasDisclosure>
        <AtlasDisclosure title={t("Discovered locations")}>
          <LocationList rows={projection.locations} selectedId={selected?.id} currentId={currentId} onSelect={selectLocation} />
        </AtlasDisclosure>
        <AtlasDisclosure title={w("Edit map layout", "Изменить размещение на карте")} open={reviewPreset?.panel === "edit-open"}>
          <p className={styles.secondaryNote}>{w("Presentation only. Choose an existing known place, its level and parent, then click or tap the map. Saving never changes travel or the Location record.", "Только оформление. Выберите известное место, уровень и родительскую область, затем нажмите на карту. Сохранение не меняет путешествие или запись места.")}</p>
          <div className={styles.editForm}>
            <label>{w("Known place", "Известное место")}
              <select value={editLocationId} onChange={(event) => startEditing(event.target.value)} disabled={reviewOnly}>
                <option value="">{w("Choose a place", "Выберите место")}</option>
                {projection.locations.map((row) => <option key={row.id} value={row.id}>{row.name}</option>)}
              </select>
            </label>
            <label>{w("Map level", "Уровень карты")}
              <select value={editLevel} onChange={(event) => { setEditLevel(event.target.value as AtlasLevel); setEditParentId(null); setEditPoint(null); setPlacing(false); pendingSave.current = null; }} disabled={reviewOnly || !editLocationId}>
                <option value="world">{t("World")}</option><option value="region">{t("Region")}</option><option value="local">{t("Local")}</option>
              </select>
            </label>
            {editLevel !== "world" && (
              <label>{w("Parent area", "Родительская область")}
                <select value={editParentId ?? ""} onChange={(event) => { setEditParentId(event.target.value || null); setEditPoint(null); setPlacing(false); pendingSave.current = null; }} disabled={reviewOnly || !editLocationId}>
                  <option value="">{w("Choose a parent", "Выберите родительскую область")}</option>
                  {parentOptions.filter((row) => row.location_id !== editLocationId).map((row) => (
                    <option key={row.location_id} value={row.location_id}>{knownLocation(snapshot, row.location_id)?.name}</option>
                  ))}
                </select>
              </label>
            )}
            <div className={styles.editActions}>
              <Button disabled={reviewOnly || !editLocationId || !editReady} onClick={preparePlacement}>{editorRow ? w("Move / place pin", "Переместить метку") : w("Place pin", "Разместить метку")}</Button>
              <Button primary disabled={reviewOnly || !editPoint || !editReady || saving} onClick={() => void savePlacement()}>{saving ? w("Saving…", "Сохранение…") : w("Save layout", "Сохранить размещение")}</Button>
            </div>
            {editPoint && <p className={styles.secondaryNote} role="status">{w("Pin selected on map. Save to keep this placement.", "Метка выбрана на карте. Сохраните её размещение.")}</p>}
            {saveError && <p role="alert">{saveError}</p>}
            {reviewOnly && <p className={styles.secondaryNote}>{w("Synthetic UI review · editing is disabled.", "Синтетический обзор интерфейса · редактирование отключено.")}</p>}
          </div>
        </AtlasDisclosure>
      </div>
    </>
  );
}

function LocationList({
  rows,
  selectedId,
  currentId,
  onSelect,
}: {
  rows: Location[];
  selectedId?: string;
  currentId: string | null;
  onSelect: (id: string) => void;
}) {
  const { t } = useLanguage();
  if (!rows.length) return <p className={styles.secondaryNote}>{t("No known locations recorded.")}</p>;
  return (
    <div className={styles.placeList}>
      {rows.map((row) => (
        <button type="button" key={row.id} aria-pressed={selectedId === row.id} onClick={() => onSelect(row.id)}>
          <Icon name="map" size={18} />
          <span>{row.name}<small>{t(row.id === currentId ? "Current location" : row.status === "visited" ? "Visited" : row.status === "rumored" ? "Rumoured" : "Known")}</small></span>
        </button>
      ))}
    </div>
  );
}
