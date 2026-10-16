"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { CampaignSnapshot } from "@/lib/persistence/contracts";
import {
  createSubjectVisualAttempt,
  createSubjectVisualOwnerDecision,
  defaultMediaFrameTransport,
  finishSubjectVisualAttempt,
  type MediaFrameTransport,
} from "@/lib/visual-frame/media-client";
import { referenceIsCurrent, visualDocuments } from "@/lib/visual-frame/model";
import { subjectVisualDocuments } from "@/lib/visual-frame/subject-job";
import { autopilotStorageKey, parseLedger, planVisualAutopilot, subjectKey, type AutopilotLedger } from "@/lib/ui/visual-autopilot";
import { capRemaining, type PictureSettings } from "@/lib/visual-frame/pictures";
import { usePictures } from "./live-frames";

// The visual autopilot on the campaign's own picture settings (Stage V): after a
// committed snapshot it asks the server for the next anchor (fal pictures with
// versions), one at a time, within the daily cap shared with the live frames.
// The earlier OpenAI path stays for a campaign that chooses it; its
// device-local attempt ledger remains, since that pipeline has no server ledger.
export type AutopilotStatus = "off" | "idle" | "working" | "not_configured" | "cap_reached" | "error" | "loading";
type AutopilotState = {
  settings: PictureSettings;
  today: { count: number; costUsdMicros: number };
  status: AutopilotStatus;
  saving: boolean;
  save: (next: Partial<PictureSettings>) => Promise<void>;
};
const AutopilotContext = createContext<AutopilotState | null>(null);
export function useAutopilot() {
  return useContext(AutopilotContext);
}

const today = () => new Date().toISOString().slice(0, 10);
function readLedger(campaignId: string): AutopilotLedger {
  try {
    return parseLedger(JSON.parse(window.localStorage.getItem(autopilotStorageKey(campaignId)) ?? "{}").ledger, today());
  } catch {
    return parseLedger(null, today());
  }
}
function writeLedger(campaignId: string, ledger: AutopilotLedger) {
  try {
    window.localStorage.setItem(autopilotStorageKey(campaignId), JSON.stringify({ ledger }));
  } catch {
    /* The ledger stays in memory for this visit. */
  }
}

/** Queues one picture at a time after a committed snapshot. Never blocks a turn; a failed or
 * paid attempt is never retried automatically. */
