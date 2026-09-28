"use client";
import { useState } from "react";
import { useLanguage } from "./language-context";
import { useCampaignData, useUnsavedChanges } from "./persistence-context";
import { PlacesBelongingPanel } from "./places-belonging/places-belonging-panel";
import { belongingTransport } from "../lib/places-belonging/client";

export function PersistentPlacesBelonging() {
  const { data, campaignId, refresh, loading, error } = useCampaignData();
  const { language, t } = useLanguage();
  const [dirty, setDirty] = useState(false);
  useUnsavedChanges(dirty);
  return (
    <>
      {loading && <p role="status">{t("Loading campaign documents…")}</p>}
      {error && <p role="alert">{t(error)}</p>}
      {data && (
        <PlacesBelongingPanel
          key={campaignId}
          snapshot={data}
          language={language}
          transport={belongingTransport}
          onDirty={setDirty}
          onSaved={async () => {
            await refresh();
          }}
        />
      )}
    </>
  );
}
