---
name: speccrew-dev-frontend
description: Frontend Development SOP. Guide System Developer Agent to implement frontend code according to system design documents. Reads design blueprints, extracts task checklist, and executes implementation task by task with local quality checks.
tools: Bash, Edit, Write, Glob, Grep, Read
---

# Trigger Scenarios

- System Developer Agent dispatches this skill with platform context
- System design confirmed, user requests frontend development
- User asks "Start frontend development" or "Implement frontend code"

## AgentFlow Definition

<!-- @agentflow: workflow.agentflow.xml -->

> **REQUIRED**: Before executing this workflow, read the XML workflow specification: `speccrew-workspace/docs/rules/agentflow-spec.md`

---

## Workflow

### Absolute Constraints

> **These rules apply to Task Record document generation. Violation = task failure.**

1. **FORBIDDEN: `create_file` for Task Record** — NEVER use `create_file` to write the Task Record document. It MUST be created by copying the template then filling sections with `search_replace`. `create_file` produces truncated output on large files.

2. **FORBIDDEN: Full-file rewrite** — NEVER replace the entire Task Record content in a single operation. Always use targeted `search_replace` on specific sections.

3. **MANDATORY: Template-first workflow** — Copy template MUST execute before fill sections. Skipping copy and writing content directly is FORBIDDEN.

4. **CLARIFICATION: Source code is NOT template-filled** — Actual source code files are written directly based on design blueprints. The template-fill workflow applies ONLY to the Task Record document.

## Step 1: Read Design Documents

Input: `design_doc_path` — Path to a single module design document (passed by upstream system-developer agent).

Read in order:

