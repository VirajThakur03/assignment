/**
 * Mock Seed Data - Sample Skills, Versions, Knowledge Documents & Records
 */

export const SEED_SKILLS = [
  {
    id: 'skl-001',
    name: 'Customer Support SLA & Refund Agent',
    purpose: 'Analyzes user account status, checks SLA policy documents, calculates refund amounts, and creates support tickets if required.',
    status: 'published',
    currentVersion: 2,
    createdAt: '2026-07-28T10:00:00.000Z',
    updatedAt: '2026-07-29T09:30:00.000Z',
    versions: [
      {
        version: 1,
        status: 'published',
        publishedAt: '2026-07-28T10:00:00.000Z',
        name: 'Customer Support SLA Agent v1',
        purpose: 'Checks SLA policies and calculates refund amounts.',
        instructions: '1. Search for refund policy in documents.\n2. Look up customer record in database.\n3. Calculate refund value using calculator.\n4. Output summary.',
        inputSchema: {
          type: 'object',
          properties: {
            customerEmail: { type: 'string', description: 'Customer email address' },
            refundReason: { type: 'string', description: 'Reason for refund request' },
            purchaseAmount: { type: 'number', description: 'Original order total' }
          },
          required: ['customerEmail', 'purchaseAmount']
        },
        outputSchema: {
          type: 'object',
          properties: {
            customerName: { type: 'string' },
            approvedRefundAmount: { type: 'number' },
            policyNotes: { type: 'string' },
            status: { type: 'string' }
          },
          required: ['approvedRefundAmount', 'status']
        },
        examples: [
          {
            input: { customerEmail: 'alice@acme.com', refundReason: 'License cancellation', purchaseAmount: 499.00 },
            output: { customerName: 'Alice Chen', approvedRefundAmount: 499.00, policyNotes: 'Eligible within 30 days', status: 'APPROVED' }
          }
        ],
        allowedTools: ['calculator', 'document_search', 'structured_record_lookup'],
        actionsRequiringApproval: [],
        maxExecutionSteps: 6
      },
      {
        version: 2,
        status: 'published',
        publishedAt: '2026-07-29T09:30:00.000Z',
        name: 'Customer Support SLA & Refund Agent v2',
        purpose: 'Enhanced agent with automated task creation for high-priority support tickets.',
        instructions: '1. Look up customer record using structured_record_lookup.\n2. Search document_search for relevant policy SLA.\n3. Use calculator to compute refund or SLA credit.\n4. If refund > $300 or VIP tier, use mock_task_creator to issue an urgent support ticket.\n5. Produce final JSON summary.',
        inputSchema: {
          type: 'object',
          properties: {
            customerEmail: { type: 'string', description: 'Customer email address' },
            refundReason: { type: 'string', description: 'Reason for refund request' },
            purchaseAmount: { type: 'number', description: 'Original order total' }
          },
          required: ['customerEmail', 'purchaseAmount']
        },
        outputSchema: {
          type: 'object',
          properties: {
            customerName: { type: 'string' },
            tier: { type: 'string' },
            approvedRefundAmount: { type: 'number' },
            taskCreated: { type: 'boolean' },
            summary: { type: 'string' }
          },
          required: ['customerName', 'approvedRefundAmount', 'summary']
        },
        examples: [
          {
            input: { customerEmail: 'alice@acme.com', refundReason: 'System outage during deploy', purchaseAmount: 499.00 },
            output: { customerName: 'Alice Chen', tier: 'Enterprise', approvedRefundAmount: 499.00, taskCreated: true, summary: 'Full refund authorized & escalation ticket created.' }
          }
        ],
        allowedTools: ['calculator', 'document_search', 'structured_record_lookup', 'mock_task_creator'],
        actionsRequiringApproval: ['mock_task_creator'],
        maxExecutionSteps: 8
      }
    ]
  },
  {
    id: 'skl-002',
    name: 'Strict Security Audit & Compliance Checker',
    purpose: 'Verifies data retention and token policies. Demonstrates tool refusal when unauthorized tools are called.',
    status: 'published',
    currentVersion: 1,
    createdAt: '2026-07-29T08:00:00.000Z',
    updatedAt: '2026-07-29T08:00:00.000Z',
    versions: [
      {
        version: 1,
        status: 'published',
        publishedAt: '2026-07-29T08:00:00.000Z',
        name: 'Strict Security Audit & Compliance Checker v1',
        purpose: 'Reads security documentation and computes data retention windows.',
        instructions: '1. Search document_search for "Security Compliance & Data Retention Protocol".\n2. Compute days left using calculator.\n3. Note: This skill explicitly does NOT have access to mock_task_creator or database lookup.',
        inputSchema: {
          type: 'object',
          properties: {
            auditTopic: { type: 'string', description: 'Security topic to audit' }
          },
          required: ['auditTopic']
        },
        outputSchema: {
          type: 'object',
          properties: {
            auditTopic: { type: 'string' },
            complianceStatus: { type: 'string' },
            details: { type: 'string' }
          },
          required: ['complianceStatus', 'details']
        },
        examples: [
          {
            input: { auditTopic: 'token expiration' },
            output: { auditTopic: 'token expiration', complianceStatus: 'PASS', details: 'Tokens expire after 24 hours.' }
          }
        ],
        allowedTools: ['document_search', 'calculator'],
        actionsRequiringApproval: [],
        maxExecutionSteps: 4
      }
    ]
  }
];
