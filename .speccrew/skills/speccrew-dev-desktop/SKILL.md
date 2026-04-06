---
name: speccrew-dev-desktop
description: Desktop Development SOP. Guide System Developer Agent to implement desktop application code (Electron/Tauri) according to system design documents. Reads design blueprints, extracts task checklist, and executes implementation task by task with local quality checks.
tools: Bash, Edit, Write, Glob, Grep, Read
---

# Trigger Scenarios

- System Designer Agent has completed desktop system design, user requests implementation
- User asks "Start desktop development", "Implement desktop app", "Code Electron/Tauri app"
- Detailed design documents are confirmed in `03.system-design/{platform_id}/`

# Workflow

## Step 1: Read Design Documents

Read in order:

1. **INDEX.md**: `speccrew-workspace/iterations/{number}-{type}-{name}/03.system-design/{platform_id}/INDEX.md`
2. **Module Design Documents**: All `*-design.md` files from same directory
3. **API Contract**: `speccrew-workspace/iterations/{number}-{type}-{name}/02.feature-design/[feature-name]-api-contract.md`
4. **Techs Knowledge** (paths from agent context):
   - `speccrew-workspace/knowledges/techs/{platform_id}/tech-stack.md`
   - `speccrew-workspace/knowledges/techs/{platform_id}/architecture.md`
   - `speccrew-workspace/knowledges/techs/{platform_id}/conventions-design.md`
   - `speccrew-workspace/knowledges/techs/{platform_id}/conventions-dev.md`

## Step 2: Analyze Existing Code Structure

Use Glob/Grep to understand current codebase:

| Target | Glob Pattern | Purpose |
|--------|-------------|---------|
| Main process | `src/main/**/*.{ts,js}` or `src-tauri/src/**/*.rs` | Understand main process structure |
| Renderer process | `src/renderer/**/*.{tsx,vue,html}` or `src/**/*.{tsx,vue}` | Understand renderer structure |
| IPC definitions | `src/main/ipc/**/*` or `src-tauri/src/commands/**/*.rs` | Understand IPC channel patterns |
| Window management | `src/main/window/**/*` or patterns with `BrowserWindow` | Understand window patterns |
| Preload scripts | `src/preload/**/*` or `preload.{ts,js}` | Understand preload patterns |
| Native modules | `src/main/native/**/*` or binding files | Identify native dependencies |
| State management | `src/renderer/stores/**/*` or `src/stores/**/*` | Understand store pattern |
| API layer | `src/renderer/apis/**/*` or `src/apis/**/*` | Understand API encapsulation |
| Configuration files | `package.json`, `tauri.conf.json`, `electron-builder.yml` | Build and config patterns |

Document findings for reference in later steps.

## Step 3: Extract Task List

Create task record file:

**Path**: `speccrew-workspace/iterations/{number}-{type}-{name}/04.development/{platform_id}/[feature-name]-task.md`

**Read Template**: `speccrew-dev-desktop/templates/TASK-RECORD-TEMPLATE.md`

### Desktop-Specific Task Types

| Task Type | Description | Example |
|-----------|-------------|---------|
| Main Process Module | Backend logic running in main process | Window manager, IPC handlers, native integrations |
| Renderer Page/Component | UI components in renderer process | React/Vue components, pages, layouts |
| IPC Channel Handler | Communication bridge between processes | `ipcMain.handle`, `#[tauri::command]` |
| Preload Script | Context bridge for secure renderer access | `contextBridge.exposeInMainWorld` |
| Window Management | Window creation, lifecycle, multi-window | BrowserWindow, Window configuration |
| Native Integration | File system, system tray, notifications | Native API wrappers |
| Menu/Shortcut | Application menus, keyboard shortcuts | Menu templates, global shortcuts |
| Auto-Update | Update checking and installation | electron-updater, tauri-updater |
| Security Hardening | Context isolation, CSP, permissions | Preload scripts, security configs |

### Task ID Prefix

Use `DT-` prefix for desktop tasks: `DT-001`, `DT-002`, etc.

### Task Checklist Table

| Task ID | Module | Description | Target Files | IPC Channel | Native Integration | Dependencies | Status |
|---------|--------|-------------|--------------|-------------|-------------------|--------------|--------|
| DT-001 | MainProcess | Create window manager | `src/main/window/manager.ts` | - | Window creation | - | Pending |
| DT-002 | IPC | Implement file operations handler | `src/main/ipc/file.ts` | `file:read`, `file:write` | File system | DT-001 | Pending |
| DT-003 | Renderer | Create main window UI | `src/renderer/pages/Main.tsx` | `file:*` | - | DT-002 | Pending |

**Status**: Pending / In Progress / Completed / Blocked

**Checkpoint A: Present task extraction summary to user for confirmation.**

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

- **Main Process**: Follow conventions-dev.md for Electron/Tauri backend code
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

**Electron**:
```bash
npm run build:dev
# or
npm run electron:dev
```

**Tauri**:
```bash
npm run tauri dev
# or
npm run tauri build --debug
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

| Check | Method |
|-------|--------|
| Context Isolation | Verify `contextIsolation: true` in window config |
| nodeIntegration | Verify `nodeIntegration: false` |
| Preload Script | Verify all IPC goes through preload |
| CSP | Check Content Security Policy headers |

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
- DT-002: Changed IPC payload structure from {original} to {new} because {reason}
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
Desktop Development Complete: {feature-name}
Platform: {platform_id}
Framework: {Electron/Tauri}

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

**Ask user to confirm:**
1. Are all IPC channels working correctly?
2. Is context isolation properly configured?
3. Do native integrations work as expected?
4. Are there any security concerns?

# Key Rules

| Rule | Description |
|------|-------------|
| **Design Document READ-ONLY** | Design documents are reference only - do not modify. Record deviations in task file. |
| **Actual Framework Syntax** | All code MUST use actual framework/library syntax from techs knowledge |
| **Status Markers Required** | Use [EXISTING], [MODIFIED], [NEW] markers for all components, modules, and IPC handlers |
| **Follow Techs Conventions** | Naming, directory structure, patterns must follow techs knowledge |
| **Security First** | Never disable contextIsolation; never enable nodeIntegration in renderer |
| **IPC Through Preload** | All main-renderer communication must go through preload scripts |
| **Task Per File Group** | Each task should map to a logical file group or component |
| **Local Checks Mandatory** | Run lint, type check, and quick verify before marking task complete |
| **Tech Debt Recorded** | All technical debt must be written to iterations/{iter}/tech-debt/ |

# Checklist

- [ ] All design documents loaded before implementation
- [ ] Existing code structure analyzed via Glob/Grep
- [ ] Task record created with complete checklist
- [ ] Checkpoint A passed: task extraction confirmed with user
- [ ] Every design document module covered in task list
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
