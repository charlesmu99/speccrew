---
name: speccrew-knowledge-bizs-dispatch
description: Dispatch bizs knowledge base generation tasks with 5-stage pipeline. Handles feature inventory, feature analysis with skill routing, graph data writing, module summarization, UI style pattern extraction, and system summary.
tools: Read, Write, Task, Bash
---

# Bizs Knowledge Dispatch

Orchestrate **bizs knowledge base generation** with a 5-stage pipeline: Feature Inventory → Feature Analysis + Graph Write → Module Summarize → UI Style Pattern Extract → System Summary.

## Quick Reference — Execution Flow

```
Stage 0: Platform Detection
  └─ Read techs-manifest → Identify platforms
        ↓
Stage 1: Feature Inventory Init
  └─ 1a: bizs-init-features per platform
  └─ 1b: Merge features
  └─ 1c: Validate inventory
        ↓
Stage 2: Feature Analysis (PARALLEL)
  └─ Dispatch api-analyze + ui-analyze workers per platform
  └─ After each analyze worker completes → dispatch corresponding graph worker
  └─ Monitor completion markers
        ↓
Stage 3: Module Summarize (PARALLEL)
  └─ 3.0: module-summarize per module
  └─ 3.5: UI style extraction
        ↓
Stage 4: System Summary
  └─ system-summarize → system-overview.md
```

## Language Adaptation

**CRITICAL**: All generated documents must match the user's language. Detect the language from the user's input and pass it to all downstream Worker Agents.

- User writes in 中文 → Generate Chinese documents, pass `language: "zh"` to workers
- User writes in English → Generate English documents, pass `language: "en"` to workers
- User writes in other languages → Use appropriate language code

**All downstream skills must receive the `language` parameter and generate content in that language only.**

## Trigger Scenarios

- "Initialize bizs knowledge base"
- "Generate business knowledge from source code"
- "Dispatch bizs knowledge generation"
- "Generate knowledge base from src/views directory"
- "Analyze this subdirectory for knowledge base"

## Input

| Variable | Description | Default |
|----------|-------------|---------|
| `source_path` | Source code path (can be a subdirectory; auto-detects platform root by traversing upward) | project root |
| `language` | User's language code (e.g., "zh", "en") | **REQUIRED** |
| `sync_mode` | `"full"` or `"incremental"` | `"full"` |
| `base_commit` | (incremental only) Git base commit hash | — |
| `head_commit` | (incremental only) Git HEAD commit hash | `HEAD` |
| `changed_files` | (incremental only) Pre-computed changed file list | — |
| `max_concurrent_workers` | Maximum parallel Worker Agents | `5` |
| `graph_root` | Graph data output root path | `speccrew-workspace/knowledges/bizs/graph` |
| `graph_write_script_path` | Path to graph-write script file | `{graph_write_skill_path}/scripts/graph-write.js` |
| `completed_dir` | Marker file output directory for Worker results | `{sync_state_path}/completed` |

> **Note**: Ensure `graph_root` directory exists before first execution. If it does not exist, create it: `mkdir -p "{graph_root}"` (or equivalent on Windows: `New-Item -ItemType Directory -Path "{graph_root}" -Force`).

## Output

- Entry directories: `speccrew-workspace/knowledges/base/sync-state/knowledge-bizs/entry-dirs-{platform}.json`
- Feature inventory: `speccrew-workspace/knowledges/base/sync-state/knowledge-bizs/features-{platform}.json`
- Feature docs: `speccrew-workspace/knowledges/bizs/{platform}/{module}/features/*.md`
- Module overviews: `speccrew-workspace/knowledges/bizs/{platform}/{module}/*-overview.md`
- UI style patterns: `speccrew-workspace/knowledges/techs/{platform_id}/ui-style-patterns/` (page-types/, components/, layouts/)
- System overview: `speccrew-workspace/knowledges/bizs/system-overview.md`
- Graph data: `speccrew-workspace/knowledges/bizs/graph/`

## Workflow Overview

**Execution Pseudocode:**

```
INPUT: source_path, language, sync_mode, max_concurrent_workers

STAGE 0: Platform Detection
  FOR each detected platform:
    Identify platform_type, platform_subtype, tech_stack
  Present platform list for user confirmation

STAGE 1: Feature Inventory
  Stage 1a: Entry Directory Recognition → Generate entry-dirs-{platform}.json
  Stage 1b: Feature Inventory → Generate features-{platform}.json
  Stage 1c (incremental only): Merge features with existing state

STAGE 2: Feature Analysis (REPEAT until all features processed)
  Step 0: Ensure completed_dir exists
  Step 1: Get next batch of pending features
  Step 2: Launch parallel Workers (API or UI analysis)
  Step 3: Process batch results, update features.json, write graph

STAGE 3: Module Summarize (parallel per module)
  FOR each module:
    Launch Worker with module-summarize skill

STAGE 3.5: UI Style Pattern Extract (parallel per frontend platform)
  FOR each frontend platform:
    Launch Worker with ui-style-extract skill

STAGE 4: System Summary
  Launch Worker with system-summarize skill

OUTPUT: system-overview.md, graph data, module overviews
```

**Stage Sequence:**

