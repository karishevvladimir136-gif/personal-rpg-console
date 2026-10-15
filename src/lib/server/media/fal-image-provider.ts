import "server-only";
import { authorizeCampaign } from "../campaign-authorization";
import { FAL_IMAGE_MODELS, generateFalImage, type FalImageInput } from "../../visual-frame/fal-image";

/** Which image providers this server can use. Presence only: no key ever leaves the server. */
export async function imageProviderCapability(campaignId: string) {
  await authorizeCampaign(campaignId);
  return {
    fal: {
      configured: Boolean(process.env.FAL_KEY),
      models: FAL_IMAGE_MODELS.map(({ id, label, firstMegapixelUsdMicros, extraMegapixelUsdMicros, note }) =>
        ({ id, label, firstMegapixelUsdMicros, extraMegapixelUsdMicros, note })),
      // Saved subject pictures are validated as OpenAI jobs in SQL today; fal pictures
      // can be stored once stages 3/4 add the provider there (docs/UI_DATA_NEEDS.md).
      persistence: false,
    },
  };
}

/** Server-side fal generation with the configured key (used by the subject-visual
 * pipeline once fal jobs can be persisted). */
export function falImage(input: FalImageInput) {
  return generateFalImage(process.env.FAL_KEY ?? "", input);
}
