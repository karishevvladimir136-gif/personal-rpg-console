"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { useLanguage } from "./language-context";
import { Icon, Panel } from "./ui";
import { itemIcon } from "@/lib/persistence/record-model";
import type {
  CampaignSnapshot,
  Entity,
  Item,
} from "@/lib/persistence/contracts";
import {
  acceptedItemArtwork,
  buildLiveInventoryView,
  EQUIPPED_FILTER,
  inventoryCategoryLabel,
} from "@/lib/live-inventory-view";
import styles from "./live-inventory-presentation.module.css";

export function LiveInventoryPresentation({
  data,
  storageId,
  onStorageChange,
  search,
  onSearchChange,
  category,
  onCategoryChange,
  onSelectItem,
  renderEquipment,
}: {
  data: CampaignSnapshot;
  storageId: string;
  onStorageChange: (id: string) => void;
  search: string;
  onSearchChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  onSelectItem: (item: Item) => void;
  renderEquipment?: (entity: Entity) => ReactNode;
}) {
  const { t, language } = useLanguage();
  const view = buildLiveInventoryView(data, storageId, search, category);
  const equipment = view.entity && renderEquipment?.(view.entity);

  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">{t("WHAT YOU CARRY")}</span>
          <h1>{t("Inventory")}</h1>
          <p>{t("Every possession has a place. A few have a story.")}</p>
        </div>
      </div>
      <div className="tabs" role="tablist" aria-label={t("Storage views")}>
        {view.tabs.map((tab) => {
          const active = view.storage?.kind === tab.kind;
          return (
            <button
              key={tab.kind}
              type="button"
              role="tab"
              aria-selected={active}
              className={active ? "active" : ""}
              onClick={() => {
                const next = view.storages.find((row) => row.kind === tab.kind);
                if (next) onStorageChange(next.id);
                onCategoryChange("");
              }}
            >
              {tab.kind === "merchant"
                ? language === "ru" ? "Другие хранилища" : tab.label
                : t(tab.label)}
            </button>
          );
        })}
      </div>
      {view.peerStorages.length > 1 && view.storage && (
        <label className="field companion-selector">
          {t("Inspect storage")}
          <select
            value={view.storage.id}
            onChange={(event) => {
              onStorageChange(event.target.value);
              onCategoryChange("");
            }}
          >
            {view.peerStorages.map((row) => (
              <option key={row.id} value={row.id}>{row.name}</option>
            ))}
          </select>
        </label>
      )}
      <div className={`storage-layout ${equipment ? "with-doll" : ""}`}>
        {equipment && <div className={styles.equipmentStage}>{equipment}</div>}
        <Panel
          className={`visual-inventory-panel ${styles.inventoryPanel}`}
          title={view.storage?.name || t("Inventory")}
        >
          {!view.storage ? (
            <p className="empty-state">
              {language === "ru" ? "Хранилищ пока нет." : "No storage yet."}
            </p>
          ) : (
            <>
              <input
                className="item-search"
                type="search"
                aria-label={t("Search inventory")}
                placeholder={t("Find an item…")}
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
              />
              <div className="filter-chips" role="group" aria-label={t("Item category filter")}>
                <button
                  type="button"
                  className={!category ? "active" : ""}
                  aria-pressed={!category}
                  onClick={() => onCategoryChange("")}
                >
                  {t("All")}
                </button>
                {view.storedItems.some((item) => item.equipped_entity_id) && (
                  <button
                    type="button"
                    className={category === EQUIPPED_FILTER ? "active" : ""}
                    aria-pressed={category === EQUIPPED_FILTER}
                    onClick={() => onCategoryChange(EQUIPPED_FILTER)}
                  >
                    {t("Equipped")}
                  </button>
                )}
                {view.categories.map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={category === value ? "active" : ""}
                    aria-pressed={category === value}
                    onClick={() => onCategoryChange(value)}
                  >
                    {t(inventoryCategoryLabel(value))}
                  </button>
                ))}
              </div>
              <div className="item-slot-grid">
                {view.items.map((item) => {
                  const artwork = acceptedItemArtwork(data, item);
                  const tooltipId = `live-item-${item.id}`;
                  return (
                    <div className="item-slot-wrap" key={item.id}>
                      <button
                        type="button"
                        className={`item-slot ${styles.itemSlot}`}
                        aria-label={t("Inspect {name}, quantity {count}, {status}", {
                          name: item.name,
                          count: item.quantity,
                          status: t(item.equipped_entity_id ? "Equipped" : "Stored"),
                        })}
                        aria-describedby={tooltipId}
                        onClick={() => onSelectItem(item)}
                      >
                        <span className="slot-quantity">
                          {item.quantity > 1 ? `×${item.quantity}` : ""}
                        </span>
                        {artwork ? (
                          <Image
                            unoptimized
                            src={artwork}
                            alt=""
                            width={76}
                            height={70}
                            className={styles.itemArtwork}
                          />
                        ) : (
                          <Icon name={itemIcon(item.category)} size={32} />
                        )}
                        <strong>{item.name}</strong>
                        <small>{item.equipped_entity_id ? t("Equipped") : t(inventoryCategoryLabel(item.category))}</small>
                      </button>
                      <span role="tooltip" id={tooltipId} className="item-tooltip">
                        <strong>{item.name}</strong>
                        {item.description || t("No description recorded.")}
                      </span>
                    </div>
                  );
                })}
              </div>
              {!view.items.length && (
                <div className="empty-state">
                  <Icon name="Package" size={28} />
                  <p>{t("No items match this storage and filter.")}</p>
                </div>
              )}
              <p className={`muted ${styles.gridHint}`}>
                {language === "ru"
                  ? "Наведите курсор или переведите фокус для краткого описания. Выберите предмет, чтобы узнать подробности."
                  : "Focus or hover for a short preview. Select an item for details."}
              </p>
            </>
          )}
        </Panel>
      </div>
    </>
  );
}
