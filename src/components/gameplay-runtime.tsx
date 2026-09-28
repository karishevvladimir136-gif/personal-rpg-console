"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useCampaignData } from "./persistence-context";
import { loadPlay, gameplayErrorMessage } from "@/lib/gameplay/client";
import { isUnresolved } from "@/lib/gameplay/client-state";
import type { PlaySnapshot, PublicTurn } from "@/lib/gameplay/contracts";
import { sameTimeline } from "@/lib/saves/client-state";

const changedEvent = "rpg-gameplay-changed";
export function notifyGameplayChanged(campaignId: string) {
  window.dispatchEvent(new CustomEvent(changedEvent, { detail: campaignId }));
}
export function useGameplayRuntime(reviewOnly = false) {
  const { campaignId, data, refresh: refreshRecords } = useCampaignData();
  const [play, setPlay] = useState<PlaySnapshot | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(!reviewOnly);
  const generation = useRef(0);
  const snapshot = useRef<PlaySnapshot | null>(null);
  const refresh = useCallback(async () => {
    if (reviewOnly) return null;
    const sequence = ++generation.current;
    try {
      const next = await loadPlay(campaignId);
      if (
        sequence === generation.current &&
        next.campaignId === campaignId &&
        sameTimeline(next.timeline, data?.timeline)
      ) {
        snapshot.current = next;
        setPlay(next);
        setError("");
      } else if (
        sequence === generation.current &&
        !sameTimeline(next.timeline, data?.timeline)
      )
        void refreshRecords().catch(() => {});
      return next;
    } catch (cause) {
      if (sequence === generation.current)
        setError(gameplayErrorMessage(cause));
      throw cause;
    } finally {
      if (sequence === generation.current) setLoading(false);
    }
  }, [campaignId, data, refreshRecords, reviewOnly]);
  useEffect(() => {
    if (reviewOnly) return;
    const guard = generation;
    void refresh().catch(() => {});
    const changed = (event: Event) => {
      if ((event as CustomEvent).detail === campaignId)
        void refresh().catch(() => {});
    };
    const onFocus = () => void refresh().catch(() => {});
    window.addEventListener(changedEvent, changed);
    window.addEventListener("focus", onFocus);
    const timer = window.setInterval(() => {
      if (snapshot.current?.turns.some(isUnresolved))
        void refresh().catch(() => {});
    }, 2500);
    return () => {
      guard.current++;
      window.clearInterval(timer);
      window.removeEventListener(changedEvent, changed);
      window.removeEventListener("focus", onFocus);
    };
  }, [campaignId, refresh, data, reviewOnly]);
  // Return saved public records after a terminal turn; polling never executes a turn.
  const observed = useRef(new Map<string, PublicTurn["status"]>());
  useEffect(() => {
    if (!play) return;
    let changed = false;
    for (const turn of play.turns) {
      const prior = observed.current.get(turn.id);
      if (prior && prior !== "committed" && turn.status === "committed")
        changed = true;
      observed.current.set(turn.id, turn.status);
    }
    if (changed) void refreshRecords().catch(() => {});
  }, [play, refreshRecords]);
  const afterMutation = useCallback(async () => {
    notifyGameplayChanged(campaignId);
    await Promise.allSettled([refresh(), refreshRecords()]);
  }, [campaignId, refresh, refreshRecords]);
  return {
    play: play && sameTimeline(play.timeline, data?.timeline) ? play : null,
    configurationDraftSource: play,
    error,
    loading,
    refresh,
    afterMutation,
  };
}