```mermaid
flowchart TB
    S0[Stage 0: Platform Detection] --> S1a[Stage 1a: Entry Directory Recognition]
    S1a --> S1b[Stage 1b: Feature Inventory]
    S1b --> S1c[Stage 1c: Feature Merge]
    S1c --> S2[Stage 2: Feature Analysis + Graph Write]
    S2 --> S3[Stage 3: Module Summarize]
    S3 --> S3_5[Stage 3.5: UI Style Pattern Extract]
    S3_5 --> S4[Stage 4: System Summary]
```

---

## Stage 0: Platform Detection

**Objective**: Automatically discover ALL platforms in the project. Do NOT hardcode platform lists.

**Detection steps**:

1. **Scan for backend modules**:
   ```
   # Look for all backend module directories
   Get-ChildItem -Path "{project_root}" -Filter "yudao-module-*" -Directory
   # Or for other project structures:
   Get-ChildItem -Path "{project_root}" -Directory | Where-Object { $_.Name -match "^(module-|service-|api-)" }
   ```
   Each discovered module becomes a `backend-{module_name}` platform (e.g., `yudao-module-system` → `backend-system`).

2. **Scan for frontend projects**:
   ```
   # Look for UI/frontend directories
   Get-ChildItem -Path "{project_root}" -Directory | Where-Object { $_.Name -match "ui|frontend|web|app" }
   # Then check each for actual source code (package.json, src/ directory)
   ```
   Classify by tech stack: Vue → `web-vue`, UniApp → `mobile-uniapp`, React → `web-react`, etc.

3. **Validate each platform**:
   - Has actual source code files (not empty placeholder directories)
   - Has a recognizable project structure (package.json for frontend, pom.xml/build.gradle for backend)

4. **Present platform list to user for confirmation** before proceeding to Stage 1a.

**Output**: A confirmed list of platforms with:

| Platform ID | Source Path | Platform Type | Tech Stack |
|---|---|---|---|
| `web-vue` | `yudao-ui/yudao-ui-admin-vue3` | web | vue, vite, element-plus |
| `backend-system` | `yudao-module-system/src/main/java/.../system` | backend | spring-boot, mybatis-plus |
| ... | ... | ... | ... |

> **CRITICAL**: NEVER hardcode a fixed number of platforms. Always scan the project directory to discover ALL modules. Missing a platform means incomplete knowledge base generation.

> ✅ **Stage 0 Milestone**: Platform detection complete. Platforms: {platform_list}. → Proceed to Stage 1.

---

## Stage 1a: Entry Directory Recognition

**Goal**: For each detected platform, analyze the source directory tree and identify all entry directories (API controllers for backend, views/pages for frontend), then classify them into business modules.

> **IMPORTANT**: This stage is executed **directly by the dispatch agent (Leader)**, NOT delegated to a Worker Agent.

**Prerequisite**: Stage 0 completed. Platform list confirmed with `platformId`, `sourcePath`, `platformType`, `platformSubtype`, and `techIdentifier` for each platform.

**Execution**: Follow the `speccrew-knowledge-bizs-identify-entries` skill workflow:

1. For each platform, read the source directory tree (3 levels deep)
2. Identify entry directories based on platform type:
   - **Backend (Spring/Java/Kotlin)**: Find directories containing `*Controller.java` or `*Controller.kt` files. Module name = business package name of the entry directory
   - **Frontend (Vue/React)**: Find `views/` or `pages/` directories. First-level subdirectories = business modules
   - **Mobile (UniApp)**: Find first-level subdirectories under `pages/` + top-level `pages-*` directories
   - **Mobile (Mini Program)**: Find first-level subdirectories under `pages/`
3. Apply exclusion rules from `tech-stack-mappings.json` (technical dirs, build dirs, test dirs, config dirs)
4. Generate `entry-dirs-{platform_id}.json` files
5. Validate: modules array non-empty, module names are business-meaningful

> For detailed entry identification logic, exclusion rules, JSON format, and validation rules, refer to the `speccrew-knowledge-bizs-identify-entries` skill documentation.

**Output**: `{speccrew_workspace}/knowledges/base/sync-state/knowledge-bizs/entry-dirs-{platform_id}.json`

**JSON Format**:
```json
{
  "platformId": "backend-ai",
  "platformName": "AI Module Backend",
  "platformType": "backend",
  "platformSubtype": "ai",
  "sourcePath": "yudao-module-ai/src/main/java/cn/iocoder/yudao/module/ai",
  "techStack": ["spring-boot", "mybatis-plus"],
  "modules": [
    { "name": "chat", "entryDirs": ["controller/admin/chat"] },
    { "name": "image", "entryDirs": ["controller/admin/image"] }
  ]
}
```

**Error handling**: If entry directory recognition fails for a platform, STOP and report the error with platform details. Do NOT proceed to Stage 1b for that platform.

---

## Stage 1b: Generate Feature Inventory (Direct Execution)

**Goal**: Based on the entry-dirs JSON generated in Stage 1a, generate per-platform feature inventory files.

> **IMPORTANT**: This stage is executed **directly by the dispatch agent (Leader)**, NOT delegated to a Worker Agent.
> Worker Agents do not have `run_in_terminal` capability, which is required for script execution.

**Prerequisite**: Stage 1a completed. `entry-dirs-{platform_id}.json` files exist in `{sync_state_path}/knowledge-bizs/`.

**Action** (dispatch executes directly via `run_in_terminal`):

