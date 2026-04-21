---
name: speccrew-sd-desktop
description: Desktop System Design SOP. Guide System Designer Agent to generate platform-specific desktop detailed design documents by filling technology implementation details into the Feature Spec skeleton. Reads techs knowledge to determine actual framework syntax (Electron/Tauri/Qt) and conventions.
tools: Read, Write, Glob, Grep
---

# Trigger Scenarios

- System Designer Agent dispatches this skill with platform context (platform_id, techs paths, Feature Spec paths)
- Feature Spec has been confirmed, user requests desktop system design
- User asks "Create desktop design for this platform" or "Generate desktop module design"

## AgentFlow Definition

<!-- @agentflow: workflow.agentflow.xml -->

> **REQUIRED**: Before executing this workflow, read the XML workflow specification: `speccrew-workspace/docs/rules/agentflow-spec.md`

## Workflow

## Absolute Constraints

> **These rules apply to ALL steps. Violation = task failure.**

1. **FORBIDDEN: `create_file` for documents** — NEVER use `create_file` to write design documents or INDEX. Documents MUST be created by copying the template (Step 4.2a / Step 5.2a) then filling sections with `search_replace` (Step 4.2b / Step 5.2b). `create_file` produces truncated output on large files.

2. **FORBIDDEN: Full-file rewrite** — NEVER replace the entire document content in a single operation. Always use targeted `search_replace` on specific sections.

3. **MANDATORY: Template-first workflow** — Copy template MUST execute before fill sections. Skipping copy and writing content directly is FORBIDDEN.

## Step 1: Read Inputs

Read in order:

1. **Feature Spec document(s)**: `speccrew-workspace/iterations/{number}-{type}-{name}/02.feature-design/[feature-name]-feature-spec.md`
2. **API Contract**: `speccrew-workspace/iterations/{number}-{type}-{name}/03.api-contract/[feature-name]-api-contract.md`
3. **Desktop techs knowledge** (paths from agent context):
   - `speccrew-workspace/knowledges/techs/{platform_id}/tech-stack.md`
   - `speccrew-workspace/knowledges/techs/{platform_id}/architecture.md`
   - `speccrew-workspace/knowledges/techs/{platform_id}/conventions-design.md`
   - `speccrew-workspace/knowledges/techs/{platform_id}/conventions-dev.md`
4. **Design template**: `speccrew-sd-desktop/templates/SD-DESKTOP-TEMPLATE.md`
5. **Index template**: `speccrew-sd-desktop/templates/INDEX-TEMPLATE.md`

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

Document findings for reference in later steps.

## Step 3: Extract Functions from Feature Spec

Parse Feature Spec to identify all functions (Section 2.N pattern).

For each function, extract:

| Aspect | Content to Extract |
|--------|-------------------|
| UI prototype | ASCII wireframe or description from Feature Spec |
| Interaction flow | User actions and system responses |
| Backend API calls | Required API endpoints from API Contract |
| Local operations | File system, native API, or local DB operations |
| Data requirements | Fields and structures needed |

Mark each function's components/modules as:

| Marker | Meaning | Example |
|--------|---------|---------|
| `[EXISTING]` | Reuse current component/module | `[EXISTING] UserSelect component` |
| `[MODIFIED]` | Enhance/change existing | `[MODIFIED] WindowManager - add new window type` |
| `[NEW]` | Create brand new | `[NEW] FileSyncWorker` |

**Checkpoint A: Present function extraction summary to user for confirmation.**

## Step 4: Generate Module Design Documents

For each function (or logical group of closely related functions = one module):

### 4.1 Read Template

Read `SD-DESKTOP-TEMPLATE.md` for document structure.

### 4.2a Copy Template to Document Path

1. **Read the design template**: `templates/SD-DESKTOP-TEMPLATE.md`
2. **Replace top-level placeholders** with known variables:
   - Module name, feature name, platform ID, etc.
