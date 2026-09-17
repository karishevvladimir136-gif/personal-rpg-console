"use client";
import { useState } from "react";
import Link from "next/link";
import { clues, locations } from "@/lib/mock-data";
import { Art, Badge, Button, Icon, Modal, Panel, Tabs } from "./ui";
import { usePreview } from "./preview-context";
import { WorldMap } from "./world-map";

export function Party() {
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">THE PEOPLE BESIDE YOU</span>
          <h1>Party & Relationships</h1>
          <p>Trust is something you build along the road.</p>
        </div>
      </div>
      <div className="party-grid">
        {[
          [
            "James",
            "james",
            "You",
            "Human · Warlock · Level 3",
            "A private detective, 32. Still asking questions.",
          ],
          [
            "Jinn",
            "jinn",
            "Close",
            "Long-term partner",
            "A familiar presence in an unfamiliar world. He recognized something about the letter’s seal.",
          ],
          [
            "Goran",
            "meeting",
            "Friendly",
            "Known contact · Not traveling",
            "A source of useful road information. Last encountered in Chicago.",
          ],
        ].map(([name, art, relationship, role, description]) => (
          <Panel key={name} className="party-card">
            <Art name={art} />
            <div>
              <Badge green>{relationship}</Badge>
              <h2>{name}</h2>
              <p className="gold">{role}</p>
              <p>{description}</p>
            </div>
          </Panel>
        ))}
      </div>
      <p className="muted mt-6">
        Only player-known relationships are shown. All entries are sample
        campaign data.
      </p>
    </>
  );
}

