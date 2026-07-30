import { describe, it, expect } from 'vitest';
import { AgentOrchestrator } from '../src/engine/agentOrchestrator.js';

describe('Step Limit & Execution Boundaries', () => {
  const tightSkill = {
    id: 'skl-test-step',
    name: 'Tight Boundary Skill',
    purpose: 'Exceeds step limit'
  };

  const tightVersion = {
    version: 1,
    instructions: 'Perform many tools',
    inputSchema: { type: 'object' },
    outputSchema: { type: 'object' },
    allowedTools: ['calculator', 'document_search', 'structured_record_lookup'],
    actionsRequiringApproval: [],
    maxExecutionSteps: 2 // Tight limit of 2 steps max!
  };

  it('halts execution when maxExecutionSteps limit is reached', async () => {
    const orchestrator = new AgentOrchestrator({
      skill: tightSkill,
      version: tightVersion,
      inputData: { customerEmail: 'alice@acme.com', purchaseAmount: 100 },
      providerConfig: { provider: 'mock' }
    });

    const res = await orchestrator.start();
    expect(res.status).toBe('FAILED');
    expect(res.error).toContain('Reached maximum step limit of 2 steps');
  });

  it('handles manual cancellation correctly', async () => {
    const orchestrator = new AgentOrchestrator({
      skill: tightSkill,
      version: tightVersion,
      inputData: {},
      providerConfig: { provider: 'mock' }
    });

    orchestrator.cancel();
    expect(orchestrator.status).toBe('CANCELLED');
  });
});
