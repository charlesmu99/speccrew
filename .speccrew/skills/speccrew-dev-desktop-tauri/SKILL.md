---
name: speccrew-dev-desktop-tauri
description: SpecCrew Tauri Desktop Development Skill. Implements desktop application features using Tauri framework based on system design documents. Handles Rust backend commands, frontend integration, Tauri Command API, and Tauri Build packaging.
tools: Read, Write, Glob, Grep, Bash
---

# Trigger Scenarios

- System Designer Agent has completed Tauri desktop system design
- User asks "Start Tauri development", "Implement Tauri app"
- Design documents confirmed in `03.system-design/{platform_id}/`

## AgentFlow Definition

<!-- @agentflow: workflow.agentflow.xml -->

> **REQUIRED**: Before executing this workflow, read the XML workflow specification: `speccrew-workspace/docs/rules/agentflow-spec.md`

---

## Workflow

### Absolute Constraints

> **These rules apply to Task Record document generation. Violation = task failure.**

1. **FORBIDDEN: Full-file rewrite for Task Record** — After the Task Record is initially created in Step 3.1a, NEVER use `create_file` or full-content overwrite on it. All subsequent updates MUST use targeted `search_replace` on specific sections.

2. **FORBIDDEN: Full-file rewrite** — NEVER replace the entire Task Record content in a single operation. Always use targeted `search_replace` on specific sections.

3. **MANDATORY: Template-first workflow** — Copy template MUST execute before fill sections. Skipping copy and writing content directly is FORBIDDEN.

4. **CLARIFICATION: Source code is NOT template-filled** — Actual source code files are written directly based on design blueprints. The template-fill workflow applies ONLY to the Task Record document.

## Step 1: Read Design Documents

**Input**: Single module design document path `design_doc_path` (provided by upstream system-developer agent).

Read in order:

1. **Module design document**: `design_doc_path` (single module design document)
2. **API Contract**: `speccrew-workspace/iterations/{number}-{type}-{name}/02.feature-design/[feature-name]-api-contract.md`
3. **Techs Knowledge** (paths from agent context):
   - `speccrew-workspace/knowledges/techs/{platform_id}/tech-stack.md`
   - `speccrew-workspace/knowledges/techs/{platform_id}/architecture.md`
   - `speccrew-workspace/knowledges/techs/{platform_id}/conventions-design.md`
   - `speccrew-workspace/knowledges/techs/{platform_id}/conventions-dev.md`

## Step 2: Analyze Existing Code Structure

Use Glob/Grep to understand current Tauri codebase:

| Target | Glob Pattern | Purpose |
|--------|-------------|---------|
| Rust commands | `src-tauri/src/**/*.rs` | Understand Tauri command structure |
| Frontend integration | `src/**/*.{tsx,vue}` | Understand frontend structure |
| Tauri commands | `src-tauri/src/commands/**/*.rs` | Understand command patterns |
| Window management | `src-tauri/src/window/**/*.rs` | Understand window patterns |
| State management | `src/stores/**/*` | Understand store pattern |
| API layer | `src/apis/**/*` | Understand API encapsulation |
| Configuration files | `package.json`, `tauri.conf.json` | Build and config patterns |
| Cargo.toml | `src-tauri/Cargo.toml` | Rust dependencies |

Document findings for reference in later steps.

## Step 3: Extract Task List and Create Task Record

### 3.1 Create Task Record File Using Template-Fill Workflow

**Path**: `speccrew-workspace/iterations/{number}-{type}-{name}/04.development/{platform_id}/[feature-name]-task.md`

#### 3.1a Copy Template to Task Record Path

> Note: This is the ONLY step where `create_file` is allowed for the Task Record. All later updates in Step 4-6 MUST use `search_replace` on individual sections.