export function Journal() {
  const [tab, setTab] = useState("Evidence");
  const [selected, setSelected] = useState<(typeof clues)[number] | null>(null);
  const [note, setNote] = useState("");
  const { notes, addNote } = usePreview();
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">FOLLOW THE THREAD</span>
          <h1>Journal</h1>
          <p>What you’ve seen. What you suspect. What comes next.</p>
        </div>
        <Badge>Session 4 · The Letter</Badge>
      </div>
      <Tabs
        options={[
          "Quests",
          "Timeline",
          "People",
          "Locations",
          "Evidence",
          "Notes",
        ]}
        value={tab}
        onChange={setTab}
      />
      {tab === "Evidence" && (
        <div className="journal-grid">
          <Panel className="evidence-panel">
            <div className="board-heading">
              <div>
                <h2>The Letter</h2>
                <p>Case board</p>
              </div>
              <em>“Every clue leads somewhere.”</em>
            </div>
            <div className="evidence-board">
              <svg
                className="evidence-threads"
                viewBox="0 0 900 650"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path d="M150 150L450 155L750 155L450 470L150 150 M450 155L450 470L150 490 M450 470L750 485 M750 155L150 490" />
              </svg>
              {clues.map((clue, index) => (
                <button
                  className={`evidence-card evidence-${index}`}
                  key={clue.title}
                  onClick={() => setSelected(clue)}
                >
                  <span className="pin" />
                  <Art name={clue.art} />
                  <h3>{clue.title}</h3>
                  <p>{clue.type}</p>
                </button>
              ))}
            </div>
            <div className="board-footer">
              <Icon name="CircleHelp" size={14} /> Illustrative connections ·
              Select a card to read the known facts
            </div>
          </Panel>
          <aside>
            <Panel
              title="Discovered clues"
              action={<span className="muted">6</span>}
            >
              {clues.map((clue) => (
                <button
                  className="clue-row"
                  key={clue.title}
                  onClick={() => setSelected(clue)}
                >
                  <Art name={clue.art} />
                  <div>
                    <h3>{clue.title}</h3>
                    <small>{clue.type}</small>
                  </div>
                  <Icon name="ChevronRight" size={14} />
                </button>
              ))}
            </Panel>
            <Panel title="Relationships">
              <div className="person-row">
                <Art name="jinn" />
                <span>Jinn</span>
                <Badge green>Close</Badge>
              </div>
              <div className="person-row">
                <Art name="meeting" />
                <span>Goran</span>
                <Badge green>Friendly</Badge>
              </div>
              <Link className="text-link" href="/party">
                All known people <Icon name="ArrowRight" size={14} />
              </Link>
            </Panel>
          </aside>
        </div>
      )}
      {tab === "Quests" && (
        <div className="card-grid">
          <Panel title="Find the sender">
            <Badge>Active · Main thread</Badge>
            <p>
              A letter found you in New York. Follow its references to the
              triangular seal and Convergence Labs.
            </p>
            <ul className="quest-checklist">
              <li>✓ Examine the envelope</li>
              <li>○ Ask Jinn about the symbol</li>
              <li>○ Follow the road west</li>
            </ul>
            <Button onClick={() => setTab("Evidence")}>
              Open case board <Icon name="ArrowRight" size={15} />
            </Button>
          </Panel>
          <Panel title="A road worth taking">
            <Badge>Ongoing</Badge>
            <p>Keep the Ford running. Find a safe route beyond the city.</p>
            <Link className="button" href="/map">
              Plan the route
            </Link>
          </Panel>
        </div>
      )}
      {tab === "Timeline" && (
        <Panel title="The road so far">
          <div className="timeline">
            {[
              [
                "Session 1",
                "A city between worlds",
                "James and Jinn leave the shelter of a familiar neighborhood.",
              ],
              [
                "Session 2",
                "A favor in Chicago",
                "Goran offers information on the roads west.",
              ],
              [
                "Session 3",
                "The way back",
                "With fresh supplies, James returns to New York to follow a contact.",
              ],
              [
                "Session 4",
                "The Letter",
                "An unsigned envelope points toward San Francisco.",
              ],
            ].map(([session, title, text]) => (
              <article key={session}>
                <span className="eyebrow">{session}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </Panel>
      )}
      {tab === "People" && <Party />}
      {tab === "Locations" && (
        <div className="card-grid">
          {locations.map((location) => (
            <Panel key={location.name}>
              <Art name={location.art} className="card-art" />
              <h2>{location.name}</h2>
              <Badge>{location.status}</Badge>
              <p>{location.description}</p>
              <Link href="/map" className="text-link">
                Open map <Icon name="ArrowRight" size={14} />
              </Link>
            </Panel>
          ))}
        </div>
      )}
      {tab === "Notes" && (
        <div className="notes-layout">
          <Panel title="Personal notes">
            {notes.map((text, index) => (
              <p className="note-card" key={index}>
                {text}
              </p>
            ))}
          </Panel>
          <Panel title="Something to remember">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                if (note.trim()) {
                  addNote(note.trim());
                  setNote("");
                }
              }}
            >
              <label className="field">
                New note
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  rows={6}
                  maxLength={2000}
                  placeholder="Follow the thought…"
                />
              </label>
              <Button primary type="submit" disabled={!note.trim()}>
                Add note
              </Button>
              <p className="muted">Preview notes reset on refresh.</p>
            </form>
          </Panel>
        </div>
      )}
      {selected && (
        <Modal title={selected.title} onClose={() => setSelected(null)}>
          <Art name={selected.art} className="modal-art" />
          <Badge>{selected.type}</Badge>
          <p>{selected.description}</p>
          <p className="muted">
            Recorded in Session 4 · Player-discovered sample information
          </p>
        </Modal>
      )}
    </>
  );
}

