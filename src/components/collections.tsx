"use client";
import Link from "next/link";
import { useState } from "react";
import { documents } from "@/lib/mock-data";
import { Art, Badge, Button, Icon, Modal, Panel, Tabs } from "./ui";
import { usePreview } from "./preview-context";

export function Campaigns() {
  const [query, setQuery] = useState("");
  const [dialog, setDialog] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [draftTitle, setDraftTitle] = useState("");
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">YOUR STORIES, WAITING</span>
          <h1>My Campaigns</h1>
          <p>Worlds to explore. Stories to remember.</p>
        </div>
        <Button primary onClick={() => setDialog("new")}>
          + New campaign
        </Button>
      </div>
      <div className="campaign-toolbar">
        <span className="small-quote">“Different worlds. Same stories.”</span>
        <input
          aria-label="Search campaigns"
          placeholder="Search campaigns…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      {(!query ||
        "the long road west james jinn".includes(query.toLowerCase())) && (
        <article className="featured-campaign panel">
          <div className="campaign-cover">
            <Art name="city" />
            <span className="cover-tag">YOUR CURRENT STORY</span>
            <div className="cover-title">
              <span className="eyebrow">POST-CONVERGENCE AMERICA</span>
              <h2>
                The Long
                <br />
                Road West
              </h2>
              <p>Still human. Somehow.</p>
            </div>
          </div>
          <div className="campaign-info">
            <Badge green>In progress</Badge>
            <h2>The Long Road West</h2>
            <p className="genre">Post-apocalyptic western · Modern fantasy</p>
            <p className="campaign-description">
              Across the ruins, people still search for a better tomorrow. Dust,
              danger, and hope on the long road west.
            </p>
            <div className="campaign-meta">
              <span>
                <Icon name="sessions" />
                Session 4 · The Letter
              </span>
              <span>
                <Icon name="map" />
                New York
              </span>
              <span>
                <Icon name="Users" />
                James & Jinn
              </span>
              <span>
                <Icon name="BookOpen" />
                Last played April 3, 2025
              </span>
            </div>
            <div className="campaign-character">
              <Art name="james" />
              <div>
                <h3>James</h3>
                <p>Level 3 · Human · Warlock</p>
              </div>
            </div>
            <Link className="button primary continue-button" href="/game">
              Continue the story <Icon name="ArrowRight" />
            </Link>
            <div className="campaign-links">
              <Link href="/library">Campaign library</Link>
              <Link href="/sessions">Previous sessions</Link>
            </div>
          </div>
        </article>
      )}
      {query &&
        !"the long road west james jinn".includes(query.toLowerCase()) && (
          <div className="empty-state panel">
            <h2>No campaigns found</h2>
            <p>Try “James” or “The Long Road West”.</p>
            <Button onClick={() => setQuery("")}>Clear search</Button>
          </div>
        )}
      <div className="section-heading">
        <h2>Other worlds</h2>
        <span>Visual concepts · Not started</span>
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
              <span className="eyebrow">CAMPAIGN CONCEPT</span>
              <h2>{title}</h2>
              <p>{genre}</p>
              <small>{text}</small>
            </div>
            <Icon name="ChevronRight" />
          </button>
        ))}
      </div>
      {draftTitle && (
        <Panel title={draftTitle}>
          <Badge>Preview draft</Badge>
          <p>
            Your title is ready. Full campaign creation is part of the
            persistence phase.
          </p>
        </Panel>
      )}
      {dialog && (
        <Modal
          title={dialog === "new" ? "A new story" : dialog}
          onClose={() => setDialog("")}
        >
          {dialog === "new" ? (
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
                Try a campaign title. This creates a temporary preview card,
                without starting or generating a story.
              </p>
              <label className="field">
                Campaign title
                <input
                  autoFocus
                  value={newTitle}
                  onChange={(event) => setNewTitle(event.target.value)}
                  placeholder="Every road starts with a name…"
                  maxLength={80}
                />
              </label>
              <Button primary type="submit" disabled={!newTitle.trim()}>
                Create preview card
              </Button>
            </form>
          ) : (
            <>
              <Art
                name={dialog === "Ashes of the Moon" ? "moon" : "space"}
                className="modal-art"
              />
              <p>
                A glimpse of another world. This concept is not a playable
                campaign; James & Jinn is the connected Phase 0 sample.
              </p>
              <Link
                className="button primary"
                href="/game"
                onClick={() => setDialog("")}
              >
                Open James & Jinn
              </Link>
            </>
          )}
        </Modal>
      )}
    </>
  );
}

