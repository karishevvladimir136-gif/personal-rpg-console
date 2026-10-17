"use client";

import { useState } from "react";
import { Pin, PinOff } from "lucide-react";
import type { PinnedFact } from "@/lib/persistence/contracts";
import { readJson } from "@/lib/persistence/client";
import { useOptionalCampaignData } from "../persistence-context";
import { useChrome } from "./shell";
import { registry as r, useCopy } from "./primitives";

type Source = PinnedFact["source"];
const same = (a: Source, b: Source) => !!a && !!b && a.kind === b.kind && a.id === b.id;

/** Pin or unpin one fact from the Journal, the Codex or a scene (plan §11):
 * one click, through /api/campaigns/<id>/dossier; the snapshot refreshes after. */
export function PinButton({ campaignId, pinned, text, source, compact }: {
  campaignId: string; pinned: PinnedFact[]; text: string; source: Source; compact?: boolean;
}) {
  const c = useCopy();
  const chrome = useChrome();
  const campaign = useOptionalCampaignData();
  const [busy, setBusy] = useState(false);
  const existing = pinned.find((pin) => (source ? same(pin.source, source) : pin.text === text)) ?? null;
  const toggle = async () => {
    if (busy || chrome?.href) return;
    setBusy(true);
    try {
      await readJson(`/api/campaigns/${encodeURIComponent(campaignId)}/dossier`, { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(existing ? { action: "unpin", id: existing.id } : { action: "pin", text: text.slice(0, 300), ...(source ? { source } : {}) }) });
      await campaign?.refresh();
    } catch { /* the next click retries */ } finally { setBusy(false); }
  };
  const label = existing ? c("Открепить", "Unpin") : c("Закрепить для ведущего", "Pin for the DM");
  // Polish group 9: a small pin with a plain tooltip, not an admin panel.
  const title = existing ? c("Закреплено: ведущий всегда будет это помнить", "Pinned: the DM will always remember this") : c("Ведущий всегда будет это помнить", "The DM will always remember this");
  return (
    <button type="button" className={compact ? r.iconBtn : r.btnGhost} aria-pressed={!!existing} aria-label={label} title={title}
      disabled={busy || !!chrome?.href} onClick={() => void toggle()}>
      {existing ? <PinOff size={16} aria-hidden="true" /> : <Pin size={16} aria-hidden="true" />}
      {!compact && <span>{existing ? c("Закреплено", "Pinned") : c("Закрепить", "Pin")}</span>}
    </button>
  );
}

/** The owner's pinned facts, with unpin. */
export function PinnedList({ campaignId, pinned }: { campaignId: string; pinned: PinnedFact[] }) {
  const c = useCopy();
  if (!pinned.length) return <p className={r.empty}>{c("Пока ничего не закреплено. Закрепи факт из журнала, кодекса или сцены — он всегда будет перед ведущим.", "Nothing pinned yet. Pin a fact from the Journal, the Codex or a scene — it stays in front of the DM.")}</p>;
  return (
    <ul className={r.stack} style={{ listStyle: "none", margin: 0, padding: 0, gap: 6 }}>
      {pinned.map((pin) => (
        <li key={pin.id} className={r.row} style={{ alignItems: "flex-start" }}>
          <span style={{ flex: 1 }}>{pin.text}</span>
          <PinButton campaignId={campaignId} pinned={pinned} text={pin.text} source={pin.source} compact />
        </li>
      ))}
    </ul>
  );
}
