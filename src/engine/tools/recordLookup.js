/**
 * Structured Record Lookup Tool - Queries structured records database
 */
const MOCK_RECORDS = {
  users: [
    { id: 'usr-001', name: 'Alice Chen', email: 'alice@acme.com', tier: 'Enterprise', status: 'Active', balance: 1450.00 },
    { id: 'usr-002', name: 'Bob Smith', email: 'bob@techcorp.io', tier: 'Pro', status: 'Active', balance: 220.50 },
    { id: 'usr-003', name: 'Charlie Davis', email: 'charlie@globex.org', tier: 'Free', status: 'Suspended', balance: 0.00 }
  ],
  orders: [
    { id: 'ord-8801', userId: 'usr-001', amount: 499.00, status: 'Completed', date: '2026-07-20' },
    { id: 'ord-8802', userId: 'usr-001', amount: 951.00, status: 'Completed', date: '2026-07-25' },
    { id: 'ord-8803', userId: 'usr-002', amount: 220.50, status: 'Pending', date: '2026-07-28' }
  ],
  inventory: [
    { sku: 'SKU-A10', name: 'Enterprise Cloud License', inStock: 150, price: 499.00 },
    { sku: 'SKU-B20', name: 'Dedicated Server Node', inStock: 12, price: 1200.00 },
    { sku: 'SKU-C30', name: 'API Expansion Pack', inStock: 500, price: 99.00 }
  ]
};

export const recordLookupTool = {
  name: 'structured_record_lookup',
  label: 'Structured Record Lookup',
  description: 'Queries database records across entities (users, orders, inventory) by record ID or search term',
  isWriteAction: false,
  inputSchema: {
    type: 'object',
    properties: {
      table: {
        type: 'string',
        enum: ['users', 'orders', 'inventory'],
        description: 'Target record collection/table'
      },
      searchKey: {
        type: 'string',
        description: 'ID, email, name, or SKU to lookup'
      }
    },
    required: ['table', 'searchKey']
  },
  execute: async ({ table, searchKey }) => {
    if (!table || !searchKey) {
      throw new Error('Both table and searchKey parameters are required.');
    }
    const collection = MOCK_RECORDS[table.toLowerCase()];
    if (!collection) {
      throw new Error(`Table "${table}" does not exist. Available: users, orders, inventory.`);
    }

    const term = searchKey.toLowerCase();
    const matches = collection.filter(item => {
      return Object.values(item).some(val => 
        String(val).toLowerCase().includes(term)
      );
    });

    return {
      table,
      searchKey,
      foundCount: matches.length,
      records: matches
    };
  }
};
