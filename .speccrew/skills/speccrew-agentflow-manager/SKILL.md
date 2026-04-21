---
name: speccrew-agentflow-manager
version: 1.0.0
description: AgentFlow definition management - create, validate, and refine AgentFlow XML files
tools: Read, Write, Task, Bash
---

> **⚠️ MANDATORY EXECUTION PROTOCOL — READ BEFORE EXECUTING ANY BLOCK**
>
> **Step 1**: Load XML workflow specification: `${workspace_path}/docs/rules/agentflow-spec.md` — this defines all block types and action-to-tool mappings
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
> - `action="read-file"` → Read via **Read tool**
> - `action="create-file"` → Create via **Write tool** (create_file)
> - `action="edit-file"` → Edit via **Edit tool** (search_replace)
> - `action="analyze"` → Perform analysis directly
> - `action="generate"` → Generate content directly
> - `action="report"` → Format and output report
>
> **Step 3**: Execute ALL blocks sequentially without pausing (only stop at explicit `<event action="confirm">` blocks)
>
> **FORBIDDEN**:
> - Do NOT skip the block announcement format above — every block must be announced before execution
> - Do NOT run terminal commands as substitute for Skill tool calls
> - Do NOT skip blocks or improvise your own commands

# AgentFlow Manager

Manage AgentFlow XML workflow definitions with three operation modes: **create**, **validate**, and **refine**.

## Operation Modes

| Mode | Description | Required Parameters |
|------|-------------|---------------------|
| `create` | Create new AgentFlow from natural language SOP | `description`, `parameters`, `skill_dir` |
| `validate` | Validate existing .agentflow.xml file | `target_file` |
| `refine` | Auto-fix validation errors in existing file | `target_file` |

## Invocation Method

**CRITICAL**: This skill is a **utility skill** — it MUST be loaded directly via Skill tool.

```xml
<block type="task" action="run-skill" desc="Invoke AgentFlow manager">
  <field name="skill">speccrew-agentflow-manager</field>
  <field name="mode">create</field>
  <field name="description">Analyze source code and generate documentation</field>
  <field name="parameters">["source_path", "output_dir"]</field>
  <field name="skill_dir">/path/to/new-skill</field>
  <field name="workspace_path">/path/to/workspace</field>
</block>
```

## Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `mode` | string | Yes | Operation mode: `create`, `validate`, or `refine` |
| `description` | string | (create) | Natural language SOP description |
| `parameters` | array | (create) | Input parameter names (JSON array) |
| `target_file` | string | (validate/refine) | Path to .agentflow.xml file to validate/refine |
| `skill_dir` | string | (create) | Target skill directory path for new AgentFlow |
| `workspace_path` | string | Yes | Current workspace path |

## Output

- **create mode**: Generated `SKILL.xml` and `SKILL.md` skeleton
- **validate mode**: Validation report with errors and warnings
- **refine mode**: Fixed file path and fix summary

---

## AgentFlow Definition

<!-- @agentflow: SKILL.xml -->

---

## Appendix: Reference

### Block Type Quick Reference

| Block Type | Purpose | Required Attributes |
|------------|---------|---------------------|
| `input` | Define workflow inputs | Must be first block |
| `output` | Define workflow outputs | Must be last block |
| `task` | Execute an action | `action` attribute required |
| `gateway` | Conditional branching | `mode` attribute required |
| `loop` | Iterate over collection | `over`, `as` attributes required |
| `checkpoint` | Persist progress | `name` attribute required |
| `rule` | Declare constraints | `level` attribute required |
| `event` | Logging/confirmation | `action` attribute required |
| `error-handler` | Error handling | `try`, `catch` sub-elements |

### Action Types

| Action | IDE Tool | Usage |
|--------|----------|-------|
| `run-skill` | Skill tool | Invoke another skill |
| `run-script` | Terminal tool | Execute command/script |
| `read-file` | Read tool | Read file content |
| `create-file` | Write tool | Create new file |
| `edit-file` | Edit tool | Modify existing file |
| `analyze` | Direct execution | Perform analysis |
| `generate` | Direct execution | Generate content |
| `report` | Direct execution | Format and output report |
| `dispatch-to-worker` | Task tool | Create task for worker |

### Variable Reference Syntax

```xml
<!-- Simple variable -->
<field name="path" value="${skill_dir}/SKILL.xml"/>

<!-- Object property -->
<field name="count" value="${validation_result.errors.length}"/>

<!-- Array index -->
<field name="first" value="${parameters[0]}"/>

<!-- In condition -->
<case condition="${mode} == 'create'" next="B1"/>
```

### Checkpoint Verification

```xml
<block type="checkpoint" id="CP1" name="workflow_created" desc="Verify file was created">
  <field name="file" value="${skill_dir}/SKILL.xml"/>
  <field name="verify" value="file_exists(${skill_dir}/SKILL.xml)"/>
</block>
```

---

## Checklist

- [ ] XML declaration present: `<?xml version="1.0" encoding="UTF-8"?>`
- [ ] `<workflow>` root element with id, status, version attributes
- [ ] `<block type="input">` as first block with all required parameters
- [ ] `<block type="output">` as last block with result definitions
- [ ] All block IDs are unique (B1, B2, G1, etc.)
- [ ] All `next` references point to valid block IDs
- [ ] All variable references use `${}` syntax
- [ ] All required fields have `required="true"` attribute
- [ ] Gateway conditions are valid and cover all cases
- [ ] Checkpoint verification conditions are valid

> **MANDATORY**: All generated AgentFlow XML must strictly comply with the specification in `${workspace_path}/docs/rules/agentflow-spec.md`.

<!-- @agentflow: SKILL.xml -->
