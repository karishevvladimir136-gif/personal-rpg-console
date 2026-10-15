"use client";

import { useCallback, type ReactNode } from "react";
import type { CampaignSnapshot } from "@/lib/persistence/contracts";
import { subjectImageFor } from "@/lib/ui/subject-images";
import { ImageResolverProvider, type SubjectRef } from "./primitives";

/** Accepted subject pictures of the live campaign (authenticated short-lived URLs). */
export function LiveImages({ data, children }: { data: CampaignSnapshot; children: ReactNode }) {
  const resolve = useCallback((subject: SubjectRef) => {
    const image = subjectImageFor(data, subject);
    return {
      url: image.url,
      drawing: image.drawing,
      version: image.version ? `${image.version.index}/${image.version.total}` : null,
    };
  }, [data]);
  return <ImageResolverProvider resolve={resolve}>{children}</ImageResolverProvider>;
}

/** Synthetic previews: static sample art and an explicit "drawing" set. */
export function PreviewImages({ images, drawing, children }: { images: Record<string, string>; drawing: Set<string>; children: ReactNode }) {
  const resolve = useCallback((subject: SubjectRef) => ({
    url: images[subject.id] ?? null,
    drawing: drawing.has(subject.id),
    version: images[subject.id] ? "3/3" : null,
  }), [images, drawing]);
  return <ImageResolverProvider resolve={resolve}>{children}</ImageResolverProvider>;
}
