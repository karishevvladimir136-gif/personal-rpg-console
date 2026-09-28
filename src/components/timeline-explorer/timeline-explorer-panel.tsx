"use client";
import { useEffect, useMemo, useState } from "react";
import type { CampaignSnapshot } from "../../lib/persistence/contracts.ts";
import type { SavesSnapshot } from "../../lib/saves/contracts.ts";
import type { LabCatalog } from "../../lib/world-lab/contracts.ts";
import { projectTimelineExplorer } from "../../lib/timeline-explorer/projection.ts";
import {
  readTimelineSupplement,
  timelineReadTransport,
  type TimelineReadTransport,
} from "./client.ts";
import { timelineText } from "./text.ts";
import { TimelineExplorer } from "./timeline-explorer.tsx";

type Supplement = { saves: SavesSnapshot | null; lab: LabCatalog | null };
export function TimelineExplorerPanel({
  snapshot,
  language,
  initialSupplement,
  transport = timelineReadTransport,
  refreshSnapshot,
}: {
  snapshot: CampaignSnapshot;
  language: "en" | "ru";
  initialSupplement?: Supplement;
  transport?: TimelineReadTransport;
  refreshSnapshot?: () => Promise<void>;
}) {
  const [reload, setReload] = useState(0);
  const campaignId = snapshot.campaign.id;
  const requestKey = useMemo(
    () => ({ snapshot, language, reload, transport }),
    [snapshot, language, reload, transport],
  );
  const [read, setRead] = useState<{
    key: typeof requestKey;
    supplement: Supplement;
  } | null>(
    initialSupplement
      ? { key: requestKey, supplement: initialSupplement }
      : null,
  );
  const loading = read?.key !== requestKey;
  // Old optional data becomes inapplicable synchronously when its scope changes,
  // before an effect or request can display it under another active history.
  const supplement = loading ? { saves: null, lab: null } : read!.supplement;
  useEffect(() => {
    const controller = new AbortController();
    void readTimelineSupplement(
      campaignId,
      language,
      controller.signal,
      transport,
    )
      .then((next) => {
        if (!controller.signal.aborted)
          setRead({ key: requestKey, supplement: next });
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setRead({ key: requestKey, supplement: { saves: null, lab: null } });
      });
    return () => controller.abort();
  }, [campaignId, language, requestKey, transport]);
  const c = timelineText(language);
  const notices = !loading
    ? [
        !supplement.saves ? c.unavailableSaves : "",
        !supplement.lab ? c.unavailableLab : "",
      ].filter(Boolean)
    : [];
  return (
    <TimelineExplorer
      projection={projectTimelineExplorer({ snapshot, ...supplement })}
      language={language}
      refreshing={loading}
      notices={notices}
      onRefresh={() => {
        if (refreshSnapshot)
          void refreshSnapshot()
            .catch(() => {})
            .finally(() => setReload((value) => value + 1));
        else setReload((value) => value + 1);
      }}
    />
  );
}
