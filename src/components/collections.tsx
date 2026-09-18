"use client";
import { useLanguage } from "@/components/language-context";

import Link from "next/link";
import { useState } from "react";
import { campaignHref } from "@/lib/campaign-routing";
import { campaign, documents } from "@/lib/mock-data";
import { Art, Badge, Button, Icon, Modal, Panel, Tabs } from "./ui";
import { usePreview } from "./preview-context";

export function Campaigns() {
  const { t } = useLanguage();
  const [managementNotice, setManagementNotice] = useState("");
  const [query, setQuery] = useState("");
  const [dialog, setDialog] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [draftTitle, setDraftTitle] = useState("");
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">{t("YOUR STORIES, WAITING")}</span>
          <h1>{t("My Campaigns")}</h1>
          <p>{t("Worlds to explore. Stories to remember.")}</p>
        </div>
        <Button primary onClick={() => setDialog("new")}>
          {t("+ New campaign")}
        </Button>
      </div>
      <Link href="/" className="text-link">
        {t("Back to main menu")}
      </Link>
      <div className="campaign-toolbar">
        <span className="small-quote">
          {t("“Different worlds. Same stories.”")}
        </span>
        <input
          aria-label={t("Search campaigns")}
          placeholder={t("Search campaigns…")}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      {(!query ||
        `${t("The Long Road West")} ${t("James")} ${t("Jinn")} the long road west james jinn`
          .toLocaleLowerCase()
          .includes(query.toLocaleLowerCase())) && (
        <article className="featured-campaign panel">
          <div className="campaign-cover">
            <Art name="city" />
            <span className="cover-tag">{t("YOUR CURRENT STORY")}</span>
            <div className="cover-title">
              <span className="eyebrow">{t("POST-CONVERGENCE AMERICA")}</span>
              <h2>
                {t("The Long")}
                <br />
                {t("Road West")}
              </h2>
              <p>{t("Still human. Somehow.")}</p>
            </div>
          </div>
          <div className="campaign-info">
            <Badge green>{t("In progress")}</Badge>
            <h2>{t("The Long Road West")}</h2>
            <p className="genre">
              {t("Post-apocalyptic western · Modern fantasy")}
            </p>
            <p className="campaign-description">
              {t(
                "Across the ruins, people still search for a better tomorrow. Dust, danger, and hope on the long road west.",
              )}
            </p>
            <div className="campaign-meta">
              <span>
                <Icon name="sessions" />
                {t("Session 4 · The Letter")}
              </span>
              <span>
                <Icon name="map" />
                {t("New York")}
              </span>
              <span>
                <Icon name="Users" />
                {t("James & Jinn")}
              </span>
              <span>
                <Icon name="BookOpen" />
                {t("Last played April 3, 2025")}
              </span>
            </div>
            <div className="campaign-character">
              <Art name="james" />
              <div>
                <h3>{t("James")}</h3>
                <p>{t("Level 3 · Human · Warlock")}</p>
              </div>
            </div>
            <Link
              className="button primary continue-button"
              href={campaignHref(campaign.campaign_id, "game")}
            >
              {t("Continue the story")} <Icon name="ArrowRight" />
            </Link>
            <div className="campaign-links">
              <Button onClick={() => setDialog("manage")}>
                {t("Manage campaign")}
              </Button>
              <Link href={campaignHref(campaign.campaign_id, "library")}>
                {t("Campaign library")}
              </Link>
              <Link href={campaignHref(campaign.campaign_id, "sessions")}>
                {t("Previous sessions")}
              </Link>
            </div>
          </div>
        </article>
      )}
      {query &&
        !`${t("The Long Road West")} ${t("James")} ${t("Jinn")} the long road west james jinn`
          .toLocaleLowerCase()
          .includes(query.toLocaleLowerCase()) && (
          <div className="empty-state panel">
            <h2>{t("No campaigns found")}</h2>
            <p>{t("Try “James” or “The Long Road West”.")}</p>
            <Button onClick={() => setQuery("")}>{t("Clear search")}</Button>
          </div>
        )}
      <div className="section-heading">
        <h2>{t("Other worlds")}</h2>
        <span>{t("Visual concepts · Not started")}</span>
      </div>
      <div className="other-campaigns">
        {[
          [
            "Ashes of the Moon",
            "moon",
            "Dark fantasy · Gothic horror",
            "Ancient powers stir beneath a blood-red moon.",
          ],
          [
            "Void and Dust",
            "space",
            "Science fiction · Space opera",
            "A crew, a ship, and an uncaring galaxy.",
          ],
        ].map(([title, art, genre, text]) => (
          <button
            key={title}
            className="concept-card panel"
            onClick={() => setDialog(title)}
          >
            <Art name={art} />
            <div>
              <span className="eyebrow">{t("CAMPAIGN CONCEPT")}</span>
              <h2>{t(title)}</h2>
              <p>{t(genre)}</p>
              <small>{t(text)}</small>
            </div>
            <Icon name="ChevronRight" />
          </button>
        ))}
      </div>
      {draftTitle && (
        <Panel title={draftTitle}>
          <Badge>{t("Preview draft")}</Badge>
          <p>
            {t(
              "Your title is ready. Full campaign creation is part of the persistence phase.",
            )}
          </p>
        </Panel>
      )}
      {dialog && (
        <Modal
          title={t(
            dialog === "new"
              ? "A new story"
              : dialog === "manage"
                ? "Manage campaign"
                : dialog,
          )}
          onClose={() => setDialog("")}
        >
          {dialog === "manage" ? (
            <>
              <p>
                {t(
                  "Management preview only. These actions are not connected and will not change or export the campaign.",
                )}
              </p>
              <div className="button-group">
                {["Rename", "Duplicate", "Archive", "Export", "Delete"].map(
                  (action) => (
                    <Button
                      key={action}
                      onClick={() => setManagementNotice(action)}
                    >
                      {t(action)}
                    </Button>
                  ),
                )}
              </div>
              {managementNotice && (
                <p role="status">
                  {t("{action} is not connected in Phase 0.", {
                    action: t(managementNotice),
                  })}
                </p>
              )}
            </>
          ) : dialog === "new" ? (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                if (newTitle.trim()) {
                  setDraftTitle(newTitle.trim());
                  setNewTitle("");
                  setDialog("");
                }
              }}
            >
              <p>
                {t(
                  "Try a campaign title. This creates a temporary preview card, without starting or generating a story.",
                )}
              </p>
              <label className="field">
                {t("Campaign title")}
                <input
                  autoFocus
                  value={newTitle}
                  onChange={(event) => setNewTitle(event.target.value)}
                  placeholder={t("Every road starts with a name…")}
                  maxLength={80}
                />
              </label>
              <Button primary type="submit" disabled={!newTitle.trim()}>
                {t("Create preview card")}
              </Button>
            </form>
          ) : (
            <>
              <Art
                name={dialog === "Ashes of the Moon" ? "moon" : "space"}
                className="modal-art"
              />
              <p>
                {t(
                  "A glimpse of another world. This concept is not a playable campaign; James & Jinn is the connected Phase 0 sample.",
                )}
              </p>
              <Link
                className="button primary"
                href={campaignHref(campaign.campaign_id, "game")}
                onClick={() => setDialog("")}
              >
                {t("Open James & Jinn")}
              </Link>
            </>
          )}
        </Modal>
      )}
    </>
  );
}

