import { describe, it, expect } from 'vitest';
import { AgentOrchestrator } from '../src/engine/agentOrchestrator.js';

describe('Agent Tool Scoping & Refusal Engine', () => {
  const sampleSkill = {
    id: 'skl-test-01',
    name: 'Restricted Calculator Skill',
    purpose: 'Only permits calculator tool'
  };

  const restrictedVersion = {
    version: 1,
    instructions: '1. Try to call record lookup.\n2. Call calculator.',
    inputSchema: { type: 'object' },
    outputSchema: { type: 'object' },
    allowedTools: ['calculator'], // DOES NOT allow structured_record_lookup
    actionsRequiringApproval: [],
    maxExecutionSteps: 5
  };

  it('refuses execution of unauthorized tools not in allowedTools', async () => {
    let loggedRefusal = false;

    const orchestrator = new AgentOrchestrator({
      skill: sampleSkill,
      version: restrictedVersion,
      inputData: { customerEmail: 'alice@acme.com' },
      providerConfig: { provider: 'mock' },
      onLog: (entry) => {
        if (entry.type === 'TOOL_REFUSAL') {
          loggedRefusal = true;
        }
      }
    });

    const res = await orchestrator.start();
    // Verify refusal step logged in execution trace
    const refusalStep = orchestrator.executionHistory.find(h => h.type === 'tool_refusal');
    expect(refusalStep).toBeDefined();
    expect(refusalStep.reason).toContain('UNAUTHORIZED TOOL REFUSED');
    expect(loggedRefusal).toBe(true);
  });
});
