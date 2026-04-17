# speccrew-pm-phase5-subprd-dispatch

## Description

PM Phase 5 Sub-PRD Batch Dispatch Skill. **Orchestration-layer skill** executed directly by PM Agent (NOT dispatched to Worker).

This is an **orchestration skill** that PM Agent must execute directly:
- PM Agent reads `workflow.agentflow.xml` and executes each block step-by-step
- PM Agent uses Agent tool to dispatch Workers for Sub-PRD generation
- Workers generate Sub-PRD files; PM Agent only coordinates

**CRITICAL ARCHITECTURE RULE (Harness Principle 17: Orchestration Layer Separation)**:
- This skill contains internal `dispatch-to-worker` blocks
- Workers CANNOT dispatch Workers (execution hierarchy constraint)
- Therefore, this skill MUST be executed by PM Agent directly
- PM Agent MUST NOT dispatch this skill to a Worker

**Execution Method**: PM Agent reads `workflow.agentflow.xml` and follows the workflow steps.

## MANDATORY: PM Must Read workflow.agentflow.xml

> 🛑 **BEFORE executing this skill, PM Agent MUST:**
> 1. Read the `workflow.agentflow.xml` file in this skill directory
> 2. Parse each block and execute in order
> 3. Follow the exact workflow steps defined in the XML
>
> **FORBIDDEN:**
> - DO NOT execute this skill without reading the XML workflow
> - DO NOT skip blocks defined in the XML
> - DO NOT dispatch this skill to a Worker Agent

## Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `prd_output` | object | true | Phase 4 PRD generation output, containing master_prd_path, dispatch_plan_path, etc. |
| `iteration_path` | string | true | Absolute path to current iteration directory |
| `language` | string | false | User language (default: zh) |
| `workspace_path` | string | true | Absolute path to speccrew-workspace root directory |
| `update_progress_script` | string | true | Absolute path to update-progress.js script |
| `max_concurrent_workers` | number | false | Maximum concurrent Workers (default: 5) |

## Outputs

| Output | Type | Description |
|--------|------|-------------|
| `dispatch_result` | string | Dispatch result status: success / partial / failed |
| `total_subprds` | number | Total Sub-PRD count |
| `success_count` | number | Successfully generated Sub-PRD count |
| `failure_count` | number | Failed Sub-PRD count |
| `sub_prd_files` | array | List of generated Sub-PRD file paths |
| `feature_list_path` | string | Feature List file path |

<!-- @agentflow: workflow.agentflow.xml -->

## Checklist

### Step 5.1: Read Dispatch Plan
- [ ] Read dispatch-plan from Master PRD (Sub-PRD grouping information)
- [ ] Parse sub_prd_groups array
- [ ] Verify each group contains required fields: module_id, module_name, module_key, module_scope, module_entities

### Step 5.2: Initialize Progress Tracking
- [ ] Create temporary task definition file .tasks-temp.json
- [ ] Initialize DISPATCH-PROGRESS.json using update-progress.js script
- [ ] Verify initialization success (Total: N | Pending: N | Completed: 0)

### Step 5.3: Batch Dispatch Workers
- [ ] Group in batches of 5 for parallel dispatch
- [ ] Each Worker carries complete context parameters
- [ ] Update DISPATCH-PROGRESS.json after each batch completes
- [ ] Continue to next batch until all modules are processed

### Step 5.4: Failure Retry
- [ ] Check for tasks with failed status
- [ ] If failures exist -> retry once (single retry mechanism)
- [ ] If still failing after retry -> log and continue

### Step 5.5: Result Collection and Verification
- [ ] Read final DISPATCH-PROGRESS.json
- [ ] Verify all Sub-PRD files exist and size > 3KB
- [ ] Generate summary report
- [ ] Update checkpoint
- [ ] Verify feature list completeness

### Step 5.6: User Confirmation
- [ ] Wait for user confirmation of Sub-PRD generation results

## Must Do

- **READ workflow.agentflow.xml FIRST** — PM Agent must parse the XML workflow before any execution
- **Initialize DISPATCH-PROGRESS.json BEFORE any Worker dispatch** — Use update-progress.js init command
- **Dispatch one Worker per module** — Use Agent tool to create speccrew-task-worker with speccrew-pm-sub-prd-generate skill
- **Update progress after each Worker completes** — Use update-progress.js update-task command
- **Verify all Sub-PRD files exist** — Check file existence and size > 3KB
- **Update checkpoint via script** — Use update-progress.js write-checkpoint command

## Must Not Do

- **DO NOT dispatch this skill to a Worker** — Phase 5 is PM direct execution
- **DO NOT skip reading workflow.agentflow.xml** — XML workflow is the execution guide
- **DO NOT dispatch Workers before DISPATCH-PROGRESS.json is initialized** — Progress tracking is mandatory
- **DO NOT create DISPATCH-PROGRESS.json manually** — Must use update-progress.js script
- **DO NOT generate Sub-PRD content directly** — Only Workers generate Sub-PRDs
- **DO NOT skip progress update after Worker completes** — Must call update-task for each completed Worker
- **DO NOT dispatch one Worker for multiple modules** — One Worker per module
- **DO NOT proceed to Phase 6 without verifying all Sub-PRDs** — Completion verification is mandatory
