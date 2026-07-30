import { describe, it, expect } from 'vitest';
import { AgentOrchestrator } from '../src/engine/agentOrchestrator.js';
import { taskCreatorTool } from '../src/engine/tools/taskCreator.js';

describe('Human Approval & Idempotency Safeguards', () => {
  const skillWithWrite = {
    id: 'skl-test-write',
    name: 'Task Dispatcher Skill',
    purpose: 'Creates task tickets requiring approval'
  };

  const writeVersion = {
    version: 1,
    instructions: '1. Create task ticket.',
    inputSchema: { type: 'object' },
    outputSchema: { type: 'object' },
    allowedTools: ['mock_task_creator'],
    actionsRequiringApproval: ['mock_task_creator'],
    maxExecutionSteps: 5
  };

  it('pauses execution and requests approval for write actions', async () => {
    let approvalRequested = false;

    const orchestrator = new AgentOrchestrator({
      skill: skillWithWrite,
      version: writeVersion,
      inputData: { customerEmail: 'alice@acme.com', purchaseAmount: 500 },
      providerConfig: { provider: 'mock' },
      onApprovalRequired: () => {
        approvalRequested = true;
      }
    });

    const res = await orchestrator.start();
    expect(res.status).toBe('WAITING_FOR_APPROVAL');
    expect(approvalRequested).toBe(true);

    // Approve the pending action
    const approvalPayload = res.pendingApproval;
    expect(approvalPayload).toBeDefined();

    const continueRes = await orchestrator.approveWriteAction('mock_task_creator', approvalPayload.idempotencyKey);
    expect(continueRes.status).toBe('COMPLETED');
    expect(continueRes.success).toBe(true);

    // Verify mock_task_creator tool result is in execution history
    const toolStep = orchestrator.executionHistory.find(h => h.toolName === 'mock_task_creator' && h.type === 'tool_result');
    expect(toolStep).toBeDefined();
    expect(toolStep.result.success).toBe(true);
  });

  it('prevents duplicate execution of an approved write action using idempotency key', async () => {
    const key = 'test-idempotency-key-999';
    
    // First call
    const res1 = await taskCreatorTool.execute({
      title: 'First Action Ticket',
      priority: 'high',
      assignee: 'Ops',
      description: 'First execution',
      idempotencyKey: key
    });
    expect(res1.success).toBe(true);
    expect(res1.isDuplicatePrevented).toBe(false);

    // Duplicate call with same idempotency key
    const res2 = await taskCreatorTool.execute({
      title: 'Duplicate Action Ticket',
      priority: 'high',
      assignee: 'Ops',
      description: 'Duplicate execution attempt',
      idempotencyKey: key
    });
    expect(res2.success).toBe(true);
    expect(res2.isDuplicatePrevented).toBe(true);
    expect(res2.message).toContain('Task execution skipped: Action with idempotency key');
  });
});
