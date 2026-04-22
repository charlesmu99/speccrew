# AgentFlow Specification

> This document defines the AgentFlow XML Block workflow format used in SpecCrew skill and agent definitions.
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
    <block type="event" action="log" level="error">
        <field name="message">Unknown state</field>
      </block>
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
  <field name="message">Processing ${tasks.length} tasks</field>
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

#### User-Confirm Event Execution Rules (MANDATORY)

When a Worker encounters `<block type="event" action="user-confirm">`:

1. **MUST pause execution** — Stop all processing and present the prompt to the user
2. **CANNOT be skipped or auto-confirmed** — Even if Worker considers the scenario "automated"
3. **Applies to ALL execution modes** — Including dispatch-to-worker, batch processing, and automated scenarios
4. **`skippable="false"` is absolute** — When set, no bypass mechanism is permitted under any circumstances
5. **Variable preservation** — Before pausing, ensure all workflow variables are properly set for resumption

`user-confirm` events represent **explicit user interaction gates** in the workflow. They exist to ensure human oversight at critical decision points and MUST NOT be optimized away.

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
    <block type="event" action="log" level="error">
        <field name="message">Timeout: ${error.taskId}</field>
      </block>
  </catch>
  <catch>
    <block type="event" action="log" level="error">
        <field name="message">Unexpected: ${error.message}</field>
      </block>
  </catch>
  <finally>
    <block type="event" action="log" level="info">
        <field name="message">Batch completed</field>
      </block>
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

## Dispatch Skill Execution Model

Dispatch skills (naming pattern: `*-dispatch-xml`) are **orchestration playbooks** loaded directly by Team Leader via the Skill tool. They contain the complete multi-stage workflow definition.

### Execution Protocol

When Team Leader loads a dispatch skill via `action="run-skill"`:

1. **Load**: Team Leader invokes the Skill tool with the dispatch skill name (e.g., `speccrew-knowledge-bizs-dispatch-xml`)
2. **Parse**: Read and understand the complete AgentFlow XML workflow in the loaded SKILL.md
3. **Execute block-by-block**: Walk through each Stage's blocks in document order, mapping each `action` attribute to the correct IDE tool:

| Block Action | What Team Leader MUST Do |
|---|---|
| `action="run-script"` | Execute the command via **Terminal tool** (PowerShell/Bash) |
| `action="run-skill"` | Invoke the skill via **Skill tool** — do NOT manually read SKILL.md files |
| `action="dispatch-to-worker"` | Create Task via **Task tool**, assign to `speccrew-task-worker` |
| `action="analyze"` | Perform analysis directly (read files, extract info) |
| `action="generate"` | Generate content directly (use templates, write output) |
| `action="confirm"` (event) | Present confirmation to user, wait for response |

4. **Respect control flow**: Honor `<gateway>` branches, `<loop parallel="true">` concurrency, and `<checkpoint>` verification
5. **Continuous execution**: Proceed from Stage N to Stage N+1 automatically — ONLY pause at explicit `<event action="confirm">` blocks

### FORBIDDEN During Dispatch Execution

- **NEVER** execute commands manually when a block says `action="run-skill"` — use the Skill tool
- **NEVER** do a worker's job yourself when a block says `action="dispatch-to-worker"` — use the Task tool
- **NEVER** skip stages or blocks
- **NEVER** pause between stages to ask "Should I continue?"
- **NEVER** improvise your own approach — follow the XML blocks exactly

## Action to IDE Tool Mapping

When executing `<block type="task">` blocks, the `action` attribute determines which **IDE tool** to invoke. Do NOT interpret actions freely — use the exact tool specified below:

| Action | IDE Tool to Use | How to Invoke |
|--------|----------------|---------------|
| `run-skill` | **Skill tool** | Call the IDE Skill tool with the skill name from `<field name="skill">`. Do NOT manually browse directories or read SKILL.md files — the Skill tool resolves paths automatically. |
| `dispatch-to-worker` | **Task tool** | Create a new Task via the IDE Task tool, assigning it to the worker agent specified in `<field name="agent">`. Pass all context fields as task parameters. For `<loop parallel="true">`, create ALL tasks in a single batch. |
| `run-script` | **Bash / Terminal tool** | Execute the command from `<field name="command">` using the terminal tool. Use PowerShell syntax on Windows, Bash on Unix. |
| `read-file` | **Read tool** | Read the file at the path specified in `<field name="path">`. |
| `write-file` | **Write / Edit tool** | Write content to the file at `<field name="path">`. For new files use create_file; for modifications use search_replace. |
| `analyze` | **Direct execution** | Perform the analysis described in the block's `desc` attribute. Read relevant source files, extract information, and store results in the specified output variables. |
| `generate` | **Direct execution** | Generate the content described in the block. Use templates when specified, write output to the target path. |

### Critical Rules

1. **`run-skill` MUST use the Skill tool** — NEVER manually search for or read SKILL.md files. The IDE Skill tool handles path resolution across different IDE directories (.qoder/, .cursor/, .claude/).
2. **`dispatch-to-worker` MUST use the Task tool** — NEVER execute worker tasks yourself. Create a Task and let the worker agent handle it.
3. **`<loop parallel="true">` with `dispatch-to-worker`** — Create ALL worker tasks in ONE batch call, not sequentially. This enables true parallel execution.
4. **Variable binding** — After a tool call completes, bind the result to the variable specified in `<field name="output" var="..."/>` for use in subsequent blocks.

### Invocation Examples

**Example 1: `action="run-script"` — Team Leader runs terminal command directly**

