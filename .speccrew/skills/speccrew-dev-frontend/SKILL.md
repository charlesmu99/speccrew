---
name: speccrew-dev-frontend
description: Frontend Development SOP. Guide System Developer Agent to implement frontend code according to system design documents. Reads design blueprints, extracts task checklist, and executes implementation task by task with local quality checks.
tools: Bash, Edit, Write, Glob, Grep, Read
---

# Trigger Scenarios

- System Developer Agent dispatches this skill with platform context
- System design confirmed, user requests frontend development
- User asks "Start frontend development" or "Implement frontend code"

# Workflow

## Step 1: Read Design Documents

Read in order:

1. **Platform INDEX**: `speccrew-workspace/iterations/{number}-{type}-{name}/03.system-design/{platform_id}/INDEX.md`
2. **Module design documents**: All `*-design.md` files listed in INDEX
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

### 3.1 Parse Module Designs

For each module design document, identify:

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

### 3.3 Checkpoint: User Confirmation

**Present task checklist to user for confirmation before proceeding.**

Wait for user approval before writing any code.

### 3.4 Write Initial Task Record

Write to: `speccrew-workspace/iterations/{number}-{type}-{name}/04.development/{platform_id}/{feature-name}-tasks.md`

Use template from Step 1.

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
- [ ] Task checklist extracted and confirmed by user
- [ ] Task record file created at `04.development/{platform_id}/`
- [ ] Each task implemented following design blueprint
- [ ] Local checks passed (lint, type, test) for each task
- [ ] All deviations recorded with reasons
- [ ] Tech debt items written to `tech-debt/` directory
- [ ] Task record updated with final completion status
