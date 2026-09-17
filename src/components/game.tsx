"use client";
import Link from "next/link";
import { useState } from "react";
import { clues } from "@/lib/mock-data";
import { Art, Badge, Button, Icon, Meter, Modal, Panel } from "./ui";
import { usePreview } from "./preview-context";

export function CharacterSummary() {
  return (
    <>
      <div className="identity">
        <Art name="james" />
        <div>
          <h2>James</h2>
          <p>Human · Warlock (The Bound)</p>
          <em>“Still here. That’s something.”</em>
        </div>
      </div>
      <Meter
        label="Level 3"
        value="1,250 / 2,000 XP"
        color="var(--gold)"
        percent={62.5}
      />
      <Meter label="HP" value="24 / 24" color="var(--red)" />
      <Meter label="Pact slots" value="2 / 2" color="var(--blue)" />
    </>
  );
}

export function Game() {
  const { messages, addMessage, saved, setSaved, addNote, suggestions } =
    usePreview();
  const [draft, setDraft] = useState("");
  const [ooc, setOoc] = useState(false);
  const [dialog, setDialog] = useState("");
  const [note, setNote] = useState("");
  function send() {
    if (!draft.trim()) return;
    addMessage(`${ooc ? "Out of character: " : ""}${draft.trim()}`);
    setDraft("");
  }
  return (
    <>
      <div className="game-title">
        <div>
          <span className="eyebrow">SESSION 04</span>
          <h1>The Letter</h1>
        </div>
        <Link href="/sessions" className="text-link">
          Session recap <Icon name="ChevronRight" size={15} />
        </Link>
      </div>
      <div className="game-grid">
        <div className="story-column">
          <details className="mobile-stats panel">
            <summary>
              James · Level 3 <span>♥ 24 / 24 · Pact 2 / 2</span>
            </summary>
            <CharacterSummary />
          </details>
          <article className="scene panel">
            <div className="scene-art">
              <Art
                name="city"
                label="A detective on a rain-soaked street in ruined New York"
              />
              <div className="scene-caption">
                <div>
                  <span className="eyebrow">EAST COAST UNION</span>
                  <h2>New York</h2>
                  <p>Rain remembers everything.</p>
                </div>
                <span>Rain · 12°C</span>
              </div>
            </div>
            <div className="narration">
              <div className="scene-kicker">
                <span className="eyebrow">THE STORY SO FAR</span>
                <span>April 3, 2025 · 22:14</span>
              </div>
              <p>
                Rain hammers the cracked pavement as you step out of the subway.
                The air smells of wet metal and ozone. A folded envelope rests
                in your hand, the ink still fresh.
              </p>
              <p>
                Across the street, the old signage flickers. Somewhere in the
                darkness, a siren wails — or something that used to be one.
              </p>
              <blockquote>
                <span>Jinn</span> “You sure you want to do this?”
              </blockquote>
              <div className="scene-actions">
                <Button primary onClick={() => setDialog("frame")}>
                  <Icon name="Image" />
                  <span>
                    FRAME<small>Capture this moment</small>
                  </span>
                </Button>
                <Button primary onClick={() => setDialog("video")}>
                  <span className="play-symbol">▷</span>
                  <span>
                    VIDEO<small>A cinematic view</small>
                  </span>
                </Button>
                <Button
                  label={saved ? "Unsave moment" : "Save moment"}
                  onClick={() => setSaved(!saved)}
                >
                  <Icon name={saved ? "Check" : "Bookmark"} />
                </Button>
              </div>
              {saved && (
                <p className="inline-notice">
                  Moment saved to Gallery → Favorites for this preview.
                </p>
              )}
            </div>
          </article>
          <div className="player-reply panel">
            <Art name="james" />
            <div>
              <div className="reply-heading">
                <h3>James</h3>
                <small>22:15</small>
              </div>
              <p>
                I look around the street and check if anyone is following us.
              </p>
            </div>
          </div>
          {messages.map((message, index) => (
            <div key={index} className="player-reply panel">
              <Art name="james" />
              <div>
                <h3>
                  James <Badge>Preview action</Badge>
                </h3>
                <p>{message}</p>
                <small>
                  Your action is on the page. Story responses arrive in a later
                  phase.
                </small>
              </div>
            </div>
          ))}
          <form
            className="composer panel"
            onSubmit={(event) => {
              event.preventDefault();
              send();
            }}
          >
            <div className="input-row">
              <textarea
                aria-label="Your action"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={
                  ooc
                    ? "A question outside the story…"
                    : "What do you do, James?"
                }
                rows={2}
                maxLength={3000}
              />
              <Button
                primary
                type="submit"
                disabled={!draft.trim()}
                label="Send action"
              >
                <Icon name="Send" size={21} />
              </Button>
            </div>
            <div className="composer-tools">
              <button
                type="button"
                aria-pressed={ooc}
                className={ooc ? "selected" : ""}
                onClick={() => setOoc(!ooc)}
              >
                OOC {ooc ? "On" : "Off"}
              </button>
              <button type="button" onClick={() => setDialog("dice")}>
                <Icon name="Swords" size={14} /> Roll dice
              </button>
              <button type="button" onClick={() => setDialog("note")}>
                <Icon name="BookOpen" size={14} /> Take note
              </button>
              <button type="button" onClick={() => setDialog("knowledge")}>
                <Icon name="CircleHelp" size={14} /> What do I know?
              </button>
            </div>
            {suggestions && (
              <div className="suggestions">
                {[
                  "Examine the envelope",
                  "Ask Jinn about the symbol",
                  "Check the subway entrance",
                ].map((text) => (
                  <button
                    type="button"
                    key={text}
                    onClick={() => setDraft(text)}
                  >
                    {text}
                  </button>
                ))}
              </div>
            )}
          </form>
        </div>
        <aside className="context-column">
          <Panel className="character-quick">
            <CharacterSummary />
            <Link className="text-link" href="/character">
              Character sheet <Icon name="ChevronRight" size={14} />
            </Link>
          </Panel>
          <Panel title="Current scene">
            <div className="location-mini">
              <Icon name="map" />
              <div>
                <h3>New York</h3>
                <p>The Letter · Nightfall</p>
              </div>
            </div>
            <Art name="city" className="location-image" />
            <em className="small-quote">“Rain. Neon. Unfinished business.”</em>
          </Panel>
          <Panel title="Current objective">
            <div className="objective">
              <Icon name="Crosshair" size={26} />
              <p>
                Investigate the letter
                <br />
                and find its sender.
              </p>
            </div>
            <Link className="text-link" href="/journal">
              View in journal <Icon name="ArrowRight" size={14} />
            </Link>
          </Panel>
          <Panel
            title="Traveling together"
            action={
              <Link href="/party" className="text-link">
                View
              </Link>
            }
          >
            <div className="person-row">
              <Art name="james" />
              <span>James</span>
              <small>You</small>
            </div>
            <div className="person-row">
              <Art name="jinn" />
              <span>Jinn</span>
              <small>Long-term partner</small>
            </div>
          </Panel>
          <Panel
            title="Recent clues"
            action={
              <Link href="/journal" className="text-link">
                View all
              </Link>
            }
          >
            {clues.slice(0, 3).map((clue) => (
              <Link className="clue-row" href="/journal" key={clue.title}>
                <Art name={clue.art} />
                <div>
                  <h3>{clue.title}</h3>
                  <small>{clue.type}</small>
                </div>
                <Icon name="ChevronRight" size={13} />
              </Link>
            ))}
          </Panel>
          <p className="context-quote">
            “The city is broken,
            <br />
            but it’s still ours.”
          </p>
        </aside>
      </div>
      {dialog && (
        <Modal
          title={
            dialog === "frame"
              ? "New York · Scene frame"
              : dialog === "video"
                ? "A moment in motion"
                : dialog === "dice"
                  ? "Roll dice"
                  : dialog === "note"
                    ? "Take a note"
                    : "What James knows"
          }
          onClose={() => setDialog("")}
        >
          {dialog === "frame" && (
            <>
              <Art name="city" className="modal-art" />
              <p>
                This is the supplied sample scene artwork. New frame generation
                will be added in a later phase.
              </p>
              <Button
                primary
                onClick={() => {
                  setSaved(true);
                  setDialog("");
                }}
              >
                Save sample moment
              </Button>
            </>
          )}
          {dialog === "video" && (
            <>
              <Art name="city" className="modal-art" />
              <p>
                Video generation is not connected in Phase 0. This scene is
                ready to preview as a still image.
              </p>
              <Button onClick={() => setDialog("frame")}>
                View scene frame
              </Button>
            </>
          )}
          {dialog === "dice" && (
            <>
              <p>
                Dice rolling will use a real server dice function in the
                playable phase. No dice results are invented in this preview.
              </p>
              <label className="field">
                Example roll
                <select>
                  <option>1d20 + 5 · Investigation</option>
                  <option>1d20 + 3 · Stealth</option>
                  <option>1d10 · Revolver damage</option>
                </select>
              </label>
              <p className="muted">Rolling is unavailable in Phase 0.</p>
            </>
          )}
          {dialog === "note" && (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                if (note.trim()) {
                  addNote(note.trim());
                  setNote("");
                  setDialog("");
                }
              }}
            >
              <label className="field">
                Your note
                <textarea
                  autoFocus
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  rows={5}
                  maxLength={2000}
                  placeholder="Something worth remembering…"
                />
              </label>
              <p className="muted">
                Available in Journal → Notes until you refresh.
              </p>
              <Button primary type="submit" disabled={!note.trim()}>
                Add to journal
              </Button>
            </form>
          )}
          {dialog === "knowledge" && (
            <>
              <p className="muted">Sample player-discovered notes</p>
              {clues.slice(0, 4).map((clue) => (
                <div className="knowledge-entry" key={clue.title}>
                  <h3>{clue.title}</h3>
                  <p>{clue.description}</p>
                </div>
              ))}
            </>
          )}
        </Modal>
      )}
    </>
  );
}
