import "server-only";
import { requireOwner } from "../auth";
import { createLibraryStore } from "./store";
import { createOwnerLibraryAuthoring } from "../../world-library/authoring";
import { FoundationValidationError } from "../../world-library/validation";
import { PersistenceError } from "../errors";
import {
  environmentProfileResolver,
  executionProviderOptions,
} from "../model-runtime/profiles";
import { createCompilerProvider } from "./compiler-provider";
import { DmError } from "../../gameplay/dm-errors";

export async function ownerLibraryService() {
  const { user } = await requireOwner();
  const resolve = environmentProfileResolver();
  return createOwnerLibraryAuthoring(user.id, createLibraryStore(user.id), {
    resolveProfile: () => resolve("canon.compile"),
    compile: (input) =>
      createCompilerProvider(
        executionProviderOptions(
          input.job.assistance!.executionProfile,
          "canon.compile",
        ),
      )(input),
  });
}

export function ownerLibraryError(cause: unknown): unknown {
  if (cause instanceof DmError)
    return new PersistenceError(
      cause.code === "configuration"
        ? "not_configured"
        : cause.code === "validation" || cause.code === "context"
          ? "validation"
          : "unavailable",
    );
  if (!(cause instanceof FoundationValidationError)) return cause;
  return new PersistenceError(
    cause.code === "scope"
      ? "forbidden"
      : cause.code === "configuration"
        ? "not_configured"
        : cause.code,
  );
}
