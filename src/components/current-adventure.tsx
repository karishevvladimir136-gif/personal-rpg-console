"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { createAdventureTransport } from "@/lib/adventures/client";
import type { AdventureCatalog } from "@/lib/adventures/contracts";
import type { CampaignSnapshot } from "@/lib/persistence/contracts";
import { sameTimeline } from "@/lib/saves/fence";
import { useLanguage } from "./language-context";
import styles from "./adventures/adventures.module.css";

function previewText(value: string, limit: number): string {
  if (value.length <= limit) return value;
  const partial = value.slice(0, limit);
  const wordEnd = partial.search(/\s+\S*$/u);
  return `${(wordEnd > limit / 2 ? partial.slice(0, wordEnd) : partial).trimEnd()}…`;
}

/** Public, read-only chapter summary. Adventure authoring is mounted separately. */
export function CurrentAdventure({
  snapshot,
  initialCatalog,
  reviewOnly = false,
}: {
  snapshot: CampaignSnapshot;
  initialCatalog?: AdventureCatalog;
  reviewOnly?: boolean;
}) {
  const { language } = useLanguage();
  const timeline = snapshot.timeline;
  const [catalog, setCatalog] = useState<AdventureCatalog | null>(initialCatalog ?? null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(!initialCatalog && !reviewOnly);
  const load = useCallback(async (signal?: AbortSignal) => {
    if (reviewOnly) return;
    if (!timeline) {
      setLoading(false);
      setError(true);
      return;
    }
    setLoading(true);
    setError(false);
    try {
      const result = await createAdventureTransport().read(snapshot.campaign.id, timeline, signal);
      if (!signal?.aborted) setCatalog(result);
    } catch {
      if (!signal?.aborted) setError(true);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [snapshot.campaign.id, timeline, reviewOnly]);
  useEffect(() => {
    if (reviewOnly) return;
    if (initialCatalog && sameTimeline(initialCatalog.timeline, timeline)) return;
    const controller = new AbortController();
    Promise.resolve().then(() => {
      if (!controller.signal.aborted) void load(controller.signal);
    });
    return () => controller.abort();
  }, [initialCatalog, load, timeline, reviewOnly]);
  const current = catalog && catalog.campaignId === snapshot.campaign.id && sameTimeline(catalog.timeline, timeline)
    ? catalog.adventures.find((adventure) =>
        adventure.id === catalog.activeAdventureId && adventure.status === "active")
    : null;
  const premise = current?.premise.trim() ?? "";
  const premisePreview = previewText(premise, 140);
  const savedSummary = current?.summary?.trim() ?? "";
  const summaryPreview = previewText(savedSummary, 180);
  const openLeads = snapshot.quests.filter((quest) =>
    quest.campaign_id === snapshot.campaign.id && quest.status === "open");
  return (
    <section className={styles.currentAdventure} aria-label={language === "ru" ? "Текущее приключение" : "Current Adventure"}>
      <div className={styles.currentAdventureHeading}>
        <span>{language === "ru" ? "Текущее приключение" : "Current Adventure"}</span>
        {current && <small>{language === "ru" ? "Идёт" : "In progress"}</small>}
      </div>
      {loading ? <p role="status">{language === "ru" ? "Загружаем приключение…" : "Loading your adventure…"}</p>
        : error || (catalog && (catalog.campaignId !== snapshot.campaign.id || !sameTimeline(catalog.timeline, timeline))) ? (
          <p role="status">{language === "ru" ? "Не удалось загрузить текущее приключение." : "The current adventure could not be loaded."} <button type="button" onClick={() => void load()}>{language === "ru" ? "Повторить" : "Try again"}</button></p>
        ) : current ? (
          <>
            <h2>{current.title}</h2>
            <p>{premisePreview}</p>
            {premise.length > 140 && (
              <details className={styles.currentAdventureMore}>
                <summary>{language === "ru" ? "Полное описание" : "Read full premise"}</summary>
                <p>{premise}</p>
              </details>
            )}
            {summaryPreview && (
              <div className={styles.currentAdventureLeads}>
                <strong>{language === "ru" ? "История на данный момент" : "Story so far"}</strong>
                <p>{summaryPreview}</p>
                {savedSummary.length > 180 && (
                  <details className={styles.currentAdventureMore}>
                    <summary>{language === "ru" ? "Вся история" : "Read full story"}</summary>
                    <p>{savedSummary}</p>
                  </details>
                )}
              </div>
            )}
            {openLeads.length > 0 && (
              <div className={styles.currentAdventureLeads}>
                <strong>{language === "ru" ? "Открытые нити" : "Open leads"}</strong>
                <ul>{openLeads.slice(0, 4).map((quest) => <li key={quest.id}>{quest.title}</li>)}</ul>
              </div>
            )}
            <Link href={`/campaigns/${snapshot.campaign.id}/game`} className={styles.currentAdventureContinue}>
              {language === "ru" ? "Продолжить приключение" : "Continue adventure"} →
            </Link>
          </>
        ) : <p>{language === "ru" ? "Сейчас нет активного приключения." : "No active adventure right now."}</p>}
    </section>
  );
}
