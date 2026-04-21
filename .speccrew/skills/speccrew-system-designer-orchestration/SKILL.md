---
name: speccrew-system-designer-orchestration
version: 1.0.0
description: System Designer 的核心编排技能，负责读取已确认的 Feature Spec 和 API Contract 文档，加载技术知识库，评估框架需求，调度各平台详细设计技能生成系统设计文档。支持 web、mobile、desktop 平台。
tools: Read, Write, Glob, Grep, Bash, Agent
---

> **⚠️ MANDATORY EXECUTION PROTOCOL — READ BEFORE EXECUTING ANY BLOCK**
>
> **Step 1**: Load XML workflow specification: `speccrew-workspace/docs/rules/agentflow-spec.md` — this defines all block types and action-to-tool mappings
>
> **Step 2**: Execute this SKILL.md's XML workflow **block by block in document order**. For EVERY block, you MUST follow this 3-step cycle:
>
> ```
> 📋 Block [ID] (action=[action]) — [desc]
> 🔧 Tool: [which IDE tool to call]
> ✅ Result: [output or status]
> ```
>
> Action-to-tool mapping:
> - `action="run-skill"` → Invoke via **Skill tool** (pass the `<field name="skill">` value EXACTLY)
> - `action="run-script"` → Execute via **Terminal tool** (pass the `<field name="command">` value EXACTLY)
> - `action="dispatch-to-worker"` → Use **Agent tool** to create a new `speccrew-task-worker` agent, passing skill_path and context
> - `action="read-file"` → Read via **Read tool**
> - `action="log"` → Output message directly
> - `action="confirm"` → Present to user and wait for response
>
> **Step 3**: Execute ALL blocks sequentially without pausing (only stop at explicit `<event action="confirm">` blocks)

# System Designer Orchestration

System Designer 的核心编排技能，负责：

1. **Stage Gate** - 验证 Feature Design 阶段已确认
2. **Preparation** - 加载 Feature Registry，验证文件存在性
3. **Resource Verification** - 验证技术知识库可用性
4. **Framework Evaluation** - 派发单个 worker agent 执行框架评估技能，等待 worker 完成并验证 framework-evaluation.md 生成后进入下一阶段（HARD STOP 等待用户确认）
5. **Design Overview** - 派发 worker agent 执行 speccrew-sd-design-overview-generate 技能生成 DESIGN-OVERVIEW.md，等待 worker 完成并验证输出
6. **Platform Dispatch** - 分发各平台设计任务给 Worker
7. **Joint Confirmation** - 联合确认所有设计文档

## Invocation Method

**CRITICAL**: This skill is loaded directly by System Designer Agent — do NOT invoke via Worker Agent.

```xml
<block type="task" action="run-skill" desc="System Designer orchestration workflow">
  <field name="skill">speccrew-system-designer-orchestration</field>
</block>
```

## Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `workspace_path` | string | Yes | speccrew-workspace root directory path |
| `iterations_dir` | string | Yes | iterations directory path |
| `update_progress_script` | string | Yes | Path to update-progress.js script |
| `current_iteration` | string | No | Current active iteration identifier |

## Output

- `status` - Execution status (success / partial / failed)
- `output_files` - List of generated design documents
- `summary` - Execution summary
- `next_steps` - Suggested next actions

---

## AgentFlow Definition

<!-- @agentflow: workflow.agentflow.xml -->

---

## CONTINUOUS EXECUTION RULES

This skill MUST execute tasks continuously without unnecessary interruptions.

### FORBIDDEN Interruptions

1. DO NOT ask user "Should I continue?" after completing a subtask
2. DO NOT suggest "Let me split this into batches" or "Let's do this in parts"
3. DO NOT pause to list what you plan to do next — just do it
4. DO NOT ask for confirmation before generating output files
5. DO NOT warn about "large number of files" — proceed with generation
6. DO NOT offer "Should I proceed with the remaining items?"

### When to Pause (ONLY these cases)

1. CHECKPOINT gates defined in workflow (user confirmation required by design)
2. Ambiguous requirements that genuinely need clarification
3. Unrecoverable errors that prevent further progress
4. Security-sensitive operations (e.g., deleting existing files)

