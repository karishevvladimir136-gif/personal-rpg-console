"use client";

import Image from "next/image";
import { useState } from "react";
import type { CampaignSnapshot, Entity, Item } from "@/lib/persistence/contracts";
import type { CharacterViewModel } from "@/lib/character-view-model";
import { itemIcon } from "@/lib/persistence/record-model";
import { EQUIPPED_FILTER, inventoryCategoryLabel } from "@/lib/live-inventory-view";
import { selectSubjectVisual } from "@/lib/visual-frame/subject-visual";
import { useLanguage } from "./language-context";
import { GenerateVisual } from "./visual-frame/generate-visual";
import { EquippedItemArt } from "./visual-frame/equipped-item-art";
import { Icon, Panel } from "./ui";
import styles from "./phase0-character.module.css";

export function CharacterEquipmentDoll({
  data,
  entity,
  model,
  onSelect,
  reviewOnly,
}: {
  data: CampaignSnapshot;
  entity: Entity;
  model: CharacterViewModel;
  onSelect: (item: Item) => void;
  reviewOnly: boolean;
}) {
  const { t, language } = useLanguage();
  const selection = selectSubjectVisual(
    data,
    { kind: "entity", id: entity.id },
    { acceptedOnly: true },
  );
  const portrait = selection?.image?.kind === "real"
    ? selection.image : null;
  return (
    <section
      className={`paper-doll ${styles.paperDoll}`}
      aria-label={t("{name} equipment", { name: entity.name })}
    >
      <div className={`art ${styles.portraitArt}`}>
        {portrait ? (
          <Image
            unoptimized
            src={portrait.url}
            alt={entity.name}
            width={820}
            height={1200}
            className={styles.portraitImage}
          />
        ) : (
          <div className={styles.portraitPlaceholder} role="img" aria-label={t("No portrait yet")}>
            <Icon name={model.sheet.mode === "narrative" ? "Sparkles" : "UserRound"} size={116} />
          </div>
        )}
      </div>
      {entity.equipment_slots.length ? (
        <div className={`equipment-slots ${styles.equipmentSlots}`}>
          {entity.equipment_slots.map((slot) => {
            const item = model.equipped.find((row) => row.equipped_slot === slot.id);
            return (
              <button
                key={slot.id}
                type="button"
                className={`equipment-slot ${styles.equipmentSlot}`}
                aria-label={`${slot.label}: ${item?.name || t("Empty")}`}
                onClick={() => item && onSelect(item)}
                disabled={!item}
              >
                <span>{slot.label}</span>
                <span className={`equipment-icon ${styles.equipmentIcon}`}>
                  <EquippedItemArt snapshot={data} item={item} className={styles.equipmentImage} />
                </span>
                <small>{item?.name || t("Empty")}</small>
              </button>
            );
          })}
        </div>
      ) : (
        <p className={styles.noEquipment}>{t("No equipment assigned yet.")}</p>
      )}
      {!reviewOnly && (
        <details className={styles.portraitAction}>
          <summary><Icon name="Image" size={14} />{portrait
            ? (language === "ru" ? "Создать новый портрет" : "Regenerate portrait")
            : (language === "ru" ? "Создать портрет" : "Generate portrait")}</summary>
          <GenerateVisual
            subject={{ kind: "entity", id: entity.id }}
            showArtwork={false}
            snapshot={data}
          />
        </details>
      )}
    </section>
  );
}

export function filterCharacterInventory(items: Item[], category: string, search: string, language: string): Item[] {
  const normalizedSearch = search.toLocaleLowerCase(language);
  return items.filter((item) =>
    (!category || (category === EQUIPPED_FILTER ? !!item.equipped_entity_id : item.category === category)) &&
    `${item.name} ${item.description}`.toLocaleLowerCase(language).includes(normalizedSearch),
  );
}

export function CharacterInventory({
  data,
  items,
  onSelect,
}: {
  data: CampaignSnapshot;
  items: Item[];
  onSelect: (item: Item) => void;
}) {
  const { t, language } = useLanguage();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const categories = [...new Set(items.map((item) => item.category))];
  const filtered = filterCharacterInventory(items, category, search, language);
  return (
    <Panel className={`visual-inventory-panel inventory-panel ${styles.inventoryPanel}`} title={t("Inventory")}>
      <input
        className="item-search"
        aria-label={t("Search inventory")}
        placeholder={t("Find an item…")}
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />
      <div className={`filter-chips ${styles.filterChips}`} role="group" aria-label={t("Item category filter")}>
        {["", EQUIPPED_FILTER, ...categories].map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={category === value}
            className={category === value ? "active" : ""}
            onClick={() => setCategory(value)}
          >
            {value === EQUIPPED_FILTER
              ? t("Equipped")
              : value
                ? inventoryCategoryLabel(value).toLocaleLowerCase(language) === t("Equipped").toLocaleLowerCase(language)
                  ? `${t("Category")}: ${t(inventoryCategoryLabel(value))}`
                  : t(inventoryCategoryLabel(value))
                : t("All")}
          </button>
        ))}
      </div>
      <div className="item-slot-grid">
        {filtered.map((item) => {
          const selection = selectSubjectVisual(
            data,
            { kind: "item", id: item.id },
            { acceptedOnly: true },
          );
          const art = selection?.image?.kind === "real"
            ? selection.image : null;
          return (
            <div className="item-slot-wrap" key={item.id}>
              <button
                type="button"
                className={`item-slot ${styles.itemSlot}`}
                onClick={() => onSelect(item)}
                aria-label={t("Inspect {name}, quantity {count}, {status}", {
                  name: item.name,
                  count: item.quantity,
                  status: t(item.equipped_entity_id ? "Equipped" : "Stored"),
                })}
                aria-describedby={`character-item-${item.id}`}
              >
                <span className="slot-quantity">{item.quantity > 1 ? `×${item.quantity}` : ""}</span>
                {art ? (
                  <Image unoptimized src={art.url} alt="" width={78} height={78} className={styles.itemImage} />
                ) : (
                  <Icon name={itemIcon(item.category)} size={32} />
                )}
                <strong>{item.name}</strong>
                <small>{item.equipped_entity_id ? t("Equipped") : t(inventoryCategoryLabel(item.category))}</small>
              </button>
              <span role="tooltip" id={`character-item-${item.id}`} className="item-tooltip">
                <strong>{item.name}</strong>
                {item.description || t("No description recorded.")}
              </span>
            </div>
          );
        })}
      </div>
      {!filtered.length && <p className={styles.emptyInventory}>{t("No items match this storage and filter.")}</p>}
    </Panel>
  );
}
