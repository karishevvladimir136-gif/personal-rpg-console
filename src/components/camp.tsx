"use client";
import Link from "./preview-link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "./language-context";
import { usePreview } from "./preview-context";
import { Art, Badge, Button, Icon, Modal, Panel } from "./ui";
import { CompanionActions, Conversation } from "./companions";
import { StorageInventory } from "./inventory";
import { storages, type Entity } from "@/lib/inventory-model";
import {
  campScenarios,
  restParticipants,
  restCost,
  suppliesAt,
  recipes,
  recipeAvailability,
  type CampScenario,
} from "@/lib/camp-preview";
import { recoveryOptions } from "@/lib/campaign-settings";

function RestReview({
  kind,
  onConfirm,
}: {
  kind: "short" | "long";
  onConfirm: () => void;
}) {
  const { t } = useLanguage();
  const { campaign, campaignSettings, camp } = usePreview();
  const participants = restParticipants(campaign.campaign_id);
  const [selected, setSelected] = useState(
    participants.map((entity) => entity.id),
  );
  const [source, setSource] = useState(
    `${campaign.campaign_id}:${kind === "long" ? "stash" : "player"}`,
  );
  // Short rest never grants camp access, even if a rest preview is opened elsewhere.
  const active = kind === "long" && camp.active;
  const cost = restCost(campaignSettings, kind, selected);
  const available = suppliesAt(campaign.campaign_id, source, active);
  const recovery = recoveryOptions.find(
    (option) => option.value === campaignSettings.difficulty.recovery,
  )!.label;
  return (
    <div className="rest-review">
      <Badge>{t("Simulated rest · no gameplay effects")}</Badge>
      <p>
        {t(
          kind === "short"
            ? "Illustrative duration: 1 hour. No time advances in Phase 0."
            : "Illustrative duration: 8 hours. No time advances in Phase 0.",
        )}
      </p>
      <fieldset className="participant-picker">
        <legend>{t("Participants")}</legend>
        {participants.map((entity) => (
          <label key={entity.id}>
            <input
              type="checkbox"
              checked={selected.includes(entity.id)}
              onChange={() =>
                setSelected((previous) =>
                  previous.includes(entity.id)
                    ? previous.filter((id) => id !== entity.id)
                    : [...previous, entity.id],
                )
              }
            />
            {t(entity.name)}
          </label>
        ))}
      </fieldset>
      <h3>{t("Expected recovery")}</h3>
      <p>
        {t(
          "Recovery preference: {recovery}. Actual recovery will follow the selected rules system, edition, class features, and explicit house rules. This preview promises neither universal full healing nor restored spell slots.",
          { recovery: t(recovery) },
        )}
      </p>
      <dl className="detail-list">
        <dt>{t("Supply cost")}</dt>
        <dd>
          {cost === 0
            ? t("No cost")
            : t("{count} supply units total", { count: cost })}
        </dd>
        <dt>{t("Cost basis")}</dt>
        <dd>
          {t("{count} per participant", {
            count:
              campaignSettings.difficulty[
                kind === "short" ? "shortRestSupplyCost" : "longRestSupplyCost"
              ],
          })}
        </dd>
      </dl>
      <label className="field">
        {t("Supply source")}
        <select
          value={source}
          onChange={(event) => setSource(event.target.value)}
        >
          {storages
            .filter((storage) => storage.campaign_id === campaign.campaign_id)
            .map((storage) => (
              <option key={storage.id} value={storage.id}>
                {t("{source} · {count} accessible units", {
                  source: t(storage.label),
                  count: suppliesAt(campaign.campaign_id, storage.id, active),
                })}
              </option>
            ))}
        </select>
      </label>
      <p className="access-note">
        {t(
          kind === "short"
            ? "Short rest does not unlock camp-stash withdrawal. Vehicle cargo still requires proximity."
            : "Camp supplies may come from the stash during active long-rest camp. Recipe ingredients and servings are separate from rest supplies.",
        )}
      </p>
      <p className="muted">
        {t(
          "Known restrictions: a safe place and eligible participants are required. Hidden threats are not part of this client preview.",
        )}
      </p>
      {cost > available && (
        <p role="status">
          {t(
            "Insufficient accessible rest supplies. Choose another source or adjust the preview cost in Campaign Settings.",
          )}
        </p>
      )}
      <Button
        primary
        disabled={
          !selected.length ||
          cost > available ||
          (kind === "long" && !camp.active)
        }
        onClick={onConfirm}
      >
        {t(
          kind === "short"
            ? "Preview Short Rest"
            : "Complete Long Rest · preview",
        )}
      </Button>
      <p className="muted">
        {t(
          "Confirmation shows a simulated outcome only. No HP, spells, inventory, time, or history will change.",
        )}
      </p>
    </div>
  );
}

