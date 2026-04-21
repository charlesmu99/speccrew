---
name: speccrew-dev-desktop-electron
description: SpecCrew Electron Desktop Development Skill. Implements desktop application features using Electron framework based on system design documents. Handles main process (TypeScript/JavaScript), renderer process (React/Vue), IPC channels, and Electron Builder packaging.
tools: Read, Write, Glob, Grep, Bash
---

# Trigger Scenarios

- System Designer Agent has completed Electron desktop system design
- User asks "Start Electron development", "Implement Electron app"
- Design documents confirmed in `03.system-design/{platform_id}/`

## AgentFlow Definition

<!-- @agentflow: SKILL.xml -->

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
2. **API Contract**: `speccrew-workspace/iterations/{number}-{type}-{name}/03.api-contract/[feature-name]-api-contract.md`
3. **Techs Knowledge** (paths from agent context):
   - `speccrew-workspace/knowledges/techs/{platform_id}/tech-stack.md`
   - `speccrew-workspace/knowledges/techs/{platform_id}/architecture.md`
   - `speccrew-workspace/knowledges/techs/{platform_id}/conventions-design.md`
   - `speccrew-workspace/knowledges/techs/{platform_id}/conventions-dev.md`

## Step 2: Analyze Existing Code Structure

Use Glob/Grep to understand current Electron codebase:

| Target | Glob Pattern | Purpose |
|--------|-------------|---------|
| Main process | `src/main/**/*.{ts,js}` | Understand main process structure |
| Renderer process | `src/renderer/**/*.{tsx,vue,html}` | Understand renderer structure |
| IPC definitions | `src/main/ipc/**/*` | Understand IPC channel patterns |
| Window management | `src/main/window/**/*` | Understand window patterns |
| Preload scripts | `src/preload/**/*` or `preload.{ts,js}` | Understand preload patterns |
| Native modules | `src/main/native/**/*` | Identify native dependencies |
| State management | `src/renderer/stores/**/*` | Understand store pattern |
| API layer | `src/renderer/apis/**/*` | Understand API encapsulation |
| Configuration files | `package.json`, `electron-builder.yml` | Build and config patterns |

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

### 3.2 Electron-Specific Task Types

**Conditional Task Selection:**

