---
name: SpecCrew-knowledge-dispatch
description: Dispatch knowledge base initialization tasks to Worker Agents with parallel execution support. Used by Leader Agent to orchestrate parallel pipelines for both bizs and techs knowledge generation.
tools: Read, Write, Task
---

# Knowledge Base Dispatch

Orchestrate **both bizs and techs knowledge base generation** in parallel with multi-stage pipelines.

## Language Adaptation

**CRITICAL**: All generated documents must match the user's language. Detect the language from the user's input and pass it to all downstream Worker Agents.

- User writes in 中文 → Generate Chinese documents, pass `language: "zh"` to workers
- User writes in English → Generate English documents, pass `language: "en"` to workers
- User writes in other languages → Use appropriate language code

**All downstream skills must receive the `language` parameter and generate content in that language only.**

## Trigger Scenarios

- "Initialize knowledge base"
- "Initialize bizs and techs knowledge base"
- "Generate knowledge from source code"
- "Dispatch knowledge generation tasks"

## User

Leader Agent (SpecCrew-team-leader)

## Prerequisites

- Source code available for analysis

## Input

- `source_path`: Source code root path (default: project root)
- `knowledge_types`: Types of knowledge to generate - `"bizs"`, `"techs"`, or `"both"` (default: `"both"`)
  - `bizs`: Generate business knowledge only
  - `techs`: Generate technology knowledge only
  - `both`: Generate both bizs and techs knowledge in parallel
- `output_path`: Output directory (default: `knowledge/`)
- `sync_mode`: Knowledge base update mode - `"full"` or `"incremental"` (default: `"full"`)
  - `full`: Rebuild knowledge base for all modules/platforms
  - `incremental`: Only update modules/platforms affected by recent code changes (Git-managed projects)
- `base_commit` (optional, incremental mode only): Git commit hash used as the comparison base
- `head_commit` (optional, incremental mode only): Git commit hash for current HEAD. If omitted, assume `HEAD`.
- `changed_files` (optional, incremental mode only): Pre-computed list of changed files between `base_commit` and `head_commit` (e.g., from `git diff --name-only`)
## Output

- Task status records in `SpecCrew-workspace/docs/crew-init/knowledge-bizs/` and/or `SpecCrew-workspace/docs/crew-init/knowledge-techs/`
- Generated documentation in `knowledge/bizs/` and/or `knowledge/techs/`

## Workflow Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                   Knowledge Base Dispatch                               │
├─────────────────────────────────────────────────────────────────────────│
│ IF knowledge_types = "bizs"    │ IF knowledge_types = "techs"           │
│ OR knowledge_types = "both"    │ OR knowledge_types = "both"            │
├─────────────────────────────────────────────────────────────────────────│
║                                                                ║        │
│ ┌─────────────────────┐       ┌─────────────────────┐       │        │
│ │  Bizs Pipeline      │       │  Techs Pipeline     │       │        │
│ │  (4 Stages)         │       │  (3 Stages)         │       │        │
║ ├─────────────────────║       ├─────────────────────║       ║        │
│ │Stage 1: Scan        │       │Stage 1: Detect      │       │        │
│ │         Modules     │       │         Platforms   │       │        │
║ ├─────────────────────║       ├─────────────────────║       ║        │
│ │Stage 2: Analyze     │       │Stage 2: Generate    │       │        │
│ │         Modules     │       │         Tech Docs   │       │        │
║ ├─────────────────────║       ├─────────────────────║       ║        │
│ │Stage 3: Summarize   │       │Stage 3: Generate    │       │        │
│ │         Modules     │       │         Index       │       │        │
│ ├─────────────────────┤       └─────────────────────┘       │        │
│ │Stage 4: System       │                                      │        │
│ │         Summary      │                                      │        │
│ └─────────────────────┘                                      │        │
║                                                                ║        │
│ Both pipelines run in PARALLEL when knowledge_types = "both"  │        │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Bizs Knowledge Pipeline (4-Stage)

### Bizs Stage 1: Generate Module List (Single Task)

**Goal**: Scan source code and identify all modules.

**Action**:
- Invoke 1 Worker Agent (`.qoder/agents/SpecCrew-task-worker.md`) with skill `.qoder/skills/SpecCrew-knowledge-bizs-init/SKILL.md`
- Task: Analyze project structure, detect modules
- Parameters to pass to skill:
  - `source_path`: Source code directory path (default: project root)
  - `output_path`: Output directory (default: `SpecCrew-workspace/docs/crew-init/knowledge-bizs/`)
  - `language`: User's language (e.g., "zh", "en") - **REQUIRED**

