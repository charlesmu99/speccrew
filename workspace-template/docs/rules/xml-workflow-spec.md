# XML Workflow Specification

> This document defines the XML Block workflow format used in SpecCrew skill and agent definitions.
> **MANDATORY**: Any agent or worker that encounters XML `<workflow>` blocks MUST read and understand this specification before execution.

## Execution Model

This is a **Blockly-style sequential workflow definition**:

- Execute blocks **top-to-bottom in document order** within each `<sequence>`
- Each `<block>` is one atomic execution unit — complete it fully before moving to the next
- Do NOT skip, reorder, or selectively execute blocks unless a `<gateway>` directs otherwise
- Nested blocks within a parent block execute in document order

## Block Types

### input

Defines workflow input parameters. MUST be the first block in a workflow.

```xml
<block type="input" id="I1" desc="Workflow input parameters">
  <field name="source_path" required="true" type="string" desc="Source code root directory"/>
  <field name="platform_id" required="true" type="string" desc="Platform identifier, e.g. web-vue"/>
  <field name="output_dir" required="false" type="string" default="${workspace}/output" desc="Output directory"/>
</block>
```

- `required="true"`: Caller MUST provide this parameter
- `default`: Used when `required="false"` and caller omits the value
- Input fields automatically become workflow-scoped variables

### output

Defines workflow output results. MUST be the last block in a workflow.

```xml
<block type="output" id="O1" desc="Workflow output results">
  <field name="matched_modules" from="${matcherResult.matched_modules}" type="array" desc="Matched module list"/>
  <field name="execution_path" from="${executionPath}" type="string" desc="Execution path A or B"/>
</block>
```

- `from`: Reference to the variable containing the output value

### task

Executes an action. The primary execution block.

**Action Types:**

| Action | Purpose | Required Fields |
|--------|---------|-----------------|
| `run-skill` | Invoke a skill | `<field name="skill">` |
| `run-script` | Execute a command | `<field name="command">` |
| `dispatch-to-worker` | Delegate to a worker agent | `<field name="agent">` |
| `analyze` | Perform analysis | Context fields |
| `generate` | Generate content | Output path |
| `read-file` | Read file content | `<field name="path">` |
| `write-file` | Write file content | `<field name="path">`, content |

**Examples:**

```xml
<!-- Run a skill -->
<block type="task" id="B1" action="run-skill" desc="Execute module matcher skill">
  <field name="skill">speccrew-knowledge-module-matcher</field>
  <field name="source_path" value="${source_path}"/>
  <field name="output" var="matcherResult"/>
</block>

<!-- Run a script -->
<block type="task" id="B2" action="run-script" desc="Check knowledge directory">
  <field name="command">node scripts/check-knowledge.js --dir ${knowledgeDir}</field>
  <field name="output" var="checkResult"/>
</block>

<!-- Dispatch to worker -->
<block type="task" id="B3" action="dispatch-to-worker" desc="Dispatch worker for analysis">
  <field name="agent">speccrew-task-worker</field>
  <field name="skill_path">${task.skill_path}/SKILL.md</field>
  <field name="context">{"module": "${task.module}"}</field>
</block>
```

### gateway

Conditional branching and guard checks.

**Modes:**

| Mode | Behavior |
|------|----------|
| `exclusive` | Execute ONLY the first matching `<branch>` |
| `guard` | Continue if `test` passes, otherwise execute `fail-action` |
| `parallel` | Execute ALL branches concurrently |

**Exclusive Gateway:**

```xml
<block type="gateway" id="G1" mode="exclusive" desc="Select execution path">
  <branch test="${knowledgeStatus.exists} == true" name="Incremental Update">
    <block type="task" action="run-skill" desc="Run incremental sync">...</block>
  </branch>
  <branch test="${knowledgeStatus.exists} == false" name="Full Init">
    <block type="task" action="run-skill" desc="Run full initialization">...</block>
  </branch>
  <branch default="true" name="Fallback">
    <block type="event" action="log" level="error">Unknown state</block>
  </branch>
</block>
```

**Guard Gateway:**

```xml
<block type="gateway" id="G2" mode="guard" 
        test="${matcherResult.matched_modules.length} > 0"
        fail-action="stop" 
        desc="Validate at least one module matched">
  <field name="message">No modules matched. Check source path and platform config.</field>
</block>
```

- `fail-action`: `stop` | `retry` | `skip` | `fallback`

**Parallel Gateway:**

```xml
<block type="gateway" id="G3" mode="parallel" desc="Execute all branches concurrently">
  <branch name="Analyze users">
    <block type="task" action="dispatch-to-worker">...</block>
  </branch>
  <branch name="Analyze orders">
    <block type="task" action="dispatch-to-worker">...</block>
  </branch>
</block>
```

### loop

Iterate over a collection.

```xml
<block type="loop" id="L1" over="${tasks}" as="task" 
        parallel="true" max-concurrency="5"
        desc="Process each task">
  <block type="task" action="dispatch-to-worker" desc="Dispatch worker for ${task.name}">
    <field name="agent">speccrew-task-worker</field>
    <field name="skill_path">${task.skill_path}/SKILL.md</field>
  </block>
</block>
```

- `over`: Collection variable to iterate (e.g., `${tasks}`)
- `as`: Variable name for current item (e.g., `task` → use as `${task}`)
- `parallel="true"`: Execute all iterations concurrently
- `max-concurrency`: Limit concurrent executions

### event

Logging, confirmation, and signaling.

