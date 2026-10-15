// Compiles neutral DM tool definitions into each provider's strict tool
// schema and checks the provider limits up front (docs/MODELS.md). Strict mode
// only shapes what the model emits; arguments are still validated by the
// server against the neutral schema (validateToolArguments).

type Common = {
  description?: string;
  /** The field may be left out by the model. */
  optional?: boolean;
  /** The field may be null. */
  nullable?: boolean;
};
export type DmSchema = Common & (
  | { type: "string"; enum?: readonly string[]; minLength?: number; maxLength?: number; pattern?: string }
  | { type: "integer" | "number"; enum?: readonly number[]; minimum?: number; maximum?: number }
  | { type: "boolean" }
  | { type: "array"; items: DmSchema; minItems?: number; maxItems?: number }
  | { type: "object"; properties: Record<string, DmSchema> }
);
export type DmObjectSchema = { type: "object"; properties: Record<string, DmSchema> };
export type DmToolDefinition = { name: string; description: string; parameters: DmObjectSchema };

export type AnthropicTool = {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
  strict: true;
};
export type OpenAiFunctionTool = {
  type: "function";
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  strict: true;
};
export type CompiledToolset = {
  tools: readonly DmToolDefinition[];
  anthropic: AnthropicTool[];
  openai: OpenAiFunctionTool[];
};

/** Provider limits for strict schemas, checked at compile time. */
export const strictLimits = {
  // The rebuild plan caps the toolset at 20 strict tools for both providers.
  maxTools: 20,
  anthropic: { maxOptionalParameters: 24, maxUnionParameters: 16 },
  openai: { maxProperties: 5000, maxDepth: 10, maxEnumValues: 1000, maxSchemaText: 120_000 },
} as const;

export class DmToolSchemaError extends Error {
  readonly problems: string[];
  constructor(problems: string[]) {
    super(`DM tool schemas are invalid:\n- ${problems.join("\n- ")}`);
    this.name = "DmToolSchemaError";
    this.problems = problems;
  }
}

const toolName = /^[a-zA-Z0-9_-]{1,64}$/;
const propertyName = /^[a-zA-Z0-9_]{1,64}$/;

function bounds(schema: DmSchema): string[] {
  const notes: string[] = [];
  if (schema.type === "string") {
    if (schema.minLength !== undefined) notes.push(`at least ${schema.minLength} characters`);
    if (schema.maxLength !== undefined) notes.push(`at most ${schema.maxLength} characters`);
    if (schema.pattern !== undefined) notes.push(`must match ${schema.pattern}`);
  } else if (schema.type === "integer" || schema.type === "number") {
    if (schema.minimum !== undefined) notes.push(`minimum ${schema.minimum}`);
    if (schema.maximum !== undefined) notes.push(`maximum ${schema.maximum}`);
  } else if (schema.type === "array") {
    if (schema.minItems !== undefined && schema.minItems > 1) notes.push(`at least ${schema.minItems} items`);
    if (schema.maxItems !== undefined) notes.push(`at most ${schema.maxItems} items`);
  }
  return notes;
}

function withNull(type: string, nullable: boolean) {
  return nullable ? [type, "null"] : type;
}

/** Anthropic strict: optional fields are simply not required; length, number
 * and maxItems bounds are not accepted, so they move into the description. */
function anthropicSchema(schema: DmSchema): Record<string, unknown> {
  const nullable = !!schema.nullable;
  const notes = bounds(schema);
  const description = [schema.description, notes.length ? `(${notes.join("; ")})` : ""]
    .filter(Boolean).join(" ");
  const out: Record<string, unknown> = { type: withNull(schema.type, nullable) };
  if (description) out.description = description;
  if ((schema.type === "string" || schema.type === "integer" || schema.type === "number") && schema.enum)
    out.enum = nullable ? [...schema.enum, null] : [...schema.enum];
  if (schema.type === "array") {
    out.items = anthropicSchema(schema.items);
    if (schema.minItems === 0 || schema.minItems === 1) out.minItems = schema.minItems;
  }
  if (schema.type === "object") {
    out.properties = Object.fromEntries(Object.entries(schema.properties)
      .map(([key, value]) => [key, anthropicSchema(value)]));
    out.required = Object.entries(schema.properties).filter(([, value]) => !value.optional).map(([key]) => key);
    out.additionalProperties = false;
  }
  return out;
}

