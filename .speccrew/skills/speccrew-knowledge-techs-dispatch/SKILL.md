---
name: speccrew-knowledge-techs-dispatch
description: Dispatch techs knowledge base generation tasks with 3-stage pipeline (XML Block version). Handles platform detection, tech document generation, and root index creation.
tools: Read, Write, Task, Bash
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
> - `action="run-script"` → Execute via **Terminal tool** (pass the `<field name="command">` value EXACTLY)
> - `action="run-skill"` → Invoke via **Skill tool** (pass the `<field name="skill">` value EXACTLY)
> - `action="dispatch-to-worker"` → Create **Task** via **Task tool** for `speccrew-task-worker` (Worker loads and executes the skill, NOT you)
> - `action="confirm"` (event) → Present to user and wait for response
>
> **Step 3**: Execute ALL stages sequentially without pausing (only stop at explicit `<event action="confirm">` blocks)
>
> **FORBIDDEN**:
> - Do NOT skip the block announcement format above — every block must be announced before execution
> - Do NOT run terminal commands as substitute for Skill tool calls
> - Do NOT do Worker's job yourself — when `action="dispatch-to-worker"`, create a Task and let Worker handle it
> - Do NOT skip blocks or improvise your own commands
> - Do NOT read a skill's SKILL.md file yourself — use the Skill tool which resolves paths automatically

# Techs Knowledge Dispatch (XML Block Version)

Orchestrate **techs knowledge base generation** with a 3-stage pipeline using **XML Block system**: Platform Detection → Tech Doc Generation → Root Index.

## Invocation Method

**CRITICAL**: This skill is an **orchestration playbook** — it MUST be loaded directly by Team Leader via Skill tool (NOT via Worker Agent).

```
Correct: Leader uses Skill tool to load this playbook directly
Incorrect: Dispatch this skill to speccrew-task-worker
```

**Why?** This skill defines the orchestration workflow and prepares task plans for downstream workers. The Team Leader reads this playbook and dispatches individual worker tasks via Task tool → speccrew-task-worker for each stage.

**Correct Invocation Pattern**:
```xml
<block type="task" action="run-skill" desc="Leader directly invokes techs-dispatch as orchestration playbook">
  <field name="skill">speccrew-knowledge-techs-dispatch</field>
  <field name="note">Leader directly calls this dispatch skill as an orchestration playbook. The dispatch skill defines the workflow; Leader dispatches downstream workers via Task tool → speccrew-task-worker for each stage.</field>
</block>
```

**Worker Dispatch Rule**:
- Dispatch skills (bizs-dispatch, techs-dispatch): Leader calls directly via Skill tool
- Downstream worker skills (techs-init, techs-generate-conventions, techs-generate-ui-style, etc.): Leader dispatches via Task tool → speccrew-task-worker

**FORBIDDEN**: Worker Agents MUST NOT execute this dispatch skill. If a Worker Agent loads this skill, it must report error and abort.

## Quick Reference — Execution Flow

```
Stage 1: Platform Detection
  └─ Read techs-manifest.json → Identify platforms & tech stacks
        ↓
Stage 2: Tech Doc Generation (PARALLEL)
  └─ Prepare task plans for techs-generate workers per platform
  └─ After generate workers complete → prepare quality check worker task plans
  └─ Monitor completion markers
        ↓
Stage 2.5: Completion Verification
  └─ Step A: Scan completion markers
  └─ Step B: Verify output integrity
  └─ Step C: Update progress status
        ↓
Stage 3: Root Index Generation
  └─ Generate techs/README.md root index
  └─ Cross-platform consistency check
```

> **NOTE**: All worker dispatch operations are handled by the calling Agent (Team Leader). This Skill only prepares task plans and monitors completion markers.

## Language Adaptation

**CRITICAL**: All generated documents must match the user's language. Detect the language from the user's input and pass it to all downstream Worker Agents.

- User writes in 中文 → Generate Chinese documents, pass `language: "zh"` to workers
- User writes in English → Generate English documents, pass `language: "en"` to workers
- User writes in other languages → Use appropriate language code

**All downstream skills must receive the `language` parameter and generate content in that language only.**

## Trigger Scenarios

- "Initialize techs knowledge base"
- "Generate technology knowledge from source code"
- "Dispatch techs knowledge generation"

## User

Leader Agent (speccrew-team-leader)

