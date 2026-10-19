// Polish 3 §7: the craft set a replay plays with — «live» (the snapshot's own pinned craft, as
// the turn had it), «all» (every active card), «none» (no doctrine, no cards) or «session1»
// (the set active before 2026-10-18: the core doctrine v2 and its ten cards). The snapshot's
// pinned craft (`source.craft`) is what the context builder reads; the variant rewrites it on
// the isolated copy only.
const SESSION1_KEYS = new Set(["how-to-run", "conversation", "scene-closing", "worldbuilding", "opening-hooks", "agency", "consequences", "resistance", "pacing",
  "spotlight", "secrets"]);

export function craftVariant(payload, variant) {
  if (variant === "live") return payload;
  const copy = structuredClone(payload);
  const craft = copy.source.craft;
  if (!craft) return copy;
  if (variant === "none") { copy.source.craft = { ...craft, doctrine: null, library: [], style: craft.style ?? null }; return copy; }
  if (variant === "all") return copy;
  if (variant === "session1") {
    copy.source.craft = { ...craft, library: (craft.library ?? []).filter((card) => SESSION1_KEYS.has(card.key) && !/^polish-/.test(card.key)) };
    return copy;
  }
  throw new Error(`unknown craft variant ${variant}`);
}
