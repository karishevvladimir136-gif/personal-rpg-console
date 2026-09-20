"use client";
import { useCallback, useRef, useState } from "react";
import { useCampaignData, useUnsavedChanges } from "../persistence-context";
import { useLanguage } from "../language-context";
import { PreparationReviewPanel } from "./preparation-review";
import { readJson, ClientPersistenceError } from "@/lib/persistence/client";
import { sameTimeline } from "@/lib/saves/fence";
import type { PreparationDraft } from "@/lib/foundation-loop/contracts";
import type { FoundationCommand } from "@/lib/production/contracts";

type Review = {
  draft: PreparationDraft;
  command: Omit<FoundationCommand, "operationId">;
};
export function CampaignPreparation({ bindingId }: { bindingId: string }) {
  const { campaignId, data, refresh } = useCampaignData();
  const { language } = useLanguage();
  const scope = `${campaignId}:${data?.timeline?.timelineId}:${data?.timeline?.epoch}:${bindingId}`;
  return (
    <PreparationSession
      key={scope}
      bindingId={bindingId}
      scope={scope}
      campaignId={campaignId}
      timeline={data?.timeline}
      language={language}
      refresh={refresh}
    />
  );
}
function PreparationSession({
  bindingId,
  scope,
  campaignId,
  timeline,
  language,
  refresh,
}: {
  bindingId: string;
  scope: string;
  campaignId: string;
  timeline?: import("@/lib/saves/contracts").TimelineFence;
  language: "en" | "ru";
  refresh: () => Promise<void>;
}) {
  const fence = useRef<Review["command"] | null>(null);
  const attempt = useRef<{
    command: FoundationCommand;
    kind: "prepare";
    input: { bindingId: string; draft: PreparationDraft };
  } | null>(null);
  const [dirty, setDirty] = useState(false);
  useUnsavedChanges(dirty);
  const url = `/api/campaigns/${encodeURIComponent(campaignId)}/foundation`;
  const load = useCallback(
    async (signal: AbortSignal) => {
      const review = await readJson<Review>(
        `${url}/prepare?bindingId=${encodeURIComponent(bindingId)}`,
        { signal },
      );
      if (
        review.command.campaignId !== campaignId ||
        !sameTimeline(review.command.timeline, timeline)
      )
        throw new ClientPersistenceError("conflict");
      fence.current = review.command;
      return review.draft;
    },
    [url, bindingId, campaignId, timeline],
  );
  const prepare = useCallback(
    async (draft: PreparationDraft, operationId: string) => {
      if (!fence.current) throw new ClientPersistenceError("conflict");
      if (attempt.current?.command.operationId !== operationId)
        attempt.current = {
          command: { ...fence.current, operationId },
          kind: "prepare",
          input: { bindingId, draft: structuredClone(draft) },
        };
      await readJson(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(attempt.current),
      });
      await refresh();
      const saved = await load(new AbortController().signal);
      attempt.current = null;
      return saved;
    },
    [bindingId, url, refresh, load],
  );
  return (
    <PreparationReviewPanel
      language={language}
      scopeKey={scope}
      load={load}
      prepare={prepare}
      onDirtyChange={setDirty}
    />
  );
}