3. **Create the document file** using `create_file`:
   - Target path: `speccrew-workspace/iterations/{number}-{type}-{name}/03.system-design/{platform_id}/{module}-design.md`
   - Content: Template with top-level placeholders replaced
4. **Verify**: Document should have complete section structure ready for filling

### 4.2b Fill Each Section Using search_replace

Fill each section with technology-specific implementation details.

> ⚠️ **CRITICAL CONSTRAINTS:**
> - **FORBIDDEN: `create_file` to rewrite the entire document** — it destroys template structure
> - **MUST use `search_replace` to fill each section individually**
> - **All section titles and numbering MUST be preserved**
> - If a section has no applicable content, keep the section title and replace placeholder with "N/A"

| Section | Technology-Specific Content |
|---------|----------------------------|
| Process architecture | Main/Renderer split (Electron) or Rust Core/WebView (Tauri) |
| IPC channels | Actual channel names and payload types |
| Window design | Window types, sizes, frame options |
| Native integration | File system APIs, system tray, menus |
| Local storage | SQLite/LevelDB/electron-store patterns |
| Security | Context isolation, preload scripts, CSP |
| Auto-update | electron-updater or tauri-updater patterns |
| Pseudo-code | MUST use actual framework syntax from techs knowledge |

**Key Rules for Pseudo-code**:
- MUST use actual framework API syntax from techs knowledge
- NOT generic pseudo-code
- Include actual import statements
- Use actual IPC/store/API patterns from conventions
- For Electron: use `ipcMain.handle`, `ipcRenderer.invoke`, `BrowserWindow`
- For Tauri: use `#[tauri::command]`, `invoke()`, `Window`

### 4.3 Verify Output

Verify the completed design document:
- All sections filled with actual content (no remaining placeholders)
- Mermaid diagrams render correctly
- Pseudo-code uses actual framework syntax from techs knowledge

## Step 5: Generate Platform INDEX.md

After all module designs are complete:

### 5.1 Read Template

Read `INDEX-TEMPLATE.md` for document structure.

### 5.2a Copy Index Template to Document Path

1. **Read the index template**: `templates/INDEX-TEMPLATE.md`
2. **Replace top-level placeholders** (platform name, feature name, etc.)
3. **Create the document file** using `create_file`:
   - Target path: `speccrew-workspace/iterations/{number}-{type}-{name}/03.system-design/{platform_id}/INDEX.md`
   - Content: Template with top-level placeholders replaced

### 5.2b Fill Index Sections Using search_replace

> ⚠️ **CRITICAL CONSTRAINTS:**
> - **FORBIDDEN: `create_file` to rewrite the entire document** — it destroys template structure
> - **MUST use `search_replace` to fill each section individually**
> - **All section titles and numbering MUST be preserved**

| Section | Content Source |
|---------|---------------|
| Tech stack summary | tech-stack.md |
| Target operating systems | tech-stack.md OS support |
| Shared design decisions | architecture.md, conventions-design.md |
| Process architecture strategy | architecture.md process model |
| IPC patterns | conventions-design.md IPC section |
| Security model | architecture.md security section |
| Native dependencies | tech-stack.md dependencies |
| Packaging & distribution | architecture.md distribution section |

### 5.3 Build Module List

Create table with links to each module design document.

### 5.4 Verify Output

Verify the completed INDEX.md:
- All sections filled with actual content (no remaining placeholders)
- All module design documents are correctly linked
- Platform-level summary is complete

## Step 6: Present Summary

Present to user:

```
Desktop System Design Summary for: {feature-name}
Platform: {platform_id}
Framework: {Electron/Tauri/Qt}

Module Design Documents: {count}
├── {module1}-design.md
├── {module2}-design.md
└── ...

Key Design Decisions:
- Process Architecture: {approach}
- IPC Strategy: {approach}
- State Management: {approach}
- Security Model: {approach}
- Auto-Update: {approach}

Concerns/Trade-offs:
- {list any concerns}
```

