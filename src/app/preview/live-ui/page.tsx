import { LiveUiReview } from "@/components/live-ui-review";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ screen?: string }>;
}) {
  const { screen } = await searchParams;
  return <LiveUiReview initialScreen={screen ?? "campaigns"} />;
}
