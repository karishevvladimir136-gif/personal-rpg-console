"use client";

import { useRef, useState } from "react";
import { useLanguage } from "./language-context";
import { useOptionalCampaignData } from "./persistence-context";
import { Badge, Button } from "./ui";
import { DmStyleControls } from "./dm-style-controls";
import { craftKeyFromTitle } from "./dm-craft-key";
import { effectiveDmStyle, type DmStyle } from "@/lib/campaign-settings";
import { dmStyleChoices, dmStyleKeys } from "./dm-style-controls";
import type {
  CraftOwnerView,
  CraftVersionInput,
  TeachCommand,
} from "@/lib/dm-craft/contracts";
import type { PublicTurn } from "@/lib/gameplay/contracts";
import { errorMessage, readJson } from "@/lib/persistence/client";
import { sameTimeline } from "@/lib/saves/client-state";

export function DmTeachReview({
  turn,
  onSaved,
  reviewScope,
  previewStyle,
}: {
  turn: PublicTurn;
  onSaved: () => Promise<void>;
  reviewScope: "campaign_style" | "global_craft";
  previewStyle?: DmStyle;
}) {
  const { t } = useLanguage();
  const context = useOptionalCampaignData();
  const campaignId = context?.campaignId ?? "";
  const data = context?.data;
  const refresh = context?.refresh;
  const proposal = turn.proposal!;
  const candidate = proposal.teachingCandidate;
  const originalStyle = previewStyle ?? effectiveDmStyle(data?.settings.values ?? {});
  const [expanded, setExpanded] = useState(false);
  const [baselineRevision] = useState(data?.settings.revision ?? null);
  const [style, setStyle] = useState<DmStyle>(() => candidate?.kind === "campaign_style"
    ? Object.fromEntries(dmStyleKeys.map((key) => [key, candidate.styleDelta[key] ?? originalStyle[key]])) as DmStyle
    : originalStyle);
  const [entry, setEntry] = useState<CraftVersionInput>(() => candidate?.kind === "global_craft" ? {
    ...candidate.entry,
    key: "",
    kind: "card",
  } : ({
    key: "",
    kind: "card",
    category: "",
    stages: ["plan", "narrate"],
    triggers: [],
    en: { title: "", guidance: "", avoid: "" },
    ru: { title: "", guidance: "", avoid: "" },
    provenance: "Owner-reviewed general guidance",
  }));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");
  const pending = useRef<TeachCommand | null>(null);
  const guard = useRef(false);
  const timeline = turn.timeline ?? data?.timeline;
  const stale = !previewStyle && (
    !data ||
    !timeline ||
    !sameTimeline(timeline, data.timeline) ||
    data.settings.revision !== baselineRevision);
  const submit = async (action: TeachCommand["action"]) => {
    if (guard.current || stale || !timeline || !data || !refresh || previewStyle) return;
    guard.current = true;
    setBusy(true);
    setError("");
    try {
      const base = {
        requestId: crypto.randomUUID(),
        campaignId,
        timeline,
        operationId: turn.id,
        proposalId: proposal.id,
      };
      let command: TeachCommand;
      if (action === "approve-style") {
        command = {
          ...base,
          action,
          expectedSettingsRevision: data.settings.revision,
          style,
        };
      } else if (action === "approve-global") {
        const prior = pending.current;
        if (
          prior?.action === "approve-global" &&
          JSON.stringify({ ...prior.entry, key: "" }) === JSON.stringify(entry)
        ) {
          command = prior;
        } else {
          const craft = await readJson<CraftOwnerView>("/api/dm-craft");
          command = {
            ...base,
            action,
            expectedActivationRevision: 0,
            entry: {
              ...entry,
              key: craftKeyFromTitle(
                entry.en.title,
                craft.versions.map((version) => version.key),
              ),
              provenance: "Owner-reviewed general guidance",
            },
          };
        }
      } else {
        command = { ...base, action: "reject" };
      }
      if (
        JSON.stringify({ ...pending.current, requestId: undefined }) !==
        JSON.stringify({ ...command, requestId: undefined })
      )
        pending.current = command;
      await readJson(
        `/api/campaigns/${encodeURIComponent(campaignId)}/dm-teach`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pending.current),
        },
      );
      pending.current = null;
      setDone(
        action === "reject" ? t("Proposal rejected.") : t("Proposal approved."),
      );
      await Promise.allSettled([refresh(), onSaved()]);
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      guard.current = false;
      setBusy(false);
    }
  };
  if (proposal.status === "rejected") return <Badge>{t("Rejected")}</Badge>;
  if (proposal.status === "approved")
    return (
      <Badge green>
        {t(
          proposal.scope === "campaign_style"
            ? "Approved for this campaign's DM Style"
            : "Approved for global DM Craft",
        )}
      </Badge>
    );
  const global = reviewScope === "global_craft";
  return (
    <div className="dm-teach-review">
      <p>
        {t(
          global
            ? "A global Craft change needs your own generalized wording. Campaign feedback is never copied into global guidance automatically."
            : "Review the campaign's seven DM Style values before approval. This changes future turns in this campaign only.",
        )}
      </p>
      {candidate && (
        <div className="dm-teaching-candidate">
          <p><strong>{t("Suggested change")}</strong> — {t(candidate.explanation)}</p>
          {candidate.kind === "campaign_style" && (
            <div className="dm-teaching-diff">
              {dmStyleKeys.filter((key) => candidate.styleDelta[key] !== null).map((key) => (
                <p key={key}>
                  <strong>{t(dmStyleChoices[key].label)}:</strong>{" "}
                  {t("Current")} {t(originalStyle[key][0].toUpperCase() + originalStyle[key].slice(1))} → {t("Proposed")} {t(candidate.styleDelta[key]![0].toUpperCase() + candidate.styleDelta[key]!.slice(1))}
                </p>
              ))}
            </div>
          )}
          {candidate.kind === "global_craft" && (
            <p className="muted">{t("Proposed bilingual Craft Card is filled in below. Review or edit it before approval.")}</p>
          )}
        </div>
      )}
      {!expanded ? (
        <div className="button-group">
          <Button primary onClick={() => setExpanded(true)}>
            {t("Review and edit")}
          </Button>
          <Button
            disabled={busy || stale || !!previewStyle}
            onClick={() => void submit("reject")}
          >
            {t("Reject proposal")}
          </Button>
        </div>
      ) : (
        <>
          {global ? (
            <div className="dm-teach-global">
              <label className="field">
                {t("Category")}
                <input
                  required
                  maxLength={80}
                  value={entry.category}
                  onChange={(event) =>
                    setEntry({ ...entry, category: event.target.value })
                  }
                />
              </label>
              <fieldset className="dm-craft-stages">
                <legend>{t("Used during")}</legend>
                {(["plan", "narrate"] as const).map((stage) => (
                  <label key={stage}>
                    <input
                      type="checkbox"
                      checked={entry.stages.includes(stage)}
                      onChange={(event) =>
                        setEntry({
                          ...entry,
                          stages: event.target.checked
                            ? [...entry.stages, stage]
                            : entry.stages.filter((item) => item !== stage),
                        })
                      }
                    />
                    {t(stage === "plan" ? "Planning" : "Narration")}
                  </label>
                ))}
              </fieldset>
              <label className="field">
                {t("Literal relevance words, comma separated")}
                <input
                  value={entry.triggers.join(", ")}
                  onChange={(event) =>
                    setEntry({
                      ...entry,
                      triggers: event.target.value
                        .split(",")
                        .map((item) => item.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </label>
              <div className="dm-craft-editor-grid">
                {(["en", "ru"] as const).map((locale) => (
                  <fieldset className="dm-craft-language" key={locale}>
                    <legend>{locale === "en" ? "English" : "Русский"}</legend>
                    {(["title", "guidance", "avoid"] as const).map((field) => (
                      <label className="field" key={field}>
                        {t(
                          field === "title"
                            ? "Title"
                            : field === "guidance"
                              ? "Guidance"
                              : "Avoid",
                        )}
                        <textarea
                          rows={field === "title" ? 2 : 4}
                          value={entry[locale][field]}
                          onChange={(event) =>
                            setEntry({
                              ...entry,
                              [locale]: {
                                ...entry[locale],
                                [field]: event.target.value,
                              },
                            })
                          }
                        />
                      </label>
                    ))}
                  </fieldset>
                ))}
              </div>
            </div>
          ) : (
            <DmStyleControls
              style={style}
              disabled={busy}
              onChange={(key, value) => setStyle({ ...style, [key]: value })}
            />
          )}
          <div className="button-group">
            <Button
              primary
              disabled={
                busy || !!previewStyle ||
                stale ||
                (global &&
                  (!entry.category.trim() ||
                    !entry.en.title.trim() ||
                    !entry.en.guidance.trim() ||
                    !entry.en.avoid.trim() ||
                    !entry.ru.title.trim() ||
                    !entry.ru.guidance.trim() ||
                    !entry.ru.avoid.trim() ||
                    entry.stages.length === 0))
              }
              onClick={() =>
                void submit(global ? "approve-global" : "approve-style")
              }
            >
              {t(busy ? "Saving…" : "Approve reviewed change")}
            </Button>
            <Button
              disabled={busy || stale || !!previewStyle}
              onClick={() => void submit("reject")}
            >
              {t("Reject proposal")}
            </Button>
          </div>
        </>
      )}
      {stale && (
        <p role="alert">
          {t(
            "This proposal belongs to a different timeline. Refresh before reviewing it.",
          )}
        </p>
      )}
      {error && <p role="alert">{t(error)}</p>}
      {done && <p role="status">{done}</p>}
    </div>
  );
}
