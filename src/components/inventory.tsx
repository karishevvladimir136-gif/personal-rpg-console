"use client";
import { useState } from "react";
import { useLanguage } from "./language-context";
import { usePreview } from "./preview-context";
import { Art, Badge, Button, Icon, Modal, Panel } from "./ui";
import {
  entities,
  storages,
  slotProfiles,
  itemsInStorage,
  equipmentFor,
  canAccessStorage,
  transferPreview,
  type Entity,
  type InventoryItem,
} from "@/lib/inventory-model";

export function ItemDetails({
  item,
  onClose,
}: {
  item: InventoryItem;
  onClose: () => void;
}) {
  const { t, language } = useLanguage();
  const { campaign, camp } = usePreview();
  const [quantity, setQuantity] = useState(1);
  const [destination, setDestination] = useState(
    storages.find(
      (storage) =>
        storage.campaign_id === campaign.campaign_id &&
        storage.kind ===
          (item.storageId.endsWith(":stash") ? "player" : "stash"),
    )?.id || "",
  );
  const [notice, setNotice] = useState("");
  const [imageNotice, setImageNotice] = useState(false);
  const [demoArt, setDemoArt] = useState(false);
  const storage = storages.find(
    (entry) =>
      entry.campaign_id === campaign.campaign_id && entry.id === item.storageId,
  );
  const owner = entities.find(
    (entry) =>
      entry.campaign_id === campaign.campaign_id && entry.id === item.ownerId,
  );
  const error = transferPreview(
    campaign.campaign_id,
    item.id,
    destination,
    quantity,
    camp.active,
  );
  const accessible = canAccessStorage(
    campaign.campaign_id,
    item.storageId,
    camp.active,
  );
  return (
    <Modal title={t(item.name)} onClose={onClose} className="item-modal">
      <div
        className={`item-hero rarity-${item.rarity.toLowerCase()} ${demoArt ? "local-art-demo" : ""}`}
      >
        <Icon name={item.icon} size={68} />
        {demoArt && (
          <small>{t("Local illustration demo · not generated")}</small>
        )}
      </div>
      <div className="button-group">
        <Badge>{t(item.category)}</Badge>
        <Badge>{t(item.rarity)}</Badge>
        {item.equipped && <Badge green>{t("Equipped")}</Badge>}
      </div>
      <dl className="detail-list">
        <dt>{t("Quantity")}</dt>
        <dd>{item.quantity.toLocaleString(language)}</dd>
        <dt>{t("Storage")}</dt>
        <dd>{t(storage?.label || "Not recorded")}</dd>
        <dt>{t("Owner")}</dt>
        <dd>{t(owner?.name || "Not recorded")}</dd>
        <dt>{t("Acquired")}</dt>
        <dd>{t("Session {number}", { number: item.acquired })}</dd>
      </dl>
      <h3>{t("Known mechanical properties")}</h3>
      <p>{t(item.mechanics)}</p>
      <h3>{t("Flavor")}</h3>
      <p className="item-flavor">{t(item.detail)}</p>
      {item.history && (
        <details className="item-history">
          <summary>{t("Known history")}</summary>
          <p>{t(item.history)}</p>
        </details>
      )}
      <details className="transfer-panel">
        <summary>{t("Storage & use preview")}</summary>
        <p>
          {t(
            "Send accessible items to camp at any time. Inspect the stash anywhere; withdraw, use, or equip its contents only during active long-rest camp. Short rest does not unlock it.",
          )}
        </p>
        <div className="form-grid">
          <label className="field">
            {t("Destination")}
            <select
              value={destination}
              onChange={(event) => {
                setDestination(event.target.value);
                setNotice("");
              }}
            >
              {storages
                .filter(
                  (entry) =>
                    entry.campaign_id === campaign.campaign_id &&
                    entry.id !== item.storageId,
                )
                .map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {t(entry.label)}
                  </option>
                ))}
            </select>
          </label>
          <label className="field">
            {t("Quantity to preview")}
            <input
              type="number"
              min={1}
              max={item.quantity}
              step={1}
              value={quantity}
              onChange={(event) => {
                setQuantity(Number(event.target.value));
                setNotice("");
              }}
            />
          </label>
        </div>
        <p className="muted">
          {t("{item}: {source} → {destination} · {count}", {
            item: t(item.name),
            source: t(storage?.label || "Not recorded"),
            destination: t(
              storages.find((entry) => entry.id === destination)?.label ||
                "Not recorded",
            ),
            count: quantity,
          })}
        </p>
        {error && <p className="access-note">{t(error)}</p>}
        <Button
          disabled={!!error}
          onClick={() =>
            setNotice(
              "Simulated transfer only. Item quantity, ownership, storage, and equipment are unchanged.",
            )
          }
        >
          {t(
            destination.endsWith(":stash")
              ? "Preview send to camp"
              : "Preview transfer",
          )}
        </Button>
        <div className="button-group">
          <Button
            disabled={!accessible}
            onClick={() =>
              setNotice(
                "Simulated use only. No item was consumed and no resource changed.",
              )
            }
          >
            {t("Preview use")}
          </Button>
          <Button
            disabled={!accessible || !(item.equipped || item.compatibleSlot)}
            onClick={() =>
              setNotice(
                "Simulated equipment only. No slot or character statistic changed.",
              )
            }
          >
            {t("Preview equip")}
          </Button>
        </div>
        {!(item.equipped || item.compatibleSlot) && (
          <p className="muted">
            {t("No compatible equipment assignment is recorded for this item.")}
          </p>
        )}
        {notice && (
          <p role="status" className="preview-outcome">
            {t(notice)}
          </p>
        )}
      </details>
      <div className="item-image-actions">
        <Button onClick={() => setImageNotice(true)}>
          <Icon name="Image" />
          {t(demoArt ? "Regenerate image · demo" : "Generate image")}
        </Button>
        {demoArt && (
          <Button onClick={() => setDemoArt(false)}>
            {t("Restore default icon")}
          </Button>
        )}
      </div>
      {imageNotice && (
        <div className="preview-outcome" role="status">
          <p>
            {t(
              "Image generation is not connected. No request is sent and there is no charge. Future artwork will use your selected supported model and only known appearance; it will not change mechanics or canon.",
            )}
          </p>
          <Button
            onClick={() => {
              setDemoArt(true);
              setImageNotice(false);
            }}
          >
            {t("Show local illustration demo")}
          </Button>
        </div>
      )}
      <p className="muted">
        {t(
          "Sample inventory. All actions are previews; nothing is transferred, consumed, or generated.",
        )}
      </p>
    </Modal>
  );
}

