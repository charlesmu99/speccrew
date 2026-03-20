---
name: devcrew-knowledge-dispatch
description: Dispatch knowledge base initialization tasks to Worker Agents with parallel execution support. Used by Leader Agent to orchestrate multi-stage pipeline for bizs knowledge generation.
tools: Read, Write, Task
---

# Knowledge Base Dispatch

Orchestrate bizs knowledge base generation with 4-stage parallel pipeline.

## Language Adaptation

**CRITICAL**: All generated documents must match the user's language. Detect the language from the user's input and pass it to all downstream Worker Agents.

- User writes in 中文 → Generate Chinese documents, pass `language: "zh"` to workers
- User writes in English → Generate English documents, pass `language: "en"` to workers
- User writes in other languages → Use appropriate language code

**All downstream skills must receive the `language` parameter and generate content in that language only.**

## Trigger Scenarios

- "Initialize knowledge base"
- "Generate bizs knowledge from source code"
- "Dispatch knowledge generation tasks"

## User

Leader Agent (devcrew-team-leader)

## Prerequisites

- Source code available for analysis

## Input

- `source_path`: Source code root path (default: project root)
- `output_path`: Output directory (default: `knowledge/bizs/`)

## Output

- Task status records in `devcrew-workspace/docs/crew-init/knowledge-bizs/`
- Generated documentation in `{output_path}/`

## 4-Stage Pipeline Workflow

### Stage 1: Generate Module List (Single Task)

**Goal**: Scan source code and identify all modules.

**Action**:
- Invoke 1 Worker Agent (`.qoder/agents/devcrew-task-worker.md`) with skill `.qoder/skills/devcrew-knowledge-bizs-init/SKILL.md`
- Task: Analyze project structure, detect modules
- Parameters to pass to skill:
  - `source_path`: Source code directory path (default: project root)
  - `output_path`: Output directory (default: `devcrew-workspace/docs/crew-init/knowledge-bizs/`)
  - `language`: User's language (e.g., "zh", "en") - **REQUIRED**

**Output**:
- `devcrew-workspace/docs/crew-init/knowledge-bizs/modules.json`
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

### Stage 2: Module Analysis (Parallel)

**Goal**: Analyze each module in parallel to generate feature details.

**Action**:
- Read `devcrew-workspace/docs/crew-init/knowledge-bizs/modules.json`
- Iterate through each `platform` in `platforms` array
- For each module within the platform, invoke 1 Worker Agent (`.qoder/agents/devcrew-task-worker.md`) with skill `.qoder/skills/devcrew-knowledge-module-analyze/SKILL.md`
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
- `devcrew-workspace/docs/crew-init/knowledge-bizs/stage2-status.json`

### Stage 3: Module Summarize (Parallel)

**Goal**: Complete each module overview based on feature details.

**Prerequisite**: Stage 2 completed for the module.

**Action**:
- Read `devcrew-workspace/docs/crew-init/knowledge-bizs/modules.json`
- Iterate through each `platform` in `platforms` array
- For each module within the platform, invoke 1 Worker Agent (`.qoder/agents/devcrew-task-worker.md`) with skill `.qoder/skills/devcrew-knowledge-module-summarize/SKILL.md`
- Parameters to pass to skill:
  - `module_name`: Module code_name from modules.json
  - `platform_type`: Platform type (e.g., "web", "mobile-flutter")
  - `module_path`: Path to module directory (e.g., `knowledge/bizs/{platform_type}/{module_name}/`)
  - `language`: User's language (e.g., "zh", "en") - **REQUIRED**

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
- `devcrew-workspace/docs/crew-init/knowledge-bizs/stage3-status.json`

### Stage 4: System Summarize (Single Task)

**Goal**: Generate complete system-overview.md aggregating all platforms and modules.

**Prerequisite**: All Stage 3 tasks completed.

**Action**:
- Read `devcrew-workspace/docs/crew-init/knowledge-bizs/modules.json` to get platform structure
- Invoke 1 Worker Agent (`.qoder/agents/devcrew-task-worker.md`) with skill `.qoder/skills/devcrew-knowledge-system-summarize/SKILL.md`
- Parameters to pass to skill:
  - `modules_json_path`: Path to modules.json file
  - `knowledge_base_path`: Path to knowledge base directory (e.g., `knowledge/bizs/`)
  - `output_path`: Output path for system-overview.md (e.g., `knowledge/bizs/`)
  - `language`: User's language (e.g., "zh", "en") - **REQUIRED**

**Output**:
- `knowledge/bizs/system-overview.md` (complete with platform index and module hierarchy)

### Stage 5: Generate Final Report

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
- Use devcrew-pm-requirement-assess for new requirements
```

## Error Handling

| Stage | Failure Handling |
|-------|-----------------|
| Stage 1 | Abort entire pipeline, report error |
| Stage 2 | Continue with successful modules per platform, report failed modules |
| Stage 3 | Continue with successful modules per platform, report failed modules |
| Stage 4 | Abort if < 50% modules completed successfully across all platforms |

## Checklist

- [ ] Stage 1: Platform list generated with modules.json
- [ ] Stage 2: All modules across all platforms analyzed in parallel
- [ ] Stage 3: All modules across all platforms summarized in parallel
- [ ] Stage 4: System overview generated with platform hierarchy
- [ ] Stage 5: Final report generated with platform breakdown
- [ ] Status files created in `docs/crew-init/knowledge-bizs/`
- [ ] All outputs verified
