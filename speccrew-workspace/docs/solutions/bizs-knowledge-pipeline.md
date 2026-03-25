# Business Knowledge Generation Pipeline

> **Purpose**: Document the 4-stage pipeline architecture for business knowledge generation, facilitating maintenance and team collaboration
> **Last Updated**: 2025-03
> **Related Skills**: `speccrew-knowledge-dispatch`, `speccrew-knowledge-bizs-init`, `speccrew-knowledge-module-analyze`, `speccrew-knowledge-module-summarize`, `speccrew-knowledge-system-summarize`

---

## Architecture Overview

The business knowledge generation adopts a **4-stage pipeline** architecture, orchestrated by `speccrew-knowledge-dispatch` to automate the transformation from source code to documentation.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    4-Stage Pipeline                                     │
├─────────┬─────────┬─────────┬─────────┬─────────────────────────────────│
│Stage 1  │Stage 2  │Stage 3  │Stage 4  │Report                           │
│(Single) │(Parallel)│(Parallel)│(Single)│(Single)                         │
├─────────┼─────────┼─────────┼─────────┼─────────────────────────────────│
│Scan     │Analyze  │Summarize│System   │Generate                         │
│Source   │Module   │Module   │Summary  │Report                           │
│Generate │Extract  │Complete │Generate │                                 │
│List     │Features │Overview │Overview │                                 │
└─────────┴─────────┴─────────┴─────────┴─────────────────────────────────│
          │         │         │                                          │
     modules.json   Parallel  Parallel   SYSTEM-                         │
                   Worker    Worker     OVERVIEW.md                      │
