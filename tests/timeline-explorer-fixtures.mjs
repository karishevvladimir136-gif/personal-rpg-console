import { labUiFixture, uiId } from "./d1-ui-fixtures.mjs";
export function timelineFixture() {
  const lab = labUiFixture();
  const campaignId = uiId(1),
    timelineId = uiId(3),
    sessionId = uiId(20),
    siblingId = uiId(30);
  const scope = {
    campaign_id: campaignId,
    revision: 1,
    updated_at: "2026-09-20T01:00:00Z",
  };
  const snapshot = {
    campaign: {
      ...scope,
      id: campaignId,
      title: "The harbor chronicle",
      subtitle: "",
      language: "en",
    },
    timeline: { timelineId, epoch: 4 },
    sessions: [
      {
        ...scope,
        id: sessionId,
        title: "An open gate",
        status: "closed",
        recap: "The patrol returned.",
      },
    ],
    scenes: [
      {
        ...scope,
        id: uiId(22),
        sequence: 2,
        session_id: sessionId,
        title: "Return",
        body: "Mira returns to the harbor.",
        role: "narration",
        settings_revision: 1,
        created_at: "2026-09-20T01:00:00Z",
      },
      {
        ...scope,
        id: uiId(21),
        sequence: 1,
        session_id: sessionId,
        title: "Departure",
        body: "We leave the gate.",
        role: "player",
        settings_revision: 1,
        created_at: "2026-09-20T02:00:00Z",
      },
    ],
    entities: [
      {
        ...scope,
        id: uiId(23),
        kind: "npc",
        name: "Mira",
        details: "Current ally",
      },
    ],
    locations: [
      {
        ...scope,
        id: uiId(24),
        name: "Harbor",
        description: "Current public place",
        status: "visited",
      },
    ],
    quests: [
      {
        ...scope,
        id: uiId(25),
        title: "Find the letter",
        status: "complete",
        description: "Public task",
      },
    ],
    publicState: {
      ...scope,
      summary: "",
      current_location_id: uiId(24),
      current_scene_id: uiId(22),
      current_session_id: sessionId,
    },
    settings: { ...scope, values: {} },
    settingsHistory: [],
    documents: [],
    storages: [],
    items: [],
    assets: [],
    feedback: [],
    dmGuideDocumentId: uiId(26),
  };
  const timeline = {
    id: timelineId,
    campaign_id: campaignId,
    label: "Original road",
    parentTimelineId: null,
    forkSaveId: null,
    createdAt: "2026-09-20",
    updatedAt: "2026-09-20",
    active: true,
    quickSaveId: null,
    locationName: "Harbor",
    worldMinutes: 420,
  };
  const save = {
    id: uiId(2),
    campaign_id: campaignId,
    timelineId,
    name: "The quiet harbor",
    kind: "manual",
    createdAt: "2026-09-20T01:00:00Z",
    sessionTitle: "An open gate",
    sceneTitle: "Departure",
    locationName: "Harbor",
    worldMinutes: 360,
    pendingAction: false,
  };
  const saves = {
    campaignId,
    timeline: snapshot.timeline,
    runtimeRevision: 1,
    revision: 1,
    policy: { autosave: "off", retention: 15, loadMode: "unrestricted" },
    saves: [
      save,
      {
        ...save,
        id: uiId(31),
        timelineId: siblingId,
        name: "Another crossing",
        worldMinutes: 380,
      },
    ],
    timelines: [
      timeline,
      {
        ...timeline,
        id: siblingId,
        label: "The second crossing",
        active: false,
        parentTimelineId: timelineId,
        forkSaveId: save.id,
      },
    ],
  };
  return { snapshot, saves, lab };
}
