"use client";
import { useState } from "react";
import { BookOpen, Clock3, GitBranch, Search } from "lucide-react";
import type {
  TimelineBranch,
  TimelineExplorerProjection,
  TimelineMoment,
} from "../../lib/timeline-explorer/contracts.ts";
import { timelineMomentPage } from "../../lib/timeline-explorer/projection.ts";
import { timelineText } from "./text.ts";
import styles from "./timeline-explorer.module.css";

export function TimelineExplorer({
  projection,
  language,
  refreshing = false,
  notices = [],
  onRefresh,
  initialBranchKey,
}: {
  projection: TimelineExplorerProjection;
  language: "en" | "ru";
  refreshing?: boolean;
  notices?: string[];
  onRefresh?: () => void;
  initialBranchKey?: string;
}) {
  const c = timelineText(language);
  const [branchKey, setBranchKey] = useState(
    initialBranchKey ?? projection.activeKey,
  );
  const branch =
    projection.branches.find((row) => row.key === branchKey) ??
    projection.branches.find((row) => row.active)!;
  return (
    <section className={styles.explorer} aria-label={c.title}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>{c.eyebrow}</p>
          <h1>{c.title}</h1>
          <p className={styles.intro}>{c.intro}</p>
        </div>
        <div className={styles.headerActions}>
          <span className={styles.readOnly}>{c.readOnly}</span>
          <a
            href={`/campaigns/${encodeURIComponent(projection.campaignId)}/saves`}
          >
            {c.originalSave}
          </a>
          {onRefresh && (
            <button
              className={styles.secondary}
              type="button"
              onClick={onRefresh}
              disabled={refreshing}
            >
              {c.refresh}
            </button>
          )}
        </div>
      </header>
      {refreshing && (
        <p className={styles.notice} role="status">
          {c.loading}
        </p>
      )}
      {notices.map((notice) => (
        <p className={styles.notice} role="status" key={notice}>
          {notice}
        </p>
      ))}
      {!projection.sourcesAligned && (
        <p className={styles.notice} role="status">
          {c.changed}
        </p>
      )}
      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <details className={styles.browse}>
            <summary>{c.browseHistories}</summary>
            <nav aria-label={c.histories} className={styles.branchList}>
              {(["playable", "lab"] as const).map((kind) => (
                <div key={kind}>
                  <h2>{kind === "playable" ? c.histories : c.labHistories}</h2>
                  {projection.branches
                    .filter((row) => row.kind === kind)
                    .map((row) => (
                      <button
                        key={row.key}
                        type="button"
                        className={`${styles.branchChoice} ${row.key === branch.key ? styles.selected : ""}`}
                        aria-pressed={row.key === branch.key}
                        onClick={() => setBranchKey(row.key)}
                      >
                        <span>{row.label}</span>
                        <small>
                          {row.active
                            ? c.active
                            : row.kind === "lab"
                              ? c.nonCanon
                              : c.playable}
                          {row.status ? ` · ${c.status[row.status]}` : ""}
                        </small>
                      </button>
                    ))}
                  {!projection.branches.some((row) => row.kind === kind) && (
                    <p className={styles.quiet}>{c.none}</p>
                  )}
                </div>
              ))}
            </nav>
          </details>
          <Lineage
            branch={branch}
            language={language}
            selectBranch={setBranchKey}
            campaignId={projection.campaignId}
          />
          <details className={styles.directory}>
            <summary>{c.currentDirectory}</summary>
            <p className={styles.quiet}>{c.directoryHelp}</p>
            <h3>{c.actors}</h3>
            <p>{projection.currentDirectory.actors.join(" · ") || c.none}</p>
            <h3>{c.knownPlaces}</h3>
            <p>{projection.currentDirectory.places.join(" · ") || c.none}</p>
            <h3>{c.quests}</h3>
            <ul>
              {projection.currentDirectory.quests.map((quest, index) => (
                <li key={index}>
                  {quest.title} <small>· {c.questStatus[quest.status]}</small>
                </li>
              ))}
            </ul>
            {!projection.currentDirectory.quests.length && <p>{c.none}</p>}
          </details>
        </aside>
        <BranchReader
          key={branch.key}
          branch={branch}
          language={language}
          campaignId={projection.campaignId}
        />
      </div>
    </section>
  );
}

