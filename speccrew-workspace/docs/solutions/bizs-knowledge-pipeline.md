# Business Knowledge Generation Pipeline

> **Purpose**: Document the 4-stage pipeline architecture for business knowledge generation, facilitating maintenance and team collaboration
> **Last Updated**: 2024
> **Related Skills**: `SpecCrew-knowledge-dispatch`, `SpecCrew-knowledge-bizs-init`, `SpecCrew-knowledge-module-analyze`, `SpecCrew-knowledge-module-summarize`, `SpecCrew-knowledge-system-summarize`

---

## Architecture Overview

The business knowledge generation adopts a **4-stage parallel pipeline** architecture, orchestrated by `SpecCrew-knowledge-dispatch` to automate the transformation from source code to documentation.

```
┌─────────────────────────────────────────────────────────────────│
│                    4-Stage Pipeline                            │
├─────────┬─────────┬─────────┬─────────┬─────────│             │
│Stage 1 │Stage 2 │Stage 3 │Stage 4 │Report │             │
│(Single)│Parallel)│Parallel)│Single) │Single)│             │
├─────────┼─────────┼─────────┼─────────┼─────────│             │
│Scan    │Analyze │Summarize│System │Generate│             │
│Source  │Module  │Module   │Summary│Report  │             │
│Generate│Extract │Complete │Generate│       │             │
│List    │Features│Overview │Overview│       │             │
└─────────┴─────────┴─────────┴─────────┴─────────│             │
         │        │        │        │                        │
    modules.json  Parallel  Parallel  SYSTEM-                     │
                  Worker    Worker    OVERVIEW.md                │
└─────────────────────────────────────────────────────────────────│
```

---

## Stage Details

### Stage 1: Generate Module List

**Execution Mode**: Single Task (1 Worker)

**Responsible Skill**: `SpecCrew-knowledge-bizs-init`

**Input**:
- `source_path`: Source code root directory
- `output_path`: Task status directory

**Processing Logic**:
1. Detect technology stack (NestJS/Java/Go, etc.)
2. Scan module directory structure
3. Extract module metadata (name, path, purpose)

**Output**:
```
SpecCrew-workspace/docs/crew-init/knowledge-bizs/
└── modules.json
```

**modules.json Structure**:
```json
{
  "generated_at": "2024-01-15T10:30:00Z",
  "tech_stack": "nestjs",
  "source_path": "/project/src",
  "module_count": 4,
  "modules": [
    {
      "name": "order",
      "path": "src/modules/order",
      "purpose": "Order lifecycle management",
      "features_detected": 8
    }
  ]
}
```

---

### Stage 2: Module Analysis

**Execution Mode**: Parallel (1 Worker per module)

**Responsible Skill**: `SpecCrew-knowledge-module-analyze`

**Input**:
- `module_name`: Module name
- `source_path`: Source code path
- `output_path`: Module output directory

**Processing Logic**:
1. Locate module source directory
2. Extract Controller/Service/Entity
3. Identify all API endpoints (each endpoint = 1 feature)
4. Generate detailed documentation for each feature

**Output**:
```
knowledge/bizs/{name}/
├── {name}-overview.md                 # Initial version (feature list only)
└── features/
    ├── create-order.md
    ├── list-orders.md
    └── ...
```

**Parallel Execution Example**:
```
Worker 1: module="order",     output="knowledge/bizs/order/"
Worker 2: module="payment",   output="knowledge/bizs/payment/"
Worker 3: module="inventory", output="knowledge/bizs/inventory/"
Worker 4: module="user",      output="knowledge/bizs/user/"
```

**Status Tracking**:
```
SpecCrew-workspace/docs/crew-init/knowledge-bizs/
└── stage2-status.json
```

---

### Stage 3: Module Summarize

**Execution Mode**: Parallel (1 Worker per module)

**Responsible Skill**: `SpecCrew-knowledge-module-summarize`

