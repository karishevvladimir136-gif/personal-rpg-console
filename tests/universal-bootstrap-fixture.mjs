import { randomUUID } from "node:crypto";
import { fixture } from "./phase35-storage-fixture.mjs";
import { createAdventureService } from "../src/lib/adventures/service.ts";
import {
  createWorldAttempt,
  prepareAdventureAttempt,
  versionAdventureAttempt,
} from "../src/lib/adventures/client.ts";
import { createBootstrapService } from "../src/lib/adventures/bootstrap-service.ts";
import {
  initialCreationReview,
  initialOpeningReview,
} from "../src/lib/adventures/bootstrap-validation.ts";
import { resolveExecutionProfile } from "../src/lib/model-runtime/registry.ts";
export const usage = {
  model: "gpt-6-sol",
  inputTokens: 10,
  outputTokens: 20,
  latencyMs: 1,
};
export const examples = {
  fantasy: {
    world: {
      title: "Open roads",
      premise:
        "Ordinary fantasy settlements and travellers; no established hidden plot.",
    },
    name: "Rowan",
    description:
      "An unknown wanderer. I know navigation and careful observation. I cannot cast spells. I carry a compass.",
    caps: ["navigation", "careful observation"],
    limits: ["cannot cast spells"],
    item: "compass",
    adventure:
      "An unknown wanderer seeks ordinary paid work. Open choices; no hidden explanation.",
    location: "Wayside square",
    situation:
      "A public notice board offers ordinary paid work. A local work organiser is available to discuss it.",
    npc: "Local work organiser",
    narration:
      "At the wayside square, a work organiser stands beside a notice board offering paid work. You can ask about the notices, look around, or leave.",
  },
  orbital: {
    world: {
      title: "Jupiter frontier",
      premise: "Human orbital settlements and stations around Jupiter.",
    },
    name: "Kai",
    description:
      "An independent cargo pilot with navigation, piloting and dock negotiation. I have no combat training.",
    caps: ["navigation", "piloting", "dock negotiation"],
    limits: ["no combat training"],
    adventure:
      "Investigate why a supply shuttle stopped responding. Do not establish an explanation.",
    location: "Orbital station arrivals dock",
    situation:
      "A public arrivals display marks a supply shuttle as overdue. A dock coordinator can discuss the recorded traffic.",
    npc: "Dock coordinator",
    narration:
      "In the station arrivals dock, the public traffic display marks the supply shuttle as overdue. A dock coordinator is nearby. You may ask about the public records or survey the dock.",
  },
};
export async function setup(
  example = examples.fantasy,
  language = "en",
  prefix = 31,
) {
  const f = await fixture(prefix);
  f.adventures = createAdventureService(f.owner, async (a) => {
    try {
      return {
        data: (
          await f.one(
            "select public.rpg_adventures($1,$2,$3,$4::jsonb,$5::jsonb) result",
            [
              a.p_owner_id,
              a.p_campaign_id,
              a.p_action,
              JSON.stringify(a.p_payload),
              a.p_timeline ? JSON.stringify(a.p_timeline) : null,
            ],
          )
        ).result,
      };
    } catch (e) {
      return { error: { code: e.code, message: e.message } };
    }
  });
  f.rpc = async (action, cid, payload, user = f.owner) =>
    (
      await f.one("select public.rpg_bootstrap($1,$2,$3,$4::jsonb) result", [
        user,
        cid,
        action,
        JSON.stringify(payload),
      ])
    ).result;
  f.world = (
    await f.adventures.performWorld(
      createWorldAttempt(await f.adventures.worlds(), {
        ...example.world,
        packVersionIds: [],
      }),
    )
  ).world;
  f.input = {
    requestId: randomUUID(),
    worldId: f.world.id,
    worldVersion: f.world.version,
    title: `Synthetic ${example.name}`,
    language,
    name: example.name,
    description: example.description,
  };
  f.creation = {
    schemaVersion: 1,
    capabilities: example.caps.map((text) => ({
      text,
      quote: example.description,
    })),
    limitations: example.limits.map((text) => ({
      text,
      quote: example.description,
    })),
    possessions: example.item
      ? [
          {
            name: example.item,
            description: "",
            quantity: 1,
            quote: example.description,
          },
        ]
      : [],
    resources: [],
    questions: [],
  };
  f.opening = {
    schemaVersion: 1,
    location: { name: example.location, description: example.situation },
    situation: example.situation,
    narration: example.narration,
    actors: [
      {
        name: example.npc,
        description: example.situation,
        capabilities: ["ordinary public conversation"],
        limitations: [],
      },
    ],
    questions: [],
  };
  f.profile = resolveExecutionProfile({
    task: "world.compose",
    profileId: randomUUID(),
    globalDefault: {
      providerId: "openai",
      modelId: "gpt-6-sol",
      reasoning: "high",
    },
  });
  f.calls = 0;
  f.service = createBootstrapService(
    f.rpc,
    async (ticket) => {
      f.calls++;
      f.ticket = ticket;
      return {
        output: ticket.kind === "creation" ? f.creation : f.opening,
        usage,
      };
    },
    async () => f.profile,
  );
  f.create = async (review) => {
    const draft = await f.service.perform({
      action: "creation.propose",
      input: f.input,
    });
    f.creationDraft = draft;
    f.creationCommit = {
      action: "creation.commit",
      input: {
        requestId: randomUUID(),
        draftId: draft.draftId,
        review: review ?? initialCreationReview(f.input, draft.proposal),
      },
    };
    const result = await f.service.perform(f.creationCommit);
    f.cid = result.campaignId;
    f.hero = result.heroId;
    return result;
  };
  f.read = async () => f.adventures.read(f.cid, await f.fence(f.cid));
  f.prepare = async () => {
    const prepared = await f.adventures.perform(
      prepareAdventureAttempt(await f.read(), {
        title: "First Adventure",
        premise: example.adventure,
        pacing: { kind: "evening", custom: null },
      }),
    );
    f.start = versionAdventureAttempt(
      prepared.snapshot,
      prepared.snapshot.adventures.find((a) => a.status === "prepared").id,
      "start",
    );
    return f.start;
  };
  f.proposeOpening = async () => {
    await f.prepare();
    f.openingDraft = await f.service.perform({
      action: "opening.propose",
      input: f.start,
    });
    f.openingCommit = {
      action: "opening.commit",
      input: {
        requestId: randomUUID(),
        campaignId: f.cid,
        draftId: f.openingDraft.draftId,
        review: {
          ...initialOpeningReview(f.openingDraft.proposal),
          publicOpeningConfirmed: true,
        },
      },
    };
    return f.openingDraft;
  };
  f.startOpening = async () => {
    await f.proposeOpening();
    return f.service.perform(f.openingCommit);
  };
  f.snapshot = () => f.saves(f.cid, "campaign");
  return f;
}
