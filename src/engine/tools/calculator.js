/**
 * Calculator Tool - Safely evaluates basic mathematical expressions
 */
export const calculatorTool = {
  name: 'calculator',
  label: 'Calculator',
  description: 'Evaluates basic mathematical expressions (e.g. "125 * 4.5", "100 / (2 + 3)")',
  isWriteAction: false,
  inputSchema: {
    type: 'object',
    properties: {
      expression: {
        type: 'string',
        description: 'The math expression to calculate (e.g., "50 * 12 + 45")'
      }
    },
    required: ['expression']
  },
  execute: async ({ expression }) => {
    if (!expression || typeof expression !== 'string') {
      throw new Error('Invalid or missing math expression parameter.');
    }
    // Clean expression to prevent unsafe execution
    const sanitized = expression.replace(/[^0-9+\-*/().\s]/g, '');
    if (!sanitized.trim()) {
      throw new Error('Expression contains no valid numbers or operators.');
    }
    try {
      // Safe Function evaluation for numeric math expressions
      const result = Function(`"use strict"; return (${sanitized})`)();
      if (typeof result !== 'number' || isNaN(result)) {
        throw new Error('Expression resulted in an invalid number.');
      }
      return {
        expression: sanitized,
        result: result,
        formatted: `${sanitized} = ${result}`
      };
    } catch (err) {
      throw new Error(`Failed to calculate expression "${expression}": ${err.message}`);
    }
  }
};