1. **Read the template file**: `templates/TASK-RECORD-TEMPLATE.md`
2. **Replace top-level placeholders** (feature name, platform ID, iteration info)
3. **Create the document** using `create_file`:
   - Target path: `speccrew-workspace/iterations/{number}-{type}-{name}/04.development/{platform_id}/[feature-name]-task.md`
   - Content: Template with top-level placeholders replaced
4. **Verify**: Document has complete section structure ready for filling

#### 3.1b Fill Task Record Sections Using search_replace

Fill each section with task checklist and design metadata extracted from input documents.

> ⚠️ **CRITICAL CONSTRAINTS:**
> - **FORBIDDEN: `create_file` to rewrite the entire document**
> - **MUST use `search_replace` to fill each section individually**
> - **All section titles MUST be preserved**

### 3.2 Tauri-Specific Task Types

**Conditional Task Selection:**

```
IF task involves Rust backend logic THEN
  → Create Tauri Command task
IF task involves UI components in frontend THEN
  → Create Frontend Component task
IF task involves process communication THEN
  → Create Tauri Command + Frontend Invoke task
IF task involves native APIs THEN
  → Create Native Integration task
IF task involves menus or shortcuts THEN
  → Create Menu/Shortcut task
IF task involves auto-update THEN
  → Create Auto-Update task
IF task involves security configuration THEN
  → Create Security Hardening task
```

| Task Type | Description | Example |
|-----------|-------------|---------|
| Tauri Command | Rust backend command | `#[tauri::command]` functions |
| Frontend Component | UI components | React/Vue components, pages |
| Command Handler | Frontend-to-Rust communication | `invoke()` calls |
| Window Management | Window creation, lifecycle | `WindowBuilder`, window config |
| Native Integration | File system, notifications | `std::fs`, `tauri::api` |
| Menu/Shortcut | Application menus, shortcuts | Menu templates, accelerators |
| Auto-Update | Update mechanism | `tauri-updater` |
| Security Hardening | CSP, permissions | `tauri.conf.json` security |

### Task ID Prefix

Use `TR-` prefix for Tauri tasks: `TR-001`, `TR-002`, etc.

### Task Checklist Table

| Task ID | Module | Description | Target Files | Command Name | Native Integration | Dependencies | Status |
|---------|--------|-------------|--------------|--------------|-------------------|--------------|--------|
| TR-001 | Commands | Create file operations command | `src-tauri/src/commands/file.rs` | `read_file`, `write_file` | File system | - | Pending |
| TR-002 | Frontend | Create main window UI | `src/pages/Main.tsx` | `file:*` | - | TR-001 | Pending |

**Status**: Pending / In Progress / Completed / Blocked

**Proceed directly to implementation — no user confirmation required.**

## Step 4: Implement Tasks

### 4.1 Implementation Order

Follow dependency order:
1. Tauri commands (Rust backend)
2. Frontend integration
3. Native integrations
4. Security configurations
5. Auto-update mechanism

### 4.2 Coding Standards

- **Rust Commands**: Follow conventions-dev.md for Tauri backend code
- **Frontend**: Follow frontend conventions (React/Vue/etc.)
- **Command Names**: Use exact names from design document
- **Types**: Use TypeScript types defined in design document
- **Error Handling**: Use `Result<T, String>` for command returns

### 4.3 Status Markers

Use markers from design document:

| Marker | Meaning | Action |
|--------|---------|--------|
| `[EXISTING]` | Reuse current code | Verify compatibility, no modification needed |
| `[MODIFIED]` | Enhance existing code | Implement changes carefully |
| `[NEW]` | Create brand new | Full implementation required |

## Step 5: Local Checks (Per Task)

After completing each task, run the following checks:

### 5.1 Rust Checks

```bash
cd src-tauri
cargo check
cargo clippy
cargo test
```

### 5.2 Frontend Build Verification

```bash
npm run build
# or
npm run tauri build --debug
```

### 5.3 Lint Check

```bash
npm run lint
# or
npx eslint [modified-files]
```