└─────────────────────────────────────────────────────────────────────────┘
```

### Pipeline Orchestration

When `knowledge_types = "both"`, the bizs pipeline runs in parallel with the techs pipeline from Stage 1. Both pipelines proceed independently through their stages.

---

## Stage Details

### Stage 1: Generate Module List

**Execution Mode**: Single Task (1 Worker)

**Responsible Skill**: `speccrew-knowledge-bizs-init`

**Input**:
- `source_path`: Source code root directory (default: project root)
- `output_path`: Task status directory (default: `speccrew-workspace/knowledges/base/sync-state/knowledge-bizs/`)
- `language`: Target language for generated content (e.g., "zh", "en") - **REQUIRED**

**Processing Logic**:
1. **Determine System Type**: Check for UI indicators (frontend frameworks, page directories) vs API-only systems
2. **UI-Based Analysis** (for systems with frontend):
   - Analyze frontend routes and navigation structure
   - Map pages to business modules
   - Extract backend API associations for UI modules
3. **API-Based Analysis** (for backend-only systems):
   - Identify API controllers/handlers
   - Group APIs by business domain
4. **Extract Module Metadata**: name, code_name, user_value, entry_points, system_type, backend_apis

**Platform Naming Convention**:

| Concept | Field in modules.json | Example (UniApp) |
|---------|----------------------|------------------|
| **Category** | `platform_type` | `mobile` |
| **Technology** | `platform_subtype` | `uniapp` |
| **Identifier** | `{platform_type}/{platform_subtype}` | `mobile/uniapp` |

**Output**:
```
speccrew-workspace/knowledges/base/sync-state/knowledge-bizs/
└── modules.json
```

**modules.json Structure**:
```json
{
  "generated_at": "2024-01-15T10:30:00Z",
  "analysis_method": "ui-based",
  "source_path": "/project",
  "language": "zh",
  "platform_count": 2,
  "platforms": [
    {
      "platform_name": "Web Frontend",
      "platform_type": "web",
      "source_path": "/project/web",
      "tech_stack": ["react", "typescript"],
      "module_count": 4,
      "modules": [
        {
          "name": "Order Management",
          "code_name": "order",
          "user_value": "Handle customer orders from creation to fulfillment",
          "entry_points": [
            "src/pages/orders/index.tsx",
            "src/pages/orders/[id].tsx"
          ],
          "system_type": "ui",
          "backend_apis": [
            "GET /api/orders",
            "POST /api/orders",
            "GET /api/orders/:id"
          ]
        }
      ]
    },
    {
      "platform_name": "Mobile App",
      "platform_type": "mobile",
      "platform_subtype": "flutter",
      "source_path": "/project/mobile",
      "tech_stack": ["flutter", "dart"],
      "module_count": 4,
      "modules": [
        {
          "name": "Order Management",
          "code_name": "order",
          "user_value": "Handle customer orders from creation to fulfillment",
          "entry_points": [
            "lib/pages/orders/list.dart",
            "lib/pages/orders/detail.dart"
          ],
          "system_type": "ui"
        }
      ]
    }
  ]
}
```

---

### Stage 2: Module Analysis

**Execution Mode**: Parallel (1 Worker per module)

**Responsible Skill**: `speccrew-knowledge-module-analyze`

**Input**:
- `module_name`: Module code_name from modules.json
- `platform_name`: Platform name (e.g., "Web Frontend", "Mobile App")
- `platform_type`: Platform type (e.g., "web", "mobile-flutter")
- `system_type`: Module system type - `"ui"` or `"api"` (from modules.json)
- `source_path`: Platform-specific source path (from platform.source_path)
- `tech_stack`: Platform tech stack array
- `entry_points`: Module entry points (relative file paths)
- `backend_apis`: Associated backend API endpoints for this module (only when `system_type: "ui"`)
- `output_path`: Output directory for the module (e.g., `speccrew-workspace/knowledges/bizs/{platform_type}/{module_name}/`)
- `language`: Target language (e.g., "zh", "en") - **REQUIRED**

**Processing Logic**:
1. Locate module source files using `entry_points`
2. Based on `system_type`, extract different information:
   - **UI-based modules**: Analyze pages, components, state management, user interactions
   - **API-based modules**: Parse controllers, services, entities, public APIs
3. Identify features based on granularity rules (Simple/Medium/Complex)
4. Generate business flow diagrams (Mermaid) for each API request
5. Generate detailed documentation for each feature with source traceability

**Feature Granularity Rules**:

| Complexity | Criteria | Splitting Strategy | Example |
|------------|----------|-------------------|---------|
| Simple | ≤3 API endpoints, no complex business flow | Merge into single document | Data Dictionary Management |
| Medium | 3-8 API endpoints, independent business scenarios | Split by operation type | User CRUD, User Status Management |
| Complex | >8 API endpoints, multiple business scenarios | Split by business scenario | Payment Order Management, Payment Security Mechanism |

**Output per Module**:
```
speccrew-workspace/knowledges/bizs/{platform_type}/{module_name}/
├── {module_name}-overview.md          # Initial version (feature list only)
└── features/
    ├── create-order.md
    ├── list-orders.md
    └── ...
```

**Parallel Execution Example**:
```
Platform: Web Frontend (web)
  Worker 1: module="order",   source="/project/web",   output="speccrew-workspace/knowledges/bizs/web/order/"
  Worker 2: module="payment", source="/project/web",   output="speccrew-workspace/knowledges/bizs/web/payment/"

Platform: Mobile App (mobile-flutter)
  Worker 3: module="order",   source="/project/mobile", output="speccrew-workspace/knowledges/bizs/mobile-flutter/order/"
  Worker 4: module="payment", source="/project/mobile", output="speccrew-workspace/knowledges/bizs/mobile-flutter/payment/"
