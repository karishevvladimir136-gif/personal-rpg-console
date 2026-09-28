import type { PublicLabRun } from "../world-lab/contracts.ts";
import type { PublicSave } from "../saves/contracts.ts";
import type {
  TimelineBranch,
  TimelineExplorerProjection,
  TimelineFilters,
  TimelineMoment,
  TimelineSources,
} from "./contracts.ts";

const compare = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);
const validMinutes = (value: number) =>
  Number.isSafeInteger(value) && value >= 0;
const publicRecord = (value: object) => {
  // Defense in depth for malformed mixed-source fixtures. Live inputs are
  // already authorization-filtered public DTOs, never raw private records.
  const row = value as Record<string, unknown>;
  return (
    (row.visibility === undefined || row.visibility === "public") &&
    (row.knowledge === undefined || row.knowledge === "character") &&
    row.kind !== "private_event"
  );
};
const unknownLinks = { actors: null, consequences: null } as const;

function saveMoment(save: PublicSave): TimelineMoment {
  return {
    key: `save:${save.id}`,
    kind: "save",
    title: save.name,
    text: save.sceneTitle ?? "",
    time: { kind: "recorded", minutes: save.worldMinutes },
    session: save.sessionTitle
      ? { id: "", title: save.sessionTitle, recap: "" }
      : null,
    role: null,
    place: save.locationName,
    ...unknownLinks,
    saveId: save.id,
    checkpointId: null,
    events: [],
  };
}
function labMoments(run: PublicLabRun): TimelineMoment[] {
  return run.checkpoints
    .filter(
      (checkpoint) =>
        publicRecord(checkpoint) &&
        validMinutes(checkpoint.worldMinutes) &&
        checkpoint.worldMinutes >= run.startWorldMinutes &&
        checkpoint.worldMinutes <= run.currentWorldMinutes,
    )
    .sort(
      (a, b) =>
        a.worldMinutes - b.worldMinutes ||
        a.ordinal - b.ordinal ||
        compare(a.id, b.id),
    )
    .map((checkpoint) => ({
      key: `checkpoint:${checkpoint.id}`,
      kind: "checkpoint",
      title: "",
      text: checkpoint.summary,
      time: { kind: "recorded", minutes: checkpoint.worldMinutes },
      session: null,
      role: null,
      place: null,
      ...unknownLinks,
      saveId: null,
      checkpointId: checkpoint.id,
      events: checkpoint.events
        .filter(
          (event) =>
            publicRecord(event) &&
            validMinutes(event.worldMinutes) &&
            event.worldMinutes <= checkpoint.worldMinutes,
        )
        .sort(
          (a, b) => a.worldMinutes - b.worldMinutes || compare(a.text, b.text),
        )
        // Deliberately omit event IDs and all resolver/source metadata.
        .map((event) => ({ text: event.text, minutes: event.worldMinutes })),
    }));
}

