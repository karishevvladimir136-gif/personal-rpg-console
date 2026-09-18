"use client";
import { useLanguage } from "@/components/language-context";

import { useState } from "react";
import type { Screen } from "@/lib/mock-data";
import { Game } from "./game";
import { Character } from "./character";
import { Journal, MapTravel, Party } from "./journal-map";
import { Campaigns, Library, Sessions } from "./collections";
import { Badge, Panel } from "./ui";
import { usePreview } from "./preview-context";
import { languageOptions } from "@/lib/i18n";
import { CampaignSettingsPanel } from "./campaign-settings";

function Settings() {
  const { t, language, setLanguage } = useLanguage();
  const { largeText, setLargeText, suggestions, setSuggestions } = usePreview();
  const [verbosity, setVerbosity] = useState("Literary");
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">{t("MAKE ROOM FOR YOUR STORY")}</span>
          <h1>{t("Settings")}</h1>
          <p>{t("A few quiet preferences for the road ahead.")}</p>
        </div>
        <Badge>{t("Preview settings")}</Badge>
      </div>
      <CampaignSettingsPanel />
      <h2 className="application-settings-heading">
        {t("Application preferences")}
      </h2>
      <div className="settings-grid">
        <div>
          <Panel title={t("General")}>
            <label className="field">
              {t("Interface Language")}
              <select
                value={language}
                onChange={(event) =>
                  setLanguage(event.target.value === "ru" ? "ru" : "en")
                }
              >
                {languageOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <p className="muted">
              {t(
                "Changes the interface and sample content across all screens. Your own writing stays as entered. Resets to English on refresh.",
              )}
            </p>
          </Panel>
          <Panel title={t("Reading & play")}>
            <div className="setting-row">
              <div>
                <h3>{t("Larger story text")}</h3>
                <p>{t("Give the narration a little more breathing room.")}</p>
              </div>
              <button
                role="switch"
                aria-checked={largeText}
                aria-label={t("Larger story text")}
                className={`toggle ${largeText ? "on" : ""}`}
                onClick={() => setLargeText(!largeText)}
              >
                <span />
              </button>
            </div>
            <div className="setting-row">
              <div>
                <h3>{t("Suggested actions")}</h3>
                <p>{t("Optional starting points beneath the Game input.")}</p>
              </div>
              <button
                role="switch"
                aria-checked={suggestions}
                aria-label={t("Suggested actions")}
                className={`toggle ${suggestions ? "on" : ""}`}
                onClick={() => setSuggestions(!suggestions)}
              >
                <span />
              </button>
            </div>
            <label className="field">
              {t("Narrative style")}
              <select
                value={verbosity}
                onChange={(event) => setVerbosity(event.target.value)}
              >
                <option value="Literary">{t("Literary")}</option>
                <option value="Concise">{t("Concise")}</option>
                <option value="Detailed">{t("Detailed")}</option>
              </select>
            </label>
            <p className="muted">
              {t(
                "Reading controls work in this preview. Narrative style is a sample preference for future narration.",
              )}
            </p>
          </Panel>
        </div>
        <div>
          <Panel title={t("About this preview")}>
            <Badge green>{t("Phase 0 · UI shell")}</Badge>
            <p>
              {t(
                "This is your private campaign console taking shape. Every story, item, document, and location here is sample data.",
              )}
            </p>
            <p>
              {t(
                "You can explore the screens, write preview actions and notes, choose a destination, and save a sample moment.",
              )}
            </p>
            <p>
              {t(
                "Changes last while you browse and reset when you refresh the page. No accounts or service keys are needed.",
              )}
            </p>
          </Panel>
          <Panel title={t("For a later chapter")}>
            <div className="future-row">
              <span>{t("Campaign saving & backups")}</span>
              <Badge>{t("Not connected")}</Badge>
            </div>
            <div className="future-row">
              <span>{t("AI storyteller & dice")}</span>
              <Badge>{t("Not connected")}</Badge>
            </div>
            <div className="future-row">
              <span>{t("Image & video generation")}</span>
              <Badge>{t("Not connected")}</Badge>
            </div>
            <p className="muted">
              {t(
                "No backend, authentication, or private DM data is included in this phase.",
              )}
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
