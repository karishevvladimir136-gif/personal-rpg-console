"use client";
import { useRef, useState } from "react";
import { useLanguage } from "../language-context";
import { useCampaignData } from "../persistence-context";
import { Button, Badge } from "../ui";
import { loadCampaign, readJson } from "@/lib/persistence/client";
import type { MutationResult } from "@/lib/persistence/contracts";
import {
  prepareCurrentSceneFrame,
  finishCurrentSceneFrame,
} from "@/lib/visual-frame/current-scene";
import type {
  CurrentSceneFrameAttempt,
  CurrentSceneFrameTransport,
} from "@/lib/visual-frame/current-scene";
import {
  buildFrame,
  frameIsCurrent,
  mockArtForAsset,
  visualDocuments,
} from "@/lib/visual-frame/model";
import { MockVisualArt } from "./mock-art";

const defaultTransport: CurrentSceneFrameTransport = {
  load: loadCampaign,
  save: (input) =>
    readJson<MutationResult>("/api/visual-frame", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }),
};
export function CurrentSceneFrame({
  transport = defaultTransport,
}: {
  transport?: CurrentSceneFrameTransport;
}) {
  const { data, refresh } = useCampaignData();
  const { language } = useLanguage();
  const w = (en: string, ru: string) => (language === "ru" ? ru : en);
  const pending = useRef<CurrentSceneFrameAttempt | null>(null);
  const locked = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [needsRetry, setNeedsRetry] = useState(false);
  if (!data) return null;
  const snapshot = data;
  let available = false;
  try {
    if (snapshot.publicState.current_scene_id) {
      buildFrame(snapshot, snapshot.publicState.current_scene_id, [], "wide");
      available = true;
    }
  } catch {
    /* A missing, private or oversized current scene stays unsupported. */
  }
  const completed = visualDocuments(snapshot)
    .filter(
      ({ value }) =>
        value.kind === "frame" &&
        value.status === "completed" &&
        value.basis.scene.id === snapshot.publicState.current_scene_id &&
        frameIsCurrent(snapshot, value),
    )
    .at(-1);
  const assetId =
    completed?.value.kind === "frame" ? completed.value.resultAssetId : null;
  const asset = snapshot.assets.find(
    (a) => a.id === assetId && a.campaign_id === snapshot.campaign.id,
  );
  const art = asset && mockArtForAsset(asset);
  const run = async () => {
    if (locked.current) return;
    locked.current = true;
    setBusy(true);
    setError("");
    try {
      pending.current ??= prepareCurrentSceneFrame(snapshot);
      await finishCurrentSceneFrame(pending.current, transport);
      await refresh();
      pending.current = null;
      setNeedsRetry(false);
    } catch {
      setNeedsRetry(pending.current !== null);
      setError(
        w(
          "FRAME could not finish. Your story is unchanged. Retry this request; if the scene changed, review the saved request in Visual Bible.",
          "FRAME не завершён. История не изменилась. Повторите этот запрос; если сцена изменилась, проверьте сохранённый запрос в Образах мира.",
        ),
      );
    } finally {
      locked.current = false;
      setBusy(false);
    }
  };
  return (
    <section className="current-scene-frame" aria-label="FRAME">
      <div className="button-group">
        <Button
          disabled={busy || (!available && !needsRetry)}
          onClick={() => void run()}
        >
          {busy
            ? w("Preparing FRAME…", "Подготовка FRAME…")
            : needsRetry
              ? w("Retry FRAME", "Повторить FRAME")
              : "FRAME · MOCK"}
        </Button>
        <Button disabled>{w("VIDEO", "ВИДЕО")}</Button>
      </div>
      <p className="muted">
        {w(
          "Capture the current scene as a local MOCK sketch. No image provider is connected.",
          "Локальный эскиз MOCK для текущей сцены. Провайдер изображений не подключён.",
        )}
      </p>
      {!available && !needsRetry && (
        <p role="status">
          {w(
            "A saved public narration is needed for FRAME.",
            "Для FRAME нужна сохранённая открытая сцена повествования.",
          )}
        </p>
      )}
      {busy && (
        <p role="status">
          {w(
            "Creating a MOCK preview for this moment…",
            "Создаём превью MOCK для этого момента…",
          )}
        </p>
      )}
      {error && <p role="alert">{error}</p>}
      {art && (
        <div className="current-scene-frame-result">
          <Badge>
            {w("MOCK result · schematic only", "Результат MOCK · только схема")}
          </Badge>
          <MockVisualArt
            art={art}
            label={w(
              "MOCK sketch of the current scene",
              "Эскиз MOCK текущей сцены",
            )}
          />
        </div>
      )}
    </section>
  );
}