```

**Status Tracking**:
```
speccrew-workspace/knowledges/base/sync-state/knowledge-bizs/
└── stage2-status.json
```

**stage2-status.json Format**:
```json
{
  "generated_at": "2024-01-15T10:30:00Z",
  "stage": "module-analysis",
  "total_modules": 8,
  "completed": 8,
  "failed": 0,
  "platforms": [
    {
      "platform_type": "web",
      "platform_name": "Web Frontend",
      "modules": [
        {
          "module_name": "order",
          "status": "completed",
          "features_count": 5,
          "output_path": "speccrew-workspace/knowledges/bizs/web/order/"
        }
      ]
    }
  ]
}
```

---

### Stage 3: Module Summarize

**Execution Mode**: Parallel (1 Worker per module)

**Responsible Skill**: `speccrew-knowledge-module-summarize`

**Input**:
- `module_name`: Module code_name from modules.json
- `module_path`: Path to module directory (e.g., `speccrew-workspace/knowledges/bizs/{platform_type}/{module_name}/`)
- `language`: Target language (e.g., "zh", "en") - **REQUIRED**

**Processing Logic**:
1. Read initial {module_name}-overview.md (initial version with feature list)
2. Read all features/{feature-name}.md files for this module
3. Aggregate entities from all features
4. Identify dependencies (internal, external, data)
5. Summarize business rules
6. Complete all sections of {module_name}-overview.md

**Output**:
```
speccrew-workspace/knowledges/bizs/{platform_type}/{module_name}/
└── {module_name}-overview.md          # Complete version
```

**Completed Content**:
- Section 1: Module Basic Info (retained)
- Section 2: Feature List (retained)
- Section 3: Business Entities (added) - with ER diagram
- Section 4: Dependencies (added) - internal and external
- Section 5: Core Flows (added) - cross-feature business flows
- Section 6: Business Rules (added) - validation and business logic rules

**Status Tracking**:
```
speccrew-workspace/knowledges/base/sync-state/knowledge-bizs/
└── stage3-status.json
```

**stage3-status.json Format**:
```json
{
  "generated_at": "2024-01-15T10:35:00Z",
  "stage": "module-summarize",
  "total_modules": 8,
  "completed": 8,
  "failed": 0,
  "platforms": [
    {
      "platform_type": "web",
      "platform_name": "Web Frontend",
      "modules": [
        {
          "module_name": "order",
          "status": "completed",
          "overview_file": "speccrew-workspace/knowledges/bizs/web/order/order-overview.md"
        }
      ]
    }
  ]
}
```

---

### Stage 4: System Summarize

**Execution Mode**: Single Task (1 Worker)

**Responsible Skill**: `speccrew-knowledge-system-summarize`

**Input**:
- `modules_path`: Path to knowledge base directory containing all platform modules (e.g., `speccrew-workspace/knowledges/bizs/`)
- `output_path`: Output path for system-overview.md (e.g., `speccrew-workspace/knowledges/bizs/`)
- `language`: Target language (e.g., "zh", "en") - **REQUIRED**

**Processing Logic**:
1. Discover all {platform_type}/{module_name}/{module_name}-overview.md files
2. Read each module overview and extract information
3. Build module index table with platform grouping
4. Aggregate dependencies from all modules
5. Identify business domains
6. Identify end-to-end business flows across modules
7. Generate complete system-overview.md

**Output**:
```
speccrew-workspace/knowledges/bizs/
└── system-overview.md                 # Complete system panorama
```

**Included Content**:
- Index and Overview (statistics, generation timestamp)
- System Overview (positioning, target users, deployment type)
- Module Topology (hierarchy, dependencies, domain grouping)
- End-to-End Flows (cross-module processes, flow-module mapping matrix)
- System Boundaries and Integration (external dependencies)
- Requirement Assessment Guide (references speccrew-pm-requirement-assess skill)

---

## Directory Structure

### Runtime Status Directory
```
speccrew-workspace/
└── knowledges/
    └── base/
        └── sync-state/
            └── knowledge-bizs/
                ├── modules.json              # Stage 1 output
                ├── stage2-status.json        # Stage 2 status
                ├── stage3-status.json        # Stage 3 status
                └── final-report.json         # Final report
