---
name: speccrew-system-deployer-orchestration
version: 1.0.0
description: System Deployer 的编排调度技能，负责执行部署工作流：阶段门禁验证、IDE目录检测、准备阶段、技能调度（构建→迁移→启动→冒烟测试）、部署总结确认。
tools: Read, Write, Glob, Grep, Bash
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

# System Deployer Orchestration

System Deployer 的核心编排技能，负责：

1. **Stage Gate Verification** - 验证开发阶段已完成确认
2. **IDE Directory Detection** - 检测 IDE 目录并验证部署技能存在
3. **Preparation** - 读取开发任务记录、加载技术知识、确定项目根目录
4. **Skill Dispatch** - 按顺序调度部署技能：build → migrate → startup → smoke-test
5. **Deployment Summary** - 呈现部署总结并等待用户确认

## Invocation Method

**CRITICAL**: This skill is loaded directly by System Deployer Agent — do NOT invoke via Worker Agent.

```xml
<block type="task" action="run-skill" desc="System Deployer orchestration workflow">
  <field name="skill">speccrew-system-deployer-orchestration</field>
</block>
```

## Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `workspace_path` | string | Yes | speccrew-workspace 根目录绝对路径 |
| `iteration_dir` | string | Yes | 当前迭代目录路径 |
| `update_progress_script` | string | Yes | update-progress.js 脚本路径 |

## Output

- `status` - Execution status (success / partial / failed)
- `deployed` - Boolean indicating deployment success
- `checkpoints` - List of passed checkpoints
- `output_files` - List of generated/modified files
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
4. DO NOT ask for confirmation before invoking skills (Phase 3 HARD STOP is the only confirmation point)

### When to Pause (ONLY these cases)

1. Phase 3 HARD STOP — user confirmation required by design
2. Ambiguous requirements that genuinely need clarification
3. Unrecoverable errors that prevent further progress
4. Skill invocation failure — report and wait for user decision
