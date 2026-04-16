# speccrew-pm-phase5-subprd-dispatch

## Description

PM Phase 5 Sub-PRD Batch Dispatch Skill. Core orchestration component for Master-Sub PRD workflow, executed directly by PM Agent (NOT dispatched to Worker).

PM Agent loads and executes this skill directly to coordinate batch dispatch of Sub-PRD generation tasks to Worker Agents, implementing:
- Reading Dispatch Plan from Master PRD
- Initializing dispatch progress tracking
- Dispatching Workers in parallel batches for Sub-PRD generation per module
- Failure retry and result verification

**CRITICAL**: This skill contains dispatch-to-worker logic internally. It MUST be executed by PM Agent (who has Agent tool access), NOT by a Worker Agent (who cannot create sub-Workers).

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

## Key Rules

### MANDATORY - Worker Dispatch Rules
- **ONE Worker per Module** - Dispatch one independent Worker per Sub-PRD module
- **PM Must Not Generate Directly** - PM Agent must NOT directly generate Sub-PRD content
- **Must Use dispatch-to-worker** - All Workers must be executed via `dispatch-to-worker` action
- **Direct Skill Invocation Forbidden** - Must NOT directly invoke `speccrew-pm-sub-prd-generate` skill

### MANDATORY - Batch Processing Rules
- **Batch Size = 5** - Maximum 5 parallel Workers per batch
- **Parallel Dispatch** - Workers in the same batch must be dispatched simultaneously
- **Sequential Wait** - Wait for current batch to complete before dispatching next batch
- **Progress Update** - Immediately update DISPATCH-PROGRESS.json after each Worker completes

### MANDATORY - Progress Tracking Rules
- **Script Initialization** - DISPATCH-PROGRESS.json must be created via update-progress.js
- **Manual Creation Forbidden** - Must NOT create progress files directly via create_file or PowerShell
- **Idempotent Update** - Use `update-task` command to update individual task status

### FORBIDDEN - Prohibited Actions
- PM Agent directly generating Sub-PRD files is forbidden
- Dispatching one Worker to handle multiple modules is forbidden
- Skipping Worker dispatch as a fallback after failure is forbidden
- Marking checkpoint as passed before user confirmation is forbidden