1. **Platform INDEX**: `speccrew-workspace/iterations/{number}-{type}-{name}/03.system-design/{platform_id}/INDEX.md`
2. **Module Design Document**: The `design_doc_path` provided (single module's design)
3. **API Contract**: `speccrew-workspace/iterations/{number}-{type}-{name}/02.feature-design/*-api-contract.md`
4. **Task record template**: `speccrew-dev-frontend/templates/TASK-RECORD-TEMPLATE.md`

## Step 2: Read Techs Knowledge

Read platform-specific techs knowledge:

| Document | Path | Purpose |
|----------|------|---------|
| Development conventions | `speccrew-workspace/knowledges/techs/{platform_id}/conventions-dev.md` | Naming, patterns, code style |
| Architecture | `speccrew-workspace/knowledges/techs/{platform_id}/architecture.md` | State management, patterns |
| Tech stack | `speccrew-workspace/knowledges/techs/{platform_id}/tech-stack.md` | Framework versions, libraries |
| UI style guide | `speccrew-workspace/knowledges/techs/{platform_id}/ui-style/ui-style-guide.md` | Visual design tokens |
| UI patterns | `speccrew-workspace/knowledges/techs/{platform_id}/ui-style-patterns/` | Reusable UI patterns |

## Step 3: Extract Task List

From design documents, extract ALL implementation items into a task checklist.

### 3.1 Parse Module Design

From the module design document, identify:

| Item Type | Markers | Example |
|-----------|---------|---------|
| Components | [NEW], [MODIFIED], [EXISTING] | `[NEW] ProductDetailDrawer` |
| Store modules | [NEW], [MODIFIED], [EXISTING] | `[MODIFIED] useCartStore` |
| API integration | API calls in pseudo-code | `api.getProduct(id)` |
| Routes | Route configurations | `/products/:id` |
| Styles | Layout/styling work | Flex layout, spacing |

### 3.2 Generate Task Table

<!-- AI-NOTE: Create one row per implementation task. Dependencies must reference other Task IDs. -->

| Task ID | Module | Description | Target Files | Dependencies | Status |
|---------|--------|-------------|--------------|--------------|--------|
| FE-001 | {module} | {description} | {file paths from design} | {depends on} | Pending |
| FE-002 | {module} | {description} | {file paths from design} | {depends on} | Pending |

### 3.3 Write Initial Task Record

Create the task record using template-fill workflow:

**Target Path**: `speccrew-workspace/iterations/{number}-{type}-{name}/04.development/{platform_id}/{feature-name}-tasks.md`

#### 3.4a Copy Template to Task Record Path

1. **Read the template file**: `speccrew-dev-frontend/templates/TASK-RECORD-TEMPLATE.md` (from Step 1)
2. **Replace top-level placeholders** (feature name, platform ID, iteration info)
3. **Create the document** using `create_file`:
   - Target path: `speccrew-workspace/iterations/{number}-{type}-{name}/04.development/{platform_id}/{feature-name}-tasks.md`
   - Content: Template with top-level placeholders replaced
4. **Verify**: Document has complete section structure ready for filling

#### 3.4b Fill Task Record Sections Using search_replace

Fill each section with task checklist and design metadata.

> ⚠️ **CRITICAL CONSTRAINTS:**
> - **FORBIDDEN: `create_file` to rewrite the entire document**
> - **MUST use `search_replace` to fill each section individually**
> - **All section titles MUST be preserved**

## Step 4: Execute Tasks

For each task in checklist order (respecting dependencies):

### 4.1 Read Design Section

Re-read the corresponding module design document section for this task.

### 4.2 Implement According to Blueprint

<!-- AI-NOTE: Dev skill does NOT use template filling. Write actual source code following the design blueprint directly. -->

| Aspect | Implementation Rule |
|--------|---------------------|
| Framework syntax | Use actual syntax from conventions-dev.md |
| Architecture patterns | Follow architecture.md patterns |
| Component reuse | Use [EXISTING] components as marked in design |
| Naming | Follow conventions strictly |
| File paths | Use paths specified in design document |

### 4.3 Update Task Status

After each task completion:

1. Update task status to "Done" in task record
2. If deviation from design: record in Deviation Log section
3. Continue to next task

### 4.4 Handle Design Issues

If design issue discovered during implementation:

1. **Stop current task**
2. **Report issue to user clearly** with:
   - Task ID affected
   - Design document reference
   - Problem description
   - Suggested resolution
3. **Wait for user decision**:
   - Backtrack to design phase, OR
   - Proceed with explanation

## Step 5: Local Checks

After each task (or batch of related tasks):

### 5.1 Lint Check

```bash
npm run lint
# OR
npx eslint {modified files}
```

### 5.2 Type Check (if TypeScript)

```bash
npx tsc --noEmit
```

### 5.3 Unit Tests

Run relevant unit tests, ensure no regressions.

### 5.4 Quick Verify

- Page renders without console errors
- No runtime exceptions

### 5.5 Handle Failures

| Scenario | Action |
|----------|--------|
| Checks pass | Mark task complete |
| Simple fix | Fix immediately, then mark complete |
| Complex issue | Record in task file "Issues" section, continue if possible |

## Step 6: Complete Task Record

### 6.1 Update Final Statuses

Update task record file with final statuses for all tasks.

### 6.2 Record Deviations

Ensure all deviations are recorded with reasons:

| Task ID | Design Intent | Actual Implementation | Reason |
|---------|---------------|----------------------|--------|
| FE-002 | Use A pattern | Used B pattern | [reason] |

### 6.3 Write Tech Debt (if any)

If tech debt identified, write to:

`speccrew-workspace/iterations/{number}-{type}-{name}/tech-debt/{debt-id}.md`

### 6.4 Present Completion Summary

```
Frontend Development Complete: {feature-name}
Platform: {platform_id}

Tasks: {completed}/{total} completed
Deviations: {count}
Tech Debt: {count}

Task Record: speccrew-workspace/iterations/{number}-{type}-{name}/04.development/{platform_id}/{feature-name}-tasks.md
```

#### Helper Scripts Output

All temporary/helper scripts (validation, data init, environment setup, mock data, etc.) MUST be saved to:
```
iterations/{iter}/04.development/{platform_id}/scripts/
```

**Exception**: Application source scripts (build configs, etc.) go to the project source directory per conventions-dev.md.

Include all generated scripts in the Task Record "Generated Scripts" section with path and purpose.

## Task Completion Report

At the end of Step 6 (or if the skill fails at any point), output a structured Task Completion Report:

### Success Report

```
## Task Completion Report
- **Status**: SUCCESS
- **Task ID**: {task_id from dispatch context}
- **Platform**: {platform_id}
- **Module**: {module_name}
- **Output Files**:
  - {file_path_1}
  - {file_path_2}
  - ...
- **Summary**: Frontend module {module_name} implemented with {X} tasks completed
```

### Failure Report

If the skill fails at any step:

```
## Task Completion Report
- **Status**: FAILED
- **Task ID**: {task_id from dispatch context}
- **Platform**: {platform_id}
- **Module**: {module_name}
- **Output Files**: {list of partially generated files, or "None"}
- **Summary**: {one-line description of what was attempted}
- **Error**: {detailed error description}
- **Error Category**: {DEPENDENCY_MISSING | BUILD_FAILURE | VALIDATION_ERROR | RUNTIME_ERROR | BLOCKED}
- **Partial Outputs**: {list of files that were generated before failure, or "None"}
- **Recovery Hint**: {suggestion for how to resolve and retry}
```

**Error Category Definitions**:
- `DEPENDENCY_MISSING`: Required Node.js/npm dependency not available
- `BUILD_FAILURE`: Vite/Webpack build error, compilation failure
- `VALIDATION_ERROR`: ESLint, TypeScript type check, or test failure
- `RUNTIME_ERROR`: Runtime exception in browser/dev server
- `BLOCKED`: Blocked by external dependency or unresolved design issue

## OUTPUT EFFICIENCY RULES

When executing this skill:

1. **Direct-to-File Output**: All implementation code, task records, and helper scripts MUST be written directly to output files
2. **Minimal Conversation Output**: Only output:
   - Block execution announcements (1 line each): `"[Block XX] Implementing..."`
   - Error messages requiring attention
   - Task Completion Report (final summary)
3. **FORBIDDEN in conversation**:
   - ❌ Full source code blocks or file contents
   - ❌ Complete implementation listings
   - ❌ Large configuration file dumps
   - ❌ Architecture diagrams displayed in chat
   - ❌ API endpoint listings longer than 3 lines
4. **Rationale**: Workers run in batch mode (up to 6 concurrent). Displaying code content in conversation wastes context window and provides no value since content goes to files anyway.

## ABORT CONDITIONS

When script execution or build/compile fails:

1. **STOP immediately** — Report: Task ID, error message, failed command
2. **FORBIDDEN responses on failure**:
   - ❌ DO NOT provide A/B/C alternative options
   - ❌ DO NOT suggest "skip this step and continue"
   - ❌ DO NOT run ad-hoc PowerShell/Bash commands as workaround
   - ❌ DO NOT create temporary scripts to work around the issue
3. **ONLY correct response**: Report the failure in Task Completion Report with status FAILED and error details

# Key Rules

| Rule | Description |
|------|-------------|
| **Design Blueprint First** | All code MUST follow the system design documents — do not invent architecture |
| **Task Checklist Mandatory** | MUST extract and confirm task list before writing any code |
| **Conventions Compliance** | Naming, patterns, directory structure MUST follow techs knowledge |
| **Deviation Recording** | ANY difference from design MUST be recorded with reason |
| **Local Check Gate** | Code MUST pass lint/type/test before task completion |

# Checklist

- [ ] All design documents loaded before implementation
- [ ] Task checklist extracted and recorded
- [ ] Task record file created at `04.development/{platform_id}/`
- [ ] Each task implemented following design blueprint
- [ ] Local checks passed (lint, type, test) for each task
- [ ] All deviations recorded with reasons
- [ ] Tech debt items written to `tech-debt/` directory
- [ ] Task record updated with final completion status