## Platform Naming Convention

Read `speccrew-workspace/docs/configs/platform-mapping.json` for standardized platform mapping rules.

| Concept | techs-init (techs-manifest.json) | Example (UniApp) |
|---------|----------------------------------|------------------|
| **Category** | `platform_type` | `mobile` |
| **Technology** | `framework` | `uniapp` |
| **Identifier** | `platform_id` | `mobile-uniapp` |

## Input

| Variable | Description | Default |
|----------|-------------|---------|
| `source_path` | Source code root path | project root |
| `language` | User's language code (e.g., "zh", "en") | **REQUIRED** |

## Output

- Platform manifest: `speccrew-workspace/knowledges/base/sync-state/knowledge-techs/techs-manifest.json`
- Tech docs: `speccrew-workspace/knowledges/techs/{platform_id}/`
- Root index: `speccrew-workspace/knowledges/techs/INDEX.md`
- Status files: `speccrew-workspace/knowledges/base/sync-state/knowledge-techs/stage{N}-status.json`

---

## AgentFlow Definition

<!-- @agentflow: workflow.agentflow.xml -->

> **REQUIRED**: Before executing this workflow, read the XML workflow specification: `speccrew-workspace/docs/rules/agentflow-spec.md`
>
> After reading the specification, parse the XML workflow below and **strictly execute each `<block>` in document order**. Every `<block type="task">` is a literal tool-call instruction — use the `action` attribute to determine which IDE tool to invoke, and pass the `<field name="command">` or `<field name="skill">` value **exactly as written**. Do NOT interpret the workflow as a goal description or improvise your own approach.



---

## Appendix: Reference

### Worker Completion Marker Format

Each Worker MUST create a completion marker file after generating documents.

#### Conventions Worker Done File

**File**: `{completed_dir}/{platform_id}.done-conventions.json`

**Format**:
```json
{
  "platform_id": "web-vue",
  "worker_type": "conventions",
  "status": "completed",
  "documents_generated": [
    "INDEX.md", "tech-stack.md", "architecture.md",
    "conventions-dev.md", "conventions-design.md",
    "conventions-unit-test.md", "conventions-build.md"
  ],
  "analysis_file": "web-vue.analysis-conventions.json",
  "completed_at": "2024-01-15T10:45:00Z"
}
```

#### UI-Style Worker Done File

**File**: `{completed_dir}/{platform_id}.done-ui-style.json`

**Format**:
```json
{
  "platform_id": "web-vue",
  "worker_type": "ui-style",
  "status": "completed",
  "ui_analysis_level": "full",
  "documents_generated": [
    "ui-style/ui-style-guide.md"
  ],
  "analysis_file": "web-vue.analysis-ui-style.json",
  "completed_at": "2024-01-15T10:45:00Z"
}
```

**Status values**:
- `completed` — All required documents generated successfully
- `failed` — Critical failure, required documents not generated

If a Worker encounters a fatal error, it should still attempt to create the done file with `status: "failed"` and include error details in an `"error"` field.

#### Quality Worker Done File

**File**: `{completed_dir}/{platform_id}.quality-done.json`

**Format**:
```json
{
  "platform_id": "web-vue",
  "worker_type": "quality",
  "status": "completed",
  "quality_score": 85,
  "issues_found": 2,
  "completed_at": "2024-01-15T11:00:00Z"
}
```

---

### Platform Status Tracking Fields

Each platform entry in techs-manifest.json includes status tracking fields for monitoring the analysis pipeline progress:

| Field | Type | Values | Description |
|-------|------|--------|-------------|
| `status` | string | `pending` / `processing` / `completed` / `partial` / `failed` | Current analysis status |
| `startedAt` | string \| null | ISO 8601 timestamp | When the Worker started analyzing this platform |
| `completedAt` | string \| null | ISO 8601 timestamp | When the Worker finished analyzing this platform |
| `analysisLevel` | string \| null | `full` / `minimal` / `reference_only` | Depth of analysis achieved |
| `topicsCoverage` | number \| null | 0-100 | Percentage of domain topics covered (from analysis.json) |
| `workers` | object | See below | Per-worker status tracking |

