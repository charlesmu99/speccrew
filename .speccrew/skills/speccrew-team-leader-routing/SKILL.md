---
name: speccrew-team-leader-routing
version: 1.0.0
description: Team Leader 的意图识别与路由调度技能，负责识别用户意图并路由到对应 Skill/Agent。处理项目初始化、知识库同步、工作流诊断等基础设施请求。
tools: Read, Write, Bash, Skill, Task
---

> **⚠️ MANDATORY EXECUTION PROTOCOL — READ BEFORE EXECUTING ANY BLOCK**
>
> **Step 1**: Load XML workflow specification: `speccrew-workspace/docs/rules/agentflow-spec.md` — this defines all block types and action-to-tool mappings
>
> **Step 2**: Execute this SKILL.md's XML workflow **block by block in document order**. For EVERY block, you MUST follow this 3-step cycle:
>
> ```
> 🏷️ Block [ID] (action=[action]) — [desc]
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

# Team Leader Routing

Team Leader 的核心路由调度技能，负责：

1. **Pipeline Progress Awareness** - 读取 WORKFLOW-PROGRESS.json，感知当前流水线状态
2. **Auto-Orchestration** - 处理自动推进与新用户引导
3. **Intent Recognition** - 识别用户意图并路由到正确的 Skill/Agent
4. **Skill Invocation** - 加载并执行对应的 Skill

## Invocation Method

**CRITICAL**: This skill is loaded directly by Team Leader Agent — do NOT invoke via Worker Agent.

```xml
<block type="task" action="run-skill" desc="Team Leader routing workflow">
  <field name="skill">speccrew-team-leader-routing</field>
</block>
```

## Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_message` | string | Yes | Original user input message |
| `workspace_root` | string | Yes | speccrew-workspace root directory path |
| `iteration_dir` | string | No | Current active iteration directory |

## Output

- `status` - Execution status (success / partial / failed)
- `skill_invoked` - Name of invoked Skill (if any)
- `output_files` - List of generated/modified files
- `summary` - Execution summary
- `next_steps` - Suggested next actions

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
