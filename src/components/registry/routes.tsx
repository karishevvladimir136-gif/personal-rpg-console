"use client";

import type { ReactNode } from "react";
import { useGameplayRuntime } from "../gameplay-runtime";
import { PersistentCharacter, PersistentInventory, PersistentParty, RecordBoundary } from "../persistent-records";
import { PersistentSecondaryPage } from "../persistent-secondary-pages";
import { PersistentCampaignSettings } from "../persistent-settings";
import { PersistentCampaigns } from "../persistent-campaigns";
import { RegistryCharacter } from "./character-screen";
import { RegistryParty } from "./party-screen";
import { RegistryCodex, RegistryJournal } from "./journal-codex";
import { RegistryHoldings } from "./holdings-screen";
import { RegistrySettings } from "./settings-screen";
import { RegistryCampaigns } from "./library-screen";
import { RegistryPictures } from "./pictures-screen";
import { RegistryOwner } from "./owner-screen";
import { PersistentMediaVisualFrame } from "../persistent-visual-frame";
import { useCopy, registry as r } from "./primitives";

/** The earlier screen of a section, one click away under the new one. */
function Earlier({ children }: { children: ReactNode }) {
  const c = useCopy();
  return (
    <details className={r.panel} style={{ padding: "4px 14px 10px" }}>
      <summary style={{ fontFamily: "var(--f-display)", fontSize: 17, color: "var(--muted)", cursor: "pointer", display: "flex", alignItems: "center" }}>
        {c("Ещё · прежний экран и правка записей", "More · earlier screen and record editing")}
      </summary>
      {children}
    </details>
  );
}

export function CharacterRoute({ tab }: { tab: "char" | "inv" }) {
  const runtime = useGameplayRuntime();
  return (
    <RecordBoundary>
      {(data) => (
        <RegistryCharacter key={`${data.campaign.id}:${tab}`} data={data} play={runtime.play} initialTab={tab}
          legacy={tab === "inv" ? <PersistentInventory /> : <PersistentCharacter />} />
      )}
    </RecordBoundary>
  );
}

export function PartyRoute() {
  const runtime = useGameplayRuntime();
  return (
    <RecordBoundary>
      {(data) => (
        <div style={{ display: "grid", gap: 14 }}>
          <RegistryParty data={data} play={runtime.play} onSaved={runtime.afterMutation} />
          <Earlier><PersistentParty /></Earlier>
        </div>
      )}
    </RecordBoundary>
  );
}

export function JournalRoute() {
  return (
    <RecordBoundary>
      {(data) => (
        <div style={{ display: "grid", gap: 14 }}>
          <RegistryJournal data={data} />
          <Earlier><PersistentSecondaryPage screen="journal" /></Earlier>
        </div>
      )}
    </RecordBoundary>
  );
}

export function CodexRoute() {
  return <RecordBoundary>{(data) => <RegistryCodex data={data} />}</RecordBoundary>;
}

/** Polish 2 §6: one «Картинки» page in place of «Галерея» and «Визуальная библия». */
export function PicturesRoute() {
  const runtime = useGameplayRuntime();
  return (
    <RecordBoundary>
      {(data) => <RegistryPictures data={data} play={runtime.play} legacy={<><PersistentSecondaryPage screen="gallery" /><PersistentMediaVisualFrame /></>} />}
    </RecordBoundary>
  );
}

export function HoldingsRoute() {
  return <RecordBoundary>{(data) => <RegistryHoldings data={data} />}</RecordBoundary>;
}

export function SettingsRoute() {
  return <RecordBoundary>{(data) => <RegistrySettings data={data} more={<PersistentCampaignSettings />} />}</RecordBoundary>;
}

export function CampaignsRoute() {
  return <RegistryCampaigns more={<PersistentCampaigns />} />;
}

/** Fix run A3/A5: the owner's screen — the price of each turn and «Что видит ведущий». */
export function OwnerRoute() {
  const runtime = useGameplayRuntime();
  return (
    <RecordBoundary>
      {(data) => <RegistryOwner data={data} play={runtime.play} />}
    </RecordBoundary>
  );
}