export function projectTimelineExplorer({
  snapshot,
  saves,
  lab,
}: TimelineSources): TimelineExplorerProjection {
  const campaignId = snapshot.campaign.id;
  const activeId = snapshot.timeline?.timelineId;
  const activeKey = activeId ? `playable:${activeId}` : "playable:current";
  const savesScoped = saves?.campaignId === campaignId ? saves : null;
  const labScoped = lab?.campaignId === campaignId ? lab : null;
  const sourcesAligned =
    !savesScoped ||
    (!!snapshot.timeline &&
      savesScoped.timeline.timelineId === activeId &&
      savesScoped.timeline.epoch === snapshot.timeline.epoch);
  const timelines = sourcesAligned
    ? (savesScoped?.timelines ?? []).filter(
        (row) => row.campaign_id === campaignId && publicRecord(row),
      )
    : [];
  const publicSaves = sourcesAligned
    ? (savesScoped?.saves ?? []).filter(
        (row) =>
          row.campaign_id === campaignId &&
          publicRecord(row) &&
          validMinutes(row.worldMinutes) &&
          timelines.some((timeline) => timeline.id === row.timelineId),
      )
    : [];
  const sessions = new Map(
    snapshot.sessions
      .filter((row) => row.campaign_id === campaignId && publicRecord(row))
      .map((row) => [row.id, row]),
  );
  const scenes: TimelineMoment[] = snapshot.scenes
    .filter(
      (row) =>
        row.campaign_id === campaignId &&
        publicRecord(row) &&
        Number.isSafeInteger(row.sequence) &&
        row.sequence >= 0 &&
        sessions.has(row.session_id),
    )
    .sort((a, b) => a.sequence - b.sequence || compare(a.id, b.id))
    .map((row) => {
      const session = sessions.get(row.session_id)!;
      return {
        key: `scene:${row.id}`,
        kind: "scene",
        title: row.title,
        text: row.body,
        time: { kind: "order", ordinal: row.sequence },
        session: { id: session.id, title: session.title, recap: session.recap },
        role: row.role,
        place: null,
        ...unknownLinks,
        saveId: null,
        checkpointId: null,
        events: [],
      };
    });
  const branches: TimelineBranch[] = timelines.map((timeline) => {
    const parent = timelines.find(
      (row) => row.id === timeline.parentTimelineId,
    );
    const base = publicSaves.find((row) => row.id === timeline.forkSaveId);
    return {
      key: `playable:${timeline.id}`,
      label: timeline.label,
      kind: "playable",
      active: timeline.id === activeId,
      status: null,
      model: null,
      parent: timeline.parentTimelineId
        ? {
            key: parent ? `playable:${parent.id}` : null,
            label: parent?.label ?? null,
          }
        : null,
      base: timeline.forkSaveId
        ? {
            saveId: base?.id ?? null,
            label: base?.name ?? null,
            minutes: base?.worldMinutes ?? null,
          }
        : null,
      children: [],
      moments: [
        ...(timeline.id === activeId ? scenes : []),
        ...publicSaves
          .filter((row) => row.timelineId === timeline.id)
          .sort(
            (a, b) =>
              a.worldMinutes - b.worldMinutes ||
              compare(a.createdAt, b.createdAt) ||
              compare(a.id, b.id),
          )
          .map(saveMoment),
      ],
    };
  });
  if (!branches.some((branch) => branch.key === activeKey))
    branches.unshift({
      key: activeKey,
      label: snapshot.campaign.title,
      kind: "playable",
      active: true,
      status: null,
      model: null,
      parent: { key: null, label: null },
      base: null,
      children: [],
      moments: scenes,
    });
  const acceptedRuns: PublicLabRun[] = [];
  for (const run of labScoped?.runs ?? []) {
    if (
      run.campaignId !== campaignId ||
      run.nonCanon !== true ||
      run.purpose !== "simulation" ||
      !publicRecord(run) ||
      !validMinutes(run.currentWorldMinutes) ||
      !validMinutes(run.startWorldMinutes) ||
      !validMinutes(run.throughWorldMinutes) ||
      run.currentWorldMinutes < run.startWorldMinutes ||
      run.currentWorldMinutes > run.throughWorldMinutes
    )
      continue;
    acceptedRuns.push(run);
    const parent = branches.find(
      (row) => row.key === `playable:${run.base.timelineId}`,
    );
    branches.push({
      key: `lab:${run.id}`,
      label: run.label,
      kind: "lab",
      active: false,
      status: run.status,
      model: run.execution?.modelId ?? null,
      parent: { key: parent?.key ?? null, label: parent?.label ?? null },
      // This label is already sanitized by the existing Lab public projection.
      base: {
        saveId:
          publicSaves.find((row) => row.id === run.base.saveId)?.id ?? null,
        label: run.base.label,
        minutes: run.base.worldMinutes,
      },
      children: [],
      moments: labMoments(run),
    });
  }
  // Lead-owned PublicLabRun now optionally carries these two offered public
  // identities. Keep a structural reader until the shared extension integrates;
  // no private continuation basis or run.base save inference belongs here.
  for (const run of acceptedRuns) {
    const branch = branches.find((row) => row.key === `lab:${run.id}`);
    const continuation = (
      run as PublicLabRun & {
        continuation?: { sourceRunId: string; sourceCheckpointId: string };
      }
    ).continuation;
    if (!branch || continuation === undefined) continue;
    const parent =
      continuation && continuation.sourceRunId !== run.id
        ? branches.find(
            (row) =>
              row.kind === "lab" &&
              row.key === `lab:${continuation.sourceRunId}`,
          )
        : undefined;
    const checkpoint = parent?.moments.find(
      (row) =>
        row.kind === "checkpoint" &&
        row.checkpointId === continuation?.sourceCheckpointId,
    );
    branch.parent = { key: parent?.key ?? null, label: parent?.label ?? null };
    branch.base = {
      saveId: null,
      checkpointId: checkpoint?.checkpointId ?? null,
      label: checkpoint ? parent!.label : null,
      minutes:
        checkpoint?.time.kind === "recorded" ? checkpoint.time.minutes : null,
    };
  }
  for (const branch of branches)
    branch.children = branches
      .filter((row) => row.parent?.key === branch.key)
      .map((row) => ({ key: row.key, label: row.label, kind: row.kind }));
  branches.sort(
    (a, b) =>
      Number(b.active) - Number(a.active) ||
      compare(a.kind, b.kind) ||
      compare(a.label, b.label) ||
      compare(a.key, b.key),
  );
  return {
    campaignId,
    campaignTitle: snapshot.campaign.title,
    activeKey,
    sourcesAligned,
    branches,
    currentDirectory: {
      actors: snapshot.entities
        .filter(
          (row) =>
            row.campaign_id === campaignId &&
            publicRecord(row) &&
            ["player", "companion", "npc"].includes(row.kind),
        )
        .map((row) => row.name)
        .sort(compare),
      places: snapshot.locations
        .filter((row) => row.campaign_id === campaignId && publicRecord(row))
        .map((row) => row.name)
        .sort(compare),
      quests: snapshot.quests
        .filter((row) => row.campaign_id === campaignId && publicRecord(row))
        .map((row) => ({ title: row.title, status: row.status }))
        .sort((a, b) => compare(a.title, b.title)),
    },
  };
}

// Filter authorized rows before pagination. No totals or omitted/private counts.
export function filterTimelineMoments(
  branch: TimelineBranch,
  filters: TimelineFilters = {},
): TimelineMoment[] {
  const search = filters.search?.trim().toLocaleLowerCase() ?? "";
  const rows = branch.moments.filter(
    (moment) =>
      (!filters.kind || moment.kind === filters.kind) &&
      (!filters.sessionId || moment.session?.id === filters.sessionId) &&
      (!search ||
        [
          moment.title,
          moment.text,
          moment.session?.title ?? "",
          moment.place ?? "",
          ...moment.events.map((event) => event.text),
        ].some((value) => value.toLocaleLowerCase().includes(search))),
  );
  return filters.reverse ? rows.reverse() : rows;
}
export function timelineMomentPage(
  branch: TimelineBranch,
  filters: TimelineFilters,
  visible = 40,
) {
  const rows = filterTimelineMoments(branch, filters);
  const limit = Number.isSafeInteger(visible) ? Math.max(1, visible) : 40;
  return { moments: rows.slice(0, limit), hasMore: rows.length > limit };
}