function Lineage({
  branch,
  language,
  selectBranch,
  campaignId,
}: {
  branch: TimelineBranch;
  language: "en" | "ru";
  selectBranch: (key: string) => void;
  campaignId: string;
}) {
  const c = timelineText(language);
  const savesHref = `/campaigns/${encodeURIComponent(campaignId)}/saves`;
  return (
    <details className={styles.lineage}>
      <summary>
        <GitBranch size={14} aria-hidden="true" />
        {c.lineage}
      </summary>
      {branch.parent ? (
        <>
          <h3>{c.parent}</h3>
          {branch.parent.key ? (
            <button
              type="button"
              className={styles.textButton}
              onClick={() => selectBranch(branch.parent!.key!)}
            >
              {branch.parent.label}
            </button>
          ) : (
            <p>{c.lineageUnknown}</p>
          )}
        </>
      ) : (
        <p>{c.root}</p>
      )}
      {branch.base && (
        <>
          <h3>{c.base}</h3>
          <p>{branch.base.label ?? c.lineageUnknown}</p>
          {branch.base.minutes !== null && (
            <p className={styles.time}>{c.worldMinutes(branch.base.minutes)}</p>
          )}
          {branch.base.saveId && <a href={savesHref}>{c.originalSave}</a>}
          {branch.base.checkpointId && (
            <details className={styles.identity}>
              <summary>{c.checkpointIdentity}</summary>
              <code>{branch.base.checkpointId}</code>
            </details>
          )}
        </>
      )}
      {!!branch.children.length && (
        <>
          <h3>{c.children}</h3>
          {branch.children.map((child) => (
            <button
              type="button"
              key={child.key}
              className={styles.textButton}
              onClick={() => selectBranch(child.key)}
            >
              {child.label}
              {child.kind === "lab" && <small> · {c.nonCanon}</small>}
            </button>
          ))}
        </>
      )}
    </details>
  );
}

