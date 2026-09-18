"use client";
import { useLanguage } from "@/components/language-context";

import Link from "next/link";
import { useEffect, useReducer, useRef, useState } from "react";
import { clues } from "@/lib/mock-data";
import { Art, Badge, Button, Icon, Meter, Modal, Panel } from "./ui";
import { usePreview } from "./preview-context";
import { RestAction } from "./camp";
import { DicePreviewButton } from "./dice-preview";
import { CombatView } from "./combat-preview";
import { combatReducer, createCombatPreview } from "@/lib/combat-preview";

export function CharacterSummary() {
  const { t } = useLanguage();
  return (
    <>
      <div className="identity">
        <Art name="james" />
        <div>
          <h2>{t("James")}</h2>
          <p>{t("Human · Warlock (The Bound)")}</p>
          <em>{t("“Still here. That’s something.”")}</em>
        </div>
      </div>
      <Meter
        label={t("Level 3")}
        value={t("1,250 / 2,000 XP")}
        color="var(--gold)"
        percent={62.5}
      />
      <Meter label={t("HP")} value="24 / 24" color="var(--red)" />
      <Meter label={t("Pact slots")} value="2 / 2" color="var(--blue)" />
    </>
  );
}

export function Game() {
  const { t } = useLanguage();
  const { messages, addMessage, saved, setSaved, addNote, suggestions, href } =
    usePreview();
  const [combat, dispatchCombat] = useReducer(
    combatReducer,
    undefined,
    createCombatPreview,
  );
  const combatEntry = useRef<HTMLButtonElement>(null);
  const wasInCombat = useRef(false);
  useEffect(() => {
    if (combat.mode === "game" && wasInCombat.current)
      combatEntry.current?.focus();
    wasInCombat.current = combat.mode !== "game";
  }, [combat.mode]);
  const [draft, setDraft] = useState("");
  const [ooc, setOoc] = useState(false);
  const [dialog, setDialog] = useState("");
  const [note, setNote] = useState("");
  function send() {
    if (!draft.trim()) return;
    addMessage({ text: draft.trim(), ooc });
    setDraft("");
  }
  if (combat.mode !== "game")
    return <CombatView state={combat} dispatch={dispatchCombat} />;
  return (
    <>
      <div className="game-title">
        <div>
          <span className="eyebrow">{t("SESSION 04")}</span>
          <h1>{t("The Letter")}</h1>
        </div>
        <button
          type="button"
          className="button combat-entry"
          ref={combatEntry}
          onClick={() => dispatchCombat({ type: "enter" })}
        >
          <Icon name="Swords" />
          {t("Preview Combat")}
          <Badge>{t("Demo")}</Badge>
        </button>
        <RestAction />
        <Link href={href("sessions")} className="text-link">
          {t("Session recap")} <Icon name="ChevronRight" size={15} />
        </Link>
      </div>
      <div className="game-grid">
        <div className="story-column">
          <details className="mobile-stats panel">
            <summary>
              {t("James · Level 3")} <span>{t("♥ 24 / 24 · Pact 2 / 2")}</span>
            </summary>
            <CharacterSummary />
          </details>
          <article className="scene panel">
            <div className="scene-art">
              <Art
                name="city"
                label={t(
                  "A detective on a rain-soaked street in ruined New York",
                )}
              />
              <div className="scene-caption">
                <div>
                  <span className="eyebrow">{t("EAST COAST UNION")}</span>
                  <h2>{t("New York")}</h2>
                  <p>{t("Rain remembers everything.")}</p>
                </div>
                <span>{t("Rain · 12°C")}</span>
              </div>
            </div>
            <div className="narration">
              <div className="scene-kicker">
                <span className="eyebrow">{t("THE STORY SO FAR")}</span>
                <span>{t("April 3, 2025 · 22:14")}</span>
              </div>
              <p>
                {t(
                  "Rain hammers the cracked pavement as you step out of the subway. The air smells of wet metal and ozone. A folded envelope rests in your hand, the ink still fresh.",
                )}
              </p>
              <p>
                {t(
                  "Across the street, the old signage flickers. Somewhere in the darkness, a siren wails — or something that used to be one.",
                )}
              </p>
              <blockquote>
                <span>{t("Jinn")}</span> {t("“You sure you want to do this?”")}
              </blockquote>
              <div className="scene-actions">
                <Button primary onClick={() => setDialog("frame")}>
                  <Icon name="Image" />
                  <span>
                    {t("FRAME")}
                    <small>{t("Capture this moment")}</small>
                  </span>
                </Button>
                <Button primary onClick={() => setDialog("video")}>
                  <span className="play-symbol">▷</span>
                  <span>
                    {t("VIDEO")}
                    <small>{t("A cinematic view")}</small>
                  </span>
                </Button>
                <Button
                  label={t(saved ? "Unsave moment" : "Save moment")}
                  onClick={() => setSaved(!saved)}
                >
                  <Icon name={saved ? "Check" : "Bookmark"} />
                </Button>
              </div>
              {saved && (
                <p className="inline-notice">
                  {t("Moment saved to Gallery → Favorites for this preview.")}
                </p>
              )}
            </div>
          </article>
          <div className="player-reply panel">
            <Art name="james" />
            <div>
              <div className="reply-heading">
                <h3>{t("James")}</h3>
                <small>22:15</small>
              </div>
              <p>
                {t(
                  "I look around the street and check if anyone is following us.",
                )}
              </p>
            </div>
          </div>
          {messages.map((message, index) => (
            <div key={index} className="player-reply panel">
              <Art name="james" />
              <div>
                <h3>
                  {t("James")} <Badge>{t("Preview action")}</Badge>
                </h3>
                <p>
                  {message.ooc && <>{t("Out of character:")} </>}
                  {message.text}
                </p>
                <small>
                  {t(
                    "Your action is on the page. Story responses arrive in a later phase.",
                  )}
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
                aria-label={t("Your action")}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={
                  ooc
                    ? t("A question outside the story…")
                    : t("What do you do, James?")
                }
                rows={2}
                maxLength={3000}
              />
              <Button
                primary
                type="submit"
                disabled={!draft.trim()}
                label={t("Send action")}
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
                {t("OOC")} {t(ooc ? "On" : "Off")}
              </button>
              <DicePreviewButton compact />
              <button type="button" onClick={() => setDialog("note")}>
                <Icon name="BookOpen" size={14} /> {t("Take note")}
              </button>
              <button type="button" onClick={() => setDialog("knowledge")}>
                <Icon name="CircleHelp" size={14} /> {t("What do I know?")}
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
                    onClick={() => setDraft(t(text))}
                  >
                    {t(text)}
                  </button>
                ))}
              </div>
            )}
          </form>
        </div>
        <aside className="context-column">
          <Panel className="character-quick">
            <CharacterSummary />
            <Link className="text-link" href={href("character")}>
              {t("Character sheet")} <Icon name="ChevronRight" size={14} />
            </Link>
          </Panel>
          <Panel title={t("Current scene")}>
            <div className="location-mini">
              <Icon name="map" />
              <div>
                <h3>{t("New York")}</h3>
                <p>{t("The Letter · Nightfall")}</p>
              </div>
            </div>
            <Art name="city" className="location-image" />
            <em className="small-quote">
              {t("“Rain. Neon. Unfinished business.”")}
            </em>
          </Panel>
          <Panel title={t("Current objective")}>
            <div className="objective">
              <Icon name="Crosshair" size={26} />
              <p>
                {t("Investigate the letter")}
                <br />
                {t("and find its sender.")}
              </p>
            </div>
            <Link className="text-link" href={href("journal")}>
              {t("View in journal")} <Icon name="ArrowRight" size={14} />
            </Link>
          </Panel>
          <Panel
            title={t("Traveling together")}
            action={
              <Link href={href("party")} className="text-link">
                {t("View")}
              </Link>
            }
          >
            <div className="person-row">
              <Art name="james" />
              <span>{t("James")}</span>
              <small>{t("You")}</small>
            </div>
            <div className="person-row">
              <Art name="jinn" />
              <span>{t("Jinn")}</span>
              <small>{t("Long-term partner")}</small>
            </div>
          </Panel>
          <Panel
            title={t("Recent clues")}
            action={
              <Link href={href("journal")} className="text-link">
                {t("View all")}
              </Link>
            }
          >
            {clues.slice(0, 3).map((clue) => (
              <Link
                className="clue-row"
                href={href("journal")}
                key={clue.title}
              >
                <Art name={clue.art} />
                <div>
                  <h3>{t(clue.title)}</h3>
                  <small>{t(clue.type)}</small>
                </div>
                <Icon name="ChevronRight" size={13} />
              </Link>
            ))}
          </Panel>
          <p className="context-quote">
            {t("“The city is broken,")}
            <br />
            {t("but it’s still ours.”")}
          </p>
        </aside>
      </div>
      {dialog && (
        <Modal
          title={t(
            dialog === "frame"
              ? "New York · Scene frame"
              : dialog === "video"
                ? "A moment in motion"
                : dialog === "note"
                  ? "Take a note"
                  : "What James knows",
          )}
          onClose={() => setDialog("")}
        >
          {dialog === "frame" && (
            <>
              <Art name="city" className="modal-art" />
              <p>
                {t(
                  "This is the supplied sample scene artwork. New frame generation will be added in a later phase.",
                )}
              </p>
              <Button
                primary
                onClick={() => {
                  setSaved(true);
                  setDialog("");
                }}
              >
                {t("Save sample moment")}
              </Button>
            </>
          )}
          {dialog === "video" && (
            <>
              <Art name="city" className="modal-art" />
              <p>
                {t(
                  "Video generation is not connected in Phase 0. This scene is ready to preview as a still image.",
                )}
              </p>
              <Button onClick={() => setDialog("frame")}>
                {t("View scene frame")}
              </Button>
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
                {t("Your note")}
                <textarea
                  autoFocus
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  rows={5}
                  maxLength={2000}
                  placeholder={t("Something worth remembering…")}
                />
              </label>
              <p className="muted">
                {t("Available in Journal → Notes until you refresh.")}
              </p>
              <Button primary type="submit" disabled={!note.trim()}>
                {t("Add to journal")}
              </Button>
            </form>
          )}
          {dialog === "knowledge" && (
            <>
              <p className="muted">{t("Sample player-discovered notes")}</p>
              {clues.slice(0, 4).map((clue) => (
                <div className="knowledge-entry" key={clue.title}>
                  <h3>{t(clue.title)}</h3>
                  <p>{t(clue.description)}</p>
                </div>
              ))}
            </>
          )}
        </Modal>
      )}
    </>
  );
}