**Output**:
- `SpecCrew-workspace/docs/crew-init/knowledge-bizs/modules.json`
```json
{
  "generated_at": "2024-01-15T10:30:00Z",
  "analysis_method": "ui-based",
  "source_path": "/project",
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
            "src/pages/orders/[id].tsx",
            "src/pages/orders/create.tsx"
          ],
          "system_type": "ui"
        },
        {
          "name": "Payment & Billing",
          "code_name": "payment",
          "user_value": "Process payments and manage invoices",
          "entry_points": [
            "src/pages/payments/index.tsx",
            "src/pages/invoices/index.tsx"
          ],
          "system_type": "ui"
        }
      ]
    },
    {
      "platform_name": "Mobile App",
      "platform_type": "mobile-flutter",
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

### Bizs Stage 2: Module Analysis (Parallel)

**Goal**: Analyze each module in parallel to generate feature details.

**Action (full mode)**:
- Read `SpecCrew-workspace/docs/crew-init/knowledge-bizs/modules.json`
- Iterate through each `platform` in `platforms` array
- For each module within the platform, invoke 1 Worker Agent (`.qoder/agents/SpecCrew-task-worker.md`) with skill `.qoder/skills/SpecCrew-knowledge-module-analyze/SKILL.md`
- Parameters to pass to skill:
  - `module_name`: Module code_name from modules.json
  - `platform_name`: Platform name (e.g., "Web Frontend", "Mobile App")
  - `platform_type`: Platform type (e.g., "web", "mobile-flutter")
  - `system_type`: Module system type - `"ui"` or `"api"` (from modules.json)
  - `source_path`: Platform-specific source path (from platform.source_path)
  - `tech_stack`: Platform tech stack array
  - `entry_points`: Module entry points (relative file paths)
  - `output_path`: Output directory for the module (e.g., `knowledge/bizs/{platform_type}/{module_name}/`)
  - `language`: User's language (e.g., "zh", "en") - **REQUIRED**

**Action (incremental mode)**:
- Precondition: Caller has prepared `base_commit`, `head_commit` and `changed_files` (file list from `git diff --name-only base_commit head_commit`).
- Read both previous and latest `modules.json` snapshots if available (e.g., `modules.json` from `base_commit` and current one from Stage 1).
- For each platform and module in the **latest** `modules.json`:
  - Build `Files(module)` from:
    - `platform.source_path + entry_points[*]`
    - (Optional) files that implement `backend_apis` (e.g., controllers/services).
  - Determine module status:
    - **NEW**: module only exists in latest `modules.json`
    - **CHANGED**: `Files(module)` intersects with `changed_files`
    - **DELETED**: module only exists in previous `modules.json`
    - **UNMODIFIED**: all others
- Only dispatch Workers for modules with status **NEW** or **CHANGED**.

**Parallel Tasks** (grouped by platform):
```
Platform: Web Frontend (web)
  Worker 1: module="order",   source="/project/web",   output="knowledge/bizs/web/order/"
  Worker 2: module="payment", source="/project/web",   output="knowledge/bizs/web/payment/"

Platform: Mobile App (mobile-flutter)
  Worker 3: module="order",   source="/project/mobile", output="knowledge/bizs/mobile-flutter/order/"
  Worker 4: module="payment", source="/project/mobile", output="knowledge/bizs/mobile-flutter/payment/"
```

**Output per Module**:
- `{name}-overview.md` (initial version with feature list)
- `features/{feature-name}.md` (one per feature)

**Status Tracking**:
- `SpecCrew-workspace/docs/crew-init/knowledge-bizs/stage2-status.json`

### Bizs Stage 3: Module Summarize (Parallel)

**Goal**: Complete each module overview based on feature details.

**Prerequisite**: Stage 2 completed for the module (in full or incremental mode).

**Action (full mode)**:
- Read `SpecCrew-workspace/docs/crew-init/knowledge-bizs/modules.json`
- Iterate through each `platform` in `platforms` array
- For each module within the platform, invoke 1 Worker Agent (`.qoder/agents/SpecCrew-task-worker.md`) with skill `.qoder/skills/SpecCrew-knowledge-module-summarize/SKILL.md`
- Parameters to pass to skill:
  - `module_name`: Module code_name from modules.json
  - `platform_type`: Platform type (e.g., "web", "mobile-flutter")
  - `module_path`: Path to module directory (e.g., `knowledge/bizs/{platform_type}/{module_name}/`)
  - `language`: User's language (e.g., "zh", "en") - **REQUIRED**

**Action (incremental mode)**:
- Reuse module status from Stage 2 (NEW / CHANGED / DELETED / UNMODIFIED).
- Only dispatch Workers for modules with status **NEW** or **CHANGED**.

**Parallel Tasks** (grouped by platform):
```
Platform: Web Frontend (web)
  Worker 1: module="order",   module_path="knowledge/bizs/web/order/"
  Worker 2: module="payment", module_path="knowledge/bizs/web/payment/"