1. **Read platform mapping**: Read `speccrew-workspace/docs/configs/platform-mapping.json` and `tech-stack-mappings.json` for platform configuration
2. **Locate the inventory script**: Find `generate-inventory.js` in the `speccrew-knowledge-bizs-init-features` skill's scripts directory:
   - Script location: `{ide_skills_dir}/speccrew-knowledge-bizs-init-features/scripts/generate-inventory.js`
   - Where `{ide_skills_dir}` is the IDE-specific skills directory (e.g., `.qoder/skills/`, `.cursor/skills/`, `.vscode/skills/`, `.speccrew/skills/`)
   - Use `ListDir` to locate the script if the exact path is unknown
3. **Execute inventory script** for each platform:
   ```
   node "{path_to_generate_inventory_js}" --entryDirsFile "{entry_dirs_file_path}"
   ```

**Script Parameters**:
- `--entryDirsFile`: Path to the `entry-dirs-{platform_id}.json` file generated in Stage 1a (required)

**Note**: `platformId` and `sourcePath` are read from the entry-dirs JSON file. Platform mapping and output directory are automatically derived by the script.

**Optional Parameters**:
- `--techIdentifier`: Technology identifier for tech-stack lookup (auto-detected from platform mapping if omitted)
- `--fileExtensions`: Comma-separated list of file extensions to include (e.g., `.java,.kt`)
- `--excludeDirs`: Additional directories to exclude

**Output**:
- `{speccrew_workspace}/knowledges/base/sync-state/knowledge-bizs/features-{platform_id}.json` — Per-platform feature inventory files
- Each file contains: platform metadata, modules list, and flat features array with `analyzed` status

**Features JSON Structure**:
```json
{
  "platformId": "backend-ai",
  "platformName": "AI Module",
  "platformType": "backend",
  "platformSubtype": "ai",
  "techIdentifier": "spring",
  "sourcePath": "yudao-module-ai/src/main/java/cn/iocoder/yudao/module/ai",
  "modules": [
    { "name": "chat", "featureCount": 12 },
    { "name": "image", "featureCount": 8 },
    { "name": "knowledge", "featureCount": 15 }
  ],
  "features": [
    {
      "fileName": "ChatConversationController",
      "sourcePath": "controller/admin/chat/ChatConversationController.java",
      "module": "chat",
      "documentPath": "speccrew-workspace/knowledges/bizs/backend-ai/chat/ChatConversationController.md",
      "platformType": "backend",
      "platformSubtype": "ai",
      "analyzed": false
    }
  ]
}
```

**Error handling**: If the script exits with non-zero code, STOP and report the error. Do NOT create workaround scripts.

---

## Stage 1c: Feature Merge (Incremental)

**Goal**: If incremental inventory files (`features-*.new.json`) are detected, merge them with existing `features-*.json` files. Identifies added/removed/changed features, resets changed features for re-analysis, and cleans up artifacts for removed features.

> **IMPORTANT**: This stage is executed **directly by the dispatch agent (Leader)** via `run_in_terminal`. NOT delegated to a Worker Agent.

**Prerequisite**: Stage 1b completed.

**Skip condition**: If no `features-*.new.json` files exist in `{sync_state_path}/knowledge-bizs/`, skip this Stage entirely and proceed to Stage 2.

**Action** (dispatch executes directly via `run_in_terminal`):

1. **Locate the merge script**: Find `merge-features.js` in the `speccrew-knowledge-bizs-dispatch` skill's scripts directory:
   - Script location: `{ide_skills_dir}/speccrew-knowledge-bizs-dispatch/scripts/merge-features.js`

2. **Execute merge script**:
   ```
   node "{path_to_merge_features_js}" --syncStatePath "{sync_state_path}/knowledge-bizs" --completedDir "{completed_dir}" --projectRoot "{project_root}"
   ```

3. **Read output JSON** from stdout and report merge results:
   - Added features: new source files discovered
   - Removed features: source files no longer exist (documents and markers cleaned up)
   - Changed features: source files modified since last analysis (reset to `analyzed: false`)
   - Unchanged features: source files not modified (analysis state preserved)

**Merge Logic**:

| Situation | Condition | Action |
|-----------|-----------|--------|
| Added | In new scan but not in existing features | Add with `analyzed: false` |
| Removed | In existing features but not in new scan | Remove from list, delete `.md` doc + `.done.json` + `.graph.json` markers |
| Changed | Both exist, `lastModified > completedAt` | Reset `analyzed: false` for re-analysis |
| Unchanged | Both exist, `lastModified <= completedAt` | Preserve existing analysis state |

**Output**: Updated `features-{platform}.json` files where:
- New features: `analyzed: false`
- Source-modified features: `analyzed: false`  
- Unmodified features: preserved original `analyzed` status
- Deleted features: removed from list, associated documents and markers cleaned up

**Error handling**: If the merge script exits with non-zero code, STOP and report the error. Do NOT proceed to Stage 2 until merge is resolved.

> ✅ **Stage 1 Milestone**: Feature inventory initialized. {feature_count} features across {platform_count} platforms. → Proceed to Stage 2.

---

> **⚠️ MANDATORY RULES FOR PARALLEL EXECUTION (Stage 2-3)**:
> 1. ALL workers for the same stage MUST be dispatched in PARALLEL — sequential execution is FORBIDDEN
> 2. Each worker runs independently — do NOT wait for one worker before dispatching the next
> 3. Monitor completion via marker files, NOT by polling worker status
> 4. Failed workers can be retried independently without affecting successful ones
> 5. Do NOT proceed to next Stage until ALL workers in current Stage have completed or failed

---

## Stage 2: Feature Analysis (Batch Processing)

