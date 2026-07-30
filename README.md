# SkillCraft AI — Dynamic User-Defined Skills Agent Platform

> **Option B (Hard Difficulty — Weight 2.0)**  
> An enterprise-grade, full-stack AI Agent Platform enabling users to author, validate, version, test, and execute reusable AI skills with strict permission boundaries, human-in-the-loop write approval, idempotency protection, and audit trails.

---

## 🚀 Live Demo & Deployment

- **GitHub Pages Live Deployment**: `https://<your-username>.github.io/<repo-name>/`
- **Automated Deployment**: Includes `.github/workflows/deploy.yml` for zero-friction continuous deployment directly to GitHub Pages on `git push`.

---

## 🌟 Key Product Capabilities

### 1. Reusable AI Skill Definition & Validation
- **Skill Metadata**: Author skills with Name, Purpose, Directives/System Instructions, Permitted Tools, Actions Requiring Approval, and Max Execution Steps.
- **Strict JSON Schema Validation**: Form-based and programmatic validation of `inputSchema` and `outputSchema` before saving or executing.

### 2. Versioning & Side-by-Side Comparison
- **Draft & Published Lifecycle**: Supports drafting new versions (`v1`, `v2`, etc.) without disrupting published agent behavior.
- **Visual Version Diff Viewer**: Side-by-side comparison of two versions highlighting instruction changes, added/removed permitted tools, max steps, and schema diffs.
- **Version Rerun**: Test or re-execute any previous skill version directly from the library.

### 3. Permitted Tool Registry & Scoping Security
Bounded set of built-in tools:
- 🧮 `calculator`: Evaluates safe numeric math expressions.
- 📚 `document_search`: Searches embedded knowledge base documentation.
- 🗄️ `structured_record_lookup`: Queries database tables (`users`, `orders`, `inventory`).
- ✍️ `mock_task_creator`: Creates system tickets (**WRITE ACTION** requiring explicit approval).

**Security Guard**: If an LLM attempts to call a tool outside the skill's `allowedTools`, the orchestrator immediately **refuses the invocation**, logs a `TOOL_REFUSAL` event, and prevents unauthorized tool execution.

### 4. Human-in-the-Loop Write Approval & Idempotency Safeguards
- **Write Approval Interception**: Intercepts actions marked as write operations (e.g. `mock_task_creator`) and displays an interactive modal showing parameters and idempotency keys.
- **Idempotency Key Guard**: Assigns unique idempotency keys to write requests. If an approved action is triggered twice, the system prevents duplicate side-effects.

### 5. Fault Handling, Step Limits & Cancellation
- **Max Step Limit Enforcement**: Halts execution if `maxExecutionSteps` is exceeded, preventing infinite loops.
- **Tool Error Retries**: Retries failing tool invocations up to 2 times before failing gracefully.
- **Manual Cancellation**: User can abort running executions at any time.

### 6. Audit Trail & Real-Time Step Trace Visualizer
- **Real-Time Step Trace**: Visualizes agent reasoning, tool call inputs, outputs, and status badges.
- **Audit Log Viewer**: Filterable log of info, approval decisions, security refusals, and error events.

---

## 🛠️ Architecture & Tech Stack

```
c:/V/assignment/
├── .github/workflows/deploy.yml   # GitHub Actions automated deploy to GitHub Pages
├── src/
│   ├── components/                # React UI components (Navbar, SkillCard, ExecutionWorkbench, etc.)
│   ├── engine/
│   │   ├── tools/                 # Bounded tool definitions (calculator, docSearch, recordLookup, taskCreator)
│   │   ├── agentOrchestrator.js   # Execution loop, permission checks, step limits, idempotency
│   │   ├── schemaValidator.js     # Input & output JSON schema validator
│   │   ├── llmProvider.js         # Intelligent Mock Simulator & Live LLM API callers
│   │   └── mockData.js            # Initial seed skills & knowledge records
│   ├── store/
│   │   └── usePlatformStore.js    # Zustand store with LocalStorage persistence
│   ├── tests/                     # Vitest test suite for core guards & validators
│   ├── App.jsx                    # Main application layout & tab routing
│   └── index.css                  # Tailwind CSS styling & glassmorphism
├── index.html                     # Entry HTML
├── vite.config.js                 # Vite configuration with gh-pages base path
└── README.md                      # Architecture & setup guide
```

---

## 💻 Local Setup Instructions

### Prerequisites
- Node.js 18+ and npm

### Steps
```bash
# 1. Clone repository
git clone <repository-url>
cd <repository-folder>

# 2. Install dependencies
npm install

# 3. Run development server
npm run dev

# 4. Execute unit test suite
npm run test

# 5. Build production bundle for GitHub Pages
npm run build
```

---

## 🧪 Focused Automated Test Suite

Run unit tests using:
```bash
npm run test
```

Test coverage includes:
1. `src/tests/schemaValidator.test.js`: Validates input and output JSON schema compliance.
2. `src/tests/agentPermissions.test.js`: Verifies tool permission scoping and explicit refusal of unauthorized tool calls.
3. `src/tests/idempotency.test.js`: Verifies human approval interception and duplicate write prevention.
4. `src/tests/stepLimits.test.js`: Verifies step boundary halting (`maxExecutionSteps`) and execution cancellation.

---

## 🌐 GitHub Pages Deployment Guide

1. Push code to your GitHub repository on `main` or `master` branch.
2. Go to **Settings > Pages** in your GitHub repository.
3. Under **Build and deployment**, set Source to **GitHub Actions**.
4. The workflow in `.github/workflows/deploy.yml` will automatically build and publish your site.

---

## 📌 Known Limitations & Intentional Exclusions

- **Multi-Tenant Authentication**: Intentionally omitted to prioritize core agentic workflow, permission scoping, and approval reliability.
- **Custom Tool Creation**: Platform provides a bounded set of 4 curated tools (`calculator`, `document_search`, `structured_record_lookup`, `mock_task_creator`) as requested in the problem specification.
