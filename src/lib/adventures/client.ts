import type {
  AdventureCatalog,
  AdventureCommand,
  AdventureResult,
  AdventureSetup,
  AdventureReview,
  NewHeroResult,
  PublicWorld,
  WorldCatalog,
  WorldCommand,
  WorldResult,
} from "./contracts.ts";
import type { TimelineFence } from "../saves/contracts.ts";
import { sameTimeline } from "../saves/fence.ts";
import { ensure, object, uuid } from "../foundation-loop/fields.ts";
import {
  adventureTimeline,
  parseAdventureCatalog,
  parseAdventureCommand,
  parseWorld,
  parseWorldCatalog,
  parseWorldCommand,
} from "./validation.ts";

export class AdventureClientError extends Error {
  readonly code: "validation" | "conflict" | "unavailable" | "uncertain";
  constructor(code: "validation" | "conflict" | "unavailable" | "uncertain") {
    super(`Adventure ${code}`);
    this.code = code;
    this.name = "AdventureClientError";
  }
}
export function readAdventureResult(
  value: unknown,
  command: AdventureCommand,
): AdventureResult {
  try {
    const v = object(value, ["requestId", "snapshot"]);
    ensure(v.requestId === command.input.requestId);
    const snapshot = parseAdventureCatalog(
      v.snapshot,
      command.input.campaignId,
    );
    // A later retry is a read of the stored receipt, never permission to rebase.
    ensure(sameTimeline(snapshot.timeline, command.input.timeline));
    return { requestId: command.input.requestId, snapshot };
  } catch {
    throw new AdventureClientError("uncertain");
  }
}
export function readWorldResult(
  value: unknown,
  command: Extract<WorldCommand, { action: "world_create" }>,
): WorldResult {
  try {
    const v = object(value, ["requestId", "world"]);
    ensure(v.requestId === command.input.requestId);
    const world = parseWorld(v.world);
    ensure(
      world.title === command.input.title &&
        world.premise === command.input.premise &&
        JSON.stringify(world.packVersionIds) ===
          JSON.stringify(command.input.packVersionIds),
    );
    return { requestId: command.input.requestId, world };
  } catch {
    throw new AdventureClientError("uncertain");
  }
}
export function readNewHeroResult(
  value: unknown,
  command: Extract<WorldCommand, { action: "new_campaign" }>,
): NewHeroResult {
  try {
    const v = object(value, ["requestId", "campaignId", "heroId"]);
    ensure(v.requestId === command.input.requestId);
    return {
      requestId: command.input.requestId,
      campaignId: uuid(v.campaignId),
      heroId: uuid(v.heroId),
    };
  } catch {
    throw new AdventureClientError("uncertain");
  }
}
function base(catalog: AdventureCatalog, allocate: () => string) {
  ensure(catalog.canChange, "conflict");
  return {
    requestId: allocate(),
    campaignId: catalog.campaignId,
    timeline: catalog.timeline,
    expectedRevision: catalog.revision,
    expectedRuntimeRevision: catalog.runtimeRevision,
    expectedHeadId: catalog.expectedHeadId,
  };
}
export function bindWorldAttempt(
  catalog: AdventureCatalog,
  worlds: WorldCatalog,
  worldId: string,
  allocate = () => crypto.randomUUID(),
): AdventureCommand {
  const world = worlds.worlds.find((w) => w.id === worldId);
  ensure(!catalog.worldBinding && world);
  return parseAdventureCommand({
    action: "bind",
    input: { ...base(catalog, allocate), worldId, worldVersion: world.version },
  });
}
export function prepareAdventureAttempt(
  catalog: AdventureCatalog,
  setup: AdventureSetup,
  allocate = () => crypto.randomUUID(),
): AdventureCommand {
  ensure(catalog.worldBinding && catalog.activeAdventureId === null);
  return parseAdventureCommand({
    action: "prepare",
    input: { ...base(catalog, allocate), ...setup, mode: "canon" },
  });
}
export function versionAdventureAttempt(
  catalog: AdventureCatalog,
  adventureId: string,
  action: "edit" | "start" | "end" | "abandon" | "review",
  data?:
    | AdventureSetup
    | { summary: string | null; review: AdventureReview | null }
    | { summary: string | null }
    | { review: AdventureReview },
  allocate = () => crypto.randomUUID(),
): AdventureCommand {
  const adventure = catalog.adventures.find((a) => a.id === adventureId);
  ensure(adventure);
  ensure(
    action === "start"
      ? adventure.status === "prepared" && !catalog.activeAdventureId
      : action === "end"
        ? adventure.status === "active"
        : action === "review"
          ? ["completed", "abandoned"].includes(adventure.status)
          : ["prepared", "active"].includes(adventure.status),
  );
  return parseAdventureCommand({
    action,
    input: {
      ...base(catalog, allocate),
      adventureId,
      expectedAdventureVersion: adventure.version,
      ...(data ?? {}),
    },
  });
}
export function createWorldAttempt(
  catalog: WorldCatalog,
  input: { title: string; premise: string; packVersionIds: string[] },
  allocate = () => crypto.randomUUID(),
): Extract<WorldCommand, { action: "world_create" }> {
  ensure(
    input.packVersionIds.every((id) =>
      catalog.packs.some((p) => p.versionId === id),
    ),
  );
  return parseWorldCommand({
    action: "world_create",
    input: { requestId: allocate(), ...input },
  }) as Extract<WorldCommand, { action: "world_create" }>;
}
export function newHeroAttempt(
  catalog: WorldCatalog,
  worldId: string,
  title: string,
  heroName: string,
  language: "en" | "ru",
  allocate = () => crypto.randomUUID(),
): Extract<WorldCommand, { action: "new_campaign" }> {
  const world = catalog.worlds.find((w) => w.id === worldId);
  ensure(world);
  return parseWorldCommand({
    action: "new_campaign",
    input: {
      requestId: allocate(),
      worldId,
      worldVersion: world.version,
      title,
      language,
      heroName,
      template: "console-basic-fighter-level1-v1",
    },
  }) as Extract<WorldCommand, { action: "new_campaign" }>;
}
export const adventurePendingKey = (campaignId: string) =>
  `adventure-v1-pending:${uuid(campaignId)}`;
