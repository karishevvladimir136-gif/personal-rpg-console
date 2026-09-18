"use client";
import Link from "./preview-link";
import { useState } from "react";
import { entities, storages, type Entity } from "@/lib/inventory-model";
import { useLanguage } from "./language-context";
import { usePreview } from "./preview-context";
import { Art, Badge, Button, Icon, Modal, Panel } from "./ui";

export const conversationStarters = [
  "What do you think about what happened?",
  "Let’s discuss our next move.",
  "Tell me about yourself.",
];
export const foodStarters = [
  "What food reminds you of home?",
  "What do we know about the creatures along this road?",
  "Let’s talk about our recent discoveries.",
];
export function Conversation({
  entity,
  onClose,
  overFood = false,
}: {
  entity: Entity;
  onClose: () => void;
  overFood?: boolean;
}) {
  const { t } = useLanguage();
  const { campaign, conversations, addConversation } = usePreview();
  const [draft, setDraft] = useState("");
  if (
    !entity.available ||
    entity.campaign_id !== campaign.campaign_id ||
    entity.kind !== "companion"
  )
    return null;
  return (
    <Modal
      title={t("Talk with {name}", { name: t(entity.name) })}
      onClose={onClose}
      className="conversation-modal"
    >
      <div className="conversation-identity">
        <Art name={entity.art} />
        <div>
          <Badge green>{t(entity.relationship)}</Badge>
          <h3>{t(entity.name)}</h3>
          <p>{t("Player-known relationship · unchanged by this preview")}</p>
        </div>
      </div>
      <p className="access-note">
        {t(
          "Sample conversation. Your messages stay temporarily with this companion across Party and Camp. No AI replies or relationship changes are generated.",
        )}
      </p>
      <div
        className="conversation-history"
        aria-label={t("Conversation history")}
      >
        <div className="sample-exchange">
          <small>{t("Authored sample exchange")}</small>
          <p>
            <b>{t("James")}</b>
            {": "}
            {t("A quiet moment, at last.")}
          </p>
          <p>
            <b>{t(entity.name)}</b>
            {": "}
            {t("Then let’s make it count.")}
          </p>
        </div>
        {(conversations[entity.id] || []).map((message, index) => (
          <p className="temporary-message" key={index}>
            <small>{t("Your preview message")}</small>
            {message}
          </p>
        ))}
      </div>
      <div className="conversation-starters">
        {(overFood
          ? [...conversationStarters, ...foodStarters]
          : conversationStarters
        ).map((starter) => (
          <Button key={starter} onClick={() => setDraft(t(starter))}>
            {t(starter)}
          </Button>
        ))}
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (draft.trim()) {
            addConversation(entity.id, draft);
            setDraft("");
          }
        }}
      >
        <label className="field">
          {t("Say anything")}
          <textarea
            rows={3}
            maxLength={4000}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={t("What would you like to say?")}
          />
        </label>
        <Button primary type="submit" disabled={!draft.trim()}>
          <Icon name="Send" />
          {t("Add preview message")}
        </Button>
        <p className="muted" role="status">
          {t("No live response will be generated.")}
        </p>
      </form>
    </Modal>
  );
}

export function CompanionActions({
  entity,
  onTalk,
}: {
  entity: Entity;
  onTalk: () => void;
}) {
  const { t } = useLanguage();
  const { href, setInventoryStorage } = usePreview();
  const storage = storages.find(
    (entry) =>
      entry.campaign_id === entity.campaign_id && entry.entityId === entity.id,
  );
  return (
    <div className="button-group">
      <Button
        disabled={!entity.available || entity.kind !== "companion"}
        onClick={onTalk}
      >
        <Icon name="MessageSquare" />
        {t("Talk")}
      </Button>
      {entity.available && storage ? (
        <Link
          className="button"
          href={href("inventory")}
          onClick={() => setInventoryStorage(storage.id)}
        >
          <Icon name="inventory" />
          {t("Inventory")}
        </Link>
      ) : (
        <Button disabled>{t("Inventory unavailable")}</Button>
      )}
    </div>
  );
}

export function Party() {
  const { t } = useLanguage();
  const { campaign, href, setInventoryStorage } = usePreview();
  const [talk, setTalk] = useState<Entity | null>(null);
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">{t("THE PEOPLE BESIDE YOU")}</span>
          <h1>{t("Party & Relationships")}</h1>
          <p>{t("Trust is something you build along the road.")}</p>
        </div>
      </div>
      <div className="party-grid">
        {entities
          .filter(
            (entity) =>
              entity.campaign_id === campaign.campaign_id &&
              entity.kind !== "transport",
          )
          .map((entity) => (
            <Panel key={entity.id} className="party-card">
              <Art name={entity.kind === "player" ? "james" : entity.art} />
              <div>
                <Badge green>{t(entity.relationship)}</Badge>
                <h2>{t(entity.name)}</h2>
                <p>{t(entity.description)}</p>
                <p className="gold">
                  {t(
                    entity.available
                      ? "Available in this sample scene"
                      : "Known contact · Not traveling",
                  )}
                </p>
                {entity.kind === "player" ? (
                  <Link
                    className="button"
                    href={href("inventory")}
                    onClick={() =>
                      setInventoryStorage(`${campaign.campaign_id}:player`)
                    }
                  >
                    {t("Inventory")}
                  </Link>
                ) : (
                  <CompanionActions
                    entity={entity}
                    onTalk={() => setTalk(entity)}
                  />
                )}
              </div>
            </Panel>
          ))}
      </div>
      <p className="muted mt-6">
        {t(
          "Only player-known relationships are shown. All entries are sample campaign data.",
        )}
      </p>
      {talk && <Conversation entity={talk} onClose={() => setTalk(null)} />}
    </>
  );
}
