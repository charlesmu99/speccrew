---
name: speccrew-task-worker-execution
version: 1.0.0
description: Task Worker 的通用任务执行技能，负责接收任务参数、加载 Skill 定义、读取 AgentFlow 规范、逐 Block 执行工作流并输出结构化完成报告。
tools: Read, Grep, Glob, Write, Bash, Edit, WebFetch, WebSearch
---

> **⚠️ MANDATORY EXECUTION PROTOCOL — READ BEFORE EXECUTING ANY BLOCK**
>
> **Step 1**: Load XML workflow specification: `speccrew-workspace/docs/rules/agentflow-spec.md` — this defines all block types and action-to-tool mappings
>
> **Step 2**: Execute this SKILL.md's XML workflow **block by block in document order**. For EVERY block, you MUST follow this 3-step cycle:
>
> ```
> 🏷️ Block [ID] (type=[type], action=[action]) — [desc]
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

# Task Worker Execution

通用任务执行 Worker 的核心执行技能，负责：

1. **Task Reception** - 接收来自调用 Agent 的任务参数
2. **Skill Discovery** - 解析技能路径，定位 SKILL.md 文件
3. **Workflow Execution** - 加载 AgentFlow 规范，逐 Block 执行工作流
4. **Result Reporting** - 输出结构化完成报告

## Invocation Method

**CRITICAL**: This skill is loaded directly by Task Worker Agent — invoked when `skill_path` or `skill_name` is provided.

```xml
<block type="task" action="run-skill" desc="Execute task worker workflow">
  <field name="skill">speccrew-task-worker-execution</field>
</block>
```

## Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `skill_path` | string | No | Full relative path to SKILL.md file (priority over skill_name) |
| `skill_name` | string | No | Skill name identifier for discovery (backward compatibility) |
| `context` | object | Yes | Task context parameters (task_id, module, input_path, output_path, etc.) |
| `workspace_root` | string | Yes | Workspace root directory path |

## Output

- `status` - Execution status (success / failed)
- `task_id` - Task identifier from dispatch context
- `output_files` - List of generated/modified files
- `summary` - Execution summary
- `error` - Error description (if failed)
- `error_category` - Error category (DEPENDENCY_MISSING | BUILD_FAILURE | VALIDATION_ERROR | RUNTIME_ERROR | BLOCKED)

---

## AgentFlow Definition

<!-- @agentflow: SKILL.xml -->

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

### Batch Execution Behavior

- When multiple items need processing, process ALL of them sequentially without asking
- Use DISPATCH-PROGRESS.json to track progress, enabling resumption if interrupted
- NEVER voluntarily stop mid-batch to ask if user wants to continue

### Worker Completion Protocol

- After completing assigned skill execution, report results immediately
- DO NOT ask the dispatching agent for further instructions
- DO NOT wait for confirmation before writing output files
- If skill execution fails, report failure with details — do not ask user what to do
