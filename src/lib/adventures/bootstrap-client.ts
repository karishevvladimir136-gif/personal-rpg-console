import type {
  BootstrapCommand,
  BootstrapDraft,
  BootstrapTransport,
  CreationDraft,
  OpeningDraft,
} from "./bootstrap-contracts.ts";
import {
  parseBootstrapCommand,
  parseCreationInput,
  parseAnyCreationProposal,
  parseOpeningProposal,
} from "./bootstrap-validation.ts";
import { parseAdventureCatalog, parseAdventureCommand } from "./validation.ts";
import {
  ensure,
  integer,
  object,
  text,
  uuid,
} from "../foundation-loop/fields.ts";
import { AdventureClientError } from "./client.ts";
export function parseBootstrapDraft(value: unknown): BootstrapDraft {
  const kind = (value as { kind?: unknown })?.kind;
  ensure(kind === "creation" || kind === "opening");
  const v = object(value, [
    "kind",
    "draftId",
    kind === "creation" ? "input" : "command",
    "proposal",
    "usage",
  ]);
  const u = object(v.usage, [
    "model",
    "inputTokens",
    "outputTokens",
    "latencyMs",
  ]);
  const usage = {
    model: text(u.model, 100),
    inputTokens: integer(u.inputTokens),
    outputTokens: integer(u.outputTokens),
    latencyMs: integer(u.latencyMs),
  };
  const draftId = uuid(v.draftId);
  if (kind === "creation") {
    const input = parseCreationInput(v.input);
    ensure(input.requestId === draftId);
    return {
      kind,
      draftId,
      input,
      proposal: parseAnyCreationProposal(v.proposal, input),
      usage,
    };
  }
  const command = parseAdventureCommand(v.command);
  ensure(command.action === "start" && command.input.requestId === draftId);
  return {
    kind,
    draftId,
    command,
    proposal: parseOpeningProposal(v.proposal),
    usage,
  };
}
export function restoreBootstrapCommand(
  value: string | null,
): BootstrapCommand | null {
  try {
    return value ? parseBootstrapCommand(JSON.parse(value)) : null;
  } catch {
    return null;
  }
}
export function createBootstrapTransport(
  fetcher: typeof fetch = fetch,
): BootstrapTransport {
  async function send(command: BootstrapCommand) {
    try {
      const response = await fetcher("/api/campaign-bootstrap", {
        method: "POST",
        credentials: "same-origin",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parseBootstrapCommand(command)),
      });
      const value = await response.json();
      if (!response.ok) {
        const code = value?.error?.code;
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
              : "uncertain",
        );
      }
      return value;
    } catch (e) {
      if (e instanceof AdventureClientError) throw e;
      throw new AdventureClientError("uncertain");
    }
  }
  return {
    async proposeCharacter(input) {
      const d = parseBootstrapDraft(
        await send({ action: "creation.propose", input }),
      );
      ensure(d.kind === "creation");
      return d as CreationDraft;
    },
    async createCharacter(input) {
      const r = object(await send({ action: "creation.commit", input }), [
        "requestId",
        "campaignId",
        "heroId",
      ]);
      ensure(r.requestId === input.requestId);
      return {
        requestId: uuid(r.requestId),
        campaignId: uuid(r.campaignId),
        heroId: uuid(r.heroId),
      };
    },
    async proposeOpening(input) {
      const d = parseBootstrapDraft(
        await send({ action: "opening.propose", input }),
      );
      ensure(d.kind === "opening");
      return d as OpeningDraft;
    },
    async startOpening(input) {
      const r = object(await send({ action: "opening.commit", input }), [
        "requestId",
        "snapshot",
      ]);
      ensure(r.requestId === input.requestId);
      return {
        requestId: uuid(r.requestId),
        snapshot: parseAdventureCatalog(r.snapshot, input.campaignId),
      };
    },
  };
}
