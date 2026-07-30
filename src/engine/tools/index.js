import { calculatorTool } from './calculator.js';
import { documentSearchTool } from './documentSearch.js';
import { recordLookupTool } from './recordLookup.js';
import { taskCreatorTool } from './taskCreator.js';

export const ALL_TOOLS = [
  calculatorTool,
  documentSearchTool,
  recordLookupTool,
  taskCreatorTool
];

export const TOOL_MAP = ALL_TOOLS.reduce((acc, tool) => {
  acc[tool.name] = tool;
  return acc;
}, {});

/**
 * Validates if a tool name exists in platform registry
 */
export function isValidTool(toolName) {
  return Boolean(TOOL_MAP[toolName]);
}

/**
 * Returns tool object by name
 */
export function getTool(toolName) {
  return TOOL_MAP[toolName] || null;
}
