export const id = (n) =>
  `10000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
export function fixture(status = "prepared") {
  const world = {
    id: id(10),
    versionId: id(11),
    version: 1,
    title: "Owner's coast",
    premise: "Explore a coast with an uncertain future.",
    packVersionIds: [],
  };
  const worlds = {
    worlds: [world],
    packs: [{ versionId: id(12), title: "Approved public foundation" }],
  };
  const adventure = {
    id: id(20),
    versionId: id(21),
    previousVersionId: null,
    version: 1,
    campaignId: id(1),
    timelineId: id(2),
    worldId: world.id,
    worldVersion: 1,
    title: "A fresh chapter",
    premise: "Let me seek useful discoveries and choose my own route.",
    pacing: { kind: "evening", custom: null },
    mode: "canon",
    status,
    start:
      status === "prepared" || status === "abandoned"
        ? null
        : { worldMinutes: 17, sceneId: id(30) },
    completion:
      status === "completed" || status === "abandoned"
        ? { worldMinutes: 38, sceneId: null }
        : null,
    summary: null,
    review: null,
    createdAt: "2026-09-27T10:00:00.000Z",
  };
  const catalog = {
    campaignId: id(1),
    timeline: { timelineId: id(2), epoch: 1 },
    revision: 3,
    runtimeRevision: 4,
    expectedHeadId: id(5),
    worldBinding: { worldId: world.id, worldVersion: 1, title: world.title },
    activeAdventureId: status === "active" ? adventure.id : null,
    adventures: [adventure],
    history: [structuredClone(adventure)],
    canChange: true,
    detachedPlayable: false,
  };
  const snapshot = {
    campaign: { id: id(1), title: "Continuing hero", language: "en" },
    timeline: catalog.timeline,
  };
  const setup = {
    title: "Owner chapter",
    premise: "Follow my interests while preserving meaningful choices.",
    pacing: { kind: "mini_arc", custom: null },
  };
  return { world, worlds, adventure, catalog, snapshot, setup };
}
export const review = () => ({
  pacing: "Good room for detours",
  agency: "Refusal mattered",
  rewards: "Useful discovery",
  payoff: null,
  notes: "A quieter next chapter",
});