export function ItemGrid({ items }: { items: InventoryItem[] }) {
  const { t } = useLanguage();
  const [selected, setSelected] = useState<InventoryItem | null>(null);
  return (
    <>
      <div className="item-slot-grid">
        {items.map((item) => (
          <div className="item-slot-wrap" key={item.id}>
            <button
              className={`item-slot rarity-${item.rarity.toLowerCase()}`}
              aria-label={t("Inspect {name}, quantity {count}, {status}", {
                name: t(item.name),
                count: item.quantity,
                status: t(item.equipped ? "Equipped" : "Stored"),
              })}
              aria-describedby={`${item.id}-preview`}
              onClick={() => setSelected(item)}
            >
              <span className="slot-quantity">
                {item.quantity > 1 ? `×${item.quantity}` : ""}
              </span>
              <Icon name={item.icon} size={32} />
              <strong>{t(item.name)}</strong>
              <small>{t(item.equipped ? "Equipped" : item.rarity)}</small>
            </button>
            <span
              role="tooltip"
              id={`${item.id}-preview`}
              className="item-tooltip"
            >
              <strong>{t(item.name)}</strong>
              {t(item.detail)}
            </span>
          </div>
        ))}
      </div>
      {!items.length && (
        <div className="empty-state">
          <Icon name="Package" size={28} />
          <p>{t("No items match this storage and filter.")}</p>
        </div>
      )}
      {selected && (
        <ItemDetails
          key={selected.id}
          item={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}

export function EquipmentDoll({ entity }: { entity: Entity }) {
  const { t } = useLanguage();
  const [selected, setSelected] = useState<InventoryItem | null>(null);
  const equipped = equipmentFor(entity.campaign_id, entity.id);
  const slots = slotProfiles[entity.profile] || [];
  return (
    <section
      className={`shared-doll ${entity.kind === "transport" ? "transport-doll" : ""}`}
      aria-label={t("{name} equipment", { name: t(entity.name) })}
    >
      <Art name={entity.art} className="doll-figure" />
      <div className="doll-caption">
        <h2>{t(entity.name)}</h2>
        <small>{t("Illustrative equipment")}</small>
      </div>
      {slots.length ? (
        <div className="shared-equipment-slots">
          {slots.map((slot) => {
            const item = equipped.find(
              (entry) => entry.equipped?.slot === slot.id,
            );
            return (
              <button
                key={slot.id}
                className={`shared-equipment-slot ${item ? "filled" : ""}`}
                aria-label={`${t(slot.label)}: ${t(item?.name || "Empty")}`}
                onClick={() => item && setSelected(item)}
                disabled={!item}
              >
                <Icon name={item?.icon || slot.icon} size={24} />
                <span>
                  {t(slot.label)}
                  <small>{t(item?.name || "Empty")}</small>
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <p className="no-equipment-note">
          {t(
            "No equipment slots are established for this companion. Belongings remain inspectable; humanoid anatomy is not assumed.",
          )}
        </p>
      )}
      {selected && (
        <ItemDetails
          key={selected.id}
          item={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </section>
  );
}

export function StorageInventory({
  storageId,
  showDoll = true,
}: {
  storageId: string;
  showDoll?: boolean;
}) {
  const { t, language } = useLanguage();
  const { campaign, camp } = usePreview();
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const storage = storages.find(
    (entry) =>
      entry.campaign_id === campaign.campaign_id && entry.id === storageId,
  );
  if (!storage) return <p>{t("Storage is unavailable for this campaign.")}</p>;
  const entity = entities.find(
    (entry) =>
      entry.campaign_id === campaign.campaign_id &&
      entry.id === storage.entityId,
  );
  const allItems = itemsInStorage(campaign.campaign_id, storage.id);
  const filtered = allItems.filter(
    (item) =>
      (category === "All" ||
        (category === "Equipped"
          ? !!item.equipped
          : item.category === category)) &&
      t(item.name)
        .toLocaleLowerCase(language)
        .includes(query.toLocaleLowerCase(language)),
  );
  return (
    <div className={`storage-layout ${showDoll && entity ? "with-doll" : ""}`}>
      {showDoll && entity && (
        <div>
          <EquipmentDoll entity={entity} />
          {entity.kind === "transport" && (
            <p className="access-note">{t(entity.description)}</p>
          )}
        </div>
      )}
      <Panel title={t(storage.label)} className="visual-inventory-panel">
        {storage.kind === "stash" && (
          <p className="access-note">
            {t(
              camp.active
                ? "Demo camp active: withdrawal, use, and equip previews are available until you leave or complete rest."
                : "Inspection is always available. Withdraw, use, and equip unlock only during active long-rest camp. Remote deposits from accessible inventories are allowed.",
            )}
          </p>
        )}
        {storage.kind === "transport" && (
          <p className="access-note">
            {t(
              "Cargo inspection is available; transfers require proximity. Entering camp does not bring the vehicle closer.",
            )}
          </p>
        )}
        <input
          className="item-search"
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
          ].map((value) => (
            <button
              key={value}
              aria-pressed={category === value}
              className={category === value ? "active" : ""}
              onClick={() => setCategory(value)}
            >
              {t(value)}
            </button>
          ))}
        </div>
        <ItemGrid items={filtered} />
        <p className="muted">
          {t(
            "Focus or hover for a short preview. Select an item for its details and history.",
          )}
        </p>
      </Panel>
    </div>
  );
}

export function InventoryScreen() {
  const { t } = useLanguage();
  const { campaign, inventoryStorage, setInventoryStorage } = usePreview();
  const available = storages.filter(
    (entry) => entry.campaign_id === campaign.campaign_id,
  );
  const current =
    available.find((entry) => entry.id === inventoryStorage) || available[0];
  const kinds = [
    { value: "player", label: "Player" },
    { value: "companion", label: "Companions" },
    { value: "stash", label: "Camp / Shared Stash" },
    { value: "transport", label: "Transport & Mounts" },
  ].filter((kind) => available.some((entry) => entry.kind === kind.value));
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">{t("WHAT YOU CARRY")}</span>
          <h1>{t("Inventory")}</h1>
          <p>{t("Every possession has a place. A few have a story.")}</p>
        </div>
        <Badge>{t("Preview only")}</Badge>
      </div>
      <div className="tabs" aria-label={t("Storage views")}>
        {kinds.map((kind) => (
          <button
            key={kind.value}
            aria-pressed={current.kind === kind.value}
            className={current.kind === kind.value ? "active" : ""}
            onClick={() =>
              setInventoryStorage(
                available.find((entry) => entry.kind === kind.value)!.id,
              )
            }
          >
            {t(kind.label)}
          </button>
        ))}
      </div>
      {current.kind === "companion" && (
        <label className="field companion-selector">
          {t("Companion")}
          <select
            value={current.id}
            onChange={(event) => setInventoryStorage(event.target.value)}
          >
            {available
              .filter((entry) => entry.kind === "companion")
              .map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {t(
                    entities.find((entity) => entity.id === entry.entityId)!
                      .name,
                  )}
                </option>
              ))}
          </select>
        </label>
      )}
      <StorageInventory key={current.id} storageId={current.id} />
    </>
  );
}
