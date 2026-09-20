"use client";

import { useState } from "react";
import type {
  OwnerPackDetail,
  OwnerSourceSummary,
} from "@/lib/world-library/owner-contracts";
import type { PackBody } from "@/lib/world-library/types";
import { worldAuthoringText } from "@/lib/world-library-i18n";
import type { Language, LibrarySave } from "./authoring";
import { ASSISTANCE_DISCLOSURE } from "./compiler-panel";
import styles from "./world-library.module.css";

export function ReviewOverview({
  language,
  detail,
  body,
  sources,
  rejectedIds,
  disabled,
  onChange,
}: {
  language: Language;
  detail: OwnerPackDetail;
  body: PackBody;
  sources: OwnerSourceSummary[];
  rejectedIds: string[];
  disabled: boolean;
  onChange: (body: PackBody) => void;
}) {
  const w = (key: string) => worldAuthoringText(language, key);
  const claims = body.claims.filter((claim) => !rejectedIds.includes(claim.id));
  const assumptions = claims.filter((claim) => claim.origin !== "source_fact");
  const connections = claims.filter(
    (claim) =>
      claim.structure &&
      ["relationship", "geography", "timeline", "rule"].includes(
        claim.structure.kind,
      ),
  );
  function openClaim(id: string) {
    const element = document.getElementById(`claim-${id}`);
    element?.setAttribute("open", "");
    element?.scrollIntoView({ block: "start", behavior: "smooth" });
    element?.querySelector("summary")?.focus();
  }
  return (
    <div className={styles.reviewOverview}>
      <p className={styles.eyebrow}>{w("Review your world")}</p>
      <h3>{w("1 · People and places")}</h3>
      <p>
        {w(
          "Correct names, aliases and types by hand. Save a new draft below; original sources and earlier versions stay intact.",
        )}
      </p>
      <div className={styles.entityGrid}>
        {(
          [
            [
              "People and other entities",
              body.entities.filter(
                (entity) => !["location", "faction"].includes(entity.kind),
              ),
            ],
            [
              "Factions",
              body.entities.filter((entity) => entity.kind === "faction"),
            ],
            [
              "Locations",
              body.entities.filter((entity) => entity.kind === "location"),
            ],
          ] as const
        ).map(([title, entities]) => (
          <section className={styles.entityGroup} key={title}>
            <h3>{w(title)}</h3>
            {!entities.length && <p>{w("None proposed yet.")}</p>}
            <ul>
              {entities.map((entity) => (
                <li key={entity.id}>
                  <strong>{entity.name}</strong>
                  <small>
                    {w(entity.kind)}
                    {entity.aliases.length
                      ? ` · ${entity.aliases.join(" / ")}`
                      : ""}
                  </small>
                  <details>
                    <summary>{w("Edit identity")}</summary>
                    <fieldset disabled={disabled}>
                      <label>
                        {w("Display name")}
                        <input
                          required
                          maxLength={240}
                          value={entity.name}
                          onChange={(event) =>
                            onChange({
                              ...body,
                              entities: body.entities.map((entry) =>
                                entry.id === entity.id
                                  ? { ...entry, name: event.target.value }
                                  : entry,
                              ),
                            })
                          }
                        />
                      </label>
                      <label>
                        {w("Entity type")}
                        <select
                          value={entity.kind}
                          onChange={(event) =>
                            onChange({
                              ...body,
                              entities: body.entities.map((entry) =>
                                entry.id === entity.id
                                  ? {
                                      ...entry,
                                      kind: event.target
                                        .value as typeof entity.kind,
                                    }
                                  : entry,
                              ),
                            })
                          }
                        >
                          {(
                            [
                              "person",
                              "group",
                              "faction",
                              "location",
                              "object",
                              "institution",
                            ] as const
                          ).map((kind) => (
                            <option key={kind} value={kind}>
                              {w(kind)}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        {w("Aliases (one per line)")}
                        <textarea
                          rows={3}
                          maxLength={4820}
                          value={entity.aliases.join("\n")}
                          onChange={(event) =>
                            onChange({
                              ...body,
                              entities: body.entities.map((entry) =>
                                entry.id === entity.id
                                  ? {
                                      ...entry,
                                      aliases: event.target.value.split("\n"),
                                    }
                                  : entry,
                              ),
                            })
                          }
                        />
                      </label>
                      <small>
                        {w(
                          "Up to 20 distinct aliases, 240 characters each. Empty lines are ignored.",
                        )}
                      </small>
                    </fieldset>
                  </details>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <h3>{w("Source priority")}</h3>
      <p>
        {w("Highest priority first. Conflicting alternatives stay visible.")}
      </p>
      <ol className={styles.sourceOrder}>
        {body.sourcePriority.map((id) => (
          <li key={id}>
            {sources.find((source) => source.versionId === id)?.title ??
              detail.evidence.find(
                (evidence) => evidence.sourceVersionId === id,
              )?.sourceTitle ??
              w("Selected historical source")}
          </li>
        ))}
      </ol>
      <h3>{w("Assumptions and inferences")}</h3>
      {!assumptions.length && (
        <p>{w("No authored assumptions or inferences in this version.")}</p>
      )}
      {assumptions.map((claim) => (
        <div key={claim.id} className={styles.reviewItem}>
          <small>
            {w(claim.origin)} · {w(claim.epistemic)}
          </small>
          <p>{claim.text}</p>
          {claim.uncertainty && <p>{claim.uncertainty}</p>}
          <button onClick={() => openClaim(claim.id)}>
            {w("Read evidence / edit")}
          </button>
        </div>
      ))}
      <details>
        <summary>{w("Relationships, geography, timeline and rules")}</summary>
        {!connections.length && (
          <p>{w("No structured connections proposed yet.")}</p>
        )}
        {connections.map((claim) => (
          <div key={claim.id} className={styles.reviewItem}>
            <small>{w(claim.structure!.kind)}</small>
            <p>{claim.text}</p>
            <button onClick={() => openClaim(claim.id)}>
              {w("Read evidence / edit")}
            </button>
          </div>
        ))}
      </details>
      <p className={styles.boundary}>
        {w(
          "All proposals remain reference until you explicitly select eligible claims and approve. Character knowledge requires its own review.",
        )}
      </p>
    </div>
  );
}

export function CanonPreview({
  language,
  body,
  canonIds,
  rejectedIds,
}: {
  language: Language;
  body: PackBody;
  canonIds: string[];
  rejectedIds: string[];
}) {
  const w = (key: string) => worldAuthoringText(language, key);
  const retained = body.claims.filter(
    (claim) => !rejectedIds.includes(claim.id),
  );
  return (
    <div className={styles.canonPreview}>
      <h3>
        {w("Canon candidates")}: {canonIds.length}
      </h3>
      {!canonIds.length && <p>{w("No claims selected as Canon.")}</p>}
      <ul>
        {retained
          .filter((claim) => canonIds.includes(claim.id))
          .map((claim) => (
            <li key={claim.id}>{claim.text}</li>
          ))}
      </ul>
      <details>
        <summary>
          {w("Remaining reference")}: {retained.length - canonIds.length}
        </summary>
        <ul>
          {retained
            .filter((claim) => !canonIds.includes(claim.id))
            .map((claim) => (
              <li key={claim.id}>{claim.text}</li>
            ))}
        </ul>
      </details>
      <p>
        {w(
          "Claims marked Canon will become authoritative only when you approve this version. Pin the approved version separately in campaign settings.",
        )}
      </p>
    </div>
  );
}

export function RefinementEditor({
  language,
  detail,
  disabled,
  save,
  onDirty,
}: {
  language: Language;
  detail: OwnerPackDetail;
  disabled: boolean;
  save: LibrarySave;
  onDirty: (dirty: boolean) => void;
}) {
  const w = (key: string) => worldAuthoringText(language, key);
  const [text, setText] = useState("");
  return (
    <section className={styles.refinement}>
      <h3>{w("Ask to refine")}</h3>
      <p>
        {w(
          "Refinement keeps your saved corrections and creates another unapproved version. Save or discard current edits first. Approval and campaign pins remain explicit.",
        )}
      </p>
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          const result = await save({
            action: "pack.refine",
            expectedVersionId: detail.versionId,
            text,
            maxUnits: 180,
          });
          if (result) {
            setText("");
            onDirty(false);
          }
        }}
      >
        <fieldset disabled={disabled}>
          <label>
            {w("Describe what to clarify or add")}
            <textarea
              rows={5}
              maxLength={4000}
              required
              value={text}
              placeholder={w(
                "For example: clarify the factions’ interests, preserve the unresolved border dispute, and identify missing geography.",
              )}
              onChange={(event) => {
                setText(event.target.value);
                onDirty(event.target.value.length > 0);
              }}
            />
          </label>
          <p className={styles.boundary}>{w(ASSISTANCE_DISCLOSURE)}</p>
          <div className={styles.actions}>
            <button type="submit" disabled={!text.trim()}>
              {w("Prepare refinement job")}
            </button>
            <button
              type="button"
              disabled={!text}
              onClick={() => {
                setText("");
                onDirty(false);
              }}
            >
              {w("Discard edit")}
            </button>
          </div>
        </fieldset>
      </form>
    </section>
  );
}
