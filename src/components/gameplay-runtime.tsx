"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useCampaignData } from "./persistence-context";
import { loadPlay, gameplayErrorMessage } from "@/lib/gameplay/client";
import { isUnresolved } from "@/lib/gameplay/client-state";
import type { PlaySnapshot, PublicTurn } from "@/lib/gameplay/contracts";
import { sameTimeline } from "@/lib/saves/client-state";
import { createBackoffPoll } from "@/lib/ui/backoff-poll";

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
  // Fix run A3: the latest timeline and records refresh through refs, so a records change never restarts
  // the polling effect (each restart fired an immediate extra read of `/play`).
  const timelineRef = useRef(data?.timeline);
  const refreshRecordsRef = useRef(refreshRecords);
  useEffect(() => { timelineRef.current = data?.timeline; refreshRecordsRef.current = refreshRecords; }, [data?.timeline, refreshRecords]);
  const inFlight = useRef<Promise<PlaySnapshot | null> | null>(null);
  const refresh = useCallback(async () => {
    if (reviewOnly) return null;
    // One read at a time: a caller that comes while a read runs shares it.
    if (inFlight.current) return inFlight.current;
    const sequence = ++generation.current;
    const read = (async () => {
      try {
        const next = await loadPlay(campaignId);
        if (
          sequence === generation.current &&
          next.campaignId === campaignId &&
          sameTimeline(next.timeline, timelineRef.current)
        ) {
          snapshot.current = next;
          setPlay(next);
          setError("");
        } else if (
          sequence === generation.current &&
          !sameTimeline(next.timeline, timelineRef.current)
        )
          void refreshRecordsRef.current().catch(() => {});
        return next;
      } catch (cause) {
        if (sequence === generation.current)
          setError(gameplayErrorMessage(cause));
        throw cause;
      } finally {
        if (sequence === generation.current) setLoading(false);
      }
    })();
    inFlight.current = read;
    try { return await read; } finally { inFlight.current = null; }
  }, [campaignId, reviewOnly]);
  useEffect(() => {
    if (reviewOnly) return;
    const guard = generation;
    void refresh().catch(() => {});
    // While a turn is unresolved: a safety-net poll (the turn's own live stream carries the text), from 3 s
    // growing to 20 s, never overlapping, paused in a hidden tab, harder back-off after a failed read.
    const poll = createBackoffPoll({ run: () => refresh(), active: () => !!snapshot.current?.turns.some(isUnresolved), baseMs: 3000, maxMs: 20000 });
    const changed = (event: Event) => {
      if ((event as CustomEvent).detail === campaignId) { void refresh().catch(() => {}); poll.kick(); }
    };
    const onFocus = () => { void refresh().catch(() => {}); poll.kick(); };
    const onVisible = () => { if (document.visibilityState === "visible") onFocus(); };
    window.addEventListener(changedEvent, changed);
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      guard.current++;
      poll.stop();
      window.removeEventListener(changedEvent, changed);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [campaignId, refresh, reviewOnly]);
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
