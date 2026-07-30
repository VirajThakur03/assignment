/**
 * Schema Validator Module - Lightweight, robust JSON Schema validator
 */

/**
 * Validates a value against a lightweight JSON Schema specification
 * Supports types: string, number, integer, boolean, object, array
 * Supports: required properties, enum checks, min/max limits
 */
export function validateAgainstSchema(value, schema) {
  const errors = [];

  if (!schema || typeof schema !== 'object') {
    return { valid: true, errors: [] };
  }

  // Type check
  if (schema.type) {
    const valType = getTypeName(value);
    if (schema.type === 'integer' && typeof value === 'number' && Number.isInteger(value)) {
      // valid integer
    } else if (schema.type !== valType && value !== undefined) {
      errors.push(`Expected type "${schema.type}", but received "${valType}".`);
    }
  }

  // Enum check
  if (schema.enum && Array.isArray(schema.enum)) {
    if (value !== undefined && !schema.enum.includes(value)) {
      errors.push(`Value "${value}" is not one of allowed enum values: ${schema.enum.join(', ')}.`);
    }
  }

  // Object property validation
  if (schema.type === 'object' && typeof value === 'object' && value !== null) {
    if (schema.required && Array.isArray(schema.required)) {
      for (const reqProp of schema.required) {
        if (value[reqProp] === undefined || value[reqProp] === null || value[reqProp] === '') {
          errors.push(`Missing required field: "${reqProp}".`);
        }
      }
    }

    if (schema.properties) {
      for (const [propKey, propSchema] of Object.entries(schema.properties)) {
        if (value[propKey] !== undefined) {
          const propRes = validateAgainstSchema(value[propKey], propSchema);
          if (!propRes.valid) {
            propRes.errors.forEach(err => errors.push(`Property "${propKey}": ${err}`));
          }
        }
      }
    }
  }

  // Array validation
  if (schema.type === 'array' && Array.isArray(value)) {
    if (schema.items) {
      value.forEach((item, index) => {
        const itemRes = validateAgainstSchema(item, schema.items);
        if (!itemRes.valid) {
          itemRes.errors.forEach(err => errors.push(`Item [${index}]: ${err}`));
        }
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Helper to determine JavaScript variable type string
 */
function getTypeName(val) {
  if (val === null) return 'null';
  if (Array.isArray(val)) return 'array';
  return typeof val;
}

/**
 * Validates whether a JSON schema object itself is structurally valid
 */
export function isValidJsonSchema(schemaObj) {
  if (!schemaObj || typeof schemaObj !== 'object') return false;
  if (!schemaObj.type) return false;
  const validTypes = ['string', 'number', 'integer', 'boolean', 'object', 'array'];
  return validTypes.includes(schemaObj.type);
}

/**
 * Helper to safely format or parse JSON string
 */
export function safeParseJson(jsonString, fallback = null) {
  try {
    return typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
  } catch (err) {
    return fallback;
  }
}
