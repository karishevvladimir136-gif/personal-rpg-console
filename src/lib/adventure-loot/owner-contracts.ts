import type { FoundationCommand } from "../production/contracts.ts";
// Public owner-form boundary. Server filters objects/choices to positive,
// current knowledge before passing this view to the component.
export type OwnerObjectAccess =
  "open" | "closed" | "locked" | "sealed" | "jammed" | "broken";
export type OwnerLootObject = {
  id: string;
  revision: number;
  storageId: string;
  locationId: string;
  ownerEntityId: string;
  label: string;
  access: OwnerObjectAccess;
  lockClass: string | null;
  structureClass: string | null;
  environmentTags: string[];
  portable: boolean | null;
  contentsEstablished: boolean;
};
export type OwnerLootChoices = {
  storages: { id: string; label: string; entityId: string | null }[];
  locations: { id: string; label: string }[];
  entities: { id: string; label: string }[];
  capabilities: string[];
};
export type OwnerLootView = {
  objects: OwnerLootObject[];
  choices: OwnerLootChoices;
  command: Omit<FoundationCommand, "operationId">;
};
export type CreateOwnerObjectInput = {
  action: "create";
  storageId: string;
  locationId: string;
  ownerEntityId: string;
  label: string;
  access: OwnerObjectAccess;
  portable: boolean | null;
  capability: string;
  lockDc: number | null;
  forceDc: number | null;
};
export type EditOwnerObjectInput = {
  action: "edit";
  objectId: string;
  expectedObjectRevision: number;
  label: string;
  access: OwnerObjectAccess;
  portable: boolean | null;
};
export type OwnerObjectInput = CreateOwnerObjectInput | EditOwnerObjectInput;
