"use client";
import { useLanguage } from "@/components/language-context";

import { useState } from "react";
import { items } from "@/lib/mock-data";
import { Art, Badge, Button, Icon, Meter, Modal, Panel, Tabs } from "./ui";
import { usePreview } from "./preview-context";

export function Inventory({ compact = false }: { compact?: boolean }) {
  const { t, language } = useLanguage();
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<(typeof items)[number] | null>(null);
  const filtered = items.filter(
    (item) =>
      (category === "All" || item.category === category) &&
      t(item.name)
        .toLocaleLowerCase(language)
        .includes(query.toLocaleLowerCase(language)),
  );
  return (
    <Panel
      className="inventory-panel"
      title={t("Inventory")}
      action={<span className="muted">{t("1,250 credits")}</span>}
    >
      <div className="inventory-controls">
        <input
          aria-label={t("Search inventory")}
          placeholder={t("Find an item…")}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className="filter-chips">
          {[
            "All",
            "Equipped",
            "Weapons",
            "Ammunition",
            "Gear",
            "Consumables",
            "Quest Items",
            "Key Items",
            "Money",
            "Vehicle Storage",
          ].map((value) => (
            <button
              key={value}
              className={category === value ? "active" : ""}
              aria-pressed={category === value}
              onClick={() => setCategory(value)}
            >
              {t(value)}
            </button>
          ))}
        </div>
      </div>
      <div className="inventory-table">
        <div className="item-table-head">
          <span>{t("Item")}</span>
          <span>{t("Type")}</span>
          <span>{t("Qty")}</span>
        </div>
        {filtered.map((item) => (
          <button
            className="item-row"
            key={item.id}
            onClick={() => setSelected(item)}
          >
            <span className="item-name">
              <span className="item-icon">
                <Icon name={item.icon} size={23} />
              </span>
              {t(item.name)}
            </span>
            <span className="item-type">{t(item.category)}</span>
            <span>
              {item.quantity.toLocaleString(
                language === "ru" ? "ru-RU" : "en-US",
              )}
            </span>
          </button>
        ))}
        {!filtered.length && (
          <div className="empty-state">
            <p>{t("No items match this search.")}</p>
            <Button
              onClick={() => {
                setQuery("");
                setCategory("All");
              }}
            >
              {t("Clear filters")}
            </Button>
          </div>
        )}
      </div>
      {!compact && (
        <p className="muted inventory-hint">
          {t("Select an item to inspect its details, location, and history.")}
        </p>
      )}
      <div className="vehicle-storage">
        <div className="panel-heading">
          <h2>{t("Vehicle storage")}</h2>
          <Badge>{t("17 / 28 slots")}</Badge>
        </div>
        <div className="vehicle-row">
          <Art name="car" />
          <div>
            <h3>{t("Old Ford")}</h3>
            <p>{t("Modified · Still running")}</p>
            <Button
              onClick={() => {
                setCategory("Vehicle Storage");
                setQuery("");
              }}
            >
              {t("View storage")} <Icon name="ArrowRight" size={14} />
            </Button>
          </div>
        </div>
      </div>
      {selected && (
        <Modal title={t(selected.name)} onClose={() => setSelected(null)}>
          <div className="item-detail-icon">
            <Icon name={selected.icon} size={42} />
          </div>
          <Badge>{t(selected.category)}</Badge>
          <p>{t(selected.detail)}</p>
          <dl className="detail-list">
            <dt>{t("Quantity")}</dt>
            <dd>
              {selected.quantity.toLocaleString(
                language === "ru" ? "ru-RU" : "en-US",
              )}
            </dd>
            <dt>{t("Carried in")}</dt>
            <dd>{t(selected.storage)}</dd>
            <dt>{t("Acquired")}</dt>
            <dd>{t("Session {number}", { number: selected.acquired })}</dd>
            <dt>{t("Mechanics")}</dt>
            <dd>{t(selected.mechanics)}</dd>
          </dl>
          <p className="muted">
            {t(
              "Sample inventory. Editing and using items arrive with persistent campaign state.",
            )}
          </p>
        </Modal>
      )}
    </Panel>
  );
}

export function Character({
  inventoryOnly = false,
}: {
  inventoryOnly?: boolean;
}) {
  const { t } = useLanguage();
  const [tab, setTab] = useState("Character");
  const [equipment, setEquipment] = useState<string[]>([]);
  const { notes } = usePreview();
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
                <div className="paper-doll">
                  <Art
                    name="figure"
                    label={t("James in a weathered coat, hat, and boots")}
                  />
                  <div className="equipment-slots">
                    {[
                      ["Head", "Weathered hat", "UserRound"],
                      ["Neck", "Pact amulet", "Sparkles"],
                      ["Coat / Armor", "Weathered coat", "Shirt"],
                      ["Off hand", "Empty", "X"],
                      ["Main hand", "Custom revolver", "Crosshair"],
                      ["Legs", "Travel trousers", "Shield"],
                      ["Belt", "Ammunition belt", "Package"],
                      ["Boots", "Worn leather boots", "Shield"],
                    ].map(([slot, name, icon]) => (
                      <button
                        key={slot}
                        className="equipment-slot"
                        onClick={() => setEquipment([slot, name])}
                        aria-label={`${t(slot)}: ${t(name)}`}
                      >
                        <span>{t(slot)}</span>
                        <span className="equipment-icon">
                          <Icon name={icon} size={27} />
                        </span>
                        <small>{t(name)}</small>
                      </button>
                    ))}
                  </div>
                  <p>
                    {t("“Some truths are better left in the dark.")}
                    <br />
                    {t("But I carry them anyway.”")}
                  </p>
                </div>
              </Panel>
              <Inventory compact />
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
      {equipment.length > 0 && (
        <Modal
          title={equipment.map((tKey) => t(tKey)).join(" · ")}
          onClose={() => setEquipment([])}
        >
          <p>
            {t(
              equipment.includes("Empty")
                ? "Nothing equipped in this slot."
                : "Currently equipped by James. Select items in the inventory to read their details.",
            )}
          </p>
          <p className="muted">
            {t("Equipment changes will be available in a later phase.")}
          </p>
        </Modal>
      )}
    </>
  );
}
