"use client";

import { useLanguage } from "./language-context";
import { useCampaignData } from "./persistence-context";
import { DocumentEditor } from "./persistent-documents";
import { Badge, Button, Icon, Panel } from "./ui";
import { campaignFeedback } from "@/lib/persistence/feedback-model";
import { useGameplayRuntime } from "./gameplay-runtime";
import { GameplayComposer } from "./gameplay-composer";

export function PersistentDmChat() {
  const { t, language } = useLanguage();
  const { data, loading, error, refresh, campaignId } = useCampaignData();
  const runtime = useGameplayRuntime();
  const messages = campaignFeedback(campaignId, data?.feedback ?? []);
  const guide = data?.documents.find(
    (document) =>
      document.id === data.dmGuideDocumentId &&
      document.campaign_id === campaignId,
  );
  const currentSession = data?.sessions.find(
    (row) =>
      row.id === data.publicState.current_session_id && row.status === "open",
  );
  const sessionGuidance =
    runtime.play?.sessionGuidance.filter(
      (row) => row.session_id === currentSession?.id,
    ) ?? [];
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">{data?.campaign.title}</span>
          <h1>{t("Chat with DM")}</h1>
          <p>
            {t(
              "Out-of-game feedback about narration, tone, pacing, companion initiative, and DM behavior.",
            )}
          </p>
        </div>
        <Badge>{t("Feedback only")}</Badge>
      </div>
      <div className="rules-preview-note" role="note">
        <Icon name="MessageSquare" />
        <p>
          {t(
            "Discuss preferences with the same DM. Guidance changes require your explicit approval.",
          )}
        </p>
      </div>
      <p className="muted">
        {t(
          "Feedback never advances game time, changes inventory or health, rolls dice, or rewrites canon. Keep brief remarks in Game's OOC control.",
        )}
      </p>
      {(loading || runtime.loading) && (
        <p role="status">{t("Loading saved feedback…")}</p>
      )}
      {(error || runtime.error) && (
        <Panel>
          <p role="alert">{t(error || runtime.error)}</p>
          <Button
            onClick={() => {
              void refresh().catch(() => {});
              void runtime.refresh().catch(() => {});
            }}
          >
            {t("Retry loading")}
          </Button>
        </Panel>
      )}
      {data && (
        <div className="settings-grid gameplay-feedback-grid">
          <div>
            <Panel
              className="visual-inventory-panel"
              title={t("Your feedback")}
            >
              {messages.length > 0 && (
                <details className="gameplay-transcript">
                  <summary>{t("Saved owner feedback archive")}</summary>
                  <div className="persistence-feedback-history">
                    {messages.map((message) => (
                      <article className="player-reply panel" key={message.id}>
                        <div>
                          <h3>{t("Owner feedback")}</h3>
                          <time dateTime={message.created_at}>
                            {new Date(message.created_at).toLocaleString(
                              language,
                            )}
                          </time>
                          <p className="persistence-document-body">
                            {message.body}
                          </p>
                        </div>
                      </article>
                    ))}
                  </div>
                </details>
              )}
              {runtime.play && (
                <GameplayComposer
                  play={runtime.play}
                  mode="feedback"
                  onSaved={runtime.afterMutation}
                />
              )}
            </Panel>
            <Panel
              className="visual-inventory-panel"
              title={t("Approved session guidance")}
            >
              <p className="muted">
                {t(
                  "Session guidance expires when its session closes. Campaign guidance stays versioned in the DM Guide.",
                )}
              </p>
              {sessionGuidance.length ? (
                sessionGuidance.map((row) => (
                  <p className="prose" key={row.id}>
                    {row.text}
                  </p>
                ))
              ) : (
                <p>{t("No session guidance is active.")}</p>
              )}
              <p className="muted">
                {t(
                  "Only approved guidance reaches ordinary gameplay. The full feedback conversation is not included.",
                )}
              </p>
            </Panel>
          </div>
          <div>
            <p className="muted">
              {t(
                "The saved DM Guide is used for future turns. Sending feedback alone never edits this document.",
              )}
            </p>
            {guide ? (
              <DocumentEditor
                key={`${campaignId}:${guide.id}`}
                record={guide}
                guide
              />
            ) : (
              <Panel title={t("DM Guide")}>
                <p role="alert">
                  {t(
                    "The campaign’s DM Guide is unavailable. Reload saved data; no replacement will be created automatically here.",
                  )}
                </p>
                <Button onClick={() => void refresh().catch(() => {})}>
                  {t("Refresh saved data")}
                </Button>
              </Panel>
            )}
          </div>
        </div>
      )}
    </>
  );
}
