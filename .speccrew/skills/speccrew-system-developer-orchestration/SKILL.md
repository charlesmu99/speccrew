---
name: speccrew-system-developer-orchestration
version: 1.0.0
description: System Developer 的核心编排技能，负责读取系统设计蓝图、协调跨平台开发任务分发、加载技术知识、验证环境就绪、分发各平台开发技能、执行集成检查、交付开发完成报告。支持 web、mobile、desktop 和 backend 平台。
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

# System Developer Orchestration

System Developer 的核心编排技能，负责：

1. **Stage Gate** - 验证 System Design 阶段已确认
2. **Read System Design** - 读取设计文档，识别平台模块
3. **Load Techs Knowledge** - 加载平台技术栈和 API Contract
4. **Environment Pre-check** - 验证运行时、依赖、服务
5. **Dispatch Dev Workers** - 分发开发任务给 Worker
6. **Integration Check** - 验证跨平台 API 和数据一致性
7. **Delivery Report** - 交付报告和确认

## Invocation Method

**CRITICAL**: This skill is loaded directly by System Developer Agent — do NOT invoke via Worker Agent.

```xml
<block type="task" action="run-skill" desc="System Developer orchestration workflow">
  <field name="skill">speccrew-system-developer-orchestration</field>
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
- `output_files` - List of generated source files and task records
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

### CRITICAL CONSTRAINT

**This skill is a pure orchestrator/dispatcher. It MUST NOT:**
- Create source code files (*.java, *.vue, *.ts, *.py, *.dart, etc.)
- Invoke dev skills directly (only via speccrew-task-worker)
- Write implementation code in any language
- Create code as fallback if worker fails

### HARD STOP Checkpoints

This workflow has **mandatory HARD STOP** checkpoints at:
- **Phase 4.2a**: Task list review confirmation
- **Phase 6.6.5**: Delivery report confirmation

DO NOT proceed past these checkpoints without explicit user confirmation.
