---
name: speccrew-product-manager-orchestration
version: 2.0.0
description: Product Manager 核心编排技能（纯路由层 v2.0），负责工作流恢复路由和各 Phase Skill 的 dispatch-to-worker 调度。所有业务逻辑由独立的 Phase Skill 执行。
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
> - `action="user-confirm"` → Present to user and wait for EXPLICIT confirmation (NON-SKIPPABLE)
>
> **CRITICAL DISPATCH RULE:**
> - PM Agent (Team Leader) MUST NOT execute Skills directly
> - ALL Skill executions MUST go through `dispatch-to-worker` action
> - Worker Agent (`speccrew-task-worker`) receives the Skill name and context, then executes the Skill
>
> **Step 3**: Execute ALL blocks sequentially without pausing (only stop at explicit `<event action="user-confirm">` blocks)

# Product Manager Orchestration (v2.0)

纯路由层编排技能，负责：

1. **Workflow Initialization** - Phase 0 初始化并返回恢复目标
2. **Resume Routing** - 根据 `resume_target` 跳转到正确的 Phase
3. **Phase Dispatch** - 每个 Phase 只有一个 `dispatch-to-worker` 调用
4. **User Confirmation Gates** - Phase 3 和 Phase 4a 的强制性用户确认门禁

## Architecture: Pure Routing Layer

本 Skill 是**纯路由层**，所有业务逻辑由独立的 Phase Skill 执行：

| Phase | Block ID | Skill | Purpose |
|-------|----------|-------|---------|
| Phase 0 | P0 | `speccrew-pm-phase0-init` | 工作流初始化、迭代目录创建/定位、恢复状态检测 |
| Phase 1 | P1 | `speccrew-pm-phase1-knowledge-check` | 知识库状态检测、模块匹配、知识初始化 |
| Phase 2 | P2 | `speccrew-pm-phase2-complexity-assess` | 复杂度评估、简单/复杂路径决策 |
| Phase 3 | P3 | `speccrew-pm-requirement-clarify` | 需求澄清、问答收集 |
| Phase 4 Simple | P4-SIMPLE | `speccrew-pm-requirement-simple` | 简单需求：单 PRD 生成 |
| Phase 4a | P4A | `speccrew-pm-requirement-model` | 复杂需求：ISA-95 建模 |
| Phase 4b | P4B | `speccrew-pm-requirement-analysis` | 复杂需求：Master PRD 生成 |
| Phase 5 | P5 | `speccrew-pm-phase5-subprd-dispatch` | Sub-PRD Worker 分发 |
| Phase 6 | P6 | `speccrew-pm-phase6-verify-confirm` | 验证清单、用户审核、最终确认 |

## User Confirmation Gates (MANDATORY)

Phase 3 和 Phase 4a 之后有**强制性用户确认门禁**：

### R-CONFIRM Rule Block

```xml
<block type="rule" id="R-CONFIRM" level="mandatory" desc="User confirmation is MANDATORY">
  <field name="text">MANDATORY: After each phase completes, you MUST wait for EXPLICIT user confirmation.</field>
  <field name="text">DO NOT mark checkpoint as passed by yourself. DO NOT skip user confirmation.</field>
  <field name="text">The checkpoint write-checkpoint command MUST ONLY be executed AFTER user confirms.</field>
</block>
```

### user-confirm Event Block

```xml
<block type="event" id="P3-CONFIRM" action="user-confirm" desc="User confirmation required">
  <field name="prompt">📋 Phase Complete. Please review and confirm.</field>
  <field name="skippable" value="false"/>
</block>
```

**Key Points:**
- `action="user-confirm"` — 必须等待用户明确确认
- `skippable="false"` — 不可跳过
- checkpoint 写入**必须**在用户确认后执行

## Resume Router

Phase 0 输出 `resume_target` 控制恢复跳转：

| resume_target | Target Block | Description |
|---------------|--------------|-------------|
| `PHASE_1_KNOWLEDGE_CHECK` | P1 | 从知识库检查开始 |
| `PHASE_3_USER_CONFIRMATION` | P3-CONFIRM | 恢复到 Phase 3 确认门禁 |
| `PHASE_4_PRD_SIMPLE` | P4-SIMPLE | 简单路径 PRD 生成 |
| `PHASE_4A_MODEL` | P4A | 复杂路径建模 |
| `PHASE_4A_CONFIRMATION` | P4A-CONFIRM | 恢复到 Phase 4a 确认门禁 |
| `PHASE_4B_PRD_GENERATION` | P4B | Master PRD 生成 |
| `PHASE_5_SUBPRD_DISPATCH` | P5 | Sub-PRD 分发 |
| `PHASE_6_VERIFICATION` | P6 | 验证确认 |

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

1. **User Confirmation Gates** — `action="user-confirm"` blocks (Phase 3, Phase 4a)
2. Ambiguous requirements that genuinely need clarification
3. Unrecoverable errors that prevent further progress
4. Security-sensitive operations (e.g., deleting existing files)

### Orchestrator Principle (v2.0)

This agent is a **pure router/dispatcher**. Key constraints:

| Phase | Skill | ORCHESTRATOR Rule |
|-------|-------|-------------------|
| Phase 0 | `speccrew-pm-phase0-init` | Route to correct Phase based on resume_target |
| Phase 1-6 | All Phase Skills | DO NOT execute logic yourself — Dispatch Worker |

**UNIVERSAL DISPATCH RULE:**
- PM Agent NEVER invokes Skills directly via `action="run-skill"`
- ALL Skill invocations use `action="dispatch-to-worker"` with `speccrew-task-worker`
- Worker Agent receives the Skill name in context and executes it

**UNIVERSAL ABORT RULE:**
- IF ANY skill fails → STOP and report to user
- DO NOT generate content as fallback
- DO NOT proceed to next phase
