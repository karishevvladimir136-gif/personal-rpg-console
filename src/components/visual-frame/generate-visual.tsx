"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useOptionalCampaignData } from "../persistence-context";
import { useLanguage } from "../language-context";
import { Button } from "../ui";
import { createMutationAttempt, readJson } from "@/lib/persistence/client";
import type { CampaignSnapshot, Mutation, MutationResult } from "@/lib/persistence/contracts";
import {
  newVisualReference,
  referenceIsCurrent,
  visualDocumentMutation,
  visualDocuments,
} from "@/lib/visual-frame/model";
import {
  createSubjectVisualAttempt,
  createSubjectVisualOwnerDecision,
  defaultMediaFrameTransport,
  finishSubjectVisualAttempt,
  storedSubjectVisualDispatch,
  storedSubjectVisualRecovery,
} from "@/lib/visual-frame/media-client";
import type {
  MediaCapability,
  MediaFrameTransport,
  SubjectVisualAttempt,
} from "@/lib/visual-frame/media-client";
import {
  publicSubjectBasis,
  safeSubjectVisualAsset,
  subjectVisualDocuments,
} from "@/lib/visual-frame/subject-job";
import type { SubjectVisualJob } from "@/lib/visual-frame/subject-job";
import type { PublicVisualSubject } from "@/lib/visual-frame/subject-visual";
import { frameRecoveryOverdue } from "@/lib/visual-frame/real-frame";
import { SubjectVisual } from "./subject-visual";

function imageJobStatus(status: SubjectVisualJob["status"], w: (en: string, ru: string) => string) {
  return {
    queued: w("Saved, not sent", "Сохранено, не отправлено"),
    generating: w("Generating", "Создаётся"),
    draft: w("Draft ready for review", "Черновик готов к проверке"),
    completed: w("Accepted", "Принято"),
    discarded: w("Discarded", "Отклонено"),
    failed: w("No usable draft", "Нет подходящего черновика"),
    cancelled: w("Cancelled", "Отменено"),
    uncertain: w("Outcome unconfirmed", "Результат не подтверждён"),
  }[status];
}

