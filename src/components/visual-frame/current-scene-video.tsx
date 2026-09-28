"use client";
import { useEffect, useRef, useState } from "react";
import { useCampaignData } from "../persistence-context";
import { useLanguage } from "../language-context";
import { Badge, Button } from "../ui";
import { ClientPersistenceError } from "@/lib/persistence/client";
import type {
  Asset,
  DocumentRecord,
  Mutation,
} from "@/lib/persistence/contracts";
import {
  parseSceneVideo,
  safeVideoAsset,
  videoDocuments,
} from "@/lib/scene-video/model";
import type { SceneVideo } from "@/lib/scene-video/model";
import {
  createSceneVideoAttempt,
  createStoredVideoDispatch,
  defaultVideoTransport,
  eligibleVideoSources,
  finishSceneVideoAttempt,
} from "@/lib/scene-video/client";
import type {
  SceneVideoAttempt,
  VideoCapability,
  VideoTransport,
} from "@/lib/scene-video/client";

function useWords() {
  const { language } = useLanguage();
  return (en: string, ru: string) => (language === "ru" ? ru : en);
}
function statusLabel(
  status: SceneVideo["status"],
  w: (en: string, ru: string) => string,
) {
  return {
    queued: w("Queued", "В очереди"),
    generating: w("Generating", "Создаётся"),
    ready: w("Ready", "Готово"),
    failed: w("Failed", "Ошибка"),
    cancelled: w("Cancelled", "Отменено"),
    uncertain: w("Outcome unknown", "Результат неизвестен"),
  }[status];
}
const allowance = (micros: number) => "$" + (micros / 1_000_000).toFixed(2);
export function StoredSceneVideo({
  asset,
  transport = defaultVideoTransport,
}: {
  asset: Asset;
  transport?: VideoTransport;
}) {
  const { data } = useCampaignData(),
    w = useWords();
  if (!data || !safeVideoAsset(data, asset)) return null;
  const url = transport.videoUrl(asset.campaign_id, asset.id);
  return (
    <figure className="space-y-2">
      {url ? (
        <video
          controls
          preload="none"
          src={url}
          aria-label={asset.title}
          className="h-auto w-full rounded border border-[#604b30]"
        />
      ) : (
        <p
          role="status"
          className="rounded border border-[#604b30] bg-[#211f19] p-4"
        >
          {w(
            "Synthetic lifecycle result — no video was generated and no playable clip is provided.",
            "Синтетический результат — видео не создавалось, воспроизводимого ролика нет.",
          )}
        </p>
      )}
      <figcaption className="muted">
        {w(
          "AI video — gameplay state remains authoritative",
          "Видео ИИ — состояние игры остаётся главным источником фактов",
        )}
      </figcaption>
    </figure>
  );
}
export function CurrentSceneVideo({
  transport = defaultVideoTransport,
}: { transport?: VideoTransport } = {}) {
  const { data } = useCampaignData();
  return data ? (
    <SceneVideoControls key={data.campaign.id} transport={transport} />
  ) : null;
}
function SceneVideoControls({ transport }: { transport: VideoTransport }) {
  const { data, refresh } = useCampaignData(),
    w = useWords();
  const [capability, setCapability] = useState<VideoCapability | null>(null);
  const [proposal, setProposal] = useState<SceneVideo | null>(null);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [retry, setRetry] = useState(false);
  const pending = useRef<SceneVideoAttempt | null>(null),
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
  }, [campaignId, transport]);
  if (!data) return null;
  const snapshot = data,
    source = eligibleVideoSources(snapshot).at(-1);
  const jobs = videoDocuments(snapshot)
    .filter(
      (j) => j.value.basis.scene.id === snapshot.publicState.current_scene_id,
    )
    .sort((a, b) => a.record.updated_at.localeCompare(b.record.updated_at));
  const latest = jobs.at(-1);
  const prior = jobs
    .filter(
      (j) =>
        j.value.status === "ready" &&
        snapshot.assets.some(
          (a) => a.id === j.value.resultAssetId && safeVideoAsset(snapshot, a),
        ),
    )
    .at(-1);
  const priorAsset = snapshot.assets.find(
    (a) => a.id === prior?.value.resultAssetId,
  );
  const inFlight =
    latest && ["queued", "generating"].includes(latest.value.status);
  async function prepare() {
    if (
      lock.current ||
      !source ||
      !snapshot.timeline ||
      !capability?.enabled ||
      inFlight
    )
      return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      const value = await transport.prepare({
        campaignId: snapshot.campaign.id,
        timeline: snapshot.timeline,
        expectedPublicStateRevision: snapshot.publicState.revision,
        sourceAssetId: source.id,
        retryOf:
          latest &&
          ["ready", "failed", "cancelled", "uncertain"].includes(
            latest.value.status,
          )
            ? latest.record.id
            : null,
      });
      if (
        value.model !== capability.model ||
        JSON.stringify(value.parameters) !==
          JSON.stringify(capability.parameters)
      )
        throw new Error("conflict");
      setProposal(value);
    } catch {
      setError(
        w(
          "This video request could not be prepared. Review the current scene and its accepted FRAME.",
          "Не удалось подготовить видео. Проверьте текущую сцену и её принятый FRAME.",
        ),
      );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  async function generate() {
    if (lock.current || (!proposal && !pending.current)) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      if (!pending.current) {
        if (!capability?.enabled || !capability.reservationUsdMicros)
          throw new Error("not_configured");
        pending.current = createSceneVideoAttempt(
          snapshot,
          proposal!,
          capability.reservationUsdMicros,
        );
      }
      await finishSceneVideoAttempt(pending.current, transport);
      await refresh();
      pending.current = null;
      setProposal(null);
      setRetry(false);
    } catch (error) {
      if (
        error instanceof ClientPersistenceError &&
        ["validation", "conflict", "not_found"].includes(error.code)
      ) {
        pending.current = null;
        setProposal(null);
        setRetry(false);
        setError(
          w(
            "This saved request is no longer current. Prepare a fresh request when you choose. Your prior video is kept.",
            "Сохранённый запрос устарел. Подготовьте новый по своему решению. Прежнее видео сохранено.",
          ),
        );
      } else {
        setRetry(pending.current !== null);
        setError(
          w(
            "The video outcome could not be confirmed. Retry the exact request or check its saved status. Your story and prior clip remain available.",
            "Результат видео не подтверждён. Повторите тот же запрос или проверьте сохранённый статус. История и прежний ролик доступны.",
          ),
        );
      }
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <section className="current-scene-video space-y-3" aria-label="VIDEO">
      <div className="button-group">
        <Button
          disabled={
            busy ||
            !capability?.enabled ||
            !source ||
            Boolean(inFlight) ||
            Boolean(proposal) ||
            retry
          }
          onClick={() => void prepare()}
        >
          {busy
            ? w("Preparing video…", "Подготовка видео…")
            : latest
              ? w("Regenerate video", "Создать видео заново")
              : w("Generate video", "Создать видео")}
        </Button>
      </div>
      <p className="muted">
        {w(
          "Optional animation of an accepted scene illustration. You can keep playing while it is queued or generating.",
          "Необязательная анимация принятой иллюстрации сцены. Игру можно продолжать, пока видео ожидает или создаётся.",
        )}
      </p>
      <p className="muted">
        {w(
          "AI video — gameplay state remains authoritative",
          "Видео ИИ — состояние игры остаётся главным источником фактов",
        )}
      </p>
      {!source && (
        <p role="status">
          {w(
            "Accept a FRAME for this current scene before generating video.",
            "Примите FRAME текущей сцены, прежде чем создавать видео.",
          )}
        </p>
      )}
      {!capability?.enabled && (
        <p role="status">
          {w(
            "Video generation is unavailable. An enabled server model and spending limit are required.",
            "Создание видео недоступно. Нужны включённая серверная модель и лимит расходов.",
          )}
        </p>
      )}
      {latest && (
        <p role="status">
          <Badge>{statusLabel(latest.value.status, w)}</Badge>{" "}
          {latest.value.basis.scene.title}
        </p>
      )}
      {proposal && (
        <div className="space-y-3 rounded border border-[#604b30] bg-[#211f19] p-4">
          <h3>{w("Review this video request", "Проверьте запрос видео")}</h3>
          <p>{proposal.basis.scene.title}</p>
          <p>
            {w("Source: your accepted FRAME", "Источник: принятый вами FRAME")}{" "}
            ·{" "}
            {
              snapshot.assets.find(
                (a) =>
                  a.id === proposal.source.assetId &&
                  a.campaign_id === snapshot.campaign.id,
              )?.title
            }
          </p>
          <p>
            {proposal.parameters.duration} {w("seconds", "секунд")} ·{" "}
            {proposal.parameters.resolution} · {w("sound on", "со звуком")}
          </p>
          <details>
            <summary>{w("Animation guidance", "Указания по анимации")}</summary>
            <p className="whitespace-pre-wrap break-words">{proposal.prompt}</p>
          </details>
          <p className="muted">
            {w(
              "Conservative reservation for one explicit video request:",
              "Осторожный резерв на один явный запрос видео:",
            )}{" "}
            {allowance(capability?.reservationUsdMicros ?? 0)}.{" "}
            {w(
              "Observed charges are recorded separately.",
              "Фактические расходы учитываются отдельно.",
            )}
          </p>
          <div className="button-group">
            <Button
              primary
              disabled={busy || retry}
              onClick={() => void generate()}
            >
              {w("Generate video · reserve ", "Создать видео · резерв ") +
                allowance(capability?.reservationUsdMicros ?? 0)}
            </Button>
            <Button disabled={busy || retry} onClick={() => setProposal(null)}>
              {w("Cancel preparation", "Отменить подготовку")}
            </Button>
          </div>
        </div>
      )}
      {retry && (
        <Button disabled={busy} onClick={() => void generate()}>
          {w("Retry exact video request", "Повторить тот же запрос видео")}
        </Button>
      )}
      {busy && (
        <p role="status">
          {w(
            "VIDEO is working. You can keep playing.",
            "VIDEO работает. Игру можно продолжать.",
          )}
        </p>
      )}
      {error && <p role="alert">{error}</p>}
      {priorAsset && (
        <StoredSceneVideo asset={priorAsset} transport={transport} />
      )}
      <SceneVideoHistory transport={transport} />
    </section>
  );
}
export function SceneVideoHistory({
  transport = defaultVideoTransport,
}: { transport?: VideoTransport } = {}) {
  const { data, refresh } = useCampaignData(),
    w = useWords();
  const pending = useRef(new Map<string, Mutation>()),
    lock = useRef(false);
  const [retained, setRetained] = useState<string[]>([]),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const [capability, setCapability] = useState<VideoCapability | null>(null);
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
  }, [campaignId, transport]);
  if (!data) return null;
  const snapshot = data,
    jobs = videoDocuments(snapshot).sort((a, b) =>
      b.record.updated_at.localeCompare(a.record.updated_at),
    );
  async function act(record: DocumentRecord, kind: "dispatch" | "poll") {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      if (kind === "poll")
        await transport.send({
          action: "video.poll",
          campaignId: snapshot.campaign.id,
          jobId: record.id,
        });
      else {
        let input = pending.current.get(record.id);
        if (!input) {
          const current = parseSceneVideo(record);
          const configured = await transport.capability(snapshot.campaign.id);
          if (
            !current ||
            !configured.enabled ||
            configured.model !== current.model ||
            JSON.stringify(configured.parameters) !==
              JSON.stringify(current.parameters) ||
            !configured.reservationUsdMicros
          )
            throw new Error("not_configured");
          input = createStoredVideoDispatch(
            snapshot,
            record,
            configured.reservationUsdMicros,
          );
          pending.current.set(record.id, input);
          setRetained((old) => [...new Set([...old, record.id])]);
        }
        await transport.send({
          action: "video.dispatch",
          input: structuredClone(input),
        });
      }
      await refresh();
      pending.current.delete(record.id);
      setRetained((old) => old.filter((id) => id !== record.id));
    } catch {
      setError(
        w(
          "This video request could not be confirmed. Status checks never generate another clip; retry a retained dispatch only with its exact original request.",
          "Запрос видео не подтверждён. Проверка статуса не создаёт новый ролик; сохранённую отправку повторяйте только с исходным запросом.",
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
        {w("Video history and status", "История и статус видео")}
      </summary>
      {error && <p role="alert">{error}</p>}
      {!jobs.length && (
        <p>{w("No video requests yet.", "Запросов видео пока нет.")}</p>
      )}
      {jobs.map(({ record, value }) => {
        const asset = snapshot.assets.find(
          (a) => a.id === value.resultAssetId && safeVideoAsset(snapshot, a),
        );
        return (
          <article
            key={record.id}
            className="space-y-2 border-t border-[#604b30] py-4"
          >
            <h3>{value.basis.scene.title}</h3>
            <Badge>{statusLabel(value.status, w)}</Badge>
            {value.status === "failed" && (
              <p>
                {w(
                  "The video could not be made. Your previous usable clip is kept.",
                  "Не удалось создать видео. Прежний подходящий ролик сохранён.",
                )}
              </p>
            )}
            {value.status === "uncertain" && (
              <p>
                {w(
                  "The submission outcome is unknown. No automatic retry will follow.",
                  "Результат отправки неизвестен. Автоматического повтора не будет.",
                )}
              </p>
            )}
            {asset && <StoredSceneVideo asset={asset} transport={transport} />}
            <div className="button-group">
              {retained.includes(record.id) && (
                <Button
                  disabled={busy}
                  onClick={() => void act(record, "dispatch")}
                >
                  {w(
                    "Retry exact saved video request",
                    "Повторить тот же сохранённый запрос видео",
                  )}
                </Button>
              )}
              {value.status === "queued" && !retained.includes(record.id) && (
                <Button
                  disabled={busy || !capability?.enabled}
                  onClick={() => void act(record, "dispatch")}
                >
                  {w(
                    "Generate queued video · reserve ",
                    "Создать видео из очереди · резерв ",
                  ) + allowance(capability?.reservationUsdMicros ?? 0)}
                </Button>
              )}
              {["generating", "uncertain"].includes(value.status) && (
                <Button
                  disabled={busy}
                  onClick={() => void act(record, "poll")}
                >
                  {w("Check status", "Проверить статус")}
                </Button>
              )}
            </div>
          </article>
        );
      })}
    </details>
  );
}