**Overview**: Process all pending features in batches. Each batch gets a set of features, launches Worker Agents to analyze them, then processes the results.

> **Script execution rule**: All script calls in Stage 2 are executed **directly by the dispatch agent** via `run_in_terminal`. Only the analysis tasks are delegated to Worker Agents.

**Skill Routing Table (by platformType):**

| platformType | skill_name | Description |
|--------------|------------|-------------|
| `web` | `speccrew-knowledge-bizs-ui-analyze` | Web frontend (Vue/React/Angular) |
| `mobile` | `speccrew-knowledge-bizs-ui-analyze` | Mobile apps (Flutter/React Native/UniApp) |
| `desktop` | `speccrew-knowledge-bizs-ui-analyze` | Desktop apps (Electron/WPF) |
| `backend` | `speccrew-knowledge-bizs-api-analyze` | Backend APIs (Java/Python/Node.js) |

> **CRITICAL**: Use this routing table to select the correct skill for each feature in Step 2.

#### Execution Flow

Repeat the following 3 steps until all features are processed:

**Step 0: Ensure completed directory exists (MANDATORY)**

Before launching any Workers, you MUST create the `completed_dir` directory using Node.js (cross-platform compatible):

```bash
node -e "require('fs').mkdirSync('{completed_dir}', {recursive: true}); console.log('completed dir ready')"
```

> **Note**: Using Node.js ensures cross-platform compatibility (Windows/macOS/Linux).

> **⚠️ CRITICAL**: The `completed_dir` MUST be an **absolute path** (e.g., `d:/dev/speccrew/speccrew-workspace/knowledges/base/sync-state/knowledge-bizs/completed`). Relative paths will cause Worker marker file writes to fail silently.

**Step 1: Get Next Batch**

1. **Locate the script**: Find `batch-orchestrator.js` in the `speccrew-knowledge-bizs-dispatch` skill's scripts directory:
   - Script location: `{ide_skills_dir}/speccrew-knowledge-bizs-dispatch/scripts/batch-orchestrator.js`
   - Where `{ide_skills_dir}` is the IDE-specific skills directory (e.g., `.qoder/skills/`, `.cursor/skills/`, `.vscode/skills/`, `.speccrew/skills/`)
   - Use `ListDir` to locate the script if the exact path is unknown

2. **Execute get-batch**:
   ```
   node "{path_to_batch_orchestrator_js}" get-batch --syncStatePath "{sync_state_path}" --batchSize 5
   ```

- If output `action` is `"done"` → All features processed. Exit Stage 2, proceed to Stage 3.
- If output `action` is `"process"` → The `batch` array contains features to analyze. Proceed to Step 2.

**Step 2: Launch Workers — MUST BE PARALLEL**

⚠️ **CRITICAL**: You MUST launch ALL features in the current batch SIMULTANEOUSLY as parallel Worker Tasks. **FORBIDDEN**: sequential launch (start one Worker, wait, then start next).

For each feature in the `batch` array, prepare a Worker Task:
- **Select skill** using the routing table at Stage 2 start
- **Worker parameters**: Pass all feature fields plus `language`, `completed_dir`, `sourceFile`, `skill_path`
- **Behavior constraint**: Worker MUST NOT create any temporary scripts. If execution fails, STOP and report error.

**Execution sequence**:
1. Prepare ALL Worker Tasks first (do NOT launch yet)
2. Launch ALL Workers at the SAME TIME in a single batch dispatch
3. Wait for ALL Workers to complete before proceeding to Step 2.5
4. Each Worker writes `.done` and `.graph.json` marker files to `completed_dir` upon completion

**Step 2.5: Launch Graph Workers — PARALLEL per Completed Analyze Worker**

After each analyze worker completes (writes `.done.json` marker), immediately dispatch the corresponding graph worker:

| Analyze Worker | Graph Worker | Input |
|----------------|--------------|-------|
| `speccrew-knowledge-bizs-api-analyze` | `speccrew-knowledge-bizs-api-graph` | `documentPath` from analyze output |
| `speccrew-knowledge-bizs-ui-analyze` | `speccrew-knowledge-bizs-ui-graph` | `documentPath` from analyze output |

**Graph Worker Task Prompt Format**:

**For API Graph Worker**:
```json
{
  "skill_name": "speccrew-knowledge-bizs-api-graph",
  "instructions": "Generate graph data nodes and edges from the analyzed API feature document.\\n\\nRequirements:\\n- Read the API analysis document at api_analysis_path\\n- Extract entities (APIs, services, tables, DTOs)\\n- Generate graph nodes and edges\\n- Write graph JSON to output_dir\\n- Create .graph-done.json completion marker at output_dir",
  "context": {
    "api_analysis_path": "<feature.documentPath>",
    "platform_id": "<feature.platform_id>",
    "output_dir": "<completed_dir_absolute_path>",
    "module": "<feature.module>",
    "fileName": "<feature.fileName>",
    "sourcePath": "<feature.sourcePath>",
    "sourceFile": "<feature.sourceFile>",
    "language": "<user language>",
    "subpath": "<computed_subpath_from_sourcePath>"
  }
}
```