export function RestAction() {
  const { t } = useLanguage();
  const { href, camp } = usePreview();
  const [dialog, setDialog] = useState<"" | "choose" | "short" | "outcome">("");
  return (
    <>
      <Button onClick={() => setDialog("choose")}>
        <Icon name="Flame" />
        {t("Rest")}
      </Button>
      {dialog && (
        <Modal
          title={t(dialog === "short" ? "Short Rest" : "Rest preview")}
          onClose={() => setDialog("")}
        >
          {dialog === "choose" && (
            <>
              <p>
                {t(
                  "Take a breath before the road continues. These are temporary rest previews.",
                )}
              </p>
              <div className="rest-choices">
                <Button onClick={() => setDialog("short")}>
                  {t("Short Rest")}
                </Button>
                <Link
                  className="button primary"
                  href={href("camp")}
                  onClick={() => setDialog("")}
                >
                  {t(
                    camp.active
                      ? "Return to active demo camp"
                      : "Long Rest / Enter Camp",
                  )}
                </Link>
              </div>
            </>
          )}
          {dialog === "short" && (
            <RestReview kind="short" onConfirm={() => setDialog("outcome")} />
          )}
          {dialog === "outcome" && (
            <div role="status" className="preview-outcome">
              <h3>{t("Simulated short rest complete")}</h3>
              <p>
                {t(
                  "No recovery, consumption, elapsed time, or history changes were applied. Short rest has not opened camp-stash access.",
                )}
              </p>
            </div>
          )}
        </Modal>
      )}
    </>
  );
}

