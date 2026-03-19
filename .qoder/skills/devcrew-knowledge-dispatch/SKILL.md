---
name: devcrew-knowledge-dispatch
description: Dispatch knowledge base initialization tasks to Worker Agents with parallel execution support. Used by Leader Agent to orchestrate multi-stage pipeline for bizs knowledge generation.
tools: Read, Write, Task
---

# Knowledge Base Dispatch

Orchestrate bizs knowledge base generation with 4-stage parallel pipeline.

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

**Output**:
- `devcrew-workspace/docs/crew-init/knowledge-bizs/modules.json`
```json
{
  "generated_at": "2024-01-15T10:30:00Z",
  "analysis_method": "ui-based",
  "source_path": "/project",
  "module_count": 4,
  "modules": [
    {
      "name": "Order Management",
      "code_name": "order",
      "user_value": "Handle customer orders from creation to fulfillment",
      "entry_points": ["/orders", "/orders/:id", "/order-create"],
      "system_type": "ui"
    },
    {
      "name": "Payment & Billing",
      "code_name": "payment",
      "user_value": "Process payments and manage invoices",
      "entry_points": ["/payments", "/invoices"],
      "system_type": "ui"
    },
    {
      "name": "Product Catalog",
      "code_name": "product",
      "user_value": "Manage product information and categories",
      "entry_points": ["/products", "/categories"],
      "system_type": "ui"
    }
  ]
}
```

### Stage 2: Module Analysis (Parallel)

**Goal**: Analyze each module in parallel to generate feature details.

**Action**:
- Read `devcrew-workspace/docs/crew-init/knowledge-bizs/modules.json`
- For each module, invoke 1 Worker Agent (`.qoder/agents/devcrew-task-worker.md`) with skill `.qoder/skills/devcrew-knowledge-module-analyze/SKILL.md`
- Parameters to pass to skill:
  - `module_name`: Module code_name from modules.json
  - `source_path`: Source code root path (from input or project root)
  - `output_path`: Output directory for the module (e.g., `knowledge/bizs/{module_name}/`)

**Parallel Tasks**:
```
Worker 1: module="order",     output="knowledge/bizs/order/"
Worker 2: module="payment",   output="knowledge/bizs/payment/"
Worker 3: module="inventory", output="knowledge/bizs/inventory/"
Worker 4: module="user",      output="knowledge/bizs/user/"
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
- For each module, invoke 1 Worker Agent (`.qoder/agents/devcrew-task-worker.md`) with skill `.qoder/skills/devcrew-knowledge-module-summarize/SKILL.md`
- Parameters to pass to skill:
  - `module_name`: Module code_name from modules.json
  - `module_path`: Path to module directory (e.g., `knowledge/bizs/{module_name}/`)

**Parallel Tasks**:
```
Worker 1: module="order",     module_path="knowledge/bizs/order/"
Worker 2: module="payment",   module_path="knowledge/bizs/payment/"
Worker 3: module="inventory", module_path="knowledge/bizs/inventory/"
Worker 4: module="user",      module_path="knowledge/bizs/user/"
```

**Output per Module**:
- `{name}-overview.md` (complete version)

**Status Tracking**:
- `devcrew-workspace/docs/crew-init/knowledge-bizs/stage3-status.json`

### Stage 4: System Summarize (Single Task)

**Goal**: Generate complete system-overview.md.

**Prerequisite**: All Stage 3 tasks completed.

**Action**:
- Invoke 1 Worker Agent (`.qoder/agents/devcrew-task-worker.md`) with skill `.qoder/skills/devcrew-knowledge-system-summarize/SKILL.md`
- Parameters to pass to skill:
  - `modules_path`: Path to modules directory (e.g., `knowledge/bizs/`)
  - `output_path`: Output path for system-overview.md (e.g., `knowledge/bizs/`)

**Output**:
- `knowledge/bizs/system-overview.md` (complete with module index)

### Stage 5: Generate Final Report

**Action**:
- Read all status files
- Generate summary report

**Output**:
```
Knowledge base initialization completed:

Pipeline Summary:
- Stage 1 (Module List): ✅ Completed - 4 modules identified
- Stage 2 (Analysis): ✅ Completed - 4/4 modules analyzed
- Stage 3 (Summarize): ✅ Completed - 4/4 modules summarized
- Stage 4 (System): ✅ Completed

Statistics:
- Modules: 4
- Total Features: 32
- Total Entities: 18
- Total APIs: 56

Output Files:
- knowledge/bizs/system-overview.md
- knowledge/bizs/order/order-overview.md
- knowledge/bizs/order/features/*.md (8 files)
- [Other modules...]

Next Steps:
- Review system-overview.md for system structure
- Use devcrew-pm-requirement-assess for new requirements
```

## Error Handling

| Stage | Failure Handling |
|-------|-----------------|
| Stage 1 | Abort entire pipeline, report error |
| Stage 2 | Continue with successful modules, report failed modules |
| Stage 3 | Continue with successful modules, report failed modules |
| Stage 4 | Abort if < 50% modules completed successfully |

## Checklist

- [ ] Stage 1: Module list generated
- [ ] Stage 2: All modules analyzed in parallel
- [ ] Stage 3: All modules summarized in parallel
- [ ] Stage 4: System overview generated
- [ ] Stage 5: Final report generated
- [ ] Status files created in `docs/crew-init/knowledge-bizs/`
- [ ] All outputs verified
