// Minimal validator for the strict JSON Schema subset the DM requests send to
// OpenAI (type, enum, anyOf, $ref/$defs, properties, required,
// additionalProperties, items and length/size/number bounds). A scripted fake
// response must satisfy the same schema the live model is constrained by;
// otherwise the fake would claim an output the live API could never return.

function typeOf(value) {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  if (Number.isInteger(value)) return "integer";
  return typeof value;
}

function typeMatches(expected, value) {
  const actual = typeOf(value);
  const list = Array.isArray(expected) ? expected : [expected];
  return list.some((type) => type === actual || (type === "number" && actual === "integer"));
}

export function validateSchema(schema, value, root = schema, path = "$", errors = []) {
  if (!schema || typeof schema !== "object") return errors;
  if (schema.$ref) {
    const name = schema.$ref.replace(/^#\/\$defs\//, "");
    const target = root.$defs?.[name];
    if (!target) errors.push(`${path}: unknown $ref ${schema.$ref}`);
    else validateSchema(target, value, root, path, errors);
    return errors;
  }
  if (schema.anyOf) {
    const branches = schema.anyOf.map((branch) => validateSchema(branch, value, root, path, []));
    if (!branches.some((branchErrors) => branchErrors.length === 0)) {
      const best = branches.reduce((a, b) => (a.length <= b.length ? a : b));
      errors.push(`${path}: matches no anyOf branch (closest: ${best.slice(0, 2).join("; ")})`);
    }
    return errors;
  }
  if (schema.type !== undefined && !typeMatches(schema.type, value)) {
    errors.push(`${path}: expected ${JSON.stringify(schema.type)}, got ${typeOf(value)}`);
    return errors;
  }
  if (schema.enum && !schema.enum.some((entry) => entry === value))
    errors.push(`${path}: ${JSON.stringify(value)} is not one of ${JSON.stringify(schema.enum).slice(0, 200)}`);
  if (typeof value === "string") {
    if (schema.minLength !== undefined && value.length < schema.minLength)
      errors.push(`${path}: shorter than ${schema.minLength}`);
    if (schema.maxLength !== undefined && value.length > schema.maxLength)
      errors.push(`${path}: longer than ${schema.maxLength}`);
  }
  if (typeof value === "number") {
    if (schema.minimum !== undefined && value < schema.minimum) errors.push(`${path}: below ${schema.minimum}`);
    if (schema.maximum !== undefined && value > schema.maximum) errors.push(`${path}: above ${schema.maximum}`);
  }
  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems)
      errors.push(`${path}: fewer than ${schema.minItems} items`);
    if (schema.maxItems !== undefined && value.length > schema.maxItems)
      errors.push(`${path}: more than ${schema.maxItems} items`);
    if (schema.items) value.forEach((entry, index) =>
      validateSchema(schema.items, entry, root, `${path}[${index}]`, errors));
  }
  if (value && typeof value === "object" && !Array.isArray(value) && schema.properties) {
    for (const key of schema.required ?? [])
      if (!Object.hasOwn(value, key)) errors.push(`${path}: missing required ${key}`);
    for (const [key, child] of Object.entries(value)) {
      if (Object.hasOwn(schema.properties, key))
        validateSchema(schema.properties[key], child, root, `${path}.${key}`, errors);
      else if (schema.additionalProperties === false) errors.push(`${path}: unexpected property ${key}`);
    }
  }
  return errors;
}
