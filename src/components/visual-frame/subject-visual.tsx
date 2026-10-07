"use client";

import Image from "next/image";
import { useLanguage } from "../language-context";
import { MockVisualArt } from "./mock-art";
import type { CampaignSnapshot } from "@/lib/persistence/contracts";
import {
  selectSubjectVisual,
  type PublicVisualSubject,
} from "@/lib/visual-frame/subject-visual";

/** Reusable display for Character, Item Details and Location/Map surfaces. */
export function SubjectVisual({
  snapshot,
  subject,
  className = "",
}: {
  snapshot: CampaignSnapshot;
  subject: PublicVisualSubject;
  className?: string;
}) {
  const { language } = useLanguage();
  const w = (en: string, ru: string) => (language === "ru" ? ru : en);
  const visual = selectSubjectVisual(snapshot, subject);
  if (!visual) return null;

  const caption =
    visual.approval === "approved"
      ? visual.image
        ? w("Approved visual reference", "Утверждённый визуальный образец")
        : w("Approved guidance · no viewable image", "Утверждённый образец · изображение недоступно")
      : visual.approval === "draft"
        ? w("Draft visual reference · not approved", "Черновик визуального образца · не утверждён")
        : visual.image
          ? w("Generated image · not approved as a visual reference", "Созданное изображение · ещё не утверждено как визуальный образец")
          : w("No image yet", "Изображения пока нет");

  return (
    <figure className={`space-y-2 ${className}`.trim()}>
      {visual.image?.kind === "real" ? (
        <Image
          unoptimized
          src={visual.image.url}
          alt={visual.label}
          width={1024}
          height={1024}
          className="h-auto w-full rounded-lg border border-[#765b36] object-contain"
        />
      ) : (
        <MockVisualArt
          art={
            visual.image?.kind === "mock"
              ? visual.image.art
              : visual.placeholderArt
          }
          label={
            visual.image?.kind === "mock"
              ? visual.label
              : w(`No image for ${visual.label}`, `Нет изображения: ${visual.label}`)
          }
        />
      )}
      <figcaption className="text-sm text-[#aab0ad]">{caption}</figcaption>
    </figure>
  );
}
