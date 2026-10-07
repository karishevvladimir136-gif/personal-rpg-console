"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { CampaignSnapshot, Mutation } from "@/lib/persistence/contracts";
import type { MapPlacement } from "@/lib/map/placement-contracts";
import { loadMapLayout, saveMapPlacement } from "@/lib/map/placement-client";
import { ensureCurrentMapPlacement } from "@/lib/map/auto-placement";
import type { AutoPlacementAttempt } from "@/lib/map/auto-placement";
import { sameTimeline } from "@/lib/saves/fence";
import { useOptionalCampaignData } from "../persistence-context";
import { useLanguage } from "../language-context";
import { Button } from "../ui";
import { referenceIsCurrent, visualDocuments } from "@/lib/visual-frame/model";
import {
  createMapVisualAttempt,
  createMapVisualOwnerDecision,
  defaultMediaFrameTransport,
  finishMapVisualAttempt,
  storedMapVisualDispatch,
  storedMapVisualRecovery,
} from "@/lib/visual-frame/media-client";
import type {
  MapVisualAttempt, MediaCapability, MediaFrameTransport,
} from "@/lib/visual-frame/media-client";
import {
  mapVisualDocuments, mapVisualPendingIsCurrent, mapVisualPublicFactsStillVisible, publicMapBasis,
  safeMapVisualAsset, selectMapVisual,
} from "@/lib/visual-frame/map-job";
import type { MapLevel, MapVisualJob } from "@/lib/visual-frame/map-job";

