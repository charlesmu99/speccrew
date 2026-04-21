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
> - `action="dispatch-to-worker"` → Create **Task** via **Task tool** for `speccrew-task-worker`
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
5. **Design Overview** - 生成 DESIGN-OVERVIEW.md
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

### Phase 3 FORBIDDEN Actions

- DO NOT inline-call speccrew-sd-framework-evaluate skill
- DO NOT read feature spec files yourself for framework evaluation
- DO NOT create temporary scripts for batch file analysis
- DO NOT generate framework-evaluation.md as fallback if worker fails
- Worker dispatch failure = ABORT (report error, do NOT retry with inline execution)

### HARD STOP Checkpoints

This workflow has **mandatory HARD STOP** checkpoints at:
- **Phase 3.5**: Framework evaluation confirmation (user MUST approve)
- **Phase 6.1**: Joint design confirmation (user MUST approve all designs)

DO NOT proceed past these checkpoints without explicit user confirmation.
