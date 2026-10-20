"use client";

import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import { useCampaignData } from "./persistence-context";
import { loadMemory, memoryErrorMessage } from "@/lib/memory/client";
import {
  createMemoryReader,
  initialMemoryReadState,
} from "@/lib/memory/client-state";
import type { TimelineFence } from "@/lib/saves/contracts";
import { timelineKey } from "@/lib/saves/client-state";
import { createBackoffPoll } from "@/lib/ui/backoff-poll";

const readers = new Map<string, ReturnType<typeof makeReader>>();
function makeReader(campaignId: string, timeline?: TimelineFence) {
  const key = `${campaignId}:${timelineKey(timeline)}`;
  const reader = createMemoryReader(
    campaignId,
    loadMemory,
    memoryErrorMessage,
    timeline,
  );
  let subscribers = 0;
  let poll: ReturnType<typeof createBackoffPoll> | null = null;
  const refresh = () => {
    void reader.refresh().catch(() => {});
  };
  const gameplayChanged = (event: Event) => {
    if ((event as CustomEvent).detail === campaignId) refresh();
  };
  const entry = {
    ...reader,
    subscribe(listener: () => void) {
      const unsubscribe = reader.subscribe(listener);
      subscribers++;
      if (subscribers === 1) {
        readers.set(key, entry);
        window.addEventListener("focus", refresh);
        window.addEventListener("rpg-gameplay-changed", gameplayChanged);
        // Reads only. A pending recap never starts generation from a timer. Fix run A3: a backing-off,
        // never-overlapping poll that pauses in a hidden tab.
        poll = createBackoffPoll({
          run: () => reader.refresh(),
          active: () => {
            const snapshot = reader.getSnapshot().snapshot;
            return snapshot?.currentBoundary?.state === "resuming" ||
              !!snapshot?.sessions.some((row) => ["pending", "generating"].includes(row.recap.status));
          },
          baseMs: 2500,
          maxMs: 20000,
        });
      }
      return () => {
        unsubscribe();
        subscribers--;
        if (!subscribers) {
          poll?.stop();
          poll = null;
          window.removeEventListener("focus", refresh);
          window.removeEventListener("rpg-gameplay-changed", gameplayChanged);
          readers.delete(key);
        }
      };
    },
  };
  return entry;
}
export function useSessionMemory() {
  const { campaignId, data } = useCampaignData();
  const timeline = data?.timeline;
  const key = `${campaignId}:${timelineKey(timeline)}`;
  const reader = useMemo(() => {
    const existing = readers.get(key);
    if (existing) return existing;
    const next = makeReader(campaignId, timeline);
    readers.set(key, next);
    return next;
  }, [campaignId, key, timeline]);
  const subscribe = useCallback(
    (listener: () => void) => reader.subscribe(listener),
    [reader],
  );
  const state = useSyncExternalStore(
    subscribe,
    reader.getSnapshot,
    () => initialMemoryReadState,
  );
  useEffect(() => {
    void reader.refresh().catch(() => {});
  }, [reader, data]);
  return { ...state, refresh: reader.refresh, accept: reader.accept };
}