/** OpenAI strict: every field is required; an optional field becomes nullable. */
function openAiSchema(schema: DmSchema): Record<string, unknown> {
  const nullable = !!schema.nullable || !!schema.optional;
  const out: Record<string, unknown> = { type: withNull(schema.type, nullable) };
  if (schema.description) out.description = schema.description;
  if (schema.type === "string") {
    if (schema.enum) out.enum = nullable ? [...schema.enum, null] : [...schema.enum];
    if (schema.minLength !== undefined) out.minLength = schema.minLength;
    if (schema.maxLength !== undefined) out.maxLength = schema.maxLength;
    if (schema.pattern !== undefined) out.pattern = schema.pattern;
  } else if (schema.type === "integer" || schema.type === "number") {
    if (schema.enum) out.enum = nullable ? [...schema.enum, null] : [...schema.enum];
    if (schema.minimum !== undefined) out.minimum = schema.minimum;
    if (schema.maximum !== undefined) out.maximum = schema.maximum;
  } else if (schema.type === "array") {
    out.items = openAiSchema(schema.items);
    if (schema.minItems !== undefined) out.minItems = schema.minItems;
    if (schema.maxItems !== undefined) out.maxItems = schema.maxItems;
  } else if (schema.type === "object") {
    out.properties = Object.fromEntries(Object.entries(schema.properties)
      .map(([key, value]) => [key, openAiSchema(value)]));
    out.required = Object.keys(schema.properties);
    out.additionalProperties = false;
  }
  return out;
}

type Stats = { optional: number; union: number; properties: number; depth: number; enumValues: number; text: number };
function walk(schema: DmSchema, path: string, depth: number, stats: Stats, problems: string[]) {
  stats.depth = Math.max(stats.depth, depth);
  if (schema.optional) stats.optional++;
  if (schema.nullable) stats.union++;
  if ("enum" in schema && schema.enum) {
    stats.enumValues += schema.enum.length;
    stats.text += schema.enum.reduce((sum: number, value) => sum + String(value).length, 0);
    if (!schema.enum.length) problems.push(`${path}: enum must not be empty`);
  }
  if (schema.type === "array") walk(schema.items, `${path}[]`, depth + 1, stats, problems);
  if (schema.type === "object") {
    for (const [key, value] of Object.entries(schema.properties)) {
      if (!propertyName.test(key)) problems.push(`${path}.${key}: property names must match ${propertyName}`);
      stats.properties++;
      stats.text += key.length;
      walk(value, `${path}.${key}`, depth + 1, stats, problems);
    }
  }
}

/** Compile once, at startup. Throws DmToolSchemaError listing every problem. */
export function compileToolset(tools: readonly DmToolDefinition[]): CompiledToolset {
  const problems: string[] = [];
  if (tools.length > strictLimits.maxTools)
    problems.push(`${tools.length} strict tools exceed the limit of ${strictLimits.maxTools}`);
  const names = new Set<string>();
  const stats: Stats = { optional: 0, union: 0, properties: 0, depth: 0, enumValues: 0, text: 0 };
  // An OpenAI optional field becomes a union with null; Anthropic counts only
  // explicitly nullable fields as unions.
  for (const tool of tools) {
    if (!toolName.test(tool.name)) problems.push(`${tool.name}: tool names must match ${toolName}`);
    if (names.has(tool.name)) problems.push(`${tool.name}: duplicate tool name`);
    names.add(tool.name);
    if (!tool.description.trim()) problems.push(`${tool.name}: description is required`);
    if (tool.parameters?.type !== "object" || (tool.parameters as DmSchema).optional || (tool.parameters as DmSchema).nullable)
      problems.push(`${tool.name}: parameters must be a required, non-null object`);
    else walk(tool.parameters, tool.name, 0, stats, problems);
  }
  const anthropicUnions = stats.union;
  if (stats.optional > strictLimits.anthropic.maxOptionalParameters)
    problems.push(`anthropic: ${stats.optional} optional parameters exceed the limit of ${strictLimits.anthropic.maxOptionalParameters}`);
  if (anthropicUnions > strictLimits.anthropic.maxUnionParameters)
    problems.push(`anthropic: ${anthropicUnions} nullable (union-type) parameters exceed the limit of ${strictLimits.anthropic.maxUnionParameters}`);
  if (stats.properties > strictLimits.openai.maxProperties)
    problems.push(`openai: ${stats.properties} properties exceed the limit of ${strictLimits.openai.maxProperties}`);
  if (stats.depth > strictLimits.openai.maxDepth)
    problems.push(`openai: nesting depth ${stats.depth} exceeds the limit of ${strictLimits.openai.maxDepth}`);
  if (stats.enumValues > strictLimits.openai.maxEnumValues)
    problems.push(`openai: ${stats.enumValues} enum values exceed the limit of ${strictLimits.openai.maxEnumValues}`);
  if (stats.text > strictLimits.openai.maxSchemaText)
    problems.push(`openai: ${stats.text} characters of names and enum values exceed the limit of ${strictLimits.openai.maxSchemaText}`);
  if (problems.length) throw new DmToolSchemaError(problems);
  return {
    tools,
    anthropic: tools.map((tool) => ({ name: tool.name, description: tool.description,
      input_schema: anthropicSchema(tool.parameters), strict: true })),
    openai: tools.map((tool) => ({ type: "function", name: tool.name, description: tool.description,
      parameters: openAiSchema(tool.parameters), strict: true })),
  };
}

