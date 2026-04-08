---
name: speccrew-dev-backend
description: Backend Development SOP. Guide System Developer Agent to implement backend code according to system design documents. Reads design blueprints, extracts task checklist, and executes implementation task by task with local quality checks.
tools: Bash, Edit, Write, Glob, Grep, Read
---

# Trigger Scenarios

- Backend system design has been approved, user requests backend development
- User asks "Start backend development", "Implement backend code"
- System Developer Agent receives task to implement backend for a specific platform

# Workflow

## Absolute Constraints

> **These rules apply to Task Record document generation. Violation = task failure.**

1. **FORBIDDEN: `create_file` for Task Record** — NEVER use `create_file` to write the Task Record document. It MUST be created by copying the template then filling sections with `search_replace`. `create_file` produces truncated output on large files.

2. **FORBIDDEN: Full-file rewrite** — NEVER replace the entire Task Record content in a single operation. Always use targeted `search_replace` on specific sections.

3. **MANDATORY: Template-first workflow** — Copy template MUST execute before fill sections. Skipping copy and writing content directly is FORBIDDEN.

4. **CLARIFICATION: Source code is NOT template-filled** — Actual source code files are written directly based on design blueprints. The template-fill workflow applies ONLY to the Task Record document.

## Step 1: Read Design Documents

Input: `design_doc_path` — Path to a single module design document (passed by upstream system-developer agent).

Read in order:

1. **Module Design Document**: The `design_doc_path` provided (single module's design)
2. **Platform INDEX**: `speccrew-workspace/iterations/{number}-{type}-{name}/03.system-design/{platform_id}/INDEX.md`
3. **API Contract**: `speccrew-workspace/iterations/{number}-{type}-{name}/02.feature-design/[feature-name]-api-contract.md`
4. **Techs Knowledge** (from agent context):
   - `speccrew-workspace/knowledges/techs/{platform_id}/tech-stack.md`
   - `speccrew-workspace/knowledges/techs/{platform_id}/architecture.md`
   - `speccrew-workspace/knowledges/techs/{platform_id}/conventions-design.md`
   - `speccrew-workspace/knowledges/techs/{platform_id}/conventions-dev.md`
   - `speccrew-workspace/knowledges/techs/{platform_id}/conventions-data.md` (critical: ORM, data modeling, migration)
5. **Task Record Template**: `speccrew-dev-backend/templates/TASK-RECORD-TEMPLATE.md`

## Step 2: Create Task Record File

Before coding, create the task record using template-fill workflow:

### 2a Copy Template to Task Record Path

1. **Read the template file**: `templates/TASK-RECORD-TEMPLATE.md`
2. **Replace top-level placeholders** (module name, feature name, platform ID, iteration info)
3. **Create the document** using `create_file`:
   - Target path: `speccrew-workspace/iterations/{number}-{type}-{name}/04.development/{platform_id}/[module]-task.md`
   - Content: Template with top-level placeholders replaced
4. **Verify**: Document has complete section structure ready for filling

### 2b Fill Task Record Sections Using search_replace

Fill each section with design metadata extracted from input documents.

> ⚠️ **CRITICAL CONSTRAINTS:**
> - **FORBIDDEN: `create_file` to rewrite the entire document**
> - **MUST use `search_replace` to fill each section individually**
> - **All section titles MUST be preserved**

## Step 3: Extract Task List

Parse design documents to extract all implementation tasks.

### Backend Task Types

| Category | Description | Example Files |
|----------|-------------|---------------|
| Entity/Model | Data model definitions | `entity/`, `model/`, `domain/` |
| Repository/DAO | Data access layer | `repository/`, `dao/`, `mapper/` |
| Service | Business logic layer | `service/`, `manager/`, `handler/` |
| Controller/API | REST endpoints | `controller/`, `router/`, `api/` |
| Database Migration | Schema changes | `db/migration/`, `migrations/` |
| API Configuration | Route/middleware config | `config/`, `routes/` |
| Middleware/Interceptor | Cross-cutting concerns | `middleware/`, `interceptor/` |

### Task Checklist Table Format

| Task ID | Module | Description | Target Files | API Endpoint | DB Migration | Dependencies | Status |
|---------|--------|-------------|--------------|--------------|--------------|--------------|--------|
| BE-001 | User | Define User entity | `entity/User.java` | - | V001__create_user.sql | - | ⏳ Pending |
| BE-002 | User | Create UserRepository | `repository/UserRepository.java` | - | - | BE-001 | ⏳ Pending |
| BE-003 | Auth | Login endpoint | `controller/AuthController.java` | POST /auth/login | - | BE-002 | ⏳ Pending |

> Status: ⏳ Pending / 🔄 In Progress / ✅ Complete / 🚫 Blocked

**Checkpoint A: Present task checklist to user for confirmation before proceeding.**

## Step 4: Task-by-Task Implementation

Execute tasks in dependency order.

### Implementation Principles

- Follow design document file paths, naming, and structure exactly
- Use actual framework syntax from techs knowledge (not generic pseudo-code)
- Follow conventions-data.md for ORM patterns and migration naming
- Reuse existing code where possible (use Grep to search)
- Directly write code based on design blueprint (no template filling for source code)

### Per-Task Workflow

1. **Mark task as 🔄 In Progress**
2. **Implement the code** following design specification
3. **Run local checks** (Step 5)
4. **Update status to ✅ Complete** if checks pass
5. **Record deviations** if implementation differs from design

### When Design Issues Found

- Stop current task
- Describe issue clearly to user
- Wait for user decision: return to design phase OR proceed with documented deviation

## Step 5: Local Checks

After completing each task, run quality checks:

### Check Matrix

| Check | Command Example | When Required |
|-------|-----------------|---------------|
| **Compile** | `mvn compile` / `gradle build` / `go build` | After code changes |
| **Lint** | `mvn checkstyle:check` / `golangci-lint run` | After code changes |
| **Unit Tests** | `mvn test -Dtest=XxxTest` / `go test ./...` | When testable logic added |
| **API Smoke Test** | Start service, `curl http://localhost:8080/health` | After controller changes |

### Check Failure Handling

- Fix issues before marking task complete
- For complex issues, record in task file "Pending Issues" section
- Do NOT proceed to next task until current task passes checks

### Environment Diagnostics

When task is blocked (compile fail, test fail, env issue):

1. **Check logs**: `docker logs [container] --tail 100` or process output
2. **Verify services**: `docker ps` / `docker compose ps`
3. **Check environment**: `.env` variables, database connectivity
4. **Record diagnosis**: symptom → investigation steps → root cause → resolution

## Step 6: Record Deviations

If implementation differs from design, record in task file "Deviation Log" section:

```markdown
### Deviation Log

| Task ID | Design Spec | Actual Implementation | Reason |
|---------|-------------|----------------------|--------|
| BE-003 | Use JWT library A | Used JWT library B | Library A has security vulnerability |
```

## Step 7: Handle Technical Debt

If accepting suboptimal solutions, write to tech-debt directory:

**Path**: `speccrew-workspace/iterations/{number}-{type}-{name}/tech-debt/[module]-tech-debt.md`

Use the unified tech_debt document template defined in the workspace document templates configuration.

## Step 8: Completion Notification

When all tasks complete, update task record and notify user:

```
Backend Development Complete: {module-name}
Platform: {platform_id}

Tasks Completed: {X}
├── ✅ Complete: {count}
├── 🚫 Blocked: {count}
└── Deviations: {count}

API Endpoints:
├── Implemented: {count} endpoints
└── Status: See task record for details

Database Changes:
├── New Tables: {count}
├── Modified Tables: {count}
└── Migrations: {count}

Technical Debt: {count} items (see tech-debt/)
Task Record: speccrew-workspace/iterations/{number}-{type}-{name}/04.development/{platform_id}/[module]-task.md

Ready for testing phase.
```

## Task Completion Report

At the end of Step 8 (or if the skill fails at any point), output a structured Task Completion Report:

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
- **Summary**: Backend module {module_name} implemented with {X} tasks completed
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
- `DEPENDENCY_MISSING`: Required runtime/dependency not available
- `BUILD_FAILURE`: Compilation error, maven/gradle build failure
- `VALIDATION_ERROR`: Checkstyle, test failure, or validation error
- `RUNTIME_ERROR`: Service startup failure, runtime exception
- `BLOCKED`: Blocked by external dependency or unresolved design issue

# Key Rules

| Rule | Description |
|------|-------------|
| **Blueprint-Driven** | Implement directly from system design, no template filling for source code |
| **Actual Framework Syntax** | Use real framework annotations/syntax from techs knowledge |
| **API Contract is READ-ONLY** | Do NOT modify API Contract; report issues if found |
| **Checkpoint A Required** | Must confirm task list with user before implementation |
| **Per-Task Quality Gates** | Each task must pass local checks before proceeding |
| **Deviation Recording** | ALL deviations from design must be documented |
| **Tech Debt Tracking** | Suboptimal solutions written to tech-debt/ directory |

# Mermaid Diagram Requirements

When generating Mermaid diagrams, follow compatibility guidelines:

- Use only basic node definitions: `A[text content]`
- No HTML tags (e.g., `<br/>`)
- No nested subgraphs
- No `direction` keyword
- No `style` definitions
- No special characters in node text
- Use standard `graph TB/LR` or `flowchart TD/LR` or `erDiagram` syntax only

# Checklist

- [ ] All design documents and techs knowledge loaded before implementation
- [ ] Task record file created with complete checklist
- [ ] Checkpoint A passed: task list confirmed with user
- [ ] Each task marked in progress before coding
- [ ] Local checks run after each task (compile/lint/test/smoke)
- [ ] Code follows conventions-data.md ORM patterns
- [ ] Database migrations follow naming conventions
- [ ] API endpoints match API Contract specifications
- [ ] All deviations recorded in task file
- [ ] Technical debt written to tech-debt/ directory (if any)
- [ ] Task record status updated to complete
- [ ] All Mermaid diagrams follow compatibility guidelines