```

### Generated Documentation Directory
```
speccrew-workspace/
└── knowledges/
    └── bizs/
        ├── system-overview.md                # Generated by Stage 4
        └── {platform_type}/                  # e.g., web/, mobile-flutter/
            └── {module_name}/
                ├── {module_name}-overview.md # Generated by Stage 3
                └── features/
                    └── {feature-name}.md     # Generated by Stage 2
```

---

## Worker Dispatch Mechanism

### speccrew-task-worker Invocation

The pipeline uses `speccrew-task-worker` Agent for task execution. Leader Agent invokes Workers via the **Task tool** for parallel processing.

#### Task Tool Call Format

```yaml
subagent_type: "speccrew-task-worker"
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
# Worker 1 - Analyze order module (Web Frontend)
subagent_type: "speccrew-task-worker"
description: "Analyze order module features"
prompt: |
  skill_path: .speccrew/skills/speccrew-knowledge-module-analyze/SKILL.md
  context:
    module_name: order
    platform_name: "Web Frontend"
    platform_type: "web"
    system_type: "ui"
    source_path: "/project/web"
    tech_stack: ["react", "typescript"]
    entry_points: ["src/pages/orders/index.tsx", "src/pages/orders/[id].tsx"]
    backend_apis: ["GET /api/orders", "POST /api/orders"]
    output_path: "speccrew-workspace/knowledges/bizs/web/order/"
    language: "zh"

# Worker 2 - Analyze payment module (Web Frontend)
subagent_type: "speccrew-task-worker"
description: "Analyze payment module features"
prompt: |
  skill_path: .speccrew/skills/speccrew-knowledge-module-analyze/SKILL.md
  context:
    module_name: payment
    platform_name: "Web Frontend"
    platform_type: "web"
    system_type: "ui"
    source_path: "/project/web"
    tech_stack: ["react", "typescript"]
    entry_points: ["src/pages/payments/index.tsx"]
    backend_apis: ["GET /api/payments", "POST /api/payments"]
    output_path: "speccrew-workspace/knowledges/bizs/web/payment/"
    language: "zh"

# ... (more workers for other modules and platforms)
```

#### Stage 3 Parallel Dispatch Example

```yaml
# Worker 1 - Summarize order module (Web Frontend)
subagent_type: "speccrew-task-worker"
description: "Summarize order module overview"
prompt: |
  skill_path: .speccrew/skills/speccrew-knowledge-module-summarize/SKILL.md
  context:
    module_name: order
    module_path: "speccrew-workspace/knowledges/bizs/web/order/"
    language: "zh"

# Worker 2 - Summarize order module (Mobile App)
subagent_type: "speccrew-task-worker"
description: "Summarize order module overview"
prompt: |
  skill_path: .speccrew/skills/speccrew-knowledge-module-summarize/SKILL.md
  context:
    module_name: order
    module_path: "speccrew-workspace/knowledges/bizs/mobile-flutter/order/"
    language: "zh"

# ... (more workers for other modules)
```

---

## Dispatcher Responsibilities

`speccrew-knowledge-dispatch` is responsible for orchestrating the entire pipeline:

### Core Responsibilities
1. **Stage Control**: Ensure stages execute in order (1→2→3→4)
2. **Parallel Dispatch**: Stage 2, 3 call multiple Workers in parallel via Task tool
3. **Status Tracking**: Record execution status of each task with timestamp
4. **Error Handling**: Single task failure does not affect other parallel tasks
5. **Result Aggregation**: Generate final execution report
6. **Language Propagation**: Pass `language` parameter to all downstream skills

### Dispatch Flow (Full vs Incremental)

```
1. Execute Stage 1 (Single Task)
   └─ Invoke 1 Worker with speccrew-knowledge-bizs-init
   └─ Wait for completion ─┐
                           │