**For UI Graph Worker**:
```json
{
  "skill_name": "speccrew-knowledge-bizs-ui-graph",
  "instructions": "Generate graph data nodes and edges from the analyzed UI feature document.\\n\\nRequirements:\\n- Read the UI analysis document at documentPath\\n- Extract entities (pages, components, API calls, navigations)\\n- Generate graph nodes and edges\\n- Write graph JSON to completed_dir\\n- Create .graph-done.json completion marker at completed_dir",
  "context": {
    "feature": "<complete_feature_object>",
    "fileName": "<feature.fileName>",
    "sourcePath": "<feature.sourcePath>",
    "documentPath": "<feature.documentPath>",
    "module": "<feature.module>",
    "platform_type": "<feature.platform_type>",
    "platform_subtype": "<feature.platform_subtype>",
    "completed_dir": "<completed_dir_absolute_path>",
    "sourceFile": "<feature.sourceFile>",
    "status": "<analysis_status>",
    "analysisNotes": "<analysis_notes>",
    "language": "<user language>"
  }
}
```

**Execution sequence**:
1. Scan `completed_dir` for new `.done.json` files from Step 2
2. For each completed analyze worker, prepare corresponding graph worker task
3. Launch ALL graph workers for the current batch in PARALLEL
4. Wait for ALL graph workers to complete
5. Each graph worker writes `.graph-done.json` marker to `completed_dir`

Example: If batch has 5 features → create and launch 5 Worker Tasks simultaneously, NOT one by one.

**Worker Task Prompt Format**:

```json
{
  "skill_name": "speccrew-knowledge-bizs-ui-analyze",
  "instructions": "请分析以下源代码文件，生成详细的功能文档。\n\n⚠️ CRITICAL - Template Fill-in Workflow (MANDATORY):\n1. First, copy the analysis template to documentPath (template structure = document skeleton)\n2. Then fill each Section using search_replace to replace placeholders with actual data\n3. NEVER use create_file to rewrite the entire document — this destroys template structure\n4. NEVER delete or skip any template Section — if no data available, fill with \"N/A\"\n5. NEVER create custom Section structures — use ONLY the template's predefined Sections\n\n要求:\n- 读取源代码文件，理解相关功能接口\n- 生成详细的文档到 documentPath\n- 创建两个标记文件到 completed_dir\n- 使用 {skill_name} 技能完成此任务",
  "context": {
    "fileName": "<feature.fileName>",
    "sourcePath": "<feature.sourcePath>",
    "module": "<feature.module>",
    "documentPath": "<feature.documentPath>",
    "platformType": "<feature.platformType>",
    "platformSubtype": "<feature.platformSubtype>",
    "language": "<user language>",
    "completed_dir": "<completed_dir_absolute_path>",
    "sourceFile": "<feature.sourceFile>"
  }
}
```

> **⚠️ CRITICAL - completed_dir must be ABSOLUTE path**: The `completed_dir` parameter passed to Worker MUST be an absolute path (e.g., `d:/dev/speccrew/speccrew-workspace/knowledges/base/sync-state/knowledge-bizs/completed`), NOT a relative path. Workers do not have context of the dispatch working directory.

> ⚠️ **CRITICAL - Marker File Format**:
> The `.done` file MUST be valid JSON format, NOT plain text.
>
> Required `.done` JSON structure:
> ```json
> {
>   "fileName": "<class name without extension>",
>   "sourcePath": "<relative source file path>",
>   "sourceFile": "<features JSON filename, e.g. features-backend-ai.json>",
>   "module": "<business module name>",
>   "status": "success|partial|failed",
>   "analysisNotes": "<brief notes>"
> }
> ```
>
> ❌ **WRONG**: Writing plain text like "COMPLETED" or "Analysis done"
> ✅ **CORRECT**: Writing valid JSON with all required fields

---

### **CRITICAL - Marker File Naming Convention (STRICT RULES)**

**✅ CORRECT Format - MUST USE:**
```
{completed_dir}/{module}-{subpath}-{file_name}.done.json     ← Completion status marker (JSON format)
{completed_dir}/{module}-{subpath}-{file_name}.graph.json    ← Graph data marker (JSON format)
```

**Naming Rule Explanation:**

The marker filename MUST follow the composite naming pattern `{module}-{subpath}-{file_name}` to prevent conflicts between same-named source files.

**How Workers Generate the Filename:**

1. **module**: Use the `{{module}}` input variable directly

2. **subpath**: Extract from `{{source_path}}`:
   - For UI (Vue/React): Middle path between `views/` or `pages/` and the file name
   - For API (Java): Middle path between controller root and the file name
   - Replace path separators (`/`) with hyphens (`-`)
   - Omit if file is at module root (empty subpath)

3. **file_name**: Use `{{file_name}}` input variable (file name WITHOUT extension)

**Examples:**

| Source File | module | subpath | file_name | Marker Filename |
|-------------|--------|---------|-----------|-----------------|
| `yudao-ui/.../views/system/notify/message/index.vue` | `system` | `notify-message` | `index` | `system-notify-message-index.done.json` |
| `yudao-ui/.../views/system/user/index.vue` | `system` | `user` | `index` | `system-user-index.done.json` |
| `yudao-module-system/.../controller/admin/user/UserController.java` | `system` | `controller-admin-user` | `UserController` | `system-controller-admin-user-UserController.done.json` |

**Full Path Examples:**
- `d:/dev/speccrew/speccrew-workspace/knowledges/base/sync-state/knowledge-bizs/completed/system-notify-message-index.done.json`
- `d:/dev/speccrew/speccrew-workspace/knowledges/base/sync-state/knowledge-bizs/completed/system-controller-admin-user-UserController.graph.json`

