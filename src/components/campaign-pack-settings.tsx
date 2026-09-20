"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "./language-context";
import { useCampaignData, useUnsavedChanges } from "./persistence-context";
import { Panel, Button } from "./ui";
import {
  readJson,
  errorMessage,
  ClientPersistenceError,
} from "@/lib/persistence/client";
import { sameTimeline } from "@/lib/saves/fence";
import type {
  CampaignPackSettings,
  BindCampaignPackInput,
} from "@/lib/production/pack-configuration-contracts";

export function CampaignPackSettingsPanel() {
  const { campaignId, data, refresh } = useCampaignData();
  const { language, t } = useLanguage();
  const ru = language === "ru";
  const [current, setCurrent] = useState<CampaignPackSettings | null>(null);
  const [version, setVersion] = useState("");
  const [entry, setEntry] = useState("");
  const [minute, setMinute] = useState(0);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [uncertain, setUncertain] = useState(false);
  const [review, setReview] = useState(false);
  const attempt = useRef<BindCampaignPackInput | null>(null);
  const working = useRef(false);
  const url = `/api/campaigns/${encodeURIComponent(campaignId)}/packs`;
  const scope = `${data?.timeline?.timelineId}:${data?.timeline?.epoch}`;
  useUnsavedChanges(Boolean(version) || uncertain);
  useEffect(() => {
    const controller = new AbortController();
    readJson<CampaignPackSettings>(url, { signal: controller.signal })
      .then((value) => {
        if (!controller.signal.aborted) setCurrent(value);
      })
      .catch((cause) => {
        if (!controller.signal.aborted) setError(errorMessage(cause));
      });
    return () => controller.abort();
  }, [url, scope]);
  const matches =
    current?.campaignId === campaignId &&
    sameTimeline(current?.timeline, data?.timeline);
  async function reload() {
    try {
      const value = await readJson<CampaignPackSettings>(url);
      setCurrent(value);
      setReview(false);
      setError("");
      if (!uncertain) {
        setVersion("");
        setEntry("");
        attempt.current = null;
      }
    } catch (cause) {
      setError(errorMessage(cause));
    }
  }
  async function bind() {
    if (working.current || !current || !matches || review) return;
    working.current = true;
    setBusy(true);
    setError("");
    setNotice("");
    attempt.current ??= {
      operationId: crypto.randomUUID(),
      campaignId,
      timeline: current.timeline,
      expectedRevision: current.expectedRevision,
      expectedRuntimeRevision: current.expectedRuntimeRevision,
      expectedHeadId: current.expectedHeadId,
      packVersionId: version,
      entry: { label: entry.trim(), worldMinutes: minute },
    };
    try {
      const saved = await readJson<CampaignPackSettings>(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(attempt.current),
      });
      setCurrent(saved);
      attempt.current = null;
      setUncertain(false);
      setVersion("");
      setEntry("");
      setNotice(
        ru
          ? "Версия закреплена. История источников не меняет этот выбор."
          : "Version pinned. Source history will not change this selection.",
      );
      await refresh();
    } catch (cause) {
      const known =
        cause instanceof ClientPersistenceError && cause.code !== "unavailable";
      setUncertain(!known);
      if (known) {
        attempt.current = null;
        setReview(cause.code === "conflict");
      }
      setError(errorMessage(cause));
    } finally {
      working.current = false;
      setBusy(false);
    }
  }
  return (
    <Panel title={ru ? "Пакеты мира" : "World Packs"}>
      <p>
        {ru
          ? "Выберите одобренную неизменяемую версию. Новые источники и правки не меняют закреплённые версии автоматически. Сначала завершите или отмените текущий ход."
          : "Choose an approved immutable version. New sources and corrections never update campaign pins automatically. Finish or cancel the current turn first."}
      </p>
      <Link className="text-link" href="/world-library">
        {ru ? "Открыть библиотеку миров" : "Open World Library"}
      </Link>
      {error && <p role="alert">{t(error)}</p>}
      {notice && <p role="status">{notice}</p>}
      {!matches ? (
        <p role="status">
          {ru
            ? "Загрузка версий этой линии времени…"
            : "Loading this timeline’s pins…"}
        </p>
      ) : (
        <>
          {current.pins.length === 0 && (
            <p>{ru ? "Пакеты ещё не закреплены." : "No Pack is pinned yet."}</p>
          )}
          {current.pins.map((pin) => (
            <details key={pin.bindingId}>
              <summary>
                {pin.title} · {t("Version")} {pin.version}
              </summary>
              <p style={{ overflowWrap: "anywhere" }}>{pin.packVersionId}</p>
              <p>
                {pin.entry.label} · {pin.entry.worldMinutes}{" "}
                {ru ? "мин." : "min"}
              </p>
              <ol>
                {pin.sources.map((source) => (
                  <li
                    key={source.versionId}
                    style={{ overflowWrap: "anywhere" }}
                  >
                    {source.title} · {t("Version")} {source.version}
                    <br />
                    {source.versionId}
                    <br />
                    {"SHA-256"}: {source.digest}
                  </li>
                ))}
              </ol>
            </details>
          ))}
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void bind();
            }}
          >
            <fieldset
              className="persistence-fields"
              disabled={busy || uncertain || review}
            >
              <label className="field">
                {ru ? "Одобренная версия пакета" : "Approved Pack version"}
                <select
                  required
                  value={version}
                  onChange={(event) => setVersion(event.target.value)}
                >
                  <option value="">
                    {ru ? "Выберите версию" : "Choose a version"}
                  </option>
                  {current.packs.map((pack) => (
                    <option key={pack.versionId} value={pack.versionId}>
                      {pack.title} · {t("Version")} {pack.version} ·{" "}
                      {pack.versionId.slice(0, 8)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                {ru ? "Название точки входа" : "Entry point label"}
                <input
                  required
                  maxLength={240}
                  value={entry}
                  onChange={(event) => setEntry(event.target.value)}
                />
              </label>
              <label className="field">
                {ru
                  ? "Мировое время точки входа (минуты)"
                  : "Entry world time (minutes)"}
                <input
                  required
                  type="number"
                  min={0}
                  step={1}
                  value={minute}
                  onChange={(event) => setMinute(Number(event.target.value))}
                />
              </label>
            </fieldset>
            {uncertain && (
              <p role="status">
                {ru
                  ? "Сохранение не подтверждено. Повторите тот же запрос."
                  : "The save is unconfirmed. Retry the same request."}
              </p>
            )}
            <Button
              type="submit"
              primary
              disabled={busy || review || !version || !entry.trim()}
            >
              {ru
                ? uncertain
                  ? "Повторить закрепление"
                  : "Закрепить версию"
                : uncertain
                  ? "Retry binding"
                  : "Pin this version"}
            </Button>
          </form>
        </>
      )}
      <Button disabled={busy} onClick={() => void reload()}>
        {ru ? "Обновить список версий" : "Refresh versions"}
      </Button>
    </Panel>
  );
}
