"use client";
import { useState } from "react";
import { DmCraftOwner } from "./dm-craft-owner";
import { DmStyleControls } from "./dm-style-controls";
import { useLanguage } from "./language-context";
import { Button, Panel } from "./ui";
import { defaultDmStyle, type DmStyle } from "@/lib/campaign-settings";
import type { CraftOwnerView } from "@/lib/dm-craft/contracts";

const previewCraft: CraftOwnerView = {
  policyVersion: "mega-dm-v1-literal-1",
  versions: [
    {
      id: "00000000-0000-4000-8000-000000000101", key: "core-doctrine", version: 1,
      kind: "doctrine", category: "core", stages: ["plan", "narrate"], triggers: [],
      en: { title: "Core Doctrine", guidance: "Keep player choices open, preserve established consequences, and let characters act within their knowledge.", avoid: "Never decide for the player or silently rewrite history." },
      ru: { title: "Основные принципы", guidance: "Сохраняй свободу выбора, последствия и границы знаний персонажей.", avoid: "Не решай за игрока и не переписывай прошлое молча." },
      provenance: "Synthetic preview", createdAt: "2026-09-23T00:00:00Z",
    },
    {
      id: "00000000-0000-4000-8000-000000000102", key: "return-with-delta", version: 1,
      kind: "card", category: "continuity", stages: ["narrate"], triggers: ["return", "home"],
      en: { title: "Return with change", guidance: "A familiar place may show a small difference grounded in known events.", avoid: "Do not reveal an unrelated hidden mystery for novelty." },
      ru: { title: "Возвращение с переменой", guidance: "Знакомое место может измениться из-за уже известных событий.", avoid: "Не раскрывай постороннюю тайну ради новизны." },
      provenance: "Synthetic preview", createdAt: "2026-09-23T00:00:00Z",
    },
  ],
  effective: [
    { key: "core-doctrine", activeVersionId: "00000000-0000-4000-8000-000000000101", activationRevision: 1 },
    { key: "return-with-delta", activeVersionId: "00000000-0000-4000-8000-000000000102", activationRevision: 1 },
  ],
};

export function MegaDmPreview() {
  const { t, language, setLanguage } = useLanguage();
  const [style, setStyle] = useState<DmStyle>(defaultDmStyle);
  return <div className="app-content">
    <div className="button-row" role="group" aria-label="Preview language">
      <Button onClick={() => setLanguage("en")} disabled={language === "en"}>English</Button>
      <Button onClick={() => setLanguage("ru")} disabled={language === "ru"}>Русский</Button>
    </div>
    <DmCraftOwner previewView={previewCraft} />
    <Panel title={t("DM Style")}>
      <p className="muted">{t("Synthetic preview only. No changes are saved.")}</p>
      <DmStyleControls style={style} onChange={(key, value) => setStyle((current) => ({ ...current, [key]: value }))} />
    </Panel>
  </div>;
}
