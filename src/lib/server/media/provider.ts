import "server-only";
import { MediaFrameError } from "./orchestration.ts";
import type { MediaProvider } from "./orchestration.ts";
import { imageResponsePixels } from "./png.ts";
import { MAX_FRAME_PROMPT_UTF8, textOnlyReservationFloor } from "./pricing.ts";
import {
  IMAGE_MODELS,
  isFrameParameters,
} from "../../visual-frame/real-frame.ts";
export function openAiFrameProvider(
  apiKey: string,
  request: typeof fetch = fetch,
): MediaProvider {
  return {
    async generate(frame, jobId) {
      if (
        !apiKey ||
        frame.provider !== "OpenAI" ||
        frame.status !== "generating" ||
        !IMAGE_MODELS.includes(frame.model) ||
        !isFrameParameters(frame.parameters) ||
        frame.basis.references.some((r) => r.imageAssetId !== null) ||
        new TextEncoder().encode(frame.prompt).length > MAX_FRAME_PROMPT_UTF8 ||
        !frame.dispatch ||
        textOnlyReservationFloor(frame.prompt, frame.parameters) >
          frame.dispatch.reservationUsdMicros
      )
        throw new MediaFrameError("not_configured");
      let response: Response;
      try {
        response = await request(
          "https://api.openai.com/v1/images/generations",
          {
            method: "POST",
            redirect: "error",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: frame.model,
              prompt: frame.prompt,
              size: frame.parameters.size,
              quality: frame.parameters.quality,
              output_format: frame.parameters.outputFormat,
              n: 1,
              stream: false,
            }),
            signal: AbortSignal.timeout(120_000),
          },
        );
      } catch {
        throw new MediaFrameError("unavailable");
      }
      if (!response.ok) {
        // Only definite provider rejections are failed; transport/5xx outcomes remain uncertain.
        throw new MediaFrameError(
          [400, 401, 403, 404, 422, 429].includes(response.status)
            ? "validation"
            : "unavailable",
        );
      }
      // No provider response, prompt, key, base64 or unsigned external URL enters a log/client error.
      try {
        const limit = 17_000_000;
        if (
          Number(response.headers.get("content-length")) > limit ||
          !response.body
        )
          throw new Error("invalid_image");
        const reader = response.body.getReader(),
          decoder = new TextDecoder();
        let body = "",
          size = 0;
        try {
          for (;;) {
            const chunk = await reader.read();
            if (chunk.done) break;
            size += chunk.value.byteLength;
            if (size > limit) {
              await reader.cancel();
              throw new Error("invalid_image");
            }
            body += decoder.decode(chunk.value, { stream: true });
          }
          body += decoder.decode();
        } finally {
          reader.releaseLock();
        }
        const value = JSON.parse(body);
        if (
          (value.model !== undefined && value.model !== frame.model) ||
          (value.size !== undefined && value.size !== frame.parameters.size) ||
          (value.quality !== undefined &&
            value.quality !== frame.parameters.quality) ||
          (value.output_format !== undefined && value.output_format !== "png")
        )
          throw new Error("mismatched_output");
        return imageResponsePixels(
          value,
          frame.campaign_id,
          jobId,
          frame.parameters,
          response.headers.get("x-request-id"),
        );
      } catch {
        throw new MediaFrameError("unavailable");
      }
    },
  };
}
