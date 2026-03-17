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

- Project diagnosis report at `devcrew-workspace/diagnosis-reports/`
- Source code available for analysis

## Input

- `source_path`: Source code root path (default: project root)
- `output_path`: Output directory (default: `knowledge/bizs/`)

## Output

- Task status records in `devcrew-workspace/.tasks/knowledge-bizs-init/`
- Generated documentation in `{output_path}/`

## 4-Stage Pipeline Workflow

### Stage 1: Generate Module List (Single Task)

**Goal**: Scan source code and identify all modules.

**Action**:
- Invoke 1 Worker Agent with `devcrew-knowledge-bizs-init` skill
- Task: Analyze project structure, detect modules

**Output**:
- `devcrew-workspace/.tasks/knowledge-bizs-init/modules.json`
```json
{
  "modules": ["order", "payment", "inventory", "user"],
  "tech_stack": "nestjs",
  "source_path": "...",
  "generated_at": "..."
}
```

### Stage 2: Module Analysis (Parallel)

**Goal**: Analyze each module in parallel to generate feature details.

**Action**:
- Read `modules.json`
- For each module, invoke 1 Worker Agent in parallel
- Use skill: `devcrew-knowledge-module-analyze`

**Parallel Tasks**:
```
Worker 1: module="order",     output="knowledge/bizs/modules/MODULE-ORDER/"
Worker 2: module="payment",   output="knowledge/bizs/modules/MODULE-PAYMENT/"
Worker 3: module="inventory", output="knowledge/bizs/modules/MODULE-INVENTORY/"
Worker 4: module="user",      output="knowledge/bizs/modules/MODULE-USER/"
```

**Output per Module**:
- `MODULE-{NAME}-OVERVIEW.md` (initial version with feature list)
- `features/FEATURE-*-DETAIL.md` (one per feature)

**Status Tracking**:
- `devcrew-workspace/.tasks/knowledge-bizs-init/stage2-status.json`

### Stage 3: Module Summarize (Parallel)

**Goal**: Complete each module overview based on feature details.

**Prerequisite**: Stage 2 completed for the module.

**Action**:
- For each module, invoke 1 Worker Agent in parallel
- Use skill: `devcrew-knowledge-module-summarize`

**Parallel Tasks**:
```
Worker 1: module="order",     module_path="knowledge/bizs/modules/MODULE-ORDER/"
Worker 2: module="payment",   module_path="knowledge/bizs/modules/MODULE-PAYMENT/"
Worker 3: module="inventory", module_path="knowledge/bizs/modules/MODULE-INVENTORY/"
Worker 4: module="user",      module_path="knowledge/bizs/modules/MODULE-USER/"
```

**Output per Module**:
- `MODULE-{NAME}-OVERVIEW.md` (complete version)

**Status Tracking**:
- `devcrew-workspace/.tasks/knowledge-bizs-init/stage3-status.json`

### Stage 4: System Summarize (Single Task)

**Goal**: Generate complete SYSTEM-OVERVIEW.md.

**Prerequisite**: All Stage 3 tasks completed.

**Action**:
- Invoke 1 Worker Agent
- Use skill: `devcrew-knowledge-system-summarize`

**Task**:
```
Worker: modules_path="knowledge/bizs/modules/", output_path="knowledge/bizs/"
```

**Output**:
- `knowledge/bizs/SYSTEM-OVERVIEW.md` (complete with module index)

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
- knowledge/bizs/SYSTEM-OVERVIEW.md
- knowledge/bizs/modules/MODULE-ORDER/MODULE-ORDER-OVERVIEW.md
- knowledge/bizs/modules/MODULE-ORDER/features/FEATURE-*-DETAIL.md (8 files)
- [Other modules...]

Next Steps:
- Review SYSTEM-OVERVIEW.md for system structure
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
- [ ] Status files created in `.tasks/knowledge-bizs-init/`
- [ ] All outputs verified
