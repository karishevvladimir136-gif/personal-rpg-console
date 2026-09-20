"use client";
import { useState } from "react";
import type {
  FoundationLoopView,
  FoundationUiCommand,
} from "@/lib/foundation-loop/client-contracts";
import type {
  ItemPolicy,
  MerchantDefinition,
} from "@/lib/foundation-loop/contracts";
import {
  commerceInput,
  sameValue,
  type CommerceDraft,
} from "@/lib/foundation-loop-client";
import { useUnsavedChanges } from "../persistence-context";
import { Button } from "../ui";
import {
  NumberField,
  RowEditor,
  SelectField,
  TextField,
  Toggle,
} from "./fields";
import type { FoundationText } from "./text";
import styles from "./foundation-loop.module.css";

export type ApplyFoundation = (
  kind: FoundationUiCommand["kind"],
  input: unknown,
) => void;

export function CommerceSettings({
  view,
  c,
  apply,
}: {
  view: FoundationLoopView;
  c: FoundationText;
  apply: ApplyFoundation;
}) {
  const original = {
    currencies: view.owner.currencies,
    itemPolicies: view.owner.itemPolicies,
    merchants: view.owner.merchants,
  };
  const [draft, setDraft] = useState<CommerceDraft>(() =>
    structuredClone(original),
  );
  const [newItem, setNewItem] = useState("");
  const [newMerchant, setNewMerchant] = useState("");
  const dirty = !sameValue(original, draft);
  useUnsavedChanges(dirty);
  const editPolicy = (index: number, patch: Partial<ItemPolicy>) =>
    setDraft({
      ...draft,
      itemPolicies: draft.itemPolicies.map((row, i) =>
        i === index ? { ...row, ...patch } : row,
      ),
    });
  const editMerchant = (index: number, patch: Partial<MerchantDefinition>) =>
    setDraft({
      ...draft,
      merchants: draft.merchants.map((row, i) =>
        i === index ? { ...row, ...patch } : row,
      ),
    });
  const entities = view.owner.entities.filter(
    (e) =>
      e.kind === "npc" &&
      !draft.merchants.some((m) => m.entityId === e.id) &&
      view.owner.storages.some((s) => s.entityId === e.id),
  );
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        apply("commerce.configure", commerceInput(view, draft));
      }}
      className={styles.form}
    >
      <h3>{c.commerceSettings}</h3>
      <h4>{c.currencies}</h4>
      {!draft.currencies.length && <p className="muted">{c.noDefinitions}</p>}
      {draft.currencies.map((row, index) => (
        <RowEditor
          key={row.id}
          title={row.label || c.currency}
          remove={{
            label: c.remove,
            action: () =>
              setDraft({
                ...draft,
                currencies: draft.currencies.filter((_, i) => i !== index),
              }),
          }}
        >
          <div className={styles.grid}>
            <TextField
              label={c.label}
              value={row.label}
              onChange={(label) =>
                setDraft({
                  ...draft,
                  currencies: draft.currencies.map((v, i) =>
                    i === index ? { ...v, label } : v,
                  ),
                })
              }
            />
            <TextField
              label={c.resourceKey}
              value={row.resourceKey}
              maxLength={80}
              pattern="[a-z][a-z0-9_-]{0,79}"
              onChange={(resourceKey) =>
                setDraft({
                  ...draft,
                  currencies: draft.currencies.map((v, i) =>
                    i === index ? { ...v, resourceKey } : v,
                  ),
                })
              }
            />
          </div>
          <p className="muted">{c.resourceHelp}</p>
        </RowEditor>
      ))}
      <Button
        disabled={draft.currencies.length >= 32}
        onClick={() =>
          setDraft({
            ...draft,
            currencies: [
              ...draft.currencies,
              {
                id: crypto.randomUUID(),
                label: c.currency,
                resourceKey: "",
                version: 1,
              },
            ],
          })
        }
      >
        {c.add} · {c.currency}
      </Button>
      <h4>{c.policies}</h4>
      {draft.itemPolicies.map((row, index) => (
        <RowEditor
          key={row.itemId}
          title={
            view.owner.items.find((i) => i.id === row.itemId)?.name || c.item
          }
          remove={{
            label: c.remove,
            action: () =>
              setDraft({
                ...draft,
                itemPolicies: draft.itemPolicies.filter((_, i) => i !== index),
              }),
          }}
        >
          <div className={styles.grid}>
            <SelectField
              label={c.currency}
              value={row.currencyId}
              options={draft.currencies}
              onChange={(currencyId) => editPolicy(index, { currencyId })}
              placeholder={c.select}
            />
            <NumberField
              label={c.unitValue}
              value={row.unitValue}
              onChange={(unitValue) => editPolicy(index, { unitValue })}
            />
            <SelectField
              label={c.tradePolicy}
              value={row.trade}
              options={[
                { id: "allowed", label: c.allowed },
                { id: "restricted", label: c.restricted },
                { id: "quest", label: c.quest },
              ]}
              onChange={(trade) =>
                editPolicy(index, { trade: trade as ItemPolicy["trade"] })
              }
            />
            <SelectField
              label={c.origin}
              value={row.origin}
              options={[
                { id: "legitimate", label: c.legitimate },
                { id: "stolen", label: c.stolen },
              ]}
              onChange={(origin) =>
                editPolicy(index, { origin: origin as ItemPolicy["origin"] })
              }
            />
          </div>
        </RowEditor>
      ))}
      <div className={styles.addRow}>
        <SelectField
          required={false}
          label={c.item}
          value={newItem}
          placeholder={c.select}
          options={view.owner.items
            .filter((i) => !draft.itemPolicies.some((p) => p.itemId === i.id))
            .map((i) => ({ id: i.id, label: i.name }))}
          onChange={setNewItem}
        />
        <Button
          disabled={
            !newItem ||
            !draft.currencies.length ||
            draft.itemPolicies.length >= 512
          }
          onClick={() => {
            setDraft({
              ...draft,
              itemPolicies: [
                ...draft.itemPolicies,
                {
                  itemId: newItem,
                  version: 1,
                  currencyId: draft.currencies[0].id,
                  unitValue: 0,
                  trade: "allowed",
                  origin: "legitimate",
                  visibility: "public",
                },
              ],
            });
            setNewItem("");
          }}
        >
          {c.add} · {c.unitValue}
        </Button>
      </div>
      <h4>{c.merchants}</h4>
      {draft.merchants.map((row, index) => (
        <RowEditor
          key={row.actorId}
          title={row.label || c.merchant}
          remove={{
            label: c.remove,
            action: () =>
              setDraft({
                ...draft,
                merchants: draft.merchants.filter((_, i) => i !== index),
              }),
          }}
        >
          <div className={styles.grid}>
            <TextField
              label={c.label}
              value={row.label}
              onChange={(label) => editMerchant(index, { label })}
            />
            <SelectField
              label={c.stock}
              value={row.storageId}
              options={view.owner.storages
                .filter((s) => s.entityId === row.entityId)
                .map((s) => ({ id: s.id, label: s.name }))}
              onChange={(storageId) => editMerchant(index, { storageId })}
            />
            <NumberField
              label={c.buyPrice}
              value={row.buyBasisPoints / 100}
              max={500}
              step={0.01}
              onChange={(v) =>
                editMerchant(index, { buyBasisPoints: Math.round(v * 100) })
              }
            />
            <NumberField
              label={c.sellPrice}
              value={row.sellBasisPoints / 100}
              max={500}
              step={0.01}
              onChange={(v) =>
                editMerchant(index, { sellBasisPoints: Math.round(v * 100) })
              }
            />
            <NumberField
              label={c.haggleLimit}
              value={row.haggleLimitBasisPoints / 100}
              max={25}
              step={0.01}
              onChange={(v) =>
                editMerchant(index, {
                  haggleLimitBasisPoints: Math.round(v * 100),
                })
              }
            />
            {row.capacity !== null && (
              <NumberField
                label={c.capacity}
                value={row.capacity}
                onChange={(capacity) => editMerchant(index, { capacity })}
              />
            )}
          </div>
          <p className="muted">{c.priceHelp}</p>
          <Toggle
            label={c.unlimited}
            checked={row.capacity === null}
            onChange={(value) =>
              editMerchant(index, { capacity: value ? null : 0 })
            }
          />
          <Toggle
            label={c.available}
            checked={row.available}
            onChange={(available) => editMerchant(index, { available })}
          />
          <Toggle
            label={c.stolenAccepted}
            checked={row.acceptsStolen}
            onChange={(acceptsStolen) => editMerchant(index, { acceptsStolen })}
          />
          <Toggle
            label={c.usesFunds}
            checked={row.usesFunds}
            onChange={(usesFunds) => editMerchant(index, { usesFunds })}
          />
          <p>{c.currencies}</p>
          <div className={styles.checks}>
            {draft.currencies.map((currency) => (
              <Toggle
                key={currency.id}
                label={currency.label}
                checked={row.currencyIds.includes(currency.id)}
                onChange={(checked) =>
                  editMerchant(index, {
                    currencyIds: checked
                      ? [...row.currencyIds, currency.id]
                      : row.currencyIds.filter((id) => id !== currency.id),
                  })
                }
              />
            ))}
          </div>
        </RowEditor>
      ))}
      {entities.length > 0 ? (
        <div className={styles.addRow}>
          <SelectField
            required={false}
            label={c.entity}
            value={newMerchant}
            placeholder={c.select}
            options={entities.map((e) => ({ id: e.id, label: e.name }))}
            onChange={setNewMerchant}
          />
          <Button
            disabled={
              !newMerchant ||
              !draft.currencies.length ||
              draft.merchants.length >= 128
            }
            onClick={() => {
              const entity = entities.find((e) => e.id === newMerchant)!;
              const storage = view.owner.storages.find(
                (s) => s.entityId === newMerchant,
              )!;
              setDraft({
                ...draft,
                merchants: [
                  ...draft.merchants,
                  {
                    actorId: entity.id,
                    entityId: entity.id,
                    version: 1,
                    label: entity.name,
                    storageId: storage.id,
                    currencyIds: [draft.currencies[0].id],
                    available: true,
                    acceptsStolen: false,
                    usesFunds: true,
                    capacity: null,
                    buyBasisPoints: 5000,
                    sellBasisPoints: 10000,
                    haggleLimitBasisPoints: 0,
                  },
                ],
              });
              setNewMerchant("");
            }}
          >
            {c.add} · {c.merchant}
          </Button>
        </div>
      ) : (
        <p className="muted">{c.merchantSetup}</p>
      )}
      <Button type="submit" primary disabled={!dirty}>
        {c.saveCommerce}
      </Button>
    </form>
  );
}