### Phase 3 Execution Method — Worker Agent Dispatch

**HOW TO DISPATCH**: When executing Phase 3 block P3-B1 (action="dispatch-to-worker"):
1. Use the **Agent tool** to create a new `speccrew-task-worker` agent
2. Pass `skill_path` to the worker: `${workspace_path}/.speccrew/skills/speccrew-sd-framework-evaluate/SKILL.md`
3. Pass context parameters: workspace_path, iteration_path, feature_spec_paths, api_contract_paths, techs_knowledge_paths, output_path
4. **Wait** for the worker agent to complete and return results
5. After worker completes, verify framework-evaluation.md exists at output_path
6. Then proceed to Phase 3.5 HARD STOP for user confirmation

**CRITICAL**: The `Agent tool` creates a NEW agent session — this is completely different from the `Skill tool` which executes inline.

### Phase 4 Execution Method — Worker Agent Dispatch

**HOW TO DISPATCH**: When executing Phase 4 block P4-B1 (action="dispatch-to-worker"):
1. Use the **Agent tool** to create a new `speccrew-task-worker` agent
2. Pass `skill_path` to the worker: `${workspace_path}/.speccrew/skills/speccrew-sd-design-overview-generate/SKILL.md`
3. Pass context parameters: workspace_path, iteration_path, feature_registry_path (.prd-feature-list.json path), techs_manifest_path (techs-manifest.json path), framework_evaluation_path (framework-evaluation.md path), output_path
4. **Wait** for the worker agent to complete and return results
5. After worker completes, verify DESIGN-OVERVIEW.md exists at output_path
6. Then proceed to Phase 4 checkpoint validation (P4-CP1)
7. Present DESIGN-OVERVIEW.md summary to user (feature count, platform count, matrix entries)
8. **⚠️ HARD STOP** — Wait for user explicit confirmation before proceeding to Phase 5

**CRITICAL**: The `Agent tool` creates a NEW agent session — this is completely different from the `Skill tool` which executes inline.

### Phase 5 Execution Method — Feature×Platform Worker Dispatch

**DISPATCH GRANULARITY**: ONE Worker per Feature×Platform combination — NO EXCEPTIONS.

**HOW TO DISPATCH**: When executing Phase 5 dispatch blocks (action="dispatch-to-worker"):
1. Build Feature×Platform matrix from DESIGN-OVERVIEW.md Platform Design Index
2. Create `.tasks-temp.json` with one entry per Feature×Platform combination
3. Initialize DISPATCH-PROGRESS.json via `update-progress.js init`
4. Compute batch plan (batch size = 6)
5. For each batch:
   a. Use **Agent tool** to create `speccrew-task-worker` agents for ALL tasks in the batch **SIMULTANEOUSLY**
   b. Each Worker receives: `skill_path` (platform-specific skill), `task_id`, `feature_id`, `feature_name`, `platform_id`, `feature_spec_path`, `api_contract_path`, `techs_knowledge_paths`, `framework_decisions`, `output_base_path`, `skip_confirmation: true`, `skip_index_generation: true`, `dispatch_progress_file`, `update_progress_script`
   c. **Wait** for ALL Workers in the batch to complete
   d. Update DISPATCH-PROGRESS.json for each completed Worker
   e. Log batch progress
6. After all batches complete, read final progress summary
7. Dispatch worker per platform with `index_only: true` to generate INDEX.md (see Phase 5.5)

**CRITICAL**: Each Worker handles exactly ONE feature on ONE platform. DO NOT group multiple features or platforms into a single Worker.

**Batch Dispatch Context Parameters**: When dispatching Workers in batch mode, the following parameters MUST be included in each Worker's context:
- `skip_confirmation: true` — Workers skip Checkpoint A user confirmation (not feasible in batch mode)
- `skip_index_generation: true` — Workers skip Step 5 INDEX.md generation (INDEX.md will be generated by orchestrator after all workers complete)
- `dispatch_progress_file` — Path to DISPATCH-PROGRESS.json, enables Worker to self-update its task status on completion
- `update_progress_script` — Path to update-progress.js script, used by Worker to execute status updates
- `task_id` — Task identifier in DISPATCH-PROGRESS.json (already part of dispatch context, listed here for completeness)

