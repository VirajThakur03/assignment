import { describe, it, expect } from 'vitest';
import { validateAgainstSchema, isValidJsonSchema } from '../src/engine/schemaValidator.js';

describe('Schema Validator Engine', () => {
  it('validates required properties and property types correctly', () => {
    const schema = {
      type: 'object',
      properties: {
        customerEmail: { type: 'string' },
        purchaseAmount: { type: 'number' }
      },
      required: ['customerEmail', 'purchaseAmount']
    };

    const validData = { customerEmail: 'alice@acme.com', purchaseAmount: 499.00 };
    const validResult = validateAgainstSchema(validData, schema);
    expect(validResult.valid).toBe(true);
    expect(validResult.errors).toHaveLength(0);

    const missingData = { customerEmail: 'alice@acme.com' };
    const invalidResult = validateAgainstSchema(missingData, schema);
    expect(invalidResult.valid).toBe(false);
    expect(invalidResult.errors[0]).toContain('Missing required field: "purchaseAmount"');
  });

  it('detects type mismatches', () => {
    const schema = {
      type: 'object',
      properties: {
        customerEmail: { type: 'string' },
        purchaseAmount: { type: 'number' }
      }
    };

    const invalidTypeData = { customerEmail: 'alice@acme.com', purchaseAmount: 'four hundred' };
    const res = validateAgainstSchema(invalidTypeData, schema);
    expect(res.valid).toBe(false);
    expect(res.errors[0]).toContain('Expected type "number", but received "string"');
  });

  it('checks struct validity of JSON schema definitions', () => {
    expect(isValidJsonSchema({ type: 'object', properties: {} })).toBe(true);
    expect(isValidJsonSchema({ type: 'invalid_type' })).toBe(false);
    expect(isValidJsonSchema(null)).toBe(false);
  });
});
