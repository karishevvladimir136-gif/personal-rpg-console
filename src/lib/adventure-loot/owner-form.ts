import type {
  OwnerObjectAccess,
  OwnerLootChoices,
  OwnerLootObject,
  CreateOwnerObjectInput,
  EditOwnerObjectInput,
} from "./owner-contracts.ts";
export const ownerAccessOptions: OwnerObjectAccess[] = [
  "open",
  "closed",
  "locked",
  "sealed",
  "jammed",
  "broken",
];
export type AppearanceDraft = {
  label: string;
  access: OwnerObjectAccess;
  portable: boolean | null;
};
export type CreationDraft = AppearanceDraft & {
  storageId: string;
  locationId: string;
  ownerEntityId: string;
  capability: string;
  lockDc: string;
  forceDc: string;
};
export class OwnerObjectFormError extends Error {
  readonly code: "label" | "choices" | "dc";
  constructor(code: OwnerObjectFormError["code"]) {
    super("Object details need review.");
    this.code = code;
  }
}
function appearance(draft: AppearanceDraft): AppearanceDraft {
  const label = draft.label.trim();
  if (!label || label.length > 200 || /[\u0000-\u001f]/.test(label))
    throw new OwnerObjectFormError("label");
  if (
    !ownerAccessOptions.includes(draft.access) ||
    ![true, false, null].includes(draft.portable)
  )
    throw new OwnerObjectFormError("choices");
  return { label, access: draft.access, portable: draft.portable };
}
function optionalDc(value: string): number | null {
  const text = value.trim();
  if (!text) return null;
  if (!/^[0-9]{1,2}$/.test(text) || Number(text) < 1 || Number(text) > 40)
    throw new OwnerObjectFormError("dc");
  return Number(text);
}
export function buildCreateOwnerObjectInput(
  draft: CreationDraft,
  choices: OwnerLootChoices,
): CreateOwnerObjectInput {
  const storage = choices.storages.find(
    (storage) => storage.id === draft.storageId,
  );
  if (
    !storage ||
    !storage.entityId ||
    storage.entityId !== draft.ownerEntityId ||
    !choices.entities.some((entity) => entity.id === draft.ownerEntityId) ||
    !choices.locations.some((location) => location.id === draft.locationId) ||
    !choices.capabilities.includes(draft.capability)
  )
    throw new OwnerObjectFormError("choices");
  return {
    action: "create",
    storageId: storage.id,
    locationId: draft.locationId,
    ownerEntityId: storage.entityId,
    ...appearance(draft),
    capability: draft.capability,
    lockDc: optionalDc(draft.lockDc),
    forceDc: optionalDc(draft.forceDc),
  };
}
export function buildEditOwnerObjectInput(
  object: OwnerLootObject,
  draft: AppearanceDraft,
): EditOwnerObjectInput {
  return {
    action: "edit",
    objectId: object.id,
    expectedObjectRevision: object.revision,
    ...appearance(draft),
  };
}
