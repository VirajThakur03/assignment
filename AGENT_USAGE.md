# AGENT_USAGE.md — Coding Agent Transparency & Verification Log

> Documenting the tools, representative prompts, delegated tasks, agent corrections, and verification methodology used in building the **Dynamic User-Defined Skills Agent Platform**.

---

## 1. Tools & Coding Agents Used

- **Antigravity (Gemini 3.6 Flash)**: Primary AI coding agent pair programmer used for architecture design, component implementation, domain model design, state management, and test suite construction.

---

## 2. Representative Prompts & Work Delegated

### Prompt 1: Architecture & Domain Modeling
> *"Design a browser-ready Agent Orchestrator engine supporting skill versioning, JSON schema validation, tool permission scoping, human-in-the-loop write approval, idempotency protection, and step limit enforcement."*
- **Delegated Task**: Created `AgentOrchestrator` class and state store handling step loop transitions, tool refusal logging, and idempotency key checks.

### Prompt 2: Tool Registry & Security Refusal Guard
> *"Build a bounded set of tools (calculator, document_search, structured_record_lookup, mock_task_creator). Flag mock_task_creator as a write action requiring approval and implement refusal logic when an unauthorized tool is invoked."*
- **Delegated Task**: Implemented tool definitions in `src/engine/tools/` and security refusal interception logic.

### Prompt 3: UI & Visual Step Trace
> *"Create a glassmorphism React interface with tab navigation for Skill Library, Test Workbench, Audit Logs, and a visual step trace showing thoughts, tool calls, and approval modals."*
- **Delegated Task**: Implemented components in `src/components/` with Tailwind CSS styling and Zustand store integration.

---

## 3. Important Agent Mistakes & Corrections

1. **GitHub Pages Deployment Compatibility**:
   - *Agent Suggestion*: Initially considered a standard Node.js Express server backend for API routing.
   - *Correction/Revision*: Recognized that GitHub Pages only hosts static frontend assets (HTML/JS/CSS). Refactored architecture to include a dual-mode execution engine running 100% in the browser using IndexedDB/LocalStorage, while keeping backend express structure optional.

2. **Idempotency Key Scope**:
   - *Agent Suggestion*: Used simple random strings for idempotency keys.
   - *Correction/Revision*: Updated idempotency key generator to combine target entity, parameters, and action scope (e.g. `task-alice@acme.com-499`) to ensure duplicate write actions across retries are accurately identified and blocked.

---

## 4. How Output Was Verified

1. **Automated Unit Tests**:
   - Verified JSON schema validation in `schemaValidator.test.js`.
   - Verified unauthorized tool call refusal in `agentPermissions.test.js`.
   - Verified human approval and duplicate action prevention in `idempotency.test.js`.
   - Verified max step limit halting in `stepLimits.test.js`.

2. **Interactive UI Verification**:
   - Tested skill authoring form, schema validation errors, and draft/publish status updates.
   - Tested version comparison diff viewer between v1 and v2.
   - Tested interactive workbench execution, pending approval modal triggers, and step trace timeline rendering.
