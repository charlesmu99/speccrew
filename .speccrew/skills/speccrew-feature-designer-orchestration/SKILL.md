---
name: speccrew-feature-designer-orchestration
version: 1.0.0
description: Feature Designer 的核心编排技能，负责加载功能清单、协调功能分析、功能规格设计与 API 契约生成。处理单个功能（直接调用）和多个功能（Worker 分发）两种工作流路径。
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

# Feature Designer Orchestration

Feature Designer 的核心编排技能，负责：

1. **Stage Gate Verification** - 验证 PRD 阶段已完成确认
2. **Feature List Loading** - 从 .prd-feature-list.json 加载功能清单
3. **Feature Analysis Orchestration** - 协调功能分析（单个直接调用，多个分发 Worker）
4. **Feature Design Orchestration** - 协调功能规格设计
5. **API Contract Generation** - 生成 API 契约文档
6. **Joint Confirmation** - 汇总确认所有设计产出

## Invocation Method

**CRITICAL**: This skill is loaded directly by Feature Designer Agent — do NOT invoke via Worker Agent.

```xml
<block type="task" action="run-skill" desc="Feature Designer orchestration workflow">
  <field name="skill">speccrew-feature-designer-orchestration</field>
</block>
```

## Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `prd_path` | string | Yes | PRD 文档目录路径 |
| `iteration_path` | string | Yes | 当前迭代目录路径 |
| `workspace_root` | string | Yes | speccrew-workspace 根目录路径 |
| `frontend_platforms` | array | No | 前端平台列表（从 techs-manifest 读取） |

## Output

- `status` - 执行状态 (success / partial / failed)
- `feature_specs` - 生成的功能规格文件列表
- `api_contracts` - 生成的 API 契约文件列表
- `workflow_stage` - 当前工作流阶段状态
- `next_agent` - 下一步建议的 Agent

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

### Worker Enforcement Rules

This agent is an **orchestrator/dispatcher**. When multiple Features exist, it MUST delegate all skill execution to `speccrew-task-worker` agents.

| Condition | Action | Tool |
|-----------|--------|------|
| 1 Feature | Direct skill invocation allowed | Skill tool |
| 2+ Features | **MUST** dispatch Workers | speccrew-task-worker via Agent tool |

### FORBIDDEN Actions (When Features ≥ 2)

1. ❌ DO NOT invoke `speccrew-fd-feature-analyze` skill directly
2. ❌ DO NOT invoke `speccrew-fd-feature-design` skill directly
3. ❌ DO NOT invoke `speccrew-fd-api-contract` skill directly
4. ❌ DO NOT generate `.feature-analysis.md` files yourself
5. ❌ DO NOT generate `.feature-spec.md` files yourself
6. ❌ DO NOT generate `.api-contract.md` files yourself
7. ❌ DO NOT create any document content as fallback if worker fails

### Name Lock Rule

After Phase 2 Feature List is confirmed, feature_name is immutable. All Skills MUST use the exact parameter value for output filenames. Name translation or substitution is FORBIDDEN.