**Input**:
- `module_name`: Module name
- `module_path`: Module directory path

**Processing Logic**:
1. Read initial {name}-overview.md
2. Read all {feature-name}.md for this module
3. Aggregate entities, dependencies, business rules
4. Complete all sections of {name}-overview.md

**Output**:
```
knowledge/bizs/{name}/
└── {name}-overview.md                 # Complete version
```

**Completed Content**:
- Section 1: Module Basic Info (retained)
- Section 2: Feature List (retained)
- Section 3: Business Entities (added)
- Section 4: Dependencies (added)
- Section 5: Core Flows (added)
- Section 6: Business Rules (added)

---

### Stage 4: System Summarize

**Execution Mode**: Single Task (1 Worker)

**Responsible Skill**: `SpecCrew-knowledge-system-summarize`

**Input**:
- `modules_path`: Modules directory path
- `output_path`: Output directory

**Processing Logic**:
1. Discover all {name}-overview.md files
2. Build module index table
3. Aggregate module dependencies
4. Identify end-to-end business flows
5. Generate system-level documentation

**Output**:
```
knowledge/bizs/
└── system-overview.md                 # Complete system panorama
```

**Included Content**:
- Index and Overview (statistics)
- System Overview (positioning, business domains)
- Module Topology (hierarchy, dependencies)
- End-to-End Flows (cross-module processes)
- System Integration (external dependencies)
- Requirement Assessment Guide (references PM Skill)

---

## Directory Structure

### Runtime Status Directory
```
SpecCrew-workspace/
└── docs/
    └── crew-init/
        └── knowledge-bizs/
            ├── modules.json              # Stage 1 output
            ├── stage2-status.json        # Stage 2 status
            ├── stage3-status.json        # Stage 3 status
            └── final-report.json         # Final report
```

### Generated Documentation Directory
```
knowledge/bizs/
├── system-overview.md                # Generated by Stage 4
└── {name}/
    ├── {name}-overview.md            # Generated by Stage 3
    └── features/
        └── {feature-name}.md         # Generated by Stage 2
```

---

## Worker Dispatch Mechanism

### SpecCrew-task-worker Invocation

The pipeline uses `SpecCrew-task-worker` Agent for task execution. Leader Agent invokes Workers via the **Task tool** for parallel processing.

#### Task Tool Call Format

```yaml
subagent_type: "SpecCrew-task-worker"
description: "Brief task description"
prompt: |
  skill_path: .speccrew/skills/{skill-name}/SKILL.md
  context:
    param1: value1
    param2: value2
    ...
```

#### Stage 2 Parallel Dispatch Example

```yaml
# Worker 1 - Analyze order module
subagent_type: "SpecCrew-task-worker"
description: "Analyze order module features"
prompt: |
  skill_path: .speccrew/skills/SpecCrew-knowledge-module-analyze/SKILL.md
  context:
    module_name: order
    source_path: src/modules/order
    output_path: knowledge/bizs/order/

# Worker 2 - Analyze payment module
subagent_type: "SpecCrew-task-worker"
description: "Analyze payment module features"
prompt: |
  skill_path: .speccrew/skills/SpecCrew-knowledge-module-analyze/SKILL.md
  context:
    module_name: payment
    source_path: src/modules/payment
    output_path: knowledge/bizs/payment/

# ... (more workers for other modules)
```

#### Stage 3 Parallel Dispatch Example

```yaml
# Worker 1 - Summarize order module
subagent_type: "SpecCrew-task-worker"
description: "Summarize order module overview"
prompt: |
  skill_path: .speccrew/skills/SpecCrew-knowledge-module-summarize/SKILL.md
  context:
    module_name: order
    module_path: knowledge/bizs/order/

# ... (more workers for other modules)
```

---

## Dispatcher Responsibilities

`SpecCrew-knowledge-dispatch` is responsible for orchestrating the entire pipeline:

