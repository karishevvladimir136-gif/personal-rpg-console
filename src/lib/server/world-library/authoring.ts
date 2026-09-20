import "server-only";
import { requireOwner } from "../auth";
import { createLibraryStore } from "./store";
import { createOwnerLibraryAuthoring } from "../../world-library/authoring";
import { FoundationValidationError } from "../../world-library/validation";
import { PersistenceError } from "../errors";

export async function ownerLibraryService() {
  const { user } = await requireOwner();
  return createOwnerLibraryAuthoring(user.id, createLibraryStore(user.id));
}

export function ownerLibraryError(cause: unknown): unknown {
  if (!(cause instanceof FoundationValidationError)) return cause;
  return new PersistenceError(
    cause.code === "scope"
      ? "forbidden"
      : cause.code === "configuration"
        ? "not_configured"
        : cause.code,
  );
}
