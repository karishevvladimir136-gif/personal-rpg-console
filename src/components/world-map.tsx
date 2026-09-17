// A clean illustrative atlas keeps all pins and labels real, accessible controls.
// It contains only the four locations already known in the sample campaign.
export function WorldMap() {
  const land =
    "M73 91 L115 69 L190 85 L256 92 L329 94 L410 95 L477 90 L526 103 L569 122 L603 125 L618 111 L641 126 L663 117 L681 133 L697 145 L716 153 L750 128 L780 119 L801 123 L827 101 L856 93 L878 63 L900 53 L920 90 L905 118 L884 143 L875 176 L850 186 L827 211 L815 232 L793 250 L785 275 L758 291 L735 329 L716 343 L726 371 L747 412 L746 444 L727 446 L711 416 L687 392 L672 355 L638 359 L604 357 L580 368 L551 354 L528 362 L512 385 L496 418 L480 413 L470 394 L457 373 L428 371 L398 351 L376 335 L345 336 L311 325 L284 312 L248 309 L219 289 L198 279 L167 271 L155 250 L143 237 L127 217 L114 200 L101 183 L95 160 L81 140 Z";
  return (
    <svg
      className="world-map-art"
      viewBox="0 0 1000 560"
      preserveAspectRatio="none"
      role="img"
      aria-label="Illustrative atlas of the Joined America"
    >
      <defs>
        <radialGradient id="sea">
          <stop stopColor="#203b40" />
          <stop offset="1" stopColor="#09171e" />
        </radialGradient>
        <linearGradient id="land" x2=".9" y2="1">
          <stop stopColor="#61543a" />
          <stop offset=".45" stopColor="#3e412e" />
          <stop offset="1" stopColor="#28352c" />
        </linearGradient>
        <pattern
          id="atlas-grid"
          width="50"
          height="50"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M50 0H0V50"
            fill="none"
            stroke="#b7a773"
            strokeOpacity=".09"
          />
        </pattern>
        <filter id="terrain">
          <feTurbulence
            baseFrequency=".075"
            numOctaves="4"
            seed="7"
            result="noise"
          />
          <feColorMatrix in="noise" type="saturate" values="0" />
          <feBlend in="SourceGraphic" mode="soft-light" />
        </filter>
        <clipPath id="continent">
          <path d={land} />
        </clipPath>
      </defs>
      <rect width="1000" height="560" fill="url(#sea)" />
      <rect width="1000" height="560" fill="url(#atlas-grid)" />
      <path d={land} fill="url(#land)" stroke="#a59060" strokeWidth="2" />
      <g clipPath="url(#continent)">
        <rect
          x="70"
          y="50"
          width="860"
          height="430"
          opacity=".35"
          filter="url(#terrain)"
        />
        <g fill="none" stroke="#c3a777" strokeWidth="1" opacity=".3">
          <path d="M130 90L160 180L240 293 M200 80L210 165L285 310 M265 90L285 185L330 330 M330 90L333 220L375 337 M410 90L410 347 M475 92L475 360 M535 100L525 359 M590 115L580 350 M650 120L635 352 M710 150L689 350 M780 130L745 300 M85 150L640 155 M100 206L811 210 M149 263L764 270 M210 309L720 322" />
          <path
            d="M156 100 Q220 153 200 203 T300 314 M184 103 Q250 149 232 200 T338 302 M228 107 Q290 160 269 204 T370 318 M279 110 Q344 171 312 212 T401 329 M820 169 Q727 232 694 304"
            strokeWidth="5"
            strokeOpacity=".2"
          />
          <path
            d="M145 104 Q209 142 183 198 T283 306 M210 114 Q269 159 247 209 T350 322 M254 110 Q319 169 289 215 T384 317 M844 149 Q752 217 718 315"
            strokeWidth="2"
          />
        </g>
        <path
          d="M602 164 Q564 209 594 247 T571 296 T601 358"
          fill="none"
          stroke="#91a496"
          strokeWidth="2"
          opacity=".45"
        />
      </g>
      <g fill="#17313a" stroke="#9e976c" strokeWidth="1">
        <path d="M588 115q40-26 65 10l-35 17-29-8z M651 139q23 18 10 43l-14-12z M675 129q26-7 33 15l-18 17-11-8z M698 176l44-17 7 6-46 21z" />
      </g>
      <g
        fill="#c5bca0"
        opacity=".6"
        fontFamily="Georgia, serif"
        fontSize="13"
        letterSpacing="4"
      >
        <text x="357" y="58">
          CANADIAN REACH
        </text>
        <text x="222" y="154" transform="rotate(-12 222 154)">
          THE WASTES
        </text>
        <text x="50" y="339" transform="rotate(-68 50 339)">
          THE BROKEN COAST
        </text>
        <text x="806" y="391">
          ATLANTIC
        </text>
        <text x="840" y="412">
          RIM
        </text>
        <text x="473" y="487">
          GULF REMNANTS
        </text>
      </g>
      <g stroke="#bcab83" opacity=".7" transform="translate(915 460)">
        <circle r="26" fill="none" />
        <path d="M0-40V40M-40 0H40M-18-18L18 18M18-18L-18 18" />
        <path d="M0-30L6 0 0 30-6 0Z" fill="#bcab83" />
        <text
          y="-48"
          textAnchor="middle"
          fill="#bcab83"
          stroke="none"
          fontFamily="Georgia"
          fontSize="12"
        >
          N
        </text>
      </g>
    </svg>
  );
}
