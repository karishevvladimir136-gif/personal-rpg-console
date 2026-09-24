"use client";
import { useState } from "react";
import { DmCraftOwner } from "./dm-craft-owner";
import { DmStyleControls } from "./dm-style-controls";
import { DmTeachReview } from "./dm-teach-review";
import { useLanguage } from "./language-context";
import { Button, Panel } from "./ui";
import { defaultDmStyle, type DmStyle } from "@/lib/campaign-settings";
import type { CraftOwnerView } from "@/lib/dm-craft/contracts";
import type { PublicTurn } from "@/lib/gameplay/contracts";

const previewCraft: CraftOwnerView = {
  policyVersion: "mega-dm-v1-public-context-2",
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

const previewTurn: PublicTurn = {
  id: "00000000-0000-4000-8000-000000000201", campaign_id: "preview",
  session_id: null, mode: "feedback", input: "Companions are too passive.",
  companionId: null, listenerIds: [], status: "committed", expectedRevision: 1,
  committedRevision: 1, settingsRevision: 1, created_at: "2026-09-23T00:00:00Z",
  updated_at: "2026-09-23T00:00:00Z", narration: null, visualDescription: null,
  checks: [], failure: null, canRetry: false, canCancel: false,
  proposal: {
    id: "00000000-0000-4000-8000-000000000202", text: "Give companions more initiative while preserving player decisions.",
    status: "proposed", scope: null, sessionId: null, documentRevision: 1,
    teachingCandidate: {
      kind: "campaign_style", explanation: "Companions can pursue their own goals more often without choosing for the player.",
      styleDelta: { companionAgency: "high", descriptionDensity: null, dialogueDensity: null,
        dramaticPace: null, mystery: null, failForward: null, tone: null },
    },
  },
};
const previewGlobalTurn: PublicTurn = {
  ...previewTurn,
  id: "00000000-0000-4000-8000-000000000203",
  proposal: {
    ...previewTurn.proposal!,
    id: "00000000-0000-4000-8000-000000000204",
    teachingCandidate: {
      kind: "global_craft",
      explanation: "This general guidance could help companions act within their own knowledge in every campaign.",
      entry: {
        category: "companions", stages: ["plan", "narrate"], triggers: ["companion", "спутник"],
        en: { title: "Companion initiative", guidance: "Let companions pursue supported goals within their knowledge.", avoid: "Never decide for the player." },
        ru: { title: "Инициатива спутников", guidance: "Позволяй спутникам преследовать обоснованные цели в пределах их знаний.", avoid: "Не решай за игрока." },
        provenance: "Proposed owner-reviewed generalized lesson",
      },
    },
  },
};

export function MegaDmPreview() {
  const { t, language, setLanguage } = useLanguage();
  const [style, setStyle] = useState<DmStyle>(defaultDmStyle);
  return <div className="app-content">
    <div className="button-row" role="group" aria-label={t("Preview language")}>
      <Button onClick={() => setLanguage("en")} disabled={language === "en"}>{t("English")}</Button>
      <Button onClick={() => setLanguage("ru")} disabled={language === "ru"}>{t("Russian")}</Button>
    </div>
    <DmCraftOwner previewView={previewCraft} />
    <Panel title={t("DM Style")}>
      <p className="muted">{t("Synthetic preview only. No changes are saved.")}</p>
      <DmStyleControls style={style} onChange={(key, value) => setStyle((current) => ({ ...current, [key]: value }))} />
    </Panel>
    <Panel title={t("Teach DM review")}>
      <p className="muted">{t("Synthetic preview only. Edit the suggested values here; approval is disabled and nothing is saved.")}</p>
      <DmTeachReview turn={previewTurn} reviewScope="campaign_style" previewStyle={defaultDmStyle} onSaved={async () => {}} />
    </Panel>
    <Panel title={t("Review global DM Craft")}>
      <p className="muted">{t("Synthetic preview only. Edit the suggested values here; approval is disabled and nothing is saved.")}</p>
      <DmTeachReview turn={previewGlobalTurn} reviewScope="global_craft" previewStyle={defaultDmStyle} onSaved={async () => {}} />
    </Panel>
  </div>;
}
