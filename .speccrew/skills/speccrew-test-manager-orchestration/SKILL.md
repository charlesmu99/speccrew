---
name: speccrew-test-manager-orchestration
version: 1.0.0
description: Test Manager 的编排调度技能，负责执行三阶段测试工作流：测试用例设计 → 测试代码生成 → 测试执行与报告。支持单平台直接调用和多平台 Worker 并行调度。
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

# Test Manager Orchestration

Test Manager 的核心编排技能，负责：

1. **Stage Gate Verification** - 验证部署阶段已完成确认
2. **IDE Directory Detection** - 检测 IDE 目录并验证测试技能存在
3. **Preparation** - 识别迭代路径、定位输入文档、检查现有制品
4. **Knowledge Loading** - 加载功能规格、API契约、系统设计
5. **Test Case Design** - 测试用例设计（支持单平台/多平台模式）
6. **Test Code Generation** - 测试代码生成（含代码审查）
7. **Test Execution & Reporting** - 测试执行与缺陷报告
8. **Delivery Summary** - 交付总结确认

## Invocation Method

**CRITICAL**: This skill is loaded directly by Test Manager Agent — do NOT invoke via Worker Agent.

```xml
<block type="task" action="run-skill" desc="Test Manager orchestration workflow">
  <field name="skill">speccrew-test-manager-orchestration</field>
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
- `test_cases_designed` - Number of test cases designed
- `test_code_generated` - Number of test code files generated
- `tests_passed` - Number of tests passed
- `tests_failed` - Number of tests failed
- `bug_reports` - List of bug report paths
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
- Use DISPATCH-PROGRESS.json to track progress, enabling resumption if interrupted by context limits
- If context window is approaching limit, save progress to checkpoint and inform user how to resume
- NEVER voluntarily stop mid-batch to ask if user wants to continue