function BranchReader({
  branch,
  language,
  campaignId,
}: {
  branch: TimelineBranch;
  language: "en" | "ru";
  campaignId: string;
}) {
  const c = timelineText(language);
  const [kind, setKind] = useState<TimelineMoment["kind"]>(
    branch.kind === "lab" ? "checkpoint" : branch.active ? "scene" : "save",
  );
  const [search, setSearch] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [reverse, setReverse] = useState(false);
  const [visible, setVisible] = useState(40);
  const [selectedKey, setSelectedKey] = useState("");
  const page = timelineMomentPage(
    branch,
    { kind, search, sessionId, reverse },
    visible,
  );
  const selected =
    page.moments.find((moment) => moment.key === selectedKey) ??
    page.moments[0];
  const sessions = [
    ...new Map(
      branch.moments
        .filter((moment) => moment.kind === "scene" && moment.session)
        .map((moment) => [moment.session!.id, moment.session!]),
    ).values(),
  ];
  const filterChanged = () => {
    setVisible(40);
    setSelectedKey("");
  };
  return (
    <div className={styles.reader}>
      <header className={styles.branchHeader}>
        <span
          className={branch.kind === "lab" ? styles.nonCanon : styles.badge}
        >
          {branch.kind === "lab"
            ? c.nonCanon
            : branch.active
              ? c.active
              : c.playable}
        </span>
        <h2>{branch.label}</h2>
        <p>
          {branch.kind === "lab"
            ? c.labHelp
            : !branch.active
              ? c.inactiveHelp
              : c.approximate}
        </p>
        {branch.status && (
          <p className={styles.runMeta}>
            {c.status[branch.status]}
            {branch.model && <span> · {branch.model}</span>}
          </p>
        )}
      </header>
      {branch.kind === "playable" && branch.active && (
        <div className={styles.tabs} role="group" aria-label={c.moments}>
          {(["scene", "save"] as const).map((value) => (
            <button
              type="button"
              key={value}
              aria-pressed={kind === value}
              className={kind === value ? styles.tabActive : ""}
              onClick={() => {
                setKind(value);
                setSessionId("");
                filterChanged();
              }}
            >
              {value === "scene" ? c.story : c.saves}
            </button>
          ))}
        </div>
      )}
      {kind !== "scene" && (
        <p className={styles.quiet}>
          <Clock3 size={13} aria-hidden="true" /> {c.savedTime}
        </p>
      )}
      <details className={styles.options}>
        <summary>{c.filters}</summary>
        <div className={styles.filters}>
          <label className={styles.search}>
            <span>{c.search}</span>
            <div>
              <Search size={15} aria-hidden="true" />
              <input
                type="search"
                value={search}
                placeholder={c.searchPlaceholder}
                onChange={(event) => {
                  setSearch(event.target.value);
                  filterChanged();
                }}
              />
            </div>
          </label>
          {kind === "scene" && sessions.length > 0 && (
            <label>
              <span>{c.sessions}</span>
              <select
                value={sessionId}
                onChange={(event) => {
                  setSessionId(event.target.value);
                  filterChanged();
                }}
              >
                <option value="">{c.allSessions}</option>
                {sessions.map((session) => (
                  <option key={session.id} value={session.id}>
                    {session.title}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label>
            <span>{c.order}</span>
            <select
              value={reverse ? "newest" : "oldest"}
              onChange={(event) => {
                setReverse(event.target.value === "newest");
                filterChanged();
              }}
            >
              <option value="oldest">{c.oldest}</option>
              <option value="newest">{c.newest}</option>
            </select>
          </label>
        </div>
      </details>
      <div className={styles.momentsLayout}>
        <section className={styles.moments} aria-label={c.moments}>
          {!page.moments.length && (
            <div className={styles.empty}>
              <BookOpen size={25} aria-hidden="true" />
              <p>{search || sessionId ? c.noMatches : c.empty}</p>
            </div>
          )}
          <ol className={styles.momentList}>
            {page.moments.map((moment, index) => (
              <li key={moment.key}>
                <button
                  type="button"
                  aria-pressed={selected?.key === moment.key}
                  className={`${styles.momentChoice} ${selected?.key === moment.key ? styles.selectedMoment : ""}`}
                  onClick={() => setSelectedKey(moment.key)}
                >
                  <span className={styles.time}>
                    {moment.time.kind === "order"
                      ? c.sceneOrder(moment.time.ordinal)
                      : c.worldMinutes(moment.time.minutes)}
                  </span>
                  <strong>
                    {moment.title ||
                      (moment.kind === "checkpoint" ? c.checkpoint : c.scene)}
                  </strong>
                  {moment.session && <small>{moment.session.title}</small>}
                  <span className={styles.excerpt}>
                    {moment.text || c.inspect}
                  </span>
                </button>
                {selected?.key === moment.key && (
                  <div className={styles.mobileDetail}>
                    <MomentDetail
                      moment={moment}
                      branch={branch}
                      language={language}
                      campaignId={campaignId}
                      mobileIndex={index}
                    />
                  </div>
                )}
              </li>
            ))}
          </ol>
          {page.hasMore && (
            <button
              type="button"
              className={styles.secondary}
              onClick={() => setVisible((value) => value + 40)}
            >
              {c.more}
            </button>
          )}
        </section>
        <div className={styles.desktopDetail}>
          {selected ? (
            <MomentDetail
              moment={selected}
              branch={branch}
              language={language}
              campaignId={campaignId}
            />
          ) : (
            <p className={styles.quiet}>{c.inspect}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function MomentDetail({
  moment,
  branch,
  language,
  campaignId,
  mobileIndex,
}: {
  moment: TimelineMoment;
  branch: TimelineBranch;
  language: "en" | "ru";
  campaignId: string;
  mobileIndex?: number;
}) {
  const c = timelineText(language);
  return (
    <article
      className={styles.detail}
      aria-label={moment.title || c.checkpoint}
    >
      <div className={styles.detailMeta}>
        <span>
          {moment.kind === "checkpoint"
            ? c.checkpoint
            : moment.kind === "save"
              ? c.save
              : moment.role
                ? c[moment.role]
                : c.scene}
        </span>
        {branch.kind === "lab" && <span>{c.nonCanon}</span>}
      </div>
      <h3>{moment.title || c.checkpoint}</h3>
      <p className={styles.time}>
        {moment.time.kind === "order"
          ? c.sceneOrder(moment.time.ordinal)
          : c.worldMinutes(moment.time.minutes)}
      </p>
      {moment.text && <p className={styles.narrative}>{moment.text}</p>}
      {moment.kind === "checkpoint" && (
        <section className={styles.events}>
          <h4>{c.eventHistory}</h4>
          {moment.events.map((event, index) => (
            <div key={index}>
              <span className={styles.time}>
                {c.worldMinutes(event.minutes)}
              </span>
              <p>{event.text}</p>
            </div>
          ))}
          {!moment.events.length && (
            <p className={styles.quiet}>{c.noEvents}</p>
          )}
        </section>
      )}
      <details className={styles.recordDetails}>
        <summary>{c.recordDetails}</summary>
        <dl className={styles.associations}>
          <dt>{c.actors}</dt>
          <dd>{c.unknown}</dd>
          <dt>{c.place}</dt>
          <dd>{moment.place ?? c.unknown}</dd>
          <dt>{c.consequences}</dt>
          <dd>{c.unknown}</dd>
          {moment.time.kind === "order" && (
            <>
              <dt>{c.recordedTime}</dt>
              <dd>{c.timeUnknown}</dd>
            </>
          )}
        </dl>
      </details>
      {moment.session?.recap && (
        <details className={styles.recap}>
          <summary>
            {c.sessionRecap} · {moment.session.title}
          </summary>
          <p>{moment.session.recap}</p>
        </details>
      )}
      {moment.saveId && (
        <a
          className={styles.saveLink}
          href={`/campaigns/${encodeURIComponent(campaignId)}/saves`}
        >
          {c.originalSave}
        </a>
      )}
      {moment.checkpointId && (
        <details className={styles.identity}>
          <summary>{c.checkpointIdentity}</summary>
          <code
            id={
              mobileIndex === undefined
                ? undefined
                : `checkpoint-mobile-${mobileIndex}`
            }
          >
            {moment.checkpointId}
          </code>
        </details>
      )}
    </article>
  );
}