### Core Responsibilities
1. **Stage Control**: Ensure stages execute in order (1│││)
2. **Parallel Dispatch**: Stage 2, 3 call multiple Workers in parallel via Task tool
3. **Status Tracking**: Record execution status of each task
4. **Error Handling**: Single task failure does not affect other parallel tasks
5. **Result Aggregation**: Generate final execution report

### Dispatch Flow (Full vs Incremental)

```
1. Execute Stage 1 (Single Task)
   └─ Invoke 1 Worker with SpecCrew-knowledge-bizs-init
   └─ Wait for completion ─│
                           │
2. Read latest modules.json
   IF sync_mode = "full":
     - Launch Stage 2 in parallel (one Worker per module)
     - Invoke N Workers with SpecCrew-knowledge-module-analyze
   IF sync_mode = "incremental":
     - Use git diff (base_commit vs head_commit) + modules.json to mark modules as NEW / CHANGED / DELETED / UNMODIFIED
     - Launch Stage 2 only for NEW/CHANGED modules
   └─ Wait for all Stage 2 Workers to complete ─│
                                               │
3. Launch Stage 3 in parallel (one Worker per module)
   IF sync_mode = "full":
     - Invoke N Workers with SpecCrew-knowledge-module-summarize (all modules)
   IF sync_mode = "incremental":
     - Invoke Workers only for NEW/CHANGED modules
   └─ Wait for all Stage 3 Workers to complete ─│
                                               │
4. Execute Stage 4 (Single Task)
   └─ Invoke 1 Worker with SpecCrew-knowledge-system-summarize
   └─ Always rebuild system-overview.md from latest module overviews ─│
                                                                     │
5. Generate final report
```

---

## Error Handling Strategy

| Stage | Failure Impact | Handling Strategy |
|-------|---------------|-------------------|
| Stage 1 | Entire pipeline stops | Report error, do not continue |
| Stage 2 | Single module fails | Continue other modules, record failed module |
| Stage 3 | Single module fails | Continue other modules, record failed module |
| Stage 4 | System summary fails | Stop, require checking Stage 2/3 results |

---

## Usage

### Trigger Methods
Invoke through Leader Agent:
```
"Initialize business knowledge base"
"Generate business documentation from source code"
"Generate bizs knowledge"
```

### Execution Flow
1. Leader Agent identifies intent
2. Calls `SpecCrew-knowledge-dispatch` Skill
3. Dispatch executes 4-stage pipeline
4. Returns execution report

---

## Extensibility Design

### New Module Handling
When new modules are added to source code:
1. Stage 1 automatically recognizes new modules
2. Stage 2, 3 automatically create Workers for new modules
3. Stage 4 re-aggregates all modules

### Incremental Update with Git (UI + API)

For Git-managed projects, the pipeline can run in **incremental mode** to avoid rebuilding the entire knowledge base.

**Core idea**: Use `modules.json` as the *business module snapshot*, combine it with `git diff` to identify which modules are affected, and only re-run Stage 2/3 for those modules, while Stage 4 regenerates the system overview.

#### 1. Enriched `modules.json` schema

Stage 1 (`SpecCrew-knowledge-bizs-init`) produces a richer `modules.json` that becomes the single source of truth for bizs knowledge:

- Top-level fields:
  - `generated_at`: ISO timestamp
  - `analysis_method`: `"ui-based"` when any UI platform exists, `"api-based"` when only API platforms
  - `source_path`: Root source path
  - `language`: Documentation language (e.g., `"zh"`, `"en"`)
  - `source_commit`: Git commit hash at generation time (HEAD)
  - `platforms`: Array of platform objects

- Platform object:
  - `platform_name`: Human-readable name (e.g., `"Web Frontend"`)
  - `platform_type`: `web`, `mobile-flutter`, `api`, etc.
  - `source_path`: Platform-specific source root
  - `tech_stack`: Languages/frameworks for this platform
  - `module_count`: Number of modules
  - `modules`: Array of module objects

