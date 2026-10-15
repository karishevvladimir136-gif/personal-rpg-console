"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useLanguage } from "../language-context";
import type { Rarity } from "@/lib/ui/rarity";
import s from "./registry.module.css";

export { s as registry };

/** Russian first, English kept. New Stage 5 screens carry both phrases inline
 * so the shared catalog (`ru.json`) is not reformatted by this stage. */
export function useCopy() {
  const { language, t } = useLanguage();
  const ru = language === "ru";
  // `t` translates labels produced by the shared presentation helpers (resourcePresentation,
  // inventoryCategoryLabel, characterViewModel) through the shared catalog.
  return Object.assign((russian: string, english: string) => (ru ? russian : english), { ru, language, t });
}
export type Copy = ReturnType<typeof useCopy>;

export function Panel({ title, eyebrow, action, children, className = "", label }: {
  title?: ReactNode; eyebrow?: ReactNode; action?: ReactNode; children: ReactNode; className?: string; label?: string;
}) {
  return (
    <section className={`${s.panel} ${className}`} aria-label={label}>
      {(title || eyebrow || action) && (
        <div className={s.panelHead}>
          <div>
            {eyebrow && <span className={s.eyebrow}>{eyebrow}</span>}
            {title && <h2 className={s.h2}>{title}</h2>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Plate({ eyebrow, title, sub, aside, children }: {
  eyebrow?: ReactNode; title: ReactNode; sub?: ReactNode; aside?: ReactNode; children?: ReactNode;
}) {
  return (
    <header className={s.plate}>
      <div className={s.plateRow}>
        <div className={s.stack} style={{ gap: 4 }}>
          {eyebrow && <span className={s.eyebrow}>{eyebrow}</span>}
          <h1 className={s.h1}>{title}</h1>
          {sub && <span className={s.plateSub}>{sub}</span>}
        </div>
        {aside && <div className={s.row}>{aside}</div>}
      </div>
      {children}
    </header>
  );
}

/** A clearly disabled block: the backend does not provide this data yet (docs/UI_DATA_NEEDS.md). */
export function Later({ children, title }: { children?: ReactNode; title?: ReactNode }) {
  const c = useCopy();
  return (
    <div className={s.later} role="note">
      <span className={s.laterTag}>{c("появится позже", "coming later")}</span>
      {title && <b>{title}</b>}
      {children && <span>{children}</span>}
    </div>
  );
}

export function Gauge({ label, value, max }: { label: string; value: number; max: number | null }) {
  const ratio = max && max > 0 ? Math.max(0, Math.min(1, value / max)) : 1;
  const tone = ratio > 0.5 ? "" : ratio > 0.25 ? s.tubeWarn : s.tubeCrit;
  return (
    <div className={s.gauge}>
      <div className={s.gaugeTop}><span>{label}</span><span className={s.num}>{max ? `${value} / ${max}` : value}</span></div>
      {max ? (
        <div className={s.tube} role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={value}>
          <i className={`${s.tubeFill} ${tone}`} style={{ width: `${Math.round(ratio * 100)}%` }} />
        </div>
      ) : null}
    </div>
  );
}

export function ThinBar({ value, max, label }: { value: number; max: number; label: string }) {
  const ratio = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0;
  const tone = ratio > 0.5 ? "" : ratio > 0.25 ? s.tubeWarn : s.tubeCrit;
  return (
    <div className={s.tubeThin} role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={value}>
      <i className={`${s.tubeFill} ${tone}`} style={{ width: `${Math.round(ratio * 100)}%` }} />
    </div>
  );
}

export function Pips({ left, max, label }: { left: number; max: number; label: string }) {
  const shown = Math.min(max, 12);
  return (
    <span className={s.pips} role="img" aria-label={`${label}: ${left} / ${max}`}>
      {Array.from({ length: shown }, (_, index) => (
        <span key={index} className={index < left ? s.pip : s.pipSpent} />
      ))}
      {max > shown && <span className={s.num}>{left}/{max}</span>}
    </span>
  );
}

export function TabBar<T extends string>({ tabs, value, onChange, label }: {
  tabs: readonly { id: T; label: string; href?: string }[]; value: T; onChange?: (id: T) => void; label: string;
}) {
  return (
    <div className={s.tabs} role="tablist" aria-label={label}>
      {tabs.map((tab) => tab.href ? (
        <a key={tab.id} className={s.tab} href={tab.href} role="tab" aria-selected={tab.id === value}>{tab.label}</a>
      ) : (
        <button key={tab.id} type="button" className={s.tab} role="tab" aria-selected={tab.id === value}
          onClick={() => onChange?.(tab.id)}>{tab.label}</button>
      ))}
    </div>
  );
}

export function Segmented<T extends string>({ options, value, onChange, label, disabled }: {
  options: readonly { value: T; label: string; disabled?: boolean }[]; value: T; onChange: (value: T) => void; label: string; disabled?: boolean;
}) {
  return (
    <div className={s.segmented} role="group" aria-label={label}>
      {options.map((option) => (
        <button key={option.value} type="button" className={s.segment} aria-pressed={option.value === value}
          disabled={disabled || option.disabled} onClick={() => onChange(option.value)}>{option.label}</button>
      ))}
    </div>
  );
}

export function Switch({ checked, onChange, title, hint, disabled }: {
  checked: boolean; onChange: (next: boolean) => void; title: string; hint?: string; disabled?: boolean;
}) {
  return (
    <button type="button" role="switch" aria-checked={checked} className={s.switch} disabled={disabled}
      onClick={() => onChange(!checked)}>
      <span className={s.stack} style={{ gap: 2 }}>
        <span>{title}</span>
        {hint && <span className={`${s.note}`}>{hint}</span>}
      </span>
      <span className={s.switchTrack} aria-hidden="true" />
    </button>
  );
}

export const rarityClass: Record<Rarity, string> = {
  common: s.rarityCommon,
  relic: s.rarityRelic,
  magic: s.rarityMagic,
  story: s.rarityStory,
};

export function RarityLegend() {
  const c = useCopy();
  return (
    <div className={s.legend} aria-label={c("Редкость", "Rarity")}>
      <span className={s.rarityCommon}><i />{c("обычное", "common")}</span>
      <span className={s.rarityRelic}><i />{c("реликт", "relic")}</span>
      <span className={s.rarityMagic}><i />{c("магическое", "magic")}</span>
      <span className={s.rarityStory}><i />{c("сюжетное", "story")}</span>
    </div>
  );
}

/** Image resolver: the live app uses accepted subject visuals; previews supply their own. */
export type SubjectRef = { kind: "entity" | "item" | "location"; id: string };
export type ImageState = { url: string | null; drawing: boolean; version?: string | null };
type ImageResolver = (subject: SubjectRef) => ImageState;
const ImageContext = createContext<ImageResolver | null>(null);
export function ImageResolverProvider({ resolve, children }: { resolve: ImageResolver; children: ReactNode }) {
  return <ImageContext.Provider value={resolve}>{children}</ImageContext.Provider>;
}
export function useSubjectImage(subject: SubjectRef | null): ImageState {
  const resolve = useContext(ImageContext);
  if (!subject || !resolve) return { url: null, drawing: false };
  return resolve(subject);
}

const initial = (name: string) => (name.trim()[0] ?? "?").toUpperCase();

export function Art({ subject, name, className = "", drawingLabel, fit = "cover", position }: {
  subject: SubjectRef | null; name: string; className?: string; drawingLabel?: string; fit?: "cover" | "contain"; position?: string;
}) {
  const c = useCopy();
  const image = useSubjectImage(subject);
  if (image.url)
    // Accepted, short-lived authenticated URLs; next/image cannot proxy them.
    // eslint-disable-next-line @next/next/no-img-element
    return <img className={className} src={image.url} alt={name} style={{ objectFit: fit, objectPosition: position }} />;
  if (image.drawing)
    return <div className={`${s.drawing} ${className}`} role="img" aria-label={c(`${name}: рисуется`, `${name}: drawing`)}>{drawingLabel ?? c("рисуется…", "drawing…")}</div>;
  return <div className={`${s.blankArt} ${className}`} role="img" aria-label={name}>{initial(name)}</div>;
}

export function Avatar({ subject, name, small }: { subject: SubjectRef | null; name: string; small?: boolean }) {
  return (
    <span className={small ? s.avatarSmall : s.avatar}>
      <Art subject={subject} name={name} position="center 25%" />
    </span>
  );
}
