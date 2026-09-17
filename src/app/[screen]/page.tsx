import { notFound } from "next/navigation";
import { navigation, type Screen } from "@/lib/mock-data";
import { ScreenView } from "@/components/screens";
export function generateStaticParams() {
  return navigation.map(([screen]) => ({ screen }));
}
export default async function Page({
  params,
}: {
  params: Promise<{ screen: string }>;
}) {
  const { screen } = await params;
  if (!navigation.some(([key]) => key === screen)) notFound();
  return <ScreenView screen={screen as Screen} />;
}
