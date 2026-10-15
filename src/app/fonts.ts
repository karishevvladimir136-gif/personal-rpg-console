import { Alegreya_Sans, Old_Standard_TT, PT_Mono } from "next/font/google";

// The registry look: Old Standard TT for display, Alegreya Sans for body,
// PT Mono for labels and numbers. Cyrillic first, Latin kept.
export const displayFont = Old_Standard_TT({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-registry-display",
  display: "swap",
});
export const bodyFont = Alegreya_Sans({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "700"],
  style: ["normal", "italic"],
  variable: "--font-registry-body",
  display: "swap",
});
export const monoFont = PT_Mono({
  subsets: ["latin", "cyrillic"],
  weight: ["400"],
  variable: "--font-registry-mono",
  display: "swap",
});
export const registryFontClasses = [displayFont.variable, bodyFont.variable, monoFont.variable].join(" ");