/** Contextual atlas control; all paid work uses the existing FRAME provider and review lifecycle. */
export function GenerateMap({
  snapshot: snapshotOverride,
  placements,
  level,
  anchorId,
  onPlacementsReady,
  reviewOnly = false,
  transport = defaultMediaFrameTransport,
}: {
  snapshot?: CampaignSnapshot;
  placements: MapPlacement[];
  level: MapLevel;
  anchorId: string | null;
  onPlacementsReady?: (placements: MapPlacement[]) => void;
  reviewOnly?: boolean;
  transport?: MediaFrameTransport;
}) {
  const context = useOptionalCampaignData();
  const snapshot = context?.data ?? snapshotOverride;
  const refresh = context?.refresh ?? (async () => {});
  const effectiveReviewOnly = reviewOnly || !context;
  const { language } = useLanguage();
  const w = (en: string, ru: string) => language === "ru" ? ru : en;
  const [capability, setCapability] = useState<MediaCapability | null>(null);
  const [proposal, setProposal] = useState<MapVisualJob | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [retryRequest, setRetryRequest] = useState(false);
  const pending = useRef<MapVisualAttempt | null>(null);
  const decision = useRef<{ action: "media.accept" | "media.discard"; input: Mutation } | null>(null);
  const queuedDispatch = useRef<Mutation | null>(null);
  const pendingPlacement = useRef<AutoPlacementAttempt | null>(null);
  const lock = useRef(false);
  const campaignId = snapshot?.campaign.id;

  useEffect(() => {
    let active = true;
    if (campaignId && !effectiveReviewOnly)
      void transport.capability(campaignId)
        .then((value) => { if (active) setCapability(value); })
        .catch(() => { if (active) setCapability(null); });
    return () => { active = false; };
  }, [campaignId, transport, effectiveReviewOnly]);

  if (!snapshot || !publicMapBasis(snapshot, placements, level, anchorId)) return null;
  if (effectiveReviewOnly) return (
    <div className="space-y-2" aria-label={w("Map artwork", "Иллюстрация карты")}>
      <Button disabled>{w("Generate map", "Создать карту")}</Button>
      <p className="muted">{w("Preview only · no image request will be sent", "Только пример · запрос изображения не отправляется")}</p>
    </div>
  );
  const currentSnapshot = snapshot;

  const jobs = mapVisualDocuments(snapshot)
    .filter(({ value }) => value.basis.level === level &&
      (value.basis.anchor?.id ?? null) === anchorId &&
      (["queued", "generating", "draft", "uncertain"].includes(value.status)
        ? mapVisualPendingIsCurrent(snapshot, placements, value)
        : mapVisualPublicFactsStillVisible(snapshot, value.basis, placements)))
    .sort((a, b) => a.record.updated_at.localeCompare(b.record.updated_at) ||
      a.record.id.localeCompare(b.record.id));
  const latest = jobs.at(-1);
  const queued = [...jobs].reverse().find(({ value }) => value.status === "queued");
  const generating = [...jobs].reverse().find(({ value }) => value.status === "generating");
  const draft = [...jobs].reverse().find(({ value }) => value.status === "draft");
  const accepted = [...jobs].reverse().find(({ value }) =>
    value.status === "completed" && value.resultAssetId &&
    snapshot.assets.some((asset) => asset.id === value.resultAssetId &&
      safeMapVisualAsset(snapshot, asset, placements)));
  const selected = selectMapVisual(snapshot, placements, level, anchorId);

  async function run(work: () => Promise<void>) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try { await work(); }
    catch {
      if (pending.current) setRetryRequest(true);
      setError(w(
        "The map image action could not be confirmed. Gameplay and previous art are unchanged; retry the same step or refresh.",
        "Действие с картой не подтверждено. Игра и прежняя иллюстрация не изменились; повторите шаг или обновите страницу.",
      ));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  function prepare() {
    void run(async () => {
      if (!currentSnapshot.timeline || !transport.prepareMap) throw new Error("unavailable");
      // A provisional pin is presentation only. On this explicit owner action,
      // persist it through the existing map-layout authority before preparing
      // an image job; migration 41 accepts only real placement revisions.
      if (level === "world" && anchorId === null) {
        const fresh = await transport.load(currentSnapshot.campaign.id);
        if (!sameTimeline(fresh.timeline, currentSnapshot.timeline) ||
          fresh.publicState.revision !== currentSnapshot.publicState.revision ||
          fresh.publicState.current_location_id !== currentSnapshot.publicState.current_location_id)
          throw new Error("conflict");
        const layout = await ensureCurrentMapPlacement(
          currentSnapshot, placements, pendingPlacement,
          { load: loadMapLayout, save: saveMapPlacement, requestId: () => crypto.randomUUID() },
        );
        if (layout) {
          onPlacementsReady?.(layout.placements);
          const placed = layout.placements.find((row) =>
            row.location_id === currentSnapshot.publicState.current_location_id);
          if (!placed || placed.level !== "world" || placed.parent_location_id !== null ||
            placed.x === null || placed.y === null || placed.revision < 1)
            throw new Error("conflict");
        }
      }
      const referenceIds = visualDocuments(currentSnapshot)
        .filter(({ value }) =>
          value.kind === "reference" && value.subject.kind === "style" &&
          value.subject.id === currentSnapshot.campaign.id &&
          value.approval === "approved" && referenceIsCurrent(currentSnapshot, value))
        .slice(0, 8).map(({ record }) => record.id);
      const next = await transport.prepareMap({
        campaignId: currentSnapshot.campaign.id,
        timeline: currentSnapshot.timeline,
        expectedPublicStateRevision: currentSnapshot.publicState.revision,
        level, anchorId, referenceIds,
        retryOf: latest && ["draft", "discarded", "completed", "failed", "cancelled", "uncertain"].includes(latest.value.status)
          ? latest.record.id : null,
      });
      setProposal(next);
    });
  }
  function generate() {
    void run(async () => {
      if (!pending.current) {
        if (!proposal || !capability?.reservationUsdMicros) throw new Error("validation");
        pending.current = createMapVisualAttempt(currentSnapshot, proposal, capability.reservationUsdMicros);
      }
      await finishMapVisualAttempt(pending.current, transport);
      await refresh();
      pending.current = null;
      setRetryRequest(false);
      setProposal(null);
    });
  }
  function retryGenerate() {
    void run(async () => {
      if (!pending.current) throw new Error("validation");
      await finishMapVisualAttempt(pending.current, transport);
      await refresh();
      pending.current = null;
      setRetryRequest(false);
    });
  }
  function recover() {
    void run(async () => {
      if (!generating) throw new Error("validation");
      await transport.send({
        action: "media.recover",
        input: storedMapVisualRecovery(currentSnapshot, generating.record),
      });
      await refresh();
    });
  }
  function continueQueued() {
    void run(async () => {
      if (!queued || !capability?.reservationUsdMicros) throw new Error("validation");
      queuedDispatch.current ??= storedMapVisualDispatch(
        currentSnapshot, queued.record, capability.reservationUsdMicros);
      await transport.send({
        action: "media.dispatch", input: structuredClone(queuedDispatch.current),
      });
      await refresh();
      queuedDispatch.current = null;
    });
  }
  function decide(action: "media.accept" | "media.discard") {
    void run(async () => {
      if (!draft) throw new Error("validation");
      decision.current ??= {
        action,
        input: createMapVisualOwnerDecision(currentSnapshot, draft.record,
          action === "media.accept" ? "accept" : "discard"),
      };
      await transport.send({
        action: decision.current.action,
        input: structuredClone(decision.current.input),
      });
      await refresh();
      decision.current = null;
    });
  }

  return (
    <section className="space-y-2" aria-label={w("Map artwork", "Иллюстрация карты")}>
      <div className="button-group">
        <Button disabled={busy || !capability?.enabled || Boolean(generating || queued)} onClick={prepare}>
          {accepted ? w("Regenerate map", "Создать карту заново") : w("Generate map", "Создать карту")}
        </Button>
        {jobs.length > 0 && (
          <Button onClick={() => setShowHistory((value) => !value)}>
            {w("Image history", "История изображений")}
          </Button>
        )}
      </div>
      {selected.olderArtwork && <p className="muted">
        {w("Older map artwork · pins and public records remain current.", "Прежняя иллюстрация карты · метки и открытые записи остаются актуальными.")}
      </p>}
      {proposal && !retryRequest && <div className="rounded border border-[#765b36] p-3">
        <p>{w("Review map image request", "Проверьте запрос на карту")}</p>
        <p className="muted">{w(
          "Optional paid image and safety check. Reserved ceiling: $" +
            ((capability?.totalReservationUsdMicros ?? 0) / 1_000_000).toFixed(2) +
            ". Only public placed Locations and approved written style guidance are sent. Reference pixels are not sent. The image never changes gameplay or routes.",
          "Необязательное платное изображение и проверка. Лимит резерва: $" +
            ((capability?.totalReservationUsdMicros ?? 0) / 1_000_000).toFixed(2) +
            ". Используются только открытые размещённые места и утверждённые текстовые указания. Пиксели образцов не передаются. Изображение не меняет игру или маршруты.",
        )}</p>
        <Button primary disabled={busy} onClick={generate}>{w("Confirm image request", "Подтвердить создание")}</Button>
        <Button disabled={busy} onClick={() => setProposal(null)}>{w("Not now", "Не сейчас")}</Button>
      </div>}
      {retryRequest && <Button disabled={busy} onClick={retryGenerate}>
        {w("Retry same map request", "Повторить тот же запрос карты")}
      </Button>}
      {generating && <div>
        <p role="status">{w("Map request saved. Gameplay can continue.", "Запрос карты сохранён. Игру можно продолжать.")}</p>
        <Button disabled={busy} onClick={recover}>{w("Check saved image", "Проверить сохранённое изображение")}</Button>
      </div>}
      {queued && !generating && <div>
        <p role="status">{w("A map request is saved but not yet sent.", "Запрос карты сохранён, но ещё не отправлен.")}</p>
        <Button disabled={busy || !capability?.enabled} onClick={continueQueued}>
          {w("Continue saved request", "Продолжить сохранённый запрос")}
        </Button>
      </div>}
      {draft && <div className="space-y-2 rounded border border-[#765b36] p-3">
        <p>{w("Review generated map draft", "Проверьте черновик карты")}</p>
        {draft.value.review?.status === "review_warning" && <p role="status">
          {w("The image check found a possible issue.", "Проверка обнаружила возможную проблему.")}
        </p>}
        {transport.draftImageUrl && <Image unoptimized
          src={transport.draftImageUrl(snapshot.campaign.id, draft.record.id)}
          alt={w("Unaccepted map image draft", "Непринятый черновик карты")}
          width={1536} height={1024} className="h-auto w-full rounded object-contain" />}
        <div className="button-group">
          <Button primary disabled={busy} onClick={() => decide("media.accept")}>{w("Keep image", "Сохранить изображение")}</Button>
          <Button disabled={busy} onClick={() => decide("media.discard")}>{w("Discard", "Отклонить")}</Button>
        </div>
      </div>}
      {showHistory && <div className="rounded border border-[#765b36] p-3">
        <p className="muted">{w("Saved map requests: " + jobs.length, "Сохранено запросов карты: " + jobs.length)}</p>
        <p className="muted">{w(
          "Accepted pixels are atlas presentation only. Pins, names, routes and travel authority come from the application.",
          "Принятые пиксели служат только оформлением. Метки, названия, маршруты и перемещение определяет приложение.",
        )}</p>
      </div>}
      {busy && <p role="status">{w("Working…", "Выполняется…")}</p>}
      {error && <p role="alert">{error}</p>}
      {!capability?.enabled && <p className="muted">
        {w("Map image generation is not enabled locally.", "Создание карты локально не включено.")}
      </p>}
    </section>
  );
}