export const worldPendingKey = (kind: "world_create" | "new_campaign") =>
  `adventure-v1-pending:${kind}`;
export function restoreAdventureAttempt(
  value: string | null,
  campaignId: string,
): AdventureCommand | null {
  try {
    if (!value || value.length > 70000) return null;
    const command = parseAdventureCommand(JSON.parse(value));
    ensure(command.input.campaignId === uuid(campaignId));
    return command;
  } catch {
    return null;
  }
}
export function restoreWorldAttempt(
  value: string | null,
  kind: "world_create" | "new_campaign",
): WorldCommand | null {
  try {
    if (!value || value.length > 70000) return null;
    const command = parseWorldCommand(JSON.parse(value));
    ensure(command.action === kind);
    return command;
  } catch {
    return null;
  }
}
export type AdventureTransport = {
  worlds: (signal?: AbortSignal) => Promise<WorldCatalog>;
  read: (
    campaignId: string,
    timeline: TimelineFence,
    signal?: AbortSignal,
  ) => Promise<AdventureCatalog>;
  send: (command: AdventureCommand) => Promise<AdventureResult>;
  createWorld: (
    command: Extract<WorldCommand, { action: "world_create" }>,
  ) => Promise<WorldResult>;
  newHero: (
    command: Extract<WorldCommand, { action: "new_campaign" }>,
  ) => Promise<NewHeroResult>;
};
export function createAdventureTransport(
  fetcher: typeof fetch = fetch,
): AdventureTransport {
  async function request(url: string, body?: unknown, signal?: AbortSignal) {
    try {
      const response = await fetcher(url, {
        method: body === undefined ? "GET" : "POST",
        credentials: "same-origin",
        cache: "no-store",
        signal,
        ...(body === undefined
          ? {}
          : {
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(body),
            }),
      });
      let value;
      try {
        value = await response.json();
      } catch {
        throw new AdventureClientError(
          body === undefined ? "unavailable" : "uncertain",
        );
      }
      if (!response.ok) {
        const code =
          value &&
          typeof value === "object" &&
          value.error &&
          typeof value.error === "object"
            ? value.error.code
            : null;
        throw new AdventureClientError(
          code === "conflict"
            ? "conflict"
            : [
                  "validation",
                  "forbidden",
                  "unauthenticated",
                  "not_found",
                  "not_configured",
                ].includes(code)
              ? "validation"
              : body === undefined
                ? "unavailable"
                : "uncertain",
        );
      }
      return value;
    } catch (cause) {
      if (
        cause instanceof AdventureClientError ||
        (cause instanceof Error && cause.name === "AbortError")
      )
        throw cause;
      throw new AdventureClientError(
        body === undefined ? "unavailable" : "uncertain",
      );
    }
  }
  return {
    async worlds(signal) {
      return parseWorldCatalog(await request("/api/worlds", undefined, signal));
    },
    async read(campaignId, value, signal) {
      const timeline = adventureTimeline(value);
      return parseAdventureCatalog(
        await request(
          `/api/campaigns/${uuid(campaignId)}/adventures?${new URLSearchParams({ timelineId: timeline.timelineId, epoch: String(timeline.epoch) })}`,
          undefined,
          signal,
        ),
        campaignId,
      );
    },
    async send(value) {
      const command = parseAdventureCommand(value);
      return readAdventureResult(
        await request(
          `/api/campaigns/${command.input.campaignId}/adventures`,
          command,
        ),
        command,
      );
    },
    async createWorld(value) {
      const command = parseWorldCommand(value);
      ensure(command.action === "world_create");
      return readWorldResult(await request("/api/worlds", command), command);
    },
    async newHero(value) {
      const command = parseWorldCommand(value);
      ensure(command.action === "new_campaign");
      return readNewHeroResult(await request("/api/worlds", command), command);
    },
  };
}
export function mergeCreatedWorld(
  catalog: WorldCatalog,
  world: PublicWorld,
): WorldCatalog {
  const old = catalog.worlds.find((w) => w.id === world.id);
  return old && old.version > world.version
    ? catalog
    : {
        ...catalog,
        worlds: [world, ...catalog.worlds.filter((w) => w.id !== world.id)],
      };
}