```xml
<!-- Log event -->
<block type="event" action="log" level="info" desc="Log progress">
  Processing ${tasks.length} tasks
</block>

<!-- Confirm event (pauses for user input) -->
<block type="event" action="confirm" title="Confirm modules" type="yesno" desc="Wait for user confirmation">
  <field name="preview">Matched ${matcherResult.matched_modules.length} modules. Continue?</field>
  <on-confirm>
    <field name="confirmed" value="true"/>
  </on-confirm>
  <on-cancel>
    <field name="workflow.status" value="cancelled"/>
  </on-cancel>
</block>
```

- `action`: `log` | `confirm` | `signal`
- `level` (for log): `debug` | `info` | `warn` | `error`

### error-handler

Try/catch/finally error handling.

```xml
<block type="error-handler" id="EH1" desc="Handle worker dispatch errors">
  <try>
    <block type="loop" over="${tasks}" as="task">
      <block type="task" action="dispatch-to-worker">...</block>
    </block>
  </try>
  <catch error-type="timeout">
    <block type="event" action="log" level="error">Timeout: ${error.taskId}</block>
  </catch>
  <catch>
    <block type="event" action="log" level="error">Unexpected: ${error.message}</block>
  </catch>
  <finally>
    <block type="event" action="log" level="info">Batch completed</block>
  </finally>
</block>
```

### checkpoint

Persist progress milestone. Supports resume-from-checkpoint.

```xml
<block type="checkpoint" id="CP1" name="matcher_completed" desc="Module matching done">
  <field name="file" value="${progressFile}"/>
  <field name="verify" value="${matcherResult.matched_modules.length} > 0"/>
</block>
```

- `name`: Unique checkpoint identifier for the progress file
- `verify`: Condition to evaluate; if true, checkpoint is marked as `passed`
- During resume, skip all blocks until the first non-passed checkpoint

### rule

Declare constraints. NOT an action block — these are enforced continuously.

**Levels:**

| Level | Meaning |
|-------|---------|
| `forbidden` | MUST NOT do this. Violation causes immediate stop. |
| `mandatory` | MUST do this. Required for correctness. |
| `note` | Guidance hint. Recommended but not enforced. |

```xml
<!-- FORBIDDEN rules -->
<block type="rule" id="R1" level="forbidden" desc="Phase 4 constraints">
  <field name="text">DO NOT generate Sub-PRDs yourself — MUST dispatch Workers</field>
  <field name="text">DO NOT use create_file to manually create progress JSON</field>
  <field name="text">DO NOT fabricate timestamps — let scripts generate them</field>
</block>

<!-- MANDATORY rules -->
<block type="rule" id="R2" level="mandatory" desc="Execution sequence gate">
  <field name="text">MUST execute B2→B3→B4→B5 in order, no skipping</field>
</block>
```

**Placement**: Put `<rule>` blocks directly before the steps they govern. This ensures the LLM "sees" the constraint when executing those steps.

## Variable References

Use `${variable_name}` syntax throughout block attributes and content.

```xml
<!-- Simple variable -->
<field name="platform" value="${platform_id}"/>

<!-- Object property -->
<field name="count" value="${matcherResult.matched_modules.length}"/>

<!-- Array index -->
<field name="first" value="${matcherResult.matched_modules[0].name}"/>
```

**Built-in Variables:**

| Variable | Description |
|----------|-------------|
| `${workspace}` | Workspace root directory |
| `${platform}` | Current platform identifier |
| `${timestamp}` | Current ISO timestamp |
| `${workflow.id}` | Current workflow ID |
| `${workflow.status}` | Current workflow status |

## Common Patterns

### Sequential Pipeline

```xml
<workflow id="pipeline" status="pending">
  <block type="input" id="I1">...</block>
  <sequence id="S1">
    <block type="task" id="B1" action="run-skill">...</block>
    <block type="task" id="B2" action="run-script">...</block>
    <block type="task" id="B3" action="dispatch-to-worker">...</block>
  </sequence>
  <block type="output" id="O1">...</block>
</workflow>
```

### Conditional Branching

```xml
<block type="gateway" mode="exclusive" desc="Route based on result">
  <branch test="${result.count} > 10" name="Many items">
    <block type="task" action="run-skill" desc="Batch process">...</block>
  </branch>
  <branch default="true" name="Few items">
    <block type="task" action="run-skill" desc="Single process">...</block>
  </branch>
</block>
```

### Parallel Worker Dispatch

```xml
<block type="loop" over="${modules}" as="module" parallel="true" max-concurrency="5">
  <block type="task" action="dispatch-to-worker" desc="Analyze ${module.name}">
    <field name="agent">speccrew-analyzer</field>
    <field name="context">{"module": "${module.name}"}</field>
  </block>
</block>
```

### Error Recovery

```xml
<block type="error-handler" desc="Robust processing">
  <try>
    <block type="task" action="run-skill" desc="Primary operation">...</block>
  </try>
  <catch error-type="timeout">
    <block type="task" action="run-skill" desc="Fallback operation">...</block>
  </catch>
  <finally>
    <block type="checkpoint" name="done" desc="Mark complete">...</block>
  </finally>
</block>
```

## Execution Rules

1. **NEVER skip a block** — execute every block in document order
2. **Read `rule` blocks as constraints** — check them continuously during execution
3. **`checkpoint` blocks** = persist progress before continuing
4. **`gateway mode="exclusive"`** = only execute the first matching branch
5. **`loop parallel="true"`** = dispatch all iterations concurrently
6. **`rule level="forbidden"`** = immediate stop if violated
7. **Input/Output blocks** define the contract — respect required parameters