export function VisualAutopilot({ data, refresh, transport = defaultMediaFrameTransport, children }: {
  data: CampaignSnapshot;
  refresh: () => Promise<void>;
  transport?: MediaFrameTransport;
  children: ReactNode;
}) {
  const campaignId = data.campaign.id;
  const pictures = usePictures();
  const [status, setStatusNow] = useState<AutopilotStatus>("loading");
  // Status changes follow the effect's own tick, never a synchronous set inside it.
  const setStatus = useCallback((next: AutopilotStatus) => queueMicrotask(() => setStatusNow(next)), []);
  const [saving, setSaving] = useState(false);
  const running = useRef(false);
  const stepped = useRef<string>("");
  const settings = pictures?.board.settings ?? null;
  const save = useCallback(async (next: Partial<PictureSettings>) => {
    if (!pictures || !settings) return;
    setSaving(true);
    try {
      await pictures.send("pictures.settings", { ...settings, ...next, autopilot: { ...settings.autopilot, ...(next.autopilot ?? {}) }, expectedRevision: settings.revision });
    } finally {
      setSaving(false);
    }
  }, [pictures, settings]);
  useEffect(() => {
    if (!pictures || !pictures.loaded || !settings) return;
    const autopilot = settings.autopilot;
    if (!autopilot.enabled) { setStatus("off"); return; }
    if (!capRemaining(pictures.board)) { setStatus("cap_reached"); return; }
    if (running.current || !data.timeline) return;
    if (autopilot.provider === "fal") {
      // One step per committed snapshot: the server plans from the records and the board.
      const key = `${data.timeline.timelineId}:${data.timeline.epoch}:${data.publicState.revision}:${pictures.board.pictures.length}`;
      if (stepped.current === key) return;
      if (pictures.board.pictures.some((row) => row.kind === "anchor" && (row.status === "queued" || row.status === "generating"))) { setStatus("working"); return; }
      stepped.current = key;
      running.current = true;
      void (async () => {
        try {
          const result = await pictures.send("pictures.autopilot", {}) as { status?: string } | null;
          setStatus(result?.status === "queued" ? "working" : result?.status === "cap" ? "cap_reached" : "idle");
        } catch {
          setStatus("error");
        } finally {
          running.current = false;
        }
      })();
      return;
    }
    // The earlier OpenAI pipeline, with the campaign's toggles and the device ledger.
    const ledger = readLedger(campaignId);
    const legacy = { enabled: true, items: autopilot.items, portraits: autopilot.portraits, places: autopilot.places, holdings: autopilot.holdings,
      autoAccept: autopilot.autoAccept, dailyCap: Math.max(0, settings.dailyCap - pictures.board.today.count), provider: "openai" as const };
    if (!transport.prepareSubject) return;
    const [next] = planVisualAutopilot(data, legacy, { ...ledger, count: 0 });
    if (!next) { setStatus("idle"); return; }
    running.current = true;
    setStatus("working");
    void (async () => {
      try {
        const capability = await transport.capability(campaignId);
        if (!capability.enabled || !capability.reservationUsdMicros) { setStatus("not_configured"); return; }
        // Count the attempt before any paid request, so a crash never repeats it.
        writeLedger(campaignId, { ...ledger, count: ledger.count + 1, attempted: [...ledger.attempted, subjectKey(next.subject)] });
        const referenceIds = visualDocuments(data)
          .filter(({ value }) => value.kind === "reference" && value.approval === "approved" && referenceIsCurrent(data, value) &&
            ((value.subject.kind === next.subject.kind && value.subject.id === next.subject.id) ||
              (value.subject.kind === "style" && value.subject.id === campaignId)))
          .slice(0, 8).map(({ record }) => record.id);
        const job = await transport.prepareSubject!({
          campaignId, timeline: data.timeline!, expectedPublicStateRevision: data.publicState.revision,
          subject: next.subject, referenceIds, retryOf: null,
        });
        const attempt = createSubjectVisualAttempt(data, job, capability.reservationUsdMicros);
        await finishSubjectVisualAttempt(attempt, transport);
        if (autopilot.autoAccept) {
          const fresh = await transport.load(campaignId);
          const draft = subjectVisualDocuments(fresh).find(({ value }) =>
            value.status === "draft" && value.review?.status === "safe_to_review" &&
            value.basis.subject.kind === next.subject.kind && value.basis.subject.id === next.subject.id);
          if (draft) await transport.send({ action: "media.accept", input: createSubjectVisualOwnerDecision(fresh, draft.record, "accept") });
        }
        setStatus("idle");
        await refresh();
      } catch {
        setStatus("error");
      } finally {
        running.current = false;
      }
    })();
  }, [data, pictures, settings, campaignId, refresh, transport, setStatus]);
  if (!pictures || !settings) return <>{children}</>;
  return (
    <AutopilotContext.Provider value={{ settings, today: pictures.board.today, status, saving, save }}>
      {children}
    </AutopilotContext.Provider>
  );
}

/** Previews: the same controls over the sample board; nothing is sent. */
export function PreviewAutopilot({ children }: { children: ReactNode }) {
  const pictures = usePictures();
  const [override, setOverride] = useState<PictureSettings | null>(null);
  if (!pictures) return <>{children}</>;
  const settings = override ?? pictures.board.settings;
  return (
    <AutopilotContext.Provider value={{ settings, today: pictures.board.today, status: "idle", saving: false,
      save: async (next) => setOverride({ ...settings, ...next, autopilot: { ...settings.autopilot, ...(next.autopilot ?? {}) } }) }}>
      {children}
    </AutopilotContext.Provider>
  );
}