> **Worker Self-Update**: When `dispatch_progress_file` and `task_id` are provided, the Worker is responsible for updating its own task status in DISPATCH-PROGRESS.json upon completion (Step 7 of platform skills). The orchestrator's P5-B4-POST block serves as a fallback, but the Worker self-update is the primary mechanism.

### Phase 5.5: INDEX.md Generation (WORKER-DISPATCH)

After ALL Feature×Platform workers complete successfully, dispatch ONE worker per platform to generate INDEX.md. Each worker receives `index_only: true` and `skip_index_generation: false`, executing ONLY Step 5 of the platform skill.

**Dispatch parameters per platform**:
- `agent`: speccrew-task-worker
- `skill`: speccrew-sd-${platform.type}
- `skill_path`: ${ide_skills_dir}/speccrew-sd-${platform.type}/SKILL.md
- `context`:
  - `index_only: true`
  - `skip_index_generation: false`
  - `platform_id`: ${platform.id}
  - `output_dir`: ${iterations_dir}/${current_iteration}/03.system-design/${platform.id}
  - `completed_documents`: ${platform.completed_documents}
  - `techs_knowledge_dir`: ${techs_knowledge_dir}
  - `workspace_path`: ${workspace_path}
  - `task_id`: idx-${platform.id}
  - `dispatch_progress_file`: ${iterations_dir}/${current_iteration}/03.system-design/DISPATCH-PROGRESS.json
  - `update_progress_script`: ${update_progress_script}

**FORBIDDEN**: Orchestrator generating INDEX.md directly. INDEX.md MUST be generated by worker.

**Example** (5 features × 3 platforms = 15 workers, 3 batches of 6/6/3):
- Batch 1: Workers 1-6 (parallel)
- Batch 2: Workers 7-12 (parallel, after batch 1 completes)
- Batch 3: Workers 13-15 (parallel, after batch 2 completes)

### HARD STOP Checkpoints

This workflow has **mandatory HARD STOP** checkpoints at:
- **Phase 3.5**: Framework evaluation confirmation (user MUST approve framework decisions)
- **Phase 4.5**: Design overview confirmation (user MUST approve DESIGN-OVERVIEW.md before Phase 5 dispatch)
- **Phase 5.5**: (No HARD STOP — INDEX.md generation is automatic after all workers complete)
- **Phase 6.1**: Joint design confirmation (user MUST approve all designs)

DO NOT proceed past these checkpoints without explicit user confirmation.

## Must Do

- **READ workflow.agentflow.xml FIRST** — Execute blocks in document order
- **Use Agent tool for dispatch-to-worker blocks** — Agent tool creates a new speccrew-task-worker agent session
- **Pass skill_path explicitly to worker** — Worker cannot find skills via glob on first run
- **Wait for worker completion before verifying output** — Do not proceed until worker returns
- **Update progress via update-progress.js script** — Use run-script commands exactly as defined in XML

## Must Not Do

- **DO NOT use Skill tool for Phase 3 framework evaluation** — Skill tool executes inline, Agent tool creates a worker
- **DO NOT read feature spec files yourself** — Workers read them
- **DO NOT read tech knowledge files yourself** — Workers read them
- **DO NOT generate framework-evaluation.md yourself** — Only workers generate it
- **DO NOT create scripts for batch analysis** — Workers handle this via their own skill
- **DO NOT fallback to inline execution if worker fails** — ABORT instead
- **DO NOT let individual workers generate INDEX.md in batch mode** — `skip_index_generation: true` must be set; INDEX.md is generated in Phase 5.5 by separate worker with `index_only: true`
- **DO NOT skip reading workflow.agentflow.xml** — XML is the execution authority
- **DO NOT generate DESIGN-OVERVIEW.md yourself** — Dispatch speccrew-task-worker with speccrew-sd-design-overview-generate skill
- **DO NOT use Skill tool for Phase 4 design overview generation** — Skill tool executes inline, Agent tool creates a worker
- **DO NOT group multiple features into a single Worker** — Each Worker handles exactly ONE feature on ONE platform
- **DO NOT dispatch Workers sequentially** — ALL Workers in the same batch MUST be dispatched simultaneously
