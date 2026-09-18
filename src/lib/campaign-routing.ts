import { campaign, navigation } from "./mock-data.ts";

// Only connected campaigns belong here. Concept cards never resolve to sample data.
export const connectedCampaigns = [campaign];
export const campaignScreens = navigation
  .filter(([screen]) => screen !== "campaigns")
  .map(
    ([screen, label]) =>
      [
        screen as Exclude<(typeof navigation)[number][0], "campaigns">,
        label,
      ] as const,
  );
export type CampaignScreen =
  Exclude<(typeof navigation)[number][0], "campaigns"> | "camp";
export function findCampaign(id: string) {
  return connectedCampaigns.find((entry) => entry.campaign_id === id);
}
export function campaignFromPath(path: string) {
  const match = /^\/campaigns\/([^/]+)\/(?:[^/]+)\/?$/.exec(path);
  return match ? findCampaign(match[1]) : undefined;
}
export function campaignHref(id: string, screen: CampaignScreen = "game") {
  return `/campaigns/${encodeURIComponent(id)}/${screen}`;
}
export function isCampaignScreen(screen: string): screen is CampaignScreen {
  return (
    screen === "camp" || campaignScreens.some(([value]) => value === screen)
  );
}
