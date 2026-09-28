import type { MockArt } from "@/lib/visual-frame/model";

/** Local schematic art deliberately contains no canonical face, place, text, or provider URL. */
export function MockVisualArt({ art, label }: { art: MockArt; label: string }) {
  return (
    <svg
      viewBox="0 0 800 400"
      role="img"
      aria-label={label}
      className="w-full rounded-lg border border-[#765b36] bg-[#15191b]"
    >
      <defs>
        <radialGradient id={`mock-glow-${art}`}>
          <stop stopColor="#8a6940" stopOpacity=".45" />
          <stop offset="1" stopColor="#181b1d" />
        </radialGradient>
      </defs>
      <rect width="800" height="400" fill={`url(#mock-glow-${art})`} />
      <path d="M0 340 Q200 285 400 340 T800 340" stroke="#765b36" fill="none" />
      {art === "portrait" ? (
        <g fill="none" stroke="#c3a678" strokeWidth="3">
          <circle cx="400" cy="153" r="57" />
          <path d="M285 333 Q285 230 400 230 Q515 230 515 333" />
        </g>
      ) : art === "object" ? (
        <g fill="none" stroke="#c3a678" strokeWidth="3">
          <path d="M330 110 L470 110 L510 270 L290 270 Z" />
          <path d="M330 110 L400 70 L470 110 M400 70 L400 270" />
        </g>
      ) : art === "abstract" ? (
        <g fill="none" stroke="#c3a678" strokeWidth="3">
          <circle cx="400" cy="190" r="105" />
          <path d="M295 190 L400 85 L505 190 L400 295 Z" />
        </g>
      ) : (
        <g fill="none" stroke="#c3a678" strokeWidth="3">
          <circle cx="575" cy="105" r="37" />
          <path d="M90 310 L280 145 L430 300 L530 210 L710 310" />
        </g>
      )}
    </svg>
  );
}
