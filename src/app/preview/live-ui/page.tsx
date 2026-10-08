import { LiveUiReview } from "@/components/live-ui-review";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    screen?: string;
    mapLevel?: string;
    mapArtwork?: string;
    mapPanel?: string;
    mapDetail?: string;
    galleryTab?: string;
  }>;
}) {
  const { screen, mapLevel, mapArtwork, mapPanel, mapDetail, galleryTab } = await searchParams;
  return (
    <LiveUiReview
      initialScreen={screen ?? "campaigns"}
      galleryTab={galleryTab === "maps" ? "Maps" : undefined}
      mapPreset={{
        level: mapLevel === "world" || mapLevel === "region" || mapLevel === "local" ? mapLevel : undefined,
        artwork: mapArtwork === "placeholder" || mapArtwork === "collapsed" ? mapArtwork : undefined,
        panel: mapPanel === "edit-open" || mapPanel === "unplaced-open" ? mapPanel : undefined,
        detail: mapDetail === "open",
      }}
    />
  );
}
