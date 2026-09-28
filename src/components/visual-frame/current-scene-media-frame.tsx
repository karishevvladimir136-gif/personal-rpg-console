"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useCampaignData } from "../persistence-context";
import { useLanguage } from "../language-context";
import { Button, Badge } from "../ui";
import type {
  Asset,
  DocumentRecord,
  Mutation,
} from "@/lib/persistence/contracts";
import { parseVisualMetadata } from "@/lib/visual-frame/model";
import {
  eligibleRealReferences,
  parseRealFrame,
  realFrameDocuments,
  realFrameDocumentMutation,
  safeFrameAsset,
} from "@/lib/visual-frame/real-frame";
import type { RealFrame } from "@/lib/visual-frame/real-frame";
import {
  createRealFrameAttempt,
  createFrameOwnerDecision,
  defaultMediaFrameTransport,
  finishRealFrameAttempt,
  storedFrameRecovery,
} from "@/lib/visual-frame/media-client";
import type {
  MediaCapability,
  MediaFrameTransport,
  RealFrameAttempt,
} from "@/lib/visual-frame/media-client";
import {
  ClientPersistenceError,
  createMutationAttempt,
} from "@/lib/persistence/client";
function useWords() {
  const { language } = useLanguage();
  return (en: string, ru: string) => (language === "ru" ? ru : en);
}
function statusLabel(
  status: RealFrame["status"],
  w: (en: string, ru: string) => string,
) {
  return {
    queued: w("Queued", "В очереди"),
    generating: w("Generating", "Создаётся"),
    draft: w("Draft generated", "Черновик создан"),
    discarded: w("Discarded", "Отклонено"),
    completed: w("Ready", "Готово"),
    failed: w("Failed", "Ошибка"),
    cancelled: w("Cancelled", "Отменено"),
    uncertain: w("Outcome unknown", "Результат неизвестен"),
  }[status];
}
export function FrameOwnerReview({
  record,
  transport = defaultMediaFrameTransport,
  onRegenerate,
  onPendingChange,
  disabled = false,
}: {
  record: DocumentRecord;
  transport?: MediaFrameTransport;
  onRegenerate?: (jobId: string) => void;
  onPendingChange?: (jobId: string, pending: boolean) => void;
  disabled?: boolean;
}) {
  const { data, refresh } = useCampaignData(),
    w = useWords();
  const pending = useRef<{
    decision: "accept" | "discard";
    input: Mutation;
  } | null>(null);
  const lock = useRef(false);
  const [retainedDecision, setRetainedDecision] = useState<
    "accept" | "discard" | null
  >(null);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const frame = parseRealFrame(record);
  const isDraft =
    frame?.schema === 4 && frame.status === "draft" && frame.review !== null;
  if (
    !data ||
    record.campaign_id !== data.campaign.id ||
    frame?.campaign_id !== data.campaign.id ||
    (!isDraft && !retainedDecision)
  )
    return null;
  const snapshot = data;
  async function decide(decision: "accept" | "discard") {
    if (lock.current || disabled) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      pending.current ??= {
        decision,
        input: createFrameOwnerDecision(snapshot, record, decision),
      };
      setRetainedDecision(pending.current.decision);
      onPendingChange?.(record.id, true);
      await transport.send({
        action:
          pending.current.decision === "accept"
            ? "media.accept"
            : "media.discard",
        input: structuredClone(pending.current.input),
      });
      await refresh();
      pending.current = null;
      setRetainedDecision(null);
      onPendingChange?.(record.id, false);
    } catch (error) {
      if (
        error instanceof ClientPersistenceError &&
        ["validation", "conflict", "not_found"].includes(error.code)
      ) {
        pending.current = null;
        setRetainedDecision(null);
        onPendingChange?.(record.id, false);
        setError(
          w(
            "This draft could not be used with the current scene. Refresh its history or choose Regenerate. Your previous accepted illustration is kept.",
            "Этот черновик не удалось использовать для текущей сцены. Обновите историю или выберите «Создать заново». Предыдущая принятая иллюстрация сохранена.",
          ),
        );
      } else
        setError(
          w(
            "Your decision could not be confirmed. Retry the same decision; no new image is generated.",
            "Ваше решение не подтверждено. Повторите то же решение: новое изображение не создаётся.",
          ),
        );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <div
      className="space-y-3 rounded border border-[#8c7148] bg-[#211f19] p-4"
      aria-label={w("FRAME draft review", "Проверка черновика FRAME")}
    >
      {isDraft && (
        <>
          <h3>{w("Draft generated", "Черновик создан")}</h3>
          <p className="muted">
            {w(
              "AI illustration — gameplay state remains authoritative",
              "Иллюстрация ИИ — состояние игры остаётся главным источником фактов",
            )}
          </p>
          {frame.review?.status === "review_warning" && (
            <p role="status">
              {w(
                "The image check flagged a possible issue. Review the illustration before accepting it.",
                "Проверка изображения отметила возможную проблему. Посмотрите иллюстрацию, прежде чем принять её.",
              )}
            </p>
          )}
          {!retainedDecision && transport.draftImageUrl ? (
            <Image
              unoptimized
              src={transport.draftImageUrl(snapshot.campaign.id, record.id)}
              alt={
                w(
                  "Unaccepted illustration draft: ",
                  "Непринятый черновик иллюстрации: ",
                ) + frame.basis.scene.title
              }
              width={1536}
              height={1024}
              className="h-auto w-full rounded border border-[#604b30] object-contain"
            />
          ) : !retainedDecision ? (
            <p role="status">
              {w(
                "Draft preview is unavailable.",
                "Просмотр черновика недоступен.",
              )}
            </p>
          ) : null}
          <p className="muted">
            {w(
              "Your previous accepted illustration stays in place until you choose Accept. Regenerate prepares a new paid request for your confirmation.",
              "Предыдущая принятая иллюстрация сохраняется до нажатия «Принять». Повторное создание подготовит новый платный запрос для подтверждения.",
            )}
          </p>
        </>
      )}
      <div className="button-group">
        {retainedDecision ? (
          <Button
            disabled={busy || disabled}
            onClick={() => void decide(retainedDecision)}
          >
            {w("Retry same decision", "Повторить то же решение")}
          </Button>
        ) : (
          <>
            <Button
              primary
              disabled={busy || disabled || !transport.draftImageUrl}
              onClick={() => void decide("accept")}
            >
              {w("Accept", "Принять")}
            </Button>
            {onRegenerate && (
              <Button
                disabled={busy || disabled}
                onClick={() => onRegenerate(record.id)}
              >
                {w("Regenerate", "Создать заново")}
              </Button>
            )}
            <Button
              disabled={busy || disabled}
              onClick={() => void decide("discard")}
            >
              {w("Discard", "Отклонить")}
            </Button>
          </>
        )}
      </div>
      {busy && (
        <p role="status">{w("Saving your decision…", "Сохранение решения…")}</p>
      )}
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
export function StoredFrameImage({
  asset,
  transport = defaultMediaFrameTransport,
}: {
  asset: Asset;
  transport?: MediaFrameTransport;
}) {
  const w = useWords();
  return (
    <figure className="space-y-2">
      <Image
        unoptimized
        src={transport.imageUrl(asset.campaign_id, asset.id)}
        alt={w("Illustration: ", "Иллюстрация: ") + asset.title}
        width={1536}
        height={1024}
        className="h-auto w-full rounded border border-[#604b30] object-contain"
      />
      <figcaption className="muted">
        {w(
          "AI illustration — gameplay state remains authoritative",
          "Иллюстрация ИИ — состояние игры остаётся главным источником фактов",
        )}
      </figcaption>
    </figure>
  );
}
export function CurrentSceneMediaFrame({
  transport = defaultMediaFrameTransport,
}: { transport?: MediaFrameTransport } = {}) {
  const { data } = useCampaignData();
  return data ? (
    <SceneMediaFrame key={data.campaign.id} transport={transport} />
  ) : null;
}
function SceneMediaFrame({ transport }: { transport: MediaFrameTransport }) {
  const { data, refresh } = useCampaignData(),
    w = useWords();
  const [capability, setCapability] = useState<MediaCapability | null>(null);
  const [references, setReferences] = useState<string[] | null>(null);
  const [proposal, setProposal] = useState<RealFrame | null>(null);
  const [ownerPending, setOwnerPending] = useState<string[]>([]);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [retry, setRetry] = useState(false);
  const pending = useRef<RealFrameAttempt | null>(null),
    lock = useRef(false);
  const campaignId = data?.campaign.id;
  useEffect(() => {
    let active = true;
    if (campaignId)
      void transport
        .capability(campaignId)
        .then((v) => {
          if (active) setCapability(v);
        })
        .catch(() => {
          if (active) setCapability(null);
        });
    return () => {
      active = false;
    };
  }, [campaignId, transport]); // No polling, background generation, or gameplay lock.
  if (!data) return null;
  const snapshot = data,
    eligible = eligibleRealReferences(snapshot),
    textReferences = eligible.filter((r) => r.reference.imageAssetId === null);
  const selected = references ?? textReferences.map((r) => r.record.id);
  const imageReferences = snapshot.documents.some((r) => {
    const ref = parseVisualMetadata(r);
    return (
      r.campaign_id === snapshot.campaign.id &&
      ref?.kind === "reference" &&
      ref.approval === "approved" &&
      ref.imageAssetId !== null
    );
  });
  const scene = snapshot.scenes.find(
    (s) =>
      s.id === snapshot.publicState.current_scene_id &&
      s.campaign_id === snapshot.campaign.id &&
      s.role === "narration",
  );
  const jobs = realFrameDocuments(snapshot).sort((a, b) =>
    a.record.updated_at.localeCompare(b.record.updated_at),
  );
  const currentJobs = jobs.filter(
    (r) => r.value.basis.scene.id === snapshot.publicState.current_scene_id,
  );
  const previous = currentJobs
    .filter((r) => r.value.status === "completed")
    .at(-1);
  const asset = snapshot.assets.find(
    (a) =>
      a.id === previous?.value.resultAssetId &&
      a.campaign_id === snapshot.campaign.id,
  );
  const latest = currentJobs.at(-1);
  const enabled = capability?.enabled && Boolean(scene && snapshot.timeline);
  const failure = () =>
    setError(
      w(
        "FRAME could not be confirmed. Your story and prior art remain available. Retry this exact request or review its saved history.",
        "FRAME не подтверждён. История и прежние иллюстрации доступны. Повторите этот же запрос или проверьте сохранённую историю.",
      ),
    );
  async function review(retryOf?: string) {
    if (lock.current || ownerPending.length || !snapshot.timeline) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      const frame = await transport.prepare({
        campaignId: snapshot.campaign.id,
        timeline: snapshot.timeline,
        expectedPublicStateRevision: snapshot.publicState.revision,
        referenceIds: selected,
        composition: "wide",
        retryOf:
          retryOf ??
          (latest &&
          [
            "draft",
            "discarded",
            "completed",
            "failed",
            "cancelled",
            "uncertain",
          ].includes(latest.value.status)
            ? latest.record.id
            : null),
      });
      setProposal(frame);
    } catch {
      failure();
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  async function generate() {
    if (
      lock.current ||
      ownerPending.length ||
      (!proposal && !pending.current) ||
      !capability?.reservationUsdMicros
    )
      return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      pending.current ??= createRealFrameAttempt(
        snapshot,
        proposal!,
        capability.reservationUsdMicros,
      );
      await finishRealFrameAttempt(pending.current, transport);
      await refresh();
      pending.current = null;
      setProposal(null);
      setRetry(false);
    } catch {
      setRetry(pending.current !== null);
      failure();
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  function ownerPendingChanged(jobId: string, retained: boolean) {
    setOwnerPending((previous) =>
      retained
        ? [...previous.filter((id) => id !== jobId), jobId]
        : previous.filter((id) => id !== jobId),
    );
  }
  return (
    <section className="current-scene-frame space-y-3" aria-label="FRAME">
      <div className="button-group">
        <Button
          disabled={
            busy ||
            !enabled ||
            Boolean(proposal) ||
            retry ||
            ownerPending.length > 0
          }
          onClick={() => void review()}
        >
          {busy
            ? w("Preparing FRAME…", "Подготовка FRAME…")
            : w("FRAME · review this scene", "FRAME · проверить эту сцену")}
        </Button>
      </div>
      <p className="muted">
        {w(
          "Optional illustration of this saved moment. Text gameplay can continue while an image is being made.",
          "Необязательная иллюстрация сохранённого момента. Текстовую игру можно продолжать, пока создаётся изображение.",
        )}
      </p>
      <p className="muted">
        {w(
          "AI illustration — gameplay state remains authoritative",
          "Иллюстрация ИИ — состояние игры остаётся главным источником фактов",
        )}
      </p>
      {!capability?.enabled && (
        <p role="status">
          {w(
            "Real images need an enabled model and spending limit. No image request has been sent.",
            "Для изображений нужны включённая модель и лимит расходов. Запрос на изображение не отправлен.",
          )}
        </p>
      )}
      {latest && (
        <p role="status">
          <Badge>{statusLabel(latest.value.status, w)}</Badge>{" "}
          {latest.value.basis.scene.title}
        </p>
      )}
      {latest &&
        ["grounding", "review"].includes(latest.value.failure ?? "") && (
          <p role="status">
            {w(
              "The image did not pass its review check. Your previous illustration is kept. Generate again only when you choose to.",
              "Изображение не прошло проверку. Предыдущая иллюстрация сохранена. Новую создавайте только по своему решению.",
            )}
          </p>
        )}
      <details>
        <summary>{w("Appearance references", "Образцы внешности")}</summary>
        <p className="muted">
          {w(
            "Current approved text guidance is included below. It controls consistency; it does not add characters or change the story.",
            "Ниже используются актуальные утверждённые текстовые образцы. Они сохраняют облик, не добавляют персонажей и не меняют историю.",
          )}
        </p>
        {textReferences.map(({ record, reference }) => (
          <label key={record.id} className="flex items-center gap-2 py-1">
            <input
              type="checkbox"
              disabled={busy || proposal !== null || retry}
              checked={selected.includes(record.id)}
              onChange={() =>
                setReferences(
                  selected.includes(record.id)
                    ? selected.filter((id) => id !== record.id)
                    : [...selected, record.id],
                )
              }
            />
            {reference.label}
          </label>
        ))}
        {!textReferences.length && (
          <p>
            {w(
              "No approved text references for this scene yet.",
              "Для этой сцены пока нет утверждённых текстовых образцов.",
            )}
          </p>
        )}
        {imageReferences && (
          <p role="status">
            {w(
              "Image references await a verified spending bound. Their pixels are not sent. A selected image reference is never silently replaced by text.",
              "Образцы изображений ждут проверенного предела расходов. Их пиксели не отправляются. Выбранный образец изображения не заменяется текстом молча.",
            )}
          </p>
        )}
      </details>
      {proposal && (
        <div className="space-y-3 rounded border border-[#604b30] p-4">
          <h3>
            {w("Review this visible moment", "Проверьте этот видимый момент")}
          </h3>
          <p>{proposal.basis.scene.title}</p>
          <p className="whitespace-pre-wrap">{proposal.basis.scene.body}</p>
          <details>
            <summary>
              {w("Reviewed visual guidance", "Проверенные указания по облику")}
            </summary>
            <p className="whitespace-pre-wrap break-words">{proposal.prompt}</p>
          </details>
          <p className="muted">
            {w(
              "Reserve up to $0.60 for one illustration draft and its image check. Acceptance is your separate choice; observed charges are recorded separately.",
              "До $0.60 резервируется на черновик иллюстрации и проверку изображения. Принять его вы решаете отдельно; фактические расходы учитываются отдельно.",
            )}
          </p>
          <div className="button-group">
            <Button
              primary
              disabled={busy || retry}
              onClick={() => void generate()}
            >
              {w("Generate FRAME", "Создать FRAME")}
            </Button>
            <Button disabled={busy || retry} onClick={() => setProposal(null)}>
              {w("Change guidance", "Изменить указания")}
            </Button>
          </div>
        </div>
      )}
      {retry && (
        <Button disabled={busy} onClick={() => void generate()}>
          {w("Retry exact request", "Повторить тот же запрос")}
        </Button>
      )}
      {busy && (
        <p role="status">
          {w(
            "FRAME is working. You can keep playing.",
            "FRAME работает. Игру можно продолжать.",
          )}
        </p>
      )}
      {error && <p role="alert">{error}</p>}
      {latest && (
        <FrameOwnerReview
          key={latest.record.id}
          record={latest.record}
          transport={transport}
          disabled={busy || Boolean(proposal) || retry}
          onRegenerate={
            enabled && !ownerPending.length
              ? (jobId) => void review(jobId)
              : undefined
          }
          onPendingChange={ownerPendingChanged}
        />
      )}
      {asset && safeFrameAsset(snapshot, asset) && (
        <div className="current-scene-frame-result space-y-2">
          <Badge>
            {previous?.value.basis.scene.revision === scene?.revision
              ? w("Scene illustration", "Иллюстрация сцены")
              : w("Earlier scene illustration", "Прежняя иллюстрация сцены")}
          </Badge>
          <StoredFrameImage asset={asset} transport={transport} />
        </div>
      )}
      <RealFrameHistory
        transport={transport}
        onRegenerate={
          enabled && !ownerPending.length
            ? (jobId) => void review(jobId)
            : undefined
        }
        onPendingChange={ownerPendingChanged}
        generationDisabled={ownerPending.length > 0}
        disabled={busy || Boolean(proposal) || retry}
      />
    </section>
  );
}
export function RealFrameHistory({
  transport = defaultMediaFrameTransport,
  onUseAsset,
  onRegenerate,
  onPendingChange,
  disabled = false,
  generationDisabled = false,
}: {
  transport?: MediaFrameTransport;
  onUseAsset?: (asset: Asset) => void;
  onRegenerate?: (jobId: string) => void;
  onPendingChange?: (jobId: string, pending: boolean) => void;
  disabled?: boolean;
  generationDisabled?: boolean;
} = {}) {
  const { data, refresh } = useCampaignData(),
    w = useWords(),
    attempts = useRef(new Map<string, Mutation>()),
    lock = useRef(false);
  const [retainedRequests, setRetainedRequests] = useState<
    Record<string, "dispatch" | "recover" | "cancel">
  >({});
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  if (!data) return null;
  const snapshot = data,
    jobs = realFrameDocuments(snapshot).sort((a, b) =>
      b.record.updated_at.localeCompare(a.record.updated_at),
    );
  async function action(
    record: DocumentRecord,
    kind: "recover" | "cancel" | "dispatch",
  ) {
    if (lock.current) return;
    if (kind === "dispatch" && generationDisabled) return;
    lock.current = true;
    setBusy(true);
    setError("");
    const key = record.id + ":" + kind;
    try {
      let input = attempts.current.get(key);
      if (!input) {
        const frame = parseRealFrame(record)!;
        if (kind === "dispatch") {
          const capability = await transport.capability(snapshot.campaign.id);
          if (
            !capability.enabled ||
            capability.model !== frame.model ||
            JSON.stringify(capability.parameters) !==
              JSON.stringify(frame.parameters) ||
            capability.reservationUsdMicros !== 400000 ||
            frame.status !== "queued"
          )
            throw new Error("not_configured");
          const requestId = crypto.randomUUID();
          input = {
            ...realFrameDocumentMutation(
              snapshot,
              {
                ...frame,
                status: "generating",
                dispatch: {
                  requestId,
                  reservationUsdMicros: capability.reservationUsdMicros,
                },
              },
              record,
            ),
            requestId,
          };
        } else
          input =
            kind === "recover"
              ? storedFrameRecovery(snapshot, record)
              : createMutationAttempt(
                  null,
                  realFrameDocumentMutation(
                    snapshot,
                    { ...frame, status: "cancelled", failure: null },
                    record,
                  ),
                );
        attempts.current.set(key, input);
        setRetainedRequests((previous) => ({ ...previous, [record.id]: kind }));
      }
      await transport.send({
        action:
          kind === "recover"
            ? "media.recover"
            : kind === "dispatch"
              ? "media.dispatch"
              : "media.save",
        input,
      });
      await refresh();
      attempts.current.delete(key);
      setRetainedRequests((previous) => {
        const next = { ...previous };
        delete next[record.id];
        return next;
      });
    } catch {
      setError(
        kind === "dispatch"
          ? w(
              "The outcome could not be confirmed. Retry this exact request; it will not dispatch a paid image twice.",
              "Результат не подтверждён. Повторите этот же запрос: платное изображение не будет отправлено дважды.",
            )
          : w(
              "This request could not be confirmed. No new image is generated by recovery; keep the saved request and retry explicitly. A previously unstarted scene check may use its reserved allowance.",
              "Запрос не подтверждён. Восстановление не создаёт нового изображения; сохраните запрос и повторите его явно. Ещё не начатая проверка сцены может использовать выделенный резерв.",
            ),
      );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <details className="rounded border border-[#604b30] p-4">
      <summary>
        {w("FRAME history and recovery", "История FRAME и восстановление")}
      </summary>
      <p className="muted">
        {w(
          "Requests and prior results are retained. Recovery checks stored pixels and exact receipts; it never generates another paid image or repeats a claimed scene check. If no scene check was previously dispatched, recovery may use its already reserved allowance. Cancelling an in-flight image prevents attachment and may still incur its reserved charge.",
          "Запросы и прежние результаты сохраняются. Восстановление проверяет сохранённые пиксели и подтверждения; нового платного изображения и повтора начатой проверки не создаёт. Если проверка сцены ещё не отправлялась, восстановление может использовать её заранее выделенный резерв. Отмена начатого изображения запрещает прикрепление, но расходы из резерва возможны.",
        )}
      </p>
      {error && <p role="alert">{error}</p>}
      {!jobs.length && (
        <p>
          {w(
            "No real FRAME requests yet.",
            "Запросов на изображения FRAME пока нет.",
          )}
        </p>
      )}
      {jobs.map(({ record, value }) => {
        const asset = snapshot.assets.find(
          (a) =>
            a.id === value.resultAssetId &&
            a.campaign_id === snapshot.campaign.id,
        );
        const retained = retainedRequests[record.id];
        return (
          <article
            key={record.id}
            className="space-y-2 border-t border-[#604b30] py-4"
          >
            <h3>{value.basis.scene.title}</h3>
            <Badge>{statusLabel(value.status, w)}</Badge>
            {["grounding", "review"].includes(value.failure ?? "") && (
              <p>
                {w(
                  "Image review failed. The previous usable image is kept; no automatic generation will follow.",
                  "Проверка изображения не пройдена. Предыдущее подходящее изображение сохранено; автоматического повторного создания не будет.",
                )}
              </p>
            )}
            {value.status === "uncertain" && (
              <p>
                {w(
                  "The provider outcome is unknown. This request will not be sent again automatically.",
                  "Результат провайдера неизвестен. Этот запрос не будет отправлен снова автоматически.",
                )}
              </p>
            )}
            {asset && safeFrameAsset(snapshot, asset) && (
              <StoredFrameImage asset={asset} transport={transport} />
            )}
            <FrameOwnerReview
              record={record}
              transport={transport}
              onRegenerate={onRegenerate}
              onPendingChange={onPendingChange}
              disabled={busy || disabled}
            />
            {value.status === "queued" && (
              <p className="muted">
                {w(
                  "Generate this saved request explicitly, reserving up to $0.60 including its scene check. Its original scene and references must still be current.",
                  "Создайте изображение по сохранённому запросу явно, резервируя до $0.60 с проверкой сцены. Исходная сцена и образцы должны оставаться актуальными.",
                )}
              </p>
            )}
            <div className="button-group">
              {retained && (
                <Button
                  disabled={busy}
                  onClick={() => void action(record, retained)}
                >
                  {w(
                    "Retry exact FRAME request",
                    "Повторить тот же запрос FRAME",
                  )}
                </Button>
              )}
              {value.status === "queued" && !retained && (
                <Button
                  disabled={busy || generationDisabled}
                  onClick={() => void action(record, "dispatch")}
                >
                  {w("Generate queued FRAME", "Создать FRAME из очереди")}
                </Button>
              )}
              {["queued", "generating", "uncertain"].includes(value.status) && (
                <Button
                  disabled={busy}
                  onClick={() => void action(record, "cancel")}
                >
                  {w("Cancel FRAME", "Отменить FRAME")}
                </Button>
              )}
              {value.status === "generating" && !retained && (
                <Button
                  disabled={busy}
                  onClick={() => void action(record, "recover")}
                >
                  {w(
                    "Recover stored result",
                    "Восстановить сохранённый результат",
                  )}
                </Button>
              )}
              {asset && onUseAsset && (
                <Button disabled={busy} onClick={() => onUseAsset(asset)}>
                  {w(
                    "Use as a visual reference draft",
                    "Использовать как черновик образца",
                  )}
                </Button>
              )}
            </div>
            <details>
              <summary>{w("Request details", "Подробности запроса")}</summary>
              <p>
                {value.provider} · {value.model}
              </p>
              <p>
                {w(
                  "Canon visual approval remains a separate explicit action.",
                  "Утверждение канонического образца остаётся отдельным явным действием.",
                )}
              </p>
              <p className="whitespace-pre-wrap break-words">{value.prompt}</p>
            </details>
          </article>
        );
      })}
    </details>
  );
}