/** Same media service, reservation and review flow for all three public subjects. */
export function GenerateVisual({
  subject,
  transport = defaultMediaFrameTransport,
  className = "",
  reviewOnly = false,
  showArtwork = true,
  compactDetails = false,
  snapshot: snapshotOverride,
}: {
  subject: PublicVisualSubject;
  transport?: MediaFrameTransport;
  className?: string;
  reviewOnly?: boolean;
  showArtwork?: boolean;
  /** Keep reference approval and job history behind one secondary disclosure in Item Details. */
  compactDetails?: boolean;
  /** Public fixture/read model for standalone Map review without a campaign context. */
  snapshot?: CampaignSnapshot;
}) {
  const context = useOptionalCampaignData();
  const data = context?.data ?? snapshotOverride;
  const refresh = context?.refresh ?? (async () => {});
  const effectiveReviewOnly = reviewOnly || !context;
  const { language } = useLanguage();
  const w = (en: string, ru: string) => language === "ru" ? ru : en;
  const [capability, setCapability] = useState<MediaCapability | null>(null);
  const [proposal, setProposal] = useState<SubjectVisualJob | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [retryRequest, setRetryRequest] = useState(false);
  const [pendingJobId, setPendingJobId] = useState<string | null>(null);
  const pending = useRef<SubjectVisualAttempt | null>(null);
  const decision = useRef<{ action: "media.accept" | "media.discard"; input: Mutation } | null>(null);
  const referenceDraft = useRef<Mutation | null>(null);
  const referenceApproval = useRef<Mutation | null>(null);
  const queuedDispatch = useRef<Mutation | null>(null);
  const lock = useRef(false);
  const saveReference = (input: Mutation) => readJson<MutationResult>("/api/visual-frame", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const campaignId = data?.campaign.id;

  useEffect(() => {
    let active = true;
    if (campaignId && !effectiveReviewOnly)
      void transport.capability(campaignId)
        .then((value) => { if (active) setCapability(value); })
        .catch(() => { if (active) setCapability(null); });
    return () => { active = false; };
  }, [campaignId, transport, effectiveReviewOnly]);

  if (!data || !publicSubjectBasis(data, subject)) return null;
  if (effectiveReviewOnly) {
    const label = subject.kind === "entity"
      ? w("Generate portrait", "Создать портрет")
      : subject.kind === "item"
        ? w("Generate item image", "Создать изображение предмета")
        : w("Generate location image", "Создать изображение места");
    return (
      <section className={`space-y-2 ${className}`.trim()}>
        {showArtwork && <SubjectVisual snapshot={data} subject={subject} />}
        <Button disabled>{label}</Button>
        <p className="muted">{w("Preview only · no image request will be sent", "Только пример · запрос изображения не отправляется")}</p>
      </section>
    );
  }
  const snapshot = data;
  const jobs = subjectVisualDocuments(snapshot)
    .filter(({ value }) =>
      value.basis.subject.kind === subject.kind &&
      value.basis.subject.id === subject.id,
    )
    .sort((a, b) =>
      a.record.updated_at.localeCompare(b.record.updated_at) ||
      a.record.id.localeCompare(b.record.id),
    );
  const latest = jobs.at(-1);
  const savedPending = jobs.find(({ record }) => record.id === pendingJobId);
  const savedPendingIsTerminal = Boolean(savedPending && [
    "draft", "discarded", "completed", "failed", "cancelled", "uncertain",
  ].includes(savedPending.value.status));
  const queued = [...jobs].reverse().find(({ value }) => value.status === "queued");
  const draft = [...jobs].reverse().find(({ value }) => value.status === "draft");
  const generating = [...jobs].reverse().find(({ value }) => value.status === "generating");
  const recoveryOverdue = generating ? frameRecoveryOverdue(generating.record) : false;
  const completed = [...jobs].reverse().find(({ value }) => {
    if (value.status !== "completed" || !value.resultAssetId) return false;
    const asset = snapshot.assets.find((row) => row.id === value.resultAssetId);
    return asset && safeSubjectVisualAsset(snapshot, asset);
  });
  const completedAsset = snapshot.assets.find(
    (row) => row.id === completed?.value.resultAssetId,
  );
  const reference = completedAsset && visualDocuments(snapshot).find(({ value }) =>
    value.kind === "reference" &&
    value.subject.kind === subject.kind &&
    value.subject.id === subject.id &&
    value.imageAssetId === completedAsset.id &&
    value.approval !== "invalidated" &&
    referenceIsCurrent(snapshot, value),
  );
  const currentSubject = publicSubjectBasis(snapshot, subject);
  const canUseAsReference = Boolean(
    completedAsset && completed && currentSubject &&
    JSON.stringify(currentSubject) === JSON.stringify(completed.value.basis.subject),
  );
  const canApproveReference = canUseAsReference && (!reference ||
    (reference.value.kind === "reference" && reference.value.approval !== "approved"));
  const artLabel = subject.kind === "entity"
    ? w("portrait", "портрет")
    : subject.kind === "item"
      ? w("item image", "изображение предмета")
      : w("location image", "изображение места");

  async function run(work: () => Promise<void>) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try { await work(); }
    catch {
      if (pending.current) {
        setRetryRequest(true);
        setPendingJobId(pending.current.dispatch?.operation === "document.save"
          ? pending.current.dispatch.payload.id ?? null : null);
      }
      setError(w(
        "The image action could not be confirmed. Your previous art and gameplay are unchanged; retry the same step or refresh.",
        "Действие с изображением не подтверждено. Прежнее изображение и игра не изменились; повторите шаг или обновите страницу.",
      ));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  function prepare() {
    void run(async () => {
      if (!snapshot.timeline || !transport.prepareSubject) throw new Error("unavailable");
      const referenceIds = visualDocuments(snapshot)
        .filter(({ value }) =>
          value.kind === "reference" &&
          value.approval === "approved" &&
          referenceIsCurrent(snapshot, value) &&
          ((value.subject.kind === subject.kind && value.subject.id === subject.id) ||
            (value.subject.kind === "style" && value.subject.id === snapshot.campaign.id)),
        )
        .slice(0, 8)
        .map(({ record }) => record.id);
      const next = await transport.prepareSubject({
        campaignId: snapshot.campaign.id,
        timeline: snapshot.timeline,
        expectedPublicStateRevision: snapshot.publicState.revision,
        subject,
        referenceIds,
        retryOf: latest && ["draft", "discarded", "completed", "failed", "cancelled", "uncertain"].includes(latest.value.status)
          ? latest.record.id : null,
      });
      setProposal(next);
      setExpanded(true);
    });
  }
  function generate() {
    void run(async () => {
      if (!pending.current) {
        if (!proposal || !capability?.reservationUsdMicros) throw new Error("validation");
        pending.current = createSubjectVisualAttempt(snapshot, proposal, capability.reservationUsdMicros);
      }
      await finishSubjectVisualAttempt(pending.current, transport);
      await refresh();
      pending.current = null;
      setPendingJobId(null);
      setRetryRequest(false);
      setProposal(null);
    });
  }
  function retryGenerate() {
    void run(async () => {
      if (!pending.current) throw new Error("validation");
      await finishSubjectVisualAttempt(pending.current, transport);
      await refresh();
      pending.current = null;
      setPendingJobId(null);
      setRetryRequest(false);
    });
  }
  function checkSavedStatus() {
    void run(async () => { await refresh(); });
  }
  function closeSavedNotice() {
    pending.current = null;
    setPendingJobId(null);
    setRetryRequest(false);
    setProposal(null);
    setError("");
  }
  function recover() {
    void run(async () => {
      if (!generating) throw new Error("validation");
      await transport.send({
        action: "media.recover",
        input: storedSubjectVisualRecovery(snapshot, generating.record),
      });
      await refresh();
    });
  }
  function continueQueued() {
    void run(async () => {
      if (!queued || !capability?.reservationUsdMicros) throw new Error("validation");
      queuedDispatch.current ??= storedSubjectVisualDispatch(
        snapshot, queued.record, capability.reservationUsdMicros,
      );
      await transport.send({ action: "media.dispatch", input: structuredClone(queuedDispatch.current) });
      await refresh();
      queuedDispatch.current = null;
    });
  }
  function decide(action: "media.accept" | "media.discard") {
    void run(async () => {
      if (!draft) throw new Error("validation");
      decision.current ??= {
        action,
        input: createSubjectVisualOwnerDecision(snapshot, draft.record, action === "media.accept" ? "accept" : "discard"),
      };
      await transport.send({
        action: decision.current.action,
        input: structuredClone(decision.current.input),
      });
      await refresh();
      decision.current = null;
    });
  }
  function useAsReference() {
    void run(async () => {
      if (!canUseAsReference || !completedAsset) throw new Error("conflict");
      let current = await transport.load(snapshot.campaign.id);
      let draftRow = visualDocuments(current).find(({ value }) =>
        value.kind === "reference" &&
        value.subject.kind === subject.kind &&
        value.subject.id === subject.id &&
        value.imageAssetId === completedAsset.id &&
        value.approval === "draft" &&
        referenceIsCurrent(current, value),
      );
      if (!draftRow) {
        const value = {
          ...newVisualReference(current, subject),
          imageAssetId: completedAsset.id,
          imageAssetRevision: completedAsset.revision,
        };
        referenceDraft.current ??= createMutationAttempt(null, visualDocumentMutation(current, value));
        const result = await saveReference(structuredClone(referenceDraft.current));
        referenceDraft.current = null;
        current = await transport.load(snapshot.campaign.id);
        draftRow = visualDocuments(current).find(({ record }) => record.id === result.id);
      }
      if (!draftRow || draftRow.value.kind !== "reference" || draftRow.value.approval !== "draft")
        throw new Error("conflict");
      referenceApproval.current ??= createMutationAttempt(null, visualDocumentMutation(
        current,
        { ...draftRow.value, approval: "approved" },
        draftRow.record,
      ));
      await saveReference(structuredClone(referenceApproval.current));
      referenceApproval.current = null;
      await refresh();
    });
  }

  return (
    <section className={`space-y-2 ${className}`.trim()} aria-label={w("Visual image", "Изображение")}>
      {showArtwork && <SubjectVisual snapshot={snapshot} subject={subject} />}
      <div className="button-group">
        <Button disabled={busy || retryRequest || !capability?.enabled || Boolean(generating || queued)} onClick={prepare}>
          {completed
            ? w(`Regenerate ${artLabel}`, `Создать заново: ${artLabel}`)
            : draft
              ? w(`Generate another ${artLabel}`, `Создать ещё: ${artLabel}`)
              : w(`Generate ${artLabel}`, `Создать ${artLabel}`)}
        </Button>
        {completedAsset && (
          <Button onClick={() => setExpanded((value) => !value)}>
            {w("View image", "Посмотреть изображение")}
          </Button>
        )}
        {!compactDetails && canUseAsReference && reference?.value.kind === "reference" && reference.value.approval !== "approved" && (
          <Button disabled={busy} onClick={useAsReference}>{w("Use as visual reference", "Использовать как визуальный образец")}</Button>
        )}
        {!compactDetails && canUseAsReference && !reference && (
          <Button disabled={busy} onClick={useAsReference}>{w("Use as visual reference", "Использовать как визуальный образец")}</Button>
        )}
      </div>
      {proposal && !retryRequest && (
        <div className="rounded border border-[#765b36] p-3">
          <p>{w(`Review ${artLabel} request`, `Проверьте запрос: ${artLabel}`)}</p>
          <p className="muted">
            {w(
              `Optional paid image and safety check. Reserved ceiling: $${((capability?.totalReservationUsdMicros ?? 0) / 1_000_000).toFixed(2)}. Only public record facts and approved written guidance are sent; reference pixels are not sent. Gameplay is unaffected.`,
              `Необязательное платное изображение и проверка. Лимит резерва: $${((capability?.totalReservationUsdMicros ?? 0) / 1_000_000).toFixed(2)}. Используются только открытые записи и утверждённые текстовые указания; пиксели образцов не передаются. Игра не меняется.`,
            )}
          </p>
          <Button primary disabled={busy} onClick={generate}>{w("Confirm image request", "Подтвердить создание")}</Button>
          <Button disabled={busy} onClick={() => setProposal(null)}>{w("Not now", "Не сейчас")}</Button>
        </div>
      )}
      {retryRequest && (
        <div className="space-y-2">
          <p className="muted">{savedPendingIsTerminal
            ? w(
                "This saved image attempt is finished. Closing this notice will not generate anything; a new image needs a separate priced confirmation.",
                "Сохранённая попытка завершена. Закрытие этого сообщения ничего не создаст; для нового изображения потребуется отдельное платное подтверждение.",
              )
            : w(
                "Checking status only reads the saved request. An exact retry keeps its identity: if the image was not yet claimed, it may send the original paid request; a claimed image is never sent twice.",
                "Проверка статуса только читает сохранённый запрос. Точный повтор сохраняет его идентификатор: если изображение ещё не было начато, исходный платный запрос может быть отправлен; уже начатое изображение не отправляется дважды.",
              )}</p>
          <div className="button-group">
            <Button disabled={busy} onClick={checkSavedStatus}>{w("Refresh saved status", "Обновить сохранённый статус")}</Button>
            {savedPendingIsTerminal
              ? <Button disabled={busy} onClick={closeSavedNotice}>{w("Close request notice", "Закрыть сообщение о запросе")}</Button>
              : <Button disabled={busy} onClick={retryGenerate}>{w("Retry same image request", "Повторить тот же запрос")}</Button>}
          </div>
        </div>
      )}
      {generating && (
        <div className="space-y-2">
          <p role="status">{recoveryOverdue
            ? w("Image result is overdue. Check the saved status or recover this exact request; gameplay can continue.", "Результат изображения задерживается. Проверьте сохранённый статус или восстановите этот запрос; игру можно продолжать.")
            : w("Image request saved and generating. Gameplay can continue.", "Запрос изображения сохранён и выполняется. Игру можно продолжать.")}</p>
          <Button disabled={busy} onClick={checkSavedStatus}>{w("Refresh saved status", "Обновить сохранённый статус")}</Button>
          {recoveryOverdue && <>
            <p className="muted">{w(
              "Recovery uses stored pixels and receipts, never a new image request. An unstarted review may use its existing reservation.",
              "Восстановление использует сохранённые пиксели и подтверждения, а не новый запрос изображения. Ещё не начатая проверка может использовать уже выделенный резерв.",
            )}</p>
            <Button disabled={busy} onClick={recover}>{w("Recover saved image", "Восстановить сохранённое изображение")}</Button>
          </>}
        </div>
      )}
      {latest?.value.status === "uncertain" && (
        <p role="status">{w(
          "This image attempt ended without a confirmed draft. It will not be sent again automatically, and recovery is not offered for this finished request. A new generation needs a separate priced confirmation.",
          "Эта попытка завершилась без подтверждённого черновика. Повторной автоматической отправки не будет, а для завершённого запроса восстановление недоступно. Новое создание требует отдельного платного подтверждения.",
        )}</p>
      )}
      {latest?.value.status === "failed" && (
        <p role="status">{["grounding", "review"].includes(latest.value.failure ?? "")
          ? w(
              "The generated image did not pass review. It was not added to your artwork. Earlier accepted art is kept; another generation requires a new priced confirmation.",
              "Созданное изображение не прошло проверку и не добавлено к иллюстрациям. Ранее принятые изображения сохранены; новое создание требует отдельного платного подтверждения.",
            )
          : w(
              "This image request did not produce a reviewable draft. Earlier accepted art is kept; another generation requires a new priced confirmation.",
              "Этот запрос не создал черновик для проверки. Ранее принятые изображения сохранены; новое создание требует отдельного платного подтверждения.",
            )}</p>
      )}
      {queued && !generating && (
        <div>
          <p role="status">{w("An image request is saved but has not been sent to the provider.", "Запрос изображения сохранён, но ещё не отправлен провайдеру.")}</p>
          <Button disabled={busy || !capability?.enabled} onClick={continueQueued}>
            {w(`Continue saved request · reserve up to $${((capability?.totalReservationUsdMicros ?? 0) / 1_000_000).toFixed(2)}`, `Продолжить сохранённый запрос · резерв до $${((capability?.totalReservationUsdMicros ?? 0) / 1_000_000).toFixed(2)}`)}
          </Button>
        </div>
      )}
      {draft && (
        <div className="space-y-2 rounded border border-[#765b36] p-3">
          <p>{w("Review generated draft", "Проверьте созданный черновик")}</p>
          {draft.value.review?.status === "review_warning" &&
            <p role="status">{w("The image check found a possible issue.", "Проверка обнаружила возможную проблему.")}</p>}
          {transport.draftImageUrl &&
            <Image unoptimized src={transport.draftImageUrl(snapshot.campaign.id, draft.record.id)}
              alt={w("Unaccepted image draft", "Непринятый черновик изображения")}
              width={1536} height={1024} className="h-auto w-full rounded object-contain" />}
          <div className="button-group">
            <Button primary disabled={busy} onClick={() => decide("media.accept")}>{w("Keep image", "Сохранить изображение")}</Button>
            <Button disabled={busy} onClick={() => decide("media.discard")}>{w("Discard", "Отклонить")}</Button>
          </div>
        </div>
      )}
      {expanded && completedAsset && (
        <div className="space-y-2 rounded border border-[#765b36] p-3">
          <Image unoptimized src={transport.imageUrl(snapshot.campaign.id, completedAsset.id)}
            alt={w("Generated image", "Созданное изображение")}
            width={1536} height={1024} className="h-auto w-full rounded object-contain" />
          <p className="muted">{w(
            "Illustration only. Its pixels do not establish Canon, mechanics, item properties or hidden facts. Approved textual guidance may be reused; reference pixels are not sent to the image model.",
            "Только иллюстрация. Пиксели не устанавливают канон, механику, свойства предметов или скрытые факты. Утверждённые текстовые указания можно повторно использовать; пиксели образца не передаются модели.",
          )}</p>
        </div>
      )}
      {compactDetails && (jobs.length > 0 || canApproveReference) && (
        <details className="rounded border border-[#765b36] p-3">
          <summary>{w("Visual details", "Детали изображения")}</summary>
          {canApproveReference && (
            <Button disabled={busy} onClick={useAsReference}>{w("Use as visual reference", "Использовать как визуальный образец")}</Button>
          )}
          {jobs.length > 0 && <ol className="mt-2 space-y-1">
            {[...jobs].reverse().map(({ record, value }, index) => (
              <li key={record.id}>
                {w(`Request ${jobs.length - index}`, `Запрос ${jobs.length - index}`)} · {imageJobStatus(value.status, w)}
              </li>
            ))}
          </ol>}
        </details>
      )}
      {!compactDetails && jobs.length > 0 && (
        <details className="rounded border border-[#765b36] p-3">
          <summary>{w("Saved image requests", "Сохранённые запросы изображений")}</summary>
          <ol className="mt-2 space-y-1">
            {[...jobs].reverse().map(({ record, value }, index) => (
              <li key={record.id}>
                {w(`Request ${jobs.length - index}`, `Запрос ${jobs.length - index}`)} · {imageJobStatus(value.status, w)}
              </li>
            ))}
          </ol>
        </details>
      )}
      {busy && <p role="status">{w("Working…", "Выполняется…")}</p>}
      {error && <p role="alert">{error}</p>}
      {!capability?.enabled && <p className="muted">{w("Image generation is not enabled locally.", "Создание изображений локально не включено.")}</p>}
    </section>
  );
}
