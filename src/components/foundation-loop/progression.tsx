"use client";
import { useState } from "react";
import type { FoundationLoopView } from "@/lib/foundation-loop/client-contracts";
import { Badge, Button, Icon } from "../ui";
import type { ApplyFoundation } from "./commerce-settings";
import type { FoundationText } from "./text";
import styles from "./foundation-loop.module.css";

export function ProgressionPanel({
  view,
  c,
  apply,
}: {
  view: FoundationLoopView;
  c: FoundationText;
  apply: ApplyFoundation;
}) {
  const [choices, setChoices] = useState<Record<string, string>>({});
  return (
    <div className={styles.form}>
      {!view.progression.enabled ? (
        <div className={styles.empty}>
          <h3>{c.off}</h3>
          <p>{c.offHelp}</p>
        </div>
      ) : (
        <>
          {!view.progression.progress.length && (
            <p className={styles.empty}>{c.noneProgress}</p>
          )}
          {view.progression.progress.map((progress) => (
            <section
              key={`${progress.entityId}:${progress.trackId}`}
              className={styles.progressCard}
            >
              <div className={styles.heading}>
                <div>
                  <p className={styles.eyebrow}>{progress.entityName}</p>
                  <h3>{progress.trackLabel}</h3>
                </div>
                <Badge>
                  {c.rank} {progress.rank}
                </Badge>
              </div>
              <p className="muted">{c[progress.kind]}</p>
              <div className={styles.progressValue}>
                <strong>{progress.value}</strong>
                <span>
                  {progress.nextThreshold === null
                    ? c.complete
                    : `${c.next}: ${progress.nextThreshold}`}
                </span>
              </div>
              {progress.nextThreshold !== null && (
                <progress
                  className={styles.meter}
                  max={progress.nextThreshold}
                  value={Math.min(progress.value, progress.nextThreshold)}
                  aria-label={`${progress.trackLabel} · ${c.value}`}
                />
              )}
              {progress.unlocks.length > 0 && (
                <p>
                  {c.unlocked}: {progress.unlocks.join(" · ")}
                </p>
              )}
              {view.progression.pending
                .filter(
                  (p) =>
                    p.entityId === progress.entityId &&
                    p.trackId === progress.trackId,
                )
                .map((pending) => (
                  <section key={pending.id} className={styles.advancement}>
                    <h4>
                      <Icon name="Sparkles" />
                      {c.pendingTitle}
                    </h4>
                    <p>
                      {c.before}: {progress.rank} → {c.after}: {pending.rank}
                    </p>
                    {pending.reason && (
                      <p className="muted">
                        {pending.reason === "earlier_choice"
                          ? c.earlier
                          : pending.reason === "track_changed"
                            ? c.changedTrack
                            : c.offHelp}
                      </p>
                    )}
                    <fieldset
                      disabled={!pending.selectable}
                      className={styles.choices}
                    >
                      <legend className={styles.srOnly}>{c.options}</legend>
                      {pending.options.map((option) => (
                        <label
                          key={option.id}
                          className={`${styles.choice} ${choices[pending.id] === option.id ? styles.selected : ""}`}
                        >
                          <input
                            type="radio"
                            name={`advance-${pending.id}`}
                            value={option.id}
                            checked={choices[pending.id] === option.id}
                            onChange={() =>
                              setChoices({
                                ...choices,
                                [pending.id]: option.id,
                              })
                            }
                          />
                          <span>
                            <strong>{option.label}</strong>
                            <small>
                              {c.unlocked}: {option.capability}
                            </small>
                          </span>
                        </label>
                      ))}
                      <Button
                        primary
                        disabled={!choices[pending.id]}
                        onClick={() =>
                          apply("advancement", {
                            pendingId: pending.id,
                            optionId: choices[pending.id],
                            expectedTrackVersion: pending.trackVersion,
                          })
                        }
                      >
                        {c.choose}
                      </Button>
                    </fieldset>
                  </section>
                ))}
            </section>
          ))}
        </>
      )}
      {view.availableRewards.length > 0 && (
        <section className={styles.rewards}>
          <h3>{c.rewards}</h3>
          <p className="muted">{c.rewardHelp}</p>
          {view.availableRewards.map((reward) => (
            <div className={styles.reward} key={reward.id}>
              <strong>{reward.label}</strong>
              <Button
                primary
                onClick={() =>
                  apply("reward", {
                    rewardId: reward.id,
                    expectedRewardVersion: reward.version,
                  })
                }
              >
                {c.claim}
              </Button>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