export function Library() {
  const { t } = useLanguage();
  const [filter, setFilter] = useState("All documents");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<(typeof documents)[number] | null>(
    null,
  );
  const [notice, setNotice] = useState("");
  const [history, setHistory] = useState(false);
  const filtered = documents.filter(
    (doc) =>
      (filter === "All documents" || doc.status === filter) &&
      t(doc.title).toLocaleLowerCase().includes(query.toLocaleLowerCase()),
  );
  return (
    <>
      <div className="library-banner">
        <Art name="city" />
        <div>
          <span className="eyebrow">{t("THE LONG ROAD WEST")}</span>
          <h1>{t("Campaign Library")}</h1>
          <p>
            {t(
              "The lore, references, and words that hold this world together.",
            )}
          </p>
        </div>
      </div>
      <div className="page-heading compact">
        <Tabs
          options={["All documents", "Canon", "Reference", "Archived"]}
          value={filter}
          onChange={setFilter}
        />
        <div className="button-group">
          <Button onClick={() => setNotice("Upload documents")}>
            {t("↑ Upload")}
          </Button>
          <Button primary onClick={() => setNotice("New document")}>
            {t("+ New document")}
          </Button>
        </div>
      </div>
      <input
        className="library-search"
        aria-label={t("Search documents")}
        placeholder={t("Search your library…")}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      {["Canon", "Reference", "Archived"]
        .filter((status) => filtered.some((doc) => doc.status === status))
        .map((status) => (
          <Panel
            key={status}
            title={`${t(status)} (${filtered.filter((doc) => doc.status === status).length})`}
            action={
              <span className="muted">
                {t(
                  status === "Canon"
                    ? "The current truth of your campaign"
                    : status === "Reference"
                      ? "Supporting material"
                      : "Retained for history",
                )}
              </span>
            }
          >
            {filtered
              .filter((doc) => doc.status === status)
              .map((doc) => (
                <button
                  className="document-row"
                  key={doc.title}
                  onClick={() => {
                    setSelected(doc);
                    setHistory(false);
                  }}
                >
                  <Icon
                    name={status === "Canon" ? "BookOpen" : "FileText"}
                    size={24}
                  />
                  <div>
                    <h3>{t(doc.title)}</h3>
                    <small>
                      {t(
                        status === "Archived"
                          ? "Earlier concept · Not current canon"
                          : "Sample campaign document",
                      )}
                    </small>
                  </div>
                  <span>
                    {t("v")}
                    {doc.version}
                  </span>
                  <Icon name="ChevronRight" />
                </button>
              ))}
          </Panel>
        ))}
      {!filtered.length && (
        <div className="empty-state panel">
          <p>{t("No documents match your search.")}</p>
          <Button
            onClick={() => {
              setQuery("");
              setFilter("All documents");
            }}
          >
            {t("Clear filters")}
          </Button>
        </div>
      )}
      <p className="muted">
        {t(
          "Player-readable sample documents only. No DM-private material is included.",
        )}
      </p>
      {selected && (
        <Modal title={t(selected.title)} onClose={() => setSelected(null)}>
          <div className="button-group">
            <Badge>{t(selected.status)}</Badge>
            <Badge>
              {t("Version")} {selected.version}
            </Badge>
          </div>
          {history ? (
            <div className="prose">
              <h3>{t("Version history")}</h3>
              <p>
                {t("v")}
                {selected.version} {t("· Current sample version")}
              </p>
              <p className="muted">
                {t(
                  "Older document versions will be retained when document editing is connected. This preview contains one sample version.",
                )}
              </p>
            </div>
          ) : (
            <div className="prose">
              <p>{t(selected.body)}</p>
            </div>
          )}
          <Button onClick={() => setHistory(!history)}>
            {t(history ? "Read document" : "Version history")}
          </Button>
        </Modal>
      )}
      {notice && (
        <Modal title={t(notice)} onClose={() => setNotice("")}>
          <p>
            {t(
              "Document uploads and editing arrive with persistent storage in Phase 1. For now, select any sample document to read it and preview the version history.",
            )}
          </p>
        </Modal>
      )}
    </>
  );
}

