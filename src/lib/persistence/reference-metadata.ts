// UI annotations and visual representations are not gameplay reference facts.
// Reserved-prefix detection also excludes malformed metadata from raw editors.
export const referenceMetadataPrefixes = [
  "Personal RPG Console · Places of Belonging · v1\n",
  "RPG_VISUAL_FRAME_V0\n",
] as const;
export function isReferenceMetadata(document: { body: unknown }): boolean {
  const body = document.body;
  return (
    typeof body === "string" &&
    referenceMetadataPrefixes.some((prefix) => body.startsWith(prefix))
  );
}