2. Read latest modules.json│
   IF sync_mode = "full":  │
     - Launch Stage 2 in parallel (one Worker per module across all platforms)
     - Invoke N Workers with speccrew-knowledge-module-analyze
   IF sync_mode = "incremental":
     - Use git diff (base_commit vs head_commit) + modules.json to mark modules as NEW / CHANGED / DELETED / UNMODIFIED
     - Launch Stage 2 only for NEW/CHANGED modules
   └─ Wait for all Stage 2 Workers to complete ─┐
                                                │
3. Generate stage2-status.json with timestamp   │
   Launch Stage 3 in parallel                    │
   IF sync_mode = "full":                        │
     - Invoke N Workers with speccrew-knowledge-module-summarize (all modules)
   IF sync_mode = "incremental":
     - Invoke Workers only for NEW/CHANGED modules
   └─ Wait for all Stage 3 Workers to complete ─┤
                                                │
4. Generate stage3-status.json with timestamp   │
   Execute Stage 4 (Single Task)                 │
   └─ Invoke 1 Worker with speccrew-knowledge-system-summarize
   └─ Always rebuild system-overview.md from latest module overviews ─┤
                                                                      │
5. Generate unified final report (when knowledge_types = "both", includes techs pipeline results)
```

### Parallel Execution with Techs Pipeline

When `knowledge_types = "both"`:

```
Time →
─────────────────────────────────────────────────────────────────────────────

Bizs Pipeline:   [Stage 1] →[Stage 2 Parallel] →[Stage 3 Parallel] →[Stage 4] →[Report]
                      │          │                   │
Techs Pipeline:   [Stage 1] →[Stage 2 Parallel] →[Stage 3] →[Report]
                      │          │
                  Both Stage 1s run in parallel
                  (independent tasks)

─────────────────────────────────────────────────────────────────────────────
```

**Execution Rules**:
1. **Stage 1 Parallel**: Both bizs-init and techs-init Workers launch simultaneously
2. **Independent Progress**: Each pipeline proceeds through its stages independently
3. **No Cross-Dependencies**: Bizs and techs pipelines do not depend on each other
4. **Unified Final Report**: Generate a combined report after both pipelines complete

---

## Error Handling Strategy

| Stage | Failure Impact | Handling Strategy |
|-------|---------------|-------------------|
| Stage 1 | Entire pipeline stops | Report error, do not continue (techs pipeline continues if running) |
| Stage 2 | Single module fails | Continue other modules, record failed module in stage2-status.json |
| Stage 3 | Single module fails | Continue other modules, record failed module in stage3-status.json |
| Stage 4 | System summary fails | Abort bizs pipeline if < 50% modules completed successfully |

### Cross-Pipeline Policy

- **Pipeline Independence**: Failure in one pipeline does NOT affect the other
- **Partial Success**: Report success for completed pipeline, failure for the other
- **Final Report**: Always generate report showing status of both pipelines (if requested)

---

## Usage

### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `source_path` | string | No | Source code root path (default: project root) |
| `knowledge_types` | string | No | `"bizs"`, `"techs"`, or `"both"` (default: `"both"`) |
| `output_path` | string | No | Output directory (default: `speccrew-workspace/knowledges/`) |
| `sync_mode` | string | No | `"full"` or `"incremental"` (default: `"full"`) |
| `base_commit` | string | No | Git commit hash for incremental mode (comparison base) |
| `head_commit` | string | No | Git commit hash for incremental mode (current HEAD) |
| `changed_files` | array | No | Pre-computed list of changed files for incremental mode |

### Trigger Methods
Invoke through Leader Agent:
```
"Initialize knowledge base"
"Initialize bizs and techs knowledge base"
"Generate knowledge from source code"
"Dispatch knowledge generation tasks"
```

### Execution Flow
1. Leader Agent identifies intent
2. Calls `speccrew-knowledge-dispatch` Skill
3. Dispatch executes 4-stage pipeline (or both pipelines if `knowledge_types = "both"`)
4. Returns unified execution report

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