```
IF task involves backend logic in main process THEN
  → Create Main Process Module task
IF task involves UI components in renderer THEN
  → Create Renderer Page/Component task
IF task involves process communication THEN
  → Create IPC Channel Handler task + Preload Script task
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
| Main Process Module | Backend logic running in main process | Window manager, IPC handlers, native integrations |
| Renderer Page/Component | UI components in renderer process | React/Vue components, pages, layouts |
| IPC Channel Handler | Communication bridge between processes | `ipcMain.handle`, `ipcRenderer.invoke` |
| Preload Script | Context bridge for secure renderer access | `contextBridge.exposeInMainWorld` |
| Window Management | Window creation, lifecycle, multi-window | `BrowserWindow`, window configuration |
| Native Integration | File system, system tray, notifications | Native API wrappers |
| Menu/Shortcut | Application menus, keyboard shortcuts | Menu templates, global shortcuts |
| Auto-Update | Update checking and installation | `electron-updater` |
| Security Hardening | Context isolation, CSP, permissions | Preload scripts, security configs |

### Task ID Prefix

Use `EL-` prefix for Electron tasks: `EL-001`, `EL-002`, etc.

### Task Checklist Table

| Task ID | Module | Description | Target Files | IPC Channel | Native Integration | Dependencies | Status |
|---------|--------|-------------|--------------|-------------|-------------------|--------------|--------|
| EL-001 | MainProcess | Create window manager | `src/main/window/manager.ts` | - | Window creation | - | Pending |
| EL-002 | IPC | Implement file operations handler | `src/main/ipc/file.ts` | `file:read`, `file:write` | File system | EL-001 | Pending |
| EL-003 | Renderer | Create main window UI | `src/renderer/pages/Main.tsx` | `file:*` | - | EL-002 | Pending |

**Status**: Pending / In Progress / Completed / Blocked

**Proceed directly to implementation — no user confirmation required.**

## Step 4: Implement Tasks

### 4.1 Implementation Order

Follow dependency order:
1. Main process infrastructure (window manager, IPC setup)
2. IPC channel handlers and preload scripts
3. Renderer process components
4. Native integrations
5. Security configurations
6. Auto-update mechanism

### 4.2 Coding Standards

- **Main Process**: Follow conventions-dev.md for Electron backend code
- **Renderer Process**: Follow frontend conventions (React/Vue/etc.)
- **IPC Channels**: Use exact channel names from design document
- **Types**: Use TypeScript types defined in design document
- **Security**: Never expose `nodeIntegration`, always use context isolation

### 4.3 Status Markers

Use markers from design document:

| Marker | Meaning | Action |
|--------|---------|--------|
| `[EXISTING]` | Reuse current code | Verify compatibility, no modification needed |
| `[MODIFIED]` | Enhance existing code | Implement changes carefully |
| `[NEW]` | Create brand new | Full implementation required |

## Step 5: Local Checks (Per Task)

After completing each task, run the following checks:

### 5.1 Build Verification

```bash
npm run build:dev
# or
npm run electron:dev
```

### 5.2 Lint Check

```bash
npm run lint
# or
npx eslint [modified-files]
```

### 5.3 Type Check (TypeScript projects)

```bash
npx tsc --noEmit
```

### 5.4 Security Audit

Perform security checks according to Security Audit Reference.

### 5.5 Unit Tests

```bash
npm test -- [related-test-pattern]
```

### 5.6 Quick Verify

- Application window launches without crash
- No console errors in DevTools
- IPC channels respond correctly
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
- EL-002: Changed IPC payload structure from {original} to {new} because {reason}
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
Electron Development Complete: {feature-name}
Platform: {platform_id}
Framework: Electron

Tasks Completed: {count}
├── Main Process: {count}
├── Renderer Process: {count}
├── IPC Channels: {count}
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
- **Summary**: Electron module {module_name} implemented with {X} tasks completed
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
- `BUILD_FAILURE`: Electron build error, native compilation failure
- `VALIDATION_ERROR`: ESLint, TypeScript type check, or test failure
- `RUNTIME_ERROR`: App crash on launch, runtime exception, IPC communication failure
- `BLOCKED`: Blocked by external dependency, native module issue, or unresolved design issue

---

# Reference Guides

## Security Audit Checklist

| Check | Method |
|-------|--------|
| Context Isolation | Verify `contextIsolation: true` in window config |
| nodeIntegration | Verify `nodeIntegration: false` |
| Preload Script | Verify all IPC goes through preload |
| CSP | Check Content Security Policy headers |

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
| **Actual Framework Syntax** | All code MUST use actual Electron API syntax |
| **Status Markers Required** | Use [EXISTING], [MODIFIED], [NEW] markers for all components, modules, and IPC handlers |
| **Follow Techs Conventions** | Naming, directory structure, patterns must follow techs knowledge |
| **Security First** | Never disable contextIsolation; never enable nodeIntegration in renderer |
| **IPC Through Preload** | All main-renderer communication must go through preload scripts |
| **Task Per File Group** | Each task should map to a logical file group or component |
| **Local Checks Mandatory** | Run lint, type check, and quick verify before marking task complete |
| **Tech Debt Recorded** | All technical debt must be written to iterations/{iter}/tech-debt/ |

# Checklist

- [ ] Design document loaded before implementation (single module design_doc_path)
- [ ] Existing code structure analyzed via Glob/Grep
- [ ] Task record created with complete checklist
- [ ] Task list extracted and recorded in task file
- [ ] All modules in the design document covered in task list
- [ ] All IPC channels from design implemented
- [ ] Context isolation enabled for all windows
- [ ] Preload scripts expose only necessary APIs
- [ ] Native integrations follow security best practices
- [ ] Build verification passes (dev mode)
- [ ] Lint check passes with no errors
- [ ] Type check passes (TypeScript projects)
- [ ] Unit tests pass for implemented modules
- [ ] Quick verify: App launches without crash
- [ ] All deviations recorded in task file
- [ ] Technical debt recorded in tech-debt/ directory
- [ ] Task record status updated to complete