**❌ WRONG Format - NEVER USE:**
```
{file_name}.done.json              ← WRONG: missing module and subpath (causes conflicts)
{file_name}.graph.json             ← WRONG: missing module and subpath (causes conflicts)
{file_name}.completed.json         ← WRONG extension
{file_name}.done                   ← WRONG extension (missing .json)
{file_name}_done.json              ← WRONG separator and extension
```

**❌ WRONG Filename Examples - NEVER USE:**
- `index.done.json` - WRONG: missing module and subpath (conflicts with other `index.vue` files)
- `UserController.done.json` - WRONG: missing module and subpath (conflicts with other controllers)
- `UserController.completed.json` - WRONG: uses `.completed.json` instead of `.done.json`
- `UserController_done.json` - WRONG: uses underscore and wrong extension

---

### **CRITICAL - Path Format Rules (STRICT RULES)**

**Path Variables:**
- `completed_dir` - Absolute path to marker files directory (passed to Worker)
- `sourcePath` - Relative path to source file (from features JSON, passed to Worker)
- `documentPath` - Relative path to generated document (from features JSON, passed to Worker)

**Path Format Requirements:**

| Field | Format | Example |
|-------|--------|---------|
| `sourcePath` in `.done` | Project-root-relative path | `yudao-module-system/yudao-module-system-biz/src/main/java/cn/iocoder/yudao/module/system/controller/admin/user/UserController.java` |
| `documentPath` in `.done` | Relative path (as-is from input) | `speccrew-workspace/knowledges/bizs/admin-api/system/user/UserController.md` |
| `sourcePath` in `.graph.json` nodes | Project-root-relative path | `yudao-module-system/yudao-module-system-biz/src/main/java/cn/iocoder/yudao/module/system/controller/admin/user/UserController.java` |
| `documentPath` in `.graph.json` nodes | Relative path (as-is from input) | `speccrew-workspace/knowledges/bizs/admin-api/system/user/UserController.md` |

**⚠️ CRITICAL - sourcePath Validation Rules:**
- `sourcePath` MUST be a project-root-relative path (e.g., `yudao-ui/yudao-ui-admin-uniapp/src/pages/bpm/index.vue`, `yudao-module-system/src/main/java/.../UserController.java`)
- NEVER use platform-source-relative short paths (e.g., `pages/bpm/index.vue`, `pages-bpm/category/index.vue`, `controller/admin/user/UserController.java`)
- Exception: `node_modules/` and third-party library paths are kept as-is (e.g., `node_modules/wot-design-uni/components/wd-icon/wd-icon.vue`)

**⚠️ CRITICAL - documentPath Rules:**
- When no corresponding document exists for a component/API, `documentPath` MUST be `"N/A"`
- NEVER use empty string `""` for `documentPath` — this causes downstream processing issues

**⚠️ CRITICAL: NEVER convert relative paths to absolute paths in the JSON content!**

**Correct vs Wrong Example:**
```json
// ✅ CORRECT - .done file content:
{
  "fileName": "UserController",
  "sourcePath": "yudao-module-system/yudao-module-system-biz/src/main/java/cn/iocoder/yudao/module/system/controller/admin/user/UserController.java",
  "sourceFile": "features-admin-api.json",
  "module": "system",
  "status": "success",
  "analysisNotes": "Successfully analyzed UserController"
}

// ❌ WRONG - .done file content (DO NOT DO THIS):
{
  "fileName": "UserController",
  "sourcePath": "d:/dev/project/yudao-module-system/.../UserController.java",  ← WRONG: absolute path
  "sourceFile": "features-admin-api.json",
  "module": "system",
  "status": "success"
}
```

---

**Marker File Naming Convention Summary:**

| Marker Type | File Name Format | Example |
|-------------|------------------|---------|
| Completion marker | `{module}-{subpath}-{fileName}.done.json` | `system-notify-message-index.done.json`, `system-controller-admin-user-UserController.done.json` |
| Graph data | `{module}-{subpath}-{fileName}.graph.json` | `system-notify-message-index.graph.json`, `system-controller-admin-user-UserController.graph.json` |

**Worker Completion Requirements:**

- Worker MUST create **both** `.done.json` (JSON) and `.graph.json` (JSON) marker files
- **Both files must be valid JSON format** — plain text content will cause processing failures
- Task is considered **incomplete** if either file is missing or contains invalid JSON
- The `.done.json` file must include all required fields: `fileName`, `sourcePath`, `sourceFile`, `module`, `status`, `analysisNotes`
- The `.graph.json` file must follow the graph data schema defined in `speccrew-knowledge-graph-write/SKILL.md`
- **sourcePath and documentPath MUST be relative paths** (as received from features JSON), NEVER convert to absolute paths
- **documentPath MUST NOT be empty string** — use `"N/A"` when no corresponding document exists

**Step 3: Process Batch Results**

1. **Locate the script**: Find `batch-orchestrator.js` in the `speccrew-knowledge-bizs-dispatch` skill's scripts directory:
   - Script location: `{ide_skills_dir}/speccrew-knowledge-bizs-dispatch/scripts/batch-orchestrator.js`
   - Where `{ide_skills_dir}` is the IDE-specific skills directory (e.g., `.qoder/skills/`, `.cursor/skills/`, `.vscode/skills/`, `.speccrew/skills/`)
   - Use `ListDir` to locate the script if the exact path is unknown

