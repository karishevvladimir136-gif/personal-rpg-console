import type {
  AdventureCatalog,
  AdventureCommand,
  AdventurePacing,
  AdventurePoint,
  AdventureReview,
  PublicAdventure,
  PublicWorld,
  WorldCatalog,
  WorldCommand,
} from "./contracts.ts";
import type { TimelineFence } from "../saves/contracts.ts";
import { isTimelineFence } from "../saves/fence.ts";
import {
  ensure,
  ids,
  integer,
  list,
  literal,
  nullable,
  object,
  text,
  unique,
  uuid,
} from "../foundation-loop/fields.ts";

export function adventureTimeline(value: unknown): TimelineFence {
  ensure(isTimelineFence(value));
  return { timelineId: value.timelineId, epoch: value.epoch };
}
export function parseAdventurePacing(value: unknown): AdventurePacing {
  const v = object(value, ["kind", "custom"]);
  const kind = literal(v.kind, [
    "quick",
    "evening",
    "mini_arc",
    "custom",
    "open",
  ] as const);
  const custom = nullable(v.custom, (s) => text(s, 2000));
  ensure((kind === "custom") === (custom !== null));
  return { kind, custom };
}
export function parseAdventureReview(value: unknown): AdventureReview {
  const v = object(value, ["pacing", "agency", "rewards", "payoff", "notes"]);
  return {
    pacing: nullable(v.pacing, (s) => text(s, 2000)),
    agency: nullable(v.agency, (s) => text(s, 2000)),
    rewards: nullable(v.rewards, (s) => text(s, 2000)),
    payoff: nullable(v.payoff, (s) => text(s, 2000)),
    notes: nullable(v.notes, (s) => text(s, 2000)),
  };
}
export function parseWorld(value: unknown): PublicWorld {
  // Stage 4 adds three optional keys (older catalogs omit them).
  const extras = ["campaignCount", "rulesLabel", "hasVisualStyle"];
  const present = value && typeof value === "object" ? extras.filter((key) => Object.hasOwn(value, key)) : [];
  const v = object(value, [
    "id",
    "versionId",
    "version",
    "title",
    "premise",
    "packVersionIds",
    ...present,
  ]);
  return {
    id: uuid(v.id),
    versionId: uuid(v.versionId),
    version: integer(v.version, 1),
    title: text(v.title, 200),
    premise: text(v.premise, 20000),
    packVersionIds: ids(v.packVersionIds, 16),
    ...(v.campaignCount !== undefined ? { campaignCount: integer(v.campaignCount, 0) } : {}),
    ...(v.rulesLabel !== undefined ? { rulesLabel: v.rulesLabel === null ? null : text(v.rulesLabel, 200) } : {}),
    ...(v.hasVisualStyle !== undefined ? { hasVisualStyle: v.hasVisualStyle === true } : {}),
  };
}
export function parseWorldCatalog(value: unknown): WorldCatalog {
  const v = object(value, ["worlds", "packs"]);
  return {
    worlds: unique(list(v.worlds, parseWorld, 500), (w) => w.id),
    packs: unique(
      list(
        v.packs,
        (p) => {
          const row = object(p, ["versionId", "title"]);
          return {
            versionId: uuid(row.versionId),
            title: text(row.title, 200),
          };
        },
        500,
      ),
      (p) => p.versionId,
    ),
  };
}
function point(value: unknown): AdventurePoint {
  const v = object(value, ["worldMinutes", "sceneId"]);
  return {
    worldMinutes: integer(v.worldMinutes, 0, 2147483646),
    sceneId: nullable(v.sceneId, uuid),
  };
}
function setup(v: Record<string, unknown>) {
  return {
    title: text(v.title, 200),
    premise: text(v.premise, 20000),
    pacing: parseAdventurePacing(v.pacing),
  };
}
export function parseAdventure(
  value: unknown,
  campaignId: string,
): PublicAdventure {
  const v = object(value, [
    "id",
    "versionId",
    "previousVersionId",
    "version",
    "campaignId",
    "timelineId",
    "worldId",
    "worldVersion",
    "title",
    "premise",
    "pacing",
    "mode",
    "status",
    "start",
    "completion",
    "summary",
    "review",
    "createdAt",
  ]);
  ensure(v.campaignId === uuid(campaignId), "scope");
  const adventure: PublicAdventure = {
    id: uuid(v.id),
    versionId: uuid(v.versionId),
    previousVersionId: nullable(v.previousVersionId, uuid),
    version: integer(v.version, 1),
    campaignId,
    timelineId: uuid(v.timelineId),
    worldId: uuid(v.worldId),
    worldVersion: integer(v.worldVersion, 1),
    ...setup(v),
    mode: literal(v.mode, ["canon", "detached"] as const),
    status: literal(v.status, [
      "prepared",
      "active",
      "completed",
      "abandoned",
    ] as const),
    start: nullable(v.start, point),
    completion: nullable(v.completion, point),
    summary: nullable(v.summary, (s) => text(s, 12000)),
    review: nullable(v.review, parseAdventureReview),
    createdAt: text(v.createdAt, 64),
  };
  ensure(Number.isFinite(Date.parse(adventure.createdAt)));
  ensure(adventure.mode === "canon");
  ensure(
    adventure.status === "prepared" ||
      adventure.start !== null ||
      adventure.status === "abandoned",
  );
  ensure(
    (adventure.status === "completed" || adventure.status === "abandoned") ===
      (adventure.completion !== null),
  );
  ensure(adventure.previousVersionId !== adventure.versionId);
  return adventure;
}
export function parseAdventureCatalog(
  value: unknown,
  campaignId: string,
): AdventureCatalog {
  const v = object(value, [
    "campaignId",
    "timeline",
    "revision",
    "runtimeRevision",
    "expectedHeadId",
    "worldBinding",
    "activeAdventureId",
    "adventures",
    "history",
    "canChange",
    "detachedPlayable",
    ...(value !== null && typeof value === "object" && Object.hasOwn(value, "requiresOpening") ? ["requiresOpening"] : []),
  ]);
  ensure(v.campaignId === uuid(campaignId), "scope");
  ensure(typeof v.canChange === "boolean" && v.detachedPlayable === false);
  ensure(v.requiresOpening === undefined || typeof v.requiresOpening === "boolean");
  const worldBinding = nullable(v.worldBinding, (w) => {
    const row = object(w, ["worldId", "worldVersion", "title"]);
    return {
      worldId: uuid(row.worldId),
      worldVersion: integer(row.worldVersion, 1),
      title: text(row.title, 200),
    };
  });
  const adventures = unique(
    list(v.adventures, (a) => parseAdventure(a, campaignId), 500),
    (a) => a.id,
  );
  const history = unique(
    list(v.history, (a) => parseAdventure(a, campaignId), 2000),
    (a) => a.versionId,
  );
  const activeAdventureId = nullable(v.activeAdventureId, uuid);
  ensure(
    adventures.filter((a) => a.status === "active").length ===
      (activeAdventureId === null ? 0 : 1),
  );
  ensure(
    activeAdventureId === null ||
      adventures.some(
        (a) => a.id === activeAdventureId && a.status === "active",
      ),
  );
  ensure(
    adventures.every((a) =>
      history.some(
        (h) =>
          h.versionId === a.versionId &&
          JSON.stringify(h) === JSON.stringify(a),
      ),
    ),
  );
  return {
    campaignId,
    timeline: adventureTimeline(v.timeline),
    revision: integer(v.revision),
    runtimeRevision: integer(v.runtimeRevision),
    expectedHeadId: nullable(v.expectedHeadId, uuid),
    worldBinding,
    activeAdventureId,
    adventures,
    history,
    canChange: v.canChange,
    ...(v.requiresOpening === undefined ? {} : { requiresOpening: v.requiresOpening }),
    detachedPlayable: false,
  };
}
export function parseAdventureCommand(value: unknown): AdventureCommand {
  const v = object(value, ["action", "input"]);
  const action = literal(v.action, [
    "bind",
    "prepare",
    "edit",
    "start",
    "end",
    "abandon",
    "review",
  ] as const);
  const baseKeys = [
    "requestId",
    "campaignId",
    "timeline",
    "expectedRevision",
    "expectedRuntimeRevision",
    "expectedHeadId",
  ];
  const versionKeys = ["adventureId", "expectedAdventureVersion"];
  const keys =
    action === "bind"
      ? ["worldId", "worldVersion"]
      : action === "prepare"
        ? ["title", "premise", "pacing", "mode"]
        : [
            ...versionKeys,
            ...(action === "edit"
              ? ["title", "premise", "pacing"]
              : action === "end"
                ? ["summary", "review"]
                : action === "abandon"
                  ? ["summary"]
                  : action === "review"
                    ? ["review"]
                    : []),
          ];
  const input = object(v.input, [...baseKeys, ...keys]);
  const command = {
    requestId: uuid(input.requestId),
    campaignId: uuid(input.campaignId),
    timeline: adventureTimeline(input.timeline),
    expectedRevision: integer(input.expectedRevision),
    expectedRuntimeRevision: integer(input.expectedRuntimeRevision),
    expectedHeadId: nullable(input.expectedHeadId, uuid),
  };
  if (action === "bind")
    return {
      action,
      input: {
        ...command,
        worldId: uuid(input.worldId),
        worldVersion: integer(input.worldVersion, 1),
      },
    };
  if (action === "prepare")
    return {
      action,
      input: {
        ...command,
        ...setup(input),
        mode: literal(input.mode, ["canon"] as const),
      },
    };
  const version = {
    ...command,
    adventureId: uuid(input.adventureId),
    expectedAdventureVersion: integer(input.expectedAdventureVersion, 1),
  };
  if (action === "edit")
    return { action, input: { ...version, ...setup(input) } };
  if (action === "end")
    return {
      action,
      input: {
        ...version,
        summary: nullable(input.summary, (s) => text(s, 12000)),
        review: nullable(input.review, parseAdventureReview),
      },
    };
  if (action === "abandon")
    return {
      action,
      input: {
        ...version,
        summary: nullable(input.summary, (s) => text(s, 12000)),
      },
    };
  if (action === "review")
    return {
      action,
      input: { ...version, review: parseAdventureReview(input.review) },
    };
  return { action, input: version };
}
export function parseWorldCommand(value: unknown): WorldCommand {
  const v = object(value, ["action", "input"]);
  const action = literal(v.action, ["world_create", "new_campaign"] as const);
  if (action === "world_create") {
    const input = object(v.input, [
      "requestId",
      "title",
      "premise",
      "packVersionIds",
    ]);
    return {
      action,
      input: {
        requestId: uuid(input.requestId),
        title: text(input.title, 200),
        premise: text(input.premise, 20000),
        packVersionIds: ids(input.packVersionIds, 16),
      },
    };
  }
  const input = object(v.input, [
    "requestId",
    "worldId",
    "worldVersion",
    "title",
    "language",
    "heroName",
    "template",
  ]);
  return {
    action,
    input: {
      requestId: uuid(input.requestId),
      worldId: uuid(input.worldId),
      worldVersion: integer(input.worldVersion, 1),
      title: text(input.title, 200),
      language: literal(input.language, ["en", "ru"] as const),
      heroName: text(input.heroName, 200),
      template: literal(input.template, [
        "console-basic-fighter-level1-v1",
      ] as const),
    },
  };
}