**Workers Object Structure:**
```json
{
  "platform_id": "web-vue",
  "status": "completed",
  "workers": {
    "conventions": {
      "status": "completed",
      "skill": "speccrew-knowledge-techs-generate-conventions",
      "done_file": "web-vue.done-conventions.json"
    },
    "ui_style": {
      "status": "completed",
      "skill": "speccrew-knowledge-techs-generate-ui-style",
      "done_file": "web-vue.done-ui-style.json"
    }
  }
}
```

For backend platforms, `ui_style.status` is set to `"skipped"`.

**Status Lifecycle:**
```
pending → processing → completed
                    → partial (conventions OK, ui-style failed)
                    → failed
```

---

### Output per Platform

```
speccrew-workspace/knowledges/techs/{platform_id}/
├── INDEX.md                    # Required
├── tech-stack.md              # Required
├── architecture.md            # Required
├── conventions-design.md      # Required
├── conventions-dev.md         # Required
├── conventions-unit-test.md        # Required
├── conventions-system-test.md      # Required
├── conventions-build.md       # Required
├── conventions-data.md        # Optional — platform-specific
└── ui-style/                  # Optional — frontend only (web/mobile/desktop)
    ├── ui-style-guide.md      # Generated by techs Stage 2
    ├── page-types/            # Populated by bizs pipeline Stage 3.5 (ui-style-extract)
    ├── components/            # Populated by bizs pipeline Stage 3.5 (ui-style-extract)
    ├── layouts/               # Populated by bizs pipeline Stage 3.5 (ui-style-extract)
    └── styles/                # Generated by techs Stage 2
```

**Cross-Pipeline Note for `ui-style/`**:
- `ui-style-guide.md` and `styles/` are generated by techs pipeline Stage 2 (technical framework-level style specs)
- `page-types/`, `components/`, and `layouts/` are populated by bizs pipeline Stage 3.5 (`speccrew-knowledge-bizs-ui-style-extract` skill), which aggregates patterns from analyzed feature documents
- These two sources are complementary: techs provides framework-level conventions, bizs adds real-page-derived design patterns
- If bizs pipeline has not been executed, these three subdirectories will be empty

**Optional file `conventions-data.md` rules**:

| Platform Type | Required? | Notes |
|----------|-----------|-------|
| `backend` | Required | ORM specs, data modeling, caching |
| `web` | Depends | Only if using ORM/data layer (Prisma, TypeORM, etc.) |
| `mobile` | Optional | Based on tech stack |
| `desktop` | Optional | Based on tech stack |

---

### Error Handling

#### Error Handling Strategy

```
ON Worker Failure:
  1. Capture error message from worker_result.error
  2. Mark platform status as "failed" in stage2-status.json
  3. Record failed platform_id and error details
  4. Continue processing other platforms (no retry, fail fast)
  5. After all workers complete, evaluate overall status:
     - IF all platforms failed → ABORT pipeline
     - IF some platforms succeeded → CONTINUE to Stage 3 with successful platforms only
```

#### Stage-Level Failure Handling

| Stage | Failure Handling |
|-------|-----------------|
| Stage 1 | Abort pipeline, report error |
| Stage 2 | Continue with successful platforms, report failed ones |
| Stage 2.5 | Continue pipeline, report warnings |
| Stage 3 | Abort if Stage 2 had critical failures |

#### Worker Failure Details

**When a Worker Agent fails:**
- **No automatic retry**: Worker failures are recorded as-is
- **Partial success accepted**: Pipeline continues if at least one platform succeeds
- **Error propagation**: Failed platform details are included in stage2-status.json
- **Stage 3 decision**: Only platforms with status "complete" are included in root INDEX.md

---

### Checklist

- [ ] Stage 1: Platform manifest generated with techs-manifest.json
- [ ] Stage 2: All platforms processed in parallel
- [ ] Stage 2: `stage2-status.json` generated with all platform results
- [ ] Stage 3: Root INDEX.md generated with Agent mapping
- [ ] Stage 3: `stage3-status.json` generated with index info

#### Document Completeness Verification
- [ ] Each platform directory contains required documents: INDEX.md, tech-stack.md, architecture.md, conventions-design.md, conventions-dev.md, conventions-unit-test.md, conventions-system-test.md, conventions-build.md
- [ ] `conventions-data.md` exists only for appropriate platforms (backend required, others optional)
- [ ] All documents include file reference blocks (pure Markdown format for VS Code preview compatibility)
- [ ] All documents include AI-TAG and AI-CONTEXT comments
- [ ] techs/INDEX.md links only to existing documents