2. **Execute process-results**:
   ```
   node "{path_to_batch_orchestrator_js}" process-results --syncStatePath "{sync_state_path}" --graphRoot "{graph_root}" --platformId "{platformId}"
   ```

This script:
- Scans `.done.json` files → updates feature status to `completed` in features-*.json
- Scans `.graph-done.json` files → confirms graph data generation completed
- Scans `.graph.json` files → writes graph data (nodes + edges) grouped by module
- Cleans up all marker files

After Step 3 completes, return to Step 1.

#### Context Recovery (Stateless Design)

Dispatch 采用完全无状态的文件驱动设计。如果执行过程中发生上下文压缩或中断：
- 无需记忆任何批次状态或 Worker 输出
- 重新执行循环：`get-batch` 会自动从文件状态恢复，跳过已完成和正在处理中的 features
- `process-results` 会处理所有未清理的标记文件
- 整个流程可安全重入

#### Stage 2 Output

- Generated by Analyze Workers: Feature documentation at `feature.documentPath` (one .md per feature); marker files (`.done.json`) in `completed_dir`
- Generated by Graph Workers: Graph data files (`.graph.json`) in `completed_dir`; consolidated graph data in `speccrew-workspace/knowledges/bizs/graph/`
- Updated by `process-results`: Each `features-{platform}.json` updated with analysis timestamps and status
- Marker files cleaned up after each batch

**Stage 2 Completion Condition**: ALL analyze workers AND ALL graph workers completed (both `.done.json` and `.graph-done.json` markers present)

**Feature Status Flow**: `pending` → `in_progress` → `completed` / `failed`

### Large-Scale Scenario Guidance

When dealing with modules containing more than **20 features**, consider the following:

- **Single Agent Limit**: A single Worker Agent can reliably process ~20 features per session due to context window constraints. Beyond this, context degradation may cause incomplete document generation.
- **Multi-Worker Strategy**: For modules with >20 features, dispatch multiple Worker Agents in parallel, each handling a non-overlapping subset of features (e.g., by batch index range).
- **Resume Support**: The `get-next-batch` script naturally supports resume across sessions — it skips features that already have `.done` files. To resume after a session break, simply restart the Stage 2 loop.
- **Validation After Completion**: After all features are marked `analyzed=true`, run `process-batch-results` with `--validateDocs --syncStatePath "{sync_state_path}"` to verify document completeness.

> ✅ **Stage 2 Milestone**: Feature analysis complete. {analyzed_count} features analyzed, {failed_count} failed. {graph_count} graph data files generated. → Proceed to Stage 3.

---

## Stage 3: Module Summarize (Parallel)

**Goal**: Complete each module overview based on feature details.

**Prerequisite**: Stage 2 completed for the module (in full or incremental mode).

**Action (full mode)**:
- Read all `features-{platform}.json` files from `speccrew-workspace/knowledges/base/sync-state/knowledge-bizs/`
- For each platform, group features by `module` to identify unique modules
- For each module, invoke 1 Worker Agent (`speccrew-task-worker.md`) with `skill_name: speccrew-knowledge-module-summarize`
- Parameters to pass to skill:
  - `module_name`: Module code_name
  - `module_path`: Path to module directory (e.g., `speccrew-workspace/knowledges/bizs/{platform_id}/{module_name}/`)
  - `language`: User's language — **REQUIRED**
  - **Behavior constraint**: Worker MUST NOT create any temporary scripts or workaround files. If execution fails, STOP and report error immediately.

Expected Worker Return: `{ "status": "success|failed", "module_name": "...", "output_file": "...-overview.md", "message": "..." }`

**Action (incremental mode)**:
- Reuse module status from Stage 2 (NEW / CHANGED / DELETED / UNMODIFIED).
- Only dispatch Workers for modules with status **NEW** or **CHANGED**.

**Parallel Tasks** (grouped by platform):
```
Platform: Web Frontend (web)
  Worker 1: module="order",   module_path="speccrew-workspace/knowledges/bizs/web/order/"
  Worker 2: module="payment", module_path="speccrew-workspace/knowledges/bizs/web/payment/"

Platform: Mobile App (mobile-flutter)
  Worker 3: module="order",   module_path="speccrew-workspace/knowledges/bizs/mobile-flutter/order/"
  Worker 4: module="payment", module_path="speccrew-workspace/knowledges/bizs/mobile-flutter/payment/"
```

**Output per Module**:
- `{{module_name}}-overview.md` (complete version)

---

## Stage 3.5: UI Style Pattern Extract (Parallel by Platform)

**Goal**: Extract UI design patterns (page types, component patterns, layout patterns) from analyzed feature documents, aggregating cross-module patterns and outputting to the techs knowledge base `ui-style-patterns/` directory.

**Prerequisite**: All Stage 3 tasks completed.

**Platform Filter**: Only execute for frontend platforms (platformType = web, mobile, desktop). Backend platforms skip this stage.

**Directory Creation**: The `ui-style-extract` skill automatically creates the output directory (`knowledges/techs/{platform_id}/ui-style-patterns/`) if it does not exist. No pre-check required.