Platform: Mobile App (mobile-flutter)
  Worker 3: module="order",   module_path="knowledge/bizs/mobile-flutter/order/"
  Worker 4: module="payment", module_path="knowledge/bizs/mobile-flutter/payment/"
```

**Output per Module**:
- `{name}-overview.md` (complete version)

**Status Tracking**:
- `SpecCrew-workspace/docs/crew-init/knowledge-bizs/stage3-status.json`

### Bizs Stage 4: System Summarize (Single Task)

**Goal**: Generate complete system-overview.md aggregating all platforms and modules.

**Prerequisite**: All Stage 3 tasks completed.

**Action**:
- Read `SpecCrew-workspace/docs/crew-init/knowledge-bizs/modules.json` to get platform structure
- Invoke 1 Worker Agent (`.qoder/agents/SpecCrew-task-worker.md`) with skill `.qoder/skills/SpecCrew-knowledge-system-summarize/SKILL.md`
- Parameters to pass to skill:
  - `modules_json_path`: Path to modules.json file
  - `knowledge_base_path`: Path to knowledge base directory (e.g., `knowledge/bizs/`)
  - `output_path`: Output path for system-overview.md (e.g., `knowledge/bizs/`)
  - `language`: User's language (e.g., "zh", "en") - **REQUIRED**

**Output**:
- `knowledge/bizs/system-overview.md` (complete with platform index and module hierarchy)

### Bizs Stage 5: Generate Final Report

---

## Techs Knowledge Pipeline (3-Stage)

### Techs Stage 1: Detect Platform Manifest (Single Task)

**Goal**: Scan source code and identify all technology platforms.

**Action**:
- Invoke 1 Worker Agent (`.qoder/agents/SpecCrew-task-worker.md`) with skill `.qoder/skills/SpecCrew-knowledge-techs-init/SKILL.md`
- Task: Analyze project structure, detect technology platforms
- Parameters to pass to skill:
  - `source_path`: Source code directory path
  - `output_path`: Output directory (default: `SpecCrew-workspace/docs/crew-init/knowledge-techs/`)
  - `language`: User's language (e.g., "zh", "en") - **REQUIRED**

**Output**:
- `SpecCrew-workspace/docs/crew-init/knowledge-techs/techs-manifest.json`

```json
{
  "generated_at": "2024-01-15T10:30:00Z",
  "source_path": "/project",
  "language": "zh",
  "platforms": [
    {
      "platform_id": "web-react",
      "platform_type": "web",
      "framework": "react",
      "language": "typescript",
      "source_path": "src/web",
      "config_files": ["package.json", "tsconfig.json", "vite.config.ts"],
      "convention_files": [".eslintrc.js", ".prettierrc"]
    },
    {
      "platform_id": "backend-nestjs",
      "platform_type": "backend",
      "framework": "nestjs",
      "language": "typescript",
      "source_path": "src/server",
      "config_files": ["package.json", "nest-cli.json", "tsconfig.json"],
      "convention_files": [".eslintrc.js"]
    }
  ]
}
```

---

### Techs Stage 2: Generate Platform Documents (Parallel)

**Goal**: Generate technology documentation for each platform in parallel.

**Action**:
- Read `SpecCrew-workspace/docs/crew-init/knowledge-techs/techs-manifest.json`
- For each platform in `platforms` array, invoke 1 Worker Agent (`.qoder/agents/SpecCrew-task-worker.md`) with skill `.qoder/skills/SpecCrew-knowledge-techs-generate/SKILL.md`
- Parameters to pass to skill:
  - `platform_id`: Platform identifier from manifest
  - `platform_type`: Platform type (web, mobile, backend, desktop)
  - `framework`: Primary framework
  - `source_path`: Platform source directory
  - `config_files`: List of configuration file paths
  - `convention_files`: List of convention file paths
  - `output_path`: Output directory for platform docs (e.g., `knowledge/techs/{platform_id}/`)
  - `language`: User's language (e.g., "zh", "en") - **REQUIRED**

**Parallel Tasks**:
```yaml
# Worker 1 - Generate web-react tech docs
subagent_type: "SpecCrew-task-worker"
description: "Generate web-react technology documents"
prompt: |
  skill_path: .qoder/skills/SpecCrew-knowledge-techs-generate/SKILL.md
  context:
    platform_id: web-react
    platform_type: web
    framework: react
    source_path: src/web
    config_files: ["src/web/package.json", "src/web/tsconfig.json", "src/web/vite.config.ts"]
    convention_files: ["src/web/.eslintrc.js", "src/web/.prettierrc"]
    output_path: knowledge/techs/web-react/
    language: zh

