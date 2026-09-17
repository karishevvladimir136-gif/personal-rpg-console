"use client";
import { useState } from "react";
import type { Screen } from "@/lib/mock-data";
import { Game } from "./game";
import { Character } from "./character";
import { Journal, MapTravel, Party } from "./journal-map";
import { Campaigns, Library, Sessions } from "./collections";
import { Badge, Panel } from "./ui";
import { usePreview } from "./preview-context";

function Settings() {
  const { largeText, setLargeText, suggestions, setSuggestions } = usePreview();
  const [verbosity, setVerbosity] = useState("Literary");
  const [difficulty, setDifficulty] = useState("Story-focused");
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">MAKE ROOM FOR YOUR STORY</span>
          <h1>Settings</h1>
          <p>A few quiet preferences for the road ahead.</p>
        </div>
        <Badge>Preview settings</Badge>
      </div>
      <div className="settings-grid">
        <div>
          <Panel title="Reading & play">
            <div className="setting-row">
              <div>
                <h3>Larger story text</h3>
                <p>Give the narration a little more breathing room.</p>
              </div>
              <button
                role="switch"
                aria-checked={largeText}
                aria-label="Larger story text"
                className={`toggle ${largeText ? "on" : ""}`}
                onClick={() => setLargeText(!largeText)}
              >
                <span />
              </button>
            </div>
            <div className="setting-row">
              <div>
                <h3>Suggested actions</h3>
                <p>Optional starting points beneath the Game input.</p>
              </div>
              <button
                role="switch"
                aria-checked={suggestions}
                aria-label="Suggested actions"
                className={`toggle ${suggestions ? "on" : ""}`}
                onClick={() => setSuggestions(!suggestions)}
              >
                <span />
              </button>
            </div>
            <label className="field">
              Narrative style
              <select
                value={verbosity}
                onChange={(event) => setVerbosity(event.target.value)}
              >
                <option>Literary</option>
                <option>Concise</option>
                <option>Detailed</option>
              </select>
            </label>
            <label className="field">
              Difficulty
              <select
                value={difficulty}
                onChange={(event) => setDifficulty(event.target.value)}
              >
                <option>Story-focused</option>
                <option>Balanced</option>
                <option>Unforgiving</option>
              </select>
            </label>
            <p className="muted">
              Reading controls work in this preview. Narrative style and
              difficulty are sample preferences for future gameplay.
            </p>
          </Panel>
          <Panel title="Visual preferences">
            <label className="field">
              Campaign visual style
              <select defaultValue="Cinematic noir">
                <option>Cinematic noir</option>
                <option>Painterly western</option>
                <option>Dark fantasy</option>
              </select>
            </label>
            <div className="form-grid">
              <label className="field">
                Frame ratio
                <select defaultValue="16:9">
                  <option>16:9</option>
                  <option>4:3</option>
                  <option>1:1</option>
                </select>
              </label>
              <label className="field">
                Video duration
                <select defaultValue="10 seconds">
                  <option>5 seconds</option>
                  <option>10 seconds</option>
                  <option>15 seconds</option>
                </select>
              </label>
            </div>
            <p className="muted">
              Sample preferences only; media generation is not connected.
            </p>
          </Panel>
        </div>
        <div>
          <Panel title="About this preview">
            <Badge green>Phase 0 · UI shell</Badge>
            <p>
              This is your private campaign console taking shape. Every story,
              item, document, and location here is sample data.
            </p>
            <p>
              You can explore the screens, write preview actions and notes,
              choose a destination, and save a sample moment.
            </p>
            <p>
              Changes last while you browse and reset when you refresh the page.
              No accounts or service keys are needed.
            </p>
          </Panel>
          <Panel title="For a later chapter">
            <div className="future-row">
              <span>Campaign saving & backups</span>
              <Badge>Not connected</Badge>
            </div>
            <div className="future-row">
              <span>AI storyteller & dice</span>
              <Badge>Not connected</Badge>
            </div>
            <div className="future-row">
              <span>Image & video generation</span>
              <Badge>Not connected</Badge>
            </div>
            <p className="muted">
              No backend, authentication, or private DM data is included in this
              phase.
            </p>
          </Panel>
        </div>
      </div>
    </>
  );
}
export function ScreenView({ screen }: { screen: Screen }) {
  switch (screen) {
    case "campaigns":
      return <Campaigns />;
    case "game":
      return <Game />;
    case "character":
      return <Character />;
    case "inventory":
      return <Character inventoryOnly />;
    case "party":
      return <Party />;
    case "journal":
      return <Journal />;
    case "map":
      return <MapTravel />;
    case "library":
      return <Library />;
    case "sessions":
      return <Sessions />;
    case "gallery":
      return <Sessions galleryOnly />;
    case "settings":
      return <Settings />;
  }
}