**Ask user to confirm:**
1. Are the process architectures appropriate?
2. Is the IPC communication design correct?
3. Do the pseudo-code patterns match project conventions?
4. Are all API calls from API Contract covered?
5. Is the native integration approach suitable?

## Step 7: Task Completion Report

After completing all steps, output a structured completion report for the System Designer Agent to parse and update DISPATCH-PROGRESS.json:

### On Success

```
## Task Completion Report
- **Status**: SUCCESS
- **Task ID**: {task_id from context}
- **Platform**: {platform_id}
- **Feature**: {feature_name}
- **Output Files**:
  - speccrew-workspace/iterations/{iter}/03.system-design/{platform_id}/INDEX.md
  - speccrew-workspace/iterations/{iter}/03.system-design/{platform_id}/{module1}-design.md
  - speccrew-workspace/iterations/{iter}/03.system-design/{platform_id}/{module2}-design.md
- **Summary**: Desktop system design completed for {feature_name} on {platform_id} with {count} module designs
```

### On Failure

```
## Task Completion Report
- **Status**: FAILED
- **Task ID**: {task_id from context}
- **Platform**: {platform_id}
- **Feature**: {feature_name}
- **Output Files**: []
- **Error**: {description of what went wrong}
- **Error Category**: DEPENDENCY_MISSING | VALIDATION_ERROR | BLOCKED
- **Recovery Hint**: {suggestion for how to resolve or retry}
```

**Error Categories:**
- `DEPENDENCY_MISSING`: Required input file or knowledge document not found
- `VALIDATION_ERROR`: Input validation failed (e.g., invalid Feature Spec format)
- `BLOCKED`: Blocked by external dependency or prerequisite not met

## OUTPUT EFFICIENCY RULES

When executing this skill:

1. **Direct-to-File Output**: All design content (architecture diagrams, API mappings, component specifications, data models) MUST be written directly to the output file
2. **Minimal Conversation Output**: Only output:
   - Block execution announcements (1 line each): `"[Block XX] Designing..."`
   - Error messages requiring attention
   - Task Completion Report (final summary)
3. **FORBIDDEN in conversation**:
   - ❌ Full document sections or drafts
   - ❌ Mermaid diagrams displayed in chat
   - ❌ API endpoint listings
   - ❌ Data model tables
   - ❌ Architecture descriptions longer than 2 lines
4. **Rationale**: Workers run in batch mode. Displaying design content in conversation wastes context window and provides no value since content goes to file anyway.

# Key Rules

| Rule | Description |
|------|-------------|
| **Actual Framework Syntax** | All pseudo-code MUST use actual framework/library syntax from techs knowledge, NOT generic code |
| **API Contract READ-ONLY** | API Contract is reference only - do not modify |
| **One Module Per Function Group** | Each module design document maps to one or more related Feature Spec functions |
| **Status Markers Required** | Use [EXISTING], [MODIFIED], [NEW] markers for all components, modules, and IPC handlers |
| **Follow Techs Conventions** | Naming, directory structure, patterns must follow techs knowledge |
| **Desktop-Specific Concerns** | Must address process architecture, IPC, native integration, local storage, auto-update |

# Checklist

- [ ] All techs knowledge documents loaded before design
- [ ] Existing code structure analyzed via Glob/Grep
- [ ] Every Feature Spec function covered in a module design
- [ ] All API calls from API Contract referenced correctly
- [ ] Pseudo-code uses actual framework syntax (not generic)
- [ ] Process architecture follows conventions-design.md
- [ ] IPC channels follow naming conventions from techs
- [ ] Window management follows existing patterns
- [ ] Native integration uses correct APIs
- [ ] Security design includes context isolation and CSP
- [ ] Auto-update mechanism specified
- [ ] INDEX.md generated with complete module list
- [ ] All files written to correct paths under 03.system-design/{platform_id}/
- [ ] Checkpoint A passed: function extraction confirmed with user