# Worker 2 - Generate backend-nestjs tech docs
subagent_type: "SpecCrew-task-worker"
description: "Generate backend-nestjs technology documents"
prompt: |
  skill_path: .qoder/skills/SpecCrew-knowledge-techs-generate/SKILL.md
  context:
    platform_id: backend-nestjs
    platform_type: backend
    framework: nestjs
    source_path: src/server
    config_files: ["src/server/package.json", "src/server/nest-cli.json", "src/server/tsconfig.json"]
    convention_files: ["src/server/.eslintrc.js"]
    output_path: knowledge/techs/backend-nestjs/
    language: zh
```

**Output per Platform**:
```
knowledge/techs/{platform_id}/
├── INDEX.md
├── tech-stack.md
├── architecture.md
├── conventions-design.md
├── conventions-dev.md
├── conventions-test.md
└── conventions-data.md (optional)
```

**Status Tracking**:
- `SpecCrew-workspace/docs/crew-init/knowledge-techs/stage2-status.json`

---

### Techs Stage 3: Generate Root Index (Single Task)

**Goal**: Generate root INDEX.md aggregating all platform documentation.

**Prerequisite**: All Techs Stage 2 tasks completed.

**Action**:
- Read `SpecCrew-workspace/docs/crew-init/knowledge-techs/techs-manifest.json`
- Invoke 1 Worker Agent (`.qoder/agents/SpecCrew-task-worker.md`) with skill `.qoder/skills/SpecCrew-knowledge-techs-index/SKILL.md`
- Parameters to pass to skill:
  - `manifest_path`: Path to techs-manifest.json
  - `techs_base_path`: Base path for techs documentation (e.g., `knowledge/techs/`)
  - `output_path`: Output path for root INDEX.md (e.g., `knowledge/techs/`)
  - `language`: User's language (e.g., "zh", "en") - **REQUIRED**

**Output**:
- `knowledge/techs/INDEX.md` (complete with platform index and Agent mapping)

---

## Parallel Execution Strategy

### When `knowledge_types = "both"`

Both pipelines execute in parallel from Stage 1:

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

## Master Execution Flow

**Action**:
- Read all status files
- Read modules.json for platform structure
- Generate summary report grouped by platform

**Output**:
```
Knowledge base initialization completed:

Pipeline Summary:
- Stage 1 (Module List): ✅ Completed - 2 platforms, 8 modules identified
- Stage 2 (Analysis): ✅ Completed - 8/8 modules analyzed
- Stage 3 (Summarize): ✅ Completed - 8/8 modules summarized
- Stage 4 (System): ✅ Completed

Platform Breakdown:
- Web Frontend (web): 4 modules, 16 features
- Mobile App (mobile-flutter): 4 modules, 16 features

Statistics:
- Platforms: 2
- Total Modules: 8
- Total Features: 32
- Total Entities: 18
- Total APIs: 56

