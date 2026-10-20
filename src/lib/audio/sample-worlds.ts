// The musical style of the two synthetic sample worlds (the music stage's review pack and the
// preview screens). Synthetic worlds only; written by the session, not by the owner.
export const WORLD_STYLES: Record<string, { title: string; language: "ru" | "en"; styleText: string }> = {
  shov: {
    title: "Мир Шва",
    language: "ru",
    styleText: "Steampunk over the ruins of the Old World: brass and steam, airships over Lisbon and Geneva, the glow of etherite, the Steam League, orcish Ghar. Orchestral-mechanical: strings and brass with ticking clockwork percussion, a pipe organ hum, accordion and Portuguese guitar colours, 19th-century adventure romance with a touch of melancholy.",
  },
  noir: {
    title: "Neon & Rain",
    language: "en",
    styleText: "A rain-soaked neon noir city of stacked towers, syndicates and implants. Synthwave noir: muted trumpet and smoky saxophone over analog synth pads, slow brushed jazz drums, upright bass, tape hiss and rain on glass; late-night jazz in a Blade Runner city.",
  },
};
