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
import {
  autopilotStorageKey,
  defaultAutopilotSettings,
  parseAutopilotSettings,
  parseLedger,
  planVisualAutopilot,
  subjectKey,
  type AutopilotLedger,
  type AutopilotSettings,
} from "@/lib/ui/visual-autopilot";

export type AutopilotStatus = "off" | "idle" | "working" | "not_configured" | "fal_pending" | "cap_reached" | "error";
type AutopilotState = {
  settings: AutopilotSettings;
  ledger: AutopilotLedger;
  status: AutopilotStatus;
  save: (next: AutopilotSettings) => void;
};
const AutopilotContext = createContext<AutopilotState | null>(null);
export function useAutopilot() {
  return useContext(AutopilotContext);
}

const today = () => new Date().toISOString().slice(0, 10);
function read(campaignId: string): { settings: AutopilotSettings; ledger: AutopilotLedger } {
  try {
    const raw = JSON.parse(window.localStorage.getItem(autopilotStorageKey(campaignId)) ?? "{}");
    return { settings: parseAutopilotSettings(raw.settings), ledger: parseLedger(raw.ledger, today()) };
  } catch {
    return { settings: defaultAutopilotSettings, ledger: parseLedger(null, today()) };
  }
}
function write(campaignId: string, settings: AutopilotSettings, ledger: AutopilotLedger) {
  try {
    window.localStorage.setItem(autopilotStorageKey(campaignId), JSON.stringify({ settings, ledger }));
  } catch {
    /* Settings stay in memory for this visit. */
  }
}

/** Queues one existing subject-visual job at a time after a committed snapshot.
 * Never blocks a turn; a failed or paid attempt is never retried automatically. */
export function VisualAutopilot({ data, refresh, transport = defaultMediaFrameTransport, children }: {
  data: CampaignSnapshot;
  refresh: () => Promise<void>;
  transport?: MediaFrameTransport;
  children: ReactNode;
}) {
  const campaignId = data.campaign.id;
  const [state, setState] = useState(() => ({ settings: defaultAutopilotSettings, ledger: parseLedger(null, today()) }));
  const [status, setStatus] = useState<AutopilotStatus>("off");
  const running = useRef(false);
  useEffect(() => {
    queueMicrotask(() => setState(read(campaignId)));
  }, [campaignId]);
  const save = useCallback((settings: AutopilotSettings) => {
    setState((current) => {
      write(campaignId, settings, current.ledger);
      return { ...current, settings };
    });
  }, [campaignId]);
  useEffect(() => {
    const { settings, ledger } = state;
    if (!settings.enabled) { queueMicrotask(() => setStatus("off")); return; }
    if (settings.provider === "fal") { queueMicrotask(() => setStatus("fal_pending")); return; }
    if (ledger.count >= settings.dailyCap) { queueMicrotask(() => setStatus("cap_reached")); return; }
    if (running.current || !data.timeline || !transport.prepareSubject) return;
    const [next] = planVisualAutopilot(data, settings, ledger);
    if (!next) { queueMicrotask(() => setStatus("idle")); return; }
    running.current = true;
    queueMicrotask(() => setStatus("working"));
    void (async () => {
      try {
        const capability = await transport.capability(campaignId);
        if (!capability.enabled || !capability.reservationUsdMicros) { setStatus("not_configured"); return; }
        // Count the attempt before any paid request, so a crash never repeats it.
        const ledgerNext = { ...ledger, count: ledger.count + 1, attempted: [...ledger.attempted, subjectKey(next.subject)] };
        write(campaignId, settings, ledgerNext);
        setState((current) => ({ ...current, ledger: ledgerNext }));
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
        if (settings.autoAccept) {
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
  }, [data, state, campaignId, refresh, transport]);
  return <AutopilotContext.Provider value={{ ...state, status, save }}>{children}</AutopilotContext.Provider>;
}

/** Previews: the same controls over in-memory settings; nothing is sent. */
export function PreviewAutopilot({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AutopilotSettings>({ ...defaultAutopilotSettings, enabled: true, provider: "fal" });
  return (
    <AutopilotContext.Provider value={{ settings, ledger: { day: today(), count: 12, attempted: [] }, status: "fal_pending", save: setSettings }}>
      {children}
    </AutopilotContext.Provider>
  );
}
