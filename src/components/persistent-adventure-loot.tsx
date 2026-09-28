"use client";
import { useEffect, useRef, useState } from "react";
import { useCampaignData } from "./persistence-context";
import { useLanguage } from "./language-context";
import { AdventureLootObjectsPanel } from "./adventure-loot/objects-panel";
import type {
  OwnerLootView,
  OwnerObjectInput,
} from "@/lib/adventure-loot/owner-contracts";
export function PersistentAdventureLoot() {
  const { data, refresh } = useCampaignData(),
    { language } = useLanguage(),
    [view, setView] = useState<OwnerLootView | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const pending = useRef<object | null>(null);
  const [hasPending, setHasPending] = useState(false);
  const remember = (value: object | null) => {
    pending.current = value;
    setHasPending(value !== null);
  };
  const cid = data?.campaign.id,
    scope = `${data?.timeline?.timelineId}:${data?.timeline?.epoch}`;
  useEffect(() => {
    if (!cid) return;
    const abort = new AbortController();
    fetch(`/api/campaigns/${cid}/adventure-loot`, {
      signal: abort.signal,
      cache: "no-store",
    })
      .then(async (r) => {
        if (!r.ok) throw Error();
        setView(await r.json());
      })
      .catch(() => {
        if (!abort.signal.aborted)
          setError(
            language === "ru"
              ? "Настройка объектов недоступна."
              : "Object setup is unavailable.",
          );
      });
    return () => abort.abort();
  }, [cid, scope, language]);
  async function save(input: OwnerObjectInput) {
    if (!cid || !view || busy) return;
    setBusy(true);
    setError("");
    const request = {
      command: { ...view.command, operationId: crypto.randomUUID() },
      kind: "loot.configure",
      input,
    };
    remember(request);
    try {
      const r = await fetch(`/api/campaigns/${cid}/foundation`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(request),
      });
      if (!r.ok) {
        if (r.status >= 500) throw Error("uncertain");
        remember(null);
        throw Error("stale");
      }
      remember(null);
      await refresh();
      const next = await fetch(`/api/campaigns/${cid}/adventure-loot`, {
        cache: "no-store",
      });
      if (!next.ok) throw Error("refresh");
      setView(await next.json());
    } catch (e) {
      setError(
        pending.current !== null ||
          (e instanceof Error && e.message === "uncertain")
          ? language === "ru"
            ? "Результат запроса неизвестен. Повторите тот же запрос."
            : "The request result is unknown. Retry the same request."
          : language === "ru"
            ? "Состояние изменилось. Обновите и проверьте настройки."
            : "State changed. Refresh and review the setup.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function retry() {
    if (!cid || !pending.current || busy) return;
    setBusy(true);
    try {
      const r = await fetch(`/api/campaigns/${cid}/foundation`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(pending.current),
      });
      if (!r.ok) throw Error();
      remember(null);
      await refresh();
      const next = await fetch(`/api/campaigns/${cid}/adventure-loot`, {
        cache: "no-store",
      });
      if (!next.ok) throw Error();
      setView(await next.json());
      setError("");
    } catch {
      setError(
        language === "ru"
          ? "Повтор не подтверждён. Сохранён исходный запрос."
          : "Retry is not confirmed. The original request is retained.",
      );
    } finally {
      setBusy(false);
    }
  }
  if (!view) return error ? <p role="alert">{error}</p> : null;
  return (
    <details className="panel">
      <summary>
        {language === "ru"
          ? "Объекты и контейнеры · настройка владельца"
          : "Objects and containers · owner setup"}
      </summary>
      {error && <p role="alert">{error}</p>}
      {hasPending && (
        <button className="button secondary" disabled={busy} onClick={retry}>
          {language === "ru"
            ? "Повторить исходный запрос"
            : "Retry original request"}
        </button>
      )}
      <AdventureLootObjectsPanel
        language={language}
        data={view}
        busy={busy || hasPending}
        onSave={save}
      />
    </details>
  );
}
