---
name: speccrew-product-manager-orchestration
version: 2.0.0
description: Product Manager core orchestration skill (pure routing layer v2.0), responsible for workflow resume routing and dispatch-to-worker scheduling for each Phase Skill. All business logic is executed by independent Phase Skills.
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

> ⚠️ **CRITICAL ENFORCEMENT**: Every orchestration workflow execution MUST include block-by-block announcements. If you find yourself dispatching Workers without announcing each Phase block, STOP and correct your execution. This protocol is mandatory and non-negotiable.
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

Pure routing layer orchestration skill, responsible for:

1. **Workflow Initialization** - Phase 0 initialization and returning resume target
2. **Resume Routing** - Jump to the correct Phase based on `resume_target`
3. **Phase Dispatch** - Each Phase has only one `dispatch-to-worker` call
4. **User Confirmation Gates** - Mandatory user confirmation gates for Phase 3 and Phase 4a

## Architecture: Pure Routing Layer

This Skill is a **pure routing layer**, all business logic is executed by independent Phase Skills:

| Phase | Block ID | Skill | Purpose |
|-------|----------|-------|---------|
| Phase 0 | P0 | `speccrew-pm-phase0-init` | Workflow initialization, iteration directory creation/locating, resume state detection |
| Phase 1 | P1 | `speccrew-pm-phase1-knowledge-check` | Knowledge base status detection, module matching, knowledge initialization |
| Phase 2 | P2 | `speccrew-pm-phase2-complexity-assess` | Complexity assessment, simple/complex path decision |
| Phase 3 | P3 | `speccrew-pm-requirement-clarify` | Requirement clarification, Q&A collection |
| Phase 4 Simple | P4-SIMPLE | `speccrew-pm-requirement-simple` | Simple requirements: single PRD generation |
| Phase 4a | P4A | `speccrew-pm-requirement-model` | Complex requirements: ISA-95 modeling |
| Phase 4b | P4B | `speccrew-pm-requirement-analysis` | Complex requirements: Master PRD generation |
| Phase 5 | P5 | `speccrew-pm-phase5-subprd-dispatch` | Sub-PRD Worker dispatch |
| Phase 6 | P6 | `speccrew-pm-phase6-verify-confirm` | Verification checklist, user review, final confirmation |

## User Confirmation Gates (MANDATORY)

There are **mandatory user confirmation gates** after Phase 3 and Phase 4a:

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
- `action="user-confirm"` — Must wait for explicit user confirmation
- `skippable="false"` — Cannot be skipped
- Checkpoint write **MUST** be executed after user confirmation

## Resume Router

Phase 0 outputs `resume_target` to control resume routing:

| resume_target | Target Block | Description |
|---------------|--------------|-------------|
| `PHASE_1_KNOWLEDGE_CHECK` | P1 | Start from knowledge base check |
| `PHASE_3_USER_CONFIRMATION` | P3-CONFIRM | Resume to Phase 3 confirmation gate |
| `PHASE_4_PRD_SIMPLE` | P4-SIMPLE | Simple path PRD generation |
| `PHASE_4A_MODEL` | P4A | Complex path modeling |
| `PHASE_4A_CONFIRMATION` | P4A-CONFIRM | Resume to Phase 4a confirmation gate |
| `PHASE_4B_PRD_GENERATION` | P4B | Master PRD generation |
| `PHASE_5_SUBPRD_DISPATCH` | P5 | Sub-PRD dispatch |
| `PHASE_6_VERIFICATION` | P6 | Verification and confirmation |

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
| `user_requirement` | string | Yes | User requirement description or requirement document path |
| `workspace_root` | string | Yes | speccrew-workspace root directory path |
| `source_path` | string | No | Project source code root directory (read from .speccrewrc) |
| `language` | string | No | User language (default auto-detect) |

## Output

- `status` - Execution status (success / partial / failed)
- `prd_files` - List of generated PRD files
- `feature_list` - Feature list file path
- `workflow_stage` - Current workflow stage status
- `next_agent` - Recommended next Agent

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
