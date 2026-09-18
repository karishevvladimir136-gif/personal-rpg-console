"use client";

import { useCallback, useEffect, useRef, useState, type Dispatch } from "react";
import { createPortal } from "react-dom";
import {
  combatActions,
  combatants,
  canChooseAction,
  combatPresentation,
  demoResourceLabels,
  eligibleTargets,
  encounterWon,
  enemyHealth,
  type CombatAction,
  type CombatEvent,
  type CombatPreview,
  type CombatantId,
  type PublicLog,
} from "@/lib/combat-preview";
import { getCheckPresentation, getVisibleDc } from "@/lib/dice-preview";
import { usePreview } from "./preview-context";
import { useLanguage } from "./language-context";
import { Art, Badge, Button, Icon, Meter, Modal, Panel } from "./ui";
import { DiceRollPresentation, ResultSummary } from "./dice-preview";

function Portrait({ id }: { id: CombatantId }) {
  return (
    <span className="combat-portrait">
      {id === "james" || id === "jinn" ? (
        <Art name={id} />
      ) : (
        <Icon name="UserRound" size={25} />
      )}
    </span>
  );
}

export function CombatView({
  state,
  dispatch,
}: {
  state: CombatPreview;
  dispatch: Dispatch<CombatEvent>;
}) {
  const { t } = useLanguage();
  const { campaignSettings } = usePreview();
  const [inspected, setInspected] = useState<CombatantId>("james");
  const [mobilePanel, setMobilePanel] = useState("scene");
  const [text, setText] = useState("");
  const [diceOpen, setDiceOpen] = useState(false);
  const [artVisible, setArtVisible] = useState(true);
  const heading = useRef<HTMLHeadingElement>(null);
  const resumeRoll = useRef<HTMLButtonElement>(null);
  const closeDice = () => {
    setDiceOpen(false);
    requestAnimationFrame(() =>
      (resumeRoll.current ?? heading.current)?.focus(),
    );
  };
  useEffect(() => {
    heading.current?.focus();
  }, [state.mode]);
  const pendingId = state.pending?.id;
  const reveal = useCallback(() => {
    if (pendingId !== undefined) dispatch({ type: "resolve", id: pendingId });
  }, [dispatch, pendingId]);
  const busy = !!state.pending && !state.pending.resolved;
  const won = encounterWon(state);
  const activeName =
    state.active === "enemy"
      ? t("Scripted opponents")
      : t(combatants.find((p) => p.id === state.active)!.name);
  const name = (id?: CombatantId) =>
    id ? t(combatants.find((p) => p.id === id)!.name) : "";
  const logText = (entry: PublicLog) =>
    t(entry.message, {
      actor: name(entry.actor),
      target: name(entry.target),
      amount: entry.amount ?? 0,
    });
  const lastLog = state.log.at(-1);
  const selected = state.draft ? state.draft.target : state.pending?.target;
  const inspection = combatants.find((p) => p.id === inspected)!;
  const presentation = combatPresentation(campaignSettings);
  const conditions = (id: CombatantId) => {
    const values: string[] = [];
    if ((id === "james" || id === "jinn") && state.guarded[id])
      values.push("Guarding");
    if (
      state.hp[id] > 0 &&
      state.hp[id] < combatants.find((p) => p.id === id)!.maxHp &&
      (id === "james" || id === "jinn")
    )
      values.push("Bruised");
    return values.length ? values : ["No visible conditions"];
  };
  const reset = () => {
    setDiceOpen(false);
    setText("");
    setInspected("james");
    setMobilePanel("scene");
    dispatch({ type: "reset" });
    heading.current?.focus();
  };
  const exit = () => dispatch({ type: "exit" });
  const confirm = () => {
    if (!state.draft) return;
    const rolls =
      state.draft.action === "attack" || state.draft.action === "spell";
    dispatch({
      type: "confirm",
      id: state.draft.id,
      preferences: campaignSettings,
    });
    setDiceOpen(
      rolls && (presentation === "interactive" || presentation === "compact"),
    );
  };

  return (
    <section className="combat-view" aria-label={t("Combat preview")}>
      <header className="combat-heading">
        <div>
          <span className="eyebrow">{t("SYNTHETIC ENCOUNTER · PHASE 0")}</span>
          <h1 ref={heading} tabIndex={-1}>
            {t(
              state.mode === "summary"
                ? "Encounter summary"
                : "A light in the rain",
            )}
          </h1>
        </div>
        <div className="combat-header-actions">
          <Button onClick={reset}>{t("Reset demo")}</Button>
          <Button onClick={exit}>{t("Exit combat preview")}</Button>
        </div>
      </header>
      <p className="combat-disclaimer">
        {t(
          "Demo only. All results are authored; campaign health, inventory, rest and settings stay unchanged.",
        )}
      </p>
      {state.mode === "summary" ? (
        <div className="combat-summary panel">
          <Icon name={won ? "Shield" : "ArrowRight"} size={38} />
          <span className="eyebrow">{t("SYNTHETIC OUTCOME")}</span>
          <h2>
            {t(won ? "The passage is clear" : "The party leaves the encounter")}
          </h2>
          <p>
            {t(
              won
                ? "The invented opponents withdraw. James and Jinn can cross the bridge in this sample ending."
                : "This preview ends with a safe withdrawal. The actual campaign scene has not advanced.",
            )}
          </p>
          <div className="combat-summary-grid">
            <Panel title={t("Injuries & conditions")}>
              {combatants
                .filter((p) => p.side === "party")
                .map((p) => (
                  <p key={p.id}>
                    <strong>{t(p.name)}</strong> · {state.hp[p.id]} / {p.maxHp}{" "}
                    {t("HP")}
                    <br />
                    {conditions(p.id)
                      .map((value) => t(value))
                      .join(" · ")}
                  </p>
                ))}
              <p className="muted">
                {t(
                  "No automatic healing or rest. These injuries exist only in this demo.",
                )}
              </p>
            </Panel>
            <Panel title={t("Resources spent")}>
              <ul>
                <li>
                  {t("Actions spent: {amount}", {
                    amount: state.spent.actions,
                  })}
                </li>
                <li>
                  {t("Bonus actions spent: {amount}", {
                    amount: state.spent.bonus,
                  })}
                </li>
                <li>
                  {t("Demo charges spent: {amount}", {
                    amount: state.spent.charges,
                  })}
                </li>
                <li>
                  {t("Demo tonics spent: {amount}", {
                    amount: state.spent.tonics,
                  })}
                </li>
                <li>
                  {t("Movement spent: {amount} ft", {
                    amount: state.spent.movement,
                  })}
                </li>
              </ul>
            </Panel>
            <Panel title={t("Available demo loot")}>
              <p>
                {t(
                  won
                    ? "A brass token and two silver coins. Invented props, not campaign items."
                    : "No loot recovered during the sample withdrawal.",
                )}
              </p>
              {won && (
                <Button
                  disabled={state.lootClaimed}
                  onClick={() => dispatch({ type: "loot" })}
                >
                  {t(
                    state.lootClaimed
                      ? "Collected in demo only"
                      : "Collect demo loot",
                  )}
                </Button>
              )}
              <p className="muted">
                {t("Nothing is added to campaign inventory.")}
              </p>
            </Panel>
          </div>
          <Button primary onClick={exit}>
            {t("Return to Game")}
          </Button>
        </div>
      ) : (
        <>
          <section
            className="combat-initiative panel"
            aria-label={t("Initiative order")}
          >
            <div className="combat-round">
              <small>{t("Round")}</small>
              <strong>{state.round}</strong>
            </div>
            {combatants.map((p) => (
              <div
                key={p.id}
                className={`initiative-member ${state.active === p.id || (state.active === "enemy" && p.side === "enemy" && state.hp[p.id] > 0) ? "active" : ""} ${state.hp[p.id] === 0 ? "withdrawn" : ""}`}
              >
                <Portrait id={p.id} />
                <span>
                  {t(p.name)}
                  <small>
                    {t(
                      state.hp[p.id] === 0
                        ? "Withdrawn"
                        : state.active === p.id ||
                            (state.active === "enemy" && p.side === "enemy")
                          ? "Active turn"
                          : "Waiting",
                    )}
                  </small>
                </span>
              </div>
            ))}
          </section>
          <nav className="combat-mobile-tabs" aria-label={t("Combat panels")}>
            {[
              ["scene", "Scene & actions"],
              ["party", "Party details"],
              ["log", "Combat history"],
            ].map(([id, label]) => (
              <button
                type="button"
                key={id}
                aria-pressed={mobilePanel === id}
                aria-controls={`combat-${id}`}
                onClick={() => setMobilePanel(id)}
              >
                {t(label)}
              </button>
            ))}
          </nav>
          <div className={`combat-grid mobile-${mobilePanel}`}>
            <aside id="combat-party" className="combat-party">
              <Panel title={t("Party details")}>
                {combatants
                  .filter((p) => p.side === "party")
                  .map((p) => (
                    <button
                      type="button"
                      className={`combat-party-card ${inspected === p.id ? "inspected" : ""}`}
                      key={p.id}
                      aria-pressed={inspected === p.id}
                      onClick={() => setInspected(p.id)}
                    >
                      <Portrait id={p.id} />
                      <span>
                        <strong>{t(p.name)}</strong>
                        <small>
                          {state.hp[p.id]} / {p.maxHp} {t("HP")}
                        </small>
                        <small>
                          {t(
                            state.active === p.id
                              ? "Active character"
                              : "Party member",
                          )}
                        </small>
                        {inspected === p.id && <small>{t("Inspecting")}</small>}
                        {conditions(p.id).map((condition) => (
                          <small key={condition}>{t(condition)}</small>
                        ))}
                      </span>
                    </button>
                  ))}
                <div className="combat-inspection">
                  <span className="eyebrow">{t("PUBLIC DETAILS")}</span>
                  <h3>{t(inspection.name)}</h3>
                  <p>{t(inspection.description)}</p>
                  <p>{t(state.positions[inspected])}</p>
                  {inspection.side === "party" ? (
                    <Meter
                      label={t("Preview HP")}
                      value={`${state.hp[inspected]} / ${inspection.maxHp}`}
                      percent={(state.hp[inspected] / inspection.maxHp) * 100}
                      color="var(--red)"
                    />
                  ) : (
                    <Badge>{t(enemyHealth(state.hp[inspected]))}</Badge>
                  )}
                  {conditions(inspected).map((condition) => (
                    <Badge key={condition}>{t(condition)}</Badge>
                  ))}
                </div>
              </Panel>
            </aside>
            <div id="combat-scene" className="combat-scene-column">
              <article className="combat-scene panel">
                {artVisible && (
                  <Art
                    name="city"
                    className="combat-scene-art"
                    label={t(
                      "Illustrative rainy street; positions are labels, not map coordinates.",
                    )}
                  />
                )}
                <div className="combat-scene-copy">
                  <span className="eyebrow">{t("THE SHUTTERED CROSSING")}</span>
                  <h2>{t("Two figures bar the way.")}</h2>
                  <p>
                    {t(
                      "A lantern burns beside the bridge. This invented encounter lets you try the flow of combat, away from your story.",
                    )}
                  </p>
                  <button
                    type="button"
                    className="text-link"
                    onClick={() => setArtVisible(!artVisible)}
                  >
                    {t(artVisible ? "Hide illustration" : "Show illustration")}
                  </button>
                </div>
                <div className="combat-targets">
                  {combatants
                    .filter((p) => p.side === "enemy")
                    .map((p) => (
                      <button
                        type="button"
                        key={p.id}
                        className={`combat-target ${selected === p.id ? "selected" : ""}`}
                        aria-pressed={selected === p.id}
                        onClick={() => {
                          setInspected(p.id);
                          if (state.draft)
                            dispatch({ type: "target", target: p.id });
                        }}
                      >
                        <Portrait id={p.id} />
                        <strong>{t(p.name)}</strong>
                        <span>{t(enemyHealth(state.hp[p.id]))}</span>
                        <small>{t(state.positions[p.id])}</small>
                        {selected === p.id && (
                          <Badge>{t("Selected target")}</Badge>
                        )}
                      </button>
                    ))}
                </div>
                <p className="combat-position-note">
                  {t(
                    "Nearby / Far Away / In Cover describe public positioning. Artwork placement does not measure distance.",
                  )}
                </p>
              </article>
              <div
                className="combat-feedback"
                role="status"
                aria-live="polite"
                aria-atomic="true"
              >
                <span key={lastLog?.id}>
                  {lastLog
                    ? logText(lastLog)
                    : t(
                        "Select an action, then an eligible target. Review its cost before confirming.",
                      )}
                </span>
              </div>
            </div>
            <aside id="combat-log" className="combat-log">
              <Panel title={t("Combat history")}>
                <p className="muted">{t("Public, synthetic outcomes only.")}</p>
                {state.log.length === 0 && (
                  <p>{t("The encounter is waiting for your first move.")}</p>
                )}
                <ol>
                  {state.log.map((entry) => {
                    const visibleRoll =
                      entry.fixture &&
                      getCheckPresentation(campaignSettings, {
                        visibility: "player",
                        important: entry.important ?? false,
                      });
                    const dc =
                      entry.fixture &&
                      getVisibleDc(campaignSettings, {
                        visibility: "player",
                        important: true,
                        publicDc: entry.fixture.publicDc,
                      });
                    return (
                      <li key={entry.id}>
                        {entry.text !== undefined && (
                          <blockquote className="literal-player-action">
                            {entry.text}
                          </blockquote>
                        )}
                        <p>{logText(entry)}</p>
                        {entry.fixture &&
                          (visibleRoll === "interactive" ||
                            visibleRoll === "compact") && (
                            <details>
                              <summary>
                                {t("Public sample roll details")}
                              </summary>
                              <p className="muted">
                                {t("Synthetic combat roll")}
                              </p>
                              {dc !== undefined && (
                                <p>{t("DC {value}", { value: dc })}</p>
                              )}
                              <ResultSummary fixture={entry.fixture} />
                            </details>
                          )}
                      </li>
                    );
                  })}
                </ol>
              </Panel>
            </aside>
          </div>
          <section
            className="combat-controls panel"
            aria-label={t("Active character controls")}
          >
            <div className="combat-control-heading">
              <div>
                <span className="eyebrow">{t("ACTIVE TURN")}</span>
                <h2>{activeName}</h2>
              </div>
              {state.active !== "enemy" && (
                <dl className="combat-resources">
                  {Object.entries(state.resources).map(([key, value]) => (
                    <div key={key}>
                      <dt>
                        {t(
                          demoResourceLabels[
                            key as keyof typeof demoResourceLabels
                          ],
                        )}
                      </dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
            <p className="muted">
              {t(
                "D&D-style sample budget only; other rules systems may use different resources.",
              )}
            </p>
            {state.active !== "enemy" && (
              <p className="muted">
                {t("Demo charges: {charges} · Shared tonics: {tonics}", {
                  charges: state.charges[state.active],
                  tonics: state.tonics,
                })}
              </p>
            )}
            {won ? (
              <div className="combat-complete">
                <h3>{t("The passage is clear")}</h3>
                <Button primary onClick={() => dispatch({ type: "summary" })}>
                  {t("Show encounter summary")}
                </Button>
              </div>
            ) : state.active === "enemy" ? (
              <div className="combat-enemy-turn">
                <p>
                  {t(
                    "The opponents take one authored turn. This supplies public consequences, never hidden dice or DM state.",
                  )}
                </p>
                <Button
                  primary
                  onClick={() =>
                    dispatch({ type: "enemy-turn", turn: state.turn })
                  }
                >
                  {t("Play scripted enemy turn")}
                </Button>
              </div>
            ) : (
              <>
                <div className="combat-actions">
                  {(
                    Object.entries(combatActions) as [
                      CombatAction,
                      (typeof combatActions)[CombatAction],
                    ][]
                  ).map(([id, action]) => (
                    <button
                      type="button"
                      key={id}
                      aria-pressed={state.draft?.action === id}
                      disabled={!canChooseAction(state, id)}
                      onClick={() => {
                        dispatch({ type: "choose", action: id });
                        setMobilePanel("scene");
                      }}
                    >
                      <Icon name={action.icon} />
                      <span>{t(action.label)}</span>
                    </button>
                  ))}
                  <Button
                    disabled={busy}
                    onClick={() =>
                      dispatch({ type: "end-turn", turn: state.turn })
                    }
                  >
                    {t("End Turn")}
                  </Button>
                </div>
                {state.draft && (
                  <div className="combat-confirm">
                    <h3>{t(combatActions[state.draft.action].label)}</h3>
                    <p>{t(combatActions[state.draft.action].detail)}</p>
                    <fieldset>
                      <legend>{t("Choose an eligible target")}</legend>
                      <div className="combat-target-options">
                        {eligibleTargets(state, state.draft.action).map(
                          (id) => (
                            <button
                              type="button"
                              key={id}
                              aria-pressed={selected === id}
                              onClick={() => {
                                dispatch({ type: "target", target: id });
                                setInspected(id);
                              }}
                            >
                              {name(id)}
                              {selected === id && (
                                <Icon name="Check" size={14} />
                              )}
                            </button>
                          ),
                        )}
                      </div>
                    </fieldset>
                    <p>
                      <strong>{t("Cost before confirmation")}: </strong>
                      {t(combatActions[state.draft.action].cost)}
                    </p>
                    <Button primary disabled={!selected} onClick={confirm}>
                      {t("Confirm demo action")}
                    </Button>
                  </div>
                )}
                {state.pending?.fixture &&
                  (presentation === "interactive" ||
                    presentation === "compact") && (
                    <div className="combat-pending">
                      <p>
                        {t(
                          busy
                            ? "Action reserved. Reopen the same sample roll to finish it; no second cost is charged."
                            : "This action has resolved once. Reviewing the sample cannot apply it again.",
                        )}
                      </p>
                      <button
                        type="button"
                        className="button"
                        ref={resumeRoll}
                        onClick={() => setDiceOpen(true)}
                      >
                        {t(busy ? "Resume sample roll" : "Review sample roll")}
                      </button>
                    </div>
                  )}
                <form
                  className="combat-free-action"
                  onSubmit={(event) => {
                    event.preventDefault();
                    dispatch({ type: "describe", text, id: state.sequence });
                    setText("");
                  }}
                >
                  <label className="field">
                    {t("Describe your action…")}
                    <textarea
                      rows={2}
                      maxLength={2000}
                      value={text}
                      onChange={(event) => setText(event.target.value)}
                      placeholder={t("Describe your action…")}
                    />
                  </label>
                  <Button type="submit" disabled={busy || !text.trim()}>
                    {t("Record demo proposal")}
                  </Button>
                  <small>
                    {t(
                      "Your words stay literal. The response is a labeled sample, not a live DM interpretation.",
                    )}
                  </small>
                </form>
              </>
            )}
            {!won && (
              <button
                type="button"
                className="text-link combat-finish"
                disabled={busy}
                onClick={() => dispatch({ type: "summary" })}
              >
                {t("Finish demo with withdrawal")}
              </button>
            )}
          </section>
        </>
      )}
      {diceOpen &&
        state.pending?.fixture &&
        (presentation === "interactive" || presentation === "compact") &&
        createPortal(
          <Modal
            title={t("Dice preview")}
            className="dice-modal"
            onClose={closeDice}
          >
            <p className="dice-demo-label">
              {t("Synthetic combat roll — isolated demo effects only")}
            </p>
            <p className="muted">
              {t("No public target number is supplied for this sample attack.")}
            </p>
            <DiceRollPresentation
              key={state.pending.id}
              fixture={state.pending.fixture}
              dc={getVisibleDc(campaignSettings, {
                visibility: "player",
                important: true,
                publicDc: state.pending.fixture.publicDc,
              })}
              presentation={presentation}
              revealed={state.pending.resolved}
              onReveal={reveal}
              onClose={closeDice}
            />
          </Modal>,
          document.body,
        )}
    </section>
  );
}
