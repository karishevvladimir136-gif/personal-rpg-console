"use client";

import { useRef, useState } from "react";
import { useLanguage } from "./language-context";
import { useCampaignData, useUnsavedChanges } from "./persistence-context";
import { DocumentEditor } from "./persistent-documents";
import { Badge, Button, Icon, Panel } from "./ui";
import { createMutationAttempt, errorMessage } from "@/lib/persistence/client";
import {
  campaignFeedback,
  feedbackMaxCharacters,
  feedbackSend,
} from "@/lib/persistence/feedback-model";
import type { Mutation } from "@/lib/persistence/contracts";

export function PersistentDmChat() {
  const { t, language } = useLanguage();
  const { data, loading, error, refresh, mutate, campaignId } =
    useCampaignData();
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState(false);
  const attempt = useRef<Mutation | null>(null);
  const busy = useRef(false);
  useUnsavedChanges(body.length > 0);
  const send = async () => {
    if (busy.current || !body.trim()) return;
    busy.current = true;
    setSaving(true);
    setSaveError("");
    setSaved(false);
    try {
      attempt.current = createMutationAttempt(
        attempt.current,
        feedbackSend(campaignId, body),
      );
      await mutate(attempt.current);
      attempt.current = null;
      setBody("");
      setSaved(true);
    } catch (cause) {
      setSaveError(errorMessage(cause));
    } finally {
      busy.current = false;
      setSaving(false);
    }
  };
  const messages = campaignFeedback(campaignId, data?.feedback ?? []);
  const guide = data?.documents.find(
    (document) =>
      document.id === data.dmGuideDocumentId &&
      document.campaign_id === campaignId,
  );
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
            "DM replies and application of these preferences arrive in Phase 2.",
          )}
        </p>
      </div>
      <p className="muted">
        {t(
          "Saving feedback does not advance time, roll dice, change HP, inventory, quests, relationships, or canon. Your Game OOC control remains separate.",
        )}
      </p>
      {loading && <p role="status">{t("Loading saved feedback…")}</p>}
      {error && (
        <Panel>
          <p role="alert">{t(error)}</p>
          <Button onClick={() => void refresh().catch(() => {})}>
            {t("Retry loading")}
          </Button>
        </Panel>
      )}
      {data && (
        <div className="settings-grid">
          <div>
            <Panel title={t("Your feedback")}>
              <div
                className="persistence-feedback-history"
                role="log"
                aria-label={t("Saved feedback messages")}
              >
                {!messages.length && (
                  <p className="muted">
                    {t(
                      "No feedback saved yet. Leave a note about how you want this campaign to be told.",
                    )}
                  </p>
                )}
                {messages.map((message) => (
                  <article className="player-reply panel" key={message.id}>
                    <div>
                      <h3>{t("Owner feedback")}</h3>
                      <time dateTime={message.created_at}>
                        {new Date(message.created_at).toLocaleString(language)}
                      </time>
                      <p className="persistence-document-body">
                        {message.body}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  void send();
                }}
              >
                <fieldset className="persistence-fields" disabled={saving}>
                  <label className="field">
                    {t("Feedback message")}
                    <textarea
                      rows={6}
                      maxLength={feedbackMaxCharacters}
                      value={body}
                      onChange={(event) => {
                        setBody(event.target.value);
                        setSaved(false);
                      }}
                      placeholder={t(
                        "What would you like to change about the way this campaign is told?",
                      )}
                    />
                  </label>
                  <p className="muted">
                    {t("{count} / {limit} characters", {
                      count: body.length,
                      limit: feedbackMaxCharacters,
                    })}
                  </p>
                  {saveError && <p role="alert">{t(saveError)}</p>}
                  <Button primary type="submit" disabled={!body.trim()}>
                    <Icon name="Send" />
                    {t(saving ? "Saving…" : "Save feedback")}
                  </Button>
                  <p role="status">
                    {t(
                      saving
                        ? "Saving feedback…"
                        : saved
                          ? "Feedback saved. No DM reply or gameplay change has been made."
                          : body
                            ? "Unsaved changes"
                            : "Your messages are saved only after you press Save feedback.",
                    )}
                  </p>
                </fieldset>
              </form>
            </Panel>
          </div>
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
      )}
    </>
  );
}
