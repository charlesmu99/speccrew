---
name: speccrew-product-manager-orchestration
version: 1.0.0
description: Product Manager 的核心编排技能，负责需求澄清、复杂度评估、PRD 生成协调与验证。处理简单需求（单 PRD）和复杂需求（Master-Sub PRD）两种工作流路径。
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
> **CRITICAL DISPATCH RULE:**
> - PM Agent (Team Leader) MUST NOT execute Skills directly
> - ALL Skill executions MUST go through `dispatch-to-worker` action
> - Worker Agent (`speccrew-task-worker`) receives the Skill name and context, then executes the Skill
>
> **Step 3**: Execute ALL blocks sequentially without pausing (only stop at explicit `<event action="confirm">` blocks)

# Product Manager Orchestration

Product Manager 的核心编排技能，负责：

1. **Pipeline Progress Management** - 创建/定位迭代目录，管理工作流进度
2. **Knowledge Base Detection** - 检测知识库状态并按需初始化
3. **Complexity Assessment** - 评估需求复杂度，决定简单/复杂路径
4. **Requirement Clarification** - 分发 Worker 执行澄清技能，收集需求细节
5. **PRD Generation Orchestration** - 协调 PRD 生成（所有 Skill 通过 Worker 分发执行）
6. **Verification & Confirmation** - 验证 PRD 完整性，等待用户确认

**DISPATCH-TO-WORKER ARCHITECTURE:**

PM Agent 作为 Team Leader，不直接执行任何 Skill。所有 Skill 调用都通过 `dispatch-to-worker` 模式：

| Phase | Action | Skill | Worker |
|-------|--------|-------|--------|
| Phase 1 | `dispatch-to-worker` | `speccrew-pm-knowledge-detector` | `speccrew-task-worker` |
| Phase 1 | `dispatch-to-worker` | `speccrew-pm-system-summary-reader` | `speccrew-task-worker` |
| Phase 1 | `dispatch-to-worker` | `speccrew-pm-module-matcher` | `speccrew-task-worker` |
| Phase 1 | `dispatch-to-worker` | `speccrew-knowledge-bizs-init-features` | `speccrew-task-worker` |
| Phase 3 | `dispatch-to-worker` | `speccrew-pm-requirement-clarify` | `speccrew-task-worker` |
| Phase 4a | `dispatch-to-worker` | `speccrew-pm-requirement-model` | `speccrew-task-worker` |
| Phase 4b | `dispatch-to-worker` | `speccrew-pm-requirement-analysis` | `speccrew-task-worker` |
| Phase 4 (Simple) | `dispatch-to-worker` | `speccrew-pm-requirement-simple` | `speccrew-task-worker` |
| Phase 5 | `dispatch-to-worker` | `speccrew-pm-sub-prd-generate` | `speccrew-task-worker` |

## Invocation Method

**CRITICAL**: This skill is loaded directly by Product Manager Agent — do NOT invoke via Worker Agent.

```xml
<block type="task" action="run-skill" desc="Product Manager orchestration workflow">
  <field name="skill">speccrew-product-manager-orchestration</field>
</block>
```

## Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_requirement` | string | Yes | 用户需求描述或需求文档路径 |
| `workspace_root` | string | Yes | speccrew-workspace 根目录路径 |
| `source_path` | string | No | 项目源代码根目录（从 .speccrewrc 读取） |
| `language` | string | No | 用户语言（默认自动检测） |

## Output

- `status` - 执行状态 (success / partial / failed)
- `prd_files` - 生成的 PRD 文件列表
- `feature_list` - 功能清单文件路径
- `workflow_stage` - 当前工作流阶段状态
- `next_agent` - 下一步建议的 Agent

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

### Orchestrator Principle

This agent is an **orchestrator/dispatcher**. Key constraints:

| Phase | Skill | ORCHESTRATOR Rule |
|-------|-------|-------------------|
| Phase 3 | `speccrew-pm-requirement-clarify` | DO NOT clarify requirements yourself — Dispatch Worker to execute |
| Phase 4a | `speccrew-pm-requirement-model` | DO NOT perform ISA-95 analysis yourself — Dispatch Worker to execute |
| Phase 4a.5 | User Confirmation Gate | MUST stop for user confirmation after module design |
| Phase 4b | `speccrew-pm-requirement-analysis` | DO NOT generate Master PRD yourself — Dispatch Worker to execute |
| Phase 5 | `speccrew-pm-sub-prd-generate` | DO NOT generate Sub-PRD yourself — Dispatch Workers to execute |
| Phase 6 | PM Agent verification | DO NOT modify PRD content — only verify and present |

**UNIVERSAL DISPATCH RULE:**
- PM Agent NEVER invokes Skills directly via `action="run-skill"`
- ALL Skill invocations use `action="dispatch-to-worker"` with `speccrew-task-worker`
- Worker Agent receives the Skill name in context and executes it

**UNIVERSAL ABORT RULE:**
- IF ANY skill fails → STOP and report to user
- DO NOT generate content as fallback
- DO NOT proceed to next phase