**Action**:
- Read all `features-{platform}.json` files
- Filter platforms where platformType is web/mobile/desktop
- Determine platform_id (format: `{platformType}-{platformSubtype}`, e.g., `web-vue`, `mobile-uniapp`, `backend-system`)
- For each qualifying platform, launch 1 Worker Agent (`speccrew-task-worker`) with `skill_name: speccrew-knowledge-bizs-ui-style-extract`
- Parameters to pass:
  - `platform_id`: Platform identifier
  - `platform_type`: Platform type
  - `feature_docs_path`: Feature document base path for that platform
  - `features_manifest_path`: Path to the corresponding `features-{platform}.json`
  - `module_overviews_path`: **Parent directory** containing all module overview subdirectories for that platform (e.g., `knowledges/bizs/web-vue/`). This directory contains `{module}/module-overview.md` or `{module}/{module}-overview.md` files. **NOT** a specific module directory.
  - `output_path`: `speccrew-workspace/knowledges/techs/{platform_id}/ui-style-patterns/`
  - `language`: User's language
  - **Behavior constraint**: Worker MUST NOT create any temporary scripts or workaround files. If execution fails, STOP and report error immediately.

**Cross-Pipeline Output**:
- This stage writes to techs knowledge base, not bizs knowledge base
- Output location: `speccrew-workspace/knowledges/techs/{platform_id}/ui-style-patterns/`
- Subdirectories: `page-types/`, `components/`, `layouts/`
- `ui-style-guide.md` and `styles/` are managed by techs pipeline, this stage does not modify them

**Parallel Tasks**: One Worker per frontend platform, can execute in parallel.

**Output per Platform**:
```
speccrew-workspace/knowledges/techs/{platform_id}/ui-style-patterns/
├── page-types/
│   └── {pattern-name}.md
├── components/
│   └── {pattern-name}.md
└── layouts/
    └── {pattern-name}.md
```

> ✅ **Stage 3 & 3.5 Milestone**: Module summaries and UI style patterns complete. {module_count} modules summarized, {pattern_count} patterns extracted. → Proceed to Stage 4.

---

## Stage 4: System Summarize (Single Task)

**Goal**: Generate complete system-overview.md aggregating all platforms and modules.

**Prerequisite**: All Stage 3 tasks completed.

**Action**:
- Read all `features-{platform}.json` files from `speccrew-workspace/knowledges/base/sync-state/knowledge-bizs/` to get platform structure
- Invoke 1 Worker Agent (`speccrew-task-worker.md`) with `skill_name: speccrew-knowledge-system-summarize`
- Parameters to pass to skill:
  - `modules_path`: Path to knowledge base directory containing all platform modules (e.g., `speccrew-workspace/knowledges/bizs/`)
  - `output_path`: Output path for system-overview.md (e.g., `speccrew-workspace/knowledges/bizs/`)
  - `language`: User's language — **REQUIRED**
  - **Behavior constraint**: Worker MUST NOT create any temporary scripts or workaround files. If execution fails, STOP and report error immediately.

Expected Worker Return: `{ "status": "success|failed", "output_file": "system-overview.md", "message": "..." }`

**Output**:
- `speccrew-workspace/knowledges/bizs/system-overview.md` (complete with platform index and module hierarchy)

> ✅ **Stage 4 Milestone**: System overview generated. All stages complete. Pipeline finished successfully.

---

## Error Handling

| Stage | Failure Scenario | Handling | Retry |
|-------|-----------------|----------|-------|
| Stage 1a | Entry directory recognition fails | Abort pipeline, report error with platform details | No retry |
| Stage 1b | Script execution fails | Abort pipeline, report error | No retry |
| Stage 2 | Single Worker fails | Mark feature as `failed`, continue other Workers | No auto-retry |
| Stage 2 | Failure rate > 50% | Abort pipeline, report all failures | — |
| Stage 3 | Single Worker fails | Skip that module, continue others | Retry once |
| Stage 3.5 | Continue pipeline even if pattern extraction fails; report warning | — | — |
| Stage 4 | Worker fails | Abort, preserve all generated content | Retry once |

**Failed feature handling**: Features marked as `failed` via `update-feature-status` script retain their error details in `features-{platform}.json` for manual inspection or re-run.

---

## Task Completion Report

Upon completing all stages, output the following structured report:

```json
{
  "status": "success | partial | failed",
  "skill": "speccrew-knowledge-bizs-dispatch",
  "stages_completed": ["stage_0", "stage_1", "stage_2", "stage_3", "stage_4"],
  "stages_failed": [],
  "output_summary": {
    "platforms_processed": ["frontend", "backend"],
    "features_analyzed": 32,
    "modules_summarized": 8,
    "system_overview_generated": true
  },
  "output_files": [
    "knowledges/bizs/{platform}/features/",
    "knowledges/bizs/{platform}/modules/",
    "knowledges/bizs/system-overview.md"
  ],
  "errors": [],
  "next_steps": ["Initialize techs knowledge base"]
}
```

---

## Return

After all 5 stages complete, return a summary object to the caller:

```json
{
  "status": "completed",
  "pipeline": "bizs",
  "stages": {
    "stage1a": { "status": "completed", "platforms": 2, "modules": 12 },
    "stage1b": { "status": "completed", "platforms": 2, "features": 32 },
    "stage2": { "status": "completed", "analyzed": 32, "failed": 0, "graphWritten": 32 },
    "stage3": { "status": "completed", "modules": 8, "failed": 0 },
    "stage3_5": { "status": "completed", "platforms": 2, "patterns": 15 },
    "stage4": { "status": "completed" }
  },
  "output": {
    "system_overview": "speccrew-workspace/knowledges/bizs/system-overview.md",
    "graph_root": "speccrew-workspace/knowledges/bizs/graph/"
  }
}
```
