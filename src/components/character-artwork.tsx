"use client";

import { useLanguage } from "./language-context";
import styles from "./playtest-game-character.module.css";

// A schematic display stand, not a depiction of the character or worn gear.
// An approved portrait renderer can later replace this presentation component.
export function CharacterArtwork() {
  const { t } = useLanguage();
  return (
    <div className={styles.characterArtwork}>
      <svg
        viewBox="0 0 180 360"
        role="img"
        aria-label={t(
          "Neutral equipment mannequin · appearance not established",
        )}
      >
        <g fill="none" stroke="#b9a17a" strokeWidth="1.5">
          <path d="M34 320H146M62 335H118" strokeOpacity=".35" />
          <path d="M90 300V320" strokeOpacity=".5" />
          <ellipse cx="90" cy="44" rx="18" ry="24" fill="#938b76" />
          <path d="M85 68V81M95 68V81" />
          <path d="M67 82Q90 75 113 82L108 145Q90 154 72 145Z" fill="#6c695a" />
          <path d="M74 161Q90 156 106 161L101 178H79Z" fill="#797361" />
          <path d="M64 86L48 132M45 144L40 187M116 86L132 132M135 144L140 187" />
          <path d="M80 184L73 233M72 246L68 297M100 184L107 233M108 246L112 297" />
          <path d="M59 301H78M102 301H121" strokeLinecap="round" />
          <g fill="#9a8d70">
            <circle cx="61" cy="84" r="4" />
            <circle cx="119" cy="84" r="4" />
            <circle cx="46" cy="138" r="5" />
            <circle cx="134" cy="138" r="5" />
            <circle cx="39" cy="193" r="4" />
            <circle cx="141" cy="193" r="4" />
            <circle cx="90" cy="155" r="4" />
            <circle cx="79" cy="180" r="4" />
            <circle cx="101" cy="180" r="4" />
            <circle cx="72" cy="239" r="5" />
            <circle cx="108" cy="239" r="5" />
          </g>
        </g>
      </svg>
      <p>{t("Equipment mannequin · non-canonical illustration")}</p>
    </div>
  );
}
