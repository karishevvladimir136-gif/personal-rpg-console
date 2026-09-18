"use client";
import { useLanguage } from "@/components/language-context";

import { useState } from "react";
import { entities } from "@/lib/inventory-model";
import { EquipmentDoll, StorageInventory } from "./inventory";
import { Badge, Icon, Meter, Panel, Tabs } from "./ui";
import { usePreview } from "./preview-context";

function Inventory() {
  const { campaign } = usePreview();
  return (
    <StorageInventory
      storageId={`${campaign.campaign_id}:player`}
      showDoll={false}
    />
  );
}

export function Character({
  inventoryOnly = false,
}: {
  inventoryOnly?: boolean;
}) {
  const { t } = useLanguage();
  const [tab, setTab] = useState("Character");
  const { notes, campaign } = usePreview();
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">{t("THE BOUND")}</span>
          <h1>{t(inventoryOnly ? "Inventory" : "Character & Inventory")}</h1>
          <p>
            {t("A good coat, a loaded gun, and a few questions left to ask.")}
          </p>
        </div>
        <Badge>{t("Level 3 · Human warlock")}</Badge>
      </div>
      {inventoryOnly ? (
        <div className="inventory-full">
          <Inventory />
        </div>
      ) : (
        <>
          <Tabs
            options={[
              "Character",
              "Abilities",
              "Spells",
              "Background",
              "Notes",
            ]}
            value={tab}
            onChange={setTab}
          />
          {tab === "Character" ? (
            <div className="character-grid">
              <Panel className="character-sheet">
                <div className="character-stats">
                  <h2 className="character-name">{t("James")}</h2>
                  <p>{t("Human · Warlock (The Bound)")}</p>
                  <h3>{t("Level 3")}</h3>
                  <Meter
                    label={t("Experience")}
                    value={t("1,250 / 2,000")}
                    percent={62.5}
                    color="var(--gold)"
                  />
                  <Meter label={t("HP")} value="24 / 24" color="var(--red)" />
                  <Meter
                    label={t("Pact slots")}
                    value="2 / 2"
                    color="var(--blue)"
                  />
                  <h3 className="section-label">{t("Attributes")}</h3>
                  <dl className="stats-list">
                    {[
                      ["STR", "12", "+1"],
                      ["DEX", "14", "+2"],
                      ["CON", "14", "+2"],
                      ["INT", "12", "+1"],
                      ["WIS", "12", "+1"],
                      ["CHA", "16", "+3"],
                    ].map(([stat, score, modifier]) => (
                      <div key={stat}>
                        <dt>{t(stat)}</dt>
                        <dd>
                          {score}
                          <span>({modifier})</span>
                        </dd>
                      </div>
                    ))}
                  </dl>
                  <div className="combat-stats">
                    <span>
                      {t("AC")} <b>14</b>
                    </span>
                    <span>
                      {t("Initiative")} <b>+2</b>
                    </span>
                    <span>
                      {t("Speed")} <b>{t("30 ft.")}</b>
                    </span>
                  </div>
                  <h3 className="section-label">{t("Skills")}</h3>
                  <dl className="stats-list">
                    {[
                      ["Investigation", "+5"],
                      ["Persuasion", "+5"],
                      ["Intimidation", "+4"],
                      ["Arcana", "+4"],
                      ["Stealth", "+3"],
                    ].map(([name, value]) => (
                      <div key={name}>
                        <dt>{t(name)}</dt>
                        <dd>{value}</dd>
                      </div>
                    ))}
                  </dl>
                  <h3 className="section-label">{t("Conditions")}</h3>
                  <Badge green>{t("None · Ready for the road")}</Badge>
                </div>
                <EquipmentDoll
                  entity={entities.find(
                    (entity) =>
                      entity.campaign_id === campaign.campaign_id &&
                      entity.kind === "player",
                  )!}
                />
              </Panel>
              <Inventory />
            </div>
          ) : (
            <Panel className="character-tab-content" title={t(tab)}>
              {tab === "Abilities" && (
                <div className="card-grid">
                  {[
                    [
                      "Pact of the Bound",
                      "A bond that survived the end of the familiar world. Jinn has been at James’s side for years.",
                    ],
                    [
                      "Dark Resilience",
                      "James has learned how to endure the strange pressures of a changed world.",
                    ],
                    [
                      "Otherworldly Awareness",
                      "Some things leave a trace that only the Bound can feel.",
                    ],
                  ].map(([name, description]) => (
                    <article className="ability-card" key={name}>
                      <Icon name="Sparkles" />
                      <h3>{t(name)}</h3>
                      <p>{t(description)}</p>
                      <Badge>{t("Sample feature")}</Badge>
                    </article>
                  ))}
                </div>
              )}
              {tab === "Spells" && (
                <>
                  <Meter
                    label={t("Pact slots")}
                    value="2 / 2"
                    color="var(--blue)"
                  />
                  <div className="card-grid">
                    {["Eldritch Blast", "Detect Magic", "Hex"].map(
                      (spell, index) => (
                        <article className="ability-card" key={spell}>
                          <Icon name="Zap" />
                          <h3>{t(spell)}</h3>
                          <p>
                            {t(
                              index === 0
                                ? "A focused flash of otherworldly force."
                                : index === 1
                                  ? "Sense the presence of nearby magic."
                                  : "Focus a lingering curse on a target.",
                            )}
                          </p>
                          <Badge>
                            {t(index === 0 ? "Cantrip" : "Pact magic")}
                          </Badge>
                        </article>
                      ),
                    )}
                  </div>
                  <p className="muted">
                    {t(
                      "Sample spell list. Casting becomes available with gameplay.",
                    )}
                  </p>
                </>
              )}
              {tab === "Background" && (
                <div className="prose">
                  <h3>{t("Same man. Different worlds.")}</h3>
                  <p>
                    {t(
                      "James is 32, a private detective in a world that no longer plays by familiar rules. The Convergence changed the skyline. It did not change his habit of asking one more question.",
                    )}
                  </p>
                  <p>
                    {t(
                      "Jinn is his long-term partner. Their history runs deeper than this case. Together, they follow the roads between surviving settlements, taking work where they can and looking for answers where they must.",
                    )}
                  </p>
                  <p className="muted">
                    {t(
                      "Illustrative Phase 0 background, not imported campaign canon.",
                    )}
                  </p>
                </div>
              )}
              {tab === "Notes" && (
                <>
                  <p className="note-card">
                    {t(
                      "Ask Jinn about the mark on the envelope when we’re somewhere quiet.",
                    )}
                  </p>
                  {notes.map((note, index) => (
                    <p className="note-card" key={index}>
                      {note}
                    </p>
                  ))}
                  <p className="muted">
                    {t("Add notes from the Game or Journal screen.")}
                  </p>
                </>
              )}
            </Panel>
          )}
        </>
      )}
    </>
  );
}
