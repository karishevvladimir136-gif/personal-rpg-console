import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { IDS, frozenCampaign } from "../../spikes/astra-primary-dm/frozen-data.mjs";
import { composeEvaluationPacket } from "../../spikes/astra-primary-dm/evaluation.mjs";
import { ShadowJournal, runShadowTurn } from "../../spikes/astra-primary-dm/prototype.mjs";
import { evaluationCases } from "../../spikes/astra-primary-dm/frozen-data.mjs";

const directory = await mkdtemp(join(tmpdir(), "astra-primary-dm-demo-"));
try {
  const journal = await ShadowJournal.open(join(directory, "shadow-journal.json"), frozenCampaign());
  const scenario = evaluationCases.find((row) => row.id === "jump-kiss");
  const input = { operationId: "synthetic-demo-1", campaignId: IDS.campaign,
    timeline: { timelineId: "synthetic-main", epoch: 1 }, expectedRevision: 7, input: scenario.input };
  const dm = { next: ({ transcript }) => transcript.length
    ? { type: "final", proposal: { schemaVersion: 1, operationId: input.operationId,
      campaignId: input.campaignId, expectedRevision: input.expectedRevision, input: input.input,
      narration: "Mara closes the distance; the innkeeper turns aside. His response remains his own.",
      visualDescription: "The two stand near the tavern counter.",
      publicChanges: [{ family: "actors", id: IDS.hero, expectedRevision: 2,
        values: { position: "nearby", resources: { move: 0, action: 0 } } }],
      privateChanges: [], memoryCandidates: [], rollRefs: [transcript[0].result.id],
      worldMinutes: 720, clarification: null } }
    : { type: "tool", call: { callId: "contact-check", kind: "skill",
      actorId: IDS.hero, targetId: IDS.innkeeper, dc: 13 } } };
  const result = await runShadowTurn({ journal, input,
    composeContext: () => composeEvaluationPacket(scenario, "C").packet,
    dm, random: () => 1 });
  const again = await runShadowTurn({ journal, input,
    composeContext: () => { throw Error("committed retry must not rebuild context"); }, dm });
  if (JSON.stringify(result) !== JSON.stringify(again)) throw Error("idempotent replay failed");
  process.stdout.write(JSON.stringify({ kind: "synthetic-shadow-demo", result,
    journalRevision: journal.data.campaign.revision, providerNetworkCalls: 0 }, null, 2) + "\n");
} finally {
  await rm(directory, { recursive: true, force: true });
}
