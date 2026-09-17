"use client";
import { useState } from "react";
import { items } from "@/lib/mock-data";
import { Art, Badge, Button, Icon, Meter, Modal, Panel, Tabs } from "./ui";
import { usePreview } from "./preview-context";

export function Inventory({ compact = false }: { compact?: boolean }) {
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<(typeof items)[number] | null>(null);
  const filtered = items.filter(
    (item) =>
      (category === "All" || item.category === category) &&
      item.name.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <Panel
      className="inventory-panel"
      title="Inventory"
      action={<span className="muted">1,250 credits</span>}
    >
      <div className="inventory-controls">
        <input
          aria-label="Search inventory"
          placeholder="Find an item…"
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
              {value}
            </button>
          ))}
        </div>
      </div>
      <div className="inventory-table">
        <div className="item-table-head">
          <span>Item</span>
          <span>Type</span>
          <span>Qty</span>
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
              {item.name}
            </span>
            <span className="item-type">{item.category}</span>
            <span>{item.quantity.toLocaleString()}</span>
          </button>
        ))}
        {!filtered.length && (
          <div className="empty-state">
            <p>No items match this search.</p>
            <Button
              onClick={() => {
                setQuery("");
                setCategory("All");
              }}
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>
      {!compact && (
        <p className="muted inventory-hint">
          Select an item to inspect its details, location, and history.
        </p>
      )}
      <div className="vehicle-storage">
        <div className="panel-heading">
          <h2>Vehicle storage</h2>
          <Badge>17 / 28 slots</Badge>
        </div>
        <div className="vehicle-row">
          <Art name="car" />
          <div>
            <h3>Old Ford</h3>
            <p>Modified · Still running</p>
            <Button
              onClick={() => {
                setCategory("Vehicle Storage");
                setQuery("");
              }}
            >
              View storage <Icon name="ArrowRight" size={14} />
            </Button>
          </div>
        </div>
      </div>
      {selected && (
        <Modal title={selected.name} onClose={() => setSelected(null)}>
          <div className="item-detail-icon">
            <Icon name={selected.icon} size={42} />
          </div>
          <Badge>{selected.category}</Badge>
          <p>{selected.detail}</p>
          <dl className="detail-list">
            <dt>Quantity</dt>
            <dd>{selected.quantity.toLocaleString()}</dd>
            <dt>Carried in</dt>
            <dd>{selected.storage}</dd>
            <dt>Acquired</dt>
            <dd>Session {selected.acquired}</dd>
            <dt>Mechanics</dt>
            <dd>{selected.mechanics}</dd>
          </dl>
          <p className="muted">
            Sample inventory. Editing and using items arrive with persistent
            campaign state.
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
  const [tab, setTab] = useState("Character");
  const [equipment, setEquipment] = useState("");
  const { notes } = usePreview();
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">THE BOUND</span>
          <h1>{inventoryOnly ? "Inventory" : "Character & Inventory"}</h1>
          <p>A good coat, a loaded gun, and a few questions left to ask.</p>
        </div>
        <Badge>Level 3 · Human warlock</Badge>
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
                  <h2 className="character-name">James</h2>
                  <p>Human · Warlock (The Bound)</p>
                  <h3>Level 3</h3>
                  <Meter
                    label="Experience"
                    value="1,250 / 2,000"
                    percent={62.5}
                    color="var(--gold)"
                  />
                  <Meter label="HP" value="24 / 24" color="var(--red)" />
                  <Meter label="Pact slots" value="2 / 2" color="var(--blue)" />
                  <h3 className="section-label">Attributes</h3>
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
                        <dt>{stat}</dt>
                        <dd>
                          {score}
                          <span>({modifier})</span>
                        </dd>
                      </div>
                    ))}
                  </dl>
                  <div className="combat-stats">
                    <span>
                      AC <b>14</b>
                    </span>
                    <span>
                      Initiative <b>+2</b>
                    </span>
                    <span>
                      Speed <b>30 ft.</b>
                    </span>
                  </div>
                  <h3 className="section-label">Skills</h3>
                  <dl className="stats-list">
                    {[
                      ["Investigation", "+5"],
                      ["Persuasion", "+5"],
                      ["Intimidation", "+4"],
                      ["Arcana", "+4"],
                      ["Stealth", "+3"],
                    ].map(([name, value]) => (
                      <div key={name}>
                        <dt>{name}</dt>
                        <dd>{value}</dd>
                      </div>
                    ))}
                  </dl>
                  <h3 className="section-label">Conditions</h3>
                  <Badge green>None · Ready for the road</Badge>
                </div>
                <div className="paper-doll">
                  <Art
                    name="figure"
                    label="James in a weathered coat, hat, and boots"
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
                        onClick={() => setEquipment(`${slot} · ${name}`)}
                        aria-label={`${slot}: ${name}`}
                      >
                        <span>{slot}</span>
                        <span className="equipment-icon">
                          <Icon name={icon} size={27} />
                        </span>
                        <small>{name}</small>
                      </button>
                    ))}
                  </div>
                  <p>
                    “Some truths are better left in the dark.
                    <br />
                    But I carry them anyway.”
                  </p>
                </div>
              </Panel>
              <Inventory compact />
            </div>
          ) : (
            <Panel className="character-tab-content" title={tab}>
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
                      <h3>{name}</h3>
                      <p>{description}</p>
                      <Badge>Sample feature</Badge>
                    </article>
                  ))}
                </div>
              )}
              {tab === "Spells" && (
                <>
                  <Meter label="Pact slots" value="2 / 2" color="var(--blue)" />
                  <div className="card-grid">
                    {["Eldritch Blast", "Detect Magic", "Hex"].map(
                      (spell, index) => (
                        <article className="ability-card" key={spell}>
                          <Icon name="Zap" />
                          <h3>{spell}</h3>
                          <p>
                            {index === 0
                              ? "A focused flash of otherworldly force."
                              : index === 1
                                ? "Sense the presence of nearby magic."
                                : "Focus a lingering curse on a target."}
                          </p>
                          <Badge>
                            {index === 0 ? "Cantrip" : "Pact magic"}
                          </Badge>
                        </article>
                      ),
                    )}
                  </div>
                  <p className="muted">
                    Sample spell list. Casting becomes available with gameplay.
                  </p>
                </>
              )}
              {tab === "Background" && (
                <div className="prose">
                  <h3>Same man. Different worlds.</h3>
                  <p>
                    James is 32, a private detective in a world that no longer
                    plays by familiar rules. The Convergence changed the
                    skyline. It did not change his habit of asking one more
                    question.
                  </p>
                  <p>
                    Jinn is his long-term partner. Their history runs deeper
                    than this case. Together, they follow the roads between
                    surviving settlements, taking work where they can and
                    looking for answers where they must.
                  </p>
                  <p className="muted">
                    Illustrative Phase 0 background, not imported campaign
                    canon.
                  </p>
                </div>
              )}
              {tab === "Notes" && (
                <>
                  {notes.map((note, index) => (
                    <p className="note-card" key={index}>
                      {note}
                    </p>
                  ))}
                  <p className="muted">
                    Add notes from the Game or Journal screen.
                  </p>
                </>
              )}
            </Panel>
          )}
        </>
      )}
      {equipment && (
        <Modal title={equipment} onClose={() => setEquipment("")}>
          <p>
            {equipment.includes("Empty")
              ? "Nothing equipped in this slot."
              : "Currently equipped by James. Select items in the inventory to read their details."}
          </p>
          <p className="muted">
            Equipment changes will be available in a later phase.
          </p>
        </Modal>
      )}
    </>
  );
}
