/**
 * Agent Orchestrator Engine
 * Bounded execution loop with strict security, permission checks, schema validation,
 * human-in-the-loop write approval, idempotency protection, step limits, & audit logging.
 */

import { getTool } from './tools/index.js';
import { validateAgainstSchema } from './schemaValidator.js';
import { generateAgentStep } from './llmProvider.js';

// Global orchestrator registry mapping active runId to orchestrator instance
const orchestratorRegistry = new Map();

export function getOrchestrator(runId) {
  return orchestratorRegistry.get(runId) || null;
}

export class AgentOrchestrator {
  constructor({
    skill,
    version,
    inputData,
    providerConfig,
    onStepUpdate,
    onApprovalRequired,
    onLog
  }) {
    this.skill = skill;
    this.version = version;
    this.inputData = inputData;
    this.providerConfig = providerConfig;
    this.onStepUpdate = onStepUpdate;
    this.onApprovalRequired = onApprovalRequired;
    this.onLog = onLog;

    this.runId = `run-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    this.stepNumber = 0;
    this.maxSteps = version.maxExecutionSteps || 5;
    this.allowedTools = version.allowedTools || [];
    this.actionsRequiringApproval = version.actionsRequiringApproval || [];

    this.executionHistory = [];
    this.logs = [];
    this.status = 'IDLE'; // IDLE, RUNNING, WAITING_FOR_APPROVAL, COMPLETED, FAILED, CANCELLED
    this.cancelled = false;
    this.approvedActions = new Set(); // Set of idempotency keys approved by human
    this.pendingActionData = null; // Stored pending tool invocation awaiting approval

    orchestratorRegistry.set(this.runId, this);
  }

  /**
   * Static factory to restore an orchestrator instance if RAM memory was cleared (e.g. page reload)
   */
  static restore(runData, skill, version, inputData, providerConfig, callbacks) {
    const orchestrator = new AgentOrchestrator({
      skill,
      version,
      inputData,
      providerConfig,
      ...callbacks
    });

    if (runData) {
      orchestrator.runId = runData.runId || orchestrator.runId;
      orchestrator.stepNumber = runData.stepNumber || runData.executionHistory?.length || 0;
      orchestrator.executionHistory = [...(runData.executionHistory || [])];

      // Restore pending action if any from executionHistory
      const pendingStep = orchestrator.executionHistory.slice().reverse().find(h => h.type === 'approval_pending');
      if (pendingStep) {
        const toolDef = getTool(pendingStep.toolName);
        if (toolDef) {
          orchestrator.pendingActionData = {
            toolName: pendingStep.toolName,
            toolDef,
            toolArgs: pendingStep.toolArgs || {},
            idempotencyKey: pendingStep.idempotencyKey
          };
        }
      }
    }

    orchestratorRegistry.set(orchestrator.runId, orchestrator);
    return orchestrator;
  }

  log(level, type, message, details = {}) {
    const entry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      runId: this.runId,
      timestamp: new Date().toISOString(),
      level, // 'info', 'warn', 'error', 'security', 'approval'
      type,  // 'INIT', 'STEP', 'TOOL_CALL', 'TOOL_REFUSAL', 'APPROVAL_REQUEST', 'APPROVAL_DECISION', 'FINISH', 'ERROR'
      message,
      details,
      skillId: this.skill.id,
      version: this.version.version
    };
    this.logs.push(entry);
    if (this.onLog) this.onLog(entry);
  }

  cancel() {
    this.cancelled = true;
    this.status = 'CANCELLED';
    this.pendingActionData = null;
    this.log('warn', 'CANCELLED', `Execution run ${this.runId} was manually cancelled by user.`);
    if (this.onStepUpdate) {
      this.onStepUpdate({
        status: this.status,
        pendingApproval: null,
        stepNumber: this.stepNumber,
        executionHistory: [...this.executionHistory]
      });
    }
  }

  /**
   * Helper method to execute a tool with retries and log history
   */
  async executeToolCall(toolName, toolDef, toolArgs) {
    this.log('info', 'TOOL_CALL', `Executing tool "${toolName}"`, { toolArgs });
    let toolResult;
    let toolError = null;
    const maxRetries = 2;

    for (let retry = 0; retry <= maxRetries; retry++) {
      try {
        toolResult = await toolDef.execute(toolArgs);
        toolError = null;
        break; // Success!
      } catch (err) {
        toolError = err.message;
        this.log('warn', 'TOOL_RETRY', `Tool "${toolName}" execution attempt ${retry + 1} failed: ${err.message}`);
      }
    }

    if (toolError) {
      this.log('error', 'TOOL_FAILED', `Tool "${toolName}" failed after ${maxRetries} retries: ${toolError}`);
      this.executionHistory.push({
        step: this.stepNumber,
        type: 'tool_error',
        timestamp: new Date().toISOString(),
        toolName,
        error: toolError
      });
    } else {
      this.log('info', 'TOOL_RESULT', `Tool "${toolName}" returned result successfully.`, { result: toolResult });
      this.executionHistory.push({
        step: this.stepNumber,
        type: 'tool_result',
        timestamp: new Date().toISOString(),
        toolName,
        toolArgs,
        result: toolResult
      });
    }

    if (this.onStepUpdate) {
      this.onStepUpdate({
        status: this.status,
        pendingApproval: null,
        stepNumber: this.stepNumber,
        executionHistory: [...this.executionHistory]
      });
    }

    return toolResult;
  }

  /**
   * Approves a pending write action and resumes the agent loop
   */
  async approveWriteAction(actionId, idempotencyKey) {
    this.log('approval', 'APPROVAL_DECISION', `Human approval GRANTED for action: ${actionId} (Key: ${idempotencyKey})`);
    this.approvedActions.add(idempotencyKey);
    this.status = 'RUNNING';

    // Execute the approved write tool call immediately
    if (this.pendingActionData) {
      const { toolName, toolDef, toolArgs } = this.pendingActionData;
      this.pendingActionData = null;
      await this.executeToolCall(toolName, toolDef, toolArgs);
    } else if (this.onStepUpdate) {
      this.onStepUpdate({
        status: 'RUNNING',
        pendingApproval: null,
        stepNumber: this.stepNumber,
        executionHistory: [...this.executionHistory]
      });
    }

    return this.continueLoop();
  }

  /**
   * Rejects a pending write action and aborts execution safely
   */
  rejectWriteAction(actionId, reason = 'User rejected write action.') {
    this.log('warn', 'APPROVAL_DECISION', `Human approval REJECTED for action: ${actionId}. Reason: ${reason}`);
    this.status = 'FAILED';
    this.pendingActionData = null;
    this.executionHistory.push({
      step: this.stepNumber,
      type: 'approval_rejected',
      timestamp: new Date().toISOString(),
      reason
    });
    if (this.onStepUpdate) {
      this.onStepUpdate({
        status: 'FAILED',
        pendingApproval: null,
        stepNumber: this.stepNumber,
        executionHistory: [...this.executionHistory],
        error: `Write action rejected by user: ${reason}`
      });
    }
  }

  /**
   * Starts agent execution workflow
   */
  async start() {
    this.status = 'RUNNING';
    this.log('info', 'INIT', `Starting agent execution run ${this.runId} for skill "${this.skill.name}" (v${this.version.version})`);

    // 1. Validate Input Data against Skill Input Schema
    if (this.version.inputSchema) {
      const inputValidation = validateAgainstSchema(this.inputData, this.version.inputSchema);
      if (!inputValidation.valid) {
        const errorMsg = `Input validation failed: ${inputValidation.errors.join('; ')}`;
        this.log('error', 'VALIDATION_ERROR', errorMsg);
        this.status = 'FAILED';
        if (this.onStepUpdate) {
          this.onStepUpdate({
            status: 'FAILED',
            pendingApproval: null,
            error: errorMsg,
            executionHistory: []
          });
        }
        return { success: false, error: errorMsg, logs: this.logs };
      }
    }

    this.log('info', 'VALIDATION_SUCCESS', 'Input schema validation passed successfully.');
    return this.continueLoop();
  }

  /**
   * Main Execution Loop Step by Step
   */
  async continueLoop() {
    while (this.status === 'RUNNING' && !this.cancelled) {
      this.stepNumber += 1;

      // 2. Check Maximum Step Limit
      if (this.stepNumber > this.maxSteps) {
        const stepLimitMsg = `Execution halted: Reached maximum step limit of ${this.maxSteps} steps.`;
        this.log('error', 'MAX_STEPS_EXCEEDED', stepLimitMsg, { maxSteps: this.maxSteps, currentStep: this.stepNumber });
        this.status = 'FAILED';
        if (this.onStepUpdate) {
          this.onStepUpdate({
            status: 'FAILED',
            pendingApproval: null,
            stepNumber: this.stepNumber,
            error: stepLimitMsg,
            executionHistory: [...this.executionHistory]
          });
        }
        return { success: false, status: 'FAILED', error: stepLimitMsg, logs: this.logs };
      }

      this.log('info', 'STEP', `Executing Agent Step ${this.stepNumber}/${this.maxSteps}`);

      // 3. Request LLM Step Decision
      let nextStep;
      try {
        nextStep = await generateAgentStep({
          skill: this.skill,
          version: this.version,
          inputData: this.inputData,
          executionHistory: this.executionHistory,
          stepNumber: this.stepNumber,
          providerConfig: this.providerConfig
        });
      } catch (err) {
        const llmErr = `LLM step generation failed: ${err.message}`;
        this.log('error', 'LLM_ERROR', llmErr);
        this.status = 'FAILED';
        return { success: false, error: llmErr, logs: this.logs };
      }

      // Record thought step
      this.executionHistory.push({
        step: this.stepNumber,
        type: 'thought',
        timestamp: new Date().toISOString(),
        thought: nextStep.thought,
        actionType: nextStep.actionType
      });

      if (this.onStepUpdate) {
        this.onStepUpdate({
          status: this.status,
          pendingApproval: null,
          stepNumber: this.stepNumber,
          executionHistory: [...this.executionHistory]
        });
      }

      // If Agent decides to finish
      if (nextStep.actionType === 'finish') {
        const finalOutput = nextStep.finalOutput || {};

        // Validate final output against output schema
        let schemaValid = true;
        let schemaErrors = [];
        if (this.version.outputSchema) {
          const outValidation = validateAgainstSchema(finalOutput, this.version.outputSchema);
          schemaValid = outValidation.valid;
          schemaErrors = outValidation.errors;
        }

        if (!schemaValid) {
          const errStr = `Final output validation warning: ${schemaErrors.join('; ')}`;
          this.log('warn', 'OUTPUT_SCHEMA_WARNING', errStr);
        } else {
          this.log('info', 'OUTPUT_SCHEMA_SUCCESS', 'Final output schema validation passed.');
        }

        this.status = 'COMPLETED';
        this.log('info', 'FINISH', `Execution run ${this.runId} completed successfully!`, { finalOutput });

        const result = {
          success: true,
          status: 'COMPLETED',
          runId: this.runId,
          totalSteps: this.stepNumber,
          finalOutput,
          executionHistory: [...this.executionHistory],
          logs: this.logs
        };

        if (this.onStepUpdate) {
          this.onStepUpdate({
            status: 'COMPLETED',
            pendingApproval: null,
            stepNumber: this.stepNumber,
            finalOutput,
            executionHistory: [...this.executionHistory]
          });
        }

        return result;
      }

      // Handle Tool Call Action
      if (nextStep.actionType === 'tool_call') {
        const toolName = nextStep.toolName;
        const toolArgs = nextStep.toolArgs || {};

        // SECURITY GUARD 1: Verify if tool is PERMITTED by this skill
        if (!this.allowedTools.includes(toolName)) {
          const refusalMsg = `UNAUTHORIZED TOOL REFUSED: Skill does not grant access to tool "${toolName}". Permitted tools: [${this.allowedTools.join(', ')}].`;
          this.log('security', 'TOOL_REFUSAL', refusalMsg, { requestedTool: toolName, allowedTools: this.allowedTools });

          this.executionHistory.push({
            step: this.stepNumber,
            type: 'tool_refusal',
            timestamp: new Date().toISOString(),
            toolName,
            reason: refusalMsg
          });

          if (this.onStepUpdate) {
            this.onStepUpdate({
              status: this.status,
              pendingApproval: null,
              stepNumber: this.stepNumber,
              executionHistory: [...this.executionHistory]
            });
          }
          // Continue to next step loop so LLM can adapt or finish
          continue;
        }

        // Fetch tool definition from platform registry
        const toolDef = getTool(toolName);
        if (!toolDef) {
          const errTool = `Tool "${toolName}" is permitted but not found in platform system registry.`;
          this.log('error', 'TOOL_NOT_FOUND', errTool);
          continue;
        }

        // SECURITY GUARD 2: Check Human Approval requirement for Write Actions
        const requiresApproval = toolDef.isWriteAction || this.actionsRequiringApproval.includes(toolName);
        const idempotencyKey = toolArgs.idempotencyKey || `idemp-${this.runId}-${toolName}-${this.stepNumber}`;

        if (requiresApproval && !this.approvedActions.has(idempotencyKey)) {
          this.status = 'WAITING_FOR_APPROVAL';
          this.pendingActionData = { toolName, toolDef, toolArgs, idempotencyKey };

          this.log('approval', 'APPROVAL_REQUEST', `Action "${toolName}" requires human approval before execution.`, {
            toolName,
            toolArgs,
            idempotencyKey
          });

          const approvalPayload = {
            runId: this.runId,
            actionId: `act-${Date.now()}`,
            toolName,
            toolLabel: toolDef.label,
            toolArgs,
            idempotencyKey,
            stepNumber: this.stepNumber,
            approve: () => this.approveWriteAction(toolName, idempotencyKey),
            reject: (reason) => this.rejectWriteAction(toolName, reason)
          };

          this.executionHistory.push({
            step: this.stepNumber,
            type: 'approval_pending',
            timestamp: new Date().toISOString(),
            toolName,
            toolArgs,
            idempotencyKey
          });

          if (this.onApprovalRequired) {
            this.onApprovalRequired(approvalPayload);
          }

          if (this.onStepUpdate) {
            this.onStepUpdate({
              status: 'WAITING_FOR_APPROVAL',
              stepNumber: this.stepNumber,
              pendingApproval: approvalPayload,
              executionHistory: [...this.executionHistory]
            });
          }

          // Return pending approval state - wait until user interacts
          return {
            success: false,
            status: 'WAITING_FOR_APPROVAL',
            runId: this.runId,
            pendingApproval: approvalPayload,
            executionHistory: [...this.executionHistory],
            logs: this.logs
          };
        }

        // Execute Tool with Fault Handling & Retry Logic
        await this.executeToolCall(toolName, toolDef, toolArgs);
      }
    }

    return {
      success: this.status === 'COMPLETED',
      status: this.status,
      runId: this.runId,
      executionHistory: [...this.executionHistory],
      logs: this.logs
    };
  }
}