Output Files:
- knowledge/bizs/system-overview.md
- knowledge/bizs/web/order/order-overview.md
- knowledge/bizs/web/order/features/*.md (4 files)
- knowledge/bizs/mobile-flutter/order/order-overview.md
- knowledge/bizs/mobile-flutter/order/features/*.md (4 files)
- [Other platforms and modules...]

Next Steps:
- Review system-overview.md for complete system structure
- Use SpecCrew-pm-requirement-assess for new requirements
```

## Master Execution Flow

### Step 1: Parse Input Parameters

1. Determine `knowledge_types`:
   - `"bizs"`: Run bizs pipeline only
   - `"techs"`: Run techs pipeline only
   - `"both"`: Run both pipelines in parallel (default)

2. Set default paths:
   - `source_path`: Project root if not specified
   - `bizs_output`: `knowledge/bizs/`
   - `techs_output`: `knowledge/techs/`

### Step 2: Launch Stage 1 (Parallel when knowledge_types = "both")

**IF knowledge_types = "bizs" OR "both"**:
- Launch Bizs Stage 1 Worker (SpecCrew-knowledge-bizs-init)

**IF knowledge_types = "techs" OR "both"**:
- Launch Techs Stage 1 Worker (SpecCrew-knowledge-techs-init)

**Wait for all Stage 1 Workers to complete**.

### Step 3: Execute Pipeline Stages

**For Bizs Pipeline** (if enabled):
- Read `modules.json`
- Launch Stage 2 Workers in parallel (one per module)
- Wait for completion
- Launch Stage 3 Workers in parallel (one per module)
- Wait for completion
- Launch Stage 4 Worker (system summary)
- Wait for completion

**For Techs Pipeline** (if enabled):
- Read `techs-manifest.json`
- Launch Stage 2 Workers in parallel (one per platform)
- Wait for completion
- Launch Stage 3 Worker (root index)
- Wait for completion

**Note**: Bizs and Techs pipelines run independently and can be in different stages simultaneously.

### Step 4: Generate Unified Final Report

**Action**:
- Read all status files from both pipelines (if applicable)
- Aggregate results
- Generate combined summary report

**Output Format** (when knowledge_types = "both"):
```
╔══════════════════════════════════════════════════════════════════════╗
║          Knowledge Base Initialization Completed                     ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                     │
║ [Bizs Pipeline]                                                      ║
║ ─────────────────────────────────────────────────────────────────   │
║ Stage 1 (Module List):     ✅ Completed - 2 platforms, 8 modules     ║
║ Stage 2 (Module Analysis): ✅ Completed - 8/8 modules analyzed       ║
║ Stage 3 (Module Summary):  ✅ Completed - 8/8 modules summarized     ║
║ Stage 4 (System Summary):  ✅ Completed                              ║
║                                                                     │
║ [Techs Pipeline]                                                     ║
║ ─────────────────────────────────────────────────────────────────   │
║ Stage 1 (Platform Detection): ✅ Completed - 3 platforms detected    ║
║ Stage 2 (Doc Generation):     ✅ Completed - 3/3 platforms           ║
║ Stage 3 (Index Generation):   ✅ Completed                           ║
║                                                                     │
║ Platform Breakdown:                                                  ║
║ ─────────────────────────────────────────────────────────────────   │
║ Bizs:  Web Frontend (4 modules), Mobile App (4 modules)              ║
║ Techs: web-react, backend-nestjs, mobile-flutter                     ║
║                                                                     │
║ Generated Documents:                                                 ║
║ ─────────────────────────────────────────────────────────────────   │
║   📄 knowledge/bizs/system-overview.md                               ║
║   📄 knowledge/bizs/{platform}/{module}/... (8 modules)              ║
║   📄 knowledge/techs/INDEX.md                                        ║
║   📄 knowledge/techs/{platform}/... (3 platforms)                    ║
║                                                                     │
╚══════════════════════════════════════════════════════════════════════╝
```

---

## Error Handling

### Bizs Pipeline

| Stage | Failure Handling |
|-------|-----------------|
| Stage 1 | Abort bizs pipeline, report error (techs pipeline continues) |
| Stage 2 | Continue with successful modules per platform, report failed modules |
| Stage 3 | Continue with successful modules per platform, report failed modules |
| Stage 4 | Abort bizs pipeline if < 50% modules completed successfully |

### Techs Pipeline

| Stage | Failure Handling |
|-------|-----------------|
| Stage 1 | Abort techs pipeline, report error (bizs pipeline continues) |
| Stage 2 | Continue with successful platforms, report failed platforms |
| Stage 3 | Abort techs pipeline if Stage 2 had critical failures |

### Cross-Pipeline Policy

- **Pipeline Independence**: Failure in one pipeline does NOT affect the other
- **Partial Success**: Report success for completed pipeline, failure for the other
- **Final Report**: Always generate report showing status of both pipelines (if requested)

## Checklist

### For Bizs Pipeline
- [ ] Bizs Stage 1: Platform list generated with modules.json
- [ ] Bizs Stage 2: All modules across all platforms analyzed in parallel
- [ ] Bizs Stage 3: All modules across all platforms summarized in parallel
- [ ] Bizs Stage 4: System overview generated with platform hierarchy
- [ ] Status files created in `docs/crew-init/knowledge-bizs/`

### For Techs Pipeline
- [ ] Techs Stage 1: Platform manifest generated with techs-manifest.json
- [ ] Techs Stage 2: All platforms processed in parallel
- [ ] Techs Stage 3: Root INDEX.md generated with Agent mapping
- [ ] Status files created in `docs/crew-init/knowledge-techs/`

### Final
- [ ] Unified final report generated with platform breakdown
- [ ] All outputs verified

