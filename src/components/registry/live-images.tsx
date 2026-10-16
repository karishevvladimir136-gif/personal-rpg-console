"use client";

import { useCallback, type ReactNode } from "react";
import type { CampaignSnapshot } from "@/lib/persistence/contracts";
import { subjectImageFor } from "@/lib/ui/subject-images";
import { anchorFor, compositionForEntity, sharedItemAnchor, type PictureBoard } from "@/lib/visual-frame/pictures";
import { ImageResolverProvider, type SubjectRef } from "./primitives";
import { PicturesProvider, PreviewPictures, usePictures } from "./live-frames";

/** The accepted pictures of the live campaign: a Stage V anchor first (fal pictures with
 * versions), else the earlier subject visual (authenticated short-lived URLs either way). */
export function LiveImages({ data, children }: { data: CampaignSnapshot; children: ReactNode }) {
  return (
    <PicturesProvider data={data}>
      <AnchorResolver data={data}>{children}</AnchorResolver>
    </PicturesProvider>
  );
}

function AnchorResolver({ data, children }: { data: CampaignSnapshot; children: ReactNode }) {
  const pictures = usePictures();
  const board = pictures?.board ?? null;
  const urlFor = pictures?.urlFor ?? null;
  const resolve = useCallback((subject: SubjectRef) => {
    if (board && urlFor) {
      const anchor = anchorOf(board, data, subject);
      if (anchor.picture || anchor.drawing)
        return { url: anchor.picture ? urlFor(anchor.picture) : null, drawing: anchor.drawing, version: anchor.version ? `${anchor.version.index}/${anchor.version.total}` : null };
    }
    const image = subjectImageFor(data, subject);
    return { url: image.url, drawing: image.drawing, version: image.version ? `${image.version.index}/${image.version.total}` : null };
  }, [board, urlFor, data]);
  return <ImageResolverProvider resolve={resolve}>{children}</ImageResolverProvider>;
}

export function anchorOf(board: PictureBoard, data: CampaignSnapshot, subject: SubjectRef) {
  if (subject.kind === "item") return sharedItemAnchor(board, data, subject.id);
  if (subject.kind === "location") return anchorFor(board, subject, "location");
  const entity = data.entities.find((row) => row.id === subject.id);
  return anchorFor(board, subject, entity ? compositionForEntity(entity) : "portrait");
}

/** Synthetic previews: static sample art, an explicit "drawing" set, and a sample picture board. */
export function PreviewImages({ images, drawing, board, children }: { images: Record<string, string>; drawing: Set<string>; board: PictureBoard; children: ReactNode }) {
  const resolve = useCallback((subject: SubjectRef) => ({
    url: images[subject.id] ?? null,
    drawing: drawing.has(subject.id),
    version: images[subject.id] ? "3/3" : null,
  }), [images, drawing]);
  return (
    <PreviewPictures board={board} images={images}>
      <ImageResolverProvider resolve={resolve}>{children}</ImageResolverProvider>
    </PreviewPictures>
  );
}