/** Server-side check of model-provided arguments against the neutral schema,
 * including the bounds strict mode cannot express. Returns the problems. */
export function validateToolArguments(tool: DmToolDefinition, value: unknown): string[] {
  const problems: string[] = [];
  const check = (schema: DmSchema, data: unknown, path: string) => {
    if (data === null) {
      if (!schema.nullable && !schema.optional) problems.push(`${path}: must not be null`);
      return;
    }
    switch (schema.type) {
      case "string":
        if (typeof data !== "string") { problems.push(`${path}: expected a string`); return; }
        if (schema.enum && !schema.enum.includes(data)) problems.push(`${path}: not an allowed value`);
        if (schema.minLength !== undefined && data.length < schema.minLength) problems.push(`${path}: shorter than ${schema.minLength}`);
        if (schema.maxLength !== undefined && data.length > schema.maxLength) problems.push(`${path}: longer than ${schema.maxLength}`);
        if (schema.pattern !== undefined && !new RegExp(schema.pattern, "u").test(data)) problems.push(`${path}: does not match the pattern`);
        return;
      case "integer":
      case "number":
        if (typeof data !== "number" || !Number.isFinite(data) || (schema.type === "integer" && !Number.isInteger(data))) {
          problems.push(`${path}: expected ${schema.type === "integer" ? "an integer" : "a number"}`); return;
        }
        if (schema.enum && !schema.enum.includes(data)) problems.push(`${path}: not an allowed value`);
        if (schema.minimum !== undefined && data < schema.minimum) problems.push(`${path}: below ${schema.minimum}`);
        if (schema.maximum !== undefined && data > schema.maximum) problems.push(`${path}: above ${schema.maximum}`);
        return;
      case "boolean":
        if (typeof data !== "boolean") problems.push(`${path}: expected true or false`);
        return;
      case "array":
        if (!Array.isArray(data)) { problems.push(`${path}: expected a list`); return; }
        if (schema.minItems !== undefined && data.length < schema.minItems) problems.push(`${path}: fewer than ${schema.minItems} items`);
        if (schema.maxItems !== undefined && data.length > schema.maxItems) problems.push(`${path}: more than ${schema.maxItems} items`);
        data.forEach((item, index) => check(schema.items, item, `${path}[${index}]`));
        return;
      case "object": {
        if (typeof data !== "object" || Array.isArray(data)) { problems.push(`${path}: expected an object`); return; }
        const record = data as Record<string, unknown>;
        for (const key of Object.keys(record))
          if (!Object.hasOwn(schema.properties, key)) problems.push(`${path}.${key}: unknown field`);
        for (const [key, child] of Object.entries(schema.properties)) {
          if (!Object.hasOwn(record, key)) {
            if (!child.optional) problems.push(`${path}.${key}: missing`);
            continue;
          }
          check(child, record[key], `${path}.${key}`);
        }
      }
    }
  };
  check(tool.parameters, value, tool.name);
  return problems;
}