const galleryItems = [
  { title: "Rain remembers everything", art: "city", category: "Frames" },
  { title: "The envelope", art: "letter", category: "Items" },
  { title: "The meeting", art: "meeting", category: "Frames" },
  { title: "Jinn’s warning", art: "jinn", category: "Characters" },
  { title: "A familiar mark", art: "symbol", category: "Items" },
  { title: "New York at nightfall", art: "city", category: "Locations" },
  { title: "James · The Bound", art: "figure", category: "Characters" },
  { title: "The road west", art: "coast", category: "Locations" },
];
export function Sessions({ galleryOnly = false }: { galleryOnly?: boolean }) {
  const { t } = useLanguage();
  const [tab, setTab] = useState("Session");
  const [selected, setSelected] = useState<
    (typeof galleryItems)[number] | null
  >(null);
  const { saved, setSaved, href } = usePreview();
  const shown =
    tab === "Favorites"
      ? saved
        ? [galleryItems[0]]
        : []
      : tab === "Session"
        ? galleryItems
        : galleryItems.filter((item) => item.category === tab);
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            {t("THE LONG ROAD WEST · SESSION 04")}
          </span>
          <h1>{t(galleryOnly ? "Gallery" : "Session Recap & Gallery")}</h1>
          <p>{t("Some moments stay with you.")}</p>
        </div>
        <Link className="button primary" href={href("game")}>
          {t("Resume story")} <Icon name="ArrowRight" size={16} />
        </Link>
      </div>
      {!galleryOnly && (
        <>
          <div className="recap-grid">
            <div className="session-poster">
              <Art name="city" />
              <div className="poster-title">
                <span>{t("THE LONG ROAD WEST")}</span>
                <p>{t("Session 4")}</p>
                <h2>{t("The Letter")}</h2>
              </div>
              <div className="poster-caption">
                <p>{t("April 3, 2025 · New York")}</p>
                <em>{t("“Every road starts with a question.”")}</em>
              </div>
            </div>
            <Panel
              title={t("Key moments")}
              action={<span className="muted">{t("4 moments")}</span>}
            >
              <div className="moment-list">
                {galleryItems.slice(1, 5).map((item, index) => (
                  <button
                    className="moment-card"
                    key={item.title}
                    onClick={() => setSelected(item)}
                  >
                    <Art name={item.art} />
                    <div>
                      <span className="eyebrow">0{index + 1}</span>
                      <h3>{t(item.title)}</h3>
                      <p>
                        {t(
                          [
                            "A mysterious letter arrives. No return address.",
                            "A shadow in the subway. A question unanswered.",
                            "You sure you want to do this?",
                            "A familiar mark. Different world. Same question.",
                          ][index],
                        )}
                      </p>
                    </div>
                    <Icon name="ChevronRight" />
                  </button>
                ))}
              </div>
            </Panel>
          </div>
          <div className="recap-notes">
            <Panel title={t("The story so far")}>
              <p>
                {t(
                  "An unsigned letter finds James in New York. The wax bears an unfamiliar triangle, and the message names a destination far to the west. Jinn’s hesitation makes the question harder to ignore.",
                )}
              </p>
              <p>{t("Outside the subway, the city waits in the rain.")}</p>
            </Panel>
            <Panel title={t("What changed")}>
              <ul className="change-list">
                <li>
                  <Icon name="Mail" />
                  {t("Acquired: the mysterious letter")}
                </li>
                <li>
                  <Icon name="map" />
                  {t("New lead: San Francisco")}
                </li>
                <li>
                  <Icon name="Users" />
                  {t("Jinn: close · Relationship unchanged")}
                </li>
                <li>
                  <Icon name="Shield" />
                  {t("HP 24 / 24 · Pact slots 2 / 2")}
                </li>
              </ul>
            </Panel>
            <Panel title={t("Where we left off")}>
              <Badge>{t("Resume point")}</Badge>
              <p>
                {t(
                  "James and Jinn stand outside the subway. James is checking the street for anyone following them.",
                )}
              </p>
              <Link className="text-link" href={href("game")}>
                {t("Continue from here")} <Icon name="ArrowRight" size={14} />
              </Link>
            </Panel>
          </div>
          <p className="muted">
            {t(
              "Illustrative recap of the current sample session. No session has been automatically ended or generated.",
            )}
          </p>
        </>
      )}
      <Tabs
        options={[
          "Session",
          "Frames",
          "Videos",
          "Characters",
          "Locations",
          "Items",
          "Favorites",
        ]}
        value={tab}
        onChange={setTab}
      />
      <div className="gallery-grid">
        {shown.map((item) => (
          <button
            className="gallery-card"
            key={item.title}
            onClick={() => setSelected(item)}
          >
            <Art name={item.art} />
            <span>
              <small>{t(item.category)}</small>
              {t(item.title)}
            </span>
          </button>
        ))}
      </div>
      {!shown.length && (
        <div className="empty-state panel">
          <Icon name={tab === "Videos" ? "Image" : "Bookmark"} size={32} />
          <h2>
            {t(
              tab === "Videos"
                ? "The moving pictures are still to come."
                : "A place for your favorite moments.",
            )}
          </h2>
          <p>
            {t(
              tab === "Videos"
                ? "Video generation is not connected in Phase 0."
                : "Use Save moment on the Game screen to add the sample scene here.",
            )}
          </p>
          <Link className="button" href={href("game")}>
            {t("Return to the story")}
          </Link>
        </div>
      )}
      {selected && (
        <Modal title={t(selected.title)} onClose={() => setSelected(null)}>
          <Art name={selected.art} className="lightbox-art" />
          <p className="muted">{t("Session 4 · Supplied sample artwork")}</p>
          {selected.art === "city" && (
            <Button primary onClick={() => setSaved(!saved)}>
              <Icon name={saved ? "Check" : "Bookmark"} />
              {t(saved ? "Remove from favorites" : "Save moment")}
            </Button>
          )}
        </Modal>
      )}
    </>
  );
}
