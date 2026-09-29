"use client";

import { useId } from "react";
import { useLanguage } from "./language-context";
import styles from "./playtest-game-character.module.css";

// Presentation placeholder only. An approved portrait renderer can replace
// this component without changing character records or equipment authority.
export function CharacterArtwork() {
  const { t } = useLanguage();
  const id = useId();
  return (
    <div className={styles.characterArtwork}>
      <svg
        viewBox="0 0 280 580"
        role="img"
        aria-label={t(
          "Neutral character silhouette · appearance not established",
        )}
      >
        <defs>
          <linearGradient id={`${id}-cloth`} x1="0" x2="1" y2="1">
            <stop stopColor="#777362" />
            <stop offset="0.45" stopColor="#292c2a" />
            <stop offset="1" stopColor="#0e1516" />
          </linearGradient>
          <radialGradient id={`${id}-light`}>
            <stop stopColor="#bb9b6530" />
            <stop offset="1" stopColor="#0b111500" />
          </radialGradient>
        </defs>
        <ellipse
          cx="140"
          cy="295"
          rx="138"
          ry="275"
          fill={`url(#${id}-light)`}
        />
        <path
          d="M45 490V147Q140 42 235 147V490"
          fill="none"
          stroke="#9d8257"
          strokeOpacity=".28"
        />
        <path
          d="M59 490V157Q140 67 221 157V490"
          fill="none"
          stroke="#9d8257"
          strokeOpacity=".12"
        />
        <ellipse
          cx="140"
          cy="516"
          rx="89"
          ry="16"
          fill="#030809"
          opacity=".7"
        />
        <path
          d="M99 160Q92 128 110 105Q140 79 170 105Q188 128 181 160L202 179Q208 255 221 342L205 404L198 496Q169 513 145 498Q119 518 80 499L78 402L63 344Q77 269 78 179Z"
          fill={`url(#${id}-cloth)`}
          stroke="#9a8861"
          strokeOpacity=".4"
        />
        <path
          d="M107 148Q107 108 140 104Q174 111 173 148L140 178Z"
          fill="#090f12"
        />
        <path
          d="M100 157L140 184L180 156M84 186L109 237L83 473M196 188L170 239L198 482M140 188L122 491M149 244L161 487"
          fill="none"
          stroke="#a1906c"
          strokeOpacity=".32"
          strokeWidth="2"
        />
        <path
          d="M74 344L92 359M207 346L188 361M108 241L128 260L138 425"
          fill="none"
          stroke="#050c10"
          strokeOpacity=".7"
          strokeWidth="5"
        />
        <path
          d="M113 502L109 526H133L139 501M149 501L148 526H175L169 503"
          fill="#141b1c"
          stroke="#736849"
          strokeOpacity=".4"
        />
        <path
          d="M104 547H176M140 540L145 547L140 554L135 547Z"
          fill="none"
          stroke="#b79862"
          strokeOpacity=".65"
        />
      </svg>
      <p>
        {t(
          "Illustrative placeholder · not your character’s established appearance",
        )}
      </p>
    </div>
  );
}
