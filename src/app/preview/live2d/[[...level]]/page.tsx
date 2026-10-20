import { notFound } from "next/navigation";
import { Live2dPreview } from "@/components/live2d/live2d-preview";
import { LIVE2D_LEVELS, type Live2dLevel } from "@/lib/live2d/hierarchy";

/** Synthetic 2D Live previews: sample records only, no server or database.
 * ?level=world|region|town|district|scene picks the level, ?travel=1 starts a glide, ?lang=en|ru the language. */
export default async function Page({ params, searchParams }: { params: Promise<{ level?: string[] }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const { level = [] } = await params;
  const query = await searchParams;
  if (level.length > 0) notFound();
  const chosen = query.level && (LIVE2D_LEVELS as readonly string[]).includes(query.level) ? (query.level as Live2dLevel) : null;
  return <Live2dPreview level={chosen} lang={query.lang === "en" ? "en" : query.lang === "ru" ? "ru" : null} travel={query.travel === "1"} />;
}