Given this XML block:
```xml
<block type="task" id="S0-B4" action="run-script" desc="Generate platforms.json">
  <field name="command">node scripts/generate-platforms.js</field>
  <field name="output" var="platforms_file"/>
</block>
```

Team Leader executes:
```
→ Call run_in_terminal(command="node scripts/generate-platforms.js")
→ Store result in variable ${platforms_file}
```

**Example 2: `action="run-skill"` — Team Leader loads a Skill (dispatch playbook)**

Given this XML block:
```xml
<block type="task" id="B3" action="run-skill" desc="Load dispatch playbook">
  <field name="skill">speccrew-knowledge-bizs-dispatch-xml</field>
</block>
```

Team Leader executes:
```
→ Call Skill(name="speccrew-knowledge-bizs-dispatch-xml")
→ Read and execute the loaded workflow block-by-block
```

**Example 3: `action="dispatch-to-worker"` — Team Leader creates Task for Worker Agent**

Given this XML block:
```xml
<block type="task" id="S1-B1" action="dispatch-to-worker" desc="Identify entry directories for backend">
  <field name="agent">speccrew-task-worker</field>
  <field name="skill">speccrew-knowledge-bizs-identify-entries-xml</field>
  <field name="context_platform_id">${platform.platformId}</field>
  <field name="context_source_path">${platform.sourcePath}</field>
  <field name="output" var="entry_result"/>
</block>
```

Team Leader executes:
```
→ Call Task tool to create a new task:
    - Assign to: speccrew-task-worker
    - Worker must call: Skill(name="speccrew-knowledge-bizs-identify-entries-xml")
    - Pass context: platform_id=backend-system, source_path=d:/dev/project/backend
→ Wait for Worker Agent to complete the task
→ Store Worker's result in variable ${entry_result}
```

**CRITICAL**: When block says `action="dispatch-to-worker"`, Team Leader MUST NOT load the skill itself or execute it directly. Team Leader creates a Task, Worker Agent loads and executes the skill.

**Example 4: `<loop parallel="true">` with `dispatch-to-worker` — Batch dispatch**

Given this XML block:
```xml
<block type="loop" id="S1-L1" over="${platforms}" var="platform" parallel="true">
  <block type="task" id="S1-B1" action="dispatch-to-worker" desc="Identify entries">
    <field name="agent">speccrew-task-worker</field>
    <field name="skill">speccrew-knowledge-bizs-identify-entries-xml</field>
    <field name="context_platform_id">${platform.platformId}</field>
  </block>
</block>
```

Team Leader executes:
```
→ For each platform in ${platforms}, create a Task in ONE batch:
    - Task 1: Worker runs identify-entries-xml for backend-system
    - Task 2: Worker runs identify-entries-xml for frontend-web
    - Task 3: Worker runs identify-entries-xml for mobile-app
→ All 3 tasks run in parallel on Worker Agents
→ Wait for all tasks to complete before proceeding
```

## Execution Rules

1. **NEVER skip a block** — execute every block in document order
2. **Literal execution** — each `<block type="task">` is a direct tool-call instruction, NOT a goal description. Pass `<field name="command">` values to the terminal **exactly as written**. Pass `<field name="skill">` values to the Skill tool **exactly as written**. Do NOT rephrase, combine, or improvise alternative commands.
3. **Read `rule` blocks as constraints** — check them continuously during execution
4. **`checkpoint` blocks** = persist progress before continuing
5. **`gateway mode="exclusive"`** = only execute the first matching branch
6. **`loop parallel="true"`** = dispatch all iterations concurrently
7. **`rule level="forbidden"`** = immediate stop if violated
8. **Input/Output blocks** define the contract — respect required parameters

### Strict Block Adherence

When executing an AgentFlow XML workflow, the Agent MUST strictly follow the block sequence defined in the workflow:

1. **Only perform actions defined by blocks** — Every action the Agent takes must correspond to a specific block in the workflow. The Agent MUST NOT perform any actions not defined by the blocks.
2. **Prohibited extra actions** include but are not limited to:
   - Generating files not specified in block output paths (e.g. summary reports, analysis documents, logs)
   - Running scripts or commands not defined in any block
   - Creating intermediate/temporary files outside of block definitions
   - Adding "bonus" analysis steps or documentation beyond what blocks require
3. **Output scope** — The workflow's output is strictly limited to what is defined in `output` blocks or block-level output fields (`<field name="output">`). Any file or artifact not traceable to a block definition is considered an error.
4. **When in doubt, don't do it** — If an action is not explicitly defined in any block, the Agent must skip it, even if it seems "helpful".

### Block Execution Announcement Protocol

Before executing each `<block>`, the agent MUST announce the block being executed. The announcement format is:

```
🏷️ Block [{block-id}] (type={block-type}, action={action}) — {block-desc}
```

**Rules:**
1. The announcement MUST be made BEFORE the block execution begins, not after.
2. ALL block types require announcement: `task`, `loop`, `checkpoint`, `rule`, `gateway`, `input`, `output`.
3. For `<block type="loop">` blocks, announce the loop entry with iteration context (e.g., "Loop [S2-L2] — Iterating over ${batch}, 5 items, parallel=true").
4. For `<block type="checkpoint">` blocks, announce the checkpoint and its validation result.
5. For `<block type="rule">` blocks, announce the rule being applied.
6. This protocol applies to ALL agents executing AgentFlow XML workflows — both orchestrating agents (Team Leader) and worker agents.
7. Nested blocks inside loops should also be announced for each iteration.