### 5.4 Type Check (TypeScript projects)

```bash
npx tsc --noEmit
```

### 5.5 Quick Verify

- Application window launches without crash
- No console errors in DevTools
- Tauri commands respond correctly
- Native integrations work as expected

**If checks fail**: Fix issues before marking task complete. Record complex issues in task file.

## Step 6: Record Deviations

If implementation deviates from design document:

1. Stop and document the deviation
2. Explain reason for deviation
3. Get user confirmation or proceed with documented reason

**Record in task file**:
```markdown
### Deviation Log
- TR-002: Changed command return type from {original} to {new} because {reason}
```

## Step 7: Record Technical Debt

If technical debt is identified:

**Write to**: `speccrew-workspace/iterations/{number}-{type}-{name}/tech-debt/[feature-name]-tech-debt.md`

**Categories**:
- Security: Temporary security relaxations
- Performance: Known performance issues
- Refactoring: Code that needs cleanup
- Dependencies: Version constraints or workarounds

## Step 8: Complete Notification

After all tasks complete, present summary:

```
Tauri Development Complete: {feature-name}
Platform: {platform_id}
Framework: Tauri

Tasks Completed: {count}
├── Tauri Commands: {count}
├── Frontend Integration: {count}
├── Native Integration: {count}
└── Security/Other: {count}

Deviations Recorded: {count}
Technical Debt Items: {count}

Task Record: speccrew-workspace/iterations/{number}-{type}-{name}/04.development/{platform_id}/[feature-name]-task.md
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
- **Summary**: Tauri module {module_name} implemented with {X} tasks completed
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
- `DEPENDENCY_MISSING`: Required Rust crate or Node.js dependency not available
- `BUILD_FAILURE`: Tauri build error, Rust compilation failure
- `VALIDATION_ERROR`: Clippy, ESLint, TypeScript type check, or test failure
- `RUNTIME_ERROR`: App crash on launch, runtime exception, command invocation failure
- `BLOCKED`: Blocked by external dependency or unresolved design issue

---

# Reference Guides

## Security Audit Checklist

| Check | Method |
|-------|--------|
| CSP | Verify `csp` in `tauri.conf.json` |
| Dangerous APIs | Check `allowlist` scope |
| Command Validation | Verify input validation in commands |

---

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
| **Design Document READ-ONLY** | Design documents are reference only - do not modify. Record deviations in task file. |
| **Actual Framework Syntax** | All code MUST use actual Tauri/Rust API syntax |
| **Status Markers Required** | Use [EXISTING], [MODIFIED], [NEW] markers for all components and commands |
| **Follow Techs Conventions** | Naming, directory structure, patterns must follow techs knowledge |
| **Security First** | Minimize dangerous API allowlist scope |
| **Error Handling** | All commands must return `Result<T, E>` |
| **Task Per File Group** | Each task should map to a logical file group or component |
| **Local Checks Mandatory** | Run cargo check, lint, and quick verify before marking task complete |
| **Tech Debt Recorded** | All technical debt must be written to iterations/{iter}/tech-debt/ |

# Checklist

- [ ] Design document loaded before implementation (single module design_doc_path)
- [ ] Existing code structure analyzed via Glob/Grep
- [ ] Task record created with complete checklist
- [ ] Task list extracted and recorded in task file
- [ ] All modules in the design document covered in task list
- [ ] All Tauri commands from design implemented
- [ ] CSP configured in tauri.conf.json
- [ ] Command input validation implemented
- [ ] Native integrations follow security best practices
- [ ] Rust checks pass (cargo check, clippy, test)
- [ ] Frontend build verification passes
- [ ] Lint check passes with no errors
- [ ] Type check passes (TypeScript projects)
- [ ] Quick verify: App launches without crash
- [ ] All deviations recorded in task file
- [ ] Technical debt recorded in tech-debt/ directory
- [ ] Task record status updated to complete
