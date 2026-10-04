"use client";

import { useRef, useState } from "react";
import type { CampaignSnapshot } from "@/lib/persistence/contracts";
import type {
  ConfigurePlayInput,
  ItemTag,
  MechanicsConfiguration,
  PlaySnapshot,
} from "@/lib/gameplay/contracts";
import { configurePlay, gameplayErrorMessage } from "@/lib/gameplay/client";
import { useLanguage } from "./language-context";
import {
  useCampaignData,
  useCampaignDraftScope,
  TimelineDraftNotice,
  useUnsavedChanges,
} from "./persistence-context";
import { Button, Panel } from "./ui";
import { useGameplayRuntime } from "./gameplay-runtime";

export const itemTagLabels: Record<ItemTag, string> = {
  supply: "Rest supply",
  meat: "Known edible meat",
  coffee: "Coffee supplies",
  water: "Water",
  knife: "Knife component",
  stick: "Stick component",
  binding: "Binding component",
  "cutting-tool": "Retained cutting tool",
  weapon: "Weapon",
  healing: "Healing item",
  "meal-serving": "Prepared meal",
  "coffee-serving": "Prepared coffee",
};
const blankConfiguration = (): MechanicsConfiguration => ({
  profile: "console-basic-v1",
  controlledEntityIds: [],
  presentEntityIds: [],
  nearbyStorageIds: [],
  safeLocationIds: [],
  itemRules: [],
});
function ConfigurationForm({
  data,
  play,
  onSaved,
}: {
  data: CampaignSnapshot;
  play: PlaySnapshot;
  onSaved: () => Promise<void>;
}) {
  const { t } = useLanguage();
  const scope = useCampaignDraftScope();
  const [draft, setDraft] = useState<MechanicsConfiguration>(() =>
    structuredClone(play.configuration ?? blankConfiguration()),
  );
  const [agreed, setAgreed] = useState(!!play.configuration);
  const [baseline, setBaseline] = useState(play.revision);
  const [original, setOriginal] = useState(JSON.stringify(draft));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const guard = useRef(false);
  const attempt = useRef<ConfigurePlayInput | null>(null);
  useUnsavedChanges(JSON.stringify(draft) !== original);
  const toggle = (
    field:
      | "controlledEntityIds"
      | "presentEntityIds"
      | "nearbyStorageIds"
      | "safeLocationIds",
    id: string,
    enabled: boolean,
  ) => {
    setSaved(false);
    setDraft({
      ...draft,
      [field]: enabled
        ? [...new Set([...draft[field], id])]
        : draft[field].filter((value) => value !== id),
    });
  };
  const setTag = (itemId: string, tag: ItemTag, enabled: boolean) => {
    setSaved(false);
    const rest = draft.itemRules.filter(
      (rule) => rule.itemId !== itemId || rule.tag !== tag,
    );
    setDraft({
      ...draft,
      itemRules: enabled
        ? [...rest, { itemId, tag, damage: tag === "weapon" ? 2 : null }]
        : rest,
    });
  };
  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        if (guard.current || !agreed) return;
        if (scope.stale) return;
        guard.current = true;
        setBusy(true);
        setError("");
        setSaved(false);
        const input = {
          timeline: scope.timeline,
          campaignId: data.campaign.id,
          expectedRevision: baseline,
          configuration: draft,
        };
        if (
          !attempt.current ||
          JSON.stringify({
            timeline: attempt.current.timeline,
            campaignId: attempt.current.campaignId,
            expectedRevision: attempt.current.expectedRevision,
            configuration: attempt.current.configuration,
          }) !== JSON.stringify(input)
        )
          attempt.current = { ...input, requestId: crypto.randomUUID() };
        try {
          const result = await configurePlay(attempt.current);
          attempt.current = null;
          setBaseline(result.revision);
          setOriginal(JSON.stringify(draft));
          setSaved(true);
          await onSaved();
        } catch (cause) {
          setError(gameplayErrorMessage(cause));
        } finally {
          guard.current = false;
          setBusy(false);
        }
      }}
    >
      <fieldset className="persistence-fields" disabled={busy}>
        <TimelineDraftNotice stale={scope.stale} />
        <label className="gameplay-checkbox">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(event) => setAgreed(event.target.checked)}
          />
          {t(data.settings.values.rulesSystem.id === "world-logic-v1"
            ? "Use the existing Console Basic mechanics for combat in this World Logic campaign"
            : "Use Console Basic house rules for future play in this campaign")}
        </label>
        <p className="muted">
          {t(
            "This is a small explicit house profile, not official D&D. Existing campaign prose is not automatically converted into mechanics. Set current and maximum HP in public character records before combat. Only approve item rules for items you actually own.",
          )}
        </p>
        <details>
          <summary>{t("Supported house rules")}</summary>
          <p>
            {t(
              "d20 plus recorded modifiers; one action, move and reaction. Recovery follows campaign settings. No automatic spell-slot recovery or universal natural-1/natural-20 rule.",
            )}
          </p>
          <p>
            {t(
              "Supported item assembly: knife and stick embedded, binding consumed, cutting tool retained. A failed attempt consumes binding only; either outcome takes ten minutes.",
            )}
          </p>
        </details>
        <div className="gameplay-configuration-grid">
          <fieldset className="gameplay-listeners">
            <legend>{t("Characters you control")}</legend>
            {data.entities
              .filter(
                (row) => row.kind === "player" || row.kind === "companion",
              )
              .map((row) => (
                <label key={row.id}>
                  <input
                    type="checkbox"
                    checked={draft.controlledEntityIds.includes(row.id)}
                    onChange={(event) =>
                      toggle(
                        "controlledEntityIds",
                        row.id,
                        event.target.checked,
                      )
                    }
                  />
                  {row.name}
                </label>
              ))}
          </fieldset>
          <fieldset className="gameplay-listeners">
            <legend>{t("Present entities")}</legend>
            {data.entities.map((row) => (
              <label key={row.id}>
                <input
                  type="checkbox"
                  checked={draft.presentEntityIds.includes(row.id)}
                  onChange={(event) =>
                    toggle("presentEntityIds", row.id, event.target.checked)
                  }
                />
                {row.name}
              </label>
            ))}
          </fieldset>
          <fieldset className="gameplay-listeners">
            <legend>{t("Nearby cargo")}</legend>
            {data.storages
              .filter((row) => row.kind === "transport")
              .map((row) => (
                <label key={row.id}>
                  <input
                    type="checkbox"
                    checked={draft.nearbyStorageIds.includes(row.id)}
                    onChange={(event) =>
                      toggle("nearbyStorageIds", row.id, event.target.checked)
                    }
                  />
                  {row.name}
                </label>
              ))}
          </fieldset>
          <fieldset className="gameplay-listeners">
            <legend>{t("Known safe rest locations")}</legend>
            {data.locations.map((row) => (
              <label key={row.id}>
                <input
                  type="checkbox"
                  checked={draft.safeLocationIds.includes(row.id)}
                  onChange={(event) =>
                    toggle("safeLocationIds", row.id, event.target.checked)
                  }
                />
                {row.name}
              </label>
            ))}
          </fieldset>
        </div>
        <h3>{t("Explicit item rules")}</h3>
        <p className="muted">
          {t(
            "Only assign properties already established for these items. Descriptive flavor alone grants no mechanical power.",
          )}
        </p>
        {data.items.map((item) => (
          <details className="gameplay-item-rule" key={item.id}>
            <summary>{item.name}</summary>
            <div className="gameplay-configuration-grid">
              {Object.entries(itemTagLabels).map(([tag, label]) => (
                <label className="gameplay-checkbox" key={tag}>
                  <input
                    type="checkbox"
                    checked={draft.itemRules.some(
                      (rule) => rule.itemId === item.id && rule.tag === tag,
                    )}
                    onChange={(event) =>
                      setTag(item.id, tag as ItemTag, event.target.checked)
                    }
                  />
                  {t(label)}
                </label>
              ))}
            </div>
            {draft.itemRules.some(
              (rule) => rule.itemId === item.id && rule.tag === "weapon",
            ) && (
              <label className="field">
                {t("Weapon damage")}
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={
                    draft.itemRules.find(
                      (rule) =>
                        rule.itemId === item.id && rule.tag === "weapon",
                    )?.damage ?? 2
                  }
                  onChange={(event) => {
                    setSaved(false);
                    setDraft({
                      ...draft,
                      itemRules: draft.itemRules.map((rule) =>
                        rule.itemId === item.id && rule.tag === "weapon"
                          ? { ...rule, damage: Number(event.target.value) }
                          : rule,
                      ),
                    });
                  }}
                />
              </label>
            )}
          </details>
        ))}
        {play.revision !== baseline && !saved && (
          <p className="muted">
            {t(
              "Campaign state has changed since this form opened. Saving will check for a conflict and preserve your draft.",
            )}
          </p>
        )}
        {error && <p role="alert">{t(error)}</p>}
        <Button primary type="submit" disabled={!agreed || scope.stale}>
          {t(busy ? "Saving…" : "Save play configuration")}
        </Button>
        {saved && (
          <p role="status">
            {t("Play configuration saved for future actions.")}
          </p>
        )}
      </fieldset>
    </form>
  );
}
export function GameplayConfiguration() {
  const { t } = useLanguage();
  const { data } = useCampaignData();
  const runtime = useGameplayRuntime();
  const formPlay = runtime.play ?? runtime.configurationDraftSource;
  return (
    <Panel
      className="visual-inventory-panel"
      title={t("Authoritative play rules")}
    >
      {runtime.error && <p role="alert">{t(runtime.error)}</p>}
      {data && formPlay ? (
        <ConfigurationForm
          key={data.campaign.id}
          data={data}
          play={formPlay}
          onSaved={runtime.afterMutation}
        />
      ) : (
        <p role="status">{t("Loading saved gameplay…")}</p>
      )}
    </Panel>
  );
}