export function MapTravel() {
  const [tab, setTab] = useState("World");
  const [selected, setSelected] = useState(locations[0]);
  const { destination, setDestination } = usePreview();
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">REMNANTS. ROUTES. POSSIBILITIES.</span>
          <h1>Map & Travel</h1>
          <p>Explore a changed America. Find your next road.</p>
        </div>
      </div>
      <Panel className="map-panel">
        <div className="map-heading">
          <h2>
            {tab === "World"
              ? "The Joined America"
              : tab === "Region"
                ? "East Coast Union"
                : "New York · Subway District"}
          </h2>
          <Tabs
            options={["World", "Region", "Local"]}
            value={tab}
            onChange={setTab}
          />
        </div>
        <div className="map-layout">
          <div className={`map-canvas map-${tab.toLowerCase()}`}>
            {tab === "World" ? (
              <>
                <WorldMap />
                <svg
                  className="route-line"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path d="M84 35 Q73 29 62 28 T43 39 T12 46" />
                </svg>
                {locations.map((location) => (
                  <button
                    key={location.name}
                    className={`map-pin ${selected.name === location.name ? "selected" : ""} ${location.name === "New York" ? "current" : ""}`}
                    style={{ left: `${location.x}%`, top: `${location.y}%` }}
                    onClick={() => setSelected(location)}
                    aria-label={`Select ${location.name}`}
                  >
                    <span>◉</span>
                    <b>{location.name}</b>
                  </button>
                ))}
              </>
            ) : (
              <>
                <div className="schematic-grid" />
                <svg
                  className="district-roads"
                  viewBox="0 0 600 500"
                  aria-hidden="true"
                >
                  <path d="M0 130L600 330M80 0L480 500M0 390L600 160M440 0L170 500" />
                </svg>
                <span className="map-region-name">
                  {tab === "Region" ? "EAST COAST UNION" : "EAST RIVER"}
                </span>
                {(tab === "Region"
                  ? [
                      ["New York", 68, 44],
                      ["Western road", 24, 54],
                      ["River crossing", 45, 72],
                    ]
                  : [
                      ["Subway entrance · You", 35, 50],
                      ["Old bridge", 72, 31],
                      ["Market street", 60, 74],
                    ]
                ).map(([name, x, y]) => (
                  <div
                    className="map-pin schematic-pin"
                    key={name}
                    style={{ left: `${x}%`, top: `${y}%` }}
                  >
                    <span>◉</span>
                    <b>{name}</b>
                  </div>
                ))}
                <span className="schematic-label">
                  Illustrative {tab.toLowerCase()} view · Known places only
                </span>
              </>
            )}
            <div className="map-legend">
              <span>
                <i className="current-dot" />
                Current location
              </span>
              <span>
                <i />
                Known location
              </span>
              <span>┄ Sample route west</span>
            </div>
          </div>
          <div className="location-detail">
            <Art name={selected.art} />
            <div className="location-detail-body">
              <Badge green={selected.status !== "Known · Not visited"}>
                {selected.status}
              </Badge>
              <h2>{selected.name}</h2>
              <p className="gold">{selected.region}</p>
              <p>{selected.description}</p>
              <dl className="detail-list">
                <dt>Resources</dt>
                <dd>{selected.supplies}</dd>
                <dt>Travel</dt>
                <dd>
                  {selected.name === "New York"
                    ? "You are here"
                    : "Road conditions uncertain"}
                </dd>
              </dl>
              <Button
                primary
                disabled={selected.name === "New York"}
                onClick={() => setDestination(selected.name)}
              >
                <Icon name={destination === selected.name ? "Check" : "Send"} />
                {selected.name === "New York"
                  ? "Current location"
                  : destination === selected.name
                    ? "Destination selected"
                    : "Set destination"}
              </Button>
              {destination && (
                <p className="inline-notice" role="status">
                  Planned destination: {destination}. Preview only; no travel
                  has started.
                </p>
              )}
            </div>
          </div>
        </div>
      </Panel>
      <Panel
        title="Discovered locations"
        action={<span className="muted">4 known places</span>}
      >
        <div className="location-strip">
          {locations.map((location) => (
            <button
              className={`location-card ${selected.name === location.name ? "active" : ""}`}
              key={location.name}
              onClick={() => {
                setSelected(location);
                setTab("World");
              }}
            >
              <Art name={location.art} />
              <span>
                {location.name}
                <small>{location.region}</small>
              </span>
            </button>
          ))}
        </div>
      </Panel>
    </>
  );
}