function Cooking({ onTalk }: { onTalk: (entity: Entity) => void }) {
  const { t } = useLanguage();
  const { campaign, camp } = usePreview();
  const participants = restParticipants(campaign.campaign_id);
  const [selectedRecipe, setSelectedRecipe] = useState(
    recipes.find((recipe) => recipe.campaign_id === campaign.campaign_id)!.id,
  );
  const [recipients, setRecipients] = useState(
    participants.map((entity) => entity.id),
  );
  const [prepared, setPrepared] = useState(false);
  const recipe = recipes.find(
    (recipe) =>
      recipe.campaign_id === campaign.campaign_id &&
      recipe.id === selectedRecipe,
  )!;
  const availability = recipeAvailability(
    campaign.campaign_id,
    recipe,
    camp.active,
    recipients,
  );
  return (
    <div className="cooking-preview">
      <p>
        {t(
          "Optional sample recipes. Preparation, ingredients, servings, and benefits are only demonstrated; no food or bonus is created.",
        )}
      </p>
      <div className="recipe-choices">
        {recipes
          .filter((entry) => entry.campaign_id === campaign.campaign_id)
          .map((entry) => (
            <button
              key={entry.id}
              aria-pressed={recipe.id === entry.id}
              className={recipe.id === entry.id ? "active" : ""}
              onClick={() => {
                setSelectedRecipe(entry.id);
                setPrepared(false);
              }}
            >
              <Icon
                name={entry.kind === "drink" ? "Coffee" : "Utensils"}
                size={24}
              />
              <span>{t(entry.name)}</span>
            </button>
          ))}
      </div>
      <h3>{t(recipe.name)}</h3>
      <p className="item-flavor">{t(recipe.flavor)}</p>
      <ul className="ingredient-list">
        {availability.ingredients.map((ingredient) => (
          <li key={ingredient.key}>
            <span>
              {t(ingredient.label)}
              <small>
                {ingredient.sources.length
                  ? ingredient.sources.map((source) => t(source)).join(" · ")
                  : t("No accessible source")}
              </small>
            </span>
            <b
              className={
                ingredient.available < ingredient.quantity ? "insufficient" : ""
              }
            >
              {ingredient.available} / {ingredient.quantity}
            </b>
          </li>
        ))}
      </ul>
      <p className="muted">
        {t("Available / required · quantities per preparation")}
      </p>
      <p>{t("Servings: {count}", { count: recipe.servings })}</p>
      <fieldset className="participant-picker">
        <legend>{t("Recipients")}</legend>
        {participants.map((entity) => (
          <label key={entity.id}>
            <input
              type="checkbox"
              checked={recipients.includes(entity.id)}
              onChange={() => {
                setPrepared(false);
                setRecipients((previous) =>
                  previous.includes(entity.id)
                    ? previous.filter((id) => id !== entity.id)
                    : [...previous, entity.id],
                );
              }}
            />
            {t(entity.name)}
          </label>
        ))}
      </fieldset>
      <div className="recipe-benefit">
        <h3>{t("One temporary benefit · sample")}</h3>
        <p>{t(recipe.benefit)}</p>
        <p className="muted">{t(recipe.expiry)}</p>
      </div>
      <p>
        {t(
          "Preparation would consume ingredients once and create servings. Consuming a serving would activate its effect without charging ingredients again. This demo performs neither step.",
        )}
      </p>
      {!availability.canPrepare && (
        <p role="status" className="access-note">
          {t(
            !availability.recipientsValid
              ? "Select one or two eligible recipients."
              : "Insufficient ingredients for this recipe.",
          )}
        </p>
      )}
      <Button
        primary
        disabled={!availability.canPrepare || prepared}
        onClick={() => setPrepared(true)}
      >
        {t(prepared ? "Sample preparation shown" : "Prepare · preview")}
      </Button>
      {prepared && (
        <div role="status" className="preview-outcome">
          <h3>{t("Simulated preparation ready")}</h3>
          <p>
            {t(
              "For {names}. No ingredients consumed, servings created, benefits applied, or dice modified.",
              {
                names: participants
                  .filter((entity) => recipients.includes(entity.id))
                  .map((entity) => t(entity.name))
                  .join(", "),
              },
            )}
          </p>
          {participants
            .filter(
              (entity) =>
                entity.kind === "companion" && recipients.includes(entity.id),
            )
            .map((entity) => (
              <Button key={entity.id} onClick={() => onTalk(entity)}>
                {t("Talk over food/drink with {name}", {
                  name: t(entity.name),
                })}
              </Button>
            ))}
        </div>
      )}
      <p className="muted">
        {t(
          "One meal and one drink benefit at most; replace or refresh, never stack. Cooking stays optional. No-cost rest does not make recipe ingredients free.",
        )}
      </p>
    </div>
  );
}