- Module object:
  - `name`: Business module name
  - `code_name`: Technical identifier (e.g., `"order"`)
  - `user_value`: What users accomplish with this module
  - `entry_points`: Relative file paths (from `platform.source_path`) to entry point files
  - `system_type`: `"ui"` or `"api"`
  - `backend_apis`: Associated backend API endpoints, **only when** `system_type = "ui"`

This schema allows precise mapping from business modules to concrete source files and API endpoints.

#### 2. Incremental sync algorithm

Given a previous `modules.json` (with `source_commit = BASE_COMMIT`) and the current HEAD commit:

1. **Re-run Stage 1** on current HEAD
   - Invoke `SpecCrew-knowledge-bizs-init` again
   - Produce a new `modules.json` snapshot (with `source_commit = HEAD`)

2. **Compute file-level changes with Git**
   - Outside the Worker environment, run:
     - `git diff --name-only BASE_COMMIT HEAD`
   - Obtain `changed_files` = list of modified/added/deleted files

3. **Map changed files to modules** using the new `modules.json`:
   - For each platform:
     - For each module:
       - Build `Files(module)` =
         - `platform.source_path + entry_points[*]`
         - Optionally, files backing `backend_apis` (e.g., controllers/services)
       - If `Files(module)` intersects `changed_files` │mark module as **CHANGED**
       - If module exists only in new `modules.json` │mark as **NEW**
       - If module exists only in old `modules.json` │mark as **DELETED**
       - Else │**UNMODIFIED**

4. **Drive Stage 2/3 incrementally** via `SpecCrew-knowledge-dispatch`:
   - Stage 2 (Module Analysis):
     - Only dispatch Workers for modules with status **NEW** or **CHANGED**
     - Skip **UNMODIFIED** modules
   - Stage 3 (Module Summarize):
     - 同样只对 **NEW/CHANGED** 模块派发 Worker

5. **Regenerate system overview (Stage 4)**:
   - Always re-run Stage 4 based on the latest set of module overviews
   - This naturally handles **DELETED** modules (they disappear from `system-overview.md`)

6. **Handle deleted modules (optional policy)**:
   - Option A: Delete directories like `knowledge/bizs/{platform_type}/{module_name}/`
   - Option B: Move them into an archive folder (e.g., `knowledge/bizs/_archive/`)

#### 3. Dispatch integration (`sync_mode`)

`SpecCrew-knowledge-dispatch` can support a `sync_mode` parameter:

- `sync_mode: "full"`
  - Run the pipeline as today: Stage 1 │Stage 2 (all modules) │Stage 3 (all modules) │Stage 4.
- `sync_mode: "incremental"`
  - Assume that the caller has already prepared:
    - `BASE_COMMIT` and `HEAD`
    - `changed_files` via `git diff`
    - Previous and new `modules.json`
  - Dispatch logic uses the algorithm above to:
    - Determine module status (NEW / CHANGED / DELETED / UNMODIFIED)
    - Only dispatch Workers for NEW/CHANGED modules in Stage 2/3
    - Always run Stage 4 to rebuild `system-overview.md`

This design keeps the heavy Git operations outside of Worker Agents, while reusing the existing 4-stage pipeline to support both **initial knowledge base generation** and **incremental updates** in a consistent way.
---

## Related Documentation

| Document | Location | Description |
|----------|----------|-------------|
| system-overview-template.md | `.speccrew/skills/SpecCrew-knowledge-bizs-init/templates/` | System panorama template |
| {name}-overview-template.md | Same as above | Module overview template |
| {feature-name}-template.md | Same as above | Feature detail template |
| SpecCrew-pm-requirement-assess | `.speccrew/skills/` | PM requirement assessment Skill |

---

## Maintenance Log

| Date | Changes | Owner |
|------|---------|-------|
| - | Initial version, 4-stage pipeline design | - |


