/**
 * Mock Task Creator Tool - WRITE ACTION requiring human approval
 * Creates a system action item / ticket in task tracking system.
 */

// In-memory created tasks store
const CREATED_TASKS_DB = [];
const EXECUTED_IDEMPOTENCY_KEYS = new Set();

export const taskCreatorTool = {
  name: 'mock_task_creator',
  label: 'Mock Task Creator',
  description: 'Creates a system action task/ticket. WRITE ACTION: Requires explicit human approval before execution.',
  isWriteAction: true,
  inputSchema: {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        description: 'Short title of the task to create'
      },
      priority: {
        type: 'string',
        enum: ['low', 'medium', 'high', 'urgent'],
        description: 'Task priority level'
      },
      assignee: {
        type: 'string',
        description: 'Target person or group assigned to this task'
      },
      description: {
        type: 'string',
        description: 'Detailed description of work to perform'
      },
      idempotencyKey: {
        type: 'string',
        description: 'Unique key preventing duplicate task creation'
      }
    },
    required: ['title', 'priority', 'assignee', 'description']
  },
  execute: async ({ title, priority, assignee, description, idempotencyKey }) => {
    if (!title || !priority || !assignee || !description) {
      throw new Error('Task creation missing required fields (title, priority, assignee, description).');
    }

    // Check Idempotency Key to prevent duplicate execution
    const key = idempotencyKey || `${title}-${assignee}-${priority}`.toLowerCase();
    if (EXECUTED_IDEMPOTENCY_KEYS.has(key)) {
      const existing = CREATED_TASKS_DB.find(t => t.idempotencyKey === key);
      return {
        success: true,
        isDuplicatePrevented: true,
        message: `Task execution skipped: Action with idempotency key "${key}" was already executed.`,
        task: existing || null
      };
    }

    // Register idempotency key
    EXECUTED_IDEMPOTENCY_KEYS.add(key);

    const newTask = {
      taskId: `TSK-${Math.floor(1000 + Math.random() * 9000)}`,
      title,
      priority,
      assignee,
      description,
      status: 'Open',
      createdAt: new Date().toISOString(),
      idempotencyKey: key
    };

    CREATED_TASKS_DB.push(newTask);

    return {
      success: true,
      isDuplicatePrevented: false,
      message: `Task ${newTask.taskId} created successfully.`,
      task: newTask
    };
  },
  getCreatedTasks: () => [...CREATED_TASKS_DB]
};