export function Camp() {
  const { t } = useLanguage();
  const { campaign, camp, setCampScenario, changeCamp, href } = usePreview();
  const router = useRouter();
  const [panel, setPanel] = useState<"" | "stash" | "cook" | "review">("");
  const [talk, setTalk] = useState<Entity | null>(null);
  const [overFood, setOverFood] = useState(false);
  const [outcome, setOutcome] = useState(false);
  const participants = restParticipants(campaign.campaign_id);
  function leave() {
    changeCamp("leave");
    router.push(href("game"));
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">{t("BETWEEN THE MILES")}</span>
          <h1>{t("Camp")}</h1>
          <p>{t("A little warmth against the dark.")}</p>
        </div>
        <Badge>
          {t(camp.active ? "Demo camp active" : "Demo camp closed")}
        </Badge>
      </div>
      <p className="access-note">
        {t(
          "Illustrative long-rest scene, not a new canon location. All activity is temporary preview state. A future campaign may rest in an inn, ship, or shelter instead.",
        )}
      </p>
      {outcome && (
        <p role="status" className="preview-outcome">
          {t(
            "Simulated long rest complete. Camp access is closed. No recovery, inventory, time, or history changed.",
          )}
        </p>
      )}
      {!camp.active ? (
        <Panel className="camp-entry" title={t("Before you settle in")}>
          <Icon name="Flame" size={48} />
          <p>
            {t(
              "Opening this page does not open stash access. Choose a sample eligibility scenario, then explicitly enter demo camp.",
            )}
          </p>
          <label className="field">
            {t("Sample eligibility")}
            <select
              value={camp.scenario}
              onChange={(event) =>
                setCampScenario(event.target.value as CampScenario)
              }
            >
              {campScenarios.map((scenario) => (
                <option key={scenario.value} value={scenario.value}>
                  {t(scenario.label)}
                </option>
              ))}
            </select>
          </label>
          {camp.scenario === "unsafe" && (
            <p role="status">
              {t(
                "Entry unavailable in this sample: find a safe stopping place. No hidden threat details are revealed.",
              )}
            </p>
          )}
          <div className="button-group">
            <Button
              primary
              disabled={camp.scenario !== "quiet"}
              onClick={() => {
                changeCamp("enter");
                setOutcome(false);
              }}
            >
              {t("Enter demo camp")}
            </Button>
            <Link className="button" href={href("game")}>
              {t("Back to Game")}
            </Link>
          </div>
        </Panel>
      ) : (
        <>
          <section className="camp-scene" aria-label={t("Camp gathering")}>
            <div className="camp-horizon" aria-hidden="true" />
            <div className="camp-fire" aria-hidden="true">
              <div className="fire-glow" />
              <Icon name="Flame" size={84} />
              <span className="camp-embers">✦ · ✧</span>
            </div>
            <div className="camp-scene-caption">
              <span className="eyebrow">{t("THE ROAD CAN WAIT")}</span>
              <h2>{t("Around the fire")}</h2>
              <p>{t("Only those traveling with you are here.")}</p>
            </div>
            <div className="camp-people">
              {participants.map((entity) => (
                <article className="camp-person" key={entity.id}>
                  {entity.kind === "companion" ? (
                    <button
                      className="camp-portrait-button"
                      aria-label={t("Talk with {name}", {
                        name: t(entity.name),
                      })}
                      onClick={() => {
                        setTalk(entity);
                        setOverFood(false);
                      }}
                    >
                      <Art name={entity.art} />
                    </button>
                  ) : (
                    <Art name="james" />
                  )}
                  <h3>{t(entity.name)}</h3>
                  <p>{t(entity.relationship)}</p>
                  {entity.kind === "companion" && (
                    <CompanionActions
                      entity={entity}
                      onTalk={() => {
                        setTalk(entity);
                        setOverFood(false);
                      }}
                    />
                  )}
                </article>
              ))}
            </div>
          </section>
          <div className="camp-controls">
            <Button onClick={() => setPanel("stash")}>
              <Icon name="Package" />
              {t("Open Camp Stash")}
            </Button>
            <Button onClick={() => setPanel("cook")}>
              <Icon name="Utensils" />
              {t("Cook / Prepare a drink")}
            </Button>
            <Button primary onClick={() => setPanel("review")}>
              <Icon name="Flame" />
              {t("Review & Complete Long Rest")}
            </Button>
            <Button onClick={leave}>{t("Leave Camp / Cancel")}</Button>
          </div>
          <p className="muted">
            {t(
              "Entering or leaving grants no recovery. Temporary conversation messages remain. Stash access closes when you leave or complete this demo rest.",
            )}
          </p>
        </>
      )}
      {camp.active && panel && (
        <Modal
          title={t(
            panel === "stash"
              ? "Camp / Shared Stash"
              : panel === "cook"
                ? "Cook / Prepare a drink"
                : "Review Long Rest",
          )}
          onClose={() => setPanel("")}
          className={panel === "stash" ? "stash-modal" : ""}
        >
          {panel === "stash" && (
            <StorageInventory
              storageId={`${campaign.campaign_id}:stash`}
              showDoll={false}
            />
          )}
          {panel === "cook" && (
            <Cooking
              onTalk={(entity) => {
                setPanel("");
                setOverFood(true);
                setTalk(entity);
              }}
            />
          )}
          {panel === "review" && (
            <RestReview
              kind="long"
              onConfirm={() => {
                changeCamp("complete");
                setPanel("");
                setOutcome(true);
              }}
            />
          )}
        </Modal>
      )}
      {camp.active && talk && (
        <Conversation
          entity={talk}
          overFood={overFood}
          onClose={() => setTalk(null)}
        />
      )}
    </>
  );
}
