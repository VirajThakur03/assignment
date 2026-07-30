/**
 * Document Search Tool - Searches company knowledge base documents
 */
const KNOWLEDGE_BASE_DOCS = [
  {
    id: 'doc-101',
    title: 'Customer Support Escalation Policy',
    category: 'Operations',
    content: 'Standard response SLA for Priority 1 tickets is 15 minutes. Priority 2 tickets require response within 2 hours. Refund requests over $500 require manager sign-off. VIP clients get dedicated Slack support channels.'
  },
  {
    id: 'doc-102',
    title: 'Product Refund and Return Guidelines 2026',
    category: 'Finance',
    content: 'Customers may request a full refund within 30 days of purchase. Software licenses are eligible for pro-rated refunds within 60 days. Return shipping costs are covered for damaged hardware goods.'
  },
  {
    id: 'doc-103',
    title: 'Security Compliance & Data Retention Protocol',
    category: 'Security',
    content: 'All user tokens expire after 24 hours of inactivity. Data backups run daily at 02:00 UTC. Audit logs must be retained for 7 years per SOC2 requirements.'
  },
  {
    id: 'doc-104',
    title: 'API Rate Limiting & Performance Benchmarks',
    category: 'Engineering',
    content: 'Free tier users are limited to 60 requests/minute. Enterprise tier users have a 5,000 requests/minute ceiling. Spike protection activates when error rate exceeds 2.5%.'
  }
];

export const documentSearchTool = {
  name: 'document_search',
  label: 'Document Search',
  description: 'Searches knowledge base documentation by keywords or topic query',
  isWriteAction: false,
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Keyword search query to match in knowledge base'
      },
      category: {
        type: 'string',
        description: 'Optional category filter (Operations, Finance, Security, Engineering)'
      }
    },
    required: ['query']
  },
  execute: async ({ query, category }) => {
    if (!query) {
      throw new Error('Query string is required for document search.');
    }
    const q = query.toLowerCase();
    
    let matches = KNOWLEDGE_BASE_DOCS.filter(doc => {
      const matchQuery = doc.title.toLowerCase().includes(q) || 
                         doc.content.toLowerCase().includes(q) || 
                         doc.category.toLowerCase().includes(q);
      const matchCat = category ? doc.category.toLowerCase() === category.toLowerCase() : true;
      return matchQuery && matchCat;
    });

    if (matches.length === 0) {
      // Fallback fuzzy term check
      const terms = q.split(' ').filter(t => t.length > 2);
      matches = KNOWLEDGE_BASE_DOCS.filter(doc => {
        return terms.some(t => doc.content.toLowerCase().includes(t) || doc.title.toLowerCase().includes(t));
      });
    }

    return {
      query,
      resultsCount: matches.length,
      documents: matches.map(m => ({
        id: m.id,
        title: m.title,
        category: m.category,
        snippet: m.content
      }))
    };
  }
};
