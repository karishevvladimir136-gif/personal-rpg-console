import { loadSaves } from "../../lib/saves/client.ts";
import { loadLabCatalog } from "../world-lab/client.ts";
import type { SavesSnapshot } from "../../lib/saves/contracts.ts";
import type { LabCatalog } from "../../lib/world-lab/contracts.ts";

export type TimelineReadTransport = {
  saves: (campaignId: string) => Promise<SavesSnapshot>;
  lab: (
    campaignId: string,
    signal: AbortSignal,
    language: "en" | "ru",
  ) => Promise<LabCatalog>;
};
export const timelineReadTransport: TimelineReadTransport = {
  saves: loadSaves,
  lab: (campaignId, signal, language) =>
    loadLabCatalog(campaignId, signal, fetch, language),
};
export async function readTimelineSupplement(
  campaignId: string,
  language: "en" | "ru",
  signal: AbortSignal,
  transport = timelineReadTransport,
) {
  const [saves, lab] = await Promise.allSettled([
    transport.saves(campaignId),
    transport.lab(campaignId, signal, language),
  ]);
  return {
    saves:
      saves.status === "fulfilled" && saves.value.campaignId === campaignId
        ? saves.value
        : null,
    lab:
      lab.status === "fulfilled" && lab.value.campaignId === campaignId
        ? lab.value
        : null,
  };
}
