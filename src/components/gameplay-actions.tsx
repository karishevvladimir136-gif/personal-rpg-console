"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import type { Item, CampaignSnapshot } from "@/lib/persistence/contracts";
import type { MechanicChoice, PlaySnapshot } from "@/lib/gameplay/contracts";
import { useLanguage } from "./language-context";
import { useCampaignData } from "./persistence-context";
import { Button, Icon, Modal, Panel } from "./ui";
import { RecordSelect } from "./persistent-records";
import { GameplayComposer } from "./gameplay-composer";
import { useGameplayRuntime } from "./gameplay-runtime";

export function GameplayMechanicAction({
  play,
  choice,
  label,
  disabled,
  onSaved,
  children,
  worldLogicCombat = false,
}: {
  play: PlaySnapshot;
  choice: MechanicChoice;
  label: string;
  disabled?: boolean;
  onSaved: () => Promise<void>;
  children?: ReactNode;
  worldLogicCombat?: boolean;
}) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  if (play.rulesetId === "world-logic-v1" && !worldLogicCombat) return null;
  return (
    <>
      <Button
        disabled={disabled || !play.configuration}
        onClick={() => setOpen(true)}
      >
        {t(label)}
      </Button>
      {open && (
        <Modal title={t(label)} onClose={() => setOpen(false)}>
          {children}
          <p className="muted">
            {t(
              "The server checks availability, rules and costs before applying this action. Sending records a real campaign action.",
            )}
          </p>
          <GameplayComposer
            play={play}
            mode="mechanic"
            mechanic={choice}
            initialText={t(label)}
            onSaved={onSaved}
            compact
          />
        </Modal>
      )}
    </>
  );
}
export function GameplayCompanionTalk({ entityId }: { entityId: string }) {
  const { t } = useLanguage();
  const { data } = useCampaignData();
  const runtime = useGameplayRuntime();
  const [open, setOpen] = useState(false);
  const entity = data?.entities.find(
    (row) => row.id === entityId && row.kind === "companion",
  );
  if (!entity) return null;
  const available =
    runtime.play?.configuration?.presentEntityIds.includes(entityId);
  return (
    <>
      <Button disabled={!available} onClick={() => setOpen(true)}>
        <Icon name="MessageSquare" />
        {t("Talk")}
      </Button>
      {!available && (
        <small className="muted">
          {t("Companion must be present in the campaign's play configuration.")}
        </small>
      )}
      {open && runtime.play && (
        <Modal
          title={entity.name}
          onClose={() => setOpen(false)}
          className="gameplay-conversation-modal"
        >
          <p className="muted">
            {t(
              "This conversation uses the same DM and respects what this companion knows.",
            )}
          </p>
          <GameplayComposer
            play={runtime.play}
            mode="companion"
            companionId={entityId}
            onSaved={runtime.afterMutation}
          />
        </Modal>
      )}
    </>
  );
}
export function GameplayItemActions({ item }: { item: Item }) {
  const { t } = useLanguage();
  const { data } = useCampaignData();
  const runtime = useGameplayRuntime();
  const [actorId, setActor] = useState("");
  const [destination, setDestination] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [slot, setSlot] = useState("");
  if (!data || !runtime.play) return null;
  const play = runtime.play;
  const actors = data.entities.filter(
    (row) =>
      play.configuration?.controlledEntityIds.includes(row.id) &&
      play.configuration.presentEntityIds.includes(row.id),
  );
  const actor = actors.find((row) => row.id === actorId) ?? actors[0];
  const destinationRow = data.storages.find((row) => row.id === destination);
  const canUse =
    quantity === 1 &&
    item.quantity >= 1 &&
    play.configuration?.itemRules.some(
      (rule) => rule.itemId === item.id && rule.tag === "healing",
    );
  return (
    <details className="gameplay-item-actions">
      <summary>{t("Use, transfer or equip")}</summary>
      <p className="muted">
        {t(
          "Camp deposits may be remote. Withdrawing, using or equipping camp items requires an active long-rest camp. Cargo has its own proximity rules.",
        )}
      </p>
      <RecordSelect
        label={t("Acting character")}
        value={actor?.id ?? ""}
        onChange={setActor}
        options={actors.map((row) => ({ value: row.id, label: row.name }))}
        empty
      />
      <label className="field">
        {t("Quantity")}
        <input
          type="number"
          min={1}
          max={item.quantity}
          value={quantity}
          onChange={(event) => setQuantity(Number(event.target.value))}
        />
      </label>
      {actor && (
        <GameplayMechanicAction
          play={play}
          choice={{
            kind: "item.consume",
            actorId: actor.id,
            itemId: item.id,
            quantity,
          }}
          label={t("Use item")}
          disabled={!canUse}
          onSaved={runtime.afterMutation}
        >
          <p>
            {item.name} × {quantity}
          </p>
        </GameplayMechanicAction>
      )}
      {!canUse && (
        <p className="muted">
          {t(
            "Use supports one configured healing item at a time. Other quantities remain available for transfers.",
          )}
        </p>
      )}
      <RecordSelect
        label={t("Destination storage")}
        value={destination}
        onChange={setDestination}
        options={data.storages
          .filter((row) => row.id !== item.storage_id)
          .map((row) => ({ value: row.id, label: row.name }))}
        empty
      />
      {actor && (
        <GameplayMechanicAction
          play={play}
          choice={{
            kind: "item.transfer",
            actorId: actor.id,
            itemId: item.id,
            quantity,
            destinationStorageId: destination,
          }}
          label={t("Transfer item")}
          disabled={!destinationRow || quantity < 1 || quantity > item.quantity}
          onSaved={runtime.afterMutation}
        >
          <p>
            {item.name} × {quantity} → {destinationRow?.name}
          </p>
        </GameplayMechanicAction>
      )}
      <RecordSelect
        label={t("Equipment slot")}
        value={slot}
        onChange={setSlot}
        options={
          actor?.equipment_slots.map((row) => ({
            value: row.id,
            label: row.label,
          })) ?? []
        }
        empty
      />
      {actor && (
        <div className="button-group">
          <GameplayMechanicAction
            play={play}
            choice={{
              kind: "item.equip",
              actorId: actor.id,
              itemId: item.id,
              slot,
            }}
            label={t("Equip item")}
            disabled={!slot}
            onSaved={runtime.afterMutation}
          />
          {item.equipped_entity_id && (
            <GameplayMechanicAction
              play={play}
              choice={{
                kind: "item.equip",
                actorId: actor.id,
                itemId: item.id,
                slot: null,
              }}
              label={t("Unequip item")}
              onSaved={runtime.afterMutation}
            />
          )}
        </div>
      )}
    </details>
  );
}
function RestControls({
  data,
  play,
  onSaved,
}: {
  data: CampaignSnapshot;
  play: PlaySnapshot;
  onSaved: () => Promise<void>;
}) {
  const { t } = useLanguage();
  const [selected, setSelected] = useState<string[]>(
    () =>
      play.configuration?.controlledEntityIds.filter((id) =>
        play.configuration?.presentEntityIds.includes(id),
      ) ?? [],
  );
  const [supplies, setSupplies] = useState<Record<string, number>>({});
  const participants = data.entities.filter(
    (row) =>
      play.configuration?.controlledEntityIds.includes(row.id) &&
      play.configuration.presentEntityIds.includes(row.id),
  );
  const active = play.restRecords.find((row) => row.status === "planned");
  const activeParticipants =
    active && Array.isArray(active.public_outcome.participantIds)
      ? active.public_outcome.participantIds.filter(
          (id): id is string => typeof id === "string",
        )
      : [];
  const supplyItems = data.items.filter(
    (row) =>
      play.configuration?.itemRules.some(
        (rule) => rule.itemId === row.id && rule.tag === "supply",
      ) && row.quantity > 0,
  );
  const settings = data.settings.values;
  const restSettings = active
    ? (data.settingsHistory.find(
        (row) => row.revision === active.settings_revision,
      )?.values ??
      (data.settings.revision === active.settings_revision ? settings : null))
    : settings;
  const cost =
    active && restSettings
      ? (active.kind === "long"
          ? restSettings.difficulty.longRestSupplyCost
          : restSettings.difficulty.shortRestSupplyCost) *
        activeParticipants.length
      : 0;
  return (
    <Panel
      className="visual-inventory-panel gameplay-rest"
      title={t(
        active?.kind === "long"
          ? "Active long-rest camp"
          : active
            ? "Short rest in progress"
            : "Rest & Camp",
      )}
    >
      <p className="muted">
        {t(
          "Opening this screen grants no recovery or stash access. Enter, then explicitly complete or leave the rest.",
        )}
      </p>
      {!active ? (
        <>
          <fieldset className="gameplay-listeners">
            <legend>{t("Participants")}</legend>
            {participants.map((row) => (
              <label key={row.id}>
                <input
                  type="checkbox"
                  checked={selected.includes(row.id)}
                  onChange={(event) =>
                    setSelected(
                      event.target.checked
                        ? [...selected, row.id]
                        : selected.filter((id) => id !== row.id),
                    )
                  }
                />
                {row.name}
              </label>
            ))}
          </fieldset>
          <p>
            {t(
              "Short rest: 60 minutes. Long rest: 480 minutes. Recovery follows the selected house profile and campaign setting.",
            )}
          </p>
          <p>
            {t("Supplies per participant: short {short}, long {long}.", {
              short: settings.difficulty.shortRestSupplyCost,
              long: settings.difficulty.longRestSupplyCost,
            })}
          </p>
          <div className="button-group">
            <GameplayMechanicAction
              play={play}
              choice={{
                kind: "rest.enter",
                restKind: "short",
                participantIds: selected,
              }}
              label={t("Short Rest")}
              disabled={!selected.length}
              onSaved={onSaved}
            />
            <GameplayMechanicAction
              play={play}
              choice={{
                kind: "rest.enter",
                restKind: "long",
                participantIds: selected,
              }}
              label={t("Long Rest / Enter Camp")}
              disabled={!selected.length}
              onSaved={onSaved}
            />
          </div>
        </>
      ) : (
        <>
          {active.settings_revision !== data.settings.revision && (
            <p className="muted">
              {t(
                "This rest keeps the rules saved when it began. New settings apply to the next rest.",
              )}
            </p>
          )}
          <p>
            {activeParticipants
              .map((id) => data.entities.find((row) => row.id === id)?.name)
              .filter(Boolean)
              .join(", ")}
          </p>
          {restSettings ? (
            <p>{t("Required supplies: {count}", { count: cost })}</p>
          ) : (
            <p>
              {t(
                "Saved rest settings are unavailable here. The server will verify the original supply cost.",
              )}
            </p>
          )}
          {supplyItems.map((item) => (
            <label className="field" key={item.id}>
              {item.name} ({item.quantity}) ·{" "}
              {data.storages.find((row) => row.id === item.storage_id)?.name}
              <input
                type="number"
                min={0}
                max={item.quantity}
                value={supplies[item.id] ?? 0}
                onChange={(event) =>
                  setSupplies({
                    ...supplies,
                    [item.id]: Number(event.target.value),
                  })
                }
              />
            </label>
          ))}
          <div className="button-group">
            <GameplayMechanicAction
              play={play}
              choice={{
                kind: "rest.complete",
                restId: active.id,
                supplies: Object.entries(supplies)
                  .filter(([, quantity]) => quantity > 0)
                  .map(([itemId, quantity]) => ({ itemId, quantity })),
              }}
              label={
                active.kind === "long"
                  ? "Complete Long Rest"
                  : "Complete Short Rest"
              }
              onSaved={onSaved}
            >
              <p>
                {t(
                  "Recovery and supply costs commit together. No spell slots are automatically restored.",
                )}
              </p>
            </GameplayMechanicAction>
            <GameplayMechanicAction
              play={play}
              choice={{ kind: "rest.leave", restId: active.id }}
              label={t("Leave Camp / Cancel")}
              onSaved={onSaved}
            >
              <p>
                {t(
                  "Leaving grants no recovery. Completed transfers and conversations remain saved.",
                )}
              </p>
            </GameplayMechanicAction>
          </div>
        </>
      )}
    </Panel>
  );
}
function CookingControls({
  data,
  play,
  onSaved,
}: {
  data: CampaignSnapshot;
  play: PlaySnapshot;
  onSaved: () => Promise<void>;
}) {
  const { t } = useLanguage();
  const [actorId, setActor] = useState("");
  const [recipe, setRecipe] = useState<"meal" | "coffee">("meal");
  const [ingredientIds, setIngredients] = useState<Record<string, string>>({});
  const [storageId, setStorage] = useState("");
  const [servingId, setServing] = useState("");
  const [recipients, setRecipients] = useState<string[]>([]);
  const actors = data.entities.filter(
    (row) =>
      play.configuration?.controlledEntityIds.includes(row.id) &&
      play.configuration.presentEntityIds.includes(row.id),
  );
  const actor = actors.find((row) => row.id === actorId) ?? actors[0];
  const requiredTags = recipe === "meal" ? ["meat"] : ["coffee", "water"];
  const tagged = (tag: string) =>
    data.items.filter(
      (row) =>
        row.quantity > 0 &&
        play.configuration?.itemRules.some(
          (rule) => rule.itemId === row.id && rule.tag === tag,
        ),
    );
  const prepared = data.items.filter(
    (row) =>
      row.quantity > 0 &&
      play.configuration?.itemRules.some(
        (rule) =>
          rule.itemId === row.id &&
          ["meal-serving", "coffee-serving"].includes(rule.tag),
      ),
  );
  return (
    <Panel
      className="visual-inventory-panel"
      title={t("Cook / Prepare a drink")}
    >
      <p className="muted">
        {t(
          "Preparation consumes ingredients once. Serving is separate. One meal and one drink benefit per character; benefits never stack.",
        )}
      </p>
      <RecordSelect
        label={t("Acting character")}
        value={actor?.id ?? ""}
        options={actors.map((row) => ({ value: row.id, label: row.name }))}
        onChange={setActor}
        empty
      />
      <RecordSelect
        label={t("Recipe")}
        value={recipe}
        options={[
          { value: "meal", label: t("Meal") },
          { value: "coffee", label: t("Coffee") },
        ]}
        onChange={(value) => setRecipe(value as "meal" | "coffee")}
      />
      {requiredTags.map((tag) => (
        <RecordSelect
          key={tag}
          label={t(
            tag === "meat"
              ? "Meat ingredient"
              : tag === "coffee"
                ? "Coffee ingredient"
                : "Water ingredient",
          )}
          value={ingredientIds[tag] ?? ""}
          options={tagged(tag).map((row) => ({
            value: row.id,
            label: `${row.name} (${row.quantity})`,
          }))}
          onChange={(id) => setIngredients({ ...ingredientIds, [tag]: id })}
          empty
        />
      ))}
      <RecordSelect
        label={t("Prepared item storage")}
        value={storageId}
        options={data.storages.map((row) => ({
          value: row.id,
          label: row.name,
        }))}
        onChange={setStorage}
        empty
      />
      {actor && (
        <GameplayMechanicAction
          play={play}
          choice={{
            kind: "recipe.prepare",
            actorId: actor.id,
            recipe,
            ingredients: requiredTags.map((tag) => ({
              itemId: ingredientIds[tag] ?? "",
              quantity: 1,
            })),
            outputStorageId: storageId,
          }}
          label={t("Prepare")}
          disabled={
            !storageId || requiredTags.some((tag) => !ingredientIds[tag])
          }
          onSaved={onSaved}
        />
      )}
      <RecordSelect
        label={t("Prepared serving")}
        value={servingId}
        options={prepared.map((row) => ({
          value: row.id,
          label: `${row.name} (${row.quantity})`,
        }))}
        onChange={setServing}
        empty
      />
      <fieldset className="gameplay-listeners">
        <legend>{t("Recipients")}</legend>
        {actors.map((row) => (
          <label key={row.id}>
            <input
              type="checkbox"
              checked={recipients.includes(row.id)}
              onChange={(event) =>
                setRecipients(
                  event.target.checked
                    ? [...recipients, row.id]
                    : recipients.filter((id) => id !== row.id),
                )
              }
            />
            {row.name}
          </label>
        ))}
      </fieldset>
      {actor && (
        <GameplayMechanicAction
          play={play}
          choice={{
            kind: "recipe.serve",
            actorId: actor.id,
            itemId: servingId,
            recipientIds: recipients,
          }}
          label={t("Serve prepared item")}
          disabled={!servingId || !recipients.length}
          onSaved={onSaved}
        />
      )}
    </Panel>
  );
}
export function GameplayCamp() {
  const { t } = useLanguage();
  const { data, campaignId } = useCampaignData();
  const runtime = useGameplayRuntime();
  if (!data) return null;
  return (
    <div className="gameplay-camp">
      <div className="gameplay-camp-hearth" aria-hidden="true">
        <Icon name="Flame" size={58} />
      </div>
      {runtime.error && <p role="alert">{t(runtime.error)}</p>}
      {!runtime.play ? (
        <p role="status">{t("Loading saved gameplay…")}</p>
      ) : (
        <>
          <RestControls
            key={
              runtime.play.restRecords.find((row) => row.status === "planned")
                ?.id ?? "closed"
            }
            data={data}
            play={runtime.play}
            onSaved={runtime.afterMutation}
          />
          <Panel className="visual-inventory-panel" title={t("Party")}>
            <div className="card-grid">
              {data.entities
                .filter((row) => row.kind === "companion")
                .map((row) => (
                  <article key={row.id}>
                    <h3>{row.name}</h3>
                    <GameplayCompanionTalk entityId={row.id} />
                  </article>
                ))}
            </div>
          </Panel>
          <Link
            className="text-link"
            href={`/campaigns/${campaignId}/inventory`}
          >
            {t("Camp Stash")}
          </Link>
          {runtime.play.restRecords.some(
            (row) => row.status === "planned" && row.kind === "long",
          ) && (
            <CookingControls
              data={data}
              play={runtime.play}
              onSaved={runtime.afterMutation}
            />
          )}
        </>
      )}
    </div>
  );
}
export function GameplayRest({
  play,
  onSaved,
}: {
  play: PlaySnapshot;
  onSaved: () => Promise<void>;
}) {
  const { data } = useCampaignData();
  return data ? (
    <RestControls data={data} play={play} onSaved={onSaved} />
  ) : null;
}
