// JSON-schema fragment for the existing dm.plan / world.resolve transports.
// Every branch is strict. Use { anyOf: [foundationActionSchema, {type:"null"}] }
// for an optional action in an enclosing strict provider envelope.
type ActionSchema = {
  type?: "object" | "array" | "string" | "integer" | "boolean" | "null";
  properties?: Record<string, ActionSchema>;
  required?: string[];
  additionalProperties?: false;
  items?: ActionSchema;
  anyOf?: ActionSchema[];
  enum?: (string | number | boolean | null)[];
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  maxItems?: number;
  pattern?: string;
};
const id: ActionSchema = {
  type: "string",
  pattern:
    "^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$",
};
const definitionId: ActionSchema = {
  type: "string",
  pattern: "^[a-z0-9][a-z0-9_-]{0,79}$",
};
const object = (properties: Record<string, ActionSchema>): ActionSchema => ({
  type: "object",
  additionalProperties: false,
  required: Object.keys(properties),
  properties,
});
const quantities: ActionSchema = {
  type: "array",
  maxItems: 50,
  items: object({
    itemId: id,
    quantity: { type: "integer", minimum: 1, maximum: 1000000 },
  }),
};
const common: Record<string, ActionSchema> = {
  schemaVersion: { type: "integer", enum: [1] },
  input: { type: "string", minLength: 1, maxLength: 20000 },
};
const target: Record<string, ActionSchema> = {
  merchantActorId: id,
  playerEntityId: id,
  checkIndex: {
    anyOf: [{ type: "integer", minimum: 0, maximum: 7 }, { type: "null" }],
  },
};

export const foundationActionSchema: ActionSchema = {
  anyOf: [
    object({
      ...common,
      action: { type: "string", enum: ["loot"] },
      intent: {
        anyOf: [
          object({
            kind: { type: "string", enum: ["search"] },
            actorId: id,
            objectId: id,
          }),
          object({
            kind: { type: "string", enum: ["access"] },
            actorId: id,
            objectId: id,
            approachId: definitionId,
          }),
          object({
            kind: { type: "string", enum: ["take"] },
            actorId: id,
            objectId: id,
            itemId: id,
            quantity: { type: "integer", minimum: 1, maximum: 1000000 },
            destinationStorageId: id,
          }),
        ],
      },
    }),
    object({
      ...common,
      action: { type: "string", enum: ["quote", "trade"] },
      intent: object({
        merchantActorId: id,
        playerEntityId: id,
        take: quantities,
        give: quantities,
        currencyId: definitionId,
        haggle: { type: "string", enum: ["none", "favorable"] },
      }),
      expectedPayment: {
        anyOf: [
          { type: "integer", minimum: -1000000000, maximum: 1000000000 },
          { type: "null" },
        ],
      },
    }),
    object({
      ...common,
      action: { type: "string", enum: ["haggle"] },
      ...target,
    }),
    object({
      ...common,
      action: { type: "string", enum: ["theft", "robbery"] },
      ...target,
      take: quantities,
      currency: {
        anyOf: [
          object({
            currencyId: definitionId,
            amount: { type: "integer", minimum: 1, maximum: 1000000 },
          }),
          { type: "null" },
        ],
      },
      merchantUnavailable: { type: "boolean" },
    }),
  ],
};