export function Library() {
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
      doc.title.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <div className="library-banner">
        <Art name="city" />
        <div>
          <span className="eyebrow">THE LONG ROAD WEST</span>
          <h1>Campaign Library</h1>
          <p>The lore, references, and words that hold this world together.</p>
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
            ↑ Upload
          </Button>
          <Button primary onClick={() => setNotice("New document")}>
            + New document
          </Button>
        </div>
      </div>
      <input
        className="library-search"
        aria-label="Search documents"
        placeholder="Search your library…"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      {["Canon", "Reference", "Archived"]
        .filter((status) => filtered.some((doc) => doc.status === status))
        .map((status) => (
          <Panel
            key={status}
            title={`${status} (${filtered.filter((doc) => doc.status === status).length})`}
            action={
              <span className="muted">
                {status === "Canon"
                  ? "The current truth of your campaign"
                  : status === "Reference"
                    ? "Supporting material"
                    : "Retained for history"}
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
                    <h3>{doc.title}</h3>
                    <small>
                      {status === "Archived"
                        ? "Earlier concept · Not current canon"
                        : "Sample campaign document"}
                    </small>
                  </div>
                  <span>v{doc.version}</span>
                  <Icon name="ChevronRight" />
                </button>
              ))}
          </Panel>
        ))}
      {!filtered.length && (
        <div className="empty-state panel">
          <p>No documents match your search.</p>
          <Button
            onClick={() => {
              setQuery("");
              setFilter("All documents");
            }}
          >
            Clear filters
          </Button>
        </div>
      )}
      <p className="muted">
        Player-readable sample documents only. No DM-private material is
        included.
      </p>
      {selected && (
        <Modal title={selected.title} onClose={() => setSelected(null)}>
          <div className="button-group">
            <Badge>{selected.status}</Badge>
            <Badge>Version {selected.version}</Badge>
          </div>
          {history ? (
            <div className="prose">
              <h3>Version history</h3>
              <p>v{selected.version} · Current sample version</p>
              <p className="muted">
                Older document versions will be retained when document editing
                is connected. This preview contains one sample version.
              </p>
            </div>
          ) : (
            <div className="prose">
              <p>{selected.body}</p>
            </div>
          )}
          <Button onClick={() => setHistory(!history)}>
            {history ? "Read document" : "Version history"}
          </Button>
        </Modal>
      )}
      {notice && (
        <Modal title={notice} onClose={() => setNotice("")}>
          <p>
            Document uploads and editing arrive with persistent storage in Phase
            1. For now, select any sample document to read it and preview the
            version history.
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
  const [tab, setTab] = useState("Session");
  const [selected, setSelected] = useState<
    (typeof galleryItems)[number] | null
  >(null);
  const { saved, setSaved } = usePreview();
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
          <span className="eyebrow">THE LONG ROAD WEST · SESSION 04</span>
          <h1>{galleryOnly ? "Gallery" : "Session Recap & Gallery"}</h1>
          <p>Some moments stay with you.</p>
        </div>
        <Link className="button primary" href="/game">
          Resume story <Icon name="ArrowRight" size={16} />
        </Link>
      </div>
      {!galleryOnly && (
        <>
          <div className="recap-grid">
            <div className="session-poster">
              <Art name="city" />
              <div className="poster-title">
                <span>THE LONG ROAD WEST</span>
                <p>Session 4</p>
                <h2>The Letter</h2>
              </div>
              <div className="poster-caption">
                <p>April 3, 2025 · New York</p>
                <em>“Every road starts with a question.”</em>
              </div>
            </div>
            <Panel
              title="Key moments"
              action={<span className="muted">4 moments</span>}
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
                      <h3>{item.title}</h3>
                      <p>
                        {
                          [
                            "A mysterious letter arrives. No return address.",
                            "A shadow in the subway. A question unanswered.",
                            "You sure you want to do this?",
                            "A familiar mark. Different world. Same question.",
                          ][index]
                        }
                      </p>
                    </div>
                    <Icon name="ChevronRight" />
                  </button>
                ))}
              </div>
            </Panel>
          </div>
          <div className="recap-notes">
            <Panel title="The story so far">
              <p>
                An unsigned letter finds James in New York. The wax bears an
                unfamiliar triangle, and the message names a destination far to
                the west. Jinn’s hesitation makes the question harder to ignore.
              </p>
              <p>Outside the subway, the city waits in the rain.</p>
            </Panel>
            <Panel title="What changed">
              <ul className="change-list">
                <li>
                  <Icon name="Mail" />
                  Acquired: the mysterious letter
                </li>
                <li>
                  <Icon name="map" />
                  New lead: San Francisco
                </li>
                <li>
                  <Icon name="Users" />
                  Jinn: close · Relationship unchanged
                </li>
                <li>
                  <Icon name="Shield" />
                  HP 24 / 24 · Pact slots 2 / 2
                </li>
              </ul>
            </Panel>
            <Panel title="Where we left off">
              <Badge>Resume point</Badge>
              <p>
                James and Jinn stand outside the subway. James is checking the
                street for anyone following them.
              </p>
              <Link className="text-link" href="/game">
                Continue from here <Icon name="ArrowRight" size={14} />
              </Link>
            </Panel>
          </div>
          <p className="muted">
            Illustrative recap of the current sample session. No session has
            been automatically ended or generated.
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
              <small>{item.category}</small>
              {item.title}
            </span>
          </button>
        ))}
      </div>
      {!shown.length && (
        <div className="empty-state panel">
          <Icon name={tab === "Videos" ? "Image" : "Bookmark"} size={32} />
          <h2>
            {tab === "Videos"
              ? "The moving pictures are still to come."
              : "A place for your favorite moments."}
          </h2>
          <p>
            {tab === "Videos"
              ? "Video generation is not connected in Phase 0."
              : "Use Save moment on the Game screen to add the sample scene here."}
          </p>
          <Link className="button" href="/game">
            Return to the story
          </Link>
        </div>
      )}
      {selected && (
        <Modal title={selected.title} onClose={() => setSelected(null)}>
          <Art name={selected.art} className="lightbox-art" />
          <p className="muted">Session 4 · Supplied sample artwork</p>
          {selected.art === "city" && (
            <Button primary onClick={() => setSaved(!saved)}>
              <Icon name={saved ? "Check" : "Bookmark"} />
              {saved ? "Remove from favorites" : "Save moment"}
            </Button>
          )}
        </Modal>
      )}
    </>
  );
}
